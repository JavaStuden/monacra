package com.monarca.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.RandomAccessFile;
import java.nio.file.Files;
import java.nio.file.LinkOption;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Set;
import java.util.UUID;

@Service
public class ProductVideoStorage {
    public static final String URL_PREFIX = "/api/v1/product-videos/";
    public static final long MAX_BYTES = 20L * 1024 * 1024;
    private static final Set<String> BRANDS = Set.of("isom", "iso2", "iso3", "iso4", "iso5", "iso6", "mp41", "mp42", "avc1", "M4V ");
    private final Path directory;

    public ProductVideoStorage(@Value("${monarca.product-videos.directory:./data/product-videos}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile upload) throws IOException {
        if (upload.isEmpty() || upload.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("INVALID_PRODUCT_VIDEO");
        }
        Files.createDirectories(directory);
        Path temporary = Files.createTempFile(directory, ".video-", ".tmp");
        try {
            try (var input = upload.getInputStream()) {
                Files.copy(input, temporary, StandardCopyOption.REPLACE_EXISTING);
            }
            if (Files.size(temporary) > MAX_BYTES || !isMp4(temporary)) {
                throw new IllegalArgumentException("INVALID_PRODUCT_VIDEO");
            }
            String filename = UUID.randomUUID() + ".mp4";
            Files.move(temporary, directory.resolve(filename), StandardCopyOption.ATOMIC_MOVE);
            return URL_PREFIX + filename;
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    // Validate the MP4 container rather than trusting a filename or MIME supplied by the browser.
    private boolean isMp4(Path path) throws IOException {
        try (var file = new RandomAccessFile(path.toFile(), "r")) {
            long length = file.length(), offset = 0;
            boolean format = false, movie = false, media = false;
            int boxes = 0;
            while (offset < length && ++boxes <= 2048) {
                if (length - offset < 8) return false;
                file.seek(offset);
                long size = Integer.toUnsignedLong(file.readInt());
                byte[] typeBytes = new byte[4]; file.readFully(typeBytes);
                String type = new String(typeBytes, java.nio.charset.StandardCharsets.US_ASCII);
                int header = 8;
                if (size == 1) { if (length - offset < 16) return false; size = file.readLong(); header = 16; }
                else if (size == 0) size = length - offset;
                if (size < header || size > length - offset) return false;
                if (offset == 0) {
                    if (!"ftyp".equals(type) || size < header + 8) return false;
                    byte[] brand = new byte[4]; file.readFully(brand);
                    format = BRANDS.contains(new String(brand, java.nio.charset.StandardCharsets.US_ASCII));
                }
                if ("moov".equals(type) && size > header) movie = true;
                if ("mdat".equals(type) && size > header) media = true;
                offset += size;
            }
            return offset == length && format && movie && media;
        }
    }

    public Path find(String filename) {
        if (filename == null || !filename.matches("[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\\.mp4")) return null;
        Path file = directory.resolve(filename);
        return Files.isRegularFile(file, LinkOption.NOFOLLOW_LINKS) ? file : null;
    }

    public void discard(String url) throws IOException {
        if (url == null || !url.startsWith(URL_PREFIX)) return;
        Path file = find(url.substring(URL_PREFIX.length()));
        if (file != null) Files.deleteIfExists(file);
    }
}
