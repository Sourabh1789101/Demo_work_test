export interface ThemePreset {
  id: string;
  label: string;
  accent: string;
  bg: string;
}

export const THEME_PRESETS: ThemePreset[] = [
  { id: 'blue',   label: 'Ocean',   accent: '#3b82f6', bg: '#eff6ff' },
  { id: 'purple', label: 'Violet',  accent: '#8b5cf6', bg: '#f5f3ff' },
  { id: 'green',  label: 'Emerald', accent: '#10b981', bg: '#ecfdf5' },
  { id: 'rose',   label: 'Rose',    accent: '#f43f5e', bg: '#fff1f2' },
  { id: 'orange', label: 'Sunset',  accent: '#f97316', bg: '#fff7ed' },
  { id: 'dark',   label: 'Dark',    accent: '#1f2937', bg: '#f9fafb' },
];

export const BUTTON_STYLES: { id: string; label: string; radius: string }[] = [
  { id: 'rounded',  label: 'Rounded',  radius: '0.5rem'  },
  { id: 'pill',     label: 'Pill',     radius: '9999px'  },
  { id: 'sharp',    label: 'Sharp',    radius: '0'       },
];

export const FONT_OPTIONS: { id: string; label: string; family: string }[] = [
  { id: 'system',  label: 'System Default', family: 'system-ui, sans-serif' },
  { id: 'inter',   label: 'Inter',          family: "'Inter', sans-serif" },
  { id: 'roboto',  label: 'Roboto',         family: "'Roboto', sans-serif" },
  { id: 'poppins', label: 'Poppins',        family: "'Poppins', sans-serif" },
  { id: 'mono',    label: 'Monospace',      family: 'ui-monospace, monospace' },
];

export function getThemeAccent(settings: any): string {
  if (settings?.themeAccent) return settings.themeAccent;
  const preset = THEME_PRESETS.find(t => t.id === settings?.theme);
  return preset?.accent ?? '#3b82f6';
}

export function getThemeBg(settings: any): string {
  const preset = THEME_PRESETS.find(t => t.id === settings?.theme);
  return preset?.bg ?? '#ffffff';
}

export function getButtonRadius(style?: string): string {
  const found = BUTTON_STYLES.find(s => s.id === style);
  return found?.radius ?? '0.5rem';
}

export function getFontFamily(font?: string): string {
  const found = FONT_OPTIONS.find(f => f.id === font);
  return found?.family ?? 'system-ui, sans-serif';
}
