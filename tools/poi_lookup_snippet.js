/* ============================================================================
   poi_lookup_snippet.js — drop-in replacement for the runtime Overpass call
   in the building-name pill (index.html, ~line 1457 fetchBuildingName).

   What it changes and why:
   - Loads assets/pois/downtown-vancouver.json ONCE (baked by
     tools/bake_pois.py on a machine with real internet).
   - Nearest-POI lookup is pure math client-side: zero network calls per
     area, zero API cost, works offline, no Overpass fair-use problem at
     100 players.
   - Fixes the node-only bug: baked data covers nodes, ways AND relations,
     so real buildings (mapped as ways in OSM) are found.

   How to apply (takes ~2 minutes):
   1. Run:  python tools/bake_pois.py        (on your PC — needs internet)
      -> creates assets/pois/downtown-vancouver.json
   2. In index.html, REPLACE the body of fetchBuildingName(b, cb) with the
      code below (keep the function signature and the b.name short-circuit).
   3. Delete (or leave unused) bldgNameCache — the POI list replaces it.
   4. Test: walk near a building -> the pill shows the real baked name.
      If the JSON is missing, it falls back to 'Downtown Vancouver'.

   Note: this snippet does NOT change updateBuildingProximity, the pill
   markup, or the throttle — only the name source.
   ========================================================================== */

    /* Baked POI lookup — replaces the runtime Overpass fetch. */
    var bakedPois = null, bakedPoisLoading = false;
    function loadBakedPois(cb) {
      if (bakedPois) { cb(); return; }
      if (bakedPoisLoading) { var iv = setInterval(function () {
        if (bakedPois) { clearInterval(iv); cb(); } }, 200); return; }
      bakedPoisLoading = true;
      fetch('assets/pois/downtown-vancouver.json')
        .then(function (r) { return r.json(); })
        .then(function (j) { bakedPois = j; cb(); })
        .catch(function () { bakedPois = []; cb(); }); /* missing file -> fallback */
    }
    function nearestBakedPoi(lat, lng, maxM) {
      if (!bakedPois || !bakedPois.length) return null;
      var best = null, bestD = maxM;
      for (var i = 0; i < bakedPois.length; i++) {
        var p = bakedPois[i];
        var dLat = (p.lat - lat) * 111320;
        var dLng = (p.lng - lng) * 111320 * Math.cos(lat * Math.PI / 180);
        var d = Math.sqrt(dLat * dLat + dLng * dLng);
        if (d < bestD) { bestD = d; best = p; }
      }
      return best ? best.n : null;
    }
    /* Replace the existing fetchBuildingName with this version: */
    function fetchBuildingName(b, cb) {
      if (b.name) { cb(b.name); return; }
      var ll = mapToLatLng(b.x, b.z);
      loadBakedPois(function () {
        var nm = nearestBakedPoi(ll.lat, ll.lng, 60) || 'Downtown Vancouver';
        b.name = nm; cb(nm);
      });
    }
