const MAP_RADIUS_KM = 5;
const BOOT_MIN_MS = 900;
const USE_LOCAL_CHIBI_AVATAR = false;
const ENABLE_RECONSTRUCTED_BUILDINGS = true;
const KENNEY_CITY_ASSET_BASE = './assets/kenney/Starter-Kit-City-Builder/models/';
const KENNEY_RACING_ASSET_BASE = './assets/kenney/Starter-Kit-Racing/models/';
const KENNEY_CITY_BUILDING_MODELS = [
  'building-small-a.glb',
  'building-small-b.glb',
  'building-small-c.glb',
  'building-small-d.glb',
  'building-garage.glb',
];
const KENNEY_CITY_TREE_MODELS = [
  'grass-trees.glb',
  'grass-trees-tall.glb',
];
const KENNEY_RACING_VEHICLES = {
  car: 'vehicle-truck-yellow.glb',
  tank: 'vehicle-truck-purple.glb',
  airplane: 'vehicle-motorcycle.glb',
  mouse: 'vehicle-motorcycle.glb',
  cat: 'vehicle-truck-red.glb',
  horse: 'vehicle-truck-green.glb',
};
const MJE_PACK_BASE = './assets/characters/mje-pack/';
const MOBILE_ANALYSIS_DELAY_MS = 6500;
const MOBILE_MINIMAP_DELAY_MS = 2500;
const CAULDRON_WEB_CACHE_VERSION = 'cauldron-v0.3.4-kenney-assets';
const CAULDRON_EXPECTED_RUNTIME_VERSION = 'v0.3.1-production-wiring';
const VANCOUVER_SCENE_PATH = './cauldron-vancouver/data/scenes/vancouver_demo.pixel_scene.json';
const VANCOUVER_CHUNK_PATH = './cauldron-vancouver/data/chunks/vancouver_000_000.chunk.json';
const VANCOUVER_CAPTURE_PATH = './cauldron-vancouver/data/captures/vancouver_100m_quadclipse_cmon9skn4001n01pzd3mdbcaz.capture.json';
const VANCOUVER_CAPTURE_GRID_PATH = './cauldron-vancouver/data/captures/vancouver_100m_quadclipse_cmon9skn4001n01pzd3mdbcaz.grid128.json';
const VANCOUVER_RUNTIME_CENTER = [-123.1207, 49.2827];
const VANCOUVER_SAFE_ROAD_LOCAL = { xMeters: 2, yMeters: 0 };
const PROFILE_KEY = 'cauldron_publish_character_v1';
const HOME_KEY = 'cauldron_publish_home_v1';
const CHARACTER_SPRITES = {
  female: [
    './assets/characters/mje/mje.png',
    './assets/characters/mje/mje_transparent.png',
    './assets/characters/female/mje.png',
    './assets/characters/base/base_default.png',
    './assets/characters/base/base_default_transparent.png',
  ],
  male: [
    './assets/characters/mje/mje.png',
    './assets/characters/male/male.png',
    './assets/characters/male/male_transparent.png',
    './assets/characters/base/male.png',
    './assets/characters/base/base_default.png',
    './assets/characters/base/base_default_transparent.png',
  ],
};
const SPRITE_COLUMNS = 12;
const SPRITE_ROWS = 4;
const PLAYER_STEP_METERS = 2.4;
const PLAYER_TAP_STEP_METERS = 0.6;
const PLAYER_RUN_MULTIPLIER = 1.7;
const CAMERA_PITCH = 48;
const CAMERA_BEARING = -10;
const MINIMAP_RADIUS_LEVELS = [
  { label: '50m', radiusMeters: 50, zoom: 18.35 },
  { label: '100m', radiusMeters: 100, zoom: 17.35 },
  { label: '500m', radiusMeters: 500, zoom: 15.05 },
  { label: '1km', radiusMeters: 1000, zoom: 14.05 },
  { label: '5km', radiusMeters: 5000, zoom: 11.75 },
];
const DEFAULT_ZOOM_LEVEL_INDEX = 1;
const CAMERA_ZOOM = 20.45;
const MINIMAP_ZOOM = MINIMAP_RADIUS_LEVELS[DEFAULT_ZOOM_LEVEL_INDEX].zoom;
const HOME_BUILDING_KEY = 'cauldron_home_building_v1';
const OBSTACLE_PRELOAD_RADIUS_METERS = 5000;
const COLLISION_PADDING_METERS = 5.5;
const PLAYER_COLLISION_RADIUS_METERS = 3.2;
const COLLISION_MAP_CELL_METERS = 2;
const PLAYER_WALK_METERS_PER_SECOND = 6.8;
const DATA_MODE_SPEED_MULTIPLIER = 2;
const SPRITE_WALK_FRAMES_PER_SECOND = 7.5;
const SPRITE_IDLE_FRAMES_PER_SECOND = 2.2;
const NORMAL_VISIBLE_LOAD_RADIUS_METERS = 420;
const DATA_MODE_FORWARD_LOAD_METERS = 760;
const DATA_MODE_SIDE_LOAD_METERS = 170;
const MAP_CAMERA_SYNC_MS = 80;
const MOBILE_MAP_CAMERA_SYNC_MS = 140;
const FLIGHT_MAX_LIFT = 54;
const FLIGHT_CAMERA_ZOOM_OUT = 0.72;
const MOUNT_SPEEDS = {
  none: 1,
  cat: 1.25,
  mouse: 1.15,
  horse: 1.9,
  car: 2.7,
  tank: 1.55,
  airplane: 4.4,
};

const SPAWN_POINTS = {
  tokyo: {
    label: 'Tokyo Disneyland Entrance',
    lngLat: [139.878635, 35.632896],
    zoom: 15,
  },
  seoul: {
    label: 'Seoul Han River',
    lngLat: [126.996133, 37.516269],
    zoom: 15,
  },
  vancouver: {
    label: 'Vancouver Downtown Burrard',
    lngLat: [-123.120738, 49.282918],
    zoom: 15,
  },
  la: {
    label: 'LA Fairfax St Canteen',
    lngLat: [-118.361878, 34.079765],
    zoom: 15,
  },
  lasvegas: {
    label: 'Las Vegas Blvd',
    lngLat: [-115.172849, 36.114647],
    zoom: 15,
  },
  newyork: {
    label: 'New York Bryant Park',
    lngLat: [-73.9855, 40.7536],
    zoom: 15,
  },
};

const FALLBACK_TALK_POINTS = {
  tokyo: [
    { name: 'Tokyo Disneyland Entrance', type: 'attraction', offset: [0, 0] },
    { name: 'Maihama Station Food Street', type: 'restaurant', offset: [0.010, 0.004] },
  ],
  seoul: [
    { name: 'Han River Riverside', type: 'attraction', offset: [0, 0] },
    { name: 'Hangang Cafe Point', type: 'restaurant', offset: [0.006, -0.003] },
  ],
  vancouver: [
    { name: 'Downtown Burrard', type: 'attraction', offset: [0, 0] },
    { name: 'Burrard Food Block', type: 'restaurant', offset: [0.004, 0.003] },
  ],
  la: [
    { name: 'Fairfax St Canteen', type: 'restaurant', offset: [0, 0] },
    { name: 'Fairfax Culture Block', type: 'attraction', offset: [0.004, 0.003] },
  ],
  lasvegas: [
    { name: 'Las Vegas Blvd', type: 'attraction', offset: [0, 0] },
    { name: 'Strip Restaurant Row', type: 'restaurant', offset: [0.004, -0.003] },
  ],
  newyork: [
    { name: 'Bryant Park', type: 'park', offset: [0, 0] },
    { name: 'Fifth Avenue Shopfront', type: 'shop', offset: [0.003, 0.001] },
    { name: 'Midtown Food Hall', type: 'restaurant', offset: [-0.002, -0.001] },
  ],
};

const state = {
  app: document.getElementById('cauldron-app'),
  map: null,
  minimap: null,
  analysisMap: null,
  playerMarker: null,
  minimapMarker: null,
  poiMarkers: [],
  nearbyPois: [],
  portalPois: [],
  portalLayer: document.getElementById('portal-layer'),
  kenneyBuildingLayer: document.getElementById('kenney-building-layer'),
  reconstructedBuildings: [],
  activeProximityTargetId: null,
  interactionTarget: null,
  lastProximityDialogueAt: 0,
  villagePois: [],
  buildingHitboxes: [],
  treeHitboxes: [],
  obstacleFeatures: [],
  collisionMap: null,
  cauldronRuntime: {
    version: CAULDRON_EXPECTED_RUNTIME_VERSION,
    canvas: null,
    coordinateEngine: null,
    collisionSystem: null,
    scene: null,
    chunk: null,
    sceneReport: null,
    chunkReport: null,
    activeRenderMode: 'verticalData',
    ready: false,
    loading: false,
    promise: null,
    error: null,
    lastProbe: null,
    lastFrameStats: null,
    scenePath: VANCOUVER_SCENE_PATH,
    chunkPath: VANCOUVER_CHUNK_PATH,
  },
  navigationFile: null,
  mapFileReady: false,
  preloadOrigin: null,
  preloadSamples: [],
  preloadSampleIndex: 0,
  analysisPreloadStarted: false,
  lastCameraZoom: CAMERA_ZOOM,
  homeBuilding: null,
  currency: { gold: 150, gems: 3 },
  inventory: ['Navigation Map', 'Starter Potion'],
  activeMount: 'none',
  bgm: { context: null, gain: null, timer: null, enabled: false },
  skills: ['Slash', 'Guard', 'Dash', 'Portal Talk', 'Mount Call', '맛집찾기'],
  quickSlots: ['', '', '', '', '', '스프린트', '장소이동', '친구순간이동', 'Data mode', '테이블 예약', '일반 공격', '연속 공격', '강공격', '이동 공격기', '필살기'],
  quickSlotKeys: ['1', '2', '3', '4', '5', 'Q', 'W', 'E', 'R', 'T', 'A', 'S', 'D', 'F', 'G'],
  isFlying: false,
  dataModeDirection: null,
  sprintCooldownUntil: 0,
  travelTarget: null,
  travelMap: null,
  travelMarker: null,
  dialogueSelectionIndex: 0,
  dialogueArrowHeldSince: 0,
  addressCache: new Map(),
  lastVisualLoadAt: 0,
  lastVisualLoadCenter: null,
  lastMapCameraSyncAt: 0,
  chatChannel: 'channel',
  chatVisible: true,
  chatComposing: false,
  authProvider: 'guest',
  server: {
    region: 'Vancouver',
    shardId: 'vancouver-001',
    maxUsers: 20,
    onlineUsers: [
      { id: 'greeter', name: 'BurrardGreeter', expression: 'smile', status: 'nearby' },
      { id: 'foodie', name: 'GastownFoodie', expression: 'happy', status: 'local' },
      { id: 'guide', name: 'StanleyGuide', expression: 'neutral', status: 'party-ready' },
    ],
  },
  party: {
    leader: true,
    follow: false,
    members: [
      { id: 'me', name: 'Me', role: 'Leader', hp: 100, online: true },
      { id: 'nearby', name: 'Nearby Guest', role: 'Invite Ready', hp: 100, online: true },
    ],
  },
  pendingSkill: null,
  zoomLevelIndex: DEFAULT_ZOOM_LEVEL_INDEX,
  currentSpawn: SPAWN_POINTS.vancouver,
  playerLngLat: [...SPAWN_POINTS.vancouver.lngLat],
  keys: new Set(),
  sprite: {
    canvas: document.getElementById('sprite-character'),
    image: null,
    ready: false,
    frame: 0,
    frameTimer: 0,
    direction: 'down',
    moving: false,
    jumpZ: 0,
    jumpVelocity: 0,
    flightZ: 0,
    flightTarget: 0,
    jumps: 0,
    attacking: 0,
    lastTick: performance.now(),
    expression: 'neutral',
    pack: null,
    packImages: new Map(),
  },
  camera: {
    stream: null,
    video: null,
    enabled: false,
    expressionTimer: null,
  },
  mobileLocationWatchId: null,
  profile: null,
  mapLoaded: false,
  bootStartedAt: Date.now(),
  lastHudDatasetAt: 0,
  lastPoiQueryAt: 0,
  lastMinimapSyncAt: 0,
  animationLoopRunning: false,
  animationFrameId: null,
};

const bootStatus = document.getElementById('boot-status');
const creator = document.getElementById('creator');
const creatorForm = document.getElementById('creator-form');
const spawnRegion = document.getElementById('spawn-region');
const characterId = document.getElementById('character-id');
const homeAddress = document.getElementById('home-address');
const gender = document.getElementById('gender');

function setBootStatus(message) {
  if (bootStatus) bootStatus.textContent = message;
}

function finishLoadingWhenReady() {
  const remaining = Math.max(0, BOOT_MIN_MS - (Date.now() - state.bootStartedAt));
  window.setTimeout(() => {
    const mapReady = state.mapLoaded || state.cauldronRuntime.ready || state.map?.loaded?.() || state.map?.isStyleLoaded?.();
    if (!mapReady) {
      setBootStatus('Loading Cauldron play world...');
      window.setTimeout(finishLoadingWhenReady, 700);
      return;
    }
    state.mapLoaded = true;
    if (state.app.classList.contains('is-playing') && !state.mapFileReady && !isMobilePerformanceMode()) {
      setBootStatus('Building local navigation map file...');
      window.setTimeout(finishLoadingWhenReady, 700);
      return;
    }
    if (state.app.classList.contains('is-playing') && !state.sprite.ready) {
      setBootStatus('Loading character sprite...');
      window.setTimeout(finishLoadingWhenReady, 700);
      return;
    }
    state.app.classList.remove('is-booting');
    state.app.classList.add('is-ready');
    setBootStatus('Cauldron ready.');
    window.setTimeout(updateInteractionHint, 250);
  }, remaining);
}

function isMobilePerformanceMode() {
  return window.matchMedia?.('(max-width: 820px), (hover: none), (pointer: coarse)')?.matches
    || navigator.hardwareConcurrency <= 4;
}

function runWhenIdle(callback, timeout = 2000) {
  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(callback, { timeout });
    return;
  }
  window.setTimeout(callback, Math.min(timeout, 1200));
}

function debugPerformanceEnabled() {
  const enabled = new URLSearchParams(window.location.search).has('debugPerformance')
    || localStorage.getItem('cauldron_debug_performance') === 'true';
  if (state?.app) state.app.dataset.debugPerformance = enabled ? 'true' : 'false';
  return enabled;
}

function cauldronProductionLog(label, value) {
  console.log(`[Cauldron] ${label}:`, value);
}

function showRuntimeError(message, details = null) {
  const overlay = document.getElementById('cauldron-runtime-error');
  if (overlay) {
    overlay.hidden = false;
    overlay.textContent = details ? `${message}\n${JSON.stringify(details, null, 2)}` : message;
  }
  setBootStatus(message);
}

function updateCauldronDebugOverlay() {
  const overlay = document.getElementById('cauldron-runtime-debug');
  if (!overlay) return;
  if (!debugPerformanceEnabled()) {
    overlay.hidden = true;
    return;
  }
  overlay.hidden = false;
  overlay.textContent = [
    `runtime ${state.cauldronRuntime.version}`,
    `mode ${state.cauldronRuntime.activeRenderMode}`,
    `scene ${state.cauldronRuntime.sceneReport?.status || 'n/a'} · ${state.cauldronRuntime.sceneReport?.objectCount || 0} commands`,
    `chunk ${state.cauldronRuntime.chunkReport?.status || 'n/a'} · mask ${state.cauldronRuntime.chunkReport?.maskDimensions || 'missing'}`,
    `collision loaded ${Boolean(state.cauldronRuntime.collisionSystem?.maskLoaded)}`,
    `fps ${state.cauldronRuntime.lastFrameStats?.fps?.toFixed?.(1) || 'n/a'} · draw ${state.cauldronRuntime.lastFrameStats?.drawCallCount || 0}`,
    state.cauldronRuntime.lastProbe ? `probe ${JSON.stringify(state.cauldronRuntime.lastProbe)}` : 'probe n/a',
    `server ${state.server.shardId} ${state.server.onlineUsers.length}/${state.server.maxUsers}`,
  ].join('\n');
}

function cauldronCanvasStatus() {
  const canvas = document.getElementById('cauldron-runtime-canvas');
  if (!canvas) return { mounted: false };
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  return {
    mounted: true,
    width: Math.round(rect.width),
    height: Math.round(rect.height),
    zIndex: style.zIndex,
    opacity: style.opacity,
    display: style.display,
    pointerEvents: style.pointerEvents,
  };
}

function cauldronRuntimeEnabledForCurrentRegion() {
  return (state.profile?.spawnRegion || spawnRegion?.value || 'vancouver') === 'vancouver';
}

async function initializeCauldronProductionRuntime() {
  if (state.cauldronRuntime.ready) return true;
  if (state.cauldronRuntime.promise) return state.cauldronRuntime.promise;
  state.cauldronRuntime.promise = loadCauldronProductionRuntime();
  return state.cauldronRuntime.promise;
}

async function loadCauldronProductionRuntime() {
  state.cauldronRuntime.loading = true;
  const runtime = window.CauldronProductionRuntime;
  if (!runtime) {
    state.cauldronRuntime.error = 'Cauldron production runtime script missing.';
    showRuntimeError(state.cauldronRuntime.error);
    state.cauldronRuntime.loading = false;
    state.cauldronRuntime.promise = null;
    return false;
  }
  state.cauldronRuntime.version = runtime.CAULDRON_RUNTIME_VERSION;
  console.log(`[Cauldron] runtime version: ${runtime.CAULDRON_RUNTIME_VERSION}`);
  cauldronProductionLog('render mode', 'verticalData');
  cauldronProductionLog('capture path', VANCOUVER_CAPTURE_PATH);
  let loaded = runtime.loadMapCaptureTerrain
    ? await runtime.loadMapCaptureTerrain({
      capturePath: VANCOUVER_CAPTURE_PATH,
      gridPath: VANCOUVER_CAPTURE_GRID_PATH,
      cacheVersion: CAULDRON_WEB_CACHE_VERSION,
      gridSize: 128,
      posterizeLevels: 6,
    })
    : { ok: false };
  if (!loaded.ok) {
    cauldronProductionLog('capture fallback', loaded.sceneReport || loaded);
    cauldronProductionLog('scene path', VANCOUVER_SCENE_PATH);
    cauldronProductionLog('chunk path', VANCOUVER_CHUNK_PATH);
    loaded = await runtime.loadCauldronAssets({
    scenePath: VANCOUVER_SCENE_PATH,
    chunkPath: VANCOUVER_CHUNK_PATH,
    cacheVersion: CAULDRON_WEB_CACHE_VERSION,
    });
  }
  state.cauldronRuntime.sceneReport = loaded.sceneReport;
  state.cauldronRuntime.chunkReport = loaded.chunkReport;
  cauldronProductionLog('scene fetch', loaded.sceneReport);
  cauldronProductionLog('chunk fetch', loaded.chunkReport);
  if (!loaded.ok) {
    state.cauldronRuntime.error = 'Cauldron JSON scene/chunk load failed. Refusing silent old-map fallback.';
    showRuntimeError(state.cauldronRuntime.error, { scene: loaded.sceneReport, chunk: loaded.chunkReport });
    state.cauldronRuntime.loading = false;
    state.cauldronRuntime.promise = null;
    return false;
  }
  const canvasElement = document.getElementById('cauldron-runtime-canvas');
  if (!canvasElement) {
    state.cauldronRuntime.error = 'Cauldron canvas missing from DOM.';
    showRuntimeError(state.cauldronRuntime.error);
    state.cauldronRuntime.loading = false;
    state.cauldronRuntime.promise = null;
    return false;
  }
  state.cauldronRuntime.scene = loaded.scene;
  state.cauldronRuntime.chunk = loaded.chunk;
  state.cauldronRuntime.capture = loaded.capture || null;
  state.cauldronRuntime.activeRenderMode = loaded.scene.mode || 'verticalData';
  state.cauldronRuntime.coordinateEngine = new runtime.CoordinateEngine(loaded.scene.center || VANCOUVER_RUNTIME_CENTER);
  state.cauldronRuntime.collisionSystem = new runtime.CollisionSystem();
  state.cauldronRuntime.collisionSystem.setChunks([loaded.chunk]);
  state.cauldronRuntime.canvas = new runtime.CauldronCanvas({
    canvas: canvasElement,
    maxDevicePixelRatio: 1.5,
    renderQuality: 'performance',
  });
  state.cauldronRuntime.canvas.setScene(loaded.scene);
  state.cauldronRuntime.canvas.setChunks([loaded.chunk]);
  state.cauldronRuntime.ready = true;
  state.cauldronRuntime.loading = false;
  state.cauldronRuntime.promise = null;
  rebuildKenneyPlacementsFromTerrain();
  state.mapFileReady = true;
  state.app.dataset.cauldronRuntimeVersion = runtime.CAULDRON_RUNTIME_VERSION;
  state.app.dataset.cauldronRenderMode = state.cauldronRuntime.activeRenderMode;
  state.app.dataset.cauldronTerrainSource = loaded.tileGrid ? 'mapbox-png-grid' : loaded.capture ? 'mapbox-png-3km' : 'compiled-json';
  state.app.dataset.cauldronTerrainCounts = loaded.scene?.terrain3d?.counts ? JSON.stringify(loaded.scene.terrain3d.counts) : '';
  state.app.dataset.cauldronTerrainModel = loaded.scene?.terrain3d?.conversionModel || loaded.scene?.terrain3d?.heightModel || '';
  state.app.dataset.cauldronTerrainGrid = String(loaded.scene?.terrain3d?.gridSize || '');
  state.app.dataset.collisionMaskLoaded = String(Boolean(state.cauldronRuntime.collisionSystem.maskLoaded));
  state.app.dataset.mapFileReady = 'runtime-json';
  cauldronProductionLog('collision system', {
    maskLoaded: state.cauldronRuntime.collisionSystem.maskLoaded,
    maskDimensions: loaded.chunkReport.maskDimensions,
  });
  cauldronProductionLog('active render mode', state.cauldronRuntime.activeRenderMode);
  cauldronProductionLog('canvas mounted', cauldronCanvasStatus());
  renderCauldronRuntimeFrame();
  renderKenneyBuildings();
  updateCauldronDebugOverlay();
  return true;
}

