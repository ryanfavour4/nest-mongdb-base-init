/**
 * Date and time helper utilities
 */

export function parseDate(dateInput?: string | Date | null): Date | null {
  if (!dateInput) return null;
  const date = new Date(dateInput);
  return isNaN(date.getTime()) ? null : date;
}

export function formatIsoDate(date?: Date | null): string | null {
  if (!date) return null;
  return date.toISOString();
}

export function isPastDate(dateInput: string | Date): boolean {
  const date = parseDate(dateInput);
  if (!date) return false;
  return date.getTime() < Date.now();
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
