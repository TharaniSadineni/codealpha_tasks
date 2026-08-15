/* ShopNest Product Detail View Controller */

let currentProduct = null;
let currentQuantity = 1;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  if (!productId) {
    window.location.href = '/404.html';
    return;
  }

  loadProductDetail(productId);
});

async function loadProductDetail(id) {
  const container = document.getElementById('product-detail-wrap');
  if (!container) return;

  container.innerHTML = '<div class="spinner"></div>';

  try {
    const data = await ShopNestAPI.request(`/products/${id}`);
    currentProduct = data.product;

    const user = ShopNestAPI.getUser();
    const wishlistedIds = user && user.wishlist ? user.wishlist.map(w => typeof w === 'object' ? w._id : w) : [];

    renderProductDetail(data.product, wishlistedIds.includes(data.product._id));
    if (data.relatedProducts && data.relatedProducts.length > 0) {
      renderRelatedProducts(data.relatedProducts, wishlistedIds);
    }
  } catch (error) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; background: white; border-radius: 16px;">
        <h2 style="font-size: 24px; font-weight: 800; color: var(--danger); margin-bottom: 12px;">Product Not Found</h2>
        <p style="color: var(--text-muted); margin-bottom: 24px;">${error.message}</p>
        <a href="/index.html" class="btn btn-primary">Back to Store</a>
      </div>
    `;
  }
}

function renderProductDetail(p, isWishlisted = false) {
  const container = document.getElementById('product-detail-wrap');
  
  const stockBadgeClass = p.stock > 10 ? 'badge-in-stock' : p.stock > 0 ? 'badge-low-stock' : 'badge-out-stock';
  const stockBadgeText = p.stock > 10 ? 'In Stock' : p.stock > 0 ? `Only ${p.stock} left in stock` : 'Out of Stock';

  container.innerHTML = `
    <div class="product-detail-container">
      <div class="detail-image-box" style="position: relative;">
        <button onclick="toggleWishlistCard(event, '${p._id}')" class="wishlist-heart-btn ${isWishlisted ? 'active' : ''}" style="top: 20px; right: 20px; width: 44px; height: 44px; font-size: 22px;" title="Save to Wishlist">
          ${isWishlisted ? '♥' : '♡'}
        </button>
        <img src="${p.image}" alt="${p.name}">
      </div>
      <div class="detail-info">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 13px; font-weight: 700; color: var(--primary); text-transform: uppercase;">${p.category}</span>
          <span class="stock-badge ${stockBadgeClass}" style="position: static;">${stockBadgeText}</span>
        </div>
        <h1>${p.name}</h1>
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
          <span style="color: var(--accent); font-weight: 700; font-size: 16px;">★ ${p.rating.toFixed(1)}</span>
          <span style="color: var(--text-muted); font-size: 14px;">(${p.reviewsCount} customer reviews)</span>
        </div>
        <div class="detail-price">$${p.price.toFixed(2)}</div>
        <p style="color: var(--text-muted); font-size: 15px; margin-bottom: 24px; line-height: 1.7;">${p.fullDescription}</p>
        
        <div class="qty-selector">
          <label style="font-weight: 700; font-size: 14px;">Quantity:</label>
          <button onclick="adjustQty(-1)" class="qty-btn">-</button>
          <input type="number" id="detail-qty" value="1" min="1" max="${p.stock}" class="qty-input" readonly>
          <button onclick="adjustQty(1)" class="qty-btn">+</button>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 24px;">
          <button onclick="handleAddToCart()" class="btn btn-success" style="padding: 14px; font-size: 15px;" ${p.stock === 0 ? 'disabled' : ''}>
            🛒 Add to Cart
          </button>
          <button onclick="handleBuyNow()" class="btn btn-primary" style="padding: 14px; font-size: 15px;" ${p.stock === 0 ? 'disabled' : ''}>
            ⚡ Buy Now
          </button>
        </div>
      </div>
    </div>
  `;
}

function adjustQty(amount) {
  if (!currentProduct) return;
  const input = document.getElementById('detail-qty');
  let newQty = parseInt(input.value) + amount;
  if (newQty >= 1 && newQty <= currentProduct.stock) {
    currentQuantity = newQty;
    input.value = newQty;
  }
}

function handleAddToCart() {
  if (!currentProduct) return;
  addToCart(currentProduct._id, currentProduct.name, currentProduct.price, currentProduct.image, currentQuantity);
}

function handleBuyNow() {
  if (!currentProduct) return;
  addToCart(currentProduct._id, currentProduct.name, currentProduct.price, currentProduct.image, currentQuantity);
  window.location.href = '/checkout.html';
}

function renderRelatedProducts(products, wishlistedIds = []) {
  const wrap = document.getElementById('related-products-wrap');
  if (!wrap) return;

  wrap.style.display = 'block';
  const grid = document.getElementById('related-grid');
  grid.innerHTML = products.map(p => {
    const isW = wishlistedIds.includes(p._id);
    return `
      <div class="product-card">
        <div class="product-image-wrap">
          <button onclick="toggleWishlistCard(event, '${p._id}')" class="wishlist-heart-btn ${isW ? 'active' : ''}">
            ${isW ? '♥' : '♡'}
          </button>
          <img src="${p.image}" alt="${p.name}">
        </div>
        <div class="product-info">
          <h4 style="font-size: 15px; font-weight: 700; margin-bottom: 8px;">${p.name}</h4>
          <div style="font-size: 16px; font-weight: 800; color: var(--primary); margin-bottom: 12px;">$${p.price.toFixed(2)}</div>
          <a href="/product.html?id=${p._id}" class="btn btn-outline" style="width: 100%; font-size: 13px; padding: 8px;">View Item</a>
        </div>
      </div>
    `;
  }).join('');
}
