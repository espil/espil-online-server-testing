/**
 * CharacterCustomizer.js
 * 
 * Modular character customization system for Three.js.
 * Inspired by MapleStory 2's layer architecture.
 * 
 * LAYER TYPES:
 * 1. TEXTURE-BASED: Swaps textures on existing base body sub-meshes
 *    - face: Swaps texture on Head sub-mesh
 *    - top: Swaps texture on Torso sub-mesh  
 *    - bottom: Swaps texture on Legs sub-mesh
 * 
 * 2. ATTACHMENT-BASED: Spawns 3D prefabs onto skeletal sockets
 *    - hair: Parents to Head_Socket
 *    - hat: Parents to Head_Socket (hides hair when active)
 *    - cape: Parents to Spine_Socket
 * 
 * USAGE:
 * 1. Add to your rigged character hierarchy (see attachToCharacter below)
 * 2. Define items in items.json (data-driven)
 * 3. Call customizer.equip('hair', 'spiky_red') from UI buttons
 */

class CustomizationItem {
  /**
   * @param {Object} data - Item definition
   * @param {string} data.id - Unique item ID (e.g., 'hair_spiky_red')
   * @param {string} data.name - Display name (e.g., '스파이키 레드')
   * @param {string} data.layer - Layer type: 'face'|'top'|'bottom'|'hair'|'hat'|'cape'
   * @param {string} data.textureUrl - URL to texture (for texture layers)
   * @param {string} data.prefabUrl - URL to GLB prefab (for attachment layers)
   * @param {boolean} data.hidesHair - If true, hides hair when equipped (for hats)
   */
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.layer = data.layer;
    this.textureUrl = data.textureUrl || null;
    this.prefabUrl = data.prefabUrl || null;
    this.hidesHair = data.hidesHair || false;
  }

  isTextureLayer() {
    return ['face', 'top', 'bottom'].includes(this.layer);
  }

  isAttachmentLayer() {
    return ['hair', 'hat', 'cape'].includes(this.layer);
  }
}

class CharacterCustomizer {
  /**
   * @param {THREE.Object3D} characterRoot - Root of rigged character
   * @param {Object} config - Configuration
   */
  constructor(characterRoot, config = {}) {
    this.character = characterRoot;
    this.items = new Map(); // id -> CustomizationItem
    this.equipped = new Map(); // layer -> itemId
    this.attachmentCache = new Map(); // layer -> THREE.Object3D (spawned prefab)
    this.textureLoader = new THREE.TextureLoader();
    this.gltfLoader = new THREE.GLTFLoader();
    
    // Socket transforms - find in hierarchy
    this.sockets = {
      head: this.findSocket('Head_Socket') || this.findSocket('Head') || this.findBone('Head'),
      spine: this.findSocket('Spine_Socket') || this.findSocket('Spine') || this.findBone('Spine'),
    };
    
    // Sub-meshes for texture swapping
    // Expects mesh names like 'Head', 'Torso', 'Legs' in the character
    this.subMeshes = {
      face: this.findMesh(config.faceMeshName || 'Head'),
      top: this.findMesh(config.topMeshName || 'Torso'),
      bottom: this.findMesh(config.bottomMeshName || 'Legs'),
    };
    
    console.log('[Customizer] Sockets:', Object.keys(this.sockets).filter(k => this.sockets[k]));
    console.log('[Customizer] Sub-meshes:', Object.keys(this.subMeshes).filter(k => this.subMeshes[k]));
  }

  // --- Hierarchy Helpers ---

  findSocket(name) {
    let found = null;
    this.character.traverse(o => {
      if (o.name === name) found = o;
    });
    return found;
  }

  findBone(name) {
    let found = null;
    this.character.traverse(o => {
      if (o.isBone && o.name.toLowerCase().includes(name.toLowerCase())) found = o;
    });
    return found;
  }

  findMesh(name) {
    let found = null;
    this.character.traverse(o => {
      if (o.isMesh && o.name === name) found = o;
    });
    return found;
  }

  // --- Item Registration (Data-Driven) ---

  /**
   * Register items from a data array (e.g., loaded from items.json)
   * @param {Array<Object>} itemDatas 
   */
  registerItems(itemDatas) {
    for (const data of itemDatas) {
      const item = new CustomizationItem(data);
      this.items.set(item.id, item);
    }
    console.log(`[Customizer] Registered ${this.items.size} items`);
  }

  /**
   * Get all items for a layer (for building UI)
   * @param {string} layer 
   * @returns {CustomizationItem[]}
   */
  getItemsByLayer(layer) {
    return [...this.items.values()].filter(i => i.layer === layer);
  }

  // --- Equip / Unequip ---

