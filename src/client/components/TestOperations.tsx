import React, { useState } from 'react';
import { 
  getItems, 
  getActivities, 
  getTags, 
  createItem, 
  updateItem, 
  deleteItem,
  testAIConnection,
  testTagSuggestion,
  testAIProvider,
  compareProviders,
  useQuery 
} from 'wasp/client/operations';

export function TestOperations() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<'huggingface' | 'openai'>('huggingface');
  const [testText, setTestText] = useState("I need to buy tomatoes and cheese for making Italian pasta tonight");

  // Use queries to test data fetching
  const { data: activities } = useQuery(getActivities);
  const { data: tags } = useQuery(getTags);
  const { data: items } = useQuery(getItems, {});

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testCreateItem = async () => {
    setIsLoading(true);
    try {
      const result = await createItem({
        content: "Test item from operations",
        sourceNote: "Testing CRUD operations",
        activityId: activities?.[0]?.id,
        tagIds: tags?.slice(0, 2).map(tag => tag.id) || []
      });
      addResult(`✅ Created item: ${result.content} (ID: ${result.id})`);
    } catch (error) {
      addResult(`❌ Create failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testUpdateItem = async () => {
    if (!items || items.length === 0) {
      addResult(`❌ No items to update`);
      return;
    }

    setIsLoading(true);
    try {
      const firstItem = items[0];
      const result = await updateItem({
        id: firstItem.id,
        content: "Updated test item",
        isCompleted: !firstItem.isCompleted
      });
      addResult(`✅ Updated item: ${result.content} (Completed: ${result.isCompleted})`);
    } catch (error) {
      addResult(`❌ Update failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testDeleteItem = async () => {
    if (!items || items.length === 0) {
      addResult(`❌ No items to delete`);
      return;
    }

    setIsLoading(true);
    try {
      const lastItem = items[items.length - 1];
      await deleteItem({ id: lastItem.id });
      addResult(`✅ Deleted item: ${lastItem.content} (ID: ${lastItem.id})`);
    } catch (error) {
      addResult(`❌ Delete failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testAIConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const result = await testAIConnection();
      if (result.connected) {
        addResult(`✅ AI Connected: API configured and working`);
      } else {
        addResult(`❌ AI Failed: ${result.error || 'Unknown error'}`);
        if (!result.apiKeyConfigured) {
          addResult(`ℹ️ Set HUGGINGFACE_API_KEY in .env.server`);
        }
      }
    } catch (error) {
      addResult(`❌ AI Test failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testTagSuggestionAI = async () => {
    setIsLoading(true);
    try {
      const result = await testTagSuggestion({ text: testText });
      
      if (result.error) {
        addResult(`❌ Tag suggestion failed: ${result.error}`);
      } else {
        addResult(`✅ ${result.provider.toUpperCase()} Tag suggestions for "${testText}":`);
        if (result.suggestedTags.length > 0) {
          addResult(`   📌 Suggested tags: ${result.suggestedTags.join(', ')}`);
        } else {
          addResult(`   📌 No relevant tags suggested`);
        }
        addResult(`ℹ️ Available tags in database: ${result.availableTagCount}`);
      }
    } catch (error) {
      addResult(`❌ Tag suggestion test failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testSpecificProvider = async () => {
    setIsLoading(true);
    try {
      const result = await testAIProvider({ provider: selectedProvider, text: testText });
      
      if (result.error) {
        addResult(`❌ ${selectedProvider.toUpperCase()} test failed: ${result.error}`);
      } else {
        addResult(`✅ ${selectedProvider.toUpperCase()} test for "${testText}":`);
        if (result.suggestedTags.length > 0) {
          addResult(`   📌 Suggested tags: ${result.suggestedTags.join(', ')}`);
        } else {
          addResult(`   📌 No relevant tags suggested`);
        }
        addResult(`ℹ️ Connection: ${result.connectionStatus.connected ? '✅ Connected' : '❌ Disconnected'}`);
      }
    } catch (error) {
      addResult(`❌ ${selectedProvider.toUpperCase()} test failed: ${error}`);
    }
    setIsLoading(false);
  };

  const testBothProviders = async () => {
    setIsLoading(true);
    try {
      const result = await compareProviders({ text: testText });
      
      if (result.error) {
        addResult(`❌ Provider comparison failed: ${result.error}`);
      } else {
        addResult(`🔄 Comparing providers for "${testText}":`);
        
        // HuggingFace results
        if (result.huggingface.status === 'fulfilled') {
          if (result.huggingface.tags.length > 0) {
            addResult(`   🤗 HuggingFace: ${result.huggingface.tags.join(', ')}`);
          } else {
            addResult(`   🤗 HuggingFace: No tags suggested`);
          }
        } else {
          addResult(`   🤗 HuggingFace: ❌ ${result.huggingface.error}`);
        }
        
        // OpenAI results
        if (result.openai.status === 'fulfilled') {
          if (result.openai.tags.length > 0) {
            addResult(`   🤖 OpenAI: ${result.openai.tags.join(', ')}`);
          } else {
            addResult(`   🤖 OpenAI: No tags suggested`);
          }
        } else {
          addResult(`   🤖 OpenAI: ❌ ${result.openai.error}`);
        }
        
        addResult(`ℹ️ Available tags in database: ${result.availableTagCount}`);
      }
    } catch (error) {
      addResult(`❌ Provider comparison failed: ${error}`);
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Operations Test Panel</h2>
      
      {/* Data Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded">
          <h3 className="font-semibold text-blue-800">Activities</h3>
          <p className="text-2xl font-bold text-blue-600">{activities?.length || 0}</p>
        </div>
        <div className="bg-green-50 p-4 rounded">
          <h3 className="font-semibold text-green-800">Tags</h3>
          <p className="text-2xl font-bold text-green-600">{tags?.length || 0}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded">
          <h3 className="font-semibold text-purple-800">Items</h3>
          <p className="text-2xl font-bold text-purple-600">{items?.length || 0}</p>
        </div>
      </div>

      {/* Test Actions */}
      <div className="space-y-3">
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">CRUD Operations</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={testCreateItem}
              disabled={isLoading}
              className="btn-primary disabled:opacity-50"
            >
              Create Test Item
            </button>
            <button
              onClick={testUpdateItem}
              disabled={isLoading || !items?.length}
              className="btn-secondary disabled:opacity-50"
            >
              Update First Item
            </button>
            <button
              onClick={testDeleteItem}
              disabled={isLoading || !items?.length}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Delete Last Item
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-gray-700 mb-2">AI Integration</h3>
          
          {/* Test Text Input */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">Test Text:</label>
            <input
              type="text"
              value={testText}
              onChange={(e) => setTestText(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter text to test tag suggestions..."
            />
          </div>

          {/* Provider Selection */}
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value as 'huggingface' | 'openai')}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="huggingface">HuggingFace</option>
              <option value="openai">OpenAI</option>
            </select>
          </div>

          {/* Test Buttons */}
          <div className="flex flex-wrap gap-2 mb-2">
            <button
              onClick={testAIConnectionStatus}
              disabled={isLoading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Default Connection
            </button>
            <button
              onClick={testTagSuggestionAI}
              disabled={isLoading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test Default Provider
            </button>
            <button
              onClick={testSpecificProvider}
              disabled={isLoading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Test {selectedProvider === 'huggingface' ? 'HuggingFace' : 'OpenAI'}
            </button>
            <button
              onClick={testBothProviders}
              disabled={isLoading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              Compare Both Providers
            </button>
          </div>
          <p className="text-sm text-gray-500">
            Note: AI features require API keys in .env.server (HUGGINGFACE_API_KEY, OPENAI_API_KEY)
          </p>
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-gray-50 p-4 rounded max-h-64 overflow-y-auto">
        <h3 className="font-semibold mb-2">Test Results:</h3>
        {testResults.length === 0 ? (
          <p className="text-gray-500">Run tests to see results...</p>
        ) : (
          <div className="space-y-1">
            {testResults.map((result, index) => (
              <div key={index} className="text-sm font-mono">
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Current Items */}
      {items && items.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold mb-2">Current Items:</h3>
          <div className="space-y-2">
            {items.map(item => (
              <div key={item.id} className="bg-gray-50 p-3 rounded text-sm">
                <div className="font-medium">{item.content}</div>
                <div className="text-gray-600">
                  Activity: {(item as any).activity?.name || 'None'} | 
                  Tags: {(item as any).tags?.map((t: any) => t.tag.name).join(', ') || 'None'} | 
                  Completed: {item.isCompleted ? 'Yes' : 'No'} |
                  Relevance: {item.relevance}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}