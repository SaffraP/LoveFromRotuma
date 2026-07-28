// Shared footer — edit once here, updates on every page.
document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('site-footer-placeholder');
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-grid">
        <div>
          <h4>Love From Rotuma</h4>
          <p style="opacity:0.85; max-width:26ch;">Handmade dresses crafted with care by Rotuman women in Fiji.</p>
        </div>
        <div>
          <h4>Contact</h4>
          <ul class="stack-lg" style="gap:0.5rem;">
            <li style="opacity:0.85;">+679-934-6552</li>
            <li style="opacity:0.85;">WithLoveFromRotuma@gmail.com</li>
            <li style="opacity:0.85;">Lot 2 Kia St, Wailoku, Suva, Fiji</li>
          </ul>
        </div>
        <div>
          <h4>Shop</h4>
          <ul class="stack-lg" style="gap:0.5rem;">
            <li><a href="dresses.html">Made-to-Order Dresses</a></li>
            <li><a href="premade.html">Premade Dresses</a></li>
            <li><a href="plants.html">Plants</a></li>
          </ul>
        </div>
        <div>
          <h4>Company</h4>
          <ul class="stack-lg" style="gap:0.5rem;">
            <li><a href="about.html">About</a></li>
            <li><a href="faq.html">FAQ</a></li>
            <li><a href="contact.html">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4>Legal</h4>
          <ul class="stack-lg" style="gap:0.5rem;">
            <li><a href="terms.html">Terms &amp; Conditions</a></li>
            <li><a href="privacy.html">Privacy Policy</a></li>
          </ul>
        </div>
        <div>
          <h4>Follow Along</h4>
          <ul class="stack-lg" style="gap:0.5rem;">
            <li style="opacity:0.7;">Facebook — coming soon</li>
            <li style="opacity:0.7;">Instagram — coming soon</li>
            <li style="opacity:0.7;">TikTok — coming soon</li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>&copy; ${new Date().getFullYear()} Love From Rotuma. All rights reserved.</span>
        <span>Prices shown in Fijian Dollars (FJD).</span>
      </div>
    </div>
  `;
});
