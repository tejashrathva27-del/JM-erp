/**
 * @license
 * Jamavat Masala ERP - Official Brand Logo Assets
 */

import React from 'react';

export const JAMAVAT_LOGO_SVG_RAW = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 380" width="100%" height="100%">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fde047" />
      <stop offset="35%" stop-color="#eab308" />
      <stop offset="70%" stop-color="#ca8a04" />
      <stop offset="100%" stop-color="#854d0e" />
    </linearGradient>
    <linearGradient id="redGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c" />
      <stop offset="50%" stop-color="#991b1b" />
      <stop offset="100%" stop-color="#7f1d1d" />
    </linearGradient>
    <filter id="logoShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" flood-color="#000000" flood-opacity="0.3"/>
    </filter>
  </defs>

  <g filter="url(#logoShadow)">
    <path d="M 250 20 Q 370 10 460 70 C 480 160 465 220 440 250 Q 250 280 60 250 C 35 220 20 160 40 70 Q 130 10 250 20 Z" fill="url(#goldGrad)"/>
    <path d="M 250 28 Q 363 19 448 76 C 466 158 452 212 430 240 Q 250 268 70 240 C 48 212 34 158 52 76 Q 137 19 250 28 Z" fill="url(#redGrad)" stroke="url(#goldGrad)" stroke-width="2.5"/>

    <g transform="translate(0, 10)">
      <path d="M 212 95 C 195 70 215 50 242 62 C 240 82 222 95 212 95 Z" fill="#84cc16" stroke="#3f6212" stroke-width="1.5"/>
      <path d="M 242 62 C 269 50 289 70 272 95 C 262 95 244 82 242 62 Z" fill="#a3e635" stroke="#3f6212" stroke-width="1.5"/>
      <path d="M 235 84 C 228 75 225 68 228 65" stroke="#1a2e05" stroke-width="1.5" fill="none"/>
      <path d="M 249 84 C 256 75 259 68 256 65" stroke="#1a2e05" stroke-width="1.5" fill="none"/>

      <path d="M 210 92 C 210 120 274 120 274 92 C 288 92 288 82 210 82 C 196 82 196 92 210 92 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1.5"/>
      <path d="M 264 86 L 284 62 C 290 55 298 63 292 70 L 270 90 Z" fill="url(#goldGrad)" stroke="#78350f" stroke-width="1.5"/>
    </g>

    <text x="250" y="185" font-family="'Playfair Display', 'Georgia', 'Times New Roman', serif" font-weight="900" font-style="italic" font-size="82" fill="#ffffff" text-anchor="middle" letter-spacing="-1">
      Jamavat
    </text>

    <path d="M 125 202 L 225 202 M 275 202 L 375 202" stroke="url(#goldGrad)" stroke-width="2.5" stroke-linecap="round"/>
    <polygon points="250,196 257,202 250,208 243,202" fill="url(#goldGrad)"/>
    <circle cx="236" cy="202" r="2.5" fill="url(#goldGrad)"/>
    <circle cx="264" cy="202" r="2.5" fill="url(#goldGrad)"/>

    <g transform="translate(0, 5)">
      <path d="M 110 220 C 180 232 320 232 390 220 L 380 276 C 310 288 190 288 120 276 Z" fill="url(#goldGrad)"/>
      <path d="M 114 224 C 182 235 318 235 386 224 L 377 272 C 308 284 192 284 123 272 Z" fill="url(#redGrad)"/>
      <text x="250" y="259" font-family="'Plus Jakarta Sans', 'Arial Black', sans-serif" font-weight="900" font-size="34" fill="#ffffff" text-anchor="middle" letter-spacing="9">
        MASALA
      </text>
      <polygon points="144,250 149,255 144,260 139,255" fill="url(#goldGrad)"/>
      <polygon points="356,250 361,255 356,260 351,255" fill="url(#goldGrad)"/>
    </g>
  </g>
</svg>`;

export const JAMAVAT_LOGO_URL = '/jamavat-logo.svg';

export const JAMAVAT_LOGO_DATA_URL = `data:image/svg+xml;utf8,${encodeURIComponent(JAMAVAT_LOGO_SVG_RAW)}`;

interface JamavatLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  height?: number | string;
  width?: number | string;
  alt?: string;
}

export const JamavatLogo: React.FC<JamavatLogoProps> = ({
  className = '',
  size = 'md',
  height,
  width,
  alt = 'Jamavat Masala Official Logo'
}) => {
  let sizeClasses = 'h-10 w-auto'; // default navbar height ~40px

  switch (size) {
    case 'xs': // ID card ~28px
      sizeClasses = 'h-7 sm:h-8 w-auto';
      break;
    case 'sm': // Navbar ~36px
      sizeClasses = 'h-8 sm:h-9 w-auto';
      break;
    case 'md': // Sidebar ~44px
      sizeClasses = 'h-10 sm:h-12 w-auto';
      break;
    case 'lg': // Header / Modals ~60px
      sizeClasses = 'h-14 sm:h-16 w-auto';
      break;
    case 'xl': // Login page ~100-120px
      sizeClasses = 'h-24 sm:h-28 md:h-32 w-auto';
      break;
    case 'custom':
      sizeClasses = '';
      break;
  }

  const styleObj: React.CSSProperties = {};
  if (height) styleObj.height = typeof height === 'number' ? `${height}px` : height;
  if (width) styleObj.width = typeof width === 'number' ? `${width}px` : width;

  return (
    <img
      src={JAMAVAT_LOGO_URL}
      alt={alt}
      referrerPolicy="no-referrer"
      className={`object-contain transition-all drop-shadow-md select-none shrink-0 ${sizeClasses} ${className}`}
      style={styleObj}
    />
  );
};
