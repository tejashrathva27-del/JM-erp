/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Formatters & Helper Utilities
 */

/**
 * Format numbers into Indian Rupee (₹) currency format
 * e.g., 14252.50 -> ₹14,252.50
 */
export function formatCurrency(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Format raw date string into human readable format
 * e.g., 2026-07-23 -> 23 Jul 2026
 */
export function formatDate(dateStr: string | undefined | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(d);
  } catch {
    return dateStr;
  }
}

/**
 * Generate Badge Styles based on Status
 */
export function getStatusBadgeClass(status: string): string {
  switch (status?.toLowerCase()) {
    case 'active':
    case 'delivered':
    case 'completed':
    case 'paid':
    case 'present':
    case 'approved':
    case 'in stock':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
    
    case 'pending':
    case 'partial':
    case 'processing':
    case 'packed':
    case 'half day':
    case 'in progress':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
    
    case 'dispatched':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800';
    
    case 'low stock':
    case 'unpaid':
    case 'blocked':
    case 'inactive':
    case 'cancelled':
    case 'absent':
    case 'rejected':
      return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800';
    
    default:
      return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700';
  }
}
