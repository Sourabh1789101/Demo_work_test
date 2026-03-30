import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { CanvasItem } from './CanvasItem';
import { DeviceFrame } from './Device.Frame';
import { FormPreview } from '../preview/FormPreview';
import { MousePointer2, GripVertical } from 'lucide-react';

export const Canvas: React.FC = () => {
  const { schema, mode, view, zoom } = useBuilderStore();
  const { setNodeRef, isOver } = useDroppable({ id: 'canvas' });

  const isPreview = mode === 'preview';
  const components = schema.components;

  if (isPreview) {
    return (
      <div className="flex-1 bg-gradient-to-br from-violet-50 via-indigo-50/50 to-blue-50 overflow-auto p-8 flex justify-center">
        <DeviceFrame view={view} zoom={zoom}>
          <div className="h-full overflow-y-auto">
            <FormPreview />
          </div>
        </DeviceFrame>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-slate-100 overflow-auto p-6 flex justify-center">
      <DeviceFrame view={view} zoom={zoom}>
        <div
          ref={setNodeRef}
          className={`
            relative min-h-[640px] bg-white
            transition-all duration-200
            ${isOver ? 'ring-2 ring-violet-400 ring-dashed bg-violet-50/20' : ''}
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
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="bg-violet-600 text-white px-5 py-2.5 rounded-full text-sm font-semibold shadow-lg">
                Drop here
              </div>
            </div>
          )}

          {/* Sortable list */}
          <SortableContext items={components.map(c => c.id)} strategy={verticalListSortingStrategy}>
            <div className="px-6 pb-6 space-y-1.5">
              {components.map((component, index) => (
                <CanvasItem key={component.id} component={component} index={index} isPreview={false} />
              ))}
            </div>
          </SortableContext>

          {/* Drop at bottom when items exist */}
          {isOver && components.length > 0 && (
            <div className="mx-6 mb-4 h-1 bg-violet-400 rounded-full" />
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
    <div className="px-8 pt-8 pb-5 border-b border-gray-100 bg-gradient-to-r from-violet-50/60 to-indigo-50/40">
      <input
        type="text"
        value={schema.title}
        onChange={(e) => updateSchema({ title: e.target.value })}
        className="w-full text-2xl font-bold text-gray-900 border-none focus:ring-0 p-0 bg-transparent placeholder-gray-300 focus:outline-none"
        placeholder="Form Title"
      />
      <textarea
        value={schema.description || ''}
        onChange={(e) => updateSchema({ description: e.target.value })}
        className="w-full mt-2 text-sm text-gray-500 border-none focus:ring-0 p-0 resize-none placeholder-gray-300 bg-transparent focus:outline-none leading-relaxed"
        placeholder="Add a description (optional)…"
        rows={2}
      />
    </div>
  );
};

const FormFooter: React.FC = () => {
  const { schema } = useBuilderStore();

  return (
    <div className="px-8 pb-8 pt-4">
      <button
        type="button"
        className="w-full py-3 px-4 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold rounded-xl shadow-md shadow-violet-200 hover:from-violet-700 hover:to-indigo-700 transition-all"
      >
        {schema.settings?.submitButtonText || 'Submit Form'}
      </button>
      <p className="text-center text-[10px] text-gray-300 mt-3">
        Protected by reCAPTCHA · Privacy · Terms
      </p>
    </div>
  );
};

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-20 px-8">
    <div className="w-16 h-16 bg-violet-50 border-2 border-dashed border-violet-200 rounded-2xl flex items-center justify-center mb-4">
      <MousePointer2 size={24} className="text-violet-300" />
    </div>
    <h3 className="text-sm font-semibold text-gray-400 mb-1">Start building your form</h3>
    <p className="text-xs text-gray-300 text-center max-w-44">
      Drag fields from the left panel or click to add them here
    </p>
    <div className="flex items-center gap-1.5 mt-4 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-100">
      <GripVertical size={11} className="text-gray-300" />
      <span className="text-[10px] text-gray-400">Drag · Click · Reorder</span>
    </div>
  </div>
);
