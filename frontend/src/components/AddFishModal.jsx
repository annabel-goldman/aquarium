import { useState } from 'react';
import { FISH_SPECIES, DEFAULT_COLORS, LIMITS, SIZE_LABELS, SPECIES_SPRITE_MAP } from '../config/constants';
import { Modal, Button, Input, Label } from './ui';
import '../styles/components/modals.css';

/**
 * Add Fish Modal with species preview images
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

  const isTankFull = currentFishCount >= LIMITS.maxFishPerTank;

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

  // Get sprite path for a species
  const getSpritePath = (species) => {
    const folder = SPECIES_SPRITE_MAP[species];
    return folder ? `/fish-sprites/${folder}/tail-1.svg` : null;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Modal.Body className="space-y-5">
        <Modal.Title>Add Fish</Modal.Title>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Species Selection with Images */}
          <div>
            <Label>Species</Label>
            <div className="grid grid-cols-5 gap-2">
              {FISH_SPECIES.map((species) => {
                const isSelected = formData.species === species;
                const spritePath = getSpritePath(species);
                return (
                  <button
                    key={species}
                    type="button"
                    onClick={() => setFormData({ ...formData, species })}
                    className={`flex flex-col items-center p-2 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    {spritePath && (
                      <img
                        src={spritePath}
                        alt={species}
                        className="w-10 h-10 object-contain"
                      />
                    )}
                    <span className={`text-xs mt-1 ${isSelected ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                      {species.replace('fish', '')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name Input */}
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Bubbles"
              maxLength={LIMITS.fishNameMaxLength}
              required
            />
          </div>

          {/* Color Selection */}
          <div>
            <Label>Color</Label>
            <div className="flex items-center gap-2">
              {DEFAULT_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  className={`w-8 h-8 rounded-full transition-all ${
                    formData.color === color
                      ? 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  onClick={() => setFormData({ ...formData, color })}
                />
              ))}
              <input
                type="color"
                className="w-8 h-8 rounded-full cursor-pointer border-0 p-0"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                title="Custom color"
              />
            </div>
          </div>

          {/* Size Selection */}
          <div>
            <Label>Size</Label>
            <div className="flex gap-2">
              {Object.entries(SIZE_LABELS).map(([size, label]) => {
                const isSelected = formData.size === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setFormData({ ...formData, size })}
                    className={`flex-1 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-600'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          {isTankFull && (
            <div className="text-red-600 text-sm">
              Tank is full! Maximum of {LIMITS.maxFishPerTank} fish.
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              disabled={loading || isTankFull}
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
