#!/usr/bin/env node
/**
 * tools/massProducer.js
 *
 * Batch-produce 3D accessories (GLB) and clothing textures (PNG) via Meshy OpenAPI
 * for the MapleStory 2-style chibi customizer. No Blender required.
 *
 * Pipeline:
 *   3D (hair/hat/cape):  text-to-3d preview → poll → refine → poll → download GLB
 *   2D (top/bottom):     text-to-texture on template OBJ → poll → download PNG
 *
 * Output:
 *   assets/<layer>/<id>.glb|png   +   items.json auto-patched with offsets
 *
 * Usage:
 *   MESHY_API_KEY=msy_xxx node tools/massProducer.js
 *   MESHY_API_KEY=msy_xxx node tools/massProducer.js --only hats
 *   MESHY_API_KEY=msy_xxx node tools/massProducer.js --dry-run
 *
 * Requires: Node.js 18+ (native fetch). No npm dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. CONFIG & TASK LIST
// ============================================================

const CONFIG = {
  apiKey: process.env.MESHY_API_KEY || '',
  apiBase: 'https://api.meshy.ai/openapi',
  // Where this script lives relative to repo root (assets/, items.json)
  projectRoot: path.resolve(__dirname, '..'),
  assetsDir: 'assets',
  itemsJson: 'cctest/items.json',
  // Polling
  pollIntervalMs: 8000,
  pollTimeoutMs: 30 * 60 * 1000, // 30 min per task
  // Concurrency: Meshy rate-limits; 2 parallel 3D tasks is safe
  concurrency: 2,
  // Retry on 429 / 5xx
  maxRetries: 5,
  retryBaseMs: 5000,
};

const TASKS = [
  // ---- HATS (3D) ----
  {
    id: 'hat_slime', name: '슬라임 모자', layer: 'hat',
    prompt: 'Cute green slime hat for chibi character, glossy translucent, low-poly game asset, cel shaded',
    offset: { position: [0, 0.28, -0.05], rotation: [0, 0, 0], scale: [1, 1, 1] },
    hidesHair: true,
    topology: 'low-poly',
  },
  {
    id: 'hat_straw', name: '밀짚모자', layer: 'hat',
    prompt: 'Straw farmer hat for chibi character, wide brim, woven texture, low-poly game asset',
    offset: { position: [0, 0.32, 0], rotation: [0, 0, 0], scale: [1.1, 1, 1.1] },
    hidesHair: true,
    topology: 'low-poly',
  },
  {
    id: 'hat_crown', name: '황금 왕관', layer: 'hat',
    prompt: 'Small golden crown for chibi character, cute, low-poly game asset, metallic gold',
    offset: { position: [0, 0.38, 0], rotation: [0, 0, 0], scale: [0.9, 0.9, 0.9] },
    hidesHair: false,
    topology: 'low-poly',
  },
  // ---- HAIR (3D) ----
  {
    id: 'hair_bob', name: '단발', layer: 'hair',
    prompt: 'Chibi anime bob cut hair, rounded, red, low-poly 3D game asset, smooth',
    offset: { position: [0, 0.28, -0.08], rotation: [0, 0, 0], scale: [1.15, 1.0, 1.1] },
    topology: 'low-poly',
  },
  {
    id: 'hair_spiky', name: '스파이키', layer: 'hair',
    prompt: 'Chibi spiky anime hair, blue, low-poly 3D game asset, dynamic spikes',
    offset: { position: [0, 0.35, -0.05], rotation: [0, 0, 0], scale: [1, 1, 1] },
    topology: 'low-poly',
  },
  // ---- CAPES (3D) ----
  {
    id: 'cape_red', name: '빨간 망토', layer: 'cape',
    prompt: 'Red hero cape for chibi character, flowing cloth, low-poly game asset',
    offset: { position: [0, 0.1, -0.25], rotation: [0.15, 0, 0], scale: [1, 1, 1] },
    topology: 'low-poly',
  },
  // ---- TOPS (texture) ----
  {
    id: 'top_hoodie', name: '별 후드티', layer: 'top',
    prompt: 'Cute navy hoodie with yellow stars, flat game texture, chibi anime style, cel shaded',
    templateObj: 'assets/templates/torso.obj',
  },
  {
    id: 'top_tshirt', name: '줄무늬 티', layer: 'top',
    prompt: 'White and mint striped t-shirt, flat game texture, chibi anime style',
    templateObj: 'assets/templates/torso.obj',
  },
  // ---- BOTTOMS (texture) ----
  {
    id: 'bottom_jeans', name: '청바지', layer: 'bottom',
    prompt: 'Blue denim jeans texture, flat game texture, chibi anime style, cel shaded',
    templateObj: 'assets/templates/legs.obj',
  },
];

const is3DLayer = (layer) => ['hair', 'hat', 'cape'].includes(layer);

// ============================================================
// 2. MESHY API CLIENT
// ============================================================

class MeshyClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error('MESHY_API_KEY env var is required');
    this.apiKey = apiKey;
  }

  async request(method, endpoint, body = null, attempt = 0) {
    const url = `${CONFIG.apiBase}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
    let res;
    try {
      res = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      if (attempt < CONFIG.maxRetries) {
        await sleep(CONFIG.retryBaseMs * 2 ** attempt);
        return this.request(method, endpoint, body, attempt + 1);
      }
      throw err;
    }

    // Rate limit / transient errors → exponential backoff
    if (res.status === 429 || res.status >= 500) {
      if (attempt >= CONFIG.maxRetries) {
        throw new Error(`Meshy API ${res.status} after ${attempt} retries: ${await res.text()}`);
      }
      const waitMs = CONFIG.retryBaseMs * 2 ** attempt + Math.random() * 2000;
      console.log(`  ⏳ HTTP ${res.status}, retrying in ${(waitMs / 1000).toFixed(0)}s (attempt ${attempt + 1})`);
      await sleep(waitMs);
      return this.request(method, endpoint, body, attempt + 1);
    }

    if (!res.ok) {
      throw new Error(`Meshy API ${res.status}: ${await res.text()}`);
    }
    // 204 No Content
    if (res.status === 204) return null;
    return res.json();
  }

  // ---- Text-to-3D: Step A (preview) ----
  async createPreviewTask(task) {
    console.log(`  [A] Creating preview task for "${task.id}"...`);
    const body = {
      mode: 'preview',
      prompt: task.prompt,
      // Topology controls for game-ready low-poly output
      ...(task.topology === 'low-poly'
        ? { poly_gen_config: { smart_topology: true } }
        : {}),
      art_style: 'low-poly',
      ai_model: 'meshy-5',
      // Keep polycount sane for a chibi accessory
      ...(task.targetPolycount ? { target_polycount: task.targetPolycount } : {}),
    };
    const data = await this.request('POST', '/v2/text-to-3d', body);
    if (!data?.result) throw new Error('No task ID returned from preview creation');
    console.log(`  [A] Preview task: ${data.result}`);
    return data.result;
  }

  // ---- Text-to-3D: Step B (refine with texture style) ----
  async createRefineTask(previewTaskId, task) {
    console.log(`  [B] Creating refine task from preview ${previewTaskId}...`);
    const body = {
      mode: 'refine',
      preview_task_id: previewTaskId,
      // Flat cel-shaded look to match MapleStory 2 aesthetic
      texture_prompt: `${task.prompt}, flat cel-shaded game texture, clean colors, no photorealism`,
      ai_model: 'meshy-5',
    };
    const data = await this.request('POST', '/v2/text-to-3d', body);
    if (!data?.result) throw new Error('No task ID returned from refine creation');
    console.log(`  [B] Refine task: ${data.result}`);
    return data.result;
  }

  async getTextTo3DStatus(taskId) {
    return this.request('GET', `/v2/text-to-3d/${taskId}`);
  }

  // ---- Text-to-Texture ----
  async createTextureTask(task) {
    console.log(`  [T] Creating texture task for "${task.id}"...`);
    const objPath = path.resolve(CONFIG.projectRoot, task.templateObj);
    if (!fs.existsSync(objPath)) {
      throw new Error(`Template OBJ not found: ${objPath}`);
    }
    // Meshy text-to-texture needs the model hosted at a URL.
    // We upload via a two-step: request upload URL, PUT the file, then reference it.
    // NOTE: Meshy v1 text-to-texture accepts `model_url`. If you don't have hosting,
    // set TEXTURE_MODEL_URL env to a pre-uploaded template instead.
    const modelUrl = process.env.TEXTURE_MODEL_URL;
    if (!modelUrl) {
      throw new Error(
        'TEXTURE_MODEL_URL env var required for text-to-texture ' +
        '(upload assets/templates/*.obj somewhere public, e.g. GitHub raw)'
      );
    }
    const body = {
      model_url: modelUrl,
      object_prompt: 'chibi character clothing template',
      texture_prompt: `${task.prompt}, seamless, front view centered`,
      art_style: 'realistic', // closest to clean stylized; refine via prompt
      ai_model: 'meshy-5',
    };
    const data = await this.request('POST', '/v1/text-to-texture', body);
    if (!data?.result) throw new Error('No task ID returned from texture creation');
    console.log(`  [T] Texture task: ${data.result}`);
    return data.result;
  }

  async getTextureStatus(taskId) {
    return this.request('GET', `/v1/text-to-texture/${taskId}`);
  }

  /**
   * Poll until SUCCEEDED / FAILED / timeout.
   * @param {Function} statusFn - async () => status JSON
   * @param {Function} pickUrl - (status JSON) => download URL or null
   */
  async pollUntilDone(statusFn, pickUrl, label) {
    const start = Date.now();
    let lastStatus = '';
    for (;;) {
      if (Date.now() - start > CONFIG.pollTimeoutMs) {
        throw new Error(`${label}: timed out after ${CONFIG.pollTimeoutMs / 60000}min`);
      }
      const s = await statusFn();
      const status = s.status || 'UNKNOWN';
      if (status !== lastStatus) {
        console.log(`  … ${label}: ${status}${s.progress != null ? ` (${s.progress}%)` : ''}`);
        lastStatus = status;
      }
      if (status === 'SUCCEEDED') {
        const url = pickUrl ? pickUrl(s) : null;
        // pickUrl may be null/return null for preview steps (no download needed)
        return { statusJson: s, downloadUrl: url };
      }
      if (status === 'FAILED' || status === 'CANCELED' || status === 'EXPIRED') {
        throw new Error(`${label}: task ${status}${s.task_error ? ` — ${JSON.stringify(s.task_error)}` : ''}`);
      }
      await sleep(CONFIG.pollIntervalMs);
    }
  }
}

