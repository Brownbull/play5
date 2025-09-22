import React, { useState } from 'react';
import { useAuth } from 'wasp/client/auth';
import { logout } from 'wasp/client/auth';
import { useQuery } from 'wasp/client/operations';
import {
  getItems,
  getActivities,
  updateItem,
  deleteItem
} from 'wasp/client/operations';
import { ActivitySelector } from '../client/components/ActivitySelector';
import { ItemsList } from '../client/components/ItemsList';
import { TestOperations } from '../client/components/TestOperations';

export const DashboardPage = () => {
  const { data: user } = useAuth();
  const [selectedActivityId, setSelectedActivityId] = useState<number | null>(null);
  const [showTestOperations, setShowTestOperations] = useState(false);

  // Fetch activities
  const { data: activities, isLoading: activitiesLoading } = useQuery(getActivities);

  // Fetch items with optional activity filter
  const { data: items, isLoading: itemsLoading, refetch: refetchItems } = useQuery(
    getItems,
    selectedActivityId ? { activityId: selectedActivityId } : {}
  );

  const handleActivitySelect = (activityId: number | null) => {
    setSelectedActivityId(activityId);
  };

  const handleToggleComplete = async (itemId: number, isCompleted: boolean) => {
    try {
      await updateItem({
        id: itemId,
        isCompleted
      });
      refetchItems();
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem({ id: itemId });
        refetchItems();
      } catch (error) {
        console.error('Failed to delete item:', error);
      }
    }
  };

  const getSelectedActivityName = () => {
    if (!selectedActivityId || !activities) return 'All Items';
    const activity = activities.find(a => a.id === selectedActivityId);
    return activity ? activity.name : 'All Items';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-semibold text-gray-900">Smart Notes</h1>
              <div className="hidden sm:block text-sm text-gray-500">
                {getSelectedActivityName()}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowTestOperations(!showTestOperations)}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                {showTestOperations ? 'Hide' : 'Show'} Test Panel
              </button>
              <span className="text-gray-700">Welcome, User {user?.id}</span>
              <button
                onClick={logout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Activity Selector */}
          <div className="bg-white rounded-lg shadow p-6">
            <ActivitySelector
              activities={activities || []}
              selectedActivityId={selectedActivityId}
              onActivitySelect={handleActivitySelect}
            />
          </div>

          {/* Items List */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {getSelectedActivityName()}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedActivityId
                  ? `Items for ${getSelectedActivityName()}`
                  : 'All your items across all activities'}
              </p>
            </div>

            <ItemsList
              items={(items || []) as any}
              isLoading={itemsLoading}
              selectedActivityId={selectedActivityId}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteItem}
            />
          </div>

          {/* Test Operations Panel (Collapsible) */}
          {showTestOperations && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Test Operations</h2>
                <p className="text-sm text-gray-600">
                  Development tools for testing AI functionality
                </p>
              </div>
              <TestOperations />
            </div>
          )}

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center">
                <div className="text-2xl mb-2">📝</div>
                <div className="text-sm font-medium text-gray-900">Add Note</div>
                <div className="text-xs text-gray-500">Parse with AI</div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-center">
                <div className="text-2xl mb-2">✅</div>
                <div className="text-sm font-medium text-gray-900">Quick Item</div>
                <div className="text-xs text-gray-500">Add directly</div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-center">
                <div className="text-2xl mb-2">🏷️</div>
                <div className="text-sm font-medium text-gray-900">Manage Tags</div>
                <div className="text-xs text-gray-500">Organize better</div>
              </button>

              <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="text-sm font-medium text-gray-900">Analytics</div>
                <div className="text-xs text-gray-500">View insights</div>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};