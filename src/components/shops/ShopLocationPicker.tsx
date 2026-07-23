/**
 * Jamavat Masala ERP - Shop Location Picker & GPS Verifier
 */

import React, { useState } from 'react';
import { MapPin, Navigation, CheckCircle2, ExternalLink, RefreshCw, AlertCircle, Search } from 'lucide-react';
import { getGoogleMapsNavigationUrl } from '../../utils/routeOptimizer';

interface ShopLocationPickerProps {
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
  locationVerified?: boolean;
  address?: string;
  city?: string;
  onChange: (data: { latitude?: number; longitude?: number; googleMapsLink?: string; locationVerified?: boolean }) => void;
}

export const ShopLocationPicker: React.FC<ShopLocationPickerProps> = ({
  latitude,
  longitude,
  googleMapsLink = '',
  locationVerified = false,
  address = '',
  city = '',
  onChange
}) => {
  const [latInput, setLatInput] = useState<string>(latitude ? String(latitude) : '');
  const [lngInput, setLngInput] = useState<string>(longitude ? String(longitude) : '');
  const [linkInput, setLinkInput] = useState<string>(googleMapsLink);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationSuccess, setVerificationSuccess] = useState<boolean>(locationVerified);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto geocode approximate coordinates for major Gujarat cities if empty
  const gujaratCityDefaults: Record<string, { lat: number; lng: number }> = {
    Anand: { lat: 22.5645, lng: 72.9289 },
    Ahmedabad: { lat: 23.0225, lng: 72.5714 },
    Vadodara: { lat: 22.3072, lng: 73.1812 },
    Surat: { lat: 21.1702, lng: 72.8311 },
    Rajkot: { lat: 22.3039, lng: 70.8022 },
    Kheda: { lat: 22.7503, lng: 72.6826 },
    Nadiad: { lat: 22.6916, lng: 72.8634 }
  };

  const handleApplyCityDefault = () => {
    const matchedCity = Object.keys(gujaratCityDefaults).find(
      c => c.toLowerCase() === city.trim().toLowerCase()
    );
    if (matchedCity) {
      const coords = gujaratCityDefaults[matchedCity];
      setLatInput(String(coords.lat));
      setLngInput(String(coords.lng));
      const generatedLink = `https://maps.google.com/?q=${coords.lat},${coords.lng}`;
      setLinkInput(generatedLink);
      onChange({
        latitude: coords.lat,
        longitude: coords.lng,
        googleMapsLink: generatedLink,
        locationVerified: true
      });
      setVerificationSuccess(true);
      setErrorMsg('');
    } else {
      setErrorMsg(`No default preset for "${city}". Please use "My GPS Location" or enter Lat/Lng.`);
    }
  };

  const handleGetGPSLocation = () => {
    setErrorMsg('');
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Math.round(position.coords.latitude * 10000) / 10000;
        const lng = Math.round(position.coords.longitude * 10000) / 10000;
        const link = `https://maps.google.com/?q=${lat},${lng}`;

        setLatInput(String(lat));
        setLngInput(String(lng));
        setLinkInput(link);
        setIsLocating(false);
        setVerificationSuccess(true);

        onChange({
          latitude: lat,
          longitude: lng,
          googleMapsLink: link,
          locationVerified: true
        });
      },
      (err) => {
        setIsLocating(false);
        setErrorMsg(`GPS location error: ${err.message}`);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleVerifyLocation = () => {
    const parsedLat = parseFloat(latInput);
    const parsedLng = parseFloat(lngInput);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      if (linkInput.trim()) {
        window.open(linkInput, '_blank', 'noopener,noreferrer');
        setVerificationSuccess(true);
        onChange({
          googleMapsLink: linkInput,
          locationVerified: true
        });
        return;
      }
      setErrorMsg('Please enter valid Latitude & Longitude or a Google Maps link.');
      return;
    }

    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationSuccess(true);
      const generatedLink = linkInput.trim() || `https://maps.google.com/?q=${parsedLat},${parsedLng}`;
      setLinkInput(generatedLink);

      onChange({
        latitude: parsedLat,
        longitude: parsedLng,
        googleMapsLink: generatedLink,
        locationVerified: true
      });

      // Open Google Maps in new window to verify visually
      const navUrl = getGoogleMapsNavigationUrl({
        latitude: parsedLat,
        longitude: parsedLng,
        googleMapsLink: generatedLink
      });
      window.open(navUrl, '_blank', 'noopener,noreferrer');
    }, 400);
  };

  const handleParseGoogleMapsLink = (urlStr: string) => {
    setLinkInput(urlStr);
    setErrorMsg('');

    // Try extracting lat,lng from google maps link formats like @22.5645,72.9289 or q=22.5645,72.9289
    const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)|q=(-?\d+\.\d+),(-?\d+\.\d+)/;
    const match = urlStr.match(regex);

    if (match) {
      const lat = parseFloat(match[1] || match[3]);
      const lng = parseFloat(match[2] || match[4]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setLatInput(String(lat));
        setLngInput(String(lng));
        setVerificationSuccess(true);
        onChange({
          latitude: lat,
          longitude: lng,
          googleMapsLink: urlStr,
          locationVerified: true
        });
        return;
      }
    }

    onChange({
      latitude: latInput ? parseFloat(latInput) : undefined,
      longitude: lngInput ? parseFloat(lngInput) : undefined,
      googleMapsLink: urlStr,
      locationVerified: false
    });
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
          <MapPin size={16} className="text-[#800000] dark:text-amber-400" />
          Shop GPS Location & Google Maps
        </label>

        {verificationSuccess ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-extrabold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <CheckCircle2 size={13} />
            Verified Location
          </span>
        ) : (
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
            Unverified
          </span>
        )}
      </div>

      {/* Quick Action Bar */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleGetGPSLocation}
          disabled={isLocating}
          className="flex-1 min-w-[140px] flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 transition-all shadow-sm active:scale-95 disabled:opacity-50"
        >
          {isLocating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
          <span>{isLocating ? 'Locating...' : 'Use Current GPS'}</span>
        </button>

        {city && gujaratCityDefaults[city] && (
          <button
            type="button"
            onClick={handleApplyCityDefault}
            className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-all"
          >
            <Search size={13} />
            <span>Set {city} Center</span>
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-900">
          <AlertCircle size={15} className="shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Google Maps Link Field */}
      <div>
        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
          Google Maps Link
        </label>
        <div className="relative">
          <input
            type="url"
            value={linkInput}
            onChange={(e) => handleParseGoogleMapsLink(e.target.value)}
            placeholder="e.g. https://maps.google.com/?q=22.5645,72.9289"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 pr-8"
          />
          {linkInput && (
            <a
              href={linkInput}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-amber-500 transition-colors"
              title="Open link in Google Maps"
            >
              <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      {/* Lat & Long Manual Coordinate Inputs */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Latitude (°N)
          </label>
          <input
            type="number"
            step="any"
            value={latInput}
            onChange={(e) => {
              setLatInput(e.target.value);
              setVerificationSuccess(false);
              const latNum = parseFloat(e.target.value);
              const lngNum = parseFloat(lngInput);
              onChange({
                latitude: isNaN(latNum) ? undefined : latNum,
                longitude: isNaN(lngNum) ? undefined : lngNum,
                googleMapsLink: linkInput,
                locationVerified: false
              });
            }}
            placeholder="e.g. 22.5645"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Longitude (°E)
          </label>
          <input
            type="number"
            step="any"
            value={lngInput}
            onChange={(e) => {
              setLngInput(e.target.value);
              setVerificationSuccess(false);
              const latNum = parseFloat(latInput);
              const lngNum = parseFloat(e.target.value);
              onChange({
                latitude: isNaN(latNum) ? undefined : latNum,
                longitude: isNaN(lngNum) ? undefined : lngNum,
                googleMapsLink: linkInput,
                locationVerified: false
              });
            }}
            placeholder="e.g. 72.9289"
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Verify Button */}
      <div className="pt-1 flex justify-end">
        <button
          type="button"
          onClick={handleVerifyLocation}
          disabled={isVerifying}
          className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-[#800000] hover:bg-[#660000] text-amber-300 transition-all shadow-md active:scale-95 disabled:opacity-50"
        >
          {isVerifying ? <RefreshCw size={14} className="animate-spin" /> : <ExternalLink size={14} />}
          <span>Verify Location on Map</span>
        </button>
      </div>
    </div>
  );
};
