/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Out for Delivery Sub-Page
 */

import React, { useState } from 'react';
import {
  Truck,
  Navigation,
  CheckCircle2,
  MapPin,
  Phone,
  Search,
  Radio,
  Camera,
  FileCheck2,
  Clock
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types/erp';
import { formatCurrency } from '../../utils/formatters';
import { DeliveryProofModal } from './DeliveryProofModal';

export const OutForDelivery: React.FC = () => {
  const { orders, updateOrder } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [podModalOrder, setPodModalOrder] = useState<Order | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const outForDeliveryOrders = orders.filter(
    o => o.deliveryStatus === 'Out for Delivery' || o.status === 'Dispatched' || o.status === 'In Transit'
  ).filter(
    o =>
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.deliveryStaffName && o.deliveryStaffName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Mark Delivered directly
  const handleMarkDelivered = (order: Order) => {
    updateOrder(order.id, {
      status: 'Delivered',
      deliveryStatus: 'Delivered',
      paymentStatus: 'Paid',
      deliveredAt: new Date().toISOString()
    });
    showToast(`Order ${order.orderNumber} successfully marked as DELIVERED.`);
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
            <Truck className="text-purple-500 animate-pulse" size={22} />
            <span>Out for Delivery (In-Transit)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Active shop dispatches currently en route with carrier drivers
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

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {outForDeliveryOrders.map(o => (
          <div
            key={o.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-purple-500/50 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-extrabold text-[#800000] dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40 px-2 py-0.5 rounded-md">
                    {o.orderNumber}
                  </span>
                  <h3 className="text-base font-black text-slate-800 dark:text-white mt-1">{o.shopName}</h3>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-200 flex items-center gap-1">
                  <Radio size={10} className="animate-ping text-purple-600" />
                  In Transit
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span>Carrier Staff:</span>
                  <span>{o.deliveryStaffName || 'Assigned Carrier'}</span>
                </div>
                {o.dispatchedAt && (
                  <p className="text-[10px] text-purple-700 dark:text-purple-300 flex items-center gap-1">
                    <Clock size={11} /> Dispatched at {new Date(o.dispatchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <p className="flex items-center gap-1.5">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  <span className="truncate">{o.deliveryAddress || `${o.shopName}, ${o.city}`}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400 shrink-0" />
                  <span>{o.phone || 'Contact Verified'}</span>
                </p>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Net Amount: <strong className="text-slate-800 dark:text-white">{formatCurrency(o.netTotal)}</strong>
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleNavigate(o)}
                  className="py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Navigation size={14} />
                  <span>GPS Map</span>
                </button>

                <button
                  onClick={() => setPodModalOrder(o)}
                  className="py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                >
                  <Camera size={14} />
                  <span>Proof of Delivery</span>
                </button>
              </div>

              <button
                onClick={() => handleMarkDelivered(o)}
                className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>Mark Delivered (Confirm Payment)</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {outForDeliveryOrders.length === 0 && (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-2">
          <Truck className="mx-auto text-slate-300 dark:text-slate-700" size={44} />
          <h3 className="text-sm font-extrabold text-slate-700 dark:text-slate-300">No In-Transit Deliveries Right Now</h3>
          <p className="text-xs text-slate-400">Trigger 'Start Delivery' on assigned orders to move them out for delivery.</p>
        </div>
      )}

      {/* Proof of Delivery Modal */}
      {podModalOrder && (
        <DeliveryProofModal
          order={podModalOrder}
          onClose={() => setPodModalOrder(null)}
          onSuccess={() => {
            setPodModalOrder(null);
            showToast(`Proof of delivery saved for ${podModalOrder.orderNumber}!`);
          }}
        />
      )}
    </div>
  );
};

export default OutForDelivery;
