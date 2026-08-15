/* ShopNest Catalog & Product Grid Controller */

let currentCategory = 'All';
let currentSort = 'newest';
let currentSearch = '';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('category')) {
    currentCategory = urlParams.get('category');
  }
  if (urlParams.has('search')) {
    currentSearch = urlParams.get('search');
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = currentSearch;
  }

  setupFilterListeners();
  loadProducts();
});

function setupFilterListeners() {
  const pills = document.querySelectorAll('.pill-btn');
  pills.forEach(pill => {
    if (pill.dataset.category === currentCategory) {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
    }
    pill.addEventListener('click', () => {
      pills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentCategory = pill.dataset.category;
      loadProducts();
    });
  });

  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      currentSort = e.target.value;
      loadProducts();
    });
  }
}

async function loadProducts() {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = '<div class="spinner"></div>';

  try {
    let query = `?category=${encodeURIComponent(currentCategory)}&sort=${currentSort}`;
    if (currentSearch) {
      query += `&search=${encodeURIComponent(currentSearch)}`;
    }

    const data = await ShopNestAPI.request(`/products${query}`);
    const products = data.products;

    if (!products || products.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: white; border-radius: 16px; border: 1px solid var(--border);">
          <div style="font-size: 48px; margin-bottom: 12px;">🔍</div>
          <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">No Products Found</h3>
          <p style="color: var(--text-muted);">Try adjusting your category filter or search keywords.</p>
        </div>
      `;
      return;
    }

    const user = ShopNestAPI.getUser();
    const wishlistedIds = user && user.wishlist ? user.wishlist.map(w => typeof w === 'object' ? w._id : w) : [];

    grid.innerHTML = products.map(product => renderProductCard(product, wishlistedIds.includes(product._id))).join('');
  } catch (error) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; color: var(--danger); padding: 40px;">
        Failed to load products. ${error.message}
      </div>
    `;
  }
}

function renderProductCard(product, isWishlisted = false) {
  const stockBadgeClass = product.stock > 10 ? 'badge-in-stock' : product.stock > 0 ? 'badge-low-stock' : 'badge-out-stock';
  const stockBadgeText = product.stock > 10 ? 'In Stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of Stock';

  return `
    <div class="product-card">
      <div class="product-image-wrap">
        <span class="stock-badge ${stockBadgeClass}">${stockBadgeText}</span>
        <button onclick="toggleWishlistCard(event, '${product._id}')" 
                class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" 
                title="${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="product-info">
        <div class="product-category">${product.category}</div>
        <h3 class="product-name">${product.name}</h3>
        <p class="product-desc">${product.shortDescription}</p>
        <div class="product-meta">
          <div class="product-price">$${product.price.toFixed(2)}</div>
          <div class="product-rating">★ ${product.rating.toFixed(1)} <span style="color: var(--text-muted); font-size: 11px;">(${product.reviewsCount})</span></div>
        </div>
        <div class="product-actions">
          <a href="/product.html?id=${product._id}" class="btn btn-outline" style="font-size: 13px; padding: 8px 10px;">View Details</a>
          <button onclick="addToCart('${product._id}', '${product.name.replace(/'/g, "\\'")}', ${product.price}, '${product.image}')" 
                  class="btn btn-success" 
                  style="font-size: 13px; padding: 8px 10px;"
                  ${product.stock === 0 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
            + Cart
          </button>
        </div>
      </div>
    </div>
  `;
}
