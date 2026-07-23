/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Application Global State & Operations Context
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Employee,
  Shop,
  Category,
  Product,
  Order,
  Payment,
  Expense,
  ProductionBatch,
  NotificationItem,
  CompanySettings,
  AttendanceRecord,
  OrderStatus
} from '../types/erp';
import {
  INITIAL_SETTINGS,
  INITIAL_EMPLOYEES,
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SHOPS,
  INITIAL_ORDERS,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  INITIAL_PRODUCTION,
  INITIAL_NOTIFICATIONS,
  INITIAL_ATTENDANCE
} from '../utils/initialData';
import { generateEmployeeId, generateUsername, generateTempPassword } from '../utils/credentials';
import { optimizeDeliverySequence } from '../utils/routeOptimizer';

export type NavModule =
  | 'dashboard'
  | 'employees'
  | 'shops'
  | 'products'
  | 'production'
  | 'inventory'
  | 'orders'
  | 'invoices'
  | 'dispatch'
  | 'delivery'
  | 'payments'
  | 'expenses'
  | 'attendance'
  | 'reports'
  | 'notifications'
  | 'settings';

interface AppContextType {
  activeModule: NavModule;
  setActiveModule: (m: NavModule) => void;
  
  // Mobile sidebar menu
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
  toggleMobileMenu: () => void;

  // Theme
  isDarkMode: boolean;
  toggleDarkMode: () => void;

  // Search & Filters
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  
  // Data entities
  settings: CompanySettings;
  updateSettings: (s: Partial<CompanySettings>) => void;

  employees: Employee[];
  addEmployee: (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>) => Employee;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  resetEmployeePassword: (id: string) => string;
  toggleDisableLogin: (id: string) => void;
  newEmployeeCredentials: { code: string; username: string; tempPassword: string; name: string } | null;
  setNewEmployeeCredentials: (val: { code: string; username: string; tempPassword: string; name: string } | null) => void;

