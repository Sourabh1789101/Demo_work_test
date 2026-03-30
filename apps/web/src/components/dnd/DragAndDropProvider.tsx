import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
  DropAnimation,
  TouchSensor,
} from '@dnd-kit/core';
import { useBuilderStore } from '../../../modules/store/builderStore';
import { DragData } from '../../../modules/Core/types';
import { componentRegistry } from '../../../lib/componentRegistry';

interface DragAndDropProviderProps {
  children: React.ReactNode;
}

export const DragAndDropProvider: React.FC<DragAndDropProviderProps> = ({ children }) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeData, setActiveData] = useState<DragData | null>(null);

  const { addComponent, moveComponent, setDraggedId, selectComponent } = useBuilderStore();

  // Configure sensors for mouse, touch, and keyboard
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: keyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DragData;
    
    setActiveId(active.id as string);
    setActiveData(data);
    setDraggedId(active.id as string);

    if (data?.type === 'canvas-item') {
      selectComponent(active.id as string);
    }
  }, [setDraggedId, selectComponent]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    if (!over) return;

    // Optional: Visual feedback for drop zones
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    setActiveId(null);
    setActiveData(null);
    setDraggedId(null);

    if (!over) return;

    const activeData = active.data.current as DragData;
    const overId = over.id as string;

    // Case 1: New component from palette
    if (activeData?.type === 'sidebar-item' && activeData.componentType) {
      const { schema } = useBuilderStore.getState();
      
      if (overId === 'canvas') {
        // Dropped on empty canvas
        addComponent(activeData.componentType);
      } else {
        // Insert before existing component
        const overIndex = schema.components.findIndex((c) => c.id === overId);
        if (overIndex !== -1) {
          addComponent(activeData.componentType, overIndex);
        }
      }
    }

    // Case 2: Reordering existing components
    else if (activeData?.type === 'canvas-item' && active.id !== over.id) {
      const { schema } = useBuilderStore.getState();
      const oldIndex = schema.components.findIndex((c) => c.id === active.id);
      const newIndex = schema.components.findIndex((c) => c.id === overId);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        moveComponent(oldIndex, newIndex);
      }
    }
  }, [addComponent, moveComponent, setDraggedId]);

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: { opacity: '0.5' },
      },
    }),
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={dropAnimation}>
        {activeId ? <DragOverlayPreview id={activeId} data={activeData} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

const DragOverlayPreview: React.FC<{ id: string; data: DragData | null }> = ({ id, data }) => {
  // Sidebar item preview
  if (data?.type === 'sidebar-item') {
    const def = componentRegistry.find((c) => c.type === data.componentType);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-500 opacity-90 rotate-2 w-64 cursor-grabbing">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{def?.icon}</span>
          <span className="font-medium">{def?.label}</span>
        </div>
      </div>
    );
  }

  // Canvas item preview
  const { schema } = useBuilderStore.getState();
  const component = schema.components.find((c) => c.id === id);
  
  if (!component) return null;

  return (
    <div className="bg-blue-50 p-4 rounded-lg shadow-2xl border-2 border-blue-600 opacity-95 rotate-1 scale-105 cursor-grabbing">
      <div className="font-medium text-blue-900">{component.label}</div>
      <div className="text-xs text-blue-600">Moving...</div>
    </div>
  );
};

// Custom keyboard coordinate getter
const keyboardCoordinates = (event: any, { context }: any) => {
  const { active, droppableRects, droppableContainers } = context;
  
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
    event.preventDefault();
    
    const containers = droppableContainers.getEnabled();
    const rects = Array.from(containers.values()).map((container: any) => droppableRects.get(container.id));
    
    // Simple vertical navigation
    const currentIndex = containers.findIndex((c: any) => c.id === active.id);
    
    if (event.code === 'ArrowUp' && currentIndex > 0) {
      return rects[currentIndex - 1];
    }
    if (event.code === 'ArrowDown' && currentIndex < containers.length - 1) {
      return rects[currentIndex + 1];
    }
  }
  
  return null;
};