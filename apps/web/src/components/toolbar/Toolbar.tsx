import React, { useMemo, useState } from 'react';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { downloadHTML } from '../../utils/exportForm';
import { formService } from '../../services/formService';
import { TemplatesModal } from '../TemplatesModal';
import {
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Monitor,
  Smartphone,
  Tablet,
  ZoomIn,
  ZoomOut,
  Save,
  Download,
  FileCode,
  Trash2,
  LayoutTemplate,
} from 'lucide-react';

export const Toolbar: React.FC = () => {
  const [isSavingRemote, setIsSavingRemote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);

  const { 
    mode, 
    view, 
    zoom, 
    togglePreview, 
    setView, 
    setZoom, 
    undo, 
    redo, 
    canUndo, 
    canRedo,
    resetSchema,
    exportSchema,
    schema
  } = useBuilderStore();

  const saveLabel = useMemo(() => {
    if (isSavingRemote) return 'Saving...';
    if (lastSavedAt) return 'Saved';
    return 'Save';
  }, [isSavingRemote, lastSavedAt]);

  const handleExportJSON = () => {
    const json = exportSchema();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `form-${Date.now()}.json`;
    a.click();
  };

  const handleExportHTML = () => {
    downloadHTML(schema);
  };

  const handleSave = async () => {
    setIsSavingRemote(true);
    setSaveError(null);

    try {
      const saved = await formService.saveForm(schema);
      setLastSavedAt(saved.updatedAt);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save form';
      setSaveError(message);
    } finally {
      setIsSavingRemote(false);
    }
  };

  return (
    <>
    {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
    <header className="h-16 bg-gradient-to-r from-white via-blue-50/30 to-purple-50/30 border-b-2 border-gray-200 flex items-center justify-between px-4 shrink-0 shadow-sm">
      {/* Left: History & Actions */}
      <div className="flex items-center space-x-2">
        <ToolbarButton
          onClick={undo}
          disabled={!canUndo()}
          icon={<Undo2 size={18} />}
          title="Undo"
        />
        <ToolbarButton
          onClick={redo}
          disabled={!canRedo()}
          icon={<Redo2 size={18} />}
          title="Redo"
        />
        <div className="w-px h-6 bg-gray-200 mx-2" />
        <button
          type="button"
          onClick={() => setShowTemplates(true)}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-white border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 rounded-lg transition-all font-medium"
        >
          <LayoutTemplate size={16} />
          <span>Templates</span>
        </button>
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button
          type="button"
          onClick={handleExportHTML}
          className="flex items-center space-x-2 px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 rounded-lg transition-all font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          <FileCode size={16} />
          <span>Export HTML</span>
        </button>
        <button
          type="button"
          onClick={handleExportJSON}
          className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-white border-2 border-gray-200 hover:border-gray-300 rounded-lg transition-all"
        >
          <Download size={16} />
          <span>JSON</span>
        </button>
        <button
          type="button"
          onClick={() => {
            if (confirm('Clear all components?')) resetSchema();
          }}
          className="flex items-center space-x-2 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <Trash2 size={16} />
          <span>Clear</span>
        </button>
      </div>

      {/* Center: View Controls */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <ViewButton 
            active={view === 'desktop'} 
            onClick={() => setView('desktop')}
            icon={<Monitor size={16} />}
            label="Desktop"
          />
          <ViewButton 
            active={view === 'tablet'} 
            onClick={() => setView('tablet')}
            icon={<Tablet size={16} />}
            label="Tablet"
          />
          <ViewButton 
            active={view === 'mobile'} 
            onClick={() => setView('mobile')}
            icon={<Smartphone size={16} />}
            label="Mobile"
          />
        </div>

        <div className="flex items-center space-x-1">
          <ToolbarButton 
            onClick={() => setZoom(zoom - 10)} 
            disabled={zoom <= 25}
            icon={<ZoomOut size={16} />}
            title="Zoom out"
          />
          <span className="text-xs font-medium text-gray-600 w-12 text-center">
            {zoom}%
          </span>
          <ToolbarButton 
            onClick={() => setZoom(zoom + 10)} 
            disabled={zoom >= 200}
            icon={<ZoomIn size={16} />}
            title="Zoom in"
          />
        </div>
      </div>

      {/* Right: Preview & Save */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={togglePreview}
          className={`
            flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm
            ${mode === 'preview'
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md hover:from-green-600 hover:to-emerald-700'
              : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'}
          `}
        >
          {mode === 'preview' ? <EyeOff size={18} /> : <Eye size={18} />}
          <span>{mode === 'preview' ? 'Exit Preview' : 'Preview'}</span>
        </button>

        <button
          type="button"
          onClick={handleSave}
          disabled={isSavingRemote}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          <span>{saveLabel}</span>
        </button>
        {saveError && <span className="text-xs text-red-600 max-w-52 truncate">{saveError}</span>}
      </div>
    </header>
    </>
  );
};

const ToolbarButton: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  title: string;
}> = ({ onClick, disabled, icon, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`
      p-2 rounded-md transition-colors
      ${disabled 
        ? 'text-gray-300 cursor-not-allowed' 
        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}
    `}
  >
    {icon}
  </button>
);

const ViewButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`
      flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all
      ${active 
        ? 'bg-white text-gray-900 shadow-sm' 
        : 'text-gray-500 hover:text-gray-700'}
    `}
  >
    {icon}
    <span className="hidden sm:inline">{label}</span>
  </button>
);