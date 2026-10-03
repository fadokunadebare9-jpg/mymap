export const P = d => `<path d="${d}"/>`;
export const ICONS = {
  book: P("M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z") + P("M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"),
  building: P("M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18z") + P("M10 6h4M10 10h4M10 14h4M10 18h4"),
  bus: P("M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v10H4z") + P("M4 12h16M8 20v-4M16 20v-4"),
  home: P("m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z") + P("M9 21v-7h6v7"),
  bank: P("m3 10 9-6 9 6M5 10v8M10 10v8M14 10v8M19 10v8M3 21h18"),
  star: P("m12 2 3 7 7 .6-5.3 4.7 1.6 7.2-6.3-3.7-6.3 3.7 1.6-7.2L2 9.6 9 9z"),
  cross: P("M9 3h6v6h6v6h-6v6H9v-6H3V9h6z"),
  leaf: P("M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.500-4.800 10-10 10z") + P("M2 21c0-3 1.900-5.400 5.100-6"),
  walk: '<circle cx="12" cy="12" r="9"/>' + P("M12 7v5l3 2"),
  nav: P("m3 11 19-9-9 19-2-8z"),
  search: '<circle cx="11" cy="11" r="7"/>' + P("m20 20-3.500-3.500"),
  loc: '<circle cx="12" cy="12" r="4"/>' + P("M12 2v3M12 19v3M2 12h3M19 12h3"),
  food: P("M3 2v7a3 3 0 0 0 3 3v10M9 2v7a3 3 0 0 1-3 3M19 2c-2 2-3 5-3 8h3v12"),
  users: '<circle cx="9" cy="8" r="3"/>' + P("M3 20v-1a5 5 0 0 1 5-5h2a5 5 0 0 1 5 5v1M17 11a3 3 0 1 0 0-6M21 20v-1a4 4 0 0 0-3-3.900"),
  layers: P("m12 2 10 5-10 5L2 7z") + P("m2 17 10 5 10-5M2 12l10 5 10-5"),
  weather: P("M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"),
  tools: P("M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z"),
};
export const svg = (n, s = 18) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[n]}</svg>`;
