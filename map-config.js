// Public browser configuration; token reused from the UNGA 2025 project.
window.UNGA_MAP_CONFIG = {
  "accessToken": "pk.eyJ1IjoiZGFsdG9ud2IiLCJhIjoiOWdSSXFQSSJ9.HZyjh4g3TAAOAncwelv9Vw",
  "style": "mapbox://styles/daltonwb/cmuo7btjj002m01sd9kud69tz",
  "projection": "equalEarth",
  // Small countries represented as points, using the thematic tileset's fields.
  "countryPoints": {
    "type": "FeatureCollection",
    "features": [{
      "type": "Feature",
      "id": "VAT",
      "geometry": { "type": "Point", "coordinates": [12.4533, 41.90225] },
      "properties": {
        "iso3": "VAT",
        "country": "Vatican City",
        "palestine": "Palestine or Gaza, with West Bank",
        "iran_hormuz": "Not mentioned",
        "ukraine": "Ukraine without Russia",
        "sudan": "Mentioned",
        "un_reform": "UN80",
        "next_secretary_general": "Not mentioned"
      }
    }]
  },
  // Captions shown in the attribution panel for the active scroll topic.
  "captions": {
    "palestine": {
      "title": "Who Mentioned Gaza, Palestine or the West Bank in 2026?",
      "text": "100 speakers spotlighted the situation in Gaza or Palestine, a 34 per cent decrease from 2025. Nevertheless, Palestine remained the most talked-about crisis during the debate. Of those 100 speakers, 38 also spotlighted Israeli actions in the West Bank."
    },
    "iran-hormuz": {
      "title": "Who Mentioned Iran in 2026?",
      "text": "43 speakers highlighted the war in Iran, while 22 focused solely on the Strait of Hormuz. These numbers, however, do not include indirect references to the broader crisis in the Middle East, its impact on the global economy or the importance of freedom of navigation."
    },
    "ukraine": {
      "title": "Who Mentioned Ukraine and Russia in 2026?",
      "text": "78 speakers referred to Ukraine, a 26 per cent decrease from 2025. It was the first time since Russia’s full-scale invasion in 2022 that fewer than half the speakers brought up the war. 26 did so without explicitly mentioning Russia’s role."
    },
    "sudan": {
      "title": "Who Mentioned Sudan in 2026?",
      "text": "65 speakers discussed the civil war in Sudan, three more than in 2025. Despite the slight increase, Sudan remains the least referenced among the four major conflicts covered here."
    },
    "un-reform": {
      "title": "Who Mentioned UN Reform in 2026?",
      "text": "124 speakers mentioned UN reform issues. While the number of speakers raising Security Council reform (105) remained broadly consistent with 2025, there were 33 per cent fewer speakers (49) focused on the UN80 reform initiative."
    },
    "next-sg": {
      "title": "Who Mentioned the Next Secretary-General in 2026?",
      "text": "64 speakers – less than one third of the UN membership – reflected on what they would like to see from the next Secretary-General."
    }
  },
  // Representative locations in [longitude, latitude] order.
  "locations": {
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
