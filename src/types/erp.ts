/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Data Models & Type Definitions
 */

export type UserRole =
  | 'Owner'
  | 'Admin'
  | 'MD'
  | 'Managing Director'
  | 'HR'
  | 'HR Manager'
  | 'HR Executive'
  | 'Sales Manager'
  | 'Sales Executive'
  | 'Accountant'
  | 'Finance Manager'
  | 'Production Manager'
  | 'Production Supervisor'
  | 'Inventory Manager'
  | 'Warehouse Manager'
  | 'Purchase Manager'
  | 'Dispatch Manager'
  | 'Delivery Staff'
  | 'Marketing Manager'
  | 'Marketing Head'
  | 'Customer Support'
  | 'Quality Control'
  | 'IT Administrator'
  | 'Supervisor'
  | 'Employee'
  | 'Viewer';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  roles?: UserRole[];
  username?: string;
  employeeId?: string;
  phone?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  status: 'Active' | 'Inactive';
}

export type EmployeeStatus = 'Active' | 'On Leave' | 'Inactive' | 'Dismissed';

export type EmployeeDepartment =
  | 'Administration'
  | 'Human Resources (HR)'
  | 'Sales'
  | 'Marketing'
  | 'Accounts'
  | 'Finance'
  | 'Production'
  | 'Inventory'
  | 'Warehouse'
  | 'Purchase'
  | 'Quality Control'
  | 'Dispatch'
  | 'Logistics'
  | 'IT'
  | 'Customer Support'
  | string;

