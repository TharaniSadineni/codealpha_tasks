/**
 * ConnectHub Authentication & Navigation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  renderNavbar();
  setupMobileNav();
  setupLogout();
});

function renderNavbar() {
  const user = API.getCurrentUser();
  const navUserMenu = document.getElementById('navUserMenu');
  
  if (!navUserMenu) return;

  if (user) {
    navUserMenu.innerHTML = `
      <ul class="nav-links">
        <li><a href="/index.html" class="nav-link ${isPage('index.html') ? 'active' : ''}">🏠 Feed</a></li>
        <li><a href="/create-post.html" class="nav-link ${isPage('create-post.html') ? 'active' : ''}">➕ Create Post</a></li>
        <li><a href="/profile.html?username=${user.username}" class="nav-link ${isPage('profile.html') ? 'active' : ''}">👤 Profile</a></li>
        <li><button id="logoutBtn" class="btn btn-outline btn-sm">Logout</button></li>
      </ul>
      <a href="/profile.html?username=${user.username}" title="${user.name}">
        <img src="${user.profilePic}" alt="${user.name}" class="nav-avatar">
      </a>
    `;
  } else {
    navUserMenu.innerHTML = `
      <ul class="nav-links">
        <li><a href="/index.html" class="nav-link ${isPage('index.html') ? 'active' : ''}">🏠 Feed</a></li>
        <li><a href="/login.html" class="btn btn-outline btn-sm">Log In</a></li>
        <li><a href="/register.html" class="btn btn-primary btn-sm">Sign Up</a></li>
      </ul>
    `;
  }
}

function isPage(pageName) {
  const path = window.location.pathname;
  if (pageName === 'index.html' && (path === '/' || path === '/index.html')) return true;
  return path.includes(pageName);
}

function setupMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.classList.toggle('mobile-open');
    });
  }
}

function setupLogout() {
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'logoutBtn') {
      API.removeToken();
      API.showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 500);
    }
  });
}
