
import { useAuth } from 'wasp/client/auth'
import { Link } from 'wasp/client/router'

export const MainPage = () => {
  const { data: user } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Smart Notes
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Your intelligent external brain that transforms messy notes into organized, 
            actionable items with AI-powered classification and proactive surfacing.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            {user ? (
              <Link to="/dashboard" className="btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn-primary">
                  Get Started
                </Link>
                <Link to="/login" className="btn-outline">
                  Sign In
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🧠</div>
              <h3 className="text-lg font-semibold mb-2">Smart Parsing</h3>
              <p className="text-gray-600">
                Automatically extract multiple actionable items from your messy notes
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🎯</div>
              <h3 className="text-lg font-semibold mb-2">Activity-Based Surfacing</h3>
              <p className="text-gray-600">
                Get relevant items surfaced based on what you're doing right now
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="text-3xl mb-4">🔗</div>
              <h3 className="text-lg font-semibold mb-2">Google Keep Integration</h3>
              <p className="text-gray-600">
                Import your existing notes without starting from scratch
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
