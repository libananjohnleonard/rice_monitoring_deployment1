import { BarChart3, Bell, FileText, Sprout } from 'lucide-react';
import essuLogo from '../image/Eastern_Samar_State_University_logo.png';
import arabaPhoto from '../image/Profiles/Araba_Val_BSCpE.jpg';
import enagePhoto from '../image/Profiles/Enage_Joey Algen B. BSCpE.jpeg';
import libananPhoto from '../image/Profiles/Libanan_John Leonard A._BSCpE.jpg';
import obinaPhoto from '../image/Profiles/Obina_MikeWendell_BSCpE.jpg';
import sombreroPhoto from '../image/Profiles/Sombrero_Cedrick_B._BSCpE.jpg';
import sorioPhoto from '../image/Profiles/Sorio_Crisaldy_BSCpE.jpg';

const researchers = [
  {
    name: 'Araba, Val A.',
    program: 'Bachelor of Science in Computer Engineering',
    image: arabaPhoto,
  },
  {
    name: 'Enage, Joey Algen B.',
    program: 'Bachelor of Science in Computer Engineering',
    image: enagePhoto,
  },
  {
    name: 'Libanan, John Leonard A.',
    program: 'Bachelor of Science in Computer Engineering',
    image: libananPhoto,
  },
  {
    name: 'Obina, Mike Wendell R.',
    program: 'Bachelor of Science in Computer Engineering',
    image: obinaPhoto,
  },
  {
    name: 'Sombrero, Cedrick B.',
    program: 'Bachelor of Science in Computer Engineering',
    image: sombreroPhoto,
  },
  {
    name: 'Sorio, Crisaldy D.',
    program: 'Bachelor of Science in Computer Engineering',
    image: sorioPhoto,
  },
];

const systemHighlights = [
  {
    title: 'RGB Image Analysis',
    description:
      'Measures green, yellow, and brown pixel percentages to estimate rice crop condition and health status.',
    icon: BarChart3,
  },
  {
    title: 'Field Profiles',
    description:
      'Stores planting date, planting time, rice variety, and maturity days so results can be compared with the expected crop timeline.',
    icon: Sprout,
  },
  {
    title: 'Harvest Reminders',
    description:
      'Uses saved field profiles to remind users when crops are nearing harvest, inside the harvest range, due today, or overdue.',
    icon: Bell,
  },
  {
    title: 'Reports and Records',
    description:
      'Allows analysis results to be reviewed, saved, and exported for documentation and monitoring records.',
    icon: FileText,
  },
];

export function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="overflow-hidden rounded-3xl border border-emerald-200 bg-white/85 shadow-sm">
        <div className="bg-emerald-950 px-6 py-7 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <img
              src={essuLogo}
              alt="Eastern Samar State University logo"
              className="h-20 w-20 shrink-0 rounded-full bg-white object-contain p-2"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                Undergraduate Research Study
              </p>
              <h1 className="mt-2 max-w-4xl text-2xl font-bold uppercase leading-8">
                Drone-Assisted Plant Health and Harvest Readiness Monitoring System Using RGB Imagery
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-emerald-100">
                A rice crop monitoring system developed for plant health assessment,
                harvest-readiness guidance, field profile tracking, and report generation.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
          <div>
            <h2 className="text-xl font-semibold text-emerald-950">About the Study</h2>
            <p className="mt-3 text-sm leading-6 text-emerald-800">
              This system supports rice crop monitoring by analyzing drone-assisted RGB
              imagery. It helps users evaluate crop condition through color readings,
              health status, harvest status, findings, recommended actions, and field
              maturity timeline comparison.
            </p>
            <p className="mt-3 text-sm leading-6 text-emerald-800">
              The study was presented to the Faculty of the College of Engineering,
              Eastern Samar State University, Borongan City, Eastern Samar, Philippines,
              in partial fulfillment of the requirement for the degree Bachelor of
              Science in Computer Engineering.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
              Institution
            </p>
            <p className="mt-2 text-base font-semibold text-emerald-950">
              Eastern Samar State University
            </p>
            <p className="text-sm text-emerald-700">Main Campus</p>
            <div className="mt-4 border-t border-emerald-200 pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
                Degree Program
              </p>
              <p className="mt-2 text-sm font-semibold text-emerald-900">
                Bachelor of Science in Computer Engineering
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-white/85 p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            System Content
          </p>
          <h2 className="mt-1 text-xl font-semibold text-emerald-950">
            What the System Provides
          </h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {systemHighlights.map((item) => {
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
      </section>

      <section className="rounded-3xl border border-emerald-200 bg-white/85 p-6 shadow-sm">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600">
            Research Team
          </p>
          <h2 className="mt-1 text-xl font-semibold text-emerald-950">
            Student Researchers
          </h2>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {researchers.map((researcher) => (
            <article
              key={researcher.name}
              className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/50"
            >
              <div className="aspect-[4/3] bg-emerald-100">
                <img
                  src={researcher.image}
                  alt={researcher.name}
                  className="h-full w-full object-cover object-top"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-emerald-950">{researcher.name}</p>
                <p className="mt-1 text-sm leading-5 text-emerald-700">
                  {researcher.program}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
