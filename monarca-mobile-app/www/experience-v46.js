/* Real navigation and language selection. Payments remain in checkout-v4.js. */
(() => {
'use strict';
const M=window.Monarca;if(!M)return;
const I=window.MonarcaI18n;
const {top,icon,go,esc}=M;
const language=()=>I?.language()||'ar';
M.sourceSections=()=>{const en=language()==='en';return `<section class="src47-shops" aria-labelledby="src47-heading"><div class="src47-heading"><h2 id="src47-heading">${en?'Delivery Options':'خيارات التوصيل'}</h2><p>${en?'Choose the delivery option that suits you':'اختر طريقة التوصيل المناسبة لك'}</p></div><div class="src47-shop-grid">${[
 ['iraq','box',en?'Express Delivery':'توصيل سريع',en?'Delivered in 3–4 days':'توصيل خلال ٣ إلى ٤ أيام',en?'Online payment by Visa or Mastercard':'الدفع الإلكتروني ببطاقة Visa أو Mastercard'],
 ['china','globe',en?'International Shipping from Our Warehouse':'شحن دولي من مستودعنا',en?'Air freight: 15–20 days':'شحن جوي: 15 إلى 20 يوماً',en?'Secure card payment':'الدفع الآمن بالبطاقة']
].map(([source,symbol,title,delivery,payment])=>`<button type="button" class="src47-shop" data-go="collection/${source}"><span class="src47-shop-icon">${icon(symbol)}</span><b>${title}</b><span class="src47-shop-time">${delivery}</span><small>${payment}</small><span class="src47-shop-link">${en?'View products':'عرض المنتجات'} ${icon('arrow')}</span></button>`).join('')}</div></section>`;};
function menuView(){
 const entries=[['user','الحساب','account'],['box','الطلبات','orders'],['pin','عناوين التوصيل','addresses'],['chat','الدعم والتواصل','support'],['globe','اللغة','region'],['settings','الإعدادات','settings']];
 return `${top('القائمة')}<div class="page-content mn46-page"><div class="mn46-brand" role="img" aria-label="Monarca"></div><nav class="mn46-list" aria-label="القائمة الرئيسية">${entries.map(([symbol,label,route])=>`<button type="button" data-go="${route}">${icon(symbol)}<span>${label}</span>${route==='region'?`<small>${language()==='en'?'English':'العربية'}</small>`:''}${icon('arrow')}</button>`).join('')}</nav></div>`;
}
function languageView(){
 const current=language();
 return `${top('اللغة')}<div class="page-content mn46-page"><h2 class="mn46-title">اختيار لغة التطبيق</h2><div class="mn46-languages">${[['ar','العربية','العربية'],['en','English','English']].map(([value,label,native])=>`<button type="button" data-action="mn46-language" data-value="${value}" aria-pressed="${current===value}" class="${current===value?'selected':''}"><b lang="${value}" data-user-text>${esc(native)}</b><span>${current===value?icon('check'):''}</span></button>`).join('')}</div><p class="mn46-language-note">تغيير اللغة لا يغيّر العملة أو بلد التوصيل.</p><div class="mn46-region"><span>العراق</span><b dir="ltr">USD · +964</b></div></div>`;
}
function refreshLanguage(){
 document.title=language()==='en'?'Monarca · Timeless elegance':'Monarca · أناقة في كل تفصيلة';
 M.render(true);
}
M.register({routes:{menu:menuView,region:languageView},actions:{
 'mn46-language':el=>{if(!I)return;const value=el.dataset.value;if(!['ar','en'].includes(value))return;I.setLanguage(value);M.toast('تم تغيير اللغة');},
 language:()=>go('region')
}});
window.addEventListener('monarca:languagechange',refreshLanguage);
document.title=language()==='en'?'Monarca · Timeless elegance':'Monarca · أناقة في كل تفصيلة';
})();
