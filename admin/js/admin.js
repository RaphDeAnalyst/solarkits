/**
 * SolarKits Admin Panel - Client-side JavaScript
 */

(function() {
  'use strict';

  // State
  let allProducts = [];
  let currentEditId = null;
  let uploadedImages = [];

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

  // ==================== INITIALIZATION ====================

  async function init() {
    await checkAuth();
    setupEventListeners();
  }

  // ==================== AUTHENTICATION ====================

  async function checkAuth() {
    try {
      const response = await fetch('/api/check-auth');
      const data = await response.json();

      if (data.authenticated) {
        showAdminScreen();
        await loadProducts();
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
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await response.json();

      if (response.ok) {
        showAdminScreen();
        await loadProducts();
      } else {
        showError(loginError, data.error || 'Invalid password');
      }
    } catch (error) {
      showError(loginError, 'Login failed. Please try again.');
    }
  }

  async function logout() {
    try {
      await fetch('/api/logout', { method: 'POST' });
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
      const response = await fetch('/api/products');
      const data = await response.json();
      allProducts = data.products || [];

      updateDashboardStats();
      renderProducts();
    } catch (error) {
      console.error('Failed to load products:', error);
      alert('Failed to load products');
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
    document.getElementById('solar-kits-count').textContent =
      allProducts.filter(p => p.category === 'solar-kits').length;
    document.getElementById('accessories-count').textContent =
      allProducts.filter(p => p.category === 'solar-accessories').length;
    document.getElementById('featured-count').textContent =
      allProducts.filter(p => p.metadata.featured).length;
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
      const response = await fetch(`/api/products/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadProducts();
        alert('Product deleted successfully');
      } else {
        alert('Failed to delete product');
      }
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Failed to delete product');
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
      const url = currentEditId ? `/api/products/${currentEditId}` : '/api/products';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });

      if (response.ok) {
        closeProductModal();
        await loadProducts();
        alert(`Product ${currentEditId ? 'updated' : 'created'} successfully`);
      } else {
        alert(`Failed to ${currentEditId ? 'update' : 'create'} product`);
      }
    } catch (error) {
      console.error('Save failed:', error);
      alert('Failed to save product');
    }
  }

  // ==================== IMAGE UPLOAD ====================

  async function uploadImages(files) {
    const formData = new FormData();

    Array.from(files).forEach(file => {
      formData.append('images', file);
    });

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        uploadedImages.push(...data.files);
        updateImagePreview();
      } else {
        alert('Failed to upload images');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload images');
    }
  }

  function updateImagePreview() {
    imagePreview.innerHTML = '';

    uploadedImages.forEach((url, index) => {
      const div = document.createElement('div');
      div.className = 'preview-item';
      div.innerHTML = `
        <img src="../${url}" alt="Product image ${index + 1}">
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

  // ==================== UTILITIES ====================

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
