package com.monarca.dto;

public class DeliveryGroupDTO {
    private String source; // iraq or china
    private String label; // "متوفر في العراق" or "طلب من الصين"
    private String estimate; // "حوالي يومين" or "١٥–٢٠ يوماً"
    private Integer minDays;
    private Integer maxDays;
    private Integer count;
    private Boolean allowCod;

    public DeliveryGroupDTO() {}

    public DeliveryGroupDTO(String source, String label, String estimate, Integer minDays, Integer maxDays, Integer count, Boolean allowCod) {
        this.source = source;
        this.label = label;
        this.estimate = estimate;
        this.minDays = minDays;
        this.maxDays = maxDays;
        this.count = count;
        this.allowCod = allowCod;
    }

    public String getSource() { return source; }
    public void setSource(String source) { this.source = source; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public String getEstimate() { return estimate; }
    public void setEstimate(String estimate) { this.estimate = estimate; }

    public Integer getMinDays() { return minDays; }
    public void setMinDays(Integer minDays) { this.minDays = minDays; }

    public Integer getMaxDays() { return maxDays; }
    public void setMaxDays(Integer maxDays) { this.maxDays = maxDays; }

    public Integer getCount() { return count; }
    public void setCount(Integer count) { this.count = count; }

    public Boolean getAllowCod() { return allowCod; }
    public void setAllowCod(Boolean allowCod) { this.allowCod = allowCod; }
}
