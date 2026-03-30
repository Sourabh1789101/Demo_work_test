// ==========================================
// MODULE 2: STATE MANAGEMENT (The Brain)
// File: src/modules/store/builderStore.ts
// ==========================================

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { nanoid } from 'nanoid';
import { getComponentDefinition } from '../../lib/componentRegistry';
import type {
  FormSchema,
  FormComponent,
  FormStep,
  BuilderState,
  ComponentType,
} from '../Core/types';

// ==========================================
// CONSTANTS
// ==========================================

const MAX_HISTORY = 50;
const STORAGE_KEY = 'form-builder-v1';
const VERSIONS_STORAGE_KEY = 'form-builder-versions-v1';
const MAX_VERSIONS = 10;

export type FormVersion = {
  id: string;
  label: string;
  snapshot: FormSchema;
  savedAt: string;
};

const loadVersions = (): FormVersion[] => {
  try {
    const raw = localStorage.getItem(VERSIONS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as FormVersion[]) : [];
  } catch {
    return [];
  }
};

const persistVersions = (versions: FormVersion[]) => {
  try {
    localStorage.setItem(VERSIONS_STORAGE_KEY, JSON.stringify(versions));
  } catch {
    // ignore
  }
};

// ==========================================
// INITIAL STATE FACTORIES
// ==========================================

const createEmptySchema = (): FormSchema => ({
  id: nanoid(),
  version: 1,
  title: 'Untitled Form',
  description: '',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  settings: {
    submitButtonText: 'Submit',
    layout: 'vertical',
    theme: 'default',
    multiStep: false,
    successMessage: 'Thank you for your submission!',
  },
  components: [],
  steps: [{ id: 'default', title: 'Page 1', description: '', componentIds: [] }],
  logic: {
    calculations: [],
    validations: [],
  },
});

const createEmptyComponent = (type: ComponentType): FormComponent => ({
  id: nanoid(),
  type,
  label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
  validation: [],
  styles: { width: 'full' },
  properties: {},
  conditions: [],
});

// ==========================================
// STORE INTERFACE
// ==========================================

interface BuilderActions {
  // -- Component CRUD --
  addComponent: (type: ComponentType, index?: number, parentId?: string) => string;
  updateComponent: (id: string, updates: Partial<FormComponent>) => void;
  removeComponent: (id: string) => void;
  duplicateComponent: (id: string) => string | null;
  moveComponent: (dragIndex: number, hoverIndex: number) => void;
  reorderComponents: (orderedIds: string[]) => void;
  updateComponentProperty: (id: string, path: string, value: any) => void;
  
  // -- Bulk Operations --
  addComponentsBatch: (types: ComponentType[]) => string[];
  deleteSelected: () => void;
  duplicateSelected: () => void;
  
  // -- Selection & Focus --
  selectComponent: (id: string | null) => void;
  selectNext: () => void;
  selectPrevious: () => void;
  setDraggedId: (id: string | null) => void;
  clearSelection: () => void;
  
  // -- Schema Operations --
  setSchema: (schema: FormSchema) => void;
  updateSchema: (updates: Partial<FormSchema>) => void;
  updateSettings: (settings: Partial<FormSchema['settings']>) => void;
  resetSchema: () => void;
  newForm: () => void;
  
  // -- History (Undo/Redo) --
  saveHistory: () => void;
  undo: () => void;
  redo: () => void;
  jumpToHistory: (index: number) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  getHistoryInfo: () => { current: number; total: number };
  
  // -- Multi-step Logic --
  addStep: () => string;
  removeStep: (stepId: string) => void;
  updateStep: (stepId: string, updates: Partial<FormStep>) => void;
  moveComponentToStep: (componentId: string, targetStepId: string) => void;
  reorderSteps: (stepIds: string[]) => void;
  setCurrentStep: (stepId: string) => void;
  
  // -- View Controls --
  setView: (view: BuilderState['view']) => void;
  setMode: (mode: BuilderState['mode']) => void;
  setZoom: (zoom: number) => void;
  togglePreview: () => void;
  
  // -- Import/Export --
  exportSchema: () => string;
  exportToJSON: () => string;
  exportToHTML: () => string;
  importSchema: (json: string) => { success: boolean; error?: string };
  loadTemplate: (template: FormSchema) => void;
  
