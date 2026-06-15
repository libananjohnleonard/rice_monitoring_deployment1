import { useEffect, useState } from 'react';
import { HomeWorkspace } from '../components/HomeWorkspace';
import type { AnalysisInput } from '../components/UploadImages';
import {
  resolveHarvestStatus,
  type AnalysisHistoryItem,
} from '../components/AnalysisResults';
import {
  applyTimelineContext,
  analyzeBatchInBrowser,
  summarizeSectionsForReanalysis,
  summarizeWholeFieldImageResults,
} from '../lib/fieldAnalysis';
import { getFieldProfiles } from '../lib/fieldProfiles';
import { API_BASE_URL } from '../lib/config';
import { fetchJson } from '../lib/http';
import essuLogo from '../image/Eastern_Samar_State_University_logo.png';

const HISTORY_FETCH_LIMIT = 20;

type SaveAnalysisResponse = {
  batch: {
    id: string;
    created_at: string;
  };
};

function currentStatusLabel(result?: AnalysisHistoryItem['result'] | null) {
  if (!result) return 'Waiting';
  const harvestStatus = resolveHarvestStatus(result);
  return `${result.status} - ${harvestStatus}`;
}

export function HomePage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [currentAnalysis, setCurrentAnalysis] =
    useState<AnalysisHistoryItem | null>(null);
  const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);

  const fetchAnalysisDetail = async (batchId: string) => {
    const item = await fetchJson<AnalysisHistoryItem>(
      `${API_BASE_URL}/api/analyses/${batchId}`,
      {
        cache: 'no-store',
      }
    );

    return mergeOriginalPreviews(item, currentAnalysis?.id === item.id ? currentAnalysis : null);
  };

  const fetchHistory = async () => {
    try {
      const data = await fetchJson<AnalysisHistoryItem[]>(
        `${API_BASE_URL}/api/analyses?limit=${HISTORY_FETCH_LIMIT}`,
        {
          cache: 'no-store',
        }
      );
      const mergedData = data.map((item) =>
        mergeOriginalPreviews(
          item,
          currentAnalysis?.id === item.id
            ? currentAnalysis
            : history.find((historyItem) => historyItem.id === item.id)
        )
      );

      setHistory(mergedData);

      if (mergedData.length > 0 && !currentAnalysis) {
        const detailedFirstItem = await fetchAnalysisDetail(mergedData[0].id);
        setCurrentAnalysis(detailedFirstItem);
      }

      return mergedData;
    } catch (error) {
      console.error('Fetch history error:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const saveAnalysis = async (
    payload: AnalysisInput,
    result: AnalysisHistoryItem['result']
  ) => {
    return fetchJson<SaveAnalysisResponse>(`${API_BASE_URL}/api/analysis/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, result }),
    });
  };

  const replaceImageAtIndex = (
    item: AnalysisHistoryItem,
    imageIndex: number,
    image: AnalysisHistoryItem['images'][number]
  ): AnalysisHistoryItem => ({
    ...item,
    images: item.images.map((currentImage, currentIndex) =>
      currentIndex === imageIndex ? image : currentImage
    ),
  });

  const applyLatestProfileTimeline = (
    item: AnalysisHistoryItem
  ): AnalysisHistoryItem => {
    const profiles = getFieldProfiles();
    const latestProfile =
      profiles.find((profile) => profile.id === item.profileId) ??
      profiles.find((profile) => profile.profileName === item.profileName);

    if (!latestProfile) return item;

    return {
      ...item,
      profileId: latestProfile.id,
      profileName: latestProfile.profileName,
      plantedDate: latestProfile.plantedDate,
      plantedTime: latestProfile.plantedTime,
      riceVariety: latestProfile.riceVariety,
      maturityDays: latestProfile.maturityDays,
    };
  };

  const mergeOriginalPreviews = (
    incoming: AnalysisHistoryItem,
    existing?: AnalysisHistoryItem | null
  ): AnalysisHistoryItem => {
    const mergedItem = {
      ...incoming,
      images: incoming.images.map((image, index) => {
        const existingImage = existing?.images[index];

        return {
          ...image,
          originalPreview:
            image.originalPreview ||
            existingImage?.originalPreview ||
            existingImage?.imageData ||
            existingImage?.preview ||
            image.imageData ||
            image.preview,
        };
      }),
    };

    return applyLatestProfileTimeline(mergedItem);
  };

  const handleAnalyze = async (payload: AnalysisInput) => {
    const result = await analyzeBatchInBrowser(payload);
    const saved = await saveAnalysis(payload, result);

    const refreshed = await fetchHistory();
    const savedItem = refreshed.find((item) => item.id === saved.batch.id);

    if (savedItem) {
      try {
        const detailedSavedItem = await fetchAnalysisDetail(savedItem.id);
        setCurrentAnalysis(detailedSavedItem);
      } catch {
        setCurrentAnalysis(savedItem);
      }
    } else {
      const nextItem: AnalysisHistoryItem = {
        id: saved.batch.id,
        createdAt: saved.batch.created_at,
        category: payload.category,
        flightHeightM: payload.flightHeightM,
        sourceType: payload.sourceType,
        notes: payload.notes,
        profileId: payload.profileId,
        profileName: payload.profileName,
        plantedDate: payload.plantedDate,
        plantedTime: payload.plantedTime,
        riceVariety: payload.riceVariety,
        maturityDays: payload.maturityDays,
        images: payload.images,
        result,
      };

      setCurrentAnalysis(nextItem);
    }

    setRefreshKey((prev) => prev + 1);
  };

  const handleReanalyze = async ({
    excludedSections: excludedSectionLabels,
    imageIndex,
  }: {
    excludedSections: string[];
    imageIndex?: number;
  }) => {
    if (!currentAnalysis) return;

    const analysisForTimeline = applyLatestProfileTimeline(currentAnalysis);
    let nextResult: AnalysisHistoryItem['result'];

    if (
      analysisForTimeline.category === 'whole_field' &&
      Array.isArray(analysisForTimeline.result.imageResults) &&
      typeof imageIndex === 'number'
    ) {
      const targetImage = analysisForTimeline.images[imageIndex];

      if (!targetImage) {
        throw new Error('Whole-field image not found.');
      }

      const singleImageAnalysis = await analyzeBatchInBrowser({
        category: analysisForTimeline.category,
        flightHeightM: analysisForTimeline.flightHeightM,
        sourceType: analysisForTimeline.sourceType,
        notes: analysisForTimeline.notes,
        profileId: analysisForTimeline.profileId,
        profileName: analysisForTimeline.profileName,
        plantedDate: analysisForTimeline.plantedDate,
        plantedTime: analysisForTimeline.plantedTime,
        riceVariety: analysisForTimeline.riceVariety,
        maturityDays: analysisForTimeline.maturityDays,
        images: [targetImage],
      });

      const baseImageResult = singleImageAnalysis.imageResults?.[0];

      if (!baseImageResult) {
        throw new Error('Edited image analysis could not be generated.');
      }

      const nextImageResults = analysisForTimeline.result.imageResults.map((item) => ({
        ...item,
      }));
      const includedSections = (baseImageResult.sections ?? []).filter(
        (section) => !excludedSectionLabels.includes(section.sectionLabel)
      );

      nextImageResults[imageIndex] =
        excludedSectionLabels.length > 0
          ? {
              ...baseImageResult,
              ...summarizeSectionsForReanalysis(
                { category: analysisForTimeline.category },
                includedSections,
                {
                  gridRows: baseImageResult.gridRows,
                  gridCols: baseImageResult.gridCols,
                  excludedCount: excludedSectionLabels.length,
                }
              ),
            }
          : baseImageResult;

      nextResult = applyTimelineContext(
        analysisForTimeline,
        summarizeWholeFieldImageResults(nextImageResults)
      );
    } else {
      const targetImage = analysisForTimeline.images[0];

      if (!targetImage) {
        throw new Error('Analysis image not found.');
      }

      const refreshedAnalysis = await analyzeBatchInBrowser({
        category: analysisForTimeline.category,
        flightHeightM: analysisForTimeline.flightHeightM,
        sourceType: analysisForTimeline.sourceType,
        notes: analysisForTimeline.notes,
        profileId: analysisForTimeline.profileId,
        profileName: analysisForTimeline.profileName,
        plantedDate: analysisForTimeline.plantedDate,
        plantedTime: analysisForTimeline.plantedTime,
        riceVariety: analysisForTimeline.riceVariety,
        maturityDays: analysisForTimeline.maturityDays,
        images: [targetImage],
      });

      if (excludedSectionLabels.length > 0) {
        const currentSections = refreshedAnalysis.sections ?? [];
        const includedSections = currentSections.filter(
          (section) => !excludedSectionLabels.includes(section.sectionLabel)
        );

        nextResult = applyTimelineContext(analysisForTimeline, summarizeSectionsForReanalysis(
          { category: analysisForTimeline.category },
          includedSections,
          {
            gridRows: refreshedAnalysis.gridRows,
            gridCols: refreshedAnalysis.gridCols,
            excludedCount: excludedSectionLabels.length,
          }
        ));
      } else {
        nextResult = refreshedAnalysis;
      }
    }

    await fetchJson(`${API_BASE_URL}/api/analysis/reanalyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batchId: analysisForTimeline.id,
        profileId: analysisForTimeline.profileId,
        profileName: analysisForTimeline.profileName,
        plantedDate: analysisForTimeline.plantedDate,
        plantedTime: analysisForTimeline.plantedTime,
        riceVariety: analysisForTimeline.riceVariety,
        maturityDays: analysisForTimeline.maturityDays,
        result: nextResult,
      }),
    });

    const refreshed = await fetchHistory();
    const updatedItem = refreshed.find((item) => item.id === analysisForTimeline.id);

    if (updatedItem) {
      try {
        const detailedUpdatedItem = await fetchAnalysisDetail(updatedItem.id);
        setCurrentAnalysis(detailedUpdatedItem);
      } catch {
        setCurrentAnalysis(updatedItem);
      }
    }

    setRefreshKey((prev) => prev + 1);
  };

  const handleUpdateImage = async ({
    imageIndex,
    image,
  }: {
    imageIndex: number;
    image: AnalysisHistoryItem['images'][number];
  }) => {
    if (!currentAnalysis) return;

    const currentImage = currentAnalysis.images[imageIndex];

    if (!currentImage) {
      throw new Error('Image not found.');
    }

    if (currentImage.id) {
      await fetchJson(`${API_BASE_URL}/api/images/${currentImage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: image.imageData,
          capturedAt: image.capturedAt,
        }),
      });
    }

    const nextCurrentAnalysis = replaceImageAtIndex(currentAnalysis, imageIndex, {
      ...currentImage,
      ...image,
      id: currentImage.id ?? image.id,
      originalPreview:
        currentImage.originalPreview ?? currentImage.imageData ?? currentImage.preview,
    });

    setCurrentAnalysis(nextCurrentAnalysis);
    setHistory((currentHistory) =>
      currentHistory.map((item) =>
        item.id === currentAnalysis.id
          ? replaceImageAtIndex(item, imageIndex, {
              ...item.images[imageIndex],
              ...image,
              id: currentImage.id ?? image.id,
              originalPreview:
                item.images[imageIndex].originalPreview ??
                item.images[imageIndex].imageData ??
                item.images[imageIndex].preview,
            })
          : item
      )
    );
  };

  const handleClear = () => {
    setCurrentAnalysis(null);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-4 py-1">
      <section className="rounded-2xl border border-emerald-200/80 bg-white/70 px-4 py-3 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Rice Monitoring
            </p>
            <h1 className="text-xl font-semibold text-emerald-950">
              Compact field analysis workspace
            </h1>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:min-w-[260px]">
            <div className="rounded-xl bg-emerald-50 px-3 py-2">
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">
                History
              </p>
              <p className="text-sm font-semibold text-emerald-900">
                {history.length}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">
                Current
              </p>
              <p className="truncate text-sm font-semibold text-emerald-900">
                {currentStatusLabel(currentAnalysis?.result)}
              </p>
            </div>
            <div className="rounded-xl bg-white px-3 py-2 ring-1 ring-emerald-100">
              <p className="text-[10px] uppercase tracking-wide text-emerald-600">
                Category
              </p>
              <p className="truncate text-sm font-semibold text-emerald-900">
                {currentAnalysis ? currentAnalysis.category.replace('_', ' ') : '-'}
              </p>
            </div>
          </div>
        </div>
      </section>

      <HomeWorkspace
        refreshKey={refreshKey}
        currentAnalysis={currentAnalysis}
        history={history}
        onAnalyze={handleAnalyze}
        onClear={handleClear}
        onReanalyze={handleReanalyze}
        onUpdateImage={handleUpdateImage}
        onSelectHistoryItem={(item) => {
          void (async () => {
            try {
              const detailedItem = await fetchAnalysisDetail(item.id);
              setCurrentAnalysis(detailedItem);
            } catch (error) {
              console.error('Fetch analysis detail error:', error);
              setCurrentAnalysis(item);
            }
          })();
        }}
      />

      <footer className="rounded-2xl border border-emerald-900/20 bg-emerald-950 px-4 py-5 text-emerald-50 shadow-lg shadow-emerald-950/15">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-center">
          <div className="flex items-start gap-3">
            <img
              src={essuLogo}
              alt="Eastern Samar State University logo"
              className="h-14 w-14 shrink-0 rounded-full bg-white object-contain p-1"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-200">
                Undergraduate Research Study
              </p>
              <p className="mt-1 text-sm font-bold uppercase leading-5 text-white">
                Drone-Assisted Plant Health and Harvest Readiness Monitoring System Using RGB Imagery
              </p>
              <p className="mt-2 text-xs leading-5 text-emerald-100">
                Presented to the Faculty of the College of Engineering, Eastern Samar State
                University, Borongan City, Eastern Samar, Philippines, in partial fulfillment of
                the requirement for the degree Bachelor of Science in Computer Engineering.
              </p>
            </div>
          </div>
          <div className="rounded-xl border border-white/15 bg-white/10 px-3 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-200">
              Researchers
            </p>
            <p className="mt-2 text-xs leading-5 text-emerald-50">
              Araba, Val A. &bull; Enage, Joey Algen B. &bull; Libanan, John Leonard A.
              &bull; Obina, Mike Wendell R. &bull; Sombrero, Cedrick B. &bull; Sorio,
              Crisaldy D.
            </p>
            <p className="mt-3 text-xs font-medium text-emerald-200">
              &copy; 2026 Rice Plant Health Monitor. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
