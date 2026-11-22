// Modal Controller Module Pattern
const ModalController = (() => {
  // Cache DOM references
  const modals = {
    feature: {
      element: document.getElementById('featureModal'),
      title: document.getElementById('modalTitle'),
      content: document.getElementById('modalText'),
      close: document.getElementById('featureModalClose')
    },
    footer: {
      element: document.getElementById('footerModal'),
      close: document.getElementById('modalClose')
    }
  };

  // Configuration
  const config = {
    bodyLockClass: 'overflow-hidden',
    modalActiveClass: 'is-active',
    animationDuration: 300
  };

  // Private methods
  const _lockBody = () => {
    document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
    document.body.classList.add(config.bodyLockClass);
  };

  const _unlockBody = () => {
    document.body.classList.remove(config.bodyLockClass);
    document.body.style.paddingRight = '';
  };

  const _handleKeydown = (event) => {
    if (event.key === 'Escape') {
      closeActiveModals();
    }
  };

  // Public methods
  return {
    init() {
      // Event Delegation for all modal triggers
      document.body.addEventListener('click', (event) => {
        const trigger = event.target.closest('[data-modal-target]');
        if (trigger) {
          const targetModal = trigger.dataset.modalTarget;
          const title = trigger.dataset.modalTitle || '';
          const content = trigger.dataset.modalContent || '';
          this.openModal(targetModal, { title, content });
        }
      });

      // Close buttons
      Object.values(modals).forEach(modal => {
        if (modal.close) {
          modal.close.addEventListener('click', () => this.closeModal(modal.element));
        }
      });

      // Backdrop click
      Object.values(modals).forEach(modal => {
        if (modal.element) {
          modal.element.addEventListener('click', (event) => {
            if (event.target === modal.element) {
              this.closeModal(modal.element);
            }
          });
        }
      });

      // Keyboard close
      document.addEventListener('keydown', _handleKeydown);
    },

    openModal(modalId, content = {}) {
      const modal = modals[modalId];
      if (!modal?.element) return;

      // Set content
      if (modal.title && content.title) {
        modal.title.textContent = content.title;
      }
      if (modal.content && content.content) {
        modal.content.textContent = content.content;
      }

      // Accessibility
      modal.element.setAttribute('aria-hidden', 'false');
      modal.element.setAttribute('role', 'dialog');
      modal.element.setAttribute('aria-modal', 'true');

      // Visuals
      modal.element.classList.add(config.modalActiveClass);
      _lockBody();

      // Focus management
      const focusTarget = modal.element.querySelector('[autofocus]') || modal.close;
      focusTarget?.focus();
    },

    closeModal(modalElement) {
      if (!modalElement) return;

      // Accessibility
      modalElement.setAttribute('aria-hidden', 'true');
      modalElement.removeAttribute('aria-modal');
      modalElement.removeAttribute('role');

      // Visuals
      modalElement.classList.remove(config.modalActiveClass);
      _unlockBody();
    },

    closeActiveModals() {
      Object.values(modals).forEach(modal => {
        if (modal.element?.classList.contains(config.modalActiveClass)) {
          this.closeModal(modal.element);
        }
      });
    }
  };
})();

// Initialize modal system
document.addEventListener('DOMContentLoaded', () => ModalController.init());