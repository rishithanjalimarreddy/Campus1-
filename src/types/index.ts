/**
 * CampusOne - Type Definitions & Domain Models
 */

export type UserRole = 'student' | 'faculty' | 'librarian' | 'hod' | 'accounts_officer' | 'admin';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  departmentId: string;
  departmentName: string;
  identifier: string; // Roll number or Staff ID
  semester?: number;
  avatarUrl?: string;
  password?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Classroom {
  id: string;
  building: string;
  roomNumber: string;
  capacity: number;
  hasProjector: boolean;
}

export interface Subject {
  id: string;
  departmentId: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  facultyName: string;
  facultyId: string;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string; // e.g. "09:00"
  endTime: string;   // e.g. "10:00"
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  classroomId: string;
  classroomName: string;
  department: string;
  semester: number;
  section: string;
}

export interface Examination {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  examDate: string; // ISO date "YYYY-MM-DD"
  session: 'Morning' | 'Afternoon';
  startTime: string;
  endTime: string;
  venue: string;
  totalMarks: number;
  type: 'Mid-Term' | 'End-Semester' | 'Practical';
  status: 'published' | 'proposed';
}

export interface SyllabusResource {
  id: string;
  title: string;
  type: 'notes' | 'slides' | 'assignment' | 'reference';
  fileUrl: string;
  fileSize: string;
}

export interface SyllabusUnit {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  unitNumber: number;
  title: string;
  learningOutcomes: string[];
  topics: { id: string; name: string; estimatedHours: number }[];
  resources: SyllabusResource[];
}

export interface StudentSyllabusProgress {
  subjectId: string;
  completedTopicIds: string[];
}

export interface QuestionPaper {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  year: number;
  semester: number;
  examType: 'Mid-Term' | 'End-Semester';
  fileUrl: string;
  fileSize: string;
  downloadCount: number;
  uploadedDate: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  year: number;
  departmentId: string;
  category: string;
  shelfLocation: string;
  totalCopies: number;
  availableCopies: number;
  coverImage?: string;
  summary: string;
  keywords: string[];
}

export interface BookReservation {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  reservationDate: string;
  expiryDate: string;
  status: 'pending' | 'ready_for_pickup' | 'fulfilled' | 'cancelled' | 'expired';
  queuePosition: number;
}

export interface BookCirculation {
  id: string;
  bookId: string;
  bookTitle: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'issued' | 'returned' | 'overdue';
  fineAmount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'exam' | 'library' | 'timetable' | 'announcement';
  timestamp: string;
  read: boolean;
  actionLink?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  affectedRecord: string;
  reason?: string;
  details?: string;
}

export interface AcademicPlannerTask {
  id: string;
  studentId: string;
  subjectCode: string;
  subjectName: string;
  title: string;
  dueDate: string;
  estimatedHours: number;
  completed: boolean;
  generatedFrom: 'syllabus' | 'exam' | 'manual' | 'library_due';
}

export interface TimetableConflict {
  type: 'room_overlap' | 'faculty_overlap';
  description: string;
  entries: TimetableEntry[];
}

export interface FeeBreakdown {
  tuition: number;
  examination: number;
  library: number;
  hostel: number;
  laboratory: number;
  development: number;
}

export interface FeeInvoice {
  id: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  departmentName: string;
  semester: number;
  academicYear: string;
  breakdown: FeeBreakdown;
  grossAmount: number;
  scholarshipDiscount: number;
  scholarshipName?: string;
  netAmount: number;
  paidAmount: number;
  outstandingBalance: number;
  dueDate: string;
  status: 'paid' | 'partial' | 'pending' | 'overdue';
  installmentPlan: {
    installmentNumber: number;
    amount: number;
    dueDate: string;
    paid: boolean;
    paidAt?: string;
  }[];
}

export interface FeePayment {
  id: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  amount: number;
  paymentDate: string;
  paymentMethod: 'UPI' | 'NetBanking' | 'DebitCard' | 'CreditCard' | 'DemandDraft';
  transactionReference: string;
  gatewayMode: 'VERIFIED_GATEWAY_DEMO' | 'PRODUCTION_GATEWAY';
  gatewayStatus: 'verified_success' | 'demo_mode_success' | 'failed';
  receiptNumber: string;
  semester: number;
  notes?: string;
}

export interface TicketMessage {
  id: string;
  ticketId: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  content: string;
  createdAt: string;
}

export interface HelpdeskTicket {
  id: string;
  ticketNumber: string;
  studentId: string;
  studentName: string;
  studentRoll: string;
  category: 'Fee & Billing' | 'Examination & Admit Card' | 'Library & Fines' | 'Timetable & Course Conflict' | 'Technical Support' | 'General Inquiry';
  subject: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'waiting_for_student' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  assignedToName?: string;
  assignedToRole?: UserRole;
  resolutionNotes?: string;
  messages: TicketMessage[];
}

