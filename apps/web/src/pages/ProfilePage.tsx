import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, Mail, LogOut, Loader } from 'lucide-react';

export function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-4">
              <User className="text-blue-600" size={40} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 mt-2">{user.email}</p>
          </div>

          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user.name}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 text-gray-400" size={20} />
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Member Since
                </label>
                <input
                  type="text"
                  value={new Date(user.createdAt).toLocaleDateString()}
                  disabled
                  className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-700"
                />
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <button
              onClick={handleLogout}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Logging out...
                </>
              ) : (
                <>
                  <LogOut size={20} />
                  Logout
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
