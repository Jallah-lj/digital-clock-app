# ⏱ Chrono — React Digital Clock

A modern, responsive, production-ready **digital clock** built with **React 18 + Vite**.
It renders your local time with glowing digits inside a frosted-glass card, auto-detects
your timezone, supports 12/24-hour formats, and ships with a smooth dark/light theme system.

> Built as a portfolio-quality project: clean component architecture, `Intl`-powered
> formatting, full keyboard/accessibility support, and zero external UI dependencies.

---

## ✨ Features

| Area | Details |
| --- | --- |
| ⏱ **Live clock** | Hours, minutes and seconds, updated **exactly once per second**, aligned to the system clock |
| 📅 **Full date** | e.g. `Monday, August 3, 2026` |
| 🌍 **Timezone** | Auto-detected IANA timezone (e.g. `Africa/Kigali`) **plus** GMT offset (e.g. `GMT+02:00`) |
| 🔄 **12h ⇄ 24h toggle** | With an AM/PM badge in 12-hour mode |
| 🌙 **Dark / Light themes** | Cross-fading gradients; persisted to `localStorage`; respects your OS preference on first visit |
| 🎨 **Design** | Glassmorphism card, animated gradient background, floating orbs, glowing digits, pulsing colons, per-second tick animation |
| ⚡ **Loading state** | Polished boot screen while the time "syncs" |
| ♿ **Accessibility** | ARIA labels, `role="timer"`, `aria-pressed` toggles, visible focus rings, `prefers-reduced-motion` support |
| 📱 **Responsive** | Fluid `clamp()` typography and breakpoints for desktop, tablet and mobile |

## 🧱 Tech Stack

- **React 18** — functional components + hooks (`useState`, `useEffect`, `useMemo`, `useCallback`, `memo`)
- **Vite 5** — dev server & production build
- **`Intl.DateTimeFormat`** — locale-aware, timezone-correct time/date formatting
- **Vanilla CSS** — custom properties for theming, animations, glassmorphism (no UI framework)

## 📁 Project Structure

```
digital-clock/
│
├── public/
│   └── clock.svg                 # favicon
│
├── src/
│   ├── components/
│   │   ├── DigitalClock.jsx      # ticking logic, time/date/timezone display, loading state
│   │   ├── ThemeToggle.jsx       # dark/light mode button (memoized, presentational)
│   │   └── FormatToggle.jsx      # 12h/24h button (memoized, presentational)
│   │
│   ├── App.jsx                   # theme & format state, layout, composition
│   ├── App.css                   # component styles (card, digits, controls, animations)
│   ├── index.css                 # global styles, design tokens, dark/light themes, a11y helpers
│   └── main.jsx                  # entry point (ReactDOM root + StrictMode)
│
├── index.html                    # HTML shell
├── vite.config.js                # Vite + React plugin
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** (check with `node -v`)
- npm (bundled with Node)

### 1. Install dependencies

```bash
cd digital-clock
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Open the printed URL — usually **http://localhost:5173**.

### 3. Production build

```bash
npm run build     # outputs an optimized bundle to dist/
npm run preview   # serves the production build locally
```

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server with HMR |
| `npm run build` | Create an optimized production build in `dist/` |
| `npm run preview` | Preview the production build locally |

## 🔍 How It Works

### 1-second ticking — aligned & leak-free

`DigitalClock` waits for the **next exact second boundary**, then starts a
`setInterval(1000)`. Both the alignment timeout and the interval are cleared
in the effect cleanup, so nothing keeps running after the component unmounts:

```jsx
useEffect(() => {
  const msUntilNextSecond = 1000 - (Date.now() % 1000);
  let intervalId = null;

  const timeoutId = setTimeout(() => {
    setNow(new Date());
    intervalId = setInterval(() => setNow(new Date()), 1000);
  }, msUntilNextSecond);

  return () => {
    clearTimeout(timeoutId);
    if (intervalId !== null) clearInterval(intervalId);
  };
}, []);
```

### Locale- & timezone-aware formatting

All displayed values come from **`Intl.DateTimeFormat`**, never manual `Date` math:

- Time → `hour/minute/second` with `hourCycle: 'h23' | 'h12'` (12h mode emits an AM/PM part)
- Date → `weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'`
- Timezone → `Intl.DateTimeFormat().resolvedOptions().timeZone`
- GMT offset → `timeZoneName: 'longOffset'` (recomputed every tick, so DST stays correct)

Formatters are memoized with `useMemo` so the (relatively expensive) `Intl`
objects are not rebuilt on every second.

### Theming

`App` stores `isDark` in state and writes it to `<html data-theme="…">`.
Every color is a CSS custom property defined twice (dark under `:root`, light
under `[data-theme='light']`), so the whole UI re-colors instantly. The
background is two stacked gradient layers that **cross-fade** (gradients can't
be transitioned directly). The choice persists in `localStorage` and falls
back to `prefers-color-scheme` on a first visit.

### Render performance

- Only `DigitalClock` re-renders each second; the card, toggles and background don't.
- Toggle components are wrapped in `React.memo` and receive `useCallback`-stabilized
  handlers, so they never re-render unnecessarily.
- The per-second tick animation is implemented by re-keying the seconds element —
  no animation libraries, no layout thrash.

## ♿ Accessibility Notes

- The time is exposed as `role="timer"` with a descriptive `aria-label`, and
  `aria-live="off"` prevents second-by-second screen-reader spam.
- Toggle buttons are native `<button>` elements with `aria-pressed` and
  descriptive `aria-label`s — fully operable via <kbd>Tab</kbd> + <kbd>Enter</kbd>/<kbd>Space</kbd>.
- A clear `:focus-visible` ring appears for keyboard users only.
- The brief loading screen announces itself via `role="status"` (with an
  `.sr-only` message).
- `prefers-reduced-motion: reduce` disables all non-essential animation.

## 🎨 Customization

- **Colors / glows / shadows** — edit the design tokens at the top of
  [`src/index.css`](src/index.css). Everything else updates automatically.
- **Fonts** — swap the Google Fonts import in `index.css` (`Orbitron` = digits,
  `Inter` = UI text).
- **Boot duration** — the `1200` ms timeout in `DigitalClock.jsx`.
- **Default format** — change `useState(false)` for `is24h` in `App.jsx`.

## 🌐 Browser Support

Works in all modern evergreen browsers (Chrome, Edge, Firefox, Safari).
`backdrop-filter` is progressively enhanced — unsupported browsers simply get
a solid translucent card.

## 📄 License

MIT — feel free to use this in your own portfolio.