function renderCauldronRuntimeFrame() {
  if (!state.cauldronRuntime.ready || !state.cauldronRuntime.canvas || !state.cauldronRuntime.coordinateEngine) return;
  const canvasElement = document.getElementById('cauldron-runtime-canvas');
  const showPlayCanvas = cauldronRuntimeEnabledForCurrentRegion();
  if (!showPlayCanvas) {
    if (canvasElement) {
      canvasElement.style.opacity = '0';
      canvasElement.style.visibility = 'hidden';
    }
    state.cauldronRuntime.lastFrameStats = {
      frameTimeMs: 0,
      fps: 0,
      drawCallCount: 0,
      visibleObjectCount: state.cauldronRuntime.scene?.renderCommands?.length || 0,
      renderMode: state.cauldronRuntime.activeRenderMode,
      staticCacheBuilt: true,
    };
    updateCauldronDebugOverlay();
    return;
  }
  if (canvasElement) {
    canvasElement.style.opacity = '1';
    canvasElement.style.visibility = 'visible';
  }
  const playerLocal = state.cauldronRuntime.coordinateEngine.lngLatToLocal(state.playerLngLat);
  state.cauldronRuntime.lastFrameStats = state.cauldronRuntime.canvas.drawFrame({ playerLocal });
  updateCauldronDebugOverlay();
}

function snapPlayerToCauldronRoad() {
  if (!state.cauldronRuntime.coordinateEngine) return;
  const spawnLocal = nearestWalkableLocalPoint() || VANCOUVER_SAFE_ROAD_LOCAL;
  state.playerLngLat = state.cauldronRuntime.coordinateEngine.localToLngLat(spawnLocal);
  state.app.dataset.cauldronSpawn = state.cauldronRuntime.capture ? 'mapbox-png-walkable' : 'compiled-road';
  state.app.dataset.cauldronSpawnLocal = `${spawnLocal.xMeters.toFixed(1)},${spawnLocal.yMeters.toFixed(1)}`;
}

function nearestWalkableLocalPoint() {
  const chunk = state.cauldronRuntime.chunk;
  const masks = chunk?.masks;
  if (!chunk?.localBounds || !masks?.walkable) return null;
  const target = { xMeters: 0, yMeters: 0 };
  let best = null;
  for (let y = 0; y < masks.height; y += 1) {
    for (let x = 0; x < masks.width; x += 1) {
      const walkable = Boolean(masks.walkable[y]?.[x]);
      const blocked = Boolean(masks.blocked?.[y]?.[x]);
      const water = Boolean(masks.swimmable?.[y]?.[x]);
      if (!walkable || blocked || water) continue;
      const xMeters = chunk.localBounds.minX + (x + 0.5) * masks.cellSizeMeters;
      const yMeters = chunk.localBounds.minY + (y + 0.5) * masks.cellSizeMeters;
      const distance = Math.hypot(xMeters - target.xMeters, yMeters - target.yMeters);
      if (!best || distance < best.distance) best = { xMeters, yMeters, distance };
    }
  }
  return best ? { xMeters: best.xMeters, yMeters: best.yMeters } : null;
}

function productionCollisionAt(lngLat) {
  const runtime = state.cauldronRuntime;
  if (!cauldronRuntimeEnabledForCurrentRegion()) return null;
  if (!runtime.ready || !runtime.coordinateEngine || !runtime.collisionSystem) return null;
  const local = runtime.coordinateEngine.lngLatToLocal(lngLat);
  const probe = runtime.collisionSystem.debugProbe(local);
  runtime.lastProbe = probe;
  updateCauldronDebugOverlay();
  if (!probe.hasChunk || !probe.hasMask) {
    return { id: probe.chunkId || 'chunk-missing', type: 'collision-data-missing', distance: 0, probe };
  }
  if (probe.blocked) return { id: probe.chunkId, type: 'building', distance: 0, probe };
  if (probe.swimmable) return { id: probe.chunkId, type: 'water', distance: 0, probe };
  if (!probe.walkable) return { id: probe.chunkId, type: 'non-walkable', distance: 0, probe };
  return null;
}

function createMarkerElement(className, label) {
  const el = document.createElement('button');
  el.className = className;
  el.type = 'button';
  el.title = label;
  el.setAttribute('aria-label', label);
  if (className.includes('portal')) {
    const caption = document.createElement('span');
    caption.textContent = label.replace(/^Talk to\s+/i, '');
    el.appendChild(caption);
  }
  return el;
}

function radiusBounds([lng, lat], radiusKm = MAP_RADIUS_KM) {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos((lat * Math.PI) / 180));
  return [
    [lng - lngDelta, lat - latDelta],
    [lng + lngDelta, lat + latDelta],
  ];
}

function setFadeBounds(center) {
  if (!state.map) return;
  state.map.setMaxBounds(radiusBounds(center, MAP_RADIUS_KM));
}

function createHomeBuilding(home) {
  if (!home?.lngLat) return null;
  return {
    id: `home:${state.profile?.characterId || 'player'}`,
    type: 'user_home',
    lngLat: home.lngLat,
    addressLabel: home.label || state.profile?.homeAddress || 'Home',
    floorHeightMeters: /apt|apartment|condo|unit|suite|#|floor/i.test(state.profile?.homeAddress || '') ? 3 : 0,
    createdAt: new Date().toISOString(),
  };
}

function saveHomeBuilding(homeBuilding) {
  if (!homeBuilding) return;
  state.homeBuilding = homeBuilding;
  localStorage.setItem(HOME_BUILDING_KEY, JSON.stringify(homeBuilding));
}

function loadHomeBuilding() {
  try {
    return JSON.parse(localStorage.getItem(HOME_BUILDING_KEY) || 'null');
  } catch {
    return null;
  }
}

function addMapboxBuildingDepth() {
  if (!state.map?.getStyle?.()) return;
  const layers = state.map.getStyle().layers || [];
  const labelLayer = layers.find((layer) => layer.type === 'symbol' && layer.layout?.['text-field']);
  if (!state.map.getSource('composite') || state.map.getLayer('cauldron-building-depth')) return;
  try {
    state.map.addLayer(
      {
        id: 'cauldron-building-depth',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', ['get', 'extrude'], 'true'],
        type: 'fill-extrusion',
        minzoom: 14,
        paint: {
          'fill-extrusion-color': '#d9b678',
          'fill-extrusion-height': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, ['get', 'height']],
          'fill-extrusion-base': ['interpolate', ['linear'], ['zoom'], 14, 0, 16, ['get', 'min_height']],
          'fill-extrusion-opacity': 0.1,
        },
      },
      labelLayer?.id
    );
  } catch {
    // Some Mapbox styles do not expose a building source-layer. Keep the prototype stable.
  }
}

function lowerBuildingOpacityForVisibility() {
  if (!state.map?.getStyle?.()) return;
  try {
    let lowered = 0;
    (state.map.getStyle().layers || [])
      .filter((layer) => layer.type === 'fill-extrusion' && /building|extrusion|3d/i.test(layer.id))
      .forEach((layer) => {
        state.map.setPaintProperty(layer.id, 'fill-extrusion-opacity', 0.1);
        lowered += 1;
      });
    state.app.dataset.buildingOpacity = '0.1';
    state.app.dataset.buildingOpacityLayers = String(lowered);
  } catch {
    // Visual safety only; never block the map if a style layer is immutable.
  }
}

function currentZoom() {
  return MINIMAP_RADIUS_LEVELS[state.zoomLevelIndex]?.zoom || MINIMAP_ZOOM;
}

function setZoomLevel(index) {
  state.zoomLevelIndex = Math.max(0, Math.min(MINIMAP_RADIUS_LEVELS.length - 1, Number(index)));
  const level = MINIMAP_RADIUS_LEVELS[state.zoomLevelIndex];
  state.app.dataset.zoomLevel = String(state.zoomLevelIndex + 1);
  state.app.dataset.zoomValue = String(currentZoom());
  state.app.dataset.minimapRadius = String(level.radiusMeters);
  state.app.dataset.minimapZoom = String(currentZoom());
  const readout = document.getElementById('zoom-readout');
  if (readout) readout.textContent = level.label;
  const zoom = currentZoom();
  if (state.minimap) state.minimap.easeTo({ zoom, duration: 250 });
}

function zoomMiniMap(delta) {
  setZoomLevel(state.zoomLevelIndex + delta);
}

function createAnalysisMap(center) {
  if (state.analysisMap || !window.mapboxgl || !window.CAULDRON_STATIC_CONFIG?.mapboxToken) return;
  if (isMobilePerformanceMode() && !state.app.classList.contains('is-ready')) {
    window.setTimeout(() => createAnalysisMap(center), MOBILE_ANALYSIS_DELAY_MS);
    return;
  }
  mapboxgl.accessToken = window.CAULDRON_STATIC_CONFIG.mapboxToken;
  const container = document.createElement('div');
  container.id = 'analysis-map';
  container.setAttribute('aria-hidden', 'true');
  Object.assign(container.style, {
    position: 'fixed',
    left: '-512px',
    top: '-512px',
    width: '512px',
    height: '512px',
    opacity: '0',
    pointerEvents: 'none',
  });
  document.body.appendChild(container);
  state.analysisMap = new mapboxgl.Map({
    container,
    style: window.CAULDRON_STATIC_CONFIG.analysisMapboxStyle || 'mapbox://styles/mapbox/streets-v12',
    center,
    zoom: CAMERA_ZOOM,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    interactive: false,
  });
  state.analysisMap.on('load', beginAnalysisPreload);
  state.analysisMap.on('moveend', analyzeWorldFeatures);
  window.setTimeout(beginAnalysisPreload, 3500);
  window.setTimeout(analyzeWorldFeatures, 2200);
  window.setTimeout(analyzeWorldFeatures, 5200);
}

function beginAnalysisPreload() {
  if (state.analysisPreloadStarted) return;
  if (!state.analysisMap?.isStyleLoaded?.()) {
    setBootStatus('Waiting for world analysis map...');
    window.setTimeout(beginAnalysisPreload, 700);
    return;
  }
  state.analysisPreloadStarted = true;
  runWhenIdle(() => {
    analyzeWorldFeatures();
    state.playerLngLat = [...snapToNearestRoad(state.playerLngLat)];
    syncPlayerMapPosition();
    addPlayerMarker(state.playerLngLat);
    if (!state.minimap && !isMobilePerformanceMode()) createMiniMap(state.playerLngLat);
    else if (state.minimap) addMiniMapMarker(state.playerLngLat);
    if (isMobilePerformanceMode()) {
      state.mapFileReady = true;
      state.app.dataset.mapFileReady = 'lite';
      finishLoadingWhenReady();
    } else {
      preloadObstacleRadius(state.playerLngLat);
    }
  }, 2500);
}

function featureCenter(feature) {
  const geometry = feature.geometry;
  if (!geometry) return null;
  if (geometry.type === 'Point') return geometry.coordinates;
  const coords = geometry.type === 'Polygon' ? geometry.coordinates.flat(1) : geometry.coordinates.flat(2);
  if (!coords.length) return null;
  const sum = coords.reduce((acc, coord) => [acc[0] + coord[0], acc[1] + coord[1]], [0, 0]);
  return [sum[0] / coords.length, sum[1] / coords.length];
}

function featureCoordinates(feature) {
  const geometry = feature.geometry;
  if (!geometry) return [];
  if (geometry.type === 'Point') return [geometry.coordinates];
  if (geometry.type === 'LineString') return geometry.coordinates;
  if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon') return geometry.coordinates.flat(1);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.flat(2);
  return [];
}

function featureRadiusMeters(feature, center, fallback = 4) {
  const coords = featureCoordinates(feature);
  if (!center || !coords.length) return fallback;
  const radius = coords.reduce((max, coord) => Math.max(max, distanceMeters(center, coord)), 0);
  return Math.max(fallback, Math.min(radius, 240));
}

function isBuildingFeature(feature) {
  const layerId = String(feature.layer?.id || '').toLowerCase();
  const sourceLayer = String(feature.layer?.['source-layer'] || '').toLowerCase();
  return layerId.includes('building') || sourceLayer.includes('building');
}

function isTreeFeature(feature) {
  const layerId = String(feature.layer?.id || '').toLowerCase();
  const sourceLayer = String(feature.layer?.['source-layer'] || '').toLowerCase();
  const props = feature.properties || {};
  const text = `${props.class || ''} ${props.type || ''} ${props.maki || ''} ${props.name || ''} ${props.kind || ''}`.toLowerCase();
  return layerId.includes('tree') || sourceLayer.includes('tree') || /\btree\b|wood|forest|natural|scrub/.test(text);
}

function isWaterFeature(feature) {
  const layerId = String(feature.layer?.id || '').toLowerCase();
  const sourceLayer = String(feature.layer?.['source-layer'] || '').toLowerCase();
  const props = feature.properties || {};
  const text = `${props.class || ''} ${props.type || ''} ${props.maki || ''} ${props.name || ''} ${props.kind || ''}`.toLowerCase();
  return layerId.includes('water')
    || sourceLayer.includes('water')
    || /water|river|stream|canal|lake|pond|reservoir|ocean|sea|bay/.test(text);
}

function toObstacleHitbox(feature, index, type) {
  const center = featureCenter(feature);
  if (!center) return null;
  const fallback = type === 'tree' ? 3.5 : type === 'water' ? 18 : 7;
  const geometry = feature.geometry || null;
  return {
    id: feature.id || `${type}:${index}`,
    type,
    center,
    radius: featureRadiusMeters(feature, center, fallback),
    geometry,
    properties: feature.properties || {},
    collisionSamples: type === 'building' ? buildingCollisionSamples(geometry, center, feature.properties || {}) : [],
    source: 'mapbox-obstacle',
  };
}

function segmentPointAtMeters(a, b, metersFromA) {
  const length = distanceMeters(a, b) || 1;
  const t = Math.max(0, Math.min(1, metersFromA / length));
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];
}

function buildingCollisionSamples(geometry, center, properties = {}) {
  if (!geometry || geometry.type !== 'Polygon') return [];
  const outerRing = geometry.coordinates?.[0] || [];
  if (outerRing.length < 4) return [];
  const levelHint = Number(properties.levels || properties.height || properties.render_height || 1) || 1;
  const spacingMeters = levelHint > 8 ? 4.5 : 6;
  const samples = [];
  outerRing.forEach((coord, index) => {
    const next = outerRing[index + 1];
    if (!next) return;
    const segmentLength = distanceMeters(coord, next);
    if (segmentLength < 2) return;
    const count = Math.max(1, Math.floor(segmentLength / spacingMeters));
    for (let sampleIndex = 1; sampleIndex <= count; sampleIndex += 1) {
      const point = segmentPointAtMeters(coord, next, (segmentLength * sampleIndex) / (count + 1));
      const kind = sampleIndex === Math.ceil(count / 2) && segmentLength >= 5 ? 'door' : 'window';
      samples.push({
        kind,
        lngLat: point,
        distanceFromCenter: distanceMeters(center, point),
      });
    }
  });
  return samples.slice(0, 80);
}

function featurePartGeometry(feature) {
  const geometry = feature.geometry;
  if (!geometry) return [];
  if (geometry.type === 'Polygon') return [geometry];
  if (geometry.type === 'MultiPolygon') {
    return geometry.coordinates.map((coordinates) => ({
      type: 'Polygon',
      coordinates,
    }));
  }
  if (geometry.type === 'GeometryCollection') {
    return geometry.geometries
      .flatMap((part) => featurePartGeometry({ ...feature, geometry: part }));
  }
  return [geometry];
}

function toObstacleHitboxes(feature, index, type) {
  const parts = type === 'building' || type === 'water' ? featurePartGeometry(feature) : [feature.geometry || null];
  return parts
    .map((geometry, partIndex) => toObstacleHitbox({ ...feature, geometry }, `${index}:${partIndex}`, type))
    .filter(Boolean);
}

function syntheticBuildingObstacle(name, lngLat, index, type = 'building') {
  const geometry = rectanglePolygon(lngLat, type === 'home' ? 10 : 8, type === 'home' ? 8 : 6);
  return toObstacleHitbox({
    id: `synthetic:${type}:${index}:${name}`,
    geometry,
    properties: {
      name,
      type,
      source: 'synthetic-footprint',
      levels: type === 'home' ? 2 : 1,
    },
  }, `synthetic:${index}`, 'building');
}

function obstacleCacheKey(obstacle) {
  const floorHint = [
    obstacle.properties?.height,
    obstacle.properties?.min_height,
    obstacle.properties?.render_height,
    obstacle.properties?.render_min_height,
    obstacle.properties?.levels,
    obstacle.properties?.level,
  ].filter((value) => value !== undefined && value !== null).join(':');
  const geometryHint = obstacle.geometry
    ? JSON.stringify(obstacle.geometry.coordinates)
      .replace(/-?\d+\.\d+/g, (value) => Number(value).toFixed(6))
      .slice(0, 220)
    : '';
  return `${obstacle.type}:${obstacle.center[0].toFixed(6)}:${obstacle.center[1].toFixed(6)}:${floorHint}:${geometryHint}`;
}

function isRoadFeature(feature) {
  const layerId = String(feature.layer?.id || '').toLowerCase();
  const sourceLayer = String(feature.layer?.['source-layer'] || '').toLowerCase();
  const props = feature.properties || {};
  const typeText = `${props.class || ''} ${props.type || ''} ${props.structure || ''} ${props.maki || ''}`.toLowerCase();
  return layerId.includes('road') || layerId.includes('street') || sourceLayer.includes('road') || /road|street|motorway|primary|secondary|tertiary|residential|service/.test(typeText);
}

function nearestCoordinateOnFeature(feature, center) {
  const geometry = feature.geometry;
  if (!geometry) return null;
  if (geometry.type === 'Point') return geometry.coordinates;
  const coordinates = geometry.type === 'LineString'
    ? geometry.coordinates
    : geometry.type === 'MultiLineString'
      ? geometry.coordinates.flat(1)
      : geometry.type === 'Polygon'
        ? geometry.coordinates.flat(1)
        : [];
  if (!coordinates.length) return null;
  return coordinates
    .map((coord) => ({ coord, distance: distanceMeters(center, coord) }))
      .sort((a, b) => a.distance - b.distance)[0]?.coord || null;
}

function queryRoadFeatures(map, point) {
  const rendered = map
    .queryRenderedFeatures([
      [point.x - 280, point.y - 280],
      [point.x + 280, point.y + 280],
    ])
    .filter(isRoadFeature);
  const source = ['road', 'transportation']
    .flatMap((sourceLayer) => {
      try {
        return map.querySourceFeatures('composite', { sourceLayer });
      } catch {
        return [];
      }
    })
    .filter(isRoadFeature);
  return [...rendered, ...source];
}

function distanceToNearestRoad(center) {
  const map = state.analysisMap?.isStyleLoaded?.() ? state.analysisMap : state.map;
  if (!map?.isStyleLoaded?.()) return Infinity;
  try {
    const point = map.project(center);
    return queryRoadFeatures(map, point)
      .map((feature) => nearestCoordinateOnFeature(feature, center))
      .filter(Boolean)
      .map((coord) => distanceMeters(center, coord))
      .sort((a, b) => a - b)[0] ?? Infinity;
  } catch {
    return Infinity;
  }
}

function snapToNearestRoad(center) {
  const map = state.analysisMap?.isStyleLoaded?.() ? state.analysisMap : state.map;
  if (!map?.isStyleLoaded?.()) {
    state.app.dataset.spawnSnap = 'road-pending';
    state.app.dataset.spawnSnapDistance = '';
    return center;
  }
  try {
    const mapCenter = map.getCenter?.();
    if (map === state.analysisMap && mapCenter && distanceMeters(center, [mapCenter.lng, mapCenter.lat]) > 1200) {
      return center;
    }
    const point = map.project(center);
    const features = queryRoadFeatures(map, point);
    const nearest = features
      .map((feature) => nearestCoordinateOnFeature(feature, center))
      .filter(Boolean)
      .map((coord) => ({ coord, distance: distanceMeters(center, coord) }))
      .sort((a, b) => a.distance - b.distance)[0];
    if (nearest?.coord && nearest.distance < 1000) {
      state.app.dataset.spawnSnap = 'road-snapped';
      state.app.dataset.spawnSnapDistance = nearest.distance.toFixed(1);
      return nearest.coord;
    }
  } catch {
    state.app.dataset.spawnSnap = 'road-fallback';
    state.app.dataset.spawnSnapDistance = '';
    return center;
  }
  state.app.dataset.spawnSnap = 'road-fallback';
  state.app.dataset.spawnSnapDistance = '';
  return center;
}

