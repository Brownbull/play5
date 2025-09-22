import React from 'react';
import { ItemCard } from './ItemCard';
import type { Item } from 'wasp/entities';

interface ItemWithRelations extends Item {
  tags: Array<{
    tag: {
      id: number;
      name: string;
      category: string;
      color: string | null;
    };
  }>;
  activity?: {
    id: number;
    name: string;
    icon: string | null;
  } | null;
}

interface ItemsListProps {
  items: ItemWithRelations[];
  isLoading?: boolean;
  selectedActivityId: number | null;
  onToggleComplete?: (itemId: number, isCompleted: boolean) => void;
  onEdit?: (item: ItemWithRelations) => void;
  onDelete?: (itemId: number) => void;
  className?: string;
}

export const ItemsList: React.FC<ItemsListProps> = ({
  items,
  isLoading = false,
  selectedActivityId,
  onToggleComplete,
  onEdit,
  onDelete,
  className = ''
}) => {
  if (isLoading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Loading items...</span>
        </div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
          <p className="text-gray-500">
            {selectedActivityId
              ? "No items for this activity yet. Try selecting a different activity or add some items!"
              : "You haven't added any items yet. Start by creating your first note!"}
          </p>
        </div>
      </div>
    );
  }

  // Group items by completion status
  const completedItems = items.filter(item => item.isCompleted);
  const activeItems = items.filter(item => !item.isCompleted);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Active Items */}
      {activeItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Active Items ({activeItems.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Completed Items */}
      {completedItems.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-500">
              Completed ({completedItems.length})
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {completedItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onToggleComplete={onToggleComplete}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{items.length}</div>
            <div className="text-sm text-gray-600">Total Items</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{completedItems.length}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {completedItems.length > 0 ? Math.round((completedItems.length / items.length) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>
      </div>
    </div>
  );
};