/* Monarca v4 — basket, address book, checkout and Stripe-hosted card payment. */
(() => {
'use strict';
const A=window.Monarca;if(!A)return;
const {ui,esc,icon,money,ar,photo,top,btn,goto,empty,product,cardName,cardBrand,addressPlace}=A;
const S=()=>A.state;
const $=s=>document.querySelector(s);
const lineKey=l=>[l.id,l.color,l.size].join('|');
const clone=v=>JSON.parse(JSON.stringify(v));
let cardDraft={},processing=false;
// Source and delivery are demo catalogue data; new orders preserve them as snapshots.
A.products.forEach(p=>{p.fulfillment=[2,5].includes(Number(p.id))?'preorder':'in_stock';p.fulfillmentSource=p.fulfillment==='preorder'?'china':'iraq';});
const fulfillmentFor=l=>l?.fulfillment==='preorder'||l?.fulfillment==='in_stock'?l.fulfillment:(A.products.find(p=>Number(p.id)===Number(l?.id))?.fulfillment||'preorder');
const fulfillmentSource=l=>l?.fulfillmentSource==='china'||fulfillmentFor(l)==='preorder'?'china':'iraq';
const sourceLabel=source=>window.MonarcaI18n?.language()==='en'?(source==='iraq'?'Express':'International'):(source==='iraq'?'توصيل سريع':'شحن دولي');
const isEnglish=()=>window.MonarcaI18n?.language()==='en';
const deliveryWindow=source=>source==='iraq'?[3,4]:[15,20];
const sourceEstimate=(source,min,max)=>{
 const [defaultMin,defaultMax]=deliveryWindow(source);
 min=min??defaultMin;
 max=max??defaultMax;
 const days=min===max?ar(min):ar(min)+'–'+ar(max);
 return days+(isEnglish()?' days':source==='iraq'?' أيام':' يوماً');
};
const paymentCopy=(hasLocalItems)=>hasLocalItems
 ? (isEnglish()?'Online payment by Visa or Mastercard':'الدفع الإلكتروني ببطاقة Visa أو Mastercard')
 : (isEnglish()?'Secure online card payment':'الدفع الآمن بالبطاقة عبر الإنترنت');
const deliveryGroups=lines=>['iraq','china'].map(source=>{const selected=lines.filter(l=>fulfillmentSource(l)===source);return {source,label:sourceLabel(source),estimate:sourceEstimate(source),minDays:deliveryWindow(source)[0],maxDays:deliveryWindow(source)[1],count:selected.reduce((n,l)=>n+Number(l.qty||1),0)};}).filter(g=>g.count);
const orderDeliveryGroups=o=>Array.isArray(o?.deliveryGroups)&&o.deliveryGroups.length?o.deliveryGroups.map(g=>({...g,label:sourceLabel(g.source),estimate:sourceEstimate(g.source,g.minDays,g.maxDays)})):deliveryGroups(o?.items||[]);
const deliverySummary=groups=>groups.map(g=>g.label+' · '+g.estimate).join(' / ');
const currentProducts=lines=>lines.map(l=>A.products.find(p=>Number(p.id)===Number(l.id))||{id:l.id,fulfillment:'preorder',fulfillmentSource:'china'});
const usdToAedMinor=value=>Math.floor((Math.round((Number(value)+Number.EPSILON)*100)*367+50)/100);
const usdToAed=value=>usdToAedMinor(value)/100;
const aedMoney=value=>'AED '+new Intl.NumberFormat('en-US',{minimumFractionDigits:2,maximumFractionDigits:2}).format(Number(value)||0);
const orderLoads=new Map();
async function loadStripeOrder(id,refresh=false){
 const existing=S().orders.find(o=>o.id===id||o.serverOrderId===id);
 if(existing&&(!refresh||!existing.serverOrderId))return existing;
 if(orderLoads.has(id))return orderLoads.get(id);
 const request=(async()=>{
  const saved=await window.MonarcaAPI?.getOrder?.(id);
  if(!saved||saved.id!==id||!Array.isArray(saved.items))return null;
  const already=S().orders.find(o=>o.id===id||o.serverOrderId===id);
  if(already){
   already.history=Array.isArray(already.history)?already.history:[];
   already.status=saved.status||already.status;
   already.paymentStatus=saved.paymentStatus||already.paymentStatus;
   already.subtotal=Number(saved.subtotal)||already.subtotal;
   already.discount=Number(saved.discount)||already.discount;
   already.shipping=Number(saved.shippingFee)||already.shipping;
   already.total=Number(saved.total)||already.total;
   already.paidTotal=Number(saved.paidTotal)||already.paidTotal;
   already.currency=saved.currency||already.currency;
   already.chargeCurrency=saved.chargeCurrency||already.chargeCurrency;
   if(saved.chargeAmount!=null)already.chargeAmount=Number(saved.chargeAmount);
   if(saved.exchangeRate!=null)already.exchangeRate=Number(saved.exchangeRate);
   already.transactionId=saved.transactionId||already.transactionId;
   already.updatedAt=saved.updatedAt||already.updatedAt;
   if(already.paymentStatus==='paid')already.confirmedAt=already.updatedAt||already.createdAt;
   if(already.status!=='payment_pending'&&!already.history.some(h=>h.status===already.status))already.history.push({status:already.status,date:already.updatedAt||already.createdAt,note:'تم تحديث حالة الطلب من المتجر'});
   A.save();return already;
  }
  const items=saved.items.map(line=>({id:Number(line.productId),name:line.productName||'',color:line.color||'',size:line.size||'',qty:Number(line.qty)||1,price:Number(line.unitPrice)||0,img:line.imgIndex??0,fulfillment:line.fulfillmentSource==='china'?'preorder':'in_stock',fulfillmentSource:line.fulfillmentSource==='china'?'china':'iraq',deliveryMinDays:Number(line.minDeliveryDays)||1,deliveryMaxDays:Number(line.maxDeliveryDays)||1}));
  const groups=deliveryGroups(items);
  const hasAddress=Boolean(saved.customerName||saved.customerPhone||saved.city||saved.street);
  const address=hasAddress?{id:'server-address-'+id,label:'عنوان التوصيل',name:saved.customerName||'',phone:saved.customerPhone||'',city:saved.city||'',locality:saved.locality||saved.city||'',area:saved.area||'',street:saved.street||'',landmark:saved.landmark||'',building:saved.building||'',apartment:saved.apartment||''}:null;
  const order={id,serverOrderId:id,payment:'stripe',paymentStatus:saved.paymentStatus||'pending',status:saved.status||'payment_pending',subtotal:Number(saved.subtotal)||0,discount:Number(saved.discount)||0,shipping:Number(saved.shippingFee)||0,total:Number(saved.total)||0,paidTotal:Number(saved.paidTotal)||0,currency:saved.currency||'USD',chargeCurrency:saved.chargeCurrency||'',chargeAmount:saved.chargeAmount==null?null:Number(saved.chargeAmount),exchangeRate:saved.exchangeRate==null?null:Number(saved.exchangeRate),couponCode:saved.couponCode||'',transactionId:saved.transactionId||'',createdAt:saved.createdAt||'',updatedAt:saved.updatedAt||'',confirmedAt:saved.paymentStatus==='paid'?(saved.updatedAt||saved.createdAt):'',address,items,source:'server',sourceLines:clone(items),cartConsumed:true,deliveryGroups:groups,deliverySummary:saved.deliverySummary||deliverySummary(groups),hasChinaItem:!!saved.hasChinaItem,history:[]};
  if(order.status!=='payment_pending')order.history.push({status:order.status,date:order.updatedAt||order.createdAt,note:'تم تحديث حالة الطلب من المتجر'});
  S().orders.unshift(order);A.save();return order;
 })();
 orderLoads.set(id,request);
 try{return await request;}finally{if(orderLoads.get(id)===request)orderLoads.delete(id);}
}
const fulfillmentBadge=p=>{const source=fulfillmentSource(p),badge='<span class="fulfillment-badge '+(source==='china'?'is-preorder':'is-in-stock')+'">'+sourceLabel(source)+' · '+sourceEstimate(source)+'</span>';if(source!=='china'||ui.route!=='product/'+p.id)return badge;return badge+'<p class="china-stock-disclosure">'+(window.MonarcaI18n?.language()==='en'?'In stock at our warehouse · Shipped by air, delivered in 15–20 days':'متوفر في مستودعنا · يُشحن جواً ويصل خلال 15 إلى 20 يوماً')+'</p>';};
Object.assign(A,{fulfillmentFor,fulfillmentSource,fulfillmentBadge,deliveryGroups,orderDeliveryGroups,deliverySummary,aedMoney,usdToAed});
const roundMoney=value=>A.roundMoney?A.roundMoney(value):Math.round((Number(value)+Number.EPSILON)*100)/100;
const internationalCentsPerKg=950;
const freeDeliveryText=()=>isEnglish()
 ?'Local delivery is $4, or free when local items total at least $75 before discounts.'
 :'أجرة التوصيل المحلي ٤ دولارات، ومجاناً إذا بلغت قيمة المنتجات المحلية ٧٥ دولاراً قبل الخصم.';
const internationalDeliveryText=()=>isEnglish()
 ?'International air shipping from China to Iraq is $9.50 per kg, billed by weight.'
 :'أجرة الشحن الجوي من الصين إلى العراق 9.50 دولار للكيلوغرام وتُحسب حسب الوزن.';
const unavailableShippingText=()=>isEnglish()
 ?'Shipping is temporarily unavailable for an international item. Please contact us or remove that item to continue.'
 :'الشحن غير متاح مؤقتاً لإحدى القطع الدولية. يرجى التواصل معنا أو إزالة القطعة للمتابعة.';
const text=message=>window.MonarcaI18n?.text(message)||message;
function ensure(){
 const s=S();s.addresses=Array.isArray(s.addresses)?s.addresses:[];
 // Legacy FREE100 selections become the same automatic delivery benefit; paid/pending order snapshots stay intact.
 if(s.coupon==='FREE100')s.coupon='';if(ui.buyNowCoupon==='FREE100')ui.buyNowCoupon='';
 const fillLocality=a=>{if(a&&!String(a.locality||'').trim())a.locality=a.city||'';};
 fillLocality(s.address);s.addresses.forEach(fillLocality);s.orders.forEach(o=>fillLocality(o.address));
 if(s.address&&!s.addresses.length){s.address={...s.address,id:s.address.id||'addr-home',label:s.address.label||'المنزل'};s.addresses.push({...s.address});}
 if(!s.defaultAddressId&&s.addresses.length)s.defaultAddressId=s.addresses[0].id;
 if(s.address&&!s.selectedAddressId)s.selectedAddressId=s.address.id||s.addresses[0]?.id;
 if(!s.address&&s.addresses.length){s.address=s.addresses.find(a=>a.id===s.defaultAddressId)||s.addresses[0];s.selectedAddressId=s.address.id;}
 s.savedItems=Array.isArray(s.savedItems)?s.savedItems:[];s.paymentTokens=Array.isArray(s.paymentTokens)?s.paymentTokens:[];
 s.cart.forEach(l=>{if(l.selected===undefined)l.selected=true;});
 s.orders.forEach(o=>{o.paymentStatus=o.paymentStatus||(o.payment==='cod'?'cod_due':['payment_pending'].includes(o.status)?'pending':'paid');o.paidTotal=o.paymentStatus==='paid'?(o.paidTotal??o.total):0;o.createdAt=o.createdAt||'2026-10-17T10:00:00.000Z';if(o.paymentStatus==='paid'){o.transactionId=o.transactionId||'DEMO-TXN-'+o.id.slice(-4);o.paidAt=o.paidAt||o.createdAt;}});
 ui.shippingMode='standard';ui.addressReturn=ui.addressReturn||'addresses';
}
ensure();
if(A.isPreview){
 const s=S();if(s.addresses.length<2)s.addresses.push({id:'addr-work',label:'العمل',name:'سارة أحمد',phone:'+964 7700000000',city:'البصرة',locality:'البصرة',area:'البراضعية',street:'شارع الوطن',landmark:'قرب السوق',building:'٨'});
 if(!s.paymentTokens.length)s.paymentTokens.push({id:'demo-visa',network:'visa',last4:'4242',holder:'SARA AHMED',isDemo:true,default:true});
 if(!s.orders.some(o=>o.status==='payment_pending'))s.orders.unshift({id:'M-DEMO-1026',sample:true,status:'payment_pending',paymentStatus:'pending',date:'١٩ أكتوبر ٢٠٢٦',createdAt:'2026-10-19T10:00:00Z',items:[{id:2,color:'cream',size:'38',qty:1,price:190,name:product(2).name,fulfillment:'preorder',fulfillmentSource:'china',deliveryMinDays:15,deliveryMaxDays:20}],address:clone(s.address),subtotal:190,discount:0,shipping:0,total:190,currency:'USD',deliveryGroups:deliveryGroups([{id:2,qty:1,fulfillment:'preorder',fulfillmentSource:'china'}]),paidTotal:0,payment:'mastercard',source:'direct',shippingMode:'standard'});
}
function selected(){ensure();return S().cart.filter(l=>l.selected!==false);}
function pending(id){return S().orders.find(o=>o.id===(id||ui.pendingOrderId));}
function activeLines(){const name=ui.route.split('/')[0];if(['checkout','payment','payment-auth','payment-failed'].includes(name)&&ui.pendingOrderId){const o=pending();if(o)return o.items;}if(ui.buyNow&&['address','addresses','address-detail','checkout','delivery-options','coupon-select','payment'].includes(name))return ui.buyNow;return selected();}
function couponRule(code,sub){
 if(!code)return {ok:false};
 const api=window.MonarcaAccountCoupons;if(api?.validate)return api.validate(code,sub);
 return code==='M10'?{ok:sub>=(A.commerce?.couponMin||40),min:A.commerce?.couponMin||40,type:'percent',value:10}:code==='FREE100'?{ok:false,reason:freeDeliveryText()}:{ok:false,reason:'رمز الخصم غير صالح'};
}
function calculate(lines,options={}){
 let subtotal=0,localSubtotal=0,internationalGrams=0,shippingUnavailable=false;
 const products=currentProducts(lines);
 for(const [index,line] of lines.entries()){
  const p=products[index],lineTotal=Number(p.price??line.price??0)*line.qty;
  subtotal+=lineTotal;
  if(fulfillmentSource(p)==='iraq'){
   localSubtotal+=lineTotal;
  }else if(Number.isInteger(p.shippingWeightGrams)&&p.shippingWeightGrams>0){
   internationalGrams+=p.shippingWeightGrams*line.qty;
  }else{
   shippingUnavailable=true;
  }
 }
 subtotal=roundMoney(subtotal);
 localSubtotal=roundMoney(localSubtotal);
 const code=options.code!==undefined?options.code:(ui.buyNow?(ui.buyNowCoupon||''):(S().coupon||''));
 const r=couponRule(code,subtotal),discount=r.ok&&code==='M10'?roundMoney(subtotal*.1):0;
 const shippingRule=A.commerce?.shipping||{standard:4,freeFrom:75};
 const localShipping=localSubtotal>0&&localSubtotal<shippingRule.freeFrom?shippingRule.standard:0;
 const internationalShipping=Math.round(internationalGrams*internationalCentsPerKg/1000)/100;
 const shipping=shippingUnavailable?null:roundMoney(localShipping+internationalShipping);
 const total=shippingUnavailable?null:roundMoney(subtotal-discount+shipping);
 return {subtotal,discount,shipping,localShipping,hasLocalShipping:localSubtotal>0,internationalShipping,internationalGrams,shippingUnavailable,total,couponCode:r.ok?code:'',shippingMode:'standard',currency:'USD'};
}
function pricing(){const o=['checkout','payment','payment-auth','payment-failed'].includes(ui.route.split('/')[0])&&pending();return o?{subtotal:o.subtotal,discount:o.discount,shipping:o.shipping,total:o.total,couponCode:o.couponCode||'',shippingMode:o.shippingMode||'standard'}:calculate(activeLines());}
function priceBox(t=pricing(),showAed=t.chargeCurrency==='AED'){
 const chargeAmount=t.chargeCurrency==='AED'&&Number.isFinite(Number(t.chargeAmount))?Number(t.chargeAmount):usdToAed(t.total);
 const rate=Number(t.exchangeRate)||3.67;
 const chargeNote=showAed&&!t.shippingUnavailable?`<div class="info-box ck-currency-note">${icon('card')}<span>${isEnglish()?'Amount charged by Stripe: ':'المبلغ الذي سيخصم عبر Stripe: '}<bdi dir="ltr">${aedMoney(chargeAmount)}</bdi><br><small>${isEnglish()?'Fixed exchange rate: ':'سعر التحويل الثابت: '}<bdi dir="ltr">1 USD = AED ${rate.toFixed(2)}</bdi></small></span></div>`:'';
 let shippingRows=`<div><span>التوصيل</span><b>${t.shippingUnavailable?'—':t.shipping?money(t.shipping):'مجاناً'}</b></div>`;
 if(!t.shippingUnavailable&&t.internationalGrams>0){
  const localRow=t.hasLocalShipping?`<div><span>${isEnglish()?'Local delivery':'التوصيل المحلي'}</span><b>${t.localShipping?money(t.localShipping):'مجاناً'}</b></div>`:'';
  shippingRows=localRow+`<div><span>${isEnglish()?'International air shipping':'الشحن الجوي الدولي'} · <bdi dir="ltr">${t.internationalGrams/1000} kg</bdi></span><b><bdi dir="ltr">${t.internationalShipping.toFixed(2)} USD</bdi></b></div>`;
 }
 return `<section class="ck-summary"><div><span>المجموع الفرعي</span><b>${money(t.subtotal)}</b></div><div><span>خصم القسيمة ${t.couponCode?`<em class="ltr">${esc(t.couponCode)}</em>`:''}</span><b>${t.discount?'- '+money(t.discount):'—'}</b></div>${shippingRows}<div class="ck-grand"><span>الإجمالي</span><b>${t.shippingUnavailable?'—':money(t.total)}</b></div></section>${t.shippingUnavailable?`<p class="field-note" role="status">${unavailableShippingText()}</p>`:''}${chargeNote}`;
}
function currencyOptions(total,selected){
 const en=isEnglish();
 return `<fieldset class="ck-currency-options">
  <legend>${en?'Payment currency':'عملة الدفع'}</legend>
  <label><input type="radio" name="chargeCurrency" value="USD" ${selected==='USD'?'checked':''}>
   <span>${en?'US dollar':'الدولار الأمريكي'}</span><bdi dir="ltr">${money(total)}</bdi>
  </label>
  <label><input type="radio" name="chargeCurrency" value="AED" ${selected==='AED'?'checked':''}>
   <span>${en?'UAE dirham':'الدرهم الإماراتي'}</span><bdi dir="ltr">${aedMoney(usdToAed(total))}</bdi>
  </label>
  <small>${en?'Fixed exchange rate':'سعر التحويل الثابت'} · <bdi dir="ltr">1 USD = 3.67 AED</bdi></small>
 </fieldset>`;
}
function error(id,message){const e=$(id);if(e){e.textContent=text(message);e.hidden=false;e.scrollIntoView({block:'center',behavior:'smooth'});}else A.toast(message);}
function persist(){A.save();A.render(true);}
function applyCoupon(raw){const code=String(raw||'').trim().toUpperCase(),sub=calculate(activeLines(),{code:''}).subtotal,r=couponRule(code,sub);if(!r.ok){A.toast(r.reason||'هذه القسيمة غير متاحة لهذا الطلب.');return;}if(ui.buyNow)ui.buyNowCoupon=code;else S().coupon=code;A.save();A.render(true);A.toast('تم تطبيق '+code+' على القطع المحددة.');}
function basket(){
 ensure();const s=S(),t=calculate(selected()),count=selected().reduce((n,l)=>n+l.qty,0);
 if(!s.cart.length)return top('حقيبة التسوّق')+empty('تبدأ الأناقة باختيارك','أضيفي قطعة تحبينها، ثم اختاري تفاصيلها لنكمل طلبك.','bag','استكشفي المجموعة','categories')+`<div class="section-head"><h2>قد تعجبك</h2></div>${A.grid(A.products.slice(0,4))}${s.savedItems.length?`<div class="page-content">${goto('المحفوظة لوقت لاحق · '+ar(s.savedItems.length),'saved','secondary')}</div>`:''}`;
 return `${top('حقيبة التسوّق',`<button class="icon-btn" data-go="saved" aria-label="المحفوظة لوقت لاحق">${icon('clock')}</button>`)}<div class="ck-content"><div class="ck-basket-intro"><p>قطع اخترتِها بعناية</p><span>${ar(s.cart.reduce((n,l)=>n+l.qty,0))} قطع</span></div><div class="ck-select-all"><label><input type="checkbox" id="ck-select-all" ${s.cart.every(l=>l.selected!==false)?'checked':''}> تحديد الكل</label><span>${ar(count)} قطع محددة</span></div>${s.cart.map((l,i)=>{
 const p=product(l.id),valid=p.stock>0&&l.size!==p.unavailable;
 return `<article class="ck-cart-item ${l.selected===false?'not-selected':''}"><div class="ck-cart-top"><label class="ck-checkbox"><input type="checkbox" data-ck-select="${i}" ${l.selected!==false?'checked':''} aria-label="تحديد ${esc(p.name)}"></label><button class="ck-cart-photo product-photo img-${p.img}" data-go="product/${p.id}" aria-label="${esc(p.name)}">${A.photoArt(p.img,'product',p.imageUrl)}</button><div class="ck-cart-info"><button class="ck-item-name" data-go="product/${p.id}">${esc(p.name)}</button><p>${esc(A.colors[l.color]?.[0]||l.color)} · ${esc(l.size)}</p><button class="ck-edit-variant" data-action="ck-edit" data-index="${i}">تعديل اللون والمقاس ${icon('edit')}</button><strong>${money(p.price*l.qty)}</strong>${fulfillmentBadge(p)}<small>${valid?'الكمية التجريبية المتاحة: '+ar(p.stock):'هذا الخيار غير متوفر حالياً'}</small></div></div><div class="ck-cart-bottom"><div class="quantity"><button data-action="qty-minus" data-index="${i}" aria-label="تقليل الكمية" ${l.qty<=1?'disabled':''}>−</button><span>${ar(l.qty)}</span><button data-action="qty-plus" data-index="${i}" aria-label="زيادة الكمية" ${l.qty>=p.stock?'disabled':''}>+</button></div><div>${btn('لاحقاً','ck-save-later','text-btn',`data-index="${i}"`)}${btn('نقل للمفضلة','ck-move-wish','text-btn',`data-index="${i}"`)}${btn(icon('trash'),'remove-cart','icon-btn',`data-index="${i}" aria-label="حذف ${esc(p.name)}"`)}</div></div></article>`;
 }).join('')}<button class="ck-row-link" data-go="saved">${icon('clock')} المحفوظة لوقت لاحق <b>${ar(s.savedItems.length)}</b>${icon('arrow')}</button><button class="ck-row-link" data-go="coupon-select">${icon('tag')} ${t.couponCode?'القسيمة المطبقة: '+esc(t.couponCode):'إضافة قسيمة خصم'}${icon('arrow')}</button><form id="ck-coupon-form" class="coupon-inline"><input name="code" aria-label="رمز القسيمة" value="${esc(s.coupon||'')}" placeholder="M10" maxlength="30"><button type="submit">تطبيق</button></form>${s.coupon?btn('إزالة القسيمة','remove-coupon','text-btn'):''}${priceBox(t)}<div class="ck-assurances"><span>${icon('shield')} الدفع الآمن بالبطاقة</span><span>${icon('card')} ${paymentCopy(currentProducts(selected()).some(l=>fulfillmentSource(l)==='iraq'))}</span></div><p class="field-note">يتم احتساب القطع المحددة فقط. القطع غير المحددة تبقى في الحقيبة بعد الشراء.</p></div><div class="checkout-bar">${btn(t.shippingUnavailable?(isEnglish()?'Continue to checkout':'متابعة الطلب'):`متابعة الطلب · ${money(t.total)}`,'ck-checkout','primary',!selected().length?'disabled':'')}</div>`;
}
function saved(){return `${top('المحفوظة لوقت لاحق')}<div class="ck-content">${S().savedItems.length?S().savedItems.map((l,i)=>{const p=product(l.id);return `<article class="ck-saved-item">${photo(p)}<div><h3>${esc(p.name)}</h3><p>${esc(A.colors[l.color]?.[0]||'')} · ${esc(l.size)}</p><b>${money(p.price)}</b><div>${btn('نقل إلى الحقيبة','ck-restore','text-btn',`data-index="${i}"`)}${btn('حذف','ck-delete-saved','text-btn',`data-index="${i}"`)}</div></div></article>`;}).join(''):empty('لا توجد قطع محفوظة','يمكنك نقل القطع من الحقيبة إلى هنا والعودة إليها لاحقاً.','clock','استكشفي المجموعة','categories')}</div>`;}
function editVariant(index){const l=S().cart[index];if(!l)return;const p=product(l.id);A.sheet('تعديل اختياراتك',`<form id="ck-variant-form" data-index="${index}"><div class="mini-product">${photo(p)}<div>${esc(p.name)}<small>${money(p.price)}</small></div></div><div class="ck-form-error" id="ck-variant-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>اللون</span><select name="color">${p.colors.map(c=>`<option value="${c}" ${l.color===c?'selected':''}>${A.colors[c][0]}</option>`).join('')}</select></label><label class="field"><span>المقاس</span><select name="size">${p.sizes.map(z=>`<option ${z===p.unavailable?'disabled':''} ${l.size===z?'selected':''}>${esc(z)}</option>`).join('')}</select></label><label class="field"><span>الكمية</span><select name="qty">${Array.from({length:p.stock},(_,i)=>`<option value="${i+1}" ${l.qty===i+1?'selected':''}>${ar(i+1)}</option>`).join('')}</select></label><button class="primary" type="submit">حفظ التعديلات</button></form>`);}
function addressCard(a,selecting=false){const s=S();return `<article class="ck-address-card ${a.id===s.selectedAddressId?'selected':''}"><div class="inline-row"><span class="ck-address-label">${icon(a.label==='العمل'?'box':'home')}${esc(a.label||'عنوان التوصيل')}</span>${a.id===s.defaultAddressId?'<span class="ck-tag">الافتراضي</span>':''}</div><h3 data-user-text>${esc(a.name)}</h3><p>${esc(addressPlace(a))} · ${esc(a.area)}<br>${esc(a.street)} · ${esc(a.landmark)}${a.building?'<br>المبنى '+esc(a.building):''}${a.apartment?' · '+esc(a.apartment):''}<br><span class="ltr" data-user-text>${esc(a.phone)}</span></p><div class="ck-address-actions">${btn('تعديل','ck-address-edit','text-btn',`data-id="${a.id}"`)}${a.id!==s.defaultAddressId?btn('تعيين كافتراضي','ck-address-default','text-btn',`data-id="${a.id}"`):''}${btn('حذف','ck-address-delete','text-btn',`data-id="${a.id}"`)}</div>${selecting?btn(a.id===s.selectedAddressId?'استخدام هذا العنوان':'التوصيل إلى هذا العنوان','ck-address-select','secondary',`data-id="${a.id}"`):''}</article>`;}
function addressStep(){return '';}
function addresses(){ensure();return `${top(ui.addressReturn==='checkout'?'اختيار عنوان التوصيل':'دفتر العناوين')}<div class="ck-content">${addressStep()}<div class="ck-heading"><div><span class="overline">YOUR PLACES</span><h2>إلى حيث تكونين.</h2></div>${btn(icon('plus'),'ck-address-new','icon-btn','aria-label="إضافة عنوان"')}</div><p class="page-intro">${ui.addressReturn==='checkout'?'اختاري عنوان التوصيل لهذا الطلب أو أضيفي عنواناً جديداً قبل المراجعة والدفع.':'احفظي عنوان المنزل أو العمل، واختاري العنوان المناسب لكل طلب.'}</p>${S().addresses.length?S().addresses.map(a=>addressCard(a,ui.addressReturn==='checkout')).join(''):empty('أضيفي عنوانك الأول','ستظهر عناوينك المحفوظة هنا.','pin','إضافة عنوان','address')}<div class="button-stack">${btn(icon('plus')+' إضافة عنوان جديد','ck-address-new','secondary')}</div></div>`;}
function addressForm(){ensure();const a={...(ui.editAddressId?S().addresses.find(x=>x.id===ui.editAddressId):{}),...(ui.addressDraft||{})};return `${top(ui.editAddressId?'تعديل العنوان':'عنوان جديد')}<div class="ck-content">${addressStep()}<p class="page-intro">تفاصيل واضحة تساعد في توصيل اختياراتك. الحقول بعلامة * مطلوبة.</p><form id="ck-address-form" novalidate><div class="ck-form-error" id="ck-address-error" role="alert" tabindex="-1" hidden></div><label class="field"><span>تسمية العنوان</span><select name="label">${['المنزل','العمل','عنوان آخر'].map(x=>`<option ${a.label===x?'selected':''}>${x}</option>`).join('')}</select></label><label class="field"><span>اسم المستلم الكامل *</span><input name="name" value="${esc(a.name||S().user?.name||'')}" autocomplete="name" placeholder="الاسم واسم العائلة" maxlength="80"></label><label class="field"><span>رقم الهاتف العراقي *</span><input name="phone" type="tel" dir="ltr" value="${esc(a.phone||S().user?.phone||'')}" placeholder="+964 7XX XXX XXXX" autocomplete="tel"></label><label class="field"><span>مدينة / منطقة التوصيل *</span><select name="city"><option value="">اختاري منطقة التوصيل</option>${A.cities.map(c=>`<option ${a.city===c?'selected':''}>${c}</option>`).join('')}</select><small class="field-note">منطقة مرجعية لحساب رسوم العرض؛ حدّدي موقعك الفعلي أدناه.</small></label><label class="field"><span>المدينة / القضاء / الناحية *</span><input name="locality" value="${esc(a.locality||'')}" placeholder="اكتبي المدينة أو القضاء أو الناحية" autocomplete="address-level2" maxlength="80" required></label><div class="field-row"><label class="field"><span>المنطقة / الحي *</span><input name="area" value="${esc(a.area||'')}" placeholder="مثال: المنصور" maxlength="70"></label><label class="field"><span>الشارع *</span><input name="street" value="${esc(a.street||'')}" placeholder="اسم الشارع" maxlength="100"></label></div><label class="field"><span>أقرب نقطة دالة *</span><input name="landmark" value="${esc(a.landmark||'')}" placeholder="مثال: قرب مول المنصور" maxlength="120"></label><div class="field-row"><label class="field"><span>رقم المبنى</span><input name="building" value="${esc(a.building||'')}" maxlength="25"></label><label class="field"><span>الطابق / الشقة</span><input name="apartment" value="${esc(a.apartment||'')}" maxlength="40"></label></div><label class="field"><span>ملاحظات للمندوب</span><textarea name="note" maxlength="300" placeholder="تفاصيل إضافية لتسهيل الوصول">${esc(a.note||'')}</textarea></label><label class="checkbox-row"><input type="checkbox" name="default" ${!S().addresses.length||a.id===S().defaultAddressId?'checked':''}>تعيين كعنوان افتراضي</label><div class="info-box">${icon('info')}استخدمي بيانات وهمية خلال مراجعة النموذج. العناوين محفوظة على هذا الجهاز فقط.</div><div class="button-stack"><button type="submit" class="primary">${ui.addressReturn==='checkout'?'حفظ واستخدام للطلب':'حفظ العنوان'}</button>${btn('تعبئة عنوان تجريبي','ck-address-fill','secondary')}</div></form><div class="store-contact-address-help"><p>تحتاجين مساعدة في كتابة عنوان التوصيل؟</p>${A.contactButton('مساعدة عبر واتساب','address','','text-btn')}</div></div>`;}
function deliveryGroupMarkup(groups){return '<div class="ck-delivery-groups">'+groups.map(g=>'<article class="ck-delivery-group">'+icon('truck')+'<div><h3>'+g.label+'</h3><p>'+g.estimate+'</p><small>'+paymentCopy(g.source==='iraq')+'</small></div></article>').join('')+'</div>'+(groups.length>1?'<p class="field-note">تصل قطع العراق وقطع الصين في شحنتين بموعدين مختلفين. يتطلب الطلب المختلط الدفع المسبق بالبطاقة.</p>':'');}
function deliveryOptions(){return `${top('خيارات التوصيل')}<div class="ck-content"><p class="page-intro">مدة التوصيل حسب مصدر القطع: العراق ٣ إلى ٤ أيام، والصين ١٥–٢٠ يوماً.</p>${shippingCards()}<div class="button-stack">${goto('العودة لإتمام الطلب','checkout')}</div></div>`;}
function shippingCards(lines=activeLines(),groups){const delivery=groups||deliveryGroups(currentProducts(lines).map((p,i)=>({...p,qty:lines[i]?.qty||1})));
 return deliveryGroupMarkup(delivery)+delivery.map(group=>'<p class="field-note">'+(group.source==='iraq'?freeDeliveryText():internationalDeliveryText())+'</p>').join('');}
function couponSelect(){const sub=calculate(activeLines(),{code:''}).subtotal;return `${top('اختيار قسيمة')}<div class="ck-content"><p class="page-intro">قسيمة واحدة لكل طلب. تتحدث الأهلية بحسب القطع المحددة.</p>${[['M10','خصم ١٠٪','من ٤٠ دولاراً']].map(([c,t,d])=>{const r=couponRule(c,sub);return `<article class="ck-coupon"><span class="overline ltr">${c}</span><h3>${t}</h3><p>${d}</p>${btn(r.ok?'تطبيق على الطلب':r.reason||'غير متاحة لهذا الطلب','ck-coupon-select','secondary',`data-value="${c}" ${r.ok?'':'disabled'}`)}</article>`;}).join('')}<form id="ck-coupon-form" class="coupon-inline"><input name="code" placeholder="رمز القسيمة" aria-label="رمز القسيمة"><button type="submit">تطبيق</button></form><div class="info-box">${icon('truck')}${freeDeliveryText()}</div>${goto('مركز القسائم','coupons','text-btn')}</div>`;}
function inlineAddressFields(a={}){
 return '<div class="ck-inline-address">'+[
 ['name','اسم المستلم الكامل','text','name'],['phone','رقم الهاتف العراقي','tel','tel']
 ].map(([key,label,type,autocomplete])=>'<label class="field"><span>'+label+' *</span><input name="'+key+'" type="'+type+'" autocomplete="'+autocomplete+'" '+(key==='phone'?'dir="ltr"':'')+' value="'+esc(a[key]||'')+'" maxlength="80" required></label>').join('')+
 '<label class="field"><span>منطقة التوصيل *</span><select name="city" id="ck-inline-city" required><option value="">اختيار منطقة التوصيل</option>'+A.cities.map(c=>'<option '+(a.city===c?'selected':'')+'>'+c+'</option>').join('')+'</select></label>'+[
 ['locality','المدينة / القضاء / الناحية','address-level2'],['area','المنطقة / الحي','address-level3'],['street','الشارع','street-address'],['landmark','أقرب نقطة دالة','off']
 ].map(([key,label,autocomplete])=>'<label class="field"><span>'+label+' *</span><input name="'+key+'" autocomplete="'+autocomplete+'" value="'+esc(a[key]||'')+'" maxlength="120" required></label>').join('')+
 '<button type="button" class="text-btn" data-action="ck-inline-address-fill">تعبئة عنوان تجريبي</button></div>';
}
function inlineCardFields(network){
 const tokens=S().paymentTokens.filter(c=>c.isDemo&&c.network===network);
 return '<div class="ck-inline-card"><p class="ck-demo-alert">بطاقة اختبار فقط. لا يوجد خصم حقيقي، ولا يُحفظ رقم البطاقة أو CVV.</p>'+
 (tokens.length?'<label class="field"><span>بطاقة اختبار محفوظة</span><select id="ck-token"><option value="">إدخال بيانات الاختبار</option>'+tokens.map(c=>'<option value="'+esc(c.id)+'" '+(ui.selectedPaymentToken===c.id?'selected':'')+'>'+cardName(c.network)+' •••• '+esc(c.last4)+' · '+esc(c.holder)+'</option>').join('')+'</select></label>':'')+
 '<label class="field"><span>اسم حامل بطاقة الاختبار *</span><input name="holder" dir="ltr" autocomplete="off" value="'+esc(cardDraft.holder||'')+'" maxlength="60" required></label><label class="field"><span>رقم بطاقة الاختبار *</span><input name="number" inputmode="numeric" dir="ltr" autocomplete="off" value="'+esc(cardDraft.number||'')+'" maxlength="23" required></label><div class="field-row"><label class="field"><span>تاريخ الانتهاء *</span><input name="expiry" inputmode="numeric" dir="ltr" autocomplete="off" placeholder="12/30" value="'+esc(cardDraft.expiry||'')+'" maxlength="5" required></label><label class="field"><span>CVV التجريبي *</span><input name="cvv" type="password" inputmode="numeric" autocomplete="off" placeholder="123" value="'+esc(cardDraft.cvv||'')+'" maxlength="3" required></label></div><div class="ck-test-data"><span>'+cardName(network)+' · <b class="ltr">'+(network==='mastercard'?'5555 5555 5555 4444':'4242 4242 4242 4242')+'</b></span><small>12/30 · CVV 123</small><button type="button" class="text-btn" data-action="ck-fill-card">تعبئة بيانات الاختبار</button></div><label class="checkbox-row"><input type="checkbox" name="saveCard" '+(cardDraft.saveCard?'checked':'')+'>حفظ بطاقة الاختبار المختصرة</label><label class="checkbox-row"><input type="checkbox" name="demoDecline" '+(cardDraft.demoDecline?'checked':'')+'>محاكاة رفض البطاقة</label></div>';
}
function checkout(id){
 ensure();const o=id?pending(id):null;
 if(id&&!o)return top('إتمام الطلب')+empty('لم نجد الطلب','يمكن فتح الطلب من قائمة الطلبات.','box','طلباتي','orders');
 if(o&&o.status!=='payment_pending')return top('إتمام الطلب')+empty('تمت معالجة هذا الطلب','يمكن مراجعة حالة الطلب والدفع.','check','تفاصيل الطلب','order/'+o.id);
 const lines=o?o.items:activeLines(),s=S();
 if(!lines.length)return top('إتمام الطلب')+empty('لا توجد قطع محددة','يلزم تحديد القطع في حقيبة التسوق.','bag','العودة للحقيبة','cart');
 const newAddress=!o&&(!s.address||ui.checkoutNewAddress||!validAddress(s.address)),a=o?.address||(newAddress?(ui.checkoutAddressDraft||{}):s.address),t=o||calculate(lines,{city:a?.city||''}),hasLocalItems=(o?lines:currentProducts(lines)).some(l=>fulfillmentSource(l)==='iraq');
 const addressSelector=o?'<p class="field-note">عنوان ومبالغ محفوظة لهذا الطلب. المتابعة تستخدم رقم الطلب نفسه.</p>':'<label class="field"><span>عنوان التوصيل</span><select id="ck-address-choice" name="addressChoice">'+s.addresses.map(v=>'<option value="'+esc(v.id)+'" '+(!newAddress&&v.id===s.selectedAddressId?'selected':'')+'>'+esc(v.label||'عنوان محفوظ')+' · '+esc(v.name)+' · '+esc(addressPlace(v))+'</option>').join('')+'<option value="new" '+(newAddress?'selected':'')+'>عنوان جديد</option></select></label>';
 const addressDisplay=newAddress?inlineAddressFields(a):'<div class="ck-checkout-address">'+icon('pin')+'<div><b data-user-text>'+esc(a?.name||'')+'</b><p data-user-text>'+esc(addressPlace(a))+' · '+esc(a?.area||'')+' · '+esc(a?.street||'')+'<br>'+esc(a?.landmark||'')+'<br><span class="ltr">'+esc(a?.phone||'')+'</span></p></div></div>';
 const delivery=shippingCards(lines,o?orderDeliveryGroups(o):undefined);
 const payHint=window.MonarcaI18n?.language()==='en'?'You will be redirected to Stripe to complete card payment.':'سيتم تحويلك إلى Stripe لإتمام الدفع بالبطاقة.';
 return top('إتمام الطلب')+'<div class="ck-content ck-onepage"><p class="page-intro">العنوان والتوصيل والدفع في صفحة واحدة.</p><form id="ck-checkout-form" data-order="'+esc(id||'')+'" novalidate><div class="ck-form-error" id="ck-checkout-error" role="alert" tabindex="-1" hidden></div><section class="ck-onepage-section"><h2>عنوان التوصيل</h2>'+addressSelector+addressDisplay+'</section><section class="ck-onepage-section"><h2>طريقة التوصيل</h2>'+delivery+'</section><section class="ck-onepage-section"><h2>طريقة الدفع</h2><div class="info-box">'+icon('shield')+paymentCopy(hasLocalItems)+'</div></section><section class="ck-onepage-section"><div class="ck-block-title"><h2>ملخص الطلب · '+ar(lines.reduce((n,l)=>n+l.qty,0))+'</h2>'+(!o?goto('تعديل',ui.buyNow?'product/'+lines[0].id:'cart','text-btn'):'')+'</div>'+lines.map(l=>'<div class="ck-mini-line">'+photo({...product(l.id),name:l.name||product(l.id).name,img:l.img??product(l.id).img})+'<div><h3>'+esc(l.name||product(l.id).name)+'</h3><p>'+esc(A.colors[l.color]?.[0]||'')+' · '+esc(l.size)+' · '+ar(l.qty)+'</p>'+fulfillmentBadge(l)+'<b>'+money((l.price??product(l.id).price)*l.qty)+'</b></div></div>').join('')+(!o?'<button type="button" class="ck-row-link" data-go="coupon-select">'+icon('tag')+(t.couponCode?'القسيمة: '+esc(t.couponCode):'اختيار قسيمة خصم')+icon('arrow')+'</button><label class="field"><span>ملاحظات الطلب (اختياري)</span><textarea id="ck-order-note" maxlength="300">'+esc(ui.orderNote||'')+'</textarea></label><label class="checkbox-row"><input id="ck-gift" type="checkbox" '+(ui.gift?'checked':'')+'>الطلب هدية · تغليف تجريبي مجاني</label>'+(ui.gift?'<label class="field"><span>رسالة الهدية (اختياري)</span><textarea id="ck-gift-message" maxlength="180">'+esc(ui.giftMessage||'')+'</textarea></label>':''):'')+priceBox(t,false)+(t.shippingUnavailable?'':currencyOptions(t.total,ui.checkoutChargeCurrency||o?.chargeCurrency||'USD'))+'</section><label class="checkbox-row"><input id="ck-terms" type="checkbox" name="terms" '+(ui.termsAccepted?'checked':'')+'>أوافق على '+goto('الشروط والأحكام','policy/terms','text-btn')+'</label><p class="field-note">'+payHint+'</p><div class="ck-inline-submit"><button class="primary" type="submit" '+(processing||t.shippingUnavailable||o?.requiresRequote?'disabled':'')+'>'+(processing?'جارٍ التحويل إلى الدفع…':(isEnglish()?'Continue to Stripe':'المتابعة إلى Stripe'))+'</button></div>'+(o?.requiresRequote?btn('مراجعة الطلب وتحديث الخصم','ck-requote','secondary','type="button" data-id="'+esc(o.id)+'"'):'')+'</form></div>';
}
function validAddress(a){return !!(a&&String(a.name||'').trim().length>=3&&A.normalizePhone(a.phone)&&A.cities.includes(a.city)&&['locality','area','street','landmark'].every(k=>String(a[k]||'').trim()));}
function payment(id){return checkout(id);}
function makePending(){
 if(!ui.termsAccepted)throw new Error('يرجى الموافقة على شروط التجربة قبل تأكيد الطلب.');
 const lines=activeLines();if(!lines.length||!validAddress(S().address))throw new Error('يلزم إكمال القطع وعنوان التوصيل.');
 for(const l of lines){const p=A.products.find(p=>Number(p.id)===Number(l.id));if(!p||!p.colors.includes(l.color)||!p.sizes.includes(l.size)||p.unavailable===l.size||!Number.isInteger(Number(l.qty))||l.qty<1||l.qty>p.stock||p.stock<1)throw new Error('إحدى القطع غير متوفرة بالكمية أو المقاس المختار. يمكن مراجعة الحقيبة.');}
 const t=calculate(lines);
 if(t.shippingUnavailable)throw new Error(unavailableShippingText());
 const items=lines.map(l=>({...clone(l),price:product(l.id).price,name:product(l.id).name,img:product(l.id).img,fulfillment:fulfillmentFor(product(l.id)),fulfillmentSource:fulfillmentSource(product(l.id)),deliveryMinDays:deliveryWindow(fulfillmentSource(product(l.id)))[0],deliveryMaxDays:deliveryWindow(fulfillmentSource(product(l.id)))[1]})),source=ui.requoteSource||(ui.buyNow?'direct':'cart');
 const signature=JSON.stringify({items:items.map(l=>[l.id,l.color,l.size,l.qty,l.price,l.fulfillment,l.fulfillmentSource,l.deliveryMinDays,l.deliveryMaxDays]),address:S().address,total:t.total,coupon:t.couponCode,mode:ui.shippingMode,source,note:ui.orderNote||'',gift:!!ui.gift,giftMessage:ui.giftMessage||''});
 let o=S().orders.find(x=>x.status==='payment_pending'&&x.signature===signature);
 if(!o){const now=new Date();o={id:'M-DEMO-'+Date.now().toString().slice(-9)+'-'+Math.random().toString(36).slice(2,5),date:new Intl.DateTimeFormat('ar-IQ',{day:'numeric',month:'long',year:'numeric',timeZone:'Asia/Baghdad'}).format(now),createdAt:now.toISOString(),status:'payment_pending',paymentStatus:'pending',paidTotal:0,items,address:clone(S().address),...t,payment:'stripe',source,sourceLines:clone(lines),signature,orderNote:ui.orderNote||'',gift:!!ui.gift,giftMessage:ui.giftMessage||'',currency:'USD',deliveryGroups:deliveryGroups(items),history:[],cartConsumed:false};S().orders.unshift(o);}
 o.payment='stripe';ui.requoteSource=null;ui.pendingOrderId=o.id;A.save();return o;
}
function auth(id){return checkout(id);}
function addressValidation(a){
 if(String(a?.name||'').trim().length<3)return 'يلزم إدخال الاسم الكامل للمستلم.';
 if(!A.normalizePhone(a?.phone))return 'يلزم رقم هاتف عراقي صحيح بصيغة 07… أو +964 7…';
 if(!A.cities.includes(a?.city))return 'يلزم اختيار منطقة التوصيل.';
 if(!String(a?.locality||'').trim())return 'يلزم إدخال المدينة أو القضاء أو الناحية.';
 if(!['area','street','landmark'].every(k=>String(a?.[k]||'').trim()))return 'يلزم إكمال المنطقة والشارع وأقرب نقطة دالة.';
 return '';
}
function submitCheckout(form,d,legacy=false){
 if(processing)return;
 const o=form.dataset.order?pending(form.dataset.order):null;
 if(form.dataset.order&&!o){error('#ck-checkout-error','لم نجد الطلب المطلوب.');return;}
 if(o&&o.status!=='payment_pending'){A.go('order/'+o.id);return;}
 if(o?.requiresRequote){error('#ck-checkout-error','يلزم مراجعة الطلب وتحديث الخصم أولاً.');return;}
 const newAddress=!o&&(d.addressChoice==='new'||ui.checkoutNewAddress||!S().address||!validAddress(S().address)),a=o?.address||(newAddress?d:S().addresses.find(x=>x.id===d.addressChoice)||S().address);
 const addressError=addressValidation(a);if(addressError){error('#ck-checkout-error',addressError);return;}
 ui.termsAccepted=!!d.terms||ui.termsAccepted||(legacy&&!!o);
 if(!ui.termsAccepted){error('#ck-checkout-error','يرجى الموافقة على شروط التجربة قبل تأكيد الطلب.');return;}
 const lines=o?o.items:activeLines();
 if(!lines.length){error('#ck-checkout-error','يلزم اختيار قطعة واحدة على الأقل.');return;}
 if(newAddress){const saved={id:'addr-'+Date.now(),label:'المنزل',phone:A.normalizePhone(a.phone)};for(const k of ['name','city','locality','area','street','landmark'])saved[k]=String(a[k]||'').trim();S().addresses.push(saved);S().address=clone(saved);S().selectedAddressId=saved.id;if(!S().defaultAddressId)S().defaultAddressId=saved.id;ui.checkoutNewAddress=false;ui.checkoutAddressDraft={};}
 else if(!o){S().address=clone(a);S().selectedAddressId=a.id;}
 if(!o){ui.deliveryCity=S().address.city;S().deliveryCity=S().address.city;}
 let order=o;try{if(!order)order=makePending();}catch(e){error('#ck-checkout-error',e.message);return;}
 order.payment='stripe';order.paymentStatus='pending';order.paymentError='';
 delete order.cardHolder;delete order.cardLast4;delete order.saveDemoCard;
 ui.pendingOrderId=order.id;
 const chargeCurrency=d.chargeCurrency==='AED'?'AED':'USD';
 ui.checkoutChargeCurrency=chargeCurrency;
 startStripeCheckout(order,chargeCurrency);
}
async function startStripeCheckout(order,chargeCurrency){
 if(processing)return;processing=true;ui.placing=true;A.render(true);
 try{
  const api=window.MonarcaAPI;if(!api)throw new Error('تعذّر الاتصال بخدمة الدفع. حاول مرة أخرى.');
  let session;
  if(order.serverOrderId){session=await api.createStripeCheckoutSession(order.serverOrderId,chargeCurrency);}
  else{session=await api.createStripeCheckout(order,chargeCurrency);}
  const orderId=String(session?.orderId||order.serverOrderId||'');
  if(!orderId||!session?.url)throw new Error('تعذّر بدء الدفع الآمن. حاول مرة أخرى.');
  order.id=orderId;order.serverOrderId=orderId;order.payment='stripe';order.paymentStatus='pending';
  if(Number.isFinite(Number(session.total)))order.total=Number(session.total);
  order.chargeCurrency=session.chargeCurrency;
  order.chargeAmount=session.chargeAmount;
  order.exchangeRate=session.exchangeRate;
  A.save();
  if(session.chargeCurrency!==chargeCurrency)throw new Error(isEnglish()
   ?'The payment currency could not be confirmed. Please try again.'
   :'تعذّر تأكيد عملة الدفع. يرجى المحاولة مجدداً.');
  const checkoutUrl=new URL(session.url);
  if(checkoutUrl.protocol!=='https:'||checkoutUrl.hostname!=='checkout.stripe.com')throw new Error('رابط الدفع الآمن غير صالح.');
  window.location.assign(checkoutUrl.href);
 }catch(e){
  processing=false;ui.placing=false;order.paymentStatus='pending';
  if(e?.message==='INTERNATIONAL_SHIPPING_UNAVAILABLE'){
   order.paymentError=unavailableShippingText();
  }else if(e?.message==='CHECKOUT_TOTAL_CHANGED'){
   order.paymentError=isEnglish()?'The order total has changed. Refresh the page and review the new total before paying.':'تغيّر إجمالي الطلب. يرجى تحديث الصفحة ومراجعة الإجمالي الجديد قبل الدفع.';
  }else{
   order.paymentError=String(e?.message||'تعذّر بدء الدفع الآمن.');
  }
  A.save();A.render(true);
  error('#ck-checkout-error',order.paymentError);
 }
}
function stripeReturn(id){return `${top('تأكيد الدفع')}<div class="ck-content ck-payment-result"><div class="ck-result-icon">${icon('card')}</div><h1>${ui.stripeReturnFailed?'تعذّر التحقق من الدفع':'جارٍ التحقق من الدفع'}</h1><p>${esc(ui.stripeReturnMessage||'نتحقق من حالة الدفع لدى Stripe. لا تغلق هذه الصفحة الآن.')}</p><div class="order-id ltr">${esc(id)}</div><div class="button-stack">${btn('إعادة التحقق','stripe-check-status','primary',`data-id="${esc(id)}"`)}${goto('العودة إلى المتجر','home','text-btn')}</div></div>`;}
function stripeCancelled(id){const o=pending(id);return `${top('الدفع')}<div class="ck-content ck-payment-result"><div class="ck-result-icon failed">${icon('card')}</div><h1>${window.MonarcaI18n?.language()==='en'?'Payment not completed':'لم يكتمل الدفع'}</h1><p>${window.MonarcaI18n?.language()==='en'?'No payment was confirmed. You can return to checkout and try again.':'لم نتلق تأكيداً بالدفع. يمكنك العودة إلى إتمام الطلب والمحاولة مجدداً.'}</p>${o?`<div class="order-id ltr">${esc(id)}</div><div class="button-stack">${goto(window.MonarcaI18n?.language()==='en'?'Return to checkout':'العودة لإتمام الطلب','checkout/'+id,'primary')}${goto('متابعة التسوق','home','text-btn')}</div>`:`<div class="button-stack">${goto('متابعة التسوق','home','primary')}</div>`}</div>`;}
async function verifyStripeReturn(id){
 const attempt=async count=>{
  if(ui.route!=='stripe-return/'+id)return;
  try{
   const status=await window.MonarcaAPI?.getStripePaymentStatus?.(id);
   if(status?.paymentStatus==='paid'){
    const order=await loadStripeOrder(id);if(!order){throw new Error('لم نستطع تحميل تفاصيل الطلب من المتجر بعد.');}
    order.payment='stripe';order.total=Number(status.paidTotal)||order.total;order.paidTotal=Number(status.paidTotal)||order.total;order.transactionId=status.transactionId||'';order.serverOrderId=id;order.chargeCurrency=status.chargeCurrency||order.chargeCurrency||'';if(status.chargeAmount!=null)order.chargeAmount=Number(status.chargeAmount);if(status.exchangeRate!=null)order.exchangeRate=Number(status.exchangeRate);
    if(order.status!=='payment_pending'){ui.lastOrder=id;S().lastOrder=id;ui.pendingOrderId=null;A.save();A.go('success');return;}
    ui.stripeReturnFailed=false;ui.stripeReturnMessage='تم تأكيد الدفع.';finishStripeOrder(order,order.transactionId);return;
   }
   if(status?.paymentStatus==='failed'){
    const order=await loadStripeOrder(id);if(order){order.paymentStatus='failed';order.paymentError='لم يكتمل الدفع. يمكنك المحاولة مجدداً.';A.save();A.go('payment-failed/'+id);return;}
   }
  }catch(_){ }
  if(count<12){ui.stripeReturnMessage='نتحقق من حالة الدفع لدى Stripe. لا تغلق هذه الصفحة الآن.';setTimeout(()=>attempt(count+1),1800);}
  else{ui.stripeReturnFailed=true;ui.stripeReturnMessage='لم يصل تأكيد الدفع بعد. أعد التحقق بعد قليل أو تواصل مع المتجر.';A.render(true);}
 };
 attempt(0);
}
function failed(id){const o=pending(id);if(!o)return top('الدفع')+empty('لم نجد الطلب','راجعي طلباتك.','card','طلباتي','orders');if(o.status!=='payment_pending')return checkout(id);return `${top('تعذّر الدفع')}<div class="ck-content ck-payment-result"><div class="ck-result-icon failed">${icon('card')}</div><h1>${window.MonarcaI18n?.language()==='en'?'Payment not completed':'لم يكتمل الدفع'}</h1><p>${esc(o.paymentError||'لم يكتمل الدفع. لم نتلق تأكيداً بالخصم ويمكنك المحاولة مجدداً.')}</p><div class="order-id ltr">${o.id}</div>${priceBox(o)}<div class="button-stack">${goto(window.MonarcaI18n?.language()==='en'?'Try payment again':'إعادة المحاولة','checkout/'+o.id,'primary')}${goto('تفاصيل الطلب','order/'+o.id,'text-btn')}${goto('طلب المساعدة','support','text-btn')}</div></div>`;}
function finishStripeOrder(o,verifiedTransactionId){
 if(processing||o.paymentStatus==='paid'||o.paymentStatus==='cod_due'||o.status!=='payment_pending')return;processing=true;ui.placing=true;A.render(true);
 setTimeout(()=>{
  if(!S().orders.includes(o)||o.status!=='payment_pending'){processing=false;ui.placing=false;A.render(true);return;}
  const usedCoupon=o.couponCode&&o.couponCode!=='FREE100'&&S().couponWallet?.find(c=>c.code===o.couponCode&&c.usedAt&&c.orderId!==o.id);
  if(usedCoupon){o.paymentStatus='failed';o.paymentError='استُخدمت قسيمة هذا الطلب في طلب آخر. يلزم مراجعة الطلب لتحديث المبلغ.';o.requiresRequote=true;processing=false;ui.placing=false;A.save();A.go('payment-failed/'+o.id);return;}
  o.payment='stripe';o.status='placed';o.paymentStatus='paid';o.confirmedAt=new Date().toISOString();
  o.paidAt=o.confirmedAt;o.paymentError='';o.transactionId=verifiedTransactionId;
  o.history=Array.isArray(o.history)?o.history:[];
  o.history.push({status:'placed',date:o.confirmedAt,note:'تم تأكيد الدفع عبر Stripe'});
  if(o.source==='cart'&&!o.cartConsumed){for(const l of o.sourceLines||o.items){const found=S().cart.find(x=>lineKey(x)===lineKey(l));if(found)found.qty=Math.max(0,found.qty-l.qty);}S().cart=S().cart.filter(l=>l.qty>0);o.cartConsumed=true;}
  if(o.couponCode&&!o.couponConsumed){window.MonarcaAccountCoupons?.markUsed?.(o.couponCode,o.id);if(S().coupon===o.couponCode)S().coupon='';o.couponConsumed=true;}
  cardDraft={};ui.buyNow=null;ui.buyNowCoupon='';ui.paymentUserSelected=false;ui.lastOrder=o.id;S().lastOrder=o.id;ui.pendingOrderId=null;processing=false;ui.placing=false;ui.orderNote='';ui.gift=false;ui.giftMessage='';ui.termsAccepted=false;A.save();A.go('success');
 },450);
}
function success(){
 const o=S().orders.find(x=>x.id===(ui.lastOrder||S().lastOrder));if(!o)return top('تأكيد الطلب')+empty('لا يوجد طلب جديد','يمكن متابعة التسوق.');
 const cod=o.payment==='cod',stripe=o.payment==='stripe',lang=window.MonarcaI18n?.language()==='en',paymentLabel=cod?(lang?'Cash on delivery':'الدفع عند الاستلام'):stripe?'Stripe':cardName(o.payment);
 return top(lang?'Order confirmed':'تم تأكيد الطلب')+'<div class="ck-content ck-payment-result"><div class="ck-result-icon">'+icon('check')+'</div><h1>'+(lang?'Order confirmed':'تم تأكيد الطلب.')+'</h1><p>'+(cod?(lang?'Your order is confirmed. Payment is due on delivery.':'تم حفظ الطلب. المبلغ مستحق عند الاستلام ولم يُحصّل أي مبلغ نقدي.'):stripe?(lang?'Your card payment has been confirmed securely by Stripe.':'تم تأكيد الدفع بالبطاقة عبر Stripe.'):'تم تأكيد دفعة الاختبار وحفظ الطلب.')+'</p><div class="order-id ltr">'+esc(o.id)+'</div><div class="ck-success-facts"><span>'+(cod?icon('truck'):stripe?icon('card'):cardBrand(o.payment))+' '+paymentLabel+'</span><span>'+icon('pin')+' '+esc(addressPlace(o.address))+' · '+esc(o.address?.area)+'</span><span>'+icon('truck')+' '+esc(deliverySummary(orderDeliveryGroups(o)))+'</span></div>'+priceBox(o)+'<p class="ck-payment-state">'+(cod?(lang?'Due on delivery: ':'المبلغ المستحق عند الاستلام: ')+money(o.total)+'<br>'+(lang?'Paid: ':'المدفوع: ')+money(0):(lang?'Paid: ':'المدفوع: ')+(stripe&&o.chargeCurrency==='AED'&&o.chargeAmount!=null?aedMoney(o.chargeAmount):money(o.paidTotal)))+'</p>'+(stripe?'<p class="ck-transaction">'+(lang?'Stripe payment reference':'مرجع عملية Stripe')+' <span class="ltr">'+esc(o.transactionId||'')+'</span></p>':'')+'<div class="button-stack">'+goto(lang?'View order':'متابعة تفاصيل الطلب','order/'+o.id)+goto(lang?'Continue shopping':'متابعة التسوق','home','text-btn')+'</div></div>';
}
const actions={
 'stripe-check-status':el=>{ui.stripeReturnFailed=false;ui.stripeReturnMessage='جارٍ التحقق من حالة الدفع.';A.render(true);verifyStripeReturn(el.dataset.id);},
 'remove-coupon':()=>{if(ui.buyNow)ui.buyNowCoupon='';else S().coupon='';persist();},
 'ck-requote':el=>{const o=pending(el.dataset.id);if(!o||o.status!=='payment_pending')return;o.status='cancelled';o.cancelReason='إعادة المراجعة بعد انتهاء أهلية القسيمة';o.cancelledAt=new Date().toISOString();ui.buyNow=o.items.map(l=>({id:l.id,color:l.color,size:l.size,qty:l.qty,selected:true}));ui.requoteSource=o.source||'direct';ui.buyNowCoupon='';ui.pendingOrderId=null;ui.termsAccepted=false;A.save();A.go('checkout');},
 'ck-edit':el=>editVariant(Number(el.dataset.index)),
 'ck-save-later':el=>{const i=Number(el.dataset.index),l=S().cart[i];if(!l)return;const found=S().savedItems.find(x=>lineKey(x)===lineKey(l));if(!found)S().savedItems.push(clone(l));S().cart.splice(i,1);persist();A.toast('حُفظت القطعة لوقت لاحق');},
 'ck-move-wish':el=>{const l=S().cart[Number(el.dataset.index)];if(!l)return;if(!S().wish.includes(l.id))S().wish.push(l.id);persist();A.toast('تم حفظ القطعة في المفضلة');},
 'ck-restore':el=>{const i=Number(el.dataset.index),l=S().savedItems[i];if(!l)return;const p=product(l.id),existing=S().cart.find(x=>lineKey(x)===lineKey(l));if(p.stock<1||l.size===p.unavailable){A.toast('هذا الخيار غير متوفر. افتحي المنتج لاختيار بديل.');return;}const room=p.stock-(existing?.qty||0),qty=Math.min(room,l.qty);if(qty<1){A.toast('وصلتِ إلى الحد المتاح في الحقيبة. بقيت القطعة محفوظة لوقت لاحق.');return;}if(existing){existing.qty+=qty;existing.selected=true;}else S().cart.push({...l,qty,selected:true});l.qty-=qty;if(l.qty<=0)S().savedItems.splice(i,1);persist();A.toast(l.qty>0?'أضيفت الكمية المتاحة. بقيت الكمية الأخرى محفوظة لوقت لاحق.':'عادت القطعة إلى حقيبتك');},
 'ck-delete-saved':el=>{S().savedItems.splice(Number(el.dataset.index),1);persist();},
 'ck-checkout':()=>{if(!selected().length){A.toast('يلزم تحديد قطعة واحدة على الأقل.');return;}ui.requoteSource=null;ui.buyNow=null;ui.paymentUserSelected=false;ui.pendingOrderId=null;ui.termsAccepted=false;ui.checkoutNewAddress=!S().address;ui.checkoutAddressDraft={city:ui.deliveryCity||''};A.go('checkout');},
 'ck-inline-address-fill':()=>{ui.checkoutAddressDraft={name:'TEST CUSTOMER',phone:'07700000000',city:ui.checkoutAddressDraft?.city||'بغداد',locality:ui.checkoutAddressDraft?.city||'بغداد',area:'المنصور',street:'شارع الروّاد',landmark:'قرب مول المنصور'};A.render(true);},
 'ck-address-new':()=>{ui.editAddressId=null;ui.addressDraft={city:ui.deliveryCity||''};A.go('address');},
 'ck-address-edit':el=>{ui.editAddressId=el.dataset.id;ui.addressDraft={};A.go('address');},
 'ck-address-default':el=>{S().defaultAddressId=el.dataset.id;persist();A.toast('تم تعيين العنوان الافتراضي');},
 'ck-address-delete':el=>A.sheet('حذف العنوان',`<p>هل تريدين إزالة هذا العنوان من دفتر العناوين؟ الطلبات السابقة تحتفظ بعناوينها.</p><div class="button-stack">${btn('تأكيد الحذف','ck-address-delete-confirm','primary',`data-id="${el.dataset.id}"`)}${btn('إلغاء','close-sheet','secondary')}</div>`),
 'ck-address-delete-confirm':el=>{const id=el.dataset.id;S().addresses=S().addresses.filter(a=>a.id!==id);if(S().defaultAddressId===id)S().defaultAddressId=S().addresses[0]?.id||null;if(S().selectedAddressId===id){S().address=S().addresses.find(a=>a.id===S().defaultAddressId)||null;S().selectedAddressId=S().address?.id||null;ui.deliveryCity=S().address?.city||'';}A.closeSheet();persist();},
 'ck-address-select':el=>{const a=S().addresses.find(x=>x.id===el.dataset.id);if(!a)return;ui.addressReturn='checkout';if(!validAddress(a)){ui.editAddressId=a.id;ui.addressDraft={};A.go('address');A.toast('أكملي عنوان التوصيل قبل مراجعة الطلب.');return;}S().address=clone(a);S().selectedAddressId=a.id;ui.deliveryCity=a.city;S().deliveryCity=a.city;A.save();A.go('checkout');},
 'ck-choose-address':()=>{ui.addressReturn='checkout';A.go('addresses/checkout');},
 'edit-address':()=>{ui.addressReturn='checkout';ui.editAddressId=S().address?.id;ui.addressDraft={};A.go('address');},
 'ck-address-fill':()=>{const current=Object.fromEntries(new FormData($('#ck-address-form')));ui.addressDraft={...current,label:current.label||'المنزل',name:'سارة أحمد',phone:'07700000000',city:current.city||'بغداد',locality:current.locality||current.city||'بغداد',area:'المنصور',street:'شارع الروّاد',landmark:'قرب مول المنصور',building:'١٢',apartment:'الطابق الأول',note:'عنوان تجريبي'};A.render(true);},
 'ck-shipping':el=>{ui.shippingMode='standard';A.render(true);},
 'ck-coupon-select':el=>{applyCoupon(el.dataset.value);A.go(ui.couponReturn||'checkout');},
 'ck-continue-payment':()=>A.go('checkout'),
 'ck-fill-card':()=>{cardDraft={holder:'SARA AHMED',number:ui.payment==='mastercard'?'5555 5555 5555 4444':'4242 4242 4242 4242',expiry:'12/30',cvv:'123',saveCard:!!cardDraft.saveCard};A.render(true);},
 'ck-switch-card':el=>{ui.payment=ui.payment==='visa'?'mastercard':'visa';ui.paymentUserSelected=true;ui.selectedPaymentToken=null;cardDraft={};const o=el.dataset.id&&pending(el.dataset.id);if(o){if(o.status!=='payment_pending'){A.go('order/'+o.id);return;}o.payment=ui.payment;o.paymentStatus='pending';A.save();A.go('payment/'+o.id);}else A.go('checkout');},
 'ck-decline':el=>{const o=pending(el.dataset.id);if(!o||o.status!=='payment_pending')return;o.paymentStatus='failed';o.paymentError='رفض تجريبي من جهة إصدار البطاقة. لا يوجد خصم حقيقي.';A.save();A.go('payment-failed/'+o.id);},
 'ck-resend-auth':()=>{if(ui.authResendAt&&Date.now()-ui.authResendAt<15000){A.toast('انتظري قليلاً قبل طلب رمز آخر. رمز الاختبار 123456.');return;}ui.authResendAt=Date.now();A.toast('رمز الاختبار هو 123456 · لم تُرسل رسالة فعلية.');},
 'ck-pay-order':el=>A.go('payment/'+el.dataset.id)
};
const forms={
 'delivery-form':(form,d)=>{ui.deliveryCity=d.city;S().deliveryCity=d.city;A.closeSheet();if(S().address&&S().address.city!==d.city){ui.addressReturn='delivery';ui.editAddressId=null;ui.addressDraft={label:'المنزل',city:d.city,locality:'',name:S().address.name,phone:S().address.phone,area:'',street:'',landmark:'',building:'',apartment:''};A.go('address');A.toast('أكملي عنوان المدينة الجديدة. عنوانك السابق محفوظ.');}else{A.save();A.render(true);}},
 'ck-coupon-form':(form,d)=>applyCoupon(d.code),
 'ck-variant-form':(form,d)=>{const i=Number(form.dataset.index),l=S().cart[i];if(!l)return;const p=product(l.id),qty=Number(d.qty);if(!p.colors.includes(d.color)||!p.sizes.includes(d.size)||p.unavailable===d.size||qty<1||qty>p.stock){error('#ck-variant-error','اختاري خيارات متوفرة وكمية ضمن المخزون');return;}const match=S().cart.find((x,j)=>j!==i&&x.id===l.id&&x.color===d.color&&x.size===d.size);if(match&&match.selected!==l.selected){error('#ck-variant-error','هذان الخياران لهما حالة تحديد مختلفة. وحّدي التحديد أولاً حتى لا تتغير قطع الطلب دون قصد.');return;}if(match&&match.qty+qty>p.stock){error('#ck-variant-error','توجد قطعة بنفس الخيارات في حقيبتك. مجموع الكمية يتجاوز المخزون.');return;}if(match){match.qty+=qty;match.selected=l.selected;S().cart.splice(i,1);}else Object.assign(l,{color:d.color,size:d.size,qty});A.closeSheet();persist();A.toast('تم تحديث تفاصيل القطعة');},
 'ck-address-form':(form,d)=>{ui.addressDraft=d;const phone=A.normalizePhone(d.phone);let message='';if(d.name.trim().length<3)message='يرجى إدخال الاسم الكامل للمستلم.';else if(!phone)message='أدخلي رقماً عراقياً صحيحاً بصيغة 07… أو +964 7…';else if(!A.cities.includes(d.city))message='اختاري مدينة / منطقة التوصيل.';else if(!String(d.locality||'').trim())message='أكملي المدينة أو القضاء أو الناحية.';else if(!d.area.trim()||!d.street.trim()||!d.landmark.trim())message='أكملي المنطقة والشارع وأقرب نقطة دالة.';if(message){error('#ck-address-error',message);return;}const a={...d,locality:String(d.locality).trim(),phone,id:ui.editAddressId||'addr-'+Date.now(),label:d.label||'المنزل'};delete a.default;const i=S().addresses.findIndex(x=>x.id===a.id);if(i>=0)S().addresses[i]=a;else S().addresses.push(a);if(d.default||!S().defaultAddressId)S().defaultAddressId=a.id;if(['checkout','delivery'].includes(ui.addressReturn)||!S().address||S().selectedAddressId===a.id){S().address=clone(a);S().selectedAddressId=a.id;ui.deliveryCity=a.city;S().deliveryCity=a.city;}ui.addressDraft={};ui.editAddressId=null;A.save();A.toast('تم حفظ العنوان');A.go(ui.addressReturn==='delivery'?'home':ui.addressReturn==='checkout'&&activeLines().length?'checkout':'addresses');},
 'ck-checkout-form':(form,d)=>submitCheckout(form,d),
 'ck-card-form':(form,d)=>submitCheckout(form,d,true),
 'ck-auth-form':(form,d)=>{const o=pending(form.dataset.id);if(o)A.go('payment/'+o.id);}

};
A.loadStripeOrder=loadStripeOrder;
A.register({routes:{cart:basket,saved,addresses,address:addressForm,checkout,payment,'payment-auth':auth,'payment-failed':failed,'stripe-return':stripeReturn,'stripe-cancelled':stripeCancelled,success,'delivery-options':deliveryOptions,'coupon-select':couponSelect},actions,forms,pricing,shoppingLines:activeLines,couponApply:applyCoupon,
 change:e=>{if(e.target.name==='chargeCurrency'&&e.target.checked){ui.checkoutChargeCurrency=e.target.value;return true;}if(e.target.id==='ck-address-choice'){ui.checkoutNewAddress=e.target.value==='new';if(!ui.checkoutNewAddress){const a=S().addresses.find(x=>x.id===e.target.value);if(a){S().address=clone(a);S().selectedAddressId=a.id;ui.deliveryCity=a.city;S().deliveryCity=a.city;A.save();}}A.render(true);return true;}if(e.target.id==='ck-inline-city'){ui.checkoutAddressDraft={...(ui.checkoutAddressDraft||{}),city:e.target.value};A.render(true);return true;}if(e.target.id==='ck-select-all'){S().cart.forEach(l=>l.selected=e.target.checked);persist();return true;}if(e.target.dataset.ckSelect!==undefined){S().cart[Number(e.target.dataset.ckSelect)].selected=e.target.checked;persist();return true;}if(e.target.id==='ck-gift'){ui.gift=e.target.checked;A.render(true);return true;}if(e.target.id==='ck-terms'){ui.termsAccepted=e.target.checked;return true;}if(e.target.id==='ck-token'){const c=S().paymentTokens.find(x=>x.id===e.target.value&&x.isDemo);if(c){ui.payment=c.network;ui.paymentUserSelected=true;ui.selectedPaymentToken=c.id;cardDraft={holder:c.holder,number:c.network==='mastercard'?'5555 5555 5555 4444':'4242 4242 4242 4242',expiry:'12/30',cvv:'123'};}else{ui.selectedPaymentToken=null;cardDraft={};}A.render(true);return true;}return false;},
 reset:()=>{cardDraft={};processing=false;ui.checkoutAddressDraft={};ui.checkoutNewAddress=false;},
  onRoute:(name,id)=>{
  ensure();
  if(['checkout','payment','payment-auth'].includes(name))ui.checkoutChargeCurrency=id?pending(id)?.chargeCurrency:undefined;
  if(['order','tracking'].includes(name)&&id)loadStripeOrder(id,true).then(order=>{if(order&&ui.route===name+'/'+id)A.render(true);}).catch(()=>{});
  if(name==='addresses')ui.addressReturn=id==='checkout'?'checkout':'addresses';
  if(['payment','payment-auth','payment-failed'].includes(name)){ui.pendingOrderId=id||null;const o=id?pending(id):null;if(o&&ui.paymentOrderId!==o.id){ui.payment=o.payment||'visa';ui.paymentOrderId=o.id;cardDraft={};ui.selectedPaymentToken=null;ui.termsAccepted=false;}}
  if(name==='stripe-return'&&id){ui.pendingOrderId=id;ui.stripeReturnFailed=false;ui.stripeReturnMessage='جارٍ التحقق من حالة الدفع لدى Stripe. لا تغلق هذه الصفحة الآن.';setTimeout(()=>verifyStripeReturn(id),0);}
  if(name==='stripe-cancelled'&&id)ui.pendingOrderId=id;
  if(name==='checkout'){ui.pendingOrderId=null;ui.paymentOrderId=null;if(!ui.paymentUserSelected){const c=S().paymentTokens.find(t=>t.isDemo&&t.default);ui.payment=c?.network||'visa';ui.selectedPaymentToken=c?.id||null;}}
  if(['checkout','payment','payment-auth'].includes(name)&&ui.payment!=='cod'&&!Object.keys(cardDraft).length){const c=S().paymentTokens.find(t=>t.id===ui.selectedPaymentToken&&t.isDemo&&t.network===ui.payment);if(c)cardDraft={holder:c.holder,number:c.network==='mastercard'?'5555 5555 5555 4444':'4242 4242 4242 4242',expiry:'12/30',cvv:'123'};}
  if(name==='coupon-select')ui.couponReturn=['cart','checkout'].includes(ui.previous)?ui.previous:'checkout';
}

});
document.addEventListener('input',e=>{if(e.target.id==='ck-order-note')ui.orderNote=e.target.value;if(e.target.id==='ck-gift-message')ui.giftMessage=e.target.value;if(e.target.closest('#ck-address-form'))ui.addressDraft=Object.fromEntries(new FormData($('#ck-address-form')));if(e.target.closest('#ck-card-form'))cardDraft=Object.fromEntries(new FormData($('#ck-card-form')));if(e.target.closest('#ck-checkout-form')){const form=e.target.closest('#ck-checkout-form'),d=Object.fromEntries(new FormData(form));for(const k of ['holder','number','expiry','cvv','saveCard','demoDecline'])cardDraft[k]=d[k]||'';if(ui.checkoutNewAddress||!S().address){ui.checkoutAddressDraft={};for(const k of ['name','phone','city','locality','area','street','landmark'])ui.checkoutAddressDraft[k]=d[k]||'';}}});
})();

