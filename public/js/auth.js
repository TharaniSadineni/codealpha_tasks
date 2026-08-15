/* ShopNest Auth Controller */

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('tab') === 'register') {
    switchTab('register');
  }

  setupAuthForms();
});

function switchTab(tab) {
  const loginForm = document.getElementById('login-form-box');
  const regForm = document.getElementById('register-form-box');
  const tabLoginBtn = document.getElementById('tab-login-btn');
  const tabRegBtn = document.getElementById('tab-reg-btn');

  if (tab === 'register') {
    loginForm.style.display = 'none';
    regForm.style.display = 'block';
    tabLoginBtn.classList.remove('active');
    tabRegBtn.classList.add('active');
  } else {
    loginForm.style.display = 'block';
    regForm.style.display = 'none';
    tabLoginBtn.classList.add('active');
    tabRegBtn.classList.remove('active');
  }
}

function openForgotPasswordModal() {
  const loginEmail = document.getElementById('login-email')?.value?.trim() || '';
  if (loginEmail) {
    document.getElementById('reset-email').value = loginEmail;
  }
  document.getElementById('forgot-password-modal').style.display = 'flex';
}

function closeModal(id) {
  const modal = document.getElementById(id);
  if (modal) modal.style.display = 'none';
}

function setupAuthForms() {
  const loginForm = document.getElementById('login-form');
  const regForm = document.getElementById('register-form');
  const resetForm = document.getElementById('reset-password-form');

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      try {
        const data = await ShopNestAPI.request('/auth/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });

        ShopNestAPI.setAuth(data.token, data.user);
        showToast('Login successful! Redirecting...', 'success');

        const urlParams = new URLSearchParams(window.location.search);
        const redirect = urlParams.get('redirect');

        setTimeout(() => {
          window.location.href = redirect ? `/${redirect}.html` : '/index.html';
        }, 1000);
      } catch (error) {
        showToast(error.message || 'Login failed', 'error');
      }
    });
  }

  if (regForm) {
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      if (!name || !email || !password) {
        showToast('Please fill in all fields', 'error');
        return;
      }

      try {
        const data = await ShopNestAPI.request('/auth/register', {
          method: 'POST',
          body: JSON.stringify({ name, email, password })
        });

        ShopNestAPI.setAuth(data.token, data.user);
        showToast('Account created successfully!', 'success');

        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
      }
    });
  }

  if (resetForm) {
    resetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('reset-email').value.trim();
      const newPassword = document.getElementById('reset-new-password').value;
      const confirmPassword = document.getElementById('reset-confirm-password').value;

      if (!email || !newPassword) {
        showToast('Please fill in all required fields', 'error');
        return;
      }

      if (newPassword !== confirmPassword) {
        showToast('New passwords do not match!', 'error');
        return;
      }

      try {
        const data = await ShopNestAPI.request('/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email, newPassword })
        });

        ShopNestAPI.setAuth(data.token, data.user);
        closeModal('forgot-password-modal');
        showToast('Password reset successfully! Logged in...', 'success');

        setTimeout(() => {
          window.location.href = '/index.html';
        }, 1000);
      } catch (error) {
        showToast(error.message || 'Password reset failed', 'error');
      }
    });
  }
}
