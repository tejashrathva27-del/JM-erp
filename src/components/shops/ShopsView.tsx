/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Shop & Wholesale Dealers Module
 */

import React, { useState } from 'react';
import {
  Store,
  Search,
  Phone,
  MessageSquare,
  IndianRupee,
  AlertCircle,
  MapPin,
  Trash2,
  CheckCircle2,
  Eye,
  Edit,
  Archive,
  RotateCcw,
  AlertTriangle,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Shop, Order } from '../../types/erp';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { sendShopBalanceWhatsApp } from '../../utils/whatsapp';
import { Toolbar } from '../common/Toolbar';
import { EditShopModal } from '../modals/EditShopModal';

export const ShopsView: React.FC = () => {
  const { shops, deleteShop, archiveShop, restoreShop, openNewModal, orders } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewTab, setViewTab] = useState<'active' | 'archived'>('active');
  const [selectedShopForHistory, setSelectedShopForHistory] = useState<Shop | null>(null);
  const [editingShop, setEditingShop] = useState<Shop | null>(null);
  const [viewingShopProfile, setViewingShopProfile] = useState<Shop | null>(null);

  // Dialog & Toast states for Delete & Archive workflow
  const [shopToDelete, setShopToDelete] = useState<Shop | null>(null);
  const [shopToWarn, setShopToWarn] = useState<Shop | null>(null);
  const [warnActiveOrders, setWarnActiveOrders] = useState<Order[]>([]);
  const [shopToArchiveDirect, setShopToArchiveDirect] = useState<Shop | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Filter Active vs Archived
  const activeShops = shops.filter(s => s.status !== 'Archived');
  const archivedShops = shops.filter(s => s.status === 'Archived');

  const displayedShops = (viewTab === 'active' ? activeShops : archivedShops).filter(
    s =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalOutstanding = activeShops.reduce((acc, s) => acc + s.outstandingAmount, 0);

  // Helper to get active (pending / non-delivered / non-cancelled) orders for a shop
  const getActiveOrdersForShop = (shopId: string): Order[] => {
    return orders.filter(
      o => (o.shopId === shopId || o.shopName === shops.find(s => s.id === shopId)?.name) &&
           o.status !== 'Delivered' &&
           o.status !== 'Cancelled'
    );
  };

  // Trigger Delete flow
  const handleDeleteClick = (s: Shop) => {
    try {
      const activeOrds = getActiveOrdersForShop(s.id);
      if (activeOrds.length > 0) {
        setWarnActiveOrders(activeOrds);
        setShopToWarn(s);
      } else {
        setShopToDelete(s);
      }
    } catch (err) {
      showToast('Error checking shop orders. Please try again.', 'error');
    }
  };

  // Confirm Delete Action
  const handleConfirmDelete = () => {
    if (!shopToDelete) return;
    try {
      deleteShop(shopToDelete.id);
      showToast('Shop deleted successfully.', 'success');
      setShopToDelete(null);
    } catch (err) {
      showToast('Failed to delete shop. Please try again.', 'error');
    }
  };

  // Execute Archive Action
  const handleConfirmArchive = (s: Shop) => {
    try {
      if (archiveShop) {
        archiveShop(s.id);
      } else {
        // Fallback using updateShop
        useApp().updateShop(s.id, { status: 'Archived' });
      }
      showToast('Shop archived successfully.', 'success');
      setShopToWarn(null);
      setShopToArchiveDirect(null);
    } catch (err) {
      showToast('Failed to archive shop.', 'error');
    }
  };

  // Execute Restore Action
  const handleConfirmRestore = (s: Shop) => {
    try {
      if (restoreShop) {
        restoreShop(s.id);
      } else {
        // Fallback using updateShop
        useApp().updateShop(s.id, { status: 'Active' });
      }
      showToast('Shop restored successfully.', 'success');
    } catch (err) {
      showToast('Failed to restore shop.', 'error');
    }
  };

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2.5 transition-all duration-300 animate-in slide-in-from-bottom-5 ${
            toast.type === 'success'
              ? 'bg-slate-900 text-emerald-300 border-emerald-500/50'
              : 'bg-rose-950 text-rose-200 border-rose-500/50'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="ml-2 p-1 text-slate-400 hover:text-white rounded-lg"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Top Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Store className="text-[#800000] dark:text-amber-400" size={22} />
            <span>Shops & Wholesale Dealers</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage kirana accounts, credit limits, outstanding ledgers & WhatsApp direct communication
          </p>
        </div>
        <Toolbar
          newButtonLabel="Add New Shop"
          onNewClick={() => openNewModal('shop')}
          exportData={displayedShops}
          exportFilename="JM_ERP_Shops"
        />
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
            <Store size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Active Registered Dealers</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{activeShops.length}</h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center shrink-0">
            <IndianRupee size={22} />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Outstanding Balance</p>
            <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {formatCurrency(totalOutstanding)}
            </h3>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#800000] to-[#5c0000] text-white shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-200">Payment Collection</p>
            <p className="text-xs font-medium text-slate-200 mt-0.5">Send direct WhatsApp reminders</p>
          </div>
          <button
            onClick={() => openNewModal('payment')}
            className="px-3 py-1.5 rounded-xl bg-amber-400 text-[#800000] font-bold text-xs shadow-xs cursor-pointer active:scale-95"
          >
            Record Payment
          </button>
        </div>
      </div>

      {/* Navigation Tabs (Active vs Archived) & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewTab('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'active'
                ? 'bg-[#800000] text-amber-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Store size={15} />
            <span>Active Shops</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-400/20 text-amber-200 font-extrabold">
              {activeShops.length}
            </span>
          </button>

          <button
            onClick={() => setViewTab('archived')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              viewTab === 'archived'
                ? 'bg-[#800000] text-amber-300 shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Archive size={15} />
            <span>Shop History & Archives</span>
            {archivedShops.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold">
                {archivedShops.length}
              </span>
            )}
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search shop, owner, city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
          />
        </div>
      </div>

      {/* Empty State */}
      {displayedShops.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
          <Store className="mx-auto text-slate-300 dark:text-slate-700" size={48} />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
            {viewTab === 'active' ? 'No active shops found' : 'No archived shops'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {viewTab === 'active'
              ? 'Try adjusting your search criteria or add a new shop account.'
              : 'Shops that have active or completed orders can be archived and restored anytime from here.'}
          </p>
        </div>
      )}

      {/* Shop Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedShops.map(s => {
          const creditRatio = (s.outstandingAmount / s.creditLimit) * 100;
          const isHighCreditRisk = creditRatio >= 80;

          return (
            <div
              key={s.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-[#800000]/40 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                      {s.code}
                    </span>
                    <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">
                      {s.name}
                    </h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getStatusBadgeClass(s.status)}`}>
                    {s.status}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1.5">
                    <strong className="text-slate-800 dark:text-slate-200 font-bold">Owner:</strong> {s.ownerName}
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Phone size={13} className="text-slate-400" /> {s.phone}
                  </p>
                  <p className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">
                      {s.address}, {s.village ? s.village + ', ' : ''}{s.district || s.city}
                    </span>
                  </p>
                  {s.gstNumber && (
                    <p className="text-[11px] text-slate-400 font-mono">GSTIN: {s.gstNumber}</p>
                  )}
                </div>

                {/* Credit Limit & Outstanding Bar */}
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-500">Outstanding:</span>
                    <span className={s.outstandingAmount > 0 ? 'text-rose-600 dark:text-rose-400 font-extrabold' : 'text-emerald-600'}>
                      {formatCurrency(s.outstandingAmount)}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isHighCreditRisk ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, creditRatio)}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>Credit Limit: {formatCurrency(s.creditLimit)}</span>
                    <span>{Math.round(creditRatio)}% used</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: View, Edit, WhatsApp, Archive, Delete / Restore */}
              <div className="grid grid-cols-5 gap-1 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setViewingShopProfile(s)}
                  className="py-2 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-blue-100 transition-all cursor-pointer"
                  title="View Details"
                >
                  <Eye size={14} />
                  <span className="hidden sm:inline">View</span>
                </button>

                <button
                  onClick={() => setEditingShop(s)}
                  className="py-2 rounded-xl bg-amber-50 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1 hover:bg-amber-100 transition-all cursor-pointer"
                  title="Edit Shop"
                >
                  <Edit size={14} />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={() => sendShopBalanceWhatsApp(s)}
                  className="py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs transition-all cursor-pointer"
                  title="WhatsApp Balance Reminder"
                >
                  <MessageSquare size={14} />
                  <span className="hidden sm:inline">WA</span>
                </button>

                {viewTab === 'active' ? (
                  <button
                    onClick={() => setShopToArchiveDirect(s)}
                    className="py-2 rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Archive Shop"
                  >
                    <Archive size={14} />
                    <span className="hidden sm:inline">Archive</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleConfirmRestore(s)}
                    className="py-2 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Restore Shop"
                  >
                    <RotateCcw size={14} />
                    <span className="hidden sm:inline">Restore</span>
                  </button>
                )}

                <button
                  onClick={() => handleDeleteClick(s)}
                  className="py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-400 font-bold text-xs flex items-center justify-center transition-all cursor-pointer"
                  title="Delete Shop"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* REQUIREMENT 2 & 3: Standard Delete Confirmation Modal (When no active orders exist) */}
      {shopToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Trash2 size={20} className="text-rose-600" />
                <span>Delete Shop</span>
              </h3>
              <button
                onClick={() => setShopToDelete(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to delete this shop? This action cannot be undone.
            </p>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                  {shopToDelete.code}
                </span>
                <span className="font-extrabold text-xs text-slate-800 dark:text-white">
                  {shopToDelete.name}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Owner: {shopToDelete.ownerName} • City: {shopToDelete.city}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShopToDelete(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} />
                <span>Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REQUIREMENT 4: Active Orders Warning Modal */}
      {shopToWarn && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-amber-300 dark:border-amber-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-amber-700 dark:text-amber-400 flex items-center gap-2">
                <AlertTriangle size={20} className="text-amber-500 shrink-0" />
                <span>Active Orders Warning</span>
              </h3>
              <button
                onClick={() => setShopToWarn(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-300/60 dark:border-amber-800/60 rounded-2xl text-xs text-amber-900 dark:text-amber-200 font-medium leading-relaxed">
              This shop has active orders. You cannot delete it until all orders are completed.
            </div>

            <div className="space-y-1.5">
              <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                Active Orders ({warnActiveOrders.length}):
              </p>
              <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                {warnActiveOrders.map(o => (
                  <div key={o.id} className="flex items-center justify-between text-[11px] p-1.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs">
                    <span className="font-extrabold text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                    <span className="font-bold text-slate-600 dark:text-slate-300">{o.status}</span>
                    <span className="font-extrabold text-slate-800 dark:text-white">{formatCurrency(o.netTotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShopToWarn(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmArchive(shopToWarn)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Archive size={14} />
                <span>Archive Shop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Direct Archive Confirmation Modal */}
      {shopToArchiveDirect && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-base font-black text-slate-800 dark:text-white flex items-center gap-2">
                <Archive size={20} className="text-amber-500" />
                <span>Archive Shop</span>
              </h3>
              <button
                onClick={() => setShopToArchiveDirect(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
              Are you sure you want to archive <strong>"{shopToArchiveDirect.name}"</strong>? It will be hidden from active dealers and moved to Shop History where it can be restored anytime.
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShopToArchiveDirect(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleConfirmArchive(shopToArchiveDirect)}
                className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5"
              >
                <Archive size={14} />
                <span>Archive Shop</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Shop Modal */}
      {editingShop && (
        <EditShopModal
          shop={editingShop}
          onClose={() => setEditingShop(null)}
        />
      )}

      {/* View Shop Profile Modal */}
      {viewingShopProfile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                  {viewingShopProfile.code}
                </span>
                <h3 className="text-lg font-black text-slate-800 dark:text-white mt-1">
                  {viewingShopProfile.name}
                </h3>
              </div>
              <button
                onClick={() => setViewingShopProfile(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                <div>
                  <span className="text-slate-400 block text-[10px]">Owner / Proprietor</span>
                  <strong className="text-slate-800 dark:text-white">{viewingShopProfile.ownerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Dealer Type</span>
                  <strong className="text-[#800000] dark:text-amber-400">{viewingShopProfile.dealerType || 'Retailer'}</strong>
                </div>
              </div>

              <div className="space-y-1">
                <p><strong>Mobile:</strong> {viewingShopProfile.phone}</p>
                {viewingShopProfile.alternatePhone && <p><strong>Alt Mobile:</strong> {viewingShopProfile.alternatePhone}</p>}
                <p><strong>GSTIN:</strong> {viewingShopProfile.gstNumber || 'URP (Unregistered)'}</p>
                <p><strong>Address:</strong> {viewingShopProfile.address}</p>
                <p><strong>Location:</strong> {viewingShopProfile.village ? viewingShopProfile.village + ', ' : ''}{viewingShopProfile.taluka ? viewingShopProfile.taluka + ', ' : ''}{viewingShopProfile.district || viewingShopProfile.city}, {viewingShopProfile.state || 'Gujarat'} - {viewingShopProfile.pinCode || ''}</p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1">
                <div className="flex justify-between">
                  <span>Credit Limit:</span>
                  <strong className="text-slate-800 dark:text-white">{formatCurrency(viewingShopProfile.creditLimit)}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Outstanding Balance:</span>
                  <strong className="text-rose-600">{formatCurrency(viewingShopProfile.outstandingAmount)}</strong>
                </div>
              </div>

              {viewingShopProfile.notes && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <strong className="block text-[11px]">Notes:</strong>
                  <span>{viewingShopProfile.notes}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  const shop = viewingShopProfile;
                  setViewingShopProfile(null);
                  setEditingShop(shop);
                }}
                className="px-4 py-2 rounded-xl bg-[#800000] text-amber-400 text-xs font-bold"
              >
                Edit Shop Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders History Drawer for Selected Shop */}
      {selectedShopForHistory && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">
                  Order History - {selectedShopForHistory.name}
                </h3>
                <p className="text-xs text-slate-400">Outstanding: {formatCurrency(selectedShopForHistory.outstandingAmount)}</p>
              </div>
              <button
                onClick={() => setSelectedShopForHistory(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2">
              {orders.filter(o => o.shopId === selectedShopForHistory.id).length === 0 ? (
                <p className="text-center py-8 text-xs text-slate-400">No order history recorded for this shop.</p>
              ) : (
                orders
                  .filter(o => o.shopId === selectedShopForHistory.id)
                  .map(o => (
                    <div
                      key={o.id}
                      className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                        <p className="text-slate-500 text-[11px] mt-0.5">{formatDate(o.createdAt)} • {o.items.length} items</p>
                      </div>
                      <div className="text-right">
                        <strong className="text-slate-800 dark:text-white block font-black">{formatCurrency(o.netTotal)}</strong>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadgeClass(o.paymentStatus)}`}>
                          {o.paymentStatus}
                        </span>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
