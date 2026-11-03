package com.monarca.repository;

import com.monarca.entity.ReturnRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReturnRequestRepository extends JpaRepository<ReturnRequest, String> {
    List<ReturnRequest> findByOrderId(String orderId);
    List<ReturnRequest> findAllByOrderByCreatedAtDesc();
    long countByStatus(String status);
}
