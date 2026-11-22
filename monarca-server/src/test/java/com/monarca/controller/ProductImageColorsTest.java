package com.monarca.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import javax.imageio.ImageIO;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:color-photos;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.h2.console.enabled=false",
        "monarca.security.product-admin-token=local-test-only", "stripe.secret-key=", "stripe.webhook-secret="
})
@AutoConfigureMockMvc
class ProductImageColorsTest {
    @TempDir static Path directory;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) {
        registry.add("monarca.product-images.directory", () -> directory.toString());
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ProductRepository products;

    private MockMultipartFile part(String name, Object value) throws Exception {
        return new MockMultipartFile(name, "", "application/json", json.writeValueAsBytes(value));
    }
    private MockMultipartFile photo(String partName) throws Exception {
        var bytes = new ByteArrayOutputStream();
        ImageIO.write(new BufferedImage(3, 3, BufferedImage.TYPE_INT_RGB), "png", bytes);
        return new MockMultipartFile(partName, "photo.png", "image/png", bytes.toByteArray());
    }
    private Map<String, Object> fields(Long id, String colors) {
        var result = new java.util.LinkedHashMap<String, Object>(Map.of(
                "name", "Local color-photo test", "category", "clothes", "price", 120,
                "stock", 5, "fulfillmentSource", "china", "colors", colors));
        if (id != null) result.put("id", id);
        return result;
    }
    private JsonNode create() throws Exception {
        var response = mvc.perform(multipart("/api/admin/products")
                .file(part("product", fields(null, "brown,black,cream")))
                .file(part("imageOrder", List.of("new", "new", "new")))
                .file(part("imageColors", List.of("brown", "black", "")))
                .file(photo("images")).file(photo("images")).file(photo("images"))
                .header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200)).andReturn();
        return json.readTree(response.getResponse().getContentAsString()).path("data");
    }

    @Test void uploadsPersistAssignmentsAndExposeThemOnPublicProduct() throws Exception {
        JsonNode p = create();
        long id = p.path("id").asLong();
        String brown = p.path("imageUrls").get(0).asText();
        assertEquals("brown", products.findById(id).orElseThrow().getImageColors().get(brown));
        mvc.perform(get("/api/v1/products/" + id)).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.imageColors['" + brown + "']").value("brown"));
    }

    @Test void reorderingAndRemovingPhotosKeepsColorsWithTheirImagePaths() throws Exception {
        JsonNode p = create();
        String brown = p.path("imageUrls").get(0).asText();
        String black = p.path("imageUrls").get(1).asText();
        long id = p.path("id").asLong();
        mvc.perform(multipart("/api/admin/products").file(part("product", fields(id, "brown,black,cream")))
                .file(part("imageOrder", List.of(black, brown)))
                .header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(200));
        var saved = products.findById(id).orElseThrow();
        assertEquals(List.of(black, brown), saved.getImageUrls());
        assertEquals(Map.of(brown, "brown", black, "black"), saved.getImageColors());
        mvc.perform(multipart("/api/admin/products").file(part("product", fields(id, "brown,black")))
                .file(part("imageOrder", List.of(black))).header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(200));
        assertEquals(Map.of(black, "black"), products.findById(id).orElseThrow().getImageColors());
    }

    @Test void invalidColorOrWrongAssignmentCountDoesNotSaveOrLeaveUploads() throws Exception {
        try (var files = Files.list(directory)) {
            long count = files.count();
            for (var assignments : List.of(List.of("red"), List.of("brown", "black"))) {
                mvc.perform(multipart("/api/admin/products")
                        .file(part("product", fields(null, "brown,black")))
                        .file(part("imageOrder", List.of("new"))).file(photo("images"))
                        .file(part("imageColors", assignments)).header("X-Product-Admin-Token", "local-test-only"))
                        .andExpect(jsonPath("$.code").value(400))
                        .andExpect(jsonPath("$.message").value("INVALID_IMAGE_COLORS"));
            }
            try (var remaining = Files.list(directory)) { assertEquals(count, remaining.count()); }
        }
    }

    @Test void oldJsonEditorPreservesAssignmentsAndRemovingColorPrunesThem() throws Exception {
        JsonNode p = create();
        long id = p.path("id").asLong();
        mvc.perform(post("/api/admin/products").contentType("application/json")
                .content(json.writeValueAsBytes(fields(id, "black,cream")))
                .header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(200));
        assertEquals(Map.of(p.path("imageUrls").get(1).asText(), "black"), products.findById(id).orElseThrow().getImageColors());
        var invalid = fields(id, "black,cream");
        invalid.put("imageColors", Map.of("/api/v1/product-images/not-this-products.png", "black"));
        mvc.perform(post("/api/admin/products").contentType("application/json")
                .content(json.writeValueAsBytes(invalid)).header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(400));
    }

    @Test void legacyCoverReplacementRetainsItsColorAndAuthorizationRemainsRequired() throws Exception {
        JsonNode p = create();
        long id = p.path("id").asLong();
        mvc.perform(multipart("/api/admin/products").file(part("product", fields(id, "brown,black,cream")))
                .file(photo("image")).header("X-Product-Admin-Token", "local-test-only"))
                .andExpect(jsonPath("$.code").value(200));
        var saved = products.findById(id).orElseThrow();
        assertEquals("brown", saved.getImageColors().get(saved.getImageUrl()));
        mvc.perform(post("/api/admin/products").contentType("application/json")
                .content(json.writeValueAsBytes(fields(id, "black"))))
                .andExpect(status().isForbidden());
    }
}
