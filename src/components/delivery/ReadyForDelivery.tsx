/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Ready for Delivery Sub-Page
 */

import React, { useState } from 'react';
import {
  PackageCheck,
  CheckCircle2,
  Navigation,
  UserCheck,
  Truck,
  MapPin,
  Phone,
  Search,
  Check,
  UserPlus,
  Send
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/erp';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { MissingShopModal } from './MissingShopModal';
import { handleOrderNavigationClick, resolveOrderNavigation } from '../../utils/shopNavigation';

export const ReadyForDelivery: React.FC = () => {
  const { orders, updateOrder, employees, shops } = useApp();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [missingShopOrder, setMissingShopOrder] = useState<Order | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  const readyOrders = orders.filter(
    o =>
      (o.status === 'Packed' || o.status === 'Confirmed') &&
      (!o.deliveryStatus || o.deliveryStatus === 'Unassigned' || o.deliveryStatus === 'Ready')
  ).filter(
    o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Accept Order Action
  const handleAcceptOrder = (order: Order) => {
    updateOrder(order.id, {
      deliveryStatus: 'Ready',
      status: 'Packed'
    });
    showToast(`Order ${order.orderNumber} accepted for delivery dispatch.`);
  };

  // Assign Delivery Action
  const handleAssignDelivery = (order: Order) => {
    const staffId = selectedStaff[order.id] || deliveryStaffList[0]?.id || user?.id || 'STAFF-001';
    const staffObj = employees.find(e => e.id === staffId);
    const staffName = staffObj ? staffObj.name : user?.name || 'Owner / MD (Delivery Manager)';

    updateOrder(order.id, {
      deliveryStatus: 'Assigned',
      deliveryStaffId: staffId,
      deliveryStaffName: staffName
    });
    showToast(`Order ${order.orderNumber} assigned to ${staffName}.`);
  };

  // Mark Delivered Action
  const handleMarkDelivered = (order: Order) => {
    const now = new Date().toISOString();
    updateOrder(order.id, {
      status: 'Delivered',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Paid',
      deliveredAt: now
    });
    showToast(`Order ${order.orderNumber} marked as DELIVERED.`);
  };

  // Google Maps Navigation Action
  const handleNavigate = (order: Order) => {
    handleOrderNavigationClick(order, shops, {
      onShopDeleted: (ord) => setMissingShopOrder(ord),
      onLocationUnavailable: (shop) => showToast(`Location not available for ${shop.name}.`),
    });
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
            <PackageCheck className="text-amber-500" size={22} />
            <span>Ready for Delivery Orders</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Orders packed and awaiting carrier assignment or direct dispatch
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search order #, shop, city..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
          />
        </div>
      </div>

      {/* Ready Orders List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {readyOrders.map(o => (
          <div
            key={o.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-amber-400/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    {o.orderNumber}
                  </span>
                  <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">{o.shopName}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                  Ready
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{o.deliveryAddress || `${o.shopName}, ${o.city}`}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{o.phone || 'Owner Mobile Registered'}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Items: {o.items?.length || 1} • Total: <strong className="text-slate-800 dark:text-white">{formatCurrency(o.netTotal)}</strong>
                </p>
              </div>

              {/* Staff Select Dropdown if staff exist */}
              {deliveryStaffList.length > 0 && (
                <div className="pt-2">
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Assign Carrier Staff:</label>
                  <select
                    value={selectedStaff[o.id] || deliveryStaffList[0]?.id || ''}
                    onChange={e => setSelectedStaff(prev => ({ ...prev, [o.id]: e.target.value }))}
                    className="w-full text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                  >
                    {deliveryStaffList.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.vehicleType || 'Vehicle'})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Action Buttons: Accept Order, Assign Delivery, Navigate, Mark Delivered */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleAcceptOrder(o)}
                  className="py-2 px-3 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 hover:bg-emerald-100 font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Accept Order</span>
                </button>

                <button
                  onClick={() => handleAssignDelivery(o)}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>Assign Delivery</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {(() => {
                  const navRes = resolveOrderNavigation(o, shops);
                  const isLocUnavailable = navRes.status === 'LOCATION_UNAVAILABLE';
                  return (
                    <button
                      onClick={() => handleNavigate(o)}
                      title={isLocUnavailable ? 'Location not available.' : undefined}
                      className={`py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all ${
                        isLocUnavailable
                          ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 hover:bg-slate-200'
                          : 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 hover:bg-blue-100'
                      }`}
                    >
                      <Navigation size={14} />
                      <span>{isLocUnavailable ? 'Location Unavailable' : 'Navigate'}</span>
                    </button>
                  );
                })()}

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

      {readyOrders.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <PackageCheck className="mx-auto text-slate-300 dark:text-slate-700" size={44} />
          <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No Orders Currently Ready for Delivery</h3>
          <p className="text-xs text-slate-400">All orders are either assigned, in-transit, or delivered.</p>
        </div>
      )}

      {/* Missing Shop Modal */}
      {missingShopOrder && (
        <MissingShopModal
          order={missingShopOrder}
          onClose={() => setMissingShopOrder(null)}
          onShopReassigned={() => showToast('Order successfully reassigned to active shop.')}
        />
      )}
    </div>
  );
};

export default ReadyForDelivery;
