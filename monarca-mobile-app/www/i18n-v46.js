/* Monarca v4.7: local Arabic/English UI, USD pricing and Iraq/China sourcing. No remote translation. */
(function (w, d) {
'use strict';
const storageKey='monarca-language', missing=new Set();
const normalize=s=>String(s??'').replace(/[\u200e\u200f\u061c]/g,'').replace(/\s+/g,' ').trim();
const western=s=>String(s).replace(/[٠-٩]/g,n=>'٠١٢٣٤٥٦٧٨٩'.indexOf(n)).replace(/[۰-۹]/g,n=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(n)).replace(/٬/g,',').replace(/٫/g,'.').replace(/٪/g,'%');
const neutralExact={
 'أضيفي إلى السلة':'إضافة إلى السلة','أضيفي للسلة':'إضافة إلى السلة','شراء الآن':'الشراء الآن','تسوّق الآن':'التسوّق الآن','تسوّقي حسب القسم':'التسوّق حسب القسم','اختر من الصور':'اختيار صورة','التقط صورة':'التقاط صورة','أهلاً بكِ في Monarca':'أهلاً بك في Monarca','مرحباً بكِ':'مرحباً بك','أنتِ':'أنت','ضيفة M':'ضيف Monarca','متابعة التسوق كضيفة':'متابعة التسوق كضيف','مساحة لكل ما تحبين':'مساحة لكل الاختيارات','سجّلي دخولك لتكتمل تفاصيلك':'تسجيل الدخول لحفظ التفاصيل','أسلوبكِ يبدأ من هنا.':'الأسلوب يبدأ من هنا.','إلى حيث تكونين.':'إلى الوجهة المختارة.','قريبة منكِ':'قريبة منك','تجربة قريبة منكِ':'تجربة قريبة منك','نساعدكِ على الاختيار':'مساعدة على الاختيار','لن تفوتكِ قطعة أعجبتك.':'حفظ القطع المفضلة للعودة إليها.','وصلتِ إلى نهاية هذه المجموعة':'نهاية هذه المجموعة','قطع تحتفظين بها لوقتٍ جميل.':'قطع محفوظة لوقت جميل.','قطع اخترتِها بعناية':'قطع مختارة بعناية','آخر ما شاهدتِه':'آخر المشاهدات','شاهدتِها مؤخراً':'المشاهدات الأخيرة','كيف تأخذين القياس؟':'طريقة أخذ القياس','كل ما تحتاجينه قبل الطلب وبعده.':'كل التفاصيل قبل الطلب وبعده.','أبرز ما أحببتِه في القطعة':'أبرز تفاصيل القطعة','إطلالة متكاملة، بطريقتكِ.':'إطلالة متكاملة بطابع خاص.','التقييمات المعروضة أمثلة مصرح بها لاختبار الواجهة وليست مراجعات عملاء. ما تكتبينه يحفظ على هذا الجهاز فقط.':'التقييمات المعروضة أمثلة لاختبار الواجهة وليست مراجعات عملاء. تحفظ التقييمات على هذا الجهاز فقط.',
 'راجعي الرسالة ثم اضغطي إرسال بنفسك.':'يمكن مراجعة الرسالة وإرسالها يدوياً.','هذه النسخة مصممة للسوق العراقي. دعم الكردية أو الإنجليزية يمكن إضافته ضمن نطاق التطوير النهائي.':'تتوفر العربية والإنجليزية لواجهة التطبيق. بلد التوصيل العراق وعملة العرض USD.',
 'النسخة الحالية بالعربية وبالدينار العراقي فقط. دعم الكردية أو الإنجليزية وتغيير العملة يحتاج توسيع نطاق المنتج، ولا يوجد تحويل عملات في النموذج.':'تتوفر العربية والإنجليزية. بلد التوصيل العراق والعملة الدولار الأمريكي USD. الأسعار تجريبية وليست تحويلاً فورياً للعملة.','تُعرض هذه النسخة باللغة العربية ومن اليمين إلى اليسار.':'تتوفر العربية من اليمين إلى اليسار والإنجليزية من اليسار إلى اليمين.'
};
const neutralWords={أضيفي:'إضافة',اختاري:'اختيار',اختاريـ:'اختيار',اكتشفي:'استكشاف',تسوّقي:'التسوّق',ابحثي:'البحث',اكتبي:'إدخال',أدخلي:'إدخال',احفظي:'حفظ',تابعي:'متابعة',تواصلي:'التواصل',افتحي:'فتح',أكملي:'إكمال',استكشفي:'استكشاف',جرّبي:'تجربة',اضغطي:'الضغط',ارفعي:'رفع',التقطي:'التقاط',راجعي:'مراجعة',حدّدي:'تحديد',اطّلعي:'الاطلاع',احصلي:'الحصول',أضيفيـ:'إضافة',أديري:'إدارة',استلمي:'استلام',طبّقي:'تطبيق',اسألي:'السؤال',اقرئي:'قراءة',تعرّفي:'التعرّف',تعرفي:'التعرّف',اضبطي:'ضبط',اشرحي:'شرح',أضيفي:'إضافة',عدّلي:'تعديل',جهّزي:'تجهيز',أعيدي:'إعادة',استخدمي:'استخدام',اختاري:'اختيار',وجّهي:'توجيه',توجهي:'التوجه',قيسي:'قياس',قارني:'مقارنة',مرّري:'تمرير',ضعي:'وضع',علّمي:'تحديد',خذي:'اعتماد',قفي:'الوقوف',ساعدينا:'المساعدة',تضيفي:'إضافة',تدخلي:'إدخال',تشاركي:'مشاركة',تريدين:'تريد',تودين:'المطلوب',تحتاجين:'بحاجة إلى',ترسلين:'ترسل',تحبين:'تفضّل',كنتِ:'كنت',أنتِ:'أنت',بكِ:'بك',منكِ:'منك',بطريقتكِ:'بطريقتك',لديكِ:'لديك',إليكِ:'إليك',لكِ:'لك'};
Object.assign(neutralWords,{أبعديها:'إبعادها',نظفي:'التنظيف',امسحيها:'مسحها',احتفظي:'الاحتفاظ',تجنبي:'تجنّب',اقلبي:'قلب',اتركيها:'تركها',احفظيها:'حفظها',استخدميها:'استخدامها',اختاريها:'اختيارها',اكوي:'الكيّ',علّقي:'تعليق',اطلبي:'طلب',ابدئي:'البدء',اعرضي:'عرض',أزيلي:'إزالة',انسخي:'نسخ',انتظري:'الانتظار',انتقلي:'الانتقال',تحدثي:'التحدث',تحققي:'التحقق',تصفّحي:'تصفّح',حددي:'تحديد',سجّلي:'تسجيل',صمّمي:'تنسيق',قيّمي:'تقييم',وحّدي:'توحيد',وقارنيها:'ومقارنتها',وصلتِ:'تم الوصول',استلمتِ:'تم استلام',تجاوزتِ:'تم تجاوز',تشبهكِ:'تناسبك',مقاسكِ:'مقاسك',أحببتِها:'مفضلة'});
Object.assign(neutralWords,{ادفعي:'الدفع',أكّدي:'تأكيد',قللي:'تقليل',اتّبعي:'اتباع',دعينا:'يمكن',جرّب:'تجربة',اختر:'اختيار',أضف:'إضافة',اشترِ:'الشراء',العميلة:'المستخدم',مستخدمات:'مستخدمي'});
Object.assign(neutralExact,{'اعثر على قطع مشابهة':'البحث عن قطع مشابهة','جرّب صورة أخرى':'اختيار صورة أخرى','هل تريدين إزالة هذا العنوان من دفتر العناوين؟ الطلبات السابقة تحتفظ بعناوينها.':'تأكيد إزالة هذا العنوان من دفتر العناوين؟ تحتفظ الطلبات السابقة بعناوينها.','هل تريدين إزالة هذه القطعة من السلة؟':'تأكيد إزالة هذه القطعة من السلة؟','هل تريدين إلغاء الطلب التجريبي؟':'تأكيد إلغاء الطلب التجريبي؟','هل تريدين مسح القطع التي شاهدتِها مؤخراً على هذا الجهاز؟':'تأكيد مسح المشاهدات الأخيرة على هذا الجهاز؟','تحتاجين مساعدة أكثر؟':'هل هناك حاجة إلى مساعدة إضافية؟','تحتاجين مساعدة في كتابة عنوان التوصيل؟':'هل هناك حاجة إلى مساعدة في إدخال عنوان التوصيل؟','أهلاً،':'أهلاً،','أنتِ على اطلاع':'كل المستجدات بين يديك','خطوة صغيرة وتصلين':'خطوة صغيرة نحو إتمام الطلب','أضيفي قطعة تحبينها، ثم اختاري تفاصيلها لنكمل طلبك.':'إضافة قطعة مفضلة واختيار تفاصيلها لإكمال الطلب.','اختاري قسماً، واكتشفي القطع التي تشبهكِ.':'اختيار قسم لاستكشاف القطع المناسبة.','آخر ما شاهدتِه':'المشاهدات الأخيرة','تحققي من رقمك':'التحقق من رقم الهاتف'});
function neutral(s){
 s=String(s??'');if(neutralExact[normalize(s)])return neutralExact[normalize(s)];
 s=s.replace(/كل ما تكتبينه/g,'كل الرسائل').replace(/ما تكتبينه/g,'المحتوى المدخل').replace(/أنتِ من ترسلين الرسالة/g,'إرسال الرسالة يدوياً').replace(/تريدين/g,'تريد').replace(/تودين/g,'تريد').replace(/تحتاجينه/g,'يلزم').replace(/تحتاجينها/g,'المطلوبة').replace(/تحتاجين/g,'بحاجة إلى').replace(/شاهدتِها/g,'تمت مشاهدتها').replace(/شاهدتِه/g,'تمت مشاهدته').replace(/زرتِها/g,'تمت زيارتها').replace(/تشاهدي/g,'تتم مشاهدة').replace(/تفتحينها/g,'يتم فتحها').replace(/احتجتِ/g,'كانت هناك حاجة إلى').replace(/ستعودين/g,'يمكن العودة').replace(/وتتحققين/g,'والتحقق').replace(/تجدين/g,'تتوفر').replace(/تصلين/g,'حتى الوصول').replace(/تختارينها/g,'قابلة للاختيار').replace(/لتعودي/g,'للعودة').replace(/شئتِ/g,'تريد').replace(/كضيفة/g,'كضيف').replace(/عميلة Monarca/g,'مستخدم Monarca').replace(/مستخدمات المتجر/g,'مستخدمي المتجر');
 return s.replace(/[\u0621-\u064a\u064b-\u065f\u0670]+/g,t=>neutralWords[t]||(t[0]==='و'&&neutralWords[t.slice(1)]?'و'+neutralWords[t.slice(1)]:t));
}
const dictionary=Object.create(null);
function add(lines){for(const line of lines.trim().split('\n')){const at=line.indexOf('|');if(at<1)continue;const ar=line.slice(0,at).trim(),en=line.slice(at+1).trim();dictionary[normalize(ar)]=en;dictionary[normalize(neutral(ar))]=en;dictionary[normalize(western(ar))]=en;dictionary[normalize(western(neutral(ar)))]=en;}}
add(`
التنقل الرئيسي|Main navigation
الرئيسية|Home
القائمة|Menu
فتح القائمة|Open menu
القائمة الرئيسية|Main menu
الأقسام|Categories
الأقسام الرئيسية|Main categories
المفضلة|Wishlist
السلة|Bag
حقيبة التسوّق|Shopping bag
حسابي|My account
الحساب|Account
الطلبات|Orders
طلباتي|My orders
الإعدادات|Settings
اللغة والمنطقة|Language and region
اللغة|Language
العربية|العربية
اللغة الحالية|Current language
اختيار لغة التطبيق|Choose app language
تغيير اللغة لا يغيّر العملة أو بلد التوصيل.|Changing the language keeps the same currency and delivery country.
تم تغيير اللغة|Language updated
العربية · العراق|Arabic · Iraq
العربية · العراق · IQD|Arabic · Iraq · IQD
العراق|Iraq
بلد التوصيل|Delivery country
عملة العرض والدفع التجريبي|Display and demo payment currency
الدينار العراقي|Iraqi dinar
رجوع|Back
العودة|Back
إغلاق|Close
إلغاء|Cancel
حذف|Delete
إضافة|Add
تعديل|Edit
إدارة|Manage
بحث|Search
البحث|Search
مسح|Clear
تطبيق|Apply
عرض الكل|View all
الكل|All
جديد|New
اختياري|Optional
بدون تحديد|Not specified
الافتراضي|Default
الافتراضية|Default
تعيين كافتراضي|Set as default
تعيين كعنوان افتراضي|Set as default address
بيانات عرض|Demo data
مثال توضيحي|Demo example
تفاصيل الطلب|Order details
تفاصيل القطعة|Item details
كل التفاصيل بوضوح|Every detail, clearly
وضوح في كل خطوة|Clarity at every step
كل اختياراتك، في مكان واحد.|All your choices in one place.
اختياراتك في مكان واحد|Your choices in one place
اختيارات بعناية|Carefully selected
أناقة خالدة|Timeless elegance
مجموعة أناقة خالدة|Timeless elegance collection
تفاصيل صغيرة تصنع فرقاً كبيراً|Small details make a big difference
تسوّق الآن|Shop now
إضافة إلى السلة|Add to bag
أضيفي إلى السلة|Add to bag
أضيفي للسلة|Add to bag
شراء الآن|Buy now
الشراء الآن|Buy now
متابعة التسوق|Continue shopping
مواصلة التسوق|Continue shopping
متابعة التسوق كضيفة|Continue as guest
ابدأ التسوق|Start shopping
ابدئي التسوق|Start shopping
تسوّق بثقة|Shop with confidence
التوصيل إلى جميع أنحاء العراق|Delivery across Iraq
توصيل داخل العراق|Delivery within Iraq
التوصيل داخل العراق|Delivery within Iraq
التوصيل إلى|Deliver to
منتجات مختارة|Selected pieces
اكتشفي أكثر|Discover more
اكتشفي الأقسام|Explore categories
اكتشفي القطع|Discover pieces
اكتشفي جميع القطع|Explore all pieces
اكتشفي الترتيب|View the ranking
البحث عن المنتجات|Search products
القائمة والأقسام|Menu and categories
البحث بالصورة|Search by photo
أعجبتك قطعة في صورة؟|Seen a piece you love?
قطعة أعجبتك في صورة؟|Seen a piece you love?
ابحثي عن قطع مشابهة|Find similar pieces
اعثر على قطع مشابهة|Find similar pieces
إلهام من صورتك|Inspired by your photo
صورتك، بداية الإلهام.|Your photo. A starting point.
ابحثي عن إلهامك|Find your inspiration
ابحثي عن قطعة أو مجموعة|Search for a piece or collection
اسم القطعة أو نوعها|Item name or type
حقيبة بنية، قميص، أحذية…|Brown bag, shirt, shoes…
الخامة، القصّة، اللون، وطريقة التنسيق…|Fabric, fit, colour and styling…
آخر ما شاهدتِه|Recently viewed
شاهدتِها مؤخراً|Recently viewed
سجل البحث|Search history
مسح سجل البحث|Clear search history
عمليات البحث الأخيرة|Recent searches
عمليات بحث شائعة|Popular searches
عمليات البحث الشائعة|Popular searches
بحث شائع|Popular search
نتائج البحث|Search results
تعديل البحث|Edit search
تنفيذ البحث|Search
جرّبي البحث عن|Try searching for
جميع القطع|All pieces
كل المجموعات|All collections
اكتشفي المجموعات|Explore collections
اكتشفي المجموعة|Explore the collection
اكتشفي مجموعات تناسب يومك.|Explore collections for every day.
استكشفي المجموعات|Explore collections
استكشفي المجموعة|Explore the collection
كل جديد، في مكانه|New pieces, thoughtfully placed
أسلوبكِ يبدأ من هنا.|Your style starts here.
اختاري قسماً، واكتشفي القطع التي تشبهكِ.|Choose a category and discover pieces that suit you.
تصفّحي حسب القسم|Browse by category
تصفّحي جميع القطع|Browse all pieces
تسوّقي حسب القسم|Shop by category
تسوّقي الملابس|Shop clothing
ملابس|Clothing
الملابس|Clothing
أحذية|Shoes
الأحذية|Shoes
حقائب|Bags
الحقائب|Bags
إكسسوارات|Accessories
الإكسسوارات|Accessories
أقراط|Earrings
جاكيتات|Jackets
قمصان وبلوزات|Shirts and blouses
بناطيل|Trousers
ملابس مريحة|Comfort wear
جاكيت|Jacket
قميص|Shirt
حقيبة|Bag
كعب|Heel
وقت الراحة|Time to relax
للمساء|Evening edit
أناقة كل يوم|Everyday elegance
راحة يومية|Everyday comfort
لمسة أخيرة|The finishing touch
اختيار الموسم|The seasonal edit
مختارات الموسم|Seasonal favourites
مختارات Monarca|The Monarca edit
عالم Monarca|World of Monarca
تنسيقات Monarca|Monarca looks
تنسيقات الموسم|Seasonal looks
إطلالة متكاملة، بطريقتكِ.|A complete look, your way.
إطلالات جاهزة للإلهام، وكل قطعة قابلة للتسوّق.|Looks to inspire you, with every piece available to explore.
إلهام للتنسيق من المجموعة التجريبية.|Styling inspiration from the demo collection.
اختيارات تتناسق معاً|Pieces that work together
أكملي الإطلالة|Complete the look
استكشفي التنسيقات|Explore the looks
تسوّقي قطع الإطلالة|Shop the look
اختاري كل قطعة لتحديد المقاس واللون قبل الإضافة. الأسعار والمواصفات بيانات عرض.|Open each piece to select its size and colour before adding it. Prices and specifications are demo data.
اختاري القطعة لتحديد اللون والمقاس.|Open a piece to choose its colour and size.
قطـع منتقاة لتعكس أسلوبك|Selected pieces to reflect your style
قطع منتقاة لتعكس أسلوبك|Selected pieces to reflect your style
العروض والمجموعات|Offers and collections
العروض والمختارات|Offers and edits
العروض|Offers
أسعار مختارة|Selected prices
أكبر توفير|Biggest savings
سعر خاص|Special price
إصدار محدود|Limited edition
الأكثر طلباً|Bestsellers
القطع الأكثر اختياراً|Most chosen pieces
ترتيب توضيحي من طلبات النسخة التجريبية|Demo ranking based on prototype orders
بحسب عدد القطع في الطلبات المدفوعة غير الملغاة على هذا الجهاز. هذا ليس إحصاءً حقيقياً لكل مستخدمات المتجر.|Based on quantities in paid, non-cancelled orders on this device. This does not represent store-wide sales.
إجمالي القطع المعروضة|Total pieces shown
اكتشفي الترتيب|View the ranking
ترتيب المنتجات|Sort products
التصفية|Filters
تصفية حسب القسم|Filter by category
مسح الفلاتر|Clear filters
مسح التصفية|Clear filters
مسح الكل|Clear all
إزالة الفلاتر|Clear filters
موصى بها|Recommended
الأحدث|Newest
السعر: الأقل أولاً|Price: low to high
السعر: الأعلى أولاً|Price: high to low
الفئة|Category
القسم|Category
نوع القطعة|Item type
اختاري نوع القطعة|Choose an item type
اللون|Colour
المقاس|Size
السعر|Price
السعر الأدنى|Minimum price
السعر الأعلى|Maximum price
مقاس موحّد|One size
المقاسات الدولية|International sizes
المقاسات الأوروبية|European sizes
أسود|Black
بني|Brown
عاجي|Ivory
ذهبي|Gold
زيتي|Olive
رمادي دافئ|Warm taupe
حقيبة جلد طبيعي|Natural leather bag
حذاء بكعب أنيق|Classic heel
قميص حرير كلاسيكي|Classic silk shirt
هودي بقصّة مريحة|Relaxed hoodie
جاكيت صوف فاخر|Belted wool jacket
بنطال رسمي أنيق|Tailored trousers
أقراط ذهبية بتفاصيل ناعمة|Delicate gold earrings
حقيبة كتف بإطلالة كلاسيكية|Classic shoulder bag
كعب كلاسيكي للمناسبات|Occasion heel
قميص ساتان بقصّة ناعمة|Soft-cut satin shirt
هودي يومي بقصّة واسعة|Everyday oversized hoodie
جاكيت بحزام لإطلالة المساء|Belted evening jacket
بنطال واسع للعمل واليوم|Wide-leg everyday trousers
أقراط لمسة المساء|Evening earrings
جلد بتفاصيل أنيقة|Leather with refined details
راحة ترافق كل خطوة|Comfort with every step
حرير بلمسة ناعمة|Soft-touch silk
قطن ناعم · قصّة واسعة|Soft cotton · relaxed fit
صوف ناعم · بني عميق|Soft wool · deep brown
قصّة انسيابية · بيج دافئ|Fluid cut · warm beige
إكسسوارات تكمل إطلالتك|Accessories to complete your look
ساتان بلمسة ناعمة|Soft-touch satin
الخامة والعناية|Material and care
وصف القطعة|Description
عن القطعة|About this piece
التوصيل والاستبدال|Delivery and exchanges
دليل المقاسات|Size guide
اختاري المقاس|Choose a size
اختاري المقاس بثقة.|Choose your size with confidence.
اسألي عن المقاس|Ask about sizing
اسألي عن هذه القطعة|Ask about this piece
تعديل اللون والمقاس|Edit colour and size
تفصيل الصورة|Photo detail
اضغطي للتكبير|Tap to enlarge
عرض كامل + قصّة مكبّرة|Full view and close-up
صورة أخرى|Another photo
الصور للون المرجعي؛ الألوان الأخرى موضحة بعينة اللون.|Photos show the reference colour; other colours are shown as swatches.
عن صور ومعلومات المنتج|About product photos and details
قد يختلف اللون باختلاف الشاشة والإضاءة. صورة هذه القطعة من مرجع العميل. الألوان الإضافية ممثلة بعينات لونية، وتُعتمد صور المورد قبل البيع.|Colour may vary with screens and lighting. This image comes from the client reference. Additional colours use swatches; supplier photos must be confirmed before sale.
قد يختلف اللون باختلاف الشاشة والإضاءة. صورة هذه القطعة مولّدة بالذكاء الاصطناعي لعرض النموذج، وليست تصويراً لمنتج فعلي موثّق. الألوان الإضافية ممثلة بعينات لونية، وتُعتمد صور المورد قبل البيع.|Colour may vary with screens and lighting. This is an AI-generated prototype image rather than a verified product photo. Additional colours use swatches; supplier photos must be confirmed before sale.
مجموعة عرض توضيحية · صور من مرجع العميل، وصور عرض مولّدة بالذكاء الاصطناعي للأحذية والأقراط.|Demo collection · client reference images with AI-generated shoe and earring images.
اختيار جميل.|A lovely choice.
مشاركة القطعة|Share this piece
إضافة إلى المفضلة|Add to wishlist
إزالة من المفضلة|Remove from wishlist
قطع تحتفظين بها لوقتٍ جميل.|Save pieces for another day.
قطع اخترتِها بعناية|Your carefully chosen pieces
المفضلة محفوظة محلياً في النسخة التجريبية.|Your wishlist is saved on this device in the prototype.
المحفوظة لوقت لاحق|Saved for later
لا توجد قطع محفوظة|No saved pieces
يمكنك نقل القطع من الحقيبة إلى هنا والعودة إليها لاحقاً.|Move pieces here from your bag and return to them later.
مشاهدة جميع القطع|Explore all pieces
نقل للمفضلة|Move to wishlist
العودة إلى القطعة|Back to item
القطعة غير موجودة|Item not found
هذه القطعة غير متاحة|This piece is unavailable
يمكنك العودة لاكتشاف المجموعة.|Return to explore the collection.
إضافة وتعديل عناوينك|Add and edit your addresses
الكمية|Quantity
زيادة الكمية|Increase quantity
تقليل الكمية|Decrease quantity
تحديد الكل|Select all
إزالة القسيمة|Remove coupon
تطبيق على الطلب|Apply to order
المجموع الفرعي|Subtotal
الخصم|Discount
خصم الطلب|Order discount
خصم القسيمة|Coupon discount
رسوم التوصيل|Delivery fee
رسوم التوصيل الأصلية|Original delivery fee
الإجمالي|Total
إجمالي الطلب|Order total
الإجمالي المستحق|Total due
الإجمالي المدفوع|Total paid
مجاناً|Free
مجموع القطع|Items total
القطع في طلبك|Items in your order
القطع المختارة|Selected items
القطع المطلوبة|Items ordered
لا تُضمّن في هذا الطلب|Excluded from this order
يتم احتساب القطع المحددة فقط. القطع غير المحددة تبقى في الحقيبة بعد الشراء.|Only selected items count towards this order. Unselected items stay in your bag after checkout.
موعد وطريقة التوصيل|Delivery timing and method
خيارات التوصيل|Delivery options
طريقة التوصيل|Delivery method
التوصيل القياسي|Standard delivery
التوصيل العادي|Standard delivery
التوصيل القياسي داخل العراق|Standard delivery in Iraq
التوصيل السريع|Express delivery
الإجمالي يتحدث فور تغيير طريقة التوصيل، مع الحفاظ على القطع والقسيمة والعنوان.|The total updates when you change delivery method, keeping your items, coupon and address.
التوصيل القياسي مجاني تلقائياً للطلبات من ١٠٠٬٠٠٠ د.ع قبل الخصم، ولا يحتاج قسيمة. تضاف ٥٬٠٠٠ د.ع عند اختيار التوصيل السريع.|Standard delivery is automatically free from 100,000 IQD before discounts, with no coupon needed. Express delivery adds 5,000 IQD.
إتمام الطلب|Checkout
العنوان والتوصيل والدفع في صفحة واحدة.|Address, delivery and payment on one page.
مراجعة الطلب|Review order
العودة لإتمام الطلب|Back to checkout
العودة إلى طلباتي|Back to my orders
إكمال الدفع|Complete payment
إكمال الدفع بالبطاقة|Complete card payment
تأكيد الطلب|Confirm order
تأكيد الطلب التجريبي|Confirm demo order
مراجعة وموافقة|Review and confirm
تأكيد الطلب والشحن والتسليم.|Order confirmation, shipping and delivery.
تقديم الطلب|Submit request
العنوان|Address
المراجعة|Review
البطاقة|Card
الدفع|Payment
التحقق|Verification
عنوان جديد|New address
اختيار عنوان محفوظ|Choose saved address
عنوان التوصيل|Delivery address
عناوين التوصيل|Delivery addresses
عنوان الاستلام|Collection address
دفتر العناوين|Address book
إدارة عناوين التوصيل|Manage delivery addresses
احفظي عنوان المنزل أو العمل، واختاري العنوان المناسب لكل طلب.|Save home or work addresses and choose one for each order.
عناوين التوصيل والنقاط الدالة|Delivery addresses and landmarks
إضافة عنوان جديد|Add new address
إضافة عنوان|Add address
عنوان آخر|Other address
تسمية العنوان|Address label
المنزل|Home
العمل|Work
الاسم الكامل|Full name
الاسم واسم العائلة|First and last name
اسم المستلم الكامل *|Recipient full name *
رقم الهاتف العراقي *|Iraqi phone number *
رقم الهاتف العراقي|Iraqi phone number
رقم الهاتف|Phone number
رقم الهاتف الدولي +964|International phone number +964
مدينة / منطقة التوصيل *|Iraqi delivery region *
المدينة / القضاء / الناحية *|City / district / subdistrict *
المنطقة / الحي *|Area / neighbourhood *
الشارع *|Street *
اسم الشارع|Street name
أقرب نقطة دالة *|Nearest landmark *
رقم المبنى|Building number
الطابق / الشقة|Floor / apartment
تفاصيل إضافية لتسهيل الوصول|Extra directions
ملاحظات للمندوب|Courier notes
ملاحظات التسليم (اختياري)|Delivery notes (optional)
ملاحظات الطلب (اختياري)|Order notes (optional)
تعبئة عنوان تجريبي|Fill demo address
حفظ العنوان|Save address
حفظ واستخدام للطلب|Save and use for order
تفاصيل واضحة تساعد في توصيل اختياراتك. الحقول بعلامة * مطلوبة.|Clear details help deliver your order. Fields marked * are required.
اكتبي المدينة أو القضاء أو الناحية|Enter the city, district or subdistrict
مثال: المنصور|e.g. Al Mansour
مثال: سارة أحمد|e.g. Sara Ahmed
مثال: قرب مول المنصور|e.g. near Al Mansour Mall
استخدمي بيانات وهمية خلال مراجعة النموذج. العناوين محفوظة على هذا الجهاز فقط.|Use fictional details while reviewing this prototype. Addresses are saved on this device only.
منطقة مرجعية لحساب رسوم العرض؛ حدّدي موقعك الفعلي أدناه.|Iraqi reference region for demo delivery fees; enter your actual locality below.
منطقة التوصيل والمدينة أو القضاء والحي والشارع والنقطة الدالة مطلوبة لتوضيح تجربة إعداد عنوان عراقي. لا تُرسل العناوين إلى شركة شحن.|The Iraqi delivery region, city or district, neighbourhood, street and landmark are required for this demo. Addresses are not sent to a courier.
تحتاجين مساعدة في كتابة عنوان التوصيل؟|Need help entering your delivery address?
اختاري المدينة لتجربة التوصيل|Choose an Iraqi delivery region
اختاري منطقة التوصيل|Choose an Iraqi delivery region
اختاري منطقة التوصيل، ثم اكتبي المدينة أو القضاء أو الناحية في دفتر العناوين. للتجربة: بغداد ٥٬٠٠٠ د.ع، باقي المدن ٧٬٠٠٠ د.ع، والتوصيل القياسي مجاني تلقائياً من ١٠٠٬٠٠٠ د.ع قبل الخصم؛ تضاف ٥٬٠٠٠ د.ع للتوصيل السريع. مناطق الخدمة الفعلية تُعتمد قبل الإطلاق.|Choose an Iraqi delivery region, then enter your city, district or subdistrict in the address book. Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD. Standard delivery is free from 100,000 IQD before discounts; express adds 5,000 IQD. Actual service coverage must be confirmed before launch.
الاسم، رقم هاتف عراقي، المحافظة، الحي، الشارع، وأقرب نقطة دالة. يمكن إضافة البناية والطابق وملاحظات للسائق. يُفضّل تأكيد العنوان قبل الدفع.|Enter a name, Iraqi phone number, region, neighbourhood, street and nearest landmark. Building, floor and courier notes are optional. Review the address before payment.
حفظ التغييرات|Save changes
الدفع عند الاستلام|Cash on delivery
متوفر في المتجر · مخزون تجريبي|In stock · demo inventory
طلب مسبق · مخزون تجريبي|Preorder · demo inventory
متاح لقطع المتجر المتوفرة فقط.|Available for in-stock items only.
الدفع عند الاستلام غير متاح لأن الطلب يحتوي على قطع بطلب مسبق. يمكن الدفع ببطاقة الاختبار.|Cash on delivery is unavailable because this order includes preorder items. Use a test card to continue.
الدفع عند الاستلام متاح لهذا الطلب.|Cash on delivery is available for this order.
المبلغ المستحق عند الاستلام|Amount due on delivery
المدفوع تجريبياً|Demo amount paid
محاكاة رفض البطاقة|Simulate card decline
لن تُرسل رسالة أو شحنة ولن يُخصم أي مبلغ.|No message or shipment is sent and no money is charged.
لم يُحصّل أي مبلغ نقدي.|No cash has been collected.
إلغاء الطلب لا ينشئ استرداداً لأن المبلغ لم يُحصّل.|Cancelling this order creates no refund because payment was not collected.
بانتظار التحصيل عند الاستلام|Payment due on delivery
لا يوجد مبلغ محصّل للاسترداد|No collected payment to refund
وسيلة الدفع|Payment method
طريقة الدفع|Payment method
الدفع بالبطاقة|Card payment
Visa و Mastercard · بطاقات اختبار فقط|Visa and Mastercard · test cards only
Visa · اختبار|Visa · test
بطاقات اختبار فقط|Test cards only
بطاقة اختبار فقط. لا يوجد خصم حقيقي، ولا يُحفظ رقم البطاقة أو CVV.|Test cards only. No real charge is made; card numbers and CVV are not saved.
محاكاة آمنة · لا يُخصم أي مبلغ|Safe simulation · no money is charged
دفع تجريبي آمن|Safe demo payment
بيانات محفوظة عند إنشاء الطلب. لا يحتفظ النموذج برقم البطاقة الكامل أو رمز الأمان.|Details are saved when the order is created. The prototype never stores the full card number or security code.
تُحفظ البطاقة كمعرّف اختبار ونوعها وآخر ٤ أرقام فقط. الطلبات والتغييرات والإلغاءات تبقى داخل هذا المتصفح.|Only a test token, card network and last four digits are saved. Orders, edits and cancellations stay in this browser.
هذه نسخة تصميم. تقبل أرقام الاختبار أدناه فقط، ولا تحفظ رقم البطاقة أو رمز CVV.|This design prototype accepts only the test numbers below. Card numbers and CVV are not saved.
اسم حامل البطاقة *|Cardholder name *
رقم بطاقة الاختبار *|Test card number *
تاريخ الانتهاء *|Expiry date *
CVV التجريبي *|Test CVV *
الانتهاء 12/30 · CVV 123|Expiry 12/30 · CVV 123
حفظ بطاقة الاختبار المختصرة|Save test card summary
تعبئة بيانات الاختبار|Fill test details
تجربة نوع بطاقة آخر|Try another card network
التحقق من الدفع|Payment verification
التحقق ومتابعة الدفع|Verify and continue payment
هذه شاشة تحقق تجريبية، وليست رسالة من بنك حقيقي. لم يُرسل أي رمز عبر SMS.|This is a demo verification screen. No bank message or SMS has been sent.
جارٍ محاكاة المعالجة|Simulating processing
محاكاة معالجة البطاقة|Simulate card processing
تم تأكيد دفعة الاختبار وحفظ الطلب.|The test payment is confirmed and the order saved.
لم يكتمل الدفع.|Payment was not completed.
لم يتم الدفع|Unpaid
مدفوع تجريبياً|Paid in demo
غير مدفوع|Unpaid
لم يتم إنشاء عملية ناجحة|No successful transaction
لم نجد طلب الدفع|Payment order not found
تعذّر الدفع|Payment failed
تم رفض المعاملة التجريبية. استخدمي بيانات بطاقة الاختبار ثم أعيدي المحاولة.|The demo transaction was declined. Use the test card details and try again.
لم يتم خصم أي مبلغ في هذه التجربة. طلبك وبيانات التوصيل محفوظة، ويمكنك المحاولة مجدداً.|No money was charged. Your order and delivery details are saved, so you can try again.
إعادة المحاولة بنفس الطلب|Retry this order
لم تجد الطلب|Order not found
لم نجد الطلب|Order not found
لم يتم العثور على الطلب|Order not found
قد يكون الرابط قديماً أو تم مسح بيانات التجربة. افتحي قائمة طلباتك لاختيار طلب موجود.|This link may be old or the demo data may have been cleared. Open your orders to select an existing order.
ربما مُسحت بيانات التجربة. يمكنك إنشاء طلب جديد.|The demo data may have been cleared. You can create a new order.
تم تأكيد الطلب|Order confirmed
تم تأكيد الطلب.|Order confirmed.
تم تأكيد الطلب التوضيحي|Demo order confirmed
تم تأكيد طلبك|Your order is confirmed
تم تأكيد الدفع وتجهيز طلبك للمتجر.|Payment is confirmed and your order is ready for the store.
خطوة أقرب لاكتمال طلبك.|One step closer to your order.
كل اختياراتك، في مكان واحد.|All your choices in one place.
الذهاب إلى طلباتي|Go to my orders
تتبّع الطلب|Track order
متابعة تفاصيل الطلب|View order details
عرض تفاصيل الطلب|View order details
عرض الطلب|View order
إيصال الطلب|Order receipt
عرض إيصال الطلب|View order receipt
طباعة الإيصال / حفظ PDF|Print receipt / save PDF
ORDER RECEIPT · إيصال طلب تجريبي|ORDER RECEIPT · Demo order receipt
نسخة عرض · غير صالحة كفاتورة ضريبية|Demo copy · not a tax invoice
المبالغ بالدينار العراقي IQD. الإيصال يطابق بيانات الطلب لحظة الشراء ولا يمثّل عملية مالية أو فاتورة ضريبية. هذه محاكاة لشرح تجربة التسوق. لا يوجد شحن أو خصم أو استرداد مالي حقيقي.|Amounts are in Iraqi dinars (IQD). This receipt reflects the order snapshot and is neither a financial transaction nor a tax invoice. No real shipment, charge or refund takes place.
الطلب|Order
الطلب الأصلي|Original order
رقم الطلب|Order number
رقم العملية|Transaction number
قيمة العملية|Transaction amount
مرجع الدفع|Payment reference
شبكة البطاقة|Card network
وقت الدفع|Payment time
وقت الإنشاء|Created
تاريخ الإنشاء|Created
تاريخ التأكيد|Confirmed
الحالة|Status
حالة الطلب|Order status
حالة الطلبات|Order statuses
حالة الأموال|Payment status
التاريخ|Date
البحث في الطلبات|Search orders
رقم الطلب أو اسم القطعة|Order number or item name
كل الطلبات|All orders
المكتملة|Completed
الملغاة|Cancelled
بانتظار الدفع|Awaiting payment
بانتظار إكمال الدفع|Awaiting payment completion
قيد التجهيز|Preparing
في الطريق|On the way
مكتملة|Completed
ملغى|Cancelled
ملغاة|Cancelled
تم إلغاء الطلب|Order cancelled
تم التسليم|Delivered
تم التسليم · تجربة توضيحية|Delivered · demo
التجهيز|Preparation
الشحن|Shipping
التوصيل|Delivery
تابعي الدفع والتجهيز والتوصيل، وأديري طلباتك بسهولة.|Follow payment, preparation and delivery, and manage your orders easily.
تظهر الطلبات المحفوظة على هذا الجهاز، بما فيها طلبات العرض.|Shows orders saved on this device, including sample orders.
لا توجد عملية دفع أو شحن حقيقية. كل الحالات في هذه النسخة للمراجعة التفاعلية.|No real payment or shipment takes place. Every status is for interactive review.
تجهيز القطع|Preparing items
تجري مراجعة القطع والتغليف قبل الشحن.|Items and packaging are checked before shipping.
تم تسليم الطلب إلى شركة التوصيل.|The order was handed to the courier.
الشحنة في الطريق|Shipment on the way
وصلت القطع إلى عنوان التوصيل.|The items reached the delivery address.
اكتملت مراحل هذا الطلب التوضيحي.|All stages of this demo order are complete.
إعادة شراء القطع المتوفرة|Buy available items again
إلغاء الطلب|Cancel order
تتبّع الشحنة|Track shipment
معلومات الشحنة|Shipment information
شركة التوصيل|Courier
رقم التتبّع|Tracking number
Monarca Delivery · نموذج تجريبي|Monarca Delivery · demo
إعادة تحديد موعد التسليم|Reschedule delivery
تغييرات محلية لا تتصل بشركة توصيل.|Local changes do not contact a courier.
أدوات عرض التتبّع|Tracking demo tools
محاكاة المرحلة التالية|Simulate next stage
محاكاة تعذّر التسليم|Simulate failed delivery
مرحلة من الطلب التوضيحي|Demo order stage
اكتمال المحاكاة|Simulation complete
بانتظار اكتمال المرحلة السابقة|Waiting for previous stage
بانتظار المرحلة السابقة|Waiting for previous stage
العودة إلى طلب الخدمة|Back to service request
خدمات ما بعد البيع|After-sales services
طلبات ما بعد البيع|After-sales requests
طلبات الخدمة|Service requests
طلب الخدمة|Service request
نوع الخدمة|Service type
إرجاع أو استبدال|Return or exchange
الإرجاع والاستبدال|Returns and exchanges
الإرجاع والاسترداد|Returns and refunds
الإلغاء والإرجاع والاسترداد|Cancellation, returns and refunds
الإرجاع والإلغاء|Returns and cancellation
الإرجاع|Returns
طلب إرجاع|Request return
عرض طلب الإرجاع|View return request
إلغاء طلب الخدمة|Cancel service request
طلبات الإرجاع وحالات المعالجة|Return requests and processing
إرجاع قطع بعد الفحص|Return items after inspection
إعادة القطعة للمتجر|Return item to store
القطع في طلب الخدمة|Items in service request
السبب|Reason
القطعة|Item
القطعة / التفاصيل|Item / details
القيمة|Amount
المبلغ المطلوب|Requested amount
قيمة القطع بعد توزيع الخصم|Item value after allocated discount
تفاصيل الإرجاع|Return details
طلب جديد|New request
لا توجد حركة مالية حقيقية|No real money moves
تُتاح طلبات الإرجاع والاستبدال بعد تسليم الطلب. يمكنك متابعة الشحن أو التواصل مع الدعم.|Returns and exchanges become available after delivery. You can track shipping or contact support.
كل القطع المؤهلة مرتبطة بطلبات خدمة سابقة. افتحي الطلبات الحالية لمتابعتها؛ إلغاء طلب لم يُرسل يعيد إتاحة كميته.|All eligible items are linked to earlier service requests. Open existing requests to follow them. Cancelling an unsent request makes its quantity available again.
راجعي قائمة الإرجاع والاستبدال.|Open the returns and exchanges list.
افتحي قائمة الإرجاع والاستبدال لعرض الطلبات المتاحة.|Open returns and exchanges to see available requests.
شحن القطع المرتجعة|Return shipping
طريقة إعادة القطع *|Return method *
مندوب المتجر|Store courier
شركة توصيل أخرى|Other courier
تسليم إلى نقطة يحددها المتجر|Drop off at a store-designated location
اسم شركة التوصيل (إن وجدت)|Courier name (if applicable)
اسم الشركة أو المندوب|Company or courier name
رقم بوليصة الإرجاع أو رمز الاستلام *|Return tracking or collection code *
مثال تجريبي: RET-1042|Demo example: RET-1042
أي معلومات تساعد على متابعة القطع المرتجعة|Any details that help track the returned items
بعد ترتيب الاستلام مع المتجر، أضيفي معلومات إعادة القطع. لا يطلب هذا النموذج مندوباً ولا ينشئ شحنة فعلية.|After arranging collection with the store, enter return details. This prototype does not book a courier or create a shipment.
تسجيل شحنة إرجاع القطع|Register return shipment
تسجيل شحنة الإرجاع التجريبية|Register demo return shipment
استلام وفحص القطعة|Receive and inspect item
المقاس غير مناسب|Size does not fit
تمت الموافقة|Approved
قيد المعالجة|Processing
مرفوض|Declined
أؤكد تسجيل تسليم القطع ضمن تجربة العرض فقط.|I confirm this records an item handover for the demo only.
تقدّم محلي بين المراحل لشرح سير العمل دون إرسال أو استرداد حقيقي.|Advance through local stages to explain the flow without a real shipment or refund.
أداة عرض خدمة ما بعد البيع|After-sales demo tool
الاستردادات|Refunds
الاستردادات التجريبية|Demo refunds
سجل الاستردادات|Refund history
سجّل الاستردادات|Refund history
استرداد الإرجاع|Return refund
استرداد تجريبي إلى البطاقة الأصلية|Demo refund to original card
تفاصيل الاسترداد|Refund details
مرجع الاسترداد|Refund reference
قيمة الاسترداد التجريبي|Demo refund amount
الجهة المستقبلة|Recipient
طريقة الاسترداد|Refund method
البطاقة الأصلية المستخدمة في الشراء|Original purchase card
البطاقة الأصلية|Original card
متابعة المبالغ التجريبية|Track demo amounts
مبالغك، بتفاصيل واضحة.|Your amounts, clearly explained.
معالجة الاسترداد التجريبي|Demo refund processing
تم تسجيل طلب الاسترداد|Refund request recorded
اكتملت محاكاة الاسترداد|Refund simulation complete
أداة عرض الاسترداد|Refund demo tool
هذا سجل محاكاة فقط. إكمال الحالة لا يعني تنفيذ استرداد أو وصول أموال إلى بطاقة حقيقية.|This is a simulation record. Completing a status does not issue a refund or transfer money to a real card.
هذه محاكاة فقط. لم يُرسل استرداد إلى بنك، ولم تصل أموال إلى بطاقة حقيقية. اكتمال المراحل يوضّح تجربة المستخدم.|This is a simulation. No refund was sent to a bank or credited to a real card. Completed stages illustrate the user experience.
هذه محاكاة لشرح تجربة التسوق. لا يوجد شحن أو خصم أو استرداد مالي حقيقي.|A simulation of the shopping experience. No real shipment, charge or refund takes place.
تخضع القيمة للفحص والموافقة في المتجر الفعلي. جميع مراحل هذا النموذج محاكاة ولا تثبت وصول أموال.|Actual refunds depend on store inspection and approval. Every stage here is a simulation and is not proof of payment.
افتحي قائمة الاستردادات لعرض السجلات المتاحة.|Open refunds to see available records.
لم يتم العثور على السجل|Record not found
لم يتم العثور على طلب الخدمة|Service request not found
راجعي طلباتك.|Open your orders.
اختاري الطلب من قائمة الطلبات.|Choose an order from your orders list.
لتوضيح معالجة الحالة محلياً فقط.|Illustrates local status processing only.
مؤكد|Confirmed
اكتملت|Completed
رقم توضيحي ·|Demo number ·
الاسم وبيانات التواصل|Name and contact details
الملف الشخصي|Profile
الاسم وبيانات التواصل|Name and contact details
تفاصيلك|Your details
تفاصيل تجعل التجربة لكِ|Details that make it yours
عدّلي بياناتك في أي وقت.|Edit your details at any time.
البريد الإلكتروني|Email
تاريخ الميلاد|Date of birth
تفضيل التسوّق|Shopping preference
نسائي|Womenswear
رجالي|Menswear
الحقول الاختيارية لا تؤثر في إكمال طلبك. لا تتم مشاركة هذه البيانات مع أي جهة في النموذج.|Optional fields do not affect checkout. This prototype shares none of these details with others.
رقم مسجّل في هذه التجربة. لتغييره استخدمي إعدادات الأمان.|The phone number registered for this demo. Change it in security settings.
تعديل الملف الشخصي|Edit profile
مراجعة وتعديل الملف|Review and edit profile
حالة الحساب|Account status
حالة الجلسة|Session status
تم الدخول التجريبي|Demo signed in
دخول|Sign in
تسجيل الدخول|Sign in
تسجيل دخول تجريبي|Demo sign-in
أهلاً بكِ في Monarca|Welcome to Monarca
مرحباً بكِ|Welcome
مساحة لكل ما تحبين|A space for everything you love
سجّلي دخولك لتكتمل تفاصيلك|Sign in to save your details
احفظي تفاصيلك وتابعي طلباتك من حساب واحد على هذا الجهاز.|Save your details and follow your orders in one account on this device.
دخول برقم عراقي ورمز تحقق تجريبي.|Sign in with an Iraqi number and a demo code.
متابعة برقم الهاتف|Continue with phone
لن نرسل SMS أو نتصل برقمك. يمكنك استخدام 07700000000 للتجربة.|No SMS or call is sent. You can use 07700000000 for the demo.
يمكنك إدخال الرقم بصيغة 07 أو +964.|Enter a number starting with 07 or +964.
رمز التحقق|Verification code
رمز التحقق التجريبي|Demo verification code
تأكيد الرمز|Confirm code
إعادة إرسال رمز تجريبي|Resend demo code
تغيير رقم الهاتف|Change phone number
تغيير رقم الهاتف وسجل الدخول|Change phone number and view sign-in activity
الرقم والجلسة التجريبية|Phone and demo session
الدخول والأمان|Sign-in and security
نشاط الدخول على هذا الجهاز|Sign-in activity on this device
لا يوجد نشاط دخول تجريبي محفوظ بعد.|No demo sign-in activity saved yet.
لا تتطلب التجربة كلمة مرور، ولا تُجرى أي عملية تحقق فعلية من ملكية رقم الهاتف.|No password is needed and ownership of the phone number is not actually verified.
لا تمثل الجلسة تحققاً حقيقياً من الهوية. لا توجد كلمات مرور أو جلسات على خادم، والرمز المعروض للشرح فقط.|This session does not verify identity. There are no passwords or server sessions; the shown code is for demonstration.
لا يتم إرسال SMS في النموذج. بعد إدخال رقم عراقي صحيح استخدمي الرمز 1234. يمكنك إعادة تجهيز الرمز بعد انتهاء العداد. يمتد الرمز التجريبي لمدة ٥ دقائق.|The prototype sends no SMS. Enter a valid Iraqi number, then use 1234. Request another demo code when the countdown ends. Codes last 5 minutes.
تسجيل الخروج|Sign out
تسجيل الخروج من هذه الجلسة|Sign out of this session
تاريخ التسجيل|Registered
البيانات الشخصية|Personal details
بطاقاتي|My cards
البطاقات المحفوظة|Saved cards
إضافة بطاقة اختبار|Add test card
حذف بطاقة الاختبار|Delete test card
بطاقة اختبار محفوظة|Saved test card
بطاقة جاهزة للتجربة|Card ready for demo
اختاري بطاقة اختبار لاستخدامها في عرض خطوات الدفع.|Choose a test card for the demo payment flow.
لا تدخلي أي رقم بطاقة حقيقي. نحفظ نوع البطاقة وآخر ٤ أرقام ومعرّفاً تجريبياً فقط، دون رقم البطاقة الكامل أو رمز الأمان.|Use test cards only. We save the card network, last four digits and a demo token; never the full number or security code.
إشعارات جديدة|New notifications
إشعارات التجربة|Demo notifications
الإشعارات|Notifications
عرض مركز الإشعارات|Open notifications
تفضيلات الإشعارات|Notification preferences
قراءة الكل|Mark all read
مقروء|Read
غير مقروء|Unread
الطلبات والعروض وأخبار المتجر|Orders, offers and store news
الطلبات والعروض وخدمة العملاء|Orders, offers and customer service
طلبات وعروض وخدمات|Orders, offers and services
الطلبات والعروض|Orders and offers
الخدمات|Services
تأكيد الطلب والشحن والتسليم.|Order confirmation, shipping and delivery.
القسائم والمختارات الجديدة.|Coupons and new edits.
الردود وتحديثات طلبات المساعدة.|Replies and support request updates.
هذه الإعدادات تتحكم في التفضيل المحفوظ داخل النموذج.|These settings control preferences saved in the prototype.
لا تُفعّل هذه الخيارات إشعارات النظام أو البريد أو SMS. سجل الإشعارات داخل التطبيق يبقى متاحاً لمراجعة أحداث التجربة.|These options do not enable system, email or SMS notifications. The in-app log remains available for reviewing demo events.
إشعارات داخل النموذج فقط. إعداداتك لا تفعّل إشعارات الجهاز أو الرسائل النصية.|Prototype notifications only. These settings do not enable device notifications or text messages.
وصلت اختياراتك|Your items have arrived
هدية لاختياراتك الأولى|A gift for your first choices
تفاصيل صغيرة، وتجربة أقرب إليك. تعرّفي على حسابك وخياراتك.|Small details, a more personal experience. Explore your account and options.
أكملي المدينة والعنوان والنقطة الدالة لتسهيل التوصيل.|Complete your city, address and landmark to help delivery.
احصلي على خصم ١٠٪ بالرمز M10 للطلبات من ٥٠٬٠٠٠ د.ع.|Get 10% off with M10 on orders from 50,000 IQD.
قسائم الخصم|Discount coupons
قسائم جاهزة|Ready coupons
قسائمك|Your coupons
مركز القسائم|Coupon centre
كيف تعمل قسائمك؟|How do your coupons work?
استلمي القسائم واستخدميها في السلة|Claim coupons and use them in your bag
استلمي قسيمة، أضيفي اختياراتك، ثم طبّقي الرمز قبل الدفع.|Claim a coupon, choose your items and apply the code before payment.
قَسيمة واحدة لكل طلب، ويُحسب الحد الأدنى على قيمة المنتجات قبل الخصم.|One coupon per order. Minimum spend is based on item value before discounts.
قسيمة واحدة لكل طلب. تتحدث الأهلية بحسب القطع المحددة.|One coupon per order. Eligibility updates for the selected items.
القسيمة تُعتبر مستخدمة بعد نجاح الدفع فقط. الطلب غير المدفوع لا يستهلكها.|A coupon is used only after successful payment. An unpaid order does not consume it.
تفاصيل ألطف لسلتك|A little extra for your bag
لمسة ترحيب|A welcome touch
خصم ١٠٪|10% off
خصم ١٠٪ على قيمة المنتجات|10% off item value
لديك رمز قسيمة؟|Have a coupon code?
رمز القسيمة|Coupon code
اختيار قسيمة|Choose coupon
استلام القسيمة|Claim coupon
استخدام في السلة|Use in bag
المتاحة|Available
متاحة للاستلام|Ready to claim
جاهزة للاستخدام|Ready to use
مستخدمة|Used
منتهية|Expired
M10 تخصم ١٠٪ من المنتجات المؤهلة من ٥٠٬٠٠٠ د.ع.|M10 takes 10% off eligible items from 50,000 IQD.
القسيمة المطبقة: M10|Applied coupon: M10
القسيمة: M10|Coupon: M10
التقدير عند الشراء|Estimate at checkout
قسائم وقواعد عرض قابلة للتجربة، وتحتاج اعتماد المتجر قبل الإطلاق.|Demo coupons and rules for testing; store approval is needed before launch.
الإعدادات|Settings
إعدادات التطبيق|App settings
إدارة البيانات والإعدادات|Data and settings
التفضيلات واللغة وإدارة البيانات|Preferences, language and data management
التفضيلات|Preferences
اضبطي تجربتك|Make it yours
إعدادات واضحة تناسب طريقة تسوّقك.|Clear settings for the way you shop.
إعادة ضبط بيانات التجربة|Reset demo data
إعادة ضبط جميع بيانات التجربة|Reset all demo data
إعادة ضبط التجربة|Reset demo
نعم، إعادة الضبط|Yes, reset
مسح الملفات المؤقتة|Clear temporary data
بياناتك محفوظة محلياً. مسح الملفات المؤقتة يزيل سجل البحث والتفضيلات المؤقتة، وتبقى السلة والطلبات والعناوين.|Data stays on this device. Clearing temporary data removes search history and temporary preferences; your bag, orders and addresses remain.
نسخة تفاعلية للعرض. تُحفظ بيانات التجربة في هذا المتصفح فقط، ولا تتم مزامنتها بين الأجهزة.|Interactive demo. Data is saved in this browser only and does not sync between devices.
إصدار النموذج 4.4|Prototype version 4.6
الدعم والتواصل|Support and contact
خدمة العملاء|Customer care
مركز العناية|Care centre
مركز المساعدة|Help centre
التواصل مع الدعم|Contact support
التواصل مع المساعدة|Contact help
التواصل مع العناية التجريبية|Contact demo care
تحدثي مع العناية التجريبية|Chat with demo care
مساعدة واضحة قبل الطلب وبعده.|Clear help before and after your order.
كل ما تحتاجينه قبل الطلب وبعده.|Everything you need before and after ordering.
كيف يمكننا مساعدتك؟|How can we help?
نحن هنا للمساعدة|We are here to help
نتابع معك كل التفاصيل.|We follow every detail with you.
اختاري الموضوع أو ابدئي محادثة، وستجدين كل التفاصيل في مكان واحد.|Choose a topic or start a conversation to keep every detail in one place.
أسئلة شائعة ومحادثات الدعم|FAQs and support conversations
البحث في المساعدة|Search help
ابحثي: الدفع، التوصيل، المقاسات...|Search: payment, delivery, sizing…
إجابات تريح بالك|Answers for peace of mind
إجابات سريعة|Quick answers
الأسئلة الشائعة|FAQs
كل الأسئلة|All questions
المنتجات والمقاسات|Products and sizing
الدفع والطلبات|Payment and orders
الدفع والبطاقات|Payment and cards
الخصوصية والحساب|Privacy and account
طلباتي في الدعم|My support requests
طلبات المساعدة|Support requests
طلب المساعدة|Support request
طلب مساعدة جديد|New support request
عرض طلبات المساعدة|View support requests
افتحي طلباً جديداً، أو تابعي محادثة سابقة من مركز العناية.|Open a new request or continue an earlier conversation from the care centre.
تابعي ردود العناية، واطّلعي على سجل طلباتك.|Follow care replies and view your request history.
تابعي ردود فريق العناية التجريبي|Follow demo care replies
كل محادثة، محفوظة|Every conversation, saved
محادثتك مع العناية|Your care conversation
اشرحي المشكلة وأضيفي رقم الطلب إن وجد، وستبقى المحادثة محفوظة على جهازك.|Describe the issue and add an order number if available. The conversation stays on your device.
اخبريـنا ما يهمّك|Tell us what matters
اختر الموضوع|Choose topic
الموضوع|Topic
عنوان الطلب|Request title
الرسالة|Message
رسالتك|Your message
أي تفاصيل تودين إضافتها|Any details you would like to add
اكتبي رسالتك...|Enter your message…
إرسال الرسالة|Send message
إرسال|Send
متابعة المحادثة|Continue conversation
لا تشاركي بيانات البطاقة أو رموز التحقق في الرسائل.|Keep card details and verification codes out of messages.
ردود آلية للتجربة · لا تُرسَل لأي موظف|Automated demo replies · not sent to staff
خدمة داخل التطبيق · محاكاة|In-app service · simulation
محادثة تجريبية داخل التطبيق|In-app demo conversation
محادثات تجريبية · لا اتصال بدعم فعلي|Demo conversations · no live support connection
لم نجد هذه المحادثة|Conversation not found
مفتوح|Open
مفتوحة|Open
تم حلّها|Resolved
تم حل المشكلة|Resolved
مفعّلة|Enabled
التواصل عبر واتساب|Contact via WhatsApp
Monarca على واتساب|Monarca on WhatsApp
معاينة التواصل عبر واتساب|Preview WhatsApp contact
معاينة فقط · يُفعّل الرابط بعد اعتماد رقم المتجر.|Preview only · the link activates once the store number is confirmed.
رقم توضيحي للعرض|Demo phone number
تواصلي مع المتجر|Contact the store
للاستفسار عن المنتجات والطلبات، تواصلي مع متجر Monarca عبر واتساب.|Contact Monarca on WhatsApp for product and order enquiries.
واتساب بخصوص التوصيل|WhatsApp about delivery
واتساب بخصوص هذا الطلب|WhatsApp about this order
مساعدة عبر واتساب|Help on WhatsApp
مساعدة بخصوص هذا الطلب|Help with this order
مساعدة الطلبات|Order help
مساعدة التوصيل|Delivery help
مساعدة الدفع والاسترداد|Payment and refund help
مساعدة الكاميرا|Camera help
نص الاستفسار المقترح|Suggested enquiry
معاينة فقط · لم تُرسل أي رسالة.|Preview only · no message sent.
لا يرسل التطبيق الرسالة تلقائياً.|The app does not send the message automatically.
فتح واتساب|Open WhatsApp
واتساب متجر Monarca|Monarca store WhatsApp
استفسارك يتضمن رقم الطلب فقط، دون اسم أو هاتف أو عنوان أو بيانات دفع.|Your enquiry includes only the order number, without your name, phone, address or payment details.
سيُفعّل رابط واتساب بعد إضافة رقم المتجر المعتمد. هذا رقم توضيحي ولا يفتح محادثة أو يرسل أي رسالة.|The WhatsApp link activates once an approved store number is added. This demo number does not open a chat or send a message.
سيفتح واتساب خارج التطبيق. راجعي الرسالة ثم اضغطي إرسال بنفسك.|WhatsApp opens outside the app. Review the message and send it yourself.
عن Monarca|About Monarca
عن العلامة|About the brand
عن التطبيق|About the app
حول النموذج|About the prototype
حول هذه النسخة|About this version
أناقة ترافق تفاصيلك.|Elegance in every detail.
العناية بالتفاصيل|Care in every detail
تفاصيل بسيطة، وأناقة تدوم|Simple details. Lasting elegance.
اختيارات هادئة، وخامات مُلهمة،|Considered choices, inspiring textures,
وقطع تكمّل كل يوم بطريقتك.|and pieces for every day, your way.
يسعدنا أن نكون بقربك|Glad to be part of your day
مساحة للتسوّق تجمع الملابس والحقائب والأحذية والإكسسوارات في تجربة عربية مصممة للعراق. من القطعة التي تلهمك إلى تفاصيل وصولها، كل خطوة لها مكان واضح.|A shopping space bringing clothing, bags, shoes and accessories together for Iraq. From the piece that inspires you to its arrival, every step has a clear place.
نص تعريفي مقترح للتصميم، ويحتاج اعتماد العلامة قبل النشر. لا يتضمن ادعاءات عن تاريخ الشركة أو منشأ المنتجات.|Suggested design copy requiring brand approval before publication. It makes no claims about company history or product origins.
التفاصيل تصنع الفرق.|Details make the difference.
واجهة عربية وعناوين عراقية.|Arabic and English interfaces with Iraqi addresses.
تجربة قريبة منكِ|An experience close to you
إلى حيث تكونين.|Delivered to your chosen destination.
واجهة كاملة باتجاه RTL|Arabic RTL and English LTR interfaces
تُعرض هذه النسخة باللغة العربية ومن اليمين إلى اليسار.|Available in Arabic, right to left, and English, left to right.
النسخة الحالية بالعربية وبالدينار العراقي فقط. دعم الكردية أو الإنجليزية وتغيير العملة يحتاج توسيع نطاق المنتج، ولا يوجد تحويل عملات في النموذج.|Arabic and English are available. Delivery remains in Iraq and the currency is IQD. The prototype does not convert currencies.
بياناتك وكيف تعمل النسخة|Your data and how this version works
تعرفي على قواعد النسخة التجريبية|Learn the demo rules
خصوصيتك وبياناتك|Your privacy and data
الخصوصية والبيانات|Privacy and data
الخصوصية والسياسات|Privacy and policies
السياسات والخصوصية|Policies and privacy
شروط وخصوصية النسخة التجريبية|Demo terms and privacy
شروط التجربة وسياسة الإرجاع|Demo terms and return policy
الخصوصية وشروط التجربة|Privacy and demo terms
وثيقة شرح للنموذج، وليست شروط متجر نهائية أو استشارة قانونية.|Explains the prototype; these are not final store terms or legal advice.
التخزين على هذا الجهاز|Storage on this device
الدفع والمعاملة|Payment and transaction
طرق الدفع المعتمدة للتصميم|Payment methods in this design
الدفع عبر Visa و Mastercard|Payment via Visa and Mastercard
قبل الإطلاق الفعلي|Before launch
الأسعار والمخزون والعروض بيانات لاختبار التجربة.|Prices, stock and offers are demo data for testing.
Monarca نموذج تفاعلي للسوق العراقي لعرض التصميم ومسارات التسوّق. المنتجات والأسعار والمخزون والتقييمات والقسائم بيانات توضيحية، ولا تُنشئ عملية شراء فعلية. يجب اعتماد بيانات المتجر وسياساته ووسائل التواصل قبل الإطلاق.|Monarca is an interactive design prototype for Iraq. Products, prices, stock, reviews and coupons are demo data and create no real purchase. Store details, policies and contact channels must be approved before launch.
تُحفظ السلة والمفضلة والملف والطلبات والعناوين والتذاكر محلياً في تخزين المتصفح. لا توجد قاعدة بيانات أو مزامنة بين الأجهزة. تسجيل الدخول لا يرسل SMS ولا يؤكد ملكية الهاتف فعلياً.|Your bag, wishlist, profile, orders, addresses and tickets are saved locally in this browser. There is no database or cross-device sync. Sign-in sends no SMS and does not verify phone ownership.
تُحفظ السلة والملف والطلبات ومحادثات الدعم محلياً في هذا المتصفح. لا توجد مزامنة أو حساب حقيقي. من الإعدادات يمكن مسح بيانات التجربة وإعادتها إلى البداية.|Your bag, profile, orders and support conversations stay in this browser. There is no sync or real account. Settings let you clear the demo and start again.
مسح بيانات المتصفح أو إعادة ضبط التجربة يزيل المعلومات المحلية. قد لا تتوفر إمكانية الاسترداد بعد المسح.|Clearing browser data or resetting the demo removes local details. They may not be recoverable afterwards.
صور البحث المختارة تُستخدم في الجلسة المحلية ولا تُرفع إلى خادم في النموذج. الردود والإشعارات آلية. الصور البصرية مقدمة كمرجع من العميل أو مولّدة لأغراض التصميم.|Search photos are used in the local session and are not uploaded. Replies and notifications are automated. Visuals come from client references or are generated for the design.
الدفع عبر Visa و Mastercard محاكاة باستخدام بطاقات الاختبار المعروضة. لا يتم خصم أموال أو الاتصال بمصرف. تأكيد الطلب والتحقق وإعادة المحاولة تمثل حالات تصميم. لا تُدخل بيانات بطاقة حقيقية أو رموز مصرفية.|Visa and Mastercard payments are simulated with the shown test cards. No charge or bank connection occurs. Confirmation, verification and retry are design states. Use no real card details or bank codes.
يمكن اختبار الإلغاء قبل الشحن، وطلب الإرجاع للقطع بعد التسليم، ثم متابعة حالته. جميع الحالات واستردادات المبالغ محاكاة. لا توجد حركة مالية حقيقية.|Test cancellation before shipping and item returns after delivery, then follow their status. All statuses and refunds are simulated; no real money moves.
المدة المسموحة للإرجاع، القطع المستثناة، حالة التغليف، رسوم الشحن، وآلية ومدة الاسترداد تحتاج اعتماد المتجر قبل تشغيل الخدمة.|Return windows, excluded items, packaging requirements, shipping fees and refund methods and timing need store approval before the service starts.
محادثات المساعدة داخل التطبيق محاكاة محلية بردود آلية، ولا تُرسل إلى موظف. التواصل عبر واتساب منفصل ويفتح خارج التطبيق بعد اعتماد رقم المتجر؛ أنتِ من ترسلين الرسالة. لا تمثل هذه النسخة ساعات عمل أو وعداً بوقت استجابة.|In-app support is local with automated replies and sends nothing to staff. WhatsApp opens separately once the store number is approved; you send the message. This version promises no opening hours or response time.
تُعتمد هوية البائع وبيانات التواصل والسياسات وبيانات المنتجات، ثم تُربط خدمات الدخول والدفع والشحن والدعم وتُختبر في بيئة تشغيل مناسبة.|Approve seller identity, contact details, policies and product data, then connect and test sign-in, payment, shipping and support in a suitable environment.
قواعد العرض: بغداد ٥٬٠٠٠ د.ع، المدن الأخرى ٧٬٠٠٠ د.ع. التوصيل القياسي مجاني تلقائياً من قيمة منتجات ١٠٠٬٠٠٠ د.ع قبل الخصم؛ تضاف ٥٬٠٠٠ د.ع للتوصيل السريع. المدة التقديرية ٢–٤ أيام عمل مثال يحتاج اعتماداً، ولا تمثل التزاماً فعلياً بالتوصيل.|Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD. Standard delivery is free from 100,000 IQD in item value before discounts; express adds 5,000 IQD. The 2–4 working-day estimate needs approval and is no delivery commitment.
تقديرات تجريبية لعرض التصميم. يلزم اعتماد التغطية والمدة والرسوم من المتجر قبل الإطلاق.|Demo design estimates. The store must approve coverage, timing and fees before launch.
استبدال وإرجاع وفق سياسة المتجر المعتمدة|Exchanges and returns under the approved store policy
كيف أتابع طلبي؟|How do I track my order?
كيف أختار المقاس المناسب؟|How do I choose a size?
كيف أستخدم قسيمة الخصم؟|How do I use a coupon?
كيف أطلب إرجاع قطعة؟|How do I return an item?
كيف أطلب إرجاعاً؟|How do I request a return?
كيف يعمل البحث بالصورة؟|How does photo search work?
ما تفاصيل العنوان المطلوبة؟|What address details are needed?
ما طرق الدفع المتاحة؟|Which payment methods are available?
ماذا يحدث إذا فشل الدفع؟|What happens if payment fails?
هل يتم التوصيل إلى مدينتي؟|Do you deliver to my city?
هل يمكن إلغاء طلبي؟|Can I cancel my order?
أين تُحفظ بياناتي؟|Where is my data stored?
لم يصلني رمز تسجيل الدخول|I did not receive a sign-in code
افتحي حسابي ← طلباتي ← اختاري الطلب ← تتبّع الطلب. تُعرض مراحل تجهيز الطلب والشحن والتسليم. جميع تحديثات الشحنة في هذه النسخة محاكاة.|Open My account → My orders → choose an order → Track order. Preparation, shipping and delivery stages are shown. Every shipment update is simulated.
افتحي دليل المقاسات في صفحة المنتج، ثم اختاري المقاس واللون قبل الإضافة. المقاسات غير المتاحة لا يمكن اختيارها. جداول هذه النسخة توضيحية وتحتاج تأكيد بيانات المورّد.|Open the size guide on the product page, then choose size and colour. Unavailable sizes cannot be selected. These demo charts need supplier confirmation.
من حسابي ← قسائمك، استلمي القسيمة واضغطي «استخدام في السلة». يُطبق رمز واحد لكل طلب عند بلوغ الحد الأدنى، ويُحسب الخصم قبل الدفع. لا تُستخدم القسيمة المنتهية أو المستخدمة.|Open My account → Your coupons, claim a coupon and choose Use in bag. One code applies per order when minimum spend is met, before payment. Expired or used coupons cannot be applied.
بعد وصول الطلب إلى «تم التسليم»، افتحي تفاصيله واختاري طلب إرجاع. حدّدي القطعة والكمية والسبب، ثم تابعي حالة الطلب. الإرجاع في هذه النسخة محاكاة، ومدته وشروطه بانتظار اعتماد المتجر.|Once an order is Delivered, open its details and request a return. Choose item, quantity and reason, then follow the status. Returns are simulated; timing and terms await store approval.
تُتاح تجربة إلغاء الطلب قبل الشحن. بعد بدء الشحن توجهي إلى الدعم، وبعد التسليم استخدمي طلب الإرجاع. راجعي الحالة الظاهرة في تفاصيل طلبك لمعرفة الإجراء المتاح.|Demo cancellation is available before shipping. Contact support once shipping starts and request returns after delivery. The status in order details shows available actions.
اضغطي أيقونة الكاميرا أعلى يسار الصفحة الرئيسية، ثم ارفعي صورة واضحة لقطعة واحدة أو التقطي صورة. النتائج محاكاة لقطع مشابهة داخل الكتالوج، ولا تُرفع الصورة إلى خادم.|Open the camera on the home page and upload or take a clear photo of one item. Results simulate similar pieces in the catalogue; photos are not uploaded.
يبقى الطلب بانتظار الدفع ويمكن إعادة المحاولة أو اختيار بطاقة اختبار أخرى من تفاصيل الطلب. لا يُخصم مبلغ ولا تُستهلك قسيمة الخصم حتى نجاح الدفع التجريبي.|The order stays awaiting payment. Retry or choose another test card from order details. No amount is charged and no coupon is used until demo payment succeeds.
اختاري الطريقة|Choose a method
التقط صورة|Take a photo
اختر من الصور|Choose photo
التقطي أو ارفعي صورة لاكتشاف قطع مشابهة.|Take or upload a photo to discover similar pieces.
التقطي صورة أو اختاري من جهازك لاكتشاف قطع مشابهة. يُفضّل أن تظهر قطعة واحدة بوضوح.|Take a photo or choose one from your device to find similar pieces. Show one item clearly for the best demo experience.
أو جرّبي صورة من المجموعة|Or try a collection photo
جرّب صورة أخرى|Try another photo
تجربة: دون نتائج|Demo: no results
تجربة: تعذّر البحث|Demo: search failed
لا يتم إرسال صورك إلى خادم. نتائج البحث هنا توضيحية لتجربة التصميم.|Photos are not uploaded. Results illustrate the design experience.
نتائج توضيحية · محاكاة البحث بالصورة|Demo results · simulated photo search
منتجات مشابهة لصورتك|Pieces similar to your photo
لم نعثر على قطع مشابهة|No similar pieces found
جرّبي صورة أوضح أو تصفّحي مجموعتنا.|Try a clearer photo or explore the collection.
صورة تجربة البحث|Demo search photo
صورة مرجعية للقسم|Category reference photo
تعذّر تحليل الصورة. حاول مرة أخرى أو اختر صورة أوضح.|We could not analyse this photo. Try again or choose a clearer one.
التقييمات|Reviews
آراء عن القطعة|Reviews of this piece
تفاصيل التقييم|Review details
العودة إلى التقييمات|Back to reviews
ترتيب التقييمات|Sort reviews
الأعلى تقييماً|Highest rated
الأقل تقييماً|Lowest rated
تقييم القطعة|Review item
قيّمي هذه القطعة|Review this piece
كتابة تقييم|Write a review
اكتبي تقييماً تجريبياً|Write a demo review
اكتبي تقييمك التجريبي|Write your demo review
تجربة كتابة التقييم|Try writing a review
تقييمك العام|Overall rating
عنوان التقييم|Review title
أبرز ما أحببتِه في القطعة|What stood out about this piece
كيف كانت تجربتك؟|How was your experience?
كيف كان المقاس؟|How was the fit?
مناسب للمقاس المعتاد|True to size
أصغر قليلاً|Slightly small
أوسع قليلاً|Slightly large
المقاس: مناسب|Fit: true to size
التقييمات المعروضة أمثلة مصرح بها لاختبار الواجهة وليست مراجعات عملاء. ما تكتبينه يحفظ على هذا الجهاز فقط.|These reviews are examples for testing, not customer feedback. Anything you write is saved on this device only.
تقييمات توضيحية لا تمثّل آراء عملاء حقيقيين.|Example reviews, not real customer opinions.
ساعدينا في اختبار نموذج التقييم. لن يُنشر أي محتوى خارج هذا الجهاز.|Help test the review form. Nothing is published outside this device.
من ١٥ إلى ٥٠٠ حرف. لا تضيفي بيانات شخصية.|15–500 characters. Leave out personal details.
أفهم أن هذا تقييم تجريبي محفوظ محلياً.|I understand this is a demo review saved locally.
حفظ التقييم التجريبي|Save demo review
· سيظهر حفظ التقييم في تفاصيل الطلب.|· Saved reviews appear in order details.
هذه مراجعة تجريبية لعرض طريقة قراءة التقييمات. مساحة مناسبة لوصف المقاس والخامة وتجربة الاستخدام.|A demo review illustrating how feedback is displayed, with room to describe fit, fabric and use.
نص توضيحي يبيّن كيف تظهر ملاحظات المشترين. لا يمثل تجربة شراء فعلية أو رأياً موثّقاً.|Example copy showing buyer feedback. It represents no actual purchase or verified opinion.
نموذج محايد لتجربة فرز التقييمات والاطلاع على التفاصيل. يعتمد المحتوى الحقيقي بعد الإطلاق.|A neutral example for testing review sorting and details. Real content will be approved after launch.
مثال على تقييم القصّة|Example fit review
مثال على ملاحظة عن اللون|Example colour feedback
مثال على تقييم مختلف|Another example review
نجمة|Star
نجمتان|2 stars
أسئلة عن القطعة|Questions about this piece
لديك سؤال عن القطعة؟|Have a question about this piece?
اقرئي الإجابات أو أضيفي سؤالك|Read answers or add your question
اكتبي سؤالك عن الخامة أو المقاس أو تفاصيل القطعة…|Ask about the material, size or details…
السؤال محفوظ على هذا الجهاز. لخدمة العملاء: افتحي المساعدة.|Questions stay on this device. Open Help for customer care.
تسجيل السؤال التجريبي|Save demo question
هل اللون مطابق للصورة؟|Does the colour match the photo?
سؤال وإجابة توضيحيان|Example question and answer
قياسات الجسم التقريبية · بالسنتيمتر|Approximate body measurements · cm
قارني طول قدمك · بالسنتيمتر|Compare foot length · cm
كيف تأخذين القياس؟|How to measure
الصدر|Bust
الخصر|Waist
الأرداف|Hips
طول القدم|Foot length
الصدر: مرّري الشريط حول أعرض نقطة دون شدّه.|Bust: measure around the fullest part without pulling the tape tight.
الخصر: قيسي حول أضيق جزء من الخصر.|Waist: measure around the narrowest point.
الأرداف: قيسي حول أعرض نقطة مع الوقوف باستقامة.|Hips: stand straight and measure around the widest point.
ضعي قدمك على ورقة وقفي باستقامة.|Place your foot on paper and stand straight.
علّمي موضع الكعب وأطول إصبع.|Mark the heel and longest toe.
قيسي المسافة وقارنيها بالجدول؛ قيسي القدمين وخذي الأكبر.|Measure the distance and compare it with the chart. Measure both feet and use the larger result.
قارني قياساتك بجدول القطعة، ثم تواصلي مع خدمة العملاء عند التردد. الجداول الحالية للعرض وتحتاج اعتماد المورد.|Compare your measurements with the chart and ask care if unsure. These demo charts need supplier approval.
بين مقاسين؟ اطلبي المساعدة قبل الشراء؛ قد تختلف القصّة بين القطع.|Between sizes? Ask for help before buying; fit varies between pieces.
افتحي دليل المقاسات|Open size guide
جدول توضيحي لتجربة التصميم. تُعتمد قياسات المورد الفعلية قبل الإطلاق.|Demo size chart. Actual supplier measurements must be confirmed before launch.
عرض تقريبي|Approximate view
مقاسكِ غير متوفر؟ احفظي طلب تنبيه|Size unavailable? Save an alert request
لاحقاً|Later
للنموذج فقط|Prototype only
الاحتفاظ بالطلب|Keep order
تأكيد الإلغاء|Confirm cancellation
سبب الإلغاء|Cancellation reason
تغيير رأيي|Changed my mind
أريد تعديل القطع|Change items
تغيير عنوان التوصيل|Change delivery address
`);
add(`
أوافق على|I agree to
عملية توضيحية|Demo transaction
إدخال بيانات الاختبار|Enter test details
اسم حامل بطاقة الاختبار *|Test cardholder name *
الطلب هدية · تغليف تجريبي مجاني|Gift order · free demo wrapping
المدفوع تجريبياً|Demo amount paid
تفاصيل التوصيل|Delivery details
عدد القطع|Number of items
تم تأكيد الدفع التجريبي وتجهيز الطلب للمتجر.|The demo payment is confirmed and your order is ready for the store.
عنوان ومبالغ محفوظة لهذا الطلب. المتابعة تستخدم رقم الطلب نفسه.|The address and amounts are saved for this order. Continue using the same order number.
تقدير تجريبي محفوظ|Saved demo estimate
سبب توضيحي|Demo reason
وصلتِ إلى نهاية هذه المجموعة|You have reached the end of this collection
لنفس صورة العرض.|For the same demo photo.
الدفع عند الاستلام أو ببطاقة الاختبار|Cash on delivery or test card
بطاقة اختبار فقط للطلب المسبق|Test card only for preorders
اختياراتك على هذا الجهاز|Your choices on this device
لن تفوتكِ قطعة أعجبتك.|Save the pieces you love
الطلب المستلم|Delivered order
نساعدكِ على الاختيار|Help choosing your pieces
قطعة مفضلة|Wishlist item
المزيد من التفاصيل|More details
طلبك|Your order
طلبك في الطريق|Your order is on the way
خدمات Monarca|Monarca services
عروض Monarca|Monarca offers
إلى جميع أنحاء العراق|Across Iraq
طلبي وتتبّعه|My order and tracking
لنرتّب التفاصيل معاً|Let us arrange the details
آخر محادثة|Last conversation
تحتاجين مساعدة أكثر؟|Need more help?
قريبة منكِ|Close to you
التسوّق|Shopping
طلب توضيحي|Demo order
تابعي التفاصيل والإجراءات المتاحة من صفحة الطلب.|Open order details for updates and available actions.
إرجاع واسترداد|Return and refund
تفاصيل الطلب الأصلي|Original order details
تفاصيل العملية|Transaction details
يبدأ تجهيز وشحن الطلب بعد إتمام الدفع بالبطاقة.|Preparation and shipping start after card payment is complete.
لا توجد عملية دفع ناجحة|No successful payment
يمكن فتح الطلب من قائمة الطلبات.|Open this order from your orders list.
تُستخدم القسيمة عند تأكيد طلب الدفع عند الاستلام أو نجاح دفع البطاقة. فشل دفع البطاقة لا يستهلكها.|Coupons are used when a cash-on-delivery order is confirmed or a card payment succeeds. Failed card payments do not use a coupon.
الدفع ببطاقات Visa و Mastercard أو الدفع عند الاستلام للمنتجات المتوفرة في المتجر فقط. المنتجات بطلب مسبق تحتاج بطاقة. هذه محاكاة لا تخصم أموالاً ولا تتصل بمصرف أو مندوب. معلومات العنوان والدفع في صفحة واحدة. لا تُدخل بيانات بطاقة حقيقية أو رموز مصرفية.|Use Visa or Mastercard test cards, or cash on delivery for in-stock items only. Preorders require a card. This simulation makes no charge and contacts no bank or courier. Address and payment appear on one page. Use no real card details or bank codes.
الدفع ببطاقات Visa و Mastercard متاح لجميع المنتجات. الدفع عند الاستلام متاح لمنتجات المتجر المتوفرة فقط، وليس للطلب المسبق أو الطلبات المختلطة. جميع عمليات الدفع في هذه النسخة محاكاة.|Visa and Mastercard are available for all items. Cash on delivery is available for in-stock items only, excluding preorders and mixed orders. Every payment in this version is simulated.
الدفع عند الاستلام متاح للمنتجات المتوفرة في المتجر فقط. الطلب المسبق يحتاج بطاقة. بوابة الدفع والتحقق الفعلي لم يُربطا بعد.|Cash on delivery is available for in-stock items only. Preorders require a card. The live payment gateway and verification are not connected yet.
يدعم التطبيق العربية والإنجليزية. تبقى منطقة التوصيل العراق والعملة الدينار العراقي، دون تحويل عملات.|The app supports Arabic and English. Delivery remains in Iraq and the currency is the Iraqi dinar, with no currency conversion.
بحسب عدد القطع في الطلبات المؤكدة غير الملغاة على هذا الجهاز، وتشمل الدفع عند الاستلام. هذا ليس إحصاءً حقيقياً لكل مستخدمات المتجر.|Based on quantities in confirmed, non-cancelled orders on this device, including cash on delivery. This does not represent store-wide sales.
`);
add(`
Monarca · أناقة في كل تفصيلة|Monarca · Elegance in every detail
أبعديها عن الماء والعطور. نظفي بقطعة قماش ناعمة واحفظي كل قطعة منفصلة.|Keep away from water and perfume. Clean with a soft cloth and store each piece separately.
أحذية بكعب|Heels
أدخلي رقم هاتف عراقي صحيحاً: 07 متبوعاً بـ 9 أرقام، أو +964 ثم 7 و9 أرقام.|Enter a valid Iraqi number: 07 followed by 9 digits, or +964 then 7 and 9 digits.
أدخلي رقم هاتف عراقي صحيحاً، مثل 07700000000.|Enter a valid Iraqi phone number, such as 07700000000.
أدخلي رقماً عراقياً صحيحاً بصيغة 07… أو +964 7…|Enter a valid Iraqi number starting with 07… or +964 7…
أرغب في تعديل العنوان|Change the address
أرغب في تغيير القطع أو المقاس|Change items or size
أضيفت الكمية المتاحة. بقيت الكمية الأخرى محفوظة لوقت لاحق.|The available quantity was added. The rest stays saved for later.
أضيفي التفاصيل التي تساعدنا على فهم طلبك.|Add details to help us understand your request.
أضيفي رسالة من حرف واحد إلى ١٢٠٠ حرف.|Enter a message of 1–1,200 characters.
أضيفي عنواناً من ٤–٩٠ حرفاً وتفاصيل من ١٠–١٢٠٠ حرف.|Enter a title of 4–90 characters and details of 10–1,200 characters.
أضيفي عنوانك الأول|Add your first address
أضيفي قطعة تحبينها، ثم اختاري تفاصيلها لنكمل طلبك.|Choose a piece you love and its options to start your order.
أقراط بتصميم متدلٍّ ولون ذهبي دافئ. لمسة خفيفة تكمل الإطلالة اليومية أو المناسبة.|Warm gold-tone drop earrings. A light finishing touch for everyday looks and occasions.
أقرب نقطة دالة|Nearest landmark
أكملي التقييم والعنوان والتفاصيل والموافقة لحفظ النموذج.|Complete the rating, title, details and consent to save this demo review.
أكملي المدينة أو القضاء أو الناحية.|Enter the city, district or subdistrict.
أكملي المنطقة والشارع وأقرب نقطة دالة.|Complete the area, street and nearest landmark.
أكملي عنوان التوصيل قبل مراجعة الطلب.|Complete the delivery address before reviewing the order.
أكملي عنوان المدينة الجديدة. عنوانك السابق محفوظ.|Complete the new city's address. Your previous address is saved.
ألوان|Colours
لون|Colour
أنتِ|You
أهلاً بكِ في عناية Monarca التجريبية. كل ما تكتبينه يبقى في هذا المتصفح، والردود آلية لعرض التجربة.|Welcome to Monarca demo care. Your messages stay in this browser; replies are automated to demonstrate the experience.
أُغلقت المحادثة بناءً على اختيارك. يمكنك إعادة فتحها إذا احتجتِ متابعة.|You closed this conversation. Reopen it whenever you need to continue.
إحدى القطع غير متوفرة بالكمية أو المقاس المختار. يمكن مراجعة الحقيبة.|An item is unavailable in the selected quantity or size. Review your bag.
إزالة القطع المحددة|Remove selected items
إضافة قسيمة خصم|Add coupon
إعادة المراجعة بعد انتهاء أهلية القسيمة|Review after coupon eligibility changes
إعادة ضبط التصفية|Reset filters
إعادة فتح المحادثة|Reopen conversation
إنشاء طلب مساعدة|Create support request
إنهاء المحادثة|Close conversation
ابدئي باختياراتك|Start with your choices
احفظي رقم التواصل لتجربة الاشتراك في تنبيه التوفر.|Save a contact number to test stock alerts.
اختاري خيارات متوفرة وكمية ضمن المخزون|Choose available options and a quantity within stock
اختاري عنوان التوصيل لهذا الطلب أو أضيفي عنواناً جديداً قبل المراجعة والدفع.|Choose a delivery address or add a new one before review and payment.
اختاري مدينة / منطقة التوصيل.|Choose an Iraqi delivery region.
اختيار القطع في الحقيبة|Select items in bag
اختيار عنوان التوصيل|Choose delivery address
اختيار قسيمة خصم|Choose coupon
ارتفاع الكعب ٨ سم · قياس توضيحي|Heel height 8 cm · demo measurement
استخدام هذا العنوان|Use this address
استفسار عن منتج|Product enquiry
استكشفي المنتجات|Explore products
استلمتِ القسيمة. يمكنك استخدامها عند بلوغ الحد الأدنى.|Coupon claimed. Use it when the minimum spend is met.
استلمي قسيمة من تبويب «متاحة للاستلام» لتظهر هنا.|Claim a coupon from Ready to claim to see it here.
استُخدمت قسيمة هذا الطلب في طلب آخر. يلزم مراجعة الطلب لتحديث المبلغ.|This order's coupon was used on another order. Review the order to update the amount.
اسم المستلم الكامل|Recipient full name
اشرحي ما حدث، وما المساعدة التي تحتاجينها...|Describe what happened and the help you need…
اضغطي على القلب بجانب أي قطعة للاحتفاظ بها هنا.|Tap the heart beside any piece to save it here.
اقتراحات مطابقة|Matching suggestions
اكتبي سؤالاً من ٨ أحرف على الأقل.|Enter a question of at least 8 characters.
اكتمل الإرجاع دون استرداد|Return completed without refund
اكتمال الإرجاع دون استرداد|Return completion without refund
اكتمل الاستبدال|Exchange completed
اكتمل الاسترداد التجريبي|Demo refund completed
اكتملت المحاكاة|Simulation completed
الآن · تجربة محلية|Now · local demo
الأوروبية|European
الاحتفاظ بالسجل|Keep record
الاحتفاظ بها|Keep items
البحث بكلمات أخرى|Search other words
التصفح كضيفة|Browse as guest
التوصيل إلى هذا العنوان|Deliver to this address
الحساب والعناوين|Account and addresses
الدولية|International
السريع|Express
الشارع|Street
الصورة المرجعية التي قدّمها العميل.|Reference image supplied by the client.
الصورة مأخوذة من مرجع العميل. قد تختلف تفاصيل الخامة واللون في المنتج النهائي؛ تُعتمد صور المورد قبل البيع.|Image from the client reference. Material and colour may differ in the final product; supplier photos must be approved before sale.
العناية · رد آلي|Care · automated reply
العودة إلى حسابي|Back to my account
العودة للحساب|Back to account
العودة للحقيبة|Back to bag
العودة للقسائم|Back to coupons
القسيمة غير متاحة. جرّبي M10.|Coupon unavailable. Try M10.
القطعة في طريق العودة|Item on its way back
القطعة مختلفة عن الوصف|Item differs from description
اللون مختلف عن المتوقع|Colour differs from expected
المتوفر فقط|In stock only
المدينة / القضاء / الناحية|City / district / subdistrict
المنطقة / الحي|Area / neighbourhood
المواصفات والخامة الموضحة بيانات تصميم تجريبية؛ تُستبدل ببطاقة المورد الفعلية قبل الإطلاق.|The shown specifications and material are demo data; replace them with the supplier's actual details before launch.
امسحيها بقطعة ناعمة وجافة. احتفظي بها داخل كيس قماشي، بعيداً عن الحرارة والرطوبة.|Wipe with a soft dry cloth. Store in a fabric bag away from heat and moisture.
انتظري قليلاً قبل طلب رمز آخر. رمز الاختبار 123456.|Wait a moment before requesting another code. The test code is 123456.
انتهت صلاحية الرمز. أعيدي تجهيز رمز جديد.|Code expired. Request a new one.
انتهت صلاحية القسيمة.|Coupon expired.
انتهت صلاحية هذه القسيمة.|This coupon has expired.
بطاقة اختبار|Test card
بعد إكمال الدفع التجريبي تظهر القسائم المستخدمة هنا.|Used coupons appear here after demo payment.
بنطال بخصر مرتفع ورجل واسعة تمنح حركة مريحة. نسّقيه مع القميص العاجي والحقيبة البنية.|High-rise wide-leg trousers for comfortable movement. Pair with the ivory shirt and brown bag.
تأكيد الحذف|Confirm deletion
تأكيد تسجيل الخروج|Confirm sign-out
تاريخ الانتهاء التجريبي هو 12/30.|The test expiry date is 12/30.
تبدأ الأناقة باختيارك|Elegance starts with your choice
تجدين المقاسات والألوان المتاحة ودليل القياس في صفحة المنتج. المقاسات المشطوبة غير متاحة، ويمكن حفظ القطعة في المفضلة للرجوع إليها.|Available sizes, colours and measurements appear on the product page. Crossed-out sizes are unavailable. Save the piece to your wishlist to return later.
تحديث الإرجاع|Return update
تحققي من رقمك|Verify your number
تسجيل الدخول برقم الهاتف|Sign in with phone
تصفّحي القسائم المتاحة|Browse available coupons
تصفّحي المجموعة وستظهر هنا القطع التي تفتحينها.|Explore the collection. Pieces you open will appear here.
تعديل اختياراتك|Edit your choices
تعديل الرقم|Edit number
تعديل العنوان|Edit address
تعذرت الموافقة|Approval failed
تعيين افتراضية|Set as default
تفاصيل السياسة|Policy details
تفاصيل صورة العرض|About the demo image
تفاصيلك تبدأ من هنا|Your details start here
تفصيل مكبّر من الصورة|Photo close-up
تقبل النسخة رقم بطاقة الاختبار المعروض فقط. لا تُستخدم بطاقة حقيقية.|Only the shown test card number is accepted. Use no real card.
تقييم محلي · تجريبي|Local review · demo
تقييمك التجريبي|Your demo review
تم|Done
تم إرسال البديل|Replacement sent
تم إغلاق المحادثة بناءً على اختيارك. يمكنك إعادة فتحها من زر المتابعة في أي وقت داخل هذه التجربة.|Conversation closed. Reopen it using Continue at any time in this demo.
تم استخدام هذه القسيمة سابقاً.|This coupon was already used.
تم استلام وفحص القطعة|Item received and inspected
تم الحل|Resolved
تم النسخ. يمكنك لصقه في رسالتك.|Copied. You can paste it in your message.
تم تأكيد الدفع التجريبي|Demo payment confirmed
تم تأكيد الطلب بالدفع عند الاستلام|Cash-on-delivery order confirmed
تم تجهيز رمز التجربة 1234. لم تُرسل SMS.|Demo code 1234 is ready. No SMS was sent.
تم تحديث المفضلة|Wishlist updated
تم تحديث بطاقة الاختبار|Test card updated
تم تحديث تفاصيل القطعة|Item details updated
تم تحديد الرابط. استخدمي أمر «نسخ» في جهازك لنسخه.|Link selected. Use your device's Copy command to copy it.
تم تحديد كل الإشعارات كمقروءة|All notifications marked read
تم تسجيل الاسترداد|Refund recorded
تم تسجيل الخروج التجريبي|Signed out of demo
تم تسجيل الدخول التجريبي|Signed into demo
تم تعيين العنوان الافتراضي|Default address set
تم تغيير بطاقة الاختبار الافتراضية|Default test card changed
تم تقديم الطلب|Request submitted
تم حذف بطاقة الاختبار|Test card deleted
تم حفظ التقييم التجريبي على هذا الجهاز|Demo review saved on this device
تم حفظ الطلب. المبلغ مستحق عند الاستلام ولم يُحصّل أي مبلغ نقدي.|Order saved. Payment is due on delivery; no cash has been collected.
تم حفظ العنوان|Address saved
تم حفظ القطعة في المفضلة|Item saved to wishlist
تم حفظ الملف الشخصي|Profile saved
تم حفظ سؤالك في النسخة التجريبية|Question saved in the prototype
تم حفظ طلب التنبيه محلياً؛ لن تُرسل رسالة حقيقية|Alert request saved locally; no real message is sent
تم حل الطلب|Request resolved
تم مسح الملفات المؤقتة|Temporary data cleared
تم مسح سجل البحث|Search history cleared
تم مسح سجل المشاهدة|Viewing history cleared
تم نسخ رابط القطعة|Item link copied
تمت إضافة القسيمة إلى محفظتك|Coupon added to wallet
تمت إضافة بطاقة الاختبار|Test card added
تمت إعادة فتح المحادثة|Conversation reopened
تمت معالجة هذا الطلب|This request has been processed
تنبيه توفر المقاس|Size availability alert
تنظيف جاف متخصص. علّقي القطعة على علاقة عريضة واحفظيها في مكان جيد التهوية.|Professional dry clean. Use a wide hanger and store in a well-ventilated place.
تنظيف متخصص بحسب ملصق القطعة. تجنبي المبيّض والحرارة العالية، واكوي على الوجه الداخلي.|Professional cleaning as labelled. Avoid bleach and high heat; iron inside out.
توجد قطعة بنفس الخيارات في حقيبتك. مجموع الكمية يتجاوز المخزون.|Your bag has an item with these options. The combined quantity exceeds stock.
جارٍ تأكيد الطلب…|Confirming order…
جاكيت بقصّة محددة وحزام يبرز الخصر. جيوب أمامية وتفاصيل كلاسيكية للنهار والمساء.|A fitted jacket with a waist belt, front pockets and classic details for day and evening.
جلد طبيعي · بطانة قماشية (مواصفات تجريبية)|Natural leather · fabric lining (demo specifications)
جلد طبيعي بحسب تصميم العينة؛ بطانة قماشية وإغلاق معدني. الخامة النهائية تحتاج اعتماد المورد.|Sample design: natural leather, fabric lining and metal closure. Final material requires supplier approval.
حددي القطع أولاً|Select items first
حرير ناعم بحسب تصميم العينة|Soft silk in the sample design
حقائب كتف|Shoulder bags
حقائب يد|Handbags
حُفظت القطعة لوقت لاحق|Item saved for later
خامة علوية ناعمة مع بطانة مبطنة ونعل ثابت. هذه مواصفات توضيحية قبل اعتماد المورد.|Soft upper, padded lining and a stable sole. Demo specifications awaiting supplier approval.
خامة ناعمة · نعل ثابت (مواصفات تجريبية)|Soft upper · stable sole (demo specifications)
خصر مرتفع · طول داخلي ٧٦ سم للمقاس M (توضيحي)|High rise · 76 cm inseam for size M (demo)
خطوة صغيرة وتصلين|One small step closer
راجعي طلبك من «حسابي ← طلباتي» لمتابعة التجهيز والشحن. للتجربة: بغداد ٥٬٠٠٠ د.ع، باقي المدن ٧٬٠٠٠ د.ع، وتوصيل مجاني من ١٠٠٬٠٠٠ د.ع. تحديثات التتبع محاكاة.|Open My account → My orders for preparation and shipping. Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD; free delivery from 100,000 IQD. Tracking updates are simulated.
رد جديد من العناية التجريبية|New reply from demo care
رفض تجريبي من جهة إصدار البطاقة. لا يوجد خصم حقيقي.|Simulated issuer decline. No real charge occurs.
رقم المتجر|Store number
رمز CVV التجريبي هو 123.|The test CVV is 123.
رمز الاختبار هو 123456 · لم تُرسل رسالة فعلية.|The test code is 123456 · no real message sent.
رمز الخصم غير صالح|Invalid discount code
رمز القسيمة غير صالح.|Invalid coupon code.
سبب آخر|Other reason
ستظهر عناوينك المحفوظة هنا.|Your saved addresses will appear here.
سجّلي الدخول التجريبي لحفظ الاسم وبيانات ملفك على هذا الجهاز.|Sign in to the demo to save your name and profile on this device.
سيظهر حفظ التقييم في تفاصيل الطلب.|The saved review will appear in order details.
صمّمي اختياراتك|Curate your choices
صورة عرض عالية الدقة مولّدة بالذكاء الاصطناعي بالاستناد إلى مرجع التصميم، وليست تصويراً لمنتج فعلي موثّق. تُعتمد صور المورد وتفاصيل المنتج قبل البيع.|High-resolution AI-generated demo image based on the design reference, not a verified product photo. Supplier photos and details must be approved before sale.
صورة عرض مولّدة بالذكاء الاصطناعي بالاستناد إلى مرجع التصميم، وليست تصويراً لمنتج فعلي موثّق.|AI-generated demo image based on the design reference, not a verified product photo.
صورة هذه القطعة من مرجع العميل.|This item's image comes from the client reference.
صورة هذه القطعة مولّدة بالذكاء الاصطناعي لعرض النموذج، وليست تصويراً لمنتج فعلي موثّق.|This is an AI-generated prototype image, not a verified product photo.
صوف مخلوط (مواصفات تجريبية)|Wool blend (demo specifications)
طلب دعم تجريبي، محفوظ في هذا المتصفح. ستظهر إجابة آلية لتوضيح رحلة خدمة العميل.|A demo support request saved in this browser. An automated reply illustrates the care experience.
طلب سابق|Previous request
طلب سابق للإرجاع|Previous return request
طلب مكرر|Duplicate request
طلبك قيد التجهيز|Your order is being prepared
عادت القطعة إلى حقيبتك|Item returned to your bag
عرض السلة|View bag
عميلة Monarca|Monarca customer
عنوان تجريبي|Demo address
عنوان محفوظ|Saved address
غسيل لطيف على ٣٠° مع ألوان مشابهة. اقلبي القطعة قبل الغسل واتركيها تجف بشكل طبيعي.|Gentle wash at 30° with similar colours. Turn inside out and air dry.
غسيل لطيف وفق ملصق العناية. تجنبي المجفف واكوي على حرارة منخفضة.|Gentle wash as labelled. Avoid tumble drying; iron on low heat.
غير متاحة لهذا الطلب|Unavailable for this order
غير متوفر|Unavailable
غيّرت رأيي|Changed my mind
قارني طول قدمك|Compare your foot length
قسيمة المجموعة السابقة|Previous collection coupon
قسيمة توضيحية منتهية الصلاحية|Expired demo coupon
قصّة عادية · طول ٦٥ سم للمقاس M (توضيحي)|Regular fit · 65 cm length for size M (demo)
قصّة محددة · طول ٧٢ سم للمقاس M (توضيحي)|Fitted cut · 72 cm length for size M (demo)
قصّة مكبّرة من صورة العرض نفسها؛ ليست زاوية تصوير إضافية.|A close-up of the same demo image, not an additional photo angle.
قصّة واسعة · طول ٦٨ سم للمقاس M (توضيحي)|Relaxed fit · 68 cm length for size M (demo)
قصّة واسعة وغطاء رأس وجيب أمامي لإطلالة يومية مريحة. اختاري مقاسك المعتاد لقصّة فضفاضة.|Relaxed fit with a hood and front pocket for everyday comfort. Choose your usual size for a loose fit.
قطعة من طلب سابق|Item from a previous order
قطن مخلوط ناعم (مواصفات تجريبية)|Soft cotton blend (demo specifications)
قماش ساتان ناعم (مواصفات تجريبية)|Soft satin (demo specifications)
قماش منسوج ناعم (مواصفات تجريبية)|Soft woven fabric (demo specifications)
قياسات الجسم التقريبية|Approximate body measurements
قيد الاسترداد التجريبي|Demo refund in progress
كل القسائم التي تحمل هذه الحالة تظهر هنا.|All coupons with this status appear here.
لا توجد اقتراحات؛ جرّبي البحث بالصورة|No suggestions; try photo search
لا توجد قطع محددة|No items selected
لا توجد محادثات محلولة بعد|No resolved conversations yet
لا توجد محادثات هنا|No conversations here
لا يوجد ترتيب بعد|No ranking yet
لا يوجد طلب جديد|No new order
لم تشاهدي قطعاً بعد|No pieces viewed yet
لم تكتمل شروط القسيمة|Coupon requirements not met
لم نجد الطلب المطلوب.|Requested order not found.
لنتابع الأمر خطوة بخطوة|Let us take it step by step
متابعة طلب|Follow an order
متابعة لتغيير الرقم|Continue to change number
متوفر|Available
مثال: أحتاج مساعدة في اختيار المقاس|e.g. I need help choosing a size
مثال: بطاقتي التجريبية|e.g. My test card
مدة التوصيل لا تناسبني|Delivery time does not suit me
مراجعة الطلب وتحديث الخصم|Review order and update discount
مساحة لأساسيات يومك، مقبضان علويان وقفل أمامي بلون ذهبي. قطعة تعكس أسلوب Monarca الهادئ.|Room for everyday essentials, twin top handles and a gold-tone front clasp. A piece with Monarca's considered style.
مساحة لاختياراتك القادمة|Room for your next choices
مسح البحث|Clear search
مسح التصفية والبحث|Clear filters and search
مسح السجل|Clear history
مسح سجل المشاهدة|Clear viewing history
مشكلة في الدفع|Payment issue
معدن بلون ذهبي بتفاصيل دقيقة. لا تمثل العينة ذهباً خالصاً أو شهادة مادة.|Fine gold-tone metal details. This sample is not solid gold or material certification.
معدن بلون ذهبي؛ عينة تصميم|Gold-tone metal; design sample
مقدمة مدبّبة وقصّة كلاسيكية تتناسق مع البنطال أو إطلالة المساء. اختاري المقاس بعد مقارنة طول القدم.|Pointed toe and a classic cut to pair with trousers or evening looks. Compare foot length before choosing a size.
ملغي|Cancelled
مناسب|True to size
موضوع آخر|Other topic
نظفي بفرشاة ناعمة وجافة. تجنبي الماء المباشر وأشعة الشمس لفترات طويلة.|Clean with a soft dry brush. Avoid direct water and prolonged sunlight.
نعم، تم حل المشكلة|Yes, resolved
نقل إلى الحقيبة|Move to bag
هذا الخيار غير متوفر حالياً|This option is currently unavailable
هذا الخيار غير متوفر. افتحي المنتج لاختيار بديل.|This option is unavailable. Open the product to choose another.
هذان الخياران لهما حالة تحديد مختلفة. وحّدي التحديد أولاً حتى لا تتغير قطع الطلب دون قصد.|These variants have different selection states. Match their selection first to keep the intended order items.
هذه القسيمة غير متاحة لهذا الطلب.|This coupon is unavailable for this order.
وجدنا لكِ هذه القطع|Pieces we found for you
وصلت رسالتك في المحادثة التجريبية. يمكنك مراجعة الأسئلة الشائعة أو إرفاق رقم الطلب من طلب مساعدة جديد. هذه إجابة آلية لعرض تصميم خدمة العميل.|Your demo message was received. Check FAQs or add an order number in a new support request. This is an automated reply illustrating customer care.
وصلت قطعة مختلفة|Wrong item received
وصلتِ إلى الحد المتاح في الحقيبة. بقيت القطعة محفوظة لوقت لاحق.|Your bag has reached the available quantity. This item stays saved for later.
ياقة كلاسيكية وأزرار أمامية مع أكمام طويلة. لون عاجي دافئ يسهل تنسيقه مع درجات البني والبيج.|Classic collar, front buttons and long sleeves. Warm ivory pairs easily with brown and beige.
يجب أن يكون الحد الأعلى أكبر من أو مساوياً للحد الأدنى، ضمن ٠–١٬٠٠٠٬٠٠٠ د.ع.|Maximum price must be at least the minimum, within 0–1,000,000 IQD.
يرجى إدخال اسم من حرفين إلى ٦٠ حرفاً.|Enter a name of 2–60 characters.
يرجى إدخال الاسم الكامل للمستلم.|Enter the recipient's full name.
يرجى إدخال بريد إلكتروني صحيح أو ترك الحقل فارغاً.|Enter a valid email or leave the field blank.
يرجى اختيار تاريخ ميلاد صحيح.|Choose a valid date of birth.
يرجى الانتظار دقيقة قبل المحاولة مرة أخرى.|Wait one minute before trying again.
يرجى الموافقة على شروط التجربة قبل تأكيد الطلب.|Accept the demo terms before confirming your order.
يرجى الموافقة على شروط التجربة للمتابعة.|Accept the demo terms to continue.
يظهر هنا ترتيب القطع عند تأكيد طلب في النسخة التجريبية.|A ranking appears here after an order is confirmed in the prototype.
يلزم إدخال الاسم الكامل للمستلم.|Enter the recipient's full name.
يلزم إدخال المدينة أو القضاء أو الناحية.|Enter the city, district or subdistrict.
يلزم إكمال القطع وعنوان التوصيل.|Complete your items and delivery address.
يلزم إكمال المنطقة والشارع وأقرب نقطة دالة.|Complete the area, street and nearest landmark.
يلزم اختيار قطعة واحدة على الأقل.|Choose at least one item.
يلزم اختيار منطقة التوصيل.|Choose an Iraqi delivery region.
يلزم اسم حامل بطاقة الاختبار.|Enter the test cardholder's name.
يلزم تحديد القطع في حقيبة التسوق.|Select items in the shopping bag.
يلزم تحديد قطعة واحدة على الأقل.|Select at least one item.
يلزم رقم هاتف عراقي صحيح بصيغة 07… أو +964 7…|Enter a valid Iraqi number starting with 07… or +964 7…
يلزم مراجعة الطلب وتحديث الخصم أولاً.|Review the order and update the discount first.
يمكن اختيار Visa أو Mastercard، أو الدفع عند الاستلام للمنتجات المتوفرة في المتجر فقط. معلومات التوصيل والدفع في صفحة واحدة. البطاقة تستخدم بيانات الاختبار فقط، ولا يتم خصم أموال.|Choose Visa, Mastercard or cash on delivery for in-stock items only. Delivery and payment are on one page. Cards use test details only and no money is charged.
يمكن تعديل الاسم والبريد من الملف الشخصي، والعناوين من دفتر العناوين. جميع البيانات محلية على هذا الجهاز.|Edit your name and email in Profile, and addresses in Address book. All data stays on this device.
يمكن طلب إرجاع من تفاصيل الطلب بعد التسليم، مع تحديد القطعة والكمية والسبب. شروط المدة والأهلية النهائية تحتاج اعتماد المتجر قبل الإطلاق.|Request a return from order details after delivery, choosing item, quantity and reason. Final timing and eligibility need store approval before launch.
يمكن متابعة التسوق.|Continue shopping.
يمكن مراجعة حالة الطلب والدفع.|Review order and payment status.
يمكنك أيضاً البحث بالصورة|You can also search by photo
يمكنك إضافة تقييم تجريبي آخر لهذه القطعة.|You can add another demo review for this piece.
يمكنك الاستمرار بالتسوق كضيفة. تسجيل الدخول لا يرسل رمزاً حقيقياً.|Continue shopping as a guest. Sign-in sends no real code.
يوجد طلب تنبيه محفوظ لهذا المقاس. يمكنك تحديث رقم التواصل.|An alert is saved for this size. You can update the contact number.
يوجد عيب أو تلف|Fault or damage
١–٢ يوم|1–2 days
٢–٤ أيام|2–4 days
١–٢ يوم عمل · إضافة ٥٬٠٠٠ د.ع|1–2 working days · add 5,000 IQD
١–٢ يوم عمل · تقدير تجريبي|1–2 working days · demo estimate
٢–٤ أيام عمل · مجاني من ١٠٠٬٠٠٠ د.ع|2–4 working days · free from 100,000 IQD
رسالة الهدية (اختياري)|Gift message (optional)
لم يُحصّل أي مبلغ نقدي. لا يوجد مبلغ محصّل للاسترداد.|No cash has been collected. There is no collected amount to refund.
لا يوجد تحصيل نقدي مسجّل|No cash collection recorded
`);
add(`
سبق تقييمها|Already reviewed
عرض|Demo
نموذج أرشيفي|Archived example
تُستخدم صورة العرض نفسها لقطعة أخرى من المجموعة لتوضيح التشكيلة التجريبية. اللون البديل موضح بالعينة فقط.|The same demo photo is reused for another item to illustrate the collection. The alternative colour is shown as a swatch only.
حذف المحدد|Remove selected
نسخ الرابط|Copy link
· تقييم توضيحي|· Example review
أداة العرض: انتقلي إلى المرحلة التالية لاختبار تتبّع الطلب.|Demo tool: move to the next stage to test order tracking.
أضيفي بطاقة اختبار، أو اختاريها عند إكمال الطلب.|Add a test card or select one during checkout.
أضيفي عنواناً واضحاً لنتمكن من إيصال طلبك بسهولة.|Add a clear address to help deliver your order.
أنتِ على اطلاع|You are up to date
أهلاً بكِ في Monarca.|Welcome to Monarca.
أوافق على تقديم هذا الطلب التجريبي، وأعلم أنه لا ينفّذ شحناً أو استرداداً حقيقياً.|I agree to submit this demo request and understand it creates no real shipment or refund.
إجمالي الدفع|Payment total
إرسال طلب الإرجاع|Submit return request
إشعار توضيحي · اليوم|Demo notification · today
إعادة تجهيز الرمز|Request another code
إلى|To
ابحث عن المنتجات|Search products
ابحثي بالصورة واكتشفي منتجات مشابهة.|Search by photo to discover similar pieces.
اختاري البطاقة الجاهزة|Choose a ready test card
اختاري السبب|Choose a reason
اختاري الطريقة المناسبة|Choose a suitable method
اختاري القطع والكمية ونوع الخدمة. تحتفظ كل قطعة بطلبها الأصلي؛ لا يؤثر الإرجاع الجزئي في بقية الطلب.|Choose items, quantities and service type. Each item stays linked to its original order; partial returns do not affect the rest.
اختاري القطعة والسبب. هذا الطلب يحاكي خدمة ما بعد البيع ولا ينفّذ إرجاعاً أو استرداداً حقيقياً.|Choose an item and reason. This simulates after-sales service without a real return or refund.
اختاري المدينة|Choose an Iraqi region
اختاري الموعد المناسب. يُحفظ الطلب محلياً فقط، ولا يُرسل إلى شركة توصيل.|Choose a suitable time. The request is saved locally and is not sent to a courier.
اختاري قطعة من الطلب المستلم|Choose an item from the delivered order
اختاري ما يناسبك، ثم اعرضي النتائج.|Choose your preferences, then view results.
اختاري مدينة لعرض تقدير التوصيل. التفاصيل الكاملة تُضاف عند الطلب.|Choose an Iraqi region for a delivery estimate. Add full details during checkout.
استخدام|Use
استخدامها افتراضياً في الدفع التجريبي|Use as default for demo payments
اسم توضيحي للبطاقة|Demo card label
الاسم الكامل *|Full name *
التأكيد|Confirmation
الترتيب|Sort
التفاصيل|Details
الحد الأعلى للسعر|Maximum price
الدفع عبر Visa و Mastercard محاكاة. لا يتم خصم أموال أو إرسال طلبات إلى بائع. لا تدخلي بيانات بطاقة مصرفية حقيقية.|Visa and Mastercard payments are simulated. No money is charged and no order is sent to a seller. Use no real card details.
الرسوم والخصومات قواعد تجريبية. يتحدّث التوصيل بعد اختيار عنوانك.|Fees and discounts follow demo rules. Delivery updates when you choose an address.
الشقة / الطابق (اختياري)|Apartment / floor (optional)
الصور المختارة تبقى في جلسة متصفحك ولا ترفع لخادم. سلة التسوق والعنوان والطلبات محفوظة محلياً للتجربة. يمكن مسحها من الإعدادات. تستخدم النسخة صور العرض المقدمة من العميل وصوراً توضيحية مولدة بالذكاء الاصطناعي.|Selected photos stay in your browser session and are not uploaded. Your bag, address and orders are saved locally and can be cleared in Settings. Images come from client references and AI-generated demo visuals.
الصور والبيانات|Photos and data
الصورة للون البني؛ اللون الآخر موضح بالعينة.|Photo shows brown; the other colour is shown as a swatch.
الطلب المرتبط|Linked order
العملة: الدينار العراقي (IQD)|Currency: Iraqi dinar (IQD)
العناية التجريبية|Demo care
الفترة المناسبة *|Preferred time slot *
القصّة / الأبعاد|Fit / dimensions
القطعة مختلفة عن المتوقع|Item differs from expected
اللغة: العربية|Language: Arabic
المحافظة / المدينة *|Iraqi region / city *
المدينة|City
المقاس البديل *|Replacement size *
المقاس المتوفر|Available size
المقاس المطلوب:|Requested size:
المنطقة: العراق|Region: Iraq
انسخي رابط القطعة لمشاركتها مع صديقاتك أو فتحها مباشرة في متجر Monarca.|Copy the link to share this piece with friends or open directly in Monarca boutique.
بانتظار الإجابة في تجربة العرض|Awaiting a demo answer
بدون طلب مرتبط|No linked order
بعض أجهزة الكمبيوتر تفتح اختيار الملفات بدلاً من الكاميرا. ارفعي صورة واضحة لقطعة واحدة بصيغة JPG أو PNG أو WebP. الحد الأعلى ١٠ ميغابايت.|Some computers open a file picker instead of a camera. Upload a clear photo of one item in JPG, PNG or WebP, up to 10 MB.
تأكيد إلغاء الطلب|Confirm order cancellation
تأكيد وتسجيل الدخول|Confirm and sign in
تجاوزتِ عدد المحاولات. انتظري دقيقة ثم أعيدي تجهيز الرمز.|Too many attempts. Wait one minute, then request another code.
تجربة محلية فقط؛ لن تُرسل رسالة SMS أو إشعار حقيقي.|Local demo only; no SMS or real notification is sent.
تفاصيل إضافية (اختياري)|Extra details (optional)
تفاصيل إضافية (مطلوبة لسبب آخر)|Extra details (required for other reason)
تفاصيل تخصّك وحدك.|Details that are yours alone.
تقدير التوصيل: ٢–٤ أيام عمل (مثال). الأسعار والشحن بيانات تجريبية.|Estimated delivery: 2–4 working days (example). Prices and shipping are demo data.
تقدير تجريبي: ٢–٤ أيام عمل · الدفع عبر Visa و Mastercard|Demo estimate: 2–4 working days · Visa and Mastercard payment
تم تسجيل السؤال في النموذج التجريبي. لا يتم إرساله إلى فريق خدمة عملاء حقيقي.|Question saved in the prototype. It is not sent to a live customer care team.
تم حفظ طلبك التجريبي بنجاح.|Your demo order was saved.
توصيل تجريبي إلى محافظات العراق: بغداد ٥٬٠٠٠ د.ع، باقي المدن ٧٬٠٠٠ د.ع. مجاني للطلبات من ١٠٠٬٠٠٠ د.ع قبل الخصم.|Demo delivery across Iraq: Baghdad 5,000 IQD; other regions 7,000 IQD. Free from 100,000 IQD before discounts.
تُعرض سياسة الإرجاع أثناء إتمام الطلب. بيانات السياسة والعناية والمدة تحتاج اعتماد المتجر قبل الإطلاق.|Return policy appears during checkout. Policy, care details and timing need store approval before launch.
جارٍ البحث عن منتجات مشابهة…|Finding similar pieces…
جارٍ تجهيز الرد التوضيحي…|Preparing a demo reply…
جرّبي تخفيف التصفية أو استخدام كلمة أقصر مثل «حقيبة» أو «قميص».|Try fewer filters or a shorter word, such as “bag” or “shirt”.
جرّبي عبارة أقصر أو اختاري قسماً آخر، ويمكنك فتح طلب مساعدة.|Try a shorter phrase or another category, or open a support request.
حتى ٣ صور، بحد أقصى ٤ ميغابايت للصورة. تُحفظ نسخة مصغرة محلياً للعرض فقط.|Up to 3 photos, 4 MB each. A thumbnail is saved locally for display only.
حفظ التعديلات|Save changes
حفظ المدينة|Save region
حفظ الموعد التجريبي|Save demo time
حفظ بطاقة الاختبار|Save test card
حفظ طلب التنبيه|Save alert request
دخول تجريبي برقم هاتف عراقي. يمكنك إتمام الشراء كضيفة أيضاً.|Demo sign-in with an Iraqi number. You can also check out as a guest.
دخول تجريبي من هذا المتصفح|Demo sign-in from this browser
رابط القطعة|Item link
رقم التواصل|Contact number
رقم المبنى (اختياري)|Building number (optional)
رمز التحقق التجريبي هو|The demo verification code is
رمز التحقق من ٤ أرقام|4-digit verification code
رمز القطعة|Item code
سؤالك · محفوظ محلياً|Your question · saved locally
سبب الإرجاع *|Return reason *
سبب الإلغاء *|Cancellation reason *
سبب الطلب *|Request reason *
ستعودين لخطوة الدخول وتتحققين برمز العرض 1234. بيانات التسوّق المحلية تبقى محفوظة، ولا يتم تغيير هاتف عنوان التوصيل تلقائياً.|Return to sign-in and use demo code 1234. Local shopping data stays saved, and the delivery address phone is not changed automatically.
ستُزال البطاقة من قائمة البطاقات المحفوظة فقط. تبقى تفاصيل طلباتك السابقة محفوظة.|Only the saved card is removed. Previous order details remain saved.
سيتم مسح السلة والعنوان والمفضلة والطلبات المحفوظة على هذا المتصفح، وإعادة الطلبات التوضيحية.|This clears the bag, address, wishlist and orders saved in this browser and restores sample orders.
سيتم مسح سجل البحث وتصفية المنتجات والخيارات المؤقتة. تبقى السلة والطلبات والعناوين والملف ومحادثات الدعم محفوظة.|This clears search history, product filters and temporary options. Your bag, orders, addresses, profile and support conversations remain.
سيُزال دخولك التجريبي من هذا الجهاز. تبقى السلة والمفضلة والطلبات والعناوين المحلية محفوظة.|You will be signed out of the demo. Your local bag, wishlist, orders and addresses remain saved.
شروط التجربة وسياسة المتجر|Demo terms and store policy
صور توضيحية (اختياري)|Demo photos (optional)
ضعي القطعة داخل الإطار|Place the item inside the frame
طلب إرجاع تجريبي · قيد المراجعة|Demo return request · under review
طلبك تأكّد!|Your order is confirmed!
عرض القطع المتوفرة فقط|Show in-stock items only
عرض النتائج|Show results
عملة العرض: الدينار العراقي (IQD)|Display currency: Iraqi dinar (IQD)
عمليات بحث رائجة|Popular searches
عند طلب إذن الكاميرا اختاري السماح. إذا لم يتم السماح، يمكنك استخدام «اختر من الصور» لرفع صورة من جهازك.|Allow camera access when asked. If unavailable, use Choose photo to upload from your device.
عنوان مختصر|Short title
قد تعجبك|You may like
قد يعجبك أيضاً|You may also like
قسائم توضيحية قابلة للتجربة في سلة التسوق.|Demo coupons to try in your shopping bag.
قسيمتك محفوظة، لكن لم يتم تحديد أي قطعة للدفع. حددي القطع في حقيبة التسوق ثم طبّقي القسيمة؛ القطع غير المحددة لا تدخل في الحد الأدنى.|Your coupon is saved, but no items are selected for payment. Select items in your bag and apply it; unselected items do not count towards minimum spend.
قطع أحببتِها، لتعودي إليها متى شئتِ.|Pieces you love, ready whenever you return.
كل الألوان|All colours
كل الطلبات في هذه النسخة تجريبية. الطلبات المسبقة موضّحة بعبارة «طلب توضيحي».|All orders in this version are simulated. Sample orders are marked Demo order.
كل المقاسات|All sizes
كيف يمكننا مساعدتك اليوم؟|How can we help today?
لا توجد إشعارات في هذا القسم حالياً.|No notifications in this section yet.
لا توجد بطاقات محفوظة|No saved cards
لا توجد تقييمات بهذه الدرجة. اختاري «الكل» للعودة.|No reviews with this rating. Choose All to return.
لا توجد زوايا تصوير إضافية في هذه النسخة؛ عرض «تفصيل الصورة» هو تكبير لنفس صورة العرض.|No additional photo angles are available. Photo detail enlarges the same demo image.
لا توجد طلبات مدفوعة لعرض ترتيب القطع بعد.|No paid orders to rank items yet.
لا نطلب إدخال رقم بطاقة أو CVV هنا. البطاقتان بيانات اختبار ثابتة.|No card number or CVV is entered here. Both cards use fixed test details.
لا يتم تنفيذ استرداد مالي حقيقي.|No real refund is issued.
لديك صورة لقطعة أعجبتك؟|Have a photo of a piece you love?
لكل يوم، قطعة مميزة.|A special piece for every day.
للتجربة: بغداد ٥٬٠٠٠ د.ع، المدن الأخرى ٧٬٠٠٠ د.ع، وتوصيل مجاني من ١٠٠٬٠٠٠ د.ع قبل الخصم. المدة ٢–٤ أيام عمل مثال توضيحي فقط.|Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD; free from 100,000 IQD before discounts. The 2–4 working-day estimate is illustrative only.
لم نجد إجابة مطابقة|No matching answer found
لم نعثر على قطعة مطابقة|No matching pieces found
لم يكتمل الدفع. يمكن إعادة المحاولة بالطلب نفسه دون إنشاء طلب مكرر.|Payment is incomplete. Retry the same order without creating a duplicate.
لم يُخصم أي مبلغ ولم يتم إنشاء طلب. سلتك وعنوانك محفوظان.|No charge was made and no order was created. Your bag and address are saved.
لم يُسجّل عنوان لهذا الطلب.|No address saved for this order.
لمسة إضافية لاختيارك.|A little extra for your choice.
محادثة تجريبية · الردود آلية لتوضيح التصميم|Demo conversation · automated replies illustrate the design
محلي|Local
مقاس موحّد للعرض. أبعاد الحقيبة والمواد بانتظار اعتماد المنتج من العميل.|One-size demo. Bag dimensions and materials await client approval.
مقاسات توضيحية؛ تُستبدل بجدول المورّد قبل الإطلاق.|Demo measurements; replace with the supplier chart before launch.
ملاحظات التوصيل (اختياري)|Delivery notes (optional)
ملاحظة للمندوب (اختياري)|Courier note (optional)
من|From
منطقة التوصيل *|Iraqi delivery region *
موضوع المساعدة|Support topic
نتيجة الدفع هنا تختارينها لاختبار مساري النجاح والفشل في التصميم.|Choose the payment result to test success and failure flows.
نطاق السعر بالدينار العراقي|Price range in Iraqi dinars
نعتني بتفاصيل تجربتك.|Care in every detail of your experience.
نوع البطاقة|Card network
هذا طلب تجريبي على جهازك، ولا يتضمن شحناً أو دفعاً حقيقياً.|This demo order stays on your device and creates no real shipment or payment.
هذا نموذج تفاعلي لعرض التصميم وتجربة المستخدم، وليس متجراً فعلياً. المنتجات والأسعار والتقييمات والعروض بيانات عرض، وتحتاج اعتماد المتجر قبل الإطلاق.|An interactive design prototype rather than a live store. Products, prices, reviews and offers are demo data requiring store approval before launch.
هذه القطعة ليس لها مقاس بديل متاح. اختاري إرجاعاً أو أزيلي تحديدها.|No replacement size is available. Choose a return or deselect this item.
هذه المحادثة الداخلية محاكاة محلية ولا تتصل بموظف. التواصل مع المتجر عبر واتساب متاح من مركز العناية بعد اعتماد رقم المتجر.|This in-app conversation is local and contacts no staff. WhatsApp contact is available from the care centre once the store number is approved.
هذه النسخة مصممة للسوق العراقي. دعم الكردية أو الإنجليزية يمكن إضافته ضمن نطاق التطوير النهائي.|Arabic and English are available for Iraq. Delivery country and IQD currency remain unchanged.
هذه محاكاة؛ لم يُرسل طلب إلى شركة توصيل.|This is a simulation; no request was sent to a courier.
هل تريدين إزالة هذا العنوان من دفتر العناوين؟ الطلبات السابقة تحتفظ بعناوينها.|Remove this address from your address book? Previous orders retain their addresses.
هل تريدين إزالة هذه القطعة من السلة؟|Remove this item from the bag?
هل تريدين إلغاء الطلب التجريبي؟|Cancel this demo order?
هل تريدين مسح القطع التي شاهدتِها مؤخراً على هذا الجهاز؟|Clear recently viewed pieces on this device?
هل تم حل المشكلة؟ يمكنك إعادة فتح المحادثة لاحقاً من طلبات المساعدة.|Has this been resolved? Reopen the conversation later from Support requests.
يحفظ هذا النموذج عنوان توصيل واحداً على جهازك.|This prototype saves delivery addresses on your device.
يمكن اختبار الإلغاء قبل الشحن، وطلب الإرجاع بعد التسليم. هذه حالات تصميم ولا تمثل سياسة تجارية أو وعداً باسترداد مالي. ستُستبدل بالشروط المعتمدة للعميل.|Test cancellation before shipping and returns after delivery. These design states are neither store policy nor a refund promise. Replace with approved client terms.
يمكنك الآن متابعة تفاصيله وحالة التوصيل.|You can now follow order details and delivery status.
يمكنك بدء طلب مساعدة جديد، وستظهر متابعة المحادثة هنا.|Start a support request; conversation updates will appear here.
يوجد عيب في القطعة|Item has a fault
يوم التسليم *|Delivery day *
١ ظهراً – ٥ مساءً|1 PM – 5 PM
٥ مساءً – ٩ مساءً|5 PM – 9 PM
٩ صباحاً – ١ ظهراً|9 AM – 1 PM
١٠–١٢٠٠ حرف. لا تضيفي بيانات البطاقة أو رمز التحقق.|10–1,200 characters. Leave out card details and verification codes.
Monarca · تصميم حسب مرجع العميل.|Monarca · Designed from the client reference.
Monarca · نسخة 1.0|Monarca · Version 4.6
`);
add(`
أهلاً،|Hello,
حذف المحدد|Remove selected
المقاسات|Sizes
حتى|Until
استُخدمت في|Used on
المدفوع|Paid
المبلغ المستحق|Amount due
المبلغ المستحق بعد الإلغاء|Amount due after cancellation
ألغي قبل التحصيل|Cancelled before collection
تم التحصيل تجريبياً|Collected in demo
تم تسجيل تحصيل تجريبي محلي. لا توجد حركة مالية حقيقية.|A local demo collection was recorded. No real money moves.
لم يُحصّل أي مبلغ نقدي. محاكاة التسليم لا تؤكد التحصيل.|No cash has been collected. Simulated delivery does not confirm payment collection.
المبلغ مستحق عند الاستلام. لم يُحصّل أي مبلغ نقدي.|Payment is due on delivery. No cash has been collected.
عملية توضيحية سابقة|Previous demo transaction
طلب توضيحي سابق|Previous demo order
مرجع المحاكاة|Simulation reference
إلغاء طلب مدفوع|Cancel a paid order
`);
add(`
أدخل رقم هاتف عراقي صحيحاً: 07 متبوعاً بـ 9 أرقام، أو +964 ثم 7 و9 أرقام.|Enter a valid Iraqi number: 07 followed by 9 digits, or +964 then 7 and 9 digits.
أدخلي رقم هاتف عراقي صحيحاً.|Enter a valid Iraqi phone number.
أضيفت إلى حقيبتك|Added to your bag
أضيفت القطع المتوفرة إلى السلة|Available items added to bag
أضيفي اسم شركة التوصيل.|Enter the courier name.
أضيفي تفاصيل لا تقل عن ٥ أحرف عند اختيار سبب آخر.|Enter at least 5 characters for Other reason.
أضيفي تفاصيل لا تقل عن ٥ أحرف لسبب الإلغاء.|Enter at least 5 characters explaining cancellation.
أضيفي رقم بوليصة أو رمز استلام من ٤ أحرف على الأقل.|Enter a tracking or collection code of at least 4 characters.
أضيفي عنوانك لتصبح تجربة التسوق أسهل.|Add an address for an easier shopping experience.
أضيفي قطعة أولاً لإكمال الطلب.|Add an item first to complete the order.
أضيفي قطعة تحبينها، ودعينا نكمل إطلالتك.|Choose a piece you love to complete your look.
أكملي عنوان المدينة الجديدة. عنوانك السابق محفوظ حتى التأكيد.|Complete the new city's address. Your previous address is saved until confirmation.
أكّدي تسجيل التسليم التجريبي.|Confirm recording the demo handover.
ألغي قبل التحصيل.|Cancelled before collection.
ألغي قبل الدفع|Cancelled before payment
أهلاً بكِ|Welcome
أهلاً بكِ في M|Welcome to Monarca
أين طلبي؟|Where is my order?
إرجاع دون استرداد|Return without refund
إرجاعها|Return
إزالة القطعة|Remove item
إضافة صورة|Add photo
إضافة عنوان التوصيل|Add delivery address
إعادة المحاولة|Try again
إعادة الموعد|Reschedule
إعادة الموعد متاحة للشحنة في الطريق فقط.|Only shipments on the way can be rescheduled.
إعادة شراء القطع|Buy items again
إعادة ضبط|Reset
إعادة محاولة الدفع|Retry payment
إلى أين نوصّل اختياراتك؟|Where shall we deliver?
ابدئي بتجربة تسوق جديدة.|Start a new shopping experience.
اختاري سبب الإلغاء.|Choose a cancellation reason.
اختاري سبباً للطلب.|Choose a reason for this request.
اختاري صور JPG أو PNG أو WebP فقط.|Choose JPG, PNG or WebP images only.
اختاري طريقة إعادة القطع.|Choose a return method.
اختاري قطعة واحدة على الأقل.|Choose at least one item.
اختاري مقاساً بديلاً متاحاً لكل قطعة، أو قللي الكمية.|Choose an available replacement size for each item or reduce the quantity.
اختاري موعداً خلال ٣٠ يوماً من اليوم.|Choose a date within 30 days of today.
اختاري موعداً صحيحاً ابتداءً من الغد.|Choose a valid date from tomorrow onwards.
اختيار بطاقة أخرى|Choose another card
اختياراتك، طلباتك، وكل ما تحبين|Your choices, orders and favourites
ادفعي باستخدام بطاقة Mastercard · محاكاة|Pay with Mastercard · simulation
ادفعي باستخدام بطاقة Visa · محاكاة|Pay with Visa · simulation
استبدال|Exchange
استبدال المقاس|Exchange size
استبدالها|Exchange
استرداد إلغاء الطلب|Cancellation refund
استكشفي كل المنتجات|Explore all products
اشترِ الآن|Buy now
اضغطي على القلب بجانب أي قطعة لحفظها هنا.|Tap the heart beside any piece to save it here.
افتحي طلباً تم تسليمه واختاري «طلب إرجاع أو استبدال».|Open a delivered order and choose Request return or exchange.
اكتمال الاستبدال|Exchange complete
اكتملت رحلة طلبك.|Your order journey is complete.
الأحدث أولاً|Newest first
الاحتفاظ بالقطعة|Keep item
الاستبدال|Exchange
الاستبدال بنفس المنتج واللون وبمقاس آخر من المخزون. لا يُخصم أي مبلغ في هذا النموذج.|Exchange for the same product and colour in another available size. No charge is made in this prototype.
الاستبدال والإرجاع|Exchanges and returns
الاسترداد التقديري إلى البطاقة الأصلية|Estimated refund to original card
التفاصيل والعناية|Details and care
التوصيل المتوقع: خلال ٢–٤ أيام عمل (مثال)|Estimated delivery: 2–4 working days (example)
التوصيل علينا|Delivery on us
الحد الأقصى ٣ صور. اختاري عدداً أقل.|Maximum 3 photos. Choose fewer images.
الحد الأقصى ٤ ميغابايت للصورة.|Maximum 4 MB per photo.
الدفع التجريبي|Demo payment
الرمز غير صحيح. رمز التجربة هو 1234.|Incorrect code. The demo code is 1234.
السعر: من الأعلى للأقل|Price: high to low
السعر: من الأقل للأعلى|Price: low to high
الشركة / المندوب|Company / courier
الشروط وسياسة المتجر|Terms and store policy
الصور المرفقة|Attached photos
الصورة أكبر من ١٠ ميغابايت. اختاري صورة أصغر.|Photo exceeds 10 MB. Choose a smaller photo.
الصورة المرفقة|Attached photo
العودة إلى الطلب|Back to order
العودة إلى تفاصيل الطلب|Back to order details
الكمية المحددة تجاوزت المتاح. راجعي القطع والطلبات السابقة.|The selected quantity exceeds availability. Review items and previous requests.
الكمية المطلوبة تتجاوز المخزون المتاح.|The requested quantity exceeds stock.
المقاس البديل لم يعد متاحاً. تواصلي مع الدعم لمراجعة الطلب.|The replacement size is no longer available. Contact support to review the request.
الملغاة والإرجاع|Cancelled and returned
بقيت قطعتان فقط|Only 2 items left
بيانات تجريبية|Demo details
بيانات شحنة الإرجاع|Return shipment details
تأكيد إلغاء طلب الخدمة|Confirm service cancellation
تابعي حالة الطلب من التأكيد حتى التسليم.|Follow your order from confirmation to delivery.
تجري مراجعة التوفّر والموافقة قبل إرسال البديل. إذا لم يتوفّر المقاس، يمكن إلغاء الطلب وإنشاء طلب إرجاع.|Availability and approval are checked before sending a replacement. If the size is unavailable, cancel and create a return request.
تجري مراجعة الطلب أولاً، ثم إعادة القطع وفحصها قبل إكمال الاسترداد التجريبي. مدة وسياسة المتجر النهائية تحتاج اعتماد العميل.|The request is reviewed before items are returned and inspected, then the demo refund is completed. Final timing and policies need client approval.
تجري مراجعة القطع وإعادتها وفحصها. لا ينشأ سجل استرداد لمبلغ لم يُحصّل.|Items are reviewed, returned and inspected. No refund record is created for an uncollected amount.
تحديث محلي تجريبي|Local demo update
تحديثات التوصيل|Delivery updates
ترحيب بأول اختياراتك|A welcome for your first choices
تصفية وترتيب|Filter and sort
تصفّحي المجموعة|Explore the collection
تعبئة بيانات تجريبية|Fill demo details
تعديل رقم الهاتف|Edit phone number
تعديل عنوان التوصيل|Edit delivery address
تعذّر التسليم في المحاولة السابقة. افتحي تتبّع الشحنة لإعادة تحديد الموعد.|The previous delivery attempt failed. Open shipment tracking to reschedule.
تعذّر التواصل في محاولة التسليم التجريبية.|Contact failed during the demo delivery attempt.
تعذّر حفظ البيانات على هذا الجهاز. يمكنك متابعة التجربة.|Could not save data on this device. You can continue the demo.
تعذّر قراءة إحدى الصور. اختاري صورة أخرى.|Could not read a photo. Choose another.
تغليف هدية|Gift wrapping
تغيير الحالة للتجربة|Change demo status
تغيير طريقة الدفع|Change payment method
تغيّرت حالة الشحنة. افتحي تفاصيل الطلب.|Shipment status changed. Open order details.
تغيّرت حالة الطلب. افتحي تفاصيل طلب الخدمة.|Request status changed. Open service request details.
تفاصيل الإلغاء|Cancellation details
تفاصيل الاستبدال|Exchange details
تفاصيل طلب الخدمة|Service request details
تم إلغاء الطلب التجريبي|Demo order cancelled
تم إلغاء الطلب التجريبي.|Demo order cancelled.
تم إلغاء طلب الخدمة وتحرير كميته.|Service request cancelled; its quantity is available again.
تم إيقاف إعداد الإشعارات التجريبي|Demo notifications disabled
تم إيقاف الطلب قبل إكمال الخدمة.|Request stopped before service completion.
تم استلام الطلب التجريبي|Demo order received
تم استلام طلب الإرجاع التجريبي|Demo return request received
تم استلام طلبك بنجاح.|Your request was received.
تم الإلغاء|Cancelled
تم الإلغاء بطلب من العميلة في النموذج|Cancelled at the customer's request in this prototype
تم التأكيد|Confirmed
تم التقييم · عرض المراجعات|Reviewed · view reviews
تم الشحن|Shipped
تم الطلب|Ordered
تم تأكيد الطلب. المبلغ مستحق عند الاستلام.|Order confirmed. Payment is due on delivery.
تم تحديث الحالة للتجربة|Demo status updated
تم تحديث المرحلة محلياً للتجربة.|Demo stage updated locally.
تم تحديث سجل المحاكاة فقط.|Simulation log updated only.
تم تحديث مرحلة الخدمة للتجربة.|Demo service stage updated.
تم تسجيل الخروج|Signed out
تم تسجيل بيانات الشحنة. افتحي تفاصيل طلب الخدمة لمتابعة الاستلام والفحص.|Shipment details saved. Open service request details to follow receipt and inspection.
تم تسجيل شحنة الإرجاع محلياً.|Return shipment recorded locally.
تم تسجيل معلومات شحنة الإرجاع التجريبية|Demo return shipment details saved
تم تسليم الشحنة لشركة التوصيل.|Shipment handed to courier.
تم تسليم هذا الطلب التوضيحي|Demo order delivered
تم تطبيق القسيمة على طلبك.|Coupon applied to your order.
تم تفعيل إعداد الإشعارات التجريبي|Demo notifications enabled
تم تقديم طلب الخدمة التجريبي.|Demo service request submitted.
تم حفظ الموعد التجريبي.|Demo time saved.
تم حفظ عنوان التوصيل|Delivery address saved
تمت إزالة القسيمة|Coupon removed
تمت إزالة القطعة|Item removed
تمت إضافة الكمية المتاحة فقط|Only the available quantity was added
تمت إعادة ضبط التجربة|Demo reset
تمت الإزالة من المفضلة|Removed from wishlist
تمت الإضافة إلى المفضلة|Added to wishlist
تمت الإضافة إلى حقيبتك|Added to your bag
تمت محاكاة تعذّر التسليم.|Failed delivery simulated.
تواصل مع الدعم|Contact support
توصيل مجاني للطلبات من ١٠٠٬٠٠٠ د.ع.|Free delivery from 100,000 IQD.
تُراجع القطع أولاً، ثم يُرسل نفس المنتج واللون بالمقاس المطلوب المتاح. لا تُضاف القطع البديلة إلى المشتريات ولا تُخصم مبالغ في هذا العرض.|Items are checked first, then the same product and colour is sent in the available replacement size. Replacement items are not added to purchases and no charge occurs.
تُسجّل بيانات إعادة القطع بعد الموافقة على طلب الخدمة.|Return shipment details are recorded after service request approval.
جارٍ البحث…|Searching…
جارٍ التحضير…|Preparing…
جارٍ المعالجة…|Processing…
جرّبي البحث بالصورة لاكتشاف قطع مشابهة.|Try photo search to discover similar pieces.
جرّبي الرمز M10 واكتشفي تفاصيل الخصم.|Try M10 and explore the discount details.
جرّبي رقم طلب أو اسم قطعة آخر.|Try another order number or item name.
جرّبي كلمات أخرى أو امسحي عوامل التصفية.|Try other words or clear the filters.
حالة الطلب تغيّرت ولا يمكن إلغاؤه الآن.|The order status changed and it cannot be cancelled now.
حذاء رياضي|Trainer
حفظ ومتابعة الطلب|Save and continue order
خصم ١٠٪ على المنتجات عند شراء ٥٠٬٠٠٠ د.ع أو أكثر.|10% off items on purchases of 50,000 IQD or more.
راجعي سجل الاسترداد التجريبي أدناه.|View the demo refund history below.
راجعي قائمة طلباتك.|Open your orders list.
رسالة الهدية|Gift message
رسوم تجريبية: بغداد ٥٬٠٠٠ د.ع، المدن الأخرى ٧٬٠٠٠ د.ع. توصيل مجاني للطلبات من ١٠٠٬٠٠٠ د.ع قبل الخصم. اطلبي المساعدة من خدمة العملاء لأي سؤال عن الاستبدال.|Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD. Free from 100,000 IQD before discounts. Ask customer care about exchanges.
رقم البوليصة / الاستلام|Tracking / collection code
رمز الخصم غير صالح. جرّبي M10.|Invalid discount code. Try M10.
ساتان|Satin
ستظهر الطلبات المطابقة للحالة هنا.|Orders matching this status appear here.
ستظهر طلبات هذه الحالة هنا بعد إتمام التسوق.|Orders with this status appear here after shopping.
سلة التسوّق|Shopping bag
سلتك تنتظر اختياراتك|Your bag is waiting for your choices
سلتك فارغة|Your bag is empty
شحن المقاس البديل|Ship replacement size
صورة مرفقة|Attached photo
صورة واحدة، إلهام جديد|One photo. New inspiration.
ضيفة M|Monarca guest
طريقة الإرجاع|Return method
طلب|Request
طلب إرجاع أو استبدال|Request return or exchange
طلب إرجاع قيد المراجعة|Return request under review
طلب إعادة جدولة الموعد|Request reschedule
طلب استبدال|Exchange request
طلب محفوظ|Saved order
طلبك مؤهل للتوصيل المجاني|Your order qualifies for free delivery
طول القدم / سم|Foot length / cm
عرض التفاصيل|View details
عرض الحقيبة|View bag
عرض حقيبتي|View my bag
عرض سجل الاسترداد|View refund history
عرض طلباتي|View my orders
عناويني|My addresses
عند إلغاء الطلب، يُنشأ سجل استرداد تجريبي كامل إلى البطاقة الأصلية. لا ينفّذ هذا النموذج حركة مالية.|Cancelling creates a demo full-refund record for the original card. No money moves in this prototype.
فهمت|Understood
في الطريق إليك|On the way to you
قطع|Items
قطعة|Item
قطعة مختارة لإطلالة يومية متكاملة. اتّبعي تعليمات العناية على الملصق الداخلي. مواصفات المنتج هنا بيانات عرض وتحتاج اعتماد العميل قبل البيع.|A piece chosen for a complete everyday look. Follow the care label. Product specifications are demo data needing client approval before sale.
قيد التنفيذ|In progress
قيد المحاكاة|Simulation in progress
قيمة الإرجاع بعد خصم الطلب|Return value after order discount
قيمة القطع الأصلية بعد الخصم|Original item value after discount
قيمة القطع التي سيُطلب استبدالها|Value of items for exchange
كل المنتجات|All products
كل تفاصيل طلبك هنا|Every order detail is here
لا تتوفر كمية إضافية من هذه القطع|No additional quantity available
لا توجد استردادات مسجلة|No refunds recorded
لا توجد طلبات خدمة هنا|No service requests here
لا توجد طلبات مطابقة|No matching orders
لا توجد طلبات هنا|No orders here
لا توجد نتائج مطابقة|No matching results
لا يمكن إلغاء طلب بعد إرسال القطع. تواصلي مع الدعم.|Cannot cancel after items are sent. Contact support.
لا يمكن الإلغاء بعد الشحن. تواصلي مع الدعم.|Cannot cancel after shipping. Contact support.
لا يوجد طلب بعد|No orders yet
لا يوجد مقاس بديل|No replacement size
لديك كمية من هذه القطعة في السلة. تجاوزت الحد المتاح.|Your bag already has this piece. The available quantity was exceeded.
لم تتوفر قطع إضافية من اختياراتك السابقة.|No additional items available from your earlier choices.
لم تُضف أي عنوان بعد|No addresses added yet
لم يتم العثور على الطلب.|Order not found.
لم يتم تسليم الطلب. عنوانك محفوظ، ويمكنك إعادة تحديد موعد التسليم أو التواصل مع الدعم.|The order was not delivered. Your address is saved; reschedule delivery or contact support.
لم يتم خصم أي مبلغ. لن تُشحن القطع.|No charge was made. Items will not ship.
لم ينجح الدفع التجريبي|Demo payment failed
لم يُحصّل أي مبلغ نقدي. يمكن إعادة القطع دون إنشاء استرداد.|No cash was collected. Items can be returned without creating a refund.
لم يُدفع هذا الطلب. سيُلغى دون خصم أو استرداد.|This order is unpaid. It will be cancelled without a charge or refund.
لن تستمر مراحل الشحن لهذا الطلب.|Shipping stages will not continue for this order.
متابعة الدفع التجريبي|Continue demo payment
متوفر · جاهز لإضافته إلى سلتك|In stock · ready for your bag
محاكاة دفع غير ناجح|Simulate failed payment
محاولة تسليم تجريبية غير ناجحة · لم نتمكن من التواصل|Failed demo delivery attempt · could not contact recipient
محيط الصدر / سم|Bust circumference / cm
مختارات بأسعار خاصة|Selected pieces at special prices
مختارة لك|Chosen for you
مرحباً Monarca، أحتاج مساعدة في إضافة عنوان التوصيل.|Hello Monarca, I need help adding a delivery address.
مرحباً Monarca، أود الاستفسار عن منتجاتكم.|Hello Monarca, I would like to ask about your products.
مرحلة تجريبية|Demo stage
مساحة لقطعك المفضلة|A place for your favourites
مسح التصفية وإظهار الكل|Clear filters and show all
مطلوب · تغليف تجريبي|Requested · demo wrapping
معلومات الاستبدال|Exchange details
ملاحظات|Notes
ملاحظات الطلب|Order notes
ملاحظة التوصيل:|Delivery note:
من الطلب المكتمل اختاري «طلب إرجاع» وأضيفي السبب. الشروط النهائية بانتظار اعتماد المتجر.|Open the completed order, choose Request return and add a reason. Final terms await store approval.
نحتاج موعداً مناسباً لكِ|Choose a suitable time
نراجع القطع ونجهزها بعناية.|We check and prepare each item with care.
نعم، إزالة|Yes, remove
نفس المنتج بمقاس بديل|Same product in another size
هدية صغيرة لاختيارك|A little gift for your choice
هذا اللون أو المقاس غير متاح حالياً|This colour or size is currently unavailable
وقت الإلغاء|Cancellation time
وقت التسليم التجريبي|Demo delivery time
يجب أن يكون الطلب قد تم تسليمه لتقديم الخدمة.|The order must be delivered before requesting this service.
يرجى إدخال الاسم الكامل.|Enter your full name.
يرجى إدخال الحي والشارع لإكمال عنوان التوصيل.|Enter the neighbourhood and street to complete your delivery address.
يرجى إدخال رقم هاتف عراقي صحيح.|Enter a valid Iraqi phone number.
يرجى إضافة أقرب نقطة دالة لتسهيل التوصيل.|Add the nearest landmark to help delivery.
يرجى اختيار اللون.|Choose a colour.
يرجى اختيار المدينة.|Choose an Iraqi region.
يرجى اختيار مقاس متوفر أولاً.|Choose an available size first.
يرجى اختيار ملف صورة صالح.|Choose a valid image file.
يرجى الموافقة على شروط التجربة.|Accept the demo terms.
يرجى الموافقة على شروط الطلب التجريبي.|Accept the demo order terms.
يسعدنا مساعدتك. للتجربة: بغداد ٥٬٠٠٠ د.ع وباقي المدن ٧٬٠٠٠ د.ع، والتوصيل المجاني من ١٠٠٬٠٠٠ د.ع. هذه قواعد عرض فقط.|Happy to help. Demo fees: Baghdad 5,000 IQD; other regions 7,000 IQD; free from 100,000 IQD. These are demo rules only.
يظهر السجل هنا بعد إلغاء طلب مدفوع أو قبول إرجاع القطع.|Records appear after cancelling a paid order or approving a return.
يمكنك متابعة حالة الطلب من «حسابي ← طلباتي ← تتبّع الطلب». هذه إجابة آلية لتوضيح التجربة.|Track status in My account → My orders → Track order. This is an automated demo reply.
يُوزّع خصم الطلب على القطع. لا تشمل القيمة رسوم التوصيل الأصلية.|The order discount is allocated across items. Original delivery fees are excluded.
`);
add(`
إرجاع قيد المراجعة|Return under review
التوصيل إلى العنوان الأصلي.|Delivery to the original address.
شراء مباشر|Buy now
أضف إلى السلة|Add to bag
داخل العراق|Within Iraq
محاكاة دفع ناجح|Simulate successful payment
(اختياري)|(optional)
. لم يتم إرسال رسالة SMS.|. No SMS was sent.
. محاكاة التسليم لا تؤكد تحصيل النقد.|. Simulated delivery does not confirm cash collection.
ملاحظة التوصيل:|Delivery note:
`);
add(`
موعد وصول الطلب المسبق يحدده المتجر.|The store confirms the arrival date for preorder items.
تقدير التوصيل بعد توفر المنتج؛ موعد الطلب المسبق يحدده المتجر.|Delivery is estimated after the item becomes available; the store confirms preorder timing.
`);
add(`
بغداد|Baghdad
البصرة|Basra
أربيل|Erbil
الموصل|Mosul
النجف|Najaf
كربلاء|Karbala
السليمانية|Sulaymaniyah
كركوك|Kirkuk
الناصرية|Nasiriyah
الحلة|Hillah
الرمادي|Ramadi
الديوانية|Diwaniyah
الكوت|Kut
العمارة|Amarah
دهوك|Duhok
بعقوبة|Baqubah
السماوة|Samawah
تكريت|Tikrit
`);
add(`
تحديث تجريبي|Demo update
القطع المراد إرجاعها|Items to return
القطع المراد استبدالها|Items to exchange
قيمة الإرجاع بعد خصم الطلب:|Return value after order discount:
قيمة القطع الأصلية بعد الخصم:|Original item value after discount:
تقديم طلب الإرجاع|Submit return request
تقديم طلب الاستبدال|Submit exchange request
تفاصيل إضافية *|Extra details *
نوع الطلب|Request type
ساعدينا بفهم السبب، خاصة في حال وجود عيب أو اختلاف.|Help us understand the reason, especially for a fault or mismatch.
ساعدينا بفهم السبب, خاصة في حال وجود عيب أو اختلاف.|Help us understand the reason, especially for a fault or mismatch.
`);
add(`
متوفر في العراق|In stock in Iraq
طلب من الصين|Order from China
العراق|Iraq
الصين|China
جهة التوريد|Supply source
اختيار جهة التوريد|Choose supply source
جميع المنتجات|All products
رسوم التوصيل التجريبية ٤ USD للطلب، والتوصيل مجاني من ٧٥ USD قبل الخصم، ولا يحتاج قسيمة.|Demo delivery is 4 USD per order and free from 75 USD before discounts, with no coupon needed.
خصم ١٠٪ بالرمز M10 للطلبات من ٤٠ USD.|Get 10% off with M10 on orders from 40 USD.
المتوفر في العراق يصل خلال نحو يومين، ويمكن الدفع عند الاستلام أو بالبطاقة. الطلب من الصين يحتاج ١٥–٢٠ يوماً ودفعاً مسبقاً بالبطاقة. الطلب المختلط يصل على شحنتين ويحتاج بطاقة. رسوم التوصيل التجريبية ٤ USD للطلب، والتوصيل مجاني من ٧٥ USD قبل الخصم.|In-stock items in Iraq arrive in about 2 days and support cash on delivery or card. China orders take 15–20 days and require prepaid card payment. Mixed orders arrive in two shipments and require a card. Demo delivery is 4 USD per order and free from 75 USD before discounts.
توصيل خلال يومين تقريباً|Delivery in about 2 days
توصيل خلال ١٥–٢٠ يوماً تقريباً|Delivery in about 15–20 days
حوالي يومين|About 2 days
١٥–٢٠ يوماً|15–20 days
الدفع عند الاستلام أو بالبطاقة|Cash on delivery or card
الدفع المسبق بالبطاقة فقط|Prepaid by card only
التوصيل والدفع حسب جهة التوريد|Delivery and payment by supply source
نفس الأناقة، بطريقتين للتسوّق|The same elegance, two ways to shop
شحنات منفصلة بمواعيد مختلفة|Separate shipments with different delivery times
عرض المنتجات|View products
عرض القطع المتوفرة في العراق فقط|Show in-stock items in Iraq only
توصيل خلال يومين تقريباً · الدفع عند الاستلام أو بالبطاقة|Delivery in about 2 days · cash on delivery or card
توصيل خلال ١٥–٢٠ يوماً تقريباً · الدفع المسبق بالبطاقة فقط|Delivery in about 15–20 days · prepaid by card only
متوفر في العراق · توصيل خلال يومين تقريباً|In stock in Iraq · delivery in about 2 days
طلب من الصين · توصيل خلال ١٥–٢٠ يوماً تقريباً|Order from China · delivery in about 15–20 days
رسوم التوصيل التجريبية ٤ دولارات، ومجاناً للطلبات من ٧٥ دولاراً قبل الخصم. المتوفر في العراق يصل خلال يومين تقريباً، والطلب من الصين خلال ١٥–٢٠ يوماً تقريباً.|Demo delivery is 4 USD and free from 75 USD before discounts. In-stock items in Iraq arrive in about 2 days; orders from China take about 15–20 days.
دفع مسبق ببطاقة Visa أو Mastercard|Prepaid by Visa or Mastercard
طلبات الصين تتطلب الدفع المسبق ببطاقة Visa أو Mastercard. الدفع عند الاستلام متاح لقطع العراق الجاهزة فقط.|China orders require prepaid Visa or Mastercard payment. Cash on delivery is available only for ready-stock items in Iraq.
الدفع عند الاستلام متاح لقطع العراق الجاهزة في هذا الطلب.|Cash on delivery is available for the ready-stock items in Iraq in this order.
المتوفر في العراق يمكن دفعه عند الاستلام أو ببطاقات Visa و Mastercard. الطلب من الصين والطلب المختلط يحتاجان دفعاً مسبقاً بالبطاقة. جميع عمليات الدفع في هذه النسخة محاكاة.|Ready-stock items in Iraq support cash on delivery or Visa and Mastercard. China and mixed orders require prepaid card payment. Every payment in this version is simulated.
تصل قطع العراق وقطع الصين في شحنتين بموعدين مختلفين. يتطلب الطلب المختلط الدفع المسبق بالبطاقة.|Items from Iraq and China arrive in two shipments at different times. Mixed orders require prepaid card payment.
مدة التوصيل حسب مصدر القطع: العراق حوالي يومين، والصين ١٥–٢٠ يوماً.|Delivery depends on the item source: about 2 days from Iraq and 15–20 days from China.
التوصيل مجاني للطلبات من ٧٥ دولاراً قبل الخصم؛ وإلا ٤ دولارات.|Delivery is free from 75 USD before discounts; otherwise it costs 4 USD.
من ٤٠ دولاراً|From 40 USD
شحنات من العراق والصين|Shipments from Iraq and China
المبالغ بالدولار الأمريكي USD. الإيصال يطابق بيانات الطلب لحظة الشراء ولا يمثّل عملية مالية أو فاتورة ضريبية. هذه محاكاة لشرح تجربة التسوق. لا يوجد شحن أو خصم أو استرداد مالي حقيقي.|Amounts are in US dollars (USD). This receipt matches the order snapshot and is neither a financial transaction nor a tax invoice. It demonstrates shopping only; no real shipment, charge or refund takes place.
إصدار النموذج 4.7|Prototype version 4.7
العربية · العراق · USD|Arabic · Iraq · USD
عملة العرض: الدولار الأمريكي (USD)|Display currency: US dollar (USD)
يدعم التطبيق العربية والإنجليزية. بلد التوصيل العراق، والأسعار بالدولار الأمريكي USD.|The app supports Arabic and English. Delivery is in Iraq and prices are in US dollars (USD).
M10 تخصم ١٠٪ من المنتجات المؤهلة من ٤٠ USD.|M10 takes 10% off eligible items from 40 USD.
توصيل مجاني للطلبات من ٧٥ USD.|Free delivery from 75 USD.
خصم ١٠٪ على المنتجات عند شراء ٤٠ USD أو أكثر.|10% off eligible items on purchases of 40 USD or more.
التوصيل حسب مصدر القطع: العراق نحو يومين، الصين ١٥–٢٠ يوماً (تقديري)|Delivery by item source: about 2 days from Iraq and 15–20 days from China (estimated)
المتوفر في العراق: نحو يومين. الطلب من الصين: ١٥–٢٠ يوماً · الدفع حسب مصدر القطعة|In stock in Iraq: about 2 days. Orders from China: 15–20 days · payment depends on the item source
المتوفر في العراق: نحو يومين. الطلب من الصين: ١٥–٢٠ يوماً. الأسعار والشحن بيانات تجريبية.|In stock in Iraq: about 2 days. Orders from China: 15–20 days. Prices and delivery details are demo data.
المتوفر في العراق يصل خلال نحو يومين، والطلب من الصين خلال ١٥–٢٠ يوماً. رسوم التوصيل التجريبية ٤ USD للطلب، والتوصيل مجاني من ٧٥ USD قبل الخصم.|In-stock items in Iraq arrive in about 2 days; orders from China take 15–20 days. Demo delivery is 4 USD per order and free from 75 USD before discounts.
اختيار منطقة التوصيل ثم إدخال المدينة أو القضاء أو الناحية في دفتر العناوين. المتوفر في العراق يصل خلال نحو يومين، والطلب من الصين خلال ١٥–٢٠ يوماً. رسوم التوصيل التجريبية ٤ USD للطلب، والتوصيل مجاني من ٧٥ USD قبل الخصم.|Choose an Iraqi delivery region, then enter the city, district or subdistrict in the address book. In-stock items in Iraq arrive in about 2 days; China orders take 15–20 days. Demo delivery is 4 USD per order and free from 75 USD before discounts.
رسوم التوصيل التجريبية ٤ USD للطلب، والتوصيل مجاني من ٧٥ USD قبل الخصم. المتوفر في العراق يصل خلال نحو يومين، والطلب من الصين خلال ١٥–٢٠ يوماً.|Demo delivery is 4 USD per order and free from 75 USD before discounts. In-stock items in Iraq arrive in about 2 days; China orders take 15–20 days.
متابعة التجهيز والشحن من «حسابي ← طلباتي». المتوفر في العراق يصل خلال نحو يومين، والطلب من الصين خلال ١٥–٢٠ يوماً. الطلب المختلط يصل على شحنتين. تحديثات التتبع محاكاة.|Follow preparation and delivery under My account → My orders. In-stock items in Iraq arrive in about 2 days; China orders take 15–20 days. Mixed orders arrive in two shipments. Tracking updates are simulated.
الدفع ببطاقات Visa و Mastercard للقسمين، أو الدفع عند الاستلام للمتوفر في العراق فقط. الطلب من الصين والطلب المختلط يحتاجان دفعاً مسبقاً بالبطاقة. هذه محاكاة لا تخصم أموالاً ولا تتصل بمصرف أو مندوب. معلومات العنوان والدفع في صفحة واحدة. لا تُدخل بيانات بطاقة حقيقية أو رموز مصرفية.|Visa and Mastercard work for both sections, while cash on delivery is available only for ready-stock items in Iraq. China orders and mixed orders require prepaid card payment. This simulation makes no charge and does not contact a bank or courier. Address and payment details are on one page. Do not enter real card details or bank codes.
يمكن اختيار Visa أو Mastercard للقسمين، أو الدفع عند الاستلام للمتوفر في العراق فقط. الطلب من الصين والطلب المختلط يحتاجان دفعاً مسبقاً بالبطاقة. معلومات التوصيل والدفع في صفحة واحدة. البطاقة تستخدم بيانات الاختبار فقط، ولا يتم خصم أموال.|Choose Visa or Mastercard for either section, or cash on delivery for ready-stock items in Iraq only. China and mixed orders require prepaid card payment. Delivery and payment are on one page. Use test card details only; no money is charged.
يسعدنا مساعدتك. المتوفر في العراق يصل خلال نحو يومين، والطلب من الصين خلال ١٥–٢٠ يوماً. رسوم التوصيل التجريبية ٤ USD، والتوصيل المجاني من ٧٥ USD.|Happy to help. In-stock items in Iraq arrive in about 2 days; China orders take 15–20 days. Demo delivery is 4 USD and free from 75 USD.
الدولار الأمريكي|US dollar
أسعار بالدولار الأمريكي|Prices in US dollars
نطاق السعر بالدولار الأمريكي|Price range in US dollars
يجب أن يكون الحد الأعلى أكبر من أو مساوياً للحد الأدنى، ضمن ٠–٨٠٠ دولار.|Maximum price must be at least the minimum, within $0–$800.
تتوفر العربية والإنجليزية لواجهة التطبيق. بلد التوصيل العراق وعملة العرض USD.|Arabic and English are available. Delivery is in Iraq and display prices are in USD.
تتوفر العربية والإنجليزية. بلد التوصيل العراق والعملة الدولار الأمريكي USD. الأسعار تجريبية وليست تحويلاً فورياً للعملة.|Arabic and English are available. Delivery is in Iraq and prices are in US dollars (USD). Prices are demo values, not live currency conversion.
`);
// Additional fixed UI strings can be registered without changing business state.
const monthNames={'يناير':'January','كانون الثاني':'January','فبراير':'February','شباط':'February','مارس':'March','آذار':'March','أبريل':'April','نيسان':'April','مايو':'May','أيار':'May','يونيو':'June','حزيران':'June','يوليو':'July','تموز':'July','أغسطس':'August','آب':'August','سبتمبر':'September','أيلول':'September','أكتوبر':'October','تشرين الأول':'October','نوفمبر':'November','تشرين الثاني':'November','ديسمبر':'December','كانون الأول':'December'};
let lang='ar',requestedLanguage='';
try{requestedLanguage=new URLSearchParams(w.location?.search||'').get('lang');}catch{}
if(['ar','en'].includes(requestedLanguage))lang=requestedLanguage;
else try{const saved=(w.localStorage||localStorage).getItem(storageKey);if(['ar','en'].includes(saved))lang=saved;}catch{}
const knownLocalities=new Set(['بغداد','البصرة','أربيل','الموصل','النجف','كربلاء','السليمانية','كركوك','الناصرية','الحلة','الرمادي','الديوانية','الكوت','العمارة','دهوك','بعقوبة','السماوة','تكريت']);
function english(s,record=true){
 let key=normalize(s);if(!key)return s;
 if(dictionary[key])return dictionary[key];
 const nkey=normalize(neutral(s));if(dictionary[nkey])return dictionary[nkey];
 let v=western(key);
 if(dictionary[v])return dictionary[v];
 // Date/number formatting is limited to UI nodes; user content is skipped by html/localize.
 v=v.replace(/د\.ع/g,'IQD').replace(/(^|[\s,،])دينار(?=$|[\s.,،])/g,'$1IQD');
 for(const [ar,en] of Object.entries(monthNames).sort((a,b)=>b[0].length-a[0].length))v=v.split(ar).join(en);
 v=v.replace(/(\d) م(?=$|\s*[·،])/g,'$1 PM').replace(/(\d) ص(?=$|\s*[·،])/g,'$1 AM');
 if(!/[\u0621-\u064a]/.test(v))return v.replace(/،/g,',');
 const patterns=[
 [/^(.+?)، ([\d,.]+) USD$/,m=>english(m[1],false)+', '+m[2]+' USD'],
 [/^(.+?)، ([\d,]+) IQD$/,m=>english(m[1],false)+', '+m[2]+' IQD'],
 [/^(تحديد|اختيار|كمية|المقاس البديل|حذف|تكبير|جرّب صورة) (.+)$/,m=>({'تحديد':'Select','اختيار':'Select','كمية':'Quantity for','المقاس البديل':'Replacement size for','حذف':'Remove','تكبير':'Zoom','جرّب صورة':'Try photo of'}[m[1]])+' '+english(m[2],false)],
 [/^متاح للخدمة: (\d+) من (\d+)$/,m=>'Available for service: '+m[1]+' of '+m[2]],
 [/^(اللون|المقاس|الكمية|الحد الأدنى|القسيمة|القسيمة المطبقة|التوصيل المتوقع|البناية|نقطة دالة|القطع المطلوبة|المدفوع|المدفوع تجريبياً|الإجمالي|إجمالي الطلب|الإجمالي المدفوع|الإجمالي المستحق|المبلغ المستحق بعد الإلغاء|الكمية التجريبية المتاحة):\s*(.*)$/,m=>({'اللون':'Colour','المقاس':'Size','الكمية':'Quantity','الحد الأدنى':'Minimum spend','القسيمة':'Coupon','القسيمة المطبقة':'Applied coupon','التوصيل المتوقع':'Estimated delivery','البناية':'Building','نقطة دالة':'Landmark','القطع المطلوبة':'Items ordered','المدفوع':'Paid','المدفوع تجريبياً':'Demo amount paid','الإجمالي':'Total','إجمالي الطلب':'Order total','الإجمالي المدفوع':'Total paid','الإجمالي المستحق':'Total due','المبلغ المستحق بعد الإلغاء':'Amount due after cancellation','الكمية التجريبية المتاحة':'Available demo quantity'}[m[1]])+': '+english(m[2],false)],
 [/^([\d,.]+) (قطعة|قطع|قطعة مفضلة|طلبات|طلبات خدمة ما بعد البيع|تقييم|تقييمات توضيحية|نجوم|لون|ألوان|رسائل|إشعارات غير مقروءة)$/,m=>m[1]+' '+({'قطعة':'item(s)','قطع':'items','قطعة مفضلة':'wishlist item(s)','طلبات':'orders','طلبات خدمة ما بعد البيع':'after-sales request(s)','تقييم':'reviews','تقييمات توضيحية':'example reviews','نجوم':'stars','لون':'colour','ألوان':'colours','رسائل':'messages','إشعارات غير مقروءة':'unread notifications'}[m[2]])],
 [/^([\d,.]+) قطع (متاحة في بيانات العرض|محددة|محفوظة)$/,m=>m[1]+' '+({'متاحة في بيانات العرض':'items in demo stock','محددة':'selected items','محفوظة':'saved items'}[m[2]])],
 [/^متوفر · ([\d,.]+) قطع متاحة$/,m=>'In stock · '+m[1]+' available'],
 [/^المرتبة (\d+)$/,m=>'Rank '+m[1]],
 [/^مراجعة توضيحية (\d+)$/,m=>'Example review '+m[1]],
 [/^عرض تقييمات (\d+) نجوم$/,m=>'Show '+m[1]+'-star reviews'],
 [/^(\d) من (\d)$/,m=>m[1]+' out of '+m[2]],
 [/^مفيد \((\d+)\)$/,m=>'Helpful ('+m[1]+')'],
 [/^(متاحة للاستلام|جاهزة للاستخدام|مستخدمة|منتهية) \((\d+)\)$/,m=>english(m[1],false)+' ('+m[2]+')'],
 [/^(\S+) غير متوفر؛ طلب تنبيه$/,m=>m[1]+' unavailable; request alert'],
 [/^وفّري ([\d]+)%$/,m=>'Save '+m[1]+'%'],
 [/^آخر ([\d]+) قطع زرتِها على هذا الجهاز\.$/,m=>'Last '+m[1]+' pieces viewed on this device.'],
 [/^أهلاً، (.+)$/,m=>'Hello, '+m[1]],
 [/^المنزل · (.+)$/,m=>'Home · '+m[1]],
 [/^التوصيل إلى (.+)$/,m=>'Deliver to '+english(m[1],false)],
 [/^الطلب (M-[A-Z0-9-]+)(.*)$/,m=>'Order '+m[1]+english(m[2],false)],
 [/^تفاصيل القطع في الطلب (.+)$/,m=>'Items in order '+m[1]],
 [/^مرتبط بالطلب (.+)$/,m=>'Linked to order '+m[1]],
 [/^خدمة ما بعد البيع لـ (\d+) من (\d+) قطعة$/,m=>'After-sales service for '+m[1]+' of '+m[2]+' item(s)'],
 [/^طلبات المساعدة · (\d+) مفتوحة$/,m=>'Support requests · '+m[1]+' open'],
 [/^القيمة بعد توزيع خصم الطلب:\s*(.*)$/,m=>'Value after order discount: '+english(m[1],false)],
 [/^(متابعة إلى الدفع|متابعة الطلب|تأكيد الطلب التجريبي) · (.*)$/,m=>({'متابعة إلى الدفع':'Continue to payment','متابعة الطلب':'Continue order','تأكيد الطلب التجريبي':'Confirm demo order'}[m[1]])+' · '+english(m[2],false)],
 [/^(\d+)–(\d+) أيام عمل · تقدير تجريبي$/,m=>m[1]+'–'+m[2]+' working days · demo estimate'],
 [/^(\d+)–(\d+) أيام · تقدير تجريبي$/,m=>m[1]+'–'+m[2]+' days · demo estimate'],
 [/^(\d+)–(\d+) (أيام عمل|يوم عمل) · (مجاني من|إضافة) ([\d,]+) IQD \(تجريبي\)$/,m=>m[1]+'–'+m[2]+' working days · '+(m[4]==='مجاني من'?'free from ':'add ')+m[5]+' IQD (demo)'],
 [/^تقدير تجريبي (\d+)–(\d+) أيام عمل · يُؤكد عند الإطلاق$/,m=>'Demo estimate '+m[1]+'–'+m[2]+' working days · confirmed at launch'],
 [/^بطاقة (Visa|Mastercard)(.*)$/,m=>m[1]+' card'+english(m[2],false)],
 [/^طول (\d+) سم · قياس توضيحي$/,m=>m[1]+' cm long · demo measurement'],
 [/^عرض (\d+) × ارتفاع (\d+) × عمق (\d+) سم · قياسات توضيحية$/,m=>'W '+m[1]+' × H '+m[2]+' × D '+m[3]+' cm · demo measurements'],
 [/^ملخص الطلب · (\d+)$/,m=>'Order summary · '+m[1]],
 [/^من ([\d,]+) IQD$/,m=>'From '+m[1]+' IQD'],
 [/^من ([\d,.]+) USD$/,m=>'From '+m[1]+' USD'],
 [/^المبنى (.+)$/,m=>'Building '+m[1]],
 [/^المبلغ المستحق عند الاستلام:\s*(.*)$/,m=>'Amount due on delivery: '+english(m[1],false)],
 [/^الحد الأدنى لهذه القسيمة (.+)\.$/,m=>'Minimum spend for this coupon: '+english(m[1],false)+'.'],
 [/^الرمز غير صحيح\. رمز التجربة 1234\. تبقى (\d+) محاولات\.$/,m=>'Incorrect code. The demo code is 1234. '+m[1]+' attempts remain.'],
 [/^تم تطبيق (\S+) على (السلة|القطع المحددة)\.?$/,m=>'Applied '+m[1]+' to '+(m[2]==='السلة'?'your bag':'selected items')+'.'],
 [/^أضيفي قطعاً للسلة ثم استخدمي الرمز (\S+)$/,m=>'Add items to your bag, then use '+m[1]],
 [/^تمت إضافة ([\d,]+) قطعة بحسب التوفر الحالي\. تُستخدم الأسعار الحالية في الحقيبة\.$/,m=>m[1]+' item(s) added according to current availability. Current prices apply in your bag.'],
 [/^(\S+) غير متوفر$/,m=>m[1]+' unavailable'],
 [/^المبلغ المستحق:\s*(.+)$/,m=>'Amount due: '+english(m[1],false)],
 [/^المدينة المختارة:\s*(.+)$/,m=>'Selected region: '+m[1]],
 [/^الموعد المطلوب:\s*(.+)$/,m=>'Requested date: '+english(m[1],false)],
 [/^طلب إعادة جدولة تجريبي:\s*(.+)$/,m=>'Demo reschedule request: '+english(m[1],false)],
 [/^شحنة البديل التجريبية:\s*(.+)$/,m=>'Demo replacement shipment: '+m[1]],
 [/^مرحباً Monarca، أود الاستفسار عن توصيل طلبي رقم ([A-Z0-9-]+)\.$/,m=>'Hello Monarca, I would like to ask about delivery for order '+m[1]+'.'],
 [/^مرحباً Monarca، أحتاج مساعدة بخصوص طلبي رقم ([A-Z0-9-]+)\.$/,m=>'Hello Monarca, I need help with order '+m[1]+'.'],
 [/^\((\d+) ث\)$/,m=>'('+m[1]+' s)'],
 [/^حذف المحدد \((\d+)\)$/,m=>'Remove selected ('+m[1]+')'],
 [/^صالحة حتى (.+)$/,m=>'Valid until '+m[1]],
 [/^(\d+) مفتوحة$/,m=>m[1]+' open'],
 [/^أُنشئت (.+)$/,m=>'Created '+english(m[1],false)],
 [/^أنتِ (.*)$/,m=>'You '+english(m[1],false)],
 [/^تمت الموافقة التجريبية\. جهّزي القطع بتغليفها الأصلي\. رمز التسليم التجريبي: ([A-Z0-9-]+)\. تواصلي مع الدعم لترتيب الإرجاع في المنتج الفعلي\.$/,m=>'Demo approved. Prepare the items in their original packaging. Demo handover code: '+m[1]+'. Contact support to arrange a return in the live service.'],
 [/^جهّزي القطع المرتبطة بطلب ([A-Z0-9-]+) بتغليفها الأصلي\. عنوان الاستلام الفعلي وتعليمات شركة التوصيل يحددهما المتجر عند اعتماد الخدمة\.$/,m=>'Prepare the items for request '+m[1]+' in their original packaging. The store will provide the actual collection address and courier instructions once the service is approved.'],
 [/^\/ قطعة$/,()=>'/ item'],
 [/^(.+?) · المقاسات (الدولية|الأوروبية)$/,m=>english(m[1],false)+' · '+(m[2]==='الدولية'?'international sizes':'European sizes')],
 [/^(.+?) · مقاس موحّد$/,m=>english(m[1],false)+' · one size']
 ];
 for(const [re,fn] of patterns){const match=v.match(re);if(match){const result=fn(match).replace(/،/g,',');if(record&&/[\u0621-\u064a]/.test(result)&&!knownLocalities.has(key))missing.add(key);return result;}}
 // Composite UI labels have explicit boundaries; unknown segments stay verbatim.
 const parts=v.split(/(\s*[·←—،]\s*|\s+\/\s+)/);if(parts.length>1){const result=parts.map((p,i)=>i%2?p.replace('←','→').replace('،',','):english(p,false)).join('');if(!/[\u0621-\u064a]/.test(result))return result;v=result;}
 if(record&&!knownLocalities.has(key))missing.add(key);return v;
}
function text(value){const raw=String(value??'');if(!raw.trim())return raw;const before=raw.match(/^\s*/)[0],after=raw.match(/\s*$/)[0];return before+(lang==='en'?english(raw):neutral(normalize(raw)))+after;}
const escapeAttr=s=>String(s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const decode=s=>s.replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;|&apos;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&#(\d+);/g,(all,n)=>+n>0&&+n<=0x10ffff?String.fromCodePoint(+n):all);
const voidTags=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
// Only the published China delivery range needs LTR isolation inside Arabic UI text.
// Plain text APIs, accessible attributes and customer-provided values remain plain.
function deliveryRangeMarkup(value){return value.replace(/(^|[\s:،؛(])(١٥–٢٠|15–20)(?=$|[\s.,،؛)])/g,'$1<bdi dir="ltr">15–20</bdi>');}
function html(markup){
 const tokens=String(markup??'').match(/<!--[\s\S]*?-->|<![^>]*>|<(?:[^>"']|"[^"]*"|'[^']*')*>|[^<]+|</g)||[];
 let out='',stack=[],skip=0,option=null;
 for(let token of tokens){
  if(token[0]==='<'){
   const close=token.match(/^<\s*\/\s*([\w:-]+)/),open=token.match(/^<\s*([\w:-]+)/);
   if(close){const name=close[1].toLowerCase();if(name==='option'&&option){const raw=decode(option.raw.replace(/<[^>]*>/g,''));if(!option.hasValue)out=out.slice(0,option.start)+out.slice(option.start).replace(/^<option\b/i,'<option value="'+escapeAttr(raw)+'"');option=null;}let n;do{n=stack.pop();if(n?.skip)skip--;}while(n&&n.name!==name);out+=token;continue;}
   if(!open){out+=token;continue;}
   const name=open[1].toLowerCase(),isMine=/\bclass\s*=\s*["'][^"']*\bmine\b/i.test(token),isBubble=/\bclass\s*=\s*["'][^"']*\bchat-bubble\b/i.test(token),explicitSkip=/\bdata-user-text(?:\s|=|>)/i.test(token)||/\btranslate\s*=\s*["']no["']/i.test(token),ownSkip=['script','style','textarea'].includes(name)||explicitSkip||(isMine&&isBubble)||(name==='p'&&stack.some(x=>x.mine));
   if(!skip&&!explicitSkip&&!['script','style'].includes(name))token=token.replace(/\b(aria-label|aria-description|aria-valuetext|placeholder|title|alt)\s*=\s*(["'])([\s\S]*?)\2/gi,(_,attr,q,value)=>attr+'='+q+escapeAttr(text(decode(value)))+q);
   if(name==='option')option={start:out.length,raw:'',hasValue:/\bvalue\s*=/i.test(token)};
   if(!voidTags.has(name)&&!/\/\s*>$/.test(token)){stack.push({name,skip:ownSkip,mine:isMine});if(ownSkip)skip++;}
   out+=token;
  }else{if(option)option.raw+=token;if(skip){out+=token;continue;}let output=text(decode(token)).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');if(lang==='ar'&&!option&&!stack.some(n=>n.name==='bdi'))output=deliveryRangeMarkup(output);out+=output;}
 }
 return out;
}
const textSources=new WeakMap(),attrSources=new WeakMap();
function protectedNode(node){const el=node?.nodeType===3?node.parentElement:node;return !!el?.closest?.('script,style,[data-user-text],[translate="no"],.chat-bubble.mine,.ac-message.mine p')||(node?.nodeType===3&&!!el?.closest?.('textarea'));}
function localize(root){
 if(!root||typeof root!=='object')return root;
 const visit=node=>{
  if(protectedNode(node))return;
  if(node.nodeType===3){const current=node.nodeValue||'',saved=textSources.get(node),source=saved&&current===saved.output?saved.source:current,output=text(source);textSources.set(node,{source,output});if(output!==current)node.nodeValue=output;return;}
  if(node.nodeType!==1&&node.nodeType!==9&&node.nodeType!==11)return;
  if(node.nodeType===1){
   const saved=attrSources.get(node)||{};
   for(const a of ['aria-label','aria-description','aria-valuetext','placeholder','title','alt']){const value=node.getAttribute?.(a);if(value===null||value===undefined)continue;const source=saved[a]&&value===saved[a].output?saved[a].source:value,output=text(source);saved[a]={source,output};if(output!==value)node.setAttribute(a,output);}
   attrSources.set(node,saved);
   if(node.tagName==='OPTION'&&!node.hasAttribute?.('value'))node.setAttribute('value',node.textContent||'');
  }
  for(const child of Array.from(node.childNodes||[]))visit(child);
 };
 visit(root);return root;
}
let observer=null,observed=new Set();
function observe(){
 if(typeof w.MutationObserver!=='function')return;
 if(!observer)observer=new w.MutationObserver(records=>{observer.disconnect();for(const r of records){if(r.type==='childList')for(const n of r.addedNodes)localize(n);else localize(r.target);}attach();});
 attach();
 function attach(){for(const id of ['app','overlay-root','toast']){const el=d.getElementById?.(id);if(el){observed.add(el);observer.observe(el,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['aria-label','aria-description','aria-valuetext','placeholder','title','alt']});}}}
}
function direction(){return lang==='en'?'ltr':'rtl';}
function locale(){return lang==='en'?'en-IQ':'ar-IQ';}
function setLanguage(value,options={}){
 if(!['ar','en'].includes(value))return lang;lang=value;
 d.documentElement?.setAttribute?.('lang',lang);d.documentElement?.setAttribute?.('dir',direction());
 for(const el of Array.from(d.querySelectorAll?.('.phone')||[]))el.setAttribute('dir',direction());
 try{if(options.persist!==false)(w.localStorage||localStorage).setItem(storageKey,lang);}catch{}
 for(const id of ['app','overlay-root','toast'])localize(d.getElementById?.(id));
 if(options.notify!==false){const C=w.CustomEvent||(typeof CustomEvent==='function'?CustomEvent:null);if(C&&w.dispatchEvent)w.dispatchEvent(new C('monarca:languagechange',{detail:{language:lang,locale:locale(),direction:direction()}}));}
 return lang;
}
function number(value,options={}){return new Intl.NumberFormat(locale(),options).format(value);}
function money(value,currency='USD'){return new Intl.NumberFormat(locale(),{style:'currency',currency,currencyDisplay:'code',minimumFractionDigits:0,maximumFractionDigits:2}).format(value);}
function date(value,options={}){const v=value instanceof Date?value:new Date(value);return isNaN(v.getTime())?'—':new Intl.DateTimeFormat(locale(),{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Baghdad',...options}).format(v);}
w.MonarcaI18n={language:()=>lang,locale,direction,setLanguage,text,html,localize,observe,number,money,date,western,neutral,add,misses:()=>Array.from(missing),clearMisses:()=>missing.clear(),dictionarySize:()=>Object.keys(dictionary).length};
setLanguage(lang,{persist:false,notify:false});observe();
if(d.readyState==='loading')d.addEventListener?.('DOMContentLoaded',()=>{setLanguage(lang,{persist:false,notify:false});observe();},{once:true});
})(window,document);
