'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutGrid,
  Users,
  MessageSquare,
  ExternalLink,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState, type ReactNode } from 'react';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  match: (pathname: string | null) => boolean;
}

const NAV: NavItem[] = [
  {
    label: 'פרויקטים',
    href: '/admin-dashboard',
    icon: <LayoutGrid className="h-[18px] w-[18px]" />,
    match: (p) => p === '/admin-dashboard',
  },
  {
    label: 'לידים',
    href: '/admin-dashboard/leads',
    icon: <Users className="h-[18px] w-[18px]" />,
    match: (p) => p?.startsWith('/admin-dashboard/leads') ?? false,
  },
  {
    label: 'שאלות הצ׳אט',
    href: '/admin-dashboard/questions',
    icon: <MessageSquare className="h-[18px] w-[18px]" />,
    match: (p) => p?.startsWith('/admin-dashboard/questions') ?? false,
  },
];

interface AdminShellProps {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  /** רחבה יותר לעמודים צפופים */
  wide?: boolean;
}

export default function AdminShell({
  title,
  subtitle,
  actions,
  children,
  wide = true,
}: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/login', { method: 'DELETE' });
    } catch {
      /* ignore */
    }
    router.push('/login');
  };

  return (
    <div
      className="min-h-screen bg-[#0b1220] text-white"
      dir="rtl"
    >
      {/* רקע מדורג עדין */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-0"
        style={{
          background:
            'radial-gradient(1200px 600px at 80% -10%, rgba(20,184,166,0.08), transparent 60%), radial-gradient(900px 500px at -10% 10%, rgba(59,130,246,0.08), transparent 60%), linear-gradient(180deg, #0b1220 0%, #0a0f1c 100%)',
        }}
      />

      <header className="sticky top-0 z-40 border-b border-white/5 bg-[#0b1220]/85 backdrop-blur-md">
        <div
          className={`mx-auto flex h-16 items-center gap-3 px-4 sm:px-6 ${wide ? 'max-w-[1400px]' : 'max-w-6xl'}`}
        >
          <Link
            href="/admin-dashboard"
            className="group flex items-center gap-2"
          >
            <div className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-[0_4px_18px_-4px_rgba(16,185,129,0.55)]">
              <Image
                src="/images/tadmit-logo.png"
                alt="תדמית אינטראקטיב"
                width={28}
                height={28}
                className="h-6 w-6 object-contain"
              />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-[13px] font-semibold">תדמית אינטראקטיב</div>
              <div className="text-[11px] text-white/50">מערכת ניהול</div>
            </div>
          </Link>

          <nav className="mr-2 hidden flex-1 items-center gap-1 md:flex">
            {NAV.map((item) => {
              const active = item.match(pathname);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-[13.5px] font-medium transition ${
                    active
                      ? 'bg-white/10 text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]'
                      : 'text-white/65 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {item.icon}
                  {item.label}
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-x-3 -bottom-px h-[2px] rounded-full bg-gradient-to-l from-emerald-400 to-teal-300"
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[13px] font-medium text-white/85 transition hover:border-white/20 hover:bg-white/10 md:inline-flex"
              title="פתיחת האתר בטאב חדש"
            >
              <ExternalLink className="h-[15px] w-[15px]" />
              צפייה באתר
            </a>
            <button
              onClick={handleLogout}
              className="hidden items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] font-medium text-red-300 transition hover:bg-red-500/20 md:inline-flex"
            >
              <LogOut className="h-[15px] w-[15px]" />
              התנתק
            </button>

            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 md:hidden"
              aria-label="תפריט"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="border-t border-white/5 bg-[#0b1220] px-4 py-3 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV.map((item) => {
                const active = item.match(pathname);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm ${
                      active
                        ? 'bg-white/10 text-white'
                        : 'text-white/70 hover:bg-white/5'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                );
              })}
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <ExternalLink className="h-4 w-4" />
                צפייה באתר
              </a>
              <button
                onClick={handleLogout}
                className="mt-1 inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300"
              >
                <LogOut className="h-4 w-4" />
                התנתק
              </button>
            </div>
          </div>
        )}
      </header>

      <main
        className={`relative mx-auto px-4 py-6 sm:px-6 sm:py-8 ${wide ? 'max-w-[1400px]' : 'max-w-6xl'}`}
      >
        {(title || actions) && (
          <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              {title && (
                <h1 className="truncate text-2xl font-bold sm:text-3xl">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="mt-1 text-sm text-white/55">{subtitle}</p>
              )}
            </div>
            {actions && (
              <div className="flex flex-wrap items-center gap-2">{actions}</div>
            )}
          </div>
        )}

        {children}
      </main>
    </div>
  );
}