function analyzeWorldFeatures() {
  const map = state.analysisMap || state.map;
  if (!map?.isStyleLoaded?.()) return;
  try {
    mergeObstacleCache(collectObstacleFeatures(map));
    createTalkablePois();
  } catch {
    state.buildingHitboxes = [];
    state.treeHitboxes = [];
    state.obstacleFeatures = [];
  }
}

function mergeObstacleCache(nextObstacles) {
  const merged = new Map();
  [...state.obstacleFeatures, ...nextObstacles].forEach((obstacle) => {
    const key = obstacleCacheKey(obstacle);
    if (!merged.has(key)) merged.set(key, obstacle);
  });
  state.obstacleFeatures = [...merged.values()].filter((obstacle) => (
    shouldKeepObstacleDataAt(obstacle.center)
  ));
  state.buildingHitboxes = state.obstacleFeatures.filter((obstacle) => obstacle.type === 'building');
  state.treeHitboxes = state.obstacleFeatures.filter((obstacle) => obstacle.type === 'tree');
  state.app.dataset.waterHitboxes = String(state.obstacleFeatures.filter((obstacle) => obstacle.type === 'water').length);
  rebuildCollisionMap();
  updateObstacleOverlay();
  renderKenneyBuildings();
}

function collectObstacleFeatures(map) {
  if (!map?.isStyleLoaded?.()) return [];
  const mobileLite = isMobilePerformanceMode();
  const bounds = mobileLite ? [
    [Math.round(window.innerWidth * 0.24), Math.round(window.innerHeight * 0.22)],
    [Math.round(window.innerWidth * 0.76), Math.round(window.innerHeight * 0.78)],
  ] : undefined;
  let allFeatures = bounds ? map.queryRenderedFeatures(bounds) : map.queryRenderedFeatures();
  const sourceLayers = mobileLite
    ? ['building', 'poi_label', 'water', 'waterway']
    : ['building', 'tree', 'landuse', 'landcover', 'poi_label', 'water', 'waterway'];
  sourceLayers.forEach((sourceLayer) => {
    try {
      const sourceFeatures = map.querySourceFeatures('composite', { sourceLayer });
      allFeatures = [
        ...allFeatures,
        ...sourceFeatures.map((feature) => ({
          ...feature,
          layer: feature.layer || { id: `${sourceLayer}-source`, 'source-layer': sourceLayer },
        })),
      ];
    } catch {
      // Mapbox source layers are available only for currently loaded tiles.
    }
  });
  const buildings = allFeatures
    .filter(isBuildingFeature)
    .flatMap((feature, index) => toObstacleHitboxes(feature, index, 'building'))
    .filter(Boolean);
  const trees = allFeatures
    .filter(isTreeFeature)
    .flatMap((feature, index) => toObstacleHitboxes(feature, index, 'tree'))
    .filter(Boolean);
  const waters = allFeatures
    .filter(isWaterFeature)
    .flatMap((feature, index) => toObstacleHitboxes(feature, index, 'water'))
    .filter(Boolean);
  return [...buildings, ...trees, ...waters];
}

function rebuildCollisionMap() {
  const origin = state.preloadOrigin || state.playerLngLat;
  if (!origin) return;
  const cells = new Map();
  let collisionSampleCount = 0;
  state.obstacleFeatures.forEach((obstacle) => {
    const radius = Math.max(COLLISION_PADDING_METERS, obstacle.radius + COLLISION_PADDING_METERS);
    const bounds = [
      offsetLngLat(obstacle.center, -radius, -radius),
      offsetLngLat(obstacle.center, radius, radius),
    ];
    const minX = Math.floor(((bounds[0][0] - origin[0]) * 111320 * Math.cos((origin[1] * Math.PI) / 180)) / COLLISION_MAP_CELL_METERS);
    const maxX = Math.ceil(((bounds[1][0] - origin[0]) * 111320 * Math.cos((origin[1] * Math.PI) / 180)) / COLLISION_MAP_CELL_METERS);
    const minY = Math.floor(((bounds[0][1] - origin[1]) * 110540) / COLLISION_MAP_CELL_METERS);
    const maxY = Math.ceil(((bounds[1][1] - origin[1]) * 110540) / COLLISION_MAP_CELL_METERS);
    for (let x = minX; x <= maxX; x += 1) {
      for (let y = minY; y <= maxY; y += 1) {
        const sample = offsetLngLat(origin, x * COLLISION_MAP_CELL_METERS, y * COLLISION_MAP_CELL_METERS);
        if (rawCollisionAt(sample, [obstacle])) cells.set(`${x},${y}`, obstacle.type);
      }
    }
    collisionSampleCount += obstacle.collisionSamples?.length || 0;
  });
  state.collisionMap = {
    origin,
    cellMeters: COLLISION_MAP_CELL_METERS,
    cells,
    builtAt: Date.now(),
  };
  state.navigationFile = {
    version: 1,
    kind: 'cauldron-navigation-map',
    owner: state.profile?.characterId || 'guest',
    spawnRegion: state.profile?.spawnRegion || 'vancouver',
    origin,
    radiusMeters: OBSTACLE_PRELOAD_RADIUS_METERS,
    cellMeters: COLLISION_MAP_CELL_METERS,
    obstacleCount: state.obstacleFeatures.length,
    collisionSampleCount,
    cells: cells.size,
    updatedAt: new Date().toISOString(),
  };
  localStorage.setItem('cauldron_navigation_file_v1', JSON.stringify(state.navigationFile));
  state.app.dataset.collisionMap = 'ready';
  state.app.dataset.collisionCells = String(cells.size);
  state.app.dataset.collisionSamples = String(collisionSampleCount);
}

