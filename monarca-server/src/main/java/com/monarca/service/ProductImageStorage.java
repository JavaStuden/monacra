package com.monarca.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.imageio.ImageReadParam;
import javax.imageio.ImageReader;
import javax.imageio.stream.MemoryCacheImageInputStream;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Locale;
import java.util.UUID;

@Service
public class ProductImageStorage {
    public static final String URL_PREFIX = "/api/v1/product-images/";
    private static final long MAX_BYTES = 5 * 1024 * 1024;
    private static final int MAX_INPUT_SIDE = 6000;
    private static final int MAX_OUTPUT_SIDE = 1800;
    private static final long MAX_PIXELS = 20_000_000;

    private final Path directory;

    public ProductImageStorage(@Value("${monarca.product-images.directory:./data/product-images}") String directory) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
    }

    public String store(MultipartFile upload) throws IOException {
        if (upload.isEmpty() || upload.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Choose an image up to 5 MB.");
        }
        BufferedImage image;
        String format;
        try (var input = new MemoryCacheImageInputStream(upload.getInputStream())) {
            var readers = ImageIO.getImageReaders(input);
            if (!readers.hasNext()) {
                throw new IllegalArgumentException("Choose a valid JPG or PNG image.");
            }
            ImageReader reader = readers.next();
            try {
                format = reader.getFormatName().toLowerCase(Locale.ROOT);
                if (!"jpeg".equals(format) && !"png".equals(format)) {
                    throw new IllegalArgumentException("Choose a valid JPG or PNG image.");
                }
                reader.setInput(input, true, true);
                int width = reader.getWidth(0);
                int height = reader.getHeight(0);
                if (Math.max(width, height) > MAX_INPUT_SIDE || (long) width * height > MAX_PIXELS) {
                    throw new IllegalArgumentException("Image dimensions are too large (maximum 6,000 px per side and 20 megapixels).");
                }
                int sample = Math.ceilDiv(Math.max(width, height), MAX_OUTPUT_SIDE);
                ImageReadParam params = reader.getDefaultReadParam();
                params.setSourceSubsampling(sample, sample, 0, 0);
                image = reader.read(0, params);
            } finally {
                reader.dispose();
            }
        } catch (IOException | IndexOutOfBoundsException ex) {
            throw new IllegalArgumentException("Choose a valid JPG or PNG image.", ex);
        }
        if ("jpeg".equals(format) && image.getType() != BufferedImage.TYPE_INT_RGB) {
            BufferedImage rgb = new BufferedImage(image.getWidth(), image.getHeight(), BufferedImage.TYPE_INT_RGB);
            var graphics = rgb.createGraphics();
            graphics.drawImage(image, 0, 0, null);
            graphics.dispose();
            image = rgb;
        }
        Files.createDirectories(directory);
        String filename = UUID.randomUUID() + ("png".equals(format) ? ".png" : ".jpg");
        Path temporary = Files.createTempFile(directory, ".upload-", ".tmp");
        try {
            if (!ImageIO.write(image, format, temporary.toFile())) {
                throw new IOException("Image encoder unavailable");
            }
            Files.move(temporary, directory.resolve(filename), StandardCopyOption.ATOMIC_MOVE);
            return URL_PREFIX + filename;
        } finally {
            Files.deleteIfExists(temporary);
        }
    }

    public Path find(String filename) {
        if (!filename.matches("[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}\\.(?:jpg|png)")) {
            return null;
        }
        Path file = directory.resolve(filename);
        return Files.isRegularFile(file, java.nio.file.LinkOption.NOFOLLOW_LINKS) ? file : null;
    }

    public void discard(String url) throws IOException {
        Path file = find(url.substring(URL_PREFIX.length()));
        if (file != null) {
            Files.deleteIfExists(file);
        }
    }
}
