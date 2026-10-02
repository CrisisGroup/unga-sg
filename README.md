# UNGA–SG

A single-page static visual explainer based on `minerals`: the same editorial typography, dark palette and credits design, with a static photo header, one scroll-driven graphic and supporting text and images. No build step or runtime server is required.

## Preview

Open `index.html` directly, or from the parent `github` directory run:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000/unga-sg/` to preview under the repository subpath used by GitHub Pages. All local assets use relative URLs. Adobe Fonts is optional; system serif and sans-serif fallbacks are provided.

## Editing

- `index.html`: headline, introduction, three scroll steps, supporting content and credits.
- `styles.css`: design tokens, layout, responsive graphic states and the retained `minerals` footer styles.
- `scroll.js`: switches the persistent graphic between `overview`, `focus` and `connections` in both scroll directions. Match each step's `data-step` to a CSS state; `data-title` and `data-caption` update its visible labels.
- `media/`: static header, logo and two supporting image placeholders. Replace the inline SVG in `index.html` with the final graphic and adapt its state selectors in CSS.

All copy and graphic elements are placeholders, not factual analysis or data. The temporary header is copied from `unga-2025/images/poster.jpg`; the logo and favicon come from `minerals`. Confirm the final image selection and credits before publication. Replace the draft metadata, date and contributor names, remove `noindex, nofollow` when ready, and add the final canonical URL and social metadata once the publication location is known.

Without JavaScript the graphic and all narrative remain visible in normal document flow. Reduced-motion preferences disable transitions and smooth scrolling.

## GitHub Pages

Repository: https://github.com/CrisisGroup/unga-sg

Pages is configured in **Settings → Pages → Build and deployment** using **Deploy from a branch**, branch **main**, folder **/ (root)**. Every push to `main` republishes the site. The included `.nojekyll` file serves the static files directly; no custom workflow, package installation or secrets are needed.

Site: https://crisisgroup.github.io/unga-sg/

It also works at a domain root. There are no sub-pages or routes requiring rewrites. To reproduce the deployment in another repository, select the same branch and folder in its Pages settings.
