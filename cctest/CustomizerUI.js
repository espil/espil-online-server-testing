/**
 * CustomizerUI.js
 * 
 * Front-end UI controller bridging HTML, AI Generation API, and CharacterCustomizer.
 * 
 * Features:
 * 1. Data-attribute button wiring (data-equip="itemId")
 * 2. Runtime AI texture generation (UGC) with pixelated filtering
 * 3. Save/Load character presets via localStorage
 * 
 * Dependencies: CharacterCustomizer.js (must be loaded first)
 */

class CustomizerUI {
  /**
   * @param {CharacterCustomizer} customizer - Initialized customizer instance
   * @param {Object} config - UI configuration
   */
  constructor(customizer, config = {}) {
    this.customizer = customizer;
    this.config = {
      // CSS selectors
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
      // AI API config
      aiApiEndpoint: config.aiApiEndpoint || '/api/generate-texture',
      aiApiKey: config.aiApiKey || null,
      useMockAI: config.useMockAI ?? true, // Default to mock for testing
      storageKey: config.storageKey || 'ms2_char_presets',
      ...config
    };
    
    this.isGenerating = false;
    this.init();
  }

  init() {
    this.wireEquipButtons();
    this.wireAIGeneration();
    this.wireSaveLoad();
    this.renderPresetList();
    console.log('[CustomizerUI] Initialized');
  }

  // ============================================================
  // 1. DEFAULT COMPONENT SELECTION
  // ============================================================

