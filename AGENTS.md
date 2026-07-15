# AGENTS

This repository is an Expo-managed React Native app branded as `AI Invoice Generator`.

## What this project is

- Mobile app built with React Native + Expo.
- Main app entry is `App.js`.
- Screens live in `src/screens/`.
- Business logic and services live in `src/services/`.
- No native `ios/` or `android/` folder in the repo; it is an Expo-managed app.
- Backend AI chat integration is external and not contained in this repo.

## Key behaviors

- `src/services/AIService.js` calls a remote AI endpoint:
  - `https://superagent-02ccfade.base44.app/functions/aiChat`
  - Sends `{ message, history }` and expects a JSON response with `reply`.
- `src/screens/ChatScreen.js` builds a chat history from previous messages and displays user/assistant bubbles.
- `src/services/RevenueCatService.js` contains the RevenueCat integration and placeholder API keys.
  - `ENTITLEMENT_PRO` is the active entitlement name.
  - This module handles initialization, offerings, purchases, restoration, and status checks.
- App-level navigation is defined in `App.js` using bottom tabs and screens: Dashboard, Chat, Tasks, Insights, Settings.
- Notifications are configured via `expo-notifications` in `App.js`.

## Project conventions

- Functional React components with hooks.
- Styling uses inline objects and `StyleSheet.create` in screen files.
- Most imports are from `expo`, `react-native`, `@react-navigation`, and `@expo/vector-icons`.
- Keep package versions compatible with Expo SDK 52.

## Useful commands

- `npm install`
- `npx expo start`
- `npm run android`
- `npm run ios`
- `npm run web`

## Notes for AI coding agents

- Do not assume a native bare workflow; this app is Expo-managed.
- The AI chat backend is not part of this repository; changes to `src/services/AIService.js` should preserve the existing request/response format unless the external service is intentionally updated.
- If updating RevenueCat logic, keep `ENTITLEMENT_PRO` and the existing purchase/restore flow in mind.
- Prefer small, incremental UI changes in screen files rather than broad refactors unless requested.

## Reference

- See `README.md` for project setup and build instructions.
