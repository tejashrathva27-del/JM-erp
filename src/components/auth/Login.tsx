/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Role Based Login Screen
 */

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/erp';
import { JamavatLogo } from '../../utils/logo';

export const Login: React.FC = () => {
  const { login, presetLogin, loginError, setLoginError } = useAuth();

  const [email, setEmail] = useState('tejashrathva27@gmail.com');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const success = await login(email, password);
    setIsLoading(false);
  };

  const handleQuickPreset = (role: UserRole) => {
    presetLogin(role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 brand-gradient relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Rings */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

      {/* Main Glass Card */}
      <div className="w-full max-w-md glass-panel rounded-3xl p-8 shadow-2xl border border-white/40 bg-white/95 text-slate-800 relative z-10 transition-all">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <JamavatLogo size="xl" className="w-28 sm:w-32 h-auto" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-[#800000]">JM ERP</h2>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Jamavat Masala • Business Management System
          </p>
        </div>

        {/* Quick Role Preset Pills */}
        <div className="mb-6 bg-slate-100 p-2 rounded-2xl border border-slate-200">
          <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider text-center mb-2">
            Select Role to Login
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('owner@jamavatmasala.com');
                handleQuickPreset('Owner');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-[#800000] hover:bg-amber-100 hover:border-amber-300 border border-slate-200 shadow-xs transition-all text-center"
            >
              👑 Owner
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('tejashrathva27@gmail.com');
                handleQuickPreset('MD');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-[#800000] hover:bg-amber-100 hover:border-amber-300 border border-slate-200 shadow-xs transition-all text-center"
            >
              👔 Managing Director
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('admin@jamavatmasala.com');
                handleQuickPreset('Admin');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all text-center"
            >
              🛡 Super Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('vijay.del@jamavatmasala.com');
                handleQuickPreset('Delivery Staff');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-sky-700 hover:bg-sky-50 border border-slate-200 shadow-xs transition-all text-center"
            >
              🚚 Delivery Staff
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('priya.hr@jamavatmasala.com');
                handleQuickPreset('HR');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all text-center"
            >
              👥 HR Manager
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail('vikram.mkt@jamavatmasala.com');
                handleQuickPreset('Marketing Head');
              }}
              className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold bg-white text-slate-800 hover:bg-slate-100 border border-slate-200 shadow-xs transition-all text-center"
            >
              📈 Marketing Head
            </button>
          </div>
        </div>

        {/* Error Alert Box */}
        {loginError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span className="font-semibold">{loginError}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your user email"
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/30 transition-all font-medium text-slate-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#800000]/30 transition-all font-medium text-slate-800"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-600">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-[#800000] focus:ring-[#800000]"
              />
              Remember Me
            </label>
            <button
              type="button"
              onClick={() => alert('Please contact HR/Owner to reset password credentials.')}
              className="text-[#800000] font-bold hover:underline"
            >
              Forgot Password?
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-bold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? 'Verifying Credentials...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-slate-400">
            Powered by <strong className="text-slate-600">Jamavat Masala</strong>
          </p>
          <p className="text-[10px] text-slate-400 font-mono mt-0.5">Version 1.0.0 • India</p>
        </div>
      </div>
    </div>
  );
};
