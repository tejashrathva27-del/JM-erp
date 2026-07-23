/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Employee Credentials Popup Modal
 */

import React, { useState } from 'react';
import { KeyRound, Copy, Check, Printer, X, ShieldCheck } from 'lucide-react';
import { JAMAVAT_LOGO_DATA_URL } from '../../utils/logo';

interface CredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  credentials: {
    code: string;
    username: string;
    tempPassword: string;
    name: string;
  } | null;
}

export const CredentialsModal: React.FC<CredentialsModalProps> = ({
  isOpen,
  onClose,
  credentials
}) => {
  if (!isOpen || !credentials) return null;

  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `Jamavat Masala ERP Credentials\nEmployee: ${credentials.name}\nEmployee ID: ${credentials.code}\nUsername: ${credentials.username}\nTemporary Password: ${credentials.tempPassword}\nPortal: https://jamavatmasala.com/login`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <html>
        <head>
          <title>Login Credentials - ${credentials.name}</title>
          <style>
            body { font-family: sans-serif; padding: 32px; color: #1e293b; max-width: 500px; margin: 0 auto; border: 2px solid #800000; border-radius: 20px; }
            .header { text-align: center; border-bottom: 2px solid #800000; padding-bottom: 16px; margin-bottom: 20px; }
            .title { color: #800000; font-size: 22px; font-weight: bold; }
            .sub { font-size: 12px; color: #64748b; margin-top: 4px; }
            .card { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 12px; padding: 16px; font-size: 14px; line-height: 1.8; margin-bottom: 20px; }
            .field { margin-bottom: 8px; }
            .label { font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: bold; display: block; }
            .val { font-size: 16px; font-weight: bold; color: #0f172a; font-family: monospace; }
            .note { font-size: 11px; color: #dc2626; text-align: center; font-style: italic; }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${JAMAVAT_LOGO_DATA_URL}" alt="Jamavat Masala Logo" style="height: 38px; width: auto; margin-bottom: 6px; display: inline-block;" />
            <div class="title">JAMAVAT MASALA ERP</div>
            <div class="sub">Employee Onboarding & Login Credentials</div>
          </div>
          <div class="card">
            <div class="field"><span class="label">Employee Name</span><div class="val">${credentials.name}</div></div>
            <div class="field"><span class="label">Employee ID</span><div class="val">${credentials.code}</div></div>
            <div class="field"><span class="label">Username</span><div class="val">${credentials.username}</div></div>
            <div class="field"><span class="label">Temporary Password</span><div class="val">${credentials.tempPassword}</div></div>
          </div>
          <div class="note">Please log in to the employee portal and change your password immediately upon first sign in.</div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWin.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-white shadow-2xl space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-400">
            <KeyRound size={24} />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-white">Employee Onboarded!</h3>
            <p className="text-xs text-slate-400">Auto-generated login credentials for portal access</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-800/90 border border-slate-700 space-y-3 text-xs">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee Name</span>
            <span className="font-extrabold text-white text-sm">{credentials.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-700">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Employee ID</span>
              <span className="font-mono font-bold text-amber-300">{credentials.code}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Username</span>
              <span className="font-mono font-bold text-amber-300">@{credentials.username}</span>
            </div>
          </div>
          <div className="pt-2 border-t border-slate-700">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Temporary Password</span>
            <span className="font-mono font-bold text-emerald-400 text-sm bg-slate-900 px-3 py-1 rounded-lg border border-emerald-500/30 inline-block mt-0.5">
              {credentials.tempPassword}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="py-2.5 px-4 rounded-xl bg-amber-400 text-[#800000] font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Slip</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-300 font-bold text-xs shadow-md transition-colors cursor-pointer"
        >
          Done & Close
        </button>
      </div>
    </div>
  );
};
