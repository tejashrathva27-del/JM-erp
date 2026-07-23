/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Universal Data Creation Modal
 */

import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingCart, Users, Store, Package, Receipt, CreditCard, Factory } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrderItem, UserRole, EmployeeStatus } from '../../types/erp';
import { formatCurrency } from '../../utils/formatters';
import { DepartmentPicker, MultiRolePicker } from '../employees/RoleDepartmentPickers';
import { ShopLocationPicker } from '../shops/ShopLocationPicker';

export const GlobalCreateModal: React.FC = () => {
  const {
    isNewModalOpen,
    setIsNewModalOpen,
    newModalType,
    shops,
    products,
    categories,
    employees,
    addEmployee,
    addShop,
    addProduct,
    createOrder,
    addPayment,
    addExpense,
    addProductionBatch
  } = useApp();

  if (!isNewModalOpen) return null;

  const handleClose = () => setIsNewModalOpen(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto relative max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <h3 className="text-base font-black text-slate-800 dark:text-white capitalize flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-[#800000] text-amber-300 flex items-center justify-center text-xs">
              +
            </span>
            <span>Create New {newModalType} Record</span>
          </h3>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Dynamic Form Content */}
        {newModalType === 'order' && <CreateOrderForm onClose={handleClose} />}
        {newModalType === 'employee' && <CreateEmployeeForm onClose={handleClose} />}
        {newModalType === 'shop' && <CreateShopForm onClose={handleClose} />}
        {newModalType === 'product' && <CreateProductForm onClose={handleClose} />}
        {newModalType === 'payment' && <CreatePaymentForm onClose={handleClose} />}
        {newModalType === 'expense' && <CreateExpenseForm onClose={handleClose} />}
        {newModalType === 'production' && <CreateProductionForm onClose={handleClose} />}
      </div>
    </div>
  );
};

