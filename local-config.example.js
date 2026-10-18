/* Espil.Online - LOCAL KEYS (example)
 *
 * Keys live in ONE place locally: the repo-root /.env file
 * (gitignored, never tracked):
 *
 *   GOOGLE_PLACES_KEY=your_google_places_key
 *   MAPBOX_TOKEN=pk.your_mapbox_public_token
 *
 * GOOGLE_PLACES_KEY: used by the /vancouver store pages for live
 * Places data on this machine.
 * MAPBOX_TOKEN: a Mapbox PUBLIC token (starts with pk.). The map
 * phase shows the Mapbox map with this token; without it the game
 * still runs and shows an on-screen notice instead of the map.
 *
 * Do NOT put keys in local-config.js: that file is served as-is from
 * the web root, so anything written in it is exposed in page source.
 * The game does not read keys from local-config.js. (Han, 2026-10-17)
 */
