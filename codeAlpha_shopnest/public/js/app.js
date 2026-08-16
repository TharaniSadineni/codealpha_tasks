/* ShopNest Application Core UI Controller */

document.addEventListener('DOMContentLoaded', () => {
  updateCartCounter();
  updateWishlistCounter();
  renderUserNav();
  setupSearchHandler();
  setupOutsideDropdownClose();
});

// Update cart badge counter from localStorage
function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  });
}

// Update wishlist badge counter
function updateWishlistCounter() {
  const user = ShopNestAPI.getUser();
  const count = user && user.wishlist ? user.wishlist.length : 0;
  
  const badges = document.querySelectorAll('.wishlist-badge');
  badges.forEach(badge => {
    badge.textContent = count;
    badge.style.display = count > 0 ? 'inline-flex' : 'none';
  });
}

// Render dynamic user login/profile & dropdown menu in header
function renderUserNav() {
  const navActions = document.getElementById('nav-user-actions');
  if (!navActions) return;

  const user = ShopNestAPI.getUser();
  const wishlistCount = user && user.wishlist ? user.wishlist.length : 0;
  const adminLink = user && user.role === 'admin' ? `<a href="/admin.html" class="nav-btn nav-btn-secondary">⚙️ Admin</a>` : '';

  if (user) {
    const initial = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    navActions.innerHTML = `
      <a href="/index.html" class="nav-btn nav-btn-secondary">🏠 Home</a>
      <a href="/index.html#catalog" class="nav-btn nav-btn-secondary">🛍️ Shop</a>
      <a href="/wishlist.html" class="nav-btn nav-btn-secondary" title="My Wishlist">
        💖 Wishlist <span class="wishlist-badge dropdown-badge" style="${wishlistCount > 0 ? '' : 'display:none;'}">${wishlistCount}</span>
      </a>
      ${adminLink}

      <!-- Profile Dropdown Wrap for My Account -->
      <div class="profile-dropdown-wrap">
        <button onclick="toggleProfileDropdown(event)" class="user-avatar-btn" title="Account Menu">
          <span class="avatar-circle-badge">${initial}</span>
          <span style="font-size: 13px; white-space: nowrap; font-weight: 700;">My Account ▾</span>
        </button>

        <div id="profile-dropdown-menu" class="profile-dropdown-menu">
          <div class="dropdown-header">
            <div class="dropdown-header-avatar">${initial}</div>
            <div class="dropdown-header-info">
              <h4>${user.name}</h4>
              <p>${user.email}</p>
            </div>
          </div>
          <a href="/account.html" class="dropdown-item">👤 My Account Overview</a>
          <a href="/orders.html" class="dropdown-item">📦 My Orders</a>
          <a href="/wishlist.html" class="dropdown-item">
            <span>💖 My Wishlist</span>
            <span class="dropdown-badge wishlist-badge" style="${wishlistCount > 0 ? '' : 'display:none;'}">${wishlistCount}</span>
          </a>
          <a href="/account.html?tab=addresses" class="dropdown-item">🏠 Saved Addresses</a>
          <a href="/account.html?tab=payments" class="dropdown-item">💳 Payment Methods</a>
          <a href="/account.html?tab=settings" class="dropdown-item">⚙️ Settings</a>
          <div style="border-top: 1px solid var(--border); margin: 6px 0;"></div>
          <a href="javascript:void(0)" onclick="ShopNestAPI.logout()" class="dropdown-item dropdown-item-danger">🚪 Logout</a>
        </div>
      </div>
    `;
  } else {
    navActions.innerHTML = `
      <a href="/index.html" class="nav-btn nav-btn-secondary">🏠 Home</a>
      <a href="/index.html#catalog" class="nav-btn nav-btn-secondary">🛍️ Shop</a>
      <a href="/wishlist.html" class="nav-btn nav-btn-secondary" title="My Wishlist">💖 Wishlist</a>
      <a href="/login.html" class="nav-btn nav-btn-secondary">Login</a>
      <a href="/login.html?tab=register" class="nav-btn nav-btn-primary">Register</a>
    `;
  }

  updateWishlistCounter();
}

// Toggle Profile Dropdown
function toggleProfileDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('profile-dropdown-menu');
  if (dropdown) {
    dropdown.classList.toggle('show');
  }
}

// Close dropdown on click outside
function setupOutsideDropdownClose() {
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profile-dropdown-menu');
    const avatarBtn = document.querySelector('.user-avatar-btn');
    if (dropdown && dropdown.classList.contains('show')) {
      if (!dropdown.contains(e.target) && (!avatarBtn || !avatarBtn.contains(e.target))) {
        dropdown.classList.remove('show');
      }
    }
  });
}

// Wishlist toggle handler for product cards
async function toggleWishlistCard(e, productId) {
  if (e) e.stopPropagation();
  const btn = e.currentTarget || e.target;
  
  if (!ShopNestAPI.getToken()) {
    showToast('Please login to save items to your Wishlist!', 'info');
    setTimeout(() => window.location.href = '/login.html', 1000);
    return;
  }

  try {
    const res = await ShopNestAPI.toggleWishlist(productId);
    if (res.isWishlisted) {
      btn.classList.add('active');
      btn.innerHTML = '♥';
      showToast(res.message || 'Saved to Wishlist!', 'success');
    } else {
      btn.classList.remove('active');
      btn.innerHTML = '♡';
      showToast(res.message || 'Removed from Wishlist', 'info');
    }
    updateWishlistCounter();
    renderUserNav();
  } catch (err) {
    showToast(err.message || 'Failed to update wishlist', 'error');
  }
}

// Search bar input handling
function setupSearchHandler() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        window.location.href = `/index.html?search=${encodeURIComponent(query)}#catalog`;
      }
    }
  });
}

// Cart Helper Functions
function addToCart(productId, name, price, image, quantity = 1) {
  let cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
  const existingIndex = cart.findIndex(item => item.product === productId);

  if (existingIndex > -1) {
    cart[existingIndex].quantity += quantity;
  } else {
    cart.push({ product: productId, name, price, image, quantity });
  }

  localStorage.setItem('shopnest_cart', JSON.stringify(cart));
  updateCartCounter();
  showToast(`Added "${name}" to your cart!`, 'success');
}
