// SweetAlert wrapper & fallback engine
// Mendukung pemanggilan via SweetAlert2 CDN (window.Swal) serta modal fallback mandiri jika offline

export const Swal = {
  fire: function (titleOrOptions, textParam, iconParam) {
    let options = {};

    if (typeof titleOrOptions === 'object') {
      options = { ...titleOrOptions };
    } else {
      options = {
        title: titleOrOptions || '',
        text: textParam || '',
        icon: iconParam || 'info'
      };
    }

    // 1. Jika SweetAlert2 dari CDN sudah terpasang di window
    if (typeof window !== 'undefined' && window.Swal && window.Swal.fire) {
      return window.Swal.fire(options);
    }

    // 2. Fallback SweetAlert DOM UI (100% offline resilient)
    return new Promise((resolve) => {
      // Hapus swal container lama jika ada
      const existing = document.getElementById('custom-swal-container');
      if (existing) existing.remove();

      const container = document.createElement('div');
      container.id = 'custom-swal-container';
      container.className = 'swal2-container swal2-center swal2-backdrop-show';

      // Icon generator SVG
      let iconHtml = '';
      if (options.icon === 'success') {
        iconHtml = `
          <div class="swal-icon swal-icon--success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>`;
      } else if (options.icon === 'error') {
        iconHtml = `
          <div class="swal-icon swal-icon--error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </div>`;
      } else if (options.icon === 'warning') {
        iconHtml = `
          <div class="swal-icon swal-icon--warning">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>`;
      } else {
        iconHtml = `
          <div class="swal-icon swal-icon--info">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>`;
      }

      const showCancel = options.showCancelButton || false;
      const confirmText = options.confirmButtonText || 'OK';
      const cancelText = options.cancelButtonText || 'Batal';
      const confirmColor = options.confirmButtonColor || '#2563eb';

      container.innerHTML = `
        <div class="swal2-popup" role="dialog" aria-modal="true">
          ${iconHtml}
          ${options.title ? `<h2 class="swal2-title">${options.title}</h2>` : ''}
          ${options.text ? `<div class="swal2-html-container">${options.text}</div>` : ''}
          <div class="swal2-actions">
            ${showCancel ? `<button type="button" class="swal2-cancel swal2-styled">${cancelText}</button>` : ''}
            <button type="button" class="swal2-confirm swal2-styled" style="background-color: ${confirmColor}">${confirmText}</button>
          </div>
        </div>
      `;

      document.body.appendChild(container);

      const confirmBtn = container.querySelector('.swal2-confirm');
      const cancelBtn = container.querySelector('.swal2-cancel');

      const cleanup = (result) => {
        container.remove();
        resolve(result);
      };

      if (confirmBtn) {
        confirmBtn.onclick = () => cleanup({ isConfirmed: true, isDenied: false, isDismissed: false });
      }

      if (cancelBtn) {
        cancelBtn.onclick = () => cleanup({ isConfirmed: false, isDenied: false, isDismissed: true });
      }

      // Close on backdrop click if desired
      container.onclick = (e) => {
        if (e.target === container) {
          cleanup({ isConfirmed: false, isDenied: false, isDismissed: true });
        }
      };

      // Auto timer jika diset
      if (options.timer) {
        setTimeout(() => {
          cleanup({ isConfirmed: true, isDenied: false, isDismissed: false });
        }, options.timer);
      }
    });
  }
};

export default Swal;

