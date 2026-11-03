package com.monarca.dto;

public class CartLineDTO {
    private Long productId;
    private String color;
    private String size;
    private Integer qty = 1;

    public CartLineDTO() {}

    public CartLineDTO(Long productId, String color, String size, Integer qty) {
        this.productId = productId;
        this.color = color;
        this.size = size;
        this.qty = qty;
    }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }
}
