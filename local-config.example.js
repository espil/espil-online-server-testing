/* Espil.Online - LOCAL KEYS (example)
 *
 * Two accepted homes for keys locally (both gitignored, never tracked):
 *
 * A) The repo-root /.env file:
 *
 *   GOOGLE_PLACES_KEY=your_google_places_key
 *   MAPBOX_TOKEN=your_mapbox_public_token
 *
 * B) A repo-root /local-config.js file (loaded by index.html):
 *
 *   window.__ESPIL_LOCAL_CONFIG__ = {
 *     GOOGLE_PLACES_KEY: 'your_google_places_key',
 *     mapboxToken: 'your_mapbox_public_token'
 *   };
 *
 * GOOGLE_PLACES_KEY: used by the /vancouver store pages for live
 * Places data on this machine.
 * Mapbox token: a Mapbox PUBLIC token (starts with pk.). The map
 * phase shows the Mapbox map with this token; without it the game
 * still runs and shows an on-screen notice instead of the map.
 * The token is read from .env (MAPBOX_TOKEN) or from local-config.js
 * (MAPBOX_TOKEN or mapboxToken), whichever is present.
 */
