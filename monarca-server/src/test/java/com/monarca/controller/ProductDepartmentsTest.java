package com.monarca.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:departments;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.h2.console.enabled=false",
        "monarca.security.product-admin-token=local-test-only", "stripe.secret-key=", "stripe.webhook-secret="})
@AutoConfigureMockMvc
class ProductDepartmentsTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ProductRepository products;

    private Map<String, Object> fields(String marker, String gender, String category, String source) {
        var fields = new LinkedHashMap<String, Object>(Map.of("name", marker, "category", category,
                "price", 120, "stock", 5, "fulfillmentSource", source));
        if (gender != null) fields.put("gender", gender);
        return fields;
    }
    private JsonNode save(Map<String, Object> fields) throws Exception {
        var result = mvc.perform(post("/api/admin/products").contentType("application/json")
                .content(json.writeValueAsBytes(fields)).header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200)).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("data");
    }
    private Set<Long> ids(String query, String gender, String category, String source) throws Exception {
        var request = get("/api/v1/products").param("query", query);
        if (gender != null) request.param("gender", gender);
        if (category != null) request.param("category", category);
        if (source != null) request.param("source", source);
        var result = mvc.perform(request).andExpect(jsonPath("$.code").value(200)).andReturn();
        Set<Long> ids = new HashSet<>();
        json.readTree(result.getResponse().getContentAsString()).path("data").forEach(p -> ids.add(p.path("id").asLong()));
        return ids;
    }
    @Test void filtersDepartmentsAndCombinesCategorySearchAndSource() throws Exception {
        String key = "dept-filter";
        long women = save(fields(key, "women", "clothes", "iraq")).path("id").asLong();
        long men = save(fields(key, "men", "clothes", "china")).path("id").asLong();
        long shared = save(fields(key, "unisex", "bags", "iraq")).path("id").asLong();
        assertEquals(Set.of(women, shared), ids(key, "women", null, null));
        assertEquals(Set.of(men, shared), ids(key, "men", null, null));
        assertEquals(Set.of(shared), ids(key, "unisex", null, null));
        assertEquals(Set.of(women, men, shared), ids(key, null, null, null));
        assertEquals(Set.of(men), ids(key, "men", "clothes", "china"));
        assertEquals(Set.of(), ids(key, "men", "clothes", "iraq"));
        mvc.perform(get("/api/v1/products/" + women)).andExpect(jsonPath("$.data.id").value(women));
    }
    @Test void legacyRecordsStayInWomenAndOldEditorsPreserveExistingMen() throws Exception {
        var fields = fields("dept-compat", "men", "clothes", "iraq");
        long id = save(fields).path("id").asLong();
        fields.remove("gender"); fields.put("id", id);
        save(fields);
        assertEquals("men", products.findById(id).orElseThrow().getGender());
        long legacy = save(fields("dept-compat", null, "clothes", "iraq")).path("id").asLong();
        var product = products.findById(legacy).orElseThrow();
        product.setGender(null); products.saveAndFlush(product);
        assertEquals(Set.of(legacy), ids("dept-compat", "women", null, null));
        assertEquals(Set.of(id), ids("dept-compat", "men", null, null));
    }
    @Test void rejectsInvalidAudienceWithoutChangingExistingProduct() throws Exception {
        var fields = fields("dept-invalid", "men", "clothes", "iraq");
        long id = save(fields).path("id").asLong();
        fields.put("id", id); fields.put("gender", "other");
        mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(fields))
                .header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(400)).andExpect(jsonPath("$.message").value("INVALID_PRODUCT_GENDER"));
        assertEquals("men", products.findById(id).orElseThrow().getGender());
        mvc.perform(get("/api/v1/products").param("gender", "other"))
                .andExpect(jsonPath("$.code").value(400));
    }
    @Test void unisexIsOneProductWithSharedStockAndReclassificationKeepsItsId() throws Exception {
        var fields = fields("dept-shared", "unisex", "shoes", "iraq");
        long id = save(fields).path("id").asLong();
        assertEquals(Set.of(id), ids("dept-shared", "women", null, null));
        assertEquals(Set.of(id), ids("dept-shared", "men", null, null));
        fields.put("id", id); fields.put("stock", 2); fields.put("gender", "men");
        save(fields);
        assertEquals(2, products.findById(id).orElseThrow().getStock());
        assertEquals(Set.of(), ids("dept-shared", "women", null, null));
        assertEquals(Set.of(id), ids("dept-shared", "men", null, null));
    }
}
