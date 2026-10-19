#!/usr/bin/env python3
"""
Vercel build script: injects MAPBOX_TOKEN and OPENWEATHER_KEY from environment variables.
"""
import os
import sys

def main():
    # 2026-10-13: load .env (if present) as defaults - .env is the single home for all API keys
    try:
        with open('.env', 'r', encoding='utf-8') as _f:
            for _line in _f:
                _line = _line.strip()
                if _line and not _line.startswith('#') and '=' in _line:
                    _k, _v = _line.split('=', 1)
                    os.environ.setdefault(_k.strip(), _v.strip())
    except FileNotFoundError:
        pass
    mapbox_token = os.environ.get('MAPBOX_TOKEN', '')
    openweather_key = os.environ.get('OPENWEATHER_KEY', '')
    places_key = os.environ.get('GOOGLE_PLACES_KEY', '')
    
    if not mapbox_token:
        print("WARNING: MAPBOX_TOKEN not set", file=sys.stderr)
    if not openweather_key:
        print("WARNING: OPENWEATHER_KEY not set", file=sys.stderr)
    if not places_key:
        print("WARNING: GOOGLE_PLACES_KEY not set", file=sys.stderr)
    
    # HTML files (production)
    for html_path in ['index.html', 'vancouver.html']:
        try:
            with open(html_path, 'r', encoding='utf-8') as f:
                content = f.read()
            if places_key:
                content = content.replace('__PUT_YOUR_KEY_HERE__', places_key)
            if mapbox_token:
                content = content.replace('__PUT_YOUR_MAPBOX_TOKEN_HERE__', mapbox_token)
                # Also handle mapboxgl.accessToken pattern
                import re
                content = re.sub(
                    r"mapboxgl\.accessToken='__PUT_YOUR_MAPBOX_TOKEN_HERE__'",
                    f"mapboxgl.accessToken='{mapbox_token}'",
                    content
                )
            with open(html_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Processed {html_path}")
        except FileNotFoundError:
            print(f"Skip {html_path} (not found)", file=sys.stderr)
    
    # cauldron/static-config.js (if exists)
    config_path = 'cauldron/static-config.js'
    try:
        with open(config_path, 'r', encoding='utf-8') as f:
            content = f.read()
        if mapbox_token:
            content = content.replace('__PUT_YOUR_MAPBOX_TOKEN_HERE__', mapbox_token)
        if openweather_key:
            content = content.replace('__PUT_YOUR_OPENWEATHER_KEY_HERE__', openweather_key)
        with open(config_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Processed {config_path}")
    except FileNotFoundError:
        print(f"Skip {config_path} (not found)", file=sys.stderr)

if __name__ == '__main__':
    main()
