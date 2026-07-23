/**
 * Jamavat Masala ERP - Delivery Proof Capture Modal
 */

import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Check, RotateCcw, ShieldCheck, FileCheck2, User, AlertCircle } from 'lucide-react';
import { Order, DeliveryProof } from '../../types/erp';

interface DeliveryProofModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmitProof: (proof: DeliveryProof) => void;
}

export const DeliveryProofModal: React.FC<DeliveryProofModalProps> = ({
  order,
  isOpen,
  onClose,
  onSubmitProof,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  
  const [receivedBy, setReceivedBy] = useState(order.shopOwnerName || order.shopName || '');
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  // OTP Verification
  const [generatedOtp] = useState<string>(() => String(Math.floor(1000 + Math.random() * 9000)));
  const [userOtp, setUserOtp] = useState<string>('');
  const [otpVerified, setOtpVerified] = useState<boolean>(false);
  const [otpError, setOtpError] = useState<string>('');

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Signature canvas handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setHasSignature(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    setHasSignature(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyOtp = () => {
    if (userOtp.trim() === generatedOtp) {
      setOtpVerified(true);
      setOtpError('');
    } else {
      setOtpError('Incorrect 4-digit OTP code.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let signatureDataUrl = '';
    if (canvasRef.current && hasSignature) {
      signatureDataUrl = canvasRef.current.toDataURL('image/png');
    }

    const proofData: DeliveryProof = {
      signatureUrl: signatureDataUrl || undefined,
      photoUrl: photoUrl || undefined,
      otpVerified,
      otpCode: generatedOtp,
      receivedBy,
      notes,
      deliveredAt: new Date().toISOString(),
      location: order.latitude && order.longitude ? { lat: order.latitude, lng: order.longitude } : undefined
    };

    onSubmitProof(proofData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 my-auto overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-[#800000] text-white">
          <div className="flex items-center gap-2">
            <FileCheck2 size={22} className="text-amber-300" />
            <div>
              <h3 className="font-bold text-base text-amber-300 leading-tight">
                Proof of Delivery (POD)
              </h3>
              <p className="text-xs text-amber-100/80">Order #{order.orderNumber} - {order.shopName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-amber-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Receiver Info */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Received By (Person Name) *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder="e.g. Ramesh Patel (Owner)"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
              />
              <User size={16} className="absolute left-3 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Customer OTP Verification Section */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-amber-600 dark:text-amber-400" />
                Customer OTP Code: <code className="bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-100">{generatedOtp}</code>
              </span>
              {otpVerified && (
                <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={14} /> Verified
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={4}
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value)}
                placeholder="Enter 4-digit OTP"
                disabled={otpVerified}
                className="w-full px-3 py-1.5 text-xs font-mono font-bold tracking-widest rounded-lg border border-amber-300 dark:border-amber-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={otpVerified || !userOtp}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 shrink-0 disabled:opacity-50 transition-all"
              >
                Verify OTP
              </button>
            </div>
            {otpError && (
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle size={13} /> {otpError}
              </p>
            )}
          </div>

          {/* Digital Signature Canvas */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Customer Digital Signature
              </label>
              {hasSignature && (
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-xs text-red-600 dark:text-red-400 font-bold hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Clear Signature
                </button>
              )}
            </div>
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-950 overflow-hidden touch-none relative">
              <canvas
                ref={canvasRef}
                width={440}
                height={130}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
                className="w-full h-32 cursor-crosshair bg-white dark:bg-slate-950"
              />
              {!hasSignature && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-400 text-xs italic">
                  Sign here with touch screen or mouse
                </div>
              )}
            </div>
          </div>

          {/* Photo Upload Capture */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Delivery Proof Photo (Goods Delivered / Store Front)
            </label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer flex items-center justify-center gap-2 px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-all">
                <Camera size={16} className="text-amber-500" />
                <span>{photoUrl ? 'Retake Photo' : 'Capture / Upload Photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>

              {photoUrl && (
                <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-amber-400 shrink-0">
                  <img src={photoUrl} alt="Delivery Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl('')}
                    className="absolute top-0 right-0 bg-red-600 text-white rounded-bl p-0.5"
                  >
                    <X size={10} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Delivery Remarks / Payment Note
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Delivered 5 boxes of Haldi. Received cash ₹14,250 on spot."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-extrabold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg active:scale-95 transition-all"
            >
              <Check size={16} />
              <span>Confirm & Mark Delivered</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
