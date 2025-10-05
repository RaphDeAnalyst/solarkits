/**
 * SolarKits Admin Panel - Client-side JavaScript
 */

(function() {
  'use strict';

  // API Base URL (works for both localhost and production)
  const API_BASE = window.location.origin;

  // State
  let allProducts = [];
  let allBlogPosts = [];
  let currentEditId = null;
  let currentEditBlogId = null;
  let uploadedImages = [];
  let currentTab = 'dashboard';

  // DOM Elements
  const loginScreen = document.getElementById('login-screen');
  const adminScreen = document.getElementById('admin-screen');
  const loginForm = document.getElementById('login-form');
  const loginError = document.getElementById('login-error');
  const logoutBtn = document.getElementById('logout-btn');

  const addProductBtn = document.getElementById('add-product-btn');
  const productModal = document.getElementById('product-modal');
  const productForm = document.getElementById('product-form');
  const closeModalBtn = document.getElementById('close-modal');
  const cancelBtn = document.getElementById('cancel-btn');

  const searchInput = document.getElementById('search-products');
  const filterCategory = document.getElementById('filter-category');
  const productsTableBody = document.getElementById('products-table-body');

  const imageUploadArea = document.getElementById('image-upload-area');
  const imageUploadInput = document.getElementById('image-upload');
  const imagePreview = document.getElementById('image-preview');

  // Blog DOM Elements
  const addBlogBtn = document.getElementById('add-blog-btn');
  const blogModal = document.getElementById('blog-modal');
  const blogForm = document.getElementById('blog-form');
  const closeBlogModalBtn = document.getElementById('close-blog-modal');
  const cancelBlogBtn = document.getElementById('cancel-blog-btn');
  const searchBlogInput = document.getElementById('search-blog');
  const filterBlogCategory = document.getElementById('filter-blog-category');
  const blogTableBody = document.getElementById('blog-table-body');

  // Tab Elements
  const tabButtons = document.querySelectorAll('.admin-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // ==================== INITIALIZATION ====================

  async function init() {
    await checkAuth();
    setupEventListeners();
    setupTabSwitching();
  }

  // ==================== AUTHENTICATION ====================

  async function checkAuth() {
    try {
      const response = await fetch(`${API_BASE}/api/check-auth`);
      const data = await response.json();

      if (data.authenticated) {
        showAdminScreen();
        await loadProducts();
        await loadBlogPosts();
      } else {
        showLoginScreen();
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      showLoginScreen();
    }
  }

  async function login(password) {
    try {
      const response = await fetch(`${API_BASE}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        showAdminScreen();
        await loadProducts();
        await loadBlogPosts();
      } else {
        showError(loginError, data.error || 'Invalid password');
      }
    } catch (error) {
      showError(loginError, 'Login failed. Please try again.');
    }
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/logout`, { method: 'POST' });
      showLoginScreen();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  function showLoginScreen() {
    loginScreen.style.display = 'flex';
    adminScreen.style.display = 'none';
  }

  function showAdminScreen() {
    loginScreen.style.display = 'none';
    adminScreen.style.display = 'block';
  }

  // ==================== PRODUCTS ====================

  async function loadProducts() {
    try {
      const response = await fetch(`${API_BASE}/api/products`);
      const data = await response.json();
      allProducts = data.products || [];

      updateDashboardStats();
      renderProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
      if (window.notify) {
        window.notify.error('Failed to load products. Please refresh the page.');
      }
    }
  }

  function renderProducts(products = allProducts) {
    productsTableBody.innerHTML = '';

    if (products.length === 0) {
      productsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No products found</td></tr>';
      return;
    }

    products.forEach(product => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${product.id}</td>
        <td><img src="../${product.image.thumb}" alt="${product.name}" class="product-image" onerror="this.style.display='none'"></td>
        <td>${product.name}</td>
        <td>${getCategoryName(product.category)}</td>
        <td>${product.price.display}</td>
        <td>${product.metadata.lastUpdated || '-'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small edit-btn" data-id="${product.id}">Edit</button>
            <button class="btn btn-danger btn-small delete-btn" data-id="${product.id}">Delete</button>
          </div>
        </td>
      `;
      productsTableBody.appendChild(tr);
    });

    // Attach event listeners
    document.querySelectorAll('.edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editProduct(btn.dataset.id));
    });

    document.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteProduct(btn.dataset.id));
    });
  }

  function updateDashboardStats() {
    document.getElementById('total-products').textContent = allProducts.length;
    document.getElementById('total-blog-posts').textContent = allBlogPosts.length;
    document.getElementById('featured-count').textContent =
      allProducts.filter(p => p.metadata.featured).length;
    document.getElementById('featured-blog-count').textContent =
      allBlogPosts.filter(p => p.featured).length;
  }

  function getCategoryName(category) {
    const names = {
      'solar-kits': 'Solar Kits',
      'solar-accessories': 'Solar Accessories',
      'home-energy': 'Home Energy',
      'outdoor-solar': 'Outdoor Solar'
    };
    return names[category] || category;
  }

  // ==================== SEARCH & FILTER ====================

  function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = filterCategory.value;

    let filtered = allProducts;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm) ||
        p.id.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    renderProducts(filtered);
  }

  // ==================== PRODUCT MODAL ====================

  function openProductModal(product = null) {
    currentEditId = product ? product.id : null;
    uploadedImages = [];

    document.getElementById('modal-title').textContent = product ? 'Edit Product' : 'Add Product';

    if (product) {
      document.getElementById('product-id').value = product.id;
      document.getElementById('product-name').value = product.name;
      document.getElementById('product-category').value = product.category;
      document.getElementById('product-price').value = product.price.amount;
      document.getElementById('product-display-price').value = product.price.display;
      document.getElementById('product-price-check').value = product.metadata.lastPriceCheck || '';
      document.getElementById('product-tags').value = product.tags ? product.tags.join(', ') : '';
      document.getElementById('product-amazon-url').value = product.affiliates.amazon?.url || '';
      document.getElementById('product-aliexpress-url').value = product.affiliates.aliexpress?.url || '';
      document.getElementById('product-featured').checked = product.metadata.featured || false;

      // Display existing images
      if (product.image.gallery) {
        uploadedImages = [...product.image.gallery];
        updateImagePreview();
      }
    } else {
      productForm.reset();
      imagePreview.innerHTML = '';
      document.getElementById('product-price-check').value = new Date().toISOString().split('T')[0];
    }

    productModal.style.display = 'flex';
  }

  function closeProductModal() {
    productModal.style.display = 'none';
    productForm.reset();
    currentEditId = null;
    uploadedImages = [];
    imagePreview.innerHTML = '';
  }

  async function editProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (product) {
      openProductModal(product);
    }
  }

  async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadProducts();
        if (window.notify) {
          window.notify.success('Product deleted successfully');
        }
      } else {
        if (window.notify) {
          window.notify.error('Failed to delete product');
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
      if (window.notify) {
        window.notify.error('Failed to delete product. Please try again.');
      }
    }
  }

  async function saveProduct(formData) {
    const tagsValue = formData.get('tags') || '';
    const product = {
      name: formData.get('name'),
      category: formData.get('category'),
      tags: tagsValue.split(',').map(t => t.trim()).filter(t => t),
      image: {
        thumb: uploadedImages[0] || '',
        gallery: uploadedImages
      },
      price: {
        amount: parseFloat(formData.get('price')),
        currency: 'USD',
        display: formData.get('displayPrice')
      },
      affiliates: {
        amazon: {
          url: formData.get('amazonUrl') || '',
          available: !!formData.get('amazonUrl')
        },
        aliexpress: {
          url: formData.get('aliexpressUrl') || '',
          available: !!formData.get('aliexpressUrl')
        }
      },
      metadata: {
        lastPriceCheck: formData.get('priceCheck') || new Date().toISOString().split('T')[0],
        featured: formData.get('featured') === 'on'
      }
    };

    try {
      const method = currentEditId ? 'PUT' : 'POST';
      const url = currentEditId ? `${API_BASE}/api/products/${currentEditId}` : `${API_BASE}/api/products`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        closeProductModal();
        await loadProducts();
        if (window.notify) {
          window.notify.success(`Product ${currentEditId ? 'updated' : 'created'} successfully`);
        }
      } else {
        if (window.notify) {
          window.notify.error(`Failed to ${currentEditId ? 'update' : 'create'} product`);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (window.notify) {
        window.notify.error('Failed to save product. Please try again.');
      }
    }
  }

  // ==================== IMAGE UPLOAD ====================

  async function uploadImages(files) {
    const formData = new FormData();

    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        uploadedImages.push(...data.files);
        updateImagePreview();
        if (window.notify) {
          window.notify.success(`${data.files.length} image${data.files.length > 1 ? 's' : ''} uploaded successfully`);
        }
      } else {
        if (window.notify) {
          window.notify.error('Failed to upload images');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (window.notify) {
        window.notify.error('Failed to upload images. Please try again.');
      }
    }
  }

  function updateImagePreview() {
    imagePreview.innerHTML = '';

    uploadedImages.forEach((url, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="${url}" alt="Product image ${index + 1}">
        <button type="button" class="preview-remove" data-index="${index}">&times;</button>
      `;
      imagePreview.appendChild(div);
    });

    // Attach remove listeners
    document.querySelectorAll('.preview-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        uploadedImages.splice(index, 1);
        updateImagePreview();
      });
    });
  }

  // ==================== BLOG IMAGE UPLOAD ====================

  async function uploadBlogFeaturedImage(file) {
    const formData = new FormData();
    formData.append('images', file);

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Featured image upload response:', data);

      if (response.ok && data.files && data.files.length > 0) {
        const imageUrl = data.files[0];

        // Populate the URL field
        const urlInput = document.getElementById('blog-featured-image');
        if (urlInput) {
          urlInput.value = imageUrl;
        }

        // Show preview
        const preview = document.getElementById('blog-featured-preview');
        const previewImg = document.getElementById('blog-featured-preview-img');
        if (preview && previewImg) {
          previewImg.src = imageUrl;
          preview.style.display = 'block';
        }

        if (window.notify) {
          window.notify.success('Featured image uploaded successfully');
        }
      } else {
        console.error('Featured image upload failed:', data);
        if (window.notify) {
          window.notify.error('Failed to upload featured image');
        }
      }
    } catch (error) {
      console.error('Featured image upload failed:', error);
      if (window.notify) {
        window.notify.error('Failed to upload featured image. Please try again.');
      }
    }
  }

  async function uploadBlogImages(files) {
    const formData = new FormData();

    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch(`${API_BASE}/api/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      console.log('Upload response:', data);

      if (response.ok && data.files && data.files.length > 0) {
        console.log('Files received:', data.files);
        displayBlogUploadedImages(data.files);
        if (window.notify) {
          window.notify.success(`${data.files.length} image${data.files.length > 1 ? 's' : ''} uploaded successfully`);
        }
      } else {
        console.error('Upload failed:', data);
        if (window.notify) {
          window.notify.error('Failed to upload images');
        }
      }
    } catch (error) {
      console.error('Upload failed:', error);
      if (window.notify) {
        window.notify.error('Failed to upload images. Please try again.');
      }
    }
  }

  function displayBlogUploadedImages(imageUrls) {
    const container = document.getElementById('blog-uploaded-images');
    if (!container) {
      console.error('Container not found: blog-uploaded-images');
      return;
    }

    console.log('Displaying images:', imageUrls);

    imageUrls.forEach(url => {
      console.log('Processing URL:', url);

      const div = document.createElement('div');
      div.className = 'blog-image-item';
      div.style.cssText = 'margin-bottom: 12px; padding: 12px; background: #f5f5f5; border-radius: 4px;';

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'display: flex; gap: 12px; align-items: center;';

      // Thumbnail
      const thumbnail = document.createElement('img');
      thumbnail.src = url;
      thumbnail.alt = 'Uploaded';
      thumbnail.style.cssText = 'width: 80px; height: 80px; object-fit: cover; border-radius: 4px;';

      // Input container
      const inputContainer = document.createElement('div');
      inputContainer.style.cssText = 'flex: 1;';

      const label = document.createElement('div');
      label.textContent = 'Click to copy:';
      label.style.cssText = 'margin-bottom: 4px; font-weight: 600; font-size: 12px; color: #666;';

      const imgTagValue = `<img src="${url}" alt="Blog image" style="max-width: 100%; height: auto;">`;
      console.log('Image tag value:', imgTagValue);

      const input = document.createElement('input');
      input.type = 'text';
      input.readOnly = true;
      input.value = imgTagValue;
      input.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace; font-size: 12px; cursor: pointer;';
      input.onclick = function() {
        this.select();
        document.execCommand('copy');
        if (window.notify) window.notify.success('Image tag copied!');
      };

      inputContainer.appendChild(label);
      inputContainer.appendChild(input);

      wrapper.appendChild(thumbnail);
      wrapper.appendChild(inputContainer);
      div.appendChild(wrapper);

      container.appendChild(div);
    });
  }

  // ==================== EVENT LISTENERS ====================

  function setupEventListeners() {
    // Login
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      login(password);
    });

    // Logout
    logoutBtn.addEventListener('click', logout);

    // Auto-format display price when numeric price changes
    const priceInput = document.getElementById('product-price');
    const displayPriceInput = document.getElementById('product-display-price');

    priceInput.addEventListener('input', () => {
      const price = parseFloat(priceInput.value);
      if (!isNaN(price) && price > 0) {
        displayPriceInput.value = `Starting at $${price.toFixed(2)}`;
      }
    });

    // Add product
    addProductBtn.addEventListener('click', () => openProductModal());

    // Close modal
    closeModalBtn.addEventListener('click', closeProductModal);
    cancelBtn.addEventListener('click', closeProductModal);

    // Click outside modal to close
    productModal.addEventListener('click', (e) => {
      if (e.target === productModal) {
        closeProductModal();
      }
    });

    // Product form submit
    productForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const formData = new FormData(productForm);
      await saveProduct(formData);
    });

    // Search & filter
    searchInput.addEventListener('input', filterProducts);
    filterCategory.addEventListener('change', filterProducts);

    // Blog search & filter
    if (searchBlogInput) {
      searchBlogInput.addEventListener('input', filterBlogPosts);
    }
    if (filterBlogCategory) {
      filterBlogCategory.addEventListener('change', filterBlogPosts);
    }

    // Blog management
    if (addBlogBtn) {
      addBlogBtn.addEventListener('click', () => openBlogModal());
    }
    if (closeBlogModalBtn) {
      closeBlogModalBtn.addEventListener('click', closeBlogModal);
    }
    if (cancelBlogBtn) {
      cancelBlogBtn.addEventListener('click', closeBlogModal);
    }

    // Click outside blog modal to close
    if (blogModal) {
      blogModal.addEventListener('click', (e) => {
        if (e.target === blogModal) {
          closeBlogModal();
        }
      });
    }

    // Blog form submit
    if (blogForm) {
      blogForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(blogForm);
        await saveBlogPost(formData);
      });
    }

    // Auto-generate slug from title
    const blogTitleInput = document.getElementById('blog-title');
    const blogSlugInput = document.getElementById('blog-slug');
    if (blogTitleInput && blogSlugInput) {
      blogTitleInput.addEventListener('input', () => {
        if (!blogSlugInput.value || currentEditBlogId === null) {
          const slug = blogTitleInput.value
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          blogSlugInput.value = slug;
        }
      });
    }

    // Blog content image upload
    const blogUploadBtn = document.getElementById('blog-upload-btn');
    const blogImageUpload = document.getElementById('blog-image-upload');
    if (blogUploadBtn && blogImageUpload) {
      blogUploadBtn.addEventListener('click', () => {
        blogImageUpload.click();
      });

      blogImageUpload.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
          await uploadBlogImages(e.target.files);
        }
      });
    }

    // Blog featured image upload
    const blogFeaturedUploadBtn = document.getElementById('blog-featured-upload-btn');
    const blogFeaturedImageUpload = document.getElementById('blog-featured-image-upload');
    if (blogFeaturedUploadBtn && blogFeaturedImageUpload) {
      blogFeaturedUploadBtn.addEventListener('click', () => {
        blogFeaturedImageUpload.click();
      });

      blogFeaturedImageUpload.addEventListener('change', async (e) => {
        if (e.target.files.length > 0) {
          await uploadBlogFeaturedImage(e.target.files[0]);
        }
      });
    }

    // Image upload
    imageUploadArea.addEventListener('click', () => {
      imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', (e) => {
      if (e.target.files.length > 0) {
        uploadImages(e.target.files);
      }
    });

    // Drag and drop
    imageUploadArea.addEventListener('dragover', (e) => {
      e.preventDefault();
      imageUploadArea.style.borderColor = 'var(--color-primary)';
    });

    imageUploadArea.addEventListener('dragleave', () => {
      imageUploadArea.style.borderColor = '';
    });

    imageUploadArea.addEventListener('drop', (e) => {
      e.preventDefault();
      imageUploadArea.style.borderColor = '';

      if (e.dataTransfer.files.length > 0) {
        uploadImages(e.dataTransfer.files);
      }
    });
  }

  // ==================== BLOG POSTS ====================

  async function loadBlogPosts() {
    try {
      const response = await fetch(`${API_BASE}/api/blog`);
      const data = await response.json();
      allBlogPosts = data.posts || [];

      updateDashboardStats();
      renderBlogPosts();
    } catch (error) {
      console.error('Failed to load blog posts:', error);
      if (window.notify) {
        window.notify.error('Failed to load blog posts. Please refresh the page.');
      }
    }
  }

  function renderBlogPosts(posts = allBlogPosts) {
    if (!blogTableBody) return;

    blogTableBody.innerHTML = '';

    if (posts.length === 0) {
      blogTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem;">No blog posts found</td></tr>';
      return;
    }

    posts.forEach(post => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${post.id}</td>
        <td>${escapeHtml(post.title)}</td>
        <td>${escapeHtml(post.category)}</td>
        <td>${escapeHtml(post.author)}</td>
        <td>${post.date}</td>
        <td>${post.featured ? '⭐ Yes' : 'No'}</td>
        <td>
          <div class="action-buttons">
            <button class="btn btn-primary btn-small edit-blog-btn" data-id="${post.id}">Edit</button>
            <button class="btn btn-danger btn-small delete-blog-btn" data-id="${post.id}">Delete</button>
          </div>
        </td>
      `;
      blogTableBody.appendChild(tr);
    });

    // Attach event listeners
    document.querySelectorAll('.edit-blog-btn').forEach(btn => {
      btn.addEventListener('click', () => editBlogPost(btn.dataset.id));
    });

    document.querySelectorAll('.delete-blog-btn').forEach(btn => {
      btn.addEventListener('click', () => deleteBlogPost(btn.dataset.id));
    });
  }

  function filterBlogPosts() {
    const searchTerm = searchBlogInput.value.toLowerCase();
    const category = filterBlogCategory.value;

    let filtered = allBlogPosts;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm) ||
        p.excerpt.toLowerCase().includes(searchTerm) ||
        p.id.toLowerCase().includes(searchTerm)
      );
    }

    if (category) {
      filtered = filtered.filter(p => p.category === category);
    }

    renderBlogPosts(filtered);
  }

  function openBlogModal(post = null) {
    currentEditBlogId = post ? post.id : null;

    document.getElementById('blog-modal-title').textContent = post ? 'Edit Blog Post' : 'Add Blog Post';

    if (post) {
      document.getElementById('blog-id').value = post.id;
      document.getElementById('blog-title').value = post.title;
      document.getElementById('blog-slug').value = post.slug || '';
      document.getElementById('blog-category').value = post.category;
      document.getElementById('blog-excerpt').value = post.excerpt;
      document.getElementById('blog-content').value = post.content;
      document.getElementById('blog-author').value = post.author;
      document.getElementById('blog-date').value = post.date;
      document.getElementById('blog-featured-image').value = post.featuredImage;
      document.getElementById('blog-tags').value = Array.isArray(post.tags) ? post.tags.join(', ') : '';
      document.getElementById('blog-related-products').value = Array.isArray(post.relatedProducts) ? post.relatedProducts.join(', ') : '';
      document.getElementById('blog-featured').checked = post.featured || false;

      // Show featured image preview if exists
      if (post.featuredImage) {
        const preview = document.getElementById('blog-featured-preview');
        const previewImg = document.getElementById('blog-featured-preview-img');
        if (preview && previewImg) {
          previewImg.src = post.featuredImage;
          preview.style.display = 'block';
        }
      }
    } else {
      blogForm.reset();
      document.getElementById('blog-date').value = new Date().toISOString().split('T')[0];
      document.getElementById('blog-author').value = 'Solar Energy Team';
    }

    blogModal.style.display = 'flex';
  }

  function closeBlogModal() {
    blogModal.style.display = 'none';
    blogForm.reset();
    currentEditBlogId = null;
    // Clear uploaded images display
    const uploadedImagesContainer = document.getElementById('blog-uploaded-images');
    if (uploadedImagesContainer) {
      uploadedImagesContainer.innerHTML = '';
    }
    // Clear featured image preview
    const featuredPreview = document.getElementById('blog-featured-preview');
    if (featuredPreview) {
      featuredPreview.style.display = 'none';
    }
  }

  async function editBlogPost(id) {
    const post = allBlogPosts.find(p => p.id === id);
    if (post) {
      openBlogModal(post);
    }
  }

  async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/blog/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadBlogPosts();
        if (window.notify) {
          window.notify.success('Blog post deleted successfully');
        }
      } else {
        if (window.notify) {
          window.notify.error('Failed to delete blog post');
        }
      }
    } catch (error) {
      console.error('Delete failed:', error);
      if (window.notify) {
        window.notify.error('Failed to delete blog post. Please try again.');
      }
    }
  }

  async function saveBlogPost(formData) {
    const tagsValue = formData.get('tags') || '';
    const relatedProductsValue = formData.get('relatedProducts') || '';

    const post = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      excerpt: formData.get('excerpt'),
      content: formData.get('content'),
      category: formData.get('category'),
      author: formData.get('author'),
      date: formData.get('date'),
      featuredImage: formData.get('featuredImage'),
      tags: tagsValue.split(',').map(t => t.trim()).filter(t => t),
      relatedProducts: relatedProductsValue.split(',').map(t => t.trim()).filter(t => t),
      featured: formData.get('featured') === 'on'
    };

    try {
      const method = currentEditBlogId ? 'PUT' : 'POST';
      const url = currentEditBlogId ? `${API_BASE}/api/blog/${currentEditBlogId}` : `${API_BASE}/api/blog`;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
      });

      if (response.ok) {
        closeBlogModal();
        await loadBlogPosts();
        if (window.notify) {
          window.notify.success(`Blog post ${currentEditBlogId ? 'updated' : 'created'} successfully`);
        }
      } else {
        if (window.notify) {
          window.notify.error(`Failed to ${currentEditBlogId ? 'update' : 'create'} blog post`);
        }
      }
    } catch (error) {
      console.error('Save failed:', error);
      if (window.notify) {
        window.notify.error('Failed to save blog post. Please try again.');
      }
    }
  }

  // ==================== TAB SWITCHING ====================

  function setupTabSwitching() {
    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const tabName = button.dataset.tab;
        switchTab(tabName);
      });
    });
  }

  function switchTab(tabName) {
    currentTab = tabName;

    // Update active button
    tabButtons.forEach(btn => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add('admin-tab--active');
      } else {
        btn.classList.remove('admin-tab--active');
      }
    });

    // Show/hide content
    document.getElementById('dashboard-view').style.display = tabName === 'dashboard' ? 'block' : 'none';
    document.getElementById('products-view').style.display = tabName === 'products' ? 'block' : 'none';
    document.getElementById('blog-view').style.display = tabName === 'blog' ? 'block' : 'none';
  }

  // ==================== UTILITIES ====================

  function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showError(element, message) {
    element.textContent = message;
    element.classList.add('show');
    setTimeout(() => {
      element.classList.remove('show');
    }, 5000);
  }

  // Initialize on page load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
