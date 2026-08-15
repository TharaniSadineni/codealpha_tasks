/* ShopNest API & Utility Wrapper */

const API_BASE_URL = '/api';

const ShopNestAPI = {
  // Get stored JWT token
  getToken() {
    return localStorage.getItem('shopnest_token');
  },

  // Set JWT token & user object
  setAuth(token, user) {
    localStorage.setItem('shopnest_token', token);
    localStorage.setItem('shopnest_user', JSON.stringify(user));
  },

  // Update cached user object
  updateCachedUser(user) {
    const current = this.getUser() || {};
    const updated = { ...current, ...user };
    localStorage.setItem('shopnest_user', JSON.stringify(updated));
  },

  // Clear auth on logout
  logout() {
    localStorage.removeItem('shopnest_token');
    localStorage.removeItem('shopnest_user');
    window.location.href = '/login.html';
  },

  // Get logged in user
  getUser() {
    const userStr = localStorage.getItem('shopnest_user');
    try {
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  // Central fetch wrapper with authorization headers
  async request(endpoint, options = {}) {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error.message);
      throw error;
    }
  },

  // Wishlist Helpers
  async toggleWishlist(productId) {
    if (!this.getToken()) {
      window.location.href = '/login.html';
      return;
    }
    const data = await this.request('/auth/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId })
    });
    // Update local cache
    const user = this.getUser();
    if (user) {
      if (data.isWishlisted) {
        user.wishlist = user.wishlist || [];
        if (!user.wishlist.includes(productId)) user.wishlist.push(productId);
      } else {
        user.wishlist = (user.wishlist || []).filter(id => (typeof id === 'object' ? id._id : id) !== productId);
      }
      this.updateCachedUser(user);
    }
    return data;
  },

  async getWishlist() {
    if (!this.getToken()) return { wishlist: [] };
    return await this.request('/auth/wishlist');
  }
};

// Global Toast Notification Helper
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span> <span>${message}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
