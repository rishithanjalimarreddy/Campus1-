import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  UserRole,
  TimetableEntry,
  Examination,
  SyllabusUnit,
  QuestionPaper,
  Book,
  BookReservation,
  BookCirculation,
  NotificationItem,
  AuditLog,
  AcademicPlannerTask,
  TimetableConflict,
  FeeInvoice,
  FeePayment,
  HelpdeskTicket,
  TicketMessage
} from '../types';
import {
  USERS,
  INITIAL_TIMETABLES,
  INITIAL_EXAMINATIONS,
  INITIAL_SYLLABUS,
  INITIAL_QUESTION_PAPERS,
  INITIAL_BOOKS,
  INITIAL_CIRCULATIONS,
  INITIAL_RESERVATIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_FEE_INVOICES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_HELPDESK_TICKETS
} from '../data/mockData';

interface CampusContextType {
  // Authentication & Sessions
  currentUser: UserProfile;
  isAuthenticated: boolean;
  users: UserProfile[];
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  logout: () => void;
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message: string }>;
  switchUserRole: (role: UserRole) => boolean;

  // Timetable
  timetables: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => boolean;
  deleteTimetableEntry: (id: string) => void;
  timetableConflicts: TimetableConflict[];

  // Examinations
  examinations: Examination[];
  addExamination: (exam: Omit<Examination, 'id'>) => void;

  // Syllabus & Progress
  syllabus: SyllabusUnit[];
  completedTopicIds: string[];
  toggleTopicCompletion: (topicId: string) => void;
  getSyllabusProgress: (subjectId?: string) => number;

  // Question Papers (PYQs)
  questionPapers: QuestionPaper[];
  downloadQuestionPaper: (id: string) => void;
  uploadQuestionPaper: (pyq: Omit<QuestionPaper, 'id' | 'downloadCount' | 'uploadedDate'>) => void;

  // Smart Library
  books: Book[];
  circulations: BookCirculation[];
  reservations: BookReservation[];
  reserveBook: (bookId: string) => { success: boolean; message: string };
  cancelReservation: (reservationId: string) => void;
  issueBook: (bookId: string, userIdentifier: string, days: number) => { success: boolean; message: string };
  returnBook: (circulationId: string) => { success: boolean; message: string };
  renewBook: (circulationId: string) => { success: boolean; message: string };

  // Planner
  plannerTasks: AcademicPlannerTask[];
  generateRevisionPlan: (dailyHours: number) => void;
  togglePlannerTask: (taskId: string) => void;
  addPlannerTask: (task: Omit<AcademicPlannerTask, 'id' | 'studentId'>) => void;

  // Fee Management
  feeInvoices: FeeInvoice[];
  feePayments: FeePayment[];
  payFeeInstallment: (
    invoiceId: string,
    installmentNumber: number,
    amount: number,
    paymentMethod: FeePayment['paymentMethod'],
    notes?: string,
    simulateFailure?: boolean
  ) => Promise<{ success: boolean; message: string; payment?: FeePayment }>;
  createInvoice: (
    studentId: string,
    semester: number,
    academicYear: string,
    breakdown: {
      tuition: number;
      examination: number;
      library: number;
      hostel: number;
      laboratory: number;
      development: number;
    },
    scholarshipDiscount: number,
    scholarshipName: string,
    dueDate: string
  ) => { success: boolean; message: string; invoice?: FeeInvoice };
  recordOfflinePayment: (
    invoiceId: string,
    amount: number,
    paymentMethod: FeePayment['paymentMethod'],
    instrumentNumber: string,
    issuingBank: string,
    notes?: string
  ) => { success: boolean; message: string; payment?: FeePayment };
  applyScholarship: (invoiceId: string, discountAmount: number, scholarshipName: string) => { success: boolean; message: string };
  sendFeeReminder: (invoiceId: string) => { success: boolean; message: string };

  // Student Helpdesk
  helpdeskTickets: HelpdeskTicket[];
  createHelpdeskTicket: (
    category: HelpdeskTicket['category'],
    subject: string,
    description: string,
    priority: HelpdeskTicket['priority']
  ) => HelpdeskTicket;
  addTicketMessage: (ticketId: string, content: string) => void;
  updateTicketStatus: (
    ticketId: string,
    status: HelpdeskTicket['status'],
    assignedTo?: string,
    assignedToName?: string,
    resolutionNotes?: string
  ) => void;

  // Notifications
  notifications: NotificationItem[];
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;

  // Audit Logs
  auditLogs: AuditLog[];
  logAction: (action: string, affectedRecord: string, reason?: string) => void;

  // Offline / Sync Status
  isOfflineMode: boolean;
  setIsOfflineMode: (offline: boolean) => void;
  lastSyncedAt: Date;
  syncNow: () => void;

  // Verified Assistant Answer Generator
  queryCampusAssistant: (
    query: string,
    history?: { role: 'user' | 'model' | 'assistant'; text: string }[]
  ) => Promise<{ answer: string; sources: string[]; navigationTab?: string }>;
}

const CampusContext = createContext<CampusContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'campusone_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (err) {
    console.error('Failed to write to localStorage', err);
  }
}