  // -- Validation --
  validateSchema: () => { valid: boolean; errors: ValidationError[] };
  autoFix: () => void;

  // -- Search & Filter --
  searchComponents: (query: string) => FormComponent[];
  getComponentPath: (id: string) => string[];

  // -- Form Versioning --
  saveVersion: (label?: string) => void;
  restoreVersion: (versionId: string) => void;
  listVersions: () => FormVersion[];
  deleteVersion: (versionId: string) => void;
}

interface ValidationError {
  fieldId: string;
  fieldLabel: string;
  error: string;
  type: 'missing-label' | 'invalid-validation' | 'orphaned-component';
}

// ==========================================
// MAIN STORE
// ==========================================

export const useBuilderStore = create<BuilderState & BuilderActions>()(
  subscribeWithSelector(
    immer((set, get) => ({
      
      // ==========================================
      // INITIAL STATE
      // ==========================================
      
      schema: createEmptySchema(),
      selectedId: null,
      hoveredId: null,
      draggedId: null,
      history: [],
      historyIndex: -1,
      view: 'desktop',
      mode: 'edit',
      zoom: 100,
      sidebarOpen: true,
      panelOpen: true,
      currentStepId: null,
      isSaving: false,
      lastSaved: null,
      
      // ==========================================
      // COMPONENT CRUD OPERATIONS
      // ==========================================
      
      addComponent: (type, index = -1, parentId) => {
        const newId = nanoid();
        
        set((state) => {
          // Get default props from componentRegistry
          const definition = getComponentDefinition(type);
          const defaultProps = definition?.defaultProps || {};
          
          const newComponent: FormComponent = {
            ...createEmptyComponent(type),
            ...defaultProps,
            id: newId,
            type, // Ensure type is not overwritten
            parentId: parentId || undefined,
          };
          
          // If has parent, add to children array
          if (parentId) {
            const parent = findComponentRecursive(state.schema.components, parentId);
            if (parent && parent.children) {
              parent.children.push(newComponent);
            } else if (parent) {
              parent.children = [newComponent];
            }
          } else {
            // Add to root level
            if (index === -1 || index >= state.schema.components.length) {
              state.schema.components.push(newComponent);
            } else {
              state.schema.components.splice(index, 0, newComponent);
            }
            
            // Add to current step if multi-step
            if (state.schema.settings.multiStep && state.schema.steps && state.schema.steps.length > 0) {
              // Find which step contains the insertion point or use first step
              let targetStepIndex = 0;
              
              if (index > -1) {
                // Find which step contains the component at 'index'
                for (let i = 0; i < state.schema.steps.length; i++) {
                  const step = state.schema.steps[i];
                  if (index < step.componentIds.length) {
                    targetStepIndex = i;
                    break;
                  }
                }
              }
              
              state.schema.steps[targetStepIndex].componentIds.push(newId);
            }
          }
          
          state.selectedId = newId;
          state.schema.updatedAt = new Date().toISOString();
          get().saveHistory();
        });
        
        return newId;
      },
      
      updateComponent: (id, updates) => {
        set((state) => {
          const component = findComponentRecursive(state.schema.components, id);
          if (!component) return;
          
          // Deep merge for nested properties
          if (updates.properties) {
            updates.properties = { ...component.properties, ...updates.properties };
          }
          if (updates.styles) {
            updates.styles = { ...component.styles, ...updates.styles };
          }
          if (updates.validation) {
            updates.validation = [...(updates.validation || [])];
          }
          
          Object.assign(component, updates);
          state.schema.updatedAt = new Date().toISOString();
          get().saveHistory();
        });
      },
      
      updateComponentProperty: (id, path, value) => {
        set((state) => {
          const component = findComponentRecursive(state.schema.components, id);
          if (!component) return;
          
          const keys = path.split('.');
          let target: any = component;
          
          for (let i = 0; i < keys.length - 1; i++) {
            if (!target[keys[i]]) target[keys[i]] = {};
            target = target[keys[i]];
          }
          
          target[keys[keys.length - 1]] = value;
          state.schema.updatedAt = new Date().toISOString();
        });
      },
      
      removeComponent: (id) => {
        set((state) => {
          const removed = removeComponentRecursive(state.schema.components, id);
          
          if (removed) {
            // Remove from all steps
            if (state.schema.steps) {
              state.schema.steps.forEach(step => {
                step.componentIds = step.componentIds.filter(cid => cid !== id);
              });
            }
            
            if (state.selectedId === id) {
              state.selectedId = null;
            }
            
            state.schema.updatedAt = new Date().toISOString();
            get().saveHistory();
          }
        });
      },
      
      duplicateComponent: (id) => {
        const { schema } = get();
        const original = findComponentRecursive(schema.components, id);
        
        if (!original) return null;
        
        // Deep clone
        const copy = JSON.parse(JSON.stringify(original));
        copy.id = nanoid();
        copy.label = `${copy.label} (Copy)`;
        
        // Clear IDs in children to avoid duplicates
        const regenerateIds = (comp: FormComponent) => {
          comp.id = nanoid();
          if (comp.children) {
            comp.children.forEach(regenerateIds);
          }
        };
        
        if (copy.children) {
          regenerateIds(copy);
        }
        
        set((state) => {
          const index = state.schema.components.findIndex(c => c.id === id);
          const insertIndex = index === -1 ? state.schema.components.length : index + 1;
          state.schema.components.splice(insertIndex, 0, copy);
          
          // Copy step assignment
          if (state.schema.steps) {
            state.schema.steps.forEach(step => {
              const stepIndex = step.componentIds.indexOf(id);
              if (stepIndex !== -1) {
                step.componentIds.splice(stepIndex + 1, 0, copy.id);
              }
            });
          }
          
          state.selectedId = copy.id;
          state.schema.updatedAt = new Date().toISOString();
          get().saveHistory();
        });
        
        return copy.id;
      },
      
      moveComponent: (dragIndex, hoverIndex) => {
        set((state) => {
          const dragged = state.schema.components[dragIndex];
          state.schema.components.splice(dragIndex, 1);
          state.schema.components.splice(hoverIndex, 0, dragged);
          get().saveHistory();
        });
      },
      
      reorderComponents: (orderedIds) => {
        set((state) => {
          const componentMap = new Map(state.schema.components.map(c => [c.id, c]));
          state.schema.components = orderedIds.map(id => componentMap.get(id)!).filter(Boolean);
          get().saveHistory();
        });
      },
      
      // ==========================================
      // BULK OPERATIONS
      // ==========================================
      
      addComponentsBatch: (types) => {
        const ids: string[] = [];
        types.forEach((type) => {
          const id = get().addComponent(type, -1);
          ids.push(id);
        });
        return ids;
      },
      
      deleteSelected: () => {
        const { selectedId, removeComponent } = get();
        if (selectedId) {
          removeComponent(selectedId);
        }
      },
      
      duplicateSelected: () => {
        const { selectedId, duplicateComponent } = get();
        if (selectedId) {
          duplicateComponent(selectedId);
        }
      },
      
      // ==========================================
      // SELECTION & NAVIGATION
      // ==========================================
      
      selectComponent: (id) => {
        set({ selectedId: id });
      },
      
      selectNext: () => {
        const { schema, selectedId, selectComponent } = get();
        if (!selectedId) {
          if (schema.components.length > 0) selectComponent(schema.components[0].id);
          return;
        }
        
        const currentIndex = schema.components.findIndex(c => c.id === selectedId);
        if (currentIndex < schema.components.length - 1) {
          selectComponent(schema.components[currentIndex + 1].id);
        }
      },
      
      selectPrevious: () => {
        const { schema, selectedId, selectComponent } = get();
        if (!selectedId) return;
        
        const currentIndex = schema.components.findIndex(c => c.id === selectedId);
        if (currentIndex > 0) {
          selectComponent(schema.components[currentIndex - 1].id);
        }
      },
      
      setDraggedId: (id) => set({ draggedId: id }),
      
      clearSelection: () => set({ selectedId: null }),
      
      // ==========================================
      // SCHEMA OPERATIONS
      // ==========================================
      
      setSchema: (schema) => {
        set({
          schema: {
            ...schema,
            updatedAt: new Date().toISOString(),
          },
          history: [],
          historyIndex: -1,
          selectedId: null,
        });
      },
      
      updateSchema: (updates) => {
        set((state) => {
          Object.assign(state.schema, updates);
          state.schema.updatedAt = new Date().toISOString();
          get().saveHistory();
        });
      },
      
      updateSettings: (settings) => {
        set((state) => {
          state.schema.settings = { ...state.schema.settings, ...settings };
          state.schema.updatedAt = new Date().toISOString();
          get().saveHistory();
        });
      },
      
      resetSchema: () => {
        set({
          schema: createEmptySchema(),
          history: [],
          historyIndex: -1,
          selectedId: null,
        });
      },
      
      newForm: () => {
        if (confirm('Create new form? Unsaved changes will be lost.')) {
          get().resetSchema();
        }
      },
      
      // ==========================================
      // HISTORY (UNDO/REDO)
      // ==========================================
      
      saveHistory: () => {
        set((state) => {
          // Remove any future history if we're not at the end
          const newHistory = state.history.slice(0, state.historyIndex + 1);
          
          // Clone current state
          const snapshot = JSON.parse(JSON.stringify(state.schema));
          newHistory.push(snapshot);
          
          // Limit history size
          if (newHistory.length > MAX_HISTORY) {
            newHistory.shift();
          }
          
          state.history = newHistory;
          state.historyIndex = newHistory.length - 1;
        });
      },
      
      undo: () => {
        set((state) => {
          if (state.historyIndex > 0) {
            state.historyIndex--;
            state.schema = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
            state.selectedId = null; // Clear selection to avoid confusion
          }
        });
      },
      
      redo: () => {
        set((state) => {
          if (state.historyIndex < state.history.length - 1) {
            state.historyIndex++;
            state.schema = JSON.parse(JSON.stringify(state.history[state.historyIndex]));
            state.selectedId = null;
          }
        });
      },
      
      jumpToHistory: (index) => {
        set((state) => {
          if (index >= 0 && index < state.history.length) {
            state.historyIndex = index;
            state.schema = JSON.parse(JSON.stringify(state.history[index]));
          }
        });
      },
      
      canUndo: () => {
        const { historyIndex } = get();
        return historyIndex > 0;
      },
      
      canRedo: () => {
        const { historyIndex, history } = get();
        return historyIndex < history.length - 1;
      },
      
      getHistoryInfo: () => {
        const { history, historyIndex } = get();
        return { current: historyIndex + 1, total: history.length };
      },
      
      // ==========================================
      // MULTI-STEP LOGIC
      // ==========================================
      
      addStep: () => {
        const newStepId = nanoid();
        set((state) => {
          const newStep: FormStep = {
            id: newStepId,
            title: `Page ${state.schema.steps ? state.schema.steps.length + 1 : 1}`,
            description: '',
            componentIds: [],
          };
          
          if (!state.schema.steps) state.schema.steps = [];
          state.schema.steps.push(newStep);
          state.schema.settings.multiStep = true;
          get().saveHistory();
        });
        return newStepId;
      },
      
      removeStep: (stepId) => {
        set((state) => {
          if (!state.schema.steps) return;
          
          const stepIndex = state.schema.steps.findIndex(s => s.id === stepId);
          if (stepIndex === -1) return;
          
          const step = state.schema.steps[stepIndex];
          
          // Option 1: Delete components in step
          // Option 2: Move to previous step (current implementation)
          if (stepIndex > 0) {
            const prevStep = state.schema.steps[stepIndex - 1];
            prevStep.componentIds.push(...step.componentIds);
          } else if (state.schema.steps.length > 1) {
            // If removing first step, move to next step
            const nextStep = state.schema.steps[1];
            nextStep.componentIds.unshift(...step.componentIds);
          } else {
            // Last step - put back in root (legacy mode)
            // Components remain in schema.components
          }
          
          state.schema.steps.splice(stepIndex, 1);
          
          // If no steps left, disable multi-step
          if (state.schema.steps.length === 0) {
            state.schema.settings.multiStep = false;
            state.schema.steps = undefined;
          }
          
          get().saveHistory();
        });
      },
      
      updateStep: (stepId, updates) => {
        set((state) => {
          const step = state.schema.steps?.find(s => s.id === stepId);
          if (step) {
            Object.assign(step, updates);
            state.schema.updatedAt = new Date().toISOString();
          }
        });
      },
      
      moveComponentToStep: (componentId, targetStepId) => {
        set((state) => {
          // Remove from all steps first
          state.schema.steps?.forEach(step => {
            step.componentIds = step.componentIds.filter(id => id !== componentId);
          });
          
          // Add to target
          const targetStep = state.schema.steps?.find(s => s.id === targetStepId);
          if (targetStep) {
            targetStep.componentIds.push(componentId);
          }
        });
      },
      
      reorderSteps: (stepIds) => {
        set((state) => {
          if (!state.schema.steps) return;
          const stepMap = new Map(state.schema.steps.map(s => [s.id, s]));
          state.schema.steps = stepIds.map(id => stepMap.get(id)!).filter(Boolean);
          get().saveHistory();
        });
      },
      
      setCurrentStep: (stepId) => {
        // This is UI state, might be separate from store, but including for completeness
        set({ currentStepId: stepId });
      },
      
      // ==========================================
      // VIEW CONTROLS
      // ==========================================
      
      setView: (view) => set({ view }),
      setMode: (mode) => set({ mode }),
      setZoom: (zoom) => set({ zoom: Math.max(25, Math.min(200, zoom)) }),
      
      togglePreview: () => set((state) => ({
        mode: state.mode === 'edit' ? 'preview' : 'edit',
        selectedId: state.mode === 'edit' ? null : state.selectedId, // Deselect when entering preview
      })),
      
      // ==========================================
      // IMPORT/EXPORT
      // ==========================================
      
      exportSchema: () => {
        return JSON.stringify(get().schema, null, 2);
      },
      
      exportToJSON: () => {
        return JSON.stringify({
          exportVersion: '1.0',
          exportedAt: new Date().toISOString(),
          schema: get().schema,
        }, null, 2);
      },
      
      exportToHTML: () => {
        // Simple HTML export for embedding
        const { schema } = get();
        // In real implementation, use a template engine
        return `<form id="${schema.id}">
  <!-- Form: ${schema.title} -->
  <!-- Generated at ${new Date().toISOString()} -->
</form>`;
      },
      
      importSchema: (json) => {
        try {
          const parsed = JSON.parse(json);
          
          // Handle wrapped exports
          const schema = parsed.schema || parsed;
          
          // Validation
          if (!schema.components || !Array.isArray(schema.components)) {
            return { success: false, error: 'Invalid schema: missing components array' };
          }
          
          if (!schema.settings) {
            schema.settings = createEmptySchema().settings;
          }
          
          get().setSchema(schema);
          return { success: true };
        } catch (e) {
          return { success: false, error: e instanceof Error ? e.message : 'Invalid JSON' };
        }
      },
      
      loadTemplate: (template) => {
        get().setSchema({
          ...template,
          id: nanoid(), // New ID for this instance
          createdAt: new Date().toISOString(),
        });
      },
      
      // ==========================================
      // VALIDATION
      // ==========================================
      
      validateSchema: () => {
        const { schema } = get();
        const errors: ValidationError[] = [];
        
        // Check for empty title
        if (!schema.title.trim()) {
          errors.push({
            fieldId: 'schema',
            fieldLabel: 'Form Title',
            error: 'Form title is required',
            type: 'missing-label',
          });
        }
        
        // Check components
        schema.components.forEach((comp, idx) => {
          // Check label
          if (!comp.label.trim()) {
            errors.push({
              fieldId: comp.id,
              fieldLabel: `Component ${idx + 1}`,
              error: 'Missing label',
              type: 'missing-label',
            });
          }
          
          // Check options for select/checkbox
          if ((comp.type === 'select' || comp.type === 'checkbox' || comp.type === 'radio') && 
              (!comp.properties?.options || comp.properties.options.length === 0)) {
            errors.push({
              fieldId: comp.id,
              fieldLabel: comp.label,
              error: 'No options defined',
              type: 'invalid-validation',
            });
          }
          
          // Check for orphaned components (in multi-step)
          if (schema.settings.multiStep && schema.steps) {
            const inAnyStep = schema.steps.some(step => step.componentIds.includes(comp.id));
            if (!inAnyStep && !comp.parentId) {
              errors.push({
                fieldId: comp.id,
                fieldLabel: comp.label,
                error: 'Component not assigned to any step',
                type: 'orphaned-component',
              });
            }
          }
        });
        
        return { valid: errors.length === 0, errors };
      },
      
      autoFix: () => {
        set((state) => {
          // Add labels to unnamed components
          state.schema.components.forEach((comp, idx) => {
            if (!comp.label.trim()) {
              comp.label = `${comp.type} ${idx + 1}`;
            }
          });
          
          // Fix orphaned components in multi-step
          if (state.schema.settings.multiStep && state.schema.steps && state.schema.steps.length > 0) {
            const firstStep = state.schema.steps[0];
            state.schema.components.forEach(comp => {
              if (!comp.parentId) {
                const inAnyStep = state.schema.steps!.some(step => step.componentIds.includes(comp.id));
                if (!inAnyStep) {
                  firstStep.componentIds.push(comp.id);
                }
              }
            });
          }
          
          get().saveHistory();
        });
      },
      
      // ==========================================
      // SEARCH & UTILITIES
      // ==========================================
      
      searchComponents: (query) => {
        const { schema } = get();
        const q = query.toLowerCase();
        return schema.components.filter(c => 
          c.label.toLowerCase().includes(q) || 
          c.type.toLowerCase().includes(q)
        );
      },
      
      getComponentPath: (id) => {
        const { schema } = get();
        const path: string[] = [];
        
        const findPath = (components: FormComponent[], targetId: string, currentPath: string[]): boolean => {
          for (const comp of components) {
            if (comp.id === targetId) {
              path.push(...currentPath, comp.id);
              return true;
            }
            if (comp.children) {
              if (findPath(comp.children, targetId, [...currentPath, comp.id])) {
                return true;
              }
            }
          }
          return false;
        };
        
        findPath(schema.components, id, []);
        return path;
      },

      // ==========================================
      // FORM VERSIONING
      // ==========================================

      saveVersion: (label?: string) => {
        const { schema } = get();
        const versions = loadVersions();
        const newVersion: FormVersion = {
          id: nanoid(),
          label: label ?? `Version ${versions.length + 1} — ${new Date().toLocaleString()}`,
          snapshot: JSON.parse(JSON.stringify(schema)) as FormSchema,
          savedAt: new Date().toISOString(),
        };
        const updated = [newVersion, ...versions].slice(0, MAX_VERSIONS);
        persistVersions(updated);
      },

      restoreVersion: (versionId: string) => {
        const versions = loadVersions();
        const version = versions.find((v) => v.id === versionId);
        if (!version) return;
        get().saveHistory();
        set((state) => {
          state.schema = version.snapshot;
        });
      },

      listVersions: () => loadVersions(),

      deleteVersion: (versionId: string) => {
        const versions = loadVersions().filter((v) => v.id !== versionId);
        persistVersions(versions);
      },
    }))
  )
);

