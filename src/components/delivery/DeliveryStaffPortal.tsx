/**
 * Jamavat Masala ERP - Mobile-First Delivery Staff Portal
 */

import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle2,
  Navigation,
  Phone,
  MessageSquare,
  Route,
  UserCheck,
  RotateCcw,
  Clock,
  Compass,
  MapPin,
  FileCheck2,
  User,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Award
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { Order } from '../../types/erp';
import {
  getGoogleMapsNavigationUrl,
  getMultiStopDirectionsUrl,
  optimizeDeliverySequence
} from '../../utils/routeOptimizer';
import { DeliveryProofModal } from './DeliveryProofModal';
import { DeliveryRouteMap } from './DeliveryRouteMap';

export const DeliveryStaffPortal: React.FC = () => {
  const { user } = useAuth();
  const {
    orders,
    acceptOrderForDelivery,
    startOrderNavigation,
    markOrderReachedShop,
    completeOrderDelivery,
    optimizeDeliveryRouteForStaff
  } = useApp();

  const [activeTab, setActiveTab] = useState<'ready' | 'assigned' | 'route' | 'history' | 'profile'>('assigned');
  const [selectedProofOrder, setSelectedProofOrder] = useState<Order | null>(null);

  const staffId = user?.uid || 'emp-104';
  const staffName = user?.displayName || 'Mahesh Solanki';

  // Filter orders
  const readyOrders = orders.filter(
    o => o.deliveryStatus === 'Ready for Delivery' || (o.status === 'Ready for Delivery' && !o.assignedToStaffId)
  );

  const myAssignedOrders = orders
    .filter(
      o => o.assignedToStaffId === staffId && o.deliveryStatus !== 'Delivered' && o.deliveryStatus !== 'Cancelled'
    )
    .sort((a, b) => (a.deliverySequence || 99) - (b.deliverySequence || 99));

  const myDeliveredToday = orders.filter(
    o => o.assignedToStaffId === staffId && o.deliveryStatus === 'Delivered'
  );

  const totalCollectedToday = myDeliveredToday.reduce((acc, o) => acc + o.netTotal, 0);

  // Route calculation metrics
  const routeOptimization = optimizeDeliverySequence(myAssignedOrders);

  const handleAccept = (orderId: string) => {
    acceptOrderForDelivery(orderId, staffId, staffName);
    setActiveTab('assigned');
  };

  const handleStartNavigation = (order: Order) => {
    startOrderNavigation(order.id);
    const navUrl = getGoogleMapsNavigationUrl(order);
    window.open(navUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOptimize = () => {
    optimizeDeliveryRouteForStaff(staffId);
  };

  return (
    <div className="space-y-4 pb-20 max-w-5xl mx-auto">
      {/* Top Banner & Quick Stats */}
      <div className="p-4 bg-gradient-to-r from-[#800000] via-[#990000] to-[#660000] text-white rounded-2xl shadow-xl border border-[#660000]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={staffName}
              className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base text-amber-300">{staffName}</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-400 text-slate-950">
                  Delivery Partner
                </span>
              </div>
              <p className="text-xs text-amber-100/90 font-medium">Jamavat Masala Logistics Division</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-black/20 p-2 rounded-xl border border-white/10 text-xs">
            <div className="text-center px-2">
              <span className="block font-black text-amber-300 text-sm">{myAssignedOrders.length}</span>
              <span className="text-[10px] text-amber-100">Assigned</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-center px-2">
              <span className="block font-black text-emerald-300 text-sm">{myDeliveredToday.length}</span>
              <span className="text-[10px] text-amber-100">Delivered</span>
            </div>
            <div className="h-6 w-px bg-white/20"></div>
            <div className="text-center px-2">
              <span className="block font-black text-amber-300 text-sm">₹{(totalCollectedToday / 1000).toFixed(1)}k</span>
              <span className="text-[10px] text-amber-100">Collected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto">
        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'assigned'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Truck size={15} />
          <span>Assigned ({myAssignedOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('ready')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'ready'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Package size={15} />
          <span>Ready ({readyOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('route')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'route'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Route size={15} />
          <span>Route Map</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 min-w-[120px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'history'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>History ({myDeliveredToday.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 min-w-[100px] flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl transition-all ${
            activeTab === 'profile'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <User size={15} />
          <span>Profile</span>
        </button>
      </div>

      {/* TAB 1: ASSIGNED ORDERS */}
      {activeTab === 'assigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Truck size={18} className="text-[#800000] dark:text-amber-400" />
              My Assigned Deliveries ({myAssignedOrders.length})
            </h3>

            {myAssignedOrders.length > 1 && (
              <button
                onClick={handleOptimize}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-sm active:scale-95"
              >
                <Compass size={14} />
                <span>Optimize Sequence</span>
              </button>
            )}
          </div>

          {myAssignedOrders.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Package size={40} className="mx-auto text-slate-400 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No active assigned deliveries</h4>
              <p className="text-xs text-slate-500 mb-4">Accept orders from "Ready for Delivery" tab to begin your route.</p>
              <button
                onClick={() => setActiveTab('ready')}
                className="px-4 py-2 text-xs font-bold rounded-xl bg-[#800000] text-amber-300"
              >
                View Ready Orders ({readyOrders.length})
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {myAssignedOrders.map((order, idx) => {
                const stage = order.deliveryStatus || 'Assigned';
                const isOutForDelivery = stage === 'Out for Delivery';
                const isReached = stage === 'Reached Shop';

                return (
                  <div
                    key={order.id}
                    className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 transition-all shadow-md ${
                      isReached
                        ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                        : isOutForDelivery
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {/* Header Badge */}
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#800000] text-amber-300 font-extrabold text-xs flex items-center justify-center">
                          {order.deliverySequence || idx + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                            {order.shopName}
                          </h4>
                          <p className="text-[11px] text-slate-500">Order #{order.orderNumber}</p>
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 text-[11px] font-extrabold rounded-full ${
                          isReached
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                            : isOutForDelivery
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 animate-pulse'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {stage}
                      </span>
                    </div>

                    {/* Shop Location & Customer Details */}
                    <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 mb-3">
                      <div className="flex items-start gap-2">
                        <User size={15} className="shrink-0 text-amber-500 mt-0.5" />
                        <div>
                          <span className="font-bold">{order.shopOwnerName || 'Owner'}</span>
                          <span className="text-slate-500 text-[11px] block">{order.shopPhone}</span>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <MapPin size={15} className="shrink-0 text-[#800000] dark:text-amber-400 mt-0.5" />
                        <div>
                          <span>{order.shopAddress}</span>
                          <span className="text-[11px] text-slate-500 block">
                            Village: <strong>{order.village || 'N/A'}</strong> | Taluka: <strong>{order.taluka || 'N/A'}</strong> | District: <strong>{order.district || 'N/A'}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs">
                        <span>Items: <strong>{order.items.length} Products</strong></span>
                        <span>Total Payable: <strong className="text-amber-600 dark:text-amber-400 font-extrabold text-sm">₹{order.netTotal.toLocaleString('en-IN')}</strong></span>
                      </div>
                    </div>

                    {/* Timeline Progress Bar */}
                    <div className="py-2 border-t border-b border-slate-100 dark:border-slate-800 my-3">
                      <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span className={order.acceptedAt ? 'text-amber-600 dark:text-amber-400' : ''}>1. Accepted</span>
                        <span className={order.navigationStartedAt ? 'text-amber-600 dark:text-amber-400' : ''}>2. Driving</span>
                        <span className={order.reachedShopAt ? 'text-emerald-600 dark:text-emerald-400' : ''}>3. Reached</span>
                        <span>4. Delivered</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                        <div className={`h-full bg-amber-500 ${order.acceptedAt ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full bg-amber-500 ${order.navigationStartedAt ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full bg-emerald-500 ${order.reachedShopAt ? 'w-1/4' : 'w-0'}`}></div>
                        <div className={`h-full bg-emerald-600 ${order.deliveredAt ? 'w-1/4' : 'w-0'}`}></div>
                      </div>
                    </div>

                    {/* Sticky / One-Tap Actions Bar */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      <a
                        href={`tel:${order.shopPhone}`}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 transition-all active:scale-95"
                      >
                        <Phone size={15} className="text-emerald-600" />
                        <span>Call</span>
                      </a>

                      <a
                        href={`https://wa.me/91${order.shopPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                          `Hello ${order.shopOwnerName || order.shopName}, Jamavat Masala delivery partner is on the way with your order #${order.orderNumber} (₹${order.netTotal}).`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 transition-all active:scale-95"
                      >
                        <MessageSquare size={15} className="text-emerald-500" />
                        <span>WhatsApp</span>
                      </a>

                      <button
                        onClick={() => handleStartNavigation(order)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 shadow-md transition-all active:scale-95"
                      >
                        <Navigation size={15} />
                        <span>Navigate</span>
                      </button>

                      {isReached ? (
                        <button
                          onClick={() => setSelectedProofOrder(order)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all active:scale-95"
                        >
                          <FileCheck2 size={15} />
                          <span>Deliver & Proof</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => markOrderReachedShop(order.id)}
                          className="flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-md transition-all active:scale-95"
                        >
                          <CheckCircle2 size={15} />
                          <span>Reached Shop</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: READY FOR DELIVERY */}
      {activeTab === 'ready' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Package size={18} className="text-[#800000] dark:text-amber-400" />
            Ready for Delivery Orders ({readyOrders.length})
          </h3>

          {readyOrders.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 size={40} className="mx-auto text-emerald-500 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">All orders assigned!</h4>
              <p className="text-xs text-slate-500">There are no pending unassigned orders right now.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {readyOrders.map(order => (
                <div
                  key={order.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{order.shopName}</h4>
                      <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                      Ready for Delivery
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                    <p>📍 {order.shopAddress}</p>
                    <p>Phone: <strong>{order.shopPhone}</strong></p>
                    <p>Total Amount: <strong className="text-amber-600 dark:text-amber-400">₹{order.netTotal.toLocaleString('en-IN')}</strong></p>
                  </div>

                  <button
                    onClick={() => handleAccept(order.id)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-extrabold rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 shadow-md transition-all active:scale-95"
                  >
                    <UserCheck size={16} />
                    <span>Accept Delivery Order</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ROUTE PLANNER & MAP */}
      {activeTab === 'route' && (
        <div className="space-y-4">
          <DeliveryRouteMap
            orders={myAssignedOrders}
            onOptimizeRoute={handleOptimize}
            totalDistanceKm={routeOptimization.totalDistanceKm}
            totalDurationMins={routeOptimization.totalEstimatedMins}
          />
        </div>
      )}

      {/* TAB 4: DELIVERY HISTORY */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-500" />
            Delivered Today ({myDeliveredToday.length})
          </h3>

          {myDeliveredToday.length === 0 ? (
            <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <Clock size={40} className="mx-auto text-slate-400 mb-2" />
              <h4 className="font-bold text-slate-700 dark:text-slate-300">No completed deliveries today</h4>
              <p className="text-xs text-slate-500">Deliveries completed today will show POD proof here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myDeliveredToday.map(order => (
                <div
                  key={order.id}
                  className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">{order.shopName}</h4>
                      <p className="text-xs text-slate-500">Order #{order.orderNumber}</p>
                    </div>
                    <span className="px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                      <CheckCircle2 size={13} /> Delivered
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Delivered at: <strong>{order.deliveredAt ? new Date(order.deliveredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Today'}</strong></span>
                    <span>Received By: <strong>{order.deliveryProof?.receivedBy || 'Store Owner'}</strong></span>
                    <span>Amount: <strong className="text-emerald-600 dark:text-emerald-400">₹{order.netTotal.toLocaleString('en-IN')}</strong></span>
                  </div>

                  {order.deliveryProof?.signatureUrl && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                      <span className="text-[10px] font-bold text-slate-500 block mb-1">Customer Signature Proof:</span>
                      <img src={order.deliveryProof.signatureUrl} alt="Customer Signature" className="h-12 object-contain" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: MY PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'}
              alt={staffName}
              className="w-16 h-16 rounded-full object-cover border-2 border-amber-400 shadow-md"
            />
            <div>
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">{staffName}</h3>
              <p className="text-xs text-slate-500">Employee Code: {staffId}</p>
              <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-full bg-amber-400 text-slate-950 mt-1">
                Senior Delivery Partner
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Assigned Vehicle</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">GJ-07-AX-4890 (Tata Ace)</span>
            </div>
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="text-[11px] text-slate-500 block">Delivery Zone</span>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200">Central Gujarat Route</span>
            </div>
          </div>
        </div>
      )}

      {/* Proof Modal */}
      {selectedProofOrder && (
        <DeliveryProofModal
          order={selectedProofOrder}
          isOpen={!!selectedProofOrder}
          onClose={() => setSelectedProofOrder(null)}
          onSubmitProof={(proof) => completeOrderDelivery(selectedProofOrder.id, proof)}
        />
      )}
    </div>
  );
};
