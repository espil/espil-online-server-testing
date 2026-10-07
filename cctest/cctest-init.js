/**
 * cctest-init.js
 * 
 * Production initializer for the MapleStory 2-style character customizer.
 * Binds CustomizerUI to the HTML layout, auto-generates grids from items.json,
 * and keeps UI state in sync with the 3D character.
 * 
 * No global namespace pollution — everything wrapped in an IIFE.
 * Exposes only `window.EspilCustomizer` for debugging.
 * 
 * Load order:
 *   <script src="three.min.js"></script>
 *   <script src="GLTFLoader.js"></script>
 *   <script src="CharacterCustomizer.js"></script>
 *   <script src="CustomizerUI.js"></script>
 *   <script src="cctest-init.js"></script>
 */
(function() {
  'use strict';

  // ============================================================
  // CONFIG
  // ============================================================
  const CONFIG = {
    glbUrl: 'https://raw.githubusercontent.com/espil/espil-online/main/cctest/sprites3d/running.glb',
    itemsUrl: 'items.json',
    // Sub-mesh names in the GLB for texture layers
    meshNames: { face: 'Head', top: 'Torso', bottom: 'Legs' },
    // Grid container IDs per layer (must exist in HTML)
    gridContainers: {
      face: 'grid-face',
      hair: 'grid-hair',
      hat: 'grid-hat',
      top: 'grid-top',
      bottom: 'grid-bottom',
      cape: 'grid-cape',
    },
    // Tab button -> layer mapping
    tabs: {
      'tab-face': ['face'],
      'tab-hair': ['hair', 'hat'],
      'tab-outfit': ['top', 'bottom', 'cape'],
      'tab-ai': [],
    },
    useMockAI: true,
  };

  // ============================================================
  // STATE
  // ============================================================
  const state = {
    customizer: null,
    ui: null,
    renderer: null,
    scene: null,
    camera: null,
    character: null,
    clock: null,
  };

  // ============================================================
  // 3D SCENE SETUP
  // ============================================================
  function initScene() {
    const canvas = document.getElementById('c3d');
    if (!canvas) throw new Error('#c3d canvas not found');

    state.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x1e1e2e);

    state.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    state.camera.position.set(0, 1.3, 4.2);
    state.camera.lookAt(0, 0.85, 0);

    const key = new THREE.DirectionalLight(0xffffff, 1.1);
    key.position.set(4, 8, 6);
    state.scene.add(key);
    state.scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    const rim = new THREE.DirectionalLight(0x88aaff, 0.4);
    rim.position.set(-5, 4, -6);
    state.scene.add(rim);

    state.clock = new THREE.Clock();

    // Drag-to-rotate
    let targetRotY = 0, rotY = 0, dragging = false, lastX = 0;
    canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
    window.addEventListener('pointermove', e => {
      if (!dragging) return;
      targetRotY += (e.clientX - lastX) * 0.012;
      lastX = e.clientX;
    });
    window.addEventListener('pointerup', () => dragging = false);
    // Auto-rotate when idle
    let idleTimer = null;
    const resetIdle = () => { clearTimeout(idleTimer); idleTimer = setTimeout(() => { if (!dragging) targetRotY += Math.PI * 2; }, 8000); };
    canvas.addEventListener('pointerdown', resetIdle);
    resetIdle();

    state._rot = { get y() { return rotY; }, set y(v) { rotY = v; }, target: null };
    state._getTargetRot = () => targetRotY;
    state._setTargetRot = v => targetRotY = v;

    function resize() {
      const stage = document.getElementById('stage');
      if (!stage) return;
      const w = stage.clientWidth, h = stage.clientHeight;
      if (w === 0 || h === 0) return;
      state.renderer.setSize(w, h, false);
      state.camera.aspect = w / h;
      state.camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', resize);

    state._resize = resize;
    state._animate = function() {
      requestAnimationFrame(state._animate);
      resize();
      const t = state._getTargetRot();
      state._rot.y += (t - state._rot.y) * 0.08;
      if (state.character) {
        state.character.rotation.y = state._rot.y;
        state.character.position.y = Math.sin(state.clock.getElapsedTime() * 2.2) * 0.025;
      }
      state.renderer.render(state.scene, state.camera);
    };
  }

  // ============================================================
  // CHARACTER LOAD
  // ============================================================
  async function loadCharacter() {
    const gltf = await new Promise((resolve, reject) => {
      new THREE.GLTFLoader().load(CONFIG.glbUrl, resolve, undefined, reject);
    });
    state.character = gltf.scene;
    state.scene.add(state.character);

    const box = new THREE.Box3().setFromObject(state.character);
    const center = box.getCenter(new THREE.Vector3());
    state.character.position.sub(center);

    // Soft idle: play first animation paused at a neutral frame
    if (gltf.animations.length > 0) {
      const mixer = new THREE.AnimationMixer(state.character);
      const action = mixer.clipAction(gltf.animations[0]);
      action.play();
      mixer.setTime(0.15);
      mixer.update(0);
      action.paused = true;
    }
    return state.character;
  }

  // ============================================================
  // GRID GENERATION
  // ============================================================

  /**
   * Build MapleStory-style grid buttons for every layer.
   * Each button: <button class="slot" data-equip="..." data-layer="...">
   *   <span class="slot-icon"></span><span class="slot-name">...</span>
   * </button>
   */
  function buildAllGrids() {
    const c = state.customizer;
    for (const [layer, containerId] of Object.entries(CONFIG.gridContainers)) {
      const container = document.getElementById(containerId);
      if (!container) continue;
      const items = c.getItemsByLayer(layer);
      container.innerHTML = '';

      // "None" option for optional layers
      if (['hat', 'cape'].includes(layer)) {
        container.appendChild(makeSlotButton({ id: `__none_${layer}`, name: '없음', layer }, true));
      }

      for (const item of items) {
        container.appendChild(makeSlotButton(item, false));
      }
    }
    syncActiveStates();
  }

  function makeSlotButton(item, isNone) {
    const btn = document.createElement('button');
    btn.className = 'slot' + (isNone ? ' slot-none' : '');
    btn.dataset.layer = item.layer;
    if (!isNone) btn.dataset.equip = item.id;
    else btn.dataset.unequip = item.layer;

    // Icon: color dot for texture items, generic glyph for prefabs
    const iconHtml = item.textureUrl
      ? `<span class="slot-icon slot-icon-tex" data-item="${item.id}"></span>`
      : `<span class="slot-icon slot-icon-3d">${iconFor(item.layer)}</span>`;

    btn.innerHTML = `${iconHtml}<span class="slot-name">${escapeHtml(item.name)}</span>`;

    btn.addEventListener('click', async () => {
      btn.classList.add('busy');
      try {
        if (isNone) {
          state.customizer.unequipLayer(item.layer);
          // If unequipping hat that hid hair, restore hair visibility
          if (item.layer === 'hat') state.customizer.setLayerVisible('hair', true);
        } else {
          await state.customizer.equip(item.id);
        }
        syncActiveStates();
      } catch (err) {
        console.error('[init] equip failed:', err);
      } finally {
        btn.classList.remove('busy');
      }
    });
    return btn;
  }

  function iconFor(layer) {
    return { hair: '💇', hat: '🎩', cape: '🦸', face: '🙂', top: '👕', bottom: '👖' }[layer] || '✨';
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  // ============================================================
  // ASYNC STATE SYNCHRONIZATION
  // ============================================================

  /**
   * Reflect customizer.equipped in the UI: mark matching slots .active,
   * clear others. Called after equip, preset load, and AI apply.
   */
  function syncActiveStates() {
    const equipped = state.customizer.equipped; // Map<layer, itemId>
    document.querySelectorAll('#panel .slot').forEach(slot => {
      const layer = slot.dataset.layer;
      const itemId = slot.dataset.equip;
      const isNoneBtn = slot.hasAttribute('data-unequip');
      const equippedId = equipped.get(layer);
      const isActive = isNoneBtn ? !equippedId : (itemId && itemId === equippedId);
      slot.classList.toggle('active', !!isActive);
      slot.classList.toggle('selected', !!isActive);
    });
  }

  /**
   * Smoothly fade the AI status message out and reset the button.
   */
  function fadeAIStatus() {
    const statusEl = document.getElementById('ai-status');
    const genBtn = document.getElementById('ai-generate');
    if (!statusEl) return;
    statusEl.classList.add('fade-out');
    setTimeout(() => {
      statusEl.textContent = '';
      statusEl.dataset.status = '';
      statusEl.classList.remove('fade-out');
      if (genBtn) {
        genBtn.disabled = false;
        genBtn.classList.remove('busy');
        genBtn.textContent = genBtn.dataset.label || '생성하기';
      }
    }, 600);
  }

  // ============================================================
  // TABS
  // ============================================================
  function wireTabs() {
    document.querySelectorAll('[data-tab]').forEach(tabBtn => {
      tabBtn.addEventListener('click', () => {
        document.querySelectorAll('[data-tab]').forEach(b => b.classList.remove('active'));
        tabBtn.classList.add('active');
        const target = tabBtn.dataset.tab;
        document.querySelectorAll('.tab-pane').forEach(pane => {
          pane.classList.toggle('hidden', pane.id !== `pane-${target}`);
        });
      });
    });
  }

  // ============================================================
  // AI PANEL WIRING (selector mapping + fade behavior)
  // ============================================================
  function wireAIPanel() {
    const genBtn = document.getElementById('ai-generate');
    if (genBtn && !genBtn.dataset.label) genBtn.dataset.label = genBtn.textContent;

    // Hook into UI's status flow: after success, schedule fade
    const origSetStatus = state.ui.setAIStatus.bind(state.ui);
    state.ui.setAIStatus = (msg, type) => {
      origSetStatus(msg, type);
      if (type === 'success') {
        const btn = document.getElementById('ai-generate');
        if (btn) { btn.disabled = true; btn.classList.add('busy'); }
        // Keep success visible briefly, then fade
        setTimeout(() => {
          fadeAIStatus();
          syncActiveStates(); // texture layers have no slots, but keep consistent
        }, 1800);
      }
    };
  }

  // ============================================================
  // PRESET LOAD SYNC
  // ============================================================
  function wirePresetSync() {
    // After importState completes, sync the grid highlights
    const origImport = state.customizer.importState.bind(state.customizer);
    state.customizer.importState = async (s) => {
      await origImport(s);
      syncActiveStates();
    };
    // Also sync on every equip (covers data-equip buttons built elsewhere)
    const origOnChange = state.customizer.onChange;
    state.customizer.onChange = (item) => {
      syncActiveStates();
      if (typeof origOnChange === 'function') origOnChange(item);
    };
  }

  // ============================================================
  // BOOT
  // ============================================================
  async function boot() {
    try {
      setBootStatus('3D 모델 로딩 중...');
      initScene();
      const charRoot = await loadCharacter();

      setBootStatus('아이템 데이터 로딩 중...');
      const items = await fetch(CONFIG.itemsUrl).then(r => {
        if (!r.ok) throw new Error(`items.json ${r.status}`);
        return r.json();
      });

      state.customizer = new CharacterCustomizer(charRoot, {
        faceMeshName: CONFIG.meshNames.face,
        topMeshName: CONFIG.meshNames.top,
        bottomMeshName: CONFIG.meshNames.bottom,
      });
      state.customizer.registerItems(items);

      // CustomizerUI with EXACT selector mapping from the mockup
      state.ui = new CustomizerUI(state.customizer, {
        equipButtonSelector: '[data-equip]',
        aiPromptInput: '#ai-prompt',
        aiLayerSelect: '#ai-layer',
        aiGenerateBtn: '#ai-generate',
        aiStatus: '#ai-status',
        aiPreview: '#ai-preview',
        saveBtn: '#save-char',
        loadBtn: '#load-char',
        presetNameInput: '#preset-name',
        presetList: '#preset-list',
        useMockAI: CONFIG.useMockAI,
        storageKey: 'espil_char_presets_v1',
      });

      buildAllGrids();
      wireTabs();
      wireAIPanel();
      wirePresetSync();

      // Auto-load last preset if present
      const presets = state.ui.getPresets();
      const names = Object.keys(presets);
      if (names.length > 0) {
        await state.customizer.importState(presets[names[names.length - 1]].state);
        syncActiveStates();
      }

      setBootStatus('');
      document.getElementById('app')?.classList.add('ready');
      state._animate();
      console.log('[cctest-init] Ready');
    } catch (err) {
      console.error('[cctest-init] Boot failed:', err);
      setBootStatus('로딩 실패: ' + err.message);
    }
  }

  function setBootStatus(msg) {
    const el = document.getElementById('boot-status');
    if (el) {
      el.textContent = msg;
      el.style.display = msg ? '' : 'none';
    }
  }

  // Debug handle (single namespace export)
  window.EspilCustomizer = {
    get customizer() { return state.customizer; },
    get ui() { return state.ui; },
    syncActiveStates,
    fadeAIStatus,
    config: CONFIG,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
