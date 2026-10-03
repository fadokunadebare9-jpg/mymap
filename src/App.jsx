import { useState, useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "./theme.css";
import { CFG, EMERGENCY, CATS, RECAT, HUBS, SHUTTLE, DEFAULT_PLACES, HALLS, FAC, COURSES, dId, photoURL } from "./data";
import { ICONS, svg } from "./icons";
import Weather from "./Weather.jsx";
import { haversine, segInfo, compass, fmtDist, walkMin, isMobile } from "./helpers";

/* ---------- Small helpers (outside the component, so they never re-run) ---------- */

// A React version of the icon. Use it like <Icon name="book" size={18} />
const Icon = ({ name, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
    strokeLinecap="round" strokeLinejoin="round" dangerouslySetInnerHTML={{ __html: ICONS[name] }} />
);

const USER_KEY = CFG.storeKey + "-user";
const readJSON = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
const writeJSON = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

// Places are cached in localStorage so search still works with poor data
function loadPlaces() {
  const cache = readJSON(CFG.storeKey, null);
  const rows = cache && cache.v === CFG.dataVersion ? cache.rows : DEFAULT_PLACES;
  const saved = writeJSON(CFG.storeKey, { v: CFG.dataVersion, rows, at: Date.now() });
  const places = rows.map(([id, name, cat, lat, lng, tag, desc, kw]) => ({
    id, name, cat: RECAT[id] || (id.startsWith("bk-") ? "bank" : cat), lat, lng, tag, desc, kw
  }));
  readJSON(USER_KEY, []).forEach(p => { if (CATS[p.cat]) places.push(p); });
  return { places, saved };
}

// Does a place match the chosen category chip and the search text?
const matchPlace = (p, cat, q) =>
  (cat ? p.cat === cat : (p.cat !== "dept" || q.trim())) &&
  (!q.trim() || q.toLowerCase().split(/\s+/).every(w => `${p.name} ${p.kw} ${p.tag} ${CATS[p.cat].label}`.toLowerCase().includes(w)));

// Leaflet draws pins and popups from HTML strings, so these two stay as strings
function pinIcon(p) {
  const c = CATS[p.cat];
  return L.divIcon({
    className: "", iconSize: [36, 45], iconAnchor: [18, 45], popupAnchor: [0, -42],
    html: `<div style="--c:${c.color}">${HUBS.includes(p.id) ? '<span class="ring"></span>' : ""}<div class="pin ${c.dark ? "dark" : ""}" style="--c:${c.color}">${svg(c.icon, 18)}</div></div>`
  });
}
function popupHTML(p, ps) {
  const c = CATS[p.cat];
  const walk = p.id === "ps" ? "You are at the hub" : `${walkMin(haversine(ps, p))} min walk from PS Bus Stop`;
  return `<div class="pop" style="--c:${c.color}">
    <div class="thumb">${svg(c.icon, 34)}<small>Photo coming soon</small>${photoURL(p.id) ? `<img src="${photoURL(p.id)}" alt="${p.name}" loading="lazy" onerror="this.remove()">` : ""}</div>
    <div class="in"><span class="badge">${p.tag}</span><h3>${p.name}</h3><p>${p.desc}</p>
    <div class="meta">${svg("walk", 15)} ${walk}</div>
    <button class="btn gold" data-act="to" data-id="${p.id}">${svg("nav", 16)} Navigate Here</button>
    <button class="btn ghost" data-act="from" data-id="${p.id}">Start here</button>
    ${p.custom ? `<button class="btn ghost" data-act="del" data-id="${p.id}">Remove my pin</button>` : ""}</div></div>`;
}

// Accounts (stored on this device only)
const AK = CFG.storeKey + "-accounts", SK = CFG.storeKey + "-session";
async function hashPw(pw, salt) {
  if (!crypto?.subtle) return btoa(unescape(encodeURIComponent(salt + pw)));
  const b = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(salt + pw));
  return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, "0")).join("");
}
function restoreSession() {
  const s = readJSON(SK, null); if (!s) return null;
  if (s.guest) return { guest: 1, name: "Guest" };
  const a = readJSON(AK, {})[s.email];
  return a ? { email: s.email, name: a.name, fac: a.fac, lvl: a.lvl } : null;
}

const TABS = [["explore", "Explore"], ["courses", "Courses"], ["route", "Route"], ["weather", "Weather"], ["tools", "Tools"]];
const TAB_ICONS = { explore: "search", courses: "book", route: "nav", weather: "weather", tools: "tools" };
const LEVELS = [0, 100, 200, 300, 400, 500, 600];

/* ---------- School logo: put your file at public/logo.png (falls back to a "U" badge) ---------- */
function Logo({ size = 44 }) {
  const [ok, setOk] = useState(true);
  return ok
    ? <img className="logo" src="/logo.png" alt="University of Ilorin logo" style={{ width: size, height: size }} onError={() => setOk(false)} />
    : <div className="crest" style={{ width: size, height: size }}>U</div>;
}

