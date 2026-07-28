/**
 * LOVE FROM ROTUMA — Order Form Backend
 * -------------------------------------
 * Deploy this as a Google Apps Script Web App (see backend/README.md).
 * It receives order submissions from order.html, logs them to a Google
 * Sheet, and sends a confirmation email to the customer (if provided)
 * plus a notification email to the shop owner.
 */

// ==== CONFIGURE THESE ====
const OWNER_EMAIL = 'WithLoveFromRotuma@gmail.com'; // where new-order notifications go
const SHEET_NAME = 'Orders';
const BUSINESS_NAME = 'Love From Rotuma';
// ==========================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const orderId = generateOrderId();

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
      'Delivery Method', 'Delivery Address', 'Dress Type', 'Dress Style',
      'Length', 'Sleeves', 'Size', 'Fabric', 'Custom Measurements', 'Notes'
    ]);
    sheet.setFrozenRows(1);
  }
  return sheet;
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
    data.dressType || '',
    data.dressStyle || '',
    data.length || '',
    data.sleeves || '',
    data.size || '',
    data.fabric || '',
    data.customMeasurements || '',
    data.notes || ''
  ]);
}

function notifyOwner(orderId, data) {
  const subject = `New Order — ${orderId} — ${data.name}`;
  const body = [
    `New order request received.`,
    ``,
    `Order ID: ${orderId}`,
    `Name: ${data.name}`,
    `Phone: ${data.phone}`,
    `Email: ${data.email || '(not provided)'}`,
    `Delivery: ${data.deliveryMethod}${data.deliveryAddress ? ' — ' + data.deliveryAddress : ''}`,
    `Dress Type: ${data.dressType}`,
    `Style: ${data.dressStyle}`,
    `Length: ${data.length}`,
    `Sleeves: ${data.sleeves}`,
    `Size: ${data.size}`,
    `Fabric: ${data.fabric}`,
    `Custom Measurements Requested: ${data.customMeasurements}`,
    `Notes: ${data.notes || '(none)'}`,
    ``,
    `Reminder: a 25% deposit via M-PAiSA is required before production begins.`
  ].join('\n');

  MailApp.sendEmail(OWNER_EMAIL, subject, body);
}

function confirmToCustomer(orderId, data) {
  const subject = `Your ${BUSINESS_NAME} Order Confirmation — ${orderId}`;
  const body = [
    `Hi ${data.name},`,
    ``,
    `Thank you for your order request with ${BUSINESS_NAME}! Here's a summary:`,
    ``,
    `Order Reference: ${orderId}`,
    `Dress Style: ${data.dressStyle}`,
    `Length: ${data.length}`,
    `Sleeves: ${data.sleeves}`,
    `Size: ${data.size}`,
    `Fabric: ${data.fabric}`,
    `Delivery: ${data.deliveryMethod}${data.deliveryAddress ? ' — ' + data.deliveryAddress : ''}`,
    ``,
    `A non-refundable 25% deposit (to cover the cost of materials) is required via`,
    `M-PAiSA to Akanisi Memaofa (9999999) before production begins.`,
    `We'll be in touch by phone or email shortly to confirm details.`,
    ``,
    `Production typically takes one week or less. If your order isn't collected or`,
    `delivered within one month and no other arrangements have been made, it will`,
    `be considered abandoned.`,
    ``,
    `Thank you for supporting handmade, Rotuman-made craftsmanship!`,
    `— ${BUSINESS_NAME}`
  ].join('\n');

  MailApp.sendEmail(data.email, subject, body);
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
        name: 'Test Customer',
        phone: '9998888',
        email: '',
        deliveryMethod: 'pickup',
        dressType: 'adult',
        dressStyle: 'A-Line Dress',
        length: 'Knee Length',
        sleeves: 'Elastic Sleeve',
        size: 'Medium',
        fabric: 'Solid — Ocean Blue',
        customMeasurements: 'No',
        notes: 'Test order'
      })
    }
  };
  Logger.log(doPost(fakeEvent).getContent());
}
