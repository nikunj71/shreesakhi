/**
 * Safe currency and number formatting utilities for Indian Rupee (INR)
 * Prevents "Cannot read properties of undefined (reading 'toLocaleString')" errors
 */

export function formatINR(value?: number | null): string {
  if (value == null || isNaN(Number(value))) {
    return '0';
  }
  return Number(value).toLocaleString('en-IN');
}
