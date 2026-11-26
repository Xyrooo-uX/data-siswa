import toast from 'react-hot-toast';

export default function confirmToast({
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  destructive = false
}) {
  return new Promise((resolve) => {
    let toastId;
    const close = (confirmed) => {
      toast.dismiss(toastId);
      resolve(confirmed);
    };

    toastId = toast.custom(
      () => (
        <div className="toast-confirm" role="dialog" aria-label="Konfirmasi tindakan">
          <p>{message}</p>
          <div className="toast-confirm__actions">
            <button type="button" className="toast-confirm__cancel" onClick={() => close(false)}>
              {cancelText}
            </button>
            <button
              type="button"
              className={`toast-confirm__accept ${destructive ? 'is-destructive' : ''}`}
              onClick={() => close(true)}
            >
              {confirmText}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: 'top-center' }
    );
  });
}
