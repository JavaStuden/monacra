package com.monarca.service;

import com.monarca.dto.CartLineDTO;
import com.monarca.dto.DeliveryGroupDTO;
import com.monarca.dto.QuoteResponse;
import com.monarca.entity.Coupon;
import com.monarca.entity.Product;
import com.monarca.repository.CouponRepository;
import com.monarca.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@Service
public class FulfillmentService {

    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;

    @Value("${monarca.shipping.standard-fee:4.00}")
    private BigDecimal standardShippingFee;

    @Value("${monarca.shipping.free-shipping-threshold:75.00}")
    private BigDecimal freeShippingThreshold;

    public FulfillmentService(ProductRepository productRepository, CouponRepository couponRepository) {
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
    }

    /**
     * Calculate cart checkout quote and fulfillment sourcing delivery groups (v4.7.0 contract)
     */
    public QuoteResponse calculateQuote(List<CartLineDTO> items, String couponCode) {
        QuoteResponse response = new QuoteResponse();
        if (items == null || items.isEmpty()) {
            response.setSubtotal(BigDecimal.ZERO);
            response.setDiscount(BigDecimal.ZERO);
            response.setShippingFee(BigDecimal.ZERO);
            response.setTotal(BigDecimal.ZERO);
            response.setDeliveryGroups(Collections.emptyList());
            response.setCodEligible(false);
            response.setCodReason("يلزم اختيار قطعة واحدة على الأقل.");
            return response;
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        int iraqCount = 0;
        int chinaCount = 0;

        for (CartLineDTO line : items) {
            Product p = productRepository.findById(line.getProductId()).orElse(null);
            if (p != null) {
                int qty = line.getQty() != null && line.getQty() > 0 ? line.getQty() : 1;
                BigDecimal linePrice = p.getPrice().multiply(BigDecimal.valueOf(qty));
                subtotal = subtotal.add(linePrice);

                if ("china".equalsIgnoreCase(p.getFulfillmentSource())) {
                    chinaCount += qty;
                } else {
                    iraqCount += qty;
                }
            }
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);
        response.setSubtotal(subtotal);

        // Coupon discount calculation (M10: 10% off for subtotal >= 40 USD)
        BigDecimal discount = BigDecimal.ZERO;
        String appliedCoupon = null;
        if (couponCode != null && !couponCode.trim().isEmpty()) {
            String code = couponCode.trim().toUpperCase();
            Optional<Coupon> opt = couponRepository.findByCodeAndActiveTrue(code);
            if (opt.isPresent()) {
                Coupon c = opt.get();
                if (subtotal.compareTo(c.getMinSpend()) >= 0) {
                    discount = subtotal.multiply(BigDecimal.valueOf(c.getDiscountPercent()))
                            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                    appliedCoupon = c.getCode();
                }
            }
        }
        response.setDiscount(discount);
        response.setAppliedCoupon(appliedCoupon);

        // Shipping fee rules: Free shipping for subtotal >= $75, otherwise $4.00
        BigDecimal shippingFee = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && subtotal.compareTo(freeShippingThreshold) < 0) {
            shippingFee = standardShippingFee;
        }
        response.setShippingFee(shippingFee);

        // Total = Subtotal - Discount + Shipping Fee
        BigDecimal total = subtotal.subtract(discount).add(shippingFee).setScale(2, RoundingMode.HALF_UP);
        response.setTotal(total);

        // Sourcing fulfillment groups
        List<DeliveryGroupDTO> groups = new ArrayList<>();
        if (iraqCount > 0) {
            groups.add(new DeliveryGroupDTO(
                    "iraq",
                    "متوفر في العراق",
                    "حوالي يومين",
                    2,
                    2,
                    iraqCount,
                    true
            ));
        }
        if (chinaCount > 0) {
            groups.add(new DeliveryGroupDTO(
                    "china",
                    "طلب من الصين",
                    "١٥–٢٠ يوماً",
                    15,
                    20,
                    chinaCount,
                    false
            ));
        }
        response.setDeliveryGroups(groups);

        // COD Eligibility: If order contains any China pre-order items, COD is strictly prohibited!
        if (chinaCount > 0) {
            response.setCodEligible(false);
            response.setCodReason("طلبات الصين تتطلب الدفع المسبق ببطاقة Visa أو Mastercard. الدفع عند الاستلام متاح لقطع العراق الجاهزة فقط.");
        } else {
            response.setCodEligible(true);
            response.setCodReason("الدفع عند الاستلام متاح لقطع العراق الجاهزة في هذا الطلب.");
        }

        return response;
    }
}
