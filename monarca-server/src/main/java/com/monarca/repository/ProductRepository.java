package com.monarca.repository;

import com.monarca.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCategory(String category);
    List<Product> findByFulfillmentSource(String fulfillmentSource);
    List<Product> findByCategoryAndFulfillmentSource(String category, String fulfillmentSource);
}
