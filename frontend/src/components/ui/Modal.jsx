import { CloseIcon } from '../icons';
import '../../styles/components/modals.css';

/**
 * Modal component with compound pattern
 * Replaces: .modal-overlay, .modal-content, .modal-header, .modal-body, .modal-footer
 */

export function Modal({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal-content ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

Modal.Header = function ModalHeader({ children, onClose, disabled = false, className = '' }) {
  return (
    <div className={`modal-header ${className}`.trim()}>
      {children}
      {onClose && (
        <button
          onClick={onClose}
          className="modal-close-btn"
          disabled={disabled}
          type="button"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
};

Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`modal-body ${className}`.trim()}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`modal-footer ${className}`.trim()}>
      {children}
    </div>
  );
};

Modal.Title = function ModalTitle({ children, className = '' }) {
  return (
    <h2 className={`modal-title ${className}`.trim()}>
      {children}
    </h2>
  );
};
