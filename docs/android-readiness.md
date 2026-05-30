# Gradiate Android Readiness

This project remains a React + Vite + Firebase web app. The Android path should start with a clean PWA, then package the same hosted app for Android when the product is ready.

## Mobile Readiness Audit

- Navbar: uses the existing sticky `.navbar-responsive` and burger menu. The current layout is small-screen friendly, but the duplicated navbar markup across pages should be consolidated later before major redesign work.
- Auth pages: email/password flow uses Firebase Auth directly, keeps form loading states, and uses compact mobile form CSS. The verification API route stays network-only through the service worker.
- Community page: already has mobile-specific controls for view/sort, bounded feed/comment queries, and comment listeners only when comments are expanded. The feed listener is realtime, so keep `POSTS_LIMIT` conservative on mobile.
- Past papers page: static local subject data, lazy route chunk, Firestore reads only for a signed-in user's saved subjects. External PDF links are not cached by the app service worker.
- Bursaries pages: guest page uses static data; signed-in dashboard reads bookmark documents once instead of using a realtime listener. Provider logos are lazy-loaded and have generated fallbacks.
- Profile page: profile data and community summaries use one-time reads with `limit(8)` for summary sections. Auth state still comes from Firebase Auth and remains outside the service worker cache.
- Dashboard/admin pages: route-level lazy loading is already in place. Admin dashboard uses aggregate count reads and limited report queries instead of broad client-side scans.

## PWA Support Added

- `public/manifest.json` declares the Gradiate app name, short name, standalone display mode, start URL, theme color, background color, categories, icons, and shortcuts.
- `public/icons/` contains 192px, 512px, maskable, and Apple touch icons.
- `public/offline.html` provides a basic fallback for offline navigation.
- `public/sw.js` caches only the app shell, same-origin static assets, and same-origin images. It excludes `/api` and does not cache Firestore or Firebase Auth responses.
- `src/components/PwaInstallPrompt.jsx` listens for the browser install event and shows a small dismissible prompt only when the browser says the app is installable.

## Android Packaging Recommendation

Use Trusted Web Activity first.

Why: Gradiate already runs as a hosted Firebase web app and does not currently need native device APIs. A TWA keeps one production web app, uses the user's browser runtime, and is designed for launching PWA content from an Android app. Android's TWA docs also require the Android app and site to be verified as the same owner through Digital Asset Links.

Use Capacitor later if Gradiate needs native-only features such as native push notification handling, camera/file APIs, deep native storage, background tasks, or custom native screens. Capacitor is designed to be added to existing modern web apps and uses a built web assets directory such as `dist`.

Useful official docs:

- TWA overview: https://developer.android.com/develop/ui/views/layout/webapps/trusted-web-activities
- Capacitor install/add Android workflow: https://capacitorjs.com/docs/getting-started
- Google Play preview assets: https://support.google.com/googleplay/android-developer/answer/9866151
- Google Play icon specs: https://developer.android.com/distribute/google-play/resources/icon-design-specifications

## Later Android Steps

1. Finalize production PWA quality on `https://gradiate.co.za`: HTTPS, manifest, service worker, icons, offline fallback, and route rewrites.
2. Choose package name, preferably `za.co.gradiate.app`.
3. Create final launcher assets: adaptive foreground/background, 192px and 512px PWA icons, maskable icon, splash screen artwork, and a Play Store 512x512 high-res icon.
4. For TWA, generate an Android wrapper with Bubblewrap or Android Studio, then publish Digital Asset Links at `/.well-known/assetlinks.json` after the release signing key is known.
5. For Capacitor, only if needed, install Capacitor, set `webDir` to `dist`, run `npm run build`, `npx cap add android`, and `npx cap sync`.
6. Prepare Google Play listing assets: app name `Gradiate`, short description, full description, phone screenshots, feature graphic 1024x500, privacy policy URL, support email, data safety answers, and target audience declaration.
7. Test on low-end Android devices: install flow, auth persistence, offline fallback, profile load, community feed, past paper links, bursary filters, and Firebase rules.

## Firebase Notes

No Firestore schema, rules, or indexes were changed for the PWA work. If TWA is used later, the only web-hosting addition should be `/.well-known/assetlinks.json` for Android app/site verification.
