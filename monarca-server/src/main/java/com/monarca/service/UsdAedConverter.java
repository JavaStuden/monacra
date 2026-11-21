package com.monarca.service;

import java.math.BigDecimal;
import java.math.RoundingMode;

public final class UsdAedConverter {
    public static final BigDecimal USD_TO_AED_RATE = new BigDecimal("3.67");

    private UsdAedConverter() {}

    public static BigDecimal toAed(BigDecimal usdAmount) {
        if (usdAmount == null || usdAmount.signum() < 0) {
            throw new IllegalArgumentException("USD amount must be zero or greater");
        }
        return usdAmount.setScale(2, RoundingMode.HALF_UP)
                .multiply(USD_TO_AED_RATE)
                .setScale(2, RoundingMode.HALF_UP);
    }
}