function downloadNavigationFile() {
  const file = state.navigationFile || JSON.parse(localStorage.getItem('cauldron_navigation_file_v1') || 'null');
  if (!file) {
    openDialogue('Navigation map not ready', 'System');
    document.getElementById('dialogue-body').textContent = 'Create an account and wait for the local collision map file to finish building.';
    return;
  }
  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `cauldron-navmap-${file.spawnRegion || 'map'}-${file.owner || 'player'}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function collisionMapHit(lngLat) {
  if (!state.collisionMap) return null;
  const { origin, cellMeters, cells } = state.collisionMap;
  const x = Math.round(((lngLat[0] - origin[0]) * 111320 * Math.cos((origin[1] * Math.PI) / 180)) / cellMeters);
  const y = Math.round(((lngLat[1] - origin[1]) * 110540) / cellMeters);
  const type = cells.get(`${x},${y}`);
  return type ? { id: `cell:${x},${y}`, type, distance: 0 } : null;
}

function obstacleGeoJson() {
  const sampleFeatures = state.obstacleFeatures
    .filter((obstacle) => obstacle.type === 'building' && obstacle.collisionSamples?.length && shouldLoadVisualAt(obstacle.center))
    .flatMap((obstacle) => obstacle.collisionSamples.slice(0, 20).map((sample, index) => ({
      type: 'Feature',
      properties: { id: `${obstacle.id}:sample:${index}`, type: sample.kind, parent: String(obstacle.id) },
      geometry: { type: 'Point', coordinates: sample.lngLat },
    })));
  return {
    type: 'FeatureCollection',
    features: [
      ...state.obstacleFeatures
      .filter((obstacle) => obstacle.type === 'building' && obstacle.geometry && shouldLoadVisualAt(obstacle.center))
      .slice(0, 800)
      .map((obstacle) => ({
        type: 'Feature',
        properties: { id: String(obstacle.id), type: obstacle.type },
        geometry: obstacle.geometry,
      })),
      ...sampleFeatures.slice(0, 1200),
    ],
  };
}

function nearbyBuildingGeoJson(radiusMeters = 55) {
  return {
    type: 'FeatureCollection',
    features: state.buildingHitboxes
      .filter((obstacle) => obstacle.geometry && distanceMeters(state.playerLngLat, obstacle.center) <= radiusMeters && shouldLoadVisualAt(obstacle.center))
      .slice(0, 80)
      .map((obstacle) => ({
        type: 'Feature',
        properties: { id: String(obstacle.id), type: obstacle.type },
        geometry: obstacle.geometry,
      })),
  };
}

function updateObstacleOverlay() {
  if (!state.map?.isStyleLoaded?.()) return;
  const data = obstacleGeoJson();
  try {
    if (state.map.getSource('cauldron-obstacle-walls')) {
      state.map.getSource('cauldron-obstacle-walls').setData(data);
      state.app.dataset.wallOverlay = 'ready';
      state.app.dataset.wallOverlayFeatures = String(data.features.length);
      return;
    }
    state.map.addSource('cauldron-obstacle-walls', { type: 'geojson', data });
    state.map.addLayer({
      id: 'cauldron-obstacle-walls-fill',
      type: 'fill',
      source: 'cauldron-obstacle-walls',
      paint: {
        'fill-color': '#d9b678',
        'fill-opacity': 0.1,
      },
    });
    if (!state.map.getSource('cauldron-nearby-walls')) {
      const nearbyData = nearbyBuildingGeoJson(90);
      state.map.addSource('cauldron-nearby-walls', { type: 'geojson', data: nearbyData });
      state.map.addLayer({
        id: 'cauldron-nearby-walls-fade',
        type: 'fill',
        source: 'cauldron-nearby-walls',
        paint: {
          'fill-color': '#f8df9d',
          'fill-opacity': 0.03,
        },
      });
      state.app.dataset.nearbyFadedBuildings = String(nearbyData.features.length);
    }
    state.app.dataset.wallOverlay = 'ready';
    state.app.dataset.wallOverlayFeatures = String(data.features.length);
  } catch {
    state.app.dataset.wallOverlay = 'unavailable';
    // Overlay is visual only; collision map remains authoritative.
  }
}

function updateNearbyBuildingFade() {
  if (!state.map?.getSource?.('cauldron-nearby-walls')) return;
  const data = nearbyBuildingGeoJson(state.isFlying ? 140 : 90);
  state.map.getSource('cauldron-nearby-walls').setData(data);
  state.app.dataset.nearbyFadedBuildings = String(data.features.length);
}

function directionVector(direction = state.sprite.direction) {
  return {
    up: { east: 0, north: 1 },
    down: { east: 0, north: -1 },
    left: { east: -1, north: 0 },
    right: { east: 1, north: 0 },
    'up-right': { east: 1, north: 1 },
    'down-right': { east: 1, north: -1 },
    'up-left': { east: -1, north: 1 },
    'down-left': { east: -1, north: -1 },
  }[direction] || { east: 0, north: 1 };
}

function vectorToDirection(east, north) {
  if (east > 0 && north > 0) return 'up-right';
  if (east > 0 && north < 0) return 'down-right';
  if (east < 0 && north > 0) return 'up-left';
  if (east < 0 && north < 0) return 'down-left';
  if (east > 0) return 'right';
  if (east < 0) return 'left';
  if (north) return north > 0 ? 'up' : 'down';
  return state.sprite.direction || 'up';
}

function shouldLoadVisualAt(lngLat) {
  const metersPerLng = 111320 * Math.cos((state.playerLngLat[1] * Math.PI) / 180);
  const dx = (lngLat[0] - state.playerLngLat[0]) * metersPerLng;
  const dy = (lngLat[1] - state.playerLngLat[1]) * 110540;
  const distance = Math.hypot(dx, dy);
  if (!state.isFlying) return distance <= NORMAL_VISIBLE_LOAD_RADIUS_METERS;
  if (distance <= 80) return true;
  const vector = directionVector(state.dataModeDirection || state.sprite.direction);
  const forward = dx * vector.east + dy * vector.north;
  const side = Math.abs(dx * vector.north - dy * vector.east);
  return forward >= -30 && forward <= DATA_MODE_FORWARD_LOAD_METERS && side <= DATA_MODE_SIDE_LOAD_METERS;
}

function currentMovementLookaheadMeters() {
  const speed = PLAYER_WALK_METERS_PER_SECOND * (state.isFlying ? DATA_MODE_SPEED_MULTIPLIER : (MOUNT_SPEEDS[state.activeMount] || 1));
  return Math.max(220, Math.min(state.isFlying ? DATA_MODE_FORWARD_LOAD_METERS : NORMAL_VISIBLE_LOAD_RADIUS_METERS, speed * 32 + 160));
}

function shouldKeepObstacleDataAt(lngLat) {
  if (state.isFlying) return shouldLoadVisualAt(lngLat);
  return distanceMeters(state.playerLngLat, lngLat) <= currentMovementLookaheadMeters();
}

function shouldRefreshVisualLoads() {
  const now = performance.now();
  const center = state.lastVisualLoadCenter;
  const moved = !center || distanceMeters(center, state.playerLngLat) > (state.isFlying ? 48 : 18);
  const delay = state.isFlying ? 520 : 180;
  return moved && now - state.lastVisualLoadAt > delay;
}

function refreshVisibleWorldLayers(force = false) {
  if (!force && !shouldRefreshVisualLoads()) return;
  state.lastVisualLoadAt = performance.now();
  state.lastVisualLoadCenter = [...state.playerLngLat];
  updateNearbyBuildingFade();
  renderCauldronPortals();
  renderKenneyBuildings();
  state.app.dataset.visualLoadMode = state.isFlying ? 'data-forward' : 'visible-radius';
  state.app.dataset.dataLoadRadius = String(Math.round(currentMovementLookaheadMeters()));
}

function preloadObstacleRadius(center) {
  if (!state.analysisMap?.isStyleLoaded?.()) {
    setBootStatus('Waiting for world analysis map...');
    window.setTimeout(() => preloadObstacleRadius(center), 700);
    return;
  }
  state.mapFileReady = false;
  state.app.dataset.mapFileReady = 'false';
  state.preloadOrigin = [...center];
  state.preloadSamples = [center];
  state.preloadSampleIndex = 0;
  stepObstaclePreload();
}

function stepObstaclePreload() {
  if (!state.analysisMap?.isStyleLoaded?.() || state.preloadSampleIndex >= state.preloadSamples.length) {
    state.app.dataset.obstaclePreload = 'ready';
    state.mapFileReady = true;
    state.app.dataset.mapFileReady = 'true';
    createVillageAroundHome();
    setBootStatus('Navigation map file ready. Enter Cauldron.');
    finishLoadingWhenReady();
    return;
  }
  const sample = state.preloadSamples[state.preloadSampleIndex];
  state.app.dataset.obstaclePreload = `${state.preloadSampleIndex + 1}/${state.preloadSamples.length}`;
  setBootStatus(`Loading world data ${state.preloadSampleIndex + 1}/${state.preloadSamples.length}...`);
  let advanced = false;
  const advancePreload = () => {
    if (advanced) return;
    advanced = true;
    mergeObstacleCache(collectObstacleFeatures(state.analysisMap));
    state.preloadSampleIndex += 1;
    window.setTimeout(stepObstaclePreload, 120);
  };
  state.analysisMap.once('idle', () => {
    advancePreload();
  });
  window.setTimeout(advancePreload, 450);
  state.analysisMap.jumpTo({ center: sample, zoom: 16.8, pitch: 0, bearing: 0 });
}

function createMap(center) {
  if (cauldronRuntimeEnabledForCurrentRegion()) {
    state.map = null;
    state.mapLoaded = true;
    state.app.dataset.playMapProjection = 'cauldron-canvas';
    setBootStatus('Cauldron play world ready. Loading minimap...');
    renderCauldronRuntimeFrame();
    window.setTimeout(() => createMiniMap(state.playerLngLat), isMobilePerformanceMode() ? MOBILE_MINIMAP_DELAY_MS : 120);
    window.setTimeout(() => createAnalysisMap(state.playerLngLat), isMobilePerformanceMode() ? MOBILE_ANALYSIS_DELAY_MS : 700);
    if (!state.nearbyPois.length) addFallbackTalkPoints();
    finishLoadingWhenReady();
    return;
  }
  if (!window.mapboxgl || !window.CAULDRON_STATIC_CONFIG?.mapboxToken) {
    setBootStatus('Mapbox public token is missing. Character registry is ready; map cannot load.');
    return;
  }

  mapboxgl.accessToken = window.CAULDRON_STATIC_CONFIG.mapboxToken;
  state.map = new mapboxgl.Map({
    container: 'map',
    style: window.CAULDRON_STATIC_CONFIG.mapboxStyle || 'mapbox://styles/quadclipse/cmos12qyt008901rgg1eka1xm',
    center,
    zoom: CAMERA_ZOOM,
    minZoom: 15,
    maxZoom: 21,
    pitch: CAMERA_PITCH,
    bearing: CAMERA_BEARING,
    projection: 'globe',
    attributionControl: false,
    dragPan: false,
    dragRotate: false,
    scrollZoom: false,
    doubleClickZoom: false,
    touchZoomRotate: false,
    keyboard: false,
  });

  state.map.on('style.load', () => {
    try {
      state.map.setProjection('globe');
      state.map.setFog({
        color: 'rgb(8, 12, 18)',
        'high-color': 'rgb(42, 68, 96)',
        'space-color': 'rgb(2, 4, 10)',
        'horizon-blend': 0.08,
      });
    } catch {
      // Keep the playable map stable if a style lacks globe support.
    }
    lowerBuildingOpacityForVisibility();
  });

  let mapReady = false;
  function finishMapLoad() {
    if (mapReady) return;
    mapReady = true;
    state.mapLoaded = true;
    setBootStatus('Map loaded. Waiting for UseDesign gate animation to finish...');
    setFadeBounds(center);
    addMapboxBuildingDepth();
    lowerBuildingOpacityForVisibility();
    addPlayerMarker(state.playerLngLat);
    if (state.cauldronRuntime.ready) {
      state.mapFileReady = true;
      state.app.dataset.mapFileReady = 'runtime-json';
      if (!state.nearbyPois.length) addFallbackTalkPoints();
      window.setTimeout(() => createMiniMap(center), isMobilePerformanceMode() ? MOBILE_MINIMAP_DELAY_MS : 250);
    } else if (isMobilePerformanceMode()) {
      state.mapFileReady = true;
      state.app.dataset.mapFileReady = 'lite';
      if (!state.nearbyPois.length) addFallbackTalkPoints();
      window.setTimeout(() => createMiniMap(center), MOBILE_MINIMAP_DELAY_MS);
      window.setTimeout(() => createAnalysisMap(center), MOBILE_ANALYSIS_DELAY_MS);
    } else {
      createAnalysisMap(center);
      createTalkablePois();
    }
    finishLoadingWhenReady();
  }

  state.map.on('load', () => {
    finishMapLoad();
  });
  state.map.on('error', finishMapLoad);
  window.setTimeout(finishMapLoad, 3500);

  state.map.on('moveend', () => {
    if (isMobilePerformanceMode() && !state.analysisMap) return;
    createTalkablePois();
  });
}

function createMiniMap(center) {
  if (state.minimap || !window.mapboxgl || !window.CAULDRON_STATIC_CONFIG?.mapboxToken) return;
  mapboxgl.accessToken = window.CAULDRON_STATIC_CONFIG.mapboxToken;
  state.minimap = new mapboxgl.Map({
    container: 'minimap',
    style: window.CAULDRON_STATIC_CONFIG.analysisMapboxStyle || 'mapbox://styles/mapbox/streets-v12',
    center,
    zoom: currentZoom(),
    minZoom: 10,
    maxZoom: 19,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
    interactive: false,
  });
  state.minimap.on('load', () => addMiniMapMarker(center));
}

function addPlayerMarker(center) {
  if (!state.map) return;
  if (!state.playerMarker) {
    state.playerMarker = new mapboxgl.Marker({
      element: createMarkerElement('player-marker', 'Player position'),
      anchor: 'center',
    });
  }
  state.playerMarker.setLngLat(center).addTo(state.map);
}

function addMiniMapMarker(center) {
  if (!state.minimap) return;
  if (!state.minimap.isStyleLoaded?.()) {
    state.minimap.once?.('load', () => addMiniMapMarker(center));
    return;
  }
  if (!state.minimapMarker) {
    state.minimapMarker = new mapboxgl.Marker({
      element: createMarkerElement('player-minimap-marker', 'Player position on minimap'),
      anchor: 'center',
    });
  }
  state.minimapMarker.setLngLat(center).addTo(state.minimap);
}

function movePlayerTo(center, label) {
  state.playerLngLat = [...center];
  state.mapFileReady = false;
  state.analysisPreloadStarted = false;
  state.app.dataset.mapFileReady = 'false';
  setBootStatus(`Loading ${label} within a ${MAP_RADIUS_KM}km play radius...`);
  state.mapLoaded = false;
  state.app.classList.add('is-booting');
  state.app.classList.remove('is-ready');
  if (state.map) state.map.jumpTo({ center: state.playerLngLat, zoom: CAMERA_ZOOM, pitch: CAMERA_PITCH, bearing: CAMERA_BEARING });
  if (state.analysisMap) state.analysisMap.jumpTo({ center: state.playerLngLat, zoom: CAMERA_ZOOM, pitch: 0, bearing: 0 });
  window.setTimeout(() => {
    if (cauldronRuntimeEnabledForCurrentRegion() && state.cauldronRuntime.ready) snapPlayerToCauldronRoad();
    else state.playerLngLat = [...snapToNearestRoad(state.playerLngLat)];
    syncPlayerMapPosition();
    preloadObstacleRadius(state.playerLngLat);
  }, 1400);
  setFadeBounds(center);
  addPlayerMarker(state.playerLngLat);
  updateNearbyBuildingFade();
  if (state.minimap) {
    state.minimap.jumpTo({ center: state.playerLngLat, zoom: currentZoom() });
    addMiniMapMarker(state.playerLngLat);
  }
  clearPoiMarkers();
  window.setTimeout(() => {
    state.mapLoaded = true;
    createTalkablePois();
    finishLoadingWhenReady();
  }, 950);
}

function clearPoiMarkers() {
  state.poiMarkers.forEach((marker) => marker.remove());
  state.poiMarkers = [];
  state.nearbyPois = [];
  state.portalPois = [];
  if (state.portalLayer) state.portalLayer.innerHTML = '';
}

function rebuildCauldronPortals() {
  const merged = new Map();
  [...state.nearbyPois, ...state.villagePois].forEach((poi) => {
    if (!poi?.lngLat) return;
    const key = `${poi.name}:${poi.lngLat[0].toFixed(5)}:${poi.lngLat[1].toFixed(5)}`;
    if (!merged.has(key)) merged.set(key, {
      ...poi,
      portalId: key,
      logo: poi.properties?.brand || poi.properties?.maki || poi.type || 'LOGO',
    });
  });
  state.portalPois = [...merged.values()];
  renderCauldronPortals();
}

function renderCauldronPortals() {
  if (!state.portalLayer || !state.map?.project) return;
  state.portalLayer.innerHTML = '';
  state.app.dataset.portals = 'hidden';
}

function buildingVisualSize(obstacle) {
  const radius = Math.max(6, Math.min(26, obstacle.radius || 8));
  const levelHint = Number(obstacle.properties?.levels || obstacle.properties?.height || obstacle.properties?.render_height || 1) || 1;
  return {
    width: Math.max(72, Math.min(146, radius * 7.2)),
    height: Math.max(78, Math.min(188, 72 + levelHint * 10 + radius * 2.6)),
  };
}

function kenneyProjectionForLngLat(lngLat) {
  if (!state.cauldronRuntime.ready || !state.cauldronRuntime.coordinateEngine || !state.cauldronRuntime.canvas || !lngLat) return null;
  const local = state.cauldronRuntime.coordinateEngine.lngLatToLocal(lngLat);
  return state.cauldronRuntime.canvas.projectPoint(local);
}

function kenneyProjectionForLocal(localPoint) {
  if (!state.cauldronRuntime.ready || !state.cauldronRuntime.canvas || !localPoint) return null;
  return state.cauldronRuntime.canvas.projectPoint(localPoint);
}

function kenneyBuildingModelForFeature(building, index) {
  const levels = Number(building.properties?.levels || building.properties?.['building:levels'] || 1) || 1;
  if (/garage/i.test(String(building.properties?.class || building.properties?.type || ''))) {
    return `${KENNEY_CITY_ASSET_BASE}building-garage.glb`;
  }
  return `${KENNEY_CITY_ASSET_BASE}${KENNEY_CITY_BUILDING_MODELS[Math.min(KENNEY_CITY_BUILDING_MODELS.length - 1, Math.max(index % 4, levels - 1))]}`;
}

function rebuildKenneyPlacementsFromTerrain() {
  const terrain = state.cauldronRuntime.scene?.terrain3d;
  const coordinateEngine = state.cauldronRuntime.coordinateEngine;
  if (!terrain?.tileMatrix || !coordinateEngine) {
    state.reconstructedBuildings = [];
    return;
  }
  const buildableTileIds = new Set([4, 6, 7, 8]);
  const tileMatrix = terrain.tileMatrix;
  const rows = tileMatrix.length;
  const cols = tileMatrix[0]?.length || 0;
  const cellMeters = Number(terrain.cellMeters || 1);
  const diameter = cellMeters * cols;
  const half = diameter / 2;
  const visited = Array.from({ length: rows }, () => Array(cols).fill(false));
  const placements = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const tileId = tileMatrix[y]?.[x];
      if (visited[y][x] || !buildableTileIds.has(tileId)) continue;
      const cells = [];
      const queue = [[x, y]];
      visited[y][x] = true;
      while (queue.length) {
        const [currentX, currentY] = queue.shift();
        cells.push([currentX, currentY]);
        [
          [currentX + 1, currentY],
          [currentX - 1, currentY],
          [currentX, currentY + 1],
          [currentX, currentY - 1],
        ].forEach(([nextX, nextY]) => {
          if (nextX < 0 || nextY < 0 || nextX >= cols || nextY >= rows) return;
          if (visited[nextY][nextX]) return;
          if (!buildableTileIds.has(tileMatrix[nextY]?.[nextX])) return;
          visited[nextY][nextX] = true;
          queue.push([nextX, nextY]);
        });
      }
      if (cells.length < 6) continue;
      const xs = cells.map(([cellX]) => cellX);
      const ys = cells.map(([, cellY]) => cellY);
      const minCellX = Math.min(...xs);
      const maxCellX = Math.max(...xs);
      const minCellY = Math.min(...ys);
      const maxCellY = Math.max(...ys);
      const widthCells = maxCellX - minCellX + 1;
      const heightCells = maxCellY - minCellY + 1;
      if (widthCells < 2 || heightCells < 2) continue;
      const footprintArea = widthCells * heightCells;
      if (cells.length < Math.max(6, Math.round(footprintArea * 0.35))) continue;
      const centerCellX = (minCellX + maxCellX + 1) / 2;
      const centerCellY = (minCellY + maxCellY + 1) / 2;
      const centerLocal = {
        xMeters: -half + centerCellX * cellMeters,
        yMeters: half - centerCellY * cellMeters,
      };
      const centerLngLat = coordinateEngine.localToLngLat(centerLocal);
      const widthMeters = widthCells * cellMeters;
      const heightMeters = heightCells * cellMeters;
      const sizeClass = Math.max(1, Math.min(4, Math.round(Math.max(widthCells, heightCells) / 5)));
      placements.push({
        id: `terrain-block:${x}:${y}`,
        center: centerLngLat,
        radius: Math.max(widthMeters, heightMeters) / 2,
        widthMeters,
        heightMeters,
        localCenter: centerLocal,
        properties: {
          levels: sizeClass,
          tileId,
          source: 'terrain-grid',
          class: tileId === 8 ? 'roof' : tileId === 7 ? 'medical' : tileId === 6 ? 'commercial' : 'building',
        },
      });
    }
  }

  state.reconstructedBuildings = placements
    .sort((left, right) => (right.widthMeters * right.heightMeters) - (left.widthMeters * left.heightMeters))
    .slice(0, 28);
  state.app.dataset.reconstructedBuildings = String(state.reconstructedBuildings.length);
}

function createKenneyModelViewer(src, cameraOrbit = '35deg 66deg 3.2m') {
  const viewer = document.createElement('model-viewer');
  viewer.setAttribute('src', src);
  viewer.setAttribute('camera-controls', '');
  viewer.setAttribute('disable-zoom', '');
  viewer.setAttribute('interaction-prompt', 'none');
  viewer.setAttribute('shadow-intensity', '0.8');
  viewer.setAttribute('environment-image', 'neutral');
  viewer.setAttribute('exposure', '1');
  viewer.setAttribute('camera-orbit', cameraOrbit);
  viewer.setAttribute('min-camera-orbit', 'auto auto 2.4m');
  viewer.setAttribute('max-camera-orbit', 'auto auto 5m');
  return viewer;
}

function renderKenneyBuildings() {
  if (!ENABLE_RECONSTRUCTED_BUILDINGS) {
    if (state.kenneyBuildingLayer) state.kenneyBuildingLayer.innerHTML = '';
    state.app.dataset.kenneyBuildings = '0';
    return;
  }
  if (!state.kenneyBuildingLayer) return;
  state.kenneyBuildingLayer.innerHTML = '';
  const placementSource = state.reconstructedBuildings.length
    ? state.reconstructedBuildings
    : state.buildingHitboxes;
  const viewportWidth = window.innerWidth || 1280;
  const viewportHeight = window.innerHeight || 720;
  const candidates = placementSource
    .map((building) => ({
      building,
      point: building.localCenter
        ? kenneyProjectionForLocal(building.localCenter)
        : kenneyProjectionForLngLat(building.center),
    }))
    .filter(({ point }) => point && point.x >= -240 && point.x <= viewportWidth + 240 && point.y >= -260 && point.y <= viewportHeight + 260)
    .slice(0, 20);
  if (!candidates.length && placementSource === state.reconstructedBuildings) {
    const fallbackCandidates = placementSource
      .map((building) => ({
        building,
        point: building.localCenter
          ? kenneyProjectionForLocal(building.localCenter)
          : kenneyProjectionForLngLat(building.center),
      }))
      .filter(({ point }) => point)
      .slice(0, 20);
    fallbackCandidates.forEach(({ building, point }, index) => {
      mountKenneyBuilding(building, point, index);
    });
    renderKenneyVehicle();
    state.app.dataset.kenneyBuildings = String(fallbackCandidates.length + treeCandidatesCount());
    return;
  }
  candidates.forEach(({ building, point }, index) => {
    if (!point) return;
    mountKenneyBuilding(building, point, index);
  });
  const treeCandidates = state.treeHitboxes
    .filter((tree) => distanceMeters(state.playerLngLat, tree.center) <= 280)
    .slice(0, 10);
  treeCandidates.forEach((tree, index) => {
    const point = kenneyProjectionForLngLat(tree.center);
    if (!point) return;
    const element = document.createElement('div');
    element.className = 'kenney-building kenney-tree';
    element.style.left = `${point.x}px`;
    element.style.top = `${point.y}px`;
    element.style.setProperty('--building-width', '74px');
    element.style.setProperty('--building-height', '86px');
    element.style.opacity = '0.92';
    element.dataset.asset = 'tree';
    element.appendChild(createKenneyModelViewer(`${KENNEY_CITY_ASSET_BASE}${KENNEY_CITY_TREE_MODELS[index % KENNEY_CITY_TREE_MODELS.length]}`, '25deg 70deg 3m'));
    state.kenneyBuildingLayer.appendChild(element);
  });
  renderKenneyVehicle();
  state.app.dataset.kenneyBuildings = String(candidates.length + treeCandidates.length);
}

function treeCandidatesCount() {
  return state.treeHitboxes
    .filter((tree) => distanceMeters(state.playerLngLat, tree.center) <= 280)
    .slice(0, 10)
    .length;
}

function mountKenneyBuilding(building, point, index) {
    const size = building.widthMeters && building.heightMeters
      ? {
        width: Math.max(84, Math.min(220, building.widthMeters * 1.15)),
        height: Math.max(94, Math.min(240, building.heightMeters * 1.45)),
      }
      : buildingVisualSize(building);
    const element = document.createElement('div');
    element.className = 'kenney-building';
    const distanceFromPlayer = distanceMeters(state.playerLngLat, building.center);
    element.classList.toggle('is-overlapping-player', distanceFromPlayer <= Math.max(28, building.radius + 10));
    element.style.opacity = distanceFromPlayer <= Math.max(28, building.radius + 10) ? '0.14' : '0.88';
    element.style.left = `${point.x}px`;
    element.style.top = `${point.y}px`;
    element.style.setProperty('--building-width', `${size.width}px`);
    element.style.setProperty('--building-height', `${size.height}px`);
    element.dataset.buildingId = String(building.id);
    const randomSeed = Math.abs(hashString(`${building.id}:${Math.round(building.widthMeters || 0)}:${Math.round(building.heightMeters || 0)}`));
    const assetIndex = randomSeed % KENNEY_CITY_BUILDING_MODELS.length;
    element.dataset.asset = KENNEY_CITY_BUILDING_MODELS[assetIndex].replace('.glb', '');
    const viewer = createKenneyModelViewer(kenneyBuildingModelForFeature(building, assetIndex));
    element.appendChild(viewer);
    state.kenneyBuildingLayer.appendChild(element);
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash) + value.charCodeAt(index);
    hash |= 0;
  }
  return hash;
}

function renderKenneyVehicle() {
  if (!state.kenneyBuildingLayer || state.activeMount === 'none') return;
  const modelName = KENNEY_RACING_VEHICLES[state.activeMount];
  if (!modelName) return;
  const point = kenneyProjectionForLngLat(state.playerLngLat);
  if (!point) return;
  const element = document.createElement('div');
  element.className = 'kenney-building kenney-vehicle';
  element.style.left = `${point.x}px`;
  element.style.top = `${point.y + 26}px`;
  element.style.setProperty('--building-width', state.activeMount === 'airplane' ? '180px' : '138px');
  element.style.setProperty('--building-height', state.activeMount === 'airplane' ? '128px' : '112px');
  element.style.opacity = '0.96';
  element.dataset.asset = modelName.replace('.glb', '');
  element.appendChild(createKenneyModelViewer(`${KENNEY_RACING_ASSET_BASE}${modelName}`, state.activeMount === 'airplane' ? '65deg 78deg 4.4m' : '40deg 70deg 3.4m'));
  state.kenneyBuildingLayer.appendChild(element);
  state.app.dataset.kenneyVehicle = modelName;
}

function featureLooksTalkable(feature) {
  const props = feature.properties || {};
  const cls = `${props.class || ''} ${props.type || ''} ${props.maki || ''} ${props.category_en || ''}`.toLowerCase();
  return /restaurant|cafe|bar|food|attraction|museum|park|tourism|landmark|shop/.test(cls);
}

function createTalkablePois() {
  const queryMap = state.analysisMap?.isStyleLoaded?.() ? state.analysisMap : state.map;
  if (!queryMap?.isStyleLoaded?.()) return;
  const now = performance.now();
  if (isMobilePerformanceMode() && now - state.lastPoiQueryAt < 2500) return;
  state.lastPoiQueryAt = now;
  clearPoiMarkers();
  let features = [];
  try {
    const queryBounds = isMobilePerformanceMode() ? [
      [Math.round(window.innerWidth * 0.18), Math.round(window.innerHeight * 0.18)],
      [Math.round(window.innerWidth * 0.82), Math.round(window.innerHeight * 0.82)],
    ] : undefined;
    features = queryMap
      .queryRenderedFeatures(queryBounds)
      .filter(featureLooksTalkable)
      .slice(0, isMobilePerformanceMode() ? 6 : 14);
  } catch {
    features = [];
  }

  features.forEach((feature) => {
    if (!feature.geometry || feature.geometry.type !== 'Point') return;
    const name = feature.properties?.name_en || feature.properties?.name || 'Local place';
    const type = feature.properties?.class || feature.properties?.maki || 'Place';
    state.nearbyPois.push({
      name,
      type,
      lngLat: feature.geometry.coordinates,
      source: 'mapbox',
      properties: feature.properties || {},
    });
    const marker = new mapboxgl.Marker({
      element: createMarkerElement('poi-marker portal-marker', `Talk to ${name}`),
      anchor: 'bottom',
    })
      .setLngLat(feature.geometry.coordinates)
      .addTo(state.map);
    marker.getElement().addEventListener('click', () => openPoiDialogue({ name, type, lngLat: feature.geometry.coordinates, source: 'mapbox', properties: feature.properties || {} }));
    state.poiMarkers.push(marker);
  });

  if (!state.poiMarkers.length) addFallbackTalkPoints();
  if (state.villagePois.length) renderVillagePois();
  rebuildCauldronPortals();
}

function addFallbackTalkPoints() {
  const region = state.profile?.spawnRegion || spawnRegion.value || 'vancouver';
  const center = (SPAWN_POINTS[region] || SPAWN_POINTS.vancouver).lngLat;
  const points = FALLBACK_TALK_POINTS[region] || FALLBACK_TALK_POINTS.vancouver;
  points.forEach((point) => {
    const lngLat = [center[0] + point.offset[0], center[1] + point.offset[1]];
    state.nearbyPois.push({ name: point.name, type: point.type, lngLat, source: 'fallback', properties: {} });
    const marker = new mapboxgl.Marker({
      element: createMarkerElement('poi-marker portal-marker', `Talk to ${point.name}`),
      anchor: 'bottom',
    })
      .setLngLat(lngLat)
      .addTo(state.map);
    marker.getElement().addEventListener('click', () => openPoiDialogue({ name: point.name, type: point.type, lngLat, source: 'fallback', properties: {} }));
    state.poiMarkers.push(marker);
  });
}

function createVillageAroundHome() {
  const home = state.homeBuilding?.lngLat || state.playerLngLat;
  if (!home) return;
  if (state.villagePois.length) {
    renderVillagePois();
    return;
  }
  const shops = [
    { name: 'My Home', type: 'home', offset: [0, 0] },
    { name: 'Potion Shop', type: 'shop', offset: [0.00022, 0.00012] },
    { name: 'Mount Stable', type: 'stable', offset: [-0.00024, 0.00016] },
    { name: 'Cafe Cauldron', type: 'cafe', offset: [0.00018, -0.00022] },
    { name: 'Market Board', type: 'market', offset: [-0.00018, -0.00020] },
  ];
  shops.forEach((shop) => {
    const lngLat = [home[0] + shop.offset[0], home[1] + shop.offset[1]];
    const poi = { name: shop.name, type: shop.type, lngLat, source: shop.type === 'home' ? 'home' : 'village', properties: {} };
    state.villagePois.push(poi);
  });
  renderVillagePois();
}

function renderVillagePois() {
  state.villagePois.forEach((poi) => {
    if (!state.nearbyPois.some((existing) => existing.name === poi.name && existing.source === poi.source)) {
      state.nearbyPois.push(poi);
    }
    if (!state.map || !window.mapboxgl) return;
    const marker = new mapboxgl.Marker({
      element: createMarkerElement(poi.type === 'home' ? 'home-marker portal-marker' : 'poi-marker portal-marker', `Talk to ${poi.name}`),
      anchor: 'bottom',
    }).setLngLat(poi.lngLat).addTo(state.map);
    marker.getElement().addEventListener('click', () => openPoiDialogue(poi));
    state.poiMarkers.push(marker);
  });
  rebuildCauldronPortals();
}

function openDialogue(name, type) {
  document.getElementById('dialogue-title').textContent = name;
  document.getElementById('dialogue-type').textContent = String(type || 'LOCAL').toUpperCase();
  document.getElementById('dialogue-body').textContent =
    `${name} is available for conversation. Full party/social dialogue is not enabled yet.`;
  const actions = document.getElementById('dialogue-actions');
  if (actions) actions.innerHTML = '';
  showPanel('dialogue-panel');
  primeDialogueNavigation();
}

function poiDisplayName(poi, fallback = '주소 확인 중') {
  const props = poi?.properties || {};
  return props.name
    || props.address
    || props.full_address
    || props.place_name
    || [props.house_num || props.housenumber, props.street || props.street_name].filter(Boolean).join(' ')
    || poi?.name
    || fallback;
}

function setDialogueBody(text) {
  document.getElementById('dialogue-body').textContent = text;
}

function updateHudDatasets() {
  state.app.dataset.gold = String(state.currency.gold);
  state.app.dataset.gems = String(state.currency.gems);
  state.app.dataset.mount = state.activeMount;
  renderPartyPanel();
}

function showInventoryPanel() {
  openBookMenu('bag');
}

function showProfilePanel() {
  openBookMenu('profile');
}

function renderPartyPanel() {
  const panel = document.getElementById('party-panel');
  const list = document.getElementById('party-members');
  if (!panel || !list) return;
  const profileName = state.profile?.characterId || 'Me';
  state.party.members[0].name = profileName;
  panel.querySelector('h2').textContent = state.party.follow ? `Party · Follow · ${state.server.shardId}` : `Party · ${state.server.shardId}`;
  const socialUsers = state.server.onlineUsers
    .filter((user) => !state.party.members.some((member) => member.id === user.id))
    .slice(0, Math.max(0, state.server.maxUsers - state.party.members.length));
  list.innerHTML = [
    ...state.party.members.map((member) => `
    <div class="party-member" data-member-id="${escapeHtml(member.id)}">
      <span>${member.online ? '🟢' : '⚫'}</span>
      <b>${escapeHtml(member.name)}</b>
      <small>${escapeHtml(member.role)} · ${member.hp}%</small>
    </div>
    `),
    ...socialUsers.map((user) => `
      <div class="party-member" data-social-user="${escapeHtml(user.id)}">
        <span>${expressionIcon(user.expression)}</span>
        <b>${escapeHtml(user.name)}</b>
        <small>${escapeHtml(user.status)}</small>
      </div>
    `),
  ].join('');
  state.app.dataset.partyMembers = String(state.party.members.length);
  state.app.dataset.partyFollow = state.party.follow ? 'true' : 'false';
  state.app.dataset.serverUsers = `${state.server.onlineUsers.length}/${state.server.maxUsers}`;
}

function showPartyPanel() {
  renderPartyPanel();
  document.getElementById('party-panel')?.removeAttribute('hidden');
}

function inviteNearbyToParty() {
  const name = nearestPoi(160)?.name || 'Nearby Adventurer';
  if (state.party.members.length >= state.server.maxUsers) {
    appendChatMessage('party', `Server cap ${state.server.maxUsers} reached.`, 'System');
    return;
  }
  if (!state.party.members.some((member) => member.name === name)) {
    state.party.members.push({ id: `member:${Date.now()}`, name, role: 'Member', hp: 100, online: true });
  }
  appendChatMessage('party', `${name} invited to party.`, 'System');
  renderPartyPanel();
}

function togglePartyFollow() {
  state.party.follow = !state.party.follow;
  appendChatMessage('party', state.party.follow ? 'Party follow enabled.' : 'Party follow disabled.', 'System');
  renderPartyPanel();
}

function activatePartyChat() {
  state.chatChannel = 'party';
  document.querySelectorAll('[data-chat-channel]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.chatChannel === 'party');
  });
  document.getElementById('chat-input')?.focus();
  appendChatMessage('party', 'Party chat active.', 'System');
}

function showServerPanel() {
  openBookMenu('server');
}

function showSkillPanel() {
  openBookMenu('skills');
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function skillIcon(skill) {
  return {
    Slash: '⚔️',
    Guard: '🛡️',
    Dash: '💨',
    'Portal Talk': '💬',
    'Mount Call': '🐎',
    '맛집찾기': '🍜',
    'Starter Potion': '🧪',
    Bread: '🍞',
    '스프린트': '💨',
    '장소이동': '📍',
    '친구순간이동': '👥',
    'Data mode': '◇',
    '테이블 예약': '🍽️',
    '일반 공격': '⚔️',
    '연속 공격': '⚔',
    '강공격': '💥',
    '이동 공격기': '💨',
    '필살기': '🔥',
  }[skill] || '✦';
}

function renderQuickSlots() {
  document.querySelectorAll('.quick-slot').forEach((button, index) => {
    const skill = state.quickSlots[index];
    const key = state.quickSlotKeys[index] || button.dataset.key || String(index + 1);
    button.dataset.key = key;
    button.innerHTML = skill
      ? `<strong>${skillIcon(skill)}</strong><small>${escapeHtml(key)}</small>`
      : `<strong>${escapeHtml(key)}</strong>`;
    button.dataset.skill = skill || '';
    button.title = skill ? `${key}: ${skill}` : `${key}: Empty`;
  });
  updateQuickSlotCooldowns();
}

function quickSlotCooldown(index) {
  if (index === 5) return { until: state.sprintCooldownUntil, duration: 10000 };
  return { until: 0, duration: 0 };
}

function updateQuickSlotCooldowns() {
  const now = Date.now();
  document.querySelectorAll('.quick-slot').forEach((button, index) => {
    const { until, duration } = quickSlotCooldown(index);
    const remaining = Math.max(0, until - now);
    const progress = duration ? remaining / duration : 0;
    button.classList.toggle('is-cooling', remaining > 0);
    button.style.setProperty('--cooldown-progress', `${Math.round(progress * 100)}%`);
    button.dataset.cooldown = remaining > 0 ? String(Math.ceil(remaining / 1000)) : '';
  });
}

function appendChatMessage(channel, text, speaker = state.profile?.characterId || 'Me') {
  const log = document.getElementById('chat-log');
  if (!log) return;
  const label = { channel: '채널', local: '동네', party: '파티' }[channel] || '채널';
  const expression = inferChatExpression(text);
  const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  if (speaker !== 'System') setAvatarExpression(expression);
  log.insertAdjacentHTML('beforeend', `
    <div class="chat-message" data-channel="${escapeHtml(channel)}" data-expression="${escapeHtml(expression)}">
      <span class="chat-avatar" aria-hidden="true">${expressionIcon(expression)}</span>
      <div class="chat-bubble"><b>[${label}] ${escapeHtml(speaker)}:</b> ${escapeHtml(text)}</div>
      <small class="chat-meta">${time}</small>
    </div>
  `);
  log.scrollTop = log.scrollHeight;
}

function inferChatExpression(text) {
  if (/ㅋㅋ|ㅎㅎ|lol|happy|좋|nice|굿|감사|반가/i.test(text)) return 'happy';
  if (/ㅠㅠ|슬프|sad|힘들|아파|못|실패/i.test(text)) return 'sad';
  if (/!|wow|와|대박|헐|좋아/i.test(text)) return 'surprised';
  return 'neutral';
}

function expressionIcon(expression) {
  return { happy: '😊', sad: '😟', surprised: '😮', neutral: '🙂' }[expression] || '🙂';
}

function setAvatarExpression(expression) {
  state.sprite.expression = expression;
  state.app.dataset.avatarExpression = expression;
  const nameplate = document.getElementById('avatar-nameplate');
  if (nameplate) nameplate.dataset.expression = expression;
}

function setChatChannel(channel, announce = true) {
  state.chatChannel = channel || 'channel';
  document.querySelectorAll('[data-chat-channel]').forEach((target) => {
    target.classList.toggle('is-active', target.dataset.chatChannel === state.chatChannel);
  });
  state.app.dataset.chatChannel = state.chatChannel;
  if (announce) appendChatMessage(state.chatChannel, '채팅 채널 전환', 'System');
}

function cycleChatChannel() {
  const channels = ['channel', 'local', 'party'];
  const next = channels[(channels.indexOf(state.chatChannel) + 1) % channels.length];
  setChatChannel(next);
  focusChatComposer();
}

function sendChatFromInput(input) {
  const text = input.value.trim();
  if (!text) return false;
  appendChatMessage(state.chatChannel, text);
  input.value = '';
  return true;
}

function activateQuickSlot(index) {
  const action = state.quickSlots[index];
  if (!action) return;
  if (action === '스프린트') {
    sprintForward();
    return;
  }
  if (action === '장소이동') {
    if (!document.getElementById('book-menu')?.hidden && state.travelTarget) {
      teleportToTravelTarget();
    } else {
      openTravelBook();
    }
    return;
  }
  if (action === '친구순간이동') {
    openFriendTeleportList();
    return;
  }
  if (action === 'Data mode') {
    state.isFlying = !state.isFlying;
    state.dataModeDirection = null;
    state.sprite.flightTarget = state.isFlying ? FLIGHT_MAX_LIFT : 0;
    if (state.isFlying && state.sprite.jumpZ <= 0) {
      state.sprite.jumpVelocity = 145;
      state.sprite.jumps = Math.max(state.sprite.jumps, 1);
    }
    state.app.dataset.flying = state.isFlying ? 'true' : 'false';
    state.app.dataset.dataMode = state.isFlying ? 'true' : 'false';
    state.app.dataset.dataModeDirection = state.dataModeDirection || '';
    appendChatMessage(
      'channel',
      state.isFlying ? 'Data mode ON · 첫 방향키 방향으로 데이터 비행 · 속도 x2' : 'Data mode OFF',
      'System'
    );
    syncPlayerMapPosition(true);
    return;
  }
  if (action === '테이블 예약') {
    openReservationList();
    return;
  }
  if (['일반 공격', '연속 공격', '강공격', '이동 공격기', '필살기'].includes(action)) {
    startAttack();
    appendChatMessage('channel', action, 'System');
    return;
  }
  if (action === '맛집찾기') {
    const poi = nearestPoi(420);
    openDialogue('맛집찾기', 'Skill');
    document.getElementById('dialogue-body').textContent = poi
      ? `${poi.name} 정보 밑에 코멘트를 남기면 맛집찾기 숙련도가 오릅니다. 리뷰 예시: “동네 분위기와 메뉴가 좋아요.”`
      : '주변 맛집/가게/건물 정보를 찾는 중입니다. 가까운 블럭이나 포털 근처에서 다시 사용하세요.';
    return;
  }
  appendChatMessage('channel', `${action} 사용`, 'System');
  if (action === 'Portal Talk') interactWithNearestPoi();
  if (action === 'Dash') state.activeMount = 'cat';
}

function sprintForward() {
  const now = Date.now();
  if (now < state.sprintCooldownUntil) {
    const seconds = Math.ceil((state.sprintCooldownUntil - now) / 1000);
    appendChatMessage('channel', `스프린트 쿨다운 ${seconds}s`, 'System');
    return;
  }
  const vector = directionVector(state.sprite.direction);
  const length = Math.hypot(vector.east, vector.north) || 1;
  let moved = false;
  for (let step = 1; step <= 10; step += 1) {
    const next = offsetLngLat(state.playerLngLat, (vector.east / length), (vector.north / length));
    if (!tryMovePlayer(next)) break;
    moved = true;
  }
  state.sprite.moving = true;
  state.sprite.frame = (state.sprite.frame + 9) % 72;
  state.sprintCooldownUntil = now + 10000;
  state.app.dataset.sprintCooldownUntil = String(state.sprintCooldownUntil);
  if (moved) {
    syncPlayerMapPosition(true);
    appendChatMessage('channel', '스프린트 · 10m 전진', 'System');
  } else {
    appendChatMessage('channel', '앞이 막혀 스프린트 실패', 'System');
  }
  window.setTimeout(() => {
    state.sprite.moving = false;
    refreshSpriteStatus();
  }, 260);
}

function spawnPointKeyList() {
  return ['vancouver', 'seoul', 'tokyo', 'newyork', 'la', 'lasvegas'];
}

function openTravelBook() {
  const menu = document.getElementById('book-menu');
  const left = document.getElementById('book-left');
  const right = document.getElementById('book-right');
  if (!menu || !left || !right) return;
  menu.hidden = false;
  state.travelTarget = [...state.playerLngLat];
  left.innerHTML = `
    <h2>World Map</h2>
    <p>탭으로 도시를 고르고, 지도 위를 클릭해 pin을 꽂으세요. W를 다시 누르면 해당 지점으로 이동합니다.</p>
    <div id="book-travel-map" class="book-travel-map"></div>
  `;
  right.innerHTML = `
    <h2>현재 도시</h2>
    <p>${state.currentSpawn?.label || 'Current City'}</p>
    <div class="book-list">${spawnPointKeyList().map((key) => {
      const point = SPAWN_POINTS[key];
      return `<button type="button" class="book-action" data-travel-city="${key}">${point.label}</button>`;
    }).join('')}</div>
    <button type="button" class="book-action primary" id="travel-confirm">W · Pin 위치로 이동</button>
  `;
  window.setTimeout(() => createTravelMap(state.playerLngLat), 50);
  document.querySelectorAll('[data-travel-city]').forEach((button) => {
    button.addEventListener('click', () => {
      const point = SPAWN_POINTS[button.dataset.travelCity];
      if (!point) return;
      state.travelTarget = [...point.lngLat];
      state.travelMap?.jumpTo({ center: point.lngLat, zoom: 15.2 });
      setTravelMarker(point.lngLat);
    });
  });
  document.getElementById('travel-confirm')?.addEventListener('click', teleportToTravelTarget);
}

function createTravelMap(center) {
  const container = document.getElementById('book-travel-map');
  if (!container || !window.mapboxgl || !window.CAULDRON_STATIC_CONFIG?.mapboxToken) return;
  if (state.travelMap) {
    state.travelMap.remove();
    state.travelMap = null;
    state.travelMarker = null;
  }
  state.travelMap = new mapboxgl.Map({
    container,
    style: window.CAULDRON_STATIC_CONFIG.analysisMapboxStyle || 'mapbox://styles/mapbox/streets-v12',
    center,
    zoom: 15.5,
    pitch: 0,
    bearing: 0,
    attributionControl: false,
  });
  state.travelMap.on('load', () => setTravelMarker(state.travelTarget || center));
  state.travelMap.on('click', (event) => {
    state.travelTarget = [event.lngLat.lng, event.lngLat.lat];
    setTravelMarker(state.travelTarget);
  });
}

function setTravelMarker(lngLat) {
  if (!state.travelMap || !window.mapboxgl) return;
  if (!state.travelMarker) {
    state.travelMarker = new mapboxgl.Marker({ color: '#ff4d6d' });
  }
  state.travelMarker.setLngLat(lngLat).addTo(state.travelMap);
}

function teleportToTravelTarget() {
  if (!state.travelTarget) return;
  closeBookMenu();
  movePlayerTo(state.travelTarget, 'Pinned location');
  appendChatMessage('channel', 'Pin 위치로 이동합니다.', 'System');
}

function startMobileLocationFollow() {
  if (!navigator.geolocation) {
    appendChatMessage('channel', '이 기기에서 위치 API를 사용할 수 없습니다.', 'System');
    return;
  }
  if (state.mobileLocationWatchId !== null) {
    navigator.geolocation.clearWatch(state.mobileLocationWatchId);
    state.mobileLocationWatchId = null;
    appendChatMessage('channel', '실시간 위치 이동 OFF', 'System');
    return;
  }
  state.mobileLocationWatchId = navigator.geolocation.watchPosition((position) => {
    const next = [position.coords.longitude, position.coords.latitude];
    if (distanceMeters(state.playerLngLat, next) < 1.2) return;
    state.playerLngLat = next;
    state.sprite.moving = true;
    syncPlayerMapPosition(true);
    window.setTimeout(() => {
      state.sprite.moving = false;
      refreshSpriteStatus();
    }, 420);
  }, () => {
    appendChatMessage('channel', '위치 권한이 필요합니다.', 'System');
  }, {
    enableHighAccuracy: true,
    maximumAge: 1200,
    timeout: 8000,
  });
  appendChatMessage('channel', '실시간 위치 이동 ON', 'System');
}

function friendTeleportTargets() {
  const base = state.playerLngLat;
  return state.party.members
    .filter((member) => member.id !== 'me')
    .map((member, index) => ({
      ...member,
      lngLat: offsetLngLat(base, 16 + index * 9, 8 + index * 7),
    }));
}

function openFriendTeleportList() {
  openDialogue('Friend Teleport', 'Party');
  document.getElementById('dialogue-body').textContent = '친구 위치 옆으로 순간이동합니다.';
  const actions = document.getElementById('dialogue-actions');
  if (!actions) return;
  const friends = friendTeleportTargets();
  actions.innerHTML = friends.length ? '' : '<button type="button">온라인 친구 없음</button>';
  friends.forEach((friend) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${friend.name} 옆으로 이동`;
    button.addEventListener('click', () => {
      const landing = offsetLngLat(friend.lngLat, 2.2, 0);
      closePanel('dialogue-panel');
      movePlayerTo(landing, `${friend.name} 위치`);
    });
    actions.appendChild(button);
  });
  const exitButton = document.createElement('button');
  exitButton.type = 'button';
  exitButton.textContent = '나가기';
  exitButton.addEventListener('click', () => closePanel('dialogue-panel'));
  actions.appendChild(exitButton);
  primeDialogueNavigation();
}

