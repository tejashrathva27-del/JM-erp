/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Root Shell Component
 */

import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/auth/Login';
import { Sidebar } from './components/common/Sidebar';
import { Topbar } from './components/common/Topbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { EmployeesView } from './components/employees/EmployeesView';
import { ProductsView } from './components/products/ProductsView';
import { ProductionView } from './components/production/ProductionView';
import { InventoryView } from './components/inventory/InventoryView';
import { OrdersView } from './components/orders/OrdersView';
import { DispatchView } from './components/dispatch/DispatchView';
import { DeliveryView } from './components/delivery/DeliveryView';
import { ShopsView } from './components/shops/ShopsView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { ReportsView } from './components/reports/ReportsView';
import { NotificationsView } from './components/notifications/NotificationsView';
import { SettingsView } from './components/settings/SettingsView';
import { InvoiceHistoryView } from './components/invoices/InvoiceHistoryView';
import { GlobalCreateModal } from './components/modals/GlobalCreateModal';

const MainLayout: React.FC = () => {
  const { user } = useAuth();
  const { activeModule } = useApp();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="relative flex min-h-screen max-w-full overflow-x-hidden bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-100 font-['Plus_Jakarta_Sans',sans-serif] transition-colors">
      {/* Left Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 w-full max-w-full min-h-screen overflow-x-hidden">
        <Topbar />

        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto max-w-full overflow-x-hidden">
          {activeModule === 'dashboard' && <DashboardView />}
          {activeModule === 'employees' && <EmployeesView />}
          {activeModule === 'products' && <ProductsView />}
          {activeModule === 'production' && <ProductionView />}
          {activeModule === 'inventory' && <InventoryView />}
          {activeModule === 'orders' && <OrdersView />}
          {activeModule === 'invoices' && <InvoiceHistoryView />}
          {(activeModule === 'dispatch' || activeModule === 'delivery') && <DeliveryView />}
          {activeModule === 'shops' && <ShopsView />}
          {activeModule === 'payments' && <PaymentsView />}
          {activeModule === 'expenses' && <ExpensesView />}
          {activeModule === 'attendance' && <AttendanceView />}
          {activeModule === 'reports' && <ReportsView />}
          {activeModule === 'notifications' && <NotificationsView />}
          {activeModule === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Action Creation Modal */}
      <GlobalCreateModal />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <MainLayout />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
