import { useState } from 'react';
import { DeleteTankModal } from './DeleteTankModal';
import { Card, Button } from './ui';
import { TrashIcon } from './icons';
import { LIMITS } from '../config/constants';
import '../styles/components/modals.css';

export function TankPreview({ tank, onEnter, onDelete }) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    await onDelete(tank.id);
  };

  return (
    <>
      <Card onClick={() => onEnter(tank.id)} className="group">
        {/* Tank Preview - Static placeholder */}
        <Card.Image>
          <div className="tank-preview-image">
            <div className="text-center">
              <div className="tank-preview-icon">🐠</div>
              <div className="tank-preview-count">
                {tank.fishCount} {tank.fishCount === 1 ? 'fish' : 'fish'}
              </div>
            </div>
          </div>
        </Card.Image>

        {/* Tank Info */}
        <Card.Body>
          <Card.Title>{tank.name}</Card.Title>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-500">
              {tank.fishCount} / {LIMITS.maxFishPerTank} fish
            </span>
            <Button
              onClick={handleDelete}
              variant="danger"
              icon={true}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete tank"
            >
              <TrashIcon />
            </Button>
          </div>
        </Card.Body>
      </Card>

      <DeleteTankModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        tankName={tank.name}
      />
    </>
  );
}
