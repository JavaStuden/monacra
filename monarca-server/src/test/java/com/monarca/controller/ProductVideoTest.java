package com.monarca.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.repository.ProductRepository;
import com.monarca.service.ProductVideoStorage;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {"spring.datasource.url=jdbc:h2:mem:product-video;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop", "spring.h2.console.enabled=false",
        "monarca.security.product-admin-token=local-video-test", "stripe.secret-key=", "stripe.webhook-secret="})
@AutoConfigureMockMvc
class ProductVideoTest {
    @TempDir static Path directory;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry registry) {
        registry.add("monarca.product-videos.directory", () -> directory.toString());
    }
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired ProductRepository products;
    @Autowired ProductVideoStorage videos;

    private byte[] mp4() {
        var out = ByteBuffer.allocate(52);
        out.putInt(24).put("ftypisom".getBytes(StandardCharsets.US_ASCII)).putInt(0)
                .put("isomavc1".getBytes(StandardCharsets.US_ASCII));
        out.putInt(16).put("moov".getBytes(StandardCharsets.US_ASCII)).putInt(8).put("free".getBytes(StandardCharsets.US_ASCII));
        out.putInt(12).put("mdat".getBytes(StandardCharsets.US_ASCII)).putInt(0);
        return out.array();
    }
    private Map<String,Object> fields(Long id) {
        var values = new LinkedHashMap<String,Object>(Map.of("name", "Local video test", "category", "clothes",
                "price", 120, "stock", 4, "fulfillmentSource", "iraq", "colors", "brown,black"));
        if (id != null) values.put("id", id);
        return values;
    }
    private MockMultipartFile product(Long id) throws Exception {
        return new MockMultipartFile("product", "", "application/json", json.writeValueAsBytes(fields(id)));
    }
    private MockMultipartFile clip(byte[] bytes) { return new MockMultipartFile("video", "clip.mp4", "video/mp4", bytes); }
    private JsonNode create() throws Exception {
        var result = mvc.perform(multipart("/api/admin/products").file(product(null)).file(clip(mp4()))
                .header("X-Product-Admin-Token", "local-video-test"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200)).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("data");
    }

    @Test void uploadedVideoIsPublicAndSupportsSafariByteRangesAndHead() throws Exception {
        var p = create(); String url = p.path("videoUrl").asText();
        assertTrue(url.matches("/api/v1/product-videos/[a-f0-9-]{36}\\.mp4"));
        assertEquals(url, products.findById(p.path("id").asLong()).orElseThrow().getVideoUrl());
        mvc.perform(get("/api/v1/products/" + p.path("id").asLong()))
                .andExpect(jsonPath("$.data.videoUrl").value(url));
        mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("video/mp4"))
                .andExpect(content().bytes(mp4())).andExpect(header().string("X-Content-Type-Options", "nosniff"));
        mvc.perform(get(url).header("Range", "bytes=0-1")).andExpect(status().isPartialContent())
                .andExpect(header().string("Content-Range", "bytes 0-1/52"))
                .andExpect(content().bytes(new byte[]{0,0}));
        mvc.perform(head(url)).andExpect(status().isOk()).andExpect(header().longValue("Content-Length", 52));
        mvc.perform(get(url).header("Range", "bytes=99-100")).andExpect(status().isRequestedRangeNotSatisfiable());
    }

    @Test void legacyEditorPreservesVideoAndExplicitReplacementAndRemovalWork() throws Exception {
        var p=create(); long id=p.path("id").asLong(); String first=p.path("videoUrl").asText();
        mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(fields(id)))
                .header("X-Product-Admin-Token", "local-video-test")).andExpect(jsonPath("$.data.videoUrl").value(first));
        var result=mvc.perform(multipart("/api/admin/products").file(product(id)).file(clip(mp4()))
                .header("X-Product-Admin-Token", "local-video-test")).andExpect(jsonPath("$.code").value(200)).andReturn();
        String second=json.readTree(result.getResponse().getContentAsString()).path("data").path("videoUrl").asText();
        assertNotEquals(first,second);
        mvc.perform(multipart("/api/admin/products").file(product(id)).param("removeVideo","true")
                .header("X-Product-Admin-Token", "local-video-test")).andExpect(jsonPath("$.code").value(200));
        assertNull(products.findById(id).orElseThrow().getVideoUrl());
        mvc.perform(get(first)).andExpect(status().isOk()); // Previously opened pages keep working.
    }

    @Test void unauthorisedUploadCannotCreateProductsOrFiles() throws Exception {
        long count=products.count(); long fileCount;
        try(var paths=Files.list(directory)){fileCount=paths.count();}
        mvc.perform(multipart("/api/admin/products").file(product(null)).file(clip(mp4())))
                .andExpect(status().isForbidden());
        assertEquals(count,products.count());
        try(var paths=Files.list(directory)){assertEquals(fileCount,paths.count());}
    }

    @Test void rejectsSpoofedTruncatedAndOversizedMediaWithoutLosingTheExistingClip() throws Exception {
        var p=create(); long id=p.path("id").asLong(); String original=p.path("videoUrl").asText();
        for(byte[] bytes:new byte[][]{"<script>bad</script>".getBytes(StandardCharsets.US_ASCII),
                java.util.Arrays.copyOf(mp4(),25),new byte[(int)ProductVideoStorage.MAX_BYTES+1]}){
            mvc.perform(multipart("/api/admin/products").file(product(id)).file(clip(bytes))
                    .header("X-Product-Admin-Token", "local-video-test"))
                    .andExpect(jsonPath("$.message").value("INVALID_PRODUCT_VIDEO"));
            assertEquals(original,products.findById(id).orElseThrow().getVideoUrl());
        }
        try(var paths=Files.list(directory)){assertFalse(paths.anyMatch(x->x.getFileName().toString().startsWith(".video-")));}
    }

    @Test void cannotAssignAnExternalOrAnotherProductsVideoUrlThroughJson() throws Exception {
        var p=create(); long id=p.path("id").asLong(); var values=fields(id);
        for(String url:new String[]{"https://example.com/arbitrary.mp4", "/api/v1/product-videos/00000000-0000-0000-0000-000000000000.mp4"}){
            values.put("videoUrl",url);
            mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(values))
                    .header("X-Product-Admin-Token","local-video-test"))
                    .andExpect(jsonPath("$.data.videoUrl").value(p.path("videoUrl").asText()));
        }
    }

    @Test void rejectsAmbiguousUploadAndRemoveAndRestrictsStoragePaths() throws Exception {
        mvc.perform(multipart("/api/admin/products").file(product(null)).file(clip(mp4())).param("removeVideo","true")
                .header("X-Product-Admin-Token","local-video-test")).andExpect(jsonPath("$.message").value("INVALID_PRODUCT_VIDEO"));
        assertNull(videos.find("../application.yml")); assertNull(videos.find("not-a-video.mp4"));
        mvc.perform(get("/api/v1/product-videos/00000000-0000-0000-0000-000000000000.mp4")).andExpect(status().isNotFound());
    }
}
