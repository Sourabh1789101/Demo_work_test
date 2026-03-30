import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { User, LogOut, Settings, Menu, X } from 'lucide-react';
import { useState } from 'react';

export function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-blue-600">KIM AI</h1>
          <span className="text-gray-600 text-sm">Form Builder</span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
              >
                <User size={18} />
                <span className="text-sm">{user.name}</span>
              </button>

              <button
                onClick={() => navigate('/')}
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm"
              >
                Dashboard
              </button>

              <button
                onClick={() => navigate('/builder')}
                className="px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition text-sm"
              >
                Build
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 hover:bg-gray-50 rounded-lg"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-gray-50 border-t border-gray-200 px-4 py-4 space-y-2">
          <button
            onClick={() => {
              navigate('/profile');
              setMenuOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-white rounded-lg transition"
          >
            <User size={18} />
            <span>{user.name}</span>
          </button>
          <button
            onClick={() => {
              navigate('/');
              setMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-white rounded-lg transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => {
              navigate('/builder');
              setMenuOpen(false);
            }}
            className="w-full text-left px-3 py-2 text-gray-700 hover:bg-white rounded-lg transition"
          >
            Build
          </button>
          <button
            onClick={() => {
              handleLogout();
              setMenuOpen(false);
            }}
            className="w-full text-left flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      )}
    </nav>
  );
}
