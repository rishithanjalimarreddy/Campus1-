# CampusOne: Integrated Academic, Examination & Smart Library Management Platform

CampusOne is a responsive, mobile-first college management web application that unifies academic schedules, examination lifecycles, curriculum syllabus tracking, previous-year question papers (PYQs), student academic revision planning, and smart library services into one consolidated platform.

---

## 1. Core Modules & Tested Features

### A. Unified Student Dashboard
- **Daily Lecture Overview**: Real-time display of today's classes with room numbers (e.g. Turing Block LH-101), start/end timings, and assigned faculty.
- **Examination Countdowns**: Live days-remaining calculation to upcoming Mid-Term and End-Semester exams.
- **Syllabus Progress Tracker**: Live percentage calculation based on completed self-study topics across registered courses.
- **Smart Library Circulation Status**: Active loan tracking with due dates, overdue fine alerts ($1.00/day fine calculation), and reservation queue positions.
- **Course Recommendations**: Algorithmic textbook and reading recommendations linked to current semester courses.

### B. Dynamic Timetable & Conflict Engine
- **Daily & Weekly Views**: View schedules by day or in a full-week grid.
- **Automated Conflict Detection Engine**: Real-time algorithm detects room double-bookings and faculty overlapping time slots.
- **Authorized Management**: Faculty and administrators can schedule new lecture and lab slots with immediate conflict validation.

### C. Examination Lifecycle & Question Archive (PYQ)
- **Examination Schedules**: Full calendar with dates, sessions (Morning 09:30-12:30 / Afternoon 14:00-17:00), exam types (Mid-Term, End-Semester, Practical), and hall venues.
- **Digitized Question Paper Archive**: Searchable by subject code, title, exam year (2024, 2023, 2022), and semester.
- **Document Preview & Download Counter**: Authentic university examination paper layout with Section A & Section B questions, plus download tracking.

### D. Syllabus & Learning Resources
- **Curriculum Tree**: Organized by Department, Course, Semester, Subject, and Unit.
- **Learning Outcomes**: Explicitly specified competency goals for each unit.
- **Interactive Checkpoints**: Students mark completed topics with real-time recalculation of course completion percentages.
- **Faculty Material Attachments**: Direct access to lecture slides, code templates, and reference handouts.

### E. Smart Library (OPAC & Circulation Desk)
- **Online Public Access Catalogue (OPAC)**: Instant search by title, author, ISBN, department, or keywords.
- **Real-Time Shelf Tracking**: Display of shelf locations (Stack / Rack) and live available copies vs. total holdings.
- **Student Book Reservations**: One-click hold requests with duplicate prevention and queue position numbering.
- **Librarian Desk**: Restricted circulation counter to check out books, process returns (restoring shelf inventory), and renew loans for +14 days.

### F. Academic Revision Planner & Grounded AI Assistant
- **Paced Revision Timetable Generator**: Takes daily available study hours (e.g., 2h, 3h, 4h, 5h) and spaces out incomplete syllabus topics before upcoming exam dates, with library book due checkpoints.
- **Verified Campus Assistant**: Answers student queries (*"When is my Data Structures exam?"*, *"Which books are available for Operating Systems?"*, *"What syllabus topics do I still need to revise?"*) grounded exclusively in verified database state.

### G. Persistent Fee Management & Verified Checkout
- **Itemized Semester Invoices**: Detailed fee schedules (Tuition, Examination, Library, Laboratory, Hostel, Campus Development).
- **Scholarships & Waivers**: Merit grants, fellowships, and bursaries with automatic invoice balance deductions.
- **Installment Payment Schedule**: Paced installment plans with due dates, overdue badges, duplicate payment prevention, and status tracking (`paid`, `partial`, `pending`, `overdue`).
- **Pay Now Checkout Flow**: 5-step interactive checkout:
  1. Detailed invoice fee itemization review.
  2. Payment method selection (UPI with VPA, NetBanking with bank selector, Debit/Credit Card).
  3. Pre-authorization confirmation with simulated success or simulated failure toggle.
  4. Animated interbank gateway processing state.
  5. Verified success screen with transaction reference or failure alert with retry option.
- **Downloadable & Printable Receipts**: One-click text download (`.txt`) and official printable layout (`window.print()`) with university header, receipt number, transaction reference, semester itemization, and authorized digital stamp.
- **Accounts Officer Desk**: 
  - Institutional collection analytics with department-wise performance tables and progress meters.
  - Export collection report to standard CSV (`CampusOne_Fee_Collection_Report.csv`).
  - Create and issue new semester fee invoices for any student across CSE, ECE, EEE, IT, or Mechanical.
  - Record verified physical offline payments (Demand Draft, Cheque, Bank Challan) with instrument number and drawee bank.
  - Apply scholarship concessions and dispatch fee-due notifications.

