/**
 * Solarkits - Main JavaScript
 * Handles navigation, scroll effects, and general UI interactions
 */

(function() {
  'use strict';

  // DOM Elements
  const navToggle = document.getElementById('nav-toggle');
  const navMenu = document.getElementById('nav-menu');
  const scrollTopBtn = document.getElementById('scroll-top');
  const header = document.getElementById('header');
  const newsletterForm = document.getElementById('newsletter-form');

  /**
   * Mobile Navigation Toggle - Enhanced with Accessibility
   */
  function initMobileNav() {
    if (!navToggle || !navMenu) return;

    const navBackdrop = document.getElementById('nav-backdrop');
    const body = document.body;

    // Toggle menu function
    function toggleMenu() {
      const isOpen = navMenu.classList.contains('show');

      if (isOpen) {
        closeMenu();
      } else {
        openMenu();
      }
    }

    // Open menu
    function openMenu() {
      navMenu.classList.add('show');
      navToggle.classList.add('active');
      navBackdrop?.classList.add('show');
      body.classList.add('nav-open');

      // Update ARIA
      navToggle.setAttribute('aria-expanded', 'true');
      navMenu.setAttribute('aria-hidden', 'false');

      // Focus first link for accessibility
      const firstLink = navMenu.querySelector('.nav__link');
      setTimeout(() => firstLink?.focus(), 300);
    }

    // Close menu
    function closeMenu() {
      navMenu.classList.remove('show');
      navToggle.classList.remove('active');
      navBackdrop?.classList.remove('show');
      body.classList.remove('nav-open');

      // Update ARIA
      navToggle.setAttribute('aria-expanded', 'false');
      navMenu.setAttribute('aria-hidden', 'true');
    }

    // Toggle button click
    navToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu();
    });

    // Close menu when clicking nav links (auto-close on navigation)
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        setTimeout(closeMenu, 150); // Slight delay for visual feedback
      });
    });

    // Close menu when clicking backdrop
    navBackdrop?.addEventListener('click', closeMenu);

    // Close menu when clicking outside (desktop)
    document.addEventListener('click', (e) => {
      if (window.innerWidth > 768) return; // Only on mobile

      if (!navMenu.contains(e.target) &&
          !navToggle.contains(e.target) &&
          navMenu.classList.contains('show')) {
        closeMenu();
      }
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('show')) {
        closeMenu();
        navToggle.focus(); // Return focus to toggle button
      }
    });

    // Handle window resize - close menu if resizing to desktop
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth > 768 && navMenu.classList.contains('show')) {
          closeMenu();
        }
      }, 250);
    });

    // Mobile search toggle
    const searchToggle = document.getElementById('mobile-search-toggle');
    const navSearch = document.querySelector('.nav__search');

    if (searchToggle && navSearch) {
      searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isShowing = navSearch.classList.contains('nav__search--mobile-visible');

        if (isShowing) {
          navSearch.classList.remove('nav__search--mobile-visible');
        } else {
          navSearch.classList.add('nav__search--mobile-visible');

          // Focus search input when opened
          const searchInput = navSearch.querySelector('input');
          setTimeout(() => searchInput?.focus(), 100);
        }

        // Close menu if open
        if (navMenu.classList.contains('show')) {
          closeMenu();
        }
      });

      // Close search when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth > 768) return;

        if (!navSearch.contains(e.target) &&
            !searchToggle.contains(e.target) &&
            navSearch.classList.contains('nav__search--mobile-visible')) {
          navSearch.classList.remove('nav__search--mobile-visible');
        }
      });

      // Close search on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navSearch.classList.contains('nav__search--mobile-visible')) {
          navSearch.classList.remove('nav__search--mobile-visible');
          searchToggle.focus();
        }
      });
    }
  }

  /**
   * Scroll to Top Button
   */
  function initScrollToTop() {
    if (!scrollTopBtn) return;

    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        scrollTopBtn.classList.add('show');
      } else {
        scrollTopBtn.classList.remove('show');
      }
    });

    // Scroll to top on click
    scrollTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /**
   * Smooth Scrolling for Anchor Links
   */
  function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');

        // Skip empty hashes
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const headerOffset = 80;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  /**
   * Header Shadow on Scroll
   */
  function initHeaderShadow() {
    if (!header) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.05)';
      }
    });
  }

  /**
   * Newsletter Form Handler
   */
  function initNewsletter() {
    if (!newsletterForm) return;

    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const emailInput = newsletterForm.querySelector('input[type="email"]');
      const email = emailInput.value.trim();

      if (!email) {
        if (window.notify) {
          window.notify.warning('Please enter a valid email address.');
        }
        return;
      }

      // TODO: Connect to actual email service (Mailchimp, SendGrid, etc.)
      console.log('Newsletter signup:', email);

      // Success message
      if (window.notify) {
        window.notify.success('Thank you for subscribing! We\'ll keep you updated with the latest solar deals.');
      }
      emailInput.value = '';
    });
  }

  /**
   * Lazy Load Images
   */
  function initLazyLoad() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
          }
        });
      });

      const lazyImages = document.querySelectorAll('img.lazy');
      lazyImages.forEach(img => imageObserver.observe(img));
    }
  }

  /**
   * Track Affiliate Link Clicks
   */
  function initAffiliateTracking() {
    const affiliateLinks = document.querySelectorAll('a[href*="amazon"], a[href*="aliexpress"]');

    affiliateLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const platform = link.href.includes('amazon') ? 'Amazon' : 'AliExpress';
        const productName = link.closest('.product-card')?.querySelector('.product-card__title')?.textContent || 'Unknown';

        // Track the click (integrate with Google Analytics or other service)
        console.log('Affiliate click:', {
          platform,
          product: productName,
          url: link.href,
          timestamp: new Date().toISOString()
        });

        // TODO: Send to analytics service
        // if (typeof gtag !== 'undefined') {
        //   gtag('event', 'affiliate_click', {
        //     platform: platform,
        //     product_name: productName
        //   });
        // }
      });
    });
  }

  /**
   * Add Active State to Navigation
   * Handles proper active state for navigation links without hash conflicts
   */
  function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
      try {
        const linkURL = new URL(link.href);
        const linkPath = linkURL.pathname;
        const hasHash = linkURL.hash;

        // Skip hash-only links (like #categories on same page)
        if (hasHash && linkPath === currentPath) {
          link.classList.remove('nav__link--active');
          return;
        }

        // Match exact pathname
        if (linkPath === currentPath ||
            (linkPath + '/' === currentPath) ||
            (linkPath === currentPath + '/')) {
          link.classList.add('nav__link--active');
        } else {
          link.classList.remove('nav__link--active');
        }
      } catch (error) {
        // Skip invalid URLs
        console.warn('Invalid nav link URL:', link.href);
      }
    });
  }

  /**
   * Performance: Log Page Load Time
   */
  function logPerformance() {
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`Page load time: ${(pageLoadTime / 1000).toFixed(2)}s`);

        // Log to console if load time exceeds target
        if (pageLoadTime > 2000) {
          console.warn('⚠️ Page load time exceeds 2s target!');
        } else {
          console.log('✅ Page load time within target (<2s)');
        }
      }
    });
  }

  /**
   * Initialize All Functions
   */
  function init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
      return;
    }

    console.log('🌞 Solarkits - Initializing...');

    initMobileNav();
    initScrollToTop();
    initSmoothScroll();
    initHeaderShadow();
    initNewsletter();
    initLazyLoad();
    updateActiveNavLink();
    logPerformance();

    // Re-initialize affiliate tracking after products load
    setTimeout(() => {
      initAffiliateTracking();
    }, 1000);

    console.log('✅ Solarkits - Ready!');
  }

  // Start initialization
  init();

  // Expose utility functions globally if needed
  window.SolarKits = {
    initAffiliateTracking,
    version: '1.0.0'
  };

})();
