# ApexQuest Native App Setup Guide

## Overview
Your app is now configured for iOS and Android deployment with Apple Health / Health Connect integration.

## Quick Start

### 1. Export to GitHub
Click the GitHub button in the top right to export your project.

### 2. Local Setup
```bash
git clone <your-repo>
cd <your-repo>
npm install
npm run build
```

### 3. Add Native Platforms
```bash
# Initialize Capacitor (already configured)
npx cap init

# Add iOS (requires Mac with Xcode)
npx cap add ios

# Add Android (requires Android Studio)
npx cap add android

# Sync web build to native platforms
npx cap sync
```

### 4. Install Health Plugin
```bash
# After adding platforms, install the health plugin
npm install @capacitor-community/health
npx cap sync
```

### 5. Run on Device

**iOS:**
```bash
npx cap open ios
# Then run from Xcode on a real device (HealthKit doesn't work in simulator)
```

**Android:**
```bash
npx cap open android
# Run from Android Studio on device/emulator
```

## Features Implemented

✅ Capacitor configuration with hot-reload for development
✅ Platform detection utilities
✅ Health sync service with bidirectional sync
✅ Health sync UI in Settings
✅ Workout completion syncs to Health automatically
✅ Database schema for sync logs and status tracking
✅ React hooks for easy health integration

## Health Sync Capabilities

- **Export to Health**: Completed workouts automatically sync
- **Import from Health**: Fetch workouts from last 30 days
- **Body Weight Sync**: Two-way sync with health platforms
- **Manual Sync**: Force sync anytime from Settings
- **Sync History**: View all sync activity

## Next Steps

1. Test on real iOS/Android devices
2. Configure app icons and splash screens
3. Set up signing certificates for distribution
4. Submit to App Store / Google Play

## Development Mode

The app is configured for hot-reload during development. Access via:
`https://d297ef1d-2177-41ef-8d87-722d29ed47d8.lovableproject.com?forceHideBadge=true`

## Notes

- Health sync only works on native platforms (iOS/Android)
- Web version shows "unavailable" message for health features
- HealthKit requires real iOS device for testing
- All code is web-safe with graceful fallbacks
