package com.monarca.service;

import com.monarca.dto.CartLineDTO;
import com.monarca.dto.DeliveryGroupDTO;
import com.monarca.dto.PlaceOrderRequest;
import com.monarca.dto.QuoteResponse;
import com.monarca.entity.Order;
import com.monarca.entity.OrderItem;
import com.monarca.entity.Product;
import com.monarca.entity.ReturnRequest;
import com.monarca.repository.OrderItemRepository;
import com.monarca.repository.OrderRepository;
import com.monarca.repository.ProductRepository;
import com.monarca.repository.ReturnRequestRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final FulfillmentService fulfillmentService;

    public OrderService(OrderRepository orderRepository,
                        OrderItemRepository orderItemRepository,
                        ProductRepository productRepository,
                        ReturnRequestRepository returnRequestRepository,
                        FulfillmentService fulfillmentService) {
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.productRepository = productRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.fulfillmentService = fulfillmentService;
    }

    @Transactional
    public Order placeOrder(PlaceOrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty");
        }

        if (!"stripe".equalsIgnoreCase(req.getPaymentMethod())) {
            throw new IllegalArgumentException("Online card payment through Stripe is required.");
        }
        QuoteResponse quote = fulfillmentService.calculateQuote(req.getItems(), req.getCouponCode());

        Order order = new Order();
        String orderId = "M-ORD-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        order.setId(orderId);
        order.setPaymentMethod("stripe");
        order.setSubtotal(quote.getSubtotal());
        order.setDiscount(quote.getDiscount());
        order.setShippingFee(quote.getShippingFee());
        order.setTotal(quote.getTotal());
        order.setCurrency(quote.getCurrency());
        order.setChargeCurrency(normalizeChargeCurrency(req.getChargeCurrency()));
        order.setCouponCode(quote.getAppliedCoupon());

        // Delivery address details
        order.setCustomerName(req.getCustomerName());
        order.setCustomerPhone(req.getCustomerPhone());
        order.setCity(req.getCity());
        order.setLocality(req.getLocality() != null ? req.getLocality() : req.getCity());
        order.setArea(req.getArea());
        order.setStreet(req.getStreet());
        order.setLandmark(req.getLandmark());
        order.setBuilding(req.getBuilding());
        order.setApartment(req.getApartment());
        order.setDeliveryNote(req.getDeliveryNote());

        // Delivery summary
        String summary = quote.getDeliveryGroups().stream()
                .map(g -> g.getLabel() + " · " + g.getEstimate())
                .collect(Collectors.joining(" / "));
        order.setDeliverySummary(summary);
        order.setHasChinaItem(quote.getDeliveryGroups().stream().anyMatch(g -> "china".equals(g.getSource())));

        order.setStatus("payment_pending");
        order.setPaymentStatus("pending");
        order.setPaidTotal(BigDecimal.ZERO);

        // Save order items and decrement stock
        for (CartLineDTO line : req.getItems()) {
            Product p = productRepository.findById(line.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("Product not found: " + line.getProductId()));
            OrderItem item = new OrderItem();
            item.setProductId(p.getId());
            item.setProductName(p.getName());
            item.setColor(line.getColor());
            item.setSize(line.getSize());
            item.setQty(line.getQty());
            item.setUnitPrice(p.getPrice());
            item.setImgIndex(p.getImgIndex());
            item.setFulfillment(p.getFulfillment());
            item.setFulfillmentSource(p.getFulfillmentSource());

            boolean isChina = "china".equalsIgnoreCase(p.getFulfillmentSource());
            item.setMinDeliveryDays(isChina ? 15 : 3);
            item.setMaxDeliveryDays(isChina ? 20 : 4);

            order.addItem(item);

            if (p.getStock() != null) {
                int quantity = line.getQty() == null || line.getQty() < 1 ? 1 : line.getQty();
                if (p.getStock() < quantity) {
                    throw new IllegalStateException("Insufficient stock for product " + p.getId());
                }
                p.setStock(p.getStock() - quantity);
                productRepository.save(p);
            }
        }
        order.setInventoryReserved(true);

        return orderRepository.save(order);
    }

    @Transactional
    public Order reserveStripeInventory(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!"stripe".equalsIgnoreCase(order.getPaymentMethod())
                || !"payment_pending".equalsIgnoreCase(order.getStatus())
                || "paid".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Order is not awaiting Stripe payment");
        }
        if (Boolean.TRUE.equals(order.getInventoryReserved())) {
            return order;
        }
        for (OrderItem item : order.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalStateException("Product is no longer available"));
            int quantity = item.getQty() == null || item.getQty() < 1 ? 1 : item.getQty();
            if (product.getStock() != null && product.getStock() < quantity) {
                throw new IllegalStateException("Insufficient stock for product " + product.getId());
            }
            if (product.getStock() != null) {
                product.setStock(product.getStock() - quantity);
                productRepository.save(product);
            }
        }
        order.setInventoryReserved(true);
        order.setPaymentStatus("pending");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order recordStripeSession(String orderId, String sessionId, String chargeCurrency,
                                     BigDecimal chargeAmount, BigDecimal exchangeRate) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!"stripe".equalsIgnoreCase(order.getPaymentMethod())
                || !"payment_pending".equalsIgnoreCase(order.getStatus())) {
            throw new IllegalStateException("Order is not awaiting Stripe payment");
        }
        order.setTransactionId(sessionId);
        order.setChargeCurrency(chargeCurrency);
        order.setChargeAmount(chargeAmount);
        order.setExchangeRate(exchangeRate);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    private String normalizeChargeCurrency(String requestedCurrency) {
        if (requestedCurrency == null || requestedCurrency.isBlank()) return "USD";
        String currency = requestedCurrency.trim().toUpperCase(Locale.ROOT);
        if (!"USD".equals(currency) && !"AED".equals(currency)) {
            throw new IllegalArgumentException("Unsupported payment currency");
        }
        return currency;
    }

    @Transactional
    public int nextStripeCheckoutAttempt(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        int attempt = order.getStripeCheckoutAttempt() == null ? 1 : order.getStripeCheckoutAttempt() + 1;
        order.setStripeCheckoutAttempt(attempt);
        order.setUpdatedAt(LocalDateTime.now());
        orderRepository.save(order);
        return attempt;
    }

    @Transactional
    public Order markStripePaid(String orderId, String transactionId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!"stripe".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new IllegalStateException("Order does not use Stripe");
        }
        if ("paid".equalsIgnoreCase(order.getPaymentStatus())) {
            return order;
        }
        if (!Boolean.TRUE.equals(order.getInventoryReserved())) {
            throw new IllegalStateException("Order inventory reservation is missing");
        }
        order.setStatus("placed");
        order.setPaymentStatus("paid");
        order.setPaidTotal(order.getTotal());
        order.setTransactionId(transactionId);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order markStripeExpired(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));
        if (!"stripe".equalsIgnoreCase(order.getPaymentMethod())
                || "paid".equalsIgnoreCase(order.getPaymentStatus())
                || !"payment_pending".equalsIgnoreCase(order.getStatus())) {
            return order;
        }
        if (Boolean.TRUE.equals(order.getInventoryReserved())) {
            for (OrderItem item : order.getItems()) {
                productRepository.findById(item.getProductId()).ifPresent(product -> {
                    if (product.getStock() != null) {
                        int quantity = item.getQty() == null || item.getQty() < 1 ? 1 : item.getQty();
                        product.setStock(product.getStock() + quantity);
                        productRepository.save(product);
                    }
                });
            }
            order.setInventoryReserved(false);
        }
        order.setPaymentStatus("failed");
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(String orderId, String reason) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if ("cancelled".equalsIgnoreCase(order.getStatus())) {
            return order;
        }

        order.setStatus("cancelled");
        order.setCancelReason(reason);
        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    @Transactional
    public ReturnRequest submitReturn(String orderId, Long productId, String color, String size, int qty, String reason, String note) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        ReturnRequest req = new ReturnRequest();
        req.setId("RT-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        req.setOrderId(orderId);
        req.setProductId(productId);

        Product p = productRepository.findById(productId).orElse(null);
        req.setProductName(p != null ? p.getName() : "Item " + productId);
        req.setColor(color);
        req.setSize(size);
        req.setQty(qty);
        req.setReason(reason);
        req.setNote(note);
        req.setStatus("requested");

        // If original order is unpaid COD, no cash refund
        if ("cod".equalsIgnoreCase(order.getPaymentMethod()) && "cod_due".equalsIgnoreCase(order.getPaymentStatus())) {
            req.setNoRefund(true);
            req.setRefundAmount(BigDecimal.ZERO);
        } else {
            req.setNoRefund(false);
            if (p != null) {
                req.setRefundAmount(p.getPrice().multiply(BigDecimal.valueOf(qty)));
            }
        }

        return returnRequestRepository.save(req);
    }

    @Transactional
    public Order advanceStatus(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        switch (order.getStatus()) {
            case "payment_pending" -> {
                order.setStatus("placed");
                order.setPaymentStatus("paid");
                order.setPaidTotal(order.getTotal());
            }
            case "placed" -> order.setStatus("preparing");
            case "preparing" -> order.setStatus("shipped");
            case "shipped" -> {
                order.setStatus("delivered");
                // If COD order is delivered, mark payment received
                if ("cod".equalsIgnoreCase(order.getPaymentMethod())) {
                    order.setPaymentStatus("paid");
                    order.setPaidTotal(order.getTotal());
                }
            }
        }

        order.setUpdatedAt(LocalDateTime.now());
        return orderRepository.save(order);
    }

    public Order getOrder(String orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    Order getOrderForStripeUpdate(String orderId) {
        return orderRepository.findOneById(orderId).orElse(null);
    }

    public List<Order> listOrders(String phone) {
        if (phone != null && !phone.trim().isEmpty()) {
            return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone.trim());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}
