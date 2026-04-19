import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { FormComponent } from '../../../modules/Core/types';
import { Trash2, Copy, GripVertical, Edit2 } from 'lucide-react';
import { componentRegistry } from '../../../lib/componentRegistry';

interface CanvasItemProps {
  component: FormComponent;
  index: number;
  isPreview: boolean;
}

export const CanvasItem: React.FC<CanvasItemProps> = ({ component, index, isPreview }) => {
  const { selectedId, selectComponent, removeComponent, duplicateComponent } = useBuilderStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: component.id,
    disabled: isPreview,
    data: {
      type: 'canvas-item',
      component,
      index,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
  };

  const isSelected = selectedId === component.id;
  const definition = componentRegistry.find(c => c.type === component.type);

  if (isPreview) {
    return (
      <div className="py-3">
        <ComponentPreview component={component} />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group transition-all duration-200
        ${isDragging ? 'opacity-50 scale-100' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    >
      {/* Selection Border & Background */}
      <div className={`
        absolute inset-0 rounded-xl pointer-events-none transition-all duration-200
        ${isSelected
          ? 'border-2 border-blue-500 bg-blue-50 shadow-md shadow-blue-200/50'
          : 'border-2 border-transparent group-hover:border-blue-300 group-hover:bg-blue-50/40'}
      `} />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-3
          cursor-grab active:cursor-grabbing
          transition-all duration-200
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
        `}
      >
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-2 rounded-lg shadow-md hover:shadow-lg transition-shadow">
          <GripVertical size={16} />
        </div>
      </div>

      {/* Action Toolbar */}
      {isSelected && (
        <div className="absolute -top-3.5 right-3 flex items-center gap-1.5 z-20">
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            icon={<Copy size={14} />}
            label="Duplicate"
            variant="secondary"
          />
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              removeComponent(component.id);
            }}
            icon={<Trash2 size={14} />}
            label="Delete"
            variant="danger"
          />
        </div>
      )}

      {/* Component Content */}
      <div className="px-5 py-4 relative z-0">
        <ComponentPreview component={component} definition={definition} isSelected={isSelected} />
      </div>

      {/* Width Indicator (if resized) */}
      {component.styles?.width && component.styles.width !== 'full' && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-medium text-gray-600 bg-white px-2.5 py-1 border border-gray-200 rounded-full shadow-sm">
          {component.styles.width}
        </div>
      )}
    </div>
  );
};

const ActionButton: React.FC<{
  onClick: (e: React.MouseEvent) => void;
  icon: React.ReactNode;
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
}> = ({ onClick, icon, label, variant = 'secondary' }) => {
  const colors = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 shadow-md shadow-blue-200',
    secondary: 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50 shadow-sm',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 shadow-sm',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-2 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95 ${colors[variant]}`}
    >
      {icon}
    </button>
  );
};

// Visual preview of the component
const ComponentPreview: React.FC<{
  component: FormComponent;
  definition?: any;
  isSelected?: boolean;
}> = ({ component, definition, isSelected }) => {
  const widthClass = {
    full: 'w-full',
    half: 'w-1/2 inline-block pr-4',
    third: 'w-1/3 inline-block pr-4',
    quarter: 'w-1/4 inline-block pr-4',
    auto: 'w-auto',
  }[component.styles?.width || 'full'];

  const renderContent = () => {
    switch (component.type) {
      case 'heading':
        const Tag = `h${component.properties?.level || 2}` as keyof JSX.IntrinsicElements;
        return (
          <Tag className="font-bold text-gray-900 text-xl">
            {component.properties?.content || component.label}
          </Tag>
        );

      case 'paragraph':
        return (
          <p className="text-gray-600 leading-relaxed">
            {component.properties?.content || 'Lorem ipsum dolor sit amet...'}
          </p>
        );

      case 'divider':
        return <hr className="border-gray-200 my-4" />;

      case 'checkbox':
      case 'radio':
        return (
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="space-y-2.5">
              {(component.properties?.options || []).slice(0, 2).map((opt: any) => (
                <label key={opt.id || opt.value} className="flex items-center space-x-3 cursor-pointer group">
                  <input
                    type={component.type === 'radio' ? 'radio' : 'checkbox'}
                    name={component.type === 'radio' ? component.id : undefined}
                    disabled
                    className="text-blue-600 cursor-pointer w-4 h-4"
                  />
                  <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <select
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed focus:ring-2 focus:ring-blue-500"
            >
              <option>{component.properties?.placeholder || 'Select an option...'}</option>
              {(component.properties?.options || []).slice(0, 2).map((opt: any) => (
                <option key={opt.id || opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        );

      case 'multiselect':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border border-gray-300 rounded-lg bg-gray-50 divide-y divide-gray-200 max-h-32 overflow-hidden cursor-not-allowed">
              {(component.properties?.options || []).slice(0, 3).map((opt: any) => (
                <div key={opt.id || opt.value} className="flex items-center gap-3 px-4 py-2.5">
                  <input type="checkbox" disabled aria-label={opt.label} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                  <span className="text-sm text-gray-700 font-medium">{opt.label}</span>
                </div>
              ))}
            </div>
            {component.properties?.helperText && (
              <p className="mt-2 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              disabled
              rows={component.properties?.rows || 4}
              placeholder={component.properties?.placeholder}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed resize-none focus:ring-2 focus:ring-blue-500"
            />
            {component.properties?.helperText && (
              <p className="mt-2 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
              <div className="text-3xl mb-2">📎</div>
              <div className="text-sm text-gray-600 font-medium">Click to upload or drag and drop</div>
              {component.properties?.accept && (
                <div className="text-xs text-gray-500 mt-1">{component.properties.accept}</div>
              )}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2.5">
              {component.label}
            </label>
            <div className="flex space-x-2">
              {Array.from({ length: component.properties?.maxRating || 5 }).map((_, i) => (
                <button key={i} className="text-2xl cursor-pointer hover:scale-110 transition">★</button>
              ))}
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-white flex items-center justify-center text-gray-400 h-40">
              <span className="text-2xl">✍️ Sign here</span>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-4">
            <div className="relative inline-block w-12 h-7 bg-gray-300 rounded-full cursor-pointer transition">
              <div className="absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition"></div>
            </div>
            <label className="text-sm font-semibold text-gray-800">
              {component.label}
            </label>
          </div>
        );

      case 'slider':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              {component.label}
            </label>
            <input
              type="range"
              min={component.properties?.min || 0}
              max={component.properties?.max || 100}
              disabled
              className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-not-allowed"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-2 font-medium">
              <span>{component.properties?.min || 0}</span>
              <span>{component.properties?.max || 100}</span>
            </div>
          </div>
        );

      case 'date':
      case 'datetime-local':
      case 'time':
      case 'month':
      case 'week':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={component.type}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      case 'image-upload':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50 hover:bg-gray-100 transition">
              <div className="text-4xl text-gray-400 mb-2">🖼️</div>
              <div className="text-sm text-gray-600 font-medium">Click to upload image</div>
              {component.properties?.accept && (
                <div className="text-xs text-gray-500 mt-1">{component.properties.accept}</div>
              )}
            </div>
          </div>
        );

      case 'spacer': {
        const SPACER_H: Record<string, string> = {
          small: 'h-8', medium: 'h-16', large: 'h-24', xl: 'h-32',
        };
        const spacerCls = SPACER_H[component.properties?.size ?? 'medium'] ?? 'h-16';
        return (
          <div className={`flex items-center justify-center text-xs text-gray-400 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50/50 font-medium ${spacerCls}`}>
            Spacer ({component.properties?.size ?? 'medium'})
          </div>
        );
      }

      case 'html':
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-xs text-purple-600 font-bold uppercase tracking-wider mb-2">HTML Block</div>
            <p className="text-xs text-gray-500 font-mono truncate">
              {component.properties?.content || '<p>HTML content</p>'}
            </p>
          </div>
        );

      case 'markdown':
        return (
          <div className="border border-gray-200 rounded-lg p-4 bg-white">
            <div className="text-xs text-teal-600 font-bold uppercase tracking-wider mb-2">Markdown</div>
            <p className="text-xs text-gray-500 font-mono line-clamp-2 whitespace-pre-line">
              {component.properties?.content || '## Title\n\nMarkdown content...'}
            </p>
          </div>
        );

      case 'container':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
            <div className="text-sm text-gray-600 text-center font-medium">
              {component.label} - Drop components here
            </div>
          </div>
        );

      case 'page-break':
        return (
          <div className="border-t-2 border-blue-300 pt-6 mt-6">
            <div className="text-center">
              <button type="button" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold cursor-not-allowed" disabled>
                {component.properties?.content || 'Continue'}
              </button>
            </div>
          </div>
        );

      default:
        // Standard input (textfield, email, number, password, phone, url, color)
        const inputType = component.type === 'textfield' ? 'text' :
                         component.type === 'email' ? 'email' :
                         component.type === 'number' ? 'number' :
                         component.type === 'password' ? 'password' :
                         component.type === 'phone' ? 'tel' :
                         component.type === 'url' ? 'url' :
                         component.type === 'color' ? 'color' : 'text';

        return (
          <div className={widthClass}>
            <label className="block text-sm font-semibold text-gray-800 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={inputType}
              disabled
              placeholder={component.properties?.placeholder}
              min={component.properties?.min}
              max={component.properties?.max}
              step={component.properties?.step}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-500 text-sm cursor-not-allowed focus:ring-2 focus:ring-blue-500 transition"
            />
            {component.properties?.helperText && (
              <p className="mt-2 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Type Badge */}
      {definition && (
        <div className="absolute -top-2.5 left-3 bg-white border border-gray-200 text-gray-700 text-[10px] px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-widest font-bold shadow-sm">
          {definition.label}
        </div>
      )}
      {renderContent()}
    </div>
  );
};

