# UNGA–SG

A single-page static visual explainer about peace and security issues at the 2026 UN General Assembly. It uses a light editorial layout, map artwork above the headline, eleven map-scrolly cards and a final map-only scroll, and a white closing section. No build step or runtime server is required.

## Preview

From this project directory run:

```sh
python3 -m http.server 8030 --bind 127.0.0.1
```

Visit `http://127.0.0.1:8030/`. To test the GitHub Pages subpath, run the server from the parent directory and visit `/unga-sg/`. All local assets use relative URLs. The live map requires network access and WebGL; the existing header artwork serves as a decorative fallback if either is unavailable. Adobe Fonts is optional; system serif and sans-serif fallbacks are provided.

## Editing

- `index.html`: headline, introduction, eleven narrative cards and a final map-only scroll, Conclusion and credits. The methodology overview precedes Palestine, Iran, Ukraine, Sudan, UN Reform and Next Secretary-General; existing scene IDs stay unchanged. Palestine and Ukraine each span three cards, with one paragraph per card and legends matching the visible categories; only the first card has a visible heading. Cards for the same topic share `data-step` and use `data-part` for their sequence number, allowing category changes within a topic while keeping its location steady. The third Ukraine card uses `data-hide-legend` to suppress the portrait legend as well as omitting the inline key.
- `styles.css`: responsive layout, sticky map stage, overlaid narrative cards, colour keys and closing-section typography. In portrait layouts the map is vertically centred in the viewport and the active topic's legend is fixed at the bottom, outside the cards. The dock allows for device safe areas, and card spacing accounts for its height. Landscape layouts retain the legends inside the cards; without JavaScript those inline legends remain available in every orientation.
- `scroll.js`: selects the current narrative step in either scroll direction and emits `story:stepchange` on `[data-scrolly]`. It copies the active topic's legend into the portrait dock, preserving it across repeated cards and hiding it outside the pinned map section. It also handles resize, orientation changes, font loading and browser history restoration. Scroll anchors and topic cards are cached, including when restoring directly to the final blank step. The background video loads only when a reform topic is visible, pauses outside the map section or in a hidden tab, and stays disabled with reduced motion.
- `map.js`: one persistent Mapbox GL JS map, kept separate from the narrative controller. It loads near the scrolly, switches thematic layers, resizes to fit the world and handles the static fallback.
- `map-config.js`: the supplied style, public browser token, scene-to-layer mapping, representative dot locations and `countryPoints` GeoJSON for small countries.
- `media/`: `header-final.webp` (hero, optimized from the supplied PNG at its original 1384 × 562 resolution), `header-3.png` (map fallback), `icg-black.png` (logo), `general-assembly.jpg` (closing photograph), `unga-2026-*.jpg` (social and search thumbnails), `united_nations_background.webm` (preferred deferred reform video), `united_nations_background.mp4` (video fallback), and `united_nations_poster.jpg` (static backdrop while loading or when motion is disabled). All retained media are used by the page or its preview metadata.

## Mapbox GL

The Mapbox information (attribution) panel includes the active topic's heading and caption from `captions` in `map-config.js`. It updates in either scroll direction, shares a caption across repeated cards for a topic, and preserves the panel's open state and Mapbox attribution links. Overview shows attribution only. Caption text is independent of the article and legends; edit those separately when counts change.

Mapbox GL JS 3.32.0 is pinned in `index.html`. The map mounts in `#story-map` with style `mapbox://styles/daltonwb/cmuo7btjj002m01sd9kud69tz`. It uses Equal Earth projection and fits the entire world at every screen size. Native scroll and touch gestures continue to move the story; camera interaction is disabled. Mapbox attribution remains visible beside the map, clear of the text cards.