/* ---------------- Create Order Sub-Form ---------------- */
const CreateOrderForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shops, products, createOrder } = useApp();

  const [selectedShopId, setSelectedShopId] = useState(shops[0]?.id || '');
  const [items, setItems] = useState<OrderItem[]>([
    {
      productId: products[0]?.id || '',
      productCode: products[0]?.code || 'JM-MSL-101',
      productName: products[0]?.name || '',
      unit: products[0]?.unit || '500g',
      quantity: 10,
      mrp: products[0]?.mrp || 150,
      unitPrice: products[0]?.dealerPrice || 100,
      gstRate: 5,
      gstAmount: ((products[0]?.dealerPrice || 100) * 10 * 0.05),
      totalPrice: (products[0]?.dealerPrice || 100) * 10
    }
  ]);
  const [discountAmount, setDiscountAmount] = useState(0);

  const selectedShop = shops.find(s => s.id === selectedShopId) || shops[0];

  const subtotal = items.reduce((acc, i) => acc + i.totalPrice, 0);
  const taxableTotal = Math.max(0, subtotal - discountAmount);
  const gstTotal = items.reduce((acc, i) => acc + (i.totalPrice * (i.gstRate / 100)), 0);
  const netTotal = Math.round(taxableTotal + gstTotal);

  const handleAddItem = () => {
    const defaultP = products[0];
    if (!defaultP) return;
    const uPrice = defaultP.dealerPrice;
    const tot = uPrice * 5;
    const gAmount = tot * ((defaultP.gstRate || 5) / 100);
    setItems([
      ...items,
      {
        productId: defaultP.id,
        productCode: defaultP.code,
        productName: defaultP.name,
        unit: defaultP.unit,
        quantity: 5,
        mrp: defaultP.mrp,
        unitPrice: uPrice,
        gstRate: defaultP.gstRate || 5,
        gstAmount: gAmount,
        totalPrice: tot
      }
    ]);
  };

  const handleItemChange = (index: number, pId: string, qty: number) => {
    const prod = products.find(p => p.id === pId);
    if (!prod) return;

    setItems(prev =>
      prev.map((item, idx) => {
        if (idx === index) {
          const uPrice = prod.dealerPrice;
          const tot = uPrice * Math.max(1, qty);
          const gRate = prod.gstRate || 5;
          const gAmount = tot * (gRate / 100);
          return {
            ...item,
            productId: prod.id,
            productCode: prod.code,
            productName: prod.name,
            unit: prod.unit,
            quantity: Math.max(1, qty),
            mrp: prod.mrp,
            unitPrice: uPrice,
            gstRate: gRate,
            gstAmount: gAmount,
            totalPrice: tot
          };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShop) return;

    createOrder({
      shopId: selectedShop.id,
      shopName: selectedShop.name,
      shopAddress: `${selectedShop.address}, ${selectedShop.city}`,
      shopPhone: selectedShop.phone,
      shopGst: selectedShop.gstNumber,
      items,
      subtotal,
      discountAmount,
      gstTotal,
      netTotal,
      paidAmount: 0,
      paymentStatus: 'Unpaid',
      status: 'Pending',
      orderNumber: '',
      invoiceNumber: '',
      createdBy: 'MD Tejas Rathva'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      <div>
        <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Select Shop / Wholesale Dealer</label>
        <select
          value={selectedShopId}
          onChange={e => setSelectedShopId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
        >
          {shops.filter(s => s.status !== 'Archived').map(s => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.city}) • Outst: ₹{s.outstandingAmount.toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </div>

      {/* Item Picker Rows */}
      <div className="space-y-2 border-t border-b border-slate-100 dark:border-slate-800 py-3">
        <div className="flex items-center justify-between font-bold text-slate-700 dark:text-slate-300">
          <span>Order Spice Products</span>
          <button
            type="button"
            onClick={handleAddItem}
            className="text-[11px] text-[#800000] dark:text-amber-400 font-bold hover:underline"
          >
            + Add Another Item
          </button>
        </div>

        {items.map((item, idx) => (
          <div key={idx} className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl">
            <select
              value={item.productId}
              onChange={e => handleItemChange(idx, e.target.value, item.quantity)}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 font-semibold"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.unit}) - Dealer Rate: ₹{p.dealerPrice}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="1"
              value={item.quantity}
              onChange={e => handleItemChange(idx, item.productId, Number(e.target.value))}
              className="w-20 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 text-center font-bold"
            />

            <span className="w-24 font-black text-right">{formatCurrency(item.totalPrice)}</span>

            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="text-rose-500 hover:text-rose-700 p-1"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Totals Summary */}
      <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-1.5">
        <div className="flex justify-between">
          <span className="text-slate-500">Subtotal:</span>
          <span className="font-bold">{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500">Trade Discount (₹):</span>
          <input
            type="number"
            min="0"
            value={discountAmount}
            onChange={e => setDiscountAmount(Number(e.target.value))}
            className="w-24 px-2 py-1 rounded bg-white dark:bg-slate-700 border text-right font-bold"
          />
        </div>
        <div className="flex justify-between text-slate-500">
          <span>GST Tax (5%):</span>
          <span className="font-bold">{formatCurrency(gstTotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-black text-[#800000] dark:text-amber-300 pt-1 border-t border-slate-200">
          <span>Net Total Payable:</span>
          <span>{formatCurrency(netTotal)}</span>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-bold shadow-lg"
      >
        Confirm & Generate Invoice Order
      </button>
    </form>
  );
};

/* ---------------- Create Employee Sub-Form ---------------- */
const CreateEmployeeForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addEmployee, employees } = useApp();

  const nextSeq = employees.length + 1;
  const autoEmpId = `EMP-${String(nextSeq).padStart(6, '0')}`;

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [dateOfBirth, setDateOfBirth] = useState('1995-08-15');

  const [phone, setPhone] = useState('+91 ');
  const [alternatePhone, setAlternatePhone] = useState('');
  const [email, setEmail] = useState('');

  const [address, setAddress] = useState('');
  const [village, setVillage] = useState('Anand');
  const [taluka, setTaluka] = useState('Anand');
  const [district, setDistrict] = useState('Anand');
  const [state, setState] = useState('Gujarat');
  const [pinCode, setPinCode] = useState('388001');

  const [aadhaar, setAadhaar] = useState('');
  const [pan, setPan] = useState('');

  const [department, setDepartment] = useState<string>('Production');
  const [designation, setDesignation] = useState('Production Assistant');
  const [roles, setRoles] = useState<UserRole[]>(['Employee']);
  const [formErrors, setFormErrors] = useState<{ department?: string; roles?: string }>({});

  const [salary, setSalary] = useState(25000);
  const [joiningDate, setJoiningDate] = useState(new Date().toISOString().substring(0, 10));
  const [emergencyContact, setEmergencyContact] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<EmployeeStatus>('Active');

  const [photoUrl, setPhotoUrl] = useState('');

  // Derived auto username
  const autoUsername = firstName && lastName
    ? `${firstName.toLowerCase().replace(/[^a-z0-9]/g, '')}.${lastName.toLowerCase().replace(/[^a-z0-9]/g, '')}`
    : 'user.name';

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    const errors: { department?: string; roles?: string } = {};
    if (!department || !department.trim()) {
      errors.department = 'Department is required';
    }
    if (!roles || roles.length === 0) {
      errors.roles = 'At least one role is required';
    }
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const fullName = `${firstName.trim()} ${lastName.trim()}`;
    const generatedUsername = autoUsername;
    const generatedPassword = `JM@${Math.floor(1000 + Math.random() * 9000)}`;

    addEmployee({
      code: autoEmpId,
      firstName,
      lastName,
      fatherName,
      name: fullName,
      username: generatedUsername,
      tempPassword: generatedPassword,
      gender,
      dateOfBirth,
      phone,
      alternatePhone,
      email: email || `${generatedUsername}@jamavatmasala.com`,
      address,
      village,
      taluka,
      district,
      state,
      pinCode,
      aadhaar: aadhaar || '1234-5678-9012',
      pan: pan || 'ABCDE1234F',
      department: department.trim(),
      designation,
      role: roles[0] || 'Employee',
      roles: roles,
      salary,
      joiningDate,
      emergencyContact: emergencyContact || phone,
      bloodGroup,
      notes,
      status,
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      isLoginDisabled: false,
      isDeleted: false
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Photo Upload Header Section */}
      <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
        <div className="relative group shrink-0">
          <img
            src={photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt="Employee Photo Preview"
            className="w-16 h-16 rounded-xl object-cover border-2 border-[#800000] shadow-sm bg-slate-200"
          />
        </div>
        <div className="flex-1 space-y-1">
          <span className="font-extrabold text-slate-800 dark:text-white block">Employee Photo</span>
          <div className="flex items-center gap-2">
            <label
              htmlFor="modal-photo-upload"
              className="px-3 py-1.5 rounded-xl bg-[#800000] text-amber-300 font-bold text-[11px] cursor-pointer hover:bg-[#660000] inline-block shadow-xs"
            >
              Upload Photo
            </label>
            <input
              id="modal-photo-upload"
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                className="px-2.5 py-1.5 rounded-xl bg-rose-100 text-rose-700 font-bold text-[11px]"
              >
                Remove
              </button>
            )}
          </div>
          <span className="text-[10px] text-slate-400 block">Auto-generated ID: <strong className="text-amber-600 dark:text-amber-400">{autoEmpId}</strong></span>
        </div>
      </div>

      {/* Personal Identity Fields */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 border-b pb-1 text-[11px] uppercase tracking-wider">
          Personal Information
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">First Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramesh"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Last Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Patel"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Father / Husband Name</label>
            <input
              type="text"
              placeholder="e.g. Bhikhabhai Patel"
              value={fatherName}
              onChange={e => setFatherName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Gender</label>
            <select
              value={gender}
              onChange={e => setGender(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={e => setDateOfBirth(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={e => setBloodGroup(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact & Address Fields */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 border-b pb-1 text-[11px] uppercase tracking-wider">
          Contact & Address
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Mobile Number *</label>
            <input
              type="text"
              required
              placeholder="+91 98250 12345"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Alternate Phone</label>
            <input
              type="text"
              placeholder="+91 98250 99999"
              value={alternatePhone}
              onChange={e => setAlternatePhone(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Email Address</label>
            <input
              type="email"
              placeholder="e.g. ramesh@jamavatmasala.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="col-span-2">
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Street / House Address</label>
            <input
              type="text"
              placeholder="e.g. 12, Shree Kunj Society"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Village/City</label>
            <input
              type="text"
              value={village}
              onChange={e => setVillage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">District</label>
            <input
              type="text"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        </div>
      </div>

      {/* Identity Proofs */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 border-b pb-1 text-[11px] uppercase tracking-wider">
          Aadhaar & PAN Verification
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Aadhaar Card Number</label>
            <input
              type="text"
              placeholder="1234-5678-9012"
              value={aadhaar}
              onChange={e => setAadhaar(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
            />
          </div>
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">PAN Card Number</label>
            <input
              type="text"
              placeholder="ABCDE1234F"
              value={pan}
              onChange={e => setPan(e.target.value.toUpperCase())}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono uppercase"
            />
          </div>
        </div>
      </div>

      {/* Role & Department Employment Details */}
      <div className="space-y-2">
        <h4 className="font-extrabold text-slate-700 dark:text-slate-300 border-b pb-1 text-[11px] uppercase tracking-wider">
          Employment & Access Role
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DepartmentPicker
            value={department}
            onChange={val => {
              setDepartment(val);
              if (val.trim()) setFormErrors(prev => ({ ...prev, department: undefined }));
            }}
            error={formErrors.department}
          />

          <MultiRolePicker
            selectedRoles={roles}
            onChange={newRoles => {
              setRoles(newRoles);
              if (newRoles.length > 0) setFormErrors(prev => ({ ...prev, roles: undefined }));
            }}
            error={formErrors.roles}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Designation Title</label>
            <input
              type="text"
              placeholder="e.g. Factory Supervisor"
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Monthly Basic Salary (₹)</label>
            <input
              type="number"
              min="5000"
              step="1000"
              value={salary}
              onChange={e => setSalary(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-[#800000] dark:text-amber-300"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Joining Date</label>
            <input
              type="date"
              value={joiningDate}
              onChange={e => setJoiningDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
              <option value="Inactive">Inactive</option>
              <option value="Dismissed">Dismissed</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
        <p className="font-bold">🔑 Credentials Auto-Generation Notice:</p>
        <p>
          Username will be set to <strong className="font-mono">@{autoUsername}</strong> and a secure temporary password will be generated automatically. You can copy or print the credentials slip immediately after saving.
        </p>
      </div>

      <button
        type="submit"
        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#800000] to-[#990000] hover:from-[#990000] hover:to-[#800000] text-amber-300 font-black text-xs shadow-xl cursor-pointer transition-all"
      >
        Save & Onboard Employee
      </button>
    </form>
  );
};

/* ---------------- Create Shop Sub-Form ---------------- */
const CreateShopForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addShop, shops } = useApp();
  const nextSeq = shops.length + 101;

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [city, setCity] = useState('Anand');
  const [address, setAddress] = useState('Station Road, Anand');
  const [phone, setPhone] = useState('+91 98250 ');
  const [creditLimit, setCreditLimit] = useState(100000);
  const [gstNumber, setGstNumber] = useState('24ABCDE1234F1Z5');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [latitude, setLatitude] = useState(22.5645);
  const [longitude, setLongitude] = useState(72.9289);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addShop({
      code: `JM-SHP-${nextSeq}`,
      name,
      ownerName: ownerName || name,
      phone,
      whatsapp: phone,
      city,
      address,
      gstNumber,
      googleMapsLink: googleMapsUrl,
      latitude,
      longitude,
      outstandingAmount: 0,
      creditLimit,
      status: 'Active',
      createdBy: 'MD Tejas Rathva'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-bold mb-1">Shop / Dealer Firm Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Mahavir Masala General Store"
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Owner Name</label>
          <input
            type="text"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            placeholder="e.g. Nilesh Patel"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Phone Number</label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">City</label>
          <input
            type="text"
            value={city}
            onChange={e => setCity(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Credit Limit (₹)</label>
          <input
            type="number"
            value={creditLimit}
            onChange={e => setCreditLimit(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold mb-1">GSTIN Number</label>
        <input
          type="text"
          value={gstNumber}
          onChange={e => setGstNumber(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
        />
      </div>

      {/* GPS Location & Navigation Picker */}
      <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
        <label className="block text-xs font-extrabold text-[#800000] dark:text-amber-300">
          🧭 Google Maps Navigation & Precise GPS Location
        </label>
        <ShopLocationPicker
          googleMapsLink={googleMapsUrl}
          latitude={latitude}
          longitude={longitude}
          address={address}
          city={city}
          onChange={(loc) => {
            if (loc.googleMapsLink) setGoogleMapsUrl(loc.googleMapsLink);
            if (loc.latitude) setLatitude(loc.latitude);
            if (loc.longitude) setLongitude(loc.longitude);
          }}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md mt-2"
      >
        Save Shop Account
      </button>
    </form>
  );
};

/* ---------------- Create Product Sub-Form ---------------- */
const CreateProductForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addProduct, categories, products } = useApp();
  const nextSeq = products.length + 101;

  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [sku, setSku] = useState(`JM-SKU-${nextSeq}`);
  const [barcode, setBarcode] = useState(`890600100${nextSeq}`);
  const [hsnCode, setHsnCode] = useState('0910.30');
  const [unit, setUnit] = useState('50g, 100g, 200g, 500g');
  const [mrp, setMrp] = useState(150);
  const [dealerPrice, setDealerPrice] = useState(120);
  const [purchasePrice, setPurchasePrice] = useState(80);
  const [currentStock, setCurrentStock] = useState(500);
  const [reorderLevel, setReorderLevel] = useState(100);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const catObj = categories.find(c => c.id === categoryId) || categories[0];

    const defaultVariants = [
      {
        id: 'v-' + Date.now() + '-1',
        weight: '100 g',
        sku: `${sku}-100G`,
        barcode: `${barcode}1`,
        manufacturingPrice: Math.round(purchasePrice * 0.5),
        sellingPrice: Math.round(dealerPrice * 0.5),
        mrp: Math.round(mrp * 0.5),
        gstRate: 5,
        stockQuantity: Math.round(currentStock * 0.4)
      },
      {
        id: 'v-' + Date.now() + '-2',
        weight: '200 g',
        sku: `${sku}-200G`,
        barcode: `${barcode}2`,
        manufacturingPrice: purchasePrice,
        sellingPrice: dealerPrice,
        mrp,
        gstRate: 5,
        stockQuantity: Math.round(currentStock * 0.6)
      }
    ];

    addProduct({
      code: `JM-MSL-${nextSeq}`,
      name,
      categoryId,
      categoryName: catObj.name,
      sku: sku || `JM-SKU-${nextSeq}`,
      barcode: barcode || `890600100${nextSeq}`,
      hsnCode: hsnCode || '0910.30',
      unit: unit || '100g, 200g',
      mrp,
      dealerPrice,
      purchasePrice,
      openingStock: currentStock,
      currentStock,
      reorderLevel,
      gstRate: 5,
      status: 'Active',
      description: `Pure ${name} by Jamavat Masala.`,
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200',
      variants: defaultVariants,
      createdBy: 'MD Tejas Rathva'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-bold mb-1">Masala Product Name</label>
        <input
          type="text"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="e.g. Jamavat Pav Bhaji Masala"
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Category</label>
          <select
            value={categoryId}
            onChange={e => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          >
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block font-bold mb-1">SKU Code</label>
          <input
            type="text"
            value={sku}
            onChange={e => setSku(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Barcode</label>
          <input
            type="text"
            value={barcode}
            onChange={e => setBarcode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">HSN Code</label>
          <input
            type="text"
            value={hsnCode}
            onChange={e => setHsnCode(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block font-bold mb-1">Mfg Price (₹)</label>
          <input
            type="number"
            value={purchasePrice}
            onChange={e => setPurchasePrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Selling Price (₹)</label>
          <input
            type="number"
            value={dealerPrice}
            onChange={e => setDealerPrice(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-[#800000]"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">MRP (₹)</label>
          <input
            type="number"
            value={mrp}
            onChange={e => setMrp(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Total Stock Qty</label>
          <input
            type="number"
            value={currentStock}
            onChange={e => setCurrentStock(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Available Sizes</label>
          <input
            type="text"
            value={unit}
            onChange={e => setUnit(e.target.value)}
            placeholder="e.g. 50g, 100g, 200g, 500g"
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md mt-2"
      >
        Save Product SKU to Catalog
      </button>
    </form>
  );
};

/* ---------------- Create Payment Sub-Form ---------------- */
const CreatePaymentForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { shops, addPayment } = useApp();

  const [shopId, setShopId] = useState(shops[0]?.id || '');
  const [amount, setAmount] = useState(10000);
  const [paymentMode, setPaymentMode] = useState<'UPI' | 'Cash' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [referenceNumber, setReferenceNumber] = useState('UPI-123456789');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const shopObj = shops.find(s => s.id === shopId) || shops[0];
    if (!shopObj) return;

    addPayment({
      receiptNumber: '',
      shopId: shopObj.id,
      shopName: shopObj.name,
      amount,
      mode: paymentMode,
      transactionReference: referenceNumber,
      date: new Date().toISOString().substring(0, 10),
      status: 'Completed',
      createdBy: 'MD Tejas Rathva'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-bold mb-1">Select Dealer Shop</label>
        <select
          value={shopId}
          onChange={e => setShopId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        >
          {shops.filter(s => s.status !== 'Archived').map(s => (
            <option key={s.id} value={s.id}>
              {s.name} • Outstanding: ₹{s.outstandingAmount.toLocaleString('en-IN')}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Payment Amount (₹)</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-black text-[#800000]"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={e => setPaymentMode(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          >
            <option value="UPI">UPI / GPay / PhonePe</option>
            <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
            <option value="Cash">Cash Collection</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-bold mb-1">Transaction Ref / Cheque No.</label>
        <input
          type="text"
          value={referenceNumber}
          onChange={e => setReferenceNumber(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-mono"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold shadow-md mt-2"
      >
        Record Payment & Issue Receipt
      </button>
    </form>
  );
};

/* ---------------- Create Expense Sub-Form ---------------- */
const CreateExpenseForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { addExpense } = useApp();

  const [category, setCategory] = useState<'Raw Materials' | 'Factory & Electricity' | 'Transport & Freight' | 'Salaries' | 'Marketing' | 'Maintenance' | 'Miscellaneous'>('Raw Materials');
  const [description, setDescription] = useState('Purchase of Whole Turmeric roots from APMC Market');
  const [paidTo, setPaidTo] = useState('APMC Farmers Mandi');
  const [amount, setAmount] = useState(45000);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Bank Transfer'>('Bank Transfer');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    addExpense({
      expenseNumber: '',
      category,
      title: description,
      amount,
      vendorName: paidTo,
      paymentMode,
      date: new Date().toISOString().substring(0, 10),
      createdBy: 'MD Tejas Rathva',
      status: 'Paid'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-bold mb-1">Expense Category</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as any)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        >
          <option value="Raw Materials">Raw Materials</option>
          <option value="Factory & Electricity">Factory & Electricity</option>
          <option value="Transport & Freight">Transport & Freight</option>
          <option value="Salaries">Salaries</option>
          <option value="Marketing">Marketing</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
      </div>

      <div>
        <label className="block font-bold mb-1">Vendor / Paid To</label>
        <input
          type="text"
          value={paidTo}
          onChange={e => setPaidTo(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Expense Amount (₹)</label>
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold text-rose-600"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Payment Mode</label>
          <select
            value={paymentMode}
            onChange={e => setPaymentMode(e.target.value as any)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
          >
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="UPI">UPI</option>
            <option value="Cash">Cash</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block font-bold mb-1">Notes / Description</label>
        <input
          type="text"
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md mt-2"
      >
        Log Factory Expense
      </button>
    </form>
  );
};

/* ---------------- Create Production Sub-Form ---------------- */
const CreateProductionForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { products, addProductionBatch } = useApp();

  const [productId, setProductId] = useState(products[0]?.id || '');
  const [rawSpiceName, setRawSpiceName] = useState('Whole Turmeric Roots (Grade A)');
  const [rawQuantityKg, setRawQuantityKg] = useState(1000);
  const [expectedYieldKg, setExpectedYieldKg] = useState(980);
  const [operatorName, setOperatorName] = useState('Ramesh Bhai (Pulverizer Master)');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const prod = products.find(p => p.id === productId) || products[0];

    addProductionBatch({
      batchNumber: '',
      productId: prod.id,
      productName: prod.name,
      rawSpiceName,
      rawQuantityKg,
      expectedYieldKg,
      grindingStage: 'Raw Inspection',
      status: 'In Progress',
      operatorName,
      startDate: new Date().toISOString().substring(0, 10),
      createdBy: 'MD Tejas Rathva'
    });

    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <div>
        <label className="block font-bold mb-1">Target Finished Product SKU</label>
        <select
          value={productId}
          onChange={e => setProductId(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        >
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name} ({p.unit})</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-bold mb-1">Raw Spice Input Description</label>
        <input
          type="text"
          value={rawSpiceName}
          onChange={e => setRawSpiceName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block font-bold mb-1">Raw Input Weight (Kg)</label>
          <input
            type="number"
            value={rawQuantityKg}
            onChange={e => setRawQuantityKg(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
        <div>
          <label className="block font-bold mb-1">Expected Yield Weight (Kg)</label>
          <input
            type="number"
            value={expectedYieldKg}
            onChange={e => setExpectedYieldKg(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
          />
        </div>
      </div>

      <div>
        <label className="block font-bold mb-1">Plant Operator</label>
        <input
          type="text"
          value={operatorName}
          onChange={e => setOperatorName(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md mt-2"
      >
        Initialize Production Batch
      </button>
    </form>
  );
};
