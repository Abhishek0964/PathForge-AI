import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Map,
  TrendingUp,
  Compass,
  Briefcase,
  CheckSquare,
  MessageSquare,
  LogOut,
  Menu,
  X,
  User,
  Award,
  BookOpen
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout: authLogout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isGuestMode = localStorage.getItem('isGuest') === 'true';
  const guestUser = isGuestMode ? JSON.parse(localStorage.getItem('guest_profile') || '{}') : null;
  const activeUser = user || guestUser;

  const logout = async () => {
    try {
      await authLogout();
    } catch {
      // Continue
    }
    localStorage.clear();
    window.location.href = '/';
  };

  const navigation = [
    { name: 'Dashboard', to: '/', icon: LayoutDashboard },
    { name: 'Resume Analyzer', to: '/resume', icon: FileText },
    { name: 'Learning Roadmap', to: '/roadmap', icon: Map },
    { name: 'Skill Gap Hub', to: '/skill-gap', icon: TrendingUp },
    { name: 'Project Generator', to: '/projects', icon: Compass },
    { name: 'Resource Hub', to: '/resources', icon: BookOpen },
    { name: 'Internship Tracker', to: '/internships', icon: Briefcase },
    { name: 'Daily Tasks', to: '/daily-tasks', icon: CheckSquare },
    { name: 'AI Coach Chat', to: '/coach', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-zinc-200 bg-white">
        <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 mb-8 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-lg shadow-sm">
              🧭
            </div>
            <span className="font-bold text-zinc-900 tracking-tight text-lg">PathForge AI</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 space-y-1">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-zinc-950 text-white shadow-sm"
                    : "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-950 transition-all duration-150"
                }
              >
                <item.icon className="h-4.5 w-4.5" />
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>
        {/* User Footer Profile */}
        <div className="flex-shrink-0 flex border-t border-zinc-100 p-4">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center gap-3">
              {activeUser?.avatar ? (
                <img
                  className="inline-block h-9 w-9 rounded-full object-cover border border-zinc-200"
                  src={activeUser.avatar}
                  alt={activeUser.name}
                />
              ) : (
                <div className="inline-block h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-600 text-xs font-semibold">
                  {activeUser?.name?.substring(0, 2).toUpperCase() || 'U'}
                </div>
              )}
              <div className="ml-1 select-none">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-semibold text-zinc-900 max-w-[100px] truncate">{activeUser?.name}</p>
                  {isGuestMode && <span className="text-[8px] font-bold px-1 py-0.2 bg-zinc-100 text-zinc-500 rounded border">Demo</span>}
                </div>
                <div className="flex items-center gap-1 mt-0.5 text-[10px] text-zinc-500">
                  <Award className="h-3 w-3 text-amber-500" />
                  <span>Streak: {activeUser?.streak || 0}d</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:pl-64 flex flex-col flex-1 w-full">
        <header className="sticky top-0 z-10 md:hidden bg-white border-b border-zinc-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-950 text-white font-bold text-sm shadow-sm">
              🧭
            </div>
            <span className="font-bold text-zinc-900 tracking-tight text-base">PathForge AI</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 md:hidden flex">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-zinc-900/40 backdrop-blur-xs transition-opacity"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Menu Panel */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                >
                  <span className="sr-only">Close sidebar</span>
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              <div className="flex items-center gap-2 px-6 mb-8">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-900 text-white font-bold text-sm">
                  🧭
                </div>
                <span className="font-bold text-zinc-900 tracking-tight text-base">PathForge AI</span>
              </div>

              <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg bg-zinc-950 text-white shadow-sm"
                        : "flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg text-zinc-650 hover:bg-zinc-100 hover:text-zinc-950"
                    }
                  >
                    <item.icon className="h-4.5 w-4.5" />
                    {item.name}
                  </NavLink>
                ))}
              </nav>

              <div className="flex-shrink-0 flex border-t border-zinc-100 p-4 justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="inline-block h-9 w-9 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200 text-zinc-600 text-xs font-semibold">
                    {activeUser?.name?.substring(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-semibold text-zinc-900">{activeUser?.name}</p>
                      {isGuestMode && <span className="text-[8px] font-bold px-1 py-0.2 bg-zinc-100 text-zinc-500 rounded border">Demo</span>}
                    </div>
                    <p className="text-[10px] text-zinc-500">Streak: {activeUser?.streak || 0}d</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="p-1.5 text-zinc-400 hover:text-red-650 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Content Outlet */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {/* Guest/Offline Notice Bar */}
          {((window as any).isBackendOffline || isGuestMode) && (
            <div className="bg-zinc-950 text-white border-b border-zinc-800 text-center py-2 px-4 text-xs font-semibold select-none flex items-center justify-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>
                {(window as any).isBackendOffline 
                  ? 'Offline Demo Mode Active — Using Smart Local Analysis' 
                  : 'Guest Demo Mode Active — Real AI analysis and cloud persistence require signing in.'}
              </span>
              {isGuestMode && (
                <Link to="/register" className="underline underline-offset-2 ml-1 text-zinc-300 hover:text-white">
                  Create Account
                </Link>
              )}
            </div>
          )}
          <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 md:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
