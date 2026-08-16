/**
 * ConnectHub User Profile Module
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const currentUser = API.getCurrentUser();
  let targetUsername = urlParams.get('username');

  if (!targetUsername && currentUser) {
    targetUsername = currentUser.username;
  }

  if (!targetUsername) {
    window.location.href = '/login.html';
    return;
  }

  await loadProfilePage(targetUsername, currentUser);
});

async function loadProfilePage(username, currentUser) {
  const profileContainer = document.getElementById('profileHeaderContainer');
  const postsContainer = document.getElementById('userPostsContainer');

  if (!profileContainer || !postsContainer) return;

  try {
    const authUserId = currentUser ? currentUser._id : '';
    const profileData = await API.getUserByUsername(username, authUserId);
    const { user, postsCount, followersCount, followingCount, isFollowing } = profileData;

    const isOwnProfile = currentUser && currentUser._id === user._id;

    // Render Profile Header
    profileContainer.innerHTML = `
      <div class="profile-header-card">
        <div class="profile-banner"></div>
        <div class="profile-info-container">
          <div class="profile-top-row">
            <img src="${user.profilePic}" alt="${user.name}" class="profile-avatar-lg">
            <div>
              ${
                isOwnProfile
                  ? `<button id="editProfileBtn" class="btn btn-outline btn-sm">✏️ Edit Profile</button>`
                  : currentUser
                  ? `<button id="profileFollowBtn" class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm" data-following="${isFollowing}" data-userid="${user._id}">
                      ${isFollowing ? 'Unfollow' : 'Follow'}
                    </button>`
                  : `<a href="/login.html" class="btn btn-primary btn-sm">Log in to Follow</a>`
              }
            </div>
          </div>
          <h1 class="profile-name">${escapeHtml(user.name)}</h1>
          <div class="profile-username">@${escapeHtml(user.username)}</div>
          <div class="profile-bio">${escapeHtml(user.bio || 'No bio provided.')}</div>
          <div class="profile-stats-row">
            <div class="profile-stat-box">
              <span class="profile-stat-num" id="postsCountVal">${postsCount}</span>
              <span class="profile-stat-label">Posts</span>
            </div>
            <div class="profile-stat-box">
              <span class="profile-stat-num" id="followersCountVal">${followersCount}</span>
              <span class="profile-stat-label">Followers</span>
            </div>
            <div class="profile-stat-box">
              <span class="profile-stat-num" id="followingCountVal">${followingCount}</span>
              <span class="profile-stat-label">Following</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Attach Follow / Unfollow Button Handler
    const followBtn = document.getElementById('profileFollowBtn');
    if (followBtn) {
      followBtn.addEventListener('click', async () => {
        const userId = followBtn.dataset.userid;
        const currentlyFollowing = followBtn.dataset.following === 'true';

        try {
          if (currentlyFollowing) {
            const res = await API.unfollowUser(userId);
            followBtn.dataset.following = 'false';
            followBtn.className = 'btn btn-primary btn-sm';
            followBtn.textContent = 'Follow';
            document.getElementById('followersCountVal').textContent = res.followersCount;
            API.showToast('Unfollowed user', 'info');
          } else {
            const res = await API.followUser(userId);
            followBtn.dataset.following = 'true';
            followBtn.className = 'btn btn-secondary btn-sm';
            followBtn.textContent = 'Unfollow';
            document.getElementById('followersCountVal').textContent = res.followersCount;
            API.showToast('Following user!', 'success');
          }
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      });
    }

    // Attach Edit Profile Modal Handler if own profile
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
      editBtn.addEventListener('click', () => {
        openEditProfileModal(user);
      });
    }

    // Load user's posts
    await loadUserPosts(user._id, currentUser, isOwnProfile);

  } catch (err) {
    profileContainer.innerHTML = `
      <div class="profile-header-card" style="padding:40px; text-align:center; color:var(--danger-color);">
        User @${username} not found.
      </div>
    `;
    postsContainer.innerHTML = '';
  }
}

async function loadUserPosts(userId, currentUser, isOwnProfile) {
  const postsContainer = document.getElementById('userPostsContainer');
  postsContainer.innerHTML = '<div style="text-align:center; padding:30px; color:var(--text-muted);">Loading user posts...</div>';

  try {
    const posts = await API.getUserPosts(userId);

    if (!posts || posts.length === 0) {
      postsContainer.innerHTML = `
        <div class="post-card" style="text-align:center; padding:40px;">
          <h4>No posts created yet</h4>
          ${isOwnProfile ? '<a href="/create-post.html" class="btn btn-primary btn-sm" style="margin-top:12px;">Create Your First Post</a>' : ''}
        </div>
      `;
      return;
    }

    postsContainer.innerHTML = posts.map((post) => renderProfilePostCard(post, currentUser, isOwnProfile)).join('');

    // Attach Edit & Delete Event Listeners for own posts
    attachProfilePostEvents(postsContainer, currentUser);
  } catch (err) {
    postsContainer.innerHTML = '<div style="color:var(--danger-color); text-align:center;">Failed to load posts.</div>';
  }
}

function renderProfilePostCard(post, currentUser, isOwnProfile) {
  const isLiked = currentUser && post.likes && post.likes.includes(currentUser._id);
  const likesCount = post.likes ? post.likes.length : 0;
  const commentsCount = post.commentsCount || 0;
  const formattedTime = API.formatDate(post.createdAt);

  return `
    <div class="post-card" data-postid="${post._id}">
      <div class="post-header">
        <div class="post-author-info">
          <img src="${post.author.profilePic}" alt="${post.author.name}" class="post-author-avatar">
          <div class="post-author-details">
            <span class="post-author-name">${post.author.name}</span>
            <span class="post-time">${formattedTime}</span>
          </div>
        </div>
        ${
          isOwnProfile
            ? `<div>
                <button class="btn btn-outline btn-sm edit-post-btn" data-postid="${post._id}" data-caption="${escapeHtml(post.caption)}">✏️ Edit</button>
                <button class="btn btn-danger btn-sm delete-post-btn" data-postid="${post._id}">🗑️ Delete</button>
              </div>`
            : ''
        }
      </div>

      <div class="post-caption">${escapeHtml(post.caption)}</div>

      ${
        post.image
          ? `<div class="post-image-container">
              <a href="/post-details.html?id=${post._id}">
                <img src="${post.image}" alt="${escapeHtml(post.caption)}" class="post-image" onerror="this.onerror=null; this.src='/images/posts/post1.png';">
              </a>
            </div>`
          : ''
      }

      <div class="post-stats-bar">
        <span class="likes-counter-text">${likesCount} ${likesCount === 1 ? 'Like' : 'Likes'}</span>
        <a href="/post-details.html?id=${post._id}" style="color:var(--text-muted); text-decoration:none;">${commentsCount} Comments</a>
      </div>
    </div>
  `;
}

function attachProfilePostEvents(container, currentUser) {
  // Delete Post Button
  container.querySelectorAll('.delete-post-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const postId = btn.dataset.postid;
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await API.deletePost(postId);
          API.showToast('Post deleted successfully', 'success');
          const card = container.querySelector(`.post-card[data-postid="${postId}"]`);
          if (card) card.remove();

          // Decrement post count display
          const countEl = document.getElementById('postsCountVal');
          if (countEl) {
            const curVal = parseInt(countEl.textContent, 10);
            countEl.textContent = Math.max(0, curVal - 1);
          }
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      }
    });
  });

  // Edit Post Button
  container.querySelectorAll('.edit-post-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const postId = btn.dataset.postid;
      const caption = btn.dataset.caption;
      openEditPostModal(postId, caption);
    });
  });
}

function openEditPostModal(postId, currentCaption) {
  const modal = document.getElementById('editPostModal');
  const captionInput = document.getElementById('editPostCaptionInput');
  const form = document.getElementById('editPostForm');

  if (!modal || !captionInput || !form) return;

  captionInput.value = currentCaption;
  modal.classList.add('active');

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    const newCaption = captionInput.value.trim();
    if (!newCaption) return;

    try {
      const formData = new FormData();
      formData.append('caption', newCaption);

      await API.updatePost(postId, formData);
      modal.classList.remove('active');
      API.showToast('Post updated successfully!', 'success');

      // Update caption in card UI
      const card = document.querySelector(`.post-card[data-postid="${postId}"]`);
      if (card) {
        const captionEl = card.querySelector('.post-caption');
        if (captionEl) captionEl.textContent = newCaption;
      }
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  };
}

function openEditProfileModal(user) {
  const modal = document.getElementById('editProfileModal');
  const nameInput = document.getElementById('editNameInput');
  const bioInput = document.getElementById('editBioInput');
  const form = document.getElementById('editProfileForm');

  if (!modal || !nameInput || !bioInput || !form) return;

  nameInput.value = user.name;
  bioInput.value = user.bio || '';
  modal.classList.add('active');

  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) {
    closeBtn.onclick = () => modal.classList.remove('active');
  }

  form.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', nameInput.value.trim());
      formData.append('bio', bioInput.value.trim());

      const updatedUser = await API.updateProfile(formData);
      API.setCurrentUser(updatedUser);
      modal.classList.remove('active');
      API.showToast('Profile updated!', 'success');
      setTimeout(() => location.reload(), 500);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
