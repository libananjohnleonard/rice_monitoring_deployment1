import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Edit3, Image as ImageIcon, Plus, Sprout, Trash2 } from 'lucide-react';
import {
  resolveHarvestStatus,
  type AnalysisHistoryItem,
} from '../components/AnalysisResults';
import {
  RICE_VARIETY_OPTIONS,
  getMaturityDaysForVariety,
} from '../lib/riceMaturity';
import {
  createFieldProfile,
  deleteFieldProfile,
  getFieldProfiles,
  updateFieldProfile,
  type FieldProfile,
} from '../lib/fieldProfiles';
import { API_BASE_URL } from '../lib/config';
import { fetchJson } from '../lib/http';

type ProfileFormState = {
  profileName: string;
  plantedDate: string;
  plantedTime: string;
  riceVariety: string;
  maturityDays: number | '';
};

const emptyForm: ProfileFormState = {
  profileName: '',
  plantedDate: '',
  plantedTime: '',
  riceVariety: '',
  maturityDays: '',
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Not set';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

function toFormState(profile: FieldProfile): ProfileFormState {
  return {
    profileName: profile.profileName,
    plantedDate: profile.plantedDate,
    plantedTime: profile.plantedTime ?? '',
    riceVariety: profile.riceVariety,
    maturityDays: profile.maturityDays,
  };
}

function categoryLabel(category: AnalysisHistoryItem['category']) {
  return category === 'whole_field' ? 'Whole Field' : 'Partial Field';
}

function statusClasses(status: string) {
  switch (status) {
    case 'Healthy':
      return 'bg-emerald-100 text-emerald-700';
    case 'Moderate':
      return 'bg-amber-100 text-amber-700';
    case 'Poor':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function ManageProfilesPage() {
  const [profiles, setProfiles] = useState<FieldProfile[]>(() => getFieldProfiles());
  const [analyses, setAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [form, setForm] = useState<ProfileFormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [historyError, setHistoryError] = useState('');
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [deletingAnalysisId, setDeletingAnalysisId] = useState<string | null>(null);
  const [deletingProfileId, setDeletingProfileId] = useState<string | null>(null);

  const isEditing = editingId !== null;
  const selectedVarietyMaturity = getMaturityDaysForVariety(form.riceVariety);
  const previewMaturityDays = selectedVarietyMaturity;

  const sortedProfiles = useMemo(
    () =>
      [...profiles].sort((left, right) =>
        left.profileName.localeCompare(right.profileName)
      ),
    [profiles]
  );
  const selectedProfile = useMemo(
    () =>
      sortedProfiles.find((profile) => profile.id === selectedProfileId) ??
      sortedProfiles[0],
    [selectedProfileId, sortedProfiles]
  );
  const selectedProfileAnalyses = useMemo(() => {
    if (!selectedProfile) return [];

    return analyses.filter(
      (item) =>
        item.profileId === selectedProfile.id ||
        (!item.profileId && item.profileName === selectedProfile.profileName)
    );
  }, [analyses, selectedProfile]);

  useEffect(() => {
    if (!selectedProfileId && sortedProfiles[0]) {
      setSelectedProfileId(sortedProfiles[0].id);
    }
  }, [selectedProfileId, sortedProfiles]);

  useEffect(() => {
    let isActive = true;

    const fetchProfileAnalyses = async () => {
      try {
        setIsLoadingHistory(true);
        setHistoryError('');
        const data = await fetchJson<AnalysisHistoryItem[]>(
          `${API_BASE_URL}/api/analyses?limit=500`,
          { cache: 'no-store' }
        );

        if (isActive) {
          setAnalyses(data);
        }
      } catch (err) {
        if (isActive) {
          setHistoryError(
            err instanceof Error ? err.message : 'Failed to load profile uploads.'
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingHistory(false);
        }
      }
    };

    void fetchProfileAnalyses();

    return () => {
      isActive = false;
    };
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setError('');
  };

  const handleSubmit = () => {
    const profileName = form.profileName.trim();
    const maturityDays = selectedVarietyMaturity;

    if (!profileName) {
      setError('Profile name is required.');
      return;
    }

    if (!form.plantedDate) {
      setError('Date planted is required.');
      return;
    }

    if (!form.riceVariety) {
      setError('Rice variety is required.');
      return;
    }

    if (!maturityDays) {
      setError('Select a supported rice variety to set maturity days.');
      return;
    }

    const payload = {
      profileName,
      plantedDate: form.plantedDate,
      plantedTime: form.plantedTime || undefined,
      riceVariety: form.riceVariety,
      maturityDays,
    };

    if (editingId) {
      const updatedProfile = updateFieldProfile(editingId, payload);
      if (updatedProfile) {
        setProfiles(getFieldProfiles());
      }
    } else {
      createFieldProfile(payload);
      setProfiles(getFieldProfiles());
    }

    resetForm();
  };

  const handleEdit = (profile: FieldProfile) => {
    setForm(toFormState(profile));
    setEditingId(profile.id);
    setError('');
  };

  const getProfileAnalyses = (profile: FieldProfile) =>
    analyses.filter(
      (item) =>
        item.profileId === profile.id ||
        (!item.profileId && item.profileName === profile.profileName)
    );

  const handleDelete = async (profile: FieldProfile) => {
    const linkedAnalyses = getProfileAnalyses(profile);
    const confirmed = window.confirm(
      `Delete the field profile "${profile.profileName}" and ${linkedAnalyses.length} saved upload${linkedAnalyses.length === 1 ? '' : 's'} with analysis data?`
    );

    if (!confirmed) return;

    try {
      setDeletingProfileId(profile.id);
      setHistoryError('');

      await Promise.all(
        linkedAnalyses.map((item) =>
          fetchJson(`${API_BASE_URL}/api/analyses/${item.id}`, {
            method: 'DELETE',
          })
        )
      );

      deleteFieldProfile(profile.id);
      setProfiles(getFieldProfiles());
      setAnalyses((current) =>
        current.filter(
          (item) =>
            item.profileId !== profile.id &&
            (item.profileId || item.profileName !== profile.profileName)
        )
      );
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : 'Failed to delete profile uploads.'
      );
      return;
    } finally {
      setDeletingProfileId(null);
    }

    if (selectedProfileId === profile.id) {
      setSelectedProfileId('');
    }

    if (editingId === profile.id) {
      resetForm();
    }
  };

  const handleDeleteAnalysis = async (item: AnalysisHistoryItem) => {
    const confirmed = window.confirm(
      'Delete this uploaded image batch and its analysis result?'
    );

    if (!confirmed) return;

    try {
      setDeletingAnalysisId(item.id);
      setHistoryError('');
      await fetchJson(`${API_BASE_URL}/api/analyses/${item.id}`, {
        method: 'DELETE',
      });
      setAnalyses((current) =>
        current.filter((analysisItem) => analysisItem.id !== item.id)
      );
    } catch (err) {
      setHistoryError(
        err instanceof Error ? err.message : 'Failed to delete upload.'
      );
    } finally {
      setDeletingAnalysisId(null);
    }
  };

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white/90 shadow-sm">
        <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-lime-500 px-6 py-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-50">
            Manage Profile
          </p>
          <h2 className="mt-1 text-2xl font-bold">Create field profiles</h2>
          <p className="mt-2 max-w-2xl text-sm text-emerald-50">
            Save each field&apos;s planting timeline once, then select the profile
            on the homepage before starting a new image analysis.
          </p>
        </div>

        <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="rounded-3xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                <Sprout className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-emerald-950">
                  {isEditing ? 'Edit profile' : 'New profile'}
                </h3>
                <p className="text-sm text-emerald-700">
                  Planting timeline data for analysis context
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-emerald-900">
                  Profile name
                </span>
                <input
                  type="text"
                  value={form.profileName}
                  onChange={(event) => {
                    const value = event.currentTarget.value;
                    setForm((current) => ({
                      ...current,
                      profileName: value,
                    }));
                  }}
                  placeholder="Farm/plot profile"
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                />
              </label>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-emerald-900">
                    Date planted
                  </span>
                  <input
                    type="date"
                    value={form.plantedDate}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setForm((current) => ({
                        ...current,
                        plantedDate: value,
                      }));
                    }}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium text-emerald-900">
                    Time planted
                  </span>
                  <input
                    type="time"
                    value={form.plantedTime}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setForm((current) => ({
                        ...current,
                        plantedTime: value,
                      }));
                    }}
                    className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-1 block text-sm font-medium text-emerald-900">
                  Rice variety
                </span>
                <select
                  value={form.riceVariety}
                  onChange={(event) => {
                    const nextVariety = event.currentTarget.value;
                    const nextMaturity = getMaturityDaysForVariety(nextVariety);
                    setForm((current) => ({
                      ...current,
                      riceVariety: nextVariety,
                      maturityDays: nextMaturity ?? '',
                    }));
                  }}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100"
                >
                  <option value="">Select variety</option>
                  {RICE_VARIETY_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2.5 text-sm text-emerald-900">
                <p className="text-xs font-medium text-emerald-600">
                  Maturity days
                </p>
                <p className="mt-1 font-semibold">
                  {previewMaturityDays
                    ? `${previewMaturityDays} days`
                    : 'Select a rice variety'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
              >
                <Plus className="h-4 w-4" />
                {isEditing ? 'Save Changes' : 'Create Profile'}
              </button>
              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                >
                  Cancel
                </button>
              )}
            </div>

            <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
              Expected maturity day:{' '}
              <span className="font-semibold">
                {previewMaturityDays
                  ? `day ${previewMaturityDays}`
                  : 'select variety or maturity days'}
              </span>
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-100 bg-white p-4">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold text-emerald-950">
                  Saved field profiles
                </h3>
                <p className="text-sm text-emerald-700">
                  {profiles.length} profile{profiles.length === 1 ? '' : 's'} available for analysis
                </p>
              </div>
            </div>

            {sortedProfiles.length === 0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 text-center">
                <CalendarDays className="h-8 w-8 text-emerald-700" />
                <p className="mt-3 font-semibold text-emerald-950">
                  No field profiles yet
                </p>
                <p className="mt-1 max-w-sm text-sm text-emerald-700">
                  Create a profile here first. The homepage will then let you
                  choose it before analyzing uploaded rice images.
                </p>
              </div>
            ) : (
              <div className="grid gap-3">
                {sortedProfiles.map((profile) => (
                  <article
                    key={profile.id}
                    onClick={() => setSelectedProfileId(profile.id)}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      selectedProfile?.id === profile.id
                        ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                        : 'border-emerald-200 bg-emerald-50/35 hover:bg-emerald-50'
                    }`}
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold text-emerald-950">
                          {profile.profileName}
                        </h4>
                        <p className="mt-1 text-sm text-emerald-700">
                          {profile.riceVariety}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEdit(profile);
                          }}
                          className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                        >
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            void handleDelete(profile);
                          }}
                          disabled={deletingProfileId === profile.id}
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                          {deletingProfileId === profile.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-2 text-sm text-emerald-800 sm:grid-cols-4">
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-600">
                          Planted
                        </p>
                        <p className="mt-1 font-semibold">
                          {formatDate(profile.plantedDate)}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-600">
                          Time
                        </p>
                        <p className="mt-1 font-semibold">
                          {profile.plantedTime || 'Not set'}
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-600">
                          Maturity
                        </p>
                        <p className="mt-1 font-semibold">
                          {profile.maturityDays} days
                        </p>
                      </div>
                      <div className="rounded-xl bg-white px-3 py-2">
                        <p className="text-[11px] uppercase tracking-[0.14em] text-emerald-600">
                          Uploads
                        </p>
                        <p className="mt-1 font-semibold">
                          {
                            getProfileAnalyses(profile).length
                          }
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-white/90 p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Profile Uploads
            </p>
            <h3 className="mt-1 text-xl font-bold text-emerald-950">
              {selectedProfile?.profileName ?? 'Select a profile'}
            </h3>
          </div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
            {selectedProfileAnalyses.length} saved analysis{selectedProfileAnalyses.length === 1 ? '' : 'es'}
          </span>
        </div>

        {historyError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {historyError}
          </div>
        ) : isLoadingHistory ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-8 text-center text-sm text-emerald-700">
            Loading profile uploads...
          </div>
        ) : selectedProfileAnalyses.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center rounded-3xl border border-dashed border-emerald-200 bg-emerald-50/50 text-center">
            <ImageIcon className="h-8 w-8 text-emerald-700" />
            <p className="mt-3 font-semibold text-emerald-950">
              No uploads for this profile yet
            </p>
            <p className="mt-1 max-w-sm text-sm text-emerald-700">
              Select this profile on the homepage, upload images, and the saved analysis will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {selectedProfileAnalyses.map((item) => {
              const preview = item.images[0]?.originalPreview || item.images[0]?.preview;
              const harvestStatus = resolveHarvestStatus(item.result);

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
                >
                  <div className="flex gap-3 p-3">
                    <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-emerald-50">
                      {preview ? (
                        <img
                          src={preview}
                          alt="Uploaded analysis preview"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <ImageIcon className="h-6 w-6 text-emerald-400" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-emerald-950">
                            {categoryLabel(item.category)}
                          </p>
                          <p className="mt-0.5 text-xs text-emerald-700">
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusClasses(
                            item.result.status
                          )}`}
                        >
                          {item.result.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg bg-emerald-50 px-2 py-1.5">
                          <p className="text-emerald-600">Score</p>
                          <p className="font-semibold text-emerald-950">
                            {item.result.healthScore}
                          </p>
                        </div>
                        <div className="rounded-lg bg-amber-50 px-2 py-1.5">
                          <p className="text-amber-700">Result</p>
                          <p className="truncate font-semibold text-amber-900">
                            {harvestStatus}
                          </p>
                        </div>
                      </div>

                      <p className="mt-2 line-clamp-2 text-xs text-slate-600">
                        {item.result.maturityAssessment?.harvestParameter ??
                          item.result.recommendations ??
                          item.result.interpretation}
                      </p>

                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => void handleDeleteAnalysis(item)}
                          disabled={deletingAnalysisId === item.id}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          {deletingAnalysisId === item.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
