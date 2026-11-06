'use strict';
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const products = [
  { id: 'cloud', name: '云屿', english: 'Cloud Sofa', category: 'seating', categoryLabel: '客厅系列 / 亚麻沙发', image: 'assets/hero.webp', alt: '自然光下的米色亚麻沙发与胡桃木茶几', description: '像一座安静的小岛，接住回家之后的松弛。低矮的轮廓、宽阔的坐面与柔软的织物，让客厅成为可以随意停留的地方。', palette: '燕麦色织物 / 暖木色', size: '建议宽 260 × 深 100 × 高 72 cm', detail: '宽坐面、低靠背、松弛比例', position: '76% center' },
  { id: 'arc', name: '弧木', english: 'Arc Lounge', category: 'seating', categoryLabel: '休闲系列 / 木作单椅', image: 'assets/chair.webp', alt: '深色胡桃木框架与米色织物坐垫组成的弧木休闲椅', description: '一道从扶手延伸到椅背的弧线，围合出刚刚好的安定感。一本书、一束光，和一个不需要安排的午后，便是它最适合的搭配。', palette: '胡桃木色 / 天然亚麻色', size: '建议宽 78 × 深 82 × 高 76 cm', detail: '环抱轮廓、弧形扶手、织物坐垫', position: 'center 65%' },
  { id: 'dusk', name: '暮光', english: 'Dusk Objects', category: 'objects', categoryLabel: '日常器物 / 边几与台灯', image: 'assets/objects.webp', alt: '胡桃木圆形边几上的暖光褶皱灯罩台灯与陶瓷浅盘', description: '当日光渐暗，给空间留一盏低低的灯。圆形木作边几与柔和的褶皱灯罩，让沙发旁、床头边的方寸之地，也拥有自己的节奏。', palette: '深木色 / 暖白 / 陶土色', size: '边几建议直径 60 × 高 48 cm', detail: '圆形台面、雕塑感底座、柔和照明', position: 'center 65%' }
];
const knownIds = new Set(products.map(p => p.id));
let favorites = new Set();
try { const saved = JSON.parse(localStorage.getItem('forma-favorites-v1') || '[]'); if (Array.isArray(saved)) favorites = new Set(saved.filter(id => knownIds.has(id))); } catch { /* Browsing works with storage disabled. */ }
let activeFilter = 'all';
let activeProduct = null;
let planText = '';
let toastTimer;
const heart = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 4.9a5.5 5.5 0 0 0-7.8 0L12 5.6l-.7-.7a5.5 5.5 0 0 0-7.8 7.8L12 21l8.5-8.3a5.5 5.5 0 0 0 0-7.8Z"/></svg>';

function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2400); }
function renderProducts(restoreFavoriteId) {
  const visible = products.filter(p => activeFilter === 'all' || (activeFilter === 'favorites' ? favorites.has(p.id) : p.category === activeFilter));
  $('#product-grid').innerHTML = visible.map(p => `<article class="product-card" data-id="${p.id}"><button class="product-open" data-product="${p.id}" aria-label="查看${p.name} ${p.english}详情"><div class="product-photo"><img src="${p.image}" alt="${p.alt}" width="1024" height="1280" loading="lazy"><span class="product-number">0${products.indexOf(p) + 1} / FORMA</span></div><div class="product-info"><div><h3>${p.name}<span class="en-name">${p.english}</span></h3><p class="product-category">${p.categoryLabel}</p></div><span class="product-arrow" aria-hidden="true">↗</span></div></button><button class="favorite" data-favorite="${p.id}" aria-pressed="${favorites.has(p.id)}" aria-label="${favorites.has(p.id) ? '取消收藏' : '收藏'}${p.name}">${heart}</button></article>`).join('');
  $('#empty-state').hidden = visible.length !== 0;
  $('#favorite-count').textContent = favorites.size;
  $('#filter-status').textContent = `显示 ${visible.length} 件作品`;
  if (restoreFavoriteId) { const target = $(`[data-favorite="${restoreFavoriteId}"]`) || $('[data-filter="favorites"]'); target?.focus({ preventScroll: true }); }
}
function setFilter(filter) { activeFilter = filter; $$('.filter').forEach(b => { const active = b.dataset.filter === filter; b.classList.toggle('active', active); b.setAttribute('aria-pressed', String(active)); }); renderProducts(); }
$$('.filter').forEach(b => b.addEventListener('click', () => setFilter(b.dataset.filter)));
$('#reset-filter').addEventListener('click', () => { setFilter('all'); $('[data-filter="all"]').focus(); });
$('#product-grid').addEventListener('click', e => {
  const favorite = e.target.closest('[data-favorite]');
  if (favorite) {
    const id = favorite.dataset.favorite;
    favorites.has(id) ? favorites.delete(id) : favorites.add(id);
    let saved = true;
    try { localStorage.setItem('forma-favorites-v1', JSON.stringify([...favorites])); } catch { saved = false; }
    renderProducts(id); toast(`${favorites.has(id) ? '已加入收藏' : '已取消收藏'}${saved ? '' : '（仅当前页面有效）'}`); return;
  }
  const button = e.target.closest('[data-product]');
  if (button) showProduct(button.dataset.product);
});
renderProducts();

