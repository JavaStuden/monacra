package com.monarca.dto;

import java.math.BigDecimal;

public record StripeCheckoutSessionResponse(
        String orderId,
        String url,
        String chargeCurrency,
        BigDecimal chargeAmount,
        BigDecimal exchangeRate
) {}
