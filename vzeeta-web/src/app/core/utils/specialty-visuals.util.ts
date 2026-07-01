import { Specialty } from '../models/doctor.model';

export interface SpecialtyVisual {
  icon: string;
  color: string;
  light: string;
}

const SPECIALTY_META: { match: RegExp; icon: string; color: string; light: string }[] = [
  { match: /\u0642\u0644\u0628|heart|cardio/i, icon: 'favorite', color: '#ef4444', light: '#fef2f2' },
  { match: /\u0623\u0637\u0641\u0627\u0644|pediatric|child/i, icon: 'child_care', color: '#10b981', light: '#ecfdf5' },
  { match: /\u0623\u0633\u0646\u0627\u0646|dent/i, icon: 'mood', color: '#3b82f6', light: '#eff6ff' },
  { match: /\u062c\u0644\u062f|derma|skin/i, icon: 'face_retouching_natural', color: '#f59e0b', light: '#fffbeb' },
  { match: /\u0639\u064a\u0648\u0646|ophthal|eye/i, icon: 'visibility', color: '#8b5cf6', light: '#f5f3ff' },
  { match: /\u0639\u0638\u0627\u0645|ortho|bone/i, icon: 'accessibility_new', color: '#0ea5e9', light: '#f0f9ff' },
  { match: /\u0646\u0633\u0627\u0621|obstet|gyne/i, icon: 'pregnant_woman', color: '#ec4899', light: '#fdf2f8' },
  { match: /\u0623\u0646\u0641|\u0623\u0630\u0646|ent|ear/i, icon: 'hearing', color: '#6366f1', light: '#eef2ff' },
  { match: /\u0628\u0627\u0637\u0646|internal/i, icon: 'local_hospital', color: '#14b8a6', light: '#f0fdfa' },
  { match: /\u0646\u0641\u0633|psych|mental/i, icon: 'psychology', color: '#a855f7', light: '#faf5ff' },
  { match: /\u0645\u062e|neuro|brain/i, icon: 'psychology', color: '#f97316', light: '#fff7ed' },
  { match: /\u062c\u0631\u0627\u062d|surg/i, icon: 'content_cut', color: '#64748b', light: '#f8fafc' },
  { match: /\u0630\u0643\u0648\u0631|uro|urol/i, icon: 'wc', color: '#2563eb', light: '#eff6ff' },
  { match: /\u063a\u062f\u062f|endocrin|thyroid/i, icon: 'biotech', color: '#d946ef', light: '#fdf4ff' },
  { match: /\u0635\u062f\u0631|chest|pulmon/i, icon: 'air', color: '#06b6d4', light: '#ecfeff' },
  { match: /\u0643\u0644\u0649|nephro|kidney/i, icon: 'water_drop', color: '#f43f5e', light: '#fff1f2' },
  { match: /\u0631\u0648\u0645\u0627\u062a\u064a\u0632\u0645|rheum/i, icon: 'self_improvement', color: '#e11d48', light: '#fff1f2' },
  { match: /\u0633\u0643\u0631|diabet/i, icon: 'favorite_border', color: '#c026d3', light: '#fdf4ff' },
  { match: /\u0623\u0648\u0631\u0627\u0645|oncol|cancer/i, icon: 'science', color: '#0891b2', light: '#ecfeff' },
  { match: /\u0637\u0648\u0627\u0631\u0626|emerg/i, icon: 'priority_high', color: '#dc2626', light: '#fef2f2' },
  { match: /\u062a\u063a\u0630\u064a\u0629|nutri/i, icon: 'restaurant', color: '#65a30d', light: '#f7fee7' },
  { match: /\u0637\u0628|general/i, icon: 'medical_services', color: '#0f4c81', light: '#eff6ff' },
];

const PALETTE = [
  { color: '#2563eb', light: '#eff6ff' },
  { color: '#10b981', light: '#ecfdf5' },
  { color: '#8b5cf6', light: '#f5f3ff' },
  { color: '#f59e0b', light: '#fffbeb' },
  { color: '#ec4899', light: '#fdf2f8' },
  { color: '#06b6d4', light: '#ecfeff' },
  { color: '#ef4444', light: '#fef2f2' },
  { color: '#a855f7', light: '#faf5ff' },
];

const SAFE_ICONS = new Set([
  'medical_services',
  'local_hospital',
  'favorite',
  'favorite_border',
  'child_care',
  'face_retouching_natural',
  'visibility',
  'accessibility_new',
  'pregnant_woman',
  'hearing',
  'psychology',
  'content_cut',
  'wc',
  'biotech',
  'air',
  'water_drop',
  'self_improvement',
  'science',
  'priority_high',
  'restaurant',
  'mood',
  'healing',
  'person',
]);

export function specialtyVisual(s: Specialty): SpecialtyVisual {
  const text = `${s.nameAr ?? ''} ${s.nameEn ?? ''} ${s.code ?? ''}`;
  const found = SPECIALTY_META.find((item) => item.match.test(text));
  if (found) return found;

  const idx = (s.id ?? 0) % PALETTE.length;
  const icon = s.icon && SAFE_ICONS.has(s.icon) ? s.icon : 'medical_services';
  return { icon, ...PALETTE[idx] };
}
