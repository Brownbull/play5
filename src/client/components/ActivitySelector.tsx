import React from 'react';
import type { Activity } from 'wasp/entities';

interface ActivitySelectorProps {
  activities: Activity[];
  selectedActivityId: number | null;
  onActivitySelect: (activityId: number | null) => void;
  className?: string;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activities,
  selectedActivityId,
  onActivitySelect,
  className = ''
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900">Activities</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* All Items Option */}
        <button
          onClick={() => onActivitySelect(null)}
          className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
            selectedActivityId === null
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📋</div>
            <div>
              <div className="font-medium text-gray-900">All Items</div>
              <div className="text-sm text-gray-500">View everything</div>
            </div>
          </div>
        </button>

        {/* Activity Options */}
        {activities.map((activity) => (
          <button
            key={activity.id}
            onClick={() => onActivitySelect(activity.id)}
            className={`p-4 rounded-lg border-2 transition-all duration-200 text-left ${
              selectedActivityId === activity.id
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{activity.icon || '📌'}</div>
              <div>
                <div className="font-medium text-gray-900">{activity.name}</div>
                <div className="text-sm text-gray-500">
                  {activity.description || 'No description'}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};