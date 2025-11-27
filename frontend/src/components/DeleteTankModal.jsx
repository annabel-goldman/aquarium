import { useState } from 'react';
import { Modal, Button } from './ui';

export function DeleteTankModal({ isOpen, onClose, onConfirm, tankName }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirm();
    setIsDeleting(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Header>
        <Modal.Title>Delete Tank</Modal.Title>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isDeleting}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Modal.Header>

      <Modal.Body>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-gray-800 mb-2">
            Are you sure you want to delete <strong>"{tankName}"</strong>?
          </p>
          <p className="text-sm text-gray-600">
            This will permanently remove the tank and all fish inside it. This action cannot be undone.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <button
          type="button"
          onClick={handleConfirm}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
          disabled={isDeleting}
        >
          {isDeleting ? 'Deleting...' : 'Delete Tank'}
        </button>
      </Modal.Footer>
    </Modal>
  );
}

