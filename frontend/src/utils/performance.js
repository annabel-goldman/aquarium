export function getIsLowPowerMode() {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return false;
  }

  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const lowCoreCount = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4;

  return Boolean(prefersReducedMotion || lowCoreCount);
}
