#!/usr/bin/env node
/*
 * Vercel build script (Node — always available in the build image):
 * injects GOOGLE_PLACES_KEY / MAPBOX_TOKEN / OPENWEATHER_KEY from
 * environment variables into the static files before deploy.
 * Replaces build_inject_tokens.py as the build entry (2026-10-14):
 * the python buildCommand made Vercel deployments error out.
 * This script NEVER exits non-zero — a failed injection must not
 * take the whole deployment down with it.
 */
const fs = require('fs');

function loadDotEnv() {
  // Local parity with the .env setup: real env vars win, .env fills gaps.
  try {
    const text = fs.readFileSync('.env', 'utf-8');
    text.split(/\r?\n/).forEach((line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      const i = line.indexOf('=');
      if (i > 0) {
        const k = line.slice(0, i).trim();
        const v = line.slice(i + 1).trim();
        if (!(k in process.env)) process.env[k] = v;
      }
    });
  } catch (e) { /* no .env — fine */ }
}

function inject(file, pairs) {
  let content;
  try {
    content = fs.readFileSync(file, 'utf-8');
  } catch (e) {
    console.log('Skip ' + file + ' (not found)');
    return;
  }
  let changed = false;
  for (const [placeholder, value] of pairs) {
    if (value && content.includes(placeholder)) {
      content = content.split(placeholder).join(value);
      changed = true;
    }
  }
  if (changed) {
    try {
      fs.writeFileSync(file, content);
      console.log('Processed ' + file);
    } catch (e) {
      console.error('WARNING: could not write ' + file + ': ' + e.message);
    }
  } else {
    console.log('Processed ' + file + ' (nothing to inject)');
  }
}

function main() {
  loadDotEnv();
  const places = process.env.GOOGLE_PLACES_KEY || '';
  const mapbox = process.env.MAPBOX_TOKEN || '';
  const openweather = process.env.OPENWEATHER_KEY || '';
  if (!places) console.error('WARNING: GOOGLE_PLACES_KEY not set');
  if (!mapbox) console.error('WARNING: MAPBOX_TOKEN not set');
  if (!openweather) console.error('WARNING: OPENWEATHER_KEY not set');

  const htmlPairs = [
    ['__PUT_YOUR_KEY_HERE__', places],
    ['__PUT_YOUR_MAPBOX_TOKEN_HERE__', mapbox],
  ];
  inject('index.html', htmlPairs);
  inject('vancouver.html', htmlPairs);
  inject('cauldron/static-config.js', [
    ['__PUT_YOUR_MAPBOX_TOKEN_HERE__', mapbox],
    ['__PUT_YOUR_OPENWEATHER_KEY_HERE__', openweather],
  ]);
  console.log('build_inject_tokens.js: done');
}

try {
  main();
} catch (e) {
  console.error('WARNING: build_inject_tokens.js failed: ' + (e && e.message));
}
process.exit(0);
