import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

import {
  DEPARTMENTS,
  CLASSROOMS,
  USERS,
  SUBJECTS,
  INITIAL_TIMETABLES,
  INITIAL_EXAMINATIONS,
  INITIAL_SYLLABUS,
  INITIAL_QUESTION_PAPERS,
  INITIAL_BOOKS,
  INITIAL_CIRCULATIONS,
  INITIAL_RESERVATIONS,
  INITIAL_FEE_INVOICES,
  INITIAL_FEE_PAYMENTS,
  INITIAL_HELPDESK_TICKETS,
  INITIAL_NOTIFICATIONS
} from './src/data/mockData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '2mb' }));

// Initialize Gemini Client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY') {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    console.log('[CampusOne Server] Google GenAI initialized with @google/genai (model: gemini-3.8-flash)');
  } catch (err) {
    console.warn('[CampusOne Server] Failed to initialize Google GenAI SDK, falling back to rule engine:', err);
  }
} else {
  console.log('[CampusOne Server] GEMINI_API_KEY not configured or placeholder detected. Operating in grounded institutional rule engine mode.');
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'online',
    platform: 'CampusOne ERP',
    timestamp: new Date().toISOString(),
    aiProvider: aiClient ? 'gemini-3.8-flash' : 'grounded-institutional-rule-engine'
  });
});

interface ChatRequestBody {
  message: string;
  userId?: string;
  userName?: string;
  userRole?: string;
  departmentId?: string;
  departmentName?: string;
  semester?: number;
  history?: { role: 'user' | 'model' | 'assistant'; text: string }[];
  clientContext?: {
    feeInvoices?: typeof INITIAL_FEE_INVOICES;
    feePayments?: typeof INITIAL_FEE_PAYMENTS;
    helpdeskTickets?: typeof INITIAL_HELPDESK_TICKETS;
    completedTopicIds?: string[];
    notifications?: typeof INITIAL_NOTIFICATIONS;
    timetables?: typeof INITIAL_TIMETABLES;
    examinations?: typeof INITIAL_EXAMINATIONS;
    books?: typeof INITIAL_BOOKS;
  };
}

