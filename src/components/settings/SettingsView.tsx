/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Settings, License & Owner Control Module
 */

import React, { useState } from 'react';
import {
  Settings,
  Save,
  Database,
  Shield,
  Building,
  CheckCircle2,
  Download,
  Key,
  ShieldAlert,
  Trash2,
  UserCheck,
  RefreshCw,
  Lock,
  Crown,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { CompanySettings } from '../../types/erp';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { user } = useAuth();

  const isOwner = user?.role === 'Owner' || user?.roles?.includes('Owner');

  const [activeTab, setActiveTab] = useState<'company' | 'owner_account' | 'license' | 'danger'>('company');
  const [formData, setFormData] = useState<CompanySettings>({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [restrictionError, setRestrictionError] = useState<string | null>(null);

  // License Details state
  const [licenseKey, setLicenseKey] = useState('JM-ERP-2026-ENT-884219');
  const [licenseType, setLicenseType] = useState('Enterprise Tier (Unlimited Users)');
  const [licenseExpiry, setLicenseExpiry] = useState('2030-12-31');

  // Ownership Transfer state
  const [transferEmail, setTransferEmail] = useState('');
  const [transferReason, setTransferReason] = useState('');
  const [transferSuccess, setTransferSuccess] = useState(false);

  // System Delete state
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setRestrictionError('Only the Company Owner (Rajesh Sharma) has permission to change Company Legal Settings.');
      return;
    }
    updateSettings(formData);
    setSavedSuccess(true);
    setRestrictionError(null);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const backupData = {
      settings: localStorage.getItem('jm_erp_settings'),
      employees: localStorage.getItem('jm_erp_employees'),
      shops: localStorage.getItem('jm_erp_shops'),
      products: localStorage.getItem('jm_erp_products'),
      orders: localStorage.getItem('jm_erp_orders'),
      payments: localStorage.getItem('jm_erp_payments'),
      expenses: localStorage.getItem('jm_erp_expenses'),
      production: localStorage.getItem('jm_erp_production'),
      timestamp: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `JM_ERP_Full_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    link.click();
  };

  const handleTransferOwnership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOwner) {
      setRestrictionError('Only the Company Owner has permission to Transfer Ownership.');
      return;
    }
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 4000);
  };

  const handleDeleteEntireERP = () => {
    if (!isOwner) {
      setRestrictionError('Only the Company Owner has permission to Delete the Entire ERP.');
      return;
    }
    if (deleteConfirmText !== 'DELETE ERP') {
      alert('Please type "DELETE ERP" to confirm entire system reset.');
      return;
    }
    localStorage.clear();
    setDeleteSuccess(true);
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2">
              <Settings className="text-[#800000] dark:text-amber-400" size={20} />
              <span>Company Settings & System Governance</span>
            </h2>
            <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 text-[#800000] dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
              {isOwner ? '👑 Owner Control' : `🔒 Restricted (${user?.role})`}
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure Jamavat Masala legal details, system licenses, owner security & data governance
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'company'
                ? 'bg-[#800000] text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            Company Profile
          </button>
          <button
            onClick={() => setActiveTab('owner_account')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'owner_account'
                ? 'bg-[#800000] text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Crown size={12} />
            <span>Owner Account</span>
          </button>
          <button
            onClick={() => setActiveTab('license')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'license'
                ? 'bg-[#800000] text-amber-300 shadow-xs'
                : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
            }`}
          >
            <Key size={12} />
            <span>License & Transfer</span>
          </button>
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
              activeTab === 'danger'
                ? 'bg-rose-700 text-white shadow-xs'
                : 'text-rose-600 dark:text-rose-400 hover:bg-rose-50'
            }`}
          >
            <ShieldAlert size={12} />
            <span>Reset ERP</span>
          </button>
        </div>
      </div>

      {/* Non-Owner Security Notice Banner */}
      {!isOwner && (
        <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3">
          <Lock className="text-[#800000] dark:text-amber-400 shrink-0 mt-0.5" size={18} />
          <div>
            <h4 className="text-xs font-extrabold text-[#800000] dark:text-amber-300 uppercase tracking-wider">
              Owner Security Policy Enforced
            </h4>
            <p className="text-xs text-amber-900 dark:text-amber-200 mt-0.5">
              You are logged in as <strong>{user?.displayName} ({user?.role})</strong>. Only the Company Owner (Rajesh Sharma) has permission to change company legal settings, manage owner credentials, transfer ERP ownership, alter system licenses, or reset ERP databases.
            </p>
          </div>
        </div>
      )}

      {restrictionError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center gap-2">
          <ShieldAlert size={16} className="text-rose-600" />
          <span>{restrictionError}</span>
        </div>
      )}

      {savedSuccess && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Company settings updated and saved successfully!</span>
        </div>
      )}

      {/* Company Profile Tab */}
      {activeTab === 'company' && (
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Identity */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#800000] dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Building size={16} />
              <span>Company Identity & Legal Details</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Legal Name
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.companyName}
                onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                GSTIN Registration Number
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.gstin}
                onChange={e => setFormData({ ...formData, gstin: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Factory & Head Office Address
              </label>
              <textarea
                rows={2}
                disabled={!isOwner}
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  City & State
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formData.cityState}
                  onChange={e => setFormData({ ...formData, cityState: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Official Phone
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Invoice Prefix & Backup */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-[#800000] dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Database size={16} />
              <span>Invoice Sequences & Data Management</span>
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Order Prefix
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formData.orderPrefix}
                  onChange={e => setFormData({ ...formData, orderPrefix: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Invoice Prefix
                </label>
                <input
                  type="text"
                  disabled={!isOwner}
                  value={formData.invoicePrefix}
                  onChange={e => setFormData({ ...formData, invoicePrefix: e.target.value })}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Company Logo URL
              </label>
              <input
                type="text"
                disabled={!isOwner}
                value={formData.companyLogo}
                onChange={e => setFormData({ ...formData, companyLogo: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
              />
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-800 dark:text-white">ERP Database Backup</p>
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all"
              >
                <Download size={14} />
                <span>Download Full JSON Database Backup</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={!isOwner}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isOwner
                  ? 'bg-[#800000] hover:bg-[#660000] text-amber-300'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save size={16} />
              <span>{isOwner ? 'Save All ERP Settings' : 'Owner Permission Required to Save'}</span>
            </button>
          </div>
        </form>
      )}

      {/* Owner Account Tab */}
      {activeTab === 'owner_account' && (
        <div className="max-w-2xl bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-400 text-[#800000]">
                <Crown size={20} />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-white">
                  Owner Primary Account Management
                </h3>
                <p className="text-xs text-slate-500">
                  Primary business entity holder: Rajesh Sharma (Owner)
                </p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-xl bg-amber-100 text-[#800000] text-xs font-extrabold">
              Master Authority
            </span>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  readOnly
                  value="Rajesh Sharma"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner Email
                </label>
                <input
                  type="text"
                  readOnly
                  value="owner@jamavatmasala.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Contact Number
              </label>
              <input
                type="text"
                readOnly
                value="+91 98250 11223"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-300/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
              <p className="font-extrabold flex items-center gap-1.5 text-[#800000] dark:text-amber-300">
                <Shield size={14} />
                <span>Owner Master Password Reset Policy</span>
              </p>
              <p>
                Owner account password resets require two-factor SMS OTP confirmation sent to +91 98250 11223.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* System License & Ownership Transfer Tab */}
      {activeTab === 'license' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* License Management */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#800000] dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <Award size={18} />
              <span>Jamavat Masala System License</span>
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                License Serial Key
              </label>
              <input
                type="text"
                readOnly
                value={licenseKey}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                License Tier
              </label>
              <input
                type="text"
                readOnly
                value={licenseType}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Valid Until
              </label>
              <input
                type="text"
                readOnly
                value={licenseExpiry}
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>
          </div>

          {/* Transfer Ownership Form */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-[#800000] dark:text-amber-400 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
              <UserCheck size={18} />
              <span>Transfer ERP Ownership</span>
            </h3>

            {transferSuccess && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                ✓ Ownership transfer invitation sent to {transferEmail}!
              </div>
            )}

            <form onSubmit={handleTransferOwnership} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Owner Email Address
                </label>
                <input
                  type="email"
                  required
                  disabled={!isOwner}
                  placeholder="e.g. newowner@jamavatmasala.com"
                  value={transferEmail}
                  onChange={e => setTransferEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Transfer Justification / Reason
                </label>
                <textarea
                  rows={2}
                  disabled={!isOwner}
                  placeholder="Reason for changing primary owner entity..."
                  value={transferReason}
                  onChange={e => setTransferReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 disabled:opacity-60"
                />
              </div>

              <button
                type="submit"
                disabled={!isOwner}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all ${
                  isOwner
                    ? 'bg-[#800000] hover:bg-[#660000] text-amber-300'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isOwner ? 'Initiate Ownership Transfer' : 'Owner Permission Required'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="max-w-2xl bg-rose-500/5 dark:bg-rose-950/20 border-2 border-rose-300 dark:border-rose-900/50 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex items-center gap-3 text-rose-700 dark:text-rose-400">
            <Trash2 size={24} />
            <div>
              <h3 className="font-black text-base">Danger Zone: Delete Entire ERP</h3>
              <p className="text-xs text-rose-600/80 dark:text-rose-300">
                Wipe all local records, employees, orders, inventory, and restores initial factory configuration.
              </p>
            </div>
          </div>

          {deleteSuccess && (
            <div className="p-3 bg-rose-600 text-white rounded-xl text-xs font-bold">
              ⚡ ERP System wiped! Reloading factory defaults...
            </div>
          )}

          <div className="space-y-3 pt-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Type <span className="font-mono text-rose-600 font-extrabold">DELETE ERP</span> to confirm:
            </label>
            <input
              type="text"
              disabled={!isOwner}
              placeholder="DELETE ERP"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 font-mono font-bold text-rose-600 disabled:opacity-60"
            />

            <button
              type="button"
              disabled={!isOwner || deleteConfirmText !== 'DELETE ERP'}
              onClick={handleDeleteEntireERP}
              className={`w-full py-3 rounded-xl font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-2 ${
                isOwner && deleteConfirmText === 'DELETE ERP'
                  ? 'bg-rose-700 hover:bg-rose-800 text-white cursor-pointer'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <RefreshCw size={14} />
              <span>{isOwner ? 'Wipe Entire ERP System' : 'Owner Permission Required'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
