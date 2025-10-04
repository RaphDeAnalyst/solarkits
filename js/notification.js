/**
 * Solarkits - Notification System
 * Beautiful toast notifications for user feedback
 */

(function() {
  'use strict';

  let notificationContainer = null;
  let notificationIdCounter = 0;

  /**
   * Initialize notification container
   */
  function initContainer() {
    if (notificationContainer) return;

    notificationContainer = document.createElement('div');
    notificationContainer.className = 'notification-container';
    notificationContainer.id = 'notification-container';
    document.body.appendChild(notificationContainer);
  }

  /**
   * Get icon for notification type
   */
  function getIcon(type) {
    const icons = {
      success: '✓',
      error: '✕',
      warning: '!',
      info: 'i'
    };
    return icons[type] || icons.info;
  }

  /**
   * Get title for notification type
   */
  function getDefaultTitle(type) {
    const titles = {
      success: 'Success',
      error: 'Error',
      warning: 'Warning',
      info: 'Info'
    };
    return titles[type] || 'Notification';
  }

  /**
   * Show a notification
   * @param {string} message - The message to display
   * @param {object} options - Configuration options
   * @param {string} options.type - Type: 'success', 'error', 'warning', 'info'
   * @param {string} options.title - Custom title (optional)
   * @param {number} options.duration - Duration in ms (default: 5000)
   * @param {boolean} options.closable - Show close button (default: true)
   */
  function show(message, options = {}) {
    initContainer();

    const {
      type = 'info',
      title = getDefaultTitle(type),
      duration = 5000,
      closable = true
    } = options;

    const notificationId = `notification-${notificationIdCounter++}`;

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification--${type}`;
    notification.id = notificationId;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');

    // Build notification HTML
    notification.innerHTML = `
      <div class="notification__icon">${getIcon(type)}</div>
      <div class="notification__content">
        <div class="notification__title">${escapeHtml(title)}</div>
        <div class="notification__message">${escapeHtml(message)}</div>
      </div>
      ${closable ? '<button class="notification__close" aria-label="Close notification">&times;</button>' : ''}
    `;

    // Add to container
    notificationContainer.appendChild(notification);

    // Trigger animation
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });

    // Setup close button
    if (closable) {
      const closeBtn = notification.querySelector('.notification__close');
      closeBtn.addEventListener('click', () => {
        hide(notificationId);
      });
    }

    // Auto-hide after duration
    if (duration > 0) {
      setTimeout(() => {
        hide(notificationId);
      }, duration);
    }

    return notificationId;
  }

  /**
   * Hide a notification
   */
  function hide(notificationId) {
    const notification = document.getElementById(notificationId);
    if (!notification) return;

    notification.classList.remove('show');
    notification.classList.add('hide');

    // Remove from DOM after animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }

  /**
   * Hide all notifications
   */
  function hideAll() {
    if (!notificationContainer) return;

    const notifications = notificationContainer.querySelectorAll('.notification');
    notifications.forEach(notification => {
      hide(notification.id);
    });
  }

  /**
   * Shortcut methods for different notification types
   */
  function success(message, options = {}) {
    return show(message, { ...options, type: 'success' });
  }

  function error(message, options = {}) {
    return show(message, { ...options, type: 'error' });
  }

  function warning(message, options = {}) {
    return show(message, { ...options, type: 'warning' });
  }

  function info(message, options = {}) {
    return show(message, { ...options, type: 'info' });
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
   * Initialize on page load
   */
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initContainer);
    } else {
      initContainer();
    }
  }

  // Auto-initialize
  init();

  // Expose API globally
  window.Notification = window.Notification || {};
  window.Notification.show = show;
  window.Notification.hide = hide;
  window.Notification.hideAll = hideAll;
  window.Notification.success = success;
  window.Notification.error = error;
  window.Notification.warning = warning;
  window.Notification.info = info;

  // For convenience, also expose as notify
  window.notify = {
    show,
    hide,
    hideAll,
    success,
    error,
    warning,
    info
  };

  console.log('🔔 Notification system ready!');

})();
