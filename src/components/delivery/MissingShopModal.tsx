/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Missing / Deleted Shop Modal for Orders
 */

import React, { useState } from 'react';
import { AlertTriangle, X, Store, Check, Search, ArrowRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, Shop } from '../../types/erp';

interface MissingShopModalProps {
  order: Order;
  onClose: () => void;
  onShopReassigned?: (updatedOrder: Order) => void;
}

export const MissingShopModal: React.FC<MissingShopModalProps> = ({
  order,
  onClose,
  onShopReassigned
}) => {
  const { shops, updateOrder } = useApp();
  const [isSelectingShop, setIsSelectingShop] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedShopId, setSelectedShopId] = useState<string>('');

  const activeShops = shops.filter(
    s => s.status !== 'Archived' &&
      (s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
       s.code.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleConfirmReassign = () => {
    if (!selectedShopId) return;
    const targetShop = shops.find(s => s.id === selectedShopId);
    if (!targetShop) return;

    const updatedData: Partial<Order> = {
      shopId: targetShop.id,
      shopName: targetShop.name,
      shopOwnerName: targetShop.ownerName,
      shopPhone: targetShop.phone,
      shopAddress: targetShop.address,
      city: targetShop.city,
      latitude: targetShop.latitude,
      longitude: targetShop.longitude,
      googleMapsLink: targetShop.googleMapsLink
    };

    updateOrder(order.id, updatedData);
    const updatedOrder = { ...order, ...updatedData };
    if (onShopReassigned) {
      onShopReassigned(updatedOrder);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-6 space-y-5">
        {/* Header Icon */}
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <AlertTriangle size={26} />
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            This shop no longer exists.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Order <strong className="text-[#800000] dark:text-amber-400">{order.orderNumber}</strong> was associated with{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">{order.shopName}</span>, which has been removed or archived. Navigation and dispatch references require an active shop.
          </p>
        </div>

        {/* Selecting another shop mode */}
        {isSelectingShop ? (
          <div className="space-y-3 pt-2">
            <div className="relative">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search active shop by name or city..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
              />
            </div>

            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {activeShops.map(s => (
                <div
                  key={s.id}
                  onClick={() => setSelectedShopId(s.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between text-xs ${
                    selectedShopId === s.id
                      ? 'bg-amber-500/10 border-amber-500 text-slate-900 dark:text-white font-bold'
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-extrabold">{s.name}</p>
                    <p className="text-[10px] text-slate-400">{s.city} • {s.address}</p>
                  </div>
                  {selectedShopId === s.id && <Check size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />}
                </div>
              ))}
              {activeShops.length === 0 && (
                <p className="p-4 text-center text-xs text-slate-400">No active shops found.</p>
              )}
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsSelectingShop(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                disabled={!selectedShopId}
                onClick={handleConfirmReassign}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#800000] hover:bg-[#600000] text-amber-300 font-extrabold text-xs transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1"
              >
                <span>Save & Reassign</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : (
          /* Main Action Buttons: Cancel and Select Another Shop */
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-extrabold text-xs transition-all cursor-pointer text-center"
            >
              Cancel
            </button>
            <button
              onClick={() => setIsSelectingShop(true)}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-[#800000] hover:bg-[#600000] text-amber-300 font-extrabold text-xs transition-all shadow-md cursor-pointer flex items-center justify-center gap-1.5 text-center"
            >
              <Store size={15} />
              <span>Select Another Shop</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MissingShopModal;
