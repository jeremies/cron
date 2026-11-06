# Clock — Timer, Stopwatch & Alarm (PWA & Capacitor Android)

A Google Search-styled Clock application featuring a **Timer**, **Stopwatch**, and **Alarm**, built with React 19, TypeScript, Vite, Tailwind CSS, and Capacitor 7 for Android.

---

## ✨ Features

### ⏱️ Timer (Matching Google Search Card UI)
- **Classic Google Aesthetic**: Clean Material 3 white card with pill navigation tabs, large bold digital numbers, and signature Google blue accents (`#1a73e8`).
- **Quick Increments**: `+0:30`, `+1:00`, `+5:00` quick-add chips with instant haptic feedback.
- **Direct Editing**: Click the numbers while paused or idle to customize the hours, minutes, and seconds.
- **Multiple Simultaneous Timers**: Manage multiple labeled timers (e.g. *Tea*, *Workout*, *Pasta*) running concurrently with circular progress indicators.
- **Progress Tracking**: Responsive linear and circular progress bars showing exact remaining percentage.

### ⏱️ Stopwatch
- **High-Precision**: Centisecond precision (`00:00.00`) calculated from `performance.now()` delta timestamps (immune to background browser throttling).
- **Lap Tracking**: Record lap times and splits with automatic identification of **Fastest** (green) and **Slowest** (amber) laps.
- **Lap History Management**: Clear or review previous laps with persistent storage.

### ⏰ Alarm
- **Multiple Configurable Alarms**: Time picker (12h/24h), custom name/label, toggle switches, and countdown badge (*"in 8h 15m"*).
- **Day of Week Recurrence**: Choose specific repeat days (Mon–Sun) or select quick presets (*Weekdays*, *Every day*, *Once*).
- **Snooze Configuration**: Configurable snooze length (5, 10, 15, or 20 minutes).

### 🔔 Audio, Haptics & Notifications
- **100% Offline Web Audio API Synthesizer**: Zero external audio downloads required. Includes 4 selectable sound profiles:
  - *Digital Beep* (Classic watch beeps)
  - *Soothing Chime* (Melodic harmonic arpeggio)
  - *Classic Bell* (Resonant clock bell)
  - *Urgent Pulse* (High-energy siren)
- **Sound Toggle**: Quick mute/unmute control in the top-right header.
- **Full-Screen Ringing Overlay**: Pulsing alarm modal when a timer or alarm fires, with celebratory confetti for completed timers and clear *Stop & Dismiss* / *Snooze* controls.
- **Native Android & Web Notifications**: Cross-platform notifications via `@capacitor/local-notifications` and the Web Notifications API.
- **Haptic Vibration**: Tactile feedback on taps and pulsing vibration patterns during ringing via `@capacitor/haptics`.

### 🌓 PWA & Native Ready
- **PWA Manifest & Service Worker**: Installable on Android, iOS, Chrome, Edge, and macOS, with full offline functionality.
- **Capacitor 7 Android Project**: Native Android project pre-configured in `android/` (`com.cron.clock`) with required alarm and notification permissions.
- **Theme & Fullscreen**: Automatic system preference detection + manual Light/Dark toggle, and Fullscreen toggle.

---

## 🚀 Getting Started

### 1. Development Server
Start the local Vite development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Build Web / PWA
Create the production build:
```bash
npm run build
```

### 3. Build & Sync to Android
Build the web assets and sync to the native Android project:
```bash
npm run build:cap
```

### 4. Open in Android Studio
Launch Android Studio with the pre-configured project:
```bash
npm run cap:open
```
Or run directly on a connected device/emulator:
```bash
npx cap run android
```

---

## 📁 Project Structure

```
├── android/                   # Native Android Capacitor project (com.cron.clock)
├── public/
│   ├── favicon.svg            # App vector icon
│   ├── manifest.webmanifest   # PWA manifest
│   └── sw.js                  # Service Worker for offline caching
├── src/
│   ├── components/
│   │   ├── Header.tsx         # Pill navigation tabs, mute toggle, dark mode, fullscreen
│   │   ├── TimerTab.tsx       # Main Google timer card & multi-timer list
│   │   ├── StopwatchTab.tsx   # Centisecond stopwatch with lap split records
│   │   ├── AlarmTab.tsx       # Configurable alarms with recurring days
│   │   ├── AlarmModal.tsx     # Add/edit alarm dialog
│   │   ├── TimeInputModal.tsx # Set timer duration & sound dialog
│   │   └── RingingModal.tsx   # Ringing overlay with snooze/dismiss & sound
│   ├── services/
│   │   ├── audioService.ts    # Web Audio API tone synthesis
│   │   ├── notificationService.ts # LocalNotifications & Web Notification API
│   │   ├── vibrationService.ts # Haptics & vibration
│   │   └── storageService.ts  # LocalStorage persistence
│   ├── types/
│   │   └── index.ts           # TypeScript type definitions
│   ├── utils/
│   │   └── timeFormat.ts      # Time formatters & alarm delta calculations
│   ├── App.tsx                # App root & global ticking loop
│   ├── main.tsx               # App entrypoint
│   └── index.css              # Tailwind base & custom styles
├── capacitor.config.ts        # Capacitor configuration
├── tailwind.config.js         # Tailwind theme configuration
└── vite.config.ts             # Vite build configuration
```
