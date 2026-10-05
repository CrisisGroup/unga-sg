// Public browser configuration; token reused from the UNGA 2025 project.
window.UNGA_MAP_CONFIG = {
  "accessToken": "pk.eyJ1IjoiZGFsdG9ud2IiLCJhIjoiOWdSSXFQSSJ9.HZyjh4g3TAAOAncwelv9Vw",
  "style": "mapbox://styles/daltonwb/cmuo7btjj002m01sd9kud69tz",
  "projection": "equalEarth",
  // Representative locations in [longitude, latitude] order.
  "locations": {
    "overview": { "coordinates": [-73.968, 40.749], "label": "UN headquarters, New York" },
    "palestine": { "coordinates": [35.2, 31.8], "label": "Palestine" },
    "iran-hormuz": { "coordinates": [56.3, 26.6], "label": "Strait of Hormuz" },
    "ukraine": { "coordinates": [31.2, 48.4], "label": "Ukraine" },
    "sudan": { "coordinates": [30.2, 15.5], "label": "Sudan" },
    "un-reform": { "coordinates": [-73.968, 40.749], "label": "UN headquarters, New York" },
    "next-sg": { "coordinates": [-73.968, 40.749], "label": "UN headquarters, New York" }
  },
  "layers": {
    "overview": null,
    "palestine": "unga-2026-palestine",
    "iran-hormuz": "unga-2026-hormuz",
    "ukraine": "unga-2026-ukraine",
    "sudan": "unga-2026-sudan",
    "un-reform": "unga-2026-unreforms",
    "next-sg": "unga-2026-secretarygeneral"
  }
};
