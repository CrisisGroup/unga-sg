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
  const steps = [...section.querySelectorAll('[data-step]')];
  const topicTitles = new Map();
  steps.forEach(step => {
    if (!topicTitles.has(step.dataset.step)) {
      topicTitles.set(step.dataset.step, step.querySelector('h2')?.textContent || 'Overview');
    }
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const stepTransitionDuration = 650;
  const layerOpacities = new Map();
  const stagedLayers = new Map();
  const appliedOpacities = new Map();
  const emphasisLayer = 'story-mali-niger';
  let emphasisTimer;
  let emphasisActive = false;
  let map;
  let captionPanel;
  let captionTopic;
  const locationMarkers = new Map();
  let markerTargetKey;
  let markerTransitionTimeout;
  let styleReady = false;
  let ready = false;
  let accessFailed = false;
  let timeout;
  const active = section.querySelector('.step.is-active') || steps[0];
  let scene = { id: active.dataset.step, part: Number(active.dataset.part || 1), theme: active.dataset.theme };

  function showFallback() {
    ready = false;
    fallback.hidden = false;
    status.hidden = false;
    container.style.visibility = 'hidden';
    figure.dataset.mapStatus = 'fallback';
  }

  function setLayerOpacity(id, opacity, duration) {
    const previous = appliedOpacities.get(id);
    if (previous?.opacity === opacity && previous.duration === duration) return;
    map.setPaintProperty(id, 'fill-opacity-transition', { duration, delay: 0 });
    map.setPaintProperty(id, 'fill-opacity', opacity);
    appliedOpacities.set(id, { opacity, duration });
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
      setLayerOpacity(id, id === selected ? opacity : 0, duration);
    });
    stagedLayers.forEach(({ topic, opacity }, id) => {
      const revealAt = topic === 'palestine' ? 2 : 3;
      const visible = scene.id === topic && (scene.part || 1) >= revealAt;
      setLayerOpacity(id, visible ? opacity : 0, duration);
    });
    updateEmphasis();
    updateLocationMarkers();
    figure.dataset.activeLayer = selected || '';
  }

  function updateEmphasis() {
    if (!map.getLayer(emphasisLayer)) return;
    const enabled = scene.id === 'ukraine' && scene.part === 2;
    if (enabled && emphasisActive && !reducedMotion.matches) return;
    clearTimeout(emphasisTimer);
    emphasisActive = enabled;
    map.setPaintProperty(emphasisLayer, 'line-opacity-transition', {
      duration: enabled && !reducedMotion.matches ? 250 : 0, delay: 0
    });
    map.setPaintProperty(emphasisLayer, 'line-opacity', enabled ? 1 : 0);
    if (!enabled || reducedMotion.matches) return;
    let pulses = 0;
    const flicker = () => {
      pulses += 1;
      map.setPaintProperty(emphasisLayer, 'line-opacity', pulses % 2 ? 0.15 : 1);
      if (pulses < 6) emphasisTimer = window.setTimeout(flicker, 550);
    };
    emphasisTimer = window.setTimeout(flicker, 550);
  }

  function sceneLocations() {
    const locations = scene.id === 'overview'
      ? Object.values(config?.locations || {})
      : [config?.locations?.[scene.id]].filter(Boolean);
    // UN reform and the next Secretary-General share the headquarters marker.
    return new Map(locations.map(location => [location.coordinates.join(','), location]));
  }

  function updateLocationMarkers() {
    const locations = ready ? sceneLocations() : new Map();
    const targetKey = [...locations.keys()].sort().join('|');
    if (targetKey === markerTargetKey && !reducedMotion.matches) return;
    markerTargetKey = targetKey;
    const wasCollapsing = markerTransitionTimeout !== undefined;
    clearTimeout(markerTransitionTimeout);
    markerTransitionTimeout = undefined;
    locations.forEach((location, key) => {
      if (locationMarkers.has(key)) return;
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
    });
    let wasVisible = false;
    locationMarkers.forEach(({ dot }) => {
      wasVisible ||= dot.classList.contains('is-visible');
      dot.classList.remove('is-visible');
    });
    const reveal = () => {
      markerTransitionTimeout = undefined;
      locations.forEach((location, key) => locationMarkers.get(key)?.dot.classList.add('is-visible'));
    };
    if (!reducedMotion.matches && (wasVisible || wasCollapsing)) {
      // Match the CSS collapse duration; only the latest destination may open.
      markerTransitionTimeout = window.setTimeout(reveal, 220);
    } else {
      reveal();
    }
  }

  function updateCaption() {
    if (!captionPanel || captionTopic === scene.id) return;
    captionTopic = scene.id;
    const caption = config.captions?.[scene.id];
    captionPanel.replaceChildren();
    captionPanel.hidden = !caption;
    if (caption) {
      const title = document.createElement('h3');
      title.textContent = caption.title;
      const text = document.createElement('p');
      text.textContent = caption.text;
      captionPanel.append(title, text);
    }
  }

  function selectScene(next) {
    scene = next;
    updateCaption();
    figure.dataset.scene = next.id;
    figure.dataset.theme = next.theme;
    const title = topicTitles.get(next.id) || 'Overview';
    description.textContent = `${title}: world map of General Assembly speeches. ${next.id === 'overview' ? 'Scroll through the topics to explore the data.' : 'The map colour key explains the country colours.'}`;
    const labels = [...sceneLocations().values()].map(location => location.label);
    if (labels.length) description.textContent += labels.length === 1
      ? ` A dot marks ${labels[0]}.`
      : ` Dots mark ${labels.join('; ')}.`;
    if ((next.id === 'palestine' && (next.part || 1) < 2) ||
        (next.id === 'ukraine' && (next.part || 1) < 3)) {
      description.textContent += ' Only countries that referred to this topic are coloured.';
    }
    if (next.id === 'ukraine' && next.part === 2) description.textContent += ' Mali and Niger are highlighted.';
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
    if (ready || !map || accessFailed || !map.isStyleLoaded() || !map.areTilesLoaded()) return;
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
      // Extend the public control lifecycle, keeping Mapbox's own attribution
      // content and toggle intact when sources update or the story changes.
      class StoryAttributionControl extends window.mapboxgl.AttributionControl {
        onAdd(mapInstance) {
          const element = super.onAdd(mapInstance);
          element.classList.add('story-attribution');
          captionPanel = document.createElement('div');
          captionPanel.className = 'story-attribution__caption';
          captionPanel.setAttribute('aria-live', 'polite');
          captionPanel.setAttribute('aria-atomic', 'true');
          element.insertBefore(captionPanel, element.querySelector('.mapboxgl-ctrl-attrib-inner'));
          const button = element.querySelector('button');
          button.setAttribute('aria-label', 'Toggle map caption and attribution');
          button.setAttribute('aria-expanded', 'false');
          updateCaption();
          return element;
        }
      }
      map.addControl(new StoryAttributionControl({ compact: true }), 'bottom-right');
      map.on('style.load', () => {
        styleReady = true;
        map.setProjection(config.projection);
        layerOpacities.clear();
        stagedLayers.clear();
        appliedOpacities.clear();
        clearTimeout(emphasisTimer);
        emphasisActive = false;
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
        // Split the non-mention category into its own layer so it can fade in
        // without changing the green categories or the hosted Studio style.
        const styleLayers = map.getStyle().layers;
        ['palestine', 'ukraine'].forEach(topic => {
          const baseId = config.layers[topic];
          const base = styleLayers.find(layer => layer.id === baseId);
          if (!base) return;
          const id = `${baseId}-not-mentioned`;
          const originalFilter = base.filter;
          const withFilter = condition => originalFilter ? ['all', originalFilter, condition] : condition;
          map.addLayer({
            ...base, id,
            filter: withFilter(['==', ['get', topic], 'Not mentioned']),
            paint: { ...base.paint, 'fill-opacity': 0 }
          }, baseId);
          map.setFilter(baseId, withFilter(['!=', ['get', topic], 'Not mentioned']));
          stagedLayers.set(id, { topic, opacity: layerOpacities.get(baseId) });
        });
        const ukraineLayer = styleLayers.find(layer => layer.id === config.layers.ukraine);
        if (ukraineLayer) map.addLayer({
          id: emphasisLayer, type: 'line', source: ukraineLayer.source,
          'source-layer': ukraineLayer['source-layer'],
          filter: ['match', ['get', 'iso3'], ['MLI', 'NER'], true, false],
          paint: { 'line-color': '#172c2b', 'line-width': 1.5, 'line-opacity': 0 }
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
