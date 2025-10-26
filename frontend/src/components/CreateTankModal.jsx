import { useState } from 'react';

export function CreateTankModal({ isOpen, onClose, onSubmit, currentTankCount }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

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
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-2xl font-bold text-gray-800">Create New Tank</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
            disabled={isSubmitting}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tank Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
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

            <div className="text-sm text-gray-500 mb-4">
              You have {currentTankCount} of 6 tanks. {6 - currentTankCount} remaining.
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Tank'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

