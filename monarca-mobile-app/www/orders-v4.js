/* Monarca · order management, delivery, and after-sales · local prototype. */
(() => {
'use strict';
const M = window.Monarca;
if (!M) return;
const {ui, esc, icon, money, ar, top, btn, goto, photo, toast, go, render, save, sheet, closeSheet, addressPlace} = M;
const statusNames = {payment_pending:'بانتظار الدفع',placed:'تم تأكيد الطلب',preparing:'قيد التجهيز',shipped:'في الطريق',delivered:'تم التسليم',cancelled:'ملغي',returned:'طلب سابق للإرجاع'};
const returnNames = {requested:'تم تقديم الطلب',approved:'تمت الموافقة',in_transit:'القطعة في طريق العودة',received:'تم استلام وفحص القطعة',refund_pending:'قيد الاسترداد التجريبي',refunded:'اكتمل الاسترداد التجريبي',exchange_shipped:'تم إرسال البديل',completed:'اكتمل الاستبدال',cancelled:'تم إلغاء الطلب',rejected:'تعذرت الموافقة'};
const refundNames = {requested:'تم تسجيل الاسترداد',processing:'جارٍ محاكاة المعالجة',completed:'اكتملت المحاكاة'};
const deliveryLevels = ['placed','preparing','shipped','delivered'];
const returnReasons = ['المقاس غير مناسب','اللون مختلف عن المتوقع','القطعة مختلفة عن الوصف','يوجد عيب أو تلف','وصلت قطعة مختلفة','سبب آخر'];
const cancelReasons = ['أرغب في تغيير القطع أو المقاس','أرغب في تعديل العنوان','طلب مكرر','مدة التوصيل لا تناسبني','غيّرت رأيي','سبب آخر'];
const draft = {orderId:null,type:'return',selected:{},reason:'',note:'',attachments:[],busy:false};
const now = () => new Date().toISOString();
const uid = prefix => prefix + '-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2,5).toUpperCase();
const dateText = v => {
  if (!v) return '—';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? esc(v) : new Intl.DateTimeFormat(M.locale?.()||'ar-IQ',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Baghdad'}).format(d);
};
const getOrder = id => M.state.orders.find(o => String(o.id) === String(id));
const getProduct = id => M.products.find(p => Number(p.id) === Number(id));
const itemProduct = l => {const p=getProduct(l.id)||{id:l.id,name:'قطعة من طلب سابق',img:0,colors:[],sizes:[],stock:0};return {...p,name:l.name||p.name,img:l.img??p.img};};
const colorName = c => M.colors[c]?.[0] || c || '—';
const cardLabel = o => o.payment === 'cod' ? 'الدفع عند الاستلام' : o.payment === 'mastercard' ? 'Mastercard' : 'Visa';
const deliveryLabel = o => M.orderDeliveryGroups(o).length>1?'شحنات من العراق والصين':M.orderDeliveryGroups(o)[0]?.label||'التوصيل';
const deliveryEstimate = o => esc(M.deliverySummary(M.orderDeliveryGroups(o)));
const roundMoney=value=>M.roundMoney?M.roundMoney(value):Math.round((Number(value)+Number.EPSILON)*100)/100;
const hasPaid = o => o.paymentStatus === 'paid' || (o.payment!=='cod'&&!o.paymentStatus&&o.status!=='payment_pending');
const paidTotal = o => hasPaid(o)?Math.max(0,Number(o.paidTotal ?? o.total) || 0):0;
const button = (label,action,id,cls='secondary',extra='') => btn(label,action,cls,`data-id="${esc(id)}" ${extra}`);
const row = (label,value,cls='') => `<div class="od-fact ${cls}"><span>${label}</span><strong>${value}</strong></div>`;
const note = (message,ico='info',cls='') => `<div class="od-note ${cls}">${icon(ico)}<div>${message}</div></div>`;
const section = (title,body,extra='') => `<section class="od-section"><div class="od-section-title"><h2>${title}</h2>${extra}</div>${body}</section>`;
const tag = (text,status='') => `<span class="od-tag od-tag-${esc(status)}">${text}</span>`;
const requestStatus = r => r.status==='completed'&&r.type==='return'&&r.noRefund?'اكتمل الإرجاع دون استرداد':returnNames[r.status]||r.status;
const demo = 'هذه محاكاة لشرح تجربة التسوق. لا يوجد شحن أو خصم أو استرداد مالي حقيقي.';
function ensure() {
  const s=M.state;
  if (!Array.isArray(s.orders)) s.orders=[];
  if (!Array.isArray(s.returnRequests)) s.returnRequests=[];
  if (!Array.isArray(s.refunds)) s.refunds=[];
  for (const o of s.orders) {
    if (!Array.isArray(o.items)) o.items=[];
    if (!Array.isArray(o.history)) o.history=[];
    if(o.payment==='cod'&&o.paymentStatus!=='paid'){o.paymentStatus='cod_due';o.paidTotal=0;delete o.transactionId;delete o.paidAt;}
    // Import old per-order single-line requests exactly once; keep the original order status.
    (o.returnRequests || []).forEach((r,i) => {
      const id=r.id || `RT-LEGACY-${o.id}-${i}`;
      if (s.returnRequests.some(x=>x.id===id)) return;
      const l=o.items[r.itemIndex];
      if (!l) return;
      const request={id,orderId:o.id,type:r.type || 'return',items:[{itemIndex:r.itemIndex,productId:l.id,name:itemProduct(l).name,color:l.color,size:l.size,qty:Math.max(1,Number(r.qty)||1),unitPrice:Number(l.price)||itemProduct(l).price||0,amount:0}],reason:r.reason || 'طلب سابق',note:r.note||'',status:r.status==='requested'?'requested':r.status||'requested',createdAt:r.createdAt || o.createdAt || now(),history:[],attachments:[]};
      request.items[0].amount=refundFor(o,Number(r.itemIndex),request.items[0].qty,0);
      s.returnRequests.push(request);
    });
  }
}
function requestsFor(o) { return M.state.returnRequests.filter(r=>r.orderId===o.id); }
function refundsFor(o) { return M.state.refunds.filter(r=>r.orderId===o.id); }
function usedQty(o,index) {
  return requestsFor(o).filter(r=>!['cancelled','rejected'].includes(r.status)).reduce((n,r)=>n+(r.items || []).filter(l=>Number(l.itemIndex)===Number(index)).reduce((a,l)=>a+(Number(l.qty)||0),0),0);
}
function available(o,index) { return Math.max(0,(Number(o.items[index]?.qty)||0)-usedQty(o,index)); }
function allocateLine(o,index,target) {
 const gross=o.items.map(l=>Math.round((Number(l.price)||itemProduct(l).price||0)*(Number(l.qty)||0)*100)),totalGross=gross.reduce((a,b)=>a+b,0);
 if(!totalGross)return 0;
 const net=Math.max(0,Math.min(totalGross,Math.round(target*100))),before=gross.slice(0,index).reduce((a,b)=>a+b,0);
 return (Math.round((before+gross[index])*net/totalGross)-Math.round(before*net/totalGross))/100;
}
// Dollar cents are allocated cumulatively; partial returns never lose or invent cents.
function lineNet(o,index) {return allocateLine(o,index,(Number(o.total)||0)-(Number(o.shipping)||0));}
function refundableLineNet(o,index) {return allocateLine(o,index,Math.max(0,paidTotal(o)-(Number(o.shipping)||0)));}
function refundFor(o,index,qty,already=usedQty(o,index)) {
 const ordered=Number(o.items[index]?.qty)||1,cents=Math.round(refundableLineNet(o,index)*100);
 return Math.max(0,Math.round(cents*Math.min(ordered,already+qty)/ordered)-Math.round(cents*Math.min(ordered,already)/ordered))/100;
}
function addressBlock(a) {
  if (!a) return '<p class="page-intro">لم يُسجّل عنوان لهذا الطلب.</p>';
  return `<div class="od-address"><b data-user-text>${esc(a.name || '')}</b><p><span data-user-text>${[addressPlace(a),a.area,a.street].filter(Boolean).map(esc).join(' · ')}</span>${a.building?`<br>البناية: ${esc(a.building)}`:''}${a.apartment?` · ${esc(a.apartment)}`:''}${a.landmark?`<br>نقطة دالة: <span data-user-text>${esc(a.landmark)}</span>`:''}</p><span class="ltr" data-user-text>${esc(a.phone || '')}</span>${a.note?`<p>ملاحظة التوصيل: <span data-user-text>${esc(a.note)}</span></p>`:''}</div>`;
}
function orderLine(o,l,index,review=false) {
  const p=itemProduct(l), gross=(Number(l.price)||p.price||0)*(Number(l.qty)||0);
  const reviewed=(o.reviewedItems||[]).some(id=>Number(id)===Number(l.id));
  return `<div class="od-product"><button class="od-product-image" data-go="product/${esc(l.id)}" aria-label="${esc(p.name)}">${photo(p)}</button><div class="od-product-info"><button class="od-product-name" data-go="product/${esc(l.id)}">${esc(l.name || p.name)}</button><p>${esc(colorName(l.color))} · <span dir="auto">${esc(l.size)}</span></p><p>الكمية: ${ar(l.qty)} · ${money(Number(l.price)||p.price||0)} / قطعة</p><strong>${money(gross)}</strong>${Number(o.discount)>0?`<small>القيمة بعد توزيع خصم الطلب: ${money(lineNet(o,index))}</small>`:''}${M.fulfillmentBadge?M.fulfillmentBadge(l):''}${usedQty(o,index)?`<small class="od-after-count">خدمة ما بعد البيع لـ ${ar(usedQty(o,index))} من ${ar(l.qty)} قطعة</small>`:''}${review?`<button class="text-btn" data-go="${reviewed?'reviews/'+esc(l.id):'write-review/'+esc(o.id)}" data-product="${esc(l.id)}">${icon('star')} ${reviewed?'تم التقييم · عرض المراجعات':'قيّمي هذه القطعة'}</button>`:''}</div></div>`;
}
function orderSummary(o) {
 const coupon=o.couponCode||o.coupon,cod=o.payment==='cod',cancelled=o.status==='cancelled';
 return '<div class="summary od-summary">'+row('مجموع القطع',money(Number(o.subtotal)||0))+row('خصم الطلب'+(coupon?' <small dir="ltr">'+esc(coupon)+'</small>':''),Number(o.discount)?'− '+money(o.discount):'—')+row('التوصيل',Number(o.shipping)?money(o.shipping):'مجاناً')+row('إجمالي الطلب',money(Number(o.total)||0),'od-total')+(cod?row('المدفوع',money(paidTotal(o)))+row(cancelled?'المبلغ المستحق بعد الإلغاء':'المبلغ المستحق عند الاستلام',money(cancelled?0:Math.max(0,(Number(o.total)||0)-paidTotal(o)))):row(hasPaid(o)?'الإجمالي المدفوع':'الإجمالي المستحق',money(hasPaid(o)?paidTotal(o):cancelled?0:Number(o.total)||0)))+'</div>';
}
function orderPreferences(o) {
  const rows=(o.orderNote?row('ملاحظات الطلب','<span data-user-text>'+esc(o.orderNote)+'</span>'):'')+(o.gift?row('تغليف هدية','مطلوب · تغليف تجريبي'):'')+(o.gift&&o.giftMessage?row('رسالة الهدية','<span data-user-text>'+esc(o.giftMessage)+'</span>'):'');
  return rows?`<div class="od-order-preferences">${rows}</div>`:'';
}
function paymentInfo(o) {
 const paid=hasPaid(o),pending=o.status==='payment_pending',cod=o.payment==='cod';
 if(cod)return '<div class="od-payment-card od-cod-payment"><div class="inline-row"><span class="od-card-network">'+icon('truck')+' <b>الدفع عند الاستلام</b></span>'+tag(o.status==='cancelled'?'ألغي قبل التحصيل':paid?'تم التحصيل تجريبياً':'بانتظار التحصيل عند الاستلام',paid?'paid':'cod_due')+'</div>'+row('إجمالي الطلب',money(o.total||0))+row('المدفوع',money(paidTotal(o)))+row('المبلغ المستحق',money(o.status==='cancelled'?0:Math.max(0,(Number(o.total)||0)-paidTotal(o))))+note(paid?'تم تسجيل تحصيل تجريبي محلي. لا توجد حركة مالية حقيقية.':o.status==='cancelled'?'إلغاء الطلب لا ينشئ استرداداً لأن المبلغ لم يُحصّل.':'لم يُحصّل أي مبلغ نقدي. محاكاة التسليم لا تؤكد التحصيل.','info')+'</div>';
 return '<div class="od-payment-card"><div class="inline-row"><span class="od-card-network">'+(M.cardBrand?M.cardBrand(o.payment):icon('card'))+' <b dir="ltr">'+cardLabel(o)+'</b></span>'+tag(paid?'مدفوع تجريبياً':o.paymentStatus==='failed'?'تعذّر الدفع':'لم يتم الدفع',paid?'paid':'payment_pending')+'</div>'+(o.cardLast4?row('البطاقة','<span dir="ltr">•••• '+esc(o.cardLast4)+'</span>'):'')+row('طريقة الدفع','بطاقة '+cardLabel(o))+(paid?row('قيمة العملية',money(paidTotal(o))):row('المبلغ المطلوب',money(o.status==='cancelled'?0:o.total||0)))+row('رقم العملية',o.transactionId?'<span class="ltr">'+esc(o.transactionId)+'</span>':paid?'عملية توضيحية سابقة':'لم يتم إنشاء عملية ناجحة')+row('وقت الدفع',o.paidAt?dateText(o.paidAt):paid?'طلب توضيحي سابق':'—')+(o.paymentStatus==='failed'?'<p class="od-error-text">لم يكتمل الدفع. يمكن إعادة المحاولة بالطلب نفسه دون إنشاء طلب مكرر.</p>':'')+'<p class="field-note">بيانات محفوظة عند إنشاء الطلب. لا يحتفظ النموذج برقم البطاقة الكامل أو رمز الأمان.</p>'+(pending?goto('إكمال الدفع','payment/'+o.id):'')+'</div>';
}
function missing(title='تفاصيل الطلب') { return top(title)+M.empty('لم يتم العثور على الطلب','قد يكون الرابط قديماً أو تم مسح بيانات التجربة. افتحي قائمة طلباتك لاختيار طلب موجود.','box','العودة إلى طلباتي','orders'); }
function orderActions(o,compact=false) {
  const id=o.id,buttons=[];
  if (o.status==='payment_pending') buttons.push(goto(o.paymentStatus==='failed'?'إعادة محاولة الدفع':'إكمال الدفع','payment/'+id));
  if (deliveryLevels.includes(o.status)) buttons.push(goto(o.status==='delivered'?'تفاصيل التوصيل':'تتبّع الشحنة','tracking/'+id,compact?'secondary':'primary'));
  if (['payment_pending','placed','preparing'].includes(o.status)) buttons.push(button('إلغاء الطلب','od-cancel',id,'text-btn'));
  if (!compact && o.status==='delivered') {
    buttons.push(goto('كتابة تقييم','write-review/'+id,'secondary'));
    if (o.items.some((_,i)=>available(o,i)>0)) buttons.push(goto('طلب إرجاع أو استبدال','return/'+id,'secondary'));
  }
  return `<div class="od-actions ${compact?'od-actions-compact':''}">${buttons.join('')}</div>`;
}
function orderCard(o) {
  const count=o.items.reduce((n,l)=>n+(Number(l.qty)||0),0),rs=requestsFor(o);
  return `<article class="od-order-card"><button class="od-order-heading" data-go="order/${esc(o.id)}"><span><b class="ltr">${esc(o.id)}</b><small>${o.createdAt?dateText(o.createdAt):esc(o.date || '')}</small></span>${tag(statusNames[o.status] || 'حالة الطلب',o.status)}${icon('back')}</button><button class="od-order-products" data-go="order/${esc(o.id)}" aria-label="تفاصيل القطع في الطلب ${esc(o.id)}"><span class="od-thumbnails">${o.items.slice(0,3).map(l=>photo(itemProduct(l))).join('')}</span><span>${ar(count)} ${count===1?'قطعة':'قطع'}<small>${esc(addressPlace(o.address) || 'العراق')} · ${cardLabel(o)}</small></span><strong>${money(o.total||0)}</strong></button>${rs.length?`<button class="od-service-strip" data-go="return-detail/${esc(rs[rs.length-1].id)}">${icon('return')} ${ar(rs.length)} طلبات خدمة ما بعد البيع ${icon('arrow')}</button>`:''}${orderActions(o,true)}<button class="od-full-link" data-go="order/${esc(o.id)}">عرض تفاصيل الطلب ${icon('arrow')}</button></article>`;
}
function orders() {
  ensure();
  const s=M.state,filter=ui.orderFilter || 'all',q=(ui.orderSearch || '').trim().toLowerCase();
  const match=o=>filter==='all'||filter==='preparing'&&['placed','preparing'].includes(o.status)||filter==='active'&&['placed','preparing','shipped'].includes(o.status)||filter==='other'&&(o.status==='cancelled'||requestsFor(o).length)||filter==='after'&&requestsFor(o).length||filter===o.status;
  const orders=s.orders.filter(o=>match(o)&&(!q||(o.id+' '+o.items.map(l=>itemProduct(l).name).join(' ')+' '+(o.address?.name||'')).toLowerCase().includes(q)));
  const filters=[['all','الكل'],['payment_pending','بانتظار الدفع'],['placed','مؤكد'],['preparing','التجهيز'],['shipped','الشحن'],['delivered','تم التسليم'],['cancelled','الملغاة'],['after','الإرجاع والاستبدال']];
  return `${top('طلباتي',`<button class="icon-btn" data-go="support" aria-label="مساعدة الطلبات">${icon('chat')}</button>`)}<div class="page-content od-page"><div class="od-list-intro"><span class="overline">YOUR MONARCA ORDERS</span><h2>كل اختياراتك، في مكان واحد.</h2><p>تابعي الدفع والتجهيز والتوصيل، وأديري طلباتك بسهولة.</p></div><form id="od-search-form"><div class="input-wrap">${icon('search')}<input name="query" type="search" value="${esc(ui.orderSearch || '')}" placeholder="رقم الطلب أو اسم القطعة" aria-label="البحث في الطلبات"><button class="icon-btn" type="submit" aria-label="بحث">${icon('arrow')}</button></div></form><div class="od-filter-tabs" role="group" aria-label="حالة الطلب">${filters.map(([v,n])=>button(n,'od-filter',v,'od-filter '+(filter===v?'active':''),`aria-pressed="${filter===v}"`)).join('')}</div><div class="od-list-count"><span>${ar(orders.length)} طلبات</span>${q?button('مسح البحث','od-search-clear','', 'text-btn'):''}<button class="text-btn" data-go="returns">خدمات ما بعد البيع</button></div>${orders.length?orders.map(orderCard).join(''):M.empty('لا توجد طلبات مطابقة',q?'جرّبي رقم طلب أو اسم قطعة آخر.':'ستظهر طلبات هذه الحالة هنا بعد إتمام التسوق.','box','اكتشفي المجموعة','home')}<div class="od-bottom-links">${goto(icon('return')+' الإرجاع والاستبدال','returns','secondary')}${goto(icon('card')+' سجّل الاستردادات','refunds','secondary')}</div>${note(demo)}</div>`;
}
function afterSalesCards(o) {
  const rs=requestsFor(o);
  return rs.length?section('طلبات ما بعد البيع',rs.map(r=>`<button class="od-request-card" data-go="return-detail/${esc(r.id)}"><span class="od-request-icon">${icon('return')}</span><span><b>${r.type==='exchange'?'طلب استبدال':'طلب إرجاع'} <span class="ltr">${esc(r.id)}</span></b><small>${requestStatus(r)} · ${ar((r.items || []).reduce((n,l)=>n+l.qty,0))} قطعة</small></span>${icon('back')}</button>`).join('')):'';
}
function order(id) {
  ensure();const o=getOrder(id);if(!o)return missing();
  return `${top('تفاصيل الطلب',`<button class="icon-btn" data-go="invoice/${esc(id)}" aria-label="إيصال الطلب">${icon('box')}</button>`)}<div class="page-content od-page"><div class="od-detail-head"><span class="overline">ORDER DETAILS</span><div class="inline-row"><h2 class="ltr">${esc(o.id)}</h2>${tag(statusNames[o.status] || 'طلب محفوظ',o.status)}</div><p>${o.createdAt?dateText(o.createdAt):esc(o.date || '')}${o.sample?' · طلب توضيحي':''}</p></div>${o.status==='cancelled'?note(`تم إلغاء الطلب${o.cancelReason?' · '+esc(o.cancelReason):''}${o.cancelledAt?'<br>'+dateText(o.cancelledAt):''}. ${hasPaid(o)?'راجعي سجل الاسترداد التجريبي أدناه.':'لم يتم خصم أي مبلغ. لن تُشحن القطع.'}`,'info','od-note-warning'):''}${o.status==='shipped'&&o.deliveryIssue?note('تعذّر التسليم في المحاولة السابقة. افتحي تتبّع الشحنة لإعادة تحديد الموعد.','truck','od-note-warning'):''}${orderActions(o)}${section('القطع في طلبك',o.items.map((l,i)=>orderLine(o,l,i,o.status==='delivered')).join(''))}${orderSummary(o)}${orderPreferences(o)}${section('عنوان التوصيل',addressBlock(o.address))}${section('الدفع والمعاملة',paymentInfo(o))}${section('تفاصيل الطلب',row('تاريخ الإنشاء',o.createdAt?dateText(o.createdAt):esc(o.date||'—'))+row('تاريخ التأكيد',o.confirmedAt?dateText(o.confirmedAt):o.payment==='cod'?'تم تأكيد الطلب بالدفع عند الاستلام':hasPaid(o)?'تم تأكيد الطلب التوضيحي':'بانتظار الدفع')+row('طريقة التوصيل',deliveryLabel(o))+row('التقدير عند الشراء',deliveryEstimate(o))+(o.cancelReason?row('سبب الإلغاء',esc(o.cancelReason)):'')+(o.cancelNote?row('تفاصيل الإلغاء','<span data-user-text>'+esc(o.cancelNote)+'</span>'):'')+(o.cancelledAt?row('وقت الإلغاء',dateText(o.cancelledAt)):''))}${afterSalesCards(o)}${refundsFor(o).length?section('الاستردادات التجريبية',refundsFor(o).map(r=>refundCard(r)).join('')):''}<div class="button-stack">${goto('عرض إيصال الطلب','invoice/'+id,'secondary')}${button('إعادة شراء القطع المتوفرة','od-reorder',id,'secondary')}${M.contactButton('واتساب بخصوص هذا الطلب','order',id)}${goto('مساعدة بخصوص هذا الطلب','support','text-btn')}</div>${note(demo)}</div>`;
}
function historyOf(o) {
  const levels=[['placed','تأكيد الطلب',o.payment==='cod'?'تم تأكيد الطلب. المبلغ مستحق عند الاستلام.':'تم تأكيد الدفع التجريبي وتجهيز الطلب للمتجر.'],['preparing','تجهيز القطع','تجري مراجعة القطع والتغليف قبل الشحن.'],['shipped','الشحنة في الطريق','تم تسليم الطلب إلى شركة التوصيل.'],['delivered','تم التسليم','وصلت القطع إلى عنوان التوصيل.']];
  const current=deliveryLevels.indexOf(o.status);
  return `<ol class="od-timeline">${levels.map(([s,t,p],i)=>{const h=[...(o.history || [])].reverse().find(x=>x.status===s);return `<li class="${i<current?'done':i===current?'current':'future'}"><span class="od-time-dot">${i<=current?icon('check'):''}</span><div><h3>${t}</h3><p>${i<=current?p:'بانتظار اكتمال المرحلة السابقة'}</p>${h?`<small>${dateText(h.date)} · تحديث تجريبي</small>`:i<=current?'<small>مرحلة من الطلب التوضيحي</small>':''}</div></li>`;}).join('')}</ol>`;
}
function tracking(id) {
  ensure();const o=getOrder(id);if(!o)return missing('تتبّع الشحنة');
  if (!deliveryLevels.includes(o.status)) return top('تتبّع الشحنة')+`<div class="page-content od-page">${note(o.status==='payment_pending'?'يبدأ تجهيز وشحن الطلب بعد إتمام الدفع بالبطاقة.':'لن تستمر مراحل الشحن لهذا الطلب.','truck')}<div class="button-stack">${o.status==='payment_pending'?goto('إكمال الدفع','payment/'+id):''}${goto('تفاصيل الطلب','order/'+id,'secondary')}</div></div>`;
  return `${top('تتبّع الشحنة')}<div class="page-content od-page"><div class="od-tracking-hero">${icon(o.status==='delivered'?'check':'truck')}<span class="overline">MONARCA DELIVERY</span><h2>${o.deliveryIssue?'نحتاج موعداً مناسباً لكِ':statusNames[o.status]}</h2><p>${o.status==='delivered'?'تم التسليم · تجربة توضيحية':o.deliveryIssue?'تعذّر التواصل في محاولة التسليم التجريبية.':o.reschedule?'الموعد المطلوب: '+esc(o.reschedule.date)+' · '+esc(o.reschedule.slot):'التوصيل المتوقع: '+deliveryEstimate(o)}</p><span class="ltr">${esc(o.id)}</span></div>${o.deliveryIssue?note('لم يتم تسليم الطلب. عنوانك محفوظ، ويمكنك إعادة تحديد موعد التسليم أو التواصل مع الدعم.','info','od-note-warning'):''}${o.payment==='cod'?note('الدفع عند الاستلام · '+(o.status==='cancelled'?'ألغي قبل التحصيل.':'المبلغ المستحق: '+money(Math.max(0,(Number(o.total)||0)-paidTotal(o)))+'. محاكاة التسليم لا تؤكد تحصيل النقد.'),'info'):''}${historyOf(o)}${section('معلومات الشحنة',row('شركة التوصيل','Monarca Delivery · نموذج تجريبي')+row('طريقة التوصيل',deliveryLabel(o))+row('التقدير عند الشراء',deliveryEstimate(o))+row('رقم التتبّع',`<span class="ltr">TRK-${esc(String(o.id).replace(/^M-DEMO-/,''))}</span>`)+row('عدد القطع',ar(o.items.reduce((n,l)=>n+(Number(l.qty)||0),0)))+(o.deliveredAt?row('وقت التسليم التجريبي',dateText(o.deliveredAt)):'')+(o.reschedule?row('إعادة الموعد',esc(o.reschedule.date)+' · '+esc(o.reschedule.slot)):''))}${section('عنوان الاستلام',addressBlock(o.address))}${o.reschedule?section('طلب إعادة جدولة الموعد',`<p class="page-intro">تم تسجيل رغبتك في يوم ${esc(o.reschedule.date)} خلال ${esc(o.reschedule.slot)}.${o.reschedule.note?'<br>'+esc(o.reschedule.note):''}<br>هذه محاكاة؛ لم يُرسل طلب إلى شركة توصيل.</p>`):''}${o.deliveryHistory?.length?section('تحديثات التوصيل',`<div class="od-delivery-log">${o.deliveryHistory.map(h=>`<p><b>${esc(h.message)}</b><small>${dateText(h.date)}</small></p>`).join('')}</div>`):''}<div class="button-stack">${o.status==='shipped'?button('إعادة تحديد موعد التسليم','trk-reschedule',id):''}${M.contactButton('واتساب بخصوص التوصيل','tracking',id)}${goto('مساعدة التوصيل','support','secondary')}${goto('تفاصيل الطلب','order/'+id,'text-btn')}</div><div class="od-demo-panel"><b>أدوات عرض التتبّع</b><p>تغييرات محلية لا تتصل بشركة توصيل.</p>${o.status!=='delivered'?button('محاكاة المرحلة التالية','trk-next',id,'secondary'):note('اكتملت مراحل هذا الطلب التوضيحي.','check')}${o.status==='shipped'&&!o.deliveryIssue?button('محاكاة تعذّر التسليم','trk-fail',id,'text-btn'):''}</div></div>`;
}
function initDraft(o) {
  if (draft.orderId===o.id) return;
  Object.assign(draft,{orderId:o.id,type:'return',selected:{},reason:'',note:'',attachments:[],busy:false});
  const first=o.items.findIndex((_,i)=>available(o,i)>0);
  if (first>=0) draft.selected[first]={checked:true,qty:1,exchangeSize:''};
}
function captureDraft(form) {
  if (!form) return;
  const data=new FormData(form);
  draft.type=data.get('type') || 'return';draft.reason=data.get('reason') || '';draft.note=data.get('note') || '';
  const o=getOrder(form.dataset.id);if(!o)return;
  o.items.forEach((_,i)=>{draft.selected[i]={checked:data.get('select-'+i)==='on',qty:Number(data.get('qty-'+i))||1,exchangeSize:data.get('size-'+i)||''};});
}
function selectedItems(o) {
  return o.items.map((l,i)=>({l,i,d:draft.selected[i]})).filter(x=>x.d?.checked).map(({l,i,d})=>({itemIndex:i,productId:l.id,name:itemProduct(l).name,color:l.color,size:l.size,qty:Number(d.qty)||0,unitPrice:Number(l.price)||itemProduct(l).price||0,amount:draft.type==='exchange'?roundMoney(lineNet(o,i)*(Number(d.qty)||0)/(Number(l.qty)||1)):refundFor(o,i,Number(d.qty)||0),exchangeSize:draft.type==='exchange'?d.exchangeSize:''}));
}
function returnView(id) {
  ensure();const o=getOrder(id);if(!o)return missing('إرجاع أو استبدال');
  if(o.status!=='delivered')return top('إرجاع أو استبدال')+`<div class="page-content od-page">${note('تُتاح طلبات الإرجاع والاستبدال بعد تسليم الطلب. يمكنك متابعة الشحن أو التواصل مع الدعم.','return')}<div class="button-stack">${goto('تفاصيل الطلب','order/'+id,'secondary')}</div></div>`;
  initDraft(o);
  const candidates=o.items.map((l,i)=>({l,i,left:available(o,i)})).filter(x=>x.left>0);
  if(!candidates.length)return top('إرجاع أو استبدال')+`<div class="page-content od-page">${note('كل القطع المؤهلة مرتبطة بطلبات خدمة سابقة. افتحي الطلبات الحالية لمتابعتها؛ إلغاء طلب لم يُرسل يعيد إتاحة كميته.','return')}${afterSalesCards(o)}${goto('تفاصيل الطلب','order/'+id,'secondary')}</div>`;
  const total=selectedItems(o).reduce((n,l)=>n+l.amount,0);
  return `${top('إرجاع أو استبدال')}<div class="page-content od-page"><p class="overline">AFTERCARE, WITH CARE</p><h2 class="page-subtitle">نعتني بتفاصيل تجربتك.</h2><p class="page-intro">اختاري القطع والكمية ونوع الخدمة. تحتفظ كل قطعة بطلبها الأصلي؛ لا يؤثر الإرجاع الجزئي في بقية الطلب.</p><form id="rt-request-form" data-id="${esc(id)}"><div class="rt-kind-toggle" role="group" aria-label="نوع الطلب">${[['return',hasPaid(o)?'إرجاع واسترداد':'إرجاع دون استرداد','card'],['exchange','استبدال المقاس','return']].map(([v,n,ic])=>`<label class="${draft.type===v?'active':''}"><input type="radio" name="type" value="${v}" ${draft.type===v?'checked':''}>${icon(ic)}<span>${n}</span></label>`).join('')}</div><h3 class="rt-label">القطع المراد ${draft.type==='exchange'?'استبدالها':'إرجاعها'}</h3>${candidates.map(({l,i,left})=>{const d=draft.selected[i]||{checked:false,qty:1,exchangeSize:''},p=itemProduct(l),sizes=(p.sizes || []).filter(s=>s!==p.unavailable&&s!==l.size);return `<div class="rt-item ${d.checked?'selected':''}"><label class="rt-select-line"><input type="checkbox" name="select-${i}" ${d.checked?'checked':''} aria-label="اختيار ${esc(p.name)}">${photo(p)}<span><b>${esc(p.name)}</b><small>${esc(colorName(l.color))} · ${esc(l.size)}</small><small>متاح للخدمة: ${ar(left)} من ${ar(l.qty)}</small></span></label><div class="rt-item-fields"><label class="field"><span>الكمية</span><select name="qty-${i}" aria-label="كمية ${esc(p.name)}">${Array.from({length:left},(_,n)=>`<option value="${n+1}" ${Number(d.qty)===n+1?'selected':''}>${ar(n+1)}</option>`).join('')}</select></label>${draft.type==='exchange'?`<label class="field"><span>المقاس البديل *</span><select name="size-${i}" ${!sizes.length?'disabled':''} aria-label="المقاس البديل ${esc(p.name)}"><option value="">${sizes.length?'اختاري المقاس':'لا يوجد مقاس بديل'}</option>${sizes.map(s=>`<option value="${esc(s)}" ${d.exchangeSize===s?'selected':''}>${esc(s)}</option>`).join('')}</select></label>`:''}</div>${draft.type==='exchange'&&!sizes.length?'<p class="od-error-text">هذه القطعة ليس لها مقاس بديل متاح. اختاري إرجاعاً أو أزيلي تحديدها.</p>':''}<p class="rt-line-value">${draft.type==='return'?'قيمة الإرجاع بعد خصم الطلب':'قيمة القطع الأصلية بعد الخصم'}: <b>${money(draft.type==='exchange'?roundMoney(lineNet(o,i)*Math.min(Number(d.qty)||1,left)/(Number(l.qty)||1)):refundFor(o,i,Math.min(Number(d.qty)||1,left)))}</b></p></div>`;}).join('')}<label class="field"><span>سبب الطلب *</span><select name="reason" required><option value="">اختاري السبب</option>${returnReasons.map(v=>`<option ${draft.reason===v?'selected':''}>${v}</option>`).join('')}</select></label><label class="field"><span>تفاصيل إضافية ${draft.reason==='سبب آخر'?'*':'(اختياري)'}</span><textarea name="note" maxlength="1000" placeholder="ساعدينا بفهم السبب، خاصة في حال وجود عيب أو اختلاف.">${esc(draft.note)}</textarea></label><div class="rt-attachments"><div class="inline-row"><h3 class="rt-label">صور توضيحية (اختياري)</h3><small>${ar(draft.attachments.length)} / ٣</small></div><p>حتى ٣ صور، بحد أقصى ٤ ميغابايت للصورة. تُحفظ نسخة مصغرة محلياً للعرض فقط.</p><div class="rt-attachment-grid">${draft.attachments.map((a,i)=>`<div><img src="${esc(a.url)}" alt="${esc(a.name)}"><button type="button" data-action="rt-remove-photo" data-id="${i}" aria-label="إزالة ${esc(a.name)}">${icon('close')}</button></div>`).join('')}<label class="rt-upload ${draft.busy?'busy':''}">${icon('camera')}<span>${draft.busy?'جارٍ التحضير…':'إضافة صورة'}</span><input type="file" id="rt-attachment-file" accept="image/jpeg,image/png,image/webp" multiple ${draft.busy?'disabled':''}></label></div></div><div class="rt-amount"><span>${draft.type==='return'?(hasPaid(o)?'الاسترداد التقديري إلى البطاقة الأصلية':'لا يوجد مبلغ محصّل للاسترداد'):'قيمة القطع التي سيُطلب استبدالها'}</span><b>${money(total)}</b><p>${draft.type==='return'?(hasPaid(o)?'يُوزّع خصم الطلب على القطع. لا تشمل القيمة رسوم التوصيل الأصلية.':'لم يُحصّل أي مبلغ نقدي. يمكن إعادة القطع دون إنشاء استرداد.'):'الاستبدال بنفس المنتج واللون وبمقاس آخر من المخزون. لا يُخصم أي مبلغ في هذا النموذج.'}</p></div>${note(draft.type==='return'?(hasPaid(o)?'تجري مراجعة الطلب أولاً، ثم إعادة القطع وفحصها قبل إكمال الاسترداد التجريبي. مدة وسياسة المتجر النهائية تحتاج اعتماد العميل.':'تجري مراجعة القطع وإعادتها وفحصها. لا ينشأ سجل استرداد لمبلغ لم يُحصّل.'):'تجري مراجعة التوفّر والموافقة قبل إرسال البديل. إذا لم يتوفّر المقاس، يمكن إلغاء الطلب وإنشاء طلب إرجاع.','return')}<label class="checkbox-row"><input type="checkbox" name="consent" required><span>أوافق على تقديم هذا الطلب التجريبي، وأعلم أنه لا ينفّذ شحناً أو استرداداً حقيقياً.</span></label><p class="form-error" id="rt-form-error" role="alert"></p><button class="primary" type="submit" ${draft.busy?'disabled':''}>تقديم طلب ${draft.type==='exchange'?'الاستبدال':'الإرجاع'}</button><div class="button-stack">${goto('العودة إلى تفاصيل الطلب','order/'+id,'text-btn')}</div></form></div>`;
}
function returnCard(r) {
  return `<article class="od-return-card"><div class="inline-row"><b>${r.type==='exchange'?'استبدال المقاس':r.noRefund?'إرجاع دون استرداد':'إرجاع واسترداد'}</b>${tag(requestStatus(r),r.status)}</div><p class="ltr">${esc(r.id)}</p><small>${dateText(r.createdAt)}</small><div class="od-return-items">${(r.items || []).map(l=>`<span>${esc(l.name || getProduct(l.productId)?.name||'قطعة')} · ${ar(l.qty)}</span>`).join('')}</div><div class="inline-row"><span>${r.type==='return'?money((r.items || []).reduce((n,l)=>n+(Number(l.amount)||0),0)):'نفس المنتج بمقاس بديل'}</span>${goto('عرض الطلب','return-detail/'+r.id,'text-btn')}</div></article>`;
}
function returnsList() {
  ensure();const f=ui.returnFilter||'all',rs=M.state.returnRequests.filter(r=>f==='all'||f==='active'&&!['completed','refunded','cancelled','rejected'].includes(r.status)||f==='finished'&&['completed','refunded'].includes(r.status)||f==='cancelled'&&['cancelled','rejected'].includes(r.status));
  return `${top('الإرجاع والاستبدال')}<div class="page-content od-page"><p class="overline">MONARCA AFTERCARE</p><h2 class="page-subtitle">نتابع معك كل التفاصيل.</h2><div class="od-filter-tabs">${[['all','الكل'],['active','قيد المعالجة'],['finished','المكتملة'],['cancelled','الملغاة']].map(([v,n])=>button(n,'rt-filter',v,'od-filter '+(f===v?'active':''))).join('')}</div>${rs.length?rs.slice().reverse().map(returnCard).join(''):M.empty('لا توجد طلبات خدمة هنا','افتحي طلباً تم تسليمه واختاري «طلب إرجاع أو استبدال».','return','الذهاب إلى طلباتي','orders')}${note(demo,'return')}</div>`;
}
function returnTimeline(r) {
  const steps=r.type==='exchange'?[['requested','تقديم الطلب'],['approved','مراجعة وموافقة'],['in_transit','إعادة القطعة للمتجر'],['received','استلام وفحص القطعة'],['exchange_shipped','شحن المقاس البديل'],['completed','اكتمال الاستبدال']]:r.noRefund?[['requested','تقديم الطلب'],['approved','مراجعة وموافقة'],['in_transit','إعادة القطعة للمتجر'],['received','استلام وفحص القطعة'],['completed','اكتمال الإرجاع دون استرداد']]:[['requested','تقديم الطلب'],['approved','مراجعة وموافقة'],['in_transit','إعادة القطعة للمتجر'],['received','استلام وفحص القطعة'],['refund_pending','معالجة الاسترداد التجريبي'],['refunded','اكتمال المحاكاة']];
  const current=steps.findIndex(x=>x[0]===r.status),cancelled=['cancelled','rejected'].includes(r.status);
  return cancelled?note(returnNames[r.status]+' · '+esc(r.cancelReason || r.rejectionReason || 'تم إيقاف الطلب قبل إكمال الخدمة.'),'info','od-note-warning'):`<ol class="od-timeline rt-timeline">${steps.map(([s,t],i)=>{const h=(r.history || []).find(x=>x.status===s);return `<li class="${i<current?'done':i===current?'current':'future'}"><span class="od-time-dot">${i<=current?icon('check'):''}</span><div><h3>${t}</h3><p>${h?dateText(h.date):i===0?dateText(r.createdAt):'بانتظار اكتمال المرحلة السابقة'}</p>${h?.note?`<small>${esc(h.note)}</small>`:''}</div></li>`;}).join('')}</ol>`;
}
function returnShipping(id) {
  ensure();const r=M.state.returnRequests.find(x=>x.id===id);
  if(!r)return top('شحن القطع المرتجعة')+M.empty('لم يتم العثور على طلب الخدمة','راجعي قائمة الإرجاع والاستبدال.','return','طلبات الخدمة','returns');
  if(r.status!=='approved')return top('شحن القطع المرتجعة')+`<div class="page-content od-page">${note(r.returnShipment?'تم تسجيل بيانات الشحنة. افتحي تفاصيل طلب الخدمة لمتابعة الاستلام والفحص.':'تُسجّل بيانات إعادة القطع بعد الموافقة على طلب الخدمة.','return')}<div class="button-stack">${goto('تفاصيل طلب الخدمة','return-detail/'+id,'secondary')}</div></div>`;
  return `${top('شحن القطع المرتجعة')}<div class="page-content od-page"><p class="overline">RETURN SHIPMENT</p><h2 class="page-subtitle">خطوة أقرب لاكتمال طلبك.</h2><p class="page-intro">بعد ترتيب الاستلام مع المتجر، أضيفي معلومات إعادة القطع. لا يطلب هذا النموذج مندوباً ولا ينشئ شحنة فعلية.</p>${note('جهّزي القطع المرتبطة بطلب '+esc(r.id)+' بتغليفها الأصلي. عنوان الاستلام الفعلي وتعليمات شركة التوصيل يحددهما المتجر عند اعتماد الخدمة.','box')}<form id="rt-shipping-form" data-id="${esc(id)}"><label class="field"><span>طريقة إعادة القطع *</span><select name="carrier" required><option value="">اختاري الطريقة</option><option>مندوب المتجر</option><option>شركة توصيل أخرى</option><option>تسليم إلى نقطة يحددها المتجر</option></select></label><label class="field"><span>اسم شركة التوصيل (إن وجدت)</span><input name="carrierName" maxlength="80" placeholder="اسم الشركة أو المندوب"></label><label class="field"><span>رقم بوليصة الإرجاع أو رمز الاستلام *</span><input name="tracking" dir="ltr" maxlength="60" minlength="4" required placeholder="مثال تجريبي: RET-1042"></label><label class="field"><span>ملاحظات التسليم (اختياري)</span><textarea name="note" maxlength="500" placeholder="أي معلومات تساعد على متابعة القطع المرتجعة"></textarea></label><label class="checkbox-row"><input type="checkbox" name="consent" required><span>أؤكد تسجيل تسليم القطع ضمن تجربة العرض فقط.</span></label><p class="form-error" id="rt-shipping-error" role="alert"></p><div class="button-stack"><button type="submit" class="primary">تسجيل شحنة الإرجاع التجريبية</button>${goto('العودة إلى طلب الخدمة','return-detail/'+id,'text-btn')}</div></form></div>`;
}
function submitReturnShipping(form,data) {
  ensure();const r=M.state.returnRequests.find(x=>x.id===form.dataset.id);
  if(!r||r.status!=='approved')return showError('تغيّرت حالة الطلب. افتحي تفاصيل طلب الخدمة.','rt-shipping-error');
  if(!['مندوب المتجر','شركة توصيل أخرى','تسليم إلى نقطة يحددها المتجر'].includes(data.carrier))return showError('اختاري طريقة إعادة القطع.','rt-shipping-error');
  if(data.carrier==='شركة توصيل أخرى'&&String(data.carrierName||'').trim().length<2)return showError('أضيفي اسم شركة التوصيل.','rt-shipping-error');
  const tracking=String(data.tracking||'').trim();
  if(tracking.length<4)return showError('أضيفي رقم بوليصة أو رمز استلام من ٤ أحرف على الأقل.','rt-shipping-error');
  if(!data.consent)return showError('أكّدي تسجيل التسليم التجريبي.','rt-shipping-error');
  r.returnShipment={carrier:data.carrier,carrierName:String(data.carrierName||'').trim(),tracking,note:String(data.note||'').trim(),createdAt:now(),demo:true};
  r.status='in_transit';r.history.push({status:'in_transit',date:now(),note:'تم تسجيل معلومات شحنة الإرجاع التجريبية'});save();go('return-detail/'+r.id);toast('تم تسجيل شحنة الإرجاع محلياً.');
}
function returnDetail(id) {
  ensure();const r=M.state.returnRequests.find(x=>x.id===id);if(!r)return top('طلب الخدمة')+M.empty('لم يتم العثور على طلب الخدمة','افتحي قائمة الإرجاع والاستبدال لعرض الطلبات المتاحة.','return','طلبات الخدمة','returns');
  const o=getOrder(r.orderId),amount=(r.items||[]).reduce((n,l)=>n+(Number(l.amount)||0),0),done=['refunded','completed','cancelled','rejected'].includes(r.status);
  return `${top(r.type==='exchange'?'تفاصيل الاستبدال':'تفاصيل الإرجاع')}<div class="page-content od-page"><div class="od-detail-head"><span class="overline">AFTERCARE REQUEST</span><div class="inline-row"><h2 class="ltr">${esc(r.id)}</h2>${tag(requestStatus(r),r.status)}</div><p>${dateText(r.createdAt)}</p><button class="text-btn" data-go="order/${esc(r.orderId)}">الطلب الأصلي <span class="ltr">${esc(r.orderId)}</span></button></div>${returnTimeline(r)}${r.status==='approved'?goto('تسجيل شحنة إرجاع القطع','return-shipping/'+r.id):''}${r.returnShipment?section('بيانات شحنة الإرجاع',row('طريقة الإرجاع',esc(r.returnShipment.carrier))+(r.returnShipment.carrierName?row('الشركة / المندوب',esc(r.returnShipment.carrierName)):'')+row('رقم البوليصة / الاستلام',`<span class="ltr">${esc(r.returnShipment.tracking)}</span>`)+row('تاريخ التسجيل',dateText(r.returnShipment.createdAt))+(r.returnShipment.note?row('ملاحظات',esc(r.returnShipment.note)):'')):''}${section('القطع في طلب الخدمة',(r.items || []).map(l=>{const p=getProduct(l.productId)||{name:l.name,img:0};return `<div class="od-product">${photo(p)}<div class="od-product-info"><b>${esc(l.name || p.name)}</b><p>${esc(colorName(l.color))} · ${esc(l.size)} · ${ar(l.qty)} قطعة</p>${r.type==='exchange'?`<p>المقاس المطلوب: <b dir="ltr">${esc(l.exchangeSize || '—')}</b></p>`:`<strong>${money(l.amount||0)}</strong>`}</div></div>`;}).join(''))}${section('تفاصيل الطلب',row('نوع الخدمة',r.type==='exchange'?'استبدال المقاس':r.noRefund?'إرجاع دون استرداد':'إرجاع واسترداد')+row('السبب',esc(r.reason))+(r.note?`<p class="od-note-body">${esc(r.note)}</p>`:'')+row('عدد القطع',ar((r.items||[]).reduce((n,l)=>n+l.qty,0))))}${r.attachments?.length?section('الصور المرفقة',`<div class="rt-photo-strip">${r.attachments.map((a,i)=>`<button data-action="rt-view-photo" data-id="${esc(r.id)}" data-index="${i}" aria-label="عرض ${esc(a.name || 'الصورة المرفقة')}"><img src="${esc(a.url)}" alt="${esc(a.name || 'صورة مرفقة')}"></button>`).join('')}</div>`):''}${r.type==='return'&&r.noRefund?section('إرجاع دون استرداد',note('لم يُحصّل أي مبلغ نقدي. لا يوجد مبلغ محصّل للاسترداد.')):r.type==='return'?section('قيمة الاسترداد التجريبي',row('قيمة القطع بعد توزيع الخصم',money(amount))+row('رسوم التوصيل الأصلية','لا تُضمّن في هذا الطلب')+row('طريقة الاسترداد','البطاقة الأصلية · '+(o?cardLabel(o):'Visa / Mastercard'))+note('تخضع القيمة للفحص والموافقة في المتجر الفعلي. جميع مراحل هذا النموذج محاكاة ولا تثبت وصول أموال.','card')):section('معلومات الاستبدال',note('تُراجع القطع أولاً، ثم يُرسل نفس المنتج واللون بالمقاس المطلوب المتاح. لا تُضاف القطع البديلة إلى المشتريات ولا تُخصم مبالغ في هذا العرض.','return'))}${r.status==='approved'?note('تمت الموافقة التجريبية. جهّزي القطع بتغليفها الأصلي. رمز التسليم التجريبي: '+esc(r.id)+'. تواصلي مع الدعم لترتيب الإرجاع في المنتج الفعلي.','box'):''}${r.status==='exchange_shipped'?note('شحنة البديل التجريبية: EX-'+esc(r.id)+' · التوصيل إلى العنوان الأصلي.','truck'):''}${r.refundId?goto('عرض سجل الاسترداد','refund-detail/'+r.refundId,'secondary'):''}<div class="button-stack">${['requested','approved'].includes(r.status)?button('إلغاء طلب الخدمة','rt-cancel',r.id,'secondary'):''}${goto('تفاصيل الطلب الأصلي','order/'+r.orderId,'secondary')}${goto('التواصل مع الدعم','support','text-btn')}</div>${!done?`<div class="od-demo-panel"><b>أداة عرض خدمة ما بعد البيع</b><p>تقدّم محلي بين المراحل لشرح سير العمل دون إرسال أو استرداد حقيقي.</p>${button('محاكاة المرحلة التالية','rt-next',r.id,'secondary')}</div>`:''}${note(demo)}</div>`;
}
function refundCard(r) {
  return `<button class="od-refund-card" data-go="refund-detail/${esc(r.id)}"><span class="od-request-icon">${icon('card')}</span><span><b>${r.source==='cancellation'?'استرداد إلغاء الطلب':'استرداد الإرجاع'}</b><small>${refundNames[r.status] || 'قيد المحاكاة'} · ${cardLabel(r)}</small><small class="ltr">${esc(r.id)}</small></span><strong>${money(r.amount||0)}</strong>${icon('back')}</button>`;
}
function refundsList() {
  ensure();return `${top('سجل الاستردادات')}<div class="page-content od-page"><p class="overline">PAYMENTS & REFUNDS</p><h2 class="page-subtitle">مبالغك، بتفاصيل واضحة.</h2>${note('هذا سجل محاكاة فقط. إكمال الحالة لا يعني تنفيذ استرداد أو وصول أموال إلى بطاقة حقيقية.','card')}${M.state.refunds.length?M.state.refunds.slice().reverse().map(refundCard).join(''):M.empty('لا توجد استردادات مسجلة','يظهر السجل هنا بعد إلغاء طلب مدفوع أو قبول إرجاع القطع.','card','عرض طلباتي','orders')}</div>`;
}
function refundDetail(id) {
  ensure();const r=M.state.refunds.find(x=>x.id===id);if(!r)return top('تفاصيل الاسترداد')+M.empty('لم يتم العثور على السجل','افتحي قائمة الاستردادات لعرض السجلات المتاحة.','card','سجل الاستردادات','refunds');
  const phases=[['requested','تم تسجيل طلب الاسترداد'],['processing','محاكاة معالجة البطاقة'],['completed','اكتملت محاكاة الاسترداد']],current=phases.findIndex(x=>x[0]===r.status);
  return `${top('تفاصيل الاسترداد')}<div class="page-content od-page"><div class="od-refund-hero">${icon('card')}<p>استرداد تجريبي إلى البطاقة الأصلية</p><strong>${money(r.amount||0)}</strong>${tag(refundNames[r.status] || 'قيد المحاكاة',r.status)}</div>${note('هذه محاكاة فقط. لم يُرسل استرداد إلى بنك، ولم تصل أموال إلى بطاقة حقيقية. اكتمال المراحل يوضّح تجربة المستخدم.','info','od-note-warning')}<ol class="od-timeline">${phases.map(([s,t],i)=>`<li class="${i<current?'done':i===current?'current':'future'}"><span class="od-time-dot">${i<=current?icon('check'):''}</span><div><h3>${t}</h3><p>${(r.history || []).find(h=>h.status===s)?.date?dateText(r.history.find(h=>h.status===s).date):i===0?dateText(r.createdAt):'بانتظار المرحلة السابقة'}</p></div></li>`).join('')}</ol>${section('تفاصيل العملية',row('مرجع الاسترداد',`<span class="ltr">${esc(r.id)}</span>`)+row('الطلب',`<span class="ltr">${esc(r.orderId)}</span>`)+row('السبب',r.source==='cancellation'?'إلغاء طلب مدفوع':'إرجاع قطع بعد الفحص')+row('شبكة البطاقة','<span dir="ltr">'+cardLabel(r)+'</span>')+row('الجهة المستقبلة','البطاقة الأصلية المستخدمة في الشراء')+row('تاريخ التسجيل',dateText(r.createdAt))+(r.transactionId?row('مرجع المحاكاة',`<span class="ltr">${esc(r.transactionId)}</span>`):'')+row('حالة الأموال','لا توجد حركة مالية حقيقية'))}<div class="button-stack">${r.requestId?goto('عرض طلب الإرجاع','return-detail/'+r.requestId,'secondary'):''}${goto('تفاصيل الطلب','order/'+r.orderId,'secondary')}${goto('مساعدة الدفع والاسترداد','support','text-btn')}</div>${r.status!=='completed'?`<div class="od-demo-panel"><b>أداة عرض الاسترداد</b><p>لتوضيح معالجة الحالة محلياً فقط.</p>${button('محاكاة المرحلة التالية','rt-refund-next',r.id,'secondary')}</div>`:''}</div>`;
}
function invoice(id) {
  ensure();const o=getOrder(id);if(!o)return missing('إيصال الطلب');
  return `${top('إيصال الطلب')}<div class="page-content od-page"><article class="od-invoice" id="od-print-invoice"><header><strong>Monarca</strong><small>ORDER RECEIPT · إيصال طلب تجريبي</small></header><div class="od-invoice-stamp">نسخة عرض · غير صالحة كفاتورة ضريبية</div>${row('رقم الطلب',`<span class="ltr">${esc(o.id)}</span>`)}${row('التاريخ',o.createdAt?dateText(o.createdAt):esc(o.date || '—'))}${row('الحالة',statusNames[o.status] || '')}${row('طريقة التوصيل',deliveryLabel(o))}${row('التقدير عند الشراء',deliveryEstimate(o))}<div class="divider"></div>${addressBlock(o.address)}<table class="od-invoice-table"><thead><tr><th>القطعة / التفاصيل</th><th>الكمية</th><th>القيمة</th></tr></thead><tbody>${o.items.map(l=>`<tr><td>${esc(itemProduct(l).name)}<small>${esc(colorName(l.color))} · ${esc(l.size)}</small></td><td>${ar(l.qty)}</td><td>${money((Number(l.price)||itemProduct(l).price||0)*l.qty)}</td></tr>`).join('')}</tbody></table>${orderSummary(o)}${orderPreferences(o)}<div class="divider"></div>${row('الدفع',(o.payment==='cod'?'الدفع عند الاستلام':'بطاقة '+cardLabel(o))+' · '+(hasPaid(o)?'مدفوع تجريبياً':o.status==='cancelled'?'ألغي قبل الدفع':o.payment==='cod'?'بانتظار التحصيل عند الاستلام':'غير مدفوع'))}${row('مرجع الدفع',`<span class="ltr">${esc(o.transactionId || (o.payment==='cod'?'لا يوجد تحصيل نقدي مسجّل':'لا توجد عملية دفع ناجحة'))}</span>`)}<p class="field-note" style="margin-top:20px">المبالغ بالدولار الأمريكي USD. الإيصال يطابق بيانات الطلب لحظة الشراء ولا يمثّل عملية مالية أو فاتورة ضريبية. ${demo}</p></article><div class="button-stack od-no-print">${button(icon('box')+' طباعة الإيصال / حفظ PDF','od-print',id)}${goto('تفاصيل الطلب','order/'+id,'secondary')}</div></div>`;
}
function showError(message,id='rt-form-error') {
  const el=document.getElementById(id);if(el){el.textContent=message;el.classList.add('visible');el.scrollIntoView({block:'center',behavior:'smooth'});}else toast(message);
}
function openCancel(id) {
  const o=getOrder(id);if(!o)return toast('لم يتم العثور على الطلب.');
  if(!['payment_pending','placed','preparing'].includes(o.status))return toast('لا يمكن الإلغاء بعد الشحن. تواصلي مع الدعم.');
  sheet('إلغاء الطلب',`<div class="od-sheet-intro"><b class="ltr">${esc(o.id)}</b><p>${hasPaid(o)?'عند إلغاء الطلب، يُنشأ سجل استرداد تجريبي كامل إلى البطاقة الأصلية. لا ينفّذ هذا النموذج حركة مالية.':'لم يُدفع هذا الطلب. سيُلغى دون خصم أو استرداد.'}</p></div><form id="od-cancel-form" data-id="${esc(id)}"><label class="field"><span>سبب الإلغاء *</span><select name="reason" required><option value="">اختاري السبب</option>${cancelReasons.map(x=>`<option>${x}</option>`).join('')}</select></label><label class="field"><span>تفاصيل إضافية (مطلوبة لسبب آخر)</span><textarea name="note" maxlength="500" placeholder="أخبرينا بتفاصيل تساعدنا على تحسين تجربتك"></textarea></label><p class="form-error" id="od-cancel-error" role="alert"></p><div class="button-stack"><button type="submit" class="primary">تأكيد إلغاء الطلب</button>${btn('الاحتفاظ بالطلب','close-sheet','secondary')}</div></form>`);
}
function createRefund(o,amount,source,requestId=null) {
  if(!hasPaid(o)||paidTotal(o)<=0||Number(amount)<=0)return null;
  const existing=M.state.refunds.find(r=>r.orderId===o.id&&r.source===source&&(!requestId||r.requestId===requestId));
  if(existing)return existing;
  const r={id:uid('RF'),orderId:o.id,requestId,source,amount:Math.max(0,roundMoney(amount)),payment:o.payment==='mastercard'?'mastercard':'visa',status:'requested',demo:true,createdAt:now(),history:[{status:'requested',date:now()}]};
  M.state.refunds.push(r);return r;
}
function cancelSubmit(form,data) {
  const o=getOrder(form.dataset.id);if(!o||!['payment_pending','placed','preparing'].includes(o.status))return showError('حالة الطلب تغيّرت ولا يمكن إلغاؤه الآن.','od-cancel-error');
  if(!cancelReasons.includes(data.reason))return showError('اختاري سبب الإلغاء.','od-cancel-error');
  if(data.reason==='سبب آخر'&&String(data.note||'').trim().length<5)return showError('أضيفي تفاصيل لا تقل عن ٥ أحرف لسبب الإلغاء.','od-cancel-error');
  ensure();o.cancelledAt=now();o.cancelReason=data.reason;o.cancelNote=String(data.note||'').trim();o.status='cancelled';o.history.push({status:'cancelled',date:o.cancelledAt,note:data.reason});
  if(hasPaid(o))createRefund(o,paidTotal(o),'cancellation');
  save();closeSheet();go('order/'+o.id);render(true);toast('تم إلغاء الطلب التجريبي.');
}
function reorder(id) {
  const o=getOrder(id);if(!o)return toast('لم يتم العثور على الطلب.');
  const report=[];let added=0;
  o.items.forEach(l=>{
    const p=getProduct(l.id),requested=Number(l.qty)||0;
    if(!p||!p.stock||!p.colors?.includes(l.color)||!p.sizes?.includes(l.size)||p.unavailable===l.size){report.push({name:l.name||p?.name||'قطعة من طلب سابق',qty:0,reason:'هذا اللون أو المقاس غير متاح حالياً'});return;}
    const line=M.state.cart.find(x=>Number(x.id)===Number(l.id)&&x.color===l.color&&x.size===l.size);
    const q=Math.max(0,Math.min(requested,Number(p.stock)-(Number(line?.qty)||0)));
    if(q){if(line)line.qty+=q;else M.state.cart.push({id:p.id,color:l.color,size:l.size,qty:q});added+=q;}
    report.push({name:p.name,qty:q,reason:q<requested?'تمت إضافة الكمية المتاحة فقط':'تمت الإضافة إلى حقيبتك'});
  });
  ui.buyNow=null;save();render(true);
  sheet('إعادة شراء القطع',`<p>${added?'تمت إضافة '+ar(added)+' قطعة بحسب التوفر الحالي. تُستخدم الأسعار الحالية في الحقيبة.':'لم تتوفر قطع إضافية من اختياراتك السابقة.'}</p><div class="od-reorder-report">${report.map(r=>`<div><b>${esc(r.name)}</b><p>${r.qty?ar(r.qty)+' قطعة · ':''}${r.reason}</p></div>`).join('')}</div><div class="button-stack">${goto('عرض حقيبتي','cart')}${btn('العودة إلى الطلب','close-sheet','secondary')}</div>`);
}
function advanceOrder(id) {
  const o=getOrder(id);if(!o)return;
  const i=deliveryLevels.indexOf(o.status);if(i<0||i===3)return;
  o.status=deliveryLevels[i+1];o.history.push({status:o.status,date:now(),note:'مرحلة تجريبية'});o.deliveryIssue=false;
  if(o.status==='delivered')o.deliveredAt=now();save();render(true);toast('تم تحديث المرحلة محلياً للتجربة.');
}
function reschedule(id) {
  const o=getOrder(id);if(!o||o.status!=='shipped')return toast('إعادة الموعد متاحة للشحنة في الطريق فقط.');
  const day=new Date(Date.now()+86400000).toISOString().slice(0,10);
  sheet('إعادة تحديد موعد التسليم',`<p>اختاري الموعد المناسب. يُحفظ الطلب محلياً فقط، ولا يُرسل إلى شركة توصيل.</p><form id="trk-reschedule-form" data-id="${esc(id)}" style="margin-top:20px"><label class="field"><span>يوم التسليم *</span><input type="date" name="date" min="${day}" value="${esc(o.reschedule?.date||day)}" required></label><label class="field"><span>الفترة المناسبة *</span><select name="slot"><option>٩ صباحاً – ١ ظهراً</option><option>١ ظهراً – ٥ مساءً</option><option>٥ مساءً – ٩ مساءً</option></select></label><label class="field"><span>رقم التواصل</span><input name="phone" inputmode="tel" dir="ltr" value="${esc(o.address?.phone||'')}" required></label><label class="field"><span>ملاحظة للمندوب (اختياري)</span><textarea name="note" maxlength="500" placeholder="تفاصيل الوصول أو الوقت المفضل"></textarea></label><p class="form-error" id="trk-form-error" role="alert"></p><div class="button-stack"><button class="primary" type="submit">حفظ الموعد التجريبي</button>${btn('إلغاء','close-sheet','secondary')}</div></form>`);
}
function rescheduleSubmit(form,data) {
  const o=getOrder(form.dataset.id),phone=M.normalizePhone(data.phone),earliest=new Date(Date.now()+86400000).toISOString().slice(0,10);
  if(!o||o.status!=='shipped')return showError('تغيّرت حالة الشحنة. افتحي تفاصيل الطلب.','trk-form-error');
  if(!/^\d{4}-\d{2}-\d{2}$/.test(data.date)||data.date<earliest)return showError('اختاري موعداً صحيحاً ابتداءً من الغد.','trk-form-error');
  const latest=new Date(Date.now()+30*86400000).toISOString().slice(0,10);if(data.date>latest)return showError('اختاري موعداً خلال ٣٠ يوماً من اليوم.','trk-form-error');
  if(!phone)return showError('أدخلي رقم هاتف عراقي صحيحاً.','trk-form-error');
  o.reschedule={date:data.date,slot:data.slot,phone,note:String(data.note||'').trim(),createdAt:now()};o.deliveryIssue=false;o.deliveryHistory=o.deliveryHistory||[];o.deliveryHistory.unshift({date:now(),message:'طلب إعادة جدولة تجريبي: '+data.date+' · '+data.slot});save();closeSheet();render(true);toast('تم حفظ الموعد التجريبي.');
}
function submitReturn(form,data) {
  captureDraft(form);ensure();const o=getOrder(form.dataset.id);
  if(!o||o.status!=='delivered')return showError('يجب أن يكون الطلب قد تم تسليمه لتقديم الخدمة.');
  const items=selectedItems(o);if(!items.length)return showError('اختاري قطعة واحدة على الأقل.');
  if(!returnReasons.includes(draft.reason))return showError('اختاري سبباً للطلب.');
  if(draft.reason==='سبب آخر'&&draft.note.trim().length<5)return showError('أضيفي تفاصيل لا تقل عن ٥ أحرف عند اختيار سبب آخر.');
  if(!data.consent)return showError('يرجى الموافقة على شروط الطلب التجريبي.');
  for(const l of items){
    const max=available(o,l.itemIndex),p=getProduct(l.productId);
    if(!Number.isInteger(l.qty)||l.qty<1||l.qty>max)return showError('الكمية المحددة تجاوزت المتاح. راجعي القطع والطلبات السابقة.');
    if(draft.type==='exchange'&&(!p||!p.sizes.includes(l.exchangeSize)||l.exchangeSize===l.size||l.exchangeSize===p.unavailable||p.stock<l.qty))return showError('اختاري مقاساً بديلاً متاحاً لكل قطعة، أو قللي الكمية.');
  }
  const r={id:uid('RT'),orderId:o.id,type:draft.type==='exchange'?'exchange':'return',noRefund:!hasPaid(o),items,reason:draft.reason,note:draft.note.trim(),attachments:draft.attachments.map(a=>({...a})),status:'requested',createdAt:now(),history:[{status:'requested',date:now(),note:'تم استلام الطلب التجريبي'}],demo:true};
  M.state.returnRequests.push(r);draft.orderId=null;save();go('return-detail/'+r.id);toast('تم تقديم طلب الخدمة التجريبي.');
}
function cancelReturn(id) {
  const r=M.state.returnRequests.find(x=>x.id===id);if(!r||!['requested','approved'].includes(r.status))return toast('لا يمكن إلغاء طلب بعد إرسال القطع. تواصلي مع الدعم.');
  sheet('إلغاء طلب الخدمة',`<p>سيُلغى طلب ${r.type==='exchange'?'الاستبدال':'الإرجاع'} التجريبي، وتعود الكمية لتكون متاحة لطلب جديد. يبقى طلب الشراء الأصلي محفوظاً.</p><div class="button-stack">${button('تأكيد إلغاء طلب الخدمة','rt-cancel-confirm',id)}${btn('الاحتفاظ بالطلب','close-sheet','secondary')}</div>`);
}
function confirmCancelReturn(id) {
  const r=M.state.returnRequests.find(x=>x.id===id);if(!r||!['requested','approved'].includes(r.status))return;
  r.status='cancelled';r.cancelledAt=now();r.cancelReason='تم الإلغاء بطلب من العميلة في النموذج';r.history.push({status:'cancelled',date:now()});save();closeSheet();render(true);toast('تم إلغاء طلب الخدمة وتحرير كميته.');
}
function nextReturn(id) {
  const r=M.state.returnRequests.find(x=>x.id===id),o=r&&getOrder(r.orderId);if(!r||!o)return;
  const steps=r.type==='exchange'?['requested','approved','in_transit','received','exchange_shipped','completed']:r.noRefund?['requested','approved','in_transit','received','completed']:['requested','approved','in_transit','received','refund_pending','refunded'];
  const i=steps.indexOf(r.status);if(i<0||i>=steps.length-1)return;
  if(r.type==='exchange'&&steps[i+1]==='exchange_shipped'){
    for(const l of r.items){const p=getProduct(l.productId);if(!p||p.unavailable===l.exchangeSize||!p.sizes.includes(l.exchangeSize)||p.stock<l.qty)return toast('المقاس البديل لم يعد متاحاً. تواصلي مع الدعم لمراجعة الطلب.');}
  }
  r.status=steps[i+1];r.history.push({status:r.status,date:now(),note:'تحديث محلي تجريبي'});
  if(r.status==='refund_pending'||r.status==='refunded'){
    const refund=createRefund(o,r.items.reduce((n,l)=>n+l.amount,0),'return',r.id);if(!refund){r.noRefund=true;r.status='completed';r.completedAt=now();r.history.push({status:'completed',date:now(),note:'لا يوجد مبلغ محصّل للاسترداد'});save();render(true);return;}r.refundId=refund.id;
    if(r.status==='refund_pending'){
      if(refund.status==='requested'){refund.status='processing';refund.history.push({status:'processing',date:now()});}
    }else{refund.status='completed';refund.completedAt=now();refund.transactionId=refund.transactionId||uid('SIM');refund.history.push({status:'completed',date:now()});}
  }
  if(['refunded','completed'].includes(r.status))r.completedAt=now();
  save();render(true);toast('تم تحديث مرحلة الخدمة للتجربة.');
}
function nextRefund(id) {
  const r=M.state.refunds.find(x=>x.id===id);if(!r||r.status==='completed')return;
  r.status=r.status==='requested'?'processing':'completed';r.history.push({status:r.status,date:now()});
  if(r.status==='completed'){
    r.completedAt=now();r.transactionId=uid('SIM');
    const req=M.state.returnRequests.find(x=>x.id===r.requestId);if(req&&req.type==='return'){req.status='refunded';req.completedAt=now();req.history.push({status:'refunded',date:now(),note:'اكتملت محاكاة الاسترداد'});}
  }
  save();render(true);toast('تم تحديث سجل المحاكاة فقط.');
}
async function addPhotos(input) {
  const form=input.closest('form');captureDraft(form);const files=[...(input.files||[])];if(!files.length)return;
  if(files.length+draft.attachments.length>3){toast('الحد الأقصى ٣ صور. اختاري عدداً أقل.');input.value='';return;}
  if(files.some(f=>!['image/jpeg','image/png','image/webp'].includes(f.type))){toast('اختاري صور JPG أو PNG أو WebP فقط.');input.value='';return;}
  if(files.some(f=>f.size>4*1024*1024)){toast('الحد الأقصى ٤ ميغابايت للصورة.');input.value='';return;}
  draft.busy=true;render(true);
  try {
    for(const file of files){
      const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(new Error('read'));reader.readAsDataURL(file);});
      const url=await new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>{try{const scale=Math.min(1,900/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));const ctx=canvas.getContext('2d');ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);resolve(canvas.toDataURL('image/jpeg',.72));}catch(err){reject(err);}};img.onerror=()=>reject(new Error('image'));img.src=data;});
      draft.attachments.push({name:file.name,url});
    }
  }catch{toast('تعذّر قراءة إحدى الصور. اختاري صورة أخرى.');}
  finally{draft.busy=false;render(true);}
}
M.register({
  routes:{orders,order,tracking,return:returnView,returns:returnsList,'return-detail':returnDetail,'return-shipping':returnShipping,refunds:refundsList,'refund-detail':refundDetail,invoice},
  actions:{
    'od-filter':el=>{ui.orderFilter=el.dataset.id;render(true);},
    'od-search-clear':()=>{ui.orderSearch='';render(true);},
    'od-cancel':el=>openCancel(el.dataset.id),
    'od-reorder':el=>reorder(el.dataset.id),
    'od-print':()=>window.print(),
    'trk-next':el=>advanceOrder(el.dataset.id),
    'trk-fail':el=>{const o=getOrder(el.dataset.id);if(!o||o.status!=='shipped')return;o.deliveryIssue=true;o.deliveryHistory=o.deliveryHistory||[];o.deliveryHistory.unshift({date:now(),message:'محاولة تسليم تجريبية غير ناجحة · لم نتمكن من التواصل'});save();render(true);toast('تمت محاكاة تعذّر التسليم.');},
    'trk-reschedule':el=>reschedule(el.dataset.id),
    'rt-view-photo':el=>{const r=M.state.returnRequests.find(x=>x.id===el.dataset.id),a=r?.attachments?.[Number(el.dataset.index)];if(a)sheet('الصورة المرفقة',`<img class="rt-photo-expanded" src="${esc(a.url)}" alt="${esc(a.name||'الصورة المرفقة')}"><p class="field-note">${esc(a.name||'')}</p>`);},
    'rt-filter':el=>{ui.returnFilter=el.dataset.id;render(true);},
    'rt-cancel':el=>cancelReturn(el.dataset.id),
    'rt-cancel-confirm':el=>confirmCancelReturn(el.dataset.id),
    'rt-next':el=>nextReturn(el.dataset.id),
    'rt-refund-next':el=>nextRefund(el.dataset.id),
    'rt-remove-photo':el=>{captureDraft(document.getElementById('rt-request-form'));draft.attachments.splice(Number(el.dataset.id),1);render(true);}
  },
  forms:{
    'od-search-form':(form,data)=>{ui.orderSearch=String(data.query||'').trim();render(true);},
    'od-cancel-form':cancelSubmit,
    'trk-reschedule-form':rescheduleSubmit,
    'rt-request-form':submitReturn,
    'rt-shipping-form':submitReturnShipping
  },
  change:event=>{
    if(event.target.id==='rt-attachment-file'){addPhotos(event.target);return true;}
    const form=event.target.closest('#rt-request-form');if(form){captureDraft(form);if(event.target.matches('select,input[type="radio"],input[type="checkbox"][name^="select-"]'))render(true);return true;}
    return false;
  },
  onRoute:(name,id)=>{if(name==='return'&&id!==draft.orderId)draft.orderId=null;}
});
})();
