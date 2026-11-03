package com.monarca.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "app_config")
public class AppConfig {
    @Id
    @Column(name = "config_key", length = 64)
    private String key;

    @Column(name = "config_value", length = 500)
    private String value;

    @Column(length = 200)
    private String description;

    public AppConfig() {}

    public AppConfig(String key, String value, String description) {
        this.key = key;
        this.value = value;
        this.description = description;
    }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getValue() { return value; }
    public void setValue(String value) { this.value = value; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