// ============================================================
// 3. ASSET PIPELINE
// ============================================================

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadFile(url, destPath) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download failed ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(destPath, buf);
  console.log(`  💾 Saved ${(buf.length / 1024).toFixed(0)}KB → ${destPath}`);
  return destPath;
}

async function run3DTask(client, task, opts = {}) {
  // Allow reusing an existing preview task ID (saves credits on retry)
  const previewId = opts.previewId || await client.createPreviewTask(task);
  if (!opts.previewId) {
    await client.pollUntilDone(
      () => client.getTextTo3DStatus(previewId),
      null, // preview has no download; just wait for SUCCEEDED
      `preview:${task.id}`
    );
  } else {
    console.log(`  [A] Reusing preview task: ${previewId}`);
  }
  const refineId = await client.createRefineTask(previewId, task);
  const { downloadUrl } = await client.pollUntilDone(
    () => client.getTextTo3DStatus(refineId),
    (s) => s.model_urls?.glb || s.model_url,
    `refine:${task.id}`
  );
  const destDir = path.resolve(CONFIG.projectRoot, CONFIG.assetsDir, task.layer);
  ensureDir(destDir);
  const dest = path.join(destDir, `${task.id}.glb`);
  await downloadFile(downloadUrl, dest);
  return path.relative(CONFIG.projectRoot, dest).replace(/\\/g, '/');
}