export interface Employee {
  id: string;
  code: string; // e.g. EMP-000001
  firstName?: string;
  lastName?: string;
  fatherName?: string;
  name: string; // Full name
  username: string;
  tempPassword?: string;
  gender?: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  phone: string;
  alternatePhone?: string;
  email: string;
  address?: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  aadhaar: string;
  pan: string;
  department: string;
  designation: string;
  role: UserRole; // primary or first role for backward compatibility
  roles?: UserRole[]; // array of multiple assigned roles
  salary: number; // ₹ per month
  joiningDate: string;
  emergencyContact: string;
  bloodGroup?: string;
  notes?: string;
  status: EmployeeStatus;
  photoUrl?: string;
  isLoginDisabled?: boolean;
  isDeleted?: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface SalarySlip {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  monthYear: string; // e.g. "July 2026"
  basicSalary: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  paymentDate: string;
  status: 'Paid' | 'Pending';
}

export type ShopStatus = 'Active' | 'Inactive' | 'Blocked' | 'Archived';

export interface Shop {
  id: string;
  code: string; // e.g. JM-SHP-001
  name: string;
  ownerName: string;
  phone: string;
  alternatePhone?: string;
  whatsapp?: string;
  address: string;
  village?: string;
  taluka?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  city: string;
  googleMapsLink?: string;
  latitude?: number;
  longitude?: number;
  locationVerified?: boolean;
  gstNumber?: string;
  dealerType?: 'Retailer' | 'Wholesaler' | 'Distributor' | 'Super Stockist';
  creditLimit: number; // ₹
  outstandingAmount: number; // ₹
  totalOrdersCount?: number;
  notes?: string;
  status: ShopStatus;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Category {
  id: string;
  name: string; // e.g. "Ground Masalas", "Whole Spices", "Blended Spices", "Hing / Asafoetida"
  code: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  status: 'Active' | 'Inactive';
}

export interface ProductVariant {
  id: string;
  weight: string; // e.g. '10g', '20g', '50g', '100g', '200g', '500g', '1kg', or custom string
  sku?: string;
  barcode?: string;
  manufacturingPrice: number; // ₹
  sellingPrice: number; // ₹ (Dealer Price)
  mrp: number; // ₹
  gstRate: number; // % (e.g. 5, 12, 18)
  stockQuantity: number;
  reorderLevel?: number;
}

export type ProductStatus = 'Active' | 'Inactive' | 'Out of Stock' | 'Discontinued';

export interface Product {
  id: string;
  code: string; // Product ID (Auto, e.g. JM-MSL-101)
  name: string;
  categoryId: string;
  categoryName: string;
  sku: string;
  barcode?: string;
  hsnCode?: string;
  unit: string; // e.g., '100g' or '50g, 100g, 200g'
  mrp: number; // ₹
  dealerPrice: number; // ₹ (Selling Price)
  purchasePrice: number; // ₹ (Manufacturing Price)
  gstRate: number; // % (e.g. 5, 12, 18)
  openingStock: number;
  currentStock: number;
  reorderLevel: number;
  imageUrl?: string;
  description?: string;
  status: ProductStatus;
  isDeleted?: boolean;
  variants?: ProductVariant[];
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface OrderItem {
  productId: string;
  productCode: string;
  productName: string;
  unit: string;
  quantity: number;
  mrp: number;
  unitPrice: number;
  gstRate: number;
  gstAmount: number;
  totalPrice: number;
}

export type DeliveryProgressStage = 'Ready for Delivery' | 'Assigned' | 'Out for Delivery' | 'Reached Shop' | 'Delivered' | 'Cancelled';

export interface DeliveryProof {
  signatureUrl?: string;
  photoUrl?: string;
  otpVerified?: boolean;
  otpCode?: string;
  receivedBy?: string;
  notes?: string;
  deliveredAt: string;
  deliveredByStaffId?: string;
  deliveredByStaffName?: string;
  location?: { lat: number; lng: number };
}

export interface DeliveryLogEntry {
  stage: DeliveryProgressStage;
  timestamp: string;
  note?: string;
  location?: { lat: number; lng: number };
}

export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Packed' | 'Ready for Delivery' | 'Dispatched' | 'Delivered' | 'Cancelled';

export interface Order {
  id: string;
  orderNumber: string; // e.g. JM-ORD-2026-0001
  invoiceNumber?: string; // e.g. JM-INV-2026-0001
  shopId: string;
  shopName: string;
  shopOwnerName?: string;
  shopPhone: string;
  shopGst?: string;
  shopAddress: string;
  village?: string;
  taluka?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
  items: OrderItem[];
  subtotal: number;
  discountAmount: number;
  gstTotal: number;
  netTotal: number;
  paidAmount: number;
  paymentStatus: 'Unpaid' | 'Partial' | 'Paid';
  status: OrderStatus;
  deliveryStatus?: DeliveryProgressStage;
  assignedToStaffId?: string;
  assignedToStaffName?: string;
  acceptedAt?: string;
  navigationStartedAt?: string;
  reachedShopAt?: string;
  deliveredAt?: string;
  distanceKm?: number;
  deliveryDurationMins?: number;
  deliverySequence?: number;
  deliveryProof?: DeliveryProof;
  deliveryLogs?: DeliveryLogEntry[];
  dispatchVehicle?: string;
  trackingNumber?: string;
  trackingCode?: string;
  dispatchedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface Payment {
  id: string;
  receiptNumber: string; // e.g. JM-REC-2026-001
  shopId: string;
  shopName: string;
  orderId?: string;
  amount: number; // ₹
  mode: 'Cash' | 'UPI' | 'Bank Transfer' | 'Cheque';
  transactionReference?: string; // UPI Ref or Cheque No
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  status: 'Completed' | 'Pending' | 'Rejected';
}

export interface Expense {
  id: string;
  expenseNumber: string;
  category: 'Raw Materials' | 'Factory & Electricity' | 'Transport & Freight' | 'Salaries' | 'Marketing' | 'Maintenance' | 'Miscellaneous';
  title: string;
  amount: number;
  date: string;
  paymentMode: 'Cash' | 'UPI' | 'Bank Transfer';
  vendorName?: string;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  status: 'Paid' | 'Pending';
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  date: string; // YYYY-MM-DD
  status: 'Present' | 'Absent' | 'Half Day' | 'On Leave';
  checkIn?: string;
  checkOut?: string;
  overtimeHours?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeCode: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface ProductionBatch {
  id: string;
  batchNumber: string; // e.g. BATCH-2026-0701
  productName: string;
  productId: string;
  rawSpiceName: string;
  rawQuantityKg: number;
  expectedYieldKg: number;
  actualYieldKg?: number;
  grindingStage: 'Raw Inspection' | 'Roasting' | 'Grinding' | 'Sifting' | 'Packaging' | 'Quality Passed';
  startDate: string;
  completionDate?: string;
  operatorName: string;
  status: 'Planned' | 'In Progress' | 'Completed' | 'On Hold';
  notes?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface NotificationItem {
  id: string;
  type: 'LowStock' | 'PendingPayment' | 'PendingDispatch' | 'Birthday' | 'WorkAnniversary' | 'NewEmployee' | 'NewOrder' | 'General';
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  linkModule?: string;
}

export interface CompanySettings {
  companyName: string;
  companyLogo: string;
  gstin: string;
  address: string;
  cityState: string;
  phone: string;
  email: string;
  invoicePrefix: string;
  orderPrefix: string;
  theme: 'light' | 'dark';
  enableFirebaseSync: boolean;
  firebaseConfig?: {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
  };
}
