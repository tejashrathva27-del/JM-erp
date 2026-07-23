/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Employee Credential Generator
 */

/**
 * Generate Auto Employee ID format e.g. EMP-000001
 */
export function generateEmployeeId(sequenceNumber: number): string {
  const padded = String(sequenceNumber).padStart(6, '0');
  return `EMP-${padded}`;
}

/**
 * Generate Username e.g. "tej.rathva"
 */
export function generateUsername(firstName: string, lastName: string): string {
  const cleanFirst = (firstName || 'user').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const cleanLast = (lastName || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  
  if (cleanLast) {
    return `${cleanFirst}.${cleanLast}`;
  }
  return cleanFirst || `emp_${Math.floor(1000 + Math.random() * 9000)}`;
}

/**
 * Generate Temporary Password e.g. "JM@4821"
 */
export function generateTempPassword(): string {
  const random4 = Math.floor(1000 + Math.random() * 9000);
  return `JM@${random4}`;
}
