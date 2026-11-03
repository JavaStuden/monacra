package com.monarca.dto;

import java.math.BigDecimal;
import java.util.List;

public class QuoteResponse {
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal shippingFee;
    private BigDecimal total;
    private String currency = "USD";
    private String appliedCoupon;
    private List<DeliveryGroupDTO> deliveryGroups;
    private Boolean codEligible;
    private String codReason;

    public QuoteResponse() {}

    public BigDecimal getSubtotal() { return subtotal; }
    public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

    public BigDecimal getDiscount() { return discount; }
    public void setDiscount(BigDecimal discount) { this.discount = discount; }

    public BigDecimal getShippingFee() { return shippingFee; }
    public void setShippingFee(BigDecimal shippingFee) { this.shippingFee = shippingFee; }

    public BigDecimal getTotal() { return total; }
    public void setTotal(BigDecimal total) { this.total = total; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getAppliedCoupon() { return appliedCoupon; }
    public void setAppliedCoupon(String appliedCoupon) { this.appliedCoupon = appliedCoupon; }

    public List<DeliveryGroupDTO> getDeliveryGroups() { return deliveryGroups; }
    public void setDeliveryGroups(List<DeliveryGroupDTO> deliveryGroups) { this.deliveryGroups = deliveryGroups; }

    public Boolean getCodEligible() { return codEligible; }
    public void setCodEligible(Boolean codEligible) { this.codEligible = codEligible; }

    public String getCodReason() { return codReason; }
    public void setCodReason(String codReason) { this.codReason = codReason; }
}
