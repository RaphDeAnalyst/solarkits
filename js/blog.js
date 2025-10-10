/**
 * Solarkits - Blog Module
 * Handles blog post loading, filtering, and display
 */

(function() {
  'use strict';

  let allBlogPosts = [];
  let filteredPosts = [];
  let currentCategory = 'all';

  // DOM Elements
  const blogGrid = document.getElementById('blog-grid');
  const blogNoResults = document.getElementById('blog-no-results');
  const filterButtons = document.querySelectorAll('.blog-filter__btn');
  const searchInput = document.getElementById('blog-search-input');

  /**
   * Initialize Blog Module
   */
  function init() {
    console.log('📝 Blog module - Initializing...');

    if (!blogGrid) {
      console.warn('Blog grid not found - blog.js may be loaded on a non-blog page');
      return;
    }

    loadBlogPosts();
    initializeFilters();
    initializeSearch();

    console.log('✅ Blog module - Ready!');
  }

  /**
   * Load Blog Posts from JSON
   */
  async function loadBlogPosts() {
    try {
      const response = await fetch('/api/public/blog');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      allBlogPosts = data.posts || [];
      filteredPosts = [...allBlogPosts];

      console.log(`📦 Loaded ${allBlogPosts.length} blog posts`);

      displayBlogPosts(filteredPosts);
    } catch (error) {
      console.error('Error loading blog posts:', error);
      showError('Failed to load blog posts. Please try again later.');
    }
  }

  /**
   * Display Blog Posts in Grid
   */
  function displayBlogPosts(posts) {
    if (!blogGrid) return;

    // Clear loading state
    blogGrid.innerHTML = '';

    if (posts.length === 0) {
      showNoResults();
      return;
    }

    hideNoResults();

    // Create blog cards
    posts.forEach(post => {
      const card = createBlogCard(post);
      blogGrid.appendChild(card);
    });
  }

  /**
   * Create Blog Card Element
   */
  function createBlogCard(post) {
    const card = document.createElement('div');
    card.className = 'blog-card';
    card.setAttribute('data-category', post.category);

    card.innerHTML = `
      <a href="/blog/${post.slug}" class="blog-card__link">
        <div class="blog-card__image">
          <img src="${post.featuredImage}" alt="${escapeHtml(post.title)}" loading="lazy">
          <span class="blog-card__category">${escapeHtml(post.category)}</span>
        </div>
        <div class="blog-card__content">
          <h3 class="blog-card__title">${escapeHtml(post.title)}</h3>
          <p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
          <div class="blog-card__meta">
            <span class="blog-card__date">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              ${formatDate(post.date)}
            </span>
            <span class="blog-card__author">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              ${escapeHtml(post.author)}
            </span>
          </div>
          <span class="blog-card__read-more">
            Read More
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </span>
        </div>
      </a>
    `;

    return card;
  }

  /**
   * Initialize Category Filters
   */
  function initializeFilters() {
    if (!filterButtons || filterButtons.length === 0) return;

    filterButtons.forEach(button => {
      button.addEventListener('click', function() {
        const category = this.getAttribute('data-category');
        currentCategory = category;

        // Update active state
        filterButtons.forEach(btn => btn.classList.remove('blog-filter__btn--active'));
        this.classList.add('blog-filter__btn--active');

        // Filter posts
        filterPosts(category);
      });
    });
  }

  /**
   * Filter Posts by Category
   */
  function filterPosts(category) {
    if (category === 'all') {
      filteredPosts = [...allBlogPosts];
    } else {
      filteredPosts = allBlogPosts.filter(post => post.category === category);
    }

    // Apply search filter if active
    const searchTerm = searchInput ? searchInput.value.trim() : '';
    if (searchTerm) {
      filteredPosts = searchPosts(filteredPosts, searchTerm);
    }

    displayBlogPosts(filteredPosts);

    console.log(`🔍 Filtered to ${filteredPosts.length} posts (category: ${category})`);
  }

  /**
   * Initialize Search
   */
  function initializeSearch() {
    if (!searchInput) return;

    let searchTimeout;

    searchInput.addEventListener('input', function() {
      clearTimeout(searchTimeout);

      searchTimeout = setTimeout(() => {
        const searchTerm = this.value.trim().toLowerCase();

        if (searchTerm.length === 0) {
          // Reset to current category filter
          filterPosts(currentCategory);
          return;
        }

        // Get posts from current category filter
        let postsToSearch = currentCategory === 'all'
          ? [...allBlogPosts]
          : allBlogPosts.filter(post => post.category === currentCategory);

        // Apply search
        filteredPosts = searchPosts(postsToSearch, searchTerm);
        displayBlogPosts(filteredPosts);

        console.log(`🔍 Search: "${searchTerm}" - ${filteredPosts.length} results`);
      }, 300); // Debounce delay
    });
  }

  /**
   * Search Posts by Term
   */
  function searchPosts(posts, searchTerm) {
    return posts.filter(post => {
      const searchableText = `
        ${post.title}
        ${post.excerpt}
        ${post.category}
        ${post.tags.join(' ')}
        ${post.author}
      `.toLowerCase();

      return searchableText.includes(searchTerm.toLowerCase());
    });
  }

  /**
   * Show No Results Message
   */
  function showNoResults() {
    if (blogNoResults) {
      blogNoResults.style.display = 'block';
    }
  }

  /**
   * Hide No Results Message
   */
  function hideNoResults() {
    if (blogNoResults) {
      blogNoResults.style.display = 'none';
    }
  }

  /**
   * Show Error Message
   */
  function showError(message) {
    if (blogGrid) {
      blogGrid.innerHTML = `
        <div class="error-message">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Oops! Something went wrong</h3>
          <p>${escapeHtml(message)}</p>
        </div>
      `;
    }
  }

  /**
   * Format Date
   */
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  }

  /**
   * Escape HTML to prevent XSS
   */
  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  /**
   * Start initialization
   */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose blog module globally if needed
  window.BlogModule = {
    loadBlogPosts,
    filterPosts,
    version: '1.0.0'
  };

})();
