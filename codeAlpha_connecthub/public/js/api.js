/**
 * ConnectHub API Helper Module
 */

const API_BASE = '/api';

// Auth State Token Management
const API = {
  getToken() {
    return localStorage.getItem('connecthub_token');
  },

  setToken(token) {
    localStorage.setItem('connecthub_token', token);
  },

  removeToken() {
    localStorage.removeItem('connecthub_token');
    localStorage.removeItem('connecthub_user');
  },

  getCurrentUser() {
    const userStr = localStorage.getItem('connecthub_user');
    return userStr ? JSON.parse(userStr) : null;
  },

  setCurrentUser(user) {
    localStorage.setItem('connecthub_user', JSON.stringify(user));
  },

  // Generic Request Helper (Defensive against both options object or (endpoint, method, body) signatures)
  async request(endpoint, options = {}) {
    let config = {};
    if (typeof options === 'string') {
      const method = options;
      const bodyData = arguments[2];
      config = {
        method: method,
        body: typeof bodyData === 'object' && !(bodyData instanceof FormData) ? JSON.stringify(bodyData) : bodyData
      };
    } else {
      config = { ...options };
    }

    const headers = config.headers || {};
    const token = this.getToken();

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!(config.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    config.headers = headers;

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      return data;
    } catch (err) {
      console.error(`[API Error] ${endpoint}:`, err.message);
      throw err;
    }
  },

  // Auth APIs
  async register(formData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: formData
    });
  },

  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async forgotPassword(email) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  },

  async resetPassword(token, newPassword) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  },

  async getMe() {
    return this.request('/auth/me');
  },

  // User APIs
  async getUsers() {
    return this.request('/users');
  },

  async getUserByUsername(username, authUserId = '') {
    return this.request(`/users/by-username/${username}?authUserId=${authUserId}`);
  },

  async updateProfile(formData) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: formData
    });
  },

  // Follow APIs
  async followUser(targetUserId) {
    return this.request(`/followers/follow/${targetUserId}`, { method: 'POST' });
  },

  async unfollowUser(targetUserId) {
    return this.request(`/followers/unfollow/${targetUserId}`, { method: 'POST' });
  },

  async getFollowers(userId) {
    return this.request(`/followers/user/${userId}/followers`);
  },

  async getFollowing(userId) {
    return this.request(`/followers/user/${userId}/following`);
  },

  // Post APIs
  async getPosts() {
    return this.request('/posts');
  },

  async getUserPosts(userId) {
    return this.request(`/posts/user/${userId}`);
  },

  async getPostById(id) {
    return this.request(`/posts/${id}`);
  },

  async createPost(formData) {
    return this.request('/posts', {
      method: 'POST',
      body: formData
    });
  },

  async updatePost(id, formData) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: formData
    });
  },

  async deletePost(id) {
    return this.request(`/posts/${id}`, { method: 'DELETE' });
  },

  async toggleLike(postId) {
    return this.request(`/posts/${postId}/like`, { method: 'POST' });
  },

  // Comment APIs
  async getComments(postId) {
    return this.request(`/comments/post/${postId}`);
  },

  async addComment(postId, text) {
    return this.request(`/comments/post/${postId}`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  },

  async deleteComment(commentId) {
    return this.request(`/comments/${commentId}`, { method: 'DELETE' });
  },

  // Utilities
  formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now - date) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffSeconds < 604800) return `${Math.floor(diffSeconds / 86400)}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  showToast(message, type = 'info') {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${message}</span>`;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
};
