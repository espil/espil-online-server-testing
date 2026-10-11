# Store Review Checklist

## Core app value
- Real-world anchored social RPG using Mapbox geography, POIs, buildings, and live location.
- Mobile controls are touch-first; keyboard is not required.
- Espil AI is disclosed as a local/connected assistant feature before use.

## Apple App Store notes
- Safety: no user-generated public posting is enabled in this prototype build.
- Performance: app must launch to a functional map or a clear offline/loading state.
- Privacy: location is used only to anchor the player avatar to the real world.
- Camera: optional expression mirroring; camera is not required for basic play.
- AI disclosure: Espil uses quadclipse/espil via Ollama/Qwen3 when connected; disclose if any personal data is sent to AI.

## Google Play notes
- Location permission must be prominent and tied to core gameplay.
- AI feature must include a reporting/feedback path before public release if it produces user-visible content.
- Data Safety form should declare location, camera, and AI/chat data behavior accurately.

## Required before submission
- Replace localhost WebView URL with production HTTPS URL.
- Add privacy policy URL in store metadata.
- Add support/contact email.
- Verify no copyrighted third-party character assets are included without license.
- Test Galaxy Z Flip class and iPhone 15 class layouts.
