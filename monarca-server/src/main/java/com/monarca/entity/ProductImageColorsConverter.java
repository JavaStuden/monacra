package com.monarca.entity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.util.Map;

@Converter
public class ProductImageColorsConverter implements AttributeConverter<Map<String, String>, String> {
    private static final ObjectMapper JSON = new ObjectMapper();

    @Override
    public String convertToDatabaseColumn(Map<String, String> value) {
        if (value == null || value.isEmpty()) return null;
        try { return JSON.writeValueAsString(value); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("Invalid image colors", e); }
    }

    @Override
    public Map<String, String> convertToEntityAttribute(String value) {
        if (value == null || value.isBlank()) return null;
        try { return JSON.readValue(value, new TypeReference<>() {}); }
        catch (JsonProcessingException e) { throw new IllegalArgumentException("Invalid stored image colors", e); }
    }
}
