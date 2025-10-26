/**
 * FishList with delete functionality
 */
export function FishList({ fish = [], onDeleteFish }) {
  if (fish.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        No fish yet. Click "Add Fish" to get started!
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-800">
          Fish in Your Tank ({fish.length})
        </h2>
      </div>
      <div className="divide-y max-h-96 overflow-y-auto">
        {fish.map((f) => (
          <div key={f.id} className="fish-list-item">
            <div
              className="fish-color-dot"
              style={{ backgroundColor: f.color }}
              title={f.color}
            />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{f.name}</div>
              <div className="text-sm text-gray-500 capitalize">{f.species}</div>
            </div>
            <div className="text-xs text-gray-400 uppercase mr-2">{f.size}</div>
            <button
              onClick={() => onDeleteFish(f.id)}
              className="delete-fish-btn"
              title="Remove fish"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

