package com.monarca.controller.api;

import com.monarca.service.ProductVideoStorage;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import java.util.concurrent.TimeUnit;

@RestController
public class ProductVideoController {
    private final ProductVideoStorage storage;
    public ProductVideoController(ProductVideoStorage storage) { this.storage = storage; }

    @GetMapping(ProductVideoStorage.URL_PREFIX + "{filename}")
    public ResponseEntity<Resource> getVideo(@PathVariable String filename) {
        var path = storage.find(filename);
        if (path == null) return ResponseEntity.notFound().build();
        // FileSystemResource lets Spring MVC serve byte ranges (including Safari's range probes).
        return ResponseEntity.ok().contentType(MediaType.parseMediaType("video/mp4"))
                .cacheControl(CacheControl.maxAge(365, TimeUnit.DAYS).cachePublic().immutable())
                .header("X-Content-Type-Options", "nosniff")
                .body(new FileSystemResource(path));
    }
}
