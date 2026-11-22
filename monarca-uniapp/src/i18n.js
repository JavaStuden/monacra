import { state } from './store.js';
const dictionary = {
  share: ['مشاركة القطعة', 'Share piece'], photoSearch: ['البحث بالصورة', 'Photo inspiration'],
  bagTitle: ['حقيبة التسوّق', 'Shopping bag'], selectAll: ['تحديد الكل', 'Select all'], saveForLater: ['نقل للمفضلة', 'Move to wishlist'],
  categories: ['الأقسام', 'Categories'], menu: ['القائمة', 'Menu'], viewAll: ['عرض الكل', 'View all'], selectedProducts: ['منتجات مختارة', 'Selected pieces'], shopCategory: ['التسوّق', 'Shop'], browseEdit: ['المختارات', 'The edit'], localTime: ['توصيل خلال ٣–٤ أيام', 'Delivery in 3–4 days'], internationalTime: ['توصيل خلال ١٥–٢٠ يوماً', 'Delivery in 15–20 days'],
  timeless: ['أناقة خالدة', 'Timeless elegance'], timelessNote: ['تفاصيل صغيرة تصنع فرقاً كبيراً', 'Small details make a lasting difference'], shopNow: ['التسوّق الآن', 'Shop now'],
  sourcing: ['اختيار جهة التوريد', 'Choose your delivery'], sourcingNote: ['التوصيل والدفع حسب جهة التوريد', 'Delivery and payment, at a glance'], localTitle: ['متوفر في العراق', 'Available in Iraq'], internationalTitle: ['شحن دولي', 'International collection'], cardOnly: ['الدفع الآمن بالبطاقة', 'Secure card payment'], browseProducts: ['عرض المنتجات', 'View pieces'],
  discoverCategories: ['استكشاف الأقسام', 'Discover categories'], categoryIntro: ['الأسلوب يبدأ من هنا.', 'Your style starts here.'], categoryNote: ['اختيار قسم لاستكشاف القطع المناسبة.', 'Find the pieces that feel like you.'], offers: ['العروض', 'Offers'], bestsellers: ['الأكثر طلباً', 'Customer favourites'], pieces: ['قطع', 'pieces'], chooseType: ['اختيار نوع القطعة', 'Choose a category'], curation: ['اختيارات تتناسق معاً', 'Considered together'], curationNote: ['إطلالات جاهزة للإلهام، وكل قطعة قابلة للتسوّق.', 'Discover pieces that work beautifully together.'],
  details: ['تفاصيل القطعة', 'Piece details'], zoom: ['اضغطي للتكبير', 'Tap to zoom'], fullPhoto: ['القطعة', 'Full view'], detailPhoto: ['تفصيل الصورة', 'Detail'], photoNote: ['عرض كامل + قصّة مكبّرة لنفس صورة العرض.', 'Full view and a detail crop of the same photo.'], aboutPiece: ['عن القطعة', 'About the piece'], deliveryReturns: ['التوصيل والاستبدال', 'Delivery & returns'], completeLook: ['أكملي الإطلالة', 'Complete the look'],
  yourDetails: ['تفاصيلك', 'Your details'], helpSection: ['نحن هنا للمساعدة', 'Here to help'], gift: ['الطلب هدية', 'This order is a gift'], selection: ['اختياراتك', 'Your selection'], paymentMethod: ['طريقة الدفع', 'Payment method'], orderSummary: ['ملخص الطلب', 'Order summary'], checkoutIntro: ['العنوان والتوصيل والدفع في صفحة واحدة.', 'Address, delivery and payment in one place.'], deliveryMethod: ['طريقة التوصيل', 'Delivery method'], bagIntro: ['قطع تستحق أن ترافقك.', 'Pieces worth keeping close.'], myAddress: ['تفاصيل واضحة تساعد في توصيل اختياراتك.', 'A few details to help your pieces find you.'],
  home: ['الرئيسية', 'Home'], catalog: ['المجموعة', 'Collection'], wishlist: ['المفضلة', 'Wishlist'], cart: ['السلة', 'Bag'], account: ['حسابي', 'Account'],
  back: ['رجوع', 'Back'], shop: ['تسوّقي المجموعة', 'Explore the collection'], new: ['مختارات موناركا', 'The Monarca edit'],
  hero: ['تفاصيل بسيطة، أناقة تدوم.', 'Small details. Lasting style.'], heroNote: ['قطع مختارة بعناية، تصلك إلى العراق.', 'Considered pieces, delivered across Iraq.'],
  search: ['ابحثي عن قطعة', 'Find your next piece'], all: ['الكل', 'All'], clothes: ['ملابس', 'Clothing'], shoes: ['أحذية', 'Shoes'], bags: ['حقائب', 'Bags'], accessories: ['إكسسوارات', 'Accessories'],
  sort: ['الترتيب', 'Sort'], newest: ['الأحدث', 'Newest'], priceLow: ['السعر: الأقل أولاً', 'Price: low to high'], priceHigh: ['السعر: الأعلى أولاً', 'Price: high to low'],
  loading: ['جارٍ التحميل…', 'Loading…'], retry: ['حاولي مجدداً', 'Try again'], network: ['تعذّر الاتصال. تحققي من الإنترنت.', 'Could not connect. Check your connection.'],
  empty: ['لا توجد قطع هنا بعد', 'Nothing here yet'], emptyBag: ['سلتك بانتظار اختياراتك', 'Your bag is ready for something lovely'],
  size: ['المقاس', 'Size'], color: ['اللون', 'Colour'], quantity: ['الكمية', 'Quantity'], addBag: ['أضيفي إلى السلة', 'Add to bag'], buyNow: ['اشتري الآن', 'Buy now'], added: ['تمت الإضافة إلى السلة', 'Added to your bag'],
  choose: ['اختاري اللون والمقاس المتاح', 'Choose an available colour and size'], chooseSize: ['اختاري المقاس', 'Choose a size'], unavailable: ['القطعة غير متوفرة', 'This piece is unavailable'],
  stock: ['المتوفر', 'Available'], local: ['توصيل سريع · ٣–٤ أيام', 'Express delivery · 3–4 days'], international: ['شحن دولي · ١٥–٢٠ يوماً', 'International delivery · 15–20 days'],
  material: ['الخامة والعناية', 'Materials & care'], sizeGuide: ['دليل المقاسات', 'Measurements'], checkout: ['إتمام الطلب', 'Checkout'], remove: ['إزالة', 'Remove'],
  subtotal: ['قيمة المنتجات', 'Subtotal'], discount: ['الخصم', 'Discount'], shipping: ['التوصيل', 'Delivery'], total: ['الإجمالي', 'Total'], due: ['المبلغ المستحق', 'Amount due'],
  address: ['عنوان التوصيل', 'Delivery address'], addresses: ['دفتر العناوين', 'Address book'], addAddress: ['إضافة عنوان', 'Add an address'], edit: ['تعديل', 'Edit'], save: ['حفظ', 'Save'],
  name: ['الاسم الكامل', 'Full name'], phone: ['رقم الهاتف العراقي', 'Iraqi phone number'], city: ['المحافظة', 'Governorate'], locality: ['المدينة / القضاء', 'City / district'], area: ['المنطقة', 'Area'], street: ['الشارع', 'Street'], landmark: ['أقرب نقطة دالة', 'Landmark'], building: ['المبنى', 'Building'], apartment: ['الشقة', 'Apartment'],
  invalidAddress: ['أكملي العنوان ورقم هاتف عراقي صحيح', 'Complete your address and enter a valid Iraqi mobile number'],
  coupon: ['رمز الخصم', 'Discount code'], apply: ['تطبيق', 'Apply'], note: ['ملاحظات التوصيل (اختياري)', 'Delivery notes (optional)'], currency: ['عملة الدفع', 'Pay in'],
  rate: ['سعر التحويل الثابت: 1 USD = 3.67 AED', 'Fixed rate: 1 USD = 3.67 AED'],
  termsAccept: ['أوافق على الشروط وسياسة الخصوصية', 'I agree to the terms and privacy policy'], acceptFirst: ['راجعي الشروط ووافقي قبل المتابعة', 'Please review and accept the terms first'],
  pay: ['المتابعة إلى Stripe', 'Continue to Stripe'], payment: ['الدفع الآمن', 'Secure payment'], stripeNote: ['تُدخل بيانات البطاقة على Stripe فقط. يتأكد المتجر من الدفع عبر الخادم.', 'Enter card details only on Stripe. The server confirms your payment.'],
  paymentReturn: ['بعد الدفع، عودي إلى التطبيق للتحقق من الطلب.', 'After paying, return to this app to confirm your order.'], openStripe: ['فتح صفحة الدفع', 'Open secure checkout'], checkPayment: ['التحقق من حالة الدفع', 'Check payment status'],
  paid: ['تم تأكيد الدفع', 'Payment confirmed'], pending: ['بانتظار تأكيد الدفع', 'Awaiting payment confirmation'], failed: ['لم يكتمل الدفع', 'Payment not completed'], noDuplicate: ['إذا خُصم المبلغ، لا تدفعي مجدداً. تحققي من الحالة أو تواصلي معنا.', 'If your card was charged, check the status or contact us before paying again.'],
  order: ['تفاصيل الطلب', 'Order details'], orders: ['طلباتي', 'My orders'], orderNumber: ['رقم الطلب', 'Order number'], recover: ['استعادة طلب برقم الطلب', 'Find an order by its number'], findOrder: ['عرض الطلب', 'Find order'],
  deviceOrders: ['تظهر الطلبات المحفوظة على هذا الجهاز. احتفظي برقم طلبك للاستعادة.', 'These are orders saved on this device. Keep your order number to find it again.'],
  placed: ['تم تأكيد الطلب', 'Order confirmed'], preparing: ['قيد التجهيز', 'Preparing'], shipped: ['تم الشحن', 'Shipped'], delivered: ['تم التسليم', 'Delivered'], cancelled: ['ملغي', 'Cancelled'], payment_pending: ['بانتظار الدفع', 'Awaiting payment'],
  tracking: ['تتبّع الطلب', 'Track order'], trackingNote: ['تعكس الحالة تحديثات المتجر. للتفاصيل حول شركة التوصيل تواصلي معنا.', 'Status reflects store updates. Contact us for carrier details.'],
  support: ['العناية بالعملاء', 'Customer care'], contact: ['تواصلي معنا', 'Get in touch'], whatsapp: ['التواصل عبر واتساب', 'Chat on WhatsApp'], email: ['البريد الإلكتروني', 'Email'],
  guest: ['مرحباً بكِ في Monarca', 'Welcome to Monarca'], guestNote: ['تسوّقي كضيفة. تُحفظ العناوين والمفضلة على هذا الجهاز.', 'Shop as a guest. Addresses and saved pieces stay on this device.'],
  settings: ['الإعدادات', 'Settings'], language: ['اللغة', 'Language'], policies: ['السياسات', 'Store policies'], privacy: ['سياسة الخصوصية', 'Privacy policy'], terms: ['الشروط والأحكام', 'Terms & conditions'], returns: ['الإرجاع والاسترداد', 'Returns & refunds'],
  requestReturn: ['طلب إرجاع', 'Request a return'], reason: ['سبب الإرجاع', 'Reason for return'], sendRequest: ['إرسال الطلب', 'Submit request'], requested: ['تم إرسال الطلب للمراجعة', 'Request sent for review'], returnNote: ['لا ترسلي القطعة قبل استلام التعليمات. إرسال الطلب لا يؤكد الاسترداد.', 'Wait for instructions before sending an item back. A request does not confirm a refund.'],
  currencyNote: ['الأسعار بالدولار الأمريكي. اختاري USD أو AED عند الدفع.', 'Prices are in USD. Choose USD or AED at checkout.'],
  clearLocal: ['مسح العناوين والمفضلة من هذا الجهاز', 'Clear addresses and saved pieces on this device'], clearNote: ['لن تُحذف الطلبات أو سجلات المتجر.', 'Your orders and store records will remain.'], confirm: ['تأكيد', 'Confirm'], cancel: ['إلغاء', 'Cancel'],
  brown: ['بني', 'Brown'], black: ['أسود', 'Black'], cream: ['عاجي', 'Ivory'], gold: ['ذهبي', 'Gold'], olive: ['زيتي', 'Olive'], taupe: ['رمادي دافئ', 'Taupe'],
  storage: ['تعذّر حفظ البيانات. وفّري مساحة على الجهاز قبل الدفع.', 'Could not save data. Free up device storage before paying.'], changeTotal: ['تغير مبلغ الطلب. راجعي الإجمالي الجديد.', 'Your total changed. Please review the updated quote.'], copy: ['نسخ رقم الطلب', 'Copy order number'], receipt: ['ملخص الدفع', 'Payment summary']
};
export function t(key) { return dictionary[key]?.[state.language === 'en' ? 1 : 0] || key; }
export const text = (ar, en) => state.language === 'en' ? en : ar;
export const productName = product => state.language === 'en' ? product.enName || product.name : product.name;
export const money = (amount, currency = 'USD') => `${new Intl.NumberFormat(state.language === 'ar' ? 'ar-IQ' : 'en-US', { maximumFractionDigits: 2 }).format(Number(amount || 0))} ${currency}`;
export function errorText(error) {
  if (error?.message === 'INTERNATIONAL_SHIPPING_UNAVAILABLE') return text('تعذّر حساب الشحن الدولي لهذه القطعة. تواصلي مع المتجر.', 'International delivery is not available for this piece yet. Contact the store.');
  if (error?.message === 'CHECKOUT_TOTAL_CHANGED') return t('changeTotal');
  if (error?.message === 'STORAGE_UNAVAILABLE') return t('storage');
  if (error?.message === 'NETWORK_UNAVAILABLE') return t('network');
  return error?.message || t('network');
}