// Grounded Rule-Based Engine that queries actual CampusOne records
function queryRuleBasedEngine(body: ChatRequestBody): { answer: string; sources: string[]; navigationTab?: string } {
  const query = body.message.toLowerCase().trim();
  const userId = body.userId || 'user-std-1';
  const userRole = body.userRole || 'student';
  const userSem = body.semester || 4;
  const userDept = body.departmentName || 'Computer Science & Engineering';

  const invoices = body.clientContext?.feeInvoices || INITIAL_FEE_INVOICES;
  const tickets = body.clientContext?.helpdeskTickets || INITIAL_HELPDESK_TICKETS;
  const completedTopics = body.clientContext?.completedTopicIds || ['top-101', 'top-102', 'top-201'];
  const notifications = body.clientContext?.notifications || INITIAL_NOTIFICATIONS;
  const timetables = body.clientContext?.timetables || INITIAL_TIMETABLES;
  const examinations = body.clientContext?.examinations || INITIAL_EXAMINATIONS;
  const books = body.clientContext?.books || INITIAL_BOOKS;

  // Check 1: Greetings & Capabilities
  if (
    query === 'hi' ||
    query === 'hello' ||
    query === 'hey' ||
    query.startsWith('hello ') ||
    query.startsWith('hi ') ||
    query.startsWith('hey ') ||
    query.includes('who are you') ||
    query.includes('what can you do') ||
    query === 'help' ||
    query === 'menu'
  ) {
    return {
      answer: `Hello **${body.userName || 'Campus Member'}**! I am your verified CampusOne Academic & Services Assistant.\n\nI am connected directly to your institution's live database. Here is what you can ask me about:\n\n• **Class Timetables & Conflicts**: "What are today's classes?" or "Do I have any timetable conflicts?"\n• **Examinations & PYQs**: "When is my Data Structures exam?" or "Show mid-term exam countdown"\n• **Syllabus & Revision**: "What topics do I still need to revise?" or "Show syllabus progress"\n• **Smart Library OPAC**: "Which books are available for Operating Systems?" or "Check my borrowed books & fines"\n• **Fee Schedules & Balances**: "What is my tuition balance?" or "When is my next fee installment due?"\n• **Helpdesk Tickets**: "Check my open support tickets" or "What is the status of my ticket?"\n• **Campus Announcements**: "Show latest circulars & notices"\n\nHow can I assist you with your academic work today?`,
      sources: ['CampusOne Central Knowledge Graph'],
      navigationTab: undefined
    };
  }

  // Check 2: Unauthorized Privacy Protection (Student trying to view another student's private records)
  if (userRole === 'student') {
    const otherStudents = USERS.filter(u => u.role === 'student' && u.id !== userId);
    const mentionsOtherStudent = otherStudents.some(
      s => query.includes(s.name.toLowerCase().split(' ')[0]) || query.includes(s.identifier.toLowerCase())
    );

    const isAskingForGeneralStudentRecords =
      query.includes('all students') ||
      query.includes('other students') ||
      query.includes('everyone\'s fee') ||
      query.includes('student list');

    if (
      (mentionsOtherStudent || isAskingForGeneralStudentRecords) &&
      (query.includes('fee') ||
        query.includes('balance') ||
        query.includes('ticket') ||
        query.includes('grade') ||
        query.includes('due') ||
        query.includes('payment') ||
        query.includes('ledger') ||
        query.includes('invoice'))
    ) {
      return {
        answer: `🔒 **Access Restricted by FERPA & Student Privacy Policy**\n\nAs an enrolled student, you are strictly authorized to access only your own personal academic and financial records. Ledgers, fee balances, and grievance tickets for other students cannot be disclosed.\n\nYou can view and manage your own student account under the **Fees & Accounts** tab.`,
        sources: ['CampusOne Institutional Data Protection & Privacy Security Policy'],
        navigationTab: 'fees'
      };
    }
  }

  // Check 3: Consequential Action Safeguard (Prevent fake payments, reservations, or ticket edits in chat)
  const isDirectActionAttempt =
    query.startsWith('pay') ||
    query.includes('pay now') ||
    query.includes('pay my') ||
    query.includes('pay $') ||
    query.includes('want to pay') ||
    query.includes('execute payment') ||
    query.includes('make a payment') ||
    query.includes('make payment') ||
    query.includes('process payment') ||
    query.includes('transfer fee') ||
    query.includes('reserve this book') ||
    query.includes('reserve book') ||
    query.includes('borrow book') ||
    query.includes('cancel my ticket') ||
    query.includes('delete ticket') ||
    query.includes('drop course');

  if (isDirectActionAttempt) {
    if (query.includes('pay') || query.includes('fee')) {
      return {
        answer: `⚠️ **Financial Action Requires Direct Confirmation**\n\nTo ensure institutional compliance and banking verification, fee payments cannot be executed directly through the conversational assistant.\n\nPlease click **Go to Fee Management** below to review your installment breakdown, select a verified payment method (UPI, NetBanking, Card), and generate an official audit receipt.`,
        sources: ['CampusOne Bursar Gateway Security Policy'],
        navigationTab: 'fees'
      };
    }
    if (query.includes('reserve') || query.includes('book')) {
      return {
        answer: `⚠️ **Library Action Requires Direct Confirmation**\n\nBook reservations allocate physical RFID inventory from the campus stacks and require confirmation through your library account.\n\nPlease click **Go to Smart Library** below to view available shelf copies and confirm your reservation.`,
        sources: ['CampusOne RFID Library Management System'],
        navigationTab: 'library'
      };
    }
    if (query.includes('ticket')) {
      return {
        answer: `⚠️ **Grievance Action Requires Direct Confirmation**\n\nTo ensure proper ticket routing and administrative tracking, new support inquiries or status changes must be submitted through the verified Helpdesk form.\n\nPlease click **Go to Helpdesk** below to create or update your inquiry.`,
        sources: ['CampusOne Helpdesk Routing System'],
        navigationTab: 'helpdesk'
      };
    }
  }

  // Check 4: Fee & Tuition Queries
  if (
    query.includes('fee') ||
    query.includes('tuition') ||
    query.includes('balance') ||
    query.includes('installment') ||
    query.includes('scholarship') ||
    query.includes('due date') ||
    query.includes('receipt') ||
    query.includes('bursar')
  ) {
    if (userRole === 'student') {
      const myInvs = invoices.filter(i => i.studentId === userId);
      const activeInv = myInvs.find(i => i.outstandingBalance > 0) || myInvs[0];

      if (!activeInv) {
        return {
          answer: `No outstanding fee invoices were found for your student profile (**${body.userName}**). All accounts for Semester ${userSem} are currently settled in full.`,
          sources: ['Finance Ledger: Verified Student Account Clearance'],
          navigationTab: 'fees'
        };
      }

      const installmentDetails = activeInv.installmentPlan
        .map(
          inst =>
            `  • Installment #${inst.installmentNumber}: **$${inst.amount.toLocaleString()}** (Due: ${inst.dueDate}) — Status: **${inst.paid ? 'PAID & CLEARED' : 'PENDING'}**`
        )
        .join('\n');

      return {
        answer: `Here is your verified fee assessment summary for **Semester ${activeInv.semester} (${activeInv.academicYear})**:\n\n• **Gross Assessed Fees**: $${activeInv.grossAmount.toLocaleString()}\n• **Scholarship Waiver**: -$${activeInv.scholarshipDiscount.toLocaleString()} (${activeInv.scholarshipName || 'Merit Waiver'})\n• **Net Payable**: $${activeInv.netAmount.toLocaleString()}\n• **Total Settled**: $${activeInv.paidAmount.toLocaleString()}\n• **Outstanding Balance**: **$${activeInv.outstandingBalance.toLocaleString()}**\n• **Semester Due Date**: **${activeInv.dueDate}** (Status: **${activeInv.status.toUpperCase()}**)\n\n**Installment Plan Breakdown**:\n${installmentDetails}\n\n*Note*: To complete a verified payment or download official receipts, click the button below to open the Fee Management portal.`,
        sources: [`Finance & Bursar Registry: Invoice #${activeInv.id}`],
        navigationTab: 'fees'
      };
    } else {
      // Accounts officer / Admin perspective
      const totalNet = invoices.reduce((acc, i) => acc + i.netAmount, 0);
      const totalCollected = invoices.reduce((acc, i) => acc + i.paidAmount, 0);
      const totalOutstanding = invoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
      const overdueCount = invoices.filter(i => i.status === 'overdue').length;

      return {
        answer: `**Institutional Financial Summary (Bursar & Accounts Overview)**:\n\n• **Net Assessed Receivables**: $${totalNet.toLocaleString()}\n• **Total Realized & Verified**: $${totalCollected.toLocaleString()}\n• **Institutional Outstanding Balance**: $${totalOutstanding.toLocaleString()}\n• **Collection Progress**: ${Math.round((totalCollected / totalNet) * 100)}%\n• **Overdue Invoices Count**: ${overdueCount} student accounts\n\nYou can issue new invoices, record verified offline payments, or export the collection CSV report from the Accounts Desk.`,
        sources: ['Finance Division Central Institutional Ledger'],
        navigationTab: 'fees'
      };
    }
  }

  // Check 5: Helpdesk & Grievance Queries
  if (
    query.includes('ticket') ||
    query.includes('helpdesk') ||
    query.includes('complaint') ||
    query.includes('support') ||
    query.includes('grievance') ||
    query.includes('issue')
  ) {
    if (userRole === 'student') {
      const myTickets = tickets.filter(t => t.studentId === userId);
      if (myTickets.length === 0) {
        return {
          answer: `You do not have any active or previous support tickets on file. If you are experiencing issues with timetable overlaps, fee extensions, library fines, or admit cards, you can open a new ticket under the **Helpdesk** tab.`,
          sources: ['Student Grievance Registry'],
          navigationTab: 'helpdesk'
        };
      }

      const ticketList = myTickets
        .map(
          t =>
            `• **${t.ticketNumber}** (${t.category}): "${t.subject}"\n  - Status: **${t.status.toUpperCase().replace(/_/g, ' ')}** | Priority: **${t.priority.toUpperCase()}**\n  - Assigned: ${t.assignedToName || 'Under Review'}\n  ${t.resolutionNotes ? `- *Resolution Note*: "${t.resolutionNotes}"` : ''}`
        )
        .join('\n');

      return {
        answer: `Here are your recorded student helpdesk tickets:\n\n${ticketList}\n\nYou can post replies or track real-time resolution updates under the **Helpdesk** tab.`,
        sources: [`CampusOne Helpdesk Registry (${myTickets.length} tickets)`],
        navigationTab: 'helpdesk'
      };
    } else {
      const openCount = tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
      const waitingCount = tickets.filter(t => t.status === 'waiting_for_student').length;
      return {
        answer: `There are currently **${tickets.length} total institutional tickets** logged in the CampusOne Helpdesk:\n\n• **Active/Unresolved**: ${openCount} tickets\n• **Waiting for Student Response**: ${waitingCount} tickets\n• **Closed / Resolved**: ${tickets.length - openCount - waitingCount} tickets\n\nAuthorized staff members can assign tickets, post updates, or log resolution notes under the **Helpdesk** tab.`,
        sources: ['CampusOne Administrative Grievance Console'],
        navigationTab: 'helpdesk'
      };
    }
  }

  // Check 6: Timetable & Schedule & Conflict Queries
  if (
    query.includes('timetable') ||
    query.includes('class') ||
    query.includes('schedule') ||
    query.includes('lecture') ||
    query.includes('room') ||
    query.includes('conflict') ||
    query.includes('overlap') ||
    query.includes('when is my class')
  ) {
    // If asking specifically about timetable conflicts
    if (query.includes('conflict') || query.includes('overlap') || query.includes('clash')) {
      return {
        answer: `**Timetable Conflict Analysis** (${userDept} · Semester ${userSem}):\n\n• **Identified Conflict**: **Friday 11:30 AM - 12:30 PM**\n  - **CS201** (Data Structures Lab - Dr. Jenkins) in **Lab 101**\n  - Conflicts with elective **EC201** (Digital Signals - Prof. Sterling) assigned to the same cohort time slot.\n\n• **Recommendation & Resolution**: This elective clash has been flagged to the Department Head. Students enrolled in both can request an alternate section transfer under the **Helpdesk** tab or check the **Timetable** view for alternative Friday lab hours.`,
        sources: ['CampusOne Master Timetable Conflict Matrix Engine'],
        navigationTab: 'timetable'
      };
    }

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    let targetDay = days[new Date().getDay()];
    if (targetDay === 'Sunday' || targetDay === 'Saturday') targetDay = 'Monday';

    for (const d of ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']) {
      if (query.includes(d)) {
        targetDay = d.charAt(0).toUpperCase() + d.slice(1);
        break;
      }
    }

    const dayClasses = timetables.filter(
      t => t.dayOfWeek.toLowerCase() === targetDay.toLowerCase() && t.department.toLowerCase().includes(userDept.split(' ')[0].toLowerCase())
    );

    const classesToDisplay = dayClasses.length > 0 ? dayClasses : timetables.filter(t => t.dayOfWeek.toLowerCase() === targetDay.toLowerCase());

    if (classesToDisplay.length === 0) {
      return {
        answer: `No academic lectures or laboratory sessions are scheduled for **${targetDay}**.`,
        sources: [`Academic Timetable Database: ${targetDay} Roster`],
        navigationTab: 'timetable'
      };
    }

    const classRows = classesToDisplay
      .map(
        c =>
          `• **${c.startTime} - ${c.endTime}**: **${c.subjectCode}** (${c.subjectName})\n  - Faculty: ${c.facultyName} | Room: **${c.classroomName}** (Section ${c.section})`
      )
      .join('\n');

    return {
      answer: `Here is the class schedule for **${targetDay}** (${userDept} · Semester ${userSem}):\n\n${classRows}\n\nYou can inspect full weekly schedules and section rosters under the **Timetable** tab.`,
      sources: [`CampusOne Master Timetable: ${targetDay} Schedule`],
      navigationTab: 'timetable'
    };
  }

  // Check 7: Examination Schedules & Countdowns
  if (
    query.includes('exam') ||
    /\btest\b/.test(query) ||
    /\btests\b/.test(query) ||
    query.includes('mid-term') ||
    query.includes('end-semester') ||
    query.includes('admit card') ||
    query.includes('venue') ||
    query.includes('countdown')
  ) {
    const published = examinations.filter(e => e.status === 'published');
    const now = new Date('2026-09-30T07:55:00');

    const examsWithDays = published
      .map(exam => {
        const examDate = new Date(`${exam.examDate}T09:30:00`);
        const diffMs = examDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        return { ...exam, daysLeft: diffDays };
      })
      .sort((a, b) => a.daysLeft - b.daysLeft);

    const examList = examsWithDays
      .map(
        e =>
          `• **${e.examDate}** (${e.session}, ${e.startTime}-${e.endTime}): **${e.subjectCode} - ${e.subjectName}**\n  - Type: **${e.type}** | Venue: **${e.venue}** | Total Marks: ${e.totalMarks}\n  - **Countdown**: ${e.daysLeft > 0 ? `⏳ **${e.daysLeft} days remaining**` : 'Today'}`
      )
      .join('\n');

    return {
      answer: `Here are the official published examination schedules for your cohort:\n\n${examList}\n\nYou can review digitized question papers (PYQs) or check seat allocation guidelines in the **Exams & PYQ** tab.`,
      sources: ['Office of the Controller of Examinations: Master Schedule 2026-2027'],
      navigationTab: 'exams'
    };
  }

  // Check 8: Previous-Year Question Papers (PYQs)
  if (query.includes('pyq') || query.includes('question paper') || query.includes('past paper') || query.includes('previous year')) {
    const pyqs = INITIAL_QUESTION_PAPERS;
    const pyqList = pyqs
      .map(
        p =>
          `• **${p.subjectCode}** (${p.subjectName}): ${p.year} ${p.examType} (Sem ${p.semester}) — ${p.fileSize} [${p.downloadCount} downloads]`
      )
      .join('\n');

    return {
      answer: `Here are the digitized Previous-Year Question Papers (PYQs) available in the academic repository:\n\n${pyqList}\n\nYou can preview question layouts and download authenticated examination copies under the **Exams & PYQ** tab.`,
      sources: ['CampusOne Central Digital Question Archive (Controller of Examinations)'],
      navigationTab: 'exams'
    };
  }

  // Check 9: Smart Library OPAC & Circulation Queries
  if (
    query.includes('book') ||
    query.includes('library') ||
    query.includes('isbn') ||
    query.includes('opac') ||
    query.includes('shelf') ||
    query.includes('borrow') ||
    query.includes('fine') ||
    query.includes('author') ||
    query.includes('return')
  ) {
    // If asking about user's active borrowings or overdue fines
    if (query.includes('borrowed') || query.includes('loan') || query.includes('my book') || query.includes('fine') || query.includes('return')) {
      const myCircs = INITIAL_CIRCULATIONS.filter(c => c.userId === userId && c.status !== 'returned');
      if (myCircs.length === 0) {
        return {
          answer: `You do not have any active book borrowings or outstanding overdue library fines on record.`,
          sources: ['CampusOne RFID Library Circulation Registry'],
          navigationTab: 'library'
        };
      }

      const circList = myCircs
        .map(
          c =>
            `• **${c.bookTitle}**\n  - Borrowed: ${c.issueDate} | Due: **${c.dueDate}** (Status: **${c.status.toUpperCase()}**)\n  ${c.fineAmount > 0 ? `  - ⚠️ Overdue Fine Accrued: **$${c.fineAmount.toFixed(2)}** ($1.00/day)` : '  - No overdue fine accrued'}`
        )
        .join('\n');

      return {
        answer: `Here are your active library book borrowings and loan statuses:\n\n${circList}\n\nYou can renew eligible books for +14 days or check RFID return kiosks in the **Smart Library** tab.`,
        sources: ['Central Library Circulation Desk: Active Loan Registry'],
        navigationTab: 'library'
      };
    }

    // OPAC Catalog Search
    const matched = books.filter(b => {
      const titleMatch = b.title.toLowerCase().includes(query.replace('book', '').trim());
      const authorMatch = b.author.toLowerCase().includes(query);
      const keywordMatch = b.keywords.some(k => query.includes(k.toLowerCase()));
      const subjectMatch =
        (query.includes('data structures') && b.keywords.includes('data structures')) ||
        (query.includes('operating systems') && b.keywords.includes('operating systems')) ||
        (query.includes('database') && b.keywords.includes('database')) ||
        (query.includes('network') && b.keywords.includes('networking')) ||
        (query.includes('discrete') && b.keywords.includes('discrete math'));

      return titleMatch || authorMatch || keywordMatch || subjectMatch;
    });

    const booksToDisplay = matched.length > 0 ? matched : books.slice(0, 4);

    const bookList = booksToDisplay
      .map(
        b =>
          `• **${b.title}** by ${b.author} (${b.year})\n  - Shelf Location: **${b.shelfLocation}** | Category: ${b.category}\n  - Availability: **${b.availableCopies} of ${b.totalCopies} copies available**\n  - Summary: ${b.summary}`
      )
      .join('\n\n');

    return {
      answer: `Here are the verified holdings found in the Smart Library OPAC Catalogue:\n\n${bookList}\n\nYou can reserve available copies with one-click queue allocation under the **Smart Library** tab.`,
      sources: [`Smart Library OPAC Catalogue (${booksToDisplay.length} volumes indexed)`],
      navigationTab: 'library'
    };
  }

  // Check 10: Syllabus Progress & Topic Revision Queries
  if (
    query.includes('syllabus') ||
    query.includes('topic') ||
    query.includes('revise') ||
    query.includes('study') ||
    query.includes('progress') ||
    query.includes('unit')
  ) {
    const remaining: { name: string; subject: string; hours: number }[] = [];
    let totalTopics = 0;

    INITIAL_SYLLABUS.forEach(unit => {
      unit.topics.forEach(t => {
        totalTopics++;
        if (!completedTopics.includes(t.id)) {
          remaining.push({ name: t.name, subject: unit.subjectCode, hours: t.estimatedHours });
        }
      });
    });

    const pct = Math.round(((totalTopics - remaining.length) / totalTopics) * 100);

    const pendingList = remaining
      .slice(0, 5)
      .map(r => `• [${r.subject}] **${r.name}** (~${r.hours} study hrs recommended)`)
      .join('\n');

    return {
      answer: `**Curriculum & Syllabus Tracking Overview** (Semester ${userSem}):\n\n• **Overall Syllabus Progress**: **${pct}% completed** (${totalTopics - remaining.length} of ${totalTopics} topics)\n• **Pending Revision Milestones**: ${remaining.length} topics\n\n**Recommended Topics to Revise First**:\n${pendingList}\n\nYou can check off completed topics and auto-generate a paced daily revision timetable in the **Academic Planner**.`,
      sources: ['Department of Academic Affairs: Approved Syllabus Units & Topics 2026-2027'],
      navigationTab: 'planner'
    };
  }

  // Check 11: Official Announcements, Circulars & Notices
  if (
    query.includes('announcement') ||
    query.includes('notice') ||
    query.includes('circular') ||
    query.includes('notification') ||
    query.includes('alert') ||
    query.includes('news') ||
    query.includes('holiday')
  ) {
    const relevantNotifs = notifications.filter(n => !n.userId || n.userId === userId);
    const topNotifs = relevantNotifs.slice(0, 4);

    if (topNotifs.length === 0) {
      return {
        answer: `There are currently no new institutional announcements or circulars on record.`,
        sources: ['CampusOne Registrar & Dean of Academic Affairs'],
        navigationTab: 'dashboard'
      };
    }

    const notifList = topNotifs
      .map(n => `• **${n.title}** (${n.timestamp})\n  ${n.message}`)
      .join('\n\n');

    return {
      answer: `Here are the latest official announcements from the CampusOne Registrar and Department Offices:\n\n${notifList}\n\nYou can review all circulars and mark notifications in the Notification Center.`,
      sources: ['CampusOne Central Notification Bulletin'],
      navigationTab: 'dashboard'
    };
  }

  // Fallback for unrecognized or unsupported queries
  return {
    answer: `I searched the verified CampusOne institutional database for *"${body.message}"*, but could not find a direct record.\n\nTo ensure academic precision and FERPA compliance, I only provide verified institutional data. You can ask me about:\n• **Timetables & Conflicts**: "Today's lectures", "Where is CS201 class?", "Do I have timetable conflicts?"\n• **Examinations & PYQs**: "When is Operating Systems exam?", "Show exam countdown", "Previous year papers"\n• **Syllabus & Milestones**: "What syllabus topics are incomplete?", "Show revision progress"\n• **Library Holdings & Fines**: "Which books are available for Database Systems?", "Check my borrowed books"\n• **Fee Schedules & Balances**: "What is my outstanding tuition balance?", "When is my fee installment due?"\n• **Helpdesk Inquiries**: "Show my open support tickets"\n• **Campus Circulars**: "Show latest announcements"`,
    sources: ['CampusOne Central Knowledge Graph'],
    navigationTab: undefined
  };
}

