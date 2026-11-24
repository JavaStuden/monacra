package com.monarca.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.List;

@Converter
public class ProductColorOptionsConverter implements AttributeConverter<List<ProductColorOption>, String> {
    private static final ObjectMapper JSON = new ObjectMapper();
    public String convertToDatabaseColumn(List<ProductColorOption> value) {
        if (value == null || value.isEmpty()) return null;
        try { return JSON.writeValueAsString(value); }
        catch (JsonProcessingException ex) { throw new IllegalArgumentException("Invalid color options", ex); }
    }
    public List<ProductColorOption> convertToEntityAttribute(String value) {
        if (value == null || value.isBlank()) return null;
        try { return JSON.readValue(value, new TypeReference<>() {}); }
        catch (JsonProcessingException ex) { throw new IllegalArgumentException("Invalid stored color options", ex); }
    }
}