function restaurantCandidates() {
  const places = [...state.nearbyPois, ...state.portalPois]
    .filter((poi) => /restaurant|cafe|bar|food|shop|building/i.test(`${poi.type} ${poi.properties?.class || ''} ${poi.properties?.maki || ''}`))
    .map((poi, index) => ({
      ...poi,
      wait: 5 + ((index * 7) % 35),
      available: index % 3 !== 2,
    }))
    .slice(0, 8);
  if (places.length) return places;
  return ['Corner Bistro', 'Maple Noodle', 'Cauldron Cafe'].map((name, index) => ({
    name,
    type: 'restaurant',
    lngLat: offsetLngLat(state.playerLngLat, 18 + index * 12, 10 - index * 5),
    wait: 8 + index * 11,
    available: index !== 2,
  }));
}

function openReservationList() {
  openDialogue('Table Reservation', 'Local');
  document.getElementById('dialogue-body').textContent = '주변 식당 예약 가능 여부와 예상 대기시간입니다. 빈자리 없으면 예약 실패합니다.';
  const actions = document.getElementById('dialogue-actions');
  if (!actions) return;
  actions.innerHTML = '';
  restaurantCandidates().forEach((place) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = `${place.name} · ${place.available ? '예약 가능' : '빈자리 없음'} · ${place.wait}분`;
    button.disabled = !place.available;
    button.addEventListener('click', () => {
      setDialogueBody(place.available
        ? `${place.name} 예약 대기 등록 · 예상 ${place.wait}분`
        : `${place.name} 예약 실패 · 빈자리 없음`);
    });
    actions.appendChild(button);
  });
  const exitButton = document.createElement('button');
  exitButton.type = 'button';
  exitButton.textContent = '나가기';
  exitButton.addEventListener('click', () => closePanel('dialogue-panel'));
  actions.appendChild(exitButton);
  primeDialogueNavigation();
}

function openWorldTravelPanel() {
  openDialogue('World Gate', 'Travel');
  document.getElementById('dialogue-body').textContent = '이동할 월드를 선택하세요. 선택 시 해당 도시의 실제 좌표로 이동합니다.';
  const actions = document.getElementById('dialogue-actions');
  if (!actions) return;
  actions.innerHTML = ['seoul', 'tokyo', 'vancouver', 'newyork'].map((key) => {
    const point = SPAWN_POINTS[key];
    return `<button type="button" data-world-gate="${key}">${point.label}</button>`;
  }).join('');
  actions.querySelectorAll('[data-world-gate]').forEach((button) => {
    button.addEventListener('click', () => {
      const point = SPAWN_POINTS[button.dataset.worldGate];
      if (!point) return;
      closePanel('dialogue-panel');
      movePlayerTo(point.lngLat, point.label);
    });
  });
  primeDialogueNavigation();
}

function openBookMenu(tab = 'profile') {
  const menu = document.getElementById('book-menu');
  const left = document.getElementById('book-left');
  const right = document.getElementById('book-right');
  if (!menu || !left || !right) return;
  menu.hidden = false;
  document.querySelectorAll('[data-book-tab]').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.bookTab === tab);
  });
  const profileName = state.profile?.characterId || 'guest';
  const home = state.profile?.homeAddress || state.currentSpawn.label;
  if (tab === 'profile') {
    left.innerHTML = `<h2>Profile</h2><p>${profileName}</p><p>Home: ${home}</p><p>Gold ${state.currency.gold} · Gems ${state.currency.gems}</p>`;
    right.innerHTML = `<h2>Bag & Skills</h2><p>Use Bag and Skills tabs to manage items and quick slots.</p><button class="book-action" data-book-tab-jump="bag">Open Bag</button><button class="book-action" data-book-tab-jump="skills">Open Skills</button>`;
  } else if (tab === 'bag') {
    left.innerHTML = `<h2>Bag</h2><div class="book-list">${state.inventory.map((item) => `<div class="book-item">${item}</div>`).join('')}</div>`;
    right.innerHTML = `<h2>Currency</h2><p>${state.currency.gold} Gold</p><p>${state.currency.gems} Gems</p><p>Mount: ${state.activeMount}</p>`;
  } else if (tab === 'skills') {
    left.innerHTML = `<h2>Skill Tree</h2><p>Click a skill, then click a quick slot.</p><div class="book-list">${state.skills.map((skill) => `<button class="book-skill" data-skill="${skill}">${skill}</button>`).join('')}</div>`;
    right.innerHTML = `<h2>Quick Slots</h2><p>Selected: ${state.pendingSkill || 'None'}</p><div class="book-list">${state.quickSlots.map((skill, index) => `<button class="book-item" data-book-slot="${index}">${index + 1}. ${skill || 'Empty'}</button>`).join('')}</div>`;
  } else if (tab === 'server') {
    left.innerHTML = `<h2>Server Move</h2><p>Current shard: ${state.server.shardId}</p><p>Capacity: ${state.server.onlineUsers.length}/${state.server.maxUsers}</p><div class="book-list"><button class="book-action">Seoul</button><button class="book-action">Tokyo</button><button class="book-action">Vancouver</button><button class="book-action">New York</button></div>`;
    right.innerHTML = `<h2>Social</h2><p>Shard regions will scale independently: Vancouver, Seoul, Tokyo, New York.</p><div class="book-list">${state.server.onlineUsers.map((user) => `<div class="book-item">${expressionIcon(user.expression)} ${escapeHtml(user.name)} · ${escapeHtml(user.status)}</div>`).join('')}</div><p>Status: ${state.mapFileReady ? 'Ready' : 'Building'}</p>`;
  }
  bindBookDynamicControls();
}

function closeBookMenu() {
  const menu = document.getElementById('book-menu');
  if (menu) menu.hidden = true;
}

function bindBookDynamicControls() {
  document.querySelectorAll('[data-book-tab-jump]').forEach((button) => {
    button.addEventListener('click', () => openBookMenu(button.dataset.bookTabJump));
  });
  document.querySelectorAll('[data-skill]').forEach((button) => {
    button.addEventListener('click', () => {
      state.pendingSkill = button.dataset.skill;
      openBookMenu('skills');
    });
  });
  document.querySelectorAll('[data-book-slot]').forEach((button) => {
    button.addEventListener('click', () => {
      if (!state.pendingSkill) return;
      state.quickSlots[Number(button.dataset.bookSlot)] = state.pendingSkill;
      state.pendingSkill = null;
      renderQuickSlots();
      openBookMenu('skills');
    });
  });
}

