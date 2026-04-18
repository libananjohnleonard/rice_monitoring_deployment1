import { Link } from 'react-router-dom';

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-white/90 shadow-sm">
        <div className="border-b border-emerald-100 px-6 py-5">
          <h1 className="text-2xl font-bold text-emerald-800">How it works</h1>
          <p className="mt-1 text-sm text-emerald-600">
            Quick overview of image capture, section analysis, and harvest guidance.
          </p>
        </div>

        <div className="grid gap-6 px-6 py-6 lg:grid-cols-2">
          <div>
            <h2 className="mb-3 text-lg font-semibold text-emerald-800">Steps</h2>
            <ul className="space-y-3 text-sm text-emerald-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700">
                  1
                </span>
                <span>Auto-capture every 5 seconds or use manual capture.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700">
                  2
                </span>
                <span>RGB analysis identifies green, yellow, and brown pixels.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700">
                  3
                </span>
                <span>
                  Each image gets an overall health status and health points from
                  0 to 100.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700">
                  4
                </span>
                <span>
                  Field images are divided into sections so you can inspect
                  part-by-part health and harvest condition.
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-700">
                  5
                </span>
                <span>
                  Harvest status is labeled as Not Ready, Nearly Ready, Ready to
                  Harvest, or Needs Attention or Overripe.
                </span>
              </li>
            </ul>
          </div>

          <div className="space-y-5">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-emerald-800">
                Health Status Guide
              </h2>
              <div className="grid gap-3">
                <div className="rounded-xl border-l-4 border-emerald-500 bg-emerald-50/80 p-3">
                  <h3 className="mb-1 font-semibold text-emerald-700">
                    Healthy (70-100)
                  </h3>
                  <p className="text-sm text-emerald-600">
                    Strong growth with high green percentage.
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50/80 p-3">
                  <h3 className="mb-1 font-semibold text-amber-700">
                    Moderate (40-69)
                  </h3>
                  <p className="text-sm text-amber-600">
                    Mixed condition with some ripening or mild stress.
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50/80 p-3">
                  <h3 className="mb-1 font-semibold text-red-700">
                    Poor (0-39)
                  </h3>
                  <p className="text-sm text-red-600">
                    High brown can suggest stress, pests, or possible disease.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-semibold text-emerald-800">
                Harvest Status Guide
              </h2>
              <div className="grid gap-3">
                <div className="rounded-xl border-l-4 border-slate-400 bg-slate-50 p-3">
                  <h3 className="mb-1 font-semibold text-slate-700">Not Ready</h3>
                  <p className="text-sm text-slate-600">
                    Rice is still mostly green and should continue maturing.
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-yellow-500 bg-yellow-50 p-3">
                  <h3 className="mb-1 font-semibold text-yellow-700">
                    Nearly Ready
                  </h3>
                  <p className="text-sm text-yellow-700">
                    Rice is maturing and may be close to harvest time.
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-amber-500 bg-amber-50 p-3">
                  <h3 className="mb-1 font-semibold text-amber-700">
                    Ready to Harvest
                  </h3>
                  <p className="text-sm text-amber-700">
                    Ripening is strong enough that the crop can be harvested.
                  </p>
                </div>
                <div className="rounded-xl border-l-4 border-red-500 bg-red-50 p-3">
                  <h3 className="mb-1 font-semibold text-red-700">
                    Needs Attention or Overripe
                  </h3>
                  <p className="text-sm text-red-600">
                    The crop may be overripe or showing a condition that needs
                    checking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-emerald-100 px-6 py-4">
          <div className="flex flex-wrap gap-3">
            <Link
              to="/analysis"
              className="rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-medium text-emerald-700 transition hover:bg-emerald-50"
            >
              Go to Analysis
            </Link>
            <Link
              to="/"
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-500"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
