import { Link } from 'react-router-dom';
import {
  BarChart3,
  ClipboardList,
  FileText,
  Grid3X3,
  History,
  Sprout,
} from 'lucide-react';

const colorMetrics = [
  {
    label: 'Green',
    description: 'Healthy vegetation and active growth',
    text: 'text-emerald-700',
    bg: 'bg-emerald-50',
  },
  {
    label: 'Yellow',
    description: 'Ripening, maturity, or possible mild stress',
    text: 'text-yellow-700',
    bg: 'bg-yellow-50',
  },
  {
    label: 'Brown',
    description: 'Dryness, disease signs, or damaged areas',
    text: 'text-orange-700',
    bg: 'bg-orange-50',
  },
];

const healthRanges = [
  {
    label: 'Healthy',
    range: '70-100',
    description: 'Strong green reading and good crop condition.',
    classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  },
  {
    label: 'Moderate',
    range: '40-69',
    description: 'Mixed readings, mild stress, or normal maturity signs.',
    classes: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  {
    label: 'Poor',
    range: '0-39',
    description: 'Low score or stronger signs of crop stress.',
    classes: 'border-red-200 bg-red-50 text-red-800',
  },
];

const workflowCards = [
  {
    title: 'Overall Analysis',
    description:
      'Summarizes the selected image or image batch into health status, score, RGB percentages, and harvest status.',
    icon: BarChart3,
  },
  {
    title: 'Section Analysis',
    description:
      'Whole-field and partial-field uploads are divided into grid sections so weak areas can be identified.',
    icon: Grid3X3,
  },
  {
    title: 'Findings',
    description:
      'Explains what the visible readings mean and compares them with the selected field profile timeline.',
    icon: ClipboardList,
  },
  {
    title: 'Recommended Action',
    description:
      'Gives a direct next step: wait, inspect, monitor, re-analyze, or confirm harvest readiness.',
    icon: Sprout,
  },
];

export function AnalysisPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white/85 shadow-sm">
        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-yellow-50 px-6 py-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Analysis Overview
            </p>
            <h1 className="mt-2 text-3xl font-bold text-emerald-950">
              RGB-Based Rice Crop Analysis
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-700">
              The system reads rice field images using RGB color information. It converts
              green, yellow, and brown percentages into health status, harvest status,
              findings, recommended action, and section-level results when grid analysis is available.
            </p>
          </div>
        </div>

        <div className="space-y-8 px-6 py-6">
          <section className="grid gap-4 lg:grid-cols-3">
            {colorMetrics.map((metric) => (
              <article
                key={metric.label}
                className={`rounded-2xl border border-emerald-100 ${metric.bg} p-4`}
              >
                <p className={`font-semibold ${metric.text}`}>{metric.label}</p>
                <p className="mt-3 text-sm leading-6 text-emerald-800">
                  {metric.description}
                </p>
                <p className="mt-3 text-xs font-medium text-emerald-700">
                  Actual percentage is calculated from uploaded images in the Analysis Workspace.
                </p>
              </article>
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-xl font-semibold text-emerald-950">
                Health Score Ranges
              </h2>
              <p className="mt-2 text-sm leading-6 text-emerald-700">
                The score helps group each result into a readable crop health status.
              </p>
              <div className="mt-4 grid gap-3">
                {healthRanges.map((item) => (
                  <div key={item.label} className={`rounded-xl border p-4 ${item.classes}`}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold">{item.label}</p>
                      <span className="rounded-full bg-white/70 px-2.5 py-1 text-xs font-bold">
                        {item.range}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h2 className="text-xl font-semibold text-emerald-950">
                What the Analysis Produces
              </h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {workflowCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.title}
                      className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-200 text-emerald-800">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-emerald-950">{item.title}</p>
                          <p className="mt-1 text-sm leading-6 text-emerald-700">
                            {item.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-emerald-200 bg-emerald-950 p-5 text-white">
            <div className="grid gap-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center">
              <div>
                <h2 className="text-xl font-semibold">Analysis History and Reports</h2>
                <p className="mt-2 text-sm leading-6 text-emerald-100">
                  Every saved analysis can be reviewed later from the history list. Reports can
                  also be exported as PDF or Word files from the Docs page.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <History className="h-5 w-5 text-emerald-200" />
                  <p className="mt-2 font-semibold">History</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-100">
                    Review previous results, compare status, and reopen details.
                  </p>
                </div>
                <div className="rounded-xl border border-white/15 bg-white/10 p-4">
                  <FileText className="h-5 w-5 text-emerald-200" />
                  <p className="mt-2 font-semibold">Exports</p>
                  <p className="mt-1 text-sm leading-6 text-emerald-100">
                    Download analysis records for documentation and monitoring.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Back to Home
            </Link>
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Open Docs
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
