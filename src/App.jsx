import { useCallback, useEffect, useState } from 'react';
import DigitalClock from './components/DigitalClock.jsx';
import ThemeToggle from './components/ThemeToggle.jsx';
import FormatToggle from './components/FormatToggle.jsx';
import './App.css';

const THEME_STORAGE_KEY = 'chrono-theme';

/**
 * Resolve the starting theme on first render:
 *  1. Whatever the user picked last time (localStorage), else
 *  2. The OS/browser preference (prefers-color-scheme), else
 *  3. Dark — the clock's signature look.
 */
function getInitialTheme() {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') return saved === 'dark';
  } catch {
    // localStorage unavailable (e.g. private mode) — fall through.
  }
  if (typeof window.matchMedia === 'function') {
    return !window.matchMedia('(prefers-color-scheme: light)').matches;
  }
  return true;
}

export default function App() {
  // `isDark` drives the data-theme attribute; `is24h` drives the hour format.
  const [isDark, setIsDark] = useState(getInitialTheme);
  const [is24h, setIs24h] = useState(false);

  // Apply the theme to <html data-theme="…"> so every CSS custom property
  // flips at once, persist the choice, and sync the browser chrome color.
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', isDark ? '#0f172a' : '#fbcfe8');
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, isDark ? 'dark' : 'light');
    } catch {
      // Storage unavailable — the toggle still works for this session.
    }
  }, [isDark]);

  // Stable callbacks: with React.memo on the toggle components, these ensure
  // the buttons never re-render unless their props actually change.
  const toggleTheme = useCallback(() => setIsDark((dark) => !dark), []);
  const toggleFormat = useCallback(() => setIs24h((format) => !format), []);

  return (
    <main className="app">
      {/* Decorative blurred orbs floating behind the glass card */}
      <div className="orb orb--one" aria-hidden="true" />
      <div className="orb orb--two" aria-hidden="true" />

      <section className="clock-card" aria-label="Digital clock">
        <header className="status-bar">
          <span className="status-bar__live">
            <span className="live-dot" aria-hidden="true" />
            Live
          </span>
          <span className="status-bar__badge">Local Time</span>
        </header>

        {/* The ticking logic lives entirely inside DigitalClock */}
        <DigitalClock is24h={is24h} />

        {/* Controls are keyboard-focusable native buttons */}
        <footer className="controls">
          <FormatToggle is24h={is24h} onToggle={toggleFormat} />
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </footer>
      </section>
    </main>
  );
}