  /**
   * Wire all [data-equip] buttons to customizer.equip()
   * Also handles active state toggling within button groups
   */
  wireEquipButtons() {
    document.querySelectorAll(this.config.equipButtonSelector).forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        const itemId = btn.dataset.equip;
        if (!itemId) return;

        // Visual feedback
        btn.classList.add('loading');
        
        try {
          await this.customizer.equip(itemId);
          this.updateActiveStates(btn);
        } catch (err) {
          console.error(`[CustomizerUI] Failed to equip ${itemId}:`, err);
          this.showToast(`장착 실패: ${itemId}`, 'error');
        } finally {
          btn.classList.remove('loading');
        }
      });
    });
  }

  /**
   * Update .active class within the button's group
   * Groups are determined by closest [data-group] parent, or shared layer
   */
  updateActiveStates(clickedBtn) {
    const group = clickedBtn.closest('[data-group]');
    const scope = group || document;
    // Remove active from siblings in same group
    scope.querySelectorAll(this.config.equipButtonSelector).forEach(b => {
      // Only toggle within same layer group if data-layer is set
      if (!clickedBtn.dataset.layer || b.dataset.layer === clickedBtn.dataset.layer) {
        b.classList.remove('active');
      }
    });
    clickedBtn.classList.add('active');
  }

  /**
   * Dynamically build equip buttons from registered items
   * @param {string} containerId - Target container element ID
   * @param {string} layer - Layer to build buttons for
   */
  buildLayerButtons(containerId, layer) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const items = this.customizer.getItemsByLayer(layer);
    container.innerHTML = '';
    
    for (const item of items) {
      const btn = document.createElement('button');
      btn.className = 'equip-btn';
      btn.dataset.equip = item.id;
      btn.dataset.layer = item.layer;
      btn.textContent = item.name;
      btn.addEventListener('click', async () => {
        await this.customizer.equip(item.id);
        this.updateActiveStates(btn);
      });
      container.appendChild(btn);
    }
  }

  // ============================================================
  // 2. RUNTIME AI TEXTURE GENERATION (UGC)
  // ============================================================

  wireAIGeneration() {
    const genBtn = document.querySelector(this.config.aiGenerateBtn);
    const promptInput = document.querySelector(this.config.aiPromptInput);
    if (!genBtn || !promptInput) {
      console.warn('[CustomizerUI] AI generation UI elements not found, skipping');
      return;
    }

    genBtn.addEventListener('click', () => this.handleGenerateClick());
    promptInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleGenerateClick();
      }
    });
  }

  async handleGenerateClick() {
    if (this.isGenerating) return;
    
    const promptInput = document.querySelector(this.config.aiPromptInput);
    const layerSelect = document.querySelector(this.config.aiLayerSelect);
    const prompt = promptInput?.value?.trim();
    const layer = layerSelect?.value || 'top';
    
    if (!prompt) {
      this.setAIStatus('프롬프트를 입력해주세요', 'error');
      return;
    }
    if (!['face', 'top', 'bottom'].includes(layer)) {
      this.setAIStatus('AI 텍스처는 face/top/bottom 레이어만 지원합니다', 'error');
      return;
    }

    this.isGenerating = true;
    this.setAIStatus('AI가 텍스처를 생성 중...', 'loading');
    
    try {
      const image = await this.generateAITexture(layer, prompt);
      // Apply with pixelated filtering for MapleStory 2 aesthetic
      this.customizer.setTextureFromSource(layer, image, { pixelated: true });
      this.showAIPreview(image);
      this.setAIStatus('적용 완료!', 'success');
      this.showToast('AI 텍스처 적용됨', 'success');
    } catch (err) {
      console.error('[CustomizerUI] AI generation failed:', err);
      this.setAIStatus(`생성 실패: ${err.message}`, 'error');
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate a texture image from a text prompt.
   * Uses mock generator by default; swap to real API via config.
   * 
   * @param {string} layer - Target layer ('face'|'top'|'bottom')
   * @param {string} promptText - User's description
   * @returns {Promise<HTMLImageElement>} Generated image element
   */
  async generateAITexture(layer, promptText) {
    // Enhance prompt for consistent game-art style
    const styleSuffix = 'flat game texture, chibi anime style, cel shaded, ' +
      'seamless tileable, no background, centered, high contrast outlines';
    const fullPrompt = `${promptText}, ${styleSuffix}`;
    
    console.log(`[CustomizerUI] Generating ${layer} texture: "${fullPrompt}"`);

    if (this.config.useMockAI) {
      return this.mockAIGenerate(layer, fullPrompt);
    }
    return this.callAIAPI(layer, fullPrompt);
  }

  /**
   * Mock AI generator for testing - creates a procedural placeholder
   * Replace with real API in production
   */
  async mockAIGenerate(layer, prompt) {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 1500));
    
    // Create a procedural canvas texture as placeholder
    // In production, this would be: fetch(this.config.aiApiEndpoint, {...})
    const size = 512;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Simple hash from prompt for deterministic colors
    let hash = 0;
    for (let i = 0; i < prompt.length; i++) {
      hash = ((hash << 5) - hash + prompt.charCodeAt(i)) | 0;
    }
    const hue = Math.abs(hash) % 360;
    
    // Fill with prompt-derived color + pattern
    ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = `hsl(${(hue + 40) % 360}, 60%, 45%)`;
    // Add some pattern for visual interest
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(
        (i * 97) % size, (i * 61) % size,
        30 + (i * 13) % 40, 0, Math.PI * 2
      );
      ctx.fill();
    }
    // Label
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('[MOCK AI]', size/2, size/2 - 10);
    ctx.font = '18px sans-serif';
    ctx.fillText(prompt.slice(0, 40), size/2, size/2 + 25);
    
    // Convert canvas to image element
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.src = canvas.toDataURL('image/png');
    });
  }

  /**
   * Real AI API call - implement with your provider
   * (e.g., Stability AI, DALL-E, or custom endpoint)
   */
  async callAIAPI(layer, prompt) {
    const res = await fetch(this.config.aiApiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.aiApiKey && { 'Authorization': `Bearer ${this.config.aiApiKey}` }),
      },
      body: JSON.stringify({
        prompt,
        layer, // So backend can apply layer-specific framing
        size: '512x512',
        style: 'game_texture_cel_shaded',
      }),
    });
    
    if (!res.ok) throw new Error(`AI API ${res.status}: ${await res.text()}`);
    
    const data = await res.json();
    // Expect { imageUrl } or { imageBase64 }
    const src = data.imageUrl || `data:image/png;base64,${data.imageBase64}`;
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  setAIStatus(msg, type = 'info') {
    const el = document.querySelector(this.config.aiStatus);
    if (el) {
      el.textContent = msg;
      el.dataset.status = type;
    }
  }

  showAIPreview(img) {
    const el = document.querySelector(this.config.aiPreview);
    if (el) {
      el.innerHTML = '';
      // Clone to avoid moving the original
      const clone = img.cloneNode();
      clone.style.maxWidth = '100%';
      clone.style.imageRendering = 'pixelated'; // Match in-game look
      el.appendChild(clone);
    }
  }

  // ============================================================
  // 3. SAVING & LOADING PRESETS
  // ============================================================

  wireSaveLoad() {
    document.querySelector(this.config.saveBtn)?.addEventListener('click', () => this.savePreset());
    document.querySelector(this.config.loadBtn)?.addEventListener('click', () => this.loadPreset());
  }

  /**
   * Save current character to localStorage
   */
  savePreset() {
    const nameInput = document.querySelector(this.config.presetNameInput);
    const name = nameInput?.value?.trim() || `프리셋 ${new Date().toLocaleString()}`;
    
    const state = this.customizer.exportState();
    const presets = this.getPresets();
    presets[name] = {
      state,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(this.config.storageKey, JSON.stringify(presets));
    
    this.renderPresetList();
    this.showToast(`저장됨: ${name}`, 'success');
    console.log('[CustomizerUI] Preset saved:', name, state);
  }

  /**
   * Load selected preset from dropdown, or most recent
   */
  async loadPreset(presetName = null) {
    const presets = this.getPresets();
    const names = Object.keys(presets);
    if (names.length === 0) {
      this.showToast('저장된 프리셋이 없습니다', 'error');
      return;
    }
    
    // Use selected from list, or prompt, or most recent
    const listEl = document.querySelector(this.config.presetList);
    const selected = presetName || listEl?.value || names[names.length - 1];
    const preset = presets[selected];
    
    if (!preset) {
      this.showToast('프리셋을 찾을 수 없습니다', 'error');
      return;
    }
    
    try {
      await this.customizer.importState(preset.state);
      this.showToast(`불러옴: ${selected}`, 'success');
      console.log('[CustomizerUI] Preset loaded:', selected);
    } catch (err) {
      console.error('[CustomizerUI] Load failed:', err);
      this.showToast('불러오기 실패', 'error');
    }
  }

  getPresets() {
    try {
      return JSON.parse(localStorage.getItem(this.config.storageKey) || '{}');
    } catch {
      return {};
    }
  }

  deletePreset(name) {
    const presets = this.getPresets();
    delete presets[name];
    localStorage.setItem(this.config.storageKey, JSON.stringify(presets));
    this.renderPresetList();
  }

  renderPresetList() {
    const listEl = document.querySelector(this.config.presetList);
    if (!listEl) return;
    
    const presets = this.getPresets();
    listEl.innerHTML = '';
    
    for (const name of Object.keys(presets).reverse()) {
      const opt = document.createElement('option');
      opt.value = name;
      opt.textContent = `${name} (${new Date(presets[name].savedAt).toLocaleDateString()})`;
      listEl.appendChild(opt);
    }
  }

  // ============================================================
  // Helpers
  // ============================================================

  showToast(msg, type = 'info') {
    // Simple toast - replace with your UI library if needed
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = msg;
    toast.style.cssText = `
      position:fixed; bottom:20px; left:50%; transform:translateX(-50%);
      background:${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#333'};
      color:#fff; padding:10px 20px; border-radius:8px; z-index:9999;
      font-size:14px; animation: fadeIn 0.2s;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

// --- Patch: pixelated filtering support in CharacterCustomizer ---
// Add this to CharacterCustomizer.setTextureFromSource, or monkey-patch:
if (typeof CharacterCustomizer !== 'undefined') {
  const origSetTexture = CharacterCustomizer.prototype.setTextureFromSource;
  CharacterCustomizer.prototype.setTextureFromSource = function(layer, source, opts = {}) {
    const mesh = this.subMeshes[layer];
    if (!mesh) return;
    
    let texture;
    if (source.isTexture) {
      texture = source;
    } else {
      texture = new THREE.Texture(source);
      texture.needsUpdate = true;
    }
    texture.encoding = THREE.sRGBEncoding;
    
    // MapleStory 2 pixelated/cel aesthetic
    if (opts.pixelated) {
      texture.magFilter = THREE.NearestFilter;
      texture.minFilter = THREE.NearestFilter;
      texture.generateMipmaps = false;
    }
    
    const newMat = mesh.material.clone();
    if (newMat.map) newMat.map.dispose();
    newMat.map = texture;
    newMat.needsUpdate = true;
    mesh.material = newMat;
  };
}

// Export
if (typeof module !== 'undefined') module.exports = { CustomizerUI };
