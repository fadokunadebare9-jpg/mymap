import { CFG } from "./data";

// Geometry
export const rad = d => d * Math.PI / 180;
export function haversine(a, b) { // metres
  const x = Math.sin(rad(b.lat - a.lat) / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(rad(b.lng - a.lng) / 2) ** 2;
  return 12742000 * Math.asin(Math.sqrt(x));
}
export function segInfo(p, a, b) { // distance (m) from p to segment ab, and position t along it
  const k = 111320, cx = Math.cos(rad(a.lat)), f = q => [(q.lng - a.lng) * k * cx, (q.lat - a.lat) * k];
  const [px, py] = f(p), [bx, by] = f(b), t = Math.max(0, Math.min(1, (px * bx + py * by) / (bx * bx + by * by || 1)));
  return { d: Math.hypot(px - bx * t, py - by * t), t };
}
export const compass = (a, b) => ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][Math.round(((Math.atan2(b.lng - a.lng, b.lat - a.lat) * 180 / Math.PI + 360) % 360) / 45) % 8];
export const fmtDist = m => m >= 1000 ? (m / 1000).toFixed(2) + " km" : Math.round(m) + " m";
export const walkMin = m => Math.max(1, Math.round(m * CFG.detour / CFG.walkMpm));
export const isMobile = () => matchMedia("(max-width:799px)").matches;
