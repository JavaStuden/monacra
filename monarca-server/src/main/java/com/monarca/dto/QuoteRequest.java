package com.monarca.dto;

import java.util.List;

public class QuoteRequest {
    private List<CartLineDTO> items;
    private String couponCode;

    public QuoteRequest() {}

    public List<CartLineDTO> getItems() { return items; }
    public void setItems(List<CartLineDTO> items) { this.items = items; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }
}
