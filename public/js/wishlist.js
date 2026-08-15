/* ShopNest Wishlist Controller */

document.addEventListener('DOMContentLoaded', () => {
  if (!ShopNestAPI.getToken()) {
    showToast('Please login to view your Wishlist', 'info');
    setTimeout(() => window.location.href = '/login.html', 1000);
    return;
  }
  loadWishlistPage();
});

async function loadWishlistPage() {
  const container = document.getElementById('wishlist-container');
  const subtitle = document.getElementById('wishlist-subtitle');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await ShopNestAPI.getWishlist();
    const items = data.wishlist || [];

    if (subtitle) {
      subtitle.textContent = items.length === 1 ? '1 saved item' : `${items.length} saved items`;
    }

    if (items.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 70px 20px; background: white; border-radius: 20px; border: 1px solid var(--border); box-shadow: var(--shadow-sm); max-width: 540px; margin: 0 auto;">
          <div style="font-size: 64px; margin-bottom: 16px;">💔</div>
          <h2 style="font-size: 24px; font-weight: 800; margin-bottom: 8px;">Your wishlist is empty</h2>
          <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 28px;">Save products you love and find them here later.</p>
          <a href="/index.html" class="btn btn-primary" style="padding: 14px 32px; border-radius: var(--radius-full); font-weight: 700;">
            Continue Shopping →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="products-grid">
        ${items.map(product => `
          <div class="product-card">
            <div class="product-image-wrap">
              <button onclick="removeWishlistItem(event, '${product._id}')" class="wishlist-heart-btn active" title="Remove from Wishlist">
                ♥
              </button>
              <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
              <div class="product-category">${product.category}</div>
              <h3 class="product-name">${product.name}</h3>
              <div class="product-meta">
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-rating">★ ${product.rating ? product.rating.toFixed(1) : '4.5'}</div>
              </div>
              <div class="product-actions" style="margin-top: 16px;">
                <a href="/product.html?id=${product._id}" class="btn btn-outline" style="font-size: 13px;">View Details</a>
                <button onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" class="btn btn-success" style="font-size: 13px;">
                  + Cart
                </button>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<div style="text-align: center; color: var(--danger); padding: 40px;">Failed to load wishlist: ${err.message}</div>`;
  }
}

async function removeWishlistItem(e, productId) {
  if (e) e.stopPropagation();
  try {
    await ShopNestAPI.toggleWishlist(productId);
    showToast('Removed item from Wishlist', 'info');
    loadWishlistPage();
  } catch (err) {
    showToast(err.message || 'Error removing item', 'error');
  }
}