let dialogReturnFocus = null;
function openDialog(dialog) { if (!$$('dialog[open]').length) dialogReturnFocus = document.activeElement; $$('dialog[open]').forEach(d => d.close()); dialog.showModal(); document.body.classList.add('modal-open'); }
$$('dialog').forEach(d => {
  $('[data-close]', d)?.addEventListener('click', () => d.close());
  d.addEventListener('click', e => { const r = d.getBoundingClientRect(); if (e.target === d && (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom)) d.close(); });
  d.addEventListener('close', () => { if (!$$('dialog[open]').length) { document.body.classList.remove('modal-open'); if (dialogReturnFocus?.isConnected) dialogReturnFocus.focus({ preventScroll: true }); } });
});
function showProduct(id) {
  activeProduct = products.find(p => p.id === id);
  if (!activeProduct) return;
  const p = activeProduct;
  $('#product-title').textContent = p.name;
  $('#detail-english').textContent = p.english;
  $('#detail-category').textContent = p.categoryLabel;
  $('#detail-description').textContent = p.description;
  $('#detail-image').src = p.image;
  $('#detail-image').alt = p.alt;
  $('#detail-image').style.objectPosition = p.position;
  $('#detail-specs').replaceChildren(...[['材质灵感', p.palette], ['概念尺寸', p.size], ['设计细节', p.detail]].map(([label, value]) => definition(label, value)));
  openDialog($('#product-dialog'));
}
function definition(label, value) { const row = document.createElement('div'); const dt = document.createElement('dt'); const dd = document.createElement('dd'); dt.textContent = label; dd.textContent = value; row.append(dt, dd); return row; }
function showInquiry(productId = '') { $('#inquiry-form').hidden = false; $('#inquiry-result').hidden = true; if (productId) $('#inquiry-form').elements.product.value = productId; openDialog($('#inquiry-dialog')); $('#inquiry-dialog').scrollTop = 0; }
$$('[data-inquire]').forEach(b => b.addEventListener('click', () => showInquiry()));
$('#plan-product').addEventListener('click', () => showInquiry(activeProduct?.id));
$('.menu-trigger').addEventListener('click', () => openDialog($('#mobile-menu')));
$$('#mobile-menu nav a').forEach(a => a.addEventListener('click', () => $('#mobile-menu').close()));
matchMedia('(min-width: 761px)').addEventListener('change', e => { if (e.matches) $('#mobile-menu').close(); });

