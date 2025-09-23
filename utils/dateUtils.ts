import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Format a date range for display
 * @param dates Array of date strings
 * @param formatType 'short' for abbreviated month names, 'long' for full month names
 * @returns Formatted date range string
 */
export function formatDateRange(dates: string[], formatType: 'short' | 'long' = 'short'): string {
  if (!dates || dates.length === 0) return 'Dates à confirmer';

  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const firstDate = new Date(sortedDates[0]);
  const lastDate = new Date(sortedDates[sortedDates.length - 1]);

  const monthFormat = formatType === 'short' ? 'MMM' : 'MMMM';

  if (sortedDates.length === 1) {
    return format(firstDate, `d ${monthFormat}`, { locale: fr });
  }

  // Si même mois et année
  if (firstDate.getMonth() === lastDate.getMonth() && firstDate.getFullYear() === lastDate.getFullYear()) {
    return `${format(firstDate, 'd')}-${format(lastDate, `d ${monthFormat}`, { locale: fr })}`;
  }

  // Mois différents
  return `${format(firstDate, `d ${monthFormat}`, { locale: fr })} - ${format(lastDate, `d ${monthFormat}`, { locale: fr })}`;
}

/**
 * Format a single date for display
 * @param dateString Date string to format
 * @param formatString Optional format string (default: 'd MMMM yyyy')
 * @returns Formatted date string
 */
export function formatDate(dateString: string, formatString: string = 'd MMMM yyyy'): string {
  try {
    const date = parseISO(dateString);
    return format(date, formatString, { locale: fr });
  } catch {
    return 'Date invalide';
  }
}

/**
 * Format a full date range with "Du X au Y" format
 * @param dates Array of date strings
 * @returns Formatted date range string with "Du" and "au"
 */
export function formatFullDateRange(dates: string[]): string {
  if (!dates || dates.length === 0) return 'Dates non définies';
  if (dates.length === 1) return formatDate(dates[0]);

  const sortedDates = [...dates].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
  const firstDate = formatDate(sortedDates[0], 'd MMMM yyyy');
  const lastDate = formatDate(sortedDates[sortedDates.length - 1], 'd MMMM yyyy');

  return `Du ${firstDate} au ${lastDate}`;
}

/**
 * Parse and validate a date string
 * @param dateString Date string to parse
 * @returns Date object or null if invalid
 */
export function parseFormationDate(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Check if a date string is valid
 * @param dateString Date string to validate
 * @returns boolean indicating if date is valid
 */
export function isValidDate(dateString: string): boolean {
  return parseFormationDate(dateString) !== null;
}