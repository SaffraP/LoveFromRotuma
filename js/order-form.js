// =========================================================
// LOVE FROM ROTUMA — Order form logic
// =========================================================
//
// IMPORTANT: Replace APPS_SCRIPT_URL below with your deployed
// Google Apps Script Web App URL (see /backend/README.md).
// =========================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeg28bSeDtm6chJZ4Ew7vLOlgdswz663U1u6_muS2mwJARtjm9cgnZq-IvaxYT8NutSQ/exec';

let dressData = null;
let fabricData = null;
let premadeData = null;
let dressItems = [];      // { id, dressType, style, length, sleeves, size, fabric, customMeasurements, upsellShown }
let nextItemId = 1;
let isPremadeMode = false;
let premadeSelection = null;

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('order-form');
  if (!form) return;

  [dressData, fabricData, premadeData] = await Promise.all([
    fetchJSON('data/dresses.json'),
    fetchJSON('data/fabrics.json'),
    fetchJSON('data/premade.json')
  ]);

  const params = new URLSearchParams(window.location.search);
  const premadeId = params.get('premade');
  const styleId = params.get('style');

  if (premadeId) {
    setupPremadeMode(premadeId);
  } else {
    addDressItem(styleId ? { style: styleId } : {});
  }

  document.getElementById('add-dress-btn')?.addEventListener('click', () => addDressItem());
  wireConditionalFields();
  wireSubmit(form);
});

/* ============================================================
   PREMADE MODE
   ============================================================ */
function setupPremadeMode(premadeId) {
  const item = (premadeData || []).find(p => p.id === premadeId);
  document.getElementById('dress-items-wrapper').style.display = 'none';

  const summary = document.getElementById('premade-summary');
  summary.style.display = 'block';

  if (!item) {
    summary.innerHTML = `<strong>Premade dress not found.</strong> Please go back to the Premade Dresses page and select a dress again, or describe what you'd like in the notes below.`;
    return;
  }
  if (item.status === 'sold') {
    summary.innerHTML = `<strong>Sorry — "${escapeHTML(item.name)}" has just been sold.</strong> Please check the Premade Dresses page for other available options, or place a made-to-order request instead.`;
    return;
  }

  isPremadeMode = true;
  premadeSelection = item;
  summary.innerHTML = `
    <strong>Requesting Premade Dress:</strong> ${escapeHTML(item.name)}
    (Size: ${escapeHTML(item.size)}, FJD $${item.price})<br>
    <span style="font-size:0.85rem;">This dress is ready now — no production wait. Please note its reference number: <strong>${escapeHTML(item.id)}</strong>.</span>
  `;
}

/* ============================================================
   DRESS ITEMS (multi-dress custom orders)
   ============================================================ */