/* ---------- A reusable list row ---------- */
function PlaceItem({ p, onPick }) {
  const c = CATS[p.cat];
  return (
    <li>
      <button className="item" onClick={() => onPick(p.id)}>
        <span className={"ico" + (c.dark ? " dark" : "")} style={{ "--c": c.color }}><Icon name={c.icon} size={18} /></span>
        <div><b>{p.name}</b><span>{p.tag}</span></div>
      </button>
    </li>
  );
}

/* =========================================================================
   THE APP
   ========================================================================= */
export default function App() {
  /* ----- State: anything that changes what's on screen ----- */
  const [init] = useState(loadPlaces);
  const [places, setPlaces] = useState(init.places);
  const [user, setUser] = useState(restoreSession);             // null = show sign-in screen
  const [tab, setTab] = useState("explore");
  const [panelOpen, setPanelOpen] = useState(true);
  const [cat, setCat] = useState(null);                         // selected category chip
  const [q, setQ] = useState("");                               // search text
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [cq, setCq] = useState("");                             // course search
  const [cFac, setCFac] = useState(() => (user && !user.guest && user.fac) || "");
  const [cLvl, setCLvl] = useState(() => (user && !user.guest && +user.lvl) || 0);
  const [routeFrom, setRouteFrom] = useState("ps");
  const [routeTo, setRouteTo] = useState("library");
  const [mode, setMode] = useState("walk");
  const [result, setResult] = useState(null);
  const [userPos, setUserPos] = useState(null);
  const [locating, setLocating] = useState(false);
  const [shuttleOn, setShuttleOn] = useState(false);
  const [hall, setHall] = useState("");
  const [hallOut, setHallOut] = useState("Enter a course code and press Enter.");
  const [toastMsg, setToastMsg] = useState("");
  const [toastOn, setToastOn] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCat, setAddCat] = useState(Object.keys(CATS)[0]);
  const [addDesc, setAddDesc] = useState("");
  const [authMode, setAuthMode] = useState("in");               // "in" or "reg"
  const [aName, setAName] = useState(""); const [aFac, setAFac] = useState(""); const [aLvl, setALvl] = useState("");
  const [aEmail, setAEmail] = useState(""); const [aPw, setAPw] = useState(""); const [aErr, setAErr] = useState("");

  /* ----- Refs: things we keep between renders WITHOUT re-rendering ----- */
  const mapEl = useRef(null), panel = useRef(null), handle = useRef(null);
  const map = useRef(null), markerLayer = useRef(null), markers = useRef(new Map());
  const routeLayer = useRef(null), userLayer = useRef(null), shuttleLayer = useRef(null);
  const routeEnds = useRef({ from: null, to: null });
  const ui = useRef({ y: 0, state: "half" });                  // mobile bottom-sheet position
  const toastTimer = useRef(), addPos = useRef(), pendingFocus = useRef(null);
  const sosDlg = useRef(), addDlg = useRef();
  const placesRef = useRef(places); placesRef.current = places;
  const act = useRef({}); // always holds the newest functions, for Leaflet/DOM listeners that live outside React

  const byId = id => placesRef.current.find(p => p.id === id);
  const pick = id => (id === "me" ? userPos : byId(id));

  function toast(msg) {
    setToastMsg(msg); setToastOn(true);
    clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToastOn(false), 4000);
  }

  /* ----- Panel (desktop sidebar + mobile bottom sheet) ----- */
  const points = () => { const h = panel.current.offsetHeight; return { full: 0, half: h * .5, peek: h - 96 }; };
  function snap(name) {
    const u = ui.current; u.state = name; u.y = points()[name];
    panel.current.classList.remove("drag"); panel.current.style.transform = `translateY(${u.y}px)`;
  }
  function openPanel(o) { setPanelOpen(o); setTimeout(() => map.current?.invalidateSize(), 360); }
  function goTab(n) {
    setTab(n);
    if (isMobile()) { const u = ui.current; snap(u.y > 0 && u.y > panel.current.offsetHeight * .6 ? "half" : u.state === "full" ? "full" : "half"); }
    else openPanel(true);
  }

  /* ----- Map actions ----- */
  function focusPlace(id, opts = {}) {
    const p = byId(id), m = markers.current.get(id); if (!p || !m) return;
    if (!markerLayer.current.hasLayer(m)) markerLayer.current.addLayer(m);
    setSuggestOpen(false);
    if (isMobile()) snap("peek");
    map.current.flyTo([p.lat, p.lng], 18, { duration: .8 });
    map.current.once("moveend", () => {
      m.openPopup();
      const el = m.getElement()?.querySelector(".pin");
      if (el && opts.pulse) { el.classList.add("hot"); setTimeout(() => el.classList.remove("hot"), 4000); }
    });
  }

  function drawRoute(a, b, m) {
    if (!a || !b) return;
    if (a.id === b.id) return toast("Origin and destination are the same.");
    routeLayer.current?.remove();
    const pts = [[a.lat, a.lng], [b.lat, b.lng]];
    routeLayer.current = L.layerGroup([
      L.polyline(pts, { color: "#002147", weight: 10, opacity: .3 }),
      L.polyline(pts, { color: "#D4AF37", weight: 5, className: "route-line", lineCap: "round" }),
      L.circleMarker(pts[0], { radius: 8, color: "#fff", weight: 3, fillColor: "#2E7D32", fillOpacity: 1 }),
      L.circleMarker(pts[1], { radius: 8, color: "#fff", weight: 3, fillColor: "#C62828", fillOpacity: 1 })
    ]).addTo(map.current);
    map.current.fitBounds(L.latLngBounds(pts).pad(.5), { maxZoom: 18 });
    if (isMobile()) snap("peek");

    const metres = haversine(a, b) * CFG.detour;
    const mins = m === "walk" ? walkMin(haversine(a, b)) : Math.round(CFG.shuttleWaitMin + metres / CFG.shuttleMpm);
    const via = placesRef.current.filter(p => p.id !== a.id && p.id !== b.id)
      .map(p => ({ p, ...segInfo(p, a, b) })).filter(o => o.d < 90 && o.t > .1 && o.t < .9)
      .sort((x, y) => x.t - y.t).slice(0, 3).map(o => ({ name: o.p.name, at: o.t * metres }));
    routeEnds.current = { from: a, to: b };
    setResult({ a, b, mode: m, mins, metres, via, dir: compass(a, b) });
    setRouteFrom(a.id); setRouteTo(b.id);
  }
  function clearRoute() { routeLayer.current?.remove(); routeLayer.current = null; setResult(null); }

  function locate() {
    if (!navigator.geolocation) return toast("Your browser doesn't support location.");
    setLocating(true);
    navigator.geolocation.getCurrentPosition(g => {
      setLocating(false);
      const { latitude: lat, longitude: lng, accuracy } = g.coords;
      setUserPos({ id: "me", name: "My location", lat, lng });
      userLayer.current?.remove();
      userLayer.current = L.layerGroup([
        L.circle([lat, lng], { radius: accuracy, color: "#1a73e8", weight: 1, fillOpacity: .1 }),
        L.marker([lat, lng], { icon: L.divIcon({ className: "", iconSize: [18, 18], html: '<div style="--c:#1a73e8"><span class="ring"></span><div class="me"></div></div>' }) }).bindTooltip("You are here")
      ]).addTo(map.current);
      if (L.latLngBounds(CFG.bounds).contains([lat, lng])) map.current.flyTo([lat, lng], 17);
      else toast("You're off campus, so your position is outside this map.");
    }, err => {
      setLocating(false);
      toast(err.code === 1 ? "Location blocked. Allow it in browser settings." : "Couldn't get your location. Try outdoors.");
    }, { enableHighAccuracy: true, timeout: 12000 });
  }

  function toggleShuttle() {
    const on = !shuttleOn; setShuttleOn(on);
    if (on) toast("Shuttle loop (illustrative): " + SHUTTLE.map(id => byId(id).name.split(" (")[0]).join(" → "));
  }

  // Buttons inside Leaflet popups ("Navigate Here", "Start here", "Remove my pin")
  act.current.popupAction = (kind, id) => {
    const p = byId(id); if (!p) return;
    if (kind === "del") { map.current.closePopup(); removePlace(p.id); return; }
    const ends = routeEnds.current;
    if (kind === "to") {
      const from = ends.from && ends.from.id !== p.id ? ends.from : (userPos || byId("ps"));
      map.current.closePopup(); drawRoute(from, p, mode);
    } else {
      routeEnds.current = { ...ends, from: p }; setRouteFrom(p.id);
      map.current.closePopup(); drawRoute(p, ends.to, mode);
    }
    goTab("route");
  };

  /* ----- Add / remove your own pins ----- */
  function addStart() {
    if (isMobile()) snap("peek");
    toast("Tap the map where the place is");
    map.current.once("click", e => { addPos.current = e.latlng; addDlg.current.showModal(); });
  }
  function addSave() {
    const name = addName.trim();
    if (!name) return toast("Please give the place a name.");
    const p = { id: "u" + Date.now(), name, cat: addCat, lat: addPos.current.lat, lng: addPos.current.lng,
      tag: CATS[addCat].label, desc: addDesc.trim() || "Added by a student.", kw: "", custom: 1 };
    setPlaces(prev => [...prev, p]);
    pendingFocus.current = p.id;                       // fly to it once its marker exists
    if (!writeJSON(USER_KEY, [...readJSON(USER_KEY, []), p])) toast("Couldn't save on this device, so the pin will vanish on reload.");
    addDlg.current.close(); setAddName(""); setAddDesc("");
  }
  function removePlace(id) {
    setPlaces(prev => prev.filter(p => p.id !== id));
    writeJSON(USER_KEY, readJSON(USER_KEY, []).filter(p => p.id !== id));
    if (routeFrom === id) setRouteFrom("ps");
    if (routeTo === id) setRouteTo("library");
    toast("Pin removed.");
  }
  function exportPins() {
    const rows = readJSON(USER_KEY, []).map(p => [p.id, p.name, p.cat, +p.lat.toFixed(5), +p.lng.toFixed(5), p.tag, p.desc, p.kw]);
    if (!rows.length) return toast("You haven't added any pins yet.");
    navigator.clipboard?.writeText(rows.map(r => "  " + JSON.stringify(r)).join(",\n"))
      .then(() => toast("Copied. Paste the rows into DEFAULT_PLACES."), () => toast("Copy failed."));
  }

  /* ----- Lecture hall finder ----- */
  function findHall(e) {
    if (e.key !== "Enter") return;
    const raw = hall.trim(), letters = (raw.toUpperCase().match(/^[A-Z]+/) || [""])[0];
    const hit = HALLS.find(([re]) => re.test(letters));
    if (hit) {
      const p = byId(hit[1]);
      setHallOut(<><b>{raw.toUpperCase()}</b> classes are usually at <b>{p.name}</b>, about {walkMin(haversine(byId("ps"), p))} min from PS. Your timetable has the final room.</>);
      focusPlace(p.id, { pulse: true });
    } else {
      const p = placesRef.current.find(x => `${x.name} ${x.kw}`.toLowerCase().includes(raw.toLowerCase()));
      setHallOut(p && raw ? `No course-code match, but found ${p.name}.` : "No match yet. Try a code like CIS 101, GST 111 or FET 201.");
      if (p && raw) focusPlace(p.id);
    }
  }

  /* ----- Sign in / register / guest ----- */
  function enter(u, remember = true) {
    setUser(u); setAPw("");
    if (remember) writeJSON(SK, u.guest ? { guest: 1 } : { email: u.email });
    if (!u.guest && (u.fac || u.lvl)) { setCFac(u.fac || ""); setCLvl(+u.lvl || 0); }  // pre-filter Courses
  }
  function signOut() {
    try { localStorage.removeItem(SK); } catch { /* ignore */ }
    setUser(null); setAEmail(""); setAuthMode("in"); setAErr("");
  }
  async function submitAuth(e) {
    e.preventDefault();
    const email = aEmail.trim().toLowerCase(), all = readJSON(AK, {});
    if (!/^\S+@\S+\.\S+$/.test(email)) return setAErr("Enter a valid email address.");
    if (aPw.length < 6) return setAErr("Password must be at least 6 characters.");
    if (authMode === "reg") {
      const name = aName.trim(); if (!name) return setAErr("Please enter your name.");
      if (all[email]) return setAErr("That email is already registered. Try signing in.");
      const salt = crypto.getRandomValues(new Uint8Array(8)).join("");
      all[email] = { name, fac: aFac, lvl: aLvl, salt, h: await hashPw(aPw, salt) };
      if (!writeJSON(AK, all)) return setAErr("Couldn't save your account on this device.");
      enter({ email, name, fac: aFac, lvl: aLvl });
    } else {
      const a = all[email];
      if (!a || a.h !== await hashPw(aPw, a.salt)) return setAErr("Wrong email or password. New here? Tap Register.");
      enter({ email, name: a.name, fac: a.fac, lvl: a.lvl });
    }
    setAErr("");
  }

  /* =======================================================================
     EFFECTS: code that talks to things outside React (Leaflet, window)
     ======================================================================= */

  // 1) Create the map ONCE
  useEffect(() => {
    const m = L.map(mapEl.current, { center: CFG.center, zoom: CFG.zoom, minZoom: CFG.minZoom, maxZoom: CFG.maxZoom, maxBounds: CFG.bounds, maxBoundsViscosity: .9, zoomControl: false });
    L.control.zoom({ position: "bottomright" }).addTo(m);
    L.tileLayer(`https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=${CFG.cartoKey}`, {
      maxZoom: 19, attribution: '&copy; OpenStreetMap contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(m);
    map.current = m; markerLayer.current = L.layerGroup().addTo(m);

    const line = SHUTTLE.map(id => [byId(id).lat, byId(id).lng]);
    shuttleLayer.current = L.layerGroup([
      L.polyline(line, { color: "#2E7D32", weight: 10, opacity: .25 }),
      L.polyline(line, { color: "#2E7D32", weight: 4, className: "shuttle-line" }),
      ...[...new Set(SHUTTLE)].map(id => L.circleMarker([byId(id).lat, byId(id).lng], { radius: 6, color: "#fff", weight: 2, fillColor: "#2E7D32", fillOpacity: 1 }).bindTooltip(byId(id).name + " (stop)"))
    ]);
    return () => { m.remove(); markers.current.clear(); map.current = null; };
  }, []);

  // 2) Keep map pins in sync with the places list and the current filter
  useEffect(() => {
    const ids = new Set(places.map(p => p.id));
    const ps = places.find(p => p.id === "ps");
    places.forEach(p => {
      if (!markers.current.has(p.id))
        markers.current.set(p.id, L.marker([p.lat, p.lng], { icon: pinIcon(p), title: p.name })
          .bindPopup(popupHTML(p, ps), { maxWidth: 250, autoPanPaddingTopLeft: [20, 70], autoPanPaddingBottomRight: [20, 120] }));
    });
    markers.current.forEach((m, id) => { if (!ids.has(id)) { markerLayer.current.removeLayer(m); markers.current.delete(id); } });
    const effCat = cat && places.some(p => p.cat === cat) ? cat : null;
    markerLayer.current.clearLayers();
    places.filter(p => matchPlace(p, effCat, q)).forEach(p => markerLayer.current.addLayer(markers.current.get(p.id)));
    if (pendingFocus.current) { focusPlace(pendingFocus.current); pendingFocus.current = null; }
  }, [places, cat, q]);

  // 3) Show / hide the shuttle loop
  useEffect(() => { shuttleOn ? shuttleLayer.current.addTo(map.current) : shuttleLayer.current.remove(); }, [shuttleOn]);

  // 4) Popup buttons, clicks outside the search box, resize, online/offline
  useEffect(() => {
    const onClick = e => { const b = e.target.closest("[data-act]"); if (b) act.current.popupAction(b.dataset.act, b.dataset.id); };
    const onDown = e => { if (!e.target.closest(".search")) setSuggestOpen(false); };
    const onResize = () => { if (isMobile()) snap(ui.current.state); else panel.current.style.transform = ""; };
    const off = () => toast("You're offline. Landmark info and search still work.");
    const on = () => toast("Back online.");
    document.addEventListener("click", onClick); document.addEventListener("pointerdown", onDown);
    addEventListener("resize", onResize); addEventListener("offline", off); addEventListener("online", on);
    isMobile() ? snap("half") : openPanel(true);
    return () => {
      document.removeEventListener("click", onClick); document.removeEventListener("pointerdown", onDown);
      removeEventListener("resize", onResize); removeEventListener("offline", off); removeEventListener("online", on);
    };
  }, []);

  // 5) Drag the mobile bottom sheet (pointer events work for touch and mouse)
  useEffect(() => {
    const h = handle.current; let sy = null, y0 = 0, lastY = 0, lastT = 0, v = 0;
    const down = e => {
      if (!isMobile() || e.target.closest("button")) return;
      h.setPointerCapture(e.pointerId); sy = e.clientY; y0 = ui.current.y; lastY = sy; lastT = e.timeStamp; panel.current.classList.add("drag");
    };
    const move = e => {
      if (sy == null) return;
      ui.current.y = Math.min(points().peek, Math.max(0, y0 + e.clientY - sy));
      panel.current.style.transform = `translateY(${ui.current.y}px)`;
      v = (e.clientY - lastY) / Math.max(1, e.timeStamp - lastT); lastY = e.clientY; lastT = e.timeStamp;
    };
    const end = () => {
      if (sy == null) return; sy = null;
      const pts = points(), y = ui.current.y + v * 180;
      snap(Object.keys(pts).reduce((a, k) => Math.abs(pts[k] - y) < Math.abs(pts[a] - y) ? k : a));
    };
    h.addEventListener("pointerdown", down); h.addEventListener("pointermove", move);
    h.addEventListener("pointerup", end); h.addEventListener("pointercancel", end);
    return () => { h.removeEventListener("pointerdown", down); h.removeEventListener("pointermove", move); h.removeEventListener("pointerup", end); h.removeEventListener("pointercancel", end); };
  }, []);

  /* =======================================================================
     VALUES WORKED OUT FROM STATE (recalculated on every render)
     ======================================================================= */
  const present = new Set(places.map(p => p.cat));
  const effCat = cat && present.has(cat) ? cat : null;
  const results = places.filter(p => matchPlace(p, effCat, q));
  const showSuggest = suggestOpen && q.trim() && results.length > 0;

  const ws = cq.toLowerCase().split(/\s+/).filter(Boolean);
  const courses = COURSES.filter(([f, n, d, y]) => (!cFac || f === cFac) && y * 100 >= cLvl && ws.every(w => `${n} ${d} ${FAC[f][0]}`.toLowerCase().includes(w)));

  const placeOptions = places.map(p => <option key={p.id} value={p.id}>{p.name}</option>);
  const facOptions = Object.entries(FAC).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>);

  const chooseChip = k => {
    const next = k || null; setCat(next);
    const r = places.filter(p => matchPlace(p, next, q));
    if (r.length > 1) map.current.flyToBounds(L.latLngBounds(r.map(p => [p.lat, p.lng])).pad(.3), { maxZoom: 17, duration: .6 });
  };

  /* =======================================================================
     WHAT YOU SEE (JSX)
     ======================================================================= */
  return (
    <>
      <div id="map" ref={mapEl} aria-label="UNILORIN campus map"></div>

      <div className="fabs">
        <button className="fab sos" aria-label="Emergency contacts" onClick={() => sosDlg.current.showModal()}>SOS</button>
        <button className={"fab" + (locating ? " busy" : "")} aria-label="Find my location" title="Find my location" onClick={locate}>
          <span><Icon name="loc" size={22} /></span>
        </button>
        <button className="fab" aria-pressed={shuttleOn} aria-label="Show shuttle loop" title="Shuttle loop" onClick={toggleShuttle}>
          <span><Icon name="layers" size={22} /></span>
        </button>
      </div>
      <button className={"fab" + (panelOpen ? "" : " show")} id="openPanel" onClick={() => openPanel(true)}>Open guide</button>

      <aside className={"panel" + (panelOpen ? "" : " closed")} ref={panel}>
        <div className="handle" ref={handle}>
          <div className="grip"></div>
          <div className="head">
            <Logo size={44} />
            <div>
              <h1>UNILORIN Smart Map</h1>
              <small>{user ? (user.guest ? "Browsing as guest" : `Hi, ${user.name.split(" ")[0]}${user.lvl ? " · " + user.lvl + "L" : ""}`) : "Better by Far · guide for freshers"}</small>
            </div>
            <button className="x" aria-label="Collapse guide" onClick={() => openPanel(false)}>‹</button>
          </div>
        </div>

        <div className="tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} className="tab" role="tab" aria-selected={tab === id} onClick={() => goTab(id)}>{label}</button>
          ))}
        </div>

        <div className="body">
          {/* ---------- EXPLORE ---------- */}
          <section className="view" hidden={tab !== "explore"}>
            <div className="search">
              <Icon name="search" size={18} />
              <input type="search" placeholder="Search library, Village, ATM, clinic…" autoComplete="off" aria-label="Search landmarks"
                value={q} onChange={e => { setQ(e.target.value); setSuggestOpen(true); }} onFocus={() => setSuggestOpen(true)}
                onKeyDown={e => { if (e.key === "Enter") { const f = places.find(p => matchPlace(p, effCat, q)); if (f) focusPlace(f.id); } }} />
              <ul className={"suggest" + (showSuggest ? " open" : "")} role="listbox">
                {results.slice(0, 6).map(p => <PlaceItem key={p.id} p={p} onPick={focusPlace} />)}
              </ul>
            </div>
            <div className="chips">
              {[["", "All"], ...Object.entries(CATS).filter(([k]) => present.has(k)).map(([k, c]) => [k, c.label])].map(([k, label]) => (
                <button key={k} className="chip" aria-pressed={(effCat || "") === k} onClick={() => chooseChip(k)}>{label}</button>
              ))}
            </div>
            {!effCat && !q.trim() && (
              <div className="quick">
                {[["learning", "Library & lectures"], ["food", "Food"], ["bank", "Banks & ATMs"], ["medical", "Clinic"], ["hostel", "Hostels"], ["transit", "Transport"]].map(([k, l]) => (
                  <button key={k} className="qt" onClick={() => chooseChip(k)}>
                    <span className={"ico" + (CATS[k].dark ? " dark" : "")} style={{ "--c": CATS[k].color }}><Icon name={CATS[k].icon} size={20} /></span>{l}
                  </button>
                ))}
              </div>
            )}
            <div className="count" aria-live="polite">{results.length} place{results.length === 1 ? "" : "s"}</div>
            <ul className="list">
              {results.length ? results.map(p => <PlaceItem key={p.id} p={p} onPick={focusPlace} />)
                : <li className="empty">No match. Try another word or pick "All".</li>}
            </ul>
          </section>

          {/* ---------- COURSES ---------- */}
          <section className="view" hidden={tab !== "courses"}>
            <input className="field" type="search" placeholder="Search a course, e.g. Nursing, Law, Civil" autoComplete="off"
              aria-label="Search courses" value={cq} onChange={e => setCq(e.target.value)} />
            <div className="chips" aria-label="Level">
              {LEVELS.map(l => <button key={l} className="chip" aria-pressed={cLvl === l} onClick={() => setCLvl(l)}>{l ? l + "L" : "All levels"}</button>)}
            </div>
            <select aria-label="Faculty" value={cFac} onChange={e => setCFac(e.target.value)}>
              <option value="">All faculties</option>{facOptions}
            </select>
            <div className="count" aria-live="polite" style={{ marginTop: 10 }}>{courses.length} course{courses.length === 1 ? "" : "s"}</div>
            <ul className="list">
              {courses.length ? courses.map(([f, n, d, y]) => (
                <li key={n}>
                  <button className="item" onClick={() => focusPlace(dId(n))}>
                    <span className="ico" style={{ "--c": CATS.dept.color }}><Icon name="book" size={18} /></span>
                    <div><b>{n}</b><span>{d} · {y} yrs (100L–{y * 100}L) · {FAC[f][0]}</span></div>
                  </button>
                </li>
              )) : <li className="empty">No course matches. Clear the filters or try another word.</li>}
            </ul>
            <p className="note">Level filter shows courses that run up to that level. Years are for UTME entry; Direct Entry students start at 200L. Tap a course to see its department building on the map (positions are approximate). Confirm details in your department handbook.</p>
          </section>

          {/* ---------- ROUTE ---------- */}
          <section className="view" hidden={tab !== "route"}>
            <div className="seg" role="group" aria-label="Travel mode">
              <button aria-pressed={mode === "walk"} onClick={() => { setMode("walk"); if (routeLayer.current) drawRoute(routeEnds.current.from, routeEnds.current.to, "walk"); }}>Walk</button>
              <button aria-pressed={mode === "shuttle"} onClick={() => { setMode("shuttle"); if (routeLayer.current) drawRoute(routeEnds.current.from, routeEnds.current.to, "shuttle"); }}>Shuttle / bus</button>
            </div>
            <label className="lbl" htmlFor="from">Origin</label>
            <select id="from" value={routeFrom} onChange={e => setRouteFrom(e.target.value)}>
              {userPos && <option value="me">My location</option>}{placeOptions}
            </select>
            <label className="lbl" htmlFor="to">Destination</label>
            <select id="to" value={routeTo} onChange={e => setRouteTo(e.target.value)}>{placeOptions}</select>
            <div className="row">
              <button className="btn gold" onClick={() => drawRoute(pick(routeFrom), pick(routeTo), mode)}>Show route</button>
              <button className="btn ghost" style={{ margin: 0 }} aria-label="Swap"
                onClick={() => { if (routeTo === "me") return; setRouteFrom(routeTo); setRouteTo(routeFrom === "me" ? routeTo : routeFrom); }}>⇅</button>
            </div>
            <button className="btn ghost" onClick={clearRoute}>Clear route</button>
            {result && (
              <div className="out">
                <strong>{result.mins} min {result.mode === "walk" ? "walk" : "by shuttle"}</strong><br />
                {fmtDist(result.metres)} · {result.a.name} to {result.b.name}
                <ol className="steps">
                  <li>Start at <b>{result.a.name}</b> and head {result.dir} toward {result.b.name}.</li>
                  {result.via.map(v => <li key={v.name}>Pass <b>{v.name}</b> (about {fmtDist(v.at)} in).</li>)}
                  <li>Arrive at <b>{result.b.name}</b>.</li>
                </ol>
                {result.mode === "shuttle" && <p className="note">Shuttle time includes a typical wait. Check real stops with seniors.</p>}
              </div>
            )}
            <p className="note">Tip: tap any pin on the map, then choose "Navigate Here" or "Start here". Paths are straight-line estimates, not surveyed footpaths.</p>
          </section>

          {/* ---------- WEATHER ---------- */}
          <section className="view" hidden={tab !== "weather"}>
            <Weather />
          </section>

          {/* ---------- TOOLS ---------- */}
          <section className="view" hidden={tab !== "tools"}>
            <div className="card">
              <h2>Account</h2>
              {user && (user.guest ? (
                <>
                  <p className="note" style={{ margin: "0 0 10px" }}>You are browsing as a guest.</p>
                  <button className="btn gold" onClick={signOut}>Sign in or register</button>
                </>
              ) : (
                <>
                  <b>{user.name}</b>
                  <p className="note" style={{ margin: "2px 0 10px" }}>{user.email}{user.fac ? " · " + FAC[user.fac][0] : ""}{user.lvl ? " · " + user.lvl + "L" : ""}</p>
                  <button className="btn ghost" style={{ margin: 0 }} onClick={signOut}>Sign out</button>
                </>
              ))}
            </div>
            <div className="card">
              <h2>Where is my lecture?</h2>
              <input className="field" placeholder="Type a course code, e.g. CIS 101" aria-label="Course code" autoComplete="off"
                value={hall} onChange={e => setHall(e.target.value)} onKeyDown={findHall} />
              <div className="hall-out">{hallOut}</div>
            </div>
            <div className="card">
              <h2>Fresher tips</h2>
              <details open><summary>Getting around</summary><p>Most places are walkable from the PS Bus Stop. Turn on the shuttle layer to see the main loop. Confirm current stops with seniors.</p></details>
              <details><summary>Dress &amp; conduct</summary><p>Dress neatly and modestly. Some faculties require lab coats, formal wear or safety gear. Your department will confirm.</p></details>
              <details><summary>Library &amp; CBT</summary><p>Register early for library access. Check your CBT centre venue and time a day before any test.</p></details>
              <details><summary>Stay safe</summary><p>Move in groups at night, guard your phone and PIN, and save the SOS numbers on your phone.</p></details>
            </div>
            <div className="card">
              <h2>Missing a place?</h2>
              <p className="note" style={{ margin: "0 0 10px" }}>Drop a pin for a cafeteria, hangout spot or hostel that isn't listed. It's saved on this device.</p>
              <button className="btn gold" onClick={addStart}>Add a place on the map</button>
              <button className="btn ghost" onClick={exportPins}>Copy my pins as data</button>
            </div>
            <div className="card">
              <h2>Offline mode</h2>
              <p className="note" style={{ margin: 0 }}>
                {init.saved ? `${places.length} landmarks are saved on this device, so search and info work without data. Map tiles only load for areas you've already viewed while online.` : "Couldn't save data for offline use (private browsing?)."}
              </p>
            </div>
          </section>
        </div>
      </aside>

      {/* ---------- Bottom navigation (phones) ---------- */}
      <nav className="dock" aria-label="Main">
        {TABS.map(([id, label]) => (
          <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => goTab(id)}>
            <Icon name={TAB_ICONS[id]} size={22} />{label}
          </button>
        ))}
      </nav>

      {/* ---------- SOS dialog ---------- */}
      <dialog ref={sosDlg} onClick={e => { if (e.target === sosDlg.current) sosDlg.current.close(); }}>
        <div className="dlg-h"><h2>Emergency contacts</h2><small>Tap to call or copy</small></div>
        <div className="dlg-b">
          {EMERGENCY.map(c => (
            <div className="sos-row" key={c.name}>
              <b>{c.name}</b>
              {c.num ? (
                <>
                  <span className="num">{c.num}</span>
                  <div className="row">
                    <a className="btn gold" href={`tel:${c.num}`}>Call</a>
                    <button className="btn ghost" style={{ margin: 0 }}
                      onClick={() => navigator.clipboard?.writeText(c.num).then(() => toast("Number copied")).catch(() => toast("Copy failed"))}>Copy</button>
                  </div>
                </>
              ) : <small className="note">Number not set. Add it in EMERGENCY (see your student handbook).</small>}
            </div>
          ))}
        </div>
        <div className="dlg-b" style={{ paddingTop: 0 }}>
          <button className="btn ghost" style={{ margin: 0 }} onClick={() => sosDlg.current.close()}>Close</button>
        </div>
      </dialog>

      {/* ---------- Add-a-place dialog ---------- */}
      <dialog ref={addDlg}>
        <div className="dlg-h" style={{ background: "var(--navy)" }}><h2>Add a place</h2><small>Your pin is saved on this device</small></div>
        <div className="dlg-b">
          <div><label className="lbl" htmlFor="addName" style={{ marginTop: 0 }}>Name</label>
            <input className="field" id="addName" maxLength={60} placeholder="e.g. Mama Put near Village II" autoComplete="off" value={addName} onChange={e => setAddName(e.target.value)} /></div>
          <div><label className="lbl" htmlFor="addCat" style={{ marginTop: 0 }}>Category</label>
            <select id="addCat" value={addCat} onChange={e => setAddCat(e.target.value)}>
              {Object.entries(CATS).map(([k, c]) => <option key={k} value={k}>{c.label}</option>)}
            </select></div>
          <div><label className="lbl" htmlFor="addDesc" style={{ marginTop: 0 }}>Short description (optional)</label>
            <input className="field" id="addDesc" maxLength={120} autoComplete="off" value={addDesc} onChange={e => setAddDesc(e.target.value)} /></div>
          <div className="row" style={{ marginTop: 4 }}>
            <button className="btn gold" style={{ flex: 1 }} onClick={addSave}>Save pin</button>
            <button className="btn ghost" style={{ margin: 0, flex: 1 }} onClick={() => addDlg.current.close()}>Cancel</button>
          </div>
        </div>
      </dialog>

      <div className={"toast" + (toastOn ? " show" : "")} role="status">{toastMsg}</div>

      {/* ---------- Sign-in screen ---------- */}
      {!user && (
        <div className="auth">
          <div className="auth-card">
            <Logo size={76} />
            <h1>UNILORIN Smart Map</h1>
            <p className="sub">Better by Far · sign in, register or just look around</p>
            <div className="tabs" style={{ margin: "0 0 4px" }}>
              <button className="tab" type="button" aria-selected={authMode === "in"} onClick={() => { setAuthMode("in"); setAErr(""); }}>Sign in</button>
              <button className="tab" type="button" aria-selected={authMode === "reg"} onClick={() => { setAuthMode("reg"); setAErr(""); }}>Register</button>
            </div>
            <form onSubmit={submitAuth} noValidate>
              {authMode === "reg" && (
                <div>
                  <label className="lbl" htmlFor="aName">Full name</label>
                  <input className="field" id="aName" autoComplete="name" maxLength={60} value={aName} onChange={e => setAName(e.target.value)} />
                  <label className="lbl" htmlFor="aFac">Faculty (optional)</label>
                  <select id="aFac" value={aFac} onChange={e => setAFac(e.target.value)}><option value="">Not sure yet</option>{facOptions}</select>
                  <label className="lbl" htmlFor="aLvl">Level (optional)</label>
                  <select id="aLvl" value={aLvl} onChange={e => setALvl(e.target.value)}>
                    <option value="">Not sure yet</option>
                    {[100, 200, 300, 400, 500, 600].map(l => <option key={l} value={l}>{l}L</option>)}
                  </select>
                </div>
              )}
              <label className="lbl" htmlFor="aEmail">Email</label>
              <input className="field" id="aEmail" type="email" autoComplete="email" inputMode="email" value={aEmail} onChange={e => setAEmail(e.target.value)} />
              <label className="lbl" htmlFor="aPw">Password</label>
              <input className="field" id="aPw" type="password" autoComplete={authMode === "reg" ? "new-password" : "current-password"} minLength={6} value={aPw} onChange={e => setAPw(e.target.value)} />
              <div className="auth-err" role="alert">{aErr}</div>
              <button className="btn gold" type="submit">{authMode === "reg" ? "Create account" : "Sign in"}</button>
            </form>
            <div className="or">or</div>
            <button className="btn ghost guest" type="button" onClick={() => enter({ guest: 1, name: "Guest" })}>Continue as guest</button>
            <p className="note" style={{ textAlign: "center" }}>Accounts are saved on this device only and are not synced. Guests can use the whole map.</p>
          </div>
        </div>
      )}
    </>
  );
}
