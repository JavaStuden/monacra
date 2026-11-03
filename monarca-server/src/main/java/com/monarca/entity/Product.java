package com.monarca.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 100)
    private String enName;

    @Column(length = 50)
    private String category; // clothes, shoes, bags, accessories

    @Column(length = 50)
    private String subCategory; // shirts, jackets, heels, etc.

    @Column(length = 200)
    private String material;

    @Column(length = 500)
    private String fabric;

    @Column(length = 500)
    private String care;

    @Column(length = 500)
    private String measure;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price; // USD

    @Column(precision = 10, scale = 2)
    private BigDecimal oldPrice; // USD

    private Integer imgIndex;

    @Column(length = 100)
    private String colors; // Comma separated: brown,black

    @Column(length = 100)
    private String sizes; // Comma separated: S,M,L,XL or 37,38,39,40,41

    @Column(length = 20)
    private String unavailableSize; // e.g. "40" or "XL"

    private Integer stock;

    @Column(length = 50)
    private String fulfillment; // in_stock or preorder

    @Column(length = 20, nullable = false)
    private String fulfillmentSource; // iraq or china

    @Column(length = 50)
    private String badge;

    @Column(length = 500)
    private String keywords;

    public Product() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEnName() { return enName; }
    public void setEnName(String enName) { this.enName = enName; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getSubCategory() { return subCategory; }
    public void setSubCategory(String subCategory) { this.subCategory = subCategory; }

    public String getMaterial() { return material; }
    public void setMaterial(String material) { this.material = material; }

    public String getFabric() { return fabric; }
    public void setFabric(String fabric) { this.fabric = fabric; }

    public String getCare() { return care; }
    public void setCare(String care) { this.care = care; }

    public String getMeasure() { return measure; }
    public void setMeasure(String measure) { this.measure = measure; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public BigDecimal getOldPrice() { return oldPrice; }
    public void setOldPrice(BigDecimal oldPrice) { this.oldPrice = oldPrice; }

    public Integer getImgIndex() { return imgIndex; }
    public void setImgIndex(Integer imgIndex) { this.imgIndex = imgIndex; }

    public String getColors() { return colors; }
    public void setColors(String colors) { this.colors = colors; }

    public String getSizes() { return sizes; }
    public void setSizes(String sizes) { this.sizes = sizes; }

    public String getUnavailableSize() { return unavailableSize; }
    public void setUnavailableSize(String unavailableSize) { this.unavailableSize = unavailableSize; }

    public Integer getStock() { return stock; }
    public void setStock(Integer stock) { this.stock = stock; }

    public String getFulfillment() { return fulfillment; }
    public void setFulfillment(String fulfillment) { this.fulfillment = fulfillment; }

    public String getFulfillmentSource() { return fulfillmentSource; }
    public void setFulfillmentSource(String fulfillmentSource) { this.fulfillmentSource = fulfillmentSource; }

    public String getBadge() { return badge; }
    public void setBadge(String badge) { this.badge = badge; }

    public String getKeywords() { return keywords; }
    public void setKeywords(String keywords) { this.keywords = keywords; }
}
