import { useState, useEffect, useCallback } from "react";
import { CFG } from "./data";

/* Weather for the campus.
   - If you put a WeatherAPI.com key in .env (VITE_WEATHER_KEY), it is used first.
   - If there is no key, or it fails, the app falls back to Open-Meteo (no key needed). */

const KEY = import.meta.env.VITE_WEATHER_KEY;
const CACHE = CFG.storeKey + "-weather2";
const [LAT, LON] = CFG.center;
const REFRESH_MS = 10 * 60 * 1000;

const OPEN = `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LON}` +
  `&current=temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
  `&hourly=temperature_2m,precipitation_probability,weather_code,uv_index` +
  `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,sunrise,sunset` +
  `&timezone=Africa%2FLagos&forecast_days=3&wind_speed_unit=kmh`;
const WAPI = `https://api.weatherapi.com/v1/forecast.json?key=${KEY}&q=${LAT},${LON}&days=3&aqi=no&alerts=no`;

/* ---------- Conditions: one small set of names used everywhere ---------- */
const COND = {            // [day icon, night icon, words]
  clear: ["☀️", "🌙", "Clear sky"], partly: ["⛅", "☁️", "Partly cloudy"], cloudy: ["☁️", "☁️", "Cloudy"],
  fog: ["🌫️", "🌫️", "Hazy"], light: ["🌦️", "🌧️", "Light rain"], rain: ["🌧️", "🌧️", "Rain"],
  heavy: ["🌧️", "🌧️", "Heavy rain"], storm: ["⛈️", "⛈️", "Thunderstorm"]
};
const wet = c => ["light", "rain", "heavy", "storm"].includes(c);
const isDayAt = t => +t.slice(11, 13) >= 6 && +t.slice(11, 13) < 19;
const icon = (cat, day = true) => COND[cat][day ? 0 : 1];

const wmo = c => c <= 1 ? "clear" : c === 2 ? "partly" : c === 3 ? "cloudy" : c <= 48 ? "fog" : c === 61 || c === 80 || (c >= 51 && c <= 57) ? "light"
  : c === 65 || c === 82 || c === 67 ? "heavy" : c >= 95 ? "storm" : c === 63 || c === 81 || c === 66 ? "rain" : "cloudy";
const wapi = c => c === 1000 ? "clear" : c === 1003 ? "partly" : c <= 1009 ? "cloudy" : [1030, 1135, 1147].includes(c) ? "fog"
  : c >= 1273 || c === 1087 ? "storm" : [1192, 1195, 1246].includes(c) ? "heavy" : [1186, 1189, 1243].includes(c) ? "rain"
  : c >= 1063 && c < 1273 ? "light" : "cloudy";

/* ---------- Turn each service's reply into ONE shape ---------- */
function fromOpen(w) {
  const c = w.current, h = w.hourly, d = w.daily;
  return {
    source: "Open-Meteo", time: c.time,
    now: { temp: c.temperature_2m, feels: c.apparent_temperature, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, dir: c.wind_direction_10m, mm: c.precipitation, cat: wmo(c.weather_code), day: !!c.is_day },
    hours: h.time.map((t, i) => ({ t, temp: h.temperature_2m[i], pop: h.precipitation_probability[i] ?? 0, cat: wmo(h.weather_code[i]), uv: h.uv_index[i] ?? 0 })),
    days: d.time.map((date, i) => ({ date, min: d.temperature_2m_min[i], max: d.temperature_2m_max[i], pop: d.precipitation_probability_max[i] ?? 0, mm: d.precipitation_sum[i], cat: wmo(d.weather_code[i]) })),
    sunrise: d.sunrise[0].slice(11, 16), sunset: d.sunset[0].slice(11, 16)
  };
}
function fromWapi(w) {
  const c = w.current, fd = w.forecast.forecastday;
  return {
    source: "WeatherAPI.com", time: w.location.localtime.replace(" ", "T"),
    now: { temp: c.temp_c, feels: c.feelslike_c, hum: c.humidity, wind: c.wind_kph, dir: c.wind_degree, mm: c.precip_mm, cat: wapi(c.condition.code), day: !!c.is_day, uv: c.uv },
    hours: fd.flatMap(x => x.hour.map(h => ({ t: h.time.replace(" ", "T"), temp: h.temp_c, pop: h.chance_of_rain, cat: wapi(h.condition.code), uv: h.uv }))),
    days: fd.map(x => ({ date: x.date, min: x.day.mintemp_c, max: x.day.maxtemp_c, pop: x.day.daily_chance_of_rain, mm: x.day.totalprecip_mm, cat: wapi(x.day.condition.code) })),
    sunrise: fd[0].astro.sunrise, sunset: fd[0].astro.sunset
  };
}
async function get(url) {
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 10000);
  try { const r = await fetch(url, { signal: ctrl.signal }); if (!r.ok) throw new Error(r.status); return await r.json(); }
  finally { clearTimeout(timer); }
}
async function fetchWeather() {
  if (KEY) { try { return fromWapi(await get(WAPI)); } catch { /* bad key or service down: use the backup */ } }
  return fromOpen(await get(OPEN));
}

