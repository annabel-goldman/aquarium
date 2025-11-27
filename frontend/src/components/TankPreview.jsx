import { useState } from 'react';
import { DeleteTankModal } from './DeleteTankModal';
import { Card, Button } from './ui';

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
          <div className="w-full h-full bg-gradient-to-b from-blue-300 to-blue-600 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-2">🐠</div>
              <div className="text-white text-sm font-medium">
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
              {tank.fishCount} / 30 fish
            </span>
            <Button
              onClick={handleDelete}
              variant="danger"
              icon={true}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete tank"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
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

