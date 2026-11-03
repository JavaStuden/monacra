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

        QuoteResponse quote = fulfillmentService.calculateQuote(req.getItems(), req.getCouponCode());

        // Strict validation: if payment method is COD and order contains China pre-order items, block immediately
        String payment = req.getPaymentMethod() != null ? req.getPaymentMethod().toLowerCase() : "visa";
        if ("cod".equalsIgnoreCase(payment)) {
            if (!Boolean.TRUE.equals(quote.getCodEligible())) {
                throw new IllegalStateException("China pre-order products require prepaid card. COD is not permitted.");
            }
        }

        Order order = new Order();
        // Generate order ID formatted as M-ORD-XXXX
        String orderId = "M-ORD-" + (System.currentTimeMillis() % 10000000);
        order.setId(orderId);
        order.setPaymentMethod(payment);
        order.setSubtotal(quote.getSubtotal());
        order.setDiscount(quote.getDiscount());
        order.setShippingFee(quote.getShippingFee());
        order.setTotal(quote.getTotal());
        order.setCurrency(quote.getCurrency());
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

        // Payment status assignment
        if ("cod".equalsIgnoreCase(payment)) {
            order.setStatus("placed");
            order.setPaymentStatus("cod_due");
            order.setPaidTotal(BigDecimal.ZERO);
        } else if (Boolean.TRUE.equals(req.getSimulateDecline())) {
            order.setStatus("payment_pending");
            order.setPaymentStatus("failed");
            order.setPaidTotal(BigDecimal.ZERO);
        } else {
            // Simulated Visa / Mastercard payment success
            order.setStatus("placed");
            order.setPaymentStatus("paid");
            order.setPaidTotal(quote.getTotal());
            order.setTransactionId("TXN-" + System.currentTimeMillis());
        }

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
            item.setMinDeliveryDays(isChina ? 15 : 2);
            item.setMaxDeliveryDays(isChina ? 20 : 2);

            order.addItem(item);

            // Deduct stock
            if (p.getStock() != null && p.getStock() > 0) {
                p.setStock(Math.max(0, p.getStock() - line.getQty()));
                productRepository.save(p);
            }
        }

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

    public List<Order> listOrders(String phone) {
        if (phone != null && !phone.trim().isEmpty()) {
            return orderRepository.findByCustomerPhoneOrderByCreatedAtDesc(phone.trim());
        }
        return orderRepository.findAllByOrderByCreatedAtDesc();
    }
}
