/* A single Mapbox instance renders the style's existing thematic layers. */
(() => {
  const section = document.querySelector('[data-scrolly]');
  if (!section) return;
  const figure = section.querySelector('.scrolly__graphic');
  const container = section.querySelector('#story-map');
  const fallback = section.querySelector('[data-map-fallback]');
  const status = section.querySelector('.map-status');
  const description = section.querySelector('#map-description');
  const config = window.UNGA_MAP_CONFIG;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stepTransitionDuration = 650;
  const layerOpacities = new Map();
  let map;
  const locationMarkers = new Map();
  let markerTargetKey;
  let markerTransitionTimeout;
  let styleReady = false;
  let ready = false;
  let accessFailed = false;
  let timeout;
  let active = section.querySelector('.step.is-active') || section.querySelector('[data-step]');
  let scene = { id: active.dataset.step, theme: active.dataset.theme };

  function showFallback() {
    fallback.hidden = false;
    status.hidden = false;
    container.style.visibility = 'hidden';
    figure.dataset.mapStatus = 'fallback';
  }

  function applyScene() {
    if (!map || !styleReady) return;
    const selected = config.layers[scene.id];
    if (selected && !map.getLayer(selected)) {
      showFallback();
      return;
    }
    // Keep thematic layers available so Mapbox can ease both incoming and outgoing
    // opacity, including smoothly retargeting a transition during rapid scrolling.
    const duration = ready && !reducedMotion.matches ? stepTransitionDuration : 0;
    layerOpacities.forEach((opacity, id) => {
      map.setPaintProperty(id, 'fill-opacity-transition', { duration, delay: 0 });
      map.setPaintProperty(id, 'fill-opacity', id === selected ? opacity : 0);
    });
    updateLocationMarkers();
    figure.dataset.activeLayer = selected || '';
  }

  function updateLocationMarkers() {
    const location = ready ? config.locations?.[scene.id] : undefined;
    const key = location?.coordinates.join(',');
    if (key === markerTargetKey && !reducedMotion.matches) return;
    markerTargetKey = key;
    const wasCollapsing = markerTransitionTimeout !== undefined;
    clearTimeout(markerTransitionTimeout);
    markerTransitionTimeout = undefined;
    if (location && !locationMarkers.has(key)) {
      const element = document.createElement('div');
      element.className = 'map-location-marker';
      // Mapbox positions the wrapper; the inner dot scales independently.
      element.setAttribute('aria-hidden', 'true');
      const dot = document.createElement('div');
      dot.className = 'map-location-dot';
      element.append(dot);
      const marker = new window.mapboxgl.Marker({ element, anchor: 'center' })
        .setLngLat(location.coordinates).addTo(map);
      locationMarkers.set(key, { marker, dot });
      // Establish the collapsed state before expanding a new dot.
      dot.getBoundingClientRect();
    }
    let wasVisible = false;
    locationMarkers.forEach(({ dot }) => {
      wasVisible ||= dot.classList.contains('is-visible');
      dot.classList.remove('is-visible');
    });
    const reveal = () => {
      markerTransitionTimeout = undefined;
      locationMarkers.get(key)?.dot.classList.add('is-visible');
    };
    if (!reducedMotion.matches && (wasVisible || wasCollapsing)) {
      // Match the CSS collapse duration; only the latest destination may open.
      markerTransitionTimeout = window.setTimeout(reveal, 220);
    } else {
      reveal();
    }
  }

  function selectScene(next) {
    scene = next;
    figure.dataset.scene = next.id;
    figure.dataset.theme = next.theme;
    const step = [...section.querySelectorAll('[data-step]')].find(item => item.dataset.step === next.id);
    const title = step?.querySelector('h2')?.textContent || 'Overview';
    description.textContent = `${title}: world map of General Assembly speeches. ${next.id === 'overview' ? 'Scroll through the topics to explore the data.' : 'The map colour key explains the country colours.'}`;
    const location = config?.locations?.[next.id];
    if (location) description.textContent += ` A dot marks ${location.label}.`;
    applyScene();
  }

  function fitWorld() {
    if (!map) return;
    map.resize();
    // Keep the complete world visible inside the responsive map area, clear of attribution.
    map.fitBounds([[-180, -85], [180, 85]], {
      padding: { top: 8, bottom: 28, left: 8, right: 8 },
      duration: 0,
      bearing: 0,
      pitch: 0
    });
    // Equal Earth's widest latitude is the equator, outside those corner bounds.
    const worldWidth = map.project([180, 0]).x - map.project([-180, 0]).x;
    const available = container.clientWidth - 16;
    if (available > 0 && worldWidth > available) {
      map.setZoom(map.getZoom() + Math.log2(available / worldWidth));
    }
  }

  function revealMap() {
    if (!map || accessFailed || !map.isStyleLoaded() || !map.areTilesLoaded()) return;
    const selected = config.layers[scene.id];
    if (selected && !map.getLayer(selected)) return;
    ready = true;
    clearTimeout(timeout);
    fallback.hidden = true;
    status.hidden = true;
    container.style.visibility = 'visible';
    figure.dataset.mapStatus = 'ready';
    updateLocationMarkers();
  }

  function updateCategoryChecks(expression, field) {
    if (!Array.isArray(expression)) return expression;
    if (field === 'palestine' && expression[0] === 'match' &&
        expression[1]?.[0] === 'get' && expression[1][1] === field) {
      expression = [...expression];
      // Support both published label versions without overriding Studio colours.
      const aliases = [
        ['Palestine, Gaza or West Bank', 'Palestine or Gaza, with West Bank'],
        ['Palestine or Gaza', 'Palestine or Gaza, without West Bank']
      ];
      for (let i = 2; i < expression.length - 1; i += 2) {
        const labels = Array.isArray(expression[i]) ? [...expression[i]] : [expression[i]];
        aliases.forEach(group => {
          if (group.some(label => labels.includes(label))) {
            group.forEach(label => { if (!labels.includes(label)) labels.push(label); });
          }
        });
        expression[i] = labels;
      }
    }
    // Some Studio expressions copied the Ukraine no-data predicate. Only repair
    // those predicates; preserve the published category colours and other rules.
    if (expression[0] === 'match' && expression[1]?.[0] === 'get' &&
        expression[1][1] === 'ukraine' && Array.isArray(expression[2]) &&
        expression[2].every(label => label === 'No data' || label === 'Not recognised')) {
      return [expression[0], ['get', field], ...expression.slice(2)];
    }
    return expression.map(value => updateCategoryChecks(value, field));
  }

  function initialise() {
    if (map) return;
    if (!config?.accessToken || !window.mapboxgl || !window.mapboxgl.supported()) {
      showFallback();
      return;
    }
    try {
      figure.dataset.mapStatus = 'loading';
      container.style.visibility = 'hidden';
      map = new window.mapboxgl.Map({
        container,
        accessToken: config.accessToken,
        style: config.style,
        projection: config.projection,
        center: [0, 0],
        zoom: 0,
        minZoom: -2,
        interactive: false,
        renderWorldCopies: false,
        attributionControl: false,
        logoPosition: 'bottom-right',
        fadeDuration: reducedMotion.matches ? 0 : 300
      });
      map.addControl(new window.mapboxgl.AttributionControl({ compact: true }), 'bottom-right');
      map.on('style.load', () => {
        styleReady = true;
        map.setProjection(config.projection);
        layerOpacities.clear();
        Object.values(config.layers).filter(Boolean).forEach(id => {
          if (!map.getLayer(id)) return;
          layerOpacities.set(id, map.getPaintProperty(id, 'fill-opacity') ?? 1);
          map.setPaintProperty(id, 'fill-opacity-transition', { duration: 0, delay: 0 });
          map.setPaintProperty(id, 'fill-opacity', 0);
          map.setLayoutProperty(id, 'visibility', 'visible');
        });
        ['speech_data', 'unga-2026-blank'].forEach(id => {
          if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', 'none');
        });
        // Use the current Studio palette and tileset references, with consistent
        // no-data handling based on each topic's own field.
        const topicFields = {
          palestine: 'palestine',
          'iran-hormuz': 'iran_hormuz',
          ukraine: 'ukraine',
          sudan: 'sudan',
          'un-reform': 'un_reform',
          'next-sg': 'next_secretary_general'
        };
        Object.entries(topicFields).forEach(([step, field]) => {
          const id = config.layers[step];
          if (!map.getLayer(id)) return;
          const colour = map.getPaintProperty(id, 'fill-color');
          map.setPaintProperty(id, 'fill-color', [
            'match', ['get', field],
            ['No data', 'Not recognised'], '#ffffff',
            updateCategoryChecks(colour, field)
          ]);
        });
        applyScene();
        fitWorld();
      });
      map.on('idle', revealMap);
      map.on('error', event => {
        if (event.error?.status === 401 || event.error?.status === 403) accessFailed = true;
        if (!ready || accessFailed) showFallback();
      });
      map.on('webglcontextlost', showFallback);
      map.on('webglcontextrestored', () => { ready = false; applyScene(); fitWorld(); });
      new ResizeObserver(fitWorld).observe(container);
      timeout = window.setTimeout(() => { if (!ready) showFallback(); }, 15000);
    } catch {
      showFallback();
    }
  }

  section.addEventListener('story:stepchange', event => selectScene(event.detail));
  reducedMotion.addEventListener('change', applyScene);
  selectScene(scene);
  // Defer map requests until the reader approaches the scrolly.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        observer.disconnect();
        initialise();
      }
    }, { rootMargin: '100% 0px' });
    observer.observe(section);
  } else {
    initialise();
  }
  window.addEventListener('pageshow', () => { if (map) { fitWorld(); applyScene(); } });
})();
