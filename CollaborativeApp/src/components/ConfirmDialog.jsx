import { X } from 'lucide-react'

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}) {
  if (!isOpen) return null

  const variantStyles = {
    danger: {
      confirmClass: 'btn-danger',
      titleClass: 'text-red-600'
    },
    warning: {
      confirmClass: 'btn-primary',
      titleClass: 'text-yellow-600'
    },
    info: {
      confirmClass: 'btn-primary',
      titleClass: 'text-blue-600'
    }
  }

  const styles = variantStyles[variant] || variantStyles.danger

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className={`modal-title ${styles.titleClass}`}>{title}</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={onClose}>
            {cancelText}
          </button>
          <button
            className={`btn ${styles.confirmClass}`}
            onClick={() => {
              onConfirm()
              onClose()
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
