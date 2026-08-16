/* ShopNest Checkout Controller */

let selectedPaymentMethod = 'Credit / Debit Card';
let selectedUpiApp = 'Google Pay';
let selectedAddressId = null;

document.addEventListener('DOMContentLoaded', () => {
  renderCheckoutSummary();
  renderSavedAddressesSelector();
  setupCheckoutForm();
});

function renderCheckoutSummary() {
  const cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
  const itemsContainer = document.getElementById('checkout-items-list');
  const totalContainer = document.getElementById('checkout-total-amount');

  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    setTimeout(() => window.location.href = '/cart.html', 1000);
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  if (itemsContainer) {
    itemsContainer.innerHTML = cart.map(item => `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <img src="${item.image}" alt="${item.name}" style="width: 44px; height: 44px; object-fit: cover; border-radius: 8px; border: 1px solid var(--border);">
          <div>
            <div style="font-size: 14px; font-weight: 700; height: 18px; overflow: hidden;">${item.name}</div>
            <div style="font-size: 12px; color: var(--text-muted);">Qty: ${item.quantity} × $${item.price.toFixed(2)}</div>
          </div>
        </div>
        <div style="font-weight: 800; font-size: 14px;">$${(item.price * item.quantity).toFixed(2)}</div>
      </div>
    `).join('');
  }

  if (totalContainer) {
    totalContainer.textContent = `$${total.toFixed(2)}`;
  }
}

function renderSavedAddressesSelector() {
  const container = document.getElementById('saved-addresses-selector');
  if (!container) return;

  const user = ShopNestAPI.getUser();
  const addresses = user && user.addresses ? user.addresses : [];

  if (addresses.length === 0) {
    container.style.display = 'none';
    return;
  }

  container.style.display = 'grid';
  container.innerHTML = addresses.map((addr, index) => `
    <div class="address-option-card ${addr.isDefault || index === 0 ? 'selected' : ''}" 
         style="border: 2px solid ${addr.isDefault || index === 0 ? 'var(--primary)' : 'var(--border)'}; background: ${addr.isDefault || index === 0 ? '#EFF6FF' : '#F8FAFC'}; border-radius: 12px; padding: 14px; cursor: pointer;"
         onclick="selectSavedCheckoutAddress(event, '${addr._id}', '${addr.customerName.replace(/'/g, "\\'")}', '${addr.phone}', '${addr.address.replace(/'/g, "\\'")}', '${addr.city.replace(/'/g, "\\'")}', '${addr.state.replace(/'/g, "\\'")}', '${addr.pinCode}')">
      <div style="display: flex; justify-content: space-between; font-weight: 800; font-size: 14px; margin-bottom: 4px;">
        <span>${addr.label || 'Home'}</span>
        ${addr.isDefault ? '<span style="font-size: 10px; color: var(--primary);">DEFAULT</span>' : ''}
      </div>
      <div style="font-size: 13px; font-weight: 700;">${addr.customerName}</div>
      <div style="font-size: 12px; color: var(--text-muted);">${addr.address}, ${addr.city}</div>
      <div style="font-size: 12px; font-weight: 600; margin-top: 4px;">📞 ${addr.phone}</div>
    </div>
  `).join('');

  // Auto-fill form with first address
  if (addresses.length > 0) {
    const first = addresses.find(a => a.isDefault) || addresses[0];
    fillAddressForm(first.customerName, first.phone, first.address, first.city, first.state, first.pinCode);
  }
}

function selectSavedCheckoutAddress(e, id, name, phone, street, city, state, pinCode) {
  selectedAddressId = id;
  const cards = document.querySelectorAll('.address-option-card');
  cards.forEach(card => {
    card.style.borderColor = 'var(--border)';
    card.style.background = '#F8FAFC';
  });

  const target = e.currentTarget;
  target.style.borderColor = 'var(--primary)';
  target.style.background = '#EFF6FF';

  fillAddressForm(name, phone, street, city, state, pinCode);
}

function fillAddressForm(name, phone, street, city, state, pinCode) {
  const nameInput = document.getElementById('customerName');
  const phoneInput = document.getElementById('phone');
  const streetInput = document.getElementById('address');
  const cityInput = document.getElementById('city');
  const stateInput = document.getElementById('state');
  const pinInput = document.getElementById('pinCode');

  if (nameInput) nameInput.value = name || '';
  if (phoneInput) phoneInput.value = phone || '';
  if (streetInput) streetInput.value = street || '';
  if (cityInput) cityInput.value = city || '';
  if (stateInput) stateInput.value = state || '';
  if (pinInput) pinInput.value = pinCode || '';
}