  shops: Shop[];
  addShop: (s: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateShop: (id: string, s: Partial<Shop>) => void;
  deleteShop: (id: string) => void;
  archiveShop: (id: string) => void;
  restoreShop: (id: string) => void;

  categories: Category[];
  addCategory: (c: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;

  products: Product[];
  addProduct: (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, p: Partial<Product>) => void;
  adjustStock: (id: string, qtyDelta: number) => void;
  deleteProduct: (id: string) => void;

  orders: Order[];
  createOrder: (o: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>) => Order;
  updateOrderStatus: (id: string, status: OrderStatus, tracking?: string, vehicle?: string) => void;
  acceptOrderForDelivery: (orderId: string, staffId: string, staffName: string) => void;
  startOrderNavigation: (orderId: string) => void;
  markOrderReachedShop: (orderId: string) => void;
  completeOrderDelivery: (orderId: string, proof: any) => void;
  optimizeDeliveryRouteForStaff: (staffId: string) => void;
  deleteOrder: (id: string) => void;

  payments: Payment[];
  addPayment: (p: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => void;

  expenses: Expense[];
  addExpense: (e: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void;

  productionBatches: ProductionBatch[];
  addProductionBatch: (b: Omit<ProductionBatch, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateBatchStage: (id: string, stage: ProductionBatch['grindingStage'], status: ProductionBatch['status']) => void;

  attendance: AttendanceRecord[];
  recordAttendance: (empId: string, status: AttendanceRecord['status'], overtimeHours?: number) => void;

  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Modals & Triggers
  isNewModalOpen: boolean;
  setIsNewModalOpen: (open: boolean) => void;
  newModalType: string;
  openNewModal: (type: string) => void;

  // Stats helpers
  dashboardStats: {
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
    totalEmployees: number;
    pendingDispatchCount: number;
    outstandingPaymentsTotal: number;
    lowStockCount: number;
  };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModule, setActiveModuleState] = useState<NavModule>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const setActiveModule = (m: NavModule) => {
    setActiveModuleState(m);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('jm_erp_theme') === 'dark';
  });
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalType, setNewModalType] = useState('order');

  // Master Data State from LocalStorage or Initial
  const [settings, setSettings] = useState<CompanySettings>(() => {
    const saved = localStorage.getItem('jm_erp_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('jm_erp_employees');
    if (!saved) return INITIAL_EMPLOYEES;
    try {
      const parsed: Employee[] = JSON.parse(saved);
      const demoIds = ['emp-101', 'emp-102', 'emp-103', 'emp-104', 'emp-105', 'emp-106', 'emp-107'];
      const filtered = parsed.filter(e => !demoIds.includes(e.id));
      localStorage.setItem('jm_erp_employees', JSON.stringify(filtered));
      return filtered;
    } catch {
      return [];
    }
  });

  const [shops, setShops] = useState<Shop[]>(() => {
    const saved = localStorage.getItem('jm_erp_shops');
    return saved ? JSON.parse(saved) : INITIAL_SHOPS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('jm_erp_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('jm_erp_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('jm_erp_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('jm_erp_payments');
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('jm_erp_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [productionBatches, setProductionBatches] = useState<ProductionBatch[]>(() => {
    const saved = localStorage.getItem('jm_erp_production');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTION;
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('jm_erp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('jm_erp_attendance');
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  // Sync state to localStorage
  useEffect(() => { localStorage.setItem('jm_erp_settings', JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem('jm_erp_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('jm_erp_shops', JSON.stringify(shops)); }, [shops]);
  useEffect(() => { localStorage.setItem('jm_erp_categories', JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem('jm_erp_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('jm_erp_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('jm_erp_payments', JSON.stringify(payments)); }, [payments]);
  useEffect(() => { localStorage.setItem('jm_erp_expenses', JSON.stringify(expenses)); }, [expenses]);
  useEffect(() => { localStorage.setItem('jm_erp_production', JSON.stringify(productionBatches)); }, [productionBatches]);
  useEffect(() => { localStorage.setItem('jm_erp_notifications', JSON.stringify(notifications)); }, [notifications]);
  useEffect(() => { localStorage.setItem('jm_erp_attendance', JSON.stringify(attendance)); }, [attendance]);

  // Handle Dark mode class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('jm_erp_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('jm_erp_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(prev => !prev);

  // Modal credentials state
  const [newEmployeeCredentials, setNewEmployeeCredentials] = useState<{
    code: string;
    username: string;
    tempPassword: string;
    name: string;
  } | null>(null);

  // Settings
  const updateSettings = (newSet: Partial<CompanySettings>) => {
    setSettings(prev => ({ ...prev, ...newSet }));
  };

  // Employee Operations
  const addEmployee = (emp: Omit<Employee, 'id' | 'createdAt' | 'updatedAt'>): Employee => {
    const now = new Date().toISOString();
    const empSeq = employees.length + 1;
    const generatedCode = emp.code || generateEmployeeId(empSeq);
    const generatedUsername = emp.username || generateUsername(emp.firstName || emp.name.split(' ')[0], emp.lastName || emp.name.split(' ')[1] || '');
    const generatedTempPassword = emp.tempPassword || generateTempPassword();

    const newEmp: Employee = {
      ...emp,
      id: 'emp-' + Date.now(),
      code: generatedCode,
      username: generatedUsername,
      tempPassword: generatedTempPassword,
      isLoginDisabled: emp.isLoginDisabled ?? false,
      isDeleted: false,
      createdAt: now,
      updatedAt: now
    };

    setEmployees(prev => {
      const updated = [newEmp, ...prev];
      try {
        localStorage.setItem('jm_erp_employees', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });

    // Store new credentials for popup modal display
    setNewEmployeeCredentials({
      code: generatedCode,
      username: generatedUsername,
      tempPassword: generatedTempPassword,
      name: newEmp.name
    });

    // Add Notification
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        type: 'NewEmployee',
        title: 'New Employee Added',
        message: `${newEmp.name} (${newEmp.designation}) joined ${newEmp.department} department. Emp ID: ${generatedCode}`,
        read: false,
        timestamp: 'Just now',
        linkModule: 'employees'
      },
      ...prev
    ]);

    return newEmp;
  };

  const updateEmployee = (id: string, updatedFields: Partial<Employee>) => {
    const now = new Date().toISOString();
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, ...updatedFields, updatedAt: now } : e);
      try {
        localStorage.setItem('jm_erp_employees', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Delete Employee (Completely removes from state and updates localStorage immediately)
  const deleteEmployee = (id: string) => {
    setEmployees(prev => {
      const updated = prev.filter(e => e.id !== id);
      try {
        localStorage.setItem('jm_erp_employees', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update localStorage on deleteEmployee:', e);
      }
      return updated;
    });
  };

  // Reset Employee Password
  const resetEmployeePassword = (id: string): string => {
    const newPass = generateTempPassword();
    const now = new Date().toISOString();
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, tempPassword: newPass, updatedAt: now } : e);
      try {
        localStorage.setItem('jm_erp_employees', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    return newPass;
  };

  // Toggle Disable Login
  const toggleDisableLogin = (id: string) => {
    const now = new Date().toISOString();
    setEmployees(prev => {
      const updated = prev.map(e => e.id === id ? { ...e, isLoginDisabled: !e.isLoginDisabled, updatedAt: now } : e);
      try {
        localStorage.setItem('jm_erp_employees', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  // Shop Operations
  const addShop = (shopData: Omit<Shop, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newShop: Shop = {
      ...shopData,
      id: 'shop-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setShops(prev => [newShop, ...prev]);
  };

  const updateShop = (id: string, updatedFields: Partial<Shop>) => {
    const now = new Date().toISOString();
    setShops(prev => prev.map(s => s.id === id ? { ...s, ...updatedFields, updatedAt: now } : s));
    setOrders(prev => prev.map(o => {
      if (o.shopId === id) {
        return {
          ...o,
          shopName: updatedFields.name !== undefined ? updatedFields.name : o.shopName,
          shopAddress: updatedFields.address !== undefined ? updatedFields.address : o.shopAddress,
          city: updatedFields.city !== undefined ? updatedFields.city : o.city,
          latitude: updatedFields.latitude !== undefined ? updatedFields.latitude : o.latitude,
          longitude: updatedFields.longitude !== undefined ? updatedFields.longitude : o.longitude,
          googleMapsLink: updatedFields.googleMapsLink !== undefined ? updatedFields.googleMapsLink : o.googleMapsLink,
          updatedAt: now
        };
      }
      return o;
    }));
  };

  const deleteShop = (id: string) => {
    setShops(prev => prev.filter(s => s.id !== id));
    setOrders(prev => prev.map(o => o.shopId === id ? {
      ...o,
      latitude: undefined,
      longitude: undefined,
      googleMapsLink: undefined,
      updatedAt: new Date().toISOString()
    } : o));
  };

  const archiveShop = (id: string) => {
    const now = new Date().toISOString();
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'Archived', updatedAt: now } : s));
  };

  const restoreShop = (id: string) => {
    const now = new Date().toISOString();
    setShops(prev => prev.map(s => s.id === id ? { ...s, status: 'Active', updatedAt: now } : s));
  };

  // Category Operations
  const addCategory = (c: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newCat: Category = {
      ...c,
      id: 'cat-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setCategories(prev => [...prev, newCat]);
  };

  // Product Operations
  const addProduct = (p: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newProd: Product = {
      ...p,
      id: 'prod-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updatedFields: Partial<Product>) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updatedFields, updatedAt: now } : p));
  };

  const adjustStock = (id: string, qtyDelta: number) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => {
      if (p.id === id) {
        return {
          ...p,
          currentStock: Math.max(0, p.currentStock + qtyDelta),
          updatedAt: now
        };
      }
      return p;
    }));
  };

  const deleteProduct = (id: string) => {
    const now = new Date().toISOString();
    setProducts(prev => prev.map(p => p.id === id ? { ...p, isDeleted: true, status: 'Inactive', updatedAt: now } : p));
  };

  // Order Operations
  const createOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order => {
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: 'ord-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };

    setOrders(prev => [newOrder, ...prev]);

    // Update shop balance
    setShops(prev => prev.map(s => {
      if (s.id === newOrder.shopId) {
        return {
          ...s,
          outstandingAmount: s.outstandingAmount + newOrder.netTotal,
          totalOrdersCount: s.totalOrdersCount + 1,
          updatedAt: now
        };
      }
      return s;
    }));

    // Deduct stock balance for each item ordered
    newOrder.items.forEach(item => {
      adjustStock(item.productId, -item.quantity);
    });

    // Notification
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        type: 'NewOrder',
        title: 'New Order Created',
        message: `Order #${newOrder.orderNumber} for ${newOrder.shopName} (₹${newOrder.netTotal.toLocaleString('en-IN')})`,
        read: false,
        timestamp: 'Just now',
        linkModule: 'orders'
      },
      ...prev
    ]);

    return newOrder;
  };

  const updateOrderStatus = (id: string, status: OrderStatus, trackingNumber?: string, dispatchVehicle?: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        return {
          ...o,
          status,
          deliveryStatus: status === 'Delivered' ? 'Delivered' : o.deliveryStatus,
          trackingNumber: trackingNumber || o.trackingNumber,
          dispatchVehicle: dispatchVehicle || o.dispatchVehicle,
          updatedAt: now
        };
      }
      return o;
    }));
  };

  const acceptOrderForDelivery = (orderId: string, staffId: string, staffName: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const logs = o.deliveryLogs || [];
        return {
          ...o,
          deliveryStatus: 'Assigned',
          status: 'Ready for Delivery',
          assignedToStaffId: staffId,
          assignedToStaffName: staffName,
          acceptedAt: now,
          deliveryLogs: [...logs, { stage: 'Assigned', timestamp: now, note: `Accepted by ${staffName}` }],
          updatedAt: now
        };
      }
      return o;
    }));

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        type: 'General',
        title: 'Order Accepted for Delivery',
        message: `Order assigned to ${staffName}`,
        read: false,
        timestamp: 'Just now',
        linkModule: 'dispatch'
      },
      ...prev
    ]);
  };

  const startOrderNavigation = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const logs = o.deliveryLogs || [];
        return {
          ...o,
          deliveryStatus: 'Out for Delivery',
          status: 'Dispatched',
          navigationStartedAt: now,
          deliveryLogs: [...logs, { stage: 'Out for Delivery', timestamp: now, note: 'Navigation started' }],
          updatedAt: now
        };
      }
      return o;
    }));
  };

  const markOrderReachedShop = (orderId: string) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const logs = o.deliveryLogs || [];
        return {
          ...o,
          deliveryStatus: 'Reached Shop',
          reachedShopAt: now,
          deliveryLogs: [...logs, { stage: 'Reached Shop', timestamp: now, note: 'Arrived at shop location' }],
          updatedAt: now
        };
      }
      return o;
    }));
  };

  const completeOrderDelivery = (orderId: string, proof: any) => {
    const now = new Date().toISOString();
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        const logs = o.deliveryLogs || [];
        return {
          ...o,
          deliveryStatus: 'Delivered',
          status: 'Delivered',
          deliveredAt: now,
          deliveryProof: proof,
          deliveryLogs: [...logs, { stage: 'Delivered', timestamp: now, note: `Delivered & Proof Captured` }],
          updatedAt: now
        };
      }
      return o;
    }));

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        type: 'General',
        title: 'Order Delivered Successfully',
        message: `Delivery completed with digital proof`,
        read: false,
        timestamp: 'Just now',
        linkModule: 'dispatch'
      },
      ...prev
    ]);
  };

  const optimizeDeliveryRouteForStaff = (staffId: string) => {
    const staffOrders = orders.filter(
      o => o.assignedToStaffId === staffId && o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled'
    );
    if (staffOrders.length === 0) return;

    const { optimizedOrders } = optimizeDeliverySequence(staffOrders);
    const orderSeqMap = new Map(optimizedOrders.map(o => [o.id, o.deliverySequence]));

    setOrders(prev =>
      prev.map(o => {
        if (orderSeqMap.has(o.id)) {
          return {
            ...o,
            deliverySequence: orderSeqMap.get(o.id),
            updatedAt: new Date().toISOString()
          };
        }
        return o;
      })
    );
  };

  const deleteOrder = (id: string) => {
    setOrders(prev => prev.filter(o => o.id !== id));
  };

  // Payment Operations
  const addPayment = (pData: Omit<Payment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newPay: Payment = {
      ...pData,
      id: 'pay-' + Date.now(),
      createdAt: now,
      updatedAt: now
    };

    setPayments(prev => [newPay, ...prev]);

    // Reduce shop outstanding amount
    setShops(prev => prev.map(s => {
      if (s.id === newPay.shopId) {
        return {
          ...s,
          outstandingAmount: Math.max(0, s.outstandingAmount - pData.amount),
          updatedAt: now
        };
      }
      return s;
    }));
  };

  // Expense Operations
  const addExpense = (exp: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newExp: Expense = {
      ...exp,
      id: 'exp-' + Date.now(),
      expenseNumber: `JM-EXP-2026-${String(expenses.length + 1).padStart(3, '0')}`,
      createdAt: now,
      updatedAt: now
    };
    setExpenses(prev => [newExp, ...prev]);
  };

  // Production Batch Operations
  const addProductionBatch = (b: Omit<ProductionBatch, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newBatch: ProductionBatch = {
      ...b,
      id: 'batch-' + Date.now(),
      batchNumber: `BATCH-2026-${String(productionBatches.length + 701)}`,
      createdAt: now,
      updatedAt: now
    };
    setProductionBatches(prev => [newBatch, ...prev]);
  };

  const updateBatchStage = (id: string, stage: ProductionBatch['grindingStage'], status: ProductionBatch['status']) => {
    const now = new Date().toISOString();
    setProductionBatches(prev => prev.map(b => {
      if (b.id === id) {
        return {
          ...b,
          grindingStage: stage,
          status,
          completionDate: status === 'Completed' ? now.substring(0, 10) : b.completionDate,
          updatedAt: now
        };
      }
      return b;
    }));
  };

  // Attendance Operations
  const recordAttendance = (employeeId: string, status: AttendanceRecord['status'], overtimeHours = 0) => {
    const today = new Date().toISOString().substring(0, 10);
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    setAttendance(prev => {
      const existing = prev.find(a => a.employeeId === employeeId && a.date === today);
      if (existing) {
        return prev.map(a => a.id === existing.id ? { ...a, status, overtimeHours, updatedAt: new Date().toISOString() } : a);
      } else {
        const newRecord: AttendanceRecord = {
          id: 'att-' + Date.now(),
          employeeId,
          employeeName: emp.name,
          employeeCode: emp.code,
          date: today,
          status,
          checkIn: '09:00 AM',
          overtimeHours,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        return [newRecord, ...prev];
      }
    });
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Open generic modal handler
  const openNewModal = (type: string) => {
    setNewModalType(type);
    setIsNewModalOpen(true);
  };

  // Calculated Dashboard Stats
  const dashboardStats = {
    totalSales: orders.reduce((acc, o) => acc + o.netTotal, 0),
    totalOrders: orders.length,
    activeProducts: products.filter(p => p.status === 'Active').length,
    totalEmployees: employees.filter(e => !e.isDeleted && e.status === 'Active').length,
    pendingDispatchCount: orders.filter(o => o.status === 'Packed' || o.status === 'Confirmed' || o.status === 'Pending').length,
    outstandingPaymentsTotal: shops.filter(s => s.status !== 'Archived').reduce((acc, s) => acc + s.outstandingAmount, 0),
    lowStockCount: products.filter(p => p.currentStock <= p.reorderLevel).length
  };

  return (
    <AppContext.Provider
      value={{
        activeModule,
        setActiveModule,
        isMobileMenuOpen,
        setIsMobileMenuOpen,
        toggleMobileMenu,
        isDarkMode,
        toggleDarkMode,
        globalSearch,
        setGlobalSearch,
        settings,
        updateSettings,
        employees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        resetEmployeePassword,
        toggleDisableLogin,
        newEmployeeCredentials,
        setNewEmployeeCredentials,
        shops,
        addShop,
        updateShop,
        deleteShop,
        archiveShop,
        restoreShop,
        categories,
        addCategory,
        products,
        addProduct,
        updateProduct,
        adjustStock,
        deleteProduct,
        orders,
        createOrder,
        updateOrderStatus,
        acceptOrderForDelivery,
        startOrderNavigation,
        markOrderReachedShop,
        completeOrderDelivery,
        optimizeDeliveryRouteForStaff,
        deleteOrder,
        payments,
        addPayment,
        expenses,
        addExpense,
        productionBatches,
        addProductionBatch,
        updateBatchStage,
        attendance,
        recordAttendance,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        isNewModalOpen,
        setIsNewModalOpen,
        newModalType,
        openNewModal,
        dashboardStats
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