async function runTextureTask(client, task) {
  const taskId = await client.createTextureTask(task);
  const { downloadUrl } = await client.pollUntilDone(
    () => client.getTextureStatus(taskId),
    (s) => s.texture_urls?.[0]?.base_color || s.texture_url,
    `texture:${task.id}`
  );
  const destDir = path.resolve(CONFIG.projectRoot, CONFIG.assetsDir, task.layer);
  ensureDir(destDir);
  const dest = path.join(destDir, `${task.id}.png`);
  await downloadFile(downloadUrl, dest);
  return path.relative(CONFIG.projectRoot, dest).replace(/\\/g, '/');
}

// ============================================================
// 4. ITEMS.JSON PATCHING
// ============================================================

function patchItemsJson(newItems) {
  const itemsPath = path.resolve(CONFIG.projectRoot, CONFIG.itemsJson);
  let existing = [];
  if (fs.existsSync(itemsPath)) {
    try {
      existing = JSON.parse(fs.readFileSync(itemsPath, 'utf8'));
      if (!Array.isArray(existing)) existing = [];
    } catch (err) {
      console.warn(`⚠️ Could not parse ${CONFIG.itemsJson}, starting fresh: ${err.message}`);
    }
  }
  const existingIds = new Set(existing.map((i) => i.id));
  let added = 0;
  for (const item of newItems) {
    if (existingIds.has(item.id)) {
      console.log(`  ↷ items.json already has "${item.id}", skipping`);
      continue;
    }
    existing.push(item);
    existingIds.add(item.id);
    added++;
  }
  // Keep sorted by layer then id for readability
  existing.sort((a, b) => a.layer.localeCompare(b.layer) || a.id.localeCompare(b.id));
  ensureDir(path.dirname(itemsPath));
  fs.writeFileSync(itemsPath, JSON.stringify(existing, null, 2) + '\n');
  console.log(`📝 items.json patched: +${added} items (${existing.length} total) → ${itemsPath}`);
}

