package com.monarca.service;

import com.monarca.entity.Product;
import com.monarca.entity.ProductColorOption;
import java.util.*;

public final class ProductOptions {
    private ProductOptions() {}
    public static final List<ProductColorOption> DEFAULT_COLORS = List.of(
            new ProductColorOption("black","أسود","Black","#2f2c2a"),
            new ProductColorOption("brown","بني","Brown","#9b6b43"),
            new ProductColorOption("cream","عاجي","Ivory","#e7ddc9"),
            new ProductColorOption("olive","زيتي","Olive","#666a4f"),
            new ProductColorOption("taupe","رمادي دافئ","Warm taupe","#9b8e7b"),
            new ProductColorOption("gold","ذهبي","Gold","#c3a365"),
            new ProductColorOption("red","أحمر","Red","#c5353d"),
            new ProductColorOption("white","أبيض","White","#ffffff"),
            new ProductColorOption("beige","بيج","Beige","#d8c3a5"),
            new ProductColorOption("gray","رمادي","Gray","#8b8b8b"),
            new ProductColorOption("navy","كحلي","Navy","#25364f"),
            new ProductColorOption("blue","أزرق","Blue","#3569b0"),
            new ProductColorOption("green","أخضر","Green","#36744c"),
            new ProductColorOption("pink","وردي","Pink","#e7a3b1"),
            new ProductColorOption("purple","بنفسجي","Purple","#805b97"),
            new ProductColorOption("orange","برتقالي","Orange","#dc843b"),
            new ProductColorOption("yellow","أصفر","Yellow","#e7c94f"),
            new ProductColorOption("burgundy","خمري","Burgundy","#773143"),
            new ProductColorOption("silver","فضي","Silver","#b7bac0"),
            new ProductColorOption("denim","جينز أزرق","Denim blue","#52748c"));

    public static String defaultSizes(String category) {
        return switch (category == null ? "" : category) {
            case "clothes" -> "XS,S,M,L,XL,2XL,3XL,4XL";
            case "shoes" -> "36,37,38,39,40,41,42,43";
            case "bags", "accessories" -> "مقاس موحّد";
            default -> "";
        };
    }

    public static void apply(Product product, Product fields) {
        Map<String,ProductColorOption> palette = new LinkedHashMap<>();
        DEFAULT_COLORS.forEach(option -> palette.put(option.key(), option));
        if (product.getColorOptions() != null) product.getColorOptions().forEach(option -> palette.putIfAbsent(option.key(), option));
        if (fields.getColorOptions() != null) {
            if (fields.getColorOptions().size() > 20) throw new IllegalArgumentException("INVALID_PRODUCT_COLORS");
            Set<String> keys = new HashSet<>();
            for (var option : fields.getColorOptions()) {
                if (option == null || option.key() == null || Set.of("__proto__", "prototype", "constructor").contains(option.key()) || !option.key().matches("[\\p{L}\\p{M}\\p{N} _-]{1,24}")
                        || !label(option.nameAr()) || !label(option.nameEn())
                        || option.hex() == null || !option.hex().matches("#[0-9a-fA-F]{6}") || !keys.add(option.key())) {
                    throw new IllegalArgumentException("INVALID_PRODUCT_COLORS");
                }
                // Standard colour codes keep their established meaning across old orders and clients.
                if (DEFAULT_COLORS.stream().noneMatch(p -> p.key().equals(option.key()))) palette.put(option.key(), option);
            }
        }
        String colors = fields.getColors() != null ? fields.getColors() : product.getColors();
        if (colors == null) colors = "black";
        var selected = new LinkedHashSet<String>();
        for (String entry : colors.split(",", -1)) {
            String code = entry.trim();
            if (!palette.containsKey(code)) throw new IllegalArgumentException("INVALID_PRODUCT_COLORS");
            selected.add(code);
        }
        if (selected.isEmpty() || selected.size() > 20) throw new IllegalArgumentException("INVALID_PRODUCT_COLORS");
        String sizes = fields.getSizes() != null ? fields.getSizes() : product.getSizes();
        if (sizes == null) sizes = defaultSizes(fields.getCategory());
        var selectedSizes = new LinkedHashSet<String>();
        for (String entry : sizes.replace('،', ',').split(",", -1)) {
            String size = entry.trim();
            if (!size.matches("[\\p{L}\\p{M}\\p{N} ._+/-]{1,16}")) throw new IllegalArgumentException("INVALID_PRODUCT_SIZES");
            if (Set.of("xs","s","m","l","xl","xxl","xxxl","xxxxl","2xl","3xl","4xl","5xl").contains(size.toLowerCase(Locale.ROOT))) size = size.toUpperCase(Locale.ROOT);
            selectedSizes.add(size);
        }
        if (selectedSizes.isEmpty() || selectedSizes.size() > 24) throw new IllegalArgumentException("INVALID_PRODUCT_SIZES");
        String unavailable = fields.getUnavailableSize() == null ? product.getUnavailableSize() : fields.getUnavailableSize().trim();
        if (unavailable != null && (unavailable.isBlank() || !selectedSizes.contains(unavailable))) unavailable = null;
        String measure = fields.getMeasure() == null ? product.getMeasure() : fields.getMeasure().trim();
        if (measure != null && measure.length() > 2000) throw new IllegalArgumentException("INVALID_PRODUCT_MEASUREMENTS");
        product.setColors(String.join(",", selected));
        product.setColorOptions(selected.stream().map(palette::get).toList());
        product.setSizes(String.join(",", selectedSizes));
        product.setUnavailableSize(unavailable);
        product.setMeasure(measure);
    }
    private static boolean label(String value) { return value != null && !value.isBlank() && value.length() <= 40 && value.chars().noneMatch(Character::isISOControl) && !value.matches(".*[<>&\"'].*"); }
}
