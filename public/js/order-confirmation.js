/* ShopNest Order Confirmation Controller */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('id');

  if (!orderId) {
    window.location.href = '/orders.html';
    return;
  }

  loadOrderConfirmation(orderId);
});

async function loadOrderConfirmation(orderId) {
  const container = document.getElementById('confirmation-view-container');
  if (!container) return;

  try {
    const data = await ShopNestAPI.request(`/orders/${orderId}`);
    const order = data.order;
    const orderNum = order.orderNumber || `#ORD-${order._id.substring(18)}`;
    const estDate = order.estimatedDeliveryDate || '3-5 Business Days';

    container.innerHTML = `
      <div style="max-width: 780px; margin: 0 auto; background: white; border-radius: 24px; padding: 48px; border: 1px solid var(--border); box-shadow: var(--shadow-md);">
        
        <!-- Header Badge -->
        <div style="text-align: center; margin-bottom: 36px;">
          <div style="width: 80px; height: 80px; border-radius: 50%; background: #DCFCE7; color: var(--success); display: inline-flex; align-items: center; justify-content: center; font-size: 40px; font-weight: 800; margin-bottom: 16px;">✓</div>
          <h1 style="font-size: 32px; font-weight: 800; color: var(--text-main); margin-bottom: 8px;">Order Placed Successfully!</h1>
          <p style="color: var(--text-muted); font-size: 16px;">Thank you for your purchase. We have received your order.</p>
        </div>

        <!-- Meta Summary Grid -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; background: #F8FAFC; border-radius: 16px; padding: 20px; border: 1px solid var(--border); margin-bottom: 32px;">
          <div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Order Number</div>
            <div style="font-size: 16px; font-weight: 800; color: var(--primary); margin-top: 4px;">${orderNum}</div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Estimated Delivery</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--success); margin-top: 4px;">🚚 ${estDate}</div>
          </div>
          <div>
            <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Payment Method</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-top: 4px;">${order.paymentMethod}</div>
          </div>
        </div>

        <!-- Shipping Address Details -->
        <div style="margin-bottom: 32px; padding: 20px; border: 1px solid var(--border); border-radius: 16px;">
          <h3 style="font-size: 16px; font-weight: 800; margin-bottom: 10px;">📦 Shipping Destination</h3>
          <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${order.shippingAddress.customerName}</div>
          <div style="font-size: 14px; color: var(--text-muted); margin: 4px 0;">${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pinCode}</div>
          <div style="font-size: 13px; font-weight: 600;">📞 Contact: ${order.shippingAddress.phone}</div>
        </div>

        <!-- Itemized Products Table -->
        <div style="margin-bottom: 36px;">
          <h3 style="font-size: 18px; font-weight: 800; margin-bottom: 16px;">Purchased Items</h3>
          <div style="display: flex; flex-direction: column; gap: 14px; border-bottom: 1px solid var(--border); padding-bottom: 20px;">
            ${order.orderItems.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 14px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 10px; border: 1px solid var(--border);">
                  <div>
                    <div style="font-size: 15px; font-weight: 700;">${item.name}</div>
                    <div style="font-size: 13px; color: var(--text-muted);">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div style="font-size: 16px; font-weight: 800;">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 20px; font-size: 20px; font-weight: 800;">
            <span>Total Paid Amount:</span>
            <span style="color: var(--primary);">$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>

        <!-- Action Buttons -->
        <div style="display: flex; gap: 14px; justify-content: center;">
          <a href="/account.html?tab=orders" class="btn btn-primary" style="padding: 14px 28px; font-size: 15px; font-weight: 700;">
            Track Order Progress →
          </a>
          <a href="/orders.html" class="btn btn-outline" style="padding: 14px 28px; font-size: 15px; font-weight: 700;">
            View All Orders
          </a>
          <a href="/index.html" class="btn btn-outline" style="padding: 14px 28px; font-size: 15px; font-weight: 700;">
            Continue Shopping
          </a>
        </div>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--danger); padding: 60px;">
        Failed to load confirmation details: ${err.message}
      </div>
    `;
  }
}
