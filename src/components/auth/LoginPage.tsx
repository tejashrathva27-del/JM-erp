/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Role Based Authentication & Login System
 */

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import { KeyRound, User, Lock, CheckCircle2, ShieldCheck, ArrowRight, Building2, HelpCircle } from 'lucide-react';
import { JamavatLogo } from '../../utils/logo';

export const LoginPage: React.FC = () => {
  const { login, presetLogin, loginError, setLoginError } = useAuth();

  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail || !password) {
      setLoginError('Please enter both Username/Email and Password.');
      return;
    }

    setLoading(true);
    const success = await login(usernameOrEmail, password);
    setLoading(false);
  };

  const handleQuickRole = (role: UserRole) => {
    presetLogin(role);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 sm:p-6 font-['Plus_Jakarta_Sans',sans-serif] relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#800000]/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <JamavatLogo size="xl" className="w-28 sm:w-32 h-auto drop-shadow-xl" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Jamavat Masala <span className="text-amber-400">ERP</span>
          </h1>
          <p className="text-xs text-slate-400">
            Enterprise Employee Management & Operational Portal
          </p>
        </div>

        {/* Login Form Card */}
        <div className="bg-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl space-y-5">
          <div className="border-b border-slate-700 pb-3 flex items-center justify-between">
            <h2 className="text-sm font-extrabold text-white flex items-center gap-2">
              <ShieldCheck className="text-amber-400" size={18} />
              <span>Employee Portal Sign In</span>
            </h2>
            <span className="text-[10px] font-bold text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-full">
              v1.0.0
            </span>
          </div>

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-start gap-2.5">
              <span className="shrink-0 mt-0.5">⚠️</span>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username or Email ID
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="e.g. tej.rathva or priya.hr@jamavatmasala.com"
                  value={usernameOrEmail}
                  onChange={e => setUsernameOrEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-[11px] text-amber-400 hover:underline font-semibold"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-900/80 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
                />
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-300 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded bg-slate-900 border-slate-700 text-[#800000] focus:ring-amber-400"
                />
                <span>Remember session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#800000] to-[#990000] hover:from-[#990000] hover:to-[#800000] text-amber-300 font-extrabold text-xs shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Quick Preset Selector for Testing */}
          <div className="pt-4 border-t border-slate-700/80 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">
              Instant Demo Access (Select Role)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickRole('Owner')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-amber-400/30 flex items-center justify-between"
              >
                <span>👑 Owner</span>
                <span className="text-[9px] text-slate-400">Full</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('MD')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-amber-400/30 flex items-center justify-between"
              >
                <span>👔 Managing Director</span>
                <span className="text-[9px] text-slate-400">MD</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Admin')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 flex items-center justify-between"
              >
                <span>🛡 Admin</span>
                <span className="text-[9px] text-slate-400">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Delivery Staff')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-sky-400 font-bold text-[11px] border border-sky-500/30 flex items-center justify-between"
              >
                <span>🚚 Delivery Staff</span>
                <span className="text-[9px] text-slate-400">Fleet</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('HR')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-amber-300 font-bold text-[11px] border border-amber-400/30 flex items-center justify-between"
              >
                <span>👥 HR Manager</span>
                <span className="text-[9px] text-slate-400">HR</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Sales Manager')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 flex items-center justify-between"
              >
                <span>📊 Sales Mgr</span>
                <span className="text-[9px] text-slate-400">Sales</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Production Manager')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 flex items-center justify-between"
              >
                <span>🏭 Factory Mgr</span>
                <span className="text-[9px] text-slate-400">Plant</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Accountant')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-200 font-bold text-[11px] border border-slate-700 flex items-center justify-between"
              >
                <span>🧾 Accountant</span>
                <span className="text-[9px] text-slate-400">Accounts</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickRole('Employee')}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] border border-emerald-500/30 flex items-center justify-between"
              >
                <span>👤 Employee</span>
                <span className="text-[9px] text-slate-400">Staff</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500 font-medium">
          Protected by Jamavat Masala Security & Data Policy
        </p>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-3xl p-6 max-w-sm w-full border border-slate-700 text-white space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-amber-400">
              <HelpCircle size={24} />
              <h3 className="font-extrabold text-base">Reset Employee Password</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              If you have forgotten your password or username, please contact the <strong>Jamavat Masala HR Department</strong> or your administrator to request a password reset.
            </p>
            <div className="p-3 bg-slate-900/80 rounded-2xl border border-slate-700 text-xs space-y-1 text-slate-300">
              <p><strong>HR Helpline:</strong> +91 98980 44332</p>
              <p><strong>Email:</strong> hr@jamavatmasala.com</p>
            </div>
            <button
              onClick={() => setShowForgotPassword(false)}
              className="w-full py-2.5 rounded-xl bg-[#800000] text-amber-300 font-bold text-xs"
            >
              Got it, Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
