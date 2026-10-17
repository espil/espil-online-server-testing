(function initCauldronProductionRuntime(global) {
  'use strict';

  const CAULDRON_RUNTIME_VERSION = 'v0.3.1-production-wiring';
  const DEFAULT_CENTER = [-123.1207, 49.2827];
  const DEFAULT_CACHE_VERSION = 'cauldron-v0.3.1';
  const DEFAULT_SATELLITE_POSTERIZE_LEVELS = 6;
  const SATELLITE_TILE_PALETTE = [
    { id: 0, name: 'water', rgb: [145, 210, 238], spriteType: 'water', layer: 'ground', color: '#8bc8eb', walkable: false, blocked: true, swimmable: true, buildable: false },
    { id: 1, name: 'greenspace', rgb: [163, 220, 161], spriteType: 'park', layer: 'ground', color: '#a3dca1', walkable: true, blocked: false, swimmable: false, buildable: false },
    { id: 2, name: 'greenspace_light', rgb: [178, 234, 173], spriteType: 'park', layer: 'ground', color: '#b2eaad', walkable: true, blocked: false, swimmable: false, buildable: false },
    { id: 3, name: 'road', rgb: [190, 197, 216], spriteType: 'road', layer: 'ground', color: '#bec5d8', walkable: true, blocked: false, swimmable: false, buildable: false },
    { id: 4, name: 'building', rgb: [222, 218, 217], spriteType: 'building', layer: 'structure', color: '#dedad9', walkable: false, blocked: true, swimmable: false, buildable: false },
    { id: 5, name: 'land', rgb: [244, 240, 239], spriteType: 'terrain', layer: 'ground', color: '#f4f0ef', walkable: true, blocked: false, swimmable: false, buildable: true },
    { id: 6, name: 'commercial_land', rgb: [254, 236, 223], spriteType: 'terrain', layer: 'ground', color: '#feecdf', walkable: true, blocked: false, swimmable: false, buildable: true },
    { id: 7, name: 'medical_land', rgb: [244, 223, 223], spriteType: 'terrain', layer: 'ground', color: '#f4dfdf', walkable: true, blocked: false, swimmable: false, buildable: true },
    { id: 8, name: 'roof', rgb: [231, 215, 203], spriteType: 'building', layer: 'structure', color: '#e7d7cb', walkable: false, blocked: true, swimmable: false, buildable: false },
  ];

  class CoordinateEngine {
    constructor(center = DEFAULT_CENTER, metersPerPixel = 1) {
      this.center = center;
      this.metersPerPixel = metersPerPixel;
    }

    lngLatToLocal(point) {
      const latRad = this.center[1] * Math.PI / 180;
      return {
        xMeters: (point[0] - this.center[0]) * 111320 * Math.cos(latRad),
        yMeters: (point[1] - this.center[1]) * 110540,
      };
    }

    localToLngLat(point) {
      const latRad = this.center[1] * Math.PI / 180;
      return [
        this.center[0] + point.xMeters / (111320 * Math.cos(latRad)),
        this.center[1] + point.yMeters / 110540,
      ];
    }
  }

  class CollisionSystem {
    constructor(options = {}) {
      this.chunks = [];
      this.chunkByGrid = new Map();
      this.chunkSizeMeters = options.chunkSizeMeters || 50;
      this.warnedOutside = false;
      this.warnedMaskMissing = false;
      this.maskLoaded = false;
    }

    setChunks(chunks) {
      this.chunks = Array.isArray(chunks) ? chunks : [];
      this.chunkSizeMeters = inferChunkSize(this.chunks);
      this.chunkByGrid = new Map(this.chunks.map((chunk) => [
        gridKeyForPoint(chunk.localBounds.minX, chunk.localBounds.minY, this.chunkSizeMeters),
        chunk,
      ]));
      this.maskLoaded = this.chunks.some((chunk) => hasMask(chunk));
    }

    canStandAt(point) {
      const probe = this.debugProbe(point);
      if (!probe.hasChunk || !probe.hasMask) return false;
      return Boolean(probe.walkable && !probe.blocked);
    }

    canSwimAt(point) {
      const probe = this.debugProbe(point);
      if (!probe.hasChunk || !probe.hasMask) return false;
      return Boolean(probe.swimmable);
    }

    debugProbe(point) {
      const chunkId = gridKeyForPoint(point.xMeters, point.yMeters, this.chunkSizeMeters);
      const chunk = this.chunkByGrid.get(chunkId) || this.chunks.find((candidate) => pointInBounds(point, candidate.localBounds)) || null;
      if (!chunk) {
        if (!this.warnedOutside) {
          this.warnedOutside = true;
          console.warn('[Cauldron Collision] outside loaded chunks', point);
        }
        return {
          worldX: point.xMeters,
          worldY: point.yMeters,
          chunkId,
          localCellX: null,
          localCellY: null,
          hasChunk: false,
          hasMask: false,
          walkable: false,
          blocked: true,
          swimmable: false,
        };
      }
      if (!hasMask(chunk)) {
        if (!this.warnedMaskMissing) {
          this.warnedMaskMissing = true;
          console.error('[Cauldron Collision] chunk mask missing', chunk.chunkId);
        }
        return {
          worldX: point.xMeters,
          worldY: point.yMeters,
          chunkId: chunk.chunkId,
          localCellX: null,
          localCellY: null,
          hasChunk: true,
          hasMask: false,
          walkable: false,
          blocked: true,
          swimmable: false,
        };
      }
      const localCellX = Math.floor((point.xMeters - chunk.localBounds.minX) / chunk.masks.cellSizeMeters);
      const localCellY = Math.floor((point.yMeters - chunk.localBounds.minY) / chunk.masks.cellSizeMeters);
      return {
        worldX: point.xMeters,
        worldY: point.yMeters,
        chunkId: chunk.chunkId,
        localCellX,
        localCellY,
        hasChunk: true,
        hasMask: true,
        walkable: Boolean(chunk.masks.walkable?.[localCellY]?.[localCellX]),
        blocked: Boolean(chunk.masks.blocked?.[localCellY]?.[localCellX]),
        swimmable: Boolean(chunk.masks.swimmable?.[localCellY]?.[localCellX]),
      };
    }
  }

  class CauldronCanvas {
    constructor(options) {
      this.canvas = options.canvas;
      this.context = this.canvas.getContext('2d');
      this.maxDevicePixelRatio = options.maxDevicePixelRatio || 1.5;
      this.renderQuality = options.renderQuality || 'performance';
      this.scene = null;
      this.chunks = [];
      this.drawCallCount = 0;
      this.visibleObjectCount = 0;
      this.staticCacheBuilt = false;
      this.devicePixelRatio = 1;
      this.bounds = { minX: 0, minY: 0, maxX: 50, maxY: 50 };
      this.poleLocal = { xMeters: 0, yMeters: 0 };
      this.globeRadiusMeters = options.globeRadiusMeters || 1450;
      this.lastViewport = { width: 1, height: 1 };
      this.resizeToDisplaySize();
    }

    setScene(scene) {
      this.scene = scene;
      this.bounds = sceneBounds(scene?.renderCommands || []);
      this.staticCacheBuilt = false;
    }

    setChunks(chunks) {
      this.chunks = Array.isArray(chunks) ? chunks : [];
    }

    resizeToDisplaySize() {
      const rect = this.canvas.getBoundingClientRect();
      const width = Math.max(1, Math.round(rect.width || window.innerWidth || 1));
      const height = Math.max(1, Math.round(rect.height || window.innerHeight || 1));
      const ratio = Math.min(window.devicePixelRatio || 1, this.maxDevicePixelRatio);
      if (this.canvas.width === Math.round(width * ratio) && this.canvas.height === Math.round(height * ratio)) return false;
      this.devicePixelRatio = ratio;
      this.canvas.width = Math.round(width * ratio);
      this.canvas.height = Math.round(height * ratio);
      this.context.setTransform(ratio, 0, 0, ratio, 0, 0);
      this.staticCacheBuilt = false;
      return true;
    }

    drawFrame(options = {}) {
      this.resizeToDisplaySize();
      const startedAt = performance.now();
      const rect = this.canvas.getBoundingClientRect();
      const width = rect.width || window.innerWidth || 1;
      const height = rect.height || window.innerHeight || 1;
      this.lastViewport = { width, height };
      this.drawCallCount = 0;
      this.context.clearRect(0, 0, width, height);
      if (options.playerLocal) this.poleLocal = options.playerLocal;
      this.drawCommands(this.scene?.renderCommands || [], width, height);
      if (options.playerLocal) this.drawPlayer(options.playerLocal, width, height);
      const frameTimeMs = performance.now() - startedAt;
      return {
        frameTimeMs,
        fps: frameTimeMs > 0 ? 1000 / frameTimeMs : 0,
        drawCallCount: this.drawCallCount,
        visibleObjectCount: this.visibleObjectCount,
        renderMode: this.scene?.mode || 'unknown',
        staticCacheBuilt: true,
      };
    }

    drawCommands(commands, width, height) {
      const sorted = [...commands].sort(compareCommands);
      this.visibleObjectCount = sorted.length;
      for (const command of sorted) {
        this.drawCommand(command, width, height);
      }
      this.staticCacheBuilt = true;
    }

    drawCommand(command, width, height) {
      const points = (command.points || []).map((point) => this.toCanvas(point, width, height));
      if (!points.length) return;
      this.context.fillStyle = command.debugColor || '#888';
      this.context.strokeStyle = command.debugColor || '#888';
      this.context.lineWidth = command.layer === 'ground' ? 4 : 2;
      if (command.captureCell) {
        this.drawTerrainCell(command, points);
        return;
      }
      if (command.spriteType === 'road') {
        this.drawRoad(command, points, width, height);
        return;
      }
      if (command.vertical && command.spriteType === 'building') {
        this.drawExtrudedBuilding(command, points);
        return;
      }
      if (points.length === 1) {
        this.context.beginPath();
        this.context.arc(points[0].x, points[0].y, command.spriteType === 'tree' ? 5 : 4, 0, Math.PI * 2);
        this.context.fill();
        this.drawCallCount += 1;
        return;
      }
      this.context.beginPath();
      this.context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
      if (command.layer === 'ground' || command.layer === 'structure') {
        this.context.closePath();
        this.context.fill();
      }
      this.context.stroke();
      this.drawCallCount += 1;
    }

    drawTerrainCell(command, points) {
      this.context.save();
      this.context.globalAlpha = command.spriteType === 'building' ? 0.86 : 1;
      this.context.fillStyle = command.debugColor || '#8a806e';
      this.path(points);
      this.context.fill();
      if (command.spriteType === 'building' && command.vertical) {
        this.context.globalAlpha = 0.28;
        this.context.fillStyle = '#101116';
        const height = Math.min(28, Math.max(4, command.vertical.extrusion_height_units * 0.22));
        const top = points.map((point) => ({ x: point.x, y: point.y - height }));
        this.path(top);
        this.context.fill();
      }
      this.context.restore();
      this.drawCallCount += 1;
    }

    drawRoad(command, points, width, height) {
      const roadWidth = Math.max(34, Math.min(72, Math.min(width, height) * 0.075));
      const casingWidth = roadWidth + 9;
      const drawPolyline = () => {
        this.context.beginPath();
        this.context.moveTo(points[0].x, points[0].y);
        points.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
      };

      this.context.save();
      this.context.lineCap = 'round';
      this.context.lineJoin = 'round';
      this.context.strokeStyle = '#3a3430';
      this.context.lineWidth = casingWidth;
      drawPolyline();
      this.context.stroke();

      this.context.strokeStyle = command.debugColor || '#7c7f86';
      this.context.lineWidth = roadWidth;
      drawPolyline();
      this.context.stroke();

      this.context.setLineDash([18, 16]);
      this.context.strokeStyle = 'rgba(255, 238, 173, .78)';
      this.context.lineWidth = Math.max(3, roadWidth * 0.08);
      drawPolyline();
      this.context.stroke();
      this.context.restore();
      this.drawCallCount += 3;
    }

    drawExtrudedBuilding(command, points) {
      const height = Math.min(this.renderQuality === 'performance' ? 42 : 92, command.vertical.extrusion_height_units || 2);
      const top = points.map((point) => ({ x: point.x, y: point.y - height }));
      this.context.fillStyle = 'rgba(0,0,0,.22)';
      this.path(points);
      this.context.fill();
      this.context.fillStyle = command.debugColor || '#4a6274';
      this.context.globalAlpha = command.vertical.height_source === 'unknown' ? 0.48 : 0.72;
      this.path(top);
      this.context.fill();
      this.context.globalAlpha = 1;
      this.context.stroke();
      this.drawCallCount += 1;
    }

    drawPlayer(point, width, height) {
      const canvasPoint = this.toCanvas(point, width, height);
      this.context.fillStyle = '#ff4d6d';
      this.context.beginPath();
      this.context.arc(canvasPoint.x, canvasPoint.y, 7, 0, Math.PI * 2);
      this.context.fill();
      this.drawCallCount += 1;
    }

    path(points) {
      this.context.beginPath();
      this.context.moveTo(points[0].x, points[0].y);
      points.slice(1).forEach((point) => this.context.lineTo(point.x, point.y));
      this.context.closePath();
    }

    toCanvas(point, width, height) {
      const metersPerScreenPixel = Math.max(0.18, (this.scene?.terrain3d?.cellMeters || 62.5) / 42);
      const dx = point.xMeters - this.poleLocal.xMeters;
      const dy = point.yMeters - this.poleLocal.yMeters;
      const distanceSquared = dx * dx + dy * dy;
      const zDropMeters = distanceSquared / (2 * this.globeRadiusMeters);
      const horizonTilt = Math.max(-70, Math.min(70, dy / 34));
      return {
        x: width / 2 + dx / metersPerScreenPixel,
        y: height * 0.58 - dy / metersPerScreenPixel + zDropMeters / metersPerScreenPixel + horizonTilt,
        zDropMeters,
      };
    }

    projectPoint(point) {
      const viewport = this.lastViewport || { width: this.canvas.getBoundingClientRect().width || 1, height: this.canvas.getBoundingClientRect().height || 1 };
      return this.toCanvas(point, viewport.width, viewport.height);
    }
  }

  async function fetchJsonReport(path, cacheVersion = DEFAULT_CACHE_VERSION) {
    const url = `${path}${path.includes('?') ? '&' : '?'}v=${encodeURIComponent(cacheVersion)}`;
    const startedAt = performance.now();
    const report = {
      path,
      url,
      ok: false,
      status: 0,
      contentType: '',
      fetchTimeMs: 0,
      parseTimeMs: 0,
      parsed: false,
      error: null,
      json: null,
    };
    try {
      const response = await fetch(url, { cache: 'no-store' });
      report.status = response.status;
      report.contentType = response.headers.get('content-type') || '';
      report.fetchTimeMs = performance.now() - startedAt;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const parseStartedAt = performance.now();
      report.json = await response.json();
      report.parseTimeMs = performance.now() - parseStartedAt;
      report.parsed = true;
      report.ok = true;
    } catch (error) {
      report.error = error.message || String(error);
    }
    return report;
  }

  async function loadCauldronAssets(options) {
    const sceneReport = await fetchJsonReport(options.scenePath, options.cacheVersion);
    const chunkReport = await fetchJsonReport(options.chunkPath, options.cacheVersion);
    return {
      scene: sceneReport.json,
      chunk: chunkReport.json,
      sceneReport: summarizeSceneReport(sceneReport),
      chunkReport: summarizeChunkReport(chunkReport),
      ok: Boolean(sceneReport.ok && chunkReport.ok),
    };
  }

  async function loadMapCaptureTerrain(options) {
    const captureReport = await fetchJsonReport(options.capturePath, options.cacheVersion);
    if (!captureReport.ok || !captureReport.json) {
      return {
        ok: false,
        capture: null,
        scene: null,
        chunk: null,
        sceneReport: summarizeCaptureSceneReport(captureReport, null),
        chunkReport: summarizeCaptureChunkReport(captureReport, null),
      };
    }
    const capture = captureReport.json;
    const tileGridReport = options.gridPath
      ? await fetchJsonReport(options.gridPath, options.cacheVersion)
      : null;
    const terrain = tileGridReport?.ok && tileGridReport?.json
      ? buildTerrainFromTileGrid(capture, tileGridReport.json)
      : buildTerrainFromImage(
        capture,
        await loadImage(`${capture.imagePath}${capture.imagePath.includes('?') ? '&' : '?'}v=${encodeURIComponent(options.cacheVersion || DEFAULT_CACHE_VERSION)}`),
        options.gridSize || 96,
        options.posterizeLevels || DEFAULT_SATELLITE_POSTERIZE_LEVELS
      );
    return {
      ok: true,
      capture,
      tileGrid: tileGridReport?.ok ? tileGridReport.json : null,
      scene: terrain.scene,
      chunk: terrain.chunk,
      sceneReport: summarizeCaptureSceneReport(captureReport, terrain),
      chunkReport: summarizeCaptureChunkReport(captureReport, terrain),
    };
  }

  function buildTerrainFromImage(capture, image, gridSize = 128, posterizeLevels = DEFAULT_SATELLITE_POSTERIZE_LEVELS) {
    const sourceCanvas = document.createElement('canvas');
    sourceCanvas.width = image.naturalWidth || image.width;
    sourceCanvas.height = image.naturalHeight || image.height;
    const context = sourceCanvas.getContext('2d', { willReadFrequently: true });
    context.drawImage(image, 0, 0, sourceCanvas.width, sourceCanvas.height);
    const data = context.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
    const diameter = capture.diameterMeters || (capture.radiusMeters || 3000) * 2;
    const half = diameter / 2;
    const cellMeters = diameter / gridSize;
    const sourceCellWidth = sourceCanvas.width / gridSize;
    const sourceCellHeight = sourceCanvas.height / gridSize;
    const masks = {
      chunkId: 'capture_000_000',
      cellSizeMeters: cellMeters,
      width: gridSize,
      height: gridSize,
      walkable: createGrid(gridSize, gridSize, false),
      blocked: createGrid(gridSize, gridSize, false),
      swimmable: createGrid(gridSize, gridSize, false),
      buildable: createGrid(gridSize, gridSize, false),
    };
    const counts = { terrain: 0, road: 0, water: 0, park: 0, building: 0 };
    const tileMatrix = [];
    const sourceColorMatrix = [];
    const posterizedColorMatrix = [];

    for (let y = 0; y < gridSize; y += 1) {
      const row = [];
      const sourceRow = [];
      const posterizedRow = [];
      for (let x = 0; x < gridSize; x += 1) {
        const averaged = averageSourceBlock(
          data,
          sourceCanvas.width,
          sourceCanvas.height,
          Math.floor(x * sourceCellWidth),
          Math.floor(y * sourceCellHeight),
          Math.max(1, Math.ceil(sourceCellWidth)),
          Math.max(1, Math.ceil(sourceCellHeight))
        );
        const posterized = posterizeColor(averaged, posterizeLevels);
        const tile = closestSatelliteTile(posterized);
        row.push(tile.id);
        sourceRow.push(averaged.slice(0, 3));
        posterizedRow.push(posterized.slice(0, 3));
        counts[tile.spriteType] += 1;
        masks.walkable[y][x] = tile.walkable;
        masks.blocked[y][x] = tile.blocked;
        masks.swimmable[y][x] = tile.swimmable;
        masks.buildable[y][x] = tile.buildable;
      }
      tileMatrix.push(row);
      sourceColorMatrix.push(sourceRow);
      posterizedColorMatrix.push(posterizedRow);
    }

    return buildTerrainFromTileMatrix(capture, {
      gridSize,
      tileMatrix,
      counts,
      sourceImageSize: [sourceCanvas.width, sourceCanvas.height],
      posterizeLevels,
      sourceColorMatrix,
      posterizedColorMatrix,
      conversionModel: 'satellite-png-posterize-downsample-v0.3',
    });
  }

  function buildTerrainFromTileGrid(capture, tileGrid) {
    return buildTerrainFromTileMatrix(capture, {
      gridSize: tileGrid.gridSize || tileGrid.tileMatrix?.length || 128,
      tileMatrix: tileGrid.tileMatrix || [],
      counts: tileGrid.counts || null,
      sourceImageSize: tileGrid.sourceImageSize || capture.sizePixels || [1280, 1280],
      posterizeLevels: tileGrid.posterizeLevels || DEFAULT_SATELLITE_POSTERIZE_LEVELS,
      sourceColorMatrix: tileGrid.sourceColorMatrix || null,
      posterizedColorMatrix: tileGrid.posterizedColorMatrix || null,
      conversionModel: tileGrid.conversionModel || tileGrid.schema || 'satellite-tile-grid-v0.1',
    });
  }

  function buildTerrainFromTileMatrix(capture, tileGrid) {
    const gridSize = tileGrid.gridSize || 128;
    const diameter = capture.diameterMeters || (capture.radiusMeters || 3000) * 2;
    const half = diameter / 2;
    const cellMeters = diameter / gridSize;
    const counts = tileGrid.counts || { terrain: 0, road: 0, water: 0, park: 0, building: 0 };
    const computedCounts = !tileGrid.counts;
    const masks = {
      chunkId: 'capture_000_000',
      cellSizeMeters: cellMeters,
      width: gridSize,
      height: gridSize,
      walkable: createGrid(gridSize, gridSize, false),
      blocked: createGrid(gridSize, gridSize, false),
      swimmable: createGrid(gridSize, gridSize, false),
      buildable: createGrid(gridSize, gridSize, false),
    };
    const renderCommands = [];

    for (let y = 0; y < gridSize; y += 1) {
      const row = tileGrid.tileMatrix?.[y] || [];
      for (let x = 0; x < gridSize; x += 1) {
        const tileId = Number.isFinite(row[x]) ? row[x] : 5;
        const tile = SATELLITE_TILE_PALETTE.find((entry) => entry.id === tileId) || SATELLITE_TILE_PALETTE[5];
        if (computedCounts) counts[tile.spriteType] += 1;
        masks.walkable[y][x] = tile.walkable;
        masks.blocked[y][x] = tile.blocked;
        masks.swimmable[y][x] = tile.swimmable;
        masks.buildable[y][x] = tile.buildable;
        const minX = -half + x * cellMeters;
        const maxX = minX + cellMeters;
        const maxY = half - y * cellMeters;
        const minY = maxY - cellMeters;
        const posterizedColor = tileGrid.posterizedColorMatrix?.[y]?.[x] || tile.rgb;
        const sourceColor = tileGrid.sourceColorMatrix?.[y]?.[x] || tile.rgb;
        renderCommands.push({
          id: `capture:${x}:${y}`,
          objectId: `capture:${x}:${y}`,
          spriteType: tile.spriteType,
          layer: tile.layer,
          styleKey: `capture_${tile.name}`,
          debugColor: tile.color,
          localBounds: { minX, minY, maxX, maxY },
          points: [
            { xMeters: minX, yMeters: minY },
            { xMeters: maxX, yMeters: minY },
            { xMeters: maxX, yMeters: maxY },
            { xMeters: minX, yMeters: maxY },
          ],
          blocked: tile.blocked,
          captureCell: true,
          tileId: tile.id,
          sourceColor,
          posterizedColor,
          vertical: tile.spriteType === 'building' ? estimatedBuildingVertical(posterizedColor[0], posterizedColor[1], posterizedColor[2]) : undefined,
        });
      }
    }

    const chunk = {
      chunkId: 'capture_000_000',
      bbox: {
        west: capture.center[0] - 0.04,
        south: capture.center[1] - 0.04,
        east: capture.center[0] + 0.04,
        north: capture.center[1] + 0.04,
      },
      localBounds: { minX: -half, minY: -half, maxX: half, maxY: half },
      features: [],
      masks,
      renderCommands,
      captureStats: counts,
    };
    const scene = {
      sceneId: `${slugify(capture.city || 'city')}_capture_terrain3d`,
      center: capture.center,
      metersPerPixel: capture.metersPerPixel || cellMeters,
      mode: 'verticalData',
      source: 'mapbox-capture-png-terrain',
      capture,
      renderCommands,
      debugPalette: {
        terrain: '#b7a78d',
        road: '#b9b6ae',
        water: '#5e9dd1',
        park: '#84bf6f',
        building: '#c6bcae',
      },
      terrain3d: {
        gridSize,
        cellMeters,
        sourceImageSize: tileGrid.sourceImageSize || capture.sizePixels || [1280, 1280],
        posterizeLevels: tileGrid.posterizeLevels || DEFAULT_SATELLITE_POSTERIZE_LEVELS,
        tileLegend: SATELLITE_TILE_PALETTE.map((tile) => ({ id: tile.id, name: tile.name, rgb: tile.rgb, spriteType: tile.spriteType })),
        tileMatrix: tileGrid.tileMatrix,
        sourceColorMatrix: tileGrid.sourceColorMatrix || undefined,
        posterizedColorMatrix: tileGrid.posterizedColorMatrix || undefined,
        conversionModel: tileGrid.conversionModel || 'satellite-png-posterize-downsample-v0.3',
        heightModel: 'satellite-png-posterize-downsample-v0.3',
        counts,
      },
    };
    return { scene, chunk, counts };
  }

  function averageSourceBlock(data, width, height, startX, startY, blockWidth, blockHeight) {
    let red = 0;
    let green = 0;
    let blue = 0;
    let alpha = 0;
    let samples = 0;
    const endX = Math.min(width, startX + blockWidth);
    const endY = Math.min(height, startY + blockHeight);
    const stepX = Math.max(1, Math.floor(blockWidth / 6));
    const stepY = Math.max(1, Math.floor(blockHeight / 6));
    for (let y = startY; y < endY; y += stepY) {
      for (let x = startX; x < endX; x += stepX) {
        const offset = (y * width + x) * 4;
        red += data[offset];
        green += data[offset + 1];
        blue += data[offset + 2];
        alpha += data[offset + 3];
        samples += 1;
      }
    }
    if (!samples) return [0, 0, 0, 0];
    return [
      Math.round(red / samples),
      Math.round(green / samples),
      Math.round(blue / samples),
      Math.round(alpha / samples),
    ];
  }

  function posterizeColor(color, levels = 6) {
    const step = 255 / Math.max(1, levels - 1);
    return color.map((value, index) => (index === 3 ? value : Math.max(0, Math.min(255, Math.round(Math.round(value / step) * step)))));
  }

  function closestSatelliteTile(color) {
    const tile = SATELLITE_TILE_PALETTE
      .map((entry) => ({
        entry,
        distance: squaredDistance(color, entry.rgb),
      }))
      .sort((left, right) => left.distance - right.distance)[0]?.entry;
    return tile || SATELLITE_TILE_PALETTE[5];
  }

  function squaredDistance(color, target) {
    return ((color[0] - target[0]) ** 2) + ((color[1] - target[1]) ** 2) + ((color[2] - target[2]) ** 2);
  }

  function estimatedBuildingVertical(red, green, blue) {
    const darkness = 255 - ((red + green + blue) / 3);
    const height = Math.round(8 + Math.max(0, Math.min(1, darkness / 90)) * 34);
    return {
      height_meters: height,
      height_source: 'estimated',
      building_levels: null,
      floor_height_meters: 3.2,
      extrusion_height_units: height,
      min_height_meters: 0,
    };
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error(`Image load failed: ${src}`));
      image.src = src;
    });
  }

  function summarizeCaptureSceneReport(report, terrain) {
    return {
      path: report.path,
      status: report.status,
      contentType: report.contentType,
      parsed: report.parsed,
      error: report.error,
      renderMode: 'verticalData',
      objectCount: terrain?.scene?.renderCommands?.length || 0,
      hasVerticalBuildings: Boolean(terrain?.counts?.building),
      source: 'mapbox-capture-png-terrain',
      terrainCounts: terrain?.counts || null,
    };
  }

  function summarizeCaptureChunkReport(report, terrain) {
    return {
      path: report.path,
      status: report.status,
      contentType: report.contentType,
      parsed: report.parsed,
      error: report.error,
      chunkId: terrain?.chunk?.chunkId || null,
      objectCount: terrain?.chunk?.renderCommands?.length || 0,
      maskDimensions: terrain?.chunk?.masks ? `${terrain.chunk.masks.width}x${terrain.chunk.masks.height}` : null,
      collisionMaskLoaded: hasMask(terrain?.chunk),
    };
  }

  function summarizeSceneReport(report) {
    return {
      path: report.path,
      status: report.status,
      contentType: report.contentType,
      parsed: report.parsed,
      error: report.error,
      fetchTimeMs: Math.round(report.fetchTimeMs),
      parseTimeMs: Math.round(report.parseTimeMs),
      renderMode: report.json?.mode || null,
      objectCount: report.json?.renderCommands?.length || 0,
      hasVerticalBuildings: Boolean(report.json?.renderCommands?.some((command) => command.vertical)),
    };
  }

  function summarizeChunkReport(report) {
    return {
      path: report.path,
      status: report.status,
      contentType: report.contentType,
      parsed: report.parsed,
      error: report.error,
      fetchTimeMs: Math.round(report.fetchTimeMs),
      parseTimeMs: Math.round(report.parseTimeMs),
      chunkId: report.json?.chunkId || null,
      objectCount: report.json?.renderCommands?.length || 0,
      maskDimensions: report.json?.masks ? `${report.json.masks.width}x${report.json.masks.height}` : null,
      collisionMaskLoaded: hasMask(report.json),
    };
  }

  function compareCommands(a, b) {
    const bandDelta = renderBand(a) - renderBand(b);
    if (bandDelta) return bandDelta;
    if (a.spriteType === 'building' && b.spriteType === 'building') {
      return (-a.localBounds.minY) - (-b.localBounds.minY);
    }
    return 0;
  }

  function renderBand(command) {
    if (command.spriteType === 'terrain') return 0;
    if (command.layer === 'ground' || ['water', 'road', 'park'].includes(command.spriteType)) return 1;
    if (command.layer === 'ecosystem' || command.spriteType === 'tree') return 2;
    if (command.layer === 'structure' || command.spriteType === 'building') return 3;
    return 5;
  }

  function sceneBounds(commands) {
    const bounds = commands.reduce((acc, command) => ({
      minX: Math.min(acc.minX, command.localBounds?.minX ?? 0),
      minY: Math.min(acc.minY, command.localBounds?.minY ?? 0),
      maxX: Math.max(acc.maxX, command.localBounds?.maxX ?? 50),
      maxY: Math.max(acc.maxY, command.localBounds?.maxY ?? 50),
    }), { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    if (!Number.isFinite(bounds.minX)) return { minX: 0, minY: 0, maxX: 50, maxY: 50 };
    return bounds;
  }

  function hasMask(chunk) {
    return Boolean(chunk?.masks?.walkable && chunk?.masks?.blocked && chunk?.masks?.swimmable);
  }

  function inferChunkSize(chunks) {
    const first = chunks[0];
    if (!first) return 50;
    return Math.max(1, first.localBounds.maxX - first.localBounds.minX);
  }

  function gridKeyForPoint(xMeters, yMeters, chunkSizeMeters) {
    return `${Math.floor(xMeters / chunkSizeMeters)},${Math.floor(yMeters / chunkSizeMeters)}`;
  }

  function pointInBounds(point, bounds) {
    return Boolean(bounds
      && point.xMeters >= bounds.minX
      && point.xMeters < bounds.maxX
      && point.yMeters >= bounds.minY
      && point.yMeters < bounds.maxY);
  }

  function createGrid(width, height, value) {
    return Array.from({ length: height }, () => Array.from({ length: width }, () => value));
  }

  function slugify(value) {
    return String(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'city';
  }

  global.CauldronProductionRuntime = {
    CAULDRON_RUNTIME_VERSION,
    CoordinateEngine,
    CollisionSystem,
    CauldronCanvas,
    fetchJsonReport,
    loadCauldronAssets,
    loadMapCaptureTerrain,
  };
})(window);
