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
   * Mobile Navigation Toggle
   */
  function initMobileNav() {
    if (!navToggle || !navMenu) return;

    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('show');
      navToggle.classList.toggle('active');
    });

    // Close menu when clicking nav links
    const navLinks = document.querySelectorAll('.nav__link');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('show');
        navToggle.classList.remove('active');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove('show');
        navToggle.classList.remove('active');
      }
    });
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
        alert('Please enter a valid email address.');
        return;
      }

      // TODO: Connect to actual email service (Mailchimp, SendGrid, etc.)
      console.log('Newsletter signup:', email);

      // Temporary success message
      alert('Thank you for subscribing! 🎉');
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
   */
  function updateActiveNavLink() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav__link');

    navLinks.forEach(link => {
      const linkPath = new URL(link.href).pathname;

      if (linkPath === currentPath) {
        link.classList.add('nav__link--active');
      } else {
        link.classList.remove('nav__link--active');
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