function showChatPanel() {
  toggleChatVisibility();
}

function toggleChatVisibility(forceVisible = null) {
  state.chatVisible = forceVisible === null ? !state.chatVisible : Boolean(forceVisible);
  const chat = document.getElementById('chat-box');
  chat?.classList.toggle('is-visible', state.chatVisible);
  state.app.dataset.chatVisible = state.chatVisible ? 'true' : 'false';
  if (state.chatVisible) focusChatComposer();
}

function focusChatComposer() {
  if (!state.chatVisible) toggleChatVisibility(true);
  const chat = document.getElementById('chat-box');
  const input = document.getElementById('chat-input');
  chat?.classList.add('is-composing');
  state.chatComposing = true;
  input?.focus();
}

function blurChatComposer() {
  document.getElementById('chat-box')?.classList.remove('is-composing');
  state.chatComposing = false;
  document.getElementById('chat-input')?.blur();
}

function cycleMount() {
  const mounts = Object.keys(MOUNT_SPEEDS);
  const nextIndex = (mounts.indexOf(state.activeMount) + 1) % mounts.length;
  state.activeMount = mounts[nextIndex];
  state.app.dataset.mount = state.activeMount;
  openDialogue('Mount changed', 'System');
  document.getElementById('dialogue-body').textContent =
    `${state.activeMount} equipped · speed x${MOUNT_SPEEDS[state.activeMount]}.`;
}

function startBgm() {
  if (state.bgm.enabled || !window.AudioContext) return;
  const context = new AudioContext();
  const gain = context.createGain();
  gain.gain.value = 0.035;
  gain.connect(context.destination);
  const notes = [261.63, 329.63, 392, 523.25, 392, 329.63];
  let index = 0;
  state.bgm.timer = window.setInterval(() => {
    const osc = context.createOscillator();
    const noteGain = context.createGain();
    osc.type = 'triangle';
    osc.frequency.value = notes[index % notes.length];
    noteGain.gain.setValueAtTime(0.0001, context.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.03);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.42);
    osc.connect(noteGain).connect(gain);
    osc.start();
    osc.stop(context.currentTime + 0.45);
    index += 1;
  }, 520);
  state.bgm.context = context;
  state.bgm.gain = gain;
  state.bgm.enabled = true;
  state.app.dataset.bgm = 'on';
}

function openPoiDialogue(poi) {
  const displayName = poiDisplayName(poi);
  document.getElementById('dialogue-title').textContent = displayName;
  document.getElementById('dialogue-type').textContent = String(poi.type || 'LOCAL').toUpperCase();
  const distance = Math.round(distanceMeters(state.playerLngLat, poi.lngLat));
  const review = poi.properties?.review || '리뷰 없음 · 정보 밑에 코멘트를 남기면 맛집찾기 스킬 학습에 사용됩니다.';
  const location = `${poi.lngLat[1].toFixed(5)}, ${poi.lngLat[0].toFixed(5)}`;
  const directoryPlaces = buildingDirectoryForPoi(poi);
  setDialogueBody(poi.type === 'building'
    ? `${distance}m · 빌딩 디렉토리에서 가게를 선택하세요.`
    : `${distance}m · ${poi.source || 'mapbox'} · ${poi.type || 'place'}`);
  const actions = document.getElementById('dialogue-actions');
  if (actions) {
    actions.innerHTML = '';
    if (poi.type === 'building') {
      const places = directoryPlaces.length ? directoryPlaces : [{ ...poi, name: displayName, type: 'place' }];
      places.slice(0, 10).forEach((place) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.dataset.poiAction = 'directory-place';
        button.textContent = `🏬 ${poiDisplayName(place, place.name)}`;
        button.addEventListener('click', () => openPlaceOptions(place));
        actions.appendChild(button);
      });
      addDialogueExitButton(actions);
      reverseGeocodePoiTitle(poi);
    } else {
      openPlaceOptions(poi);
      return;
    }
    if (poi.type === 'stable') {
      const mountButton = document.createElement('button');
      mountButton.type = 'button';
      mountButton.dataset.poiAction = 'mount';
      mountButton.textContent = '탈것 바꾸기';
      mountButton.addEventListener('click', cycleMount);
      actions.appendChild(mountButton);
    }
  }
  showPanel('dialogue-panel');
  primeDialogueNavigation();
}

function addDialogueExitButton(actions) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.poiAction = 'exit';
  button.textContent = '[나가기]';
  button.addEventListener('click', () => closePanel('dialogue-panel'));
  actions.appendChild(button);
}

function openPlaceOptions(place) {
  const actions = document.getElementById('dialogue-actions');
  if (!actions) return;
  const name = poiDisplayName(place, place.name || 'Place');
  const review = place.properties?.review || '리뷰 없음 · 정보 밑에 코멘트를 남기면 맛집찾기 스킬 학습에 사용됩니다.';
  const location = `${place.lngLat[1].toFixed(5)}, ${place.lngLat[0].toFixed(5)}`;
  document.getElementById('dialogue-title').textContent = name;
  setDialogueBody(`${name}\n${place.type || 'place'} · ${Math.round(distanceMeters(state.playerLngLat, place.lngLat))}m · Mapbox POI`);
  actions.innerHTML = '';
  [
    ['name', `[${name}]`, () => setDialogueBody(`${name}: 실제 위치 기반 상호작용 대상입니다.`)],
    ['review', '[리뷰] [위치]', () => setDialogueBody(`리뷰: ${review}\n위치: ${location}`)],
    ['menu', '[메뉴보기]', () => setDialogueBody(`${name} 메뉴: 장소 API와 가게 오너 데이터 연결 예정입니다.`)],
    ['reserve', '[예약하기]', () => setDialogueBody(`${name} 예약: 계정 시스템 연결 후 예약 요청을 보낼 수 있습니다.`)],
    ['enter', '[입장하기]', () => setDialogueBody(`${name} 내부 인스턴스 입장 준비 중입니다.`)],
  ].forEach(([id, label, handler]) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.poiAction = id;
    button.textContent = label;
    button.addEventListener('click', handler);
    actions.appendChild(button);
  });
  addDialogueExitButton(actions);
  showPanel('dialogue-panel');
  primeDialogueNavigation();
}

