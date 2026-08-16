/**
 * ConnectHub Home Feed Module
 */

document.addEventListener('DOMContentLoaded', async () => {
  const currentUser = API.getCurrentUser();
  renderLeftSidebar(currentUser);
  await loadSuggestedUsers(currentUser);
  await loadFeedPosts(currentUser);
});

function renderLeftSidebar(user) {
  const sidebarContainer = document.getElementById('leftSidebarContainer');
  if (!sidebarContainer) return;

  if (user) {
    sidebarContainer.innerHTML = `
      <div class="sidebar-card sidebar-profile">
        <a href="/profile.html?username=${user.username}">
          <img src="${user.profilePic}" alt="${user.name}" class="sidebar-avatar">
        </a>
        <a href="/profile.html?username=${user.username}" class="sidebar-name">${user.name}</a>
        <a href="/profile.html?username=${user.username}" class="sidebar-username" style="color:var(--text-muted); text-decoration:none;">@${user.username}</a>
        <p style="font-size: 0.85rem; color: var(--text-muted); margin-top: 8px; margin-bottom: 16px;">${user.bio || ''}</p>
        <a href="/create-post.html" class="btn btn-primary btn-block btn-sm">➕ Create New Post</a>
      </div>
    `;
  } else {
    sidebarContainer.innerHTML = `
      <div class="sidebar-card" style="text-align: center;">
        <h3 style="color: var(--primary-color); margin-bottom: 8px;">Welcome to ConnectHub!</h3>
        <p style="font-size: 0.88rem; color: var(--text-muted); margin-bottom: 16px;">Join our social platform to share posts, like, comment, and connect with fellow developers!</p>
        <a href="/register.html" class="btn btn-primary btn-block btn-sm" style="margin-bottom: 8px;">Join ConnectHub</a>
        <a href="/login.html" class="btn btn-outline btn-block btn-sm">Log In</a>
      </div>
    `;
  }
}