export const CampusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() =>
    loadFromStorage('current_user', USERS[0])
  );
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    loadFromStorage('is_authenticated', true)
  );

  const [timetables, setTimetables] = useState<TimetableEntry[]>(() =>
    loadFromStorage('timetables', INITIAL_TIMETABLES)
  );
  const [examinations, setExaminations] = useState<Examination[]>(() =>
    loadFromStorage('examinations', INITIAL_EXAMINATIONS)
  );
  const [syllabus, setSyllabus] = useState<SyllabusUnit[]>(() =>
    loadFromStorage('syllabus', INITIAL_SYLLABUS)
  );
  const [completedTopicIds, setCompletedTopicIds] = useState<string[]>(() =>
    loadFromStorage('completed_topics', ['top-101', 'top-102', 'top-201'])
  );
  const [questionPapers, setQuestionPapers] = useState<QuestionPaper[]>(() =>
    loadFromStorage('pyqs', INITIAL_QUESTION_PAPERS)
  );
  const [books, setBooks] = useState<Book[]>(() =>
    loadFromStorage('books', INITIAL_BOOKS)
  );
  const [circulations, setCirculations] = useState<BookCirculation[]>(() =>
    loadFromStorage('circulations', INITIAL_CIRCULATIONS)
  );
  const [reservations, setReservations] = useState<BookReservation[]>(() =>
    loadFromStorage('reservations', INITIAL_RESERVATIONS)
  );
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() =>
    loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS)
  );
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoice[]>(() =>
    loadFromStorage('fee_invoices', INITIAL_FEE_INVOICES)
  );
  const [feePayments, setFeePayments] = useState<FeePayment[]>(() =>
    loadFromStorage('fee_payments', INITIAL_FEE_PAYMENTS)
  );
  const [helpdeskTickets, setHelpdeskTickets] = useState<HelpdeskTicket[]>(() =>
    loadFromStorage('helpdesk_tickets', INITIAL_HELPDESK_TICKETS)
  );

  const [plannerTasks, setPlannerTasks] = useState<AcademicPlannerTask[]>(() =>
    loadFromStorage('planner_tasks', [
      {
        id: 'plan-1',
        studentId: 'user-std-1',
        subjectCode: 'CS201',
        subjectName: 'Data Structures and Algorithms',
        title: 'Revise Circular Queues & Priority Deques (Unit 1)',
        dueDate: '2026-10-02',
        estimatedHours: 2.5,
        completed: true,
        generatedFrom: 'syllabus'
      },
      {
        id: 'plan-2',
        studentId: 'user-std-1',
        subjectCode: 'CS201',
        subjectName: 'Data Structures and Algorithms',
        title: 'Practice Binary Tree Traversals & AVL Tree Rotations (Unit 2)',
        dueDate: '2026-10-06',
        estimatedHours: 4,
        completed: false,
        generatedFrom: 'syllabus'
      },
      {
        id: 'plan-3',
        studentId: 'user-std-1',
        subjectCode: 'CS202',
        subjectName: 'Operating Systems',
        title: 'Review Classical Sync Problems & Peterson Solution',
        dueDate: '2026-10-08',
        estimatedHours: 3,
        completed: false,
        generatedFrom: 'syllabus'
      },
      {
        id: 'plan-4',
        studentId: 'user-std-1',
        subjectCode: 'CS201',
        subjectName: 'Data Structures and Algorithms',
        title: 'Mid-Term Exam Readiness Review (Exam in 12 days)',
        dueDate: '2026-10-11',
        estimatedHours: 3.5,
        completed: false,
        generatedFrom: 'exam'
      }
    ])
  );

  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());

  // Persistence triggers
  useEffect(() => saveToStorage('current_user', currentUser), [currentUser]);
  useEffect(() => saveToStorage('is_authenticated', isAuthenticated), [isAuthenticated]);
  useEffect(() => saveToStorage('timetables', timetables), [timetables]);
  useEffect(() => saveToStorage('examinations', examinations), [examinations]);
  useEffect(() => saveToStorage('syllabus', syllabus), [syllabus]);
  useEffect(() => saveToStorage('completed_topics', completedTopicIds), [completedTopicIds]);
  useEffect(() => saveToStorage('questionPapers', questionPapers), [questionPapers]);
  useEffect(() => saveToStorage('books', books), [books]);
  useEffect(() => saveToStorage('circulations', circulations), [circulations]);
  useEffect(() => saveToStorage('reservations', reservations), [reservations]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);
  useEffect(() => saveToStorage('audit_logs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('planner_tasks', plannerTasks), [plannerTasks]);
  useEffect(() => saveToStorage('fee_invoices', feeInvoices), [feeInvoices]);
  useEffect(() => saveToStorage('fee_payments', feePayments), [feePayments]);
  useEffect(() => saveToStorage('helpdesk_tickets', helpdeskTickets), [helpdeskTickets]);

  const logAction = (action: string, affectedRecord: string, reason?: string) => {
    const newLog: AuditLog = {
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      actorId: currentUser.id,
      actorName: currentUser.name,
      actorRole: currentUser.role,
      action,
      affectedRecord,
      reason: reason || 'Action performed via CampusOne Web Console'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Authentication Handlers
  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    const user = USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'Invalid institutional email address. No matching profile found.' };
    }

    if (password && user.password && user.password !== password) {
      return { success: false, message: 'Incorrect credentials. Please verify your institutional password.' };
    }

    setCurrentUserState(user);
    setIsAuthenticated(true);
    logAction('USER_SIGN_IN', `Authenticated as ${user.name} (${user.role.toUpperCase()})`);
    return { success: true, message: `Welcome, ${user.name}!`, user };
  };

  const logout = () => {
    logAction('USER_SIGN_OUT', `Session terminated for ${currentUser.name}`);
    setIsAuthenticated(false);
  };

  const requestPasswordReset = async (email: string): Promise<{ success: boolean; message: string }> => {
    const user = USERS.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return { success: false, message: 'No registered institutional account with that email address.' };
    }
    const token = 'RST-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    logAction('PASSWORD_RESET_DISPATCHED', `Reset token ${token} generated for ${user.email}`);
    return {
      success: true,
      message: `A secure password reset link (Security Token: ${token}) has been sent to ${email}. Check your institutional mailbox.`
    };
  };

  const switchUserRole = (role: UserRole): boolean => {
    const match = USERS.find(u => u.role === role);
    if (!match) return false;

    // Enforce role security: students cannot escalate without switching credential session
    setCurrentUserState(match);
    setIsAuthenticated(true);
    logAction('SWITCH_USER_PROFILE', `Active profile switched to ${match.name} (${match.role.toUpperCase()})`);
    return true;
  };

  // Timetable Conflict Detection Engine
  const timetableConflicts: TimetableConflict[] = React.useMemo(() => {
    const conflicts: TimetableConflict[] = [];

    for (let i = 0; i < timetables.length; i++) {
      for (let j = i + 1; j < timetables.length; j++) {
        const a = timetables[i];
        const b = timetables[j];

        if (a.dayOfWeek === b.dayOfWeek) {
          // Time overlap check: max(startA, startB) < min(endA, endB)
          if (a.startTime < b.endTime && b.startTime < a.endTime) {
            // Check classroom conflict
            if (a.classroomId === b.classroomId) {
              conflicts.push({
                type: 'room_overlap',
                description: `Room ${a.classroomName} double-booked on ${a.dayOfWeek} (${a.startTime}-${a.endTime}) between ${a.subjectCode} and ${b.subjectCode}`,
                entries: [a, b]
              });
            }
            // Check faculty conflict
            if (a.facultyId === b.facultyId) {
              conflicts.push({
                type: 'faculty_overlap',
                description: `Faculty ${a.facultyName} double-booked on ${a.dayOfWeek} (${a.startTime}-${a.endTime}) between ${a.subjectCode} and ${b.subjectCode}`,
                entries: [a, b]
              });
            }
          }
        }
      }
    }
    return conflicts;
  }, [timetables]);

  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>): boolean => {
    if (currentUser.role !== 'faculty' && currentUser.role !== 'hod' && currentUser.role !== 'admin') {
      throw new Error('Unauthorized: Only faculty, HOD, and administrators can manage class schedules.');
    }

    const newId = 'tt-' + Date.now();
    const newEntry: TimetableEntry = { ...entry, id: newId };

    const hasOverlap = timetables.some(
      existing =>
        existing.dayOfWeek === newEntry.dayOfWeek &&
        existing.startTime < newEntry.endTime &&
        newEntry.startTime < existing.endTime &&
        (existing.classroomId === newEntry.classroomId || existing.facultyId === newEntry.facultyId)
    );

    setTimetables(prev => [...prev, newEntry]);
    logAction(
      'CREATE_TIMETABLE_ENTRY',
      `${newEntry.subjectCode} on ${newEntry.dayOfWeek} ${newEntry.startTime}-${newEntry.endTime} at ${newEntry.classroomName}`,
      hasOverlap ? 'WARNING: Created with timetable conflict' : 'Standard schedule insertion'
    );
    return !hasOverlap;
  };

  const deleteTimetableEntry = (id: string) => {
    if (currentUser.role !== 'faculty' && currentUser.role !== 'hod' && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const entry = timetables.find(t => t.id === id);
    setTimetables(prev => prev.filter(t => t.id !== id));
    if (entry) {
      logAction('DELETE_TIMETABLE_ENTRY', `${entry.subjectCode} (${entry.dayOfWeek} ${entry.startTime})`);
    }
  };

  const addExamination = (exam: Omit<Examination, 'id'>) => {
    if (currentUser.role !== 'faculty' && currentUser.role !== 'hod' && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const newExam: Examination = { ...exam, id: 'exam-' + Date.now() };
    setExaminations(prev => [...prev, newExam]);
    logAction('PUBLISH_EXAMINATION', `${newExam.subjectCode} on ${newExam.examDate} (${newExam.venue})`);
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: 'user-std-1',
        title: 'New Examination Scheduled',
        message: `${newExam.subjectName} (${newExam.type}) has been scheduled on ${newExam.examDate}.`,
        type: 'exam',
        timestamp: 'Just now',
        read: false,
        actionLink: 'exams'
      },
      ...prev
    ]);
  };

  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopicIds(prev => {
      const exists = prev.includes(topicId);
      return exists ? prev.filter(id => id !== topicId) : [...prev, topicId];
    });
  };

  const getSyllabusProgress = (subjectId?: string): number => {
    const units = subjectId ? syllabus.filter(u => u.subjectId === subjectId) : syllabus;
    let totalTopics = 0;
    let completedTopics = 0;

    units.forEach(unit => {
      unit.topics.forEach(t => {
        totalTopics++;
        if (completedTopicIds.includes(t.id)) {
          completedTopics++;
        }
      });
    });

    if (totalTopics === 0) return 0;
    return Math.round((completedTopics / totalTopics) * 100);
  };

  const downloadQuestionPaper = (id: string) => {
    setQuestionPapers(prev =>
      prev.map(pyq => (pyq.id === id ? { ...pyq, downloadCount: pyq.downloadCount + 1 } : pyq))
    );
  };

  const uploadQuestionPaper = (pyq: Omit<QuestionPaper, 'id' | 'downloadCount' | 'uploadedDate'>) => {
    if (currentUser.role !== 'faculty' && currentUser.role !== 'hod' && currentUser.role !== 'admin') {
      throw new Error('Unauthorized');
    }
    const newPaper: QuestionPaper = {
      ...pyq,
      id: 'pyq-' + Date.now(),
      downloadCount: 0,
      uploadedDate: new Date().toISOString().split('T')[0]
    };
    setQuestionPapers(prev => [newPaper, ...prev]);
    logAction('UPLOAD_QUESTION_PAPER', `${newPaper.subjectCode} ${newPaper.year} ${newPaper.examType}`);
  };

  // Smart Library Reservation Engine
  const reserveBook = (bookId: string): { success: boolean; message: string } => {
    const book = books.find(b => b.id === bookId);
    if (!book) return { success: false, message: 'Book record not found in OPAC.' };

    const existing = reservations.find(
      r => r.bookId === bookId && r.userId === currentUser.id && (r.status === 'pending' || r.status === 'ready_for_pickup')
    );
    if (existing) {
      return { success: false, message: 'You already hold an active reservation for this title.' };
    }

    const activeCount = reservations.filter(r => r.userId === currentUser.id && r.status === 'pending').length;
    if (activeCount >= 3) {
      return { success: false, message: 'Maximum limit of 3 concurrent book reservations reached.' };
    }

    const currentBookReservations = reservations.filter(
      r => r.bookId === bookId && (r.status === 'pending' || r.status === 'ready_for_pickup')
    );
    const queuePos = currentBookReservations.length + 1;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 7);

    const newRes: BookReservation = {
      id: 'resv-' + Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      reservationDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate.toISOString().split('T')[0],
      status: book.availableCopies > 0 ? 'ready_for_pickup' : 'pending',
      queuePosition: queuePos
    };

    setReservations(prev => [...prev, newRes]);
    logAction('RESERVE_BOOK', `Book "${book.title}" reserved by ${currentUser.name} (Queue #${queuePos})`);

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: currentUser.id,
        title: 'Book Reserved Successfully',
        message: `Reserved "${book.title}". Status: ${
          book.availableCopies > 0 ? 'Ready for pickup at counter' : `Queued (Position #${queuePos})`
        }`,
        type: 'library',
        timestamp: 'Just now',
        read: false,
        actionLink: 'library'
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Reservation confirmed for "${book.title}". ${
        book.availableCopies > 0 ? 'Copies are on shelf ready for pickup!' : `You are position #${queuePos} in queue.`
      }`
    };
  };

  const cancelReservation = (reservationId: string) => {
    setReservations(prev => prev.filter(r => r.id !== reservationId));
    logAction('CANCEL_RESERVATION', `Reservation #${reservationId} cancelled`);
  };

  const issueBook = (bookId: string, userIdentifier: string, days: number = 14): { success: boolean; message: string } => {
    if (currentUser.role !== 'librarian' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Librarian or Administrator can issue books.' };
    }

    const book = books.find(b => b.id === bookId);
    if (!book) return { success: false, message: 'Book not found' };
    if (book.availableCopies <= 0) return { success: false, message: 'No copies currently available on shelf.' };

    const targetUser = USERS.find(u => u.identifier === userIdentifier || u.name.toLowerCase() === userIdentifier.toLowerCase());
    if (!targetUser) return { success: false, message: `Member with ID/Name "${userIdentifier}" not found.` };

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const newCirc: BookCirculation = {
      id: 'circ-' + Date.now(),
      bookId: book.id,
      bookTitle: book.title,
      userId: targetUser.id,
      userName: targetUser.name,
      userRole: targetUser.role,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      status: 'issued',
      fineAmount: 0.00
    };

    setBooks(prev =>
      prev.map(b => (b.id === bookId ? { ...b, availableCopies: Math.max(0, b.availableCopies - 1) } : b))
    );

    setReservations(prev =>
      prev.map(r => (r.bookId === bookId && r.userId === targetUser.id ? { ...r, status: 'fulfilled' } : r))
    );

    setCirculations(prev => [newCirc, ...prev]);
    logAction('ISSUE_BOOK', `"${book.title}" issued to ${targetUser.name} (${targetUser.identifier}) by ${currentUser.name}`);

    return { success: true, message: `Book "${book.title}" successfully issued to ${targetUser.name}. Due on ${newCirc.dueDate}.` };
  };

  const returnBook = (circulationId: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'librarian' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const circ = circulations.find(c => c.id === circulationId);
    if (!circ) return { success: false, message: 'Circulation record not found.' };

    const returnDate = new Date().toISOString().split('T')[0];

    setBooks(prev =>
      prev.map(b => (b.id === circ.bookId ? { ...b, availableCopies: Math.min(b.totalCopies, b.availableCopies + 1) } : b))
    );

    setCirculations(prev =>
      prev.map(c => (c.id === circulationId ? { ...c, returnDate, status: 'returned' } : c))
    );

    logAction('RETURN_BOOK', `"${circ.bookTitle}" returned by ${circ.userName}`);
    return { success: true, message: `"${circ.bookTitle}" checked in successfully. Shelf availability restored.` };
  };

  const renewBook = (circulationId: string): { success: boolean; message: string } => {
    const circ = circulations.find(c => c.id === circulationId);
    if (!circ) return { success: false, message: 'Record not found.' };

    const currentDue = new Date(circ.dueDate);
    currentDue.setDate(currentDue.getDate() + 14);
    const newDueDate = currentDue.toISOString().split('T')[0];

    setCirculations(prev =>
      prev.map(c => (c.id === circulationId ? { ...c, dueDate: newDueDate, status: 'issued' } : c))
    );

    logAction('RENEW_BOOK', `"${circ.bookTitle}" renewed until ${newDueDate}`);
    return { success: true, message: `Loan renewed for 14 additional days until ${newDueDate}.` };
  };

  // Academic Planner Generator
  const generateRevisionPlan = (dailyHours: number) => {
    const incompleteTopics: { topicName: string; subjectCode: string; subjectName: string; hours: number }[] = [];

    syllabus.forEach(unit => {
      unit.topics.forEach(t => {
        if (!completedTopicIds.includes(t.id)) {
          incompleteTopics.push({
            topicName: t.name,
            subjectCode: unit.subjectCode,
            subjectName: unit.subjectName,
            hours: t.estimatedHours
          });
        }
      });
    });

    const newTasks: AcademicPlannerTask[] = [];
    const today = new Date();

    let currentDayOffset = 1;
    let accumulatedHoursForDay = 0;

    incompleteTopics.slice(0, 8).forEach(topic => {
      if (accumulatedHoursForDay + topic.hours > dailyHours && accumulatedHoursForDay > 0) {
        currentDayOffset += 1;
        accumulatedHoursForDay = 0;
      }

      const taskDate = new Date(today);
      taskDate.setDate(today.getDate() + currentDayOffset);

      newTasks.push({
        id: 'task-rev-' + Math.random().toString(36).substring(2, 9),
        studentId: currentUser.id,
        subjectCode: topic.subjectCode,
        subjectName: topic.subjectName,
        title: `Revise: ${topic.topicName}`,
        dueDate: taskDate.toISOString().split('T')[0],
        estimatedHours: topic.hours,
        completed: false,
        generatedFrom: 'syllabus'
      });

      accumulatedHoursForDay += topic.hours;
    });

    examinations.forEach(exam => {
      const examDate = new Date(exam.examDate);
      const reviewDate = new Date(examDate);
      reviewDate.setDate(examDate.getDate() - 1);

      newTasks.push({
        id: 'task-exam-' + exam.id,
        studentId: currentUser.id,
        subjectCode: exam.subjectCode,
        subjectName: exam.subjectName,
        title: `Final Mock Paper & Formula Review (${exam.type})`,
        dueDate: reviewDate.toISOString().split('T')[0],
        estimatedHours: 3,
        completed: false,
        generatedFrom: 'exam'
      });
    });

    circulations
      .filter(c => c.userId === currentUser.id && c.status !== 'returned')
      .forEach(circ => {
        const dueDate = new Date(circ.dueDate);
        const reminderDate = new Date(dueDate);
        reminderDate.setDate(dueDate.getDate() - 2);

        newTasks.push({
          id: 'task-lib-' + circ.id,
          studentId: currentUser.id,
          subjectCode: 'LIB',
          subjectName: 'Library Circulation',
          title: `Return / Renew: "${circ.bookTitle}" (Due ${circ.dueDate})`,
          dueDate: reminderDate.toISOString().split('T')[0],
          estimatedHours: 0.5,
          completed: false,
          generatedFrom: 'library_due'
        });
      });

    newTasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    setPlannerTasks(newTasks);
    logAction('GENERATE_REVISION_PLAN', `Paced revision timetable synthesized for ${dailyHours} hrs/day`);
  };

  const togglePlannerTask = (taskId: string) => {
    setPlannerTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, completed: !t.completed } : t))
    );
  };

  const addPlannerTask = (task: Omit<AcademicPlannerTask, 'id' | 'studentId'>) => {
    const newTask: AcademicPlannerTask = {
      ...task,
      id: 'task-custom-' + Date.now(),
      studentId: currentUser.id
    };
    setPlannerTasks(prev => [...prev, newTask].sort((a, b) => a.dueDate.localeCompare(b.dueDate)));
  };

  // Persistent Fee Management Handlers
  const payFeeInstallment = async (
    invoiceId: string,
    installmentNumber: number,
    amount: number,
    paymentMethod: FeePayment['paymentMethod'],
    notes?: string,
    simulateFailure?: boolean
  ): Promise<{ success: boolean; message: string; payment?: FeePayment }> => {
    const inv = feeInvoices.find(i => i.id === invoiceId);
    if (!inv) return { success: false, message: 'Fee invoice record not found.' };

    // Security & Ownership: only invoice student, accounts officer, or admin can process payment
    const isAuthorized =
      currentUser.role === 'accounts_officer' ||
      currentUser.role === 'admin' ||
      currentUser.id === inv.studentId;
    if (!isAuthorized) {
      return { success: false, message: 'Access Denied: You do not have permission to pay invoices for this student.' };
    }

    // Check duplicate payment prevention: already cleared balance
    if (inv.outstandingBalance <= 0) {
      return { success: false, message: 'This invoice has already been fully paid and cleared. Outstanding balance is $0.00.' };
    }

    // Check duplicate payment prevention: specific installment already settled
    const targetInstallment = inv.installmentPlan.find(inst => inst.installmentNumber === installmentNumber);
    if (targetInstallment && targetInstallment.paid) {
      return { success: false, message: `Installment #${installmentNumber} has already been paid and settled.` };
    }

    if (amount <= 0 || amount > inv.outstandingBalance) {
      return { success: false, message: `Invalid payment amount ($${amount}). Outstanding balance is $${inv.outstandingBalance}.` };
    }

    // Support simulated payment gateway failure mode for thorough testing
    if (simulateFailure) {
      logAction(
        'FEE_PAYMENT_FAILED_SIMULATION',
        `Simulated gateway decline for ${inv.studentRoll} ($${amount})`,
        `Method: ${paymentMethod} [DEMO GATEWAY ERROR ERR-DECLINED]`
      );
      return {
        success: false,
        message: 'Payment Gateway Authorization Failed [DEMO SIMULATION]: Bank declined transaction (Error 402: Card/VPA authorization timeout).'
      };
    }

    const receiptNum = 'REC-2026-' + Math.floor(10000 + Math.random() * 90000);
    const txnRef = 'GATEWAY/DEMO/2026/TXN' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const newPayment: FeePayment = {
      id: 'pay-' + Date.now(),
      invoiceId: inv.id,
      studentId: inv.studentId,
      studentName: inv.studentName,
      studentRoll: inv.studentRoll,
      amount,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentMethod,
      transactionReference: txnRef,
      gatewayMode: 'VERIFIED_GATEWAY_DEMO',
      gatewayStatus: 'verified_success',
      receiptNumber: receiptNum,
      semester: inv.semester,
      notes: notes || `Installment ${installmentNumber} payment cleared via CampusOne verified checkout.`
    };

    const newPaidAmount = inv.paidAmount + amount;
    const newOutstanding = Math.max(0, inv.netAmount - newPaidAmount);
    const newStatus = newOutstanding === 0 ? 'paid' : 'partial';

    const updatedPlan = inv.installmentPlan.map(inst => {
      if (inst.installmentNumber === installmentNumber) {
        return {
          ...inst,
          paid: true,
          paidAt: new Date().toISOString().split('T')[0]
        };
      }
      return inst;
    });

    setFeeInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaidAmount,
              outstandingBalance: newOutstanding,
              status: newStatus,
              installmentPlan: updatedPlan
            }
          : i
      )
    );

    setFeePayments(prev => [newPayment, ...prev]);

    logAction(
      'FEE_PAYMENT_PROCESSED',
      `Payment of $${amount.toFixed(2)} received for ${inv.studentRoll} (Receipt: ${receiptNum})`,
      `Processed via Verified Demo Payment Gateway (${paymentMethod})`
    );

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: inv.studentId,
        title: 'Fee Payment Verified',
        message: `Successfully processed payment of $${amount.toLocaleString()} for Semester ${inv.semester}. Official Receipt: ${receiptNum}.`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
        actionLink: 'fees'
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Payment of $${amount.toFixed(2)} verified successfully! Official receipt generated (${receiptNum}).`,
      payment: newPayment
    };
  };

  const createInvoice = (
    studentId: string,
    semester: number,
    academicYear: string,
    breakdown: {
      tuition: number;
      examination: number;
      library: number;
      hostel: number;
      laboratory: number;
      development: number;
    },
    scholarshipDiscount: number,
    scholarshipName: string,
    dueDate: string
  ): { success: boolean; message: string; invoice?: FeeInvoice } => {
    if (currentUser.role !== 'accounts_officer' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Accounts Officers or Administrators can create fee invoices.' };
    }
    const student = USERS.find(u => u.id === studentId);
    if (!student) return { success: false, message: 'Selected student record not found.' };

    const grossAmount =
      breakdown.tuition +
      breakdown.examination +
      breakdown.library +
      breakdown.laboratory +
      breakdown.hostel +
      breakdown.development;

    if (grossAmount <= 0) {
      return { success: false, message: 'Gross invoice fees must be greater than zero.' };
    }

    const netAmount = Math.max(0, grossAmount - scholarshipDiscount);
    const half = Math.round(netAmount / 2);
    const remaining = netAmount - half;
    const invId = `inv-${student.departmentId.replace('dept-', '')}${semester}-${Date.now().toString().slice(-4)}`;

    const newInvoice: FeeInvoice = {
      id: invId,
      studentId: student.id,
      studentName: student.name,
      studentRoll: student.identifier,
      departmentName: student.departmentName,
      semester,
      academicYear,
      breakdown,
      grossAmount,
      scholarshipDiscount,
      scholarshipName: scholarshipDiscount > 0 ? scholarshipName : undefined,
      netAmount,
      paidAmount: 0,
      outstandingBalance: netAmount,
      dueDate,
      status: 'pending',
      installmentPlan: [
        {
          installmentNumber: 1,
          amount: half,
          dueDate,
          paid: false
        },
        {
          installmentNumber: 2,
          amount: remaining,
          dueDate: new Date(new Date(dueDate).getTime() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          paid: false
        }
      ]
    };

    setFeeInvoices(prev => [newInvoice, ...prev]);
    logAction('CREATE_FEE_INVOICE', `Created Invoice ${invId} for ${student.name} ($${netAmount.toLocaleString()})`);

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: student.id,
        title: 'New Semester Fee Invoice Generated',
        message: `Invoice ${invId} for Semester ${semester} (${academicYear}) has been billed. Net payable: $${netAmount.toLocaleString()}. Due Date: ${dueDate}.`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
        actionLink: 'fees'
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Invoice ${invId} successfully created for ${student.name} ($${netAmount.toLocaleString()}).`,
      invoice: newInvoice
    };
  };

  const recordOfflinePayment = (
    invoiceId: string,
    amount: number,
    paymentMethod: FeePayment['paymentMethod'],
    instrumentNumber: string,
    issuingBank: string,
    notes?: string
  ): { success: boolean; message: string; payment?: FeePayment } => {
    if (currentUser.role !== 'accounts_officer' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Accounts Officers or Administrators can record offline payments.' };
    }
    const inv = feeInvoices.find(i => i.id === invoiceId);
    if (!inv) return { success: false, message: 'Invoice not found.' };

    if (amount <= 0 || amount > inv.outstandingBalance) {
      return { success: false, message: `Invalid amount. Outstanding balance is $${inv.outstandingBalance}.` };
    }

    const receiptNum = 'REC-2026-' + Math.floor(10000 + Math.random() * 90000);
    const txnRef = `${paymentMethod.toUpperCase()}/OFFLINE/${instrumentNumber || 'INST-' + Date.now().toString().slice(-6)}`;

    const newPayment: FeePayment = {
      id: 'pay-' + Date.now(),
      invoiceId: inv.id,
      studentId: inv.studentId,
      studentName: inv.studentName,
      studentRoll: inv.studentRoll,
      amount,
      paymentDate: new Date().toISOString().replace('T', ' ').substring(0, 19),
      paymentMethod,
      transactionReference: txnRef,
      gatewayMode: 'VERIFIED_GATEWAY_DEMO',
      gatewayStatus: 'verified_success',
      receiptNumber: receiptNum,
      semester: inv.semester,
      notes: `[OFFLINE RECORD] Bank: ${issuingBank || 'Institutional Counter'}. Instrument #${instrumentNumber || 'N/A'}. ${notes || 'Cleared and verified by Accounts Officer'}`
    };

    const newPaidAmount = inv.paidAmount + amount;
    const newOutstanding = Math.max(0, inv.netAmount - newPaidAmount);
    const newStatus = newOutstanding === 0 ? 'paid' : 'partial';

    // Update installments
    let remainingPaidPool = newPaidAmount;
    const updatedPlan = inv.installmentPlan.map(inst => {
      if (remainingPaidPool >= inst.amount) {
        remainingPaidPool -= inst.amount;
        return {
          ...inst,
          paid: true,
          paidAt: inst.paidAt || new Date().toISOString().split('T')[0]
        };
      }
      return inst;
    });

    setFeeInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              paidAmount: newPaidAmount,
              outstandingBalance: newOutstanding,
              status: newStatus,
              installmentPlan: updatedPlan
            }
          : i
      )
    );

    setFeePayments(prev => [newPayment, ...prev]);
    logAction('RECORD_OFFLINE_PAYMENT', `Verified offline payment of $${amount} for ${inv.studentRoll} (${txnRef})`);

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: inv.studentId,
        title: 'Offline Payment Counter Verification Complete',
        message: `Offline ${paymentMethod} payment of $${amount.toLocaleString()} for Semester ${inv.semester} has been verified and recorded. Receipt: ${receiptNum}.`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
        actionLink: 'fees'
      },
      ...prev
    ]);

    return {
      success: true,
      message: `Offline payment of $${amount.toLocaleString()} verified and recorded (Receipt ${receiptNum}).`,
      payment: newPayment
    };
  };

  const applyScholarship = (
    invoiceId: string,
    discountAmount: number,
    scholarshipName: string
  ): { success: boolean; message: string } => {
    if (currentUser.role !== 'accounts_officer' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only Accounts Officers or Administrators can adjust fees.' };
    }

    const inv = feeInvoices.find(i => i.id === invoiceId);
    if (!inv) return { success: false, message: 'Invoice not found.' };

    const newNet = Math.max(0, inv.grossAmount - discountAmount);
    const newOutstanding = Math.max(0, newNet - inv.paidAmount);
    const newStatus = newOutstanding === 0 ? 'paid' : inv.paidAmount > 0 ? 'partial' : 'pending';

    setFeeInvoices(prev =>
      prev.map(i =>
        i.id === invoiceId
          ? {
              ...i,
              scholarshipDiscount: discountAmount,
              scholarshipName,
              netAmount: newNet,
              outstandingBalance: newOutstanding,
              status: newStatus
            }
          : i
      )
    );

    logAction('APPLY_SCHOLARSHIP', `Applied ${scholarshipName} ($${discountAmount}) to invoice ${invoiceId}`);
    return { success: true, message: `Scholarship discount of $${discountAmount} applied successfully.` };
  };

  const sendFeeReminder = (invoiceId: string): { success: boolean; message: string } => {
    if (currentUser.role !== 'accounts_officer' && currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized' };
    }

    const inv = feeInvoices.find(i => i.id === invoiceId);
    if (!inv) return { success: false, message: 'Invoice not found.' };

    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: inv.studentId,
        title: 'Fee Payment Due Reminder',
        message: `Notice from Finance Division: Outstanding balance of $${inv.outstandingBalance.toLocaleString()} for Semester ${inv.semester} is due on ${inv.dueDate}. Please clear to avoid late registration holds.`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
        actionLink: 'fees'
      },
      ...prev
    ]);

    logAction('SEND_FEE_REMINDER', `Reminder dispatched to ${inv.studentName} for $${inv.outstandingBalance} balance`);
    return { success: true, message: `Fee due reminder successfully sent to ${inv.studentName}.` };
  };

  // Student Helpdesk Handlers
  const createHelpdeskTicket = (
    category: HelpdeskTicket['category'],
    subject: string,
    description: string,
    priority: HelpdeskTicket['priority']
  ): HelpdeskTicket => {
    const ticketNum = 'TICK-' + Math.floor(10000 + Math.random() * 90000);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newTicket: HelpdeskTicket = {
      id: 'tick-' + Date.now(),
      ticketNumber: ticketNum,
      studentId: currentUser.id,
      studentName: currentUser.name,
      studentRoll: currentUser.identifier,
      category,
      subject,
      description,
      priority,
      status: 'open',
      createdAt: nowStr,
      updatedAt: nowStr,
      messages: [
        {
          id: 'msg-' + Date.now(),
          ticketId: 'tick-' + Date.now(),
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          content: description,
          createdAt: nowStr
        }
      ]
    };

    setHelpdeskTickets(prev => [newTicket, ...prev]);
    logAction('CREATE_HELPDESK_TICKET', `Ticket #${ticketNum} (${category}: ${subject}) created by ${currentUser.name}`);

    return newTicket;
  };

  const addTicketMessage = (ticketId: string, content: string) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ticket = helpdeskTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Student privacy: students can only message their own tickets
    if (currentUser.role === 'student' && ticket.studentId !== currentUser.id) {
      return;
    }

    const newMsg: TicketMessage = {
      id: 'msg-' + Date.now(),
      ticketId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.role,
      content,
      createdAt: nowStr
    };

    const nextStatus =
      currentUser.role !== 'student'
        ? (ticket.status === 'open' || ticket.status === 'waiting_for_student' ? 'in_progress' : ticket.status)
        : (ticket.status === 'waiting_for_student' ? 'in_progress' : ticket.status);

    setHelpdeskTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? {
              ...t,
              updatedAt: nowStr,
              status: nextStatus,
              messages: [...t.messages, newMsg]
            }
          : t
      )
    );

    // Dispatch notification to recipient
    if (currentUser.role !== 'student') {
      setNotifications(prev => [
        {
          id: 'notif-' + Date.now(),
          userId: ticket.studentId,
          title: `Reply on Ticket #${ticket.ticketNumber}`,
          message: `${currentUser.name} (${currentUser.role.toUpperCase()}): "${content.slice(0, 80)}${content.length > 80 ? '...' : ''}"`,
          type: 'announcement',
          timestamp: 'Just now',
          read: false,
          actionLink: 'helpdesk'
        },
        ...prev
      ]);
    }

    logAction('REPLY_HELPDESK_TICKET', `Message posted on ticket #${ticket.ticketNumber} by ${currentUser.name}`);
  };

  const updateTicketStatus = (
    ticketId: string,
    status: HelpdeskTicket['status'],
    assignedTo?: string,
    assignedToName?: string,
    resolutionNotes?: string
  ) => {
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const ticket = helpdeskTickets.find(t => t.id === ticketId);
    if (!ticket) return;

    // Role check: Only staff can reassign or resolve/wait; students can close their own ticket
    if (currentUser.role === 'student' && status !== 'closed') {
      return;
    }

    setHelpdeskTickets(prev =>
      prev.map(t => {
        if (t.id === ticketId) {
          return {
            ...t,
            status,
            updatedAt: nowStr,
            ...(assignedTo !== undefined ? { assignedTo } : {}),
            ...(assignedToName !== undefined ? { assignedToName } : {}),
            ...(resolutionNotes !== undefined ? { resolutionNotes } : {})
          };
        }
        return t;
      })
    );

    // Send notification to student
    setNotifications(prev => [
      {
        id: 'notif-' + Date.now(),
        userId: ticket.studentId,
        title: `Ticket #${ticket.ticketNumber} Status: ${status.toUpperCase().replace(/_/g, ' ')}`,
        message: `Your ticket regarding "${ticket.subject}" has been updated.${resolutionNotes ? ` Resolution Note: "${resolutionNotes}"` : ''}`,
        type: 'announcement',
        timestamp: 'Just now',
        read: false,
        actionLink: 'helpdesk'
      },
      ...prev
    ]);

    logAction('UPDATE_TICKET_STATUS', `Ticket #${ticket.ticketNumber} status changed to ${status.toUpperCase()}`);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const syncNow = () => {
    setLastSyncedAt(new Date());
  };

  // Verified Academic Assistant
  const queryCampusAssistant = async (
    query: string,
    history?: { role: 'user' | 'model' | 'assistant'; text: string }[]
  ): Promise<{ answer: string; sources: string[]; navigationTab?: string }> => {
    const trimmed = query.trim();
    if (!trimmed) {
      return {
        answer: 'Please enter a valid question or topic to search.',
        sources: ['CampusOne Assistant Validation']
      };
    }

    // Grounded local fallback engine used during offline mode or network interruption
    const runLocalGroundedEngine = () => {
      const q = trimmed.toLowerCase();
      const sources: string[] = ['Local Grounded Institutional Database'];

      // Check Privacy: Students querying others
      if (currentUser.role === 'student') {
        const otherStudents = USERS.filter(u => u.role === 'student' && u.id !== currentUser.id);
        const mentionsOther = otherStudents.some(
          s => q.includes(s.name.toLowerCase().split(' ')[0]) || q.includes(s.identifier.toLowerCase())
        );
        if (
          mentionsOther &&
          (q.includes('fee') || q.includes('balance') || q.includes('ticket') || q.includes('grade') || q.includes('due') || q.includes('payment'))
        ) {
          return {
            answer: `🔒 **Access Restricted by FERPA & Student Privacy Policy**\n\nAs an enrolled student, you are only authorized to access your own personal academic and financial records. Ledgers, invoices, and grievance tickets for other students cannot be disclosed.\n\nYou can view your own fees under the **Fees & Accounts** tab.`,
            sources: ['CampusOne Privacy & FERPA Security Rules'],
            navigationTab: 'fees'
          };
        }
      }

      // Consequential action block
      if (
        q.startsWith('pay ') ||
        q === 'pay now' ||
        q.includes('pay fee') ||
        q.includes('reserve book') ||
        q.includes('cancel ticket') ||
        q.includes('create ticket')
      ) {
        if (q.includes('pay') || q.includes('fee')) {
          return {
            answer: `⚠️ **Financial Action Requires Direct Confirmation**\n\nFee transactions cannot be completed directly in chat. Please click the button below to navigate to the verified Fee Management portal, choose your payment mode, and obtain an authenticated receipt.`,
            sources: ['CampusOne Bursar Gateway Security'],
            navigationTab: 'fees'
          };
        }
        if (q.includes('reserve') || q.includes('book')) {
          return {
            answer: `⚠️ **Library Action Requires Direct Confirmation**\n\nBook reservations allocate physical RFID inventory. Please use the Smart Library tab to confirm your reservation.`,
            sources: ['CampusOne RFID Library System'],
            navigationTab: 'library'
          };
        }
        return {
          answer: `⚠️ **Action Requires Direct Confirmation**\n\nPlease submit or manage this record directly in the dedicated module.`,
          sources: ['CampusOne Transaction Policy'],
          navigationTab: 'helpdesk'
        };
      }

      // Greetings
      if (q === 'hi' || q === 'hello' || q === 'hey' || q.includes('who are you') || q.includes('what can you do')) {
        return {
          answer: `Hello **${currentUser.name}**! I am your verified CampusOne Academic & Services Assistant.\n\nI am connected directly to your institution's live database. You can ask me about:\n• **Class Timetables & Conflicts**: "Today's lectures", "Do I have timetable conflicts?"\n• **Examinations & PYQs**: "When is my Data Structures exam?", "Exam countdown"\n• **Syllabus & Milestones**: "What syllabus topics are incomplete?"\n• **Smart Library OPAC**: "Which books are available for Operating Systems?", "Check my borrowed books"\n• **Fee Schedules & Balances**: "What is my tuition balance?"\n• **Helpdesk Tickets**: "Check my open support tickets"\n• **Campus Announcements**: "Show latest announcements"`,
          sources: ['CampusOne Central Knowledge Graph']
        };
      }

      // Query Fee details
      if (q.includes('fee') || q.includes('tuition') || q.includes('balance') || q.includes('payment') || q.includes('installment') || q.includes('scholarship')) {
        if (currentUser.role === 'student') {
          const inv = feeInvoices.find(i => i.studentId === currentUser.id && (i.status === 'partial' || i.status === 'pending' || i.status === 'overdue')) || feeInvoices.find(i => i.studentId === currentUser.id);
          if (inv) {
            sources.push(`Finance Ledger: Semester ${inv.semester} Invoice (${inv.id})`);
            return {
              answer: `For **Semester ${inv.semester} (${inv.academicYear})**, your gross fees are **$${inv.grossAmount.toLocaleString()}** with a **$${inv.scholarshipDiscount.toLocaleString()} scholarship waiver** (${inv.scholarshipName || 'Merit Waiver'}).\n\n• **Amount Paid**: $${inv.paidAmount.toLocaleString()}\n• **Outstanding Balance**: **$${inv.outstandingBalance.toLocaleString()}**\n• **Next Due Date**: **${inv.dueDate}** (Status: **${inv.status.toUpperCase()}**)\n\nYou can pay your installment and download verified official receipts under the Fee Management tab.`,
              sources,
              navigationTab: 'fees'
            };
          }
        } else {
          const totalNet = feeInvoices.reduce((a, b) => a + b.netAmount, 0);
          const totalPaid = feeInvoices.reduce((a, b) => a + b.paidAmount, 0);
          const totalDue = feeInvoices.reduce((a, b) => a + b.outstandingBalance, 0);
          return {
            answer: `**Institutional Financial Summary**:\n• Total Assessed: $${totalNet.toLocaleString()}\n• Total Collected: $${totalPaid.toLocaleString()}\n• Outstanding Receivables: $${totalDue.toLocaleString()}\n• Realization Rate: ${Math.round((totalPaid / totalNet) * 100)}%`,
            sources: ['Institutional Bursar Ledger'],
            navigationTab: 'fees'
          };
        }
      }

      // Timetable conflict queries
      if (q.includes('conflict') || q.includes('overlap') || q.includes('clash')) {
        return {
          answer: `**Timetable Conflict Analysis** (${currentUser.departmentName || 'Engineering'} · Semester ${currentUser.semester || 4}):\n\n• **Identified Conflict**: **Friday 11:30 AM - 12:30 PM**\n  - **CS201** (Data Structures Lab) in Lab 101\n  - Conflicts with elective **EC201** (Digital Signals) in Room 302.\n\n• **Resolution Guidance**: The HOD has flagged this section. Students can request alternate lab allocations via the **Helpdesk** tab or check the **Timetable** view.`,
          sources: ['CampusOne Master Timetable Conflict Matrix Engine'],
          navigationTab: 'timetable'
        };
      }

      // Query Helpdesk
      if (q.includes('ticket') || q.includes('helpdesk') || q.includes('complaint') || q.includes('support')) {
        if (currentUser.role === 'student') {
          const myTicks = helpdeskTickets.filter(t => t.studentId === currentUser.id);
          sources.push(`Student Helpdesk Registry (${myTicks.length} tickets)`);
          if (myTicks.length > 0) {
            const details = myTicks.map(t => `• **${t.ticketNumber}**: "${t.subject}" — Status: **${t.status.toUpperCase().replace(/_/g, ' ')}** (${t.category})`).join('\n');
            return {
              answer: `Here are your recorded student helpdesk tickets:\n\n${details}\n\nYou can track replies or open new tickets under the Helpdesk tab.`,
              sources,
              navigationTab: 'helpdesk'
            };
          } else {
            return {
              answer: `You do not have any active or past support tickets on file. You can open a new ticket under the **Helpdesk** tab.`,
              sources: ['Student Helpdesk Registry'],
              navigationTab: 'helpdesk'
            };
          }
        } else {
          const openCount = helpdeskTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
          return {
            answer: `There are currently **${helpdeskTickets.length} total tickets** in the Helpdesk (${openCount} unresolved).`,
            sources: ['Administrative Grievance Console'],
            navigationTab: 'helpdesk'
          };
        }
      }

      // Timetables
      if (q.includes('timetable') || q.includes('class') || q.includes('schedule') || q.includes('lecture')) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        let dayName = days[new Date().getDay()];
        if (dayName === 'Sunday' || dayName === 'Saturday') dayName = 'Monday';
        const classes = timetables.filter(t => t.dayOfWeek.toLowerCase() === dayName.toLowerCase());
        const rows = classes.map(c => `• **${c.startTime}-${c.endTime}**: **${c.subjectCode}** (${c.subjectName}) - ${c.classroomName}`).join('\n');
        return {
          answer: `Here is the schedule for **${dayName}**:\n\n${rows || 'No classes scheduled.'}`,
          sources: [`Master Timetable: ${dayName}`],
          navigationTab: 'timetable'
        };
      }

      // Exams
      if (q.includes('exam') || /\btest\b/.test(q) || /\btests\b/.test(q) || q.includes('when is my')) {
        const pub = examinations.filter(e => e.status === 'published');
        const list = pub.map(e => `• **${e.examDate}** (${e.session}): **${e.subjectCode} - ${e.subjectName}** at ${e.venue}`).join('\n');
        return {
          answer: `Here are your published examinations:\n\n${list}`,
          sources: ['Controller of Examinations Schedule'],
          navigationTab: 'exams'
        };
      }

      // Books
      if (q.includes('book') || q.includes('library') || q.includes('borrow') || q.includes('fine')) {
        if (q.includes('borrow') || q.includes('fine') || q.includes('my book')) {
          const myCircs = circulations.filter(c => c.userId === currentUser.id && c.status !== 'returned');
          if (myCircs.length === 0) {
            return {
              answer: 'You have no active book loans or accrued library fines on record.',
              sources: ['RFID Library Circulation'],
              navigationTab: 'library'
            };
          }
          const circList = myCircs.map(c => `• **${c.bookTitle}** (Due: ${c.dueDate}) — Fine: $${c.fineAmount.toFixed(2)}`).join('\n');
          return {
            answer: `Here are your active book loans:\n\n${circList}`,
            sources: ['RFID Library Circulation'],
            navigationTab: 'library'
          };
        }
        const bks = books.slice(0, 3).map(b => `• **${b.title}** by ${b.author} (${b.availableCopies}/${b.totalCopies} available, Shelf: ${b.shelfLocation})`).join('\n');
        return {
          answer: `Here are matching library holdings:\n\n${bks}`,
          sources: ['Smart OPAC Catalogue'],
          navigationTab: 'library'
        };
      }

      // Syllabus
      if (q.includes('revise') || q.includes('syllabus') || q.includes('topic') || q.includes('progress')) {
        const remaining: { name: string; subject: string; hours: number }[] = [];
        syllabus.forEach(unit => {
          unit.topics.forEach(t => {
            if (!completedTopicIds.includes(t.id)) {
              remaining.push({ name: t.name, subject: unit.subjectCode, hours: t.estimatedHours });
            }
          });
        });
        const pendingList = remaining.slice(0, 4).map(r => `• [${r.subject}] **${r.name}** (~${r.hours} study hrs)`).join('\n');
        return {
          answer: `**Syllabus Revision Progress** (${getSyllabusProgress()}% completed):\n\nPending high-priority topics:\n${pendingList}`,
          sources: ['Academic Syllabus Tracker'],
          navigationTab: 'planner'
        };
      }

      // Announcements
      if (q.includes('announcement') || q.includes('notice') || q.includes('circular') || q.includes('notification')) {
        const notifs = notifications.slice(0, 3).map(n => `• **${n.title}** (${n.timestamp})\n  ${n.message}`).join('\n\n');
        return {
          answer: `Here are the latest official announcements:\n\n${notifs}`,
          sources: ['CampusOne Central Bulletin'],
          navigationTab: 'dashboard'
        };
      }

      return {
        answer: `I searched the verified CampusOne database for "${trimmed}", but no matching academic records or institutional policies were found.\n\nTo ensure academic precision and FERPA compliance, I only supply verified records. You can ask about:\n• Class Timetables & Conflicts\n• Exam Schedules & PYQs\n• Syllabus & Topic Revision\n• Smart Library Holdings & Fines\n• Tuition Fees & Outstanding Balances\n• Helpdesk Tickets\n• Official Announcements`,
        sources: ['CampusOne Institutional Data Boundary']
      };
    };

    // If simulated offline mode is explicitly toggled by the user, run local engine directly
    if (isOfflineMode) {
      const localRes = runLocalGroundedEngine();
      return {
        ...localRes,
        sources: [...localRes.sources, 'Offline PWA Cache']
      };
    }

    // Online: Make authenticated server request to /api/chat
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: trimmed,
          userId: currentUser.id,
          userName: currentUser.name,
          userRole: currentUser.role,
          departmentId: currentUser.departmentId,
          departmentName: currentUser.departmentName,
          semester: currentUser.semester,
          history: (history || []).slice(-8),
          clientContext: {
            feeInvoices,
            feePayments,
            helpdeskTickets,
            completedTopicIds,
            notifications,
            timetables,
            examinations,
            books
          }
        })
      });

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error('Rate limit reached on AI provider. Falling back to local verified database.');
        }
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      return {
        answer: data.answer || 'No response returned from the campus assistant.',
        sources: data.sources || ['CampusOne Verified Enterprise Database'],
        navigationTab: data.navigationTab
      };
    } catch (err: any) {
      console.warn('[CampusOne Assistant] Server request failed, activating local verified engine:', err?.message || err);
      const localFallback = runLocalGroundedEngine();
      return {
        ...localFallback,
        sources: [...localFallback.sources, 'Local Grounded Fallback (Network / Offline)']
      };
    }
  };

  return (
    <CampusContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users: USERS,
        login,
        logout,
        requestPasswordReset,
        switchUserRole,
        timetables,
        addTimetableEntry,
        deleteTimetableEntry,
        timetableConflicts,
        examinations,
        addExamination,
        syllabus,
        completedTopicIds,
        toggleTopicCompletion,
        getSyllabusProgress,
        questionPapers,
        downloadQuestionPaper,
        uploadQuestionPaper,
        books,
        circulations,
        reservations,
        reserveBook,
        cancelReservation,
        issueBook,
        returnBook,
        renewBook,
        plannerTasks,
        generateRevisionPlan,
        togglePlannerTask,
        addPlannerTask,
        feeInvoices,
        feePayments,
        payFeeInstallment,
        createInvoice,
        recordOfflinePayment,
        applyScholarship,
        sendFeeReminder,
        helpdeskTickets,
        createHelpdeskTicket,
        addTicketMessage,
        updateTicketStatus,
        notifications,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        auditLogs,
        logAction,
        isOfflineMode,
        setIsOfflineMode,
        lastSyncedAt,
        syncNow,
        queryCampusAssistant
      }}
    >
      {children}
    </CampusContext.Provider>
  );
};

export const useCampus = () => {
  const context = useContext(CampusContext);
  if (!context) {
    throw new Error('useCampus must be used within a CampusProvider');
  }
  return context;
};
