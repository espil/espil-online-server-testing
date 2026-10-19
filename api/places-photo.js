/*
 * GET /api/places-photo?name=places/{id}/photos/{ref}&maxWidthPx=400
 * Server-side proxy for Google Places photo media — the direct <img> URL
 * would need the key in the page, so the image is streamed through here.
 * Key stays in the Vercel env var GOOGLE_PLACES_KEY.
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

  var name = (req.query && req.query.name) || '';
  if (!/^places\/[\w-]+\/photos\/[\w-]+$/.test(name)) { res.status(400).json({ error: 'bad photo name' }); return; }
  var w = parseInt((req.query && req.query.maxWidthPx) || '400', 10);
  if (!(w >= 50 && w <= 1600)) w = 400;

  try {
    var url = 'https://places.googleapis.com/v1/' + name + '/media?maxWidthPx=' + w + '&key=' + encodeURIComponent(key);
    var g = await fetch(url); // follows Google's redirect to the image
    if (!g.ok) {
      var text = await g.text();
      res.status(g.status);
      res.setHeader('Content-Type', 'application/json');
      res.send(text);
      return;
    }
    var buf = Buffer.from(await g.arrayBuffer());
    res.status(200);
    res.setHeader('Content-Type', g.headers.get('content-type') || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(buf);
  } catch (e) {
    res.status(502).json({ error: 'places photo upstream failed' });
  }
};
