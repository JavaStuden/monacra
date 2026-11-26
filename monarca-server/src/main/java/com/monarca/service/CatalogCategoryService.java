package com.monarca.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.monarca.dto.ProductCategoryDTO;
import com.monarca.entity.AppConfig;
import com.monarca.repository.AppConfigRepository;
import com.monarca.repository.ProductRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
public class CatalogCategoryService {
    private static final String META_PREFIX = "catalog.category.";
    private static final Set<String> BUILT_INS = Set.of("clothes", "shoes", "bags", "accessories");
    private static final List<ProductCategoryDTO> DEFAULTS = List.of(
            new ProductCategoryDTO("clothes", "ملابس", "Clothes", "XS,S,M,L,XL,2XL,3XL,4XL", true),
            new ProductCategoryDTO("shoes", "أحذية", "Shoes", "36,37,38,39,40,41,42,43", true),
            new ProductCategoryDTO("bags", "حقائب", "Bags", "مقاس موحّد", true),
            new ProductCategoryDTO("accessories", "إكسسوارات", "Accessories", "مقاس موحّد", true));

    private final AppConfigRepository configs;
    private final ProductRepository products;
    private final ObjectMapper mapper;

    public CatalogCategoryService(AppConfigRepository configs, ProductRepository products, ObjectMapper mapper) {
        this.configs = configs;
        this.products = products;
        this.mapper = mapper;
    }

    public List<ProductCategoryDTO> getAll() {
        Map<String, ProductCategoryDTO> categories = new LinkedHashMap<>();
        DEFAULTS.forEach(value -> categories.put(value.id(), read(value.id(), value)));
        for (AppConfig config : configs.findByKeyStartingWith(META_PREFIX)) {
            String id = config.getKey().substring(META_PREFIX.length());
            if (BUILT_INS.contains(id) || !validId(id)) continue;
            ProductCategoryDTO fallback = new ProductCategoryDTO(id, id, id, "مقاس موحّد", true);
            ProductCategoryDTO category = read(id, fallback);
            if (category != null) categories.put(id, category);
        }
        return categories.values().stream().sorted(Comparator.comparingInt(c -> order(c.id()))).toList();
    }

    public List<ProductCategoryDTO> getActive() {
        return getAll().stream().filter(ProductCategoryDTO::active).toList();
    }

    public ProductCategoryDTO get(String id) {
        if (id == null) return null;
        return getAll().stream().filter(category -> category.id().equals(id)).findFirst().orElse(null);
    }

    public String sizeTemplate(String id) {
        ProductCategoryDTO category = get(id);
        return category == null ? null : category.sizes();
    }

    @Transactional
    public ProductCategoryDTO save(ProductCategoryDTO submitted) {
        if (submitted == null || !validId(submitted.id()) || !validLabel(submitted.nameAr())
                || !validLabel(submitted.nameEn()) || !validSizes(submitted.sizes())) {
            throw new IllegalArgumentException("INVALID_PRODUCT_CATEGORY");
        }
        boolean exists = get(submitted.id()) != null;
        if (!exists && configs.existsById(META_PREFIX + submitted.id())) throw new IllegalArgumentException("INVALID_PRODUCT_CATEGORY");
        String metadata;
        try {
            metadata = mapper.writeValueAsString(Map.of(
                    "nameAr", submitted.nameAr().trim(),
                    "nameEn", submitted.nameEn().trim(),
                    "active", submitted.active()));
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Could not save category", exception);
        }
        AppConfig meta = configs.findById(META_PREFIX + submitted.id())
                .orElse(new AppConfig(META_PREFIX + submitted.id(), metadata, "Product category"));
        meta.setValue(metadata);
        configs.save(meta);
        AppConfig sizes = configs.findById("catalog.sizes." + submitted.id())
                .orElse(new AppConfig("catalog.sizes." + submitted.id(), submitted.sizes().trim(), "Category size template"));
        sizes.setValue(normalizeSizes(submitted.sizes()));
        configs.save(sizes);
        return get(submitted.id());
    }

    @Transactional
    public void delete(String id) {
        if (!validId(id) || BUILT_INS.contains(id)) throw new IllegalArgumentException("CATEGORY_CANNOT_BE_DELETED");
        if (get(id) == null) throw new IllegalArgumentException("CATEGORY_NOT_FOUND");
        if (products.countByCategory(id) > 0) throw new IllegalStateException("CATEGORY_IN_USE");
        configs.deleteById(META_PREFIX + id);
        configs.deleteById("catalog.sizes." + id);
    }

    public static boolean validSizes(String value) {
        if (value == null || value.isBlank() || value.length() > 512) return false;
        String[] sizes = value.replace('،', ',').split(",", -1);
        if (sizes.length < 1 || sizes.length > 24) return false;
        Set<String> unique = new java.util.HashSet<>();
        for (String raw : sizes) {
            String size = raw.trim();
            if (!size.matches("[\\p{L}\\p{M}\\p{N} ._+/-]{1,16}") || !unique.add(size.toLowerCase(Locale.ROOT))) return false;
        }
        return true;
    }

    public static String normalizeSizes(String value) {
        List<String> result = new ArrayList<>();
        for (String raw : value.replace('،', ',').split(",")) {
            String size = raw.trim();
            if (Set.of("xs", "s", "m", "l", "xl", "xxl", "xxxl", "xxxxl", "2xl", "3xl", "4xl", "5xl").contains(size.toLowerCase(Locale.ROOT))) size = size.toUpperCase(Locale.ROOT);
            result.add(size);
        }
        return String.join(",", result);
    }

    public static boolean validId(String id) {
        return id != null && id.length() >= 2 && id.length() <= 32 && id.matches("[a-z][a-z0-9]*(?:-[a-z0-9]+)*");
    }

    private static boolean validLabel(String label) {
        return label != null && !label.isBlank() && label.trim().length() <= 60
                && label.chars().noneMatch(Character::isISOControl) && !label.matches(".*[<>&\"'].*");
    }

    private ProductCategoryDTO read(String id, ProductCategoryDTO fallback) {
        String nameAr = fallback.nameAr(), nameEn = fallback.nameEn();
        boolean active = fallback.active();
        AppConfig meta = configs.findById(META_PREFIX + id).orElse(null);
        if (meta != null) {
            try {
                var node = mapper.readTree(meta.getValue());
                if (node.path("nameAr").isTextual() && validLabel(node.path("nameAr").asText())) nameAr = node.path("nameAr").asText();
                if (node.path("nameEn").isTextual() && validLabel(node.path("nameEn").asText())) nameEn = node.path("nameEn").asText();
                if (node.path("active").isBoolean()) active = node.path("active").asBoolean();
            } catch (Exception ignored) { }
        }
        String sizes = configs.findById("catalog.sizes." + id).map(AppConfig::getValue).filter(CatalogCategoryService::validSizes)
                .map(CatalogCategoryService::normalizeSizes).orElse(fallback.sizes());
        return new ProductCategoryDTO(id, nameAr, nameEn, sizes, active);
    }

    private int order(String id) {
        int index = List.of("clothes", "shoes", "bags", "accessories").indexOf(id);
        return index >= 0 ? index : 10;
    }
}
