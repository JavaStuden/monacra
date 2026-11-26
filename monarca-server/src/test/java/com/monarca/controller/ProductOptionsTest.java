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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Path;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties={"spring.datasource.url=jdbc:h2:mem:product-options;DB_CLOSE_DELAY=-1",
        "spring.jpa.hibernate.ddl-auto=create-drop","spring.h2.console.enabled=false",
        "monarca.security.product-admin-token=local-options-test","stripe.secret-key=","stripe.webhook-secret="})
@AutoConfigureMockMvc
class ProductOptionsTest {
    @TempDir static Path directory;
    @DynamicPropertySource static void storage(DynamicPropertyRegistry r) { r.add("monarca.product-images.directory",()->directory.toString()); }
    @Autowired MockMvc mvc; @Autowired ObjectMapper json; @Autowired ProductRepository products;
    private Map<String,Object> fields(Long id) {
        var p=new LinkedHashMap<String,Object>(Map.of("name","Local options test","category","clothes","price",120,"stock",4,"fulfillmentSource","iraq"));
        if(id!=null)p.put("id",id); return p;
    }
    private JsonNode save(Map<String,Object> p) throws Exception {
        var result=mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(p))
                .header("X-Product-Admin-Token","local-options-test")).andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200)).andReturn();
        return json.readTree(result.getResponse().getContentAsString()).path("data");
    }
    private MockMultipartFile part(Map<String,Object> p) throws Exception { return new MockMultipartFile("product","","application/json",json.writeValueAsBytes(p)); }
    private MockMultipartFile chart() throws Exception {
        var output=new ByteArrayOutputStream(); ImageIO.write(new BufferedImage(8,12,BufferedImage.TYPE_INT_RGB),"png",output);
        return new MockMultipartFile("sizeChart","chart.png","image/png",output.toByteArray());
    }
    @Test void supportsXSAndAnIndependentMTo4XLRangeAndRedInPublicProductAndQuote() throws Exception {
        var a=fields(null);a.put("sizes","XS,S,M,L,XL,2XL,3XL,4XL");a.put("colors","red,white,navy");
        var first=save(a);assertTrue(first.path("sizes").asText().startsWith("XS,"));
        var b=fields(null);b.put("sizes","m،L،XL،2XL،3XL،4XL");b.put("colors","red,black");
        var second=save(b);long id=second.path("id").asLong();
        assertEquals("M,L,XL,2XL,3XL,4XL",second.path("sizes").asText());
        assertEquals("أحمر",second.path("colorOptions").get(0).path("nameAr").asText());
        mvc.perform(get("/api/v1/products/"+id)).andExpect(jsonPath("$.data.colors").value("red,black"))
                .andExpect(jsonPath("$.data.sizes").value("M,L,XL,2XL,3XL,4XL"));
        var quote=Map.of("items",List.of(Map.of("productId",id,"color","red","size","4XL","qty",1)));
        mvc.perform(post("/api/v1/checkout/quote").contentType("application/json").content(json.writeValueAsBytes(quote)))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(200)).andExpect(jsonPath("$.data.total").value(120));
        assertFalse(products.findById(id).orElseThrow().getSizes().contains("XS"));
    }
    @Test void persistsCustomColourMetadataAndLegacyEditorsKeepItAndTheSizes() throws Exception {
        var p=fields(null);p.put("sizes","M,4XL");p.put("colors","dark-cherry,red");
        p.put("colorOptions",List.of(Map.of("key","dark-cherry","nameAr","كرزي داكن","nameEn","Dark cherry","hex","#702b40")));
        var first=save(p);long id=first.path("id").asLong();
        var second=save(fields(id));assertEquals(first.path("colorOptions"),second.path("colorOptions"));assertEquals("M,4XL",second.path("sizes").asText());
        assertEquals("#702b40",products.findById(id).orElseThrow().getColorOptions().getFirst().hex());
    }
    @Test void chartIsSeparateFromGalleryAndLegacyEditsPreserveItAndNotes() throws Exception {
        var p=fields(null);p.put("sizes","XS,M,4XL");p.put("measure","Measurements in cm\nUse this model's chart.");
        var result=mvc.perform(multipart("/api/admin/products").file(part(p)).file(chart())
                .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.code").value(200)).andReturn();
        var created=json.readTree(result.getResponse().getContentAsString()).path("data");long id=created.path("id").asLong();String url=created.path("sizeChartUrl").asText();
        assertTrue(url.startsWith("/api/v1/product-images/"));assertTrue(created.path("imageUrls").isEmpty());
        mvc.perform(get(url)).andExpect(status().isOk()).andExpect(content().contentTypeCompatibleWith("image/png"));
        var legacy=save(fields(id));assertEquals(url,legacy.path("sizeChartUrl").asText());assertEquals(p.get("measure"),legacy.path("measure").asText());
        var forged=fields(id);forged.put("sizeChartUrl","https://example.com/chart.png");assertEquals(url,save(forged).path("sizeChartUrl").asText());
        mvc.perform(multipart("/api/admin/products").file(part(fields(id))).param("removeSizeChart","true")
                .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.code").value(200));
        assertNull(products.findById(id).orElseThrow().getSizeChartUrl());
    }
    @Test void rejectsInvalidOrAmbiguousChartAndStillRequiresTheAdminToken() throws Exception {
        mvc.perform(multipart("/api/admin/products").file(part(fields(null))).file(chart())).andExpect(status().isForbidden());
        mvc.perform(multipart("/api/admin/products").file(part(fields(null))).file(chart()).param("removeSizeChart","true")
                .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.message").value("INVALID_SIZE_CHART"));
        mvc.perform(multipart("/api/admin/products").file(part(fields(null)))
                .file(new MockMultipartFile("sizeChart","chart.png","image/png","not an image".getBytes()))
                .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.message").value("INVALID_SIZE_CHART"));
    }
    @Test void rejectsUnsafeOrUnknownColoursAndSizeLimitsWithoutSavingProductChanges() throws Exception {
        var p=fields(null);p.put("colors","red");p.put("sizes","M,4XL");var saved=save(p);long id=saved.path("id").asLong();
        for(String key:List.of("not-configured","__proto__","constructor")) {
            var update=fields(id);update.put("colors",key);update.put("stock",999);
            if(!key.equals("not-configured")) update.put("colorOptions",List.of(Map.of("key",key,"nameAr","اختبار","nameEn","Test","hex","#ffffff")));
            mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(update))
                    .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.message").value("INVALID_PRODUCT_COLORS"));
            assertEquals(4,products.findById(id).orElseThrow().getStock());
        }
        for(String sizes:List.of("M,,4XL","<script>","ABCDEFGHIJKLMNOPQ",String.join(",",java.util.stream.IntStream.range(1,26).mapToObj(String::valueOf).toList()))) {
            var update=fields(id);update.put("sizes",sizes);
            mvc.perform(post("/api/admin/products").contentType("application/json").content(json.writeValueAsBytes(update))
                    .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.message").value("INVALID_PRODUCT_SIZES"));
        }
        assertEquals("M,4XL",products.findById(id).orElseThrow().getSizes());
    }
    @Test void canClearNotesAndUnavailableSizeAndRemoveObsoleteUnavailableSizes() throws Exception {
        var p=fields(null);p.put("sizes","XS,S,M,4XL");p.put("unavailableSize","M");p.put("measure","Model-specific notes");
        long id=save(p).path("id").asLong();var update=fields(id);update.put("sizes","XS,S,4XL");
        assertTrue(save(update).path("unavailableSize").isNull());
        update=fields(id);update.put("unavailableSize","");update.put("measure","");
        var result=save(update);assertTrue(result.path("unavailableSize").isNull());assertEquals("",result.path("measure").asText());
    }
    @Test void maintainsLegacyDefaultsForNewOldClientProductsAndSupportsShoeAndOneSizeModels() throws Exception {
        assertEquals("XS,S,M,L,XL,2XL,3XL,4XL",save(fields(null)).path("sizes").asText());
        var p=fields(null);p.put("category","shoes");p.put("sizes","35,36,37,38,39,40,41,42,43");assertEquals(p.get("sizes"),save(p).path("sizes").asText());
        p=fields(null);p.put("category","bags");assertEquals("مقاس موحّد",save(p).path("sizes").asText());
    }

    @Test @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void categoryTemplatesAreEditableProtectedAndApplyOnlyToNewProducts() throws Exception {
        mvc.perform(get("/api/admin/category-size-templates")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.clothes").value("XS,S,M,L,XL,2XL,3XL,4XL"))
                .andExpect(jsonPath("$.data.shoes").value("36,37,38,39,40,41,42,43"));
        Map<String,String> templates=Map.of("clothes","S,M,L,XL,2XL,4XL", "shoes","35,36,37,38,39,40,41,42,43,44", "bags","Small,Medium,Large", "accessories","One size,Adjustable");
        mvc.perform(post("/api/admin/category-size-templates").contentType("application/json").content(json.writeValueAsBytes(templates)))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/category-size-templates").contentType("application/json").content(json.writeValueAsBytes(templates))
                .header("X-Product-Admin-Token","local-options-test")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data.shoes").value("35,36,37,38,39,40,41,42,43,44"));
        var product=fields(null);product.put("category","shoes");
        assertEquals(templates.get("shoes"),save(product).path("sizes").asText());
        var existing=save(fields(null));long id=existing.path("id").asLong();
        var update=fields(id);update.put("sizes","XXS,4XL");save(update);
        var later=fields(null);later.put("category","clothes");assertEquals(templates.get("clothes"),save(later).path("sizes").asText());
        assertEquals("XXS,4XL",products.findById(id).orElseThrow().getSizes());
    }

    @Test void categoryTemplatesRejectInvalidSizeListsWithoutSavingAnyCategory() throws Exception {
        var defaults = Map.of("clothes","XS,S,M,L,XL,2XL,3XL,4XL", "shoes","36,37,38,39,40,41,42,43", "bags","مقاس موحّد", "accessories","مقاس موحّد");
        mvc.perform(post("/api/admin/category-size-templates").contentType("application/json").content(json.writeValueAsBytes(defaults))
                .header("X-Product-Admin-Token","local-options-test")).andExpect(status().isOk());
        var invalid=new LinkedHashMap<String,String>(Map.of("clothes","S,,XL","shoes","35,36","bags","One size","accessories","One size"));
        mvc.perform(post("/api/admin/category-size-templates").contentType("application/json").content(json.writeValueAsBytes(invalid))
                .header("X-Product-Admin-Token","local-options-test")).andExpect(jsonPath("$.message").value("INVALID_CATEGORY_SIZE_TEMPLATES"));
        mvc.perform(get("/api/admin/category-size-templates")).andExpect(jsonPath("$.data.clothes").value("XS,S,M,L,XL,2XL,3XL,4XL"));
    }

    @Test @DirtiesContext(methodMode = DirtiesContext.MethodMode.AFTER_METHOD)
    void customCategoriesAreLocalizedPublicAndSupplyDefaultsToNewProducts() throws Exception {
        var custom = Map.of("id", "abayas", "nameAr", "عبايات", "nameEn", "Abayas", "sizes", "S,M,L,XL,2XL", "active", true);
        mvc.perform(post("/api/admin/categories").contentType("application/json").content(json.writeValueAsBytes(List.of(custom))))
                .andExpect(status().isForbidden());
        mvc.perform(post("/api/admin/categories").contentType("application/json").content(json.writeValueAsBytes(List.of(custom)))
                .header("X-Product-Admin-Token", "local-options-test"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.data[0].id").value("abayas"));
        mvc.perform(get("/api/v1/categories")).andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.id == 'abayas')].nameEn").value("Abayas"));
        var product = fields(null); product.put("category", "abayas");
        var saved = save(product);
        assertEquals("S,M,L,XL,2XL", saved.path("sizes").asText());

        var inactive = Map.of("id", "abayas", "nameAr", "عبايات", "nameEn", "Abayas", "sizes", "S,M,L,XL,2XL", "active", false);
        mvc.perform(post("/api/admin/categories").contentType("application/json").content(json.writeValueAsBytes(List.of(inactive)))
                .header("X-Product-Admin-Token", "local-options-test")).andExpect(status().isOk());
        mvc.perform(get("/api/v1/categories")).andExpect(status().isOk()).andExpect(jsonPath("$.data[?(@.id == 'abayas')]").isEmpty());
        var update = fields(saved.path("id").asLong()); update.put("category", "abayas");
        assertEquals("S,M,L,XL,2XL", save(update).path("sizes").asText());
        mvc.perform(delete("/api/admin/categories/abayas").header("X-Product-Admin-Token", "local-options-test"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(409)).andExpect(jsonPath("$.message").value("CATEGORY_IN_USE"));
    }

    @Test void categoryNamesSizesAndIdsAreValidated() throws Exception {
        var invalid = Map.of("id", "../unsafe", "nameAr", "<script>", "nameEn", "Test", "sizes", "M,,L", "active", true);
        mvc.perform(post("/api/admin/categories").contentType("application/json").content(json.writeValueAsBytes(List.of(invalid)))
                .header("X-Product-Admin-Token", "local-options-test"))
                .andExpect(status().isOk()).andExpect(jsonPath("$.code").value(400)).andExpect(jsonPath("$.message").value("INVALID_PRODUCT_CATEGORY"));
    }
}