const materials = {
  wood: { src: 'assets/chair.webp', alt: '弧木休闲椅的胡桃木扶手与亚麻织物细节', label: '01 / THE WARMTH OF WOOD', position: '50% 65%', scale: '1.22', description: '深浅交错的木纹，让利落的线条也拥有柔软的表情。从扶手的一道弧度，到桌面的一圈年轮，细节值得慢慢欣赏。' },
  linen: { src: 'assets/hero.webp', alt: '云屿沙发的柔软织物与自然褶皱', label: '02 / A SOFTER EVERYDAY', position: '82% 69%', scale: '1.1', description: '织物不只是一层表面，也是一种亲近生活的方式。燕麦色与细腻肌理，让阳光、褶皱和日常使用的痕迹，都成为空间的一部分。' },
  light: { src: 'assets/objects.webp', alt: '褶皱灯罩散发柔和暖光，映照木作边几', label: '03 / LIGHT THAT LINGERS', position: '50% 43%', scale: '1.15', description: '柔和的光线，让家的轮廓在入夜后慢慢舒展。褶皱灯罩过滤亮度，木色承接暖光，一处小小的角落，也能装下一整晚的安静。' }
};
function setMaterial(key, focus = false) {
  const data = materials[key]; if (!data) return;
  $$('[data-material]').forEach(b => { const active = b.dataset.material === key; b.setAttribute('aria-selected', String(active)); b.tabIndex = active ? 0 : -1; if (focus && active) b.focus(); });
  const img = $('#material-image'); img.src = data.src; img.alt = data.alt; img.style.objectPosition = data.position; img.style.transform = `scale(${data.scale})`;
  $('#material-image-label').textContent = data.label;
  $('#material-description').textContent = data.description;
  $('#material-panel').setAttribute('aria-labelledby', `${key}-tab`);
  if (!reducedMotion.matches) { img.getAnimations().forEach(a => a.cancel()); img.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 350, easing: 'ease-out' }); }
}
$$('[data-material]').forEach(b => {
  b.addEventListener('click', () => setMaterial(b.dataset.material));
  b.addEventListener('keydown', e => { const keys = Object.keys(materials); const i = keys.indexOf(b.dataset.material); let next; if (['ArrowDown', 'ArrowRight'].includes(e.key)) next = (i + 1) % keys.length; if (['ArrowUp', 'ArrowLeft'].includes(e.key)) next = (i + keys.length - 1) % keys.length; if (e.key === 'Home') next = 0; if (e.key === 'End') next = keys.length - 1; if (next !== undefined) { e.preventDefault(); setMaterial(keys[next], true); } });
});

$('#inquiry-form').addEventListener('submit', e => {
  e.preventDefault();
  const form = e.currentTarget;
  const name = form.elements.name.value.trim();
  form.elements.name.setCustomValidity(name ? '' : '请填写你的称呼');
  if (!form.reportValidity()) return;
  const data = new FormData(form);
  const product = products.find(p => p.id === data.get('product'));
  const rows = [['称呼', name], ['电子邮箱', String(data.get('email')).trim()], ['空间类型', data.get('space')], ['心仪作品', product ? `${product.name} · ${product.english}` : '还在寻找灵感'], ['空间想法', String(data.get('message')).trim() || '暂未填写']];
  $('#result-summary').replaceChildren(...rows.map(([label, value]) => definition(label, value)));
  planText = `FORMA 家居 · 我的空间计划\n${'—'.repeat(22)}\n\n${rows.map(([k,v]) => `${k}：${v}`).join('\n\n')}\n\n说明：本清单由 FORMA 概念网站在本地生成，未发送信息、未创建预约。品牌、产品及规格均为演示设计，图片为 AI 生成。\n`;
  form.hidden = true; $('#inquiry-result').hidden = false; $('#inquiry-dialog').scrollTop = 0; $('#download-plan').focus();
});
$('#inquiry-form').elements.name.addEventListener('input', e => e.target.setCustomValidity(''));
$('#edit-plan').addEventListener('click', () => { $('#inquiry-form').hidden = false; $('#inquiry-result').hidden = true; $('#inquiry-form').elements.name.focus(); });
$('#download-plan').addEventListener('click', () => { if (!planText) return; const url = URL.createObjectURL(new Blob(['\uFEFF' + planText], { type: 'text/plain;charset=utf-8' })); const a = document.createElement('a'); a.href = url; a.download = 'FORMA-我的空间计划.txt'; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(url), 1500); });

let ticking = false;
function updateScroll() { $('#header').classList.toggle('scrolled', window.scrollY > 64); if (!reducedMotion.matches && window.innerWidth > 760 && window.scrollY < $('.hero').offsetHeight) $('.hero-media').style.transform = `translate3d(0,${Math.min(window.scrollY * .06, 40)}px,0)`; ticking = false; }
window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } }, { passive: true });
updateScroll();
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.animate([{ opacity: 0, transform: 'translateY(22px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 650, easing: 'cubic-bezier(.22,1,.36,1)' }); observer.unobserve(entry.target); } }); }, { threshold: .12 });
  $$('[data-reveal]').forEach(el => observer.observe(el));
}
