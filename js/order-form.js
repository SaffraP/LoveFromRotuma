// =========================================================
// LOVE FROM ROTUMA — Order form logic
// =========================================================
//
// IMPORTANT: Replace APPS_SCRIPT_URL below with your deployed
// Google Apps Script Web App URL (see /backend/README.md).
// =========================================================

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzeg28bSeDtm6chJZ4Ew7vLOlgdswz663U1u6_muS2mwJARtjm9cgnZq-IvaxYT8NutSQ/exec';

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('order-form');
  if (!form) return;

  const [dressData, fabricData] = await Promise.all([
    fetchJSON('data/dresses.json'),
    fetchJSON('data/fabrics.json')
  ]);

  populateStyleOptions(dressData);
  populateFabricOptions(fabricData);
  populateSizeOptions(dressData);
  prefillFromQueryString(dressData);
  wireConditionalFields();
  wireSubmit(form);
});

function populateStyleOptions(dressData) {
  const select = document.getElementById('dress-style');
  if (!select) return;
  dressData.collections.forEach(col => {
    const group = document.createElement('optgroup');
    group.label = col.name;
    col.styles.forEach(style => {
      const opt = document.createElement('option');
      opt.value = style.id;
      opt.textContent = style.name;
      group.appendChild(opt);
    });
    select.appendChild(group);
  });
}

function populateFabricOptions(fabricData) {
  const select = document.getElementById('fabric');
  if (!select) return;
  fabricData.fabrics.forEach(f => {
    const opt = document.createElement('option');
    opt.value = f.id;
    opt.textContent = f.name + (f.available ? '' : ' (check availability)');
    select.appendChild(opt);
  });
}

function populateSizeOptions(dressData) {
  const sizeSelect = document.getElementById('size');
  if (!sizeSelect) return;
  dressData.sizes.adult.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.label;
    opt.textContent = `${s.label} (Bust ${s.bust_cm}cm / Waist ${s.waist_cm}cm / Hip ${s.hip_cm}cm)`;
    sizeSelect.appendChild(opt);
  });
  const childGroup = document.createElement('optgroup');
  childGroup.label = "Children's Ages";
  dressData.sizes.child_ages.forEach(age => {
    const opt = document.createElement('option');
    opt.value = age;
    opt.textContent = age;
    childGroup.appendChild(opt);
  });
  sizeSelect.appendChild(childGroup);
  const customOpt = document.createElement('option');
  customOpt.value = 'custom';
  customOpt.textContent = 'Custom measurements (visit shop for fitting)';
  sizeSelect.appendChild(customOpt);
}

function prefillFromQueryString(dressData) {
  const params = new URLSearchParams(window.location.search);
  const styleId = params.get('style');
  if (styleId) {
    const select = document.getElementById('dress-style');
    if (select) select.value = styleId;
  }
}

function wireConditionalFields() {
  const deliveryRadios = document.querySelectorAll('input[name="delivery-method"]');
  const addressGroup = document.getElementById('delivery-address-group');
  deliveryRadios.forEach(r => r.addEventListener('change', () => {
    const needsAddress = document.querySelector('input[name="delivery-method"]:checked')?.value !== 'pickup';
    addressGroup.style.display = needsAddress ? 'block' : 'none';
    document.getElementById('delivery-address').required = needsAddress;
  }));

  const customCheckbox = document.getElementById('custom-measurements');
  const customNote = document.getElementById('custom-measurements-note');
  if (customCheckbox && customNote) {
    customCheckbox.addEventListener('change', () => {
      customNote.style.display = customCheckbox.checked ? 'block' : 'none';
    });
  }
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
      const res = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' }, // avoids CORS preflight with Apps Script
        body: JSON.stringify(payload)
      });
      const result = await res.json();
      showConfirmation(payload, result.orderId);
      form.reset();
      document.getElementById('delivery-address-group').style.display = 'none';
    } catch (err) {
      if (err.message === 'BACKEND_NOT_CONFIGURED') {
        // Fallback so the site still works before the backend is deployed:
        // display confirmation locally and prompt to email directly.
        showConfirmation(payload, 'PENDING-SETUP');
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
  return {
    name: fd.get('name'),
    phone: fd.get('phone'),
    email: fd.get('email') || '',
    deliveryMethod: fd.get('delivery-method'),
    deliveryAddress: fd.get('delivery-address') || '',
    dressType: fd.get('dress-type'),
    dressStyle: document.getElementById('dress-style')?.selectedOptions[0]?.textContent || '',
    length: fd.get('length'),
    sleeves: fd.get('sleeves'),
    size: document.getElementById('size')?.selectedOptions[0]?.textContent || '',
    fabric: document.getElementById('fabric')?.selectedOptions[0]?.textContent || '',
    customMeasurements: fd.get('custom-measurements') === 'on' ? 'Yes — will visit Wailoku for fitting' : 'No',
    notes: fd.get('notes') || '',
    submittedAt: new Date().toISOString()
  };
}

function validateForm(form) {
  let valid = true;
  const requiredFields = form.querySelectorAll('[required]');
  requiredFields.forEach(field => {
    if (!field.value || (field.type === 'radio' && !form.querySelector(`input[name="${field.name}"]:checked`))) {
      if (field.type !== 'radio' || !form.querySelector(`input[name="${field.name}"]:checked`)) {
        markError(field);
        valid = false;
      }
    }
  });
  const phone = form.querySelector('#phone');
  if (phone && phone.value && phone.value.replace(/\D/g, '').length < 7) {
    markError(phone, 'Please enter a valid phone number.');
    valid = false;
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
  panel.innerHTML = `
    <h3>Thank you, ${escapeHTML(payload.name)}! 🌿</h3>
    <p><strong>Order Reference:</strong> ${escapeHTML(orderId || 'Pending')}</p>
    <p>We've received your order request for a <strong>${escapeHTML(payload.dressStyle)}</strong>.
    ${payload.email ? "A confirmation has also been sent to your email." : "Since no email was provided, please save this confirmation or take a screenshot."}</p>
    <div class="notice-box" style="margin-top:1rem;">
      A non-refundable 25% deposit (to cover materials) is required via M-PAiSA to
      <strong>Akanisi Memaofa (9999999)</strong> before production begins. We'll be in touch
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
