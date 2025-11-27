/**
 * Modal component with compound pattern
 * Replaces: .modal-overlay, .modal-content, .modal-header, .modal-body, .modal-footer
 */

export function Modal({ isOpen, onClose, children, className = '' }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-md w-[90%] max-h-[90vh] overflow-y-auto ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

Modal.Header = function ModalHeader({ children, className = '' }) {
  return (
    <div className={`flex justify-between items-center px-6 py-4 border-b border-gray-200 ${className}`.trim()}>
      {children}
    </div>
  );
};

Modal.Body = function ModalBody({ children, className = '' }) {
  return (
    <div className={`px-6 py-4 ${className}`.trim()}>
      {children}
    </div>
  );
};

Modal.Footer = function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex justify-end gap-3 px-6 py-4 border-t border-gray-200 ${className}`.trim()}>
      {children}
    </div>
  );
};

Modal.Title = function ModalTitle({ children, className = '' }) {
  return (
    <h2 className={`text-2xl font-bold text-gray-800 ${className}`.trim()}>
      {children}
    </h2>
  );
};

