/* Espil.Online — GET /api/tiles-session (Vercel serverless, production)
 *
 * Handshake-only proxy for Google Photorealistic 3D Tiles via Cesium ion
 * (Architecture rulings 2026-10-14/15):
 *  - The Cesium ion token lives ONLY in the Vercel env var
 *    CESIUM_ION_TOKEN (Han registers it in the Vercel dashboard; it is
 *    never committed and never sent to the browser).
 *  - This function calls the ion asset endpoint server-side and returns
 *    ONLY the session tileset URL + attributions. Tile streaming itself
 *    is client -> Google direct (never proxied).
 *  - The session is cached in the warm function instance (TTL 45 min,
 *    below session expiry) and a per-instance daily fresh-fetch budget
 *    caps runaway handshakes. Free-tier root-tile consumption therefore
 *    scales with time, not with user count.
 */
const ASSET_ID = '2275207'; // Google Photorealistic 3D Tiles on Cesium ion
const SESSION_TTL_MS = 45 * 60 * 1000;
const DAILY_ROOT_BUDGET = 40;

let sessionCache = null; // { tilesetUrl, attributions, expiresAt }
let budgetDay = '';
let budgetUsed = 0;

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method_not_allowed' });
    return;
  }
  const now = Date.now();
  const today = new Date().toDateString();
  if (today !== budgetDay) { budgetDay = today; budgetUsed = 0; }

  if (sessionCache && sessionCache.expiresAt > now) {
    res.status(200).json({ ...sessionCache, cached: true, budgetUsed });
    return;
  }
  const token = process.env.CESIUM_ION_TOKEN;
  if (!token) {
    res.status(503).json({ error: 'no_token_on_server' });
    return;
  }
  if (budgetUsed >= DAILY_ROOT_BUDGET) {
    res.status(429).json({ error: 'daily_root_budget_exhausted', budgetUsed });
    return;
  }
  try {
    budgetUsed++;
    const r = await fetch(`https://api.cesium.com/v1/assets/${ASSET_ID}/endpoint`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!r.ok) throw new Error(`ion endpoint HTTP ${r.status}`);
    const json = await r.json();
    let tilesetUrl = null, attributions = [];
    if ('externalType' in json) {
      tilesetUrl = json.options.url; // Google tileset URL (session credential in ?key=)
    } else if (json.url) {
      tilesetUrl = json.url;
      attributions = (json.attributions || []).map((a) => a.html);
    }
    sessionCache = { tilesetUrl, attributions, expiresAt: now + SESSION_TTL_MS };
    res.status(200).json({ ...sessionCache, cached: false, budgetUsed });
  } catch (e) {
    res.status(502).json({ error: 'handshake_failed', detail: String(e && e.message || e) });
  }
};
