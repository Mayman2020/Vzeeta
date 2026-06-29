export const ARABIC_LATIN_DIGITS_LANG = 'ar-u-nu-latn';

export const DATE_DISPLAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
};

export const DATE_TIME_DISPLAY_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false
};

export function toLatinDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)));
}

function normalize(value: Date | string | number | null | undefined): Date | null {
  if (value === null || value === undefined || value === '') return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function localeFor(lang: string): string {
  return lang === 'ar' ? ARABIC_LATIN_DIGITS_LANG : 'en-GB';
}

export function formatDateLatin(value: Date | string | number | null | undefined, lang: string): string {
  const date = normalize(value);
  if (!date) return '-';
  const locale = localeFor(lang);
  return toLatinDigits(new Intl.DateTimeFormat(locale, DATE_DISPLAY_OPTIONS).format(date));
}

export function formatDateTimeLatin(value: Date | string | number | null | undefined, lang: string): string {
  const date = normalize(value);
  if (!date) return '-';
  const locale = localeFor(lang);
  return toLatinDigits(new Intl.DateTimeFormat(locale, DATE_TIME_DISPLAY_OPTIONS).format(date));
}
