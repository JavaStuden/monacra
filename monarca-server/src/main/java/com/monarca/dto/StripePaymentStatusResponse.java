package com.monarca.dto;

import java.math.BigDecimal;

public record StripePaymentStatusResponse(
        String orderId,
        String orderStatus,
        String paymentStatus,
        BigDecimal paidTotal,
        String transactionId,
        String chargeCurrency,
        BigDecimal chargeAmount,
        BigDecimal exchangeRate
) {}
