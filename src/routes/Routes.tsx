/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Application Routes & Sub-Page Mapping
 */

import React from 'react';
import { NavModule } from '../context/AppContext';
import { DashboardView } from '../components/dashboard/DashboardView';
import { EmployeesView } from '../components/employees/EmployeesView';
import { ProductsView } from '../components/products/ProductsView';
import { ProductionView } from '../components/production/ProductionView';
import { InventoryView } from '../components/inventory/InventoryView';
import { OrdersView } from '../components/orders/OrdersView';
import { InvoiceHistoryView } from '../components/invoices/InvoiceHistoryView';
import { DispatchView } from '../components/dispatch/DispatchView';
import { ShopsView } from '../components/shops/ShopsView';
import { PaymentsView } from '../components/payments/PaymentsView';
import { ExpensesView } from '../components/expenses/ExpensesView';
import { AttendanceView } from '../components/attendance/AttendanceView';
import { ReportsView } from '../components/reports/ReportsView';
import { NotificationsView } from '../components/notifications/NotificationsView';
import { SettingsView } from '../components/settings/SettingsView';

export type DeliverySubPage =
  | 'delivery-dashboard'
  | 'ready-for-delivery'
  | 'assigned-orders'
  | 'out-for-delivery'
  | 'delivered-orders'
  | 'delivery-history'
  | 'route-planner'
  | 'delivery-reports';

export interface RouteConfig {
  path: string;
  module: NavModule;
  subPage?: DeliverySubPage;
  label: string;
}

export const APP_ROUTES: RouteConfig[] = [
  { path: '/dashboard', module: 'dashboard', label: 'Dashboard' },
  { path: '/employees', module: 'employees', label: 'Employees & HR' },
  { path: '/products', module: 'products', label: 'Products' },
  { path: '/production', module: 'production', label: 'Production' },
  { path: '/inventory', module: 'inventory', label: 'Inventory' },
  { path: '/orders', module: 'orders', label: 'Orders' },
  { path: '/invoices', module: 'invoices', label: 'GST Invoices' },
  { path: '/delivery', module: 'delivery', subPage: 'delivery-dashboard', label: 'Delivery' },
  { path: '/delivery/ready', module: 'delivery', subPage: 'ready-for-delivery', label: 'Ready for Delivery' },
  { path: '/delivery/assigned', module: 'delivery', subPage: 'assigned-orders', label: 'Assigned Orders' },
  { path: '/delivery/out', module: 'delivery', subPage: 'out-for-delivery', label: 'Out for Delivery' },
  { path: '/delivery/delivered', module: 'delivery', subPage: 'delivered-orders', label: 'Delivered Orders' },
  { path: '/delivery/history', module: 'delivery', subPage: 'delivery-history', label: 'Delivery History' },
  { path: '/delivery/route-planner', module: 'delivery', subPage: 'route-planner', label: 'Route Planner' },
  { path: '/delivery/reports', module: 'delivery', subPage: 'delivery-reports', label: 'Delivery Reports' },
  { path: '/shops', module: 'shops', label: 'Shops & Dealers' },
  { path: '/payments', module: 'payments', label: 'Payments' },
  { path: '/expenses', module: 'expenses', label: 'Expenses' },
  { path: '/attendance', module: 'attendance', label: 'Attendance' },
  { path: '/reports', module: 'reports', label: 'Reports' },
  { path: '/notifications', module: 'notifications', label: 'Notifications' },
  { path: '/settings', module: 'settings', label: 'Settings' }
];

export const AppRoutesRenderer: React.FC<{ activeModule: NavModule; deliverySubPage?: DeliverySubPage }> = ({
  activeModule,
  deliverySubPage
}) => {
  switch (activeModule) {
    case 'dashboard':
      return <DashboardView />;
    case 'employees':
      return <EmployeesView />;
    case 'products':
      return <ProductsView />;
    case 'production':
      return <ProductionView />;
    case 'inventory':
      return <InventoryView />;
    case 'orders':
      return <OrdersView />;
    case 'invoices':
      return <InvoiceHistoryView />;
    case 'dispatch':
    case 'delivery':
      return <DispatchView initialSubPage={deliverySubPage} />;
    case 'shops':
      return <ShopsView />;
    case 'payments':
      return <PaymentsView />;
    case 'expenses':
      return <ExpensesView />;
    case 'attendance':
      return <AttendanceView />;
    case 'reports':
      return <ReportsView />;
    case 'notifications':
      return <NotificationsView />;
    case 'settings':
      return <SettingsView />;
    default:
      return <DashboardView />;
  }
};
