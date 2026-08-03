import { memo } from 'react';

/**
 * FormatToggle — pill button that switches the clock between
 * 12-hour (with AM/PM) and 24-hour display.
 *
 * Presentational only: the `is24h` state lives in <App />. Memoized to avoid
 * re-renders when unrelated state changes elsewhere.
 */
function FormatToggle({ is24h, onToggle }) {
  const label = is24h ? 'Switch to 12-hour format' : 'Switch to 24-hour format';

  return (
    <button
      type="button"
      className="toggle-btn"
      onClick={onToggle}
      aria-pressed={is24h}
      aria-label={label}
      title={label}
    >
      <ClockIcon />
      <span>{is24h ? '24-Hour' : '12-Hour'}</span>
    </button>
  );
}

/* Simple clock-face icon — decorative, hidden from assistive technology. */

function ClockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export default memo(FormatToggle);
