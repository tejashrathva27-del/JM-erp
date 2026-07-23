import React, { useState } from 'react';
import { X, Store, Save, Check } from 'lucide-react';
import { Shop } from '../../types/erp';
import { useApp } from '../../context/AppContext';
import { ShopLocationPicker } from '../shops/ShopLocationPicker';

interface EditShopModalProps {
  shop: Shop;
  onClose: () => void;
}

export const EditShopModal: React.FC<EditShopModalProps> = ({ shop, onClose }) => {
  const { updateShop } = useApp();

  const [formData, setFormData] = useState({
    name: shop.name || '',
    ownerName: shop.ownerName || '',
    phone: shop.phone || '',
    alternatePhone: shop.alternatePhone || '',
    whatsapp: shop.whatsapp || '',
    gstNumber: shop.gstNumber || '',
    address: shop.address || '',
    village: shop.village || '',
    taluka: shop.taluka || '',
    district: shop.district || '',
    state: shop.state || 'Gujarat',
    city: shop.city || '',
    pinCode: shop.pinCode || '',
    dealerType: shop.dealerType || 'Retailer',
    creditLimit: shop.creditLimit || 50000,
    outstandingAmount: shop.outstandingAmount || 0,
    googleMapsLink: shop.googleMapsLink || '',
    latitude: shop.latitude || 22.5645,
    longitude: shop.longitude || 72.9289,
    notes: shop.notes || '',
    status: shop.status || 'Active'
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateShop(shop.id, {
      ...formData,
      creditLimit: Number(formData.creditLimit),
      outstandingAmount: Number(formData.outstandingAmount)
    });

    setSavedSuccess(true);
    setTimeout(() => {
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-4 sm:p-6 max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl my-auto relative max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#800000] text-amber-400">
              <Store size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 dark:text-white">
                Edit Shop & Dealer Details
              </h3>
              <p className="text-xs text-slate-400">Code: {shop.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {savedSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <Check size={28} />
            </div>
            <h4 className="text-lg font-bold text-slate-800 dark:text-white">Shop Updated Successfully!</h4>
            <p className="text-xs text-slate-500">All changes and GPS coordinates have been saved.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Shop & Owner Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Laxmi Kirana Store"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Owner / Proprietor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.ownerName}
                  onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="e.g. Ramesh Patel"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>
            </div>

            {/* Mobile Numbers & GSTIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98250 12345"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Alternate Number
                </label>
                <input
                  type="text"
                  value={formData.alternatePhone}
                  onChange={e => setFormData({ ...formData, alternatePhone: e.target.value })}
                  placeholder="Alt Contact Number"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  GSTIN Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                  placeholder="24AAACJ1234F1Z5"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 uppercase font-mono"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shop Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                placeholder="Shop No., Market Name, Main Road"
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
              />
            </div>

            {/* Village, Taluka, District, State, PIN Code */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Village/Area
                </label>
                <input
                  type="text"
                  value={formData.village}
                  onChange={e => setFormData({ ...formData, village: e.target.value })}
                  placeholder="Navrangpura"
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Taluka
                </label>
                <input
                  type="text"
                  value={formData.taluka}
                  onChange={e => setFormData({ ...formData, taluka: e.target.value })}
                  placeholder="Taluka"
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  District
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={e => setFormData({ ...formData, district: e.target.value })}
                  placeholder="District / City"
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={e => setFormData({ ...formData, state: e.target.value })}
                  placeholder="Gujarat"
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">
                  PIN Code
                </label>
                <input
                  type="text"
                  value={formData.pinCode}
                  onChange={e => setFormData({ ...formData, pinCode: e.target.value })}
                  placeholder="380009"
                  className="w-full px-2.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>
            </div>

            {/* GPS Location & Navigation Picker */}
            <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-200 dark:border-amber-900/40 space-y-2">
              <label className="block text-xs font-extrabold text-[#800000] dark:text-amber-300">
                🧭 Google Maps Navigation & Precise GPS Location
              </label>
              <ShopLocationPicker
                googleMapsLink={formData.googleMapsLink}
                latitude={formData.latitude}
                longitude={formData.longitude}
                address={formData.address}
                city={formData.village || formData.district}
                onChange={(loc) => {
                  setFormData(prev => ({
                    ...prev,
                    googleMapsLink: loc.googleMapsLink,
                    latitude: loc.latitude,
                    longitude: loc.longitude
                  }));
                }}
              />
            </div>

            {/* Dealer Type, Credit Limit, Outstanding Balance */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Dealer Type
                </label>
                <select
                  value={formData.dealerType}
                  onChange={e => setFormData({ ...formData, dealerType: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 cursor-pointer"
                >
                  <option value="Retailer">Retailer</option>
                  <option value="Wholesaler">Wholesaler</option>
                  <option value="Distributor">Distributor</option>
                  <option value="Super Stockist">Super Stockist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Credit Limit (₹)
                </label>
                <input
                  type="number"
                  required
                  value={formData.creditLimit}
                  onChange={e => setFormData({ ...formData, creditLimit: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Outstanding Balance (₹)
                </label>
                <input
                  type="number"
                  value={formData.outstandingAmount}
                  onChange={e => setFormData({ ...formData, outstandingAmount: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30 font-bold text-rose-600"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Shop Notes / Special Terms
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Preferred delivery days, credit terms, special instructions..."
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#800000]/30"
              />
            </div>

            {/* Submit Action */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#800000] hover:bg-[#660000] text-amber-400 font-extrabold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer active:scale-95"
              >
                <Save size={15} />
                <span>Save Changes</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
