import { useState } from 'react';
import { FISH_SPECIES, DEFAULT_COLORS } from '../config/constants';
import { Modal, Button, Input, Select, Label } from './ui';

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

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Body className="space-y-4">
        <Modal.Title>Add New Fish</Modal.Title>
        <div className="text-sm text-gray-600">
          {currentFishCount >= 30 ? (
            <div className="text-red-600">Tank is full! Maximum of 30 fish reached.</div>
          ) : (
            <div>Fish slots remaining: {30 - currentFishCount} of 30</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="species">Species</Label>
              <Select
                id="species"
                value={formData.species}
                onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                required
              >
                {FISH_SPECIES.map((species) => (
                  <option key={species} value={species}>
                    {species}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Bubbles"
                maxLength={50}
                required
              />
            </div>

            <div>
              <Label htmlFor="color">Color</Label>
              <div className="flex items-center gap-3 mb-2">
                <input
                  id="color"
                  type="color"
                  className="h-10 w-20 border border-gray-300 rounded cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                />
                <Input
                  type="text"
                  className="flex-1"
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
              <Label>Size</Label>
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
              <Button
                type="submit"
                variant="primary"
                className="flex-1"
                disabled={loading || currentFishCount >= 30}
              >
                {loading ? 'Adding...' : 'Add Fish'}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
      </Modal.Body>
    </Modal>
  );
}

