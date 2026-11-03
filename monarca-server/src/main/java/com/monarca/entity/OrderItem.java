package com.monarca.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    @JsonIgnore
    private Order order;

    private Long productId;

    @Column(length = 100)
    private String productName;

    @Column(length = 50)
    private String color;

    @Column(length = 50)
    private String size;

    private Integer qty;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    private Integer imgIndex;

    @Column(length = 50)
    private String fulfillment;

    @Column(length = 20)
    private String fulfillmentSource; // iraq or china

    private Integer minDeliveryDays;
    private Integer maxDeliveryDays;

    public OrderItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Order getOrder() { return order; }
    public void setOrder(Order order) { this.order = order; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public String getProductName() { return productName; }
    public void setProductName(String productName) { this.productName = productName; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getSize() { return size; }
    public void setSize(String size) { this.size = size; }

    public Integer getQty() { return qty; }
    public void setQty(Integer qty) { this.qty = qty; }

    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }

    public Integer getImgIndex() { return imgIndex; }
    public void setImgIndex(Integer imgIndex) { this.imgIndex = imgIndex; }

    public String getFulfillment() { return fulfillment; }
    public void setFulfillment(String fulfillment) { this.fulfillment = fulfillment; }

    public String getFulfillmentSource() { return fulfillmentSource; }
    public void setFulfillmentSource(String fulfillmentSource) { this.fulfillmentSource = fulfillmentSource; }

    public Integer getMinDeliveryDays() { return minDeliveryDays; }
    public void setMinDeliveryDays(Integer minDeliveryDays) { this.minDeliveryDays = minDeliveryDays; }

    public Integer getMaxDeliveryDays() { return maxDeliveryDays; }
    public void setMaxDeliveryDays(Integer maxDeliveryDays) { this.maxDeliveryDays = maxDeliveryDays; }
}
