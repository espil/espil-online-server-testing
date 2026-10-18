/*
 * GET /api/mapbox-token — serves the Mapbox token to the production
 * page. The token lives ONLY in the Vercel env var MAPBOX_TOKEN.
 * Production has no /.env file (it is gitignored and never deployed),
 * so on production hosts the client fetches the token here instead -
 * the same server-side pattern as the Places proxies. The token is
 * never committed to the repo. When the env var is missing, the
 * response carries only a status diagnostic, never a value.
 */
function allowedOrigin(req) {
  var ref = (req.headers && (req.headers.referer || req.headers.origin)) || '';
  if (!ref) return true;
  return /espil\.online/.test(ref) || /\.vercel\.app/.test(ref) || /localhost/.test(ref);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'GET only' }); return; }
  if (!allowedOrigin(req)) { res.status(403).json({ error: 'forbidden origin' }); return; }
  var key = process.env.MAPBOX_TOKEN || '';
  if (!key) { res.status(500).json({ error: 'MAPBOX_TOKEN not configured on server' }); return; }
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ token: key });
};
