export type HealthStatus = 'Healthy' | 'Moderate' | 'Poor';

export function getStatusFromScore(score: number): HealthStatus {
  if (score >= 70) return 'Healthy';
  if (score >= 40) return 'Moderate';
  return 'Poor';
}

export function resolveHealthStatus(
  healthScore: number,
  storedStatus?: string | null
): HealthStatus {
  const derivedStatus = getStatusFromScore(Math.round(healthScore));

  if (
    storedStatus === 'Healthy' ||
    storedStatus === 'Moderate' ||
    storedStatus === 'Poor'
  ) {
    return storedStatus === derivedStatus ? storedStatus : derivedStatus;
  }

  return derivedStatus;
}

export function scoreBoxClasses(status: HealthStatus) {
  switch (status) {
    case 'Healthy':
      return {
        box: 'bg-emerald-100/70',
        label: 'text-emerald-600',
        value: 'text-emerald-900',
      };
    case 'Moderate':
      return {
        box: 'bg-amber-100/70',
        label: 'text-amber-600',
        value: 'text-amber-900',
      };
    case 'Poor':
      return {
        box: 'bg-red-100/70',
        label: 'text-red-600',
        value: 'text-red-900',
      };
  }
}
