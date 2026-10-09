# UNGA–SG

A single-page static visual explainer based on `Wireframe (1).pdf`. It uses a light editorial layout, map artwork above the headline, seven map-scrolly cards, and a white closing section. No build step or runtime server is required.

## Preview

From the parent `github` directory run:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000/unga-sg/` to preview under the repository subpath used by GitHub Pages. All local assets use relative URLs. The live map requires network access and WebGL; an overview image remains readable if either is unavailable. Adobe Fonts is optional; system serif and sans-serif fallbacks are provided.

## Editing

- `index.html`: headline, introduction, seven scroll steps, Looking Ahead and credits. The new overview precedes Palestine, Iran/Hormuz, Ukraine, Sudan, UN Reform and Next SG.
- `styles.css`: responsive layout, sticky map stage, overlaid narrative cards, inline colour keys and closing-section typography. On mobile the map sits behind the cards; long paragraphs can scroll without being clipped by it.
- `scroll.js`: selects the current narrative step in either scroll direction and emits `story:stepchange` on `[data-scrolly]`. It also handles resize, font loading and browser history restoration.
- `map.js`: one persistent Mapbox GL JS map, kept separate from the narrative controller. It loads near the scrolly, switches thematic layers, resizes to fit the world and handles the static fallback.
- `map-config.js`: the supplied style, public browser token, scene-to-layer mapping and representative dot locations.
- `media/maps/overview.png`: neutral fallback artwork extracted from the PDF. The other six map images remain available but are no longer rendered. `header-map.png`, `icg-black.png`, `un-background.png` and `assembly-speaker.jpg` also come from that PDF.

## Mapbox GL

Mapbox GL JS 3.32.0 is pinned in `index.html`. The map mounts in `#story-map` with style `mapbox://styles/daltonwb/cmuo7btjj002m01sd9kud69tz`. It uses Equal Earth projection and fits the entire world at every screen size. Native scroll and touch gestures continue to move the story; camera interaction is disabled. Mapbox attribution remains visible beside the map, clear of the text cards.

The renderer listens on `[data-scrolly]` for `story:stepchange`; `event.detail` contains `{ id, theme, index, total }`. Each step gently crossfades to its thematic layer over 650 ms using [Mapbox paint transitions](https://docs.mapbox.com/style-spec/reference/transition/). Inactive layers have zero opacity; the overview fades all thematic layers out. Rapid scrolling retargets the fade, and reduced-motion preferences switch immediately, including when changed while the page is open. The legacy `speech_data` and empty `unga-2026-blank` layers stay hidden.

| Step | Style layer |
| --- | --- |
| Overview | Basemap only |
| Palestine | `unga-2026-palestine` |
| Iran/Hormuz | `unga-2026-hormuz` |
| Ukraine | `unga-2026-ukraine` |
| Sudan | `unga-2026-sudan` |
| UN Reform | `unga-2026-unreforms` |
| Next SG | `unga-2026-secretarygeneral` |

A custom [Mapbox GL marker](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker) marks the active step with a dark dot and an expanding, fading halo. Overview and Next SG use UN headquarters in New York; the conflict steps use representative locations in Palestine, the Strait of Hormuz, Ukraine and Sudan. Dots crossfade in and out over 650 ms at their respective locations, including when scrolling rapidly or reversing direction. UN Reform fades all dots out. Reduced-motion preferences switch dots immediately. Edit `locations` in `map-config.js` to adjust the coordinates or accessible location labels. The marker follows the map projection and resizing, updates in either scroll direction, and becomes a static dot for reduced-motion preferences.

The renderer reads the published style's current tileset references and category colours, including Palestine, without a separate hard-coded Palestine palette. It accepts both versions of the Palestine category labels (including `Palestine or Gaza, with West Bank` and `Palestine or Gaza, without West Bank`) so cached style versions still colour the updated data. It locally corrects copied Ukraine no-data checks to use each topic's own field, and consistently renders `No data` and `Not recognised` in white for all six topics. This does not modify the hosted style. Inline colour keys in `styles.css` use the same authored palette; map fills retain the style's opacity. When changing the palette in Studio, update those keys to match.

The public `pk.` token in `map-config.js` is reused from `unga-2025/config.js` for the same Mapbox account. If its URL restrictions change, allow localhost and `https://crisisgroup.github.io/unga-sg/` (and any custom domain). Keep secret tokens out of browser assets. The style and vector tiles load directly from Mapbox; GitHub Pages still needs no server or build step. See the [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/map/) for map configuration.

The supplied PDF is draft copy: its date is “Published TK June, 2026”, Iran/Hormuz and Sudan repeat the Ukraine paragraph, the photo caption starts “PLACEHOLDER XX”, and the closing paragraph says “other for a”. These are preserved as supplied, with PDF extraction artifacts and stray spacing normalised. The introduction discusses four issues while the scrolly has an overview and six topics. Review the draft copy and credits before publication, remove `noindex, nofollow` when ready, and add the final canonical URL and social metadata once the publication location is known.

Without JavaScript the overview map and all seven narrative cards remain visible in normal document flow. Reduced-motion preferences disable transitions and smooth scrolling.

## GitHub Pages

Repository: https://github.com/CrisisGroup/unga-sg

Pages is configured in **Settings → Pages → Build and deployment** using **Deploy from a branch**, branch **main**, folder **/ (root)**. Every push to `main` republishes the site. The included `.nojekyll` file serves the static files directly; no custom workflow, package installation or secrets are needed.

Site: https://crisisgroup.github.io/unga-sg/

It also works at a domain root. There are no sub-pages or routes requiring rewrites. To reproduce the deployment in another repository, select the same branch and folder in its Pages settings.
