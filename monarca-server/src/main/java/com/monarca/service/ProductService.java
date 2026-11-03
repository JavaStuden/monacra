package com.monarca.service;

import com.monarca.entity.Product;
import com.monarca.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    public List<Product> getAll() {
        return productRepository.findAll();
    }

    public Product getById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public List<Product> filter(String category, String source, BigDecimal minPrice, BigDecimal maxPrice, String query, String sort) {
        List<Product> list = productRepository.findAll();

        return list.stream()
                .filter(p -> {
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
        productRepository.deleteById(id);
    }
}
