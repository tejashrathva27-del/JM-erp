/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Notifications & System Alerts Center
 */

import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Gift, ShoppingCart, Users, Trash2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsView: React.FC = () => {
  const { notifications, markNotificationRead, clearAllNotifications, setActiveModule } = useApp();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Bell className="text-[#800000] dark:text-amber-400" size={20} />
            <span>System Notifications & Operational Alerts</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Realtime low stock warnings, new order notifications, birthdays & payment alerts
          </p>
        </div>
        <button
          onClick={clearAllNotifications}
          className="px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs"
        >
          Mark All Read
        </button>
      </div>

      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {notifications.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No system notifications present.</p>
        ) : (
          notifications.map(n => (
            <div
              key={n.id}
              onClick={() => {
                markNotificationRead(n.id);
                if (n.linkModule) setActiveModule(n.linkModule as any);
              }}
              className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                !n.read
                  ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800'
                  : 'bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-[#800000] text-amber-300 flex items-center justify-center shrink-0">
                <Bell size={18} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-white">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
