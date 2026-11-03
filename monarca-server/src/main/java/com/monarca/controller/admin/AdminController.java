package com.monarca.controller.admin;

import com.monarca.common.R;
import com.monarca.dto.AdminDashboardDTO;
import com.monarca.entity.AppConfig;
import com.monarca.entity.Order;
import com.monarca.entity.Product;
import com.monarca.entity.ReturnRequest;
import com.monarca.repository.AppConfigRepository;
import com.monarca.repository.OrderRepository;
import com.monarca.repository.ProductRepository;
import com.monarca.repository.ReturnRequestRepository;
import com.monarca.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management API", description = "Backoffice Store & Fulfillment Management")
public class AdminController {

    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final AppConfigRepository appConfigRepository;
    private final ProductService productService;

    public AdminController(ProductRepository productRepository,
                           OrderRepository orderRepository,
                           ReturnRequestRepository returnRequestRepository,
                           AppConfigRepository appConfigRepository,
                           ProductService productService) {
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.appConfigRepository = appConfigRepository;
        this.productService = productService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get Dashboard KPI Statistics")
    public R<AdminDashboardDTO> getDashboard() {
        AdminDashboardDTO dto = new AdminDashboardDTO();

        List<Order> allOrders = orderRepository.findAll();
        dto.setTotalOrders(allOrders.size());

        BigDecimal gmv = allOrders.stream()
                .filter(o -> !"cancelled".equalsIgnoreCase(o.getStatus()))
                .map(Order::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setTotalGmv(gmv);

        long pending = allOrders.stream()
                .filter(o -> "placed".equalsIgnoreCase(o.getStatus()) || "preparing".equalsIgnoreCase(o.getStatus()))
                .count();
        dto.setPendingFulfillment(pending);

        long delivered = allOrders.stream()
                .filter(o -> "delivered".equalsIgnoreCase(o.getStatus()))
                .count();
        dto.setDeliveredOrders(delivered);

        long cancelled = allOrders.stream()
                .filter(o -> "cancelled".equalsIgnoreCase(o.getStatus()))
                .count();
        dto.setCancelledOrders(cancelled);

        dto.setReturnRequestsCount(returnRequestRepository.count());

        List<Product> products = productRepository.findAll();
        dto.setProductsCount(products.size());
        dto.setIraqStockCount(products.stream().filter(p -> "iraq".equalsIgnoreCase(p.getFulfillmentSource())).count());
        dto.setChinaPreorderCount(products.stream().filter(p -> "china".equalsIgnoreCase(p.getFulfillmentSource())).count());

        return R.ok(dto);
    }

    @GetMapping("/products")
    @Operation(summary = "List All Products for Admin")
    public R<List<Product>> getProducts() {
        return R.ok(productRepository.findAll());
    }

    @PostMapping("/products")
    @Operation(summary = "Create or Update Product (Change Price, Source, Stock)")
    public R<Product> saveProduct(@RequestBody Product product) {
        if ("china".equalsIgnoreCase(product.getFulfillmentSource())) {
            product.setFulfillment("preorder");
        } else {
            product.setFulfillment("in_stock");
            product.setFulfillmentSource("iraq");
        }
        return R.ok(productRepository.save(product));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete Product")
    public R<String> deleteProduct(@PathVariable Long id) {
        productRepository.deleteById(id);
        return R.ok("Deleted successfully", null);
    }

    @GetMapping("/orders")
    @Operation(summary = "List All Orders with Optional Status Filter")
    public R<List<Order>> getOrders(@RequestParam(required = false) String status) {
        if (status != null && !status.isEmpty() && !"all".equalsIgnoreCase(status)) {
            return R.ok(orderRepository.findByStatusOrderByCreatedAtDesc(status));
        }
        return R.ok(orderRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/orders/{id}/status")
    @Operation(summary = "Update Order Status (placed, preparing, shipped, delivered, cancelled)")
    public R<Order> updateOrderStatus(@PathVariable String id, @RequestParam String status) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order == null) {
            return R.fail(404, "Order not found");
        }
        order.setStatus(status.toLowerCase());
        order.setUpdatedAt(LocalDateTime.now());
        if ("delivered".equalsIgnoreCase(status) && "cod".equalsIgnoreCase(order.getPaymentMethod())) {
            order.setPaymentStatus("paid");
            order.setPaidTotal(order.getTotal());
        }
        return R.ok(orderRepository.save(order));
    }

    @GetMapping("/returns")
    @Operation(summary = "List All Return Requests")
    public R<List<ReturnRequest>> getReturns() {
        return R.ok(returnRequestRepository.findAllByOrderByCreatedAtDesc());
    }

    @PutMapping("/returns/{id}/status")
    @Operation(summary = "Update Return Request Status (approved, rejected, received, completed)")
    public R<ReturnRequest> updateReturnStatus(@PathVariable String id, @RequestParam String status) {
        ReturnRequest req = returnRequestRepository.findById(id).orElse(null);
        if (req == null) {
            return R.fail(404, "Return request not found");
        }
        req.setStatus(status.toLowerCase());
        req.setUpdatedAt(LocalDateTime.now());
        return R.ok(returnRequestRepository.save(req));
    }

    @GetMapping("/config")
    @Operation(summary = "Get All System Configurations")
    public R<Map<String, String>> getConfig() {
        Map<String, String> map = new HashMap<>();
        for (AppConfig c : appConfigRepository.findAll()) {
            map.put(c.getKey(), c.getValue());
        }
        return R.ok(map);
    }

    @PostMapping("/config")
    @Operation(summary = "Update System Configuration (Key/Value)")
    public R<String> updateConfig(@RequestParam String key, @RequestParam String value) {
        AppConfig config = appConfigRepository.findByKey(key)
                .orElse(new AppConfig(key, value, ""));
        config.setValue(value);
        appConfigRepository.save(config);
        return R.ok("Configuration updated", null);
    }
}
