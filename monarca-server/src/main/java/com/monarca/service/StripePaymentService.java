package com.monarca.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.dto.PlaceOrderRequest;
import com.monarca.dto.StripeCheckoutSessionResponse;
import com.monarca.dto.StripePaymentStatusResponse;
import com.monarca.entity.Order;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.model.checkout.Session;
import com.stripe.net.RequestOptions;
import com.stripe.net.Webhook;
import com.stripe.param.checkout.SessionCreateParams;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodOptions;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodOptions.Card;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodOptions.Card.Restrictions;
import com.stripe.param.checkout.SessionCreateParams.PaymentMethodOptions.Card.Restrictions.BrandsBlocked;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Locale;

@Service
public class StripePaymentService {
    private static final Logger log = LoggerFactory.getLogger(StripePaymentService.class);
    private static final List<BrandsBlocked> LOCAL_BLOCKED_BRANDS = List.of(
            BrandsBlocked.AMERICAN_EXPRESS, BrandsBlocked.DISCOVER_GLOBAL_NETWORK);

    private final OrderService orderService;
    private final ObjectMapper objectMapper;

    @Value("${stripe.secret-key:}")
    private String secretKey;

    @Value("${stripe.webhook-secret:}")
    private String webhookSecret;

    @Value("${monarca.public-base-url:https://itsmonarca.com}")
    private String publicBaseUrl;

    public StripePaymentService(OrderService orderService, ObjectMapper objectMapper) {
        this.orderService = orderService;
        this.objectMapper = objectMapper;
    }

    @Transactional(rollbackFor = Exception.class)
    public StripeCheckoutSessionResponse createCheckoutSession(PlaceOrderRequest request) throws StripeException {
        requireStripeConfigured();
        request.setPaymentMethod("stripe");
        Order order = orderService.placeOrder(request);
        return createCheckoutSession(order.getId(), order, request.getChargeCurrency());
    }

    @Transactional(rollbackFor = Exception.class)
    public StripeCheckoutSessionResponse createCheckoutSession(String orderId) throws StripeException {
        return createCheckoutSession(orderId, null);
    }

    @Transactional(rollbackFor = Exception.class)
    public StripeCheckoutSessionResponse createCheckoutSession(String orderId, String requestedChargeCurrency)
            throws StripeException {
        requireStripeConfigured();
        Order order = orderService.getOrderForStripeUpdate(orderId);
        if (order == null) {
            throw new IllegalArgumentException("Order not found");
        }
        return createCheckoutSession(orderId, order, requestedChargeCurrency);
    }

