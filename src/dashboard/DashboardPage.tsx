import { useAuth } from 'wasp/client/auth'
import { logout } from 'wasp/client/auth'
import { TestOperations } from '../client/components/TestOperations'

export const DashboardPage = () => {
  const { data: user } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Smart Notes</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.id}</span>
              <button
                onClick={logout}
                className="btn-outline text-sm py-2 px-4"
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
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to Smart Notes!
              </h2>
              <p className="text-gray-600 mb-6">
                Your intelligent note organization system is ready to go.
              </p>
              <div className="space-y-2">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-green-900">✅ Phase Complete</h3>
                  <p className="text-green-700">Task 1: Auth & UI | Task 2: Database Schema | Task 3: CRUD Operations</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900">🚀 Next Phase</h3>
                  <p className="text-blue-700">AI integration and smart parsing coming next!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations Test Panel */}
          <TestOperations />
        </div>
      </main>
    </div>
  )
}