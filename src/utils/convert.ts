/**
 * Helper utilities for data type conversions
 */

export function toBoolean(value: any): boolean {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const lower = value.trim().toLowerCase();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }
  if (typeof value === 'number') {
    return value === 1;
  }
  return false;
}

export function toInteger(value: any, defaultValue = 0): number {
  if (typeof value === 'number') return Math.floor(value);
  if (typeof value === 'string') {
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }
  return defaultValue;
}

export function toArray<T = any>(value: any): T[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value;
  return [value];
}

export function sanitizeSearchQuery(query?: string): string {
  if (!query) return '';
  // Escapes regex special characters
  return query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
