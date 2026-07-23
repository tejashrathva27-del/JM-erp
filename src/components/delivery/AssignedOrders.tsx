/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Assigned Orders Sub-Page
 */

import React, { useState } from 'react';
import {
  UserCheck,
  Truck,
  Navigation,
  CheckCircle2,
  RefreshCw,
  MapPin,
  Phone,
  Search,
  User
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/erp';
import { formatCurrency } from '../../utils/formatters';
import { MissingShopModal } from './MissingShopModal';
import { handleOrderNavigationClick, resolveOrderNavigation } from '../../utils/shopNavigation';

export const AssignedOrders: React.FC = () => {
  const { orders, updateOrder, employees, shops } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [reassigningId, setReassigningId] = useState<string | null>(null);
  const [newStaffId, setNewStaffId] = useState<string>('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [missingShopOrder, setMissingShopOrder] = useState<Order | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  const assignedOrders = orders.filter(
    o => o.deliveryStatus === 'Assigned' || (o.deliveryStaffId && o.status !== 'Delivered' && o.deliveryStatus !== 'Out for Delivery')
  ).filter(
    o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.deliveryStaffName && o.deliveryStaffName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Trigger Out for Delivery
  const handleStartDelivery = (order: Order) => {
    updateOrder(order.id, {
      deliveryStatus: 'Out for Delivery',
      dispatchedAt: new Date().toISOString()
    });
    showToast(`Order ${order.orderNumber} is now OUT FOR DELIVERY.`);
  };

  // Reassign Order
  const handleReassign = (order: Order) => {
    if (!newStaffId) return;
    const staffObj = employees.find(e => e.id === newStaffId);
    const staffName = staffObj ? staffObj.name : 'Delivery Staff';

    updateOrder(order.id, {
      deliveryStaffId: newStaffId,
      deliveryStaffName: staffName
    });
    setReassigningId(null);
    showToast(`Order ${order.orderNumber} reassigned to ${staffName}.`);
  };

  // Mark Delivered
  const handleMarkDelivered = (order: Order) => {
    updateOrder(order.id, {
      status: 'Delivered',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Paid',
      deliveredAt: new Date().toISOString()
    });
    showToast(`Order ${order.orderNumber} marked as DELIVERED.`);
  };

  // Google Maps Navigation Action
  const handleNavigate = (order: Order) => {
    const query = encodeURIComponent(`${order.shopName}, ${order.deliveryAddress || order.city}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-amber-300 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border border-amber-500/30 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <UserCheck className="text-blue-500" size={22} />
            <span>Assigned Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Orders currently allocated to delivery carriers awaiting transit dispatch
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order, shop, driver..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
          />
        </div>
      </div>

      {/* Grid of Assigned Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assignedOrders.map(o => (
          <div
            key={o.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-blue-400/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    {o.orderNumber}
                  </span>
                  <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">{o.shopName}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-200">
                  Assigned
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <User size={13} /> Carrier:
                  </span>
                  <span className="font-extrabold text-slate-800 dark:text-amber-300">
                    {o.deliveryStaffName || 'Assigned Carrier'}
                  </span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{o.deliveryAddress || `${o.shopName}, ${o.city}`}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{o.phone || 'Contact Available'}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Total Amount: <strong className="text-slate-800 dark:text-white">{formatCurrency(o.netTotal)}</strong>
                </p>
              </div>

              {/* Reassign UI */}
              {reassigningId === o.id && (
                <div className="pt-2 p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20 space-y-2">
                  <label className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 block">Select New Driver:</label>
                  <select
                    value={newStaffId}
                    onChange={e => setNewStaffId(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 font-bold"
                  >
                    <option value="">-- Choose Staff --</option>
                    {deliveryStaffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleReassign(o)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-extrabold text-xs"
                    >
                      Confirm Reassign
                    </button>
                    <button
                      onClick={() => setReassigningId(null)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 font-bold text-xs"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleStartDelivery(o)}
                  className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Truck size={14} />
                  <span>Start Delivery</span>
                </button>

                <button
                  onClick={() => {
                    setReassigningId(o.id);
                    setNewStaffId(deliveryStaffList[0]?.id || '');
                  }}
                  className="py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Reassign</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigate(o)}
                  className="py-2 px-3 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>Navigate</span>
                </button>

                <button
                  onClick={() => handleMarkDelivered(o)}
                  className="py-2 px-3 rounded-xl bg-[#800000] text-amber-300 hover:bg-[#600000] font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 size={14} />
                  <span>Mark Delivered</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {assignedOrders.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <UserCheck className="mx-auto text-slate-300 dark:text-slate-700" size={44} />
          <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No Assigned Orders</h3>
          <p className="text-xs text-slate-400">All ready orders can be assigned from the Ready for Delivery page.</p>
        </div>
      )}
    </div>
  );
};

export default AssignedOrders;
