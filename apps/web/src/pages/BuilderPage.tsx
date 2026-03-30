import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DragAndDropProvider } from '../components/dnd/DragAndDropProvider';
import { useBuilderStore } from '../../modules/store/builderStore';
import { ComponentPalette } from '../components/palette/ComponentPalette';
import { Canvas } from '../components/canvas/Canvas';
import { PropertiesPanel } from '../components/panels/PropertiesPanel';
import { BuilderToolbar } from '../components/toolbar/BuilderToolbar';
import { Navbar } from '../components/Navbar';
import { formService } from '../services/formService';

interface BuilderPageProps {
  isDemoMode?: boolean;
}

export const BuilderPage: React.FC<BuilderPageProps> = ({ isDemoMode = false }) => {
  const { formId } = useParams<{ formId?: string }>();
  const { mode, setSchema } = useBuilderStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!formId && !isDemoMode);

  useEffect(() => {
    if (!formId || isDemoMode) return;
    void formService.getForm(formId)
      .then((form) => setSchema(form.schema as any))
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  }, [formId, navigate, setSchema, isDemoMode]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Loading form…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100 text-gray-900 overflow-hidden">
      {!isDemoMode && <Navbar />}
      <DragAndDropProvider>
        <BuilderToolbar />
        <div className="flex-1 flex overflow-hidden">
          {mode === 'edit' && <ComponentPalette />}
          <main className="flex-1 flex overflow-hidden">
            <Canvas />
            {mode === 'edit' && <PropertiesPanel />}
          </main>
        </div>
      </DragAndDropProvider>
    </div>
  );
};
