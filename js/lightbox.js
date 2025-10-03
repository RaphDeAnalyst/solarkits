/**
 * Solarkits - Lightbox Image Gallery
 * Full-screen image viewer with navigation
 */

(function() {
  'use strict';

  // Lightbox state
  let currentImages = [];
  let currentIndex = 0;
  let isOpen = false;

  // DOM Elements (will be initialized when DOM is ready)
  let lightbox = null;
  let lightboxImage = null;
  let lightboxClose = null;
  let lightboxPrev = null;
  let lightboxNext = null;
  let lightboxCounter = null;

  /**
   * Initialize lightbox elements
   */
  function initLightbox() {
    lightbox = document.getElementById('lightbox');
    lightboxImage = document.querySelector('.lightbox__image');
    lightboxClose = document.querySelector('.lightbox__close');
    lightboxPrev = document.querySelector('.lightbox__prev');
    lightboxNext = document.querySelector('.lightbox__next');
    lightboxCounter = document.querySelector('.lightbox__counter');

    if (!lightbox) {
      console.warn('Lightbox HTML not found. Make sure lightbox markup is in index.html');
      return false;
    }

    // Event listeners
    lightboxClose?.addEventListener('click', closeLightbox);
    lightboxPrev?.addEventListener('click', showPreviousImage);
    lightboxNext?.addEventListener('click', showNextImage);

    // Click outside image to close
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', handleKeyboard);

    console.log('🖼️ Lightbox - Initialized');
    return true;
  }

  /**
   * Open lightbox with gallery images
   * @param {Array} images - Array of image URLs
   * @param {Number} startIndex - Index to start at (default 0)
   */
  function openLightbox(images, startIndex = 0) {
    if (!lightbox) {
      console.error('Lightbox not initialized');
      return;
    }

    if (!images || images.length === 0) {
      console.warn('No images provided to lightbox');
      return;
    }

    currentImages = images;
    currentIndex = startIndex;
    isOpen = true;

    // Show lightbox
    lightbox.classList.add('lightbox--active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling

    // Display current image
    updateImage();
  }

  /**
   * Close lightbox
   */
  function closeLightbox() {
    if (!isOpen) return;

    isOpen = false;
    lightbox.classList.remove('lightbox--active');
    document.body.style.overflow = ''; // Restore scrolling

    // Clear state
    currentImages = [];
    currentIndex = 0;
  }

  /**
   * Show previous image in gallery
   */
  function showPreviousImage() {
    if (currentImages.length === 0) return;

    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateImage();
  }

  /**
   * Show next image in gallery
   */
  function showNextImage() {
    if (currentImages.length === 0) return;

    currentIndex = (currentIndex + 1) % currentImages.length;
    updateImage();
  }

  /**
   * Update displayed image and counter
   */
  function updateImage() {
    if (!lightboxImage || !currentImages[currentIndex]) return;

    // Update image
    lightboxImage.src = currentImages[currentIndex];
    lightboxImage.alt = `Product image ${currentIndex + 1} of ${currentImages.length}`;

    // Update counter
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${currentImages.length}`;
    }

    // Show/hide navigation buttons for single image
    if (currentImages.length === 1) {
      lightboxPrev?.classList.add('lightbox__nav--hidden');
      lightboxNext?.classList.add('lightbox__nav--hidden');
    } else {
      lightboxPrev?.classList.remove('lightbox__nav--hidden');
      lightboxNext?.classList.remove('lightbox__nav--hidden');
    }
  }

  /**
   * Handle keyboard navigation
   */
  function handleKeyboard(e) {
    if (!isOpen) return;

    switch(e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        showPreviousImage();
        break;
      case 'ArrowRight':
        showNextImage();
        break;
    }
  }

  /**
   * Public API
   */
  window.Lightbox = {
    init: initLightbox,
    open: openLightbox,
    close: closeLightbox,
    isOpen: () => isOpen
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLightbox);
  } else {
    initLightbox();
  }

})();
