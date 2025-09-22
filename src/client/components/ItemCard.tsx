import React from 'react';
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

interface ItemCardProps {
  item: ItemWithRelations;
  onToggleComplete?: (itemId: number, isCompleted: boolean) => void;
  onEdit?: (item: ItemWithRelations) => void;
  onDelete?: (itemId: number) => void;
  className?: string;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onToggleComplete,
  onEdit,
  onDelete,
  className = ''
}) => {
  const handleToggleComplete = () => {
    if (onToggleComplete) {
      onToggleComplete(item.id, !item.isCompleted);
    }
  };

  const formatDate = (date: string | Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow duration-200 ${
        item.isCompleted ? 'opacity-75' : ''
      } ${className}`}
    >
      {/* Content and Actions */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p
            className={`text-gray-900 ${
              item.isCompleted ? 'line-through text-gray-500' : ''
            }`}
          >
            {item.content}
          </p>
          {item.sourceNote && item.sourceNote !== item.content && (
            <p className="text-sm text-gray-500 mt-1 italic">
              From: "{item.sourceNote}"
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 ml-3">
          <button
            onClick={handleToggleComplete}
            className={`p-2 rounded-md transition-colors ${
              item.isCompleted
                ? 'text-green-600 hover:bg-green-50'
                : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
            }`}
            title={item.isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
          >
            {item.isCompleted ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>

          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Edit item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              onClick={() => onDelete(item.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              title="Delete item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Tags */}
      {item.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {item.tags.map(({ tag }) => (
            <span
              key={tag.id}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: tag.color ? `${tag.color}20` : '#f3f4f6',
                color: tag.color || '#6b7280'
              }}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}

      {/* Activity and Date */}
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-2">
          {item.activity && (
            <>
              <span>{item.activity.icon || '📌'}</span>
              <span>{item.activity.name}</span>
            </>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {item.relevance < 1.0 && (
            <span className="text-yellow-600" title={`Relevance: ${(item.relevance * 100).toFixed(0)}%`}>
              ⭐ {(item.relevance * 100).toFixed(0)}%
            </span>
          )}
          <span>{formatDate(item.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};