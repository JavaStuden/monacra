package com.monarca.repository;

import com.monarca.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findAllByDeletedAtIsNull();

    Optional<Product> findByIdAndDeletedAtIsNull(Long id);

    @Modifying
    @Transactional
    @Query("update Product p set p.deletedAt = :deletedAt where p.id = :id and p.deletedAt is null")
    void markDeleted(@Param("id") Long id, @Param("deletedAt") LocalDateTime deletedAt);

    List<Product> findByCategory(String category);
    List<Product> findByFulfillmentSource(String fulfillmentSource);
    List<Product> findByCategoryAndFulfillmentSource(String category, String fulfillmentSource);
}
