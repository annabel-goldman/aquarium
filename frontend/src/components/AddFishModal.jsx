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
              {/* Custom color picker with eyedropper icon */}
              <label className="relative w-8 h-8 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 cursor-pointer flex items-center justify-center transition-all hover:scale-105">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <input
                  type="color"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  title="Pick custom color"
                />
              </label>
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
