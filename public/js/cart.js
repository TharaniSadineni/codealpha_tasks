/* ShopNest Cart Controller */

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
});

function renderCart() {
  const container = document.getElementById('cart-page-content');
  if (!container) return;

  const cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 80px 20px; background: white; border-radius: 20px; border: 1px solid var(--border); margin: 40px 0;">
        <div style="font-size: 64px; margin-bottom: 16px;">🛒</div>
        <h2 style="font-size: 28px; font-weight: 800; margin-bottom: 12px;">Your Cart is Empty</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">Looks like you haven't added any products to your shopping cart yet.</p>
        <a href="/index.html" class="btn btn-primary" style="padding: 14px 28px; font-size: 16px;">Explore Products</a>
      </div>
    `;
    return;
  }

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 50 ? 0 : 9.99;
  const total = subtotal + shipping;

  container.innerHTML = `
    <div class="cart-layout">
      <div>
        <table class="cart-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            ${cart.map((item, index) => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 16px;">
                    <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                    <div>
                      <a href="/product.html?id=${item.product}" style="font-weight: 700; color: var(--text-main); font-size: 15px;">${item.name}</a>
                    </div>
                  </div>
                </td>
                <td style="font-weight: 600;">$${item.price.toFixed(2)}</td>
                <td>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <button onclick="updateCartQty(${index}, -1)" class="qty-btn" style="width: 28px; height: 28px; font-size: 14px;">-</button>
                    <span style="font-weight: 700; width: 24px; text-align: center;">${item.quantity}</span>
                    <button onclick="updateCartQty(${index}, 1)" class="qty-btn" style="width: 28px; height: 28px; font-size: 14px;">+</button>
                  </div>
                </td>
                <td style="font-weight: 800; color: var(--primary);">$${(item.price * item.quantity).toFixed(2)}</td>
                <td>
                  <button onclick="removeFromCart(${index})" style="color: var(--danger); background: none; font-size: 18px; padding: 4px;" title="Remove Item">🗑️</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div>
        <div class="cart-summary">
          <h3 style="font-size: 20px; font-weight: 800; margin-bottom: 20px;">Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal</span>
            <span style="font-weight: 700;">$${subtotal.toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span style="font-weight: 700; color: ${shipping === 0 ? 'var(--success)' : 'inherit'};">
              ${shipping === 0 ? 'FREE' : '$' + shipping.toFixed(2)}
            </span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
          </div>
          <a href="/checkout.html" class="btn btn-primary" style="width: 100%; padding: 14px; margin-top: 20px; font-size: 16px;">
            Proceed to Checkout →
          </a>
        </div>
      </div>
    </div>
  `;
}

function updateCartQty(index, change) {
  let cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
  if (cart[index]) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    localStorage.setItem('shopnest_cart', JSON.stringify(cart));
    updateCartCounter();
    renderCart();
  }
}

function removeFromCart(index) {
  let cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
  if (cart[index]) {
    showToast(`Removed "${cart[index].name}" from cart`, 'info');
    cart.splice(index, 1);
    localStorage.setItem('shopnest_cart', JSON.stringify(cart));
    updateCartCounter();
    renderCart();
  }
}
