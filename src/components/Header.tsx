import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const logoUrl = new URL('../image/logo.png', import.meta.url).href;

const navClass = (active: boolean) =>
  `text-sm font-medium ${
    active ? 'text-emerald-900' : 'text-emerald-700 hover:text-emerald-900'
  }`;

export function Header() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

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
              to="/manage-uploads"
              className={`rounded-md px-3 py-1 text-sm ${
                location.pathname === '/manage-uploads'
                  ? 'bg-emerald-100 text-emerald-900'
                  : 'text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              Manage Uploads
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
                to="/manage-uploads"
                className={`rounded-lg px-3 py-2 text-sm font-medium ${
                  location.pathname === '/manage-uploads'
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                Manage Uploads
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
