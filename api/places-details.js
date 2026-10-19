/*
 * GET /api/places-details?placeId=... — server-side proxy for Google Places
 * (New) Place Details. Key stays in the Vercel env var GOOGLE_PLACES_KEY.
 */
function allowedOrigin(req) {
  var ref = (req.headers && (req.headers.referer || req.headers.origin)) || '';
  if (!ref) return true;
  return /espil\.online/.test(ref) || /\.vercel\.app/.test(ref) || /localhost/.test(ref);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') { res.status(405).json({ error: 'GET only' }); return; }
  if (!allowedOrigin(req)) { res.status(403).json({ error: 'forbidden origin' }); return; }
  var key = process.env.GOOGLE_PLACES_KEY || '';
  if (!key) { res.status(500).json({ error: 'GOOGLE_PLACES_KEY not configured on server' }); return; }

  var placeId = (req.query && req.query.placeId) || '';
  if (!/^[\w-]{5,}$/.test(placeId)) { res.status(400).json({ error: 'bad placeId' }); return; }

  try {
    var g = await fetch('https://places.googleapis.com/v1/places/' + encodeURIComponent(placeId), {
      headers: {
        'X-Goog-Api-Key': key,
        'X-Goog-FieldMask': req.headers['x-goog-field-mask'] || 'displayName,primaryType,formattedAddress,location,rating,userRatingCount,reviews,photos',
      },
    });
    var text = await g.text();
    res.status(g.status);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(text);
  } catch (e) {
    res.status(502).json({ error: 'places upstream failed' });
  }
};
