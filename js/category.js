/**
 * Solarkits - Category Page Management
 * Handles loading and displaying all products for a specific category
 */

(function() {
  'use strict';

  // State
  let allProducts = [];
  let filteredProducts = [];
  let currentCategory = '';

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const productsCount = document.getElementById('products-count');
  const categoryTitle = document.getElementById('category-title');
  const noResultsEl = document.getElementById('no-results');

  /**
   * Get current category from page
   * Expected to be set via data attribute on body
   */
  function getCurrentCategory() {
    const body = document.body;
    return body.dataset.category || '';
  }

  /**
   * Load products from JSON file
   */
  async function loadProducts() {
    try {
      showLoading(true);

      const response = await fetch('/api/public/products');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allProducts = data.products || [];
      currentCategory = getCurrentCategory();

      // Filter to show only products from current category (all products, not just featured)
      if (currentCategory) {
        filteredProducts = allProducts.filter(p => p.category === currentCategory);
      } else {
        filteredProducts = allProducts;
      }

      console.log(`📦 Loaded ${filteredProducts.length} products for category: ${currentCategory}`);

      updateCategoryTitle();
      renderProducts();
      updateProductCount();

    } catch (error) {
      console.error('Error loading products:', error);
      showError('Failed to load products. Please refresh the page.');

      // Show notification
      if (window.notify) {
        window.notify.error('Failed to load products. Please refresh the page.');
      }
    } finally {
      showLoading(false);
    }
  }

  /**
   * Update category title
   */
  function updateCategoryTitle() {
    if (!categoryTitle) return;

    const categoryNames = {
      'solar-kits': 'Solar Kits',
      'solar-accessories': 'Solar Accessories',
      'home-energy': 'Home Energy Solutions',
      'outdoor-solar': 'Outdoor Solar'
    };

    const name = categoryNames[currentCategory] || 'All Products';
    categoryTitle.textContent = name;
  }

  /**
   * Render products to the grid
   */
  function renderProducts() {
    if (!productsGrid) return;

    // Clear grid
    productsGrid.innerHTML = '';

    // Show no results message if no products
    if (filteredProducts.length === 0) {
      showNoResults(true);
      return;
    }

    showNoResults(false);

    // Create product cards
    filteredProducts.forEach(product => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });

    // Re-initialize affiliate tracking for new links
    if (window.SolarKits && window.SolarKits.initAffiliateTracking) {
      window.SolarKits.initAffiliateTracking();
    }
  }

  /**
   * Create a product card element
   */
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.category = product.category;
    card.dataset.id = product.id;

    // Build affiliate buttons with "Check Price" messaging
    let ctaButtons = '';

    if (product.affiliates.amazon && product.affiliates.amazon.available) {
      ctaButtons += `
        <a href="${escapeHtml(product.affiliates.amazon.url)}"
           class="btn btn--amazon"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Check current price for ${escapeHtml(product.name)} on Amazon">
          Amazon
        </a>
      `;
    }

    if (product.affiliates.aliexpress && product.affiliates.aliexpress.available) {
      ctaButtons += `
        <a href="${escapeHtml(product.affiliates.aliexpress.url)}"
           class="btn btn--aliexpress"
           target="_blank"
           rel="noopener noreferrer"
           aria-label="Check current price for ${escapeHtml(product.name)} on AliExpress">
          AliExpress
        </a>
      `;
    }

    // Build badge if featured or new
    let badge = '';
    if (product.metadata.featured) {
      badge = '<span class="product-card__badge">Featured</span>';
    } else if (isNewProduct(product.metadata.dateAdded)) {
      badge = '<span class="product-card__badge" style="background-color: var(--color-success);">New</span>';
    }

    // Format price update date
    const priceDate = formatPriceDate(product.metadata.lastPriceCheck);
    const priceDateHtml = priceDate ? `<div class="product-card__price-date">${escapeHtml(priceDate)}</div>` : '';

    card.innerHTML = `
      <div class="product-card__image-wrapper">
        <img
          src="../${escapeHtml(product.image.thumb)}"
          alt="${escapeHtml(product.name)}"
          class="product-card__image product-card__image--clickable"
          loading="lazy"
          title="Click to view gallery">
        ${badge}
      </div>
      <div class="product-card__content">
        <div class="product-card__category">${escapeHtml(getCategoryName(product.category))}</div>
        <h3 class="product-card__title">${escapeHtml(product.name)}</h3>
        <div class="product-card__price">
          ${escapeHtml(product.price.display)}
          ${priceDateHtml}
        </div>
        <div class="product-card__cta">
          ${ctaButtons}
        </div>
      </div>
    `;

    // Make image clickable to open lightbox
    const imageEl = card.querySelector('.product-card__image');
    if (imageEl && product.image.gallery && product.image.gallery.length > 0) {
      imageEl.addEventListener('click', () => {
        if (window.Lightbox) {
          // Prepend ../ to gallery image paths for pages in subdirectories
          const galleryPaths = product.image.gallery.map(path => `../${path}`);
          window.Lightbox.open(galleryPaths, 0);
        }
      });
    }

    return card;
  }

  /**
   * Update product count display
   */
  function updateProductCount() {
    if (productsCount) {
      productsCount.textContent = filteredProducts.length;
    }
  }

  /**
   * Show/hide loading state
   */
  function showLoading(isLoading) {
    if (!productsGrid) return;

    if (isLoading) {
      productsGrid.innerHTML = `
        <div class="loading">
          <div class="loading__spinner"></div>
          <p>Loading products...</p>
        </div>
      `;
    }
  }

  /**
   * Show error message
   */
  function showError(message) {
    if (!productsGrid) return;

    productsGrid.innerHTML = `
      <div class="no-results">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2"/>
          <path d="M32 20v16M32 44h.02" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <h3>Oops! Something went wrong</h3>
        <p>${escapeHtml(message)}</p>
      </div>
    `;
  }

  /**
   * Show/hide no results message
   */
  function showNoResults(show) {
    if (noResultsEl) {
      noResultsEl.style.display = show ? 'block' : 'none';
    }
  }

  /**
   * Get category display name
   */
  function getCategoryName(category) {
    const categoryNames = {
      'solar-kits': 'Solar Kits',
      'solar-accessories': 'Solar Accessories',
      'home-energy': 'Home Energy Solutions',
      'outdoor-solar': 'Outdoor Solar'
    };
    return categoryNames[category] || category;
  }

  /**
   * Check if product is new (added within last 30 days)
   */
  function isNewProduct(dateAdded) {
    if (!dateAdded) return false;

    const addedDate = new Date(dateAdded);
    const now = new Date();
    const daysDiff = (now - addedDate) / (1000 * 60 * 60 * 24);

    return daysDiff <= 30;
  }

  /**
   * Format date for price update display
   * Converts "2025-10-03" to "Updated: Oct 3, 2025"
   */
  function formatPriceDate(dateString) {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const formattedDate = date.toLocaleDateString('en-US', options);
      return `Updated: ${formattedDate}`;
    } catch (error) {
      console.warn('Invalid date format:', dateString);
      return '';
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Sort products
   */
  function sortProducts(sortBy) {
    switch(sortBy) {
      case 'price-low':
        filteredProducts.sort((a, b) => a.price.amount - b.price.amount);
        break;
      case 'price-high':
        filteredProducts.sort((a, b) => b.price.amount - a.price.amount);
        break;
      case 'name':
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        filteredProducts.sort((a, b) => {
          return new Date(b.metadata.dateAdded) - new Date(a.metadata.dateAdded);
        });
        break;
      default:
        break;
    }

    renderProducts();
  }

  /**
   * Initialize category page
   */
  function init() {
    console.log('🛍️ Category page module - Initializing...');
    loadProducts();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.CategoryManager = {
    loadProducts,
    sortProducts,
    getFilteredProducts: () => filteredProducts
  };

})();
