/**
 * Solarkits - Categories Page (All Products)
 * Handles loading, displaying, and filtering ALL products by category
 * Unlike products.js (homepage), this shows ALL products not just featured
 */

(function() {
  'use strict';

  // State
  let allProducts = [];
  let filteredProducts = [];
  let currentCategory = 'all';

  // DOM Elements
  const productsGrid = document.getElementById('products-grid');
  const productsCount = document.getElementById('products-count');
  const categoryButtons = document.querySelectorAll('.category-btn');
  const noResultsEl = document.getElementById('no-results');
  const searchInput = document.getElementById('search-input');
  const searchInputMobile = document.getElementById('search-input-mobile');

  /**
   * Load products from JSON file
   * Shows ALL products (not filtered to featured)
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

      // Show ALL products (not filtering to featured)
      filteredProducts = allProducts;

      console.log(`📦 Loaded ${allProducts.length} products (showing all)`);

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
   * Filter products by category
   * Shows ALL products from selected category (not just featured)
   */
  function filterByCategory(category) {
    currentCategory = category;

    if (category === 'all') {
      // Show ALL products
      filteredProducts = allProducts;
    } else {
      // Show all products from selected category
      filteredProducts = allProducts.filter(product => product.category === category);
    }

    renderProducts();
    updateProductCount();
    updateCategoryButtons();

    // Scroll to products section
    const productsSection = document.getElementById('products');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  /**
   * Update active category button
   */
  function updateCategoryButtons() {
    categoryButtons.forEach(btn => {
      const category = btn.dataset.category;
      if (category === currentCategory) {
        btn.classList.add('category-btn--active');
      } else {
        btn.classList.remove('category-btn--active');
      }
    });
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
   * Initialize category filters
   */
  function initCategoryFilters() {
    categoryButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.dataset.category;
        filterByCategory(category);
      });
    });
  }

  /**
   * Initialize Search
   */
  function initializeSearch() {
    // Setup search handler function
    function handleSearchInput(inputElement) {
      if (!inputElement) return;

      let searchTimeout;

      inputElement.addEventListener('input', function() {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
          const searchTerm = this.value.trim().toLowerCase();

          if (searchTerm.length === 0) {
            // Reset to current category filter
            filterByCategory(currentCategory);
            return;
          }

          // Get products from current category filter
          let productsToSearch = currentCategory === 'all'
            ? [...allProducts]
            : allProducts.filter(product => product.category === currentCategory);

          // Apply search
          filteredProducts = searchProducts(productsToSearch, searchTerm);
          renderProducts();
          updateProductCount();

          console.log(`🔍 Product Search: "${searchTerm}" - ${filteredProducts.length} results`);
        }, 300); // Debounce delay
      });
    }

    // Initialize both desktop and mobile search inputs
    handleSearchInput(searchInput);
    handleSearchInput(searchInputMobile);
  }

  /**
   * Search Products by Term
   */
  function searchProducts(products, searchTerm) {
    return products.filter(product => {
      const searchableText = `
        ${product.name}
        ${product.category}
        ${product.price.display}
      `.toLowerCase();

      return searchableText.includes(searchTerm.toLowerCase());
    });
  }

  /**
   * Initialize categories page module
   */
  function init() {
    console.log('🛍️ Categories page (all products) - Initializing...');

    initCategoryFilters();
    initializeSearch();
    loadProducts();
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose public API
  window.CategoriesAllManager = {
    loadProducts,
    filterByCategory,
    sortProducts,
    getAllProducts: () => allProducts,
    getFilteredProducts: () => filteredProducts
  };

})();
