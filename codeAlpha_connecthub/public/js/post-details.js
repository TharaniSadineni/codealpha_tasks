/**
 * ConnectHub Post Details & Comments Module
 */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const postId = urlParams.get('id');
  const currentUser = API.getCurrentUser();

  if (!postId) {
    window.location.href = '/index.html';
    return;
  }

  await loadPostDetails(postId, currentUser);
});

async function loadPostDetails(postId, currentUser) {
  const container = document.getElementById('postDetailsContainer');
  if (!container) return;

  container.innerHTML = '<div style="text-align:center; padding:40px; color:var(--text-muted);">Loading post details...</div>';

  try {
    const post = await API.getPostById(postId);
    const comments = await API.getComments(postId);

    const isOwnPost = currentUser && post.author && currentUser._id === post.author._id;
    const isLiked = currentUser && post.likes && post.likes.includes(currentUser._id);
    const likesCount = post.likes ? post.likes.length : 0;
    const formattedTime = API.formatDate(post.createdAt);

    container.innerHTML = `
      <div class="post-card" style="margin-bottom:24px;">
        <div class="post-header">
          <div class="post-author-info">
            <a href="/profile.html?username=${post.author.username}">
              <img src="${post.author.profilePic}" alt="${post.author.name}" class="post-author-avatar">
            </a>
            <div class="post-author-details">
              <a href="/profile.html?username=${post.author.username}" class="post-author-name">${post.author.name}</a>
              <span class="post-time">@${post.author.username} • ${formattedTime}</span>
            </div>
          </div>
          ${
            isOwnPost
              ? `<div>
                  <button id="detailEditPostBtn" class="btn btn-outline btn-sm">✏️ Edit</button>
                  <button id="detailDeletePostBtn" class="btn btn-danger btn-sm">🗑️ Delete</button>
                </div>`
              : ''
          }
        </div>

        <div class="post-caption" style="font-size:1.1rem; padding-bottom:18px;">${escapeHtml(post.caption)}</div>

        ${
          post.image
            ? `<div class="post-image-container" style="max-height:600px;">
                <img src="${post.image}" alt="${escapeHtml(post.caption)}" class="post-image" style="max-height:600px;" onerror="this.onerror=null; this.src='/images/posts/post1.png';">
              </div>`
            : ''
        }

        <div class="post-stats-bar">
          <span id="detailLikesCountText">${likesCount} ${likesCount === 1 ? 'Like' : 'Likes'}</span>
          <span>${comments.length} ${comments.length === 1 ? 'Comment' : 'Comments'}</span>
        </div>

        <div class="post-actions-bar">
          <button id="detailLikeBtn" class="post-action-btn ${isLiked ? 'liked' : ''}">
            <span>${isLiked ? '❤️ Liked' : '🤍 Like'}</span>
          </button>
        </div>
      </div>

      <!-- Comments Container -->
      <div class="post-card" style="padding:24px;">
        <h3 style="margin-bottom:20px; font-size:1.1rem; color:var(--text-main);">Comments (${comments.length})</h3>

        ${
          currentUser
            ? `<form id="addCommentForm" style="display:flex; gap:12px; margin-bottom:24px;">
                <img src="${currentUser.profilePic}" alt="${currentUser.name}" class="user-avatar-sm">
                <input type="text" id="addCommentInput" class="inline-comment-input" placeholder="Write a comment..." required>
                <button type="submit" class="btn btn-primary btn-sm">Post Comment</button>
              </form>`
            : `<div style="padding:14px; background-color:var(--bg-color); border-radius:var(--radius-sm); text-align:center; margin-bottom:20px;">
                <a href="/login.html" class="auth-link">Log in</a> to leave a comment.
              </div>`
        }

        <div id="commentsList">
          ${renderCommentsList(comments, currentUser)}
        </div>
      </div>
    `;

    // Attach Event Handlers
    attachDetailsEvents(postId, post, currentUser);

  } catch (err) {
    container.innerHTML = `
      <div class="post-card" style="padding:40px; text-align:center; color:var(--danger-color);">
        Failed to load post. It may have been deleted.
      </div>
    `;
  }
}