async function loadSuggestedUsers(currentUser) {
  const container = document.getElementById('suggestedUsersContainer');
  if (!container) return;

  try {
    const users = await API.getUsers();
    // Filter out current user
    const suggestions = users
      .filter((u) => !currentUser || u._id !== currentUser._id)
      .slice(0, 5);

    if (suggestions.length === 0) {
      container.innerHTML = '<p style="font-size:0.85rem; color:var(--text-muted);">No suggestions right now.</p>';
      return;
    }

    let html = '';
    for (const user of suggestions) {
      let isFollowing = false;
      if (currentUser) {
        try {
          const status = await API.request(`/followers/status/${user._id}`);
          isFollowing = status.isFollowing;
        } catch (e) {}
      }

      html += `
        <div class="suggested-user-item" id="suggested-user-${user._id}">
          <div class="user-info-short">
            <a href="/profile.html?username=${user.username}">
              <img src="${user.profilePic}" alt="${user.name}" class="user-avatar-sm">
            </a>
            <div class="user-names-sm">
              <a href="/profile.html?username=${user.username}" class="user-name-link">${user.name}</a>
              <a href="/profile.html?username=${user.username}" class="user-handle-sm" style="color:var(--text-muted); text-decoration:none;">@${user.username}</a>
            </div>
          </div>
          ${
            currentUser
              ? `<button class="btn ${isFollowing ? 'btn-secondary' : 'btn-outline'} btn-sm follow-btn" data-userid="${user._id}" data-following="${isFollowing}">
                  ${isFollowing ? 'Following' : 'Follow'}
                </button>`
              : ''
          }
        </div>
      `;
    }

    container.innerHTML = html;

    // Attach click events to follow buttons
    container.querySelectorAll('.follow-btn').forEach((btn) => {
      btn.addEventListener('click', async (e) => {
        const userId = e.target.dataset.userid;
        const isFollowing = e.target.dataset.following === 'true';

        try {
          if (isFollowing) {
            await API.unfollowUser(userId);
            e.target.dataset.following = 'false';
            e.target.className = 'btn btn-outline btn-sm follow-btn';
            e.target.textContent = 'Follow';
            API.showToast('Unfollowed user', 'info');
          } else {
            await API.followUser(userId);
            e.target.dataset.following = 'true';
            e.target.className = 'btn btn-secondary btn-sm follow-btn';
            e.target.textContent = 'Following';
            API.showToast('Following user!', 'success');
          }
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    container.innerHTML = '<p style="font-size:0.85rem; color:var(--danger-color);">Error loading users.</p>';
  }
}

async function loadFeedPosts(currentUser) {
  const feedContainer = document.getElementById('feedPostsContainer');
  if (!feedContainer) return;

  feedContainer.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Loading posts...</div>';

  try {
    const posts = await API.getPosts();

    if (!posts || posts.length === 0) {
      feedContainer.innerHTML = `
        <div class="post-card" style="text-align:center; padding:40px;">
          <h3>No posts found</h3>
          <p style="color:var(--text-muted); margin-top:8px;">Be the first one to create a post!</p>
          <a href="/create-post.html" class="btn btn-primary btn-sm" style="margin-top:16px;">Create Post</a>
        </div>
      `;
      return;
    }

    feedContainer.innerHTML = posts.map((post) => renderPostCard(post, currentUser)).join('');

    // Attach Interactive Event Handlers (Like, Inline Comment Submit)
    attachPostCardEvents(feedContainer, currentUser);
  } catch (err) {
    feedContainer.innerHTML = `
      <div style="text-align:center; padding:40px; color:var(--danger-color);">
        Failed to load feed. Please check backend connection.
      </div>
    `;
  }
}

function renderPostCard(post, currentUser) {
  const isLiked = currentUser && post.likes && post.likes.includes(currentUser._id);
  const likesCount = post.likes ? post.likes.length : 0;
  const commentsCount = post.commentsCount || 0;
  const formattedTime = API.formatDate(post.createdAt);
  const authorName = post.author ? post.author.name : 'Unknown User';
  const authorUsername = post.author ? post.author.username : 'user';
  const authorAvatar = post.author ? post.author.profilePic : '/images/avatars/avatar1.png';

  return `
    <div class="post-card" data-postid="${post._id}">
      <div class="post-header">
        <div class="post-author-info">
          <a href="/profile.html?username=${authorUsername}">
            <img src="${authorAvatar}" alt="${authorName}" class="post-author-avatar">
          </a>
          <div class="post-author-details">
            <a href="/profile.html?username=${authorUsername}" class="post-author-name">${authorName}</a>
            <span class="post-time">
              <a href="/profile.html?username=${authorUsername}" style="color:inherit; text-decoration:none;">@${authorUsername}</a> • ${formattedTime}
            </span>
          </div>
        </div>
      </div>

      <div class="post-caption">${escapeHtml(post.caption)}</div>

      ${
        post.image
          ? `<div class="post-image-container">
              <a href="/post-details.html?id=${post._id}" style="width:100%; display:block;">
                <img src="${post.image}" alt="${escapeHtml(post.caption)}" class="post-image" onerror="this.onerror=null; this.src='/images/posts/post1.png';">
              </a>
            </div>`
          : ''
      }

      <div class="post-stats-bar">
        <span class="likes-counter-text">${likesCount} ${likesCount === 1 ? 'Like' : 'Likes'}</span>
        <a href="/post-details.html?id=${post._id}" style="color:var(--text-muted); text-decoration:none;">${commentsCount} ${commentsCount === 1 ? 'Comment' : 'Comments'}</a>
      </div>

      <div class="post-actions-bar">
        <button class="post-action-btn like-btn ${isLiked ? 'liked' : ''}" data-postid="${post._id}">
          <span>${isLiked ? '❤️ Liked' : '🤍 Like'}</span>
        </button>
        <a href="/post-details.html?id=${post._id}" class="post-action-btn">
          <span>💬 Comment</span>
        </a>
      </div>

      <div class="post-comments-preview">
        ${
          currentUser
            ? `<form class="inline-comment-form" data-postid="${post._id}">
                <input type="text" class="inline-comment-input" placeholder="Write a comment..." required>
                <button type="submit" class="btn btn-primary btn-sm" style="border-radius:var(--radius-full);">Post</button>
              </form>`
            : `<p style="font-size:0.85rem; color:var(--text-muted); text-align:center;">
                <a href="/login.html" class="auth-link">Log in</a> to comment on this post.
              </p>`
        }
      </div>
    </div>
  `;
}

function attachPostCardEvents(container, currentUser) {
  // Like Button Click Handler
  container.querySelectorAll('.like-btn').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      if (!currentUser) {
        API.showToast('Please log in to like posts', 'error');
        window.location.href = '/login.html';
        return;
      }

      const postId = btn.dataset.postid;
      try {
        const res = await API.toggleLike(postId);
        const card = btn.closest('.post-card');
        const likesText = card.querySelector('.likes-counter-text');

        if (res.isLiked) {
          btn.classList.add('liked');
          btn.innerHTML = '<span>❤️ Liked</span>';
        } else {
          btn.classList.remove('liked');
          btn.innerHTML = '<span>🤍 Like</span>';
        }

        likesText.textContent = `${res.likesCount} ${res.likesCount === 1 ? 'Like' : 'Likes'}`;
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  });

  // Inline Comment Form Submit Handler
  container.querySelectorAll('.inline-comment-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const postId = form.dataset.postid;
      const input = form.querySelector('.inline-comment-input');
      const text = input.value.trim();

      if (!text) return;

      try {
        await API.addComment(postId, text);
        input.value = '';
        API.showToast('Comment added successfully!', 'success');
        
        // Redirect to post details to view the added comment in full thread
        setTimeout(() => {
          window.location.href = `/post-details.html?id=${postId}`;
        }, 500);
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
