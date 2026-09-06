# Washing Machine Timer PWA

A premium, offline-first Progressive Web App for tracking real washing machine cycles with a tactile, hardware-style UI. No account, no servers, no tracking — everything runs and persists 100% locally in your browser.

![Next.js 16](https://img.shields.io/badge/Next.js-16.3-black?logo=next.js)
![React 19](https://img.shields.io/badge/React-19-61dafb?logo=react)
![Tailwind v4](https://img.shields.io/badge/Tailwind-4-06b6d4?logo=tailwindcss)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Build status](https://img.shields.io/badge/build-passing-brightgreen)

## ✨ Features

### 🎛️ Program selection
- **Animated analog dial** — Drag-to-rotate knob with clickable program icons around the ring. Nearest-program snap on release, shortest-path rotation, and dial-click sound/haptic feedback on every program transition.
- **13 built-in programs** + fully **custom timer** (hours + minutes + your own label): Cotton, Eco 40-60, Mixed, Synthetics, Delicates, Quick Wash, Heavy Duty, Bedding, Towels, Baby Care, Rinse + Spin, Spin Only, Tub Clean. Each has its own icon, temperature, RPM, total duration, and multi-stage breakdown (Wash → Rinse → Spin).

### ⏱️ Live cycle tracking
- **Wall-clock-based timer** (not an interval counter) — the timer stays perfectly accurate even if the tab is backgrounded, throttled, or the device is rebooted.
- **Animated washing machine drum** with water level, rotating colored clothing shapes, speed tied to real program RPM, and per-state visual behavior (idle / washing / rinsing / spinning / paused / finished).
- **Stage progress bar** with overall percentage and per-stage breakdown.
- Countdown display + absolute finish time-of-day (e.g. *finishes at 3:42 PM*).
- Start / Pause / Resume / Cancel controls with their own sound cues.

### 🔔 Background & notifications
- **Page Visibility API integration** — the moment you return to the tab after the browser throttled it in the background, the display catches up instantly and fires the completion sequence (no waiting for the next 1-second tick).
- **Push notifications** for cycle end, with browser permission request flow.
- **Notification Triggers API** (Android Chrome / PWA) — schedules a system-level notification at the *exact wall-clock end time* via the service worker. Works even if you close the PWA or the browser is fully terminated. Automatically cancels and re-registers the trigger correctly on Pause, Resume, Cancel, and app reload.
- Chime-style completion sound (Web Audio API, zero external files), plus haptic vibration patterns on supported devices.

### ⚙️ Settings & data
- Push notifications (Enable / system-granted / system-denied state)
- Sound effects (per-interaction beeps + chimes, dial clicks, test button to preview)
- Haptic feedback (light / medium / success / error patterns on mobile)
- Dark mode toggle
- Default program select
- **Reset settings** / **Clear all data** with confirmation dialogs
- Offline-readiness indicator

### 📜 History
- Persistent wash history (localStorage) with program name, duration, and completion timestamp.
- Per-entry display + one-shot "clear all history" confirm dialog.
- Auto-saved on every successful completion, including custom timers.

### 📱 PWA / Offline
- **Installable** via Add to Home Screen (standalone mode, app icon, splash-screen theme color)
- `next-pwa` service worker — app runs with no internet after first visit
- Static prerender of all routes (`/`, `/settings`, `/history`, `/manifest.webmanifest`)

## 🧱 Tech stack

| Layer | Choice |
|---|---|
| Framework | **Next.js 16** (App Router, Turbopack, RSC + Client Components with `'use client'`) |
| UI runtime | **React 19** |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) |
| Types | **TypeScript 5** + strict mode |
| Service worker / PWA | `next-pwa` 5.6 |
| Audio | Built with the **Web Audio API** (oscillators + envelopes, no external files) |
| Haptics | **Vibration API** (`navigator.vibrate`) |
| Notifications | **Notification API** + **Notification Triggers API** (`TimestampTrigger`) via Service Worker Registration |
| Persistence | **localStorage** (settings, active timer, wash history) — fully client-side |

## 🚀 Getting started

```bash
# 1. Install dependencies
npm install

# 2. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Other scripts

```bash
npm run build    # Type-check + production build (static prerender + SW generation)
npm run start    # Serve the built production app
npm run lint     # ESLint
```

> 💡 **Service worker note:** `next-pwa` is intentionally disabled in `NODE_ENV === 'development'` (see `next.config.ts`), so the Notification Triggers and offline mode only kick in after a `npm run build && npm run start`. That's normal — it avoids HMR/service-worker conflicts during development.

## 📁 Project structure

```
washing-machine-timer/
├─ app/
│  ├─ page.tsx                 # Home (program knob + drum + timer + controls)
│  ├─ settings/page.tsx        # Settings page
│  ├─ history/page.tsx         # Wash history page
│  ├─ manifest.ts              # Web App Manifest (icons, theme, display)
│  └─ globals.css              # Tailwind + base styles
├─ components/
│  ├─ ProgramKnob.tsx          # Analog dial (drag + click, snap, feedback)
│  ├─ WashingDrum.tsx          # requestAnimationFrame-animated drum
│  ├─ TimerDisplay.tsx         # Countdown + end time
│  ├─ ControlButtons.tsx       # Start / Pause / Resume / Cancel
│  ├─ CycleProgress.tsx        # Stage + overall progress
│  └─ CustomTimerDialog.tsx    # Custom duration dialog
├─ data/programs.ts            # 13 default program definitions
├─ types/programs.ts           # WashingProgram, TimerData, TimerState types
├─ utils/
│  ├─ timer.ts                 # Persisted end-time timer (no tick drift)
│  ├─ history.ts               # History entry CRUD
│  └─ sound.ts                 # SoundManager + hapticFeedback (no assets)
├─ public/
│  ├─ icon-192x192.png
│  ├─ icon-512x512.png         # PWA icons (any + maskable)
│  └─ …                        # Auto-generated SW files after a build
├─ next.config.ts              # Next.js + next-pwa config
├─ global.d.ts                 # Ambient module declaration for next-pwa
└─ tsconfig.json               # strict: true, bundler module resolution
```

## 🔐 Privacy

Zero data leaves your device. Settings, active-timer state, and wash history are written only to your browser's `localStorage`. There is no backend, no tracking, no telemetry, and no network requests after the initial page load + service worker install.

## 🛟 Browser compatibility matrix

| Feature | Chrome/Edge (Desktop & Android PWA) | Safari (macOS/iOS) | Firefox |
|---|---|---|---|
| Core timer, knob, drum, history | ✅ | ✅ | ✅ |
| Installable PWA (offline) | ✅ | ✅ macOS 13+/iOS 16.4+ | ⚠️ Limited |
| In-app completion chime | ✅ | ✅ | ✅ |
| Web notification at finish *while app is open* | ✅ | ✅ | ✅ |
| Exact-time OS notification *while app is closed* | ✅ Android PWA (TimestampTrigger) | ❌ (no Trigger support) | ❌ |
| Haptic vibration | ✅ Android/mobile | ❌ (iOS Safari limitation) | ⚠️ Mobile only |

## 📜 License

Private project — do not redistribute without permission.
