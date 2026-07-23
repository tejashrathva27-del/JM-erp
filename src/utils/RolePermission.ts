/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Role & Permissions Utility
 */

import { UserRole } from '../types/erp';
import { NavModule } from '../context/AppContext';

export const DELIVERY_ROLES: UserRole[] = [
  'Owner',
  'Admin',
  'MD',
  'Managing Director',
  'Sales Manager',
  'Delivery Staff',
  'Dispatch Manager',
  'Marketing Head'
];

export const MODULE_PERMISSIONS: Record<NavModule, UserRole[]> = {
  dashboard: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Production Manager', 'Marketing Head'],
  employees: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee'],
  products: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager', 'Sales Manager'],
  production: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager'],
  inventory: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager'],
  orders: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Delivery Staff', 'Marketing Head'],
  invoices: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head'],
  dispatch: DELIVERY_ROLES,
  delivery: DELIVERY_ROLES,
  shops: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Marketing Head'],
  payments: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head'],
  expenses: ['Owner', 'Admin', 'MD', 'Managing Director', 'Accountant'],
  attendance: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee'],
  reports: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Accountant', 'Marketing Head'],
  notifications: [
    'Owner',
    'Admin',
    'MD',
    'Managing Director',
    'HR',
    'Sales Manager',
    'Sales Executive',
    'Production Manager',
    'Inventory Manager',
    'Accountant',
    'Delivery Staff',
    'Employee',
    'Marketing Head'
  ],
  settings: ['Owner', 'Admin', 'MD', 'Managing Director']
};

/**
 * Check if a user with given primary role and array of roles can access a module
 */
export function canAccessModule(primaryRole: UserRole | null | undefined, roles?: UserRole[], module?: NavModule): boolean {
  if (!primaryRole && (!roles || roles.length === 0)) return false;

  const userRoles: UserRole[] = roles && roles.length > 0 ? roles : primaryRole ? [primaryRole] : [];

  // Owner, MD, and Admin always have access to all modules including Delivery
  if (
    userRoles.includes('Owner') ||
    primaryRole === 'Owner' ||
    userRoles.includes('MD') ||
    primaryRole === 'MD' ||
    userRoles.includes('Managing Director') ||
    primaryRole === 'Managing Director' ||
    userRoles.includes('Admin') ||
    primaryRole === 'Admin'
  ) {
    return true;
  }

  if (!module) return true;

  const allowedRoles = MODULE_PERMISSIONS[module] || [];
  return allowedRoles.some(r => userRoles.includes(r));
}

/**
 * Specifically check if user can access Delivery module
 */
export function canUserAccessDelivery(primaryRole: UserRole | null | undefined, roles?: UserRole[]): boolean {
  return canAccessModule(primaryRole, roles, 'delivery');
}

/**
 * Check if user acts as a Delivery Manager (Owner / MD automatically become Delivery Managers when no staff exists or by default)
 */
export function isDeliveryManager(primaryRole: UserRole | null | undefined, roles?: UserRole[]): boolean {
  if (!primaryRole && (!roles || roles.length === 0)) return false;
  const userRoles: UserRole[] = roles && roles.length > 0 ? roles : primaryRole ? [primaryRole] : [];
  return (
    userRoles.includes('Owner') ||
    primaryRole === 'Owner' ||
    userRoles.includes('MD') ||
    primaryRole === 'MD' ||
    userRoles.includes('Managing Director') ||
    primaryRole === 'Managing Director' ||
    userRoles.includes('Admin') ||
    primaryRole === 'Admin' ||
    userRoles.includes('Dispatch Manager') ||
    primaryRole === 'Dispatch Manager'
  );
}
