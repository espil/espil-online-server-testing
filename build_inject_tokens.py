#!/usr/bin/env python3
"""
Vercel build script: injects MAPBOX_TOKEN and OPENWEATHER_KEY from environment variables.
Replaces placeholders in cauldron/static-config.js
"""
import os
import re
import sys

def main():
    mapbox_token = os.environ.get('MAPBOX_TOKEN', '')
    openweather_key = os.environ.get('OPENWEATHER_KEY', '')
    
    if not mapbox_token:
        print("WARNING: MAPBOX_TOKEN not set, using placeholder", file=sys.stderr)
        mapbox_token = '__PUT_YOUR_MAPBOX_TOKEN_HERE__'
    
    if not openweather_key:
        print("WARNING: OPENWEATHER_KEY not set, using placeholder", file=sys.stderr)
        openweather_key = '__PUT_YOUR_OPENWEATHER_KEY_HERE__'
    
    config_path = 'cauldron/static-config.js'
    
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    content = content.replace('__PUT_YOUR_MAPBOX_TOKEN_HERE__', mapbox_token)
    content = content.replace('__PUT_YOUR_OPENWEATHER_KEY_HERE__', openweather_key)
    
    with open(config_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Injected tokens into {config_path}")

if __name__ == '__main__':
    main()
