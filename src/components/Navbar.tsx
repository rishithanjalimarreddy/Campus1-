import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import { UserRole } from '../types';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Library,
  Clock,
  Shield,
  Database,
  Sparkles,
  Bell,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronDown,
  CreditCard,
  LifeBuoy,
  LogOut
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openAssistant: () => void;
  toggleNotificationDrawer: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  openAssistant,
  toggleNotificationDrawer
}) => {
  const {
    currentUser,
    switchUserRole,
    logout,
    notifications,
    isOfflineMode,
    setIsOfflineMode,
    lastSyncedAt,
    syncNow
  } = useCampus();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calendar },
    { id: 'timetable', label: 'Timetable', icon: Clock },
    { id: 'exams', label: 'Exams & PYQ', icon: GraduationCap },
    { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
    { id: 'library', label: 'Smart Library', icon: Library },
    { id: 'fees', label: 'Fees & Accounts', icon: CreditCard },
    { id: 'helpdesk', label: 'Helpdesk', icon: LifeBuoy },
    { id: 'planner', label: 'Planner', icon: Calendar },
    { id: 'admin', label: 'Admin & Analytics', icon: Shield },
    { id: 'database', label: 'SQL Architecture', icon: Database }
  ];

  const roles: { role: UserRole; name: string; title: string }[] = [
    { role: 'student', name: 'Alex Chen', title: 'Student (CSE 4th Sem)' },
    { role: 'accounts_officer', name: 'Mr. David Sterling', title: 'Accounts Officer (Finance)' },
    { role: 'faculty', name: 'Dr. Sarah Jenkins', title: 'Faculty (Assoc. Prof)' },
    { role: 'librarian', name: 'Mr. Robert Vance', title: 'Head Librarian' },
    { role: 'hod', name: 'Prof. Michael Rao', title: 'Head of Dept (CSE)' },
    { role: 'admin', name: 'Dean Eleanor Vance', title: 'Dean Academic Affairs' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-left group"
          >
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-sm group-hover:bg-indigo-700 transition-colors">
              C1
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                CampusOne
              </span>
              <span className="hidden sm:inline text-xs font-normal text-slate-500 ml-2">
                Unified Academic & Library Platform
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 text-xs xl:text-sm font-medium rounded-md whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <item.icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* AI Verified Assistant Trigger */}
          <button
            onClick={openAssistant}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-indigo-50 to-blue-50 text-indigo-700 border border-indigo-200 rounded-lg hover:border-indigo-300 hover:shadow-xs transition-all"
            title="Ask Verified Campus Assistant"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">Ask Campus AI</span>
          </button>

          {/* Offline / Sync State Toggle */}
          <button
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              if (isOfflineMode) syncNow();
            }}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md border transition-colors ${
              isOfflineMode
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200'
            }`}
            title={isOfflineMode ? 'Running in Offline Mode (Cached Data)' : `Synced at ${lastSyncedAt.toLocaleTimeString()}`}
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>Offline</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden xl:inline">Synced</span>
              </>
            )}
          </button>

          {/* Notification Bell */}
          <button
            onClick={toggleNotificationDrawer}
            className="relative p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            title="Notifications"
            aria-label="View notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>

          {/* Quick Role Switcher (Crucial for Hackathon evaluation) */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors text-left"
              aria-expanded={roleMenuOpen}
            >
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-semibold uppercase">
                {currentUser.name.charAt(0)}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <div className="text-xs font-semibold text-slate-900 truncate max-w-[100px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 capitalize">
                  {currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Test Role (RBAC)
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Test role-based access permissions:
                  </div>
                </div>
                {roles.map(r => (
                  <button
                    key={r.role}
                    onClick={() => {
                      switchUserRole(r.role);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-start gap-2 hover:bg-slate-50 transition-colors ${
                      currentUser.role === r.role ? 'bg-indigo-50/70 text-indigo-900 font-medium' : 'text-slate-700'
                    }`}
                  >
                    <UserCheck className={`w-3.5 h-3.5 mt-0.5 ${currentUser.role === r.role ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div>
                      <div className="font-medium text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-500">{r.title}</div>
                    </div>
                  </button>
                ))}

                <div className="pt-1.5 mt-1 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setRoleMenuOpen(false);
                      logout();
                    }}
                    className="w-full px-3 py-2 text-left flex items-center gap-2 hover:bg-rose-50 text-rose-700 transition-colors font-medium"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out of Session</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="lg:hidden flex items-center overflow-x-auto py-2 px-4 gap-1.5 border-t border-slate-100 no-scrollbar">
        {navItems.map(item => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              <item.icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