async function reverseGeocodePoiTitle(poi) {
  if (!poi?.lngLat || poiDisplayName(poi, '') !== poi.name) return;
  const key = poi.lngLat.map((value) => value.toFixed(5)).join(',');
  if (state.addressCache.has(key)) {
    document.getElementById('dialogue-title').textContent = state.addressCache.get(key);
    return;
  }
  try {
    const token = window.CAULDRON_STATIC_CONFIG?.mapboxToken;
    if (!token) return;
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${poi.lngLat[0]},${poi.lngLat[1]}.json?limit=1&types=address,poi,place&access_token=${encodeURIComponent(token)}`;
    const response = await fetch(url);
    const payload = await response.json();
    const label = payload.features?.[0]?.place_name;
    if (!label) return;
    state.addressCache.set(key, label);
    document.getElementById('dialogue-title').textContent = label;
  } catch {
    // Keep Mapbox building fallback if reverse geocoding is unavailable.
  }
}

function buildingDirectoryForPoi(poi) {
  const center = poi?.lngLat || state.playerLngLat;
  return [...state.nearbyPois, ...state.portalPois]
    .filter((place) => place?.lngLat && distanceMeters(center, place.lngLat) <= 140)
    .filter((place, index, all) => all.findIndex((other) => other.name === place.name) === index)
    .slice(0, 10);
}

function directoryText(places) {
  if (!places.length) return '이 빌딩 주변 Mapbox POI 디렉토리가 아직 비어 있습니다. 지도 타일 로딩 후 다시 시도하세요.';
  return places.map((place, index) => `${index + 1}. ${place.name} · ${place.type || 'place'} · ${Math.round(distanceMeters(state.playerLngLat, place.lngLat))}m`).join('\n');
}

function primeDialogueNavigation() {
  state.dialogueSelectionIndex = 0;
  updateDialogueSelection();
}

function updateDialogueSelection() {
  const buttons = [...document.querySelectorAll('#dialogue-actions button:not(:disabled)')];
  buttons.forEach((button, index) => {
    button.classList.toggle('is-selected', index === state.dialogueSelectionIndex);
  });
  buttons[state.dialogueSelectionIndex]?.scrollIntoView?.({ block: 'nearest' });
}

function moveDialogueSelection(delta) {
  const buttons = [...document.querySelectorAll('#dialogue-actions button:not(:disabled)')];
  if (!buttons.length) return false;
  state.dialogueSelectionIndex = (state.dialogueSelectionIndex + delta + buttons.length) % buttons.length;
  updateDialogueSelection();
  return true;
}

function activateDialogueSelection() {
  const buttons = [...document.querySelectorAll('#dialogue-actions button:not(:disabled)')];
  const button = buttons[state.dialogueSelectionIndex];
  if (!button) return false;
  button.click();
  return true;
}

function dialogueIsOpen() {
  const panel = document.getElementById('dialogue-panel');
  return Boolean(panel && !panel.hidden);
}

function distanceMeters(a, b) {
  const lngScale = 111320 * Math.cos((a[1] * Math.PI) / 180);
  const dx = (b[0] - a[0]) * lngScale;
  const dy = (b[1] - a[1]) * 110540;
  return Math.hypot(dx, dy);
}

function offsetLngLat([lng, lat], eastMeters, northMeters) {
  const lngScale = 111320 * Math.cos((lat * Math.PI) / 180);
  return [
    lng + eastMeters / lngScale,
    lat + northMeters / 110540,
  ];
}

function rectanglePolygon(center, halfWidthMeters = 8, halfDepthMeters = 6) {
  const nw = offsetLngLat(center, -halfWidthMeters, halfDepthMeters);
  const ne = offsetLngLat(center, halfWidthMeters, halfDepthMeters);
  const se = offsetLngLat(center, halfWidthMeters, -halfDepthMeters);
  const sw = offsetLngLat(center, -halfWidthMeters, -halfDepthMeters);
  return {
    type: 'Polygon',
    coordinates: [[nw, ne, se, sw, nw]],
  };
}

function pointInRing(point, ring) {
  let inside = false;
  for (let index = 0, prev = ring.length - 1; index < ring.length; prev = index++) {
    const current = ring[index];
    const last = ring[prev];
    const intersects = ((current[1] > point[1]) !== (last[1] > point[1]))
      && (point[0] < ((last[0] - current[0]) * (point[1] - current[1])) / (last[1] - current[1]) + current[0]);
    if (intersects) inside = !inside;
  }
  return inside;
}

function pointInObstacle(point, obstacle) {
  const geometry = obstacle.geometry;
  if (obstacle.type !== 'building' || !geometry) return false;
  const inPolygon = (polygon) => {
    if (!polygon.length || !pointInRing(point, polygon[0])) return false;
    return !polygon.slice(1).some((hole) => pointInRing(point, hole));
  };
  if (geometry.type === 'Polygon') return inPolygon(geometry.coordinates);
  if (geometry.type === 'MultiPolygon') return geometry.coordinates.some(inPolygon);
  return false;
}

function distanceToSegmentMeters(point, a, b) {
  const metersPerLng = 111320 * Math.cos((point[1] * Math.PI) / 180);
  const ax = (a[0] - point[0]) * metersPerLng;
  const ay = (a[1] - point[1]) * 110540;
  const bx = (b[0] - point[0]) * metersPerLng;
  const by = (b[1] - point[1]) * 110540;
  const dx = bx - ax;
  const dy = by - ay;
  const lengthSquared = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, -(ax * dx + ay * dy) / lengthSquared));
  return Math.hypot(ax + dx * t, ay + dy * t);
}

function distanceToObstacleEdge(point, obstacle) {
  const geometry = obstacle.geometry;
  if (!geometry || obstacle.type !== 'building') return Infinity;
  const polygons = geometry.type === 'Polygon' ? [geometry.coordinates] : geometry.type === 'MultiPolygon' ? geometry.coordinates : [];
  let nearest = Infinity;
  polygons.forEach((polygon) => {
    polygon.forEach((ring) => {
      for (let index = 0; index < ring.length - 1; index += 1) {
        nearest = Math.min(nearest, distanceToSegmentMeters(point, ring[index], ring[index + 1]));
      }
    });
  });
  return nearest;
}

function rawCollisionAt(lngLat, obstacles) {
  return obstacles
    .map((obstacle) => ({
      ...obstacle,
      distance: distanceMeters(lngLat, obstacle.center),
      edgeDistance: distanceToObstacleEdge(lngLat, obstacle),
    }))
    .filter((obstacle) => (
      pointInObstacle(lngLat, obstacle)
      || (
        obstacle.type === 'water'
        && (
          pointInObstacle(lngLat, { ...obstacle, type: 'building' })
          || (!/Polygon/.test(obstacle.geometry?.type || '') && obstacle.distance <= obstacle.radius + COLLISION_PADDING_METERS)
        )
      )
      || (obstacle.type === 'building' && !obstacle.geometry && obstacle.distance <= obstacle.radius + COLLISION_PADDING_METERS)
      || (obstacle.type === 'tree' && obstacle.distance <= obstacle.radius + COLLISION_PADDING_METERS)
      || (!obstacle.geometry && obstacle.distance <= obstacle.radius + COLLISION_PADDING_METERS)
    ))
    .sort((a, b) => a.distance - b.distance)[0] || null;
}

function collisionAt(lngLat) {
  const productionHit = productionCollisionAt(lngLat);
  if (productionHit) return productionHit;
  return collisionMapHit(lngLat) || rawCollisionAt(lngLat, state.obstacleFeatures);
}

function tryMovePlayer(nextLngLat) {
  if (state.isFlying) {
    state.app.dataset.collision = 'data-mode';
    state.app.dataset.collisionId = '';
    state.app.dataset.collisionDistance = '';
    state.playerLngLat = nextLngLat;
    updateInteractionHint();
    return true;
  }
  const obstacle = collisionAt(nextLngLat);
  if (obstacle) {
    state.app.dataset.collision = obstacle.type;
    state.app.dataset.collisionId = String(obstacle.id);
    state.app.dataset.collisionDistance = obstacle.distance.toFixed(1);
    return false;
  }
  state.app.dataset.collision = 'none';
  state.app.dataset.collisionId = '';
  state.app.dataset.collisionDistance = '';
  state.playerLngLat = nextLngLat;
  updateInteractionHint();
  renderCauldronRuntimeFrame();
  return true;
}

function nearestPoi(maxMeters = 180) {
  const current = state.playerLngLat;
  const buildingPois = state.buildingHitboxes
    .filter((building) => distanceMeters(current, building.center) <= Math.max(maxMeters, 90))
    .slice(0, 80)
    .map((building, index) => ({
      name: building.properties?.name || building.properties?.house_num || `Building Block ${index + 1}`,
      type: 'building',
      lngLat: building.center,
      source: 'mapbox-building',
      properties: building.properties || {},
    }));
  const source = [
    ...(state.portalPois.length ? state.portalPois : state.nearbyPois),
    ...buildingPois,
  ];
  return source
    .map((poi) => ({ ...poi, distance: distanceMeters(current, poi.lngLat) }))
    .filter((poi) => poi.distance <= maxMeters)
    .sort((a, b) => {
      const portalA = a.source === 'village' || a.source === 'home' ? -45 : 0;
      const portalB = b.source === 'village' || b.source === 'home' ? -45 : 0;
      return (a.distance + portalA) - (b.distance + portalB);
    })[0] || null;
}

function nearestInteractableBuilding(maxEdgeMeters = 8) {
  const current = state.playerLngLat;
  const roadDistance = distanceToNearestRoad(current);
  state.app.dataset.roadDistance = Number.isFinite(roadDistance) ? roadDistance.toFixed(1) : '';
  if (roadDistance <= 4.5) return null;
  return state.buildingHitboxes
    .map((building, index) => ({
      building,
      index,
      edgeDistance: distanceToObstacleEdge(current, building),
      centerDistance: distanceMeters(current, building.center),
    }))
    .filter((entry) => (
      entry.edgeDistance <= maxEdgeMeters
      && !pointInObstacle(current, entry.building)
      && entry.centerDistance <= Math.max(90, entry.building.radius + maxEdgeMeters + 8)
    ))
    .sort((a, b) => a.edgeDistance - b.edgeDistance)[0] || null;
}

function nearestBuildingForInteraction(maxMeters = 42) {
  const current = state.playerLngLat;
  return state.buildingHitboxes
    .map((building, index) => ({
      building,
      index,
      edgeDistance: distanceToObstacleEdge(current, building),
      centerDistance: distanceMeters(current, building.center),
    }))
    .filter((entry) => (
      !pointInObstacle(current, entry.building)
      && (
        entry.edgeDistance <= maxMeters
        || entry.centerDistance <= Math.max(72, entry.building.radius + maxMeters)
      )
    ))
    .sort((a, b) => Math.min(a.edgeDistance, a.centerDistance) - Math.min(b.edgeDistance, b.centerDistance))[0] || null;
}

function buildingEntryToPoi(entry) {
  if (!entry) return null;
  const building = entry.building;
  const fallbackAddress = [building.center[1].toFixed(5), building.center[0].toFixed(5)].join(', ');
  return {
    name: building.properties?.name
      || building.properties?.address
      || building.properties?.full_address
      || [building.properties?.house_num || building.properties?.housenumber, building.properties?.street || building.properties?.street_name].filter(Boolean).join(' ')
      || fallbackAddress,
    type: 'building',
    lngLat: building.center,
    source: 'mapbox-building',
    properties: building.properties || {},
  };
}

function resolveInteractionTarget({ force = false } = {}) {
  if (!force && state.interactionTarget) return state.interactionTarget;
  const strictEntry = nearestInteractableBuilding(force ? 14 : 8);
  if (strictEntry) return buildingEntryToPoi(strictEntry);
  if (force) {
    const looseBuilding = nearestBuildingForInteraction(44);
    if (looseBuilding) return buildingEntryToPoi(looseBuilding);
    return nearestPoi(120);
  }
  return null;
}

function updateInteractionHint() {
  if (!state.app.classList.contains('is-ready')) return;
  const hint = document.getElementById('interaction-hint');
  const name = document.getElementById('interaction-name');
  const entry = nearestInteractableBuilding(8);
  if (!entry) {
    state.activeProximityTargetId = null;
    state.interactionTarget = null;
    if (hint) hint.hidden = true;
    return;
  }
  const poi = buildingEntryToPoi(entry);
  const targetId = poi.portalId || `${poi.source}:${poi.name}:${poi.lngLat[0].toFixed(5)}:${poi.lngLat[1].toFixed(5)}`;
  state.interactionTarget = poi;
  state.activeProximityTargetId = targetId;
  state.app.dataset.interactionEdgeDistance = entry.edgeDistance.toFixed(1);
  if (name) name.textContent = poi.name;
  if (hint) hint.hidden = false;
}

function interactWithNearestPoi({ silent = false, force = false } = {}) {
  updateInteractionHint();
  const poi = resolveInteractionTarget({ force });
  if (!poi) {
    if (silent) return;
    openDialogue('No nearby POI', 'System');
    document.getElementById('dialogue-body').textContent =
      '상호작용할 건물이나 가게가 너무 멉니다. 캐릭터를 건물/가게 쪽으로 더 붙인 뒤 Space를 누르세요.';
    return;
  }
  state.interactionTarget = poi;
  openPoiDialogue(poi);
}

function preloadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function packDirection() {
  return {
    down: 'south',
    up: 'north',
    left: 'west',
    right: 'east',
    'up-right': 'north-east',
    'down-right': 'south-east',
    'up-left': 'north-west',
    'down-left': 'south-west',
  }[state.sprite.direction] || 'south';
}

function packAnimationKey(kind) {
  const animations = state.sprite.pack?.frames?.animations || {};
  if (kind === 'walk') return Object.keys(animations).find((key) => key.startsWith('Walking'));
  if (kind === 'jump') return Object.keys(animations).find((key) => key.startsWith('Two-Footed_Jump'));
  if (kind === 'attack') {
    return Object.keys(animations).find((key) => key.startsWith('Cross_Punch'))
      || Object.keys(animations).find((key) => key.startsWith('Hurricane_Kick'));
  }
  return null;
}

function framePathForCurrentSprite() {
  const pack = state.sprite.pack;
  if (!pack?.frames) return null;
  const frameIndex = Math.floor(state.sprite.frame);
  const direction = packDirection();
  if (state.sprite.attacking > 0) {
    const key = packAnimationKey('attack');
    const frames = key ? pack.frames.animations?.[key]?.[direction] : null;
    if (frames?.length) return frames[Math.floor((240 - state.sprite.attacking) / 60) % frames.length];
  }
  if (state.sprite.jumpZ > 0 || state.sprite.flightZ > 1) {
    const key = packAnimationKey('jump');
    const frames = key ? pack.frames.animations?.[key]?.[direction] : null;
    if (frames?.length) return frames[Math.min(frames.length - 1, Math.floor(frameIndex / 4) % frames.length)];
  }
  if (state.sprite.moving) {
    const key = packAnimationKey('walk');
    const frames = key ? pack.frames.animations?.[key]?.[direction] : null;
    if (frames?.length) return frames[frameIndex % frames.length];
  }
  return pack.frames.rotations?.[direction] || pack.frames.rotations?.south || null;
}

async function loadMjePack() {
  const response = await fetch(`${MJE_PACK_BASE}metadata.json`, { cache: 'force-cache' });
  if (!response.ok) throw new Error('mje metadata missing');
  const metadata = await response.json();
  const paths = new Set(Object.values(metadata.frames?.rotations || {}));
  const animations = metadata.frames?.animations || {};
  ['Walking', 'Two-Footed_Jump', 'Cross_Punch', 'Hurricane_Kick'].forEach((prefix) => {
    const key = Object.keys(animations).find((animationKey) => animationKey.startsWith(prefix));
    if (!key) return;
    Object.values(animations[key]).flat().forEach((path) => paths.add(path));
  });
  const imageEntries = await Promise.all([...paths].map(async (path) => [path, await preloadImage(`${MJE_PACK_BASE}${path}`)]));
  state.sprite.pack = metadata;
  state.sprite.packImages = new Map(imageEntries);
  state.sprite.image = null;
  state.sprite.ready = true;
  state.app.dataset.spriteReady = 'true';
  state.app.dataset.spriteSource = `${MJE_PACK_BASE}metadata.json`;
  state.app.dataset.spritePack = 'mje-zip';
  state.app.dataset.spriteFrames = String(imageEntries.length);
  state.app.dataset.mjeMissing = 'false';
}

async function loadCharacterSprite(gender = state.profile?.gender || document.getElementById('gender')?.value || 'female') {
  if (USE_LOCAL_CHIBI_AVATAR) {
    state.sprite.image = null;
    state.sprite.ready = true;
    state.app.dataset.spriteReady = 'true';
    state.app.dataset.spriteGender = gender;
    state.app.dataset.spriteSource = 'local-maple-inspired-chibi';
    drawCharacterSprite();
    finishLoadingWhenReady();
    return;
  }
  state.sprite.ready = false;
  state.app.dataset.spriteReady = 'false';
  state.app.dataset.spriteGender = gender;
  try {
    await loadMjePack();
    drawCharacterSprite();
    finishLoadingWhenReady();
    return;
  } catch (error) {
    state.app.dataset.spritePack = 'fallback-sheet';
    state.app.dataset.spritePackError = error.message;
  }
  const candidates = CHARACTER_SPRITES[gender] || CHARACTER_SPRITES.female;
  let index = 0;

  function tryNextSprite() {
    const src = candidates[index];
    if (!src) {
      setBootStatus(`Missing ${gender} sprite asset. Add mje/male PNG files under assets/characters/.`);
      return;
    }
  const image = new Image();
  image.onload = () => {
    state.sprite.image = image;
    state.sprite.ready = true;
    state.app.dataset.spriteReady = 'true';
      state.app.dataset.spriteSource = src;
      state.app.dataset.mjeMissing = src.includes('/mje/') ? 'false' : 'true';
    drawCharacterSprite();
    finishLoadingWhenReady();
  };
  image.onerror = () => {
      index += 1;
      tryNextSprite();
  };
    image.src = src;
  }

  tryNextSprite();
}

async function toggleAvatarCamera() {
  if (state.camera.enabled) {
    stopAvatarCamera();
    return;
  }
  if (!navigator.mediaDevices?.getUserMedia) {
    openDialogue('Camera unavailable', 'System');
    document.getElementById('dialogue-body').textContent = 'This browser does not expose a local camera API.';
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 320 }, height: { ideal: 240 } },
      audio: false,
    });
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.srcObject = stream;
    await video.play();
    state.camera.stream = stream;
    state.camera.video = video;
    state.camera.enabled = true;
    state.sprite.expression = 'neutral';
    state.app.dataset.cameraExpression = 'neutral';
    state.app.dataset.cameraEnabled = 'true';
    document.getElementById('avatar-camera-toggle')?.classList.add('is-active');
    state.camera.expressionTimer = window.setInterval(updateCameraExpression, 450);
  } catch {
    openDialogue('Camera permission needed', 'System');
    document.getElementById('dialogue-body').textContent = 'Tap CAM again and allow camera access to mirror expression locally on the avatar.';
  }
}

function stopAvatarCamera() {
  state.camera.stream?.getTracks?.().forEach((track) => track.stop());
  if (state.camera.expressionTimer) window.clearInterval(state.camera.expressionTimer);
  state.camera.stream = null;
  state.camera.video = null;
  state.camera.enabled = false;
  state.sprite.expression = 'neutral';
  state.app.dataset.cameraEnabled = 'false';
  state.app.dataset.cameraExpression = 'neutral';
  document.getElementById('avatar-camera-toggle')?.classList.remove('is-active');
}

function updateCameraExpression() {
  const video = state.camera.video;
  if (!video?.videoWidth) return;
  const canvas = document.createElement('canvas');
  canvas.width = 48;
  canvas.height = 36;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  let brightness = 0;
  let contrast = 0;
  for (let index = 0; index < data.length; index += 4) {
    const value = (data[index] + data[index + 1] + data[index + 2]) / 3;
    brightness += value;
    contrast += Math.abs(value - 128);
  }
  const pixels = data.length / 4;
  brightness /= pixels;
  contrast /= pixels;
  const expression = brightness > 142 && contrast > 43 ? 'happy' : brightness < 82 ? 'serious' : contrast > 58 ? 'surprised' : 'neutral';
  state.sprite.expression = expression;
  state.app.dataset.cameraExpression = expression;
}

function refreshSpriteStatus() {
  const now = performance.now();
  const hudInterval = isMobilePerformanceMode() ? 500 : 160;
  if (now - state.lastHudDatasetAt > hudInterval) {
    state.lastHudDatasetAt = now;
    state.app.dataset.spriteReady = state.sprite.ready ? 'true' : 'false';
    state.app.dataset.playerLng = state.playerLngLat[0].toFixed(6);
    state.app.dataset.playerLat = state.playerLngLat[1].toFixed(6);
    state.app.dataset.spriteMoving = state.sprite.moving ? 'true' : 'false';
    state.app.dataset.spriteJump = state.sprite.jumpZ.toFixed(2);
    state.app.dataset.spriteFlight = state.sprite.flightZ.toFixed(2);
    state.app.dataset.dataMode = state.isFlying ? 'true' : 'false';
    state.app.dataset.dataModeDirection = state.dataModeDirection || '';
    state.app.dataset.spriteAttack = state.sprite.attacking > 0 ? 'true' : 'false';
    state.app.dataset.buildingHitboxes = String(state.buildingHitboxes.length);
    state.app.dataset.treeHitboxes = String(state.treeHitboxes.length);
    state.app.dataset.obstacles = String(state.obstacleFeatures.length);
    state.app.dataset.nearbyPois = String(state.nearbyPois.length);
    state.app.dataset.villagePois = String(state.villagePois.length);
    state.app.dataset.homeBuilding = state.homeBuilding ? 'true' : 'false';
    state.app.dataset.mount = state.activeMount;
    state.app.dataset.gold = String(state.currency.gold);
    state.app.dataset.gems = String(state.currency.gems);
    state.app.dataset.zoomLevel = String(state.zoomLevelIndex + 1);
    state.app.dataset.zoomValue = String(currentZoom());
    state.app.dataset.playMapProjection = cauldronRuntimeEnabledForCurrentRegion() ? 'cauldron-canvas' : 'globe';
    state.app.dataset.playMapZoom = String(currentCameraZoom().toFixed(2));
    updateEverPlanetCurve();
    state.app.dataset.minimapRadius = String(MINIMAP_RADIUS_LEVELS[state.zoomLevelIndex]?.radiusMeters || 0);
    state.app.dataset.minimapZoom = String(currentZoom());
  }
  if (state.sprite.canvas) {
    const visible = state.app.classList.contains('is-playing');
    state.sprite.canvas.classList.toggle('is-visible', visible);
    state.sprite.canvas.style.opacity = visible ? '1' : '0';
    state.sprite.canvas.style.visibility = visible ? 'visible' : 'hidden';
    state.sprite.canvas.style.zIndex = visible ? '80' : '16';
  }
  const nameplate = document.getElementById('avatar-nameplate');
  if (nameplate) nameplate.textContent = state.profile?.characterId || 'guest';
  drawCharacterSprite();
}

function updateEverPlanetCurve() {
  const width = window.innerWidth || 1280;
  const height = window.innerHeight || 720;
  const flightFactor = Math.min(1, state.sprite.flightZ / Math.max(1, FLIGHT_MAX_LIFT));
  const radius = Math.round(Math.max(520, Math.min(1300, width * 0.72 + height * 0.18)));
  const drop = Math.round((width * width + height * height) / (2 * radius * 18) + 92 + flightFactor * 26);
  const centerX = 50;
  const centerY = state.isFlying ? 58 : 55;
  state.app.style.setProperty('--curve-center-x', `${centerX}%`);
  state.app.style.setProperty('--curve-center-y', `${centerY}%`);
  state.app.style.setProperty('--curve-radius', `${radius}px`);
  state.app.style.setProperty('--curve-drop', `${drop}px`);
  state.app.style.setProperty('--curve-horizon-y', `${Math.max(16, 29 - drop / 18)}%`);
  state.app.style.setProperty('--curve-scale-y', `${(1 + drop / 900).toFixed(3)}`);
  state.app.dataset.everplanetCurve = 'player-centered-parabolic';
  state.app.dataset.curveRadius = String(radius);
  state.app.dataset.curveDrop = String(drop);
  const overlay = document.getElementById('everplanet-curve');
  if (overlay) overlay.style.opacity = state.app.classList.contains('is-playing') ? '1' : '0';
}

function resizeCharacterCanvas() {
  const canvas = state.sprite.canvas;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const scale = Math.min(window.devicePixelRatio || 1, isMobilePerformanceMode() ? 1.35 : 2);
  canvas.width = Math.max(1, Math.round(rect.width * scale));
  canvas.height = Math.max(1, Math.round(rect.height * scale));
  canvas.getContext('2d').setTransform(scale, 0, 0, scale, 0, 0);
}

function spriteDirectionRow() {
  return { down: 0, left: 1, right: 2, up: 3 }[state.sprite.direction] || 0;
}

function drawCharacterSprite() {
  const canvas = state.sprite.canvas;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.getBoundingClientRect().width;
  const height = canvas.getBoundingClientRect().height;
  ctx.clearRect(0, 0, width, height);
  if (!state.sprite.ready) return;
  if (state.sprite.pack) {
    drawMjePackSprite(ctx, width, height);
    return;
  }
  if (!state.sprite.image) {
    drawLocalChibiAvatar(ctx, width, height);
    return;
  }

  const image = state.sprite.image;
  const frameWidth = image.width / SPRITE_COLUMNS;
  const frameHeight = image.height / SPRITE_ROWS;
  const row = spriteDirectionRow();
  let frame = 0;
  if (state.sprite.attacking > 0) frame = 9 + Math.floor((240 - state.sprite.attacking) / 80) % 3;
  else if (state.sprite.jumpZ > 0) frame = state.sprite.jumps > 1 ? 7 : 6;
  else if (state.sprite.moving) frame = 3 + (Math.floor(state.sprite.frame) % 6);
  else frame = Math.floor(state.sprite.frame / 8) % 3;

  const jumpLift = Math.min(32, state.sprite.jumpZ);
  const jumpScale = state.sprite.jumpZ > 0 ? 0.94 : 1;
  const drawWidth = width * 0.84 * jumpScale;
  const drawHeight = height * 0.94 * jumpScale;
  const drawY = Math.max(2, height - drawHeight - jumpLift);
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,.45)';
  ctx.shadowBlur = state.sprite.jumpZ > 0 ? 7 : 12;
  ctx.shadowOffsetY = state.sprite.jumpZ > 0 ? 18 : 10;
  ctx.drawImage(
    image,
    frame * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    (width - drawWidth) / 2,
    drawY,
    drawWidth,
    drawHeight
  );
  const expressionFace = {
    neutral: '•‿•',
    happy: '^‿^',
    serious: '•︵•',
    surprised: 'o_o',
  }[state.sprite.expression || 'neutral'] || '•‿•';
  ctx.font = '900 13px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(255, 248, 220, .9)';
  ctx.fillStyle = state.sprite.expression === 'happy' ? '#ffcc4d' : state.sprite.expression === 'surprised' ? '#9be7ff' : '#2d2115';
  const faceX = width / 2;
  const faceY = Math.max(12, height * 0.30 - state.sprite.jumpZ * 0.25);
  ctx.strokeText(expressionFace, faceX, faceY);
  ctx.fillText(expressionFace, faceX, faceY);
  ctx.restore();
}

function drawMjePackSprite(ctx, width, height) {
  const framePath = framePathForCurrentSprite();
  const image = framePath ? state.sprite.packImages.get(framePath) : null;
  if (!image) return;
  state.app.dataset.spriteFramePath = framePath;
  state.app.dataset.spriteDirection = state.sprite.direction;
  const jumpLift = Math.min(32, state.sprite.jumpZ);
  const flightLift = state.sprite.flightZ;
  const totalLift = jumpLift + flightLift;
  const pulse = state.sprite.moving ? Math.sin(state.sprite.frame * 0.34) * 1.8 : Math.sin(state.sprite.frame * 0.08) * 0.8;
  const drawHeight = Math.min(height * 0.99, width * 1.20);
  const drawWidth = drawHeight * (image.width / image.height);
  const drawX = (width - drawWidth) / 2;
  const drawY = height - drawHeight + 24 - totalLift + pulse;
  const shadowY = height - 8 + totalLift * 0.72;
  const shadowScale = Math.max(0.20, 0.58 - totalLift / 150);

  ctx.save();
  ctx.save();
  ctx.globalAlpha = Math.max(0.14, 0.34 - totalLift / 250);
  ctx.filter = 'brightness(0) blur(1px)';
  ctx.translate(width / 2 - 10, shadowY - 18);
  ctx.rotate((275 * Math.PI) / 180);
  ctx.scale(1.06 * shadowScale, 0.38 * shadowScale);
  ctx.drawImage(image, -drawWidth / 2, -drawHeight + 42, drawWidth, drawHeight);
  ctx.restore();

  if (state.isFlying || flightLift > 1) {
    ctx.globalAlpha = 0.34;
    ctx.strokeStyle = '#7df0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(width / 2, drawY + drawHeight * 0.55, 30 + Math.sin(state.sprite.frame * 0.2) * 4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  ctx.shadowColor = 'rgba(0,0,0,.36)';
  ctx.shadowBlur = totalLift > 0 ? 5 : 10;
  ctx.shadowOffsetY = totalLift > 0 ? 8 : 5;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
  ctx.restore();
}

function drawLocalChibiAvatar(ctx, width, height) {
  const framePulse = Math.sin(state.sprite.frame * 0.28);
  const walkBob = state.sprite.moving ? framePulse * 2.2 : Math.sin(state.sprite.frame * 0.09) * 0.9;
  const jumpLift = Math.min(32, state.sprite.jumpZ);
  const flightLift = state.sprite.flightZ;
  const totalLift = jumpLift + flightLift;
  const centerX = width / 2;
  const groundY = height - 8;
  const baseY = groundY - totalLift + walkBob;
  const facing = state.sprite.direction === 'left' ? -1 : state.sprite.direction === 'right' ? 1 : 0;
  const attackReach = state.sprite.attacking > 0 ? 12 : 0;
  const bodyColor = state.isFlying ? '#78e0ff' : '#5d75ff';
  const trimColor = state.isFlying ? '#fff1a8' : '#ffd56b';
  const hairColor = '#2f1f18';
  const skinColor = '#ffd2a6';
  const eyeColor = state.sprite.expression === 'surprised' ? '#1b4068' : '#2a1b17';

  ctx.save();
  ctx.translate(centerX, baseY);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowColor = 'rgba(0,0,0,.46)';
  ctx.shadowBlur = totalLift > 0 ? 6 : 11;
  ctx.shadowOffsetY = totalLift > 0 ? 18 : 9;

  const shadowDistance = 5 + totalLift * 0.88;
  const shadowScale = Math.max(0.34, 1 - totalLift / 92);
  ctx.save();
  ctx.translate(0, shadowDistance);
  ctx.scale(shadowScale, Math.max(0.42, shadowScale * 0.78));
  ctx.fillStyle = `rgba(0,0,0,${Math.max(0.08, 0.28 - totalLift / 260)})`;
  ctx.beginPath();
  ctx.ellipse(0, 0, 27, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = '#22150f';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#3e2a24';
  ctx.beginPath();
  ctx.roundRect(-20, -41, 40, 42, 14);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = bodyColor;
  ctx.beginPath();
  ctx.roundRect(-17, -38, 34, 36, 12);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = trimColor;
  ctx.fillRect(-15, -23, 30, 5);

  if (state.isFlying || flightLift > 1) {
    const wingFlap = Math.sin(state.sprite.frame * 0.34) * 5;
    ctx.fillStyle = 'rgba(135, 232, 255, .72)';
    ctx.strokeStyle = 'rgba(255, 241, 168, .86)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(-24, -27 + wingFlap, 12, 23, -0.58, 0, Math.PI * 2);
    ctx.ellipse(24, -27 - wingFlap, 12, 23, 0.58, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  ctx.strokeStyle = '#22150f';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(-10, -3);
  ctx.lineTo(-16 - Math.max(0, -framePulse * 3), 9);
  ctx.moveTo(10, -3);
  ctx.lineTo(16 + Math.max(0, framePulse * 3), 9);
  ctx.stroke();

  ctx.lineWidth = 5;
  ctx.strokeStyle = '#2c211b';
  ctx.beginPath();
  ctx.moveTo(-7, 0);
  ctx.lineTo(-12, 16);
  ctx.moveTo(7, 0);
  ctx.lineTo(12, 16);
  ctx.stroke();

  ctx.translate(facing * 3, -72);
  ctx.fillStyle = skinColor;
  ctx.strokeStyle = '#22150f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(0, 0, 29, 27, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.ellipse(-3, -15, 28, 15, -0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.roundRect(-27, -12, 54, 15, 9);
  ctx.fill();

  ctx.fillStyle = eyeColor;
  ctx.beginPath();
  ctx.ellipse(-10 + facing * 2, -2, 3.3, state.sprite.expression === 'happy' ? 1.3 : 4.2, 0, 0, Math.PI * 2);
  ctx.ellipse(10 + facing * 2, -2, 3.3, state.sprite.expression === 'happy' ? 1.3 : 4.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7b342c';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const mouthY = state.sprite.expression === 'serious' ? 12 : 9;
  ctx.arc(0, mouthY, 7, state.sprite.expression === 'serious' ? Math.PI : 0, state.sprite.expression === 'serious' ? Math.PI * 2 : Math.PI);
  ctx.stroke();

  if (state.sprite.attacking > 0) {
    ctx.translate(-facing * 3, 72);
    ctx.strokeStyle = 'rgba(255, 230, 112, .92)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc((facing || 1) * (31 + attackReach), -42, 18, -1.4, 1.2);
    ctx.stroke();
  }
  ctx.restore();
}

function startAttack() {
  state.sprite.attacking = 240;
  const flash = document.getElementById('action-flash');
  if (flash) {
    flash.classList.remove('is-active');
    void flash.offsetWidth;
    flash.classList.add('is-active');
  }
}

function jumpPlayer() {
  if (state.sprite.jumps >= 2) return;
  state.sprite.jumpVelocity = state.sprite.jumps === 0 ? 260 : 205;
  state.sprite.jumps += 1;
}

function currentCameraZoom() {
  return CAMERA_ZOOM - (state.sprite.flightZ / FLIGHT_MAX_LIFT) * FLIGHT_CAMERA_ZOOM_OUT;
}

function syncPlayerMapPosition(forceVisualLoad = false) {
  renderCauldronRuntimeFrame();
  const now = performance.now();
  const cameraSyncMs = isMobilePerformanceMode() ? MOBILE_MAP_CAMERA_SYNC_MS : MAP_CAMERA_SYNC_MS;
  const shouldSyncCamera = forceVisualLoad || now - state.lastMapCameraSyncAt >= cameraSyncMs;
  if (!shouldSyncCamera) {
    updateInteractionHint();
    return;
  }
  const cameraZoom = currentCameraZoom();
  state.lastCameraZoom = cameraZoom;
  state.lastMapCameraSyncAt = now;
  if (state.map) {
    state.map.jumpTo({
      center: state.playerLngLat,
      zoom: cameraZoom,
      pitch: CAMERA_PITCH,
      bearing: CAMERA_BEARING,
    });
    addPlayerMarker(state.playerLngLat);
  }
  refreshVisibleWorldLayers(forceVisualLoad);
  updateInteractionHint();
  const shouldSyncMiniMap = !isMobilePerformanceMode() || forceVisualLoad || now - state.lastMinimapSyncAt > 700;
  if (state.minimap && shouldSyncMiniMap) {
    state.lastMinimapSyncAt = now;
    state.minimap.jumpTo({ center: state.playerLngLat, zoom: currentZoom() });
    addMiniMapMarker(state.playerLngLat);
  }
}

function moveOneStepForKey(code) {
  let east = 0;
  let north = 0;
  if (code === 'ArrowUp') north += 1;
  if (code === 'ArrowDown') north -= 1;
  if (code === 'ArrowRight') east += 1;
  if (code === 'ArrowLeft') east -= 1;
  if (!east && !north) return;
  const nextLngLat = offsetLngLat(state.playerLngLat, east * PLAYER_TAP_STEP_METERS, north * PLAYER_TAP_STEP_METERS);
  const moved = tryMovePlayer(nextLngLat);
  state.sprite.direction = vectorToDirection(east, north);
  state.sprite.moving = moved;
  state.sprite.frame = (state.sprite.frame + 1) % 72;
  syncPlayerMapPosition();
  refreshSpriteStatus();
}

function tickCharacter(now = performance.now()) {
  try {
    const dt = Math.min(0.05, (now - state.sprite.lastTick) / 1000);
    state.sprite.lastTick = now;

    let east = 0;
    let north = 0;
    if (state.keys.has('ArrowUp')) north += 1;
    if (state.keys.has('ArrowDown')) north -= 1;
    if (state.keys.has('ArrowRight')) east += 1;
    if (state.keys.has('ArrowLeft')) east -= 1;

    if (state.isFlying && (east || north)) {
      if (!state.dataModeDirection) state.dataModeDirection = vectorToDirection(east, north);
      const vector = directionVector(state.dataModeDirection);
      east = vector.east;
      north = vector.north;
      state.sprite.direction = state.dataModeDirection;
      state.app.dataset.dataModeDirection = state.dataModeDirection;
    }

    const moving = Boolean(east || north);
    state.sprite.moving = moving;
    if (moving) {
      const length = Math.hypot(east, north) || 1;
      const mountMultiplier = state.isFlying ? DATA_MODE_SPEED_MULTIPLIER : (MOUNT_SPEEDS[state.activeMount] || 1);
      const runMultiplier = state.isFlying ? 1 : (state.keys.has('ControlLeft') || state.keys.has('ControlRight') ? PLAYER_RUN_MULTIPLIER : 1);
      const speed = PLAYER_WALK_METERS_PER_SECOND * mountMultiplier * runMultiplier;
      const nextLngLat = offsetLngLat(state.playerLngLat, (east / length) * speed * dt, (north / length) * speed * dt);
      const moved = tryMovePlayer(nextLngLat);
      state.sprite.moving = moved;
      if (!state.isFlying) {
        state.sprite.direction = vectorToDirection(east, north);
      }
      state.sprite.frame = (state.sprite.frame + dt * SPRITE_WALK_FRAMES_PER_SECOND) % 72;
      if (moved) syncPlayerMapPosition();
    } else {
      state.sprite.frame = (state.sprite.frame + dt * SPRITE_IDLE_FRAMES_PER_SECOND) % 72;
    }

    state.sprite.jumpZ += state.sprite.jumpVelocity * dt;
    state.sprite.jumpVelocity -= 720 * dt;
    if (state.sprite.jumpZ <= 0) {
      state.sprite.jumpZ = 0;
      state.sprite.jumpVelocity = 0;
      state.sprite.jumps = 0;
    }
    const previousFlightZ = state.sprite.flightZ;
    const flightDelta = state.sprite.flightTarget - state.sprite.flightZ;
    state.sprite.flightZ += flightDelta * Math.min(1, dt * 4.8);
    if (Math.abs(flightDelta) < 0.35) state.sprite.flightZ = state.sprite.flightTarget;
    if (!moving && Math.abs(state.sprite.flightZ - previousFlightZ) > 0.55) syncPlayerMapPosition();
    state.sprite.attacking = Math.max(0, state.sprite.attacking - dt * 1000);
    refreshSpriteStatus();
  } catch (error) {
    setBootStatus(`Sprite loop error: ${error.message}`);
  }
  if (state.animationLoopRunning) {
    state.animationFrameId = requestAnimationFrame(tickCharacter);
  }
}

function startCharacterLoop() {
  if (state.animationLoopRunning) return;
  state.animationLoopRunning = true;
  state.sprite.lastTick = performance.now();
  state.animationFrameId = requestAnimationFrame(tickCharacter);
}

function stopCharacterLoop() {
  state.animationLoopRunning = false;
  if (state.animationFrameId !== null) cancelAnimationFrame(state.animationFrameId);
  state.animationFrameId = null;
}

function showPanel(id) {
  ['party-panel', 'inventory-panel', 'dialogue-panel', 'espil-panel'].forEach((panelId) => {
    const panel = document.getElementById(panelId);
    if (panel) panel.hidden = panelId !== id;
  });
}

function closePanel(id) {
  const panel = document.getElementById(id);
  if (panel) panel.hidden = true;
}

function showEspilPanel() {
  showPanel('espil-panel');
}

async function pingEspil() {
  const panel = document.getElementById('espil-panel');
  const body = panel?.querySelector('p');
  if (!body) return;
  body.textContent = 'Espil 상태 확인 중...';
  try {
    const response = await fetch('http://127.0.0.1:11434/api/tags');
    const payload = await response.json();
    const models = payload.models?.map((model) => model.name).join(', ') || '모델 없음';
    body.textContent = `Ollama 연결됨 · 사용 예정 모델: quadclipse/espil · 설치된 모델: ${models}`;
  } catch {
    body.textContent = 'Ollama가 아직 연결되지 않았습니다. 로컬에서 `ollama serve` 후 `ollama pull quadclipse/espil`을 준비하세요.';
  }
}

function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
  } catch {
    return null;
  }
}

function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

function saveHome(home) {
  localStorage.setItem(HOME_KEY, JSON.stringify(home));
  saveHomeBuilding(createHomeBuilding(home));
}

async function geocodeHomeAddress(address) {
  if (!address || !window.CAULDRON_STATIC_CONFIG?.mapboxToken) return null;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?limit=1&access_token=${encodeURIComponent(window.CAULDRON_STATIC_CONFIG.mapboxToken)}`;
  const response = await fetch(url);
  if (!response.ok) return null;
  const payload = await response.json();
  const center = payload.features?.[0]?.center;
  if (!Array.isArray(center)) return null;
  return { lngLat: center, label: payload.features[0].place_name || 'Home' };
}

async function goHome() {
  const saved = JSON.parse(localStorage.getItem(HOME_KEY) || 'null');
  if (saved?.lngLat) {
    saveHomeBuilding(createHomeBuilding(saved));
    movePlayerTo(saved.lngLat, saved.label || 'Home');
    return;
  }
  const address = state.profile?.homeAddress || homeAddress.value;
  if (!address) {
    openDialogue('Home anchor missing', 'System');
    return;
  }
  const geocoded = await geocodeHomeAddress(address);
  if (!geocoded) {
    openDialogue('Home geocode failed', 'System');
    return;
  }
  saveHome(geocoded);
  movePlayerTo(geocoded.lngLat, geocoded.label || 'Home');
}

function startGame(profile) {
  state.profile = profile;
  state.bootStartedAt = Date.now();
  state.mapLoaded = false;
  loadCharacterSprite(profile.gender);
  state.currentSpawn = SPAWN_POINTS[profile.spawnRegion] || SPAWN_POINTS.vancouver;
  state.playerLngLat = [...state.currentSpawn.lngLat];
  if (profile.spawnRegion === 'vancouver' && state.cauldronRuntime.ready) {
    snapPlayerToCauldronRoad();
  }
  state.mapFileReady = false;
  state.app.dataset.mapFileReady = 'false';
  if (profile.spawnRegion === 'vancouver' && state.cauldronRuntime.ready) {
    state.mapFileReady = true;
    state.app.dataset.mapFileReady = 'runtime-json';
  }
  state.homeBuilding = loadHomeBuilding() || createHomeBuilding({ lngLat: state.playerLngLat, label: profile.homeAddress || state.currentSpawn.label });
  saveHomeBuilding(state.homeBuilding);
  state.villagePois = [];
  saveProfile(profile);
  updateHudDatasets();
  startBgm();
  creator.classList.add('is-hidden');
  state.app.classList.remove('is-ready');
  state.app.classList.add('is-booting');
  state.app.classList.add('is-playing');
  setBootStatus(`Loading ${state.currentSpawn.label} within a ${MAP_RADIUS_KM}km play radius...`);
  initializeCauldronProductionRuntime().then((ready) => {
    if (!ready || profile.spawnRegion !== 'vancouver') return;
    snapPlayerToCauldronRoad();
    if (!state.mapLoaded) createMap(state.playerLngLat);
    renderCauldronRuntimeFrame();
    syncPlayerMapPosition(true);
    finishLoadingWhenReady();
  });
  if (profile.spawnRegion !== 'vancouver') {
    if (!state.map) createMap(state.currentSpawn.lngLat);
    else movePlayerTo(state.currentSpawn.lngLat, state.currentSpawn.label);
  }
  window.setTimeout(() => {
    state.mapLoaded = true;
    analyzeWorldFeatures();
    if (!state.nearbyPois.length && state.map) addFallbackTalkPoints();
    finishLoadingWhenReady();
  }, 6200);
}

function bindControls() {
  window.addEventListener('keydown', (event) => {
    const chatInput = document.getElementById('chat-input');
    if (event.target === chatInput) {
      if (event.code === 'Tab') {
        event.preventDefault();
        cycleChatChannel();
        return;
      }
      if (event.code === 'Enter') {
        event.preventDefault();
        sendChatFromInput(chatInput);
        blurChatComposer();
        return;
      }
      if (event.code === 'Escape') {
        event.preventDefault();
        blurChatComposer();
        return;
      }
      return;
    }
    if (event.target?.matches?.('input, textarea')) {
      return;
    }
    if (!state.app.classList.contains('is-playing') || !state.app.classList.contains('is-ready')) return;
    if (state.chatVisible && event.code === 'Enter') {
      event.preventDefault();
      focusChatComposer();
      return;
    }
    if (state.chatVisible && event.code === 'Tab') {
      event.preventDefault();
      cycleChatChannel();
      return;
    }
    if (dialogueIsOpen()) {
      if (['ArrowUp', 'ArrowLeft'].includes(event.code)) {
        event.preventDefault();
        if (event.repeat && Date.now() - state.dialogueArrowHeldSince > 500) {
          closePanel('dialogue-panel');
          return;
        }
        if (!event.repeat) state.dialogueArrowHeldSince = Date.now();
        moveDialogueSelection(-1);
        return;
      }
      if (['ArrowDown', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
        if (event.repeat && Date.now() - state.dialogueArrowHeldSince > 500) {
          closePanel('dialogue-panel');
          return;
        }
        if (!event.repeat) state.dialogueArrowHeldSince = Date.now();
        moveDialogueSelection(1);
        return;
      }
      if (event.code === 'Enter' || event.code === 'Space') {
        event.preventDefault();
        activateDialogueSelection();
        return;
      }
    }
    if (event.code === 'KeyW' && !document.getElementById('book-menu')?.hidden && state.travelTarget) {
      event.preventDefault();
      teleportToTravelTarget();
      return;
    }
    if (event.code === 'Escape') {
      event.preventDefault();
      const menu = document.getElementById('book-menu');
      if (menu && !menu.hidden) closeBookMenu();
      else openBookMenu('profile');
      return;
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
      state.keys.add(event.code);
      moveOneStepForKey(event.code);
      if (state.isFlying && !state.dataModeDirection) {
        state.dataModeDirection = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right',
        }[event.code];
        state.sprite.direction = state.dataModeDirection;
        state.app.dataset.dataModeDirection = state.dataModeDirection;
        refreshVisibleWorldLayers(true);
      }
      return;
    }
    const quickKey = event.key?.toUpperCase?.();
    const quickIndex = state.quickSlotKeys.indexOf(quickKey);
    if (quickIndex >= 0 && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
      event.preventDefault();
      if (quickKey === 'E' && !state.quickSlots[quickIndex]) {
        interactWithNearestPoi({ silent: true });
        return;
      }
      activateQuickSlot(quickIndex);
      return;
    }
    if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
      event.preventDefault();
      jumpPlayer();
      return;
    }
    if (event.code === 'Space') {
      event.preventDefault();
      interactWithNearestPoi({ force: true });
      return;
    }
  });
  window.addEventListener('keyup', (event) => {
    state.keys.delete(event.code);
  });
}

