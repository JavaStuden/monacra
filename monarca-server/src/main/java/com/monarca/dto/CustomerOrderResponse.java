package com.monarca.dto;

import com.monarca.entity.Order;
import com.monarca.entity.OrderItem;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record CustomerOrderResponse(
        String id,
        String status,
        String paymentMethod,
        String paymentStatus,
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal shippingFee,
        BigDecimal total,
        BigDecimal paidTotal,
        String currency,
        String chargeCurrency,
        BigDecimal chargeAmount,
        BigDecimal exchangeRate,
        String couponCode,
        String deliverySummary,
        Boolean hasChinaItem,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<Item> items
) {
    public static CustomerOrderResponse from(Order order) {
        List<Item> items = order.getItems() == null
                ? List.of()
                : order.getItems().stream().map(Item::from).toList();
        return new CustomerOrderResponse(
                order.getId(), order.getStatus(), order.getPaymentMethod(), order.getPaymentStatus(),
                order.getSubtotal(), order.getDiscount(), order.getShippingFee(), order.getTotal(),
                order.getPaidTotal(), order.getCurrency(), order.getChargeCurrency(), order.getChargeAmount(),
                order.getExchangeRate(), order.getCouponCode(), order.getDeliverySummary(),
                order.getHasChinaItem(), order.getCreatedAt(), order.getUpdatedAt(), items);
    }

    public record Item(
            Long productId,
            String productName,
            String color,
            String size,
            Integer qty,
            BigDecimal unitPrice,
            Integer imgIndex,
            String fulfillment,
            String fulfillmentSource,
            Integer minDeliveryDays,
            Integer maxDeliveryDays
    ) {
        private static Item from(OrderItem item) {
            return new Item(item.getProductId(), item.getProductName(), item.getColor(), item.getSize(), item.getQty(),
                    item.getUnitPrice(), item.getImgIndex(), item.getFulfillment(), item.getFulfillmentSource(),
                    item.getMinDeliveryDays(), item.getMaxDeliveryDays());
        }
    }
}
