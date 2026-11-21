package com.monarca.service;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class UsdAedConverterTest {
    @Test
    void convertsUsdAtTheFixedRate() {
        assertEquals(new BigDecimal("367.00"), UsdAedConverter.toAed(new BigDecimal("100.00")));
        assertEquals(new BigDecimal("3.67"), UsdAedConverter.toAed(new BigDecimal("1.00")));
    }

    @Test
    void roundsToAedMinorUnitsUsingHalfUp() {
        assertEquals(new BigDecimal("1.84"), UsdAedConverter.toAed(new BigDecimal("0.50")));
    }

    @Test
    void rejectsNegativeAmounts() {
        assertThrows(IllegalArgumentException.class, () -> UsdAedConverter.toAed(new BigDecimal("-1.00")));
    }
}
