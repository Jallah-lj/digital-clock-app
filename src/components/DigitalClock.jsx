import { useEffect, useMemo, useState } from 'react';

/**
 * DigitalClock
 * ------------
 * Owns the live "ticking" logic of the application.
 *
 * Key behaviours:
 *  - Stores the current time in state and updates it once per second.
 *  - The interval is aligned to the exact start of the next whole second,
 *    so the display flips precisely when the system clock's second changes.
 *  - Both the alignment timeout and the interval are cleared on unmount,
 *    preventing state updates on an unmounted component (memory leaks).
 *  - All formatting uses Intl.DateTimeFormat, which automatically respects
 *    the user's local timezone — no manual Date math required.
 *
 * The component re-renders only itself each second; the rest of the page
 * (toggles, layout) is unaffected, keeping renders cheap and predictable.
 */
export default function DigitalClock({ is24h = false }) {
  const [now, setNow] = useState(() => new Date());
  const [isLoading, setIsLoading] = useState(true);

  // Tick exactly once per second, aligned to the system clock.
  useEffect(() => {
    const msUntilNextSecond = 1000 - (Date.now() % 1000);
    let intervalId = null;

    // Wait until the next second boundary, then tick every 1000 ms.
    const timeoutId = setTimeout(() => {
      setNow(new Date());
      intervalId = setInterval(() => setNow(new Date()), 1000);
    }, msUntilNextSecond);

    // Cleanup on unmount: cancels any pending work and prevents memory leaks.
    return () => {
      clearTimeout(timeoutId);
      if (intervalId !== null) clearInterval(intervalId);
    };
  }, []);

  // Brief "boot" state — gives the UI a polished loading moment on first paint.
  useEffect(() => {
    const revealId = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(revealId);
  }, []);

  // Memoized formatter, rebuilt only when the hour format changes.
  // Constructing Intl objects is relatively expensive, so we never do it per tick.
  const timeFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        // h23 → 00–23 (no dayPeriod part), h12 → 01–12 with an AM/PM part.
        hourCycle: is24h ? 'h23' : 'h12',
      }),
    [is24h],
  );

  // Full date, e.g. "Monday, August 3, 2026".
  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
    [],
  );

  // Auto-detected IANA timezone of the user's device, e.g. "Africa/Kigali".
  const timeZoneName = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local Time',
    [],
  );

  // GMT offset label, e.g. "GMT+02:00". Recomputed each tick so it stays
  // correct across daylight-saving transitions. Guarded for older engines.
  const gmtOffset = useMemo(() => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        timeZoneName: 'longOffset',
      }).formatToParts(now);
      return parts.find((part) => part.type === 'timeZoneName')?.value ?? '';
    } catch {
      return '';
    }
  }, [now]);

  // ---------- Loading state ----------
  if (isLoading) {
    return (
      <div className="clock-body clock-body--loading">
        <div className="loader" role="status">
          <div className="loader__ring" aria-hidden="true" />
          <p className="loader__text" aria-hidden="true">
            Syncing with your local time…
          </p>
          {/* Screen readers only hear this concise announcement */}
          <span className="sr-only">Loading local time…</span>
        </div>
      </div>
    );
  }

  // ---------- Clock ----------
  // formatToParts lets us style/animate each unit of time independently.
  const parts = timeFormatter.formatToParts(now);
  const getPart = (type) => parts.find((part) => part.type === type)?.value ?? '';

  const hours = getPart('hour');
  const minutes = getPart('minute');
  const seconds = getPart('second');
  const ampm = getPart('dayPeriod'); // "AM"/"PM" in 12h mode, "" in 24h mode

  return (
    <div className="clock-body clock-body--ready">
      <div
        className="clock-display"
        role="timer"
        aria-live="off" // deliberately quiet — second-by-second announcements would be noisy
        aria-label={`Current time: ${hours}:${minutes}:${seconds}${ampm ? ` ${ampm}` : ''}`}
      >
        <span className="digit">{hours}</span>
        <span className="colon" aria-hidden="true">
          :
        </span>
        <span className="digit">{minutes}</span>
        <span className="colon" aria-hidden="true">
          :
        </span>
        {/* key={seconds} re-mounts the span every tick, replaying the animation */}
        <span key={seconds} className="digit digit--seconds">
          {seconds}
        </span>
        {ampm && <span className="ampm">{ampm}</span>}
      </div>

      <p className="date-line">{dateFormatter.format(now)}</p>

      <p className="tz-line">
        <span aria-hidden="true">🌍&nbsp;</span>
        {timeZoneName}
        {gmtOffset && <span className="tz-offset">&nbsp;· {gmtOffset}</span>}
      </p>
    </div>
  );
}
