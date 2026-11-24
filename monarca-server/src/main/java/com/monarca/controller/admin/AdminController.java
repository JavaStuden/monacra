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
import com.monarca.service.ProductImageStorage;
import com.monarca.service.ProductVideoStorage;
import com.monarca.service.ProductService;
import com.monarca.service.ProductOptions;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.LinkedHashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Management API", description = "Backoffice Store & Fulfillment Management")
public class AdminController {

    private static final int MAX_PRODUCT_IMAGES = 6;
    private static final String NEW_IMAGE = "new";
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final ReturnRequestRepository returnRequestRepository;
    private final AppConfigRepository appConfigRepository;
    private final ProductImageStorage productImages;
    private final ProductVideoStorage productVideos;
    private final String productAdminToken;

    public AdminController(ProductRepository productRepository,
                           ProductService productService,
                           OrderRepository orderRepository,
                           ReturnRequestRepository returnRequestRepository,
                           AppConfigRepository appConfigRepository,
                           ProductImageStorage productImages,
                           ProductVideoStorage productVideos,
                           @Value("${monarca.security.product-admin-token}") String productAdminToken) {
        this.productRepository = productRepository;
        this.productService = productService;
        this.orderRepository = orderRepository;
        this.returnRequestRepository = returnRequestRepository;
        this.appConfigRepository = appConfigRepository;
        this.productImages = productImages;
        this.productVideos = productVideos;
        this.productAdminToken = productAdminToken;
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

        List<Product> products = productService.getAll();
        dto.setProductsCount(products.size());
        dto.setIraqStockCount(products.stream().filter(p -> "iraq".equalsIgnoreCase(p.getFulfillmentSource())).count());
        dto.setChinaPreorderCount(products.stream().filter(p -> "china".equalsIgnoreCase(p.getFulfillmentSource())).count());

        return R.ok(dto);
    }

    @GetMapping("/products")
    @Operation(summary = "List All Products for Admin")
    public R<List<Product>> getProducts() {
        return R.ok(productService.getAll());
    }

    @PostMapping(value = "/products", consumes = MediaType.APPLICATION_JSON_VALUE)
    public R<Product> saveProduct(@RequestBody Product fields,
                                  @RequestHeader(value = "X-Product-Admin-Token", required = false) String token) {
        return saveProduct(fields, null, null, null, null, null, false, null, false, token);
    }

    @PostMapping(value = "/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Save a product and its ordered JPG or PNG gallery")
    public R<Product> saveProduct(@RequestPart("product") Product fields,
                                  @RequestPart(value = "image", required = false) MultipartFile image,
                                  @RequestPart(value = "images", required = false) List<MultipartFile> images,
                                  @RequestPart(value = "imageOrder", required = false) List<String> imageOrder,
                                  @RequestPart(value = "imageColors", required = false) List<String> imageColors,
                                  @RequestPart(value = "video", required = false) MultipartFile video,
                                  @RequestParam(value = "removeVideo", defaultValue = "false") boolean removeVideo,
                                  @RequestPart(value = "sizeChart", required = false) MultipartFile sizeChart,
                                  @RequestParam(value = "removeSizeChart", defaultValue = "false") boolean removeSizeChart,
                                  @RequestHeader(value = "X-Product-Admin-Token", required = false) String token) {
        requireProductAdmin(token);
        if (video != null && removeVideo) return R.fail(400, "INVALID_PRODUCT_VIDEO");
        if (sizeChart != null && removeSizeChart) return R.fail(400, "INVALID_SIZE_CHART");
        if (fields.getGender() != null && !Set.of("women", "men", "unisex").contains(fields.getGender())) {
            return R.fail(400, "INVALID_PRODUCT_GENDER");
        }
        if (fields.getName() == null || fields.getName().isBlank() || fields.getName().length() > 100
                || (fields.getEnName() != null && fields.getEnName().length() > 100)
                || (fields.getBadge() != null && fields.getBadge().length() > 50)
                || fields.getPrice() == null || fields.getPrice().signum() <= 0
                || fields.getStock() == null || fields.getStock() < 0
                || fields.getCategory() == null
                || !Set.of("clothes", "shoes", "bags", "accessories").contains(fields.getCategory())) {
            return R.fail(400, "Check the product name, category, price and stock.");
        }
        Product product = fields.getId() == null ? new Product()
                : productRepository.findByIdAndDeletedAtIsNull(fields.getId()).orElse(null);
        if (product == null) {
            return R.fail(404, "Product not found.");
        }
        boolean international = "china".equalsIgnoreCase(fields.getFulfillmentSource());
        Integer weight = fields.getShippingWeightGrams();
        if (weight != null && weight < 1) {
            return R.fail(400, "INVALID_SHIPPING_WEIGHT");
        }
        if (weight == null) {
            weight = product.getShippingWeightGrams();
        }

        try {
            ProductOptions.apply(product, fields);
        } catch (IllegalArgumentException ex) {
            return R.fail(400, ex.getMessage());
        }

        product.setName(fields.getName().trim());
        product.setEnName(fields.getEnName());
        product.setCategory(fields.getCategory());
        if (fields.getGender() != null) product.setGender(fields.getGender());
        else if (product.getId() == null) product.setGender("women");
        product.setPrice(fields.getPrice());
        product.setOldPrice(fields.getOldPrice());
        product.setStock(fields.getStock());
        product.setBadge(fields.getBadge());
        product.setFulfillmentSource(international ? "china" : "iraq");
        product.setFulfillment(international ? "preorder" : "in_stock");
        product.setShippingWeightGrams(international ? weight : null);
        List<String> uploaded = new ArrayList<>();
        try {
            if (image != null || images != null || imageOrder != null) {
                updateImages(product, image, images, imageOrder, uploaded);
            }
            updateImageColors(product, fields.getImageColors(), imageColors);
            if (video != null) {
                String path = productVideos.store(video);
                uploaded.add(path);
                product.setVideoUrl(path);
            } else if (removeVideo) {
                product.setVideoUrl(null);
            }
            if (sizeChart != null) {
                String path;
                try { path = productImages.store(sizeChart); }
                catch (IllegalArgumentException ex) { throw new IllegalArgumentException("INVALID_SIZE_CHART", ex); }
                uploaded.add(path);
                product.setSizeChartUrl(path);
            } else if (removeSizeChart) {
                product.setSizeChartUrl(null);
            }
            return R.ok(productRepository.saveAndFlush(product));
        } catch (IllegalArgumentException ex) {
            discardUploads(uploaded, ex);
            return R.fail(400, ex.getMessage());
        } catch (IOException ex) {
            discardUploads(uploaded, ex);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not store the images.", ex);
        } catch (RuntimeException ex) {
            discardUploads(uploaded, ex);
            throw ex;
        }
    }

