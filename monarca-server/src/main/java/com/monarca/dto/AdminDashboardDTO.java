package com.monarca.dto;

import java.math.BigDecimal;

public class AdminDashboardDTO {
    private long totalOrders;
    private BigDecimal totalGmv;
    private long pendingFulfillment;
    private long deliveredOrders;
    private long cancelledOrders;
    private long returnRequestsCount;
    private long productsCount;
    private long iraqStockCount;
    private long chinaPreorderCount;

    public AdminDashboardDTO() {}

    public long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(long totalOrders) { this.totalOrders = totalOrders; }

    public BigDecimal getTotalGmv() { return totalGmv; }
    public void setTotalGmv(BigDecimal totalGmv) { this.totalGmv = totalGmv; }

    public long getPendingFulfillment() { return pendingFulfillment; }
    public void setPendingFulfillment(long pendingFulfillment) { this.pendingFulfillment = pendingFulfillment; }

    public long getDeliveredOrders() { return deliveredOrders; }
    public void setDeliveredOrders(long deliveredOrders) { this.deliveredOrders = deliveredOrders; }

    public long getCancelledOrders() { return cancelledOrders; }
    public void setCancelledOrders(long cancelledOrders) { this.cancelledOrders = cancelledOrders; }

    public long getReturnRequestsCount() { return returnRequestsCount; }
    public void setReturnRequestsCount(long returnRequestsCount) { this.returnRequestsCount = returnRequestsCount; }

    public long getProductsCount() { return productsCount; }
    public void setProductsCount(long productsCount) { this.productsCount = productsCount; }

    public long getIraqStockCount() { return iraqStockCount; }
    public void setIraqStockCount(long iraqStockCount) { this.iraqStockCount = iraqStockCount; }

    public long getChinaPreorderCount() { return chinaPreorderCount; }
    public void setChinaPreorderCount(long chinaPreorderCount) { this.chinaPreorderCount = chinaPreorderCount; }
}
