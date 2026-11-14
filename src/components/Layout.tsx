import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  Award,
  Bell,
  BookOpen,
  Calendar,
  Compass,
  Flame,
  HeartHandshake,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Shield,
  Smile,
  Sparkles,
  Sun,
  User as UserIcon,
  Wind,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCoachDrawer } from '../context/CoachDrawerContext';
import { PWAInstallButton, OfflineIndicator } from './PWAControls';
import { GoogleSignInButton } from './GoogleSignInButton';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/yoga', label: 'Yoga Studio', icon: Flame },
  { to: '/meditation', label: 'Meditation', icon: HeartHandshake },
  { to: '/breathing', label: 'Breathing Studio', icon: Wind },
  { to: '/assistant', label: 'AI Coach & Chat', icon: Sparkles },
  { to: '/planner', label: 'Daily Planner', icon: Calendar },
  { to: '/mood', label: 'Mood Tracker', icon: Smile },
  { to: '/analytics', label: 'Progress & Analytics', icon: Activity },
  { to: '/deep-dive', label: 'Deep Dive Learning', icon: Compass },
  { to: '/knowledge', label: 'Knowledge Hub', icon: BookOpen },
  { to: '/challenges', label: 'Challenges', icon: Award },
  { to: '/reminders', label: 'Reminders', icon: Bell },
  { to: '/chat', label: 'Google Chat', icon: MessageSquare },
  { to: '/profile', label: 'Profile & Settings', icon: UserIcon },
];

