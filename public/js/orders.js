/* ShopNest Orders Page Controller */

document.addEventListener('DOMContentLoaded', () => {
  const user = ShopNestAPI.getUser();
  if (!user) {
    window.location.href = '/login.html?redirect=orders';
    return;
  }

  loadMyOrders();
});

async function loadMyOrders() {
  const container = document.getElementById('orders-list-container');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await ShopNestAPI.request('/orders/my-orders');
    const orders = data.orders;

    if (!orders || orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px solid var(--border);">
          <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">No Orders Placed Yet</h3>
          <p style="color: var(--text-muted); margin-bottom: 20px;">Start shopping to view your past purchases here.</p>
          <a href="/index.html" class="btn btn-primary">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; color: var(--danger); padding: 40px; background: white; border-radius: 16px;">
        Failed to load orders: ${error.message}
      </div>
    `;
  }
}

function renderOrderCard(order) {
  const statusColors = {
    'Pending': 'background: #FEF3C7; color: #D97706;',
    'Processing': 'background: #DBEAFE; color: #1D4ED8;',
    'Shipped': 'background: #E0E7FF; color: #4338CA;',
    'Delivered': 'background: #DCFCE7; color: #15803D;',
    'Cancelled': 'background: #FEE2E2; color: #DC2626;'
  };

  const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
    <div style="background: white; border-radius: 16px; border: 1px solid var(--border); padding: 24px; margin-bottom: 24px; box-shadow: var(--shadow-sm);">
      <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase;">Order ID:</span>
          <span style="font-weight: 800; color: var(--text-main); margin-left: 6px;">#${order._id}</span>
          <div style="font-size: 13px; color: var(--text-muted); margin-top: 4px;">Placed on ${formattedDate}</div>
        </div>
        <div>
          <span style="padding: 6px 14px; border-radius: 9999px; font-size: 12px; font-weight: 800; ${statusColors[order.status] || ''}">
            ${order.status}
          </span>
        </div>
      </div>

      <div style="margin-bottom: 20px;">
        ${order.orderItems.map(item => `
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
              <div>
                <div style="font-weight: 700; font-size: 15px;">${item.name}</div>
                <div style="font-size: 13px; color: var(--text-muted);">$${item.price.toFixed(2)} x ${item.quantity}</div>
              </div>
            </div>
            <div style="font-weight: 700; font-size: 15px;">$${(item.price * item.quantity).toFixed(2)}</div>
          </div>
        `).join('')}
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed var(--border); padding-top: 16px; font-size: 14px;">
        <div>
          <span style="color: var(--text-muted);">Payment:</span> 
          <span style="font-weight: 600;">${order.paymentMethod}</span>
        </div>
        <div>
          <span style="font-size: 15px; color: var(--text-muted);">Total Amount:</span>
          <span style="font-size: 20px; font-weight: 800; color: var(--primary); margin-left: 8px;">$${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>
    </div>
  `;
}