/* ---------- Small helpers ---------- */
const compass = d => ["N", "NE", "E", "SE", "S", "SW", "W", "NW"][Math.round(d / 45) % 8];
const uvLabel = u => u < 3 ? "Low" : u < 6 ? "Moderate" : u < 8 ? "High" : u < 11 ? "Very high" : "Extreme";
const hr = t => { const h = +t.slice(11, 13); return (h % 12 || 12) + (h < 12 ? " AM" : " PM"); };
const readCache = () => { try { return JSON.parse(localStorage.getItem(CACHE)); } catch { return null; } };
const skyOf = n => !n.day ? (n.cat === "storm" ? "storm" : "night") : n.cat === "storm" ? "storm" : wet(n.cat) ? "rain" : n.cat === "clear" || n.cat === "partly" ? "clear" : "cloudy";
const DROPS = Array.from({ length: 16 }, (_, i) => ({ left: (i * 37) % 100, delay: ((i * 53) % 90) / 100 }));

/* ---------- Sub-pages ---------- */
function Now({ w, uv, i }) {
  const { now: n, hours } = w, next = hours.slice(i, i + 12);
  const peak = Math.max(...next.slice(0, 7).map(x => x.pop));
  let plan;
  if (n.cat === "storm" || next.slice(0, 4).some(x => x.cat === "storm")) plan = "Thunderstorm risk soon. Stay indoors and away from open fields.";
  else if (n.mm > 0 || wet(n.cat)) { const e = next.find(x => x.pop < 30); plan = e ? `Rain should ease around ${hr(e.t)}.` : "Rain is likely to last the next 12 hours."; }
  else { const r = next.find(x => x.pop >= 50); plan = r ? `Dry until about ${hr(r.t)}, then rain is likely.` : "No rain expected in the next 12 hours."; }

  const bring = [];
  if (peak >= 40 || n.mm > 0) bring.push(["☂️", "Umbrella"]);
  if (uv >= 6 && n.day) bring.push(["🧴", "Sunscreen or cap"]);
  if (n.temp >= 31) bring.push(["💧", "Water bottle"]);
  if (n.temp >= 29) bring.push(["👕", "Light clothes"]);
  if (n.temp <= 22) bring.push(["🧥", "Light jacket"]);
  if (!bring.length) bring.push(["👍", "Nothing special"]);

  const today = w.time.slice(0, 10), nowH = +w.time.slice(11, 13);
  const slots = [8, 10, 12, 14, 16].map(h => ({ h, x: hours.find(y => y.t === `${today}T${String(h).padStart(2, "0")}:00`) })).filter(s => s.x);

  return (
    <>
      <div className="wx-plan" role="status"><b>Your next few hours</b><span>{plan}</span></div>
      <h2 className="wx-h">Bring today</h2>
      <div className="wx-chips">{bring.map(([e, t]) => <span className="wx-chip" key={t}><span aria-hidden="true">{e}</span> {t}</span>)}</div>
      <h2 className="wx-h">Lecture times</h2>
      <div className="wx-slots">
        {slots.map(({ h, x }) => (
          <div key={h} className={"wx-slot" + (h <= nowH ? " past" : "")}>
            <small>{hr(x.t)}</small><span aria-hidden="true">{icon(x.cat, true)}</span><b>{Math.round(x.temp)}°</b><small>{x.pop}% rain</small>
          </div>
        ))}
      </div>
      <div className="wx-grid">
        <div><small>Humidity</small><b>{Math.round(n.hum)}%</b></div>
        <div><small>Wind</small><b>{Math.round(n.wind)} km/h {compass(n.dir)}</b></div>
        <div><small>UV index</small><b>{Math.round(uv)} · {uvLabel(uv)}</b></div>
        <div><small>Sun</small><b>↑ {w.sunrise} · ↓ {w.sunset}</b></div>
      </div>
    </>
  );
}

function Hours({ w, i }) {
  const next = w.hours.slice(i, i + 24), n = next.length;
  const lo = Math.min(...next.map(x => x.temp)), hi = Math.max(...next.map(x => x.temp));
  const X = k => 12 + k * (296 / (n - 1)), Y = t => 14 + (hi - t) / (hi - lo || 1) * 52;
  const line = next.map((x, k) => `${k ? "L" : "M"}${X(k).toFixed(1)},${Y(x.temp).toFixed(1)}`).join("");
  return (
    <>
      <h2 className="wx-h">Temperature, next 24 hours</h2>
      <svg className="wx-chart" viewBox="0 0 320 130" role="img" aria-label={`Temperature from ${Math.round(lo)} to ${Math.round(hi)} degrees over the next 24 hours`}>
        {next.map((x, k) => <rect key={k} x={X(k) - 4} y={100 - x.pop * .28} width="8" height={x.pop * .28} rx="2" fill="#1565C0" opacity=".35" />)}
        <path d={`${line}L${X(n - 1)},80L${X(0)},80Z`} fill="rgba(212,175,55,.22)" />
        <path d={line} fill="none" stroke="#002147" strokeWidth="2.5" strokeLinejoin="round" />
        {next.map((x, k) => k % 6 === 0 && (
          <g key={k}><text x={X(k)} y={Y(x.temp) - 7} textAnchor="middle" fontSize="10" fontWeight="700" fill="#002147">{Math.round(x.temp)}°</text>
            <text x={X(k)} y="120" textAnchor="middle" fontSize="9" fill="#5b6b82">{hr(x.t)}</text></g>
        ))}
      </svg>
      <p className="note" style={{ marginTop: 0 }}>Blue bars show the chance of rain each hour.</p>
      <div className="chips wx-hours">
        {next.map(x => (
          <div className="wx-hour" key={x.t}>
            <small>{hr(x.t)}</small><span aria-hidden="true">{icon(x.cat, isDayAt(x.t))}</span><b>{Math.round(x.temp)}°</b><small>{x.pop}%</small>
          </div>
        ))}
      </div>
    </>
  );
}

