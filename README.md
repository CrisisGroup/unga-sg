# UNGA–SG

A single-page static visual explainer. Copy and the white closing section follow the supplied `Wireframe.pdf`; the existing photo-header placement and dark scroll-driven illustration are retained. No build step or runtime server is required.

## Preview

Open `index.html` directly, or from the parent `github` directory run:

```sh
python -m http.server 8000
```

Visit `http://localhost:8000/unga-sg/` to preview under the repository subpath used by GitHub Pages. All local assets use relative URLs. Adobe Fonts is optional; system serif and sans-serif fallbacks are provided.

## Editing

- `index.html`: headline, introduction, six scroll steps, Looking Ahead and credits.
- `styles.css`: design tokens, layout, responsive graphic states and the PDF's closing-section styles.
- `scroll.js`: switches the persistent graphic between `overview`, `focus` and `connections` in both scroll directions. Match each step's `data-step` to a CSS state; `data-title` and `data-caption` update its visible labels.
- The six steps are Palestine, Iran/Hormuz, Ukraine, Sudan, UN Reform and Next SG. They share the existing three illustration states in pairs; the counter follows the number of articles automatically.
- `media/`: static header, logo and the original General Assembly photograph extracted from the supplied PDF. The two unused supporting placeholders remain available. Replace the inline SVG in `index.html` with the final graphic and adapt its state selectors in CSS when ready.

The supplied PDF is draft copy: its date is “Published TK June, 2026”, several topics repeat the Ukraine paragraph, its introduction discusses four issues while the scrolly has six, and the closing paragraph says “other for a”. These are preserved as supplied, with PDF text-extraction artifacts normalised. The illustration remains a placeholder, not factual data. The temporary header is copied from `unga-2025/images/poster.jpg`; the logo and favicon come from `minerals`. The closing photograph, copy, source links and credits follow the PDF. Review the draft copy and credits before publication, remove `noindex, nofollow` when ready, and add the final canonical URL and social metadata once the publication location is known.

Without JavaScript the graphic and all narrative remain visible in normal document flow. Reduced-motion preferences disable transitions and smooth scrolling.

## GitHub Pages

Repository: https://github.com/CrisisGroup/unga-sg

Pages is configured in **Settings → Pages → Build and deployment** using **Deploy from a branch**, branch **main**, folder **/ (root)**. Every push to `main` republishes the site. The included `.nojekyll` file serves the static files directly; no custom workflow, package installation or secrets are needed.

Site: https://crisisgroup.github.io/unga-sg/

It also works at a domain root. There are no sub-pages or routes requiring rewrites. To reproduce the deployment in another repository, select the same branch and folder in its Pages settings.
