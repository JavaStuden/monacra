package com.monarca.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.entity.Order;
import com.monarca.repository.OrderRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;
import com.monarca.service.StripePaymentService;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:webhook-audit;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.h2.console.enabled=false",
        "stripe.secret-key=sk_test_local_fixture_only", "stripe.webhook-secret=whsec_local_fixture_only",
        "stripe.test-webhook-secret=whsec_secondary_test_fixture"
})
@AutoConfigureMockMvc
class StripeWebhookTest {
    private static final String SECRET = "whsec_local_fixture_only";
    private static final String URL = "/api/v1/payments/stripe/webhook";
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired OrderRepository orders;
    @Autowired StripePaymentService payments;

    private Order pending(String suffix) {
        Order order = new Order();
        order.setId("M-WH-FIXTURE-" + suffix);
        order.setPaymentMethod("stripe");
        order.setStatus("payment_pending");
        order.setPaymentStatus("pending");
        order.setSubtotal(new BigDecimal("140.00"));
        order.setDiscount(BigDecimal.ZERO);
        order.setShippingFee(BigDecimal.ZERO);
        order.setTotal(new BigDecimal("140.00"));
        order.setPaidTotal(BigDecimal.ZERO);
        order.setChargeCurrency("AED");
        order.setChargeAmount(new BigDecimal("513.80"));
        order.setExchangeRate(new BigDecimal("3.67"));
        order.setTransactionId("cs_test_fixture_" + suffix);
        order.setInventoryReserved(true);
        return orders.saveAndFlush(order);
    }

    private Map<String, Object> session(Order order) {
        return new LinkedHashMap<>(Map.of(
                "id", order.getTransactionId(), "object", "checkout.session",
                "metadata", Map.of("orderId", order.getId()),
                "client_reference_id", order.getId(), "payment_status", "paid",
                "payment_intent", "pi_fixture_" + order.getId(),
                "amount_total", 51380, "currency", "aed"));
    }

    private String payload(String type, Map<String, Object> object) throws Exception {
        return json.writeValueAsString(Map.of(
                "id", "evt_fixture_" + type.replace('.', '_'), "object", "event",
                "type", type, "livemode", false,
                "data", Map.of("object", object)));
    }

