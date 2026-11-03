package com.monarca.controller.api;

import com.monarca.common.R;
import com.monarca.dto.CartLineDTO;
import com.monarca.dto.LoginRequest;
import com.monarca.dto.PlaceOrderRequest;
import com.monarca.dto.QuoteRequest;
import com.monarca.dto.QuoteResponse;
import com.monarca.entity.AppConfig;
import com.monarca.entity.Order;
import com.monarca.entity.Product;
import com.monarca.entity.ReturnRequest;
import com.monarca.repository.AppConfigRepository;
import com.monarca.service.FulfillmentService;
import com.monarca.service.OrderService;
import com.monarca.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Client API", description = "Mobile App & Web Client Endpoints")
public class ApiController {

    private final ProductService productService;
    private final FulfillmentService fulfillmentService;
    private final OrderService orderService;
    private final AppConfigRepository appConfigRepository;

    public ApiController(ProductService productService,
                         FulfillmentService fulfillmentService,
                         OrderService orderService,
                         AppConfigRepository appConfigRepository) {
        this.productService = productService;
        this.fulfillmentService = fulfillmentService;
        this.orderService = orderService;
        this.appConfigRepository = appConfigRepository;
    }

    @GetMapping("/products")
    @Operation(summary = "Query Product Catalog", description = "Supports filtering by category, source (iraq/china), price range, search query, and sorting")
    public R<List<Product>> getProducts(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String source,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String sort) {
        return R.ok(productService.filter(category, source, minPrice, maxPrice, query, sort));
    }

    @GetMapping("/products/{id}")
    @Operation(summary = "Get Product Details")
    public R<Product> getProductById(@PathVariable Long id) {
        Product p = productService.getById(id);
        if (p == null) {
            return R.fail(404, "Product not found");
        }
        return R.ok(p);
    }

    @PostMapping("/checkout/quote")
    @Operation(summary = "Calculate Checkout Quote & Dual-Sourcing Groups", description = "Calculates shipping fees ($75 free shipping threshold), applied discounts, delivery times, and strictly verifies COD eligibility (prohibiting COD if China items exist)")
    public R<QuoteResponse> getQuote(@RequestBody QuoteRequest request) {
        QuoteResponse quote = fulfillmentService.calculateQuote(request.getItems(), request.getCouponCode());
        return R.ok(quote);
    }

    @PostMapping("/orders")
    @Operation(summary = "Place a New Order", description = "Creates an order snapshot with exact prices and Iraqi delivery address, validates COD eligibility")
    public R<Order> placeOrder(@RequestBody PlaceOrderRequest request) {
        try {
            Order order = orderService.placeOrder(request);
            return R.ok("Order placed successfully", order);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return R.fail(400, e.getMessage());
        } catch (Exception e) {
            return R.fail(500, "Failed to place order: " + e.getMessage());
        }
    }

    @GetMapping("/orders/{id}")
    @Operation(summary = "Get Order by ID")
    public R<Order> getOrder(@PathVariable String id) {
        Order order = orderService.getOrder(id);
        if (order == null) {
            return R.fail(404, "Order not found");
        }
        return R.ok(order);
    }

    @GetMapping("/orders")
    @Operation(summary = "List Orders by Customer Phone")
    public R<List<Order>> listOrders(@RequestParam(required = false) String phone) {
        return R.ok(orderService.listOrders(phone));
    }

    @PostMapping("/orders/{id}/cancel")
    @Operation(summary = "Cancel an Order")
    public R<Order> cancelOrder(@PathVariable String id, @RequestParam(defaultValue = "Customer requested cancellation") String reason) {
        try {
            Order order = orderService.cancelOrder(id, reason);
            return R.ok("Order cancelled", order);
        } catch (Exception e) {
            return R.fail(400, e.getMessage());
        }
    }

    @PostMapping("/orders/{id}/advance")
    @Operation(summary = "Advance Order Tracking Status (Demo/Simulator Tool)")
    public R<Order> advanceOrderStatus(@PathVariable String id) {
        try {
            Order order = orderService.advanceStatus(id);
            return R.ok("Status advanced to " + order.getStatus(), order);
        } catch (Exception e) {
            return R.fail(400, e.getMessage());
        }
    }

    @PostMapping("/returns")
    @Operation(summary = "Submit a Return/Exchange Request")
    public R<ReturnRequest> submitReturn(
            @RequestParam String orderId,
            @RequestParam Long productId,
            @RequestParam(required = false) String color,
            @RequestParam(required = false) String size,
            @RequestParam(defaultValue = "1") int qty,
            @RequestParam String reason,
            @RequestParam(required = false) String note) {
        try {
            ReturnRequest req = orderService.submitReturn(orderId, productId, color, size, qty, reason, note);
            return R.ok("Return request submitted", req);
        } catch (Exception e) {
            return R.fail(400, e.getMessage());
        }
    }

    @PostMapping("/auth/login")
    @Operation(summary = "Customer Login (Iraq Phone + Demo Code 1234)")
    public R<Map<String, Object>> login(@RequestBody LoginRequest req) {
        if (req.getPhone() == null || req.getPhone().trim().length() < 9) {
            return R.fail("Invalid Iraqi phone number");
        }
        if (!"1234".equals(req.getOtp())) {
            return R.fail("Invalid verification code. Demo code is 1234.");
        }
        Map<String, Object> data = new HashMap<>();
        data.put("phone", req.getPhone().trim());
        data.put("token", "user-token-" + UUID.randomUUID().toString().substring(0, 12));
        data.put("name", "ضيف Monarca");
        return R.ok("Login successful", data);
    }

    @GetMapping("/config")
    @Operation(summary = "Get App System Configurations & WhatsApp Number")
    public R<Map<String, String>> getConfig() {
        Map<String, String> map = new HashMap<>();
        for (AppConfig c : appConfigRepository.findAll()) {
            map.put(c.getKey(), c.getValue());
        }
        return R.ok(map);
    }
}
