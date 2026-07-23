/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Employee Self-Service & Profile View
 */

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Building,
  Calendar,
  CreditCard,
  MapPin,
  ShieldCheck,
  KeyRound,
  FileText,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Printer,
  Upload,
  Trash2,
  Edit,
  ArrowLeft,
  X,
  Lock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Employee, SalarySlip, LeaveRequest } from '../../types/erp';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { JAMAVAT_LOGO_DATA_URL } from '../../utils/logo';

interface EmployeeProfileViewProps {
  employee: Employee;
  onBack?: () => void;
  isSelfService?: boolean;
}

export const EmployeeProfileView: React.FC<EmployeeProfileViewProps> = ({
  employee,
  onBack,
  isSelfService = false
}) => {
  const { updateEmployee, attendance, recordAttendance } = useApp();
  const { user, updateCurrentUserProfile } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'attendance' | 'salary' | 'leave' | 'security'>('profile');
  const [isEditingInfo, setIsEditingInfo] = useState(false);

  // Edit form state
  const [phone, setPhone] = useState(employee.phone || '');
  const [email, setEmail] = useState(employee.email || '');
  const [address, setAddress] = useState(employee.address || '');
  const [village, setVillage] = useState(employee.village || '');
  const [district, setDistrict] = useState(employee.district || '');
  const [emergencyContact, setEmergencyContact] = useState(employee.emergencyContact || '');
  const [bloodGroup, setBloodGroup] = useState(employee.bloodGroup || 'O+');
  const [photoUrl, setPhotoUrl] = useState(employee.photoUrl || '');

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState('');
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');

  // Sample salary slips for this employee
  const mockSalarySlips: SalarySlip[] = [
    {
      id: 'sal-2026-07',
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      monthYear: 'July 2026',
      basicSalary: employee.salary,
      allowances: Math.round(employee.salary * 0.15),
      deductions: Math.round(employee.salary * 0.08),
      netSalary: Math.round(employee.salary * 1.07),
      paymentDate: '2026-07-01',
      status: 'Paid'
    },
    {
      id: 'sal-2026-06',
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      monthYear: 'June 2026',
      basicSalary: employee.salary,
      allowances: Math.round(employee.salary * 0.15),
      deductions: Math.round(employee.salary * 0.08),
      netSalary: Math.round(employee.salary * 1.07),
      paymentDate: '2026-06-01',
      status: 'Paid'
    }
  ];

  // Employee attendance records
  const empAttendance = attendance.filter(a => a.employeeId === employee.id);

  // Leave Requests state
  const [leaveType, setLeaveType] = useState<'Casual Leave' | 'Sick Leave' | 'Earned Leave'>('Casual Leave');
  const [leaveStartDate, setLeaveStartDate] = useState('');
  const [leaveEndDate, setLeaveEndDate] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  const [leaveAppliedMsg, setLeaveAppliedMsg] = useState('');

  const [leaveRequestsList, setLeaveRequestsList] = useState<LeaveRequest[]>([
    {
      id: 'leave-101',
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      leaveType: 'Casual Leave',
      startDate: '2026-06-10',
      endDate: '2026-06-12',
      reason: 'Family event in village',
      status: 'Approved',
      approvedBy: 'Priya Patel (HR)',
      createdAt: '2026-06-08T10:00:00.000Z',
      updatedAt: '2026-06-08T11:00:00.000Z'
    }
  ]);

  // Handle Photo File Upload / Change
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        alert('Please upload a JPG, PNG, or WEBP image.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const resultStr = reader.result as string;
        setPhotoUrl(resultStr);
        updateEmployee(employee.id, { photoUrl: resultStr });
        if (user && user.uid === employee.id) {
          updateCurrentUserProfile({ avatarUrl: resultStr });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setPhotoUrl('');
    updateEmployee(employee.id, { photoUrl: '' });
  };

  const handleSaveInfo = (e: React.FormEvent) => {
    e.preventDefault();
    updateEmployee(employee.id, {
      phone,
      email,
      address,
      village,
      district,
      emergencyContact,
      bloodGroup,
      photoUrl
    });
    if (user && user.uid === employee.id) {
      updateCurrentUserProfile({
        phone,
        email,
        avatarUrl: photoUrl
      });
    }
    setIsEditingInfo(false);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg('');
    setPasswordSuccessMsg('');

    if (newPassword.length < 4) {
      setPasswordErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New passwords do not match.');
      return;
    }

    updateEmployee(employee.id, { tempPassword: newPassword });
    setPasswordSuccessMsg('Password updated successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveStartDate || !leaveEndDate || !leaveReason) return;

    const now = new Date().toISOString();
    const newReq: LeaveRequest = {
      id: 'leave-' + Date.now(),
      employeeId: employee.id,
      employeeName: employee.name,
      employeeCode: employee.code,
      leaveType,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      reason: leaveReason,
      status: 'Pending',
      createdAt: now,
      updatedAt: now
    };

    setLeaveRequestsList(prev => [newReq, ...prev]);
    setLeaveAppliedMsg('Leave request submitted successfully for HR approval.');
    setLeaveReason('');
  };

  const handlePrintSlip = (slip: SalarySlip) => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>Salary Slip - ${employee.name} (${slip.monthYear})</title>
          <style>
            body { font-family: sans-serif; padding: 24px; color: #1e293b; max-width: 600px; margin: 0 auto; border: 2px solid #800000; border-radius: 16px; }
            .header { text-align: center; border-bottom: 2px solid #800000; pb: 12px; margin-bottom: 16px; }
            .title { color: #800000; font-size: 20px; font-weight: bold; }
            .sub { font-size: 12px; color: #64748b; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 16px; background: #f8fafc; padding: 12px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0; }
            th { background: #800000; color: #fff; text-align: left; padding: 8px; }
            td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
            .total { font-size: 16px; font-weight: bold; color: #800000; text-align: right; margin-top: 16px; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala Logo" style="height: 40px; width: auto; margin-bottom: 6px; display: inline-block;" />
            <div class="title">JAMAVAT MASALA ERP</div>
            <div class="sub">Official Salary Slip • ${slip.monthYear}</div>
          </div>
          <div class="grid">
            <div><strong>Employee ID:</strong> ${employee.code}</div>
            <div><strong>Full Name:</strong> ${employee.name}</div>
            <div><strong>Department:</strong> ${employee.department}</div>
            <div><strong>Designation:</strong> ${employee.designation}</div>
            <div><strong>Payment Date:</strong> ${slip.paymentDate}</div>
            <div><strong>Status:</strong> ${slip.status}</div>
          </div>
          <table>
            <thead>
              <tr><th>Component</th><th style="text-align:right">Amount (₹)</th></tr>
            </thead>
            <tbody>
              <tr><td>Basic Monthly Salary</td><td style="text-align:right">₹${slip.basicSalary.toLocaleString('en-IN')}</td></tr>
              <tr><td>Special Allowances & Bonus</td><td style="text-align:right">+ ₹${slip.allowances.toLocaleString('en-IN')}</td></tr>
              <tr><td>Deductions (PF / ESI)</td><td style="text-align:right">- ₹${slip.deductions.toLocaleString('en-IN')}</td></tr>
            </tbody>
          </table>
          <div class="total">Net Payable Amount: ₹${slip.netSalary.toLocaleString('en-IN')}</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Navigation Back Bar */}
      {onBack && (
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Employee List</span>
        </button>
      )}

      {/* Profile Banner & Identity Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-[#800000] via-[#990000] to-amber-700 p-6 flex justify-between items-start">
          <span className="text-amber-300 font-extrabold text-xs tracking-wider uppercase bg-black/20 px-3 py-1 rounded-full backdrop-blur-xs">
            {employee.department} Department
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusBadgeClass(employee.status)}`}>
            {employee.status}
          </span>
        </div>

        <div className="p-6 pt-0 relative flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-10">
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
            {/* Photo Avatar with upload trigger */}
            <div className="relative group">
              <img
                src={
                  photoUrl ||
                  employee.photoUrl ||
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                }
                alt={employee.name}
                className="w-24 h-24 rounded-2xl object-cover border-4 border-white dark:border-slate-900 shadow-xl bg-slate-200"
              />
              <label
                htmlFor="photo-upload-input"
                className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white cursor-pointer transition-opacity"
                title="Change Photo"
              >
                <Upload size={20} />
              </label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-xl font-black text-slate-800 dark:text-white">{employee.name}</h2>
                <span className="text-xs font-bold text-[#800000] dark:text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-lg border border-amber-400/30">
                  {employee.code}
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                {employee.designation} • Roles: <span className="font-bold text-slate-700 dark:text-slate-200">{(employee.roles && employee.roles.length > 0 ? employee.roles : [employee.role]).join(', ')}</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Username: <strong className="text-slate-700 dark:text-slate-300">@{employee.username}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {photoUrl && (
              <button
                onClick={handleRemovePhoto}
                className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 font-bold text-xs flex items-center gap-1"
              >
                <Trash2 size={14} /> Remove Photo
              </button>
            )}
            <button
              onClick={() => setIsEditingInfo(!isEditingInfo)}
              className="px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-md hover:bg-[#660000] cursor-pointer"
            >
              <Edit size={14} /> {isEditingInfo ? 'Cancel Editing' : 'Edit Contact Info'}
            </button>
          </div>
        </div>

        {/* Tab Navigation Menu */}
        <div className="flex items-center gap-1 px-6 pb-2 border-t border-slate-100 dark:border-slate-800 overflow-x-auto pt-2">
          {[
            { id: 'profile', label: 'Personal Information', icon: User },
            { id: 'attendance', label: 'Attendance Log', icon: CalendarCheck },
            { id: 'salary', label: 'Salary Slips', icon: FileText },
            { id: 'leave', label: 'Leave Requests', icon: Calendar },
            { id: 'security', label: 'Login & Password', icon: KeyRound }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#800000] text-amber-300 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon size={15} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Personal Information */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          {isEditingInfo ? (
            <form onSubmit={handleSaveInfo} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 text-xs">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white border-b pb-2">
                Update Personal Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Email ID</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Address / Street</label>
                  <input
                    type="text"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Village / City</label>
                  <input
                    type="text"
                    value={village}
                    onChange={e => setVillage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">District</label>
                  <input
                    type="text"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Emergency Contact Number</label>
                  <input
                    type="text"
                    value={emergencyContact}
                    onChange={e => setEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Blood Group</label>
                  <select
                    value={bloodGroup}
                    onChange={e => setBloodGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
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
              <div className="flex gap-2 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingInfo(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md"
                >
                  Save Profile Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* General & Identity Info */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <User className="text-[#800000] dark:text-amber-400" size={18} />
                  <span>General & Identity Info</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Father's Name</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.fatherName || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Gender / DOB</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.gender || 'Male'} • {employee.dateOfBirth}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Aadhaar Card No.</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.aadhaar}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">PAN Number</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.pan}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Blood Group</span>
                    <strong className="text-rose-600 dark:text-rose-400 font-black">{employee.bloodGroup || 'O+'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Joining Date</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.joiningDate}</strong>
                  </div>
                </div>
              </div>

              {/* Contact & Location Info */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
                  <MapPin className="text-[#800000] dark:text-amber-400" size={18} />
                  <span>Contact & Address Info</span>
                </h3>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Mobile Number</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Alternate Mobile</span>
                    <strong className="text-slate-800 dark:text-white font-bold">{employee.alternatePhone || 'N/A'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Email Address</span>
                    <strong className="text-slate-800 dark:text-white font-bold truncate block">{employee.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Emergency Contact</span>
                    <strong className="text-amber-600 font-black">{employee.emergencyContact}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block font-semibold text-[10px] uppercase">Full Address</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed mt-0.5">
                      {[employee.address, employee.village, employee.taluka, employee.district, employee.state, employee.pinCode].filter(Boolean).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Attendance Log */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <CalendarCheck className="text-[#800000] dark:text-amber-400" size={18} />
              <span>Attendance History</span>
            </h3>
            <button
              onClick={() => recordAttendance(employee.id, 'Present')}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-xs"
            >
              + Mark Present Today
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold">
                  <th className="py-2.5 px-3 rounded-l-xl">Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Check In</th>
                  <th className="py-2.5 px-3">Overtime (Hrs)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {empAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-slate-400 font-semibold">
                      No attendance records logged yet.
                    </td>
                  </tr>
                ) : (
                  empAttendance.map(att => (
                    <tr key={att.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-3 px-3 font-bold">{att.date}</td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(att.status)}`}>
                          {att.status}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 dark:text-slate-300">{att.checkIn || '09:00 AM'}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-800 dark:text-white">{att.overtimeHours || 0} hrs</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Salary Slips */}
      {activeTab === 'salary' && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
              <FileText className="text-[#800000] dark:text-amber-400" size={18} />
              <span>Monthly Salary Slips</span>
            </h3>
            <span className="text-xs font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950 px-3 py-1 rounded-xl">
              Base Salary: {formatCurrency(employee.salary)}/mo
            </span>
          </div>

          <div className="space-y-3">
            {mockSalarySlips.map(slip => (
              <div
                key={slip.id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-slate-800 dark:text-white text-sm">{slip.monthYear}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      {slip.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Basic: {formatCurrency(slip.basicSalary)} • Allowances: +{formatCurrency(slip.allowances)} • Deductions: -{formatCurrency(slip.deductions)}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Net Salary</span>
                    <span className="font-black text-sm text-[#800000] dark:text-amber-300">
                      {formatCurrency(slip.netSalary)}
                    </span>
                  </div>
                  <button
                    onClick={() => handlePrintSlip(slip)}
                    className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#800000] font-bold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    <Printer size={14} /> Print Slip
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Leave Requests */}
      {activeTab === 'leave' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Apply Leave Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
              <Calendar className="text-[#800000] dark:text-amber-400" size={18} />
              <span>Apply for Leave</span>
            </h3>

            {leaveAppliedMsg && (
              <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
                {leaveAppliedMsg}
              </div>
            )}

            <form onSubmit={handleApplyLeave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={e => setLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border font-bold"
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Earned Leave">Earned Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={leaveStartDate}
                    onChange={e => setLeaveStartDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={leaveEndDate}
                    onChange={e => setLeaveEndDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Reason for Leave</label>
                <textarea
                  required
                  rows={3}
                  value={leaveReason}
                  onChange={e => setLeaveReason(e.target.value)}
                  placeholder="State reason clearly..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md cursor-pointer"
              >
                Submit Leave Application
              </button>
            </form>
          </div>

          {/* Leave History */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-slate-800 dark:text-white border-b pb-3 border-slate-100 dark:border-slate-800">
              Leave History & Approvals
            </h3>

            <div className="space-y-3 text-xs">
              {leaveRequestsList.map(req => (
                <div key={req.id} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                  <div className="flex items-center justify-between font-bold">
                    <span>{req.leaveType}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {req.status}
                    </span>
                  </div>
                  <p className="text-slate-500 text-[11px]">{req.startDate} to {req.endDate}</p>
                  <p className="text-slate-700 dark:text-slate-300 italic">"{req.reason}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 5: Security / Password Change */}
      {activeTab === 'security' && (
        <div className="max-w-md bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2 border-b pb-3 border-slate-100 dark:border-slate-800">
            <KeyRound className="text-[#800000] dark:text-amber-400" size={18} />
            <span>Account Security & Login Info</span>
          </h3>

          <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <p className="text-slate-500">Employee ID: <strong className="text-slate-800 dark:text-white">{employee.code}</strong></p>
            <p className="text-slate-500">Username: <strong className="text-slate-800 dark:text-white">@{employee.username}</strong></p>
            <p className="text-slate-500">Current Temp Password: <strong className="text-amber-600 dark:text-amber-300 font-mono">{employee.tempPassword || 'JM@4821'}</strong></p>
          </div>

          {passwordSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold">
              {passwordSuccessMsg}
            </div>
          )}

          {passwordErrorMsg && (
            <div className="p-3 bg-rose-50 text-rose-800 rounded-xl text-xs font-bold">
              {passwordErrorMsg}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
            <div>
              <label className="block font-bold mb-1">New Password</label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <div>
              <label className="block font-bold mb-1">Confirm New Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#800000] text-amber-300 font-bold shadow-md cursor-pointer"
            >
              Update Password
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