### H. Student Helpdesk & Issue Resolution Center
- **Categories**: Fee & Billing, Examination & Admit Card, Library & Fines, Timetable & Course Conflict, Technical Support, and General Inquiry.
- **5-Stage Ticket Lifecycle**: `open`, `in_progress`, `waiting_for_student`, `resolved`, and `closed`.
- **Chronological Ticket Timeline**: Visual step progression: 1. Opened → 2. Assigned → 3. Under Review → 4. Resolution.
- **Staff Assignment & Resolution Notes**: Staff members can assign tickets to relevant faculty or accounts officers and attach formal resolution notes on resolution or closure.
- **Student Privacy & Role Restrictions**: Students can only view and message their own support tickets; staff can manage all institutional tickets.
- **Real-Time Notification Dispatch**: Automatic alerts sent upon staff replies or status changes.

### I. Seeded Fictional Demo Cohorts & Test Credentials
- **12 Fictional Students across 5 Departments**:
  - **CSE**: Alex Chen (`alex.chen@campus.edu`), Priya Sharma (`priya.sharma@campus.edu`), Chloe Dubois (`chloe.dubois@campus.edu`)
  - **ECE**: Marcus Wright (`marcus.wright@campus.edu`), Ananya Iyer (`ananya.iyer@campus.edu`), Tariq Hassan (`tariq.hassan@campus.edu`)
  - **EEE**: Rohan Verma (`rohan.verma@campus.edu`), Sneha Patel (`sneha.patel@campus.edu`)
  - **IT**: Liam Davies (`liam.davies@campus.edu`), Fatima Al-Mansoor (`fatima.mansoor@campus.edu`)
  - **Mechanical**: Jin Woo Park (`jinwoo.park@campus.edu`), Vikram Malhotra (`vikram.malhotra@campus.edu`)
- **Staff & Admin Accounts**:
  - **Accounts Officer**: Mr. David Sterling (`david.sterling@campus.edu`, password `Accounts123!`)
  - **Administrator / Dean**: Dean Eleanor Vance (`dean.academics@campus.edu`, password `Admin123!`)
  - **Faculty**: Dr. Sarah Jenkins (`sarah.jenkins@campus.edu`, password `Faculty123!`)
  - **Head Librarian**: Mr. Robert Vance (`robert.vance@campus.edu`, password `Library123!`)
  - **Head of Department (CSE)**: Prof. Michael Rao (`michael.rao@campus.edu`, password `Hod123!`)
- All seeded data is visibly tagged with `[DEMO]` identifiers. Password for all student accounts is `Student123!`.

### I. Faculty & Administration Portal
- **Bulk CSV Importer**: Pre-commit validation and violation reporting before writing records to database.
- **Real Analytics Dashboard**: Stored metrics for book circulation rates, overdue ratios, syllabus completion per subject, and timetable conflict invariants.
- **Immutable Audit Trail**: Append-only log recording actor, role, action, affected record, and context.

### J. Relational Architecture & Security
- **PostgreSQL 15+ Schema**: Defined in `/database/schema.sql` with primary keys, foreign keys, and multi-column unique constraints.
- **Row-Level Security (RLS)**: Enforced policies distinguishing Student, Faculty, Librarian, HOD, Accounts Officer, and Administrator permissions.

---

## 2. Quickstart & Deployment Instructions

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Local Development
```bash
# 1. Install dependencies
npm install

# 2. Copy environment configuration
cp .env.example .env

# 3. Start development server on port 3000
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 3. Role-Based Access Control (RBAC) Test Profiles

Use the role switcher in the top navigation bar or quick-fill buttons on the Login page to test role-based permissions:

| Persona | Role | Default Password | Capabilities |
| :--- | :--- | :--- | :--- |
| **Alex Chen** | `student` | `Student123!` | View schedules/OPAC, reserve books, pay fees, open support tickets, track syllabus. |
| **Mr. David Sterling** | `accounts_officer` | `Accounts123!` | Master fee ledger, apply scholarships, issue fee-due reminders, monitor institutional collections. |
| **Dr. Sarah Jenkins** | `faculty` | `Faculty123!` | Manage timetables, upload lecture notes, schedule course sessions, upload PYQs, reply to course tickets. |
| **Mr. Robert Vance** | `librarian` | `Library123!` | Circulation desk operations (issue, return, renew), manage book inventory, resolve hold queues. |
| **Prof. Michael Rao** | `hod` | `Hod123!` | Departmental timetable approvals, syllabus management, departmental analytics. |
| **Dean Eleanor Vance** | `admin` | `Admin123!` | Full system governance, bulk CSV imports, audit log reviews, Senate exam publishing. |

---

## 4. Known Limitations & Future Enhancements

1. **Institutional Single Sign-On (SSO)**:
   - *Current MVP*: Fast in-app role switching and Supabase/JWT profile authentication architecture.
   - *Future*: SAML 2.0 / Shibboleth / OpenID Connect institutional identity integration.

2. **Automated Attendance Biometrics**:
   - *Current MVP*: Dynamic class scheduling and room capacity allocation.
   - *Future*: RFID/BLE beacon student attendance check-in.

3. **External Payment Gateway**:
   - *Current MVP*: Overdue library fines calculated and tracked in circulation records.
   - *Future*: Razorpay/Stripe institutional fee payment integration.
