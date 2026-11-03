package com.monarca.service;

import com.monarca.entity.*;
import com.monarca.repository.*;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements ApplicationRunner {

    private final ProductRepository productRepository;
    private final CouponRepository couponRepository;
    private final OrderRepository orderRepository;
    private final AppConfigRepository appConfigRepository;

    public DataInitializer(ProductRepository productRepository,
                           CouponRepository couponRepository,
                           OrderRepository orderRepository,
                           AppConfigRepository appConfigRepository) {
        this.productRepository = productRepository;
        this.couponRepository = couponRepository;
        this.orderRepository = orderRepository;
        this.appConfigRepository = appConfigRepository;
    }

    @Override
    public void run(ApplicationArguments args) {
        initProducts();
        initCoupons();
        initAppConfigs();
        initSampleOrders();
    }

    private void initProducts() {
        if (productRepository.count() > 0) return;

        createProduct(1L, "حقيبة جلد طبيعي", "The everyday shoulder bag", "bags", "tophandle",
                "جلد بتفاصيل أنيقة", "350.00", null, 0, "brown,black", "مقاس موحّد", null, 5,
                "in_stock", "iraq", "الأكثر طلباً", "bag handbag leather حقيبة حقائب شنطة بني جلد");

        createProduct(2L, "حذاء بكعب أنيق", "The classic heel", "shoes", "heels",
                "راحة ترافق كل خطوة", "190.00", null, 1, "cream", "37,38,39,40,41", "40", 4,
                "preorder", "china", "جديد", "heels shoes أحذية حذاء كعب بيج");

        createProduct(3L, "قميص حرير كلاسيكي", "The classic silk shirt", "clothes", "shirts",
                "حرير بلمسة ناعمة", "140.00", null, 2, "cream", "S,M,L,XL", "XL", 5,
                "in_stock", "iraq", "جديد", "shirt satin قميص قمصان ملابس بلوزة ساتان حرير");

        createProduct(4L, "هودي بقصّة مريحة", "The relaxed hoodie", "clothes", "hoodies",
                "قطن ناعم · قصّة واسعة", "120.00", null, 3, "black", "S,M,L,XL", null, 3,
                "in_stock", "iraq", null, "hoodie black هودي هوديز ملابس اسود");

        createProduct(5L, "جاكيت صوف فاخر", "The belted wool jacket", "clothes", "jackets",
                "صوف ناعم · بني عميق", "220.00", null, 4, "brown", "S,M,L,XL", "S", 2,
                "preorder", "china", "إصدار محدود", "jacket brown جاكيت جاكيتات ملابس بني");

        createProduct(6L, "بنطال رسمي أنيق", "The tailored trouser", "clothes", "trousers",
                "قصّة انسيابية · بيج دافئ", "250.00", null, 5, "cream", "S,M,L,XL", null, 5,
                "in_stock", "iraq", null, "trousers pants بنطال بناطيل ملابس بنطلون");

        createProduct(7L, "أقراط ذهبية بتفاصيل ناعمة", "The delicate gold earrings", "accessories", "earrings",
                "إكسسوارات تكمل إطلالتك", "70.00", null, 6, "gold", "مقاس موحّد", null, 5,
                "in_stock", "iraq", null, "accessories earrings إكسسوارات اقراط أقراط حلق ذهب");

        createProduct(8L, "حقيبة كتف بإطلالة كلاسيكية", "The classic shoulder edit", "bags", "shoulder",
                "جلد طبيعي بحسب تصميم العينة", "305.00", "350.00", 0, "brown,black", "مقاس موحّد", null, 4,
                "in_stock", "iraq", "اختيار الموسم", "bag shoulder classic");

        createProduct(9L, "قميص ساتان بقصّة ناعمة", "The soft satin edit", "clothes", "shirts",
                "ساتان بلمسة ناعمة", "125.00", "140.00", 2, "cream,taupe", "S,M,L,XL", null, 6,
                "in_stock", "iraq", "سعر خاص", "satin shirt soft");

        createProduct(10L, "بنطال واسع للعمل واليوم", "The everyday tailored edit", "clothes", "trousers",
                "قصّة انسيابية ومريحة", "210.00", "250.00", 5, "cream,black", "S,M,L,XL", null, 4,
                "in_stock", "iraq", "مختارات Monarca", "trousers pants tailored");

        createProduct(11L, "جاكيت بحزام لإطلالة المساء", "The evening jacket edit", "clothes", "jackets",
                "صوف مخلوط أنيق", "230.00", null, 4, "brown,black", "S,M,L,XL", null, 3,
                "in_stock", "iraq", "جديد", "jacket evening belted");

        createProduct(12L, "كعب كلاسيكي للمناسبات", "The occasion heel edit", "shoes", "heels",
                "خامة ناعمة ونعل ثابت", "175.00", "190.00", 1, "cream,black", "37,38,39,40,41", "41", 3,
                "in_stock", "iraq", "سعر خاص", "heels occasion shoes");

        createProduct(13L, "هودي يومي بقصّة واسعة", "The off-duty hoodie edit", "clothes", "hoodies",
                "قطن مخلوط مريح", "105.00", null, 3, "black,olive", "S,M,L,XL", null, 5,
                "in_stock", "iraq", "راحة يومية", "hoodie off duty");

        createProduct(14L, "أقراط لمسة المساء", "The evening earring edit", "accessories", "earrings",
                "معدن بلون ذهبي وتفاصيل دقيقة", "65.00", "70.00", 6, "gold", "مقاس موحّد", null, 2,
                "in_stock", "iraq", "لمسة أخيرة", "earrings evening gold");
    }

    private void createProduct(Long id, String name, String en, String cat, String sub,
                               String material, String price, String oldPrice, int img,
                               String colors, String sizes, String unavailable, int stock,
                               String fulfillment, String source, String badge, String keywords) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setEnName(en);
        p.setCategory(cat);
        p.setSubCategory(sub);
        p.setMaterial(material);
        p.setPrice(new BigDecimal(price));
        if (oldPrice != null) p.setOldPrice(new BigDecimal(oldPrice));
        p.setImgIndex(img);
        p.setColors(colors);
        p.setSizes(sizes);
        p.setUnavailableSize(unavailable);
        p.setStock(stock);
        p.setFulfillment(fulfillment);
        p.setFulfillmentSource(source);
        p.setBadge(badge);
        p.setKeywords(keywords);
        productRepository.save(p);
    }

    private void initCoupons() {
        if (couponRepository.count() > 0) return;
        Coupon c = new Coupon();
        c.setCode("M10");
        c.setTitle("لمسة ترحيب");
        c.setDescription("خصم ١٠٪ على قيمة المنتجات عند الشراء بـ ٤٠ USD أو أكثر");
        c.setDiscountPercent(10);
        c.setMinSpend(new BigDecimal("40.00"));
        c.setActive(true);
        c.setExpiresAt(LocalDateTime.now().plusMonths(6));
        couponRepository.save(c);
    }

    private void initAppConfigs() {
        if (appConfigRepository.count() > 0) return;
        appConfigRepository.save(new AppConfig("store.whatsapp", "+9647700000000", "Store Official WhatsApp Number"));
        appConfigRepository.save(new AppConfig("store.name", "Monarca Iraq Digital Boutique", "Store Name"));
        appConfigRepository.save(new AppConfig("shipping.freeThreshold", "75.00", "Free shipping threshold (USD)"));
        appConfigRepository.save(new AppConfig("shipping.standardFee", "4.00", "Standard shipping fee (USD)"));
    }

    private void initSampleOrders() {
        if (orderRepository.count() > 0) return;

        // Sample Order 1: Delivered
        Order o1 = new Order();
        o1.setId("M-DEMO-1018");
        o1.setStatus("delivered");
        o1.setPaymentMethod("visa");
        o1.setPaymentStatus("paid");
        o1.setSubtotal(new BigDecimal("140.00"));
        o1.setDiscount(BigDecimal.ZERO);
        o1.setShippingFee(BigDecimal.ZERO);
        o1.setTotal(new BigDecimal("140.00"));
        o1.setPaidTotal(new BigDecimal("140.00"));
        o1.setCustomerName("سارة أحمد");
        o1.setCustomerPhone("+964 770 000 0000");
        o1.setCity("بغداد");
        o1.setLocality("بغداد");
        o1.setArea("المنصور");
        o1.setStreet("شارع الروّاد");
        o1.setLandmark("قرب مول المنصور");
        o1.setDeliverySummary("متوفر في العراق · حوالي يومين");
        o1.setTransactionId("TXN-1018");

        OrderItem item1 = new OrderItem();
        item1.setProductId(3L);
        item1.setProductName("قميص حرير كلاسيكي");
        item1.setColor("cream");
        item1.setSize("M");
        item1.setQty(1);
        item1.setUnitPrice(new BigDecimal("140.00"));
        item1.setFulfillmentSource("iraq");
        o1.addItem(item1);
        orderRepository.save(o1);

        // Sample Order 2: Shipped
        Order o2 = new Order();
        o2.setId("M-DEMO-1024");
        o2.setStatus("shipped");
        o2.setPaymentMethod("visa");
        o2.setPaymentStatus("paid");
        o2.setSubtotal(new BigDecimal("350.00"));
        o2.setDiscount(BigDecimal.ZERO);
        o2.setShippingFee(BigDecimal.ZERO);
        o2.setTotal(new BigDecimal("350.00"));
        o2.setPaidTotal(new BigDecimal("350.00"));
        o2.setCustomerName("سارة أحمد");
        o2.setCustomerPhone("+964 770 000 0000");
        o2.setCity("بغداد");
        o2.setLocality("بغداد");
        o2.setArea("المنصور");
        o2.setStreet("شارع الروّاد");
        o2.setLandmark("قرب مول المنصور");
        o2.setDeliverySummary("متوفر في العراق · حوالي يومين");
        o2.setTransactionId("TXN-1024");

        OrderItem item2 = new OrderItem();
        item2.setProductId(1L);
        item2.setProductName("حقيبة جلد طبيعي");
        item2.setColor("brown");
        item2.setSize("مقاس موحّد");
        item2.setQty(1);
        item2.setUnitPrice(new BigDecimal("350.00"));
        item2.setFulfillmentSource("iraq");
        o2.addItem(item2);
        orderRepository.save(o2);
    }
}
