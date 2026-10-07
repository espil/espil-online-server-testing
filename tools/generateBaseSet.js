#!/usr/bin/env node
/**
 * tools/generateBaseSet.js
 *
 * Generate exactly ONE starter kit: 4 core unisex items
 * (face, hair, top, bottom) in MapleStory 2 pixelated/cel-shaded style.
 *
 * Pipeline:
 *   face/top/bottom → Meshy Text-to-Texture on base template → base_color PNG
 *   hair            → Meshy Text-to-3D (preview → refine) → GLB
 *
 * Output:
 *   assets/face/base_face_unisex.png
 *   assets/hair/base_hair_unisex.glb
 *   assets/top/base_top_unisex.png
 *   assets/bottom/base_bottom_unisex.png
 *   + items.json auto-patched
 *
 * Usage:
 *   MESHY_API_KEY=msy_xxx node tools/generateBaseSet.js
 *   MESHY_API_KEY=msy_xxx TEXTURE_MODEL_URL=https://... node tools/generateBaseSet.js
 *   MESHY_API_KEY=msy_xxx node tools/generateBaseSet.js --dry-run
 *
 * Requires: Node.js 18+ (native fetch). No npm dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ============================================================
// 1. CORE DATASET (embedded)
// ============================================================

const TASKS = [
  {
    id: 'base_face_unisex',
    name: '기본 모험가 얼굴',
    layer: 'face',
    prompt: 'Neutral chibi anime face, cute round dark brown eyes with soft highlights, friendly subtle smile, soft blushing cheeks, 2D flat hand-painted gaming texture, MapleStory 2 style, clean cell-shaded, high contrast eyes, no 3D lighting baked',
    negative_prompt: '3D embossed, realistic skin texture, realistic eyes, heavy makeup, masculine, feminine, shading, shadows, metallic, glossy, blurry',
    template: 'assets/base/chibi_base.glb',
  },
  {
    id: 'base_hair_unisex',
    name: '기본 단정 숏컷',
    layer: 'hair',
    prompt: 'Compact chibi anime short haircut, unisex style, solid dark brown color, low-poly 3D mesh, tight fit, clean solid edges, flat gaming texture, cel-shaded toon style, single mesh asset, no stray hairs',
    negative_prompt: 'Realistic hair strands, high-poly, photorealistic, glowing, translucent, messy hair, long hair, floating parts',
    offset: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
  },
  {
    id: 'base_top_unisex',
    name: '기본 파스텔 티셔츠',
    layer: 'top',
    prompt: 'Simple cozy casual t-shirt for chibi character, unisex apparel, soft pastel sky blue color, flat 2D vector illustration style, clean hand-painted gaming texture, MapleStory 2 clothing style, cell-shaded, no realistic fabric wrinkles, no baked environment shadows',
    negative_prompt: 'Realistic cloth folds, leather, metallic armor, photorealistic texture, 3D embossed details, logos, asymmetric patterns',
    template: 'assets/base/chibi_base.glb',
  },
  {
    id: 'base_bottom_unisex',
    name: '기본 캐주얼 반바지',
    layer: 'bottom',
    prompt: 'Simple basic shorts for chibi character legs, unisex pants, soft medium grey color, flat 2D illustration style, hand-painted clean gaming texture, MapleStory 2 asset style, minimal cell-shading, solid color block',
    negative_prompt: 'Long jeans, realistic denim texture, pockets, belts, chains, realistic shadows, high-poly creases',
    template: 'assets/base/chibi_base.glb',
  },
];

const CONFIG = {
  apiKey: process.env.MESHY_API_KEY || '',
  apiBase: 'https://api.meshy.ai/openapi',
  projectRoot: path.resolve(__dirname, '..'),
  assetsDir: 'assets',
  itemsJson: 'cctest/items.json',
  pollIntervalMs: 5000, // 5 seconds as specified
  pollTimeoutMs: 30 * 60 * 1000,
  maxRetries: 5,
  retryBaseMs: 5000,
};

const is3DLayer = (layer) => layer === 'hair'; // Only hair is 3D in this starter kit
const isTextureLayer = (layer) => ['face', 'top', 'bottom'].includes(layer);

// ============================================================
// 2. MESHY API CLIENT
// ============================================================

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

class MeshyClient {
  constructor(apiKey) {
    if (!apiKey) throw new Error('MESHY_API_KEY env var is required');
    this.apiKey = apiKey;
  }

  async request(method, endpoint, body = null, attempt = 0) {
    const url = `${CONFIG.apiBase}${endpoint}`;
    let res;
    try {
      res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (err) {
      if (attempt < CONFIG.maxRetries) {
        await sleep(CONFIG.retryBaseMs * 2 ** attempt);
        return this.request(method, endpoint, body, attempt + 1);
      }
      throw err;
    }

    if (res.status === 429 || res.status >= 500) {
      if (attempt >= CONFIG.maxRetries) {
        throw new Error(`Meshy API ${res.status} after ${attempt} retries`);
      }
      const waitMs = CONFIG.retryBaseMs * 2 ** attempt + Math.random() * 2000;
      console.log(`  ⏳ HTTP ${res.status}, retry in ${(waitMs / 1000).toFixed(0)}s`);
      await sleep(waitMs);
      return this.request(method, endpoint, body, attempt + 1);
    }

    if (!res.ok) throw new Error(`Meshy API ${res.status}: ${await res.text()}`);
    if (res.status === 204) return null;
    return res.json();
  }

  // Text-to-3D: preview
  async createPreview(task) {
    console.log(`  [3D-A] Preview task for "${task.id}"...`);
    const data = await this.request('POST', '/v2/text-to-3d', {
      mode: 'preview',
      prompt: task.prompt,
      negative_prompt: task.negative_prompt || undefined,
      art_style: 'low-poly',
      ai_model: 'meshy-5',
    });
    if (!data?.result) throw new Error('No preview task ID returned');
    return data.result;
  }

  // Text-to-3D: refine
  async createRefine(previewId, task) {
    console.log(`  [3D-B] Refine task from ${previewId}...`);
    const data = await this.request('POST', '/v2/text-to-3d', {
      mode: 'refine',
      preview_task_id: previewId,
      prompt: task.prompt,
      texture_prompt: `${task.prompt}, flat cel-shaded game texture`,
      negative_prompt: task.negative_prompt || undefined,
      ai_model: 'meshy-5',
    });
    if (!data?.result) throw new Error('No refine task ID returned');
    return data.result;
  }

  async get3DStatus(taskId) {
    return this.request('GET', `/v2/text-to-3d/${taskId}`);
  }

  // Retexture (the correct endpoint — /v1/text-to-texture does not exist)
  async createTextureTask(task, modelUrl) {
    console.log(`  [TEX] Retexture task for "${task.id}"...`);
    const data = await this.request('POST', '/v1/retexture', {
      model_url: modelUrl,
      text_style_prompt: task.prompt,
      negative_prompt: task.negative_prompt || undefined,
      art_style: 'cartoon',
      ai_model: 'meshy-5',
      enable_original_uv: true,
      enable_pbr: false,
      texture_resolution: '2k',
    });
    if (!data?.result) throw new Error('No retexture task ID returned');
    return data.result;
  }

  async getTextureStatus(taskId) {
    return this.request('GET', `/v1/retexture/${taskId}`);
  }

  async pollUntilDone(statusFn, pickUrl, label) {
    const start = Date.now();
    let last = '';
    for (;;) {
      if (Date.now() - start > CONFIG.pollTimeoutMs) {
        throw new Error(`${label}: timeout after ${CONFIG.pollTimeoutMs / 60000}min`);
      }
      const s = await statusFn();
      const st = s.status || 'UNKNOWN';
      if (st !== last) {
        console.log(`  … ${label}: ${st}${s.progress != null ? ` (${s.progress}%)` : ''}`);
        last = st;
      }
      if (st === 'SUCCEEDED') {
        const url = pickUrl ? pickUrl(s) : null;
        return { statusJson: s, downloadUrl: url };
      }
      if (['FAILED', 'CANCELED', 'EXPIRED'].includes(st)) {
        throw new Error(`${label}: ${st}${s.task_error ? ` — ${JSON.stringify(s.task_error)}` : ''}`);
      }
      await sleep(CONFIG.pollIntervalMs);
    }
  }
}

// ============================================================
// 3. TEMPLATE URL RESOLUTION
// ============================================================

function resolveTemplateUrl(task) {
  // Priority 1: explicit env var
  if (process.env.TEXTURE_MODEL_URL) return process.env.TEXTURE_MODEL_URL;
  // Priority 2: task-level URL
  if (task.templateUrl) return task.templateUrl;
  // Priority 3: default GitHub raw URL (file is in the repo)
  if (task.template) {
    return `https://raw.githubusercontent.com/espil/espil-online/main/${task.template}`;
  }

  // Priority 4: check local file → guide user to host it
  const localPath = path.resolve(CONFIG.projectRoot, task.template);
  if (fs.existsSync(localPath)) {
    throw new Error(
      `Template found locally at ${task.template} but Meshy needs a public URL.\n` +
      `  Push it to GitHub or set TEXTURE_MODEL_URL to override.`
    );
  }
  throw new Error(`Template not found: ${task.template}`);
}

// ============================================================
// 4. TASK RUNNERS
// ============================================================

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadFile(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Download ${res.status}: ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`  💾 ${(buf.length / 1024).toFixed(0)}KB → ${dest}`);
}

async function runHairTask(client, task) {
  const previewId = await client.createPreview(task);
  await client.pollUntilDone(
    () => client.get3DStatus(previewId),
    null,
    `preview:${task.id}`
  );
  const refineId = await client.createRefine(previewId, task);
  const { downloadUrl } = await client.pollUntilDone(
    () => client.get3DStatus(refineId),
    (s) => s.model_urls?.glb || s.model_url,
    `refine:${task.id}`
  );
  if (!downloadUrl) throw new Error('No GLB URL in refine result');
  const dir = path.resolve(CONFIG.projectRoot, CONFIG.assetsDir, 'hair');
  ensureDir(dir);
  const dest = path.join(dir, `${task.id}.glb`);
  await downloadFile(downloadUrl, dest);
  return path.relative(CONFIG.projectRoot, dest).replace(/\\/g, '/');
}

async function runTextureTask(client, task) {
  const modelUrl = resolveTemplateUrl(task);
  console.log(`  Template URL: ${modelUrl}`);
  const taskId = await client.createTextureTask(task, modelUrl);
  const { statusJson, downloadUrl } = await client.pollUntilDone(
    () => client.getTextureStatus(taskId),
    (s) => s.texture_urls?.[0]?.base_color
        || s.texture_urls?.[0]?.baseColor
        || s.texture_urls?.[0]
        || s.model_urls?.glb,
    `retexture:${task.id}`
  );
  if (!downloadUrl) {
    console.log('  Response keys:', Object.keys(statusJson).join(', '));
    throw new Error('No texture/model URL in retexture result');
  }
  // Save with appropriate extension based on URL
  const isModel = downloadUrl.includes('.glb') || statusJson.model_urls?.glb === downloadUrl;
  const ext = isModel ? '.glb' : '.png';
  const dir = path.resolve(CONFIG.projectRoot, CONFIG.assetsDir, task.layer);
  ensureDir(dir);
  const dest = path.join(dir, `${task.id}${ext}`);
  await downloadFile(downloadUrl, dest);
  if (isModel) console.log(`  ⚠️ Retexture returned full model (not standalone PNG)`);
  return path.relative(CONFIG.projectRoot, dest).replace(/\\/g, '/');
}

// ============================================================
// 5. ITEMS.JSON PATCHING
// ============================================================

function toItemEntry(task, assetPath) {
  const entry = { id: task.id, name: task.name, layer: task.layer };
  if (assetPath.endsWith('.glb')) {
    entry.prefabUrl = assetPath;
    entry.offset = task.offset || { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] };
  } else {
    entry.textureUrl = assetPath;
  }
  return entry;
}

function patchItemsJson(entries) {
  const p = path.resolve(CONFIG.projectRoot, CONFIG.itemsJson);
  let existing = [];
  if (fs.existsSync(p)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(p, 'utf8'));
      existing = Array.isArray(parsed) ? parsed : [];
    } catch { /* start fresh */ }
  }
  const ids = new Set(existing.map((i) => i.id));
  let added = 0;
  for (const e of entries) {
    if (ids.has(e.id)) {
      console.log(`  ↷ "${e.id}" already in items.json, skipping`);
      continue;
    }
    existing.push(e);
    ids.add(e.id);
    added++;
  }
  existing.sort((a, b) => a.layer.localeCompare(b.layer) || a.id.localeCompare(b.id));
  ensureDir(path.dirname(p));
  fs.writeFileSync(p, JSON.stringify(existing, null, 2) + '\n');
  console.log(`📝 items.json: +${added} (${existing.length} total)`);
}