The renderer listens on `[data-scrolly]` for `story:stepchange`; `event.detail` contains `{ id, part, theme, index, total }`. Each step gently crossfades to its thematic layer over 650 ms using [Mapbox paint transitions](https://docs.mapbox.com/style-spec/reference/transition/). Inactive layers have zero opacity; the overview fades all thematic layers out. Unchanged layer opacities are cached to avoid redundant map updates. Rapid scrolling retargets the fade, and reduced-motion preferences switch immediately, including when changed while the page is open. The legacy `speech_data` and empty `unga-2026-blank` layers stay hidden.

| Step | Style layer |
| --- | --- |
| Overview | Basemap only |
| Palestine | `unga-2026-palestine` |
| Iran/Hormuz | `unga-2026-hormuz` |
| Ukraine | `unga-2026-ukraine` |
| Sudan | `unga-2026-sudan` |
| UN Reform | `unga-2026-unreforms` |
| Next SG | `unga-2026-secretarygeneral` |

A custom [Mapbox GL marker](https://docs.mapbox.com/mapbox-gl-js/api/markers/#marker) marks the active step with a dark dot and an expanding, fading halo. Overview shows all five distinct topic locations at once: Palestine, the Strait of Hormuz, Ukraine, Sudan and UN headquarters in New York. UN Reform and Next SG share the headquarters dot; subsequent steps show only their own representative location. Dots collapse over 220 ms and expand over 430 ms at their respective locations, including when scrolling rapidly or reversing direction. Reduced-motion preferences switch dots immediately. Edit `locations` in `map-config.js` to adjust the coordinates or accessible location labels. The marker follows the map projection and resizing, updates in either scroll direction, and becomes a static dot for reduced-motion preferences.

The renderer reads the published style's current tileset references and category colours, including Palestine, without a separate hard-coded Palestine palette. It accepts both versions of the Palestine category labels (including `Palestine or Gaza, with West Bank` and `Palestine or Gaza, without West Bank`) so cached style versions still colour the updated data. It locally corrects copied Ukraine no-data checks to use each topic's own field, and consistently renders `No data` and `Not recognised` in white for all six topics. This does not modify the hosted style. Inline colour keys in `styles.css` use the same authored palette; map fills retain the style's opacity. The UN Reform and Next Secretary-General gray keys also use the map's 80% opacity on their backgrounds, blending `#999999` to approximately `#adadad` over white, with fully opaque text. This applies to desktop tags and mobile swatches. When changing the palette or opacity in Studio, update those keys to match.

UN reform has two local colour overrides in `map.js`: Security Council reform only uses `#A9C8EC`, and UN80 only uses `#009EDB`. The matching `key--council` and `key--un80` rules in `styles.css` apply to both inline and portrait legends. Country fills and small-country points share these colours and retain the published layer opacity; the other categories retain their Studio colours.

`categoryOverrides` in `map-config.js` applies local data corrections by topic field and ISO3 country code. Burkina Faso (`BFA`) is corrected to `Not mentioned` for Ukraine. The renderer uses the corrected category in both fill colours and filters: Burkina Faso appears orange in Ukraine frame one, disappears with other non-mentions in frame two, and has no data fill in frame three. This leaves the hosted tileset intact, and the override remains safe if the source data is corrected later. Published article, caption and legend counts are maintained separately.

Vatican City is represented by a small circle at `[12.4533, 41.90225]` ([GeoNames location](https://www.geonames.org/3164670/vatican-city.html)). Its radius is 4px with a 1px outline on desktop, reduced to 2.5px with a 0.65px outline at viewport widths up to 700px or in landscape viewports up to 500px tall. It updates on resize and rotation. Its feature in `countryPoints` uses the same fields as the tileset, with the supplied categories: Gaza/Palestine and the West Bank; no Iran/Hormuz reference; Ukraine only; Sudan mentioned; UN80 only; and no next Secretary-General reference. Point layers inherit the country layers' colour expressions, filters, opacity and transitions, including staged non-mention reveals. They are hidden in the neutral overview. Editing these point features does not change the hosted tileset or the article's aggregate counts.

The public `pk.` token in `map-config.js` is reused from `unga-2025/config.js` for the same Mapbox account. If its URL restrictions change, allow localhost, `https://crisisgroup.github.io/unga-sg/` and `https://www.crisisgroup.org/visual-explainers/un-general-assembly-2026-speeches/`. Keep secret tokens out of browser assets. The style and vector tiles load directly from Mapbox; GitHub Pages still needs no server or build step. See the [Mapbox GL JS API](https://docs.mapbox.com/mapbox-gl-js/api/map/) for map configuration.

The publication date is 16 October, 2026. Search indexing is enabled; canonical and preview metadata use the confirmed production URL. Before publishing, review the article, captions and legend counts together.

Without JavaScript the fallback artwork and all eleven narrative cards remain visible in normal document flow. Reduced-motion preferences disable transitions and smooth scrolling.

## Scroll sequence

Palestine’s first card shows the green categories; its second introduces the coral “Not mentioned” countries, retained on the third card. Ukraine’s first card shows all three categories. Card two hides “Not mentioned” countries while retaining both green categories and briefly pulsing outlines around Mali and Niger. Card three hides all thematic fills and small-country data points, leaving the uncoloured basemap and the pulsating Ukraine location dot, with no colour key. The extra layers are derived from the published style locally. Reduced motion uses steady outlines and a static location dot. Scrolling backward restores the earlier category visibility and legends.

Desktop conflict legends wrap entries side by side, with the third entry on a new row. UN topic legends are unchanged. After Next Secretary-General, a final viewport of scrolling holds its map without a narrative card or portrait legend dock; without JavaScript this spacer is hidden.

## Social and search thumbnails

`index.html` includes static Open Graph metadata for social link previews, an X/Twitter large-image card, and Article JSON-LD with search image variants. These work without JavaScript. The title matches the visible headline, and the robots meta tag enables indexing and `max-image-preview:large`.

The short preview description is shared by `description`, `og:description`, `twitter:description` and the Article JSON-LD `description`. Update all four together when changing the social copy. The visible subheading is edited separately.

The supplied `thumbnail (2).png` (1280 × 800; 496,213 bytes) was exported as JPEG at quality 85, with centred crops, no upscaling and no source metadata. The source file is unchanged.

| Asset in `media/` | Dimensions | Size | Use |
| --- | --- | --- | --- |
| `unga-2026-social.jpg` | 1200 × 630 | 77,277 bytes | Open Graph, X/Twitter and legacy image preview link |
| `unga-2026-search-16x9.jpg` | 1280 × 720 | 91,261 bytes | Landscape search/Discover image |
| `unga-2026-search-4x3.jpg` | 1064 × 798 | 85,753 bytes | 4:3 search image |
| `unga-2026-search-1x1.jpg` | 800 × 800 | 67,402 bytes | Square search image |

The search variants follow [Google's Article image recommendations](https://developers.google.com/search/docs/appearance/structured-data/article), and the wide variant supports [large Discover previews](https://developers.google.com/search/docs/appearance/google-discover). Platforms choose their final crop and may cache an earlier preview.

The canonical production URL is `https://www.crisisgroup.org/visual-explainers/un-general-assembly-2026-speeches`. The canonical link, Open Graph page URL and JSON-LD article identifiers use this exact URL. The `image_src`, Open Graph, Twitter and JSON-LD image and logo URLs point into its `/media/` directory. These URLs are static in the HTML so crawlers can read them without JavaScript; runtime assets remain relative for local and GitHub Pages previews.

Upload the HTML and all four preview images together via SFTP, then check the public image URLs return JPEGs and refresh cached previews with the relevant platform's sharing debugger. Production URL availability can only be verified after that upload.

## Production deployment

Upload the static site files and `media/` via SFTP to the directory served at `https://www.crisisgroup.org/visual-explainers/un-general-assembly-2026-speeches/`, keeping their relative layout. Serve `index.html` as the directory index and retain the host's normal trailing-slash redirect so relative CSS, scripts and media resolve within the project directory. The canonical URL in metadata uses the supplied address without a trailing slash. No application server or client-side route rewrites are required. GitHub Pages remains available as a preview deployment.

## GitHub Pages

Repository: https://github.com/CrisisGroup/unga-sg

Pages is configured in **Settings → Pages → Build and deployment** using **Deploy from a branch**, branch **main**, folder **/ (root)**. Every push to `main` republishes the site. The included `.nojekyll` file serves the static files directly; no custom workflow, package installation or secrets are needed.

Preview site: https://crisisgroup.github.io/unga-sg/

It also works at a domain root. There are no sub-pages or routes requiring rewrites. To reproduce the deployment in another repository, select the same branch and folder in its Pages settings.