  /**
   * Equip an item by ID. Handles cleanup of previous item on same layer.
   * @param {string} itemId 
   */
  async equip(itemId) {
    const item = this.items.get(itemId);
    if (!item) {
      console.warn(`[Customizer] Item not found: ${itemId}`);
      return;
    }

    // Clean up previous item on this layer
    this.unequipLayer(item.layer);

    if (item.isTextureLayer()) {
      await this.applyTexture(item);
    } else if (item.isAttachmentLayer()) {
      await this.attachPrefab(item);
    }

    this.equipped.set(item.layer, itemId);
    
    // Handle hat-hides-hair logic
    if (item.layer === 'hat' && item.hidesHair) {
      this.setLayerVisible('hair', false);
    } else if (item.layer === 'hair') {
      // Re-check if hat is hiding hair
      const hatId = this.equipped.get('hat');
      const hat = hatId ? this.items.get(hatId) : null;
      if (!hat || !hat.hidesHair) {
        this.setLayerVisible('hair', true);
      }
    }

    console.log(`[Customizer] Equipped ${item.name} (${item.layer})`);
    this.onChange?.(item);
  }

  /**
   * Remove item from a layer, cleaning up meshes/textures
   * @param {string} layer 
   */
  unequipLayer(layer) {
    const prevId = this.equipped.get(layer);
    if (!prevId) return;

    // For attachments: remove spawned prefab from socket
    const spawned = this.attachmentCache.get(layer);
    if (spawned) {
      spawned.parent?.remove(spawned);
      // Dispose geometries/materials to prevent memory leaks
      spawned.traverse(o => {
        if (o.isMesh) {
          o.geometry?.dispose();
          if (o.material) {
            (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => {
              m.map?.dispose();
              m.dispose();
            });
          }
        }
      });
      this.attachmentCache.delete(layer);
    }

    // For textures: restore default (or leave as-is if no default)
    // We don't auto-restore to avoid flashing; caller can set a default

    this.equipped.delete(layer);
    console.log(`[Customizer] Unequipped layer: ${layer}`);
  }

  /**
   * Toggle visibility of an attachment layer (for hat-hides-hair)
   */
  setLayerVisible(layer, visible) {
    const spawned = this.attachmentCache.get(layer);
    if (spawned) spawned.visible = visible;
  }

  // --- Texture Swapping ---

  /**
   * Apply a texture to a sub-mesh material.
   * This is the runtime function for feeding AI-generated textures.
   * @param {CustomizationItem} item 
   */
  async applyTexture(item) {
    const mesh = this.subMeshes[item.layer];
    if (!mesh) {
      console.warn(`[Customizer] No mesh found for layer: ${item.layer}`);
      return;
    }

    const texture = await this.loadTexture(item.textureUrl);
    
    // Ensure material is unique to this mesh (not shared)
    if (!mesh.userData.originalMaterial) {
      mesh.userData.originalMaterial = mesh.material.clone();
    }
    
    // Clone material and apply new texture
    // This prevents affecting other characters sharing the material
    const newMat = mesh.material.clone();
    newMat.map = texture;
    newMat.needsUpdate = true;
    
    // Dispose old cloned material (not the original)
    if (mesh.material !== mesh.userData.originalMaterial) {
      mesh.material.dispose();
    }
    
    mesh.material = newMat;
  }

  /**
   * Direct runtime texture swap - feed a Texture or image directly.
   * Use this for AI-generated textures at runtime.
   * @param {string} layer - 'face'|'top'|'bottom'
   * @param {THREE.Texture|HTMLImageElement|HTMLCanvasElement} source
   */
  setTextureFromSource(layer, source) {
    const mesh = this.subMeshes[layer];
    if (!mesh) {
      console.warn(`[Customizer] No mesh for layer: ${layer}`);
      return;
    }

    let texture;
    if (source.isTexture) {
      texture = source;
    } else {
      texture = new THREE.Texture(source);
      texture.needsUpdate = true;
    }
    // sRGB for color textures
    texture.encoding = THREE.sRGBEncoding;

    const newMat = mesh.material.clone();
    if (newMat.map) newMat.map.dispose();
    newMat.map = texture;
    newMat.needsUpdate = true;
    
    if (mesh.material !== mesh.userData.originalMaterial) {
      mesh.material.dispose();
    }
    mesh.material = newMat;
    
    console.log(`[Customizer] Runtime texture applied to ${layer}`);
  }

  loadTexture(url) {
    return new Promise((resolve, reject) => {
      this.textureLoader.load(
        url,
        tex => { tex.encoding = THREE.sRGBEncoding; resolve(tex); },
        undefined,
        reject
      );
    });
  }

  // --- Attachment Spawning ---

  /**
   * Load a GLB prefab and parent it to the layer's socket
   * @param {CustomizationItem} item 
   */
  async attachPrefab(item) {
    const socket = this.getSocketForLayer(item.layer);
    if (!socket) {
      console.warn(`[Customizer] No socket for layer: ${item.layer}`);
      return;
    }

    const gltf = await this.loadPrefab(item.prefabUrl);
    const prefab = gltf.scene;
    
    // Reset transform relative to socket
    prefab.position.set(0, 0, 0);
    prefab.rotation.set(0, 0, 0);
    prefab.scale.set(1, 1, 1);
    
    // Apply item-specific offset if defined
    if (item.offset) {
      prefab.position.set(...(item.offset.position || [0,0,0]));
      prefab.rotation.set(...(item.offset.rotation || [0,0,0]));
      prefab.scale.set(...(item.offset.scale || [1,1,1]));
    }

    socket.add(prefab);
    this.attachmentCache.set(item.layer, prefab);
  }

