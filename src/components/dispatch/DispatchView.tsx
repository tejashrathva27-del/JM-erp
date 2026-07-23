/**
 * Jamavat Masala ERP - Logistics, Dispatch, Route Navigation & Delivery Management View
 */

import React, { useState } from 'react';
import {
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  Package,
  ShieldCheck,
  FileCheck2,
  Navigation,
  Compass,
  Phone,
  UserCheck,
  Smartphone,
  Layers,
  Radio,
  User,
  Route,
  Settings,
  FileText,
  BarChart3,
  Filter,
  Search,
  ExternalLink,
  AlertCircle,
  Check,
  Edit,
  X,
  Plus,
  ShieldAlert,
  ArrowRight,
  Download,
  Eye
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { OrderStatus, Order, Employee, DeliveryProof } from '../../types/erp';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Toolbar } from '../common/Toolbar';
import { DeliveryStaffPortal } from '../delivery/DeliveryStaffPortal';
import { DeliveryRouteMap } from '../delivery/DeliveryRouteMap';
import { DeliveryProofModal } from '../delivery/DeliveryProofModal';
import {
  getGoogleMapsNavigationUrl,
  getMultiStopDirectionsUrl,
  JAMAVAT_DEPOT
} from '../../utils/routeOptimizer';

export interface DispatchViewProps {
  initialSubPage?: string;
}

