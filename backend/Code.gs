/**
 * LOVE FROM ROTUMA — Order Form Backend
 * -------------------------------------
 * Deploy this as a Google Apps Script Web App (see backend/README.md).
 * Receives order submissions from order.html (both custom multi-dress
 * orders and premade dress requests), logs them to a Google Sheet, and
 * sends a confirmation email to the customer (if provided) plus a
 * notification email to the shop owner.
 */

// ==== CONFIGURE THESE ====
const OWNER_EMAIL = 'WithLoveFromRotuma@gmail.com'; // where new-order notifications go
const SHEET_NAME = 'Orders';
const BUSINESS_NAME = 'Love From Rotuma';
// ==========================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const orderId = data.orderId || generateOrderId();

    logOrderToSheet(orderId, data);
    notifyOwner(orderId, data);
    if (data.email) {
      confirmToCustomer(orderId, data);
    }

    return jsonResponse({ success: true, orderId: orderId });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function generateOrderId() {
  const now = new Date();
  const stamp = Utilities.formatDate(now, Session.getScriptTimeZone(), 'yyMMdd-HHmmss');
  return 'LFR-' + stamp;
}

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow([
      'Order ID', 'Submitted At', 'Name', 'Phone', 'Email',
      'Delivery Method', 'Delivery Address', 'Order Type',
      'Dress Summary', 'Notes'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/** Builds a single readable summary line/cell covering one or more dresses, or a premade item. */
function buildDressSummary(data) {
  if (data.orderType === 'premade' && data.premadeItem) {
    const p = data.premadeItem;
    return `PREMADE — ${p.name} (Ref: ${p.id}, Size: ${p.size}, FJD $${p.price})`;
  }
  if (Array.isArray(data.dressItems) && data.dressItems.length) {
    return data.dressItems.map((item, idx) =>
      `Dress ${idx + 1}: ${item.dressType} — ${item.dressStyle}, ${item.length}, ${item.sleeves}, Size: ${item.size}, Fabric: ${item.fabric}, Custom Measurements: ${item.customMeasurements}`
    ).join(' | ');
  }
  return '(no dress details provided)';
}

function logOrderToSheet(orderId, data) {
  getSheet().appendRow([
    orderId,
    new Date(),
    data.name || '',
    data.phone || '',
    data.email || '',
    data.deliveryMethod || '',
    data.deliveryAddress || '',
    data.orderType || 'custom',
    buildDressSummary(data),
    data.notes || ''
  ]);
}

function notifyOwner(orderId, data) {
  const isPremade = data.orderType === 'premade';
  const subject = `New ${isPremade ? 'Premade' : 'Custom'} Order — ${orderId} — ${data.name}`;

  const lines = [
    `New order request received.`,
    ``,
    `Order ID: ${orderId}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || '(not provided)'}`,
    `Delivery: ${data.deliveryMethod}${data.deliveryAddress ? ' — ' + data.deliveryAddress : ''}`,
    ``
  ];

  if (isPremade && data.premadeItem) {
    const p = data.premadeItem;
    lines.push(
      `PREMADE DRESS REQUEST`,
      `Item: ${p.name}`,
      `Reference: ${p.id}`,
      `Size: ${p.size}`,
      `Price: FJD $${p.price}`,
      ``,
      `⚠️ ACTION NEEDED: once the deposit is received and the dress is confirmed sold,`,
      `edit data/premade.json in the GitHub repo and set this item's "status" to "sold".`
    );
  } else if (Array.isArray(data.dressItems)) {
    lines.push(`DRESSES ORDERED (${data.dressItems.length}):`);
    data.dressItems.forEach((item, idx) => {
      lines.push(
        ``,
        `— Dress ${idx + 1} —`,
        `Type: ${item.dressType}`,
        `Style: ${item.dressStyle}`,
        `Length: ${item.length}`,
        `Sleeves: ${item.sleeves}`,
        `Size: ${item.size}`,
        `Fabric: ${item.fabric}`,
        `Custom Measurements Requested: ${item.customMeasurements}`
      );
    });
  }

  lines.push(
    ``,
    `Notes: ${data.notes || '(none)'}`,
    ``,
    `Reminder: a 25% deposit via M-PAiSA is required before production begins.`
  );

  MailApp.sendEmail(OWNER_EMAIL, subject, lines.join('\n'));
}

function confirmToCustomer(orderId, data) {
  const isPremade = data.orderType === 'premade';
  const subject = `Your ${BUSINESS_NAME} Order Confirmation — ${orderId}`;

  const lines = [
    `Hi ${data.name},`,
    ``,
    `Thank you for your order request with ${BUSINESS_NAME}! Here's a summary:`,
    ``,
    `Order Reference: ${orderId}`,
    ``
  ];

  if (isPremade && data.premadeItem) {
    const p = data.premadeItem;
    lines.push(`Premade Dress: ${p.name} (Size ${p.size}, FJD $${p.price})`, ``);
  } else if (Array.isArray(data.dressItems)) {
    data.dressItems.forEach((item, idx) => {
      lines.push(
        `Dress ${idx + 1}: ${item.dressType === 'child' ? "Kids'" : 'Adult'} ${item.dressStyle}`,
        `  Length: ${item.length} | Sleeves: ${item.sleeves} | Size: ${item.size} | Fabric: ${item.fabric}`,
        ``
      );
    });
  }

  lines.push(
    `Delivery: ${data.deliveryMethod}${data.deliveryAddress ? ' — ' + data.deliveryAddress : ''}`,
    ``,
    `A non-refundable 25% deposit (to cover the cost of materials) is required via`,
    `M-PAiSA to Akanisi Memaofa (+679-934-6552) before production begins.`,
    `We'll be in touch by phone or email shortly to confirm details.`,
    ``,
    `Production typically takes one week or less. If your order isn't collected or`,
    `delivered within one month and no other arrangements have been made, it will`,
    `be considered abandoned.`,
    ``,
    `Thank you for supporting handmade, Rotuman-made craftsmanship!`,
    `— ${BUSINESS_NAME}`
  );

  MailApp.sendEmail(data.email, subject, lines.join('\n'));
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Optional: quick manual test from the Apps Script editor. */
function testDoPost() {
  const fakeEvent = {
    postData: {
      contents: JSON.stringify({
        orderId: 'LFR-TEST',
        name: 'Test Customer',
        phone: '9998888',
        email: '',
        deliveryMethod: 'pickup',
        orderType: 'custom',
        dressItems: [
          { dressType: 'adult', dressStyle: 'A-Line Dress', length: 'Knee Length', sleeves: 'Elastic Sleeve', size: 'Medium', fabric: 'Solid — Ocean Blue', customMeasurements: 'No' },
          { dressType: 'child', dressStyle: 'A-Line Dress', length: 'Knee Length', sleeves: 'Elastic Sleeve', size: '6-7 yrs', fabric: 'Solid — Ocean Blue', customMeasurements: 'No' }
        ],
        notes: 'Test order — matching set'
      })
    }
  };
  Logger.log(doPost(fakeEvent).getContent());
}