    private String signature(String body, String secret, long timestamp) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        String digest = HexFormat.of().formatHex(mac.doFinal(
                (timestamp + "." + body).getBytes(StandardCharsets.UTF_8)));
        return "t=" + timestamp + ",v1=" + digest;
    }

    private void deliver(String body) throws Exception {
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, SECRET, Instant.now().getEpochSecond())))
                .andExpect(status().isOk()).andExpect(content().string("ok"));
    }

    @Test void completedPaidAedSessionConfirmsUsdOrderAndDuplicateDeliveryIsHarmless() throws Exception {
        Order order = pending("COMPLETE");
        String body = payload("checkout.session.completed", session(order));
        deliver(body);
        Order paid = orders.findById(order.getId()).orElseThrow();
        assertEquals("placed", paid.getStatus());
        assertEquals("paid", paid.getPaymentStatus());
        assertEquals(0, new BigDecimal("140.00").compareTo(paid.getPaidTotal()));
        assertEquals(0, new BigDecimal("513.80").compareTo(paid.getChargeAmount()));
        assertEquals("pi_fixture_" + order.getId(), paid.getTransactionId());
        var updated = paid.getUpdatedAt();
        deliver(body);
        assertEquals(updated, orders.findById(order.getId()).orElseThrow().getUpdatedAt());
    }

    @Test void delayedPaymentNeedsTheAsyncSuccessEvent() throws Exception {
        Order order = pending("ASYNC");
        var object = session(order);
        object.put("payment_status", "unpaid");
        deliver(payload("checkout.session.completed", object));
        assertEquals("pending", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
        object.put("payment_status", "paid");
        deliver(payload("checkout.session.async_payment_succeeded", object));
        assertEquals("paid", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }

    @Test void missingWrongOrStaleSignaturesAreRejectedWithoutConfirmingAnOrder() throws Exception {
        Order order = pending("SIGNATURE");
        String body = payload("checkout.session.completed", session(order));
        mvc.perform(post(URL).contentType("application/json").content(body))
                .andExpect(status().isBadRequest());
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, "whsec_wrong_fixture", Instant.now().getEpochSecond())))
                .andExpect(status().isBadRequest());
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, SECRET, Instant.now().minusSeconds(600).getEpochSecond())))
                .andExpect(status().isBadRequest());
        assertEquals("pending", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }

    @Test void amountCurrencyAndReplacedSessionCannotConfirmTheOrder() throws Exception {
        Order order = pending("MISMATCH");
        for (var invalid : Map.<String, Object>of(
                "amount_total", 14000, "currency", "usd", "id", "cs_test_replaced").entrySet()) {
            var object = session(order);
            object.put(invalid.getKey(), invalid.getValue());
            deliver(payload("checkout.session.completed", object));
            assertEquals("pending", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
        }
    }

    @Test void eventsWithoutAnOrderOrForUnknownOrdersAreAcknowledged() throws Exception {
        long count = orders.count();
        deliver(payload("customer.created", Map.of("id", "cus_fixture", "object", "customer")));
        deliver(payload("checkout.session.completed", Map.of(
                "id", "cs_test_unrelated", "metadata", Map.of("orderId", "M-WH-NOT-FOUND"))));
        assertEquals(count, orders.count());
    }

    @Test void clientReferenceIdIsSupportedWhenMetadataIsAbsent() throws Exception {
        Order order = pending("REFERENCE");
        var object = session(order);
        object.remove("metadata");
        deliver(payload("checkout.session.completed", object));
        assertEquals("paid", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }

    @Test void missingInventoryReservationReturnsFailureAndKeepsOrderPending() throws Exception {
        Order order = pending("NO-RESERVATION");
        order.setInventoryReserved(false);
        orders.saveAndFlush(order);
        String body = payload("checkout.session.completed", session(order));
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, SECRET, Instant.now().getEpochSecond())))
                .andExpect(status().isServiceUnavailable());
        assertEquals("pending", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }

    @Test void separateTestSecretIsAcceptedOnATestBackend() throws Exception {
        Order order = pending("SECONDARY");
        String body = payload("checkout.session.completed", session(order));
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, "whsec_secondary_test_fixture", Instant.now().getEpochSecond())))
                .andExpect(status().isOk());
        assertEquals("paid", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }

    @Test void validTestEventsAreAcknowledgedWithoutChangingLiveOrdersOrStock() throws Exception {
        Order order = pending("LIVE-ISOLATION");
        ReflectionTestUtils.setField(payments, "secretKey", "sk_live_local_fixture_only");
        try {
            for (String type : new String[]{"checkout.session.completed", "checkout.session.expired"}) {
                String body = payload(type, session(order));
                mvc.perform(post(URL).contentType("application/json").content(body)
                        .header("Stripe-Signature", signature(body, "whsec_secondary_test_fixture", Instant.now().getEpochSecond())))
                        .andExpect(status().isOk());
                Order unchanged = orders.findById(order.getId()).orElseThrow();
                assertEquals("pending", unchanged.getPaymentStatus());
                assertTrue(unchanged.getInventoryReserved());
                assertEquals(order.getTransactionId(), unchanged.getTransactionId());
            }
        } finally {
            ReflectionTestUtils.setField(payments, "secretKey", "sk_test_local_fixture_only");
        }
    }

    @Test void liveCompletedSessionStillConfirmsUsingThePrimaryLiveSecret() throws Exception {
        Order order = pending("LIVE-COMPLETE");
        String body = payload("checkout.session.completed", session(order)).replace("\"livemode\":false", "\"livemode\":true");
        ReflectionTestUtils.setField(payments, "secretKey", "sk_live_local_fixture_only");
        try {
            deliver(body);
            assertEquals("paid", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
        } finally {
            ReflectionTestUtils.setField(payments, "secretKey", "sk_test_local_fixture_only");
        }
    }

    @Test void testSigningSecretCannotAuthenticateAnEventClaimingToBeLive() throws Exception {
        Order order = pending("FORGED-MODE");
        String body = payload("checkout.session.completed", session(order)).replace("\"livemode\":false", "\"livemode\":true");
        mvc.perform(post(URL).contentType("application/json").content(body)
                .header("Stripe-Signature", signature(body, "whsec_secondary_test_fixture", Instant.now().getEpochSecond())))
                .andExpect(status().isBadRequest());
        assertEquals("pending", orders.findById(order.getId()).orElseThrow().getPaymentStatus());
    }
}
