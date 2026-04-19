import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { downloadHTML } from '../../utils/exportForm';
import { formService } from '../../services/formService';
import { ShareModal } from '../shared/ShareModal';
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
  Share2,
  ArrowLeft,
  Zap,
  Check,
  ChevronDown,
  AlertCircle,
} from 'lucide-react';

const FORMBUILDER_LOGO = () => (
  <div className="flex items-center gap-2.5">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-300/30">
      <Zap size={16} className="text-white" />
    </div>
    <span className="text-base font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent tracking-tight">
      FormBuilder
    </span>
  </div>
);

export const BuilderToolbar: React.FC = () => {
  const { formId } = useParams<{ formId?: string }>();
  const navigate = useNavigate();

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const {
    mode, view, zoom,
    togglePreview, setView, setZoom,
    undo, redo, canUndo, canRedo,
    resetSchema, exportSchema, schema,
    updateSchema,
  } = useBuilderStore();

  const savedFormId = formId || schema.id;

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      await formService.saveForm(schema);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2500);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportHTML = () => { downloadHTML(schema); setShowExportMenu(false); };
  const handleExportJSON = () => {
    const json = exportSchema();
    const blob = new Blob([json], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${schema.title || 'form'}.json`;
    a.click();
    setShowExportMenu(false);
  };

  const saveLabel = useMemo(() => {
    if (isSaving) return 'Saving…';
    if (saveStatus === 'saved') return 'Saved';
    if (saveStatus === 'error') return 'Error';
    return 'Save';
  }, [isSaving, saveStatus]);

  const saveBg = saveStatus === 'saved'
    ? 'bg-emerald-600 hover:bg-emerald-700'
    : saveStatus === 'error'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700';

  return (
    <>
      {showTemplates && <TemplatesModal onClose={() => setShowTemplates(false)} />}
      {showShare && savedFormId && (
        <ShareModal formId={savedFormId} onClose={() => setShowShare(false)} />
      )}

      <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 shadow-sm z-10">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Back + Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-all duration-150"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <div className="h-6 w-px bg-gray-200" />
            <FORMBUILDER_LOGO />
          </div>

          {/* Form title inline edit */}
          <div className="flex items-center gap-3 ml-2">
            <input
              type="text"
              value={schema.title}
              onChange={(e) => updateSchema({ title: e.target.value })}
              className="text-sm font-semibold text-gray-900 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-400 rounded-md px-2 py-1 min-w-0 max-w-[200px] truncate hover:bg-gray-50"
              placeholder="Untitled Form"
            />
          </div>

          <div className="h-6 w-px bg-gray-200" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <ToolbarBtn
              onClick={undo}
              disabled={!canUndo()}
              icon={<Undo2 size={16} />}
              title="Undo (Ctrl+Z)"
            />
            <ToolbarBtn
              onClick={redo}
              disabled={!canRedo()}
              icon={<Redo2 size={16} />}
              title="Redo (Ctrl+Y)"
            />
          </div>

          {/* Templates */}
          <button
            type="button"
            onClick={() => setShowTemplates(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-150"
          >
            <LayoutTemplate size={16} />
            <span className="hidden sm:inline">Templates</span>
          </button>

          {/* Export dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowExportMenu((v) => !v)}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-colors duration-150"
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown size={14} />
            </button>
            {showExportMenu && (
              <div
                className="absolute left-0 top-11 w-44 bg-white rounded-xl border border-gray-200 shadow-xl z-20 overflow-hidden"
                onMouseLeave={() => setShowExportMenu(false)}
              >
                <button
                  type="button"
                  onClick={handleExportHTML}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                >
                  <FileCode size={16} /> Export HTML
                </button>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={handleExportJSON}
                  className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-gray-700 hover:bg-blue-50 transition-colors"
                >
                  <Download size={16} /> Export JSON
                </button>
              </div>
            )}
          </div>

          {/* Clear */}
          <button
            type="button"
            onClick={() => { if (confirm('Clear all fields?')) resetSchema(); }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors duration-150"
            title="Clear canvas"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Center: Device + Zoom */}
        <div className="flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-0.5">
            <ViewBtn active={view === 'desktop'} onClick={() => setView('desktop')} icon={<Monitor size={16} />} label="Desktop" />
            <ViewBtn active={view === 'tablet'}  onClick={() => setView('tablet')}  icon={<Tablet size={16} />}  label="Tablet"  />
            <ViewBtn active={view === 'mobile'}  onClick={() => setView('mobile')}  icon={<Smartphone size={16} />} label="Mobile" />
          </div>

          <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
            <ToolbarBtn onClick={() => setZoom(zoom - 10)} disabled={zoom <= 25}  icon={<ZoomOut size={16} />} title="Zoom out" />
            <span className="text-xs font-bold text-gray-700 w-12 text-center tabular-nums">{zoom}%</span>
            <ToolbarBtn onClick={() => setZoom(zoom + 10)} disabled={zoom >= 200} icon={<ZoomIn size={16} />}  title="Zoom in"  />
          </div>
        </div>

        {/* Right: Share + Preview + Save */}
        <div className="flex items-center gap-3">
          {/* Share */}
          <button
            type="button"
            onClick={() => setShowShare(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-gray-700 border border-gray-300 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-150"
          >
            <Share2 size={16} />
            <span className="hidden sm:inline">Share</span>
          </button>

          {/* Preview toggle */}
          <button
            type="button"
            onClick={togglePreview}
            className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all duration-150 border ${
              mode === 'preview'
                ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                : 'text-gray-700 border-gray-300 hover:bg-gray-100'
            }`}
          >
            {mode === 'preview' ? <EyeOff size={16} /> : <Eye size={16} />}
            <span className="hidden sm:inline">{mode === 'preview' ? 'Exit' : 'Preview'}</span>
          </button>

          {/* Save */}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg shadow-md transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed hover:shadow-lg ${saveBg}`}
          >
            {saveStatus === 'saved' ? <Check size={16} /> : saveStatus === 'error' ? <AlertCircle size={16} /> : <Save size={16} />}
            <span className="hidden sm:inline">{saveLabel}</span>
          </button>
        </div>
      </header>
    </>
  );
};

const ToolbarBtn: React.FC<{
  onClick: () => void; disabled?: boolean; icon: React.ReactNode; title: string;
}> = ({ onClick, disabled, icon, title }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded-md transition-colors duration-150 ${
      disabled ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-white hover:text-gray-800'
    }`}
  >
    {icon}
  </button>
);

const ViewBtn: React.FC<{
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    title={label}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 ${
      active ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-800'
    }`}
  >
    {icon}
    <span className="hidden md:inline">{label}</span>
  </button>
);