function toItemsJsonEntry(task, assetRelPath) {
  const entry = {
    id: task.id,
    name: task.name,
    layer: task.layer,
  };
  if (is3DLayer(task.layer)) {
    entry.prefabUrl = assetRelPath;
    if (task.offset) entry.offset = task.offset;
    if (task.hidesHair) entry.hidesHair = true;
  } else {
    entry.textureUrl = assetRelPath;
  }
  return entry;
}

// ============================================================
// MAIN — queue processor with limited concurrency
// ============================================================

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function processTask(client, task, opts = {}) {
  console.log(`\n▶ [${task.layer}] ${task.id} — "${task.name}"`);
  const assetPath = is3DLayer(task.layer)
    ? await run3DTask(client, task, opts)
    : await runTextureTask(client, task);
  const entry = toItemsJsonEntry(task, assetPath);
  console.log(`✔ Done: ${task.id} → ${assetPath}`);
  return entry;
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const onlyIdx = args.indexOf('--only');
  const onlyLayer = onlyIdx >= 0 ? args[onlyIdx + 1] : null;
  const taskIdx = args.indexOf('--task');
  const onlyTaskId = taskIdx >= 0 ? args[taskIdx + 1] : null;
  const previewIdx = args.indexOf('--preview-id');
  const reusePreviewId = previewIdx >= 0 ? args[previewIdx + 1] : null;

  let tasks = TASKS;
  if (onlyTaskId) {
    tasks = tasks.filter((t) => t.id === onlyTaskId);
    if (tasks.length === 0) {
      console.error(`No task with id "${onlyTaskId}".`);
      process.exit(1);
    }
  } else if (onlyLayer) {
    tasks = tasks.filter((t) => t.layer === onlyLayer);
    if (tasks.length === 0) {
      console.error(`No tasks for layer "${onlyLayer}". Available: hair, hat, cape, top, bottom`);
      process.exit(1);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log(` Meshy Mass Producer — ${tasks.length} task(s)`);
  console.log(` Root: ${CONFIG.projectRoot}`);
  console.log(` Concurrency: ${CONFIG.concurrency}`);
  if (dryRun) console.log(' DRY RUN — no API calls');
  console.log('═══════════════════════════════════════════');

  if (dryRun) {
    for (const t of tasks) {
      console.log(`  • [${t.layer}] ${t.id}: "${t.prompt.slice(0, 60)}…"`);
    }
    console.log('\nDry run complete. Remove --dry-run to execute.');
    return;
  }

  const client = new MeshyClient(CONFIG.apiKey);
  const completed = [];
  const failed = [];

  // Simple worker pool
  const queue = [...tasks];
  const workers = Array.from({ length: Math.min(CONFIG.concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const task = queue.shift();
      try {
        const entry = await processTask(client, task, { previewId: reusePreviewId });
        completed.push(entry);
        // Patch incrementally so progress survives crashes
        patchItemsJson([entry]);
      } catch (err) {
        console.error(`✖ FAILED ${task.id}: ${err.message}`);
        failed.push({ id: task.id, error: err.message });
      }
      // Gentle gap between tasks to respect rate limits
      await sleep(3000);
    }
  });
  await Promise.all(workers);

  console.log('\n═══════════════════════════════════════════');
  console.log(` Done. ✅ ${completed.length} succeeded, ❌ ${failed.length} failed`);
  if (failed.length > 0) {
    console.log('Failed:');
    failed.forEach((f) => console.log(`  • ${f.id}: ${f.error}`));
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
