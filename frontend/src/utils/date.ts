/**
 * Format ISO date (YYYY-MM-DD) to European DD.MM.YYYY.
 * Returns empty string for null/undefined/invalid.
 */
export function formatDateEuropean(isoDate: string | null | undefined): string {
  if (isoDate == null || isoDate === '') return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}
