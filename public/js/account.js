/* ShopNest Account Dashboard Controller */

let currentUserProfile = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!ShopNestAPI.getToken()) {
    showToast('Please login to access your Account Dashboard', 'info');
    setTimeout(() => window.location.href = '/login.html', 1000);
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const activeTab = urlParams.get('tab') || 'profile';

  loadUserProfile().then(() => {
    switchAccountTab(activeTab, false);
  });

  setupFormListeners();

  window.addEventListener('popstate', () => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'profile';
    switchAccountTab(tab, false);
  });
});

async function loadUserProfile() {
  try {
    const data = await ShopNestAPI.request('/auth/me');
    currentUserProfile = data.user;
    ShopNestAPI.updateCachedUser(currentUserProfile);
    renderSidebarAndProfile(currentUserProfile);
  } catch (err) {
    console.error('Failed to load profile:', err.message);
  }
}

function renderSidebarAndProfile(user) {
  if (!user) return;
  const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

  // Sidebar
  const sidebarAvatar = document.getElementById('sidebar-avatar');
  const sidebarName = document.getElementById('sidebar-user-name');
  const sidebarEmail = document.getElementById('sidebar-user-email');
  if (sidebarAvatar) sidebarAvatar.textContent = initial;
  if (sidebarName) sidebarName.textContent = user.name;
  if (sidebarEmail) sidebarEmail.textContent = user.email;

  // Profile Tab
  const bigAvatar = document.getElementById('profile-big-avatar');
  const nameText = document.getElementById('profile-name-text');
  const emailText = document.getElementById('profile-email-text');
  const fieldName = document.getElementById('profile-field-name');
  const fieldEmail = document.getElementById('profile-field-email');
  const fieldPhone = document.getElementById('profile-field-phone');
  const roleTag = document.getElementById('profile-role-tag');

  if (bigAvatar) bigAvatar.textContent = initial;
  if (nameText) nameText.textContent = user.name;
  if (emailText) emailText.textContent = user.email;
  if (fieldName) fieldName.textContent = user.name;
  if (fieldEmail) fieldEmail.textContent = user.email;
  if (fieldPhone) fieldPhone.textContent = user.phone || 'Not provided';
  if (roleTag) roleTag.textContent = user.role === 'admin' ? 'Store Administrator' : 'Verified Customer';

  // Edit Profile Form Pre-fill
  const editName = document.getElementById('edit-name');
  const editPhone = document.getElementById('edit-phone');
  if (editName) editName.value = user.name || '';
  if (editPhone) editPhone.value = user.phone || '';
}

