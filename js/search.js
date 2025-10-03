/**
 * Solarkits - Search Functionality
 * Handles product search and filtering
 */

(function() {
  'use strict';

  // DOM Elements
  const searchInput = document.getElementById('search-input');
  const searchButton = document.querySelector('.search__button');

  // Search state
  let searchTerm = '';
  let debounceTimer = null;

  /**
   * Perform search on products
   */
  function performSearch(query) {
    searchTerm = query.toLowerCase().trim();

    if (!window.ProductManager) {
      console.error('ProductManager not loaded');
      return;
    }

    const allProducts = window.ProductManager.getAllProducts();

    if (!searchTerm) {
      // If search is empty, show all products in current category
      window.ProductManager.loadProducts();
      return;
    }

    // Filter products by search term
    const results = allProducts.filter(product => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const categoryMatch = product.category.toLowerCase().includes(searchTerm);
      const tagsMatch = product.tags?.some(tag => tag.toLowerCase().includes(searchTerm));

      return nameMatch || categoryMatch || tagsMatch;
    });

    console.log(`🔍 Search for "${query}": ${results.length} results`);

    // Update the product grid with search results
    updateSearchResults(results);
  }

  /**
   * Update display with search results
   */
  function updateSearchResults(products) {
    // Temporarily override filtered products
    const productsGrid = document.getElementById('products-grid');
    const productsCount = document.getElementById('products-count');
    const noResultsEl = document.getElementById('no-results');

    if (!productsGrid) return;

    // Clear grid
    productsGrid.innerHTML = '';

    // Update count
    if (productsCount) {
      productsCount.textContent = products.length;
    }

    // Show no results if empty
    if (products.length === 0) {
      if (noResultsEl) {
        noResultsEl.style.display = 'block';
      }
      return;
    }

    // Hide no results
    if (noResultsEl) {
      noResultsEl.style.display = 'none';
    }

    // Render products
    products.forEach(product => {
      const card = createProductCard(product);
      productsGrid.appendChild(card);
    });

    // Re-initialize affiliate tracking
    if (window.SolarKits && window.SolarKits.initAffiliateTracking) {
      window.SolarKits.initAffiliateTracking();
    }
  }

  /**
   * Create product card (simplified version)
   */
  function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';

    let ctaButtons = '';

    if (product.affiliates.amazon?.available) {
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

    if (product.affiliates.aliexpress?.available) {
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

    let badge = '';
    if (product.metadata.featured) {
      badge = '<span class="product-card__badge">Featured</span>';
    }

    // Format price update date
    const priceDate = formatPriceDate(product.metadata.lastPriceCheck);
    const priceDateHtml = priceDate ? `<div class="product-card__price-date">${escapeHtml(priceDate)}</div>` : '';

    card.innerHTML = `
      <div class="product-card__image-wrapper">
        <img
          src="${escapeHtml(product.image.thumb)}"
          alt="${escapeHtml(product.name)}"
          class="product-card__image product-card__image--clickable"
          loading="lazy"
          title="Click to view gallery">
        ${badge}
      </div>
      <div class="product-card__content">
        <div class="product-card__category">${escapeHtml(getCategoryName(product.category))}</div>
        <h3 class="product-card__title">${highlightSearchTerm(product.name, searchTerm)}</h3>
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
          window.Lightbox.open(product.image.gallery, 0);
        }
      });
    }

    return card;
  }

  /**
   * Highlight search term in text
   */
  function highlightSearchTerm(text, term) {
    if (!term) return escapeHtml(text);

    const escapedText = escapeHtml(text);
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');

    return escapedText.replace(regex, '<mark style="background-color: var(--color-accent); padding: 0 4px; border-radius: 2px;">$1</mark>');
  }

  /**
   * Escape special regex characters
   */
  function escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
   * Debounce search input
   */
  function debounceSearch(value) {
    clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      performSearch(value);
    }, 300); // Wait 300ms after user stops typing
  }

  /**
   * Initialize search functionality
   */
  function initSearch() {
    if (!searchInput) {
      console.warn('Search input not found');
      return;
    }

    // Search on input
    searchInput.addEventListener('input', (e) => {
      debounceSearch(e.target.value);
    });

    // Search on button click
    if (searchButton) {
      searchButton.addEventListener('click', () => {
        performSearch(searchInput.value);
      });
    }

    // Search on Enter key
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        clearTimeout(debounceTimer);
        performSearch(searchInput.value);
      }
    });

    // Clear search when input is cleared
    searchInput.addEventListener('search', (e) => {
      if (e.target.value === '') {
        performSearch('');
      }
    });
  }

  /**
   * Clear search
   */
  function clearSearch() {
    if (searchInput) {
      searchInput.value = '';
      performSearch('');
    }
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }

  console.log('🔍 Search module - Ready');

  // Expose public API
  window.SearchManager = {
    performSearch,
    clearSearch,
    getCurrentSearchTerm: () => searchTerm
  };

})();
