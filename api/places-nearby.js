/*
 * POST /api/places-nearby — server-side proxy for Google Places (New) Nearby Search.
 * The API key lives ONLY in the Vercel env var GOOGLE_PLACES_KEY and never
 * reaches the browser. The client sends the same body + X-Goog-FieldMask
 * header it used for the direct call; its own X-Goog-Api-Key header (the
 * 'proxy' sentinel) is ignored here.
 */
function allowedOrigin(req) {
  var ref = (req.headers && (req.headers.referer || req.headers.origin)) || '';
  if (!ref) return true;
  return /espil\.online/.test(ref) || /\.vercel\.app/.test(ref) || /localhost/.test(ref);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') { res.status(405).json({ error: 'POST only' }); return; }
  if (!allowedOrigin(req)) { res.status(403).json({ error: 'forbidden origin' }); return; }
  var key = process.env.GOOGLE_PLACES_KEY || '';
  if (!key) { res.status(500).json({ error: 'GOOGLE_PLACES_KEY not configured on server' }); return; }

  var body = '';
  try {
    body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {});
  } catch (e) { body = '{}'; }

  try {
    var g = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': req.headers['x-goog-field-mask'] || 'places.displayName,places.primaryType,places.formattedAddress,places.location',
      },
      body: body,
    });
    var text = await g.text();
    res.status(g.status);
    res.setHeader('Content-Type', 'application/json');
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: 'places upstream failed' });
  }
};