// ============================================================
// MAIN — sequential async loop
// ============================================================

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const onlyIdx = process.argv.indexOf('--only');
  const onlyIds = onlyIdx >= 0 ? process.argv[onlyIdx + 1].split(',') : null;

  let tasks = TASKS;
  if (onlyIds) {
    tasks = TASKS.filter((t) => onlyIds.includes(t.id));
    if (tasks.length === 0) {
      console.error(`No tasks match: ${onlyIds.join(',')}`);
      process.exit(1);
    }
  }

  console.log('═══════════════════════════════════════════');
  console.log(` Base Set Generator — ${tasks.length} item(s)`);
  console.log(` Root: ${CONFIG.projectRoot}`);
  console.log(' Mode: sequential (1 at a time), poll every 5s');
  if (dryRun) console.log(' DRY RUN — no API calls');
  console.log('═══════════════════════════════════════════');

  if (dryRun) {
    tasks.forEach((t, i) => {
      console.log(`\n${i + 1}. [${t.layer}] ${t.id}`);
      console.log(`   prompt: ${t.prompt.slice(0, 80)}…`);
      console.log(`   negative: ${t.negative_prompt.slice(0, 60)}…`);
    });
    console.log('\nDry run complete.');
    return;
  }

  const client = new MeshyClient(CONFIG.apiKey);
  const done = [];
  const failed = [];

  // Sequential loop — one task at a time
  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];
    console.log(`\n▶ [${i + 1}/${tasks.length}] [${task.layer}] ${task.id} — "${task.name}"`);
    try {
      const assetPath = is3DLayer(task.layer)
        ? await runHairTask(client, task)
        : await runTextureTask(client, task);
      const entry = toItemEntry(task, assetPath);
      done.push(entry);
      patchItemsJson([entry]); // incremental save
      console.log(`✔ ${task.id} complete → ${assetPath}`);
    } catch (err) {
      console.error(`✖ FAILED ${task.id}: ${err.message}`);
      failed.push({ id: task.id, error: err.message });
    }
    // Brief pause between tasks
    if (i < tasks.length - 1) await sleep(3000);
  }

  console.log('\n═══════════════════════════════════════════');
  console.log(` Done. ✅ ${done.length}/${tasks.length} succeeded, ❌ ${failed.length} failed`);
  failed.forEach((f) => console.log(`  • ${f.id}: ${f.error}`));
  if (failed.length > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