    private StripeCheckoutSessionResponse createCheckoutSession(String orderId, Order order,
                                                                 String requestedChargeCurrency) throws StripeException {
        if (!"stripe".equalsIgnoreCase(order.getPaymentMethod())
                || !"payment_pending".equalsIgnoreCase(order.getStatus())
                || "paid".equalsIgnoreCase(order.getPaymentStatus())) {
            throw new IllegalStateException("Order is not awaiting card payment");
        }

        order = orderService.reserveStripeInventory(orderId);
        String chargeCurrency = resolveChargeCurrency(requestedChargeCurrency, order.getChargeCurrency());
        BigDecimal chargeAmount = "AED".equals(chargeCurrency)
                ? UsdAedConverter.toAed(order.getTotal())
                : order.getTotal().setScale(2, RoundingMode.HALF_UP);
        long chargeMinor = chargeAmount.movePointRight(2).longValueExact();
        BigDecimal exchangeRate = "AED".equals(chargeCurrency) ? UsdAedConverter.USD_TO_AED_RATE : null;
        boolean hasLocalItems = order.getItems().stream()
                .anyMatch(item -> !"china".equalsIgnoreCase(item.getFulfillmentSource()));
        RequestOptions apiOptions = RequestOptions.builder()
                .setApiKey(secretKey)
                .build();
        if (order.getTransactionId() != null && order.getTransactionId().startsWith("cs_")) {
            Session existing = Session.retrieve(order.getTransactionId(), apiOptions);
            if ("open".equals(existing.getStatus())) {
                boolean sameCharge = chargeCurrency.equalsIgnoreCase(existing.getCurrency())
                        && existing.getAmountTotal() != null
                        && existing.getAmountTotal().longValue() == chargeMinor;
                boolean fixedCurrency = existing.getAdaptivePricing() != null
                        && Boolean.FALSE.equals(existing.getAdaptivePricing().getEnabled());
                if (!sameCharge || !fixedCurrency || existing.getUrl() == null
                        || (hasLocalItems && !matchesLocalCardPolicy(existing))) {
                    existing.expire(apiOptions);
                } else {
                    orderService.recordStripeSession(orderId, existing.getId(), chargeCurrency, chargeAmount, exchangeRate);
                    return new StripeCheckoutSessionResponse(orderId, existing.getUrl(), chargeCurrency, chargeAmount,
                            exchangeRate);
                }
            }
            if ("complete".equals(existing.getStatus())) {
                throw new IllegalStateException("Payment is being confirmed. Please wait a moment.");
            }
        }

        String safeOrderId = URLEncoder.encode(orderId, StandardCharsets.UTF_8);
        String baseUrl = publicBaseUrl.replaceAll("/+$", "");
        SessionCreateParams.Builder params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setAdaptivePricing(SessionCreateParams.AdaptivePricing.builder().setEnabled(false).build())
                .addAllowedPaymentMethodType(SessionCreateParams.AllowedPaymentMethodType.CARD)
                .setClientReferenceId(orderId)
                .putMetadata("orderId", orderId)
                .setSuccessUrl(baseUrl + "/?stripe=success&order_id=" + safeOrderId + "#stripe-return/" + safeOrderId)
                .setCancelUrl(baseUrl + "/?stripe=cancelled&order_id=" + safeOrderId + "#stripe-cancelled/" + safeOrderId)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setQuantity(1L)
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency(chargeCurrency.toLowerCase(Locale.ROOT))
                                .setUnitAmount(chargeMinor)
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("Monarca order " + orderId)
                                        .setDescription("Secure card payment")
                                        .build())
                                .build())
                        .build());
        if (hasLocalItems) {
            params.setPaymentMethodOptions(PaymentMethodOptions.builder()
                    .setCard(Card.builder()
                            .setRestrictions(Restrictions.builder()
                                    .addAllBrandsBlocked(LOCAL_BLOCKED_BRANDS)
                                    .build())
                            .build())
                    .build());
        }

        int attempt = orderService.nextStripeCheckoutAttempt(orderId);
        RequestOptions options = RequestOptions.builder()
                .setApiKey(secretKey)
                .setIdempotencyKey("monarca-checkout-" + orderId + "-" + attempt)
                .build();
        Session session = Session.create(params.build(), options);
        orderService.recordStripeSession(orderId, session.getId(), chargeCurrency, chargeAmount, exchangeRate);
        return new StripeCheckoutSessionResponse(orderId, session.getUrl(), chargeCurrency, chargeAmount,
                exchangeRate);
    }

    private String resolveChargeCurrency(String requested, String stored) {
        String currency = requested == null || requested.isBlank() ? stored : requested;
        if (currency == null || currency.isBlank()) return "USD";
        currency = currency.trim().toUpperCase(Locale.ROOT);
        if (!"USD".equals(currency) && !"AED".equals(currency)) {
            throw new IllegalArgumentException("Unsupported payment currency");
        }
        return currency;
    }

    private boolean matchesLocalCardPolicy(Session session) {
        var options = session.getPaymentMethodOptions();
        var card = options == null ? null : options.getCard();
        var restrictions = card == null ? null : card.getRestrictions();
        var blocked = restrictions == null ? null : restrictions.getBrandsBlocked();
        return blocked != null && blocked.size() == LOCAL_BLOCKED_BRANDS.size()
                && LOCAL_BLOCKED_BRANDS.stream().map(BrandsBlocked::getValue).allMatch(blocked::contains);
    }

    public StripePaymentStatusResponse getPaymentStatus(String orderId) {
        Order order = orderService.getOrder(orderId);
        if (order == null || !"stripe".equalsIgnoreCase(order.getPaymentMethod())) {
            throw new IllegalArgumentException("Order not found");
        }
        String transactionId = "paid".equalsIgnoreCase(order.getPaymentStatus()) ? order.getTransactionId() : null;
        return new StripePaymentStatusResponse(
                order.getId(), order.getStatus(), order.getPaymentStatus(), order.getPaidTotal(), transactionId,
                order.getChargeCurrency(), order.getChargeAmount(), order.getExchangeRate());
    }

    @Transactional
    public void processWebhook(String payload, String signature) throws Exception {
        if (webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("Stripe webhook is not configured");
        }
        Event event = Webhook.constructEvent(payload, signature, webhookSecret);
        JsonNode object = objectMapper.readTree(payload).path("data").path("object");
        String orderId = object.path("metadata").path("orderId").asText("");
        if (orderId.isBlank()) {
            orderId = object.path("client_reference_id").asText("");
        }
        if (orderId.isBlank()) {
            return;
        }

        String eventType = event.getType();
        String paymentIntent = object.path("payment_intent").asText("");
        String sessionId = object.path("id").asText("");
        // Serialize updates with checkout retries so an expired link cannot release a replacement's stock.
        Order order = orderService.getOrderForStripeUpdate(orderId);
        if (order == null || !"stripe".equalsIgnoreCase(order.getPaymentMethod())
                || "paid".equalsIgnoreCase(order.getPaymentStatus())
                || sessionId.isBlank() || !sessionId.equals(order.getTransactionId())) {
            return;
        }
        if (order.getChargeCurrency() != null && order.getChargeAmount() != null) {
            long expectedAmount = order.getChargeAmount().movePointRight(2)
                    .setScale(0, RoundingMode.HALF_UP).longValueExact();
            long eventAmount = object.path("amount_total").asLong(-1);
            String eventCurrency = object.path("currency").asText("");
            if (eventAmount != expectedAmount || !order.getChargeCurrency().equalsIgnoreCase(eventCurrency)) {
                log.warn("Ignoring Stripe event with amount/currency mismatch for order {}", orderId);
                return;
            }
        }
        if (("checkout.session.completed".equals(eventType)
                || "checkout.session.async_payment_succeeded".equals(eventType))
                && "paid".equalsIgnoreCase(object.path("payment_status").asText())) {
            orderService.markStripePaid(orderId, paymentIntent.isBlank() ? sessionId : paymentIntent);
        } else if ("checkout.session.expired".equals(eventType)
                || "checkout.session.async_payment_failed".equals(eventType)) {
            orderService.markStripeExpired(orderId);
        }
    }

    private void requireStripeConfigured() {
        if (secretKey == null || secretKey.isBlank() || webhookSecret == null || webhookSecret.isBlank()) {
            throw new IllegalStateException("Stripe payments and webhook verification are not configured on the server");
        }
    }
}
