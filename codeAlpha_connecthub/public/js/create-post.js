/**
 * ConnectHub Create Post Module
 */

document.addEventListener('DOMContentLoaded', () => {
  const currentUser = API.getCurrentUser();
  if (!currentUser) {
    API.showToast('Please log in to create a post', 'error');
    window.location.href = '/login.html';
    return;
  }

  setupPresetSelection();
  setupFileInputPreview();
  setupCreatePostForm();
});

let selectedPresetImage = '/images/posts/post1.png';

function setupPresetSelection() {
  const presets = document.querySelectorAll('.preset-post-thumb');
  const previewBox = document.getElementById('imagePreviewBox');
  const previewImg = document.getElementById('previewImage');

  presets.forEach((thumb) => {
    thumb.addEventListener('click', () => {
      presets.forEach((t) => t.classList.remove('selected'));
      thumb.classList.add('selected');
      selectedPresetImage = thumb.dataset.src;

      // Clear file input if preset selected
      const fileInput = document.getElementById('postFileInput');
      if (fileInput) fileInput.value = '';

      if (previewImg && previewBox) {
        previewImg.src = selectedPresetImage;
        previewBox.style.display = 'block';
      }
    });
  });

  // Default select first preset
  if (presets.length > 0) {
    presets[0].classList.add('selected');
    if (previewImg && previewBox) {
      previewImg.src = selectedPresetImage;
      previewBox.style.display = 'block';
    }
  }
}

function setupFileInputPreview() {
  const fileInput = document.getElementById('postFileInput');
  const previewBox = document.getElementById('imagePreviewBox');
  const previewImg = document.getElementById('previewImage');

  if (!fileInput) return;

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      // Unselect presets
      document.querySelectorAll('.preset-post-thumb').forEach((t) => t.classList.remove('selected'));
      selectedPresetImage = null;

      const reader = new FileReader();
      reader.onload = (event) => {
        if (previewImg && previewBox) {
          previewImg.src = event.target.result;
          previewBox.style.display = 'block';
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

function setupCreatePostForm() {
  const form = document.getElementById('createPostForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const captionInput = document.getElementById('postCaptionInput');
    const fileInput = document.getElementById('postFileInput');

    const caption = captionInput.value.trim();
    if (!caption) {
      API.showToast('Please enter a caption for your post', 'error');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('caption', caption);

      if (fileInput && fileInput.files[0]) {
        formData.append('image', fileInput.files[0]);
      } else if (selectedPresetImage) {
        formData.append('presetImage', selectedPresetImage);
      } else {
        formData.append('presetImage', '/images/posts/post1.png');
      }

      const createdPost = await API.createPost(formData);
      API.showToast('Post created successfully!', 'success');

      setTimeout(() => {
        window.location.href = `/post-details.html?id=${createdPost._id}`;
      }, 600);
    } catch (err) {
      API.showToast(err.message, 'error');
    }
  });
}
