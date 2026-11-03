package com.monarca.dto;

import java.util.List;

public class PlaceOrderRequest {
    private List<CartLineDTO> items;
    private String customerName;
    private String customerPhone;
    private String city;
    private String locality;
    private String area;
    private String street;
    private String landmark;
    private String building;
    private String apartment;
    private String deliveryNote;
    private String paymentMethod; // visa, mastercard, cod
    private String couponCode;
    private Boolean simulateDecline = false;

    public PlaceOrderRequest() {}

    public List<CartLineDTO> getItems() { return items; }
    public void setItems(List<CartLineDTO> items) { this.items = items; }

    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }

    public String getCustomerPhone() { return customerPhone; }
    public void setCustomerPhone(String customerPhone) { this.customerPhone = customerPhone; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getLocality() { return locality; }
    public void setLocality(String locality) { this.locality = locality; }

    public String getArea() { return area; }
    public void setArea(String area) { this.area = area; }

    public String getStreet() { return street; }
    public void setStreet(String street) { this.street = street; }

    public String getLandmark() { return landmark; }
    public void setLandmark(String landmark) { this.landmark = landmark; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getApartment() { return apartment; }
    public void setApartment(String apartment) { this.apartment = apartment; }

    public String getDeliveryNote() { return deliveryNote; }
    public void setDeliveryNote(String deliveryNote) { this.deliveryNote = deliveryNote; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getCouponCode() { return couponCode; }
    public void setCouponCode(String couponCode) { this.couponCode = couponCode; }

    public Boolean getSimulateDecline() { return simulateDecline; }
    public void setSimulateDecline(Boolean simulateDecline) { this.simulateDecline = simulateDecline; }
}
