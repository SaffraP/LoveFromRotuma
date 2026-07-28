# Order Form Backend Setup (Google Apps Script)

This connects the order form to:
1. A Google Sheet that logs every order (so nothing is lost, and it's searchable).
2. An email confirmation sent to the customer (if they gave an email).
3. An email notification sent to Akanisi for every new order.
4. An on-screen confirmation shown to every customer regardless of email.

No paid services are required.

## Step-by-step setup

1. **Create a Google Sheet.**
   Go to sheets.google.com → Blank spreadsheet → name it `Love From Rotuma Orders`.

2. **Open the script editor.**
   In the Sheet: `Extensions → Apps Script`.

3. **Paste the code.**
   Delete the default `Code.gs` content and paste in the contents of `backend/Code.gs` from this project.

4. **Set the owner email.**
   At the top of the script, change:
   ```
   const OWNER_EMAIL = 'REPLACE_WITH_AKANISI_GMAIL@gmail.com';
   ```
   to Akanisi's real Gmail address.

5. **Deploy as a Web App.**
   - Click **Deploy → New deployment**.
   - Click the gear icon next to "Select type" → choose **Web app**.
   - Description: `Order form handler v1`.
   - **Execute as:** Me (your Google account).
   - **Who has access:** Anyone.
   - Click **Deploy**.
   - Authorize the script when prompted (click through the "Google hasn't verified this app" warning — this is expected for personal scripts; click **Advanced → Go to (project name)**).
   - Copy the **Web app URL** it gives you (ends in `/exec`).

6. **Connect it to the website.**
   Open `js/order-form.js` and replace:
   ```js
   const APPS_SCRIPT_URL = 'REPLACE_WITH_YOUR_APPS_SCRIPT_WEB_APP_URL';
   ```
   with the URL you just copied.

7. **Test it.**
   Open `order.html` in a browser (or the live site once deployed), submit a test order with your own email, and confirm:
   - A row appears in the `Orders` tab of the Sheet.
   - You receive a confirmation email.
   - Akanisi's inbox receives a notification email.

## Updating later

Any time you edit `Code.gs` in the Apps Script editor, you must create a **new deployment version** for changes to take effect:
`Deploy → Manage deployments → Edit (pencil icon) → New version → Deploy`.

## Notes

- The customer's on-screen confirmation always appears, even without an email address — this satisfies the requirement that every customer sees a confirmation.
- If a customer doesn't provide an email, only the owner notification email is sent; the Sheet still logs the order either way.
- If you'd like Akanisi to receive orders via WhatsApp/Messenger instead of or in addition to email, that requires a paid API (e.g., Twilio for WhatsApp) — not recommended for v1 given the "free hosting" goal. Email is the simplest and safest starting point.
