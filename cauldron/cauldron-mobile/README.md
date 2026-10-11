# Cauldron Mobile

Expo/React Native shell for testing the Cauldron web prototype as an app container.

## Run

```powershell
npm install
npm run start
```

## Device checks

- Galaxy Z Flip class: test narrow/tall portrait, mobile controls, location follow.
- iPhone 15 class: test safe-area top/bottom, mobile controls, location permission.

## Builds

```powershell
npm run build:android
npm run build:ios
```

Expo/EAS is used because React Native officially recommends Expo as the production-grade framework for new projects, and EAS supports Android/iOS cloud builds.