export const WorkspaceLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile, progress, isAdmin, theme, toggleTheme, signIn, signOut } = useAuth();
  const { openCoach } = useCoachDrawer();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signingIn, setSigningIn] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const firedMinuteRef = useRef<string>('');

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Background browser notification scheduler when permission is granted
  useEffect(() => {
    if (!progress?.reminders?.length || typeof Notification === 'undefined') return;
    const timer = window.setInterval(() => {
      if (Notification.permission !== 'granted') return;
      const now = new Date();
      const hhmm = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      if (firedMinuteRef.current === hhmm) return;
      const due = progress.reminders.filter((r) => r.enabled && r.time === hhmm);
      if (due.length > 0) {
        firedMinuteRef.current = hhmm;
        due.forEach((r) => {
          new Notification(`FlowState · ${r.category}`, {
            body: r.label,
            icon: '/pwa-192x192.png',
          });
        });
      }
    }, 20000);
    return () => window.clearInterval(timer);
  }, [progress?.reminders]);

  const currentNav = NAV_ITEMS.find((n) => location.pathname.startsWith(n.to));
  const pageTitle = location.pathname.startsWith('/admin')
    ? 'Admin Console'
    : currentNav?.label || 'FlowState Sanctuary';

  const handleLogin = async () => {
    setSigningIn(true);
    try {
      await signIn();
    } finally {
      setSigningIn(false);
    }
  };

  const renderSidebarLinks = () => (
    <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Workspace navigation">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-[#2F5D46] text-white dark:bg-[#3B7357]'
                  : 'text-[#425049] hover:bg-[#EFECE6] hover:text-[#18221D] dark:text-[#B4C2BA] dark:hover:bg-[#1E2A23] dark:hover:text-[#EEF2EE]'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        );
      })}
      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            `mt-2 flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors whitespace-nowrap ${
              isActive
                ? 'bg-[#2F5D46] text-white dark:bg-[#3B7357]'
                : 'text-[#425049] hover:bg-[#EFECE6] hover:text-[#18221D] dark:text-[#B4C2BA] dark:hover:bg-[#1E2A23] dark:hover:text-[#EEF2EE]'
            }`
          }
        >
          <Shield className="h-4 w-4 shrink-0" />
          <span>Admin Console</span>
        </NavLink>
      )}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-[#F8F7F4] text-[#18221D] dark:bg-[#0F1612] dark:text-[#EEF2EE]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[#E2E6DF] bg-[#F4F1EA] lg:flex dark:border-[#24322B] dark:bg-[#131C17]">
        <div className="flex h-16 items-center justify-between border-b border-[#E2E6DF] px-5 dark:border-[#24322B]">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-[#18221D] whitespace-nowrap shrink-0 dark:text-[#EEF2EE]"
          >
            FlowState Wellness
          </Link>
        </div>

        {renderSidebarLinks()}

        <div className="border-t border-[#E2E6DF] p-4 space-y-3 dark:border-[#24322B]">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle light or dark theme"
              className="inline-flex items-center gap-2 rounded-lg border border-[#D7DDD6] bg-white px-3 py-2 text-xs font-medium text-[#18221D] hover:bg-[#EFECE6] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE] dark:hover:bg-[#223029]"
            >
              {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <PWAInstallButton compact />
          </div>

          {user ? (
            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="flex min-w-0 items-center gap-2.5 text-left"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={profile?.displayName || user.displayName || 'User'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full object-cover shrink-0"
                  />
                ) : (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#2F5D46] text-xs font-semibold text-white">
                    {(profile?.displayName || user.displayName || 'F').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                    {profile?.displayName || user.displayName || 'Member'}
                  </p>
                  <p className="truncate text-[11px] text-[#5B6860] dark:text-[#98A79E]">
                    {profile?.experienceLevel || 'Beginner'}
                  </p>
                </div>
              </button>
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out"
                className="rounded-lg p-1.5 text-[#5B6860] hover:bg-[#E7E3DA] hover:text-[#18221D] dark:text-[#98A79E] dark:hover:bg-[#223029] dark:hover:text-[#EEF2EE]"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <GoogleSignInButton onClick={handleLogin} loading={signingIn} />
          )}
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/45"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <aside className="relative z-10 flex w-72 max-w-[85vw] flex-col bg-[#F4F1EA] dark:bg-[#131C17]">
            <div className="flex h-14 items-center justify-between border-b border-[#E2E6DF] px-4 dark:border-[#24322B]">
              <Link
                to="/"
                className="font-display text-base font-semibold text-[#18221D] dark:text-[#EEF2EE]"
              >
                FlowState Wellness
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="rounded-lg p-2 text-[#425049] dark:text-[#B4C2BA]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {renderSidebarLinks()}
            <div className="border-t border-[#E2E6DF] p-4 space-y-3 dark:border-[#24322B]">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center gap-2 rounded-lg border border-[#D7DDD6] bg-white px-3 py-2 text-xs font-medium text-[#18221D] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]"
                >
                  {theme === 'dark' ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                  <span>{theme === 'dark' ? 'Light' : 'Dark'}</span>
                </button>
                <PWAInstallButton compact />
              </div>
              {user ? (
                <button
                  type="button"
                  onClick={signOut}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#D7DDD6] bg-white py-2 text-xs font-medium text-[#18221D] dark:border-[#2C3A33] dark:bg-[#19241E] dark:text-[#EEF2EE]"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <GoogleSignInButton onClick={handleLogin} loading={signingIn} />
              )}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b border-[#E2E6DF] bg-[#F8F7F4]/95 px-4 backdrop-blur-sm lg:h-16 lg:px-8 dark:border-[#24322B] dark:bg-[#0F1612]/95">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="rounded-lg p-2 text-[#425049] hover:bg-[#EFECE6] lg:hidden dark:text-[#B4C2BA] dark:hover:bg-[#1E2A23]"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="flex min-w-0 items-center gap-2 text-sm">
              <Link
                to="/"
                className="hidden text-[#5B6860] hover:text-[#18221D] sm:inline dark:text-[#8E9D94] dark:hover:text-[#EEF2EE]"
              >
                Home
              </Link>
              <span className="hidden text-[#9CA7A0] sm:inline" aria-hidden="true">
                /
              </span>
              <h1 className="truncate font-sans text-base font-semibold text-[#18221D] dark:text-[#EEF2EE]">
                {pageTitle}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => {
                if (location.pathname.startsWith('/assistant') || location.pathname.startsWith('/yoga-coach')) {
                  navigate('/yoga-coach');
                } else {
                  openCoach({
                    mode: location.pathname.startsWith('/yoga') ? 'yoga-coach' : 'assistant',
                    activeContext: `Viewing ${pageTitle}`,
                  });
                }
              }}
              className="rounded-lg bg-[#2F5D46] px-4 py-2 text-xs font-medium text-white transition hover:bg-[#264C39] whitespace-nowrap shrink-0"
            >
              Ask AI Coach
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>

      <OfflineIndicator />
    </div>
  );
};
