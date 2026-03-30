import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { FormComponent } from '../../../modules/Core/types';
import { Trash2, Copy, GripVertical } from 'lucide-react';
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
      <div className="py-2">
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
        ${isDragging ? 'opacity-40 rotate-1' : ''}
      `}
      onClick={(e) => {
        e.stopPropagation();
        selectComponent(component.id);
      }}
    >
      {/* Selection Border */}
      <div className={`
        absolute inset-0 border-2 rounded-lg pointer-events-none transition-colors duration-200
        ${isSelected ? 'border-blue-500 bg-blue-50/30' : 'border-transparent group-hover:border-blue-300'}
      `} />

      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className={`
          absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full pr-2
          cursor-grab active:cursor-grabbing
          ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
          transition-opacity duration-200
        `}
      >
        <div className="bg-blue-500 text-white p-1.5 rounded-l-md shadow-sm">
          <GripVertical size={14} />
        </div>
      </div>

      {/* Action Toolbar */}
      {isSelected && (
        <div className="absolute -top-3 right-2 flex items-center space-x-1 z-20">
          <ActionButton 
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            icon={<Copy size={12} />}
            label="Duplicate"
            variant="secondary"
          />
          <ActionButton 
            onClick={(e) => {
              e.stopPropagation();
              removeComponent(component.id);
            }}
            icon={<Trash2 size={12} />}
            label="Delete"
            variant="danger"
          />
        </div>
      )}

      {/* Component Content */}
      <div className="p-4">
        <ComponentPreview component={component} definition={definition} />
      </div>

      {/* Width Indicator (if resized) */}
      {component.styles?.width && component.styles.width !== 'full' && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[10px] text-gray-400 bg-white px-2 border rounded-full">
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
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50',
    danger: 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
  };

  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      className={`p-1.5 rounded shadow-sm transition-colors ${colors[variant]}`}
    >
      {icon}
    </button>
  );
};

// Visual preview of the component
const ComponentPreview: React.FC<{ 
  component: FormComponent; 
  definition?: any 
}> = ({ component, definition }) => {
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
          <p className="text-gray-600">
            {component.properties?.content || 'Lorem ipsum dolor sit amet...'}
          </p>
        );

      case 'divider':
        return <hr className="border-gray-200 my-4" />;

      case 'checkbox':
      case 'radio':
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="space-y-2">
              {(component.properties?.options || []).map((opt: any) => (
                <label key={opt.id || opt.value} className="flex items-center space-x-2 cursor-pointer">
                  <input 
                    type={component.type === 'radio' ? 'radio' : 'checkbox'} 
                    name={component.type === 'radio' ? component.id : undefined}
                    disabled 
                    className="text-blue-600 cursor-pointer" 
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'select':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <select
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 text-sm cursor-not-allowed"
            >
              <option>{component.properties?.placeholder || 'Select an option...'}</option>
              {(component.properties?.options || []).map((opt: any) => (
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border border-gray-300 rounded-md bg-gray-50 divide-y divide-gray-200 max-h-32 overflow-hidden cursor-not-allowed">
              {(component.properties?.options || []).slice(0, 4).map((opt: any) => (
                <div key={opt.id || opt.value} className="flex items-center gap-2 px-3 py-1.5">
                  <input type="checkbox" disabled aria-label={opt.label} className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded" />
                  <span className="text-xs text-gray-600">{opt.label}</span>
                </div>
              ))}
            </div>
            {component.properties?.helperText && (
              <p className="mt-1 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <textarea
              disabled
              rows={component.properties?.rows || 4}
              placeholder={component.properties?.placeholder}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 text-sm cursor-not-allowed resize-none"
            />
            {component.properties?.helperText && (
              <p className="mt-1 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );

      case 'file':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <div className="text-gray-400 mb-1">📎</div>
              <div className="text-xs text-gray-500">Click to upload or drag and drop</div>
              {component.properties?.accept && (
                <div className="text-xs text-gray-400 mt-1">{component.properties.accept}</div>
              )}
            </div>
          </div>
        );

      case 'rating':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
            </label>
            <div className="flex space-x-1">
              {Array.from({ length: component.properties?.maxRating || 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">★</span>
              ))}
            </div>
          </div>
        );

      case 'signature':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
            </label>
            <div className="border border-gray-300 rounded-md p-4 bg-white h-32 flex items-center justify-center text-gray-400">
              <span>✍️ Sign here</span>
            </div>
          </div>
        );

      case 'toggle':
        return (
          <div className="flex items-center space-x-3">
            <div className="relative inline-block w-11 h-6 bg-gray-300 rounded-full cursor-pointer">
              <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
            </div>
            <label className="text-sm font-medium text-gray-700">
              {component.label}
            </label>
          </div>
        );

      case 'slider':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
            </label>
            <input
              type="range"
              min={component.properties?.min || 0}
              max={component.properties?.max || 100}
              disabled
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <input
              type={component.type}
              disabled
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 text-sm cursor-not-allowed"
            />
          </div>
        );

      case 'image-upload':
        return (
          <div className={widthClass}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {component.label}
              {component.validation?.some(v => v.type === 'required') && (
                <span className="text-red-500 ml-1">*</span>
              )}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-md p-4 text-center bg-gray-50">
              <div className="text-2xl text-gray-400 mb-1">🖼️</div>
              <div className="text-xs text-gray-500">Click to upload image</div>
              {component.properties?.accept && (
                <div className="text-xs text-gray-400 mt-1">{component.properties.accept}</div>
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
          <div className={`flex items-center justify-center text-[10px] text-gray-400 border border-dashed border-gray-200 rounded bg-gray-50/50 ${spacerCls}`}>
            Spacer ({component.properties?.size ?? 'medium'})
          </div>
        );
      }

      case 'html':
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="text-[10px] text-purple-500 font-mono uppercase tracking-wider mb-1">HTML Block</div>
            <p className="text-xs text-gray-500 font-mono truncate">
              {component.properties?.content || '<p>HTML content</p>'}
            </p>
          </div>
        );

      case 'markdown':
        return (
          <div className="border border-gray-200 rounded-md p-3 bg-white">
            <div className="text-[10px] text-teal-500 font-mono uppercase tracking-wider mb-1">Markdown</div>
            <p className="text-xs text-gray-500 font-mono line-clamp-2 whitespace-pre-line">
              {component.properties?.content || '## Title\n\nMarkdown content...'}
            </p>
          </div>
        );

      case 'container':
        return (
          <div className="border-2 border-dashed border-gray-300 rounded-md p-4 bg-gray-50">
            <div className="text-sm text-gray-500 text-center">
              {component.label} - Drop components here
            </div>
          </div>
        );

      case 'page-break':
        return (
          <div className="border-t-2 border-blue-300 pt-4 mt-4">
            <div className="text-center">
              <button type="button" className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium cursor-not-allowed" disabled>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-500 text-sm cursor-not-allowed"
            />
            {component.properties?.helperText && (
              <p className="mt-1 text-xs text-gray-500">{component.properties.helperText}</p>
            )}
          </div>
        );
    }
  };

  return (
    <div className="relative">
      {/* Type Badge */}
      {definition && (
        <div className="absolute -top-2 left-2 bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none uppercase tracking-wider font-medium">
          {definition.label}
        </div>
      )}
      {renderContent()}
    </div>
  );
};