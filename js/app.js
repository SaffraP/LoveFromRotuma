// =========================================================
// LOVE FROM ROTUMA — shared front-end behavior
// =========================================================

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initFaq();
  renderDressCatalog();
  renderPremade();
  renderFabricGallery();
  setActiveNav();
});

/* ---------- Highlight current page in nav ---------- */
function setActiveNav() {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.main-nav a').forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === current);
  });
}

/* ---------- Mobile nav ---------- */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });
  nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', false);
    document.body.classList.remove('nav-open');
  }));
}

/* ---------- FAQ accordion ---------- */
function initFaq() {
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-question');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      item.closest('.faq-list')?.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ---------- Helpers ---------- */
async function fetchJSON(path) {
  const res = await fetch(path, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

/* ---------- Dresses (dresses.html) ---------- */
let loadedDressData = null;

async function renderDressCatalog() {
  const root = document.getElementById('dress-collections');
  if (!root) return;
  try {
    const data = await fetchJSON('data/dresses.json');
    loadedDressData = data;
    root.innerHTML = data.collections.map(col => `
      <div class="collection-block">
        <div class="eyebrow">Collection</div>
        <h2>${col.name}</h2>
        <p class="lead" style="color:var(--color-charcoal-soft); max-width:60ch;">${col.description}</p>
        <div class="card-grid">
          ${col.styles.map(styleCardHTML).join('')}
        </div>
      </div>
    `).join('<div class="section"></div>');

    root.querySelectorAll('[data-gallery-style]').forEach(el => {
      el.addEventListener('click', () => openDressGallery(el.dataset.galleryStyle));
    });
  } catch (e) {
    root.innerHTML = '<p>Dress styles will be listed here shortly. Please check back soon.</p>';
  }
}

function styleCardHTML(style) {
  const priceLine = [
    style.price_adult_from ? `Adults from FJD $${style.price_adult_from}` : null,
    style.price_child_from ? `Children from FJD $${style.price_child_from}` : null
  ].filter(Boolean).join(' &middot; ');

  const comingSoonBadge = style.comingSoon
    ? `<span class="tag tag--coming-soon" style="margin-bottom:0.4rem;">Coming Soon</span>`
    : '';
  const orderButton = style.comingSoon
    ? `<button type="button" class="btn btn-secondary" style="width:100%;" disabled>Coming Soon</button>`
    : `<a class="btn btn-primary" href="order.html?style=${encodeURIComponent(style.id)}">Order This Style</a>`;

  return `
    <div class="card">
      <div class="card-media" data-gallery-style="${style.id}" style="cursor:pointer;" title="View photos">
        <img src="${style.image}" alt="${style.name}" loading="lazy">
      </div>
      <div class="card-body">
        ${comingSoonBadge}
        <h3>${style.name}</h3>
        <p style="font-size:var(--step--1); color:var(--color-charcoal-soft); margin-bottom:0.2rem;">${style.description}</p>
        <div class="price">${priceLine}</div>
        <ul class="feature-list">
          <li>Choose your length</li>
          <li>Choose your sleeves</li>
          <li>Choose your fabric</li>
          <li>Standard or custom size</li>
        </ul>
        <button type="button" class="btn btn-secondary" style="width:100%; margin-bottom:0.6rem;" data-gallery-style="${style.id}">View Photos</button>
        ${orderButton}
      </div>
    </div>
  `;
}

/* ---------- Dress photo gallery / lightbox ---------- */
let galleryImages = [];
let galleryIndex = 0;

function openDressGallery(styleId) {
  if (!loadedDressData) return;
  let found = null;
  for (const col of loadedDressData.collections) {
    const match = col.styles.find(s => s.id === styleId);
    if (match) { found = match; break; }
  }
  if (!found) return;

  galleryImages = [found.image, ...(found.gallery || [])];
  galleryIndex = 0;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay gallery-overlay';
  overlay.innerHTML = `
    <div class="gallery-box">
      <button type="button" class="gallery-close" aria-label="Close">&times;</button>
      <h3>${found.name}</h3>
      <div class="gallery-image-wrap">
        <button type="button" class="gallery-arrow gallery-prev" aria-label="Previous photo">&#8249;</button>
        <img src="${galleryImages[0]}" alt="${found.name}" class="gallery-image">
        <button type="button" class="gallery-arrow gallery-next" aria-label="Next photo">&#8250;</button>
      </div>
      <div class="gallery-counter">1 / ${galleryImages.length}</div>
      <a class="btn btn-primary" style="width:100%; margin-top:1rem;" href="order.html?style=${encodeURIComponent(styleId)}">Order This Style</a>
    </div>
  `;
  document.body.appendChild(overlay);

  const imgEl = overlay.querySelector('.gallery-image');
  const counterEl = overlay.querySelector('.gallery-counter');

  function updateSlide() {
    imgEl.src = galleryImages[galleryIndex];
    counterEl.textContent = `${galleryIndex + 1} / ${galleryImages.length}`;
  }

  overlay.querySelector('.gallery-prev').addEventListener('click', () => {
    galleryIndex = (galleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateSlide();
  });
  overlay.querySelector('.gallery-next').addEventListener('click', () => {
    galleryIndex = (galleryIndex + 1) % galleryImages.length;
    updateSlide();
  });
  overlay.querySelector('.gallery-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.remove(); });

  function onKey(e) {
    if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onKey); }
    if (e.key === 'ArrowLeft') overlay.querySelector('.gallery-prev').click();
    if (e.key === 'ArrowRight') overlay.querySelector('.gallery-next').click();
  }
  document.addEventListener('keydown', onKey);
}

/* ---------- Fabric gallery (dresses.html) ---------- */
async function renderFabricGallery() {
  const root = document.getElementById('fabric-gallery');
  if (!root) return;
  try {
    const data = await fetchJSON('data/fabrics.json');
    const categories = [...new Set(data.fabrics.map(f => f.category))];
    root.innerHTML = categories.map(cat => `
      <div style="margin-bottom:2rem;">
        <h3 style="font-size:var(--step-1); margin-bottom:1rem;">${cat === 'Standard' ? 'Solid Colors' : 'Patterns'}</h3>
        <div class="card-grid">
          ${data.fabrics.filter(f => f.category === cat).map(f => `
            <div class="card">
              <div class="card-media"><img src="${f.image}" alt="${f.name}" loading="lazy"></div>
              <div class="card-body" style="padding:0.8rem 1rem;">
                <h3 style="font-size:var(--step-0); margin:0;">${f.name}${f.available ? '' : ' <span style="font-size:0.75rem; color:var(--color-coral); font-weight:500;">(check availability)</span>'}</h3>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  } catch (e) {
    root.innerHTML = '<p class="center">Fabric options will be listed here shortly.</p>';
  }
}

/* ---------- Premade (premade.html) ---------- */
async function renderPremade() {
  const root = document.getElementById('premade-grid');
  if (!root) return;
  try {
    const items = await fetchJSON('data/premade.json');
    if (!items.length) {
      root.innerHTML = '<p class="center">No premade dresses are listed right now — check back soon, or start a custom order instead.</p>';
      return;
    }
    root.innerHTML = items.map(item => `
      <div class="card">
        <div class="card-media"><img src="${item.image}" alt="${item.name}" loading="lazy"></div>
        <div class="card-body">
          <h3>${item.name}</h3>
          <p style="margin-bottom:0.2rem;">Size: ${item.size}</p>
          <div class="price">FJD $${item.price}</div>
          <span class="tag ${item.status === 'available' ? 'tag--available' : 'tag--sold'}">
            ${item.status === 'available' ? 'Available' : 'Sold'}
          </span>
          ${item.status === 'available'
            ? `<a class="btn btn-primary" style="margin-top:0.6rem;" href="order.html?premade=${encodeURIComponent(item.id)}">Request This Dress</a>`
            : ''}
        </div>
      </div>
    `).join('');
  } catch (e) {
    root.innerHTML = '<p>Ready-made dresses will be listed here shortly.</p>';
  }
}
