/**
 * Jamavat Masala ERP - Interactive Delivery Route & Map Visualizer
 */

import React, { useState } from 'react';
import { MapPin, Navigation, Compass, ExternalLink, Route, Phone, Store, Layers } from 'lucide-react';
import { Order } from '../../types/erp';
import {
  JAMAVAT_DEPOT,
  getGoogleMapsNavigationUrl,
  getMultiStopDirectionsUrl,
  calculateHaversineDistance
} from '../../utils/routeOptimizer';

interface DeliveryRouteMapProps {
  orders: Order[];
  onSelectOrder?: (order: Order) => void;
  onOptimizeRoute?: () => void;
  totalDistanceKm?: number;
  totalDurationMins?: number;
}

export const DeliveryRouteMap: React.FC<DeliveryRouteMapProps> = ({
  orders,
  onSelectOrder,
  onOptimizeRoute,
  totalDistanceKm,
  totalDurationMins
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [mapStyle, setMapStyle] = useState<'street' | 'satellite'>('street');

  // Multi-stop direct Google Maps navigation URL
  const fullRouteNavUrl = getMultiStopDirectionsUrl(orders);

  // Bounds & projection logic for interactive SVG route view
  const allLats = [JAMAVAT_DEPOT.latitude, ...orders.map(o => o.latitude || JAMAVAT_DEPOT.latitude)];
  const allLngs = [JAMAVAT_DEPOT.longitude, ...orders.map(o => o.longitude || JAMAVAT_DEPOT.longitude)];

  const minLat = Math.min(...allLats) - 0.1;
  const maxLat = Math.max(...allLats) + 0.1;
  const minLng = Math.min(...allLngs) - 0.1;
  const maxLng = Math.max(...allLngs) + 0.1;

  // Convert lat/lng to SVG percentage coordinates
  const projectCoords = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 1)) * 88 + 6;
    const y = (1 - (lat - minLat) / (maxLat - minLat || 1)) * 82 + 9;
    return { x, y };
  };

  const depotPos = projectCoords(JAMAVAT_DEPOT.latitude, JAMAVAT_DEPOT.longitude);

  return (
    <div className="space-y-4">
      {/* Route Control Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#800000] text-amber-300">
            <Route size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100">
              Delivery Route Map & Sequence
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Starting point: <span className="font-semibold text-amber-600 dark:text-amber-400">Jamavat Central Depot (Anand)</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onOptimizeRoute && (
            <button
              onClick={onOptimizeRoute}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-md active:scale-95"
            >
              <Compass size={16} />
              <span>🗺 Optimize Shortest Route</span>
            </button>
          )}

          <a
            href={fullRouteNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 transition-all shadow-md active:scale-95"
          >
            <Navigation size={15} />
            <span>Open All Stops in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Metrics Bar */}
      {(totalDistanceKm !== undefined || totalDurationMins !== undefined) && (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Total Stops</span>
            <span className="text-lg font-black text-slate-800 dark:text-slate-100">{orders.length} Shops</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Est. Total Distance</span>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">{totalDistanceKm || 0} km</span>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-center">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">Est. Driving Time</span>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">{totalDurationMins || 0} mins</span>
          </div>
        </div>
      )}

      {/* Interactive Map Canvas Container */}
      <div className="relative w-full h-[380px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 shadow-xl">
        {/* Map Background Style Toggle */}
        <div className="absolute top-3 right-3 z-20 flex items-center bg-slate-950/80 backdrop-blur-md rounded-xl p-1 border border-white/10">
          <button
            onClick={() => setMapStyle('street')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              mapStyle === 'street' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Street Map
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
              mapStyle === 'satellite' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
            }`}
          >
            Satellite
          </button>
        </div>

        {/* Legend */}
        <div className="absolute top-3 left-3 z-20 bg-slate-950/85 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10 text-white text-[11px] space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block animate-pulse"></span>
            <span>Factory Depot (Anand)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block"></span>
            <span>Delivery Stops (Sequence)</span>
          </div>
        </div>

        {/* SVG Route Visualization */}
        <svg className="w-full h-full absolute inset-0">
          {/* Background Map Grid Pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={mapStyle === 'satellite' ? '#0b1329' : '#0f172a'} />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Polyline Path Connecting Sequential Stops */}
          {orders.length > 0 && (
            <polyline
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              className="animate-pulse"
              points={`${depotPos.x}%,${depotPos.y}% ` + orders.map(o => {
                const pos = projectCoords(o.latitude || JAMAVAT_DEPOT.latitude, o.longitude || JAMAVAT_DEPOT.longitude);
                return `${pos.x}%,${pos.y}%`;
              }).join(' ')}
            />
          )}

          {/* Depot Location Pin */}
          <g transform={`translate(${depotPos.x * 3.5}, ${depotPos.y * 2.8})`}>
            {/* Handled via absolute overlay pins for crisp rendering */}
          </g>
        </svg>

        {/* Depot Pin Overlay */}
        <div
          style={{ left: `${depotPos.x}%`, top: `${depotPos.y}%` }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group cursor-pointer"
          title="Jamavat Masala Central Depot"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping"></span>
            <div className="w-7 h-7 rounded-full bg-[#800000] border-2 border-amber-300 text-amber-300 font-extrabold text-[10px] flex items-center justify-center shadow-lg">
              HQ
            </div>
          </div>
        </div>

        {/* Stop Markers Overlays */}
        {orders.map((order, index) => {
          const lat = order.latitude || JAMAVAT_DEPOT.latitude;
          const lng = order.longitude || JAMAVAT_DEPOT.longitude;
          const pos = projectCoords(lat, lng);
          const isSelected = selectedOrder?.id === order.id;
          const seqNum = order.deliverySequence || index + 1;

          return (
            <div
              key={order.id}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onClick={() => {
                setSelectedOrder(order);
                if (onSelectOrder) onSelectOrder(order);
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-15 cursor-pointer transition-all hover:scale-125"
            >
              <div
                className={`relative flex items-center justify-center rounded-full shadow-2xl transition-all ${
                  isSelected
                    ? 'w-9 h-9 bg-amber-400 text-slate-950 border-2 border-white ring-4 ring-amber-400/50 scale-110'
                    : 'w-7 h-7 bg-emerald-500 text-slate-950 border-2 border-slate-900'
                }`}
              >
                <span className="font-extrabold text-xs">{seqNum}</span>
              </div>
              
              <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-950/90 text-white px-2 py-0.5 rounded text-[10px] font-bold border border-white/10 shadow-md pointer-events-none">
                {order.shopName}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Order Drawer Details */}
      {selectedOrder && (
        <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-500/50 shadow-md flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1 max-w-md">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-xs font-extrabold rounded-full bg-amber-400 text-slate-950">
                Stop #{selectedOrder.deliverySequence || 1}
              </span>
              <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Store size={15} className="text-[#800000] dark:text-amber-400" />
                {selectedOrder.shopName}
              </h4>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-400">
              📍 {selectedOrder.shopAddress} ({selectedOrder.village || selectedOrder.district || 'Gujarat'})
            </p>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1">
              <span>Customer: <strong className="text-slate-700 dark:text-slate-200">{selectedOrder.shopOwnerName || 'Owner'}</strong></span>
              <span>Amount: <strong className="text-amber-600 dark:text-amber-400">₹{selectedOrder.netTotal.toLocaleString('en-IN')}</strong></span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`tel:${selectedOrder.shopPhone}`}
              className="flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100"
            >
              <Phone size={14} />
              <span>Call</span>
            </a>

            <a
              href={getGoogleMapsNavigationUrl(selectedOrder)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md active:scale-95"
            >
              <Navigation size={14} />
              <span>Navigate Here</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
