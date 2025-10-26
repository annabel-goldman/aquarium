import { useState } from 'react';
import { FISH_SPECIES, DEFAULT_COLORS } from '../config/constants';

/**
 * Add Fish Modal - species list generated from config
 */
export function AddFishModal({ isOpen, onClose, onSubmit, currentFishCount = 0 }) {
  const [formData, setFormData] = useState({
    species: FISH_SPECIES[0],
    name: '',
    color: DEFAULT_COLORS[0],
    size: 'md',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await onSubmit(formData);

    if (result.success) {
      setFormData({
        species: FISH_SPECIES[0],
        name: '',
        color: DEFAULT_COLORS[0],
        size: 'md',
      });
      onClose();
    } else {
      setError(result.error || 'Failed to add fish');
    }
    
    setLoading(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Add New Fish</h2>
          <div className="text-sm text-gray-600 mb-4">
            {currentFishCount >= 30 ? (
              <div className="text-red-600">Tank is full! Maximum of 30 fish reached.</div>
            ) : (
              <div>Fish slots remaining: {30 - currentFishCount} of 30</div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="species" className="block text-sm font-medium text-gray-700 mb-2">
                Species
              </label>
              <select
                id="species"
                className="input-field"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
              >
                {FISH_SPECIES.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="input-field"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bubbles"
                maxLength={50}
                required
              />
            </div>

            <div>
              <label htmlFor="color" className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  id="color"
                  type="color"
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <input
                  type="text"
                  className="input-field flex-1"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  placeholder="#ff8844"
                />
              </div>
              <div className="flex gap-2">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className="w-8 h-8 rounded border-2 border-gray-300 hover:border-blue-500 transition-colors"
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                    title={color}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Size
              </label>
              <div className="flex gap-4">
                {['sm', 'md', 'lg'].map((size) => (
                  <label key={size} className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="size"
                      value={size}
                      checked={formData.size === size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="mr-2"
                    />
                    <span className="text-gray-700 capitalize">
                      {size === 'sm' ? 'Small' : size === 'md' ? 'Medium' : 'Large'}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="btn-primary flex-1"
                disabled={loading || currentFishCount >= 30}
              >
                {loading ? 'Adding...' : 'Add Fish'}
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

