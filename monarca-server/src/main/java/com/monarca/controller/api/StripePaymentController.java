package com.monarca.controller.api;

import com.monarca.common.R;
import com.monarca.dto.StripeCheckoutSessionResponse;
import com.monarca.dto.StripePaymentStatusResponse;
import com.monarca.dto.PlaceOrderRequest;
import com.monarca.service.StripePaymentService;
import com.stripe.exception.StripeException;
import com.stripe.exception.SignatureVerificationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments/stripe")
public class StripePaymentController {
    private final StripePaymentService stripePaymentService;

    public StripePaymentController(StripePaymentService stripePaymentService) {
        this.stripePaymentService = stripePaymentService;
    }

    @PostMapping("/checkout-session")
    public R<StripeCheckoutSessionResponse> createOrderAndCheckoutSession(@RequestBody PlaceOrderRequest request) {
        try {
            return R.ok(stripePaymentService.createCheckoutSession(request));
        } catch (IllegalStateException e) {
            return R.fail(503, e.getMessage());
        } catch (IllegalArgumentException e) {
            return R.fail(400, e.getMessage());
        } catch (StripeException e) {
            return R.fail(502, "Stripe could not create a Checkout Session");
        }
    }

    @PostMapping("/orders/{id}/checkout-session")
    public R<StripeCheckoutSessionResponse> createCheckoutSession(
            @PathVariable String id,
            @RequestParam(required = false) String chargeCurrency) {
        try {
            return R.ok(stripePaymentService.createCheckoutSession(id, chargeCurrency));
        } catch (IllegalStateException e) {
            return R.fail(503, e.getMessage());
        } catch (IllegalArgumentException e) {
            return R.fail(404, e.getMessage());
        } catch (StripeException e) {
            return R.fail(502, "Stripe could not create a Checkout Session");
        }
    }

    @GetMapping("/orders/{id}/status")
    public R<StripePaymentStatusResponse> getPaymentStatus(@PathVariable String id) {
        try {
            return R.ok(stripePaymentService.getPaymentStatus(id));
        } catch (IllegalArgumentException e) {
            return R.fail(404, e.getMessage());
        }
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> webhook(
            @RequestBody String payload,
            @RequestHeader(value = "Stripe-Signature", required = false) String signature) {
        if (signature == null || signature.isBlank()) {
            return ResponseEntity.badRequest().body("Missing Stripe signature");
        }
        try {
            stripePaymentService.processWebhook(payload, signature);
            return ResponseEntity.ok("ok");
        } catch (SignatureVerificationException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid Stripe webhook");
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body("Stripe webhook is not configured");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Webhook processing failed");
        }
    }
}