function Days({ w }) {
  const lo = Math.min(...w.days.map(d => d.min)), hi = Math.max(...w.days.map(d => d.max));
  return (
    <ul className="list">
      {w.days.map((d, k) => (
        <li className={"wx-day" + (k === 0 ? " today" : "")} key={d.date}>
          <div className="wx-day-top">
            <b>{k === 0 ? "Today" : new Date(d.date + "T12:00").toLocaleDateString("en-NG", { weekday: "long" })}</b>
            <span aria-hidden="true">{icon(d.cat)}</span><span>{COND[d.cat][2]}</span>
          </div>
          <div className="wx-bar" aria-hidden="true"><i style={{ left: (d.min - lo) / (hi - lo || 1) * 100 + "%", right: (hi - d.max) / (hi - lo || 1) * 100 + "%" }} /></div>
          <div className="wx-day-end"><span>{Math.round(d.min)}° – <b>{Math.round(d.max)}°</b></span><span>☔ {d.pop}% · {Number(d.mm).toFixed(1)} mm</span></div>
        </li>
      ))}
    </ul>
  );
}

/* ---------- The tab ---------- */
export default function Weather() {
  const [data, setData] = useState(readCache);          // { w, at }
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);
  const [view, setView] = useState("now");

  const load = useCallback(async () => {
    setBusy(true);
    try {
      const w = await fetchWeather(), fresh = { w, at: Date.now() };
      setData(fresh); setFailed(false);
      try { localStorage.setItem(CACHE, JSON.stringify(fresh)); } catch { /* ignore */ }
    } catch { setFailed(true); }
    finally { setBusy(false); }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, REFRESH_MS), vis = () => { if (document.visibilityState === "visible") load(); };
    addEventListener("online", load); document.addEventListener("visibilitychange", vis);
    return () => { clearInterval(id); removeEventListener("online", load); document.removeEventListener("visibilitychange", vis); };
  }, [load]);

  if (!data) return (
    <div>
      <p className="empty">{busy ? "Loading the latest forecast…" : "Couldn't load the weather. Check your connection."}</p>
      {!busy && <button className="btn gold" onClick={load}>Try again</button>}
    </div>
  );

  const w = data.w, n = w.now, ageMin = Math.round((Date.now() - data.at) / 60000);
  const i = Math.max(0, w.hours.findIndex(x => x.t.slice(0, 13) === w.time.slice(0, 13)));
  const uv = n.uv ?? w.hours[i]?.uv ?? 0, sky = skyOf(n);

  return (
    <div>
      <div className={"sky sky-" + sky}>
        {wet(n.cat) && DROPS.map((d, k) => <i className="drop" key={k} style={{ left: d.left + "%", animationDelay: d.delay + "s" }} />)}
        <div className="sky-in">
          <small>Unilorin campus · {new Date(w.time).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}</small>
          <div className="sky-main">
            <span className="sky-icon" aria-hidden="true">{icon(n.cat, n.day)}</span>
            <div><div className="sky-temp">{Math.round(n.temp)}°</div><div>{COND[n.cat][2]} · feels {Math.round(n.feels)}°</div></div>
          </div>
        </div>
      </div>

      <div className="seg wx-nav" role="group" aria-label="Weather view">
        {[["now", "Now"], ["hours", "Hours"], ["days", "3 Days"]].map(([k, l]) => (
          <button key={k} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>
        ))}
      </div>

      {view === "now" && <Now w={w} uv={uv} i={i} />}
      {view === "hours" && <Hours w={w} i={i} />}
      {view === "days" && <Days w={w} />}

      <button className="btn ghost" onClick={load} disabled={busy}>{busy ? "Updating…" : "Refresh now"}</button>
      <p className="note">
        {failed ? `Offline or the service is down. Showing the forecast saved ${ageMin} min ago${ageMin > 30 ? ", which may be out of date" : ""}.`
          : `Updated ${new Date(data.at).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}, refreshes every 10 minutes.`}
        {" "}Source: {w.source}. Rain timing at one spot can be off by an hour, so treat percentages as odds.
      </p>
    </div>
  );
}
