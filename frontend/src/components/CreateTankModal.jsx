import { useState } from 'react';
import { Modal, Button, Input, Label } from './ui';

export function CreateTankModal({ isOpen, onClose, onSubmit, currentTankCount }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Please enter a tank name');
      return;
    }

    if (name.length > 50) {
      setError('Tank name must be 50 characters or less');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await onSubmit(name.trim());
    
    if (result.success) {
      setName('');
      onClose();
    } else {
      setError(result.error || 'Failed to create tank');
    }
    
    setIsSubmitting(false);
  };

  const handleClose = () => {
    setName('');
    setError('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header>
        <Modal.Title>Create New Tank</Modal.Title>
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
          disabled={isSubmitting}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </Modal.Header>

      <form onSubmit={handleSubmit}>
        <Modal.Body>
          <div className="mb-4">
            <Label>Tank Name</Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tropical Paradise"
              maxLength={50}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-500">
            You have {currentTankCount} of 6 tanks. {6 - currentTankCount} remaining.
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Tank'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  );
}

