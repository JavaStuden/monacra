package com.monarca.service;

import com.monarca.entity.Product;
import com.monarca.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAllByDeletedAtIsNull();
    }

    public Product getById(Long id) {
        return productRepository.findByIdAndDeletedAtIsNull(id).orElse(null);
    }

    public List<Product> filter(String category, String source, BigDecimal minPrice, BigDecimal maxPrice, String query, String sort) {
        return filter(category, source, minPrice, maxPrice, query, sort, null);
    }

    public List<Product> filter(String category, String source, BigDecimal minPrice, BigDecimal maxPrice, String query, String sort, String gender) {
        if (gender != null && !List.of("all", "women", "men", "unisex").contains(gender)) {
            throw new IllegalArgumentException("INVALID_PRODUCT_GENDER");
        }
        List<Product> list = getAll();

        return list.stream()
                .filter(p -> {
                    String audience = p.getGender() == null ? "women" : p.getGender();
                    if (gender != null && !"all".equals(gender)
                            && !gender.equals(audience) && !("unisex".equals(audience) && !"unisex".equals(gender))) {
                        return false;
                    }
                    if (category != null && !category.isEmpty() && !"all".equalsIgnoreCase(category)) {
                        if ("offers".equalsIgnoreCase(category)) {
                            if (p.getOldPrice() == null) return false;
                        } else if (!category.equalsIgnoreCase(p.getCategory())) {
                            return false;
                        }
                    }
                    if (source != null && !source.isEmpty() && !"all".equalsIgnoreCase(source)) {
                        if (!source.equalsIgnoreCase(p.getFulfillmentSource())) {
                            return false;
                        }
                    }
                    if (minPrice != null && p.getPrice().compareTo(minPrice) < 0) {
                        return false;
                    }
                    if (maxPrice != null && p.getPrice().compareTo(maxPrice) > 0) {
                        return false;
                    }
                    if (query != null && !query.trim().isEmpty()) {
                        String q = query.trim().toLowerCase();
                        String all = (p.getName() + " " + p.getEnName() + " " + p.getKeywords() + " " + p.getMaterial()).toLowerCase();
                        if (!all.contains(q)) return false;
                    }
                    return true;
                })
                .sorted((a, b) -> {
                    if ("low".equalsIgnoreCase(sort)) {
                        return a.getPrice().compareTo(b.getPrice());
                    } else if ("high".equalsIgnoreCase(sort)) {
                        return b.getPrice().compareTo(a.getPrice());
                    } else if ("new".equalsIgnoreCase(sort)) {
                        return b.getId().compareTo(a.getId());
                    }
                    return 0; // recommended
                })
                .collect(Collectors.toList());
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public void delete(Long id) {
        productRepository.markDeleted(id, LocalDateTime.now());
    }
}
