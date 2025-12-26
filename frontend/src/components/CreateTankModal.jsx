import { useState } from 'react';
import { Modal, Button, Input, Label } from './ui';
import { LIMITS } from '../config/constants';

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

    if (name.length > LIMITS.tankNameMaxLength) {
      setError(`Tank name must be ${LIMITS.tankNameMaxLength} characters or less`);
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

  const remainingTanks = LIMITS.maxTanks - currentTankCount;

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <Modal.Header onClose={handleClose} disabled={isSubmitting}>
        <Modal.Title>Create New Tank</Modal.Title>
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
              maxLength={LIMITS.tankNameMaxLength}
              disabled={isSubmitting}
              autoFocus
            />
          </div>

          {error && (
            <div className="error-box mb-4 border border-red-200">
              {error}
            </div>
          )}

          <div className="text-sm text-gray-500">
            You have {currentTankCount} of {LIMITS.maxTanks} tanks. {remainingTanks} remaining.
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