function selectPaymentMethod(method) {
  selectedPaymentMethod = method;

  const cards = document.querySelectorAll('.payment-option-card');
  cards.forEach(card => {
    if (card.dataset.method === method) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  // Toggle sub-forms
  const cardSub = document.getElementById('payment-subform-card');
  const upiSub = document.getElementById('payment-subform-upi');
  const bankSub = document.getElementById('payment-subform-netbanking');

  if (cardSub) cardSub.style.display = method === 'Credit / Debit Card' ? 'block' : 'none';
  if (upiSub) upiSub.style.display = method === 'UPI' ? 'block' : 'none';
  if (bankSub) bankSub.style.display = method === 'Net Banking' ? 'block' : 'none';

  // Update button text
  const btn = document.getElementById('place-order-btn');
  if (btn) {
    btn.textContent = method === 'Cash on Delivery' ? 'Place Order (Cash on Delivery)' : `Pay & Place Order (${method})`;
  }
}

function selectUpiApp(appName) {
  selectedUpiApp = appName;
  const cards = document.querySelectorAll('.upi-app-card');
  cards.forEach(card => {
    if (card.dataset.upiApp === appName) {
      card.classList.add('selected');
    } else {
      card.classList.remove('selected');
    }
  });

  const otherInputBox = document.getElementById('other-upi-input-box');
  if (otherInputBox) {
    otherInputBox.style.display = appName === 'Other UPI' ? 'block' : 'none';
  }
}

function setupCheckoutForm() {
  const form = document.getElementById('checkout-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!ShopNestAPI.getToken()) {
      showToast('Please login to place an order', 'info');
      setTimeout(() => window.location.href = '/login.html', 1000);
      return;
    }

    const cart = JSON.parse(localStorage.getItem('shopnest_cart') || '[]');
    if (cart.length === 0) {
      showToast('Your cart is empty', 'error');
      return;
    }

    const customerName = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const address = document.getElementById('address').value.trim();
    const city = document.getElementById('city').value.trim();
    const state = document.getElementById('state').value.trim();
    const pinCode = document.getElementById('pinCode').value.trim();

    if (!customerName || !phone || !address || !city || !state || !pinCode) {
      showToast('Please fill in all address fields', 'error');
      return;
    }

    // UPI Validation if UPI is chosen
    let resolvedUpiId = '';
    if (selectedPaymentMethod === 'UPI') {
      if (selectedUpiApp === 'Other UPI') {
        const inputUpi = document.getElementById('checkout-upi-id')?.value?.trim();
        if (!inputUpi || !/^[\w.-]+@[\w.-]+$/.test(inputUpi)) {
          showToast('Please enter a valid UPI ID (e.g. example@upi or name@okaxis)', 'error');
          return;
        }
        resolvedUpiId = inputUpi;
      } else {
        const appClean = selectedUpiApp.toLowerCase().replace(/\s+/g, '');
        resolvedUpiId = `${appClean}_sandbox@upi`;
      }
    }

    const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const btn = document.getElementById('place-order-btn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = `Verifying ${selectedPaymentMethod === 'UPI' ? selectedUpiApp : selectedPaymentMethod} Payment...`;
    }

    try {
      const orderPayload = {
        orderItems: cart.map(item => ({
          product: item.product,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          image: item.image
        })),
        shippingAddress: {
          customerName,
          phone,
          address,
          city,
          state,
          pinCode
        },
        paymentMethod: selectedPaymentMethod,
        paymentDetails: {
          cardLast4: document.getElementById('checkout-card-num')?.value?.slice(-4) || '4242',
          upiId: resolvedUpiId,
          bankName: document.getElementById('checkout-bank-name')?.value || ''
        },
        totalAmount
      };

      const data = await ShopNestAPI.request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      // Clear cart on success
      localStorage.removeItem('shopnest_cart');
      updateCartCounter();

      showToast(`Payment Verified via ${selectedPaymentMethod === 'UPI' ? selectedUpiApp : selectedPaymentMethod}! Order Placed Successfully!`, 'success');
      setTimeout(() => {
        window.location.href = `/order-confirmation.html?id=${data.order._id}`;
      }, 800);

    } catch (err) {
      showToast(err.message || 'Failed to place order', 'error');
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Place Order & Pay Securely';
      }
    }
  });
}
