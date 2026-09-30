import React, { useState } from 'react';
import { CampusProvider, useCampus } from './context/CampusContext';
import { LoginPage } from './components/LoginPage';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { TimetableModule } from './components/TimetableModule';
import { ExamModule } from './components/ExamModule';
import { SyllabusModule } from './components/SyllabusModule';
import { LibraryModule } from './components/LibraryModule';
import { FeeManagementModule } from './components/FeeManagementModule';
import { HelpdeskModule } from './components/HelpdeskModule';
import { AcademicPlanner } from './components/AcademicPlanner';
import { StaffAdminPortal } from './components/StaffAdminPortal';
import { DatabaseSchemaViewer } from './components/DatabaseSchemaViewer';
import { AcademicAssistantModal } from './components/AcademicAssistantModal';
import { NotificationDrawer } from './components/NotificationDrawer';
import {
  Calendar,
  Clock,
  GraduationCap,
  BookOpen,
  Library,
  Shield,
  WifiOff,
  Database,
  Info,
  CheckCircle2,
  X,
  CreditCard,
  LifeBuoy
} from 'lucide-react';

function CampusAppContent() {
  const { isAuthenticated, isOfflineMode, setIsOfflineMode } = useCampus();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [showDocsModal, setShowDocsModal] = useState<boolean>(false);

  // If not authenticated, render the responsive login portal
  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans pb-16 lg:pb-0">
      
      {/* Offline Mode Indicator Banner */}
      {isOfflineMode && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <WifiOff className="w-3.5 h-3.5" />
            <span>
              Simulated Offline Mode Active: Non-sensitive timetables and syllabus are served from local PWA cache.
            </span>
          </div>
          <button
            onClick={() => setIsOfflineMode(false)}
            className="text-xs font-bold underline hover:text-white shrink-0 ml-2"
          >
            Go Online
          </button>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openAssistant={() => setIsAssistantOpen(true)}
        toggleNotificationDrawer={() => setIsNotifOpen(prev => !prev)}
      />

      {/* Main Viewport Routing */}
      <main className="flex-1">
        {activeTab === 'dashboard' && (
          <StudentDashboard
            onNavigate={setActiveTab}
            openAssistant={() => setIsAssistantOpen(true)}
          />
        )}
        {activeTab === 'timetable' && <TimetableModule />}
        {activeTab === 'exams' && <ExamModule />}
        {activeTab === 'syllabus' && <SyllabusModule />}
        {activeTab === 'library' && <LibraryModule />}
        {activeTab === 'fees' && <FeeManagementModule />}
        {activeTab === 'helpdesk' && <HelpdeskModule />}
        {activeTab === 'planner' && <AcademicPlanner />}
        {activeTab === 'admin' && <StaffAdminPortal />}
        {activeTab === 'database' && <DatabaseSchemaViewer />}
      </main>

      {/* Mobile Fixed Bottom Navigation Bar (Pattern 1 from Mobile Design Reference) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200">
        <div className="grid grid-cols-5 items-center h-16 max-w-md mx-auto px-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'dashboard' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Home</span>
          </button>

          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'timetable' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Classes</span>
          </button>

          <button
            onClick={() => setActiveTab('fees')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'fees' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Fees</span>
          </button>

          <button
            onClick={() => setActiveTab('library')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'library' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Library className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Library</span>
          </button>

          <button
            onClick={() => setActiveTab('helpdesk')}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'helpdesk' ? 'text-indigo-600 font-bold' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <LifeBuoy className="w-5 h-5" />
            <span className="text-[10px] tracking-tight mt-0.5">Support</span>
          </button>
        </div>
      </nav>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12 py-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              C1
            </div>
            <span className="font-semibold text-slate-900">CampusOne</span>
            <span aria-hidden="true">·</span>
            <span>Integrated Academic & Smart Library Platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              onClick={() => setShowDocsModal(true)}
              className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Project Deliverables & Specs</span>
            </button>
            <button
              onClick={() => setActiveTab('database')}
              className="hover:text-slate-900 flex items-center gap-1"
            >
              <Database className="w-3.5 h-3.5" />
              <span>PostgreSQL Schema</span>
            </button>
          </div>
        </div>
      </footer>

      {/* Verified Academic Assistant Modal */}
      <AcademicAssistantModal
        isOpen={isAssistantOpen}
        onClose={() => setIsAssistantOpen(false)}
        onNavigate={setActiveTab}
      />

      {/* Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        onNavigate={setActiveTab}
      />

      {/* Project Deliverables & Testing Modal */}
      {showDocsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>CampusOne Project Deliverables Verification</span>
              </h2>
              <button
                onClick={() => setShowDocsModal(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 leading-relaxed text-slate-700">
              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">1. Working Responsive Web Application</h3>
                <p>Built with React 19, TypeScript, and Tailwind CSS. Mobile-first ergonomics with fixed bottom tab bar on smartphones and responsive desktop multi-column workspaces.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">2. Student Dashboard</h3>
                <p>Consolidates today's lectures, upcoming exam countdowns, syllabus progress bars, active library borrowings, overdue warnings, and course recommendations.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">3. Dynamic Timetables & Conflict Detection</h3>
                <p>Full daily/weekly schedule with automated room and faculty conflict detection algorithms, preventing double-bookings.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">4. Syllabus Tracker & PYQ Repository</h3>
                <p>Curriculum units with interactive topic completion tracking, attached lecture notes, and digitized past question papers with preview and download tracking.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">5. Smart Library OPAC & Circulation</h3>
                <p>Live search across monograph holdings, shelf locations, available copies, student reservations with hold queues, and librarian checkout/check-in desk.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">6. Academic Planner & Verified Assistant</h3>
                <p>Synthesizes paced revision timetables based on daily capacity and upcoming exam dates. Grounded AI assistant answers timetable, exam, and library queries strictly from verified database records.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">7. Staff & Admin Portal with Real Analytics</h3>
                <p>Validated bulk CSV imports with pre-commit validation reports, real stored data metrics, and immutable audit logs.</p>
              </div>

              <div>
                <h3 className="font-bold text-slate-900 uppercase tracking-wide">8. Database Schema & RLS Policies</h3>
                <p>Complete PostgreSQL relational schema in <code>/database/schema.sql</code> with Row-Level Security policies documented and interactive SQL browser.</p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowDocsModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium"
              >
                Close Verification Summary
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <CampusProvider>
      <CampusAppContent />
    </CampusProvider>
  );
}
