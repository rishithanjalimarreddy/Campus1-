import React from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Calendar,
  Clock,
  BookOpen,
  GraduationCap,
  Library,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Download,
  Bookmark,
  CreditCard,
  LifeBuoy
} from 'lucide-react';

interface StudentDashboardProps {
  onNavigate: (tab: string) => void;
  openAssistant: () => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ onNavigate, openAssistant }) => {
  const {
    currentUser,
    timetables,
    examinations,
    syllabus,
    completedTopicIds,
    getSyllabusProgress,
    circulations,
    reservations,
    books,
    questionPapers,
    downloadQuestionPaper,
    feeInvoices,
    helpdeskTickets,
    timetableConflicts
  } = useCampus();

  // Get current day name
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayDay = daysOfWeek[new Date().getDay()];
  const displayDay = todayDay === 'Sunday' || todayDay === 'Saturday' ? 'Monday' : todayDay;

  const todayClasses = timetables.filter(t => t.dayOfWeek === displayDay);

  // Next upcoming examination countdown calculation
  const publishedExams = examinations.filter(e => e.status === 'published');
  const now = new Date('2026-09-30T07:55:00'); // current time anchor from system prompt

  const upcomingExamsWithCountdown = publishedExams.map(exam => {
    const examDate = new Date(`${exam.examDate}T09:30:00`);
    const diffMs = examDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    return { ...exam, daysRemaining: diffDays };
  }).sort((a, b) => a.daysRemaining - b.daysRemaining);

  // Active book borrowings
  const activeCirculations = circulations.filter(
    c => c.userId === currentUser.id && c.status !== 'returned'
  );
  const activeReservations = reservations.filter(
    r => r.userId === currentUser.id && (r.status === 'pending' || r.status === 'ready_for_pickup')
  );

  // Fee and Helpdesk status
  const currentInvoice = feeInvoices.find(
    i => i.studentId === currentUser.id && (i.status === 'partial' || i.status === 'pending' || i.status === 'overdue')
  );
  const myOpenTickets = helpdeskTickets.filter(
    t => t.studentId === currentUser.id && t.status !== 'closed'
  );

  // Recommended books matching enrolled subjects (CS201, CS202, CS203)
  const recommendedBooks = books.slice(0, 3);

  // Total topics
  let totalTopics = 0;
  syllabus.forEach(u => (totalTopics += u.topics.length));
  const completedCount = completedTopicIds.length;
  const progressPercent = getSyllabusProgress();

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Hero Header with Campus Visual Asset */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-sm">
        <div className="absolute inset-0">
          <img
            src="/src/assets/images/campus_hub_library_1790780161716.jpg"
            alt="CampusOne Academic Complex & Library Hub"
            className="w-full h-full object-cover opacity-25"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/80 to-transparent" />
        </div>

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs text-indigo-300 font-medium">
              <span>{currentUser.departmentName}</span>
              <span aria-hidden="true">·</span>
              <span>Semester {currentUser.semester || 4}</span>
              <span aria-hidden="true">·</span>
              <span>ID: {currentUser.identifier}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Welcome back, {currentUser.name}
            </h1>
            <p className="text-sm text-slate-300 leading-relaxed">
              Your consolidated academic headquarters. Track daily lectures, upcoming mid-term exams,
              syllabus milestone completion, and smart library loans.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => onNavigate('planner')}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Generate Revision Plan</span>
            </button>
            <button
              onClick={openAssistant}
              className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium bg-white/10 hover:bg-white/20 text-white rounded-lg backdrop-blur-sm border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Query Campus AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fee Due Reminder Banner (Requirement 2 & 3) */}
      {currentInvoice && currentInvoice.outstandingBalance > 0 && (
        <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
          currentInvoice.status === 'overdue'
            ? 'bg-rose-50 border-rose-200 text-rose-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-start gap-3">
            <CreditCard className={`w-5 h-5 shrink-0 mt-0.5 ${
              currentInvoice.status === 'overdue' ? 'text-rose-600' : 'text-amber-600'
            }`} />
            <div>
              <div className="font-semibold text-xs">
                {currentInvoice.status === 'overdue' ? 'Immediate Action: Overdue Tuition Fee Notice' : 'Institutional Fee Payment Reminder'}
              </div>
              <div className="text-xs text-slate-600 mt-0.5">
                Semester {currentInvoice.semester} installment of <strong className="text-slate-900">${currentInvoice.outstandingBalance.toLocaleString()}</strong> is due on <strong>{currentInvoice.dueDate}</strong>.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('fees')}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Pay Installment</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Timetable Conflict Notification Banner (Requirement 3) */}
      {timetableConflicts.length > 0 && (
        <div className="p-4 rounded-xl border bg-amber-50 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-xs text-amber-900">
                Timetable Overlap Conflict Detected ({timetableConflicts.length} active)
              </div>
              <div className="text-xs text-amber-800 mt-0.5">
                {timetableConflicts[0].description}. Authorized faculty/HOD can resolve overlaps in the Timetable manager.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigate('timetable')}
            className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center gap-1.5 self-start sm:self-center"
          >
            <span>Review Conflict</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Metrics Row (SaaS Tabular Discipline) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Today's Classes */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Today's Classes</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">{todayClasses.length}</span>
            <span className="text-xs text-slate-500">lectures scheduled</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate">
            {todayClasses[0] ? `Next: ${todayClasses[0].subjectCode} at ${todayClasses[0].startTime}` : 'No remaining lectures today'}
          </div>
        </div>

        {/* Metric 2: Next Examination */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Next Examination</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">
              {upcomingExamsWithCountdown[0]?.daysRemaining || 0}
            </span>
            <span className="text-xs text-slate-500">days remaining</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 truncate">
            {upcomingExamsWithCountdown[0]?.subjectCode} ({upcomingExamsWithCountdown[0]?.examDate})
          </div>
        </div>

        {/* Metric 3: Syllabus Progress */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Syllabus Progress</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">{progressPercent}%</span>
            <span className="text-xs text-slate-500">({completedCount}/{totalTopics} topics)</span>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Metric 4: Library Holdings */}
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Library Books</span>
            <Library className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold tabular-nums text-slate-900">{activeCirculations.length}</span>
            <span className="text-xs text-slate-500">borrowed</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-500">{activeReservations.length} reserved</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            {activeCirculations.some(c => c.status === 'overdue') ? (
              <span className="text-rose-600 font-medium">Overdue items pending return</span>
            ) : (
              'All borrowed items within return terms'
            )}
          </div>
        </div>

      </div>

      {/* Main Content Grid: Today's Classes & Upcoming Examinations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 spans): Schedule & Syllabus */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Today's Class Timetable */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Today's Lecture Schedule ({displayDay})
                </h2>
                <p className="text-xs text-slate-500">
                  {todayDay === 'Sunday' || todayDay === 'Saturday' ? 'Showing Monday schedule (Weekend preview)' : 'Dynamic live timetable'}
                </p>
              </div>
              <button
                onClick={() => onNavigate('timetable')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todayClasses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No classes scheduled for today.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {todayClasses.map((item, idx) => (
                  <div
                    key={item.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50/50 rounded-lg px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 text-center shrink-0">
                        <div className="text-xs font-semibold tabular-nums text-slate-900">{item.startTime}</div>
                        <div className="text-[10px] text-slate-400 tabular-nums">{item.endTime}</div>
                      </div>
                      <div className="w-1 bg-indigo-500 rounded-full my-0.5" />
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          {item.subjectName}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span className="font-medium text-slate-700">{item.subjectCode}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.classroomName}</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.facultyName}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs text-slate-500">
                        {idx === 0 ? 'Upcoming' : 'Scheduled'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Examinations Countdown */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Upcoming Examinations Lifecycle
                </h2>
                <p className="text-xs text-slate-500">
                  Mid-Term official schedule & countdown timers
                </p>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All Exams</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {upcomingExamsWithCountdown.slice(0, 4).map(exam => (
                <div
                  key={exam.id}
                  className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-semibold text-indigo-700">{exam.subjectCode}</div>
                      <div className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {exam.subjectName}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-lg font-bold tabular-nums text-slate-900">
                        {exam.daysRemaining}
                      </span>
                      <span className="text-[10px] text-slate-500 block -mt-1">days left</span>
                    </div>
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-200/80 text-xs text-slate-600 flex items-center justify-between">
                    <span>{exam.examDate} ({exam.session})</span>
                    <span className="truncate max-w-[130px]">{exam.venue}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Previous-Year Question Papers Quick Access */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Recent Question Papers (PYQs)
                </h2>
                <p className="text-xs text-slate-500">
                  Searchable archive with verified faculty answers
                </p>
              </div>
              <button
                onClick={() => onNavigate('exams')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Full Repository</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {questionPapers.slice(0, 3).map(pyq => (
                <div
                  key={pyq.id}
                  className="p-3 rounded-lg border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-semibold text-slate-900">{pyq.subjectCode}</div>
                    <div className="text-xs text-slate-600 line-clamp-1 mt-0.5">{pyq.subjectName}</div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {pyq.year} · {pyq.examType}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 tabular-nums">{pyq.downloadCount} dl</span>
                    <button
                      onClick={() => downloadQuestionPaper(pyq.id)}
                      className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (1 span): Library & Recommendations */}
        <div className="space-y-6">
          
          {/* Library Circulation Status */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-900">
                My Library Account
              </h2>
              <button
                onClick={() => onNavigate('library')}
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Catalogue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Overdue alert if applicable */}
            {activeCirculations.some(c => c.status === 'overdue') && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold">Overdue Book Fine Notice</div>
                  <div className="mt-0.5">Please check in Database Concepts to clear $12.00 fine.</div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Issued Volumes ({activeCirculations.length})
              </div>

              {activeCirculations.length === 0 ? (
                <div className="text-xs text-slate-400 py-2">No currently issued books.</div>
              ) : (
                activeCirculations.map(circ => (
                  <div
                    key={circ.id}
                    className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-1.5"
                  >
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {circ.bookTitle}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                      <span>Due: {circ.dueDate}</span>
                      {circ.status === 'overdue' ? (
                        <span className="text-rose-600 font-semibold">Overdue</span>
                      ) : (
                        <span className="text-emerald-600 font-medium">On Loan</span>
                      )}
                    </div>
                  </div>
                ))
              )}

              {/* Reservations */}
              <div className="pt-2">
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Active Reservations ({activeReservations.length})
                </div>
                {activeReservations.map(res => (
                  <div
                    key={res.id}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 text-xs flex items-center justify-between"
                  >
                    <div className="line-clamp-1 pr-2 font-medium text-slate-800">
                      {res.bookTitle}
                    </div>
                    <span className="shrink-0 text-slate-500">
                      Queue #{res.queuePosition}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Resources (Section 5) */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Course Recommendations
                </h2>
                <p className="text-xs text-slate-500">
                  Curated for CSE 4th Semester syllabi
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {recommendedBooks.map(book => (
                <div
                  key={book.id}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50 transition-all"
                >
                  <div className="w-10 h-14 bg-slate-100 rounded overflow-hidden shrink-0 border border-slate-200">
                    {book.coverImage ? (
                      <img
                        src={book.coverImage}
                        alt={book.title}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        <BookOpen className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-900 line-clamp-1">
                      {book.title}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">
                      {book.author}
                    </div>
                    <div className="mt-1 text-[11px] flex items-center gap-2">
                      <span className={book.availableCopies > 0 ? 'text-emerald-700 font-medium' : 'text-slate-500'}>
                        {book.availableCopies > 0 ? `${book.availableCopies} available` : 'Reserved'}
                      </span>
                      <span className="text-slate-300">·</span>
                      <span className="text-slate-500 truncate">{book.shelfLocation}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('library')}
              className="mt-4 w-full py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              <Library className="w-3.5 h-3.5" />
              <span>Browse All Library Holdings</span>
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
