/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Complete HR & Employee Management Module
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Download,
  Printer,
  Edit,
  Trash2,
  Phone,
  Mail,
  Building,
  CreditCard,
  Eye,
  KeyRound,
  Ban,
  CheckCircle,
  FileSpreadsheet,
  FileText,
  UserCheck,
  UserX,
  UserMinus,
  Calendar,
  Sparkles,
  ShieldAlert,
  X,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Employee, EmployeeStatus, UserRole } from '../../types/erp';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { exportToCSV, exportEmployeesToPDF } from '../../utils/exporter';
import { EmployeeProfileView } from './EmployeeProfileView';
import { CredentialsModal } from '../modals/CredentialsModal';
import { DepartmentPicker, MultiRolePicker } from './RoleDepartmentPickers';
import { JAMAVAT_LOGO_DATA_URL } from '../../utils/logo';

export const EmployeesView: React.FC = () => {
  const {
    employees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    resetEmployeePassword,
    toggleDisableLogin,
    openNewModal,
    newEmployeeCredentials,
    setNewEmployeeCredentials
  } = useApp();

  // Active view: 'list' or 'profile'
  const [selectedEmployeeForView, setSelectedEmployeeForView] = useState<Employee | null>(null);

  // Edit employee modal state
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  // Success Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Auto-dismiss toast
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  // Filter active directory (non-deleted employees)
  const activeDirectory = employees.filter(e => !e.isDeleted);

  // Dashboard KPI metrics
  const totalEmployeesCount = activeDirectory.length;
  const activeCount = activeDirectory.filter(e => e.status === 'Active').length;
  const onLeaveCount = activeDirectory.filter(e => e.status === 'On Leave').length;
  const inactiveCount = activeDirectory.filter(e => e.status === 'Inactive').length;
  const dismissedCount = activeDirectory.filter(e => e.status === 'Dismissed').length;

  // New employees joined this month
  const currentMonthPrefix = new Date().toISOString().substring(0, 7);
  const newThisMonthCount = activeDirectory.filter(
    e => e.joiningDate && e.joiningDate.startsWith(currentMonthPrefix)
  ).length;

  // Departments list
  const departmentsList = [
    'All',
    'Administration',
    'Human Resources (HR)',
    'Sales',
    'Marketing',
    'Accounts',
    'Finance',
    'Production',
    'Inventory',
    'Warehouse',
    'Purchase',
    'Quality Control',
    'Dispatch',
    'Logistics',
    'IT',
    'Customer Support'
  ];

  // Filtered List
  const filteredEmployees = activeDirectory.filter(emp => {
    const term = searchTerm.toLowerCase();
    const empRoles = emp.roles && emp.roles.length > 0 ? emp.roles : [emp.role];
    const matchesSearch =
      emp.name.toLowerCase().includes(term) ||
      (emp.code && emp.code.toLowerCase().includes(term)) ||
      (emp.username && emp.username.toLowerCase().includes(term)) ||
      (emp.email && emp.email.toLowerCase().includes(term)) ||
      (emp.phone && emp.phone.includes(term)) ||
      (emp.role && emp.role.toLowerCase().includes(term)) ||
      empRoles.some(r => r && r.toLowerCase().includes(term)) ||
      (emp.department && emp.department.toLowerCase().includes(term));

    const matchesStatus = statusFilter === 'All' || emp.status === statusFilter;
    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Handle Reset Password Action
  const handleResetPassword = (emp: Employee) => {
    if (window.confirm(`Reset login password for ${emp.name}? A new temporary password will be generated.`)) {
      const newPass = resetEmployeePassword(emp.id);
      setNewEmployeeCredentials({
        code: emp.code,
        username: emp.username || emp.email.split('@')[0],
        tempPassword: newPass,
        name: emp.name
      });
      setToastMessage(`Password reset successfully for ${emp.name}.`);
    }
  };

  // Handle Delete Employee Action with confirmation dialog, state removal, immediate sync, toast feedback
  const handleDeleteEmployee = (emp: Employee) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete employee "${emp.name}" (${emp.code})?\n\nThis will permanently remove the employee record from the system.`
    );

    if (confirmDelete) {
      deleteEmployee(emp.id);
      if (selectedEmployeeForView?.id === emp.id) {
        setSelectedEmployeeForView(null);
      }
      setToastMessage('Employee deleted successfully.');
    }
  };

  // Printable ID Badge
  const handlePrintBadge = (emp: Employee) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Employee ID Badge - ${emp.name}</title>
          <style>
            body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f1f5f9; }
            .badge { width: 320px; background: #fff; border-radius: 20px; border: 2px solid #800000; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); text-align: center; }
            .header { background: #800000; color: #fef08a; padding: 18px; font-weight: bold; font-size: 16px; }
            .avatar { width: 110px; height: 110px; border-radius: 50%; margin: 16px auto; border: 4px solid #800000; object-fit: cover; }
            .name { font-size: 18px; font-weight: bold; color: #1e293b; margin: 4px 0; }
            .code { font-size: 12px; color: #800000; font-weight: bold; background: #fef3c7; display: inline-block; padding: 3px 10px; border-radius: 8px; margin-bottom: 8px; }
            .details { padding: 16px; font-size: 12px; color: #475569; text-align: left; line-height: 1.8; border-top: 1px solid #e2e8f0; background: #f8fafc; }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="header">
              <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala" style="height: 28px; width: auto; vertical-align: middle; display: block; margin: 0 auto 6px auto;" />
              JAMAVAT MASALA ERP<br/><small style="color:#fff;font-size:11px">Official Employee Identity Card</small>
            </div>
            <img src="${emp.photoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}" class="avatar" />
            <div class="name">${emp.name}</div>
            <div class="code">${emp.code}</div>
            <div class="details">
              <strong>Role:</strong> ${emp.role}<br/>
              <strong>Department:</strong> ${emp.department}<br/>
              <strong>Designation:</strong> ${emp.designation}<br/>
              <strong>Mobile:</strong> ${emp.phone}<br/>
              <strong>Emergency:</strong> ${emp.emergencyContact || emp.phone}
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // If detailed Employee Profile View is selected
  if (selectedEmployeeForView) {
    return (
      <EmployeeProfileView
        employee={selectedEmployeeForView}
        onBack={() => setSelectedEmployeeForView(null)}
      />
    );
  }

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif] relative">
      {/* Success Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 bg-emerald-600 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle size={20} className="text-amber-300 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="ml-2 p-1 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Employee Credentials Popup Modal */}
      <CredentialsModal
        isOpen={!!newEmployeeCredentials}
        onClose={() => setNewEmployeeCredentials(null)}
        credentials={newEmployeeCredentials}
      />

      {/* Edit Employee In-line Modal */}
      {editingEmployee && (
        <EditEmployeeModal
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
          onSave={updatedData => {
            updateEmployee(editingEmployee.id, updatedData);
            setEditingEmployee(null);
            setToastMessage(`Employee "${editingEmployee.name}" updated successfully.`);
          }}
        />
      )}

      {/* Module Title & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#800000] text-amber-300">
              <Users size={20} />
            </div>
            <span>Employee Management Module</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Complete HR records, role permissions, payroll, attendance & portal access credentials
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Export Options */}
          <button
            onClick={() => exportEmployeesToPDF(filteredEmployees)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Print PDF Report"
          >
            <Printer size={15} />
            <span className="hidden sm:inline">PDF Report</span>
          </button>

          <button
            onClick={() => exportToCSV('JM_ERP_Employees_List', filteredEmployees)}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            title="Export CSV"
          >
            <FileSpreadsheet size={15} />
            <span className="hidden sm:inline">CSV Export</span>
          </button>

          <button
            onClick={() => openNewModal('employee')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#800000] to-[#990000] hover:from-[#990000] hover:to-[#800000] text-amber-300 font-black text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus size={16} />
            <span>+ Add Employee</span>
          </button>
        </div>
      </div>

      {/* Employee Dashboard Stats KPI Grid (6 Metric Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Total Employees */}
        <div
          onClick={() => setStatusFilter('All')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'All'
              ? 'bg-[#800000] text-white border-[#800000] shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase ${statusFilter === 'All' ? 'text-amber-300' : 'text-slate-400'}`}>
              Total Staff
            </span>
            <Users size={16} className={statusFilter === 'All' ? 'text-amber-300' : 'text-[#800000]'} />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${statusFilter === 'All' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            {totalEmployeesCount}
          </h3>
        </div>

        {/* Active Employees */}
        <div
          onClick={() => setStatusFilter('Active')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Active'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase ${statusFilter === 'Active' ? 'text-emerald-200' : 'text-slate-400'}`}>
              Active
            </span>
            <UserCheck size={16} className={statusFilter === 'Active' ? 'text-white' : 'text-emerald-600'} />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${statusFilter === 'Active' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            {activeCount}
          </h3>
        </div>

        {/* On Leave */}
        <div
          onClick={() => setStatusFilter('On Leave')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'On Leave'
              ? 'bg-amber-500 text-white border-amber-500 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase ${statusFilter === 'On Leave' ? 'text-amber-100' : 'text-slate-400'}`}>
              On Leave
            </span>
            <Calendar size={16} className={statusFilter === 'On Leave' ? 'text-white' : 'text-amber-500'} />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${statusFilter === 'On Leave' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            {onLeaveCount}
          </h3>
        </div>

        {/* Inactive Employees */}
        <div
          onClick={() => setStatusFilter('Inactive')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Inactive'
              ? 'bg-slate-700 text-white border-slate-700 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase ${statusFilter === 'Inactive' ? 'text-slate-300' : 'text-slate-400'}`}>
              Inactive
            </span>
            <UserMinus size={16} className={statusFilter === 'Inactive' ? 'text-white' : 'text-slate-500'} />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${statusFilter === 'Inactive' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            {inactiveCount}
          </h3>
        </div>

        {/* Dismissed Employees */}
        <div
          onClick={() => setStatusFilter('Dismissed')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Dismissed'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[10px] font-extrabold uppercase ${statusFilter === 'Dismissed' ? 'text-rose-200' : 'text-slate-400'}`}>
              Dismissed
            </span>
            <UserX size={16} className={statusFilter === 'Dismissed' ? 'text-white' : 'text-rose-600'} />
          </div>
          <h3 className={`text-2xl font-black mt-1 ${statusFilter === 'Dismissed' ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
            {dismissedCount}
          </h3>
        </div>

        {/* New Employees This Month */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-[#800000] to-amber-600 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-extrabold uppercase text-amber-200">
              New (This Month)
            </span>
            <Sparkles size={16} className="text-amber-300" />
          </div>
          <h3 className="text-2xl font-black mt-1 text-white">
            +{newThisMonthCount}
          </h3>
        </div>
      </div>

      {/* Filter Controls Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, username, email, role, dept..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 font-medium"
          />
        </div>

        {/* Department Filter Selector */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 whitespace-nowrap hidden sm:inline">Department:</span>
          {departmentsList.map(dept => (
            <button
              key={dept}
              onClick={() => setDepartmentFilter(dept)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                departmentFilter === dept
                  ? 'bg-[#800000] text-amber-300 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>
      </div>

      {/* Main Employee Table / Mobile Card Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Mobile View (Single-column cards) */}
        <div className="grid grid-cols-1 gap-3 p-4 md:hidden">
          {filteredEmployees.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold text-xs">
              No employee records match the current filter search.
            </div>
          ) : (
            filteredEmployees.map(emp => (
              <div
                key={emp.id}
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  emp.isLoginDisabled
                    ? 'bg-slate-100 dark:bg-slate-800/40 border-slate-300 dark:border-slate-700 opacity-80'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex items-start gap-3">
                  <img
                    src={
                      emp.photoUrl ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                    }
                    alt={emp.name}
                    className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400/50 shrink-0 bg-slate-200"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-black text-[#800000] dark:text-amber-400 text-xs">{emp.code}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(emp.status)}`}>
                        {emp.status}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-slate-800 dark:text-white text-sm truncate">{emp.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      @{emp.username || emp.email.split('@')[0]} • <span className="font-bold text-slate-700 dark:text-slate-300">{(emp.roles && emp.roles.length > 0 ? emp.roles : [emp.role]).join(', ')}</span> ({emp.department})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/80 dark:border-slate-700/60">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Mobile</span>
                    <span className="font-semibold">{emp.phone}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Salary</span>
                    <span className="font-black text-[#800000] dark:text-amber-300">{formatCurrency(emp.salary)}/mo</span>
                  </div>
                </div>

                {/* Actions Bar */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-slate-700/60 flex items-center justify-between gap-1 overflow-x-auto">
                  <button
                    onClick={() => setSelectedEmployeeForView(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Eye size={13} /> View
                  </button>

                  <button
                    onClick={() => setEditingEmployee(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit size={13} /> Edit
                  </button>

                  <button
                    onClick={() => handleResetPassword(emp)}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                    title="Reset Password"
                  >
                    <KeyRound size={13} /> Reset Pass
                  </button>

                  <button
                    onClick={() => toggleDisableLogin(emp.id)}
                    className={`px-2 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer ${
                      emp.isLoginDisabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    <Ban size={13} /> {emp.isLoginDisabled ? 'Enable' : 'Disable'}
                  </button>

                  <button
                    onClick={() => handleDeleteEmployee(emp)}
                    className="p-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                    title="Delete Employee"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 font-extrabold uppercase text-[10px] tracking-wider">
                <th className="py-3.5 px-4">Photo</th>
                <th className="py-3.5 px-4">Employee ID</th>
                <th className="py-3.5 px-4">Full Name</th>
                <th className="py-3.5 px-4">Username</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Mobile</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Joining Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={11} className="py-12 text-center text-slate-400 font-semibold text-xs">
                    No employees matching filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(emp => (
                  <tr
                    key={emp.id}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                      emp.isLoginDisabled ? 'opacity-60 bg-slate-50/50' : ''
                    }`}
                  >
                    {/* Photo */}
                    <td className="py-3 px-4">
                      <img
                        src={
                          emp.photoUrl ||
                          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'
                        }
                        alt={emp.name}
                        className="w-9 h-9 rounded-xl object-cover border border-amber-400/50 shadow-xs bg-slate-200"
                      />
                    </td>

                    {/* Employee ID */}
                    <td className="py-3 px-4 font-mono font-extrabold text-[#800000] dark:text-amber-400">
                      {emp.code}
                    </td>

                    {/* Full Name */}
                    <td className="py-3 px-4">
                      <button
                        onClick={() => setSelectedEmployeeForView(emp)}
                        className="font-extrabold text-slate-800 dark:text-white hover:text-[#800000] dark:hover:text-amber-300 text-xs hover:underline text-left cursor-pointer"
                      >
                        {emp.name}
                      </button>
                      <span className="text-[10px] text-slate-400 block font-normal">{emp.designation}</span>
                    </td>

                    {/* Username */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-600 dark:text-slate-300">
                      @{emp.username || emp.email.split('@')[0]}
                    </td>

                    {/* Roles */}
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {(emp.roles && emp.roles.length > 0 ? emp.roles : [emp.role]).map((r, i) => (
                          <span
                            key={i}
                            className="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-100 text-[#800000] border border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900/50"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                      {emp.department}
                    </td>

                    {/* Mobile */}
                    <td className="py-3 px-4 font-bold text-slate-800 dark:text-slate-200">
                      {emp.phone}
                    </td>

                    {/* Email */}
                    <td className="py-3 px-4 text-slate-500 max-w-[140px] truncate" title={emp.email}>
                      {emp.email}
                    </td>

                    {/* Joining Date */}
                    <td className="py-3 px-4 text-slate-500 font-medium">
                      {emp.joiningDate || '2026-01-01'}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1 items-start">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getStatusBadgeClass(emp.status)}`}>
                          {emp.status}
                        </span>
                        {emp.isLoginDisabled && (
                          <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                            Login Disabled
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => setSelectedEmployeeForView(emp)}
                          className="p-1.5 rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                          title="View Employee Profile"
                        >
                          <Eye size={15} />
                        </button>

                        <button
                          onClick={() => setEditingEmployee(emp)}
                          className="p-1.5 rounded-lg bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300 hover:bg-amber-100 cursor-pointer"
                          title="Edit Employee Information"
                        >
                          <Edit size={15} />
                        </button>

                        <button
                          onClick={() => handleResetPassword(emp)}
                          className="p-1.5 rounded-lg bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300 hover:bg-purple-100 cursor-pointer"
                          title="Reset Password"
                        >
                          <KeyRound size={15} />
                        </button>

                        <button
                          onClick={() => toggleDisableLogin(emp.id)}
                          className={`p-1.5 rounded-lg cursor-pointer ${
                            emp.isLoginDisabled
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                          }`}
                          title={emp.isLoginDisabled ? 'Enable Login' : 'Disable Login'}
                        >
                          <Ban size={15} />
                        </button>

                        <button
                          onClick={() => handlePrintBadge(emp)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer"
                          title="Print ID Card Badge"
                        >
                          <Printer size={15} />
                        </button>

                        <button
                          onClick={() => handleDeleteEmployee(emp)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer transition-colors"
                          title="Delete Employee"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ---------------- In-line Edit Employee Modal ---------------- */
interface EditEmployeeModalProps {
  employee: Employee;
  onClose: () => void;
  onSave: (updated: Partial<Employee>) => void;
}

const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({ employee, onClose, onSave }) => {
  const [name, setName] = useState(employee.name || '');
  const [phone, setPhone] = useState(employee.phone || '');
  const [email, setEmail] = useState(employee.email || '');
  const [department, setDepartment] = useState(employee.department || 'Production');
  const [roles, setRoles] = useState<UserRole[]>(
    employee.roles && employee.roles.length > 0 ? employee.roles : [employee.role || 'Employee']
  );
  const [designation, setDesignation] = useState(employee.designation || '');
  const [salary, setSalary] = useState(employee.salary || 25000);
  const [status, setStatus] = useState<EmployeeStatus>(employee.status || 'Active');
  const [address, setAddress] = useState(employee.address || '');
  const [emergencyContact, setEmergencyContact] = useState(employee.emergencyContact || '');
  const [formErrors, setFormErrors] = useState<{ department?: string; roles?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

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

    onSave({
      name,
      phone,
      email,
      department: department.trim(),
      role: roles[0] || 'Employee',
      roles: roles,
      designation,
      salary,
      status,
      address,
      emergencyContact
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 text-slate-800 dark:text-white shadow-2xl space-y-4 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 cursor-pointer"
        >
          <X size={18} />
        </button>

        <h3 className="font-extrabold text-base border-b pb-2 flex items-center gap-2">
          <Edit className="text-[#800000] dark:text-amber-400" size={18} />
          <span>Edit Employee - {employee.code}</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold mb-1">Full Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Mobile Number</label>
              <input
                type="text"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Email ID</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          <div className="space-y-3">
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

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
            <div>
              <label className="block font-bold mb-1">Monthly Salary (₹)</label>
              <input
                type="number"
                value={salary}
                onChange={e => setSalary(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
              >
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
            <div>
              <label className="block font-bold mb-1">Emergency Contact</label>
              <input
                type="text"
                value={emergencyContact}
                onChange={e => setEmergencyContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md cursor-pointer"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
