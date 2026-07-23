/**
 * @license
 * Version 1.0.0
 * Jamavat Masala ERP - Shop Navigation Utility Functions
 */

import { Order, Shop } from '../types/erp';

export type ShopNavigationResult =
  | { status: 'NAVIGATE'; url: string; shop: Shop }
  | { status: 'SHOP_DELETED' }
  | { status: 'LOCATION_UNAVAILABLE'; shop: Shop };

/**
 * Dynamically resolves the current navigation state and Google Maps URL for an order
 * directly from the live `shops` array without caching old locations.
 */
export function resolveOrderNavigation(
  order: Order,
  shops: Shop[]
): ShopNavigationResult {
  // 1. Look up shop by Shop ID first, fallback to shop name match
  let targetShop = shops.find(s => s.id === order.shopId);
  if (!targetShop && order.shopName) {
    targetShop = shops.find(
      s => s.name.trim().toLowerCase() === order.shopName.trim().toLowerCase()
    );
  }

  // 2. If shop does not exist or is archived/deleted
  if (!targetShop || targetShop.status === 'Archived') {
    return { status: 'SHOP_DELETED' };
  }

  // 3. Priority 1: If valid Latitude and Longitude exist on active shop record
  if (
    typeof targetShop.latitude === 'number' &&
    typeof targetShop.longitude === 'number' &&
    !isNaN(targetShop.latitude) &&
    !isNaN(targetShop.longitude) &&
    (targetShop.latitude !== 0 || targetShop.longitude !== 0)
  ) {
    const coordsUrl = `https://www.google.com/maps/dir/?api=1&destination=${targetShop.latitude},${targetShop.longitude}`;
    return { status: 'NAVIGATE', url: coordsUrl, shop: targetShop };
  }

  // 4. Priority 2: If Google Maps Link exists on active shop record
  if (targetShop.googleMapsLink && targetShop.googleMapsLink.trim().length > 0) {
    const rawLink = targetShop.googleMapsLink.trim();
    const finalUrl = rawLink.startsWith('http')
      ? rawLink
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(rawLink)}`;
    return { status: 'NAVIGATE', url: finalUrl, shop: targetShop };
  }

  // 5. Priority 3: Neither coordinates nor link exist
  return { status: 'LOCATION_UNAVAILABLE', shop: targetShop };
}

/**
 * Handles navigation click for an order with toast or missing shop modal trigger callback
 */
export function handleOrderNavigationClick(
  order: Order,
  shops: Shop[],
  options: {
    onShopDeleted: (order: Order) => void;
    onLocationUnavailable: (shop: Shop) => void;
    onNavigateSuccess?: (url: string) => void;
  }
) {
  const result = resolveOrderNavigation(order, shops);

  if (result.status === 'SHOP_DELETED') {
    options.onShopDeleted(order);
  } else if (result.status === 'LOCATION_UNAVAILABLE') {
    options.onLocationUnavailable(result.shop);
  } else if (result.status === 'NAVIGATE') {
    window.open(result.url, '_blank');
    if (options.onNavigateSuccess) {
      options.onNavigateSuccess(result.url);
    }
  }
}