// ==========================================
// SELECTORS (for optimized re-renders)
// ==========================================

export const selectSchema = (state: BuilderState) => state.schema;
export const selectComponents = (state: BuilderState) => state.schema.components;
export const selectSelectedId = (state: BuilderState) => state.selectedId;
export const selectSelectedComponent = (state: BuilderState) => 
  state.selectedId ? state.schema.components.find(c => c.id === state.selectedId) : null;
export const selectHistoryInfo = (state: BuilderState) => ({
  canUndo: state.historyIndex > 0,
  canRedo: state.historyIndex < state.history.length - 1,
  current: state.historyIndex + 1,
  total: state.history.length,
});

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function findComponentRecursive(components: FormComponent[], id: string): FormComponent | null {
  for (const comp of components) {
    if (comp.id === id) return comp;
    if (comp.children) {
      const found = findComponentRecursive(comp.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeComponentRecursive(components: FormComponent[], id: string): boolean {
  const idx = components.findIndex(c => c.id === id);
  if (idx !== -1) {
    components.splice(idx, 1);
    return true;
  }
  
  for (const comp of components) {
    if (comp.children && removeComponentRecursive(comp.children, id)) {
      // If container is now empty, optionally remove it too?
      return true;
    }
  }
  return false;
}

// ==========================================
// PERSISTENCE MIDDLEWARE
// ==========================================

// Optional: Auto-save to localStorage
if (typeof window !== 'undefined') {
  useBuilderStore.subscribe(
    (state) => state.schema,
    (schema) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(schema));
      } catch (e) {
        console.warn('Failed to save to localStorage', e);
      }
    }
  );
  
  // Hydrate on init
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const schema = JSON.parse(saved);
      useBuilderStore.getState().setSchema(schema);
    } catch (e) {
      console.warn('Failed to load from localStorage', e);
    }
  }
}

// ==========================================
// DEBUG UTILITIES
// ==========================================

// Expose store to window for debugging in dev
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).builderStore = useBuilderStore;
}