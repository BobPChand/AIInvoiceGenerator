# AI Invoice Generator

## Repository Purpose
This repository is the dedicated codebase for AI Invoice Generator.
It should not be used for ContentAI Pro or AI Resume Builder Pro changes.

AI-powered invoice and quote app built with React Native / Expo.
- GPT-4o powered invoice assistant
- Invoice and quote generation
- Stripe checkout integration
- Push notifications
- Voice input

## Setup
```bash
npm install
npx expo start
```

## Build for stores
```bash
npm install -g eas-cli
eas login
eas build --platform android   # Google Play
eas build --platform ios       # App Store (requires Apple Developer account)
```

## Backend
Powered by Base44: https://superagent-02ccfade.base44.app/functions/aiInvoice
