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
      <Modal.Header onClose={onClose} disabled={isDeleting}>
        <Modal.Title>Delete Tank</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="danger-box">
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
        <Button
          type="button"
          variant="danger"
          onClick={handleConfirm}
          disabled={isDeleting}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          {isDeleting ? 'Deleting...' : 'Delete Tank'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