function switchAccountTab(tabName, updateHistory = true) {
  if (updateHistory) {
    history.pushState({ tab: tabName }, '', `?tab=${tabName}`);
  }

  const navItems = document.querySelectorAll('.account-nav-item');
  navItems.forEach(item => {
    if (item.dataset.tab === tabName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  const panes = document.querySelectorAll('.account-tab-pane');
  panes.forEach(pane => {
    pane.style.display = pane.id === `tab-content-${tabName}` ? 'block' : 'none';
  });

  // Load section data
  if (tabName === 'orders') loadAccountOrders();
  if (tabName === 'wishlist') loadAccountWishlist();
  if (tabName === 'addresses') renderAddressesGrid();
  if (tabName === 'payments') renderPaymentsGrid();
}

async function loadAccountOrders() {
  const container = document.getElementById('account-orders-list');
  if (!container) return;
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await ShopNestAPI.request('/orders/my-orders');
    const orders = data.orders || [];

    if (orders.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #F8FAFC; border-radius: 16px; border: 1px solid var(--border);">
          <div style="font-size: 48px; margin-bottom: 12px;">📦</div>
          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">No orders placed yet</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Your orders will appear here after you make a purchase.</p>
          <a href="/index.html" class="btn btn-primary" style="font-size: 13px;">Start Shopping</a>
        </div>
      `;
      return;
    }

    container.innerHTML = orders.map(order => {
      const orderNum = order.orderNumber || `#ORD-${order._id.substring(18)}`;
      const dateStr = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const statusClass = order.status === 'Delivered' ? 'status-delivered' : order.status === 'Shipped' ? 'status-shipped' : 'status-confirmed';

      return `
        <div class="order-card-wrapper">
          <div class="order-header-row">
            <div>
              <div style="font-size: 16px; font-weight: 800; color: var(--primary);">${orderNum}</div>
              <div style="font-size: 12px; color: var(--text-muted);">Placed on ${dateStr}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="status-badge ${statusClass}">● ${order.status}</span>
              <div style="font-size: 18px; font-weight: 800; color: var(--text-main);">$${order.totalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 16px;">
            ${order.orderItems.map(item => `
              <div style="display: flex; align-items: center; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${item.image}" alt="${item.name}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);">
                  <div>
                    <div style="font-size: 14px; font-weight: 700;">${item.name}</div>
                    <div style="font-size: 12px; color: var(--text-muted);">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
                  </div>
                </div>
                <div style="font-size: 14px; font-weight: 700;">$${(item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('')}
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border); font-size: 13px;">
            <div>Payment: <strong>${order.paymentMethod}</strong></div>
            <div style="display: flex; gap: 8px;">
              <a href="/order-confirmation.html?id=${order._id}" class="btn btn-outline" style="font-size: 12px; padding: 6px 12px;">View Details</a>
              <a href="/order-confirmation.html?id=${order._id}" class="btn btn-primary" style="font-size: 12px; padding: 6px 12px;">Track Order</a>
            </div>
          </div>
        </div>
      `;
    }).join('');
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger);">Failed to load orders: ${err.message}</div>`;
  }
}

async function loadAccountWishlist() {
  const container = document.getElementById('account-wishlist-preview');
  if (!container) return;
  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await ShopNestAPI.getWishlist();
    const items = data.wishlist || [];

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px; background: #F8FAFC; border-radius: 16px; border: 1px solid var(--border);">
          <div style="font-size: 48px; margin-bottom: 12px;">💔</div>
          <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">Your Wishlist is Empty</h3>
          <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Explore our catalog and click the heart icon to save products.</p>
          <a href="/index.html" class="btn btn-primary" style="font-size: 13px;">Discover Products</a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px;">
        ${items.map(product => `
          <div style="border: 1px solid var(--border); border-radius: 12px; padding: 14px; background: white; text-align: center; position: relative;">
            <button onclick="removeAccountWishlistItem(event, '${product._id}')" class="wishlist-heart-btn active" style="top: 8px; right: 8px;" title="Remove from Wishlist">♥</button>
            <img src="${product.image}" alt="${product.name}" style="width: 100px; height: 100px; object-fit: cover; border-radius: 8px; margin-bottom: 10px;">
            <h4 style="font-size: 14px; font-weight: 700; height: 38px; overflow: hidden; margin-bottom: 6px;">${product.name}</h4>
            <div style="font-size: 16px; font-weight: 800; color: var(--primary); margin-bottom: 10px;">$${product.price.toFixed(2)}</div>
            <button onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="btn btn-success" style="width: 100%; font-size: 12px; padding: 6px;">
              + Cart
            </button>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="color: var(--danger);">Failed to load wishlist preview: ${err.message}</div>`;
  }
}

async function removeAccountWishlistItem(e, productId) {
  if (e) e.stopPropagation();
  try {
    await ShopNestAPI.toggleWishlist(productId);
    showToast('Removed item from Wishlist', 'info');
    loadAccountWishlist();
  } catch (err) {
    showToast(err.message || 'Error removing item', 'error');
  }
}

function renderAddressesGrid() {
  const container = document.getElementById('account-addresses-grid');
  if (!container) return;
  const addresses = currentUserProfile ? currentUserProfile.addresses || [] : [];

  if (addresses.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #F8FAFC; border-radius: 16px; border: 1px solid var(--border);">
        <div style="font-size: 48px; margin-bottom: 12px;">🏠</div>
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">No saved addresses</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Add a delivery address to speed up your checkout process.</p>
        <button type="button" onclick="openAddressModal()" class="btn btn-primary" style="font-size: 13px;">+ Add New Address</button>
      </div>
    `;
    return;
  }

  container.innerHTML = addresses.map(addr => `
    <div class="address-card ${addr.isDefault ? 'default-address' : ''}">
      ${addr.isDefault ? '<span class="card-default-tag">DEFAULT</span>' : ''}
      <div style="font-size: 16px; font-weight: 800; margin-bottom: 4px;">${addr.label || 'Home'}</div>
      <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">${addr.customerName}</div>
      <div style="font-size: 13px; color: var(--text-muted); margin: 6px 0;">${addr.address}, ${addr.city}, ${addr.state} - ${addr.pinCode}</div>
      <div style="font-size: 13px; font-weight: 600;">📞 ${addr.phone}</div>

      <div style="display: flex; gap: 8px; margin-top: 16px; border-top: 1px solid var(--border); padding-top: 12px;">
        <button type="button" onclick="openAddressModal('${addr._id}')" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;">Edit</button>
        ${!addr.isDefault ? `<button type="button" onclick="setDefaultAddress('${addr._id}')" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px;">Set Default</button>` : ''}
        <button type="button" onclick="deleteAddress('${addr._id}')" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px; color: var(--danger);">Delete</button>
      </div>
    </div>
  `).join('');
}

function renderPaymentsGrid() {
  const container = document.getElementById('account-payments-grid');
  if (!container) return;
  const cards = currentUserProfile ? currentUserProfile.savedCards || [] : [];

  if (cards.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 40px; background: #F8FAFC; border-radius: 16px; border: 1px solid var(--border);">
        <div style="font-size: 48px; margin-bottom: 12px;">💳</div>
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 6px;">No saved payment cards</h3>
        <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 20px;">Save tokenized cards for secure 1-click test checkout.</p>
        <button type="button" onclick="openAddCardModal()" class="btn btn-primary" style="font-size: 13px;">+ Add Card</button>
      </div>
    `;
    return;
  }

  container.innerHTML = cards.map(card => `
    <div class="payment-card">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <span style="font-size: 20px; font-weight: 800; color: var(--primary);">${card.brand}</span>
        <button type="button" onclick="deleteCard('${card._id}')" class="btn btn-outline" style="font-size: 11px; padding: 4px 8px; color: var(--danger);">Remove</button>
      </div>
      <div style="font-size: 18px; font-weight: 700; letter-spacing: 2px; margin-bottom: 8px;">•••• •••• •••• ${card.last4}</div>
      <div style="display: flex; justify-content: space-between; font-size: 12px; color: var(--text-muted);">
        <span>${card.cardHolder}</span>
        <span>Expires ${card.expMonth}/${card.expYear}</span>
      </div>
    </div>
  `).join('');
}

// Modal Controllers & Form Submissions
function openEditProfileModal() {
  document.getElementById('edit-profile-modal').style.display = 'flex';
}

function openAddressModal(addressId = null) {
  const form = document.getElementById('address-form');
  form.reset();

  if (addressId && currentUserProfile && currentUserProfile.addresses) {
    const addr = currentUserProfile.addresses.find(a => a._id === addressId);
    if (addr) {
      document.getElementById('addr-id').value = addr._id;
      document.getElementById('addr-label').value = addr.label || 'Home';
      document.getElementById('addr-name').value = addr.customerName || '';
      document.getElementById('addr-phone').value = addr.phone || '';
      document.getElementById('addr-street').value = addr.address || '';
      document.getElementById('addr-city').value = addr.city || '';
      document.getElementById('addr-state').value = addr.state || '';
      document.getElementById('addr-pincode').value = addr.pinCode || '';
      document.getElementById('addr-default').checked = !!addr.isDefault;
      document.getElementById('address-modal-title').textContent = 'Edit Shipping Address';
    }
  } else {
    document.getElementById('addr-id').value = '';
    document.getElementById('address-modal-title').textContent = 'Add Shipping Address';
  }

  document.getElementById('address-modal').style.display = 'flex';
}

function openAddCardModal() {
  document.getElementById('add-card-form').reset();
  document.getElementById('add-card-modal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function setupFormListeners() {
  // Edit Profile Form
  const profileForm = document.getElementById('edit-profile-form');
  if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const name = document.getElementById('edit-name').value.trim();
        const phone = document.getElementById('edit-phone').value.trim();
        const data = await ShopNestAPI.request('/auth/profile', {
          method: 'PUT',
          body: JSON.stringify({ name, phone })
        });
        currentUserProfile = data.user;
        ShopNestAPI.updateCachedUser(data.user);
        renderSidebarAndProfile(data.user);
        closeModal('edit-profile-modal');
        showToast('Profile updated successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Update failed', 'error');
      }
    });
  }

  // Address Form (Add / Edit)
  const addrForm = document.getElementById('address-form');
  if (addrForm) {
    addrForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const id = document.getElementById('addr-id').value;
        const body = {
          label: document.getElementById('addr-label').value,
          customerName: document.getElementById('addr-name').value.trim(),
          phone: document.getElementById('addr-phone').value.trim(),
          address: document.getElementById('addr-street').value.trim(),
          city: document.getElementById('addr-city').value.trim(),
          state: document.getElementById('addr-state').value.trim(),
          pinCode: document.getElementById('addr-pincode').value.trim(),
          isDefault: document.getElementById('addr-default').checked
        };

        let data;
        if (id) {
          data = await ShopNestAPI.request(`/auth/addresses/${id}`, {
            method: 'PUT',
            body: JSON.stringify(body)
          });
        } else {
          data = await ShopNestAPI.request('/auth/addresses', {
            method: 'POST',
            body: JSON.stringify(body)
          });
        }

        currentUserProfile.addresses = data.addresses;
        ShopNestAPI.updateCachedUser(currentUserProfile);
        renderAddressesGrid();
        closeModal('address-modal');
        showToast(id ? 'Address updated successfully!' : 'Address saved successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to save address', 'error');
      }
    });
  }

  // Card Form
  const cardForm = document.getElementById('add-card-form');
  if (cardForm) {
    cardForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const body = {
          cardHolder: document.getElementById('card-name').value.trim(),
          cardNumber: document.getElementById('card-number').value.trim(),
          expMonth: document.getElementById('card-month').value.trim(),
          expYear: document.getElementById('card-year').value.trim()
        };
        const data = await ShopNestAPI.request('/auth/payment-methods', {
          method: 'POST',
          body: JSON.stringify(body)
        });
        currentUserProfile.savedCards = data.savedCards;
        ShopNestAPI.updateCachedUser(currentUserProfile);
        renderPaymentsGrid();
        closeModal('add-card-modal');
        showToast('Card saved securely!', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to save card', 'error');
      }
    });
  }

  // Password Form
  const passForm = document.getElementById('settings-password-form');
  if (passForm) {
    passForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        const currentPassword = document.getElementById('curr-pass').value;
        const newPassword = document.getElementById('new-pass').value;
        await ShopNestAPI.request('/auth/password', {
          method: 'PUT',
          body: JSON.stringify({ currentPassword, newPassword })
        });
        passForm.reset();
        showToast('Password updated successfully!', 'success');
      } catch (err) {
        showToast(err.message || 'Password update failed', 'error');
      }
    });
  }
}

async function setDefaultAddress(id) {
  try {
    const data = await ShopNestAPI.request(`/auth/addresses/${id}/default`, { method: 'PUT' });
    currentUserProfile.addresses = data.addresses;
    ShopNestAPI.updateCachedUser(currentUserProfile);
    renderAddressesGrid();
    showToast('Default address updated', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to set default address', 'error');
  }
}

async function deleteAddress(id) {
  try {
    const data = await ShopNestAPI.request(`/auth/addresses/${id}`, { method: 'DELETE' });
    currentUserProfile.addresses = data.addresses;
    ShopNestAPI.updateCachedUser(currentUserProfile);
    renderAddressesGrid();
    showToast('Address deleted', 'info');
  } catch (err) {
    showToast(err.message || 'Failed to delete address', 'error');
  }
}

async function deleteCard(id) {
  try {
    const data = await ShopNestAPI.request(`/auth/payment-methods/${id}`, { method: 'DELETE' });
    currentUserProfile.savedCards = data.savedCards;
    ShopNestAPI.updateCachedUser(currentUserProfile);
    renderPaymentsGrid();
    showToast('Card removed', 'info');
  } catch (err) {
    showToast(err.message || 'Failed to remove card', 'error');
  }
}
