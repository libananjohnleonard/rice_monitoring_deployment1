export type MaturityStage =
  | 'No planting date'
  | 'Vegetative window'
  | 'Early discoloration warning'
  | 'Maturity window'
  | 'Past maturity window';

export type MaturityAssessment = {
  cropAgeDays?: number;
  maturityDays?: number;
  maturityWindowStart?: number;
  maturityWindowEnd?: number;
  stage: MaturityStage;
  findings?: string;
  prediction?: string;
  harvestParameter?: string;
  message: string;
};

export const RICE_VARIETY_OPTIONS = [
  { value: 'NSIC Rc 298 - Matatag 6', label: 'NSIC Rc 298 - Matatag 6', maturityDays: 104 },
  { value: 'NSIC Rc 308 - Tubigan 16', label: 'NSIC Rc 308 - Tubigan 16', maturityDays: 111 },
  { value: 'NSIC Rc 352 - Tubigan 28', label: 'NSIC Rc 352 - Tubigan 28', maturityDays: 114 },
  { value: 'PSB Rc 10 - Pagsanjan', label: 'PSB Rc 10 - Pagsanjan', maturityDays: 106 },
  {
    value: 'Kalinayan - local aromatic upland rice variety',
    label: 'Kalinayan - local aromatic upland rice variety',
    maturityDays: 120,
  },
] as const;

function normalizeVarietyName(value?: string) {
  return (value ?? '')
    .replace(/â€”|—|–/g, '-')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export function getMaturityDaysForVariety(variety?: string) {
  const normalizedVariety = normalizeVarietyName(variety);

  return RICE_VARIETY_OPTIONS.find(
    (item) => normalizeVarietyName(item.value) === normalizedVariety
  )?.maturityDays;
}

export function calculateCropAgeDays(
  plantedDate?: string,
  plantedTime?: string,
  referenceDate: Date | string = new Date()
) {
  if (!plantedDate) return undefined;

  const plantedClock = plantedTime?.slice(0, 5) || '00:00';
  const plantedAt = new Date(`${plantedDate.slice(0, 10)}T${plantedClock}:00`);
  const referenceDateValue =
    referenceDate instanceof Date ? referenceDate : new Date(referenceDate);

  if (
    Number.isNaN(plantedAt.getTime()) ||
    Number.isNaN(referenceDateValue.getTime())
  ) {
    return undefined;
  }

  const diffMs = referenceDateValue.getTime() - plantedAt.getTime();

  if (diffMs < 0) return 0;

  return Math.floor(diffMs / 86_400_000) + 1;
}

export function resolveMaturityDays(
  riceVariety?: string,
  maturityDays?: number
) {
  return maturityDays || getMaturityDaysForVariety(riceVariety);
}

export function getMaturityWindow(maturityDays?: number) {
  if (!maturityDays) return undefined;

  return {
    start: Math.max(1, maturityDays - 20),
    end: maturityDays,
  };
}
