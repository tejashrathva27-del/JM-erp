/**
 * Jamavat Masala ERP - Route Optimization & GPS Utilities
 */

import { Order, Shop } from '../types/erp';

// Jamavat Masala Central Depot / Factory (Anand, Gujarat)
export const JAMAVAT_DEPOT = {
  name: 'Jamavat Masala Central Factory',
  address: 'GIDC Industrial Estate, Anand - 388001, Gujarat',
  latitude: 22.5645,
  longitude: 72.9289,
};

/**
 * Calculates straight-line distance between two coordinates in kilometers using Haversine formula
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return Math.round(d * 10) / 10; // Round to 1 decimal place
}

/**
 * Estimates driving time based on distance (assuming ~32 km/h average speed in urban/semi-urban routes) + 12 min buffer per stop
 */
export function estimateDrivingDuration(distanceKm: number, stopsCount: number = 1): number {
  const travelMins = (distanceKm / 32) * 60;
  const stopsMins = stopsCount * 12;
  return Math.round(travelMins + stopsMins);
}

/**
 * Nearest Neighbor Traveling Salesperson Optimization algorithm
 * Orders the assigned deliveries starting from Depot/Current Location to minimize total distance
 */
export function optimizeDeliverySequence(
  orders: Order[],
  startLat: number = JAMAVAT_DEPOT.latitude,
  startLng: number = JAMAVAT_DEPOT.longitude
): {
  optimizedOrders: Order[];
  totalDistanceKm: number;
  totalEstimatedMins: number;
} {
  if (!orders || orders.length === 0) {
    return { optimizedOrders: [], totalDistanceKm: 0, totalEstimatedMins: 0 };
  }

  const unvisited = [...orders];
  const route: Order[] = [];
  let currentLat = startLat;
  let currentLng = startLng;
  let totalDistanceKm = 0;

  let seq = 1;

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < unvisited.length; i++) {
      const shopLat = unvisited[i].latitude || JAMAVAT_DEPOT.latitude;
      const shopLng = unvisited[i].longitude || JAMAVAT_DEPOT.longitude;
      const dist = calculateHaversineDistance(currentLat, currentLng, shopLat, shopLng);

      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nextOrder = unvisited.splice(nearestIdx, 1)[0];
    const orderDist = nearestDist === Infinity ? 0 : nearestDist;
    totalDistanceKm += orderDist;

    currentLat = nextOrder.latitude || currentLat;
    currentLng = nextOrder.longitude || currentLng;

    route.push({
      ...nextOrder,
      deliverySequence: seq++,
      distanceKm: orderDist,
    });
  }

  const roundedDistance = Math.round(totalDistanceKm * 10) / 10;
  const totalMins = estimateDrivingDuration(roundedDistance, route.length);

  return {
    optimizedOrders: route,
    totalDistanceKm: roundedDistance,
    totalEstimatedMins: totalMins,
  };
}

/**
 * Generates a Google Maps Navigation URL for a single shop or full route
 */
export function getGoogleMapsNavigationUrl(shop: {
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
  shopAddress?: string;
  address?: string;
}): string {
  if (shop.latitude && shop.longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}&travelmode=driving`;
  }
  if (shop.googleMapsLink && shop.googleMapsLink.startsWith('http')) {
    return shop.googleMapsLink;
  }
  const addr = shop.shopAddress || shop.address || '';
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addr)}`;
}

/**
 * Generates Google Maps Multi-stop directions URL
 */
export function getMultiStopDirectionsUrl(
  orders: Order[],
  startLat: number = JAMAVAT_DEPOT.latitude,
  startLng: number = JAMAVAT_DEPOT.longitude
): string {
  if (orders.length === 0) return `https://www.google.com/maps`;

  const waypoints = orders
    .slice(0, -1)
    .map(o => (o.latitude && o.longitude ? `${o.latitude},${o.longitude}` : encodeURIComponent(o.shopAddress)))
    .join('|');

  const destinationOrder = orders[orders.length - 1];
  const destStr = destinationOrder.latitude && destinationOrder.longitude
    ? `${destinationOrder.latitude},${destinationOrder.longitude}`
    : encodeURIComponent(destinationOrder.shopAddress);

  return `https://www.google.com/maps/dir/?api=1&origin=${startLat},${startLng}&destination=${destStr}&waypoints=${waypoints}&travelmode=driving`;
}