  getSocketForLayer(layer) {
    switch (layer) {
      case 'hair':
      case 'hat':
        return this.sockets.head;
      case 'cape':
        return this.sockets.spine;
      default:
        return null;
    }
  }

  loadPrefab(url) {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, resolve, undefined, reject);
    });
  }

  // --- Export / Import ---

  /**
   * Get current equipped state as JSON (for saving)
   */
  exportState() {
    return Object.fromEntries(this.equipped);
  }

  /**
   * Load equipped state from JSON (for loading)
   */
  async importState(state) {
    for (const [layer, itemId] of Object.entries(state)) {
      await this.equip(itemId);
    }
  }

  // Optional callback
  onChange = null;
}

// --- Example items.json (data-driven) ---
const EXAMPLE_ITEMS = [
  // Texture layers
  { id: 'face_cute', name: '큐트', layer: 'face', textureUrl: 'textures/face_cute.png' },
  { id: 'face_cool', name: '시크', layer: 'face', textureUrl: 'textures/face_cool.png' },
  { id: 'top_tshirt', name: '티셔츠', layer: 'top', textureUrl: 'textures/top_tshirt.png' },
  { id: 'top_hoodie', name: '후드', layer: 'top', textureUrl: 'textures/top_hoodie.png' },
  { id: 'bottom_shorts', name: '반바지', layer: 'bottom', textureUrl: 'textures/bottom_shorts.png' },
  { id: 'bottom_jeans', name: '청바지', layer: 'bottom', textureUrl: 'textures/bottom_jeans.png' },
  
  // Attachment layers
  { id: 'hair_bob', name: '단발', layer: 'hair', prefabUrl: 'prefabs/hair_bob.glb' },
  { id: 'hair_spiky', name: '스파이키', layer: 'hair', prefabUrl: 'prefabs/hair_spiky.glb' },
  { id: 'hat_cap', name: '볼캡', layer: 'hat', prefabUrl: 'prefabs/hat_cap.glb', hidesHair: true },
  { id: 'hat_crown', name: '왕관', layer: 'hat', prefabUrl: 'prefabs/hat_crown.glb', hidesHair: false },
  { id: 'cape_red', name: '빨간 망토', layer: 'cape', prefabUrl: 'prefabs/cape_red.glb' },
];

// --- Usage Example ---
/*
// 1. After loading your character GLB:
const customizer = new CharacterCustomizer(characterRoot, {
  faceMeshName: 'Head',    // Mesh name in your GLB
  topMeshName: 'Torso',
  bottomMeshName: 'Legs',
});

// 2. Register items (from JSON file or inline):
customizer.registerItems(EXAMPLE_ITEMS);
// Or: fetch('items.json').then(r => r.json()).then(items => customizer.registerItems(items));

// 3. Wire UI buttons:
document.querySelectorAll('[data-equip]').forEach(btn => {
  btn.onclick = () => customizer.equip(btn.dataset.equip);
});

// 4. AI texture runtime feed:
async function applyAIFace(imageUrl) {
  const img = await loadImage(imageUrl);
  customizer.setTextureFromSource('face', img);
}

// 5. Save/Load:
const saved = customizer.exportState(); // -> {hair:'hair_bob', face:'face_cute', ...}
localStorage.setItem('char', JSON.stringify(saved));
// Later:
customizer.importState(JSON.parse(localStorage.getItem('char')));
*/

// --- Hierarchy Setup Guide ---
/*
Your rigged character should have this structure:

CharacterRoot (THREE.Group)
├── Armature (THREE.Object3D)
│   ├── Hips (Bone)
│   │   ├── Spine (Bone)
│   │   │   ├── Spine_Socket (Object3D) <-- Cape attaches here
│   │   │   ├── Chest (Bone)
│   │   │   │   ├── Neck (Bone)
│   │   │   │   │   ├── Head (Bone)
│   │   │   │   │   │   ├── Head_Socket (Object3D) <-- Hair/Hat attaches here
│   │   │   │   │   ├── Head_Mesh (SkinnedMesh, name='Head')
│   │   ├── LegL / LegR (Bones)
├── Torso_Mesh (SkinnedMesh, name='Torso')
├── Legs_Mesh (SkinnedMesh, name='Legs')

To add sockets in Blender:
1. Select Armature -> Pose Mode
2. Select Head bone -> Add Empty at head position
3. Name it 'Head_Socket', parent to Head bone (Bone relative)
4. Repeat for Spine -> 'Spine_Socket'
5. Export GLB with empties

To add sockets in code (if not in GLB):
  const headSocket = new THREE.Object3D();
  headSocket.name = 'Head_Socket';
  headSocket.position.set(0, 0.25, 0); // Above head bone origin
  headBone.add(headSocket);
*/

// Export for module use
if (typeof module !== 'undefined') module.exports = { CharacterCustomizer, CustomizationItem };
