import { useNavigate } from 'react-router-dom';
import { BuilderPage } from './BuilderPage';
import { LogOut } from 'lucide-react';

export function DemoPage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-amber-900">Demo Mode</h3>
            <p className="text-xs text-amber-700">Your form is saved locally in your browser</p>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-sm font-medium transition"
          >
            <LogOut size={16} />
            Exit Demo
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-auto">
        <BuilderPage isDemoMode={true} />
      </div>
    </div>
  );
}
