/**
 * Unified Search Filter
 * Simple client-side filtering for products and blog posts
 * Uses the same logic as the blog page for consistency
 */

(function() {
  'use strict';

  /**
   * Initialize search for blog posts
   * @param {HTMLInputElement} searchInput - The search input element
   * @param {Array} allPosts - Array of all blog posts
   * @param {Function} displayCallback - Function to call to display filtered results
   * @param {String} currentCategory - Current active category filter
   * @param {Function} getCategoryPosts - Function to get posts for current category
   */
  function initBlogSearch(searchInput, allPosts, displayCallback, getCategoryPosts) {
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length === 0) {
          // Reset to showing all posts from current category
          const categoryPosts = getCategoryPosts();
          displayCallback(categoryPosts);
          return;
        }

        // Get posts to search (respects current category filter)
        const postsToSearch = getCategoryPosts();

        // Apply search filter
        const filteredPosts = filterBlogPosts(postsToSearch, searchTerm);
        displayCallback(filteredPosts);

        console.log(`🔍 Blog Search: "${searchTerm}" - ${filteredPosts.length} results`);
      }, 300); // Debounce delay
    });
  }

  /**
   * Filter blog posts by search term
   * Searches in: title, excerpt, category, tags, author
   */
  function filterBlogPosts(posts, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return posts.filter(post => {
      const searchableText = `
        ${post.title}
        ${post.excerpt}
        ${post.category}
        ${post.tags ? post.tags.join(' ') : ''}
        ${post.author || ''}
      `.toLowerCase();

      return searchableText.includes(lowerSearchTerm);
    });
  }

  /**
   * Initialize search for products
   * @param {HTMLInputElement} searchInput - The search input element
   * @param {Array} allProducts - Array of all products
   * @param {Function} displayCallback - Function to call to display filtered results
   * @param {String} currentCategory - Current active category filter
   * @param {Function} getCategoryProducts - Function to get products for current category
   */
  function initProductSearch(searchInput, allProducts, displayCallback, getCategoryProducts) {
    if (!searchInput) return;

    let debounceTimer;

    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);

      debounceTimer = setTimeout(() => {
        const searchTerm = searchInput.value.trim();

        if (searchTerm.length === 0) {
          // Reset to showing all products from current category
          const categoryProducts = getCategoryProducts();
          displayCallback(categoryProducts);
          return;
        }

        // Get products to search (respects current category filter)
        const productsToSearch = getCategoryProducts();

        // Apply search filter
        const filteredProducts = filterProducts(productsToSearch, searchTerm);
        displayCallback(filteredProducts);

        console.log(`🔍 Product Search: "${searchTerm}" - ${filteredProducts.length} results`);
      }, 300); // Debounce delay
    });
  }

  /**
   * Filter products by search term
   * Searches in: name, category, tags
   */
  function filterProducts(products, searchTerm) {
    const lowerSearchTerm = searchTerm.toLowerCase();

    return products.filter(product => {
      const searchableText = `
        ${product.name}
        ${product.category}
        ${product.tags ? product.tags.join(' ') : ''}
      `.toLowerCase();

      return searchableText.includes(lowerSearchTerm);
    });
  }

  // Export to window
  window.UnifiedSearch = {
    initBlogSearch,
    initProductSearch,
    filterBlogPosts,
    filterProducts
  };

})();