    private void updateImages(Product product, MultipartFile legacyImage, List<MultipartFile> images,
                              List<String> imageOrder, List<String> uploaded) throws IOException {
        List<String> current = product.getImageUrls();
        if (legacyImage != null) {
            if (images != null || imageOrder != null) {
                throw new IllegalArgumentException("Invalid product image request.");
            }
            // Older editors replace only the cover photo.
            String coverColor = product.getImageColors() == null ? null : product.getImageColors().get(product.getImageUrl());
            String cover = productImages.store(legacyImage);
            uploaded.add(cover);
            List<String> gallery = new ArrayList<>();
            gallery.add(cover);
            gallery.addAll(current.subList(Math.min(1, current.size()), current.size()));
            product.replaceImages(gallery);
            if (coverColor != null) product.getImageColors().put(cover, coverColor);
            return;
        }

        List<MultipartFile> files = images == null ? List.of() : images;
        if (imageOrder == null) {
            throw new IllegalArgumentException("Product image order is required.");
        }
        if (imageOrder.size() > MAX_PRODUCT_IMAGES || files.size() > MAX_PRODUCT_IMAGES) {
            throw new IllegalArgumentException("A product can have at most 6 images.");
        }
        int newCount = 0;
        Set<String> retained = new HashSet<>();
        for (String entry : imageOrder) {
            if (NEW_IMAGE.equals(entry)) {
                newCount++;
            } else if (entry == null || !current.contains(entry) || !retained.add(entry)) {
                throw new IllegalArgumentException("Invalid product image order. Reopen the editor and try again.");
            }
        }
        if (newCount != files.size()) {
            throw new IllegalArgumentException("Product image order does not match the uploaded files.");
        }

        var remaining = files.iterator();
        List<String> gallery = new ArrayList<>(imageOrder.size());
        for (String entry : imageOrder) {
            if (NEW_IMAGE.equals(entry)) {
                String path = productImages.store(remaining.next());
                uploaded.add(path);
                gallery.add(path);
            } else {
                gallery.add(entry);
            }
        }
        product.replaceImages(gallery);
    }

    private void updateImageColors(Product product, Map<String, String> byPath, List<String> orderedColors) {
        List<String> gallery = product.getImageUrls();
        Set<String> available = new HashSet<>(List.of((product.getColors() == null ? "" : product.getColors()).split(",")));
        Map<String, String> result = new LinkedHashMap<>();
        if (orderedColors != null) {
            if (byPath != null || orderedColors.size() != gallery.size()) {
                throw new IllegalArgumentException("INVALID_IMAGE_COLORS");
            }
            for (int i = 0; i < gallery.size(); i++) {
                String color = orderedColors.get(i);
                if (color == null || (!color.isEmpty() && !available.contains(color))) {
                    throw new IllegalArgumentException("INVALID_IMAGE_COLORS");
                }
                if (!color.isEmpty()) result.put(gallery.get(i), color);
            }
        } else if (byPath != null) {
            for (var entry : byPath.entrySet()) {
                if (!gallery.contains(entry.getKey()) || !available.contains(entry.getValue())) {
                    throw new IllegalArgumentException("INVALID_IMAGE_COLORS");
                }
                result.put(entry.getKey(), entry.getValue());
            }
        } else if (product.getImageColors() != null) {
            product.getImageColors().forEach((path, color) -> {
                if (gallery.contains(path) && available.contains(color)) result.put(path, color);
            });
        }
        product.setImageColors(result);
    }

    private void discardUploads(List<String> uploaded, Exception failure) {
        for (String path : uploaded) {
            try {
                if (path.startsWith(ProductVideoStorage.URL_PREFIX)) productVideos.discard(path);
                else productImages.discard(path);
            } catch (IOException cleanupError) {
                failure.addSuppressed(cleanupError);
            }
        }
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Delete Product")
    public R<String> deleteProduct(@PathVariable Long id,
                                   @RequestHeader(value = "X-Product-Admin-Token", required = false) String token) {
        requireProductAdmin(token);
        productService.delete(id);
        return R.ok("Deleted successfully", null);
    }

    private void requireProductAdmin(String token) {
        if (productAdminToken.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Product management token is not configured.");
        }
        if (token == null || !MessageDigest.isEqual(productAdminToken.getBytes(StandardCharsets.UTF_8),
                token.getBytes(StandardCharsets.UTF_8))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid product management token.");
        }
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
