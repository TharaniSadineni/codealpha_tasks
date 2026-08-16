/* ShopNest Admin Dashboard Controller */

let allAdminProducts = [];
let allAdminOrders = [];

document.addEventListener('DOMContentLoaded', () => {
  const user = ShopNestAPI.getUser();
  if (!user || user.role !== 'admin') {
    showToast('Admin access required', 'error');
    setTimeout(() => {
      window.location.href = '/login.html';
    }, 1500);
    return;
  }

  loadAdminData();
  setupAdminForms();
});

async function loadAdminData() {
  await Promise.all([loadAdminProducts(), loadAdminOrders()]);
  updateDashboardStats();
}

async function loadAdminProducts() {
  const tableBody = document.getElementById('admin-products-tbody');
  if (!tableBody) return;

  try {
    const data = await ShopNestAPI.request('/products');
    allAdminProducts = data.products || [];

    tableBody.innerHTML = allAdminProducts.map(p => `
      <tr>
        <td>
          <img src="${p.image}" alt="${p.name}" style="width: 40px; height: 40px; object-fit: cover; border-radius: 6px;">
        </td>
        <td style="font-weight: 700;">${p.name}</td>
        <td><span style="padding: 4px 10px; background: #F1F5F9; border-radius: 9999px; font-size: 12px; font-weight: 600;">${p.category}</span></td>
        <td style="font-weight: 800; color: var(--primary);">$${p.price.toFixed(2)}</td>
        <td>${p.stock}</td>
        <td>
          <button onclick="openEditProductModal('${p._id}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; margin-right: 6px;">✏️ Edit</button>
          <button onclick="deleteProduct('${p._id}', '${p.name.replace(/'/g, "\\'")}')" class="btn btn-outline" style="padding: 6px 12px; font-size: 12px; color: var(--danger); border-color: #FCA5A5;">🗑️ Delete</button>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(`Error loading products: ${error.message}`, 'error');
  }
}

async function loadAdminOrders() {
  const tableBody = document.getElementById('admin-orders-tbody');
  if (!tableBody) return;

  try {
    const data = await ShopNestAPI.request('/orders');
    allAdminOrders = data.orders || [];

    tableBody.innerHTML = allAdminOrders.map(o => `
      <tr>
        <td style="font-weight: 700; font-size: 12px;">#${o._id}</td>
        <td>${o.shippingAddress.customerName}<br><span style="font-size: 11px; color: var(--text-muted);">${o.shippingAddress.phone}</span></td>
        <td>${o.orderItems.length} items</td>
        <td style="font-weight: 800; color: var(--primary);">$${o.totalAmount.toFixed(2)}</td>
        <td>
          <select onchange="updateOrderStatus('${o._id}', this.value)" style="padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; font-weight: 600;">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
      </tr>
    `).join('');
  } catch (error) {
    showToast(`Error loading orders: ${error.message}`, 'error');
  }
}

function updateDashboardStats() {
  const totalRevenue = allAdminOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const revenueEl = document.getElementById('stat-revenue');
  const ordersEl = document.getElementById('stat-orders');
  const productsEl = document.getElementById('stat-products');

  if (revenueEl) revenueEl.textContent = `$${totalRevenue.toFixed(2)}`;
  if (ordersEl) ordersEl.textContent = allAdminOrders.length;
  if (productsEl) productsEl.textContent = allAdminProducts.length;
}

function switchAdminTab(tab) {
  const prodSec = document.getElementById('admin-products-section');
  const orderSec = document.getElementById('admin-orders-section');
  const tabProds = document.getElementById('tab-admin-prods');
  const tabOrders = document.getElementById('tab-admin-orders');

  if (tab === 'orders') {
    prodSec.style.display = 'none';
    orderSec.style.display = 'block';
    tabProds.classList.remove('active');
    tabOrders.classList.add('active');
  } else {
    prodSec.style.display = 'block';
    orderSec.style.display = 'none';
    tabProds.classList.add('active');
    tabOrders.classList.remove('active');
  }
}

function openAddProductModal() {
  document.getElementById('modal-title').textContent = 'Add New Product';
  document.getElementById('product-form').reset();
  document.getElementById('prod-id').value = '';
  document.getElementById('product-modal').classList.add('active');
}

function openEditProductModal(id) {
  const product = allAdminProducts.find(p => p._id === id);
  if (!product) return;

  document.getElementById('modal-title').textContent = 'Edit Product';
  document.getElementById('prod-id').value = product._id;
  document.getElementById('prod-name').value = product.name;
  document.getElementById('prod-category').value = product.category;
  document.getElementById('prod-price').value = product.price;
  document.getElementById('prod-stock').value = product.stock;
  document.getElementById('prod-short').value = product.shortDescription;
  document.getElementById('prod-full').value = product.fullDescription;
  document.getElementById('prod-image').value = product.image;
  
  document.getElementById('product-modal').classList.add('active');
}

function closeModal() {
  document.getElementById('product-modal').classList.remove('active');
}

function setupAdminForms() {
  const form = document.getElementById('product-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('prod-id').value;
    const name = document.getElementById('prod-name').value.trim();
    const category = document.getElementById('prod-category').value;
    const price = parseFloat(document.getElementById('prod-price').value);
    const stock = parseInt(document.getElementById('prod-stock').value);
    const shortDescription = document.getElementById('prod-short').value.trim();
    const fullDescription = document.getElementById('prod-full').value.trim();
    const image = document.getElementById('prod-image').value.trim() || '/images/products/headphones.svg';

    const payload = { name, category, price, stock, shortDescription, fullDescription, image };

    try {
      if (id) {
        await ShopNestAPI.request(`/products/${id}`, {
          method: 'PUT',
          body: JSON.stringify(payload)
        });
        showToast('Product updated successfully!', 'success');
      } else {
        await ShopNestAPI.request('/products', {
          method: 'POST',
          body: JSON.stringify(payload)
        });
        showToast('Product added successfully!', 'success');
      }

      closeModal();
      loadAdminData();
    } catch (error) {
      showToast(error.message || 'Operation failed', 'error');
    }
  });
}

async function deleteProduct(id, name) {
  if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

  try {
    await ShopNestAPI.request(`/products/${id}`, { method: 'DELETE' });
    showToast(`Product deleted`, 'info');
    loadAdminData();
  } catch (error) {
    showToast(error.message || 'Delete failed', 'error');
  }
}

async function updateOrderStatus(orderId, newStatus) {
  try {
    await ShopNestAPI.request(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
    showToast(`Order status updated to ${newStatus}`, 'success');
  } catch (error) {
    showToast(error.message || 'Failed to update order status', 'error');
  }
}