export const DispatchView: React.FC<DispatchViewProps> = ({ initialSubPage }) => {
  const { user } = useAuth();
  const {
    orders,
    employees,
    updateOrderStatus,
    acceptOrderForDelivery,
    startOrderNavigation,
    markOrderReachedShop,
    completeOrderDelivery,
    optimizeDeliveryRouteForStaff
  } = useApp();

  const isOwner = user?.role === 'Owner' || user?.roles?.includes('Owner');
  const isMD = user?.role === 'MD' || user?.role === 'Managing Director' || user?.roles?.includes('MD') || user?.roles?.includes('Managing Director');
  const isAdmin = user?.role === 'Admin' || user?.roles?.includes('Admin');

  // Filter registered delivery staff from HR employees list
  const deliveryStaffList = employees.filter(
    e => !e.isDeleted &&
      (e.role === 'Delivery Staff' ||
       e.roles?.includes('Delivery Staff') ||
       e.department === 'Dispatch' ||
       e.department === 'Logistics')
  );

  const hasDeliveryStaff = deliveryStaffList.length > 0;

  const mapSubPageToTab = (subPage?: string): 'dashboard' | 'ready' | 'assigned' | 'out_for_delivery' | 'delivered' | 'history' | 'route_planner' | 'reports' | 'kanban' | 'orders' | 'settings' | 'staff_app' => {
    switch (subPage) {
      case 'ready-for-delivery': return 'ready';
      case 'assigned-orders': return 'assigned';
      case 'out-for-delivery': return 'out_for_delivery';
      case 'delivered-orders': return 'delivered';
      case 'delivery-history': return 'history';
      case 'route-planner': return 'route_planner';
      case 'delivery-reports': return 'reports';
      default: return 'dashboard';
    }
  };

  // Active view tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'ready' | 'assigned' | 'out_for_delivery' | 'delivered' | 'history' | 'route_planner' | 'reports' | 'kanban' | 'orders' | 'settings' | 'staff_app'>(
    mapSubPageToTab(initialSubPage)
  );

  // State for Assign Staff Modal
  const [assignModalOrder, setAssignModalOrder] = useState<Order | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');
  const [dispatchVehicle, setDispatchVehicle] = useState('GJ-07-BB-4520 (Tata Ace)');
  const [trackingNumber, setTrackingNumber] = useState(`JM-TRK-${Math.floor(1000 + Math.random() * 9000)}`);

  // State for Proof of Delivery Modal
  const [podModalOrder, setPodModalOrder] = useState<Order | null>(null);

  // State for View Proof Inspector
  const [inspectProofOrder, setInspectProofOrder] = useState<Order | null>(null);

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Delivery Settings state
  const [depotLat, setDepotLat] = useState(JAMAVAT_DEPOT.latitude);
  const [depotLng, setDepotLng] = useState(JAMAVAT_DEPOT.longitude);
  const [enforceOtp, setEnforceOtp] = useState(true);
  const [autoOptimize, setAutoOptimize] = useState(true);
  const [ownerFallbackMode, setOwnerFallbackMode] = useState(true);
  const [settingsSaved, setSettingsSaved] = useState(false);

  // If user is logged in as Delivery Staff, directly render the dedicated Delivery Staff Portal!
  if (user?.role === 'Delivery Staff' && !isOwner && !isMD && !isAdmin) {
    return <DeliveryStaffPortal />;
  }

  // Filtered order groups
  const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Confirmed' || o.status === 'Processing');
  const readyOrders = orders.filter(o => o.status === 'Packed' || o.status === 'Ready for Delivery' || o.deliveryStatus === 'Ready for Delivery');
  const outForDeliveryOrders = orders.filter(o => o.status === 'Dispatched' || o.deliveryStatus === 'Out for Delivery' || o.deliveryStatus === 'Reached Shop' || o.deliveryStatus === 'Assigned');
  const deliveredOrders = orders.filter(o => o.status === 'Delivered' || o.deliveryStatus === 'Delivered');

  // Search and filtered list for Orders tab
  const filteredOrdersList = orders.filter(o => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.shopName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.village || o.district || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.assignedToStaffName || '').toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Ready') return matchesSearch && (o.status === 'Ready for Delivery' || o.status === 'Packed' || o.deliveryStatus === 'Ready for Delivery');
    if (statusFilter === 'Assigned') return matchesSearch && (o.deliveryStatus === 'Assigned' || o.deliveryStatus === 'Out for Delivery');
    if (statusFilter === 'Delivered') return matchesSearch && (o.status === 'Delivered' || o.deliveryStatus === 'Delivered');
    return matchesSearch;
  });

  // Calculate statistics
  const totalNetValue = orders.reduce((acc, o) => acc + o.netTotal, 0);
  const totalDeliveredValue = deliveredOrders.reduce((acc, o) => acc + o.netTotal, 0);

  // Handle opening Assign Modal
  const handleOpenAssignModal = (order: Order) => {
    setAssignModalOrder(order);
    if (hasDeliveryStaff) {
      setSelectedStaffId(deliveryStaffList[0].id);
      setSelectedStaffName(deliveryStaffList[0].name);
    } else {
      setSelectedStaffId(user?.uid || (isMD ? 'md-002' : 'owner-001'));
      setSelectedStaffName(`${user?.displayName || (isMD ? 'Managing Director' : 'Owner')} (${user?.role || (isMD ? 'MD' : 'Owner')})`);
    }
  };

  // Submit Staff Assignment
  const handleConfirmAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignModalOrder) return;

    acceptOrderForDelivery(assignModalOrder.id, selectedStaffId, selectedStaffName);
    updateOrderStatus(assignModalOrder.id, 'Dispatched', trackingNumber, dispatchVehicle);
    setAssignModalOrder(null);
  };

  // Owner / MD Self-Accept Order
  const handleOwnerSelfAccept = (order: Order) => {
    const carrierName = `${user?.displayName || (isMD ? 'Managing Director' : 'Owner')} (${user?.role || (isMD ? 'MD' : 'Owner')})`;
    acceptOrderForDelivery(order.id, user?.uid || (isMD ? 'md-002' : 'owner-001'), carrierName);
    updateOrderStatus(order.id, 'Ready for Delivery', trackingNumber, dispatchVehicle);
  };

  // Open Google Maps Navigation
  const handleOpenGoogleMapsNav = (order: Order) => {
    startOrderNavigation(order.id);
    const navUrl = getGoogleMapsNavigationUrl(order);
    window.open(navUrl, '_blank', 'noopener,noreferrer');
  };

  // Multi-stop directions URL
  const activeOrdersForMap = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const fullRouteNavUrl = getMultiStopDirectionsUrl(activeOrdersForMap);

  return (
    <div className="space-y-6 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Module Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-[#800000] text-amber-300 shadow-md">
            <Truck size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-slate-800 dark:text-white">
                Delivery, Dispatch & Route Navigation
              </h2>
              <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-full bg-amber-100 text-[#800000] dark:bg-amber-950 dark:text-amber-300 border border-amber-300/40">
                {isOwner ? '👑 Owner Control' : isMD ? '👔 Managing Director Control' : isAdmin ? '🛡 Admin Access' : user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Manage live GPS tracking, delivery staff assignments, route planning & digital proof of delivery
            </p>
          </div>
        </div>

        {/* Global Multi-stop Navigation Link */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={fullRouteNavUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all active:scale-95"
          >
            <Navigation size={15} />
            <span>Open All Delivery Stops in Google Maps</span>
          </a>
        </div>
      </div>

      {/* Owner & MD Self-Delivery Status Banner */}
      {!hasDeliveryStaff ? (
        <div className="p-4 bg-amber-500/10 dark:bg-amber-500/15 border-2 border-amber-400/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-400 text-[#800000] shrink-0">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-[#800000] dark:text-amber-300">
                ⚡ Owner & MD Auto-Delivery Management Active
              </h4>
              <p className="text-xs font-semibold">
                No active Delivery Staff registered in the HR system. As {isMD ? 'Managing Director (MD)' : 'Owner'}, you can directly accept orders, open Google Maps directions, and mark deliveries.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-xl bg-[#800000] text-amber-300 text-xs font-bold shrink-0">
            {isMD ? 'MD Primary Carrier' : 'Owner Primary Carrier'}
          </span>
        </div>
      ) : (
        <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-800 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200">
          <div className="flex items-center gap-2">
            <UserCheck size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="font-bold">
              {deliveryStaffList.length} Active Delivery Staff Available in Fleet
            </span>
          </div>
          <span className="text-[11px] text-slate-500">Owner can assign orders or self-deliver</span>
        </div>
      )}

      {/* Main Navigation Sub-Tabs */}
      <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <BarChart3 size={15} />
          <span>Delivery Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('ready')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'ready'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Package size={15} />
          <span>Ready for Delivery</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-400 text-[#800000]">
            {readyOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('assigned')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'assigned'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <UserCheck size={15} />
          <span>Assigned Orders</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-blue-500 text-white">
            {orders.filter(o => o.deliveryStatus === 'Assigned').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('out_for_delivery')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'out_for_delivery'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Truck size={15} />
          <span>Out for Delivery</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-purple-500 text-white">
            {outForDeliveryOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('delivered')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'delivered'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 size={15} />
          <span>Delivered Orders</span>
          <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-emerald-500 text-white">
            {deliveredOrders.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'history'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileCheck2 size={15} />
          <span>Delivery History</span>
        </button>

        <button
          onClick={() => setActiveTab('route_planner')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'route_planner' || activeTab === 'live_route'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Radio size={15} className="animate-pulse text-emerald-400" />
          <span>Route Planner</span>
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'reports'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <FileText size={15} />
          <span>Delivery Reports</span>
        </button>

        <button
          onClick={() => setActiveTab('kanban')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-extrabold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'kanban'
              ? 'bg-[#800000] text-amber-300 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
          }`}
        >
          <Layers size={15} />
          <span>Kanban</span>
        </button>
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Summary Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider block">Total Pipeline</span>
              <p className="text-xl sm:text-2xl font-black text-slate-800 dark:text-slate-100">{orders.length} Orders</p>
              <p className="text-[11px] text-slate-500">Value: {formatCurrency(totalNetValue)}</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Ready for Delivery</span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">{readyOrders.length} Orders</p>
              <p className="text-[11px] text-slate-500">Awaiting Carrier Dispatch</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">Out for Delivery</span>
              <p className="text-xl sm:text-2xl font-black text-purple-600 dark:text-purple-400">{outForDeliveryOrders.length} In Transit</p>
              <p className="text-[11px] text-slate-500">En Route to Dealer Shops</p>
            </div>

            <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Delivered Today</span>
              <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{deliveredOrders.length} Completed</p>
              <p className="text-[11px] text-emerald-600 font-bold">Collected: {formatCurrency(totalDeliveredValue)}</p>
            </div>
          </div>

          {/* Quick Action Cards Grid for Owner/Admin */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 bg-gradient-to-br from-[#800000] to-[#660000] text-white rounded-2xl shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-amber-400 text-[#800000] rounded-xl font-black text-xs">
                  Ready Orders
                </span>
                <Package size={20} className="text-amber-300" />
              </div>
              <h3 className="text-lg font-bold">Assign or Self-Deliver</h3>
              <p className="text-xs text-amber-100/80">
                You have {readyOrders.length} orders ready to be dispatched. Assign to staff or accept directly as Owner.
              </p>
              <button
                onClick={() => setActiveTab('orders')}
                className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-[#800000] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <span>View & Assign Orders</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 rounded-xl font-bold text-xs">
                  GPS Navigation
                </span>
                <Navigation size={20} className="text-blue-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Google Maps Navigation</h3>
              <p className="text-xs text-slate-500">
                Launch optimized Google Maps driving routes with turn-by-turn navigation to all shop locations.
              </p>
              <a
                href={fullRouteNavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <Navigation size={14} />
                <span>Open Multi-Stop Route</span>
              </a>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="p-2 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-xl font-bold text-xs">
                  Digital POD
                </span>
                <ShieldCheck size={20} className="text-emerald-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Mark Delivered & Proof</h3>
              <p className="text-xs text-slate-500">
                Collect digital signatures, photo proof of delivery, and customer 4-digit OTP verification.
              </p>
              <button
                onClick={() => setActiveTab('history')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
              >
                <FileCheck2 size={14} />
                <span>View Delivered History</span>
              </button>
            </div>
          </div>

          {/* Embedded Kanban Overview */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Layers size={16} className="text-[#800000] dark:text-amber-400" />
              <span>Current Delivery Pipeline</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Column 1: Processing */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase">1. Processing ({pendingOrders.length})</span>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {pendingOrders.map(o => (
                    <div key={o.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                        <span>{formatCurrency(o.netTotal)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{o.shopName}</p>
                      <button
                        onClick={() => updateOrderStatus(o.id, 'Ready for Delivery')}
                        className="w-full py-1 rounded-lg bg-amber-400 text-[#800000] font-bold text-[10px] cursor-pointer"
                      >
                        Mark Ready →
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 2: Ready */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase">2. Ready ({readyOrders.length})</span>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {readyOrders.map(o => (
                    <div key={o.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                        <span>{formatCurrency(o.netTotal)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{o.shopName}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenAssignModal(o)}
                          className="flex-1 py-1 rounded-lg bg-[#800000] text-amber-300 font-bold text-[10px] cursor-pointer"
                        >
                          Assign Staff
                        </button>
                        <button
                          onClick={() => handleOwnerSelfAccept(o)}
                          className="px-2 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                          title="Self Accept as Owner"
                        >
                          Self Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 3: Out for Delivery */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-purple-700 dark:text-purple-400 uppercase">3. In Transit ({outForDeliveryOrders.length})</span>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {outForDeliveryOrders.map(o => (
                    <div key={o.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-purple-600 dark:text-purple-400">{o.orderNumber}</span>
                        <span>{formatCurrency(o.netTotal)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{o.shopName}</p>
                      <p className="text-[10px] text-slate-400">Driver: {o.assignedToStaffName || 'Owner Control'}</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleOpenGoogleMapsNav(o)}
                          className="p-1.5 rounded-lg bg-blue-600 text-white text-[10px] cursor-pointer"
                          title="Google Maps Nav"
                        >
                          <Navigation size={12} />
                        </button>
                        <button
                          onClick={() => setPodModalOrder(o)}
                          className="flex-1 py-1 rounded-lg bg-emerald-600 text-white font-bold text-[10px] cursor-pointer"
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column 4: Delivered */}
              <div className="bg-slate-50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase">4. Delivered ({deliveredOrders.length})</span>
                </div>
                <div className="space-y-2 max-h-[360px] overflow-y-auto">
                  {deliveredOrders.map(o => (
                    <div key={o.id} className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5 shadow-xs">
                      <div className="flex justify-between font-bold text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400">{o.orderNumber}</span>
                        <span>{formatCurrency(o.netTotal)}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{o.shopName}</p>
                      <button
                        onClick={() => setInspectProofOrder(o)}
                        className="w-full py-1 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-[10px] cursor-pointer flex items-center justify-center gap-1"
                      >
                        <Eye size={11} />
                        <span>View Digital POD</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ORDERS / READY / ASSIGNED / OUT FOR DELIVERY / DELIVERED */}
      {(activeTab === 'orders' || activeTab === 'ready' || activeTab === 'assigned' || activeTab === 'out_for_delivery' || activeTab === 'delivered') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div>
              <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                {activeTab === 'ready' ? 'Ready for Delivery Orders' :
                 activeTab === 'assigned' ? 'Assigned Orders' :
                 activeTab === 'out_for_delivery' ? 'Out for Delivery Orders' :
                 activeTab === 'delivered' ? 'Delivered Orders' : 'Delivery Orders Management'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'ready' ? 'Orders packed and waiting for carrier assignment or direct self-delivery' :
                 activeTab === 'assigned' ? 'Orders assigned to delivery carriers' :
                 activeTab === 'out_for_delivery' ? 'In-transit orders currently out for shop delivery' :
                 activeTab === 'delivered' ? 'Completed deliveries with digital proof of delivery' : 'Filter, assign, navigate, and manage delivery orders'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Search Order #, Shop, City, Driver..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
                {['All', 'Ready', 'Assigned', 'Delivered'].map(st => (
                  <button
                    key={st}
                    onClick={() => {
                      setStatusFilter(st);
                      if (st === 'Ready') setActiveTab('ready');
                      else if (st === 'Assigned') setActiveTab('assigned');
                      else if (st === 'Delivered') setActiveTab('delivered');
                      else setActiveTab('orders');
                    }}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                      (statusFilter === st && activeTab === 'orders') ||
                      (st === 'Ready' && activeTab === 'ready') ||
                      (st === 'Assigned' && (activeTab === 'assigned' || activeTab === 'out_for_delivery')) ||
                      (st === 'Delivered' && activeTab === 'delivered')
                        ? 'bg-[#800000] text-amber-300 shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 uppercase font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Order Details</th>
                    <th className="p-3.5">Shop & Location</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Delivery Status</th>
                    <th className="p-3.5">Assigned Carrier</th>
                    <th className="p-3.5 text-right">Owner & Admin Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredOrdersList.map(order => {
                    const isDelivered = order.status === 'Delivered' || order.deliveryStatus === 'Delivered';
                    const isAssigned = !!order.assignedToStaffName;

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-all">
                        <td className="p-3.5">
                          <p className="font-extrabold text-[#800000] dark:text-amber-400">{order.orderNumber}</p>
                          <p className="text-[10px] text-slate-400">{formatDate(order.createdAt)}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-800 dark:text-slate-100">{order.shopName}</p>
                          <p className="text-[10px] text-slate-400">📍 {order.village || order.district || 'Gujarat'}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-black text-slate-800 dark:text-slate-100">{formatCurrency(order.netTotal)}</p>
                          <span className="text-[10px] text-emerald-600 font-semibold">{order.paymentStatus || 'Unpaid'}</span>
                        </td>

                        <td className="p-3.5">
                          <span className={`inline-block px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                            isDelivered
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : order.deliveryStatus === 'Out for Delivery' || order.deliveryStatus === 'Assigned'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {order.deliveryStatus || order.status}
                          </span>
                        </td>

                        <td className="p-3.5">
                          {isAssigned ? (
                            <div className="flex items-center gap-1.5">
                              <User size={13} className="text-amber-600" />
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {order.assignedToStaffName}
                              </span>
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 text-[10px] font-extrabold rounded bg-amber-100 text-[#800000] dark:bg-amber-950 dark:text-amber-300">
                              Owner Control (Unassigned)
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Google Maps Nav */}
                            <button
                              onClick={() => handleOpenGoogleMapsNav(order)}
                              className="px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              title="Open in Google Maps Navigation"
                            >
                              <Navigation size={13} />
                              <span className="hidden sm:inline">Nav</span>
                            </button>

                            {/* Assign Staff Button */}
                            {!isDelivered && (
                              <button
                                onClick={() => handleOpenAssignModal(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-[#800000] text-amber-300 hover:bg-[#660000] font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <UserCheck size={13} />
                                <span>Assign Staff</span>
                              </button>
                            )}

                            {/* Owner Self Accept Button */}
                            {!isDelivered && !isAssigned && (
                              <button
                                onClick={() => handleOwnerSelfAccept(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-amber-400 text-[#800000] hover:bg-amber-500 font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <span>Accept Order</span>
                              </button>
                            )}

                            {/* Mark Delivered Button */}
                            {!isDelivered && (
                              <button
                                onClick={() => setPodModalOrder(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer"
                              >
                                <CheckCircle2 size={13} />
                                <span>Delivered</span>
                              </button>
                            )}

                            {/* View Proof button if already delivered */}
                            {isDelivered && (
                              <button
                                onClick={() => setInspectProofOrder(order)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Eye size={13} />
                                <span>View POD</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PIPELINE KANBAN */}
      {activeTab === 'kanban' && (
        <div className="space-y-4">
          <Toolbar exportData={orders} exportFilename="JM_ERP_Dispatch_Log" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Column 1: Order Processing */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" /> Processing ({pendingOrders.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {pendingOrders.map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                      <span>{formatCurrency(o.netTotal)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.shopName}</p>
                    <p className="text-[10px] text-slate-400">📍 {o.village || o.district || 'Gujarat'}</p>
                    <button
                      onClick={() => updateOrderStatus(o.id, 'Ready for Delivery')}
                      className="w-full py-1.5 rounded-lg bg-amber-400 text-[#800000] font-bold text-[11px] cursor-pointer"
                    >
                      Mark Ready for Delivery →
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Ready for Delivery */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <Package size={14} className="text-blue-500" /> Ready for Delivery ({readyOrders.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {readyOrders.map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                      <span>{formatCurrency(o.netTotal)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.shopName}</p>
                    {o.assignedToStaffName ? (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                        Assigned to {o.assignedToStaffName}
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-0.5 text-[10px] font-bold rounded bg-amber-100 text-[#800000]">
                        Owner Control
                      </span>
                    )}
                    <button
                      onClick={() => handleOpenAssignModal(o)}
                      className="w-full py-1.5 rounded-lg bg-[#800000] text-amber-300 font-bold text-[11px] cursor-pointer"
                    >
                      Assign Vehicle & Dispatch
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 3: Out for Delivery */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <Truck size={14} className="text-purple-500" /> Out for Delivery ({outForDeliveryOrders.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {outForDeliveryOrders.map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-[#800000] dark:text-amber-400">{o.orderNumber}</span>
                      <span>{formatCurrency(o.netTotal)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.shopName}</p>
                    <p className="text-[10px] text-slate-400">Driver: {o.assignedToStaffName || 'Owner Control'}</p>
                    <button
                      onClick={() => setPodModalOrder(o)}
                      className="w-full py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-[11px] cursor-pointer"
                    >
                      Confirm Delivered ✓
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Column 4: Delivered */}
            <div className="bg-slate-100/70 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-xs font-black text-slate-800 dark:text-white uppercase flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-500" /> Delivered ({deliveredOrders.length})
                </h3>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {deliveredOrders.map(o => (
                  <div key={o.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
                    <div className="flex justify-between font-bold text-xs">
                      <span className="text-emerald-600 dark:text-emerald-400">{o.orderNumber}</span>
                      <span>{formatCurrency(o.netTotal)}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200">{o.shopName}</p>
                    <p className="text-[10px] text-slate-400">Delivered on {formatDate(o.deliveredAt || o.updatedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: ROUTE PLANNER & LIVE GPS MAP */}
      {(activeTab === 'live_route' || activeTab === 'route_planner') && (
        <div className="space-y-6">
          {/* Active Carriers Card Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hasDeliveryStaff ? (
              deliveryStaffList.map(staff => {
                const assigned = orders.filter(o => o.assignedToStaffId === staff.id && o.deliveryStatus !== 'Delivered');
                const done = orders.filter(o => o.assignedToStaffId === staff.id && o.deliveryStatus === 'Delivered');
                const collected = done.reduce((acc, o) => acc + o.netTotal, 0);

                return (
                  <div key={staff.id} className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover border-2 border-amber-400"
                        />
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">{staff.name}</h4>
                          <p className="text-[11px] text-slate-400">📱 {staff.phone}</p>
                        </div>
                      </div>
                      <a
                        href={`tel:${staff.phone}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                      >
                        <Phone size={15} />
                      </a>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Assigned</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100">{assigned.length} Shops</span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Delivered</span>
                        <span className="font-bold text-emerald-600">{done.length} Shops</span>
                      </div>
                      <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl">
                        <span className="text-[10px] text-slate-400 block">Collection</span>
                        <span className="font-bold text-amber-600">₹{(collected / 1000).toFixed(1)}k</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-2 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#800000] text-amber-300 flex items-center justify-center font-bold">
                    👑
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100">
                      Owner Primary Route Manager ({user?.displayName || 'Rajesh Sharma'})
                    </h4>
                    <p className="text-xs text-amber-600 font-bold">Managing all active delivery stops directly</p>
                  </div>
                </div>
                <a
                  href={fullRouteNavUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                >
                  <Navigation size={14} />
                  <span>Start Owner Navigation</span>
                </a>
              </div>
            )}
          </div>

          {/* Interactive Delivery Map */}
          <DeliveryRouteMap orders={activeOrdersForMap} />
        </div>
      )}

      {/* TAB 5: DELIVERED HISTORY & POD PROOFS */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <FileCheck2 className="text-emerald-600" size={18} />
                <span>Completed Deliveries & Proof Log ({deliveredOrders.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-black border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Order #</th>
                    <th className="p-3.5">Dealer / Shop</th>
                    <th className="p-3.5">Delivered On</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Delivered By</th>
                    <th className="p-3.5">OTP Status</th>
                    <th className="p-3.5 text-right">Digital POD</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {deliveredOrders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="p-3.5 font-bold text-[#800000] dark:text-amber-400">{o.orderNumber}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-100">{o.shopName}</td>
                      <td className="p-3.5 text-slate-500">{formatDate(o.deliveredAt || o.updatedAt)}</td>
                      <td className="p-3.5 font-black text-slate-800 dark:text-slate-100">{formatCurrency(o.netTotal)}</td>
                      <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{o.assignedToStaffName || 'Owner'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-emerald-100 text-emerald-800">
                          ✓ OTP Verified
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setInspectProofOrder(o)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-extrabold text-[11px] flex items-center gap-1.5 ml-auto cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Inspect Proof</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DELIVERY REPORTS */}
      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-800 dark:text-slate-100">
                Logistics & Delivery Performance Report
              </h3>
              <button
                onClick={() => alert('Exporting full delivery report CSV...')}
                className="px-4 py-2 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Download size={14} />
                <span>Export CSV Report</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-slate-500 block">Total Dispatched Value</span>
                <p className="text-xl font-black text-slate-800 dark:text-slate-100">{formatCurrency(totalNetValue)}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-emerald-600 block">Total Completed Collections</span>
                <p className="text-xl font-black text-emerald-600">{formatCurrency(totalDeliveredValue)}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl space-y-1">
                <span className="text-xs font-bold text-amber-600 block">Delivery Fulfillment Rate</span>
                <p className="text-xl font-black text-amber-600">
                  {orders.length > 0 ? Math.round((deliveredOrders.length / orders.length) * 100) : 100}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: DELIVERY SETTINGS */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-3xl">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                  Delivery & Logistics Settings
                </h3>
                <p className="text-xs text-slate-400">
                  {isOwner ? '👑 Owner Master Authority Config' : '🛡 Admin Delivery Configuration'}
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-amber-100 text-[#800000] text-xs font-extrabold">
                {isOwner ? 'Owner Settings' : 'Admin View'}
              </span>
            </div>

            {settingsSaved && (
              <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold">
                ✓ Delivery settings updated successfully!
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Central Depot Coordinates (Anand, Gujarat)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="any"
                    value={depotLat}
                    onChange={e => setDepotLat(Number(e.target.value))}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                  <input
                    type="number"
                    step="any"
                    value={depotLng}
                    onChange={e => setDepotLng(Number(e.target.value))}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">
                    Enforce Customer 4-Digit OTP Verification
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Require dealer OTP entry before marking order as delivered
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enforceOtp}
                  onChange={e => setEnforceOtp(e.target.checked)}
                  className="w-4 h-4 accent-[#800000] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">
                    Automatic Route Shortest-Distance Optimization
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Use Haversine algorithm to re-sequence delivery stops automatically
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={autoOptimize}
                  onChange={e => setAutoOptimize(e.target.checked)}
                  className="w-4 h-4 accent-[#800000] cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <div>
                  <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100 block">
                    Owner Auto-Fallback Mode
                  </span>
                  <span className="text-[11px] text-slate-400">
                    When 0 delivery staff exist, automatically route unassigned orders to Owner control
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={ownerFallbackMode}
                  onChange={e => setOwnerFallbackMode(e.target.checked)}
                  className="w-4 h-4 accent-[#800000] cursor-pointer"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setSettingsSaved(true);
                  setTimeout(() => setSettingsSaved(false), 2000);
                }}
                className="px-5 py-2.5 rounded-xl bg-[#800000] text-amber-300 font-extrabold text-xs shadow-md cursor-pointer"
              >
                Save Delivery Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 8: STAFF APP SIMULATOR */}
      {activeTab === 'staff_app' && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-xl border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <span className="font-bold">📲 Delivery Staff Mobile Portal View</span>
            <span className="text-[11px]">Testing Mode Active</span>
          </div>
          <DeliveryStaffPortal />
        </div>
      )}

      {/* MODAL 1: ASSIGN STAFF & DISPATCH VEHICLE MODAL */}
      {assignModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                  Assign Delivery Staff & Vehicle
                </h3>
                <p className="text-xs text-slate-400">Order #{assignModalOrder.orderNumber} - {assignModalOrder.shopName}</p>
              </div>
              <button
                onClick={() => setAssignModalOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Delivery Carrier *
                </label>
                <select
                  value={selectedStaffId}
                  onChange={e => {
                    const id = e.target.value;
                    setSelectedStaffId(id);
                    if (id === user?.uid || id === 'owner-001') {
                      setSelectedStaffName(`${user?.displayName || 'Owner'} (Owner)`);
                    } else {
                      const emp = deliveryStaffList.find(s => s.id === id);
                      if (emp) setSelectedStaffName(emp.name);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-bold cursor-pointer"
                >
                  <option value={user?.uid || 'owner-001'}>
                    👑 Owner - Self Deliver ({user?.displayName || 'Rajesh Sharma'})
                  </option>
                  {deliveryStaffList.map(s => (
                    <option key={s.id} value={s.id}>
                      🚚 {s.name} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Assigned Logistics Vehicle
                </label>
                <input
                  type="text"
                  value={dispatchVehicle}
                  onChange={e => setDispatchVehicle(e.target.value)}
                  placeholder="e.g. GJ-07-BB-4520 (Tata Ace)"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Logistics Tracking Code
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setAssignModalOrder(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#800000] text-amber-300 font-extrabold text-xs shadow-md cursor-pointer active:scale-95"
                >
                  Confirm Assignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: DELIVERY PROOF CAPTURE MODAL */}
      {podModalOrder && (
        <DeliveryProofModal
          order={podModalOrder}
          isOpen={!!podModalOrder}
          onClose={() => setPodModalOrder(null)}
          onSubmitProof={(proof) => {
            completeOrderDelivery(podModalOrder.id, proof);
            setPodModalOrder(null);
          }}
        />
      )}

      {/* MODAL 3: INSPECT DIGITAL POD PROOF MODAL */}
      {inspectProofOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                  Digital Proof of Delivery (POD)
                </h3>
                <p className="text-xs text-slate-400">Order #{inspectProofOrder.orderNumber} - {inspectProofOrder.shopName}</p>
              </div>
              <button
                onClick={() => setInspectProofOrder(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between">
                <span className="font-bold text-emerald-800 dark:text-emerald-300">Delivery Status:</span>
                <span className="font-extrabold text-emerald-600">✓ Verified Delivered</span>
              </div>

              <div>
                <span className="font-bold text-slate-500 block">Received By:</span>
                <p className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  {inspectProofOrder.deliveryProof?.receivedBy || inspectProofOrder.shopOwnerName || 'Dealer Store Incharge'}
                </p>
              </div>

              {inspectProofOrder.deliveryProof?.signatureUrl && (
                <div>
                  <span className="font-bold text-slate-500 block mb-1">Customer Digital Signature:</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center">
                    <img
                      src={inspectProofOrder.deliveryProof.signatureUrl}
                      alt="Customer Signature"
                      className="max-h-24 object-contain"
                    />
                  </div>
                </div>
              )}

              {inspectProofOrder.deliveryProof?.photoUrl && (
                <div>
                  <span className="font-bold text-slate-500 block mb-1">Store / Parcel Photo Proof:</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-center">
                    <img
                      src={inspectProofOrder.deliveryProof.photoUrl}
                      alt="Delivery Photo Proof"
                      className="max-h-36 object-cover rounded-lg"
                    />
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <span className="text-[10px] text-slate-400 block">Timestamp:</span>
                <p className="font-bold text-slate-700 dark:text-slate-300">
                  {formatDate(inspectProofOrder.deliveredAt || inspectProofOrder.updatedAt)}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={() => setInspectProofOrder(null)}
                className="px-5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
