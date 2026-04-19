import { Link } from 'react-router-dom';
import step3Image from '../image/Step-3.png';
import step4Image from '../image/Step-4.png';
import step5Image from '../image/Step-5.png';
import step6Image from '../image/Step-6.png';

type StepItem = {
  number: number;
  text: string;
  image?: string;
  imageAlt?: string;
};

const steps: StepItem[] = [
  {
    number: 1,
    text: 'Capture images of rice fields using a drone.',
  },
  {
    number: 2,
    text: 'Go to the system homepage.',
  },
  {
    number: 3,
    text: 'Select a category (Whole Fields or Partial Fields).',
    image: step3Image,
    imageAlt: 'Category selection on the homepage',
  },
  {
    number: 4,
    text: 'Upload image/s. You can upload multiple images and they will be treated as a group, but analyzed separately.',
    image: step4Image,
    imageAlt: 'Image upload step in the system',
  },
  {
    number: 5,
    text: 'Click Start Analyze and wait for the analysis to complete.',
    image: step5Image,
    imageAlt: 'Start analyze action in the system',
  },
  {
    number: 6,
    text: 'Go to the Analysis Workspace to view the results.',
    image: step6Image,
    imageAlt: 'Analysis Workspace results view',
  },
];

const editorTools = [
  ['Crop', 'Crop the sides of the image.'],
  ['Include Area', 'Highlight or mask the area you want to focus on for analysis.'],
  ['Exclude Area', 'Highlight or mask the area you want to remove from analysis.'],
  ['Exclude Brush', 'Manually brush areas to exclude from analysis.'],
  ['Rotate Image', 'Rotate the image.'],
  ['Restore Original', 'Revert to the original image.'],
  ['Reset', 'Clear all edits.'],
  ['Cancel', 'Exit without saving changes.'],
];

const healthStatuses = [
  {
    title: 'Healthy (70-100)',
    description: 'Strong growth with a high green percentage.',
    classes: 'border-emerald-200 bg-emerald-50/80 text-emerald-800',
  },
  {
    title: 'Moderate (40-69)',
    description: 'Mixed condition with some ripening or mild stress.',
    classes: 'border-amber-200 bg-amber-50/80 text-amber-800',
  },
  {
    title: 'Poor (0-39)',
    description:
      'High brown percentage may indicate stress, pests, or possible disease.',
    classes: 'border-red-200 bg-red-50/80 text-red-800',
  },
];

const harvestStatuses = [
  {
    title: 'Not Ready',
    description: 'Rice is still mostly green and needs more time to mature.',
  },
  {
    title: 'Nearly Ready',
    description: 'Rice is maturing and may be close to harvest time.',
  },
  {
    title: 'Ready to Harvest',
    description: 'Ripening is sufficient, and the crop can be harvested.',
  },
  {
    title: 'Needs Attention or Overripe',
    description:
      'The crop may be overripe or showing signs of issues that require inspection.',
  },
];

export function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white/95 shadow-sm">
        <div className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-yellow-50 px-6 py-6">
          <h1 className="text-3xl font-bold text-emerald-900">
            How the System Works?
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-700">
            Follow this guide to capture rice field images, upload them for
            analysis, review the results, and refine the output with the image
            editing tools when needed.
          </p>
        </div>

        <div className="space-y-10 px-6 py-6">
          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">
                Step-by-Step Guide
              </h2>
              <p className="mt-1 text-sm text-emerald-600">
                Start from image capture and continue through the Analysis
                Workspace.
              </p>
            </div>

            <div className="space-y-5">
              {steps.map((step) => (
                <article
                  key={step.number}
                  className="overflow-hidden rounded-2xl border border-emerald-200 bg-white"
                >
                  <div className="flex items-start gap-4 px-5 py-5">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                      {step.number}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-semibold text-emerald-900">
                        {step.text}
                      </p>
                    </div>
                  </div>

                  {step.image && (
                    <div className="border-t border-emerald-100 bg-emerald-50/40 p-4">
                      <img
                        src={step.image}
                        alt={step.imageAlt}
                        className="w-full rounded-2xl border border-emerald-200 bg-white object-contain shadow-sm"
                      />
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5">
              <h2 className="text-xl font-semibold text-emerald-900">
                When to Use the Image Edit Feature?
              </h2>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                Use the image editing feature when the captured field image
                contains objects such as houses, animals, harvested areas, or
                other unwanted elements that should not be included in the
                analysis.
              </p>
            </div>

            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h2 className="text-xl font-semibold text-amber-900">
                How to Use the Image Edit Feature?
              </h2>
              <p className="mt-3 text-sm leading-6 text-amber-800">
                After Step 6, while viewing results in the Analysis Workspace,
                click <span className="font-semibold">Edit Image</span> or click
                the image under <span className="font-semibold">Preview: Original</span>.
                The Image Editor Modal will appear so you can adjust the analysis
                area before running the results again.
              </p>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-emerald-900">
                Editor Tools
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {editorTools.map(([title, description]) => (
                  <div
                    key={title}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3"
                  >
                    <p className="font-semibold text-emerald-800">{title}</p>
                    <p className="mt-1 text-sm text-emerald-700">
                      {description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-emerald-900">
                After Editing
              </h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="font-semibold text-emerald-800">
                    1. Apply the changes
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Click <span className="font-semibold">Apply Changes</span>.
                    If needed, scroll down to find the button.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="font-semibold text-emerald-800">
                    2. Return to the homepage
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    After applying changes, you will be redirected to the
                    homepage.
                  </p>
                </div>

                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4">
                  <p className="font-semibold text-emerald-800">
                    3. Re-run the analysis
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Click <span className="font-semibold">Re-analyze</span> to
                    generate updated results based on your edits.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-5">
            <div>
              <h2 className="text-xl font-semibold text-emerald-900">FAQs</h2>
              <p className="mt-1 text-sm text-emerald-600">
                A quick reference for how health, harvest status, and section
                analysis work.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-emerald-900">
                How does the system calculate crop health?
              </h3>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                The system uses RGB analysis to evaluate the condition of the
                rice crops by detecting the proportion of green, yellow, and
                brown pixels in each image.
              </p>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                Each image is then assigned a health score from 0 to 100 and
                categorized as one of the following:
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {healthStatuses.map((item) => (
                  <div
                    key={item.title}
                    className={`rounded-xl border p-4 ${item.classes}`}
                  >
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm leading-6">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-emerald-900">
                How does the system determine harvest readiness?
              </h3>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                Harvest status is based on the crop&apos;s color condition and
                maturity level observed in the image.
              </p>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                The system classifies harvest readiness as:
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {harvestStatuses.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-4"
                  >
                    <p className="font-semibold text-emerald-800">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-emerald-700">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-white p-5">
              <h3 className="text-lg font-semibold text-emerald-900">
                How are field images analyzed?
              </h3>
              <p className="mt-3 text-sm leading-6 text-emerald-700">
                Images are divided into multiple sections using grid-based
                analysis, allowing users to inspect health and harvest condition
                per area of the field.
              </p>
            </div>
          </section>
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
