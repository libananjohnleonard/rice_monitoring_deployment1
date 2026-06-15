export type FieldProfile = {
  id: string;
  profileName: string;
  plantedDate: string;
  plantedTime?: string;
  riceVariety: string;
  maturityDays: number;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = 'rice_field_profiles';

function isBrowser() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function sortProfiles(profiles: FieldProfile[]) {
  return [...profiles].sort((left, right) =>
    left.profileName.localeCompare(right.profileName)
  );
}

function createProfileId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  return `profile-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getFieldProfiles(): FieldProfile[] {
  if (!isBrowser()) return [];

  try {
    const rawProfiles = window.localStorage.getItem(STORAGE_KEY);
    if (!rawProfiles) return [];

    const parsed = JSON.parse(rawProfiles);
    if (!Array.isArray(parsed)) return [];

    return sortProfiles(
      parsed.filter(
        (profile): profile is FieldProfile => {
          if (!profile || typeof profile !== 'object') return false;

          const candidate = profile as Partial<FieldProfile>;

          return (
            typeof candidate.id === 'string' &&
            typeof candidate.profileName === 'string' &&
            typeof candidate.plantedDate === 'string' &&
            typeof candidate.riceVariety === 'string' &&
            typeof candidate.maturityDays === 'number'
          );
        }
      )
    );
  } catch {
    return [];
  }
}

export function saveFieldProfiles(profiles: FieldProfile[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sortProfiles(profiles)));
  window.dispatchEvent(new Event('field-profiles-updated'));
}

export function createFieldProfile(
  input: Omit<FieldProfile, 'id' | 'createdAt' | 'updatedAt'>
) {
  const timestamp = new Date().toISOString();
  const profile: FieldProfile = {
    ...input,
    id: createProfileId(),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  saveFieldProfiles([...getFieldProfiles(), profile]);
  return profile;
}

export function updateFieldProfile(
  id: string,
  input: Omit<FieldProfile, 'id' | 'createdAt' | 'updatedAt'>
) {
  const currentProfiles = getFieldProfiles();
  const existing = currentProfiles.find((profile) => profile.id === id);

  if (!existing) return null;

  const updatedProfile: FieldProfile = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  saveFieldProfiles(
    currentProfiles.map((profile) =>
      profile.id === id ? updatedProfile : profile
    )
  );

  return updatedProfile;
}

export function deleteFieldProfile(id: string) {
  saveFieldProfiles(getFieldProfiles().filter((profile) => profile.id !== id));
}
