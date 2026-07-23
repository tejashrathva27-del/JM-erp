/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Navigation Configuration & Drawer Menu Items
 */

import {
  LayoutDashboard,
  Users,
  Package,
  Factory,
  Boxes,
  ShoppingCart,
  Truck,
  Store,
  Building2,
  FileBarChart,
  Settings,
  Receipt,
  CreditCard,
  CalendarCheck,
  Bell,
  FileText
} from 'lucide-react';
import { NavModule } from '../context/AppContext';
import { UserRole } from '../types/erp';
import { canAccessModule, DELIVERY_ROLES } from './RolePermission';

export interface NavItemConfig {
  id: NavModule;
  label: string;
  icon: any;
  roles: UserRole[];
  badgeKey?: string;
  badge?: number;
}

export const NAV_ITEMS_CONFIG: NavItemConfig[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Production Manager', 'Marketing Head']
  },
  {
    id: 'employees',
    label: 'Employees & HR',
    icon: Users,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee']
  },
  {
    id: 'products',
    label: 'Products',
    icon: Package,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager', 'Sales Manager']
  },
  {
    id: 'production',
    label: 'Production',
    icon: Factory,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager']
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Boxes,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Production Manager', 'Inventory Manager']
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: ShoppingCart,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Delivery Staff', 'Marketing Head']
  },
  {
    id: 'invoices',
    label: 'GST Invoices',
    icon: FileText,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head']
  },
  {
    id: 'delivery',
    label: 'Delivery',
    icon: Truck,
    roles: DELIVERY_ROLES
  },
  {
    id: 'shops',
    label: 'Shops & Dealers',
    icon: Store,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Marketing Head']
  },
  {
    id: 'payments',
    label: 'Payments',
    icon: Receipt,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Sales Manager', 'Sales Executive', 'Accountant', 'Marketing Head']
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: CreditCard,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'Accountant']
  },
  {
    id: 'attendance',
    label: 'Attendance',
    icon: CalendarCheck,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Employee']
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileBarChart,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director', 'HR', 'Sales Manager', 'Accountant', 'Marketing Head']
  },
  {
    id: 'notifications',
    label: 'Notifications',
    icon: Bell,
    roles: [
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
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    roles: ['Owner', 'Admin', 'MD', 'Managing Director']
  }
];

export function getVisibleNavItems(role: UserRole | null | undefined, roles?: UserRole[]): NavItemConfig[] {
  return NAV_ITEMS_CONFIG.filter(item => canAccessModule(role, roles, item.id));
}
