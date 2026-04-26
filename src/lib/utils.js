// Shared utility functions

export function classNames(...classes) {
  return classes.filter(Boolean).join(' ');
}

export function formatTime(seconds) {
  if (seconds === undefined || seconds === null || isNaN(seconds)) return "00:00";
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export function calculateDuration(startTime, endTime) {
  if (!startTime) return 0;
  const start = new Date(startTime).getTime();
  const end = endTime ? new Date(endTime).getTime() : new Date().getTime();
  return Math.floor((end - start) / 1000);
}