function setMobileDirectionFromPoint(event) {
  const pad = document.getElementById('mobile-dpad');
  if (!pad) return;
  const rect = pad.getBoundingClientRect();
  const x = (event.clientX ?? 0) - rect.left;
  const y = (event.clientY ?? 0) - rect.top;
  const centerX = rect.width / 2;
  const centerY = rect.height * 0.58;
  const dx = x - centerX;
  const dy = y - centerY;
  const nextKeys = new Set();
  if (Math.abs(dx) > 24 || Math.abs(dy) > 24) {
    if (Math.abs(dx) > 18) nextKeys.add(dx > 0 ? 'ArrowRight' : 'ArrowLeft');
    if (Math.abs(dy) > 18) nextKeys.add(dy > 0 ? 'ArrowDown' : 'ArrowUp');
  }
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach((code) => {
    if (nextKeys.has(code)) state.keys.add(code);
    else state.keys.delete(code);
  });
  state.app.dataset.mobileDirection = Array.from(nextKeys).join('+');
  document.querySelectorAll('[data-mobile-dir]').forEach((button) => {
    button.classList.toggle('is-pressed', nextKeys.has(button.dataset.mobileDir));
  });
}

function clearMobileDirection() {
  ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].forEach((code) => state.keys.delete(code));
  state.app.dataset.mobileDirection = '';
  document.querySelectorAll('[data-mobile-dir]').forEach((button) => button.classList.remove('is-pressed'));
}

function bindMobilePlayControls() {
  const pad = document.getElementById('mobile-dpad');
  if (pad) {
    pad.addEventListener('pointerdown', (event) => {
      if (!state.app.classList.contains('is-playing')) return;
      event.preventDefault();
      pad.setPointerCapture?.(event.pointerId);
      setMobileDirectionFromPoint(event);
    });
    pad.addEventListener('pointermove', (event) => {
      if (!state.app.classList.contains('is-playing')) return;
      if (!event.buttons && event.pointerType !== 'touch') return;
      event.preventDefault();
      setMobileDirectionFromPoint(event);
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
      pad.addEventListener(type, clearMobileDirection);
    });
  }
  document.querySelectorAll('[data-mobile-dir]').forEach((button) => {
    const code = button.dataset.mobileDir;
    button.addEventListener('pointerdown', (event) => {
      if (!state.app.classList.contains('is-playing')) return;
      event.preventDefault();
      state.keys.add(code);
      state.app.dataset.mobileDirection = code;
      button.classList.add('is-pressed');
    });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((type) => {
      button.addEventListener(type, (event) => {
        event.preventDefault();
        state.keys.delete(code);
        button.classList.remove('is-pressed');
      });
    });
  });
}

function bindUi() {
  creatorForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const profile = {
      gender: 'female',
      characterId: characterId.value.trim() || 'player_test',
      homeAddress: homeAddress.value.trim() || state.currentSpawn.label,
      spawnRegion: spawnRegion.value,
      authProvider: state.authProvider,
      createdAt: new Date().toISOString(),
      publishNotice: 'Unauthorized copying, scraping, resale, or redistribution is strictly prohibited.',
    };
    startGame(profile);
  });

  document.getElementById('party-toggle').addEventListener('click', showPartyPanel);
  document.getElementById('espil-toggle')?.addEventListener('click', showEspilPanel);
  document.getElementById('espil-fab')?.addEventListener('click', showEspilPanel);
  document.getElementById('espil-ping')?.addEventListener('click', pingEspil);
  document.getElementById('inventory-toggle').addEventListener('click', showInventoryPanel);
  document.getElementById('home-toggle').addEventListener('click', goHome);
  document.getElementById('map-file-download')?.addEventListener('click', downloadNavigationFile);
  document.getElementById('avatar-camera-toggle')?.addEventListener('click', toggleAvatarCamera);
  document.getElementById('chat-toggle')?.addEventListener('click', showChatPanel);
  document.getElementById('server-toggle')?.addEventListener('click', showServerPanel);
  document.getElementById('skill-toggle')?.addEventListener('click', showSkillPanel);
  document.getElementById('attack-toggle')?.addEventListener('click', startAttack);
  document.getElementById('party-invite')?.addEventListener('click', inviteNearbyToParty);
  document.getElementById('party-follow')?.addEventListener('click', togglePartyFollow);
  document.getElementById('party-chat')?.addEventListener('click', activatePartyChat);
  document.getElementById('book-close')?.addEventListener('click', closeBookMenu);
  document.querySelectorAll('[data-book-tab]').forEach((button) => {
    button.addEventListener('click', () => openBookMenu(button.dataset.bookTab));
  });
  document.getElementById('map')?.addEventListener('click', () => {
    if (state.app.classList.contains('is-playing')) openBookMenu('profile');
  });
  document.getElementById('chat-input')?.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      cycleChatChannel();
      return;
    }
    if (event.key !== 'Enter') return;
    event.preventDefault();
    sendChatFromInput(event.currentTarget);
    blurChatComposer();
  });
  document.querySelectorAll('[data-chat-channel]').forEach((button) => {
    button.addEventListener('click', () => {
      setChatChannel(button.dataset.chatChannel || 'channel');
      focusChatComposer();
    });
  });
  document.querySelectorAll('[data-auth-provider]').forEach((button) => {
    button.addEventListener('click', () => {
      state.authProvider = button.dataset.authProvider || 'guest';
      state.app.dataset.authProvider = state.authProvider;
      document.querySelectorAll('[data-auth-provider]').forEach((target) => {
        target.classList.toggle('is-active', target === button);
      });
      setBootStatus(`${button.textContent} sign-in selected. Real OAuth handoff will attach here.`);
    });
  });
  document.querySelectorAll('.quick-slot').forEach((button, index) => {
    button.addEventListener('click', () => activateQuickSlot(index));
  });
  document.getElementById('quickbar')?.addEventListener('click', (event) => {
    const button = event.target.closest?.('.quick-slot');
    if (!button) return;
    activateQuickSlot(Number(button.dataset.slot));
  });
  document.querySelectorAll('[data-mobile-slot]').forEach((button) => {
    button.addEventListener('click', () => activateQuickSlot(Number(button.dataset.mobileSlot)));
  });
  document.querySelector('[data-mobile-action="interact"]')?.addEventListener('click', () => interactWithNearestPoi({ force: true }));
  document.querySelector('[data-mobile-action="locate"]')?.addEventListener('click', startMobileLocationFollow);
  bindMobilePlayControls();
  document.getElementById('zoom-in')?.addEventListener('click', () => zoomMiniMap(-1));
  document.getElementById('zoom-out')?.addEventListener('click', () => zoomMiniMap(1));
  const toggleMinimapExpand = () => {
    document.getElementById('minimap-shell')?.classList.toggle('is-expanded');
    window.setTimeout(() => state.minimap?.resize?.(), 80);
  };
  const toggleChatExpand = () => {
    document.getElementById('chat-box')?.classList.toggle('is-expanded');
  };
  document.getElementById('minimap-expand')?.addEventListener('click', (event) => {
    event.stopPropagation();
    window.setTimeout(() => state.minimap?.resize?.(), 80);
  });
  document.getElementById('chat-expand')?.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleChatExpand();
  });
  document.addEventListener('click', (event) => {
    if (event.target?.id === 'minimap-expand') toggleMinimapExpand();
    if (event.target?.id === 'chat-expand') toggleChatExpand();
  });
  setZoomLevel(state.zoomLevelIndex);
  renderQuickSlots();
  document.querySelectorAll('[data-close]').forEach((button) => {
    button.addEventListener('click', () => closePanel(button.getAttribute('data-close')));
  });
}

function showBrowserEntry(existing) {
  state.app.classList.remove('is-booting', 'is-playing', 'is-ready');
  creator.classList.remove('is-hidden');
  if (existing?.characterId) characterId.value = existing.characterId;
  if (existing?.homeAddress) homeAddress.value = existing.homeAddress;
  gender.value = 'female';
  spawnRegion.value = existing?.spawnRegion || 'vancouver';
  setBootStatus('Tap Enter Cauldron to start the browser session.');
}

function boot() {
  initializeCauldronProductionRuntime();
  loadCharacterSprite();
  resizeCharacterCanvas();
  bindUi();
  bindControls();
  window.addEventListener('resize', resizeCharacterCanvas);
  const existing = loadProfile();
  const params = new URLSearchParams(window.location.search);
  const shouldAutoPlay = params.has('testenv') || params.has('playfix') || params.has('roadfix') || params.has('autoplay');
  if (shouldAutoPlay) {
    startGame(existing || {
      gender: 'female',
      characterId: 'player_test',
      homeAddress: SPAWN_POINTS.vancouver.label,
      spawnRegion: 'vancouver',
      authProvider: 'testenv',
      createdAt: new Date().toISOString(),
      publishNotice: 'Local Cauldron test profile.',
    });
    return;
  }
  showBrowserEntry(existing);
}

window.cauldronPublish = state;
try {
  boot();
  startCharacterLoop();
  window.setInterval(refreshSpriteStatus, 250);
  window.setInterval(updateQuickSlotCooldowns, 250);
} catch (error) {
  console.error(error);
  setBootStatus(`Boot error: ${error.message}`);
  state.app?.classList?.remove('is-booting');
}
