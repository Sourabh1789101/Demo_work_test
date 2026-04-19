import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { CanvasItem } from './CanvasItem';
import { DeviceFrame } from './Device.Frame';
import { FormPreview } from '../preview/FormPreview';
import { MousePointer2, GripVertical, Sparkles } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { schema, mode, view, zoom } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const isPreview = mode === 'preview';
  const components = schema.components;

  if (isPreview) {
    return (
      <div className="flex-1 bg-gradient-to-br from-blue-50 via-indigo-50/50 to-purple-50 overflow-auto p-8 flex justify-center">
        <DeviceFrame view={view} zoom={zoom}>
          <div className="h-full overflow-y-auto">
            <FormPreview />
          </div>
        </DeviceFrame>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 overflow-auto p-8 flex justify-center">
      <DeviceFrame view={view} zoom={zoom}>
        <div
          ref={setNodeRef}
          className={`
            relative min-h-[640px] bg-white rounded-2xl shadow-lg
            transition-all duration-200
            ${isOver ? 'ring-2 ring-blue-500 ring-offset-2 shadow-blue-200' : 'shadow-gray-200/50'}
          `}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              useBuilderStore.getState().selectComponent(null);
            }
          }}
        >
          {/* Form Header */}
          <FormHeader />

          {/* Empty State */}
          {components.length === 0 && !isOver && <EmptyState />}

          {/* Drop zone overlay */}
          {isOver && components.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-full text-sm font-semibold shadow-lg">
                Drop components here
              </div>
            </div>
          )}

          {/* Sortable list */}
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="px-8 pb-8 space-y-3">
              {components.map((component, index) => (
                <CanvasItem key={component.id} component={component} index={index} isPreview={false} />
              ))}
            </div>
          </SortableContext>

          {/* Drop indicator */}
          {isOver && components.length > 0 && (
            <div className="mx-8 mb-6 h-0.5 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" />
          )}

          {/* Form Footer */}
          <FormFooter />
        </div>
      </DeviceFrame>
    </div>
  );
};

const FormHeader: React.FC = () => {
  const { schema, updateSchema } = useBuilderStore();

  return (
    <div className="px-8 pt-8 pb-6 border-b border-gray-100 bg-gradient-to-br from-blue-50/40 to-indigo-50/30">
      <input
        type="text"
        value={schema.title}
        onChange={(e) => updateSchema({ title: e.target.value })}
        className="w-full text-3xl font-bold text-gray-900 border-none focus:ring-0 p-0 bg-transparent placeholder-gray-300 focus:outline-none placeholder-opacity-50"
        placeholder="Form Title"
      />
      <textarea
        value={schema.description || ''}
        onChange={(e) => updateSchema({ description: e.target.value })}
        className="w-full mt-3 text-sm text-gray-600 border-none focus:ring-0 p-0 resize-none placeholder-gray-300 bg-transparent focus:outline-none leading-relaxed placeholder-opacity-60"
        placeholder="Add a description (optional)…"
        rows={2}
      />
    </div>
  );
};

const FormFooter: React.FC = () => {
  const { schema } = useBuilderStore();

  return (
    <div className="px-8 pb-8 pt-6 border-t border-gray-100 bg-gradient-to-br from-gray-50/50 to-gray-100/30">
      <button
        type="button"
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all hover:shadow-lg active:scale-95"
      >
        {schema.settings?.submitButtonText || 'Submit Form'}
      </button>
      <p className="text-center text-[11px] text-gray-400 mt-4 font-medium">
        Protected by reCAPTCHA · Privacy · Terms
      </p>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-24 px-8">
    <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 border-2 border-dashed border-blue-300 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
      <MousePointer2 size={32} className="text-blue-400" />
    </div>
    <h3 className="text-lg font-bold text-gray-800 mb-2">Start building your form</h3>
    <p className="text-sm text-gray-600 text-center max-w-sm mb-6">
      Drag components from the left panel or click to add them directly to your form.
    </p>
    <div className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 rounded-full border border-blue-200 shadow-sm">
      <Sparkles size={14} className="text-blue-600" />
      <span className="text-xs text-blue-700 font-medium">Drag · Click · Reorder · Customize</span>
    </div>
  </div>
);

