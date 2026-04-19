import React, { useState, useMemo } from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Search,
  GripVertical,
  Type,
  Mail,
  Hash,
  AlignLeft,
  Phone,
  Lock,
  Link,
  ChevronDown,
  CheckSquare,
  Circle,
  ToggleLeft,
  Sliders,
  Calendar,
  CalendarDays,
  Clock,
  Upload,
  Star,
  PenTool,
  Palette,
  Minus,
  Square,
  Columns,
  FileText,
  List,
  Heading2,
  ImagePlus,
  MoveVertical,
  Code2,
  FileCode2,
  Plus,
  Command,
} from 'lucide-react';
import { ComponentDefinition, ComponentCategory, ComponentType } from '../../../modules/Core/types';
import { componentRegistry } from '../../../lib/componentRegistry';
import { useBuilderStore } from '../../../modules/store/builderStore';

const COMPONENT_ICONS: Partial<Record<ComponentType, React.ReactNode>> = {
  textfield:          <Type size={14} />,
  email:              <Mail size={14} />,
  number:             <Hash size={14} />,
  textarea:           <AlignLeft size={14} />,
  phone:              <Phone size={14} />,
  password:           <Lock size={14} />,
  url:                <Link size={14} />,
  select:             <ChevronDown size={14} />,
  multiselect:        <List size={14} />,
  checkbox:           <CheckSquare size={14} />,
  radio:              <Circle size={14} />,
  toggle:             <ToggleLeft size={14} />,
  slider:             <Sliders size={14} />,
  date:               <Calendar size={14} />,
  'datetime-local':   <CalendarDays size={14} />,
  time:               <Clock size={14} />,
  month:              <Calendar size={14} />,
  week:               <Calendar size={14} />,
  file:               <Upload size={14} />,
  'image-upload':     <ImagePlus size={14} />,
  rating:             <Star size={14} />,
  signature:          <PenTool size={14} />,
  color:              <Palette size={14} />,
  heading:            <Heading2 size={14} />,
  paragraph:          <AlignLeft size={14} />,
  html:               <Code2 size={14} />,
  markdown:           <FileCode2 size={14} />,
  divider:            <Minus size={14} />,
  spacer:             <MoveVertical size={14} />,
  container:          <Square size={14} />,
  columns:            <Columns size={14} />,
  'page-break':       <FileText size={14} />,
};

const CATEGORY_CONFIG: Record<string, { label: string; accent: string; dot: string; bgLight: string }> = {
  basic:    { label: 'Basic Fields',    accent: 'text-blue-600',     dot: 'bg-blue-500',     bgLight: 'bg-blue-50'     },
  advanced: { label: 'Advanced Fields', accent: 'text-purple-600',   dot: 'bg-purple-500',   bgLight: 'bg-purple-50'   },
  layout:   { label: 'Layout',          accent: 'text-amber-600',    dot: 'bg-amber-500',    bgLight: 'bg-amber-50'    },
  content:  { label: 'Content',         accent: 'text-emerald-600', dot: 'bg-emerald-500',  bgLight: 'bg-emerald-50' },
};

const PaletteItem: React.FC<{ definition: ComponentDefinition }> = ({ definition }) => {
  const addComponent = useBuilderStore(s => s.addComponent);

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${definition.type}`,
    data: { type: 'sidebar-item', componentType: definition.type, definition },
  });

  const icon = COMPONENT_ICONS[definition.type] ?? <Type size={14} />;
  const cfg = CATEGORY_CONFIG[definition.category] ?? { accent: 'text-gray-400', dot: 'bg-gray-400', label: '', bgLight: 'bg-gray-50' };

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={() => addComponent(definition.type)}
      title={`${definition.label} — click to add, drag to position`}
      className={`
        group flex items-center gap-3 px-3 py-2.5 mx-2 mb-1 rounded-lg
        cursor-pointer select-none transition-all duration-150
        hover:bg-white/8 active:scale-95 border border-transparent hover:border-white/10
        ${isDragging ? 'opacity-40 scale-95' : ''}
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-md transition-all ${cfg.accent} opacity-75 group-hover:opacity-100 group-hover:bg-white/10`}>
        {icon}
      </div>

      {/* Label */}
      <span className="flex-1 text-xs font-medium text-gray-300 group-hover:text-white transition-colors truncate">
        {definition.label}
      </span>

      {/* Add / drag hint */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <Plus size={12} className="text-gray-500" />
        <GripVertical size={12} className="text-gray-600" />
      </div>
    </div>
  );
};

export const ComponentPalette: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const filteredComponents = useMemo(() => {
    if (!searchQuery.trim()) return null;
    const q = searchQuery.toLowerCase();
    return componentRegistry.filter(
      c =>
        c.label.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  const categories = ['basic', 'advanced', 'layout', 'content'] as ComponentCategory[];

  const toggleCollapse = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <div className="w-60 bg-gradient-to-b from-gray-900 to-gray-950 border-r border-gray-800 h-full flex flex-col shrink-0 shadow-xl">
      {/* Header */}
      <div className="px-4 pt-5 pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <Command size={12} className="text-white" />
          </div>
          <p className="text-xs font-bold text-gray-100 tracking-wide uppercase">Form Elements</p>
        </div>
        <p className="text-[10px] text-gray-500 mt-1 pl-7">Drag or click to add</p>
      </div>

      {/* Search */}
      <div className="px-3 py-3 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search components…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-800/50 border border-gray-700 rounded-lg text-xs text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          />
        </div>
      </div>

      {/* Component list */}
      <div className="flex-1 overflow-y-auto pb-4">
        {filteredComponents ? (
          /* Search results */
          <div className="pt-2">
            {filteredComponents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-xs text-gray-500">No components found</p>
              </div>
            ) : (
              <>
                <p className="px-4 pb-2 text-[10px] text-gray-600 font-medium">
                  {filteredComponents.length} result{filteredComponents.length !== 1 ? 's' : ''}
                </p>
                {filteredComponents.map(def => <PaletteItem key={def.type} definition={def} />)}
              </>
            )}
          </div>
        ) : (
          /* Grouped by category */
          categories.map(cat => {
            const items = componentRegistry.filter(c => c.category === cat);
            const cfg = CATEGORY_CONFIG[cat];
            const isCollapsed = collapsed[cat];

            return (
              <div key={cat} className="mb-1">
                {/* Category header */}
                <button
                  type="button"
                  onClick={() => toggleCollapse(cat)}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-white/5 transition-colors group border-b border-gray-800/50"
                >
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 transition-all ${cfg.dot} group-hover:scale-125`} />
                  <span className={`flex-1 text-left text-xs font-bold uppercase tracking-wider ${cfg.accent}`}>
                    {cfg.label}
                  </span>
                  <span className="text-[10px] text-gray-600 mr-1 font-medium">{items.length}</span>
                  <ChevronDown
                    size={12}
                    className={`text-gray-600 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                  />
                </button>

                {/* Items */}
                {!isCollapsed && items.map(def => (
                  <PaletteItem key={def.type} definition={def} />
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