function addDressItem(prefill = {}) {
  const id = nextItemId++;
  dressItems.push({
    id,
    dressType: prefill.dressType || 'adult',
    style: prefill.style || '',
    length: '', sleeves: '', size: '', fabric: '',
    customMeasurements: false,
    upsellShown: false
  });
  renderDressItems();
  if (prefill.scrollTo) {
    document.getElementById(`dress-item-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}

function removeDressItem(id) {
  if (dressItems.length <= 1) return; // keep at least one
  dressItems = dressItems.filter(i => i.id !== id);
  renderDressItems();
}

function renderDressItems() {
  const container = document.getElementById('dress-items-container');
  if (!container) return;

  container.innerHTML = dressItems.map((item, idx) => `
    <div class="dress-item-card" id="dress-item-${item.id}">
      <div class="dress-item-card-header">
        <h4>Dress ${idx + 1}</h4>
        ${dressItems.length > 1 ? `<button type="button" class="remove-dress-btn" data-remove="${item.id}">Remove</button>` : ''}
      </div>

      <div class="form-group">
        <label>Adult or Child *</label>
        <div class="radio-row">
          <label><input type="radio" name="dress-type-${item.id}" value="adult" data-item="${item.id}" data-field="dressType" ${item.dressType === 'adult' ? 'checked' : ''}> Adult</label>
          <label><input type="radio" name="dress-type-${item.id}" value="child" data-item="${item.id}" data-field="dressType" ${item.dressType === 'child' ? 'checked' : ''}> Child</label>
        </div>
      </div>

      <div class="form-group">
        <label>Dress Style *</label>
        <select data-item="${item.id}" data-field="style" required>
          <option value="" disabled ${!item.style ? 'selected' : ''}>Select a style</option>
          ${styleOptionsHTML(item.style)}
        </select>
      </div>

      <div class="form-group">
        <label>Length *</label>
        <select data-item="${item.id}" data-field="length" required>
          <option value="" disabled ${!item.length ? 'selected' : ''}>Select a length</option>
          ${['Knee Length','Midi','Floor Length'].map(l => `<option value="${l}" ${item.length===l?'selected':''}>${l}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Sleeves *</label>
        <select data-item="${item.id}" data-field="sleeves" required>
          <option value="" disabled ${!item.sleeves ? 'selected' : ''}>Select sleeve style</option>
          ${['Sleeveless','Elastic Sleeve','Loose Sleeve'].map(s => `<option value="${s}" ${item.sleeves===s?'selected':''}>${s}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label>Size *</label>
        <select data-item="${item.id}" data-field="size" required>
          <option value="" disabled ${!item.size ? 'selected' : ''}>Select a size</option>
          ${sizeOptionsHTML(item.size)}
        </select>
      </div>

      <div class="form-group">
        <label><input type="checkbox" data-item="${item.id}" data-field="customMeasurements" style="width:auto; margin-right:0.5rem;" ${item.customMeasurements?'checked':''}>I'd like custom measurements / a fitting for this dress</label>
        <div class="hint" style="display:${item.customMeasurements ? 'block':'none'};">Great — please visit our Wailoku shop; most custom fittings can be done on the spot.</div>
      </div>

      <div class="form-group">
        <label>Fabric *</label>
        <select data-item="${item.id}" data-field="fabric" required>
          <option value="" disabled ${!item.fabric ? 'selected' : ''}>Select a fabric</option>
          ${fabricOptionsHTML(item.fabric)}
        </select>
        <div class="hint">If your selected fabric is unavailable, we'll contact you to discuss alternatives before production begins.</div>
      </div>
    </div>
  `).join('');

  // Wire up change handlers for this render pass
  container.querySelectorAll('[data-item][data-field]').forEach(el => {
    const evt = el.type === 'checkbox' ? 'change' : (el.tagName === 'SELECT' ? 'change' : 'input');
    el.addEventListener(evt, onItemFieldChange);
  });
  container.querySelectorAll('[data-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeDressItem(Number(btn.dataset.remove)));
  });
}

function styleOptionsHTML(selected) {
  if (!dressData) return '';
  return dressData.collections.map(col => `
    <optgroup label="${col.name}">
      ${col.styles.map(s => `<option value="${s.id}" ${s.id===selected?'selected':''}>${s.name}</option>`).join('')}
    </optgroup>
  `).join('');
}

function sizeOptionsHTML(selected) {
  if (!dressData) return '';
  let html = dressData.sizes.adult.map(s =>
    `<option value="${s.label}" ${s.label===selected?'selected':''}>${s.label} (Bust ${s.bust_cm}cm / Waist ${s.waist_cm}cm / Hip ${s.hip_cm}cm)</option>`
  ).join('');
  html += `<optgroup label="Children's Ages">${dressData.sizes.child_ages.map(age =>
    `<option value="${age}" ${age===selected?'selected':''}>${age}</option>`
  ).join('')}</optgroup>`;
  html += `<option value="custom" ${selected==='custom'?'selected':''}>Custom measurements (visit shop for fitting)</option>`;
  return html;
}

function fabricOptionsHTML(selected) {
  if (!fabricData) return '';
  return fabricData.fabrics.map(f =>
    `<option value="${f.id}" ${f.id===selected?'selected':''}>${f.name}${f.available ? '' : ' (check availability)'}</option>`
  ).join('');
}

function onItemFieldChange(e) {
  const id = Number(e.target.dataset.item);
  const field = e.target.dataset.field;
  const item = dressItems.find(i => i.id === id);
  if (!item) return;

  if (e.target.type === 'checkbox') {
    item[field] = e.target.checked;
    // toggle the hint text without a full re-render
    const hint = e.target.closest('.form-group').querySelector('.hint');
    if (hint) hint.style.display = e.target.checked ? 'block' : 'none';
    return;
  }

  item[field] = e.target.value;

  // Trigger the matching-set upsell once per item, right after they pick a style
  if (field === 'style' && !item.upsellShown) {
    item.upsellShown = true;
    maybeShowUpsell(item);
  }
}

/* ============================================================
   MATCHING-SET UPSELL
   ============================================================ */
function maybeShowUpsell(item) {
  const oppositeType = item.dressType === 'adult' ? 'child' : 'adult';
  const label = oppositeType === 'child' ? "Kids'" : 'Adult';

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.innerHTML = `
    <div class="modal-box">
      <h3>Add a matching ${label} dress? 👗</h3>
      <p style="color:var(--color-charcoal-soft);">Many families order matching sets. Want to add a ${label.toLowerCase()} version in the same style?</p>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="upsell-no">No thanks</button>
        <button type="button" class="btn btn-primary" id="upsell-yes">Yes, add one</button>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.querySelector('#upsell-yes').addEventListener('click', () => {
    addDressItem({ dressType: oppositeType, style: item.style, scrollTo: true });
    overlay.remove();
  });
  overlay.querySelector('#upsell-no').addEventListener('click', () => overlay.remove());
}

/* ============================================================
   SHARED HELPERS
   ============================================================ */
async function fetchJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error('Failed to load ' + path);
  return res.json();
}

function wireConditionalFields() {
  const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');
  const addressGroup = document.getElementById('delivery-address-group');
  deliveryRadios.forEach(r => r.addEventListener('change', () => {
    const needsAddress = document.querySelector('input[name="delivery-method"]:checked')?.value !== 'pickup';
    addressGroup.style.display = needsAddress ? 'block' : 'none';
    document.getElementById('delivery-address').required = needsAddress;
  }));
}

function wireSubmit(form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(form);

    if (!validateForm(form)) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Order...';

    const payload = collectFormData(form);

    try {
      if (APPS_SCRIPT_URL.startsWith('REPLACE_WITH')) {
        throw new Error('BACKEND_NOT_CONFIGURED');
      }
      await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      showConfirmation(payload, payload.orderId);
      form.reset();
      dressItems = isPremadeMode ? [] : [{ id: nextItemId++, dressType: 'adult', style:'', length:'', sleeves:'', size:'', fabric:'', customMeasurements:false, upsellShown:false }];
      renderDressItems();
      document.getElementById('delivery-address-group').style.display = 'none';
    } catch (err) {
      if (err.message === 'BACKEND_NOT_CONFIGURED') {
        showConfirmation(payload, payload.orderId);
        alert('Note to site owner: order backend is not yet connected. See /backend/README.md.');
      } else {
        alert('Something went wrong sending your order. Please try again or contact us directly by phone.');
      }
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit Order Request';
    }
  });
}

function collectFormData(form) {
  const fd = new FormData(form);

  const items = isPremadeMode ? [] : dressItems.map(item => ({
    dressType: item.dressType,
    dressStyle: findStyleName(item.style),
    length: item.length,
    sleeves: item.sleeves,
    size: item.size,
    fabric: findFabricName(item.fabric),
    customMeasurements: item.customMeasurements ? 'Yes — will visit Wailoku for fitting' : 'No'
  }));

  return {
    orderId: generateClientOrderId(),
    name: fd.get('name'),
    phone: fd.get('phone'),
    email: fd.get('email') || '',
    deliveryMethod: fd.get('delivery-method'),
    deliveryAddress: fd.get('delivery-address') || '',
    orderType: isPremadeMode ? 'premade' : 'custom',
    premadeItem: isPremadeMode && premadeSelection ? {
      id: premadeSelection.id, name: premadeSelection.name,
      size: premadeSelection.size, price: premadeSelection.price
    } : null,
    dressItems: items,
    notes: fd.get('notes') || '',
    submittedAt: new Date().toISOString()
  };
}

function findStyleName(styleId) {
  if (!dressData) return styleId;
  for (const col of dressData.collections) {
    const match = col.styles.find(s => s.id === styleId);
    if (match) return match.name;
  }
  return styleId;
}

function findFabricName(fabricId) {
  if (!fabricData) return fabricId;
  const match = fabricData.fabrics.find(f => f.id === fabricId);
  return match ? match.name : fabricId;
}

function generateClientOrderId() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const stamp = `${String(now.getFullYear()).slice(2)}${pad(now.getMonth()+1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  return `LFR-${stamp}`;
}

function validateForm(form) {
  let valid = true;

  // Standard named-radio/text/email fields (customer + delivery)
  form.querySelectorAll('[required][name]').forEach(field => {
    if (field.type === 'radio') {
      if (!form.querySelector(`input[name="${field.name}"]:checked`)) { markError(field); valid = false; }
    } else if (!field.value) {
      markError(field); valid = false;
    }
  });

  const phone = form.querySelector('#phone');
  if (phone && phone.value && phone.value.replace(/\D/g, '').length < 7) {
    markError(phone, 'Please enter a valid phone number.');
    valid = false;
  }

  // Dress item fields (data-item/data-field based, not part of native form validation)
  if (!isPremadeMode) {
    document.querySelectorAll('#dress-items-container select[required]').forEach(sel => {
      if (!sel.value) {
        sel.closest('.form-group').classList.add('field-error');
        valid = false;
      } else {
        sel.closest('.form-group').classList.remove('field-error');
      }
    });
  }

  return valid;
}

function markError(field, message) {
  const group = field.closest('.form-group') || field.closest('fieldset');
  if (!group) return;
  group.classList.add('field-error');
  const errEl = group.querySelector('.error-text');
  if (errEl && message) errEl.textContent = message;
}

function clearErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => el.classList.remove('field-error'));
}

function showConfirmation(payload, orderId) {
  const panel = document.getElementById('confirmation-panel');
  if (!panel) return;

  let itemsSummary = '';
  if (payload.orderType === 'premade' && payload.premadeItem) {
    itemsSummary = `<li>${escapeHTML(payload.premadeItem.name)} (Size ${escapeHTML(payload.premadeItem.size)}, FJD $${payload.premadeItem.price})</li>`;
  } else if (payload.dressItems?.length) {
    itemsSummary = payload.dressItems.map(i => `<li>${escapeHTML(i.dressStyle)} — ${escapeHTML(i.size)}, ${escapeHTML(i.fabric)}</li>`).join('');
  }

  panel.innerHTML = `
    <h3>Thank you, ${escapeHTML(payload.name)}! 🌿</h3>
    <p><strong>Order Reference:</strong> ${escapeHTML(orderId)}</p>
    <p>We've received your order request:</p>
    <ul style="margin:0 0 1rem 1.2rem;">${itemsSummary}</ul>
    <p>${payload.email ? "A confirmation has also been sent to your email." : "Since no email was provided, please save this confirmation or take a screenshot."}</p>
    <div class="notice-box" style="margin-top:1rem;">
      A non-refundable 25% deposit (to cover materials) is required via M-PAiSA to
      <strong>Akanisi Memaofa (+679-934-6552)</strong> before production begins. We'll be in touch
      by phone${payload.email ? ' or email' : ''} shortly to confirm details and arrange payment.
    </div>
  `;
  panel.classList.add('show');
  panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}