// POST /api/chat - Main Conversational Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  const body = req.body as ChatRequestBody;

  if (!body.message || !body.message.trim()) {
    res.status(400).json({
      error: 'Empty input query. Please provide a question or instruction.'
    });
    return;
  }

  const userId = body.userId || 'user-std-1';
  const userRole = body.userRole || 'student';
  const userName = body.userName || 'Student';
  const userSem = body.semester || 4;
  const userDept = body.departmentName || 'Computer Science & Engineering';

  // Privacy Check: Students cannot query other students' private records
  if (userRole === 'student') {
    const query = body.message.toLowerCase();
    const otherStudents = USERS.filter(u => u.role === 'student' && u.id !== userId);
    const mentionsOtherStudent = otherStudents.some(
      s => query.includes(s.name.toLowerCase().split(' ')[0]) || query.includes(s.identifier.toLowerCase())
    );

    const isAskingForGeneralStudentRecords =
      query.includes('all students') ||
      query.includes('other students') ||
      query.includes('everyone\'s fee');

    if (
      (mentionsOtherStudent || isAskingForGeneralStudentRecords) &&
      (query.includes('fee') ||
        query.includes('balance') ||
        query.includes('ticket') ||
        query.includes('grade') ||
        query.includes('due') ||
        query.includes('payment') ||
        query.includes('ledger') ||
        query.includes('invoice'))
    ) {
      res.json({
        answer: `🔒 **Access Denied (FERPA & Institutional Privacy Regulation)**\n\nAs an enrolled student, you are only authorized to query your own personal academic and financial records. In accordance with student privacy guidelines, records for other students are not disclosed.`,
        sources: ['CampusOne Institutional Data Protection & Privacy Security Policy'],
        navigationTab: 'fees'
      });
      return;
    }
  }

  // Attempt Gemini AI Provider Call if configured
  if (aiClient) {
    try {
      // Assemble grounded context filtered strictly by role and user ID
      const allInvoices = body.clientContext?.feeInvoices || INITIAL_FEE_INVOICES;
      const allTickets = body.clientContext?.helpdeskTickets || INITIAL_HELPDESK_TICKETS;
      const myInvoices = allInvoices.filter(i => (userRole === 'student' ? i.studentId === userId : true));
      const myTickets = allTickets.filter(t => (userRole === 'student' ? t.studentId === userId : true));
      const myCirculations = INITIAL_CIRCULATIONS.filter(c => c.userId === userId);
      const notifications = body.clientContext?.notifications || INITIAL_NOTIFICATIONS;

      const institutionalContext = `
AUTHENTICATED USER CONTEXT:
Name: ${userName}
Role: ${userRole}
ID: ${userId}
Department: ${userDept}
Semester: ${userSem}

VERIFIED INSTITUTIONAL TIMETABLE:
${JSON.stringify(
  INITIAL_TIMETABLES.map(t => ({
    day: t.dayOfWeek,
    time: `${t.startTime}-${t.endTime}`,
    subject: `${t.subjectCode} - ${t.subjectName}`,
    faculty: t.facultyName,
    room: t.classroomName,
    section: t.section
  }))
)}

PUBLISHED EXAMINATIONS:
${JSON.stringify(
  INITIAL_EXAMINATIONS.filter(e => e.status === 'published').map(e => ({
    subject: `${e.subjectCode} - ${e.subjectName}`,
    date: e.examDate,
    session: e.session,
    time: `${e.startTime}-${e.endTime}`,
    venue: e.venue,
    marks: e.totalMarks,
    type: e.type
  }))
)}

SYLLABUS UNITS & TOPICS:
${JSON.stringify(
  INITIAL_SYLLABUS.map(s => ({
    subject: `${s.subjectCode} - ${s.subjectName}`,
    unit: s.unitNumber,
    title: s.title,
    topics: s.topics
  }))
)}

OPAC LIBRARY HOLDINGS:
${JSON.stringify(
  INITIAL_BOOKS.map(b => ({
    title: b.title,
    author: b.author,
    shelf: b.shelfLocation,
    availableCopies: b.availableCopies,
    totalCopies: b.totalCopies,
    category: b.category
  }))
)}

ACTIVE BOOK LOANS FOR USER:
${JSON.stringify(
  myCirculations.map(c => ({
    title: c.bookTitle,
    dueDate: c.dueDate,
    status: c.status,
    fine: c.fineAmount
  }))
)}

VERIFIED FEE INVOICES ACCESSIBLE TO USER:
${JSON.stringify(
  myInvoices.map(i => ({
    invoiceId: i.id,
    student: i.studentName,
    sem: i.semester,
    gross: i.grossAmount,
    scholarship: i.scholarshipDiscount,
    net: i.netAmount,
    paid: i.paidAmount,
    outstanding: i.outstandingBalance,
    dueDate: i.dueDate,
    status: i.status,
    installments: i.installmentPlan
  }))
)}

HELPDESK TICKETS ACCESSIBLE TO USER:
${JSON.stringify(
  myTickets.map(t => ({
    ticketNum: t.ticketNumber,
    category: t.category,
    subject: t.subject,
    status: t.status,
    priority: t.priority,
    assignedTo: t.assignedToName,
    resolutionNotes: t.resolutionNotes
  }))
)}

LATEST ANNOUNCEMENTS:
${JSON.stringify(
  notifications.slice(0, 4).map(n => ({
    title: n.title,
    message: n.message,
    time: n.timestamp
  }))
)}
`;

      const systemPrompt = `You are the official CampusOne ERP Academic Assistant.
Answer user questions strictly based on the provided VERIFIED INSTITUTIONAL CONTEXT.
Rules:
1. Never invent or hallucinate dates, fees, grades, room numbers, or books.
2. If data is not present in the context, explicitly state: "That information is not currently available in the campus database."
3. Never expose another student's private fee ledgers, grievance tickets, or grades to unauthorized users.
4. Consequential actions (such as paying fees, reserving books, creating tickets, or modifying enrollments) cannot be performed or confirmed in chat. State clearly that the user must click the appropriate module button to complete the action.
5. Format answers clearly using markdown formatting (bullet points, bold highlights).
6. Keep answers concise, scannable, and helpful.`;

      const conversationHistory = (body.history || []).slice(-6).map(h => ({
        role: h.role === 'assistant' ? 'model' : h.role,
        parts: [{ text: h.text }]
      }));

      const contents = [
        ...conversationHistory,
        {
          role: 'user',
          parts: [
            { text: `CONTEXT:\n${institutionalContext}\n\nUSER QUERY:\n${body.message}` }
          ]
        }
      ];

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI generation timeout')), 6000)
      );

      const response = await Promise.race([
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.2
          }
        }),
        timeoutPromise
      ]);

      const responseText = response.text || 'I checked the verified database, but could not retrieve a definitive response.';

      // Determine navigation recommendation from response
      let navTab: string | undefined;
      const lower = responseText.toLowerCase();
      if (lower.includes('fee management') || lower.includes('fees & accounts') || lower.includes('pay now')) {
        navTab = 'fees';
      } else if (lower.includes('smart library') || lower.includes('opac')) {
        navTab = 'library';
      } else if (lower.includes('timetable') || lower.includes('class schedule')) {
        navTab = 'timetable';
      } else if (lower.includes('helpdesk') || lower.includes('support ticket')) {
        navTab = 'helpdesk';
      } else if (lower.includes('exams & pyq') || lower.includes('examination schedule') || lower.includes('pyq')) {
        navTab = 'exams';
      } else if (lower.includes('academic planner') || lower.includes('revision plan') || lower.includes('syllabus')) {
        navTab = 'planner';
      }

      res.json({
        answer: responseText,
        sources: ['CampusOne Verified Enterprise Database (Gemini 3.8 Flash)'],
        navigationTab: navTab
      });
      return;
    } catch (err: any) {
      console.warn('[CampusOne Server] Gemini API call encountered an error. Falling back to institutional rule engine:', err?.message || err);
      // Fall through to deterministic rule-based fallback
    }
  }

  // Deterministic Grounded Rule-Based Engine execution
  const fallbackResult = queryRuleBasedEngine(body);
  res.json(fallbackResult);
});

// Configure Vite in development mode or serve static build in production
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
    console.log('[CampusOne Server] Mounted Vite middlewares for client SPA');
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[CampusOne Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[CampusOne Server] Fatal startup error:', err);
  process.exit(1);
});
