/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Route Planner Sub-Page
 */

import React, { useState } from 'react';
import { Radio, Navigation, Route, MapPin, Truck, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DeliveryRouteMap } from './DeliveryRouteMap';
import { optimizeDeliverySequence, JAMAVAT_DEPOT } from '../../utils/routeOptimizer';
import { formatCurrency } from '../../utils/formatters';

export const RoutePlanner: React.FC = () => {
  const { orders, employees } = useApp();
  const [selectedStaffId, setSelectedStaffId] = useState<string>('ALL');

  const activeDeliveries = orders.filter(
    o => o.deliveryStatus === 'Out for Delivery' || o.deliveryStatus === 'Assigned' || o.status === 'Packed'
  );

  const deliveryStaffList = employees.filter(
    e => !e.isDeleted && (e.role === 'Delivery Staff' || e.department === 'Logistics & Dispatch')
  );

  const routeSequence = optimizeDeliverySequence(activeDeliveries);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Radio className="text-emerald-500 animate-pulse" size={22} />
            <span>Delivery Route Planner & Live GPS</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            AI-driven multi-stop sequence route optimization from Jamavat Depot to dealer shops
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-bold text-slate-500">Filter Carrier:</label>
          <select
            value={selectedStaffId}
            onChange={e => setSelectedStaffId(e.target.value)}
            className="text-xs p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
          >
            <option value="ALL">All Active Carriers</option>
            {deliveryStaffList.map(s => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[420px]">
            <DeliveryRouteMap
              orders={activeDeliveries}
              depot={JAMAVAT_DEPOT}
            />
          </div>
        </div>

        {/* Route Optimization Sequence */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                <Sparkles size={16} className="text-amber-500" />
                <span>Optimized Route Waypoints</span>
              </h3>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
                {routeSequence.totalDistanceKm} km
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Est. Total Duration: {routeSequence.totalEstimatedMins} mins</p>

            <div className="mt-4 space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-6 h-6 rounded-full bg-[#800000] text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                  D
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-white">Jamavat Masala Central Depot</h4>
                  <p className="text-[10px] text-slate-400">{JAMAVAT_DEPOT.address}</p>
                </div>
              </div>

              {routeSequence.optimizedOrders.map((ord, idx) => (
                <div key={ord.id} className="flex items-center gap-3 relative z-10">
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shrink-0 shadow-xs">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">{ord.shopName} ({ord.orderNumber})</h4>
                    <p className="text-[10px] text-slate-400 truncate">{ord.deliveryAddress || `${ord.shopName}, ${ord.city}`}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => {
              const query = routeSequence.optimizedOrders.map(w => encodeURIComponent(w.deliveryAddress || `${w.shopName}, ${w.city}`)).join('/');
              window.open(`https://www.google.com/maps/dir/${encodeURIComponent(JAMAVAT_DEPOT.address)}/${query}`, '_blank');
            }}
            className="w-full py-3 rounded-2xl bg-[#800000] text-amber-300 font-extrabold text-xs flex items-center justify-center gap-2 shadow-md hover:bg-[#600000] transition-all cursor-pointer"
          >
            <Navigation size={16} />
            <span>Open Multi-Stop Route in Google Maps</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoutePlanner;
