import { useEffect, useState } from 'react';
import { Bell, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { getFieldProfiles, type FieldProfile } from '../lib/fieldProfiles';
import { calculateCropAgeDays, getMaturityWindow } from '../lib/riceMaturity';

const logoUrl = new URL('../image/logo.png', import.meta.url).href;
const READ_REMINDERS_KEY = 'rice_harvest_reminders_read';

const navClass = (active: boolean) =>
  `text-sm font-medium ${
    active ? 'text-emerald-900' : 'text-emerald-700 hover:text-emerald-900'
  }`;

type HarvestReminder = {
  profile: FieldProfile;
  cropAgeDays: number;
  daysToMaturity: number;
  label: string;
  message: string;
  classes: string;
  rank: number;
};

function buildHarvestReminders(profiles: FieldProfile[]): HarvestReminder[] {
  return profiles
    .map((profile) => {
      const cropAgeDays = calculateCropAgeDays(
        profile.plantedDate,
        profile.plantedTime
      );
      const maturityWindow = getMaturityWindow(profile.maturityDays);

      if (typeof cropAgeDays !== 'number' || !maturityWindow) return null;

      const daysToMaturity = profile.maturityDays - cropAgeDays;
      const daysUntilRange = maturityWindow.start - cropAgeDays;

      if (cropAgeDays > profile.maturityDays) {
        const overdueDays = cropAgeDays - profile.maturityDays;
        return {
          profile,
          cropAgeDays,
          daysToMaturity,
          label: 'Overdue',
          message: `Past full maturity by ${overdueDays} day${overdueDays === 1 ? '' : 's'}. Inspect for overripe signs.`,
          classes: 'border-red-200 bg-red-50 text-red-800',
          rank: 0,
        };
      }

      if (cropAgeDays === profile.maturityDays) {
        return {
          profile,
          cropAgeDays,
          daysToMaturity,
          label: 'Due Today',
          message: 'Full maturity is today. Inspect crop condition before harvest.',
          classes: 'border-red-200 bg-red-50 text-red-800',
          rank: 1,
        };
      }

      if (cropAgeDays >= maturityWindow.start) {
        return {
          profile,
          cropAgeDays,
          daysToMaturity,
          label: 'Harvest Range',
          message: `${daysToMaturity} day${daysToMaturity === 1 ? '' : 's'} to full maturity. Track and inspect before harvest.`,
          classes: 'border-amber-200 bg-amber-50 text-amber-800',
          rank: 2,
        };
      }

      if (daysUntilRange <= 7) {
        return {
          profile,
          cropAgeDays,
          daysToMaturity,
          label: 'Coming Soon',
          message: `Harvest range starts in ${daysUntilRange} day${daysUntilRange === 1 ? '' : 's'}. Track this profile closely.`,
          classes: 'border-emerald-200 bg-emerald-50 text-emerald-800',
          rank: 3,
        };
      }

      return null;
    })
    .filter((item): item is HarvestReminder => Boolean(item))
    .sort((left, right) => left.rank - right.rank || left.daysToMaturity - right.daysToMaturity);
}

function reminderKey(reminder: HarvestReminder) {
  return [
    reminder.profile.id,
    reminder.label,
    reminder.cropAgeDays,
    reminder.profile.maturityDays,
  ].join(':');
}

function getReadReminderKeys() {
  if (typeof window === 'undefined') return new Set<string>();

  try {
    const rawValue = window.localStorage.getItem(READ_REMINDERS_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : [];

    return new Set(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
  } catch {
    return new Set<string>();
  }
}

function saveReadReminderKeys(keys: Set<string>) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(READ_REMINDERS_KEY, JSON.stringify(Array.from(keys)));
}

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminders, setReminders] = useState<HarvestReminder[]>(() =>
    buildHarvestReminders(getFieldProfiles())
  );
  const [readReminderKeys, setReadReminderKeys] = useState<Set<string>>(() =>
    getReadReminderKeys()
  );

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsReminderOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const refreshReminders = () => {
      setReminders(buildHarvestReminders(getFieldProfiles()));
    };

    refreshReminders();
    window.addEventListener('focus', refreshReminders);
    window.addEventListener('storage', refreshReminders);
    window.addEventListener('field-profiles-updated', refreshReminders);

    return () => {
      window.removeEventListener('focus', refreshReminders);
      window.removeEventListener('storage', refreshReminders);
      window.removeEventListener('field-profiles-updated', refreshReminders);
    };
  }, []);

  const unreadReminders = reminders.filter(
    (reminder) => !readReminderKeys.has(reminderKey(reminder))
  );
  const reminderCount = unreadReminders.length;

  const markRemindersAsRead = () => {
    const nextReadKeys = new Set(readReminderKeys);
    reminders.forEach((reminder) => {
      nextReadKeys.add(reminderKey(reminder));
    });
    saveReadReminderKeys(nextReadKeys);
    setReadReminderKeys(nextReadKeys);
  };

  return (
    <header className="mb-10">
      <div className="rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 shadow-sm sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-3">
            <img
              src={logoUrl}
              alt="Rice Plant Health Monitor"
              className="h-9 w-9 object-contain"
            />
            <div className="min-w-0">
              <h1 className="truncate text-base font-bold text-emerald-800 sm:text-lg">
                Rice Plant Health Monitor
              </h1>
              <p className="truncate text-xs text-emerald-600">
                Field monitoring & RGB analysis
              </p>
            </div>
          </Link>

          <nav className="hidden sm:flex sm:items-center sm:gap-6">
            <Link to="/" className={navClass(location.pathname === '/')}>
              Home
            </Link>
            <Link
              to="/analysis"
              className={navClass(location.pathname === '/analysis')}
            >
              Analysis
            </Link>
            <Link to="/docs" className={navClass(location.pathname === '/docs')}>
              Docs
            </Link>
            <Link to="/about" className={navClass(location.pathname === '/about')}>
              About
            </Link>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/manage-profile"
              className={`rounded-md px-3 py-1 text-sm ${
                location.pathname === '/manage-profile' ||
                location.pathname === '/manage-uploads'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Manage Profile
            </Link>
            <Link
              to="/how-it-works"
              className={`rounded-md px-3 py-1 text-sm ${
                location.pathname === '/how-it-works'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              How it works
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsReminderOpen((current) => !current)}
                className={`relative inline-flex items-center justify-center rounded-lg border p-2 transition ${
                  reminderCount > 0
                    ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                    : 'border-emerald-200 bg-white text-emerald-700 hover:bg-emerald-50'
                }`}
                aria-label="Harvest profile reminders"
                aria-expanded={isReminderOpen}
              >
                <Bell className="h-5 w-5" />
                {reminderCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                    {reminderCount}
                  </span>
                )}
              </button>

              {isReminderOpen && (
                <div className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-2xl border border-emerald-200 bg-white p-3 shadow-xl">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-emerald-950">
                      Harvest Reminders
                    </p>
                    <Link
                      to="/manage-profile"
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                    >
                      Manage
                    </Link>
                  </div>

                  {reminders.length > 0 && reminderCount > 0 && (
                    <button
                      type="button"
                      onClick={markRemindersAsRead}
                      className="mb-2 w-full rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
                    >
                      Mark as read
                    </button>
                  )}

                  {reminderCount === 0 ? (
                    <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {reminders.length > 0
                        ? 'All harvest reminders are marked as read.'
                        : 'No profiles are near harvest yet.'}
                    </p>
                  ) : (
                    <div className="grid max-h-80 gap-2 overflow-y-auto pr-1">
                      {unreadReminders.map((reminder) => (
                        <Link
                          key={reminder.profile.id}
                          to="/manage-profile"
                          className={`rounded-xl border px-3 py-2 text-sm ${reminder.classes}`}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="truncate font-semibold">
                                {reminder.profile.profileName}
                              </p>
                              <p className="mt-0.5 text-xs opacity-90">
                                Day {reminder.cropAgeDays} of {reminder.profile.maturityDays}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[10px] font-bold">
                              {reminder.label}
                            </span>
                          </div>
                          <p className="mt-1 text-xs leading-5">{reminder.message}</p>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((current) => !current)}
              className="inline-flex items-center justify-center rounded-lg border border-emerald-200 bg-white p-2 text-emerald-700 hover:bg-emerald-50 sm:hidden"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="mt-4 border-t border-emerald-100 pt-4 sm:hidden">
            <nav className="grid gap-2">
              <Link
                to="/"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/analysis"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/analysis'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Analysis
              </Link>
              <Link
                to="/docs"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/docs'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Docs
              </Link>
              <Link
                to="/about"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/about'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                About
              </Link>
              <Link
                to="/manage-profile"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/manage-profile' ||
                  location.pathname === '/manage-uploads'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Manage Profile
              </Link>
              <Link
                to="/how-it-works"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/how-it-works'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                How it works
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}

export default Header;