function renderCommentsList(comments, currentUser) {
  if (!comments || comments.length === 0) {
    return '<p style="color:var(--text-muted); text-align:center; padding:20px 0;">No comments yet. Be the first to comment!</p>';
  }

  return comments
    .map((comment) => {
      const isCommentOwner = currentUser && comment.author && currentUser._id === comment.author._id;
      const formattedTime = API.formatDate(comment.createdAt);
      const authorName = comment.author ? comment.author.name : 'User';
      const authorUsername = comment.author ? comment.author.username : 'user';
      const authorPic = comment.author ? comment.author.profilePic : '/images/avatars/avatar1.png';

      return `
        <div class="comment-item" id="comment-${comment._id}">
          <a href="/profile.html?username=${authorUsername}">
            <img src="${authorPic}" alt="${authorName}" class="user-avatar-sm">
          </a>
          <div class="comment-bubble">
            <div>
              <a href="/profile.html?username=${authorUsername}" class="comment-author-name">${escapeHtml(authorName)}</a>
              <span class="comment-text">${escapeHtml(comment.text)}</span>
            </div>
            <div style="display:flex; align-items:center; justify-content:space-between; margin-top:4px;">
              <span class="comment-time">${formattedTime}</span>
              ${
                isCommentOwner
                  ? `<button class="comment-delete-btn" data-commentid="${comment._id}">Delete</button>`
                  : ''
              }
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

function attachDetailsEvents(postId, post, currentUser) {
  // Like Button
  const likeBtn = document.getElementById('detailLikeBtn');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      if (!currentUser) {
        API.showToast('Please log in to like posts', 'error');
        window.location.href = '/login.html';
        return;
      }

      try {
        const res = await API.toggleLike(postId);
        const likesText = document.getElementById('detailLikesCountText');

        if (res.isLiked) {
          likeBtn.classList.add('liked');
          likeBtn.innerHTML = '<span>❤️ Liked</span>';
        } else {
          likeBtn.classList.remove('liked');
          likeBtn.innerHTML = '<span>🤍 Like</span>';
        }

        likesText.textContent = `${res.likesCount} ${res.likesCount === 1 ? 'Like' : 'Likes'}`;
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  }

  // Add Comment Form
  const commentForm = document.getElementById('addCommentForm');
  if (commentForm) {
    commentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input = document.getElementById('addCommentInput');
      const text = input.value.trim();

      if (!text) return;

      try {
        await API.addComment(postId, text);
        input.value = '';
        API.showToast('Comment added!', 'success');
        
        // Reload comments
        const updatedComments = await API.getComments(postId);
        document.getElementById('commentsList').innerHTML = renderCommentsList(updatedComments, currentUser);
        attachCommentDeleteEvents(currentUser);
      } catch (err) {
        API.showToast(err.message, 'error');
      }
    });
  }

  // Comment Delete Buttons
  attachCommentDeleteEvents(currentUser);

  // Edit Post Button
  const editBtn = document.getElementById('detailEditPostBtn');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      const newCaption = prompt('Edit your caption:', post.caption);
      if (newCaption !== null && newCaption.trim() !== '') {
        updatePostCaption(postId, newCaption.trim());
      }
    });
  }

  // Delete Post Button
  const deleteBtn = document.getElementById('detailDeletePostBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to delete this post?')) {
        try {
          await API.deletePost(postId);
          API.showToast('Post deleted successfully', 'success');
          setTimeout(() => {
            window.location.href = '/index.html';
          }, 600);
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      }
    });
  }
}

function attachCommentDeleteEvents(currentUser) {
  document.querySelectorAll('.comment-delete-btn').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const commentId = btn.dataset.commentid;
      if (confirm('Delete this comment?')) {
        try {
          await API.deleteComment(commentId);
          API.showToast('Comment deleted', 'success');
          const item = document.getElementById(`comment-${commentId}`);
          if (item) item.remove();
        } catch (err) {
          API.showToast(err.message, 'error');
        }
      }
    });
  });
}

async function updatePostCaption(postId, caption) {
  try {
    const formData = new FormData();
    formData.append('caption', caption);
    await API.updatePost(postId, formData);
    API.showToast('Post caption updated!', 'success');
    setTimeout(() => location.reload(), 500);
  } catch (err) {
    API.showToast(err.message, 'error');
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
