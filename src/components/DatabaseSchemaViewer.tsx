import React, { useState } from 'react';
import {
  Database,
  Shield,
  Key,
  Lock,
  Copy,
  Check,
  Table,
  FileCode,
  CheckCircle2
} from 'lucide-react';

export const DatabaseSchemaViewer: React.FC = () => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'entities' | 'rls' | 'sql'>('entities');

  const entities = [
    {
      name: 'profiles',
      description: 'Unified user accounts with role-based access control (student, faculty, librarian, hod, admin)',
      keys: ['id (PK, UUID)', 'auth_user_id (UQ)', 'email (UQ)', 'department_id (FK)', 'enrollment_or_staff_id (UQ)']
    },
    {
      name: 'departments & courses',
      description: 'Academic organizational units, degree programs, and curriculum metadata',
      keys: ['departments.id (PK)', 'courses.id (PK)', 'courses.department_id (FK)']
    },
    {
      name: 'classrooms & subjects',
      description: 'Physical lecture halls, computer laboratories, course credits, and assigned faculty',
      keys: ['classrooms.id (PK)', 'subjects.id (PK)', 'subjects.faculty_id (FK)']
    },
    {
      name: 'timetables',
      description: 'Weekly schedule slots with multi-column UNIQUE constraints preventing room/faculty collision',
      keys: ['id (PK)', 'subject_id (FK)', 'faculty_id (FK)', 'classroom_id (FK)', 'UNIQUE(classroom_id, day, times)', 'UNIQUE(faculty_id, day, times)']
    },
    {
      name: 'examinations',
      description: 'Proposed and published examination schedules, sessions, venues, and marks',
      keys: ['id (PK)', 'subject_id (FK)', 'status (proposed | published)', 'CHECK(end_time > start_time)']
    },
    {
      name: 'syllabus_units & progress',
      description: 'Curriculum unit breakdowns, learning outcomes, attached notes, and per-student topic tracking',
      keys: ['syllabus_units.id (PK)', 'syllabus_resources.id (PK)', 'student_syllabus_progress.id (PK, UNIQUE(student_id, unit_id))']
    },
    {
      name: 'question_papers (PYQs)',
      description: 'Protected past-year question paper metadata, download count counters, and verified solutions',
      keys: ['id (PK)', 'subject_id (FK)', 'year (INT)', 'exam_type (Mid-Term | End-Semester)']
    },
    {
      name: 'books & copies (OPAC)',
      description: 'Library monograph holdings, shelf locations, total copies, and live available copies count',
      keys: ['id (PK)', 'isbn (UQ)', 'CHECK(available_copies <= total_copies AND available_copies >= 0)']
    },
    {
      name: 'book_reservations & circulations',
      description: 'Hold reservation queues, counter issue/return transactions, due dates, and overdue fine ledger',
      keys: ['reservations.id (PK)', 'circulations.id (PK)', 'book_id (FK)', 'user_id (FK)', 'issued_by (FK)']
    },
    {
      name: 'audit_logs',
      description: 'Immutable security log of all sensitive operations with PostgreSQL RULE preventing updates/deletes',
      keys: ['id (PK)', 'actor_id (FK)', 'action (VARCHAR)', 'RULE audit_logs_immutable DO INSTEAD NOTHING']
    },
    {
      name: 'fee_invoices & fee_payments',
      description: 'Semester-wise tuition, hostel, exam fees, scholarship waivers, installments, and payment receipts',
      keys: ['invoices.id (PK)', 'student_id (FK)', 'payments.id (PK)', 'transaction_reference (UQ)', 'receipt_number (UQ)']
    },
    {
      name: 'helpdesk_tickets & messages',
      description: 'Student support tickets for fee disputes, timetable overlaps, library fines, and staff replies',
      keys: ['tickets.id (PK)', 'ticket_number (UQ)', 'student_id (FK)', 'ticket_messages.id (PK)', 'ticket_id (FK)']
    }
  ];

  const rlsPolicies = [
    {
      table: 'profiles',
      role: 'Student / Faculty / Staff',
      command: 'SELECT',
      policy: "auth_user_id = current_setting('request.jwt.claim.sub') OR role IN ('faculty', 'hod', 'admin')",
      description: 'Users read own profile; faculty & admins view departmental roster'
    },
    {
      table: 'timetables',
      role: 'Student',
      command: 'SELECT',
      policy: 'true (Public Read)',
      description: 'All authenticated students view official academic schedules'
    },
    {
      table: 'timetables',
      role: 'Faculty / Admin',
      command: 'INSERT / UPDATE / DELETE',
      policy: "current_user_role() IN ('faculty', 'hod', 'admin')",
      description: 'Only authorized faculty and administrative staff may edit timetables'
    },
    {
      table: 'examinations',
      role: 'Student',
      command: 'SELECT',
      policy: "status = 'published'",
      description: 'Students view published exams only; proposed exams remain confidential to Senate'
    },
    {
      table: 'student_syllabus_progress',
      role: 'Student',
      command: 'ALL',
      policy: "student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub'))",
      description: 'Strict isolation: students can only read and mutate their own progress state'
    },
    {
      table: 'books (OPAC)',
      role: 'All Authenticated',
      command: 'SELECT',
      policy: 'true (Public Read)',
      description: 'Online Public Access Catalogue visible to all institutional members'
    },
    {
      table: 'book_reservations',
      role: 'Student',
      command: 'INSERT',
      policy: "user_id = auth.uid() AND current_user_role() IN ('student', 'faculty')",
      description: 'Members place reservations for themselves only (max quota enforced)'
    },
    {
      table: 'book_circulations',
      role: 'Librarian / Admin',
      command: 'INSERT / UPDATE',
      policy: "current_user_role() IN ('librarian', 'admin')",
      description: 'Only library staff can execute checkouts, checkins, and fine waivers'
    },
    {
      table: 'audit_logs',
      role: 'All Roles',
      command: 'UPDATE / DELETE',
      policy: 'BLOCKED (DO INSTEAD NOTHING)',
      description: 'PostgreSQL rules prohibit any modification or deletion of audit records'
    },
    {
      table: 'fee_invoices',
      role: 'Student',
      command: 'SELECT',
      policy: "student_id = auth.uid()",
      description: 'Students view only their own fee assessments; accounts officer manages all'
    },
    {
      table: 'fee_invoices',
      role: 'Accounts Officer / Admin',
      command: 'ALL',
      policy: "current_user_role() IN ('accounts_officer', 'admin')",
      description: 'Full institutional ledger access for tuition billing and scholarship grants'
    },
    {
      table: 'helpdesk_tickets',
      role: 'Student / Staff',
      command: 'SELECT / INSERT / UPDATE',
      policy: "student_id = auth.uid() OR current_user_role() IN ('faculty', 'librarian', 'hod', 'accounts_officer', 'admin')",
      description: 'Students access own tickets; staff can read and post replies across institutional categories'
    }
  ];

  const rawSql = `-- CAMPUSONE RELATIONAL SCHEMA & RLS RULES
-- Target: PostgreSQL 15+ / Supabase
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE user_role AS ENUM ('student', 'faculty', 'librarian', 'hod', 'admin');
CREATE TYPE exam_session AS ENUM ('Morning', 'Afternoon');
CREATE TYPE exam_type AS ENUM ('Mid-Term', 'End-Semester', 'Practical');

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department_id VARCHAR(32) REFERENCES departments(id),
    enrollment_or_staff_id VARCHAR(32) UNIQUE NOT NULL
);

CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week VARCHAR(16) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id VARCHAR(32) REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES profiles(id),
    classroom_id VARCHAR(32) REFERENCES classrooms(id),
    CONSTRAINT no_neg_duration CHECK (end_time > start_time)
);

CREATE UNIQUE INDEX idx_room_conflict ON timetables (classroom_id, day_of_week, start_time, end_time);
CREATE UNIQUE INDEX idx_fac_conflict ON timetables (faculty_id, day_of_week, start_time, end_time);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_circulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY timetables_select ON timetables FOR SELECT USING (true);
CREATE POLICY timetables_manage ON timetables FOR ALL USING (
    (SELECT role FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub')) IN ('faculty', 'hod', 'admin')
);`;

  const handleCopy = () => {
    navigator.clipboard.writeText(rawSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header and Sub Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Data Architecture & Governance
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Relational Schema & Row-Level Security (RLS)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            PostgreSQL DDL schema, multi-role authorization matrices, and database-enforced integrity invariants.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setActiveTab('entities')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'entities' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Entity Models</span>
            </button>
            <button
              onClick={() => setActiveTab('rls')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'rls' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Security (RLS) Policies</span>
            </button>
            <button
              onClick={() => setActiveTab('sql')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'sql' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw SQL Migration</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: Relational Entities */}
      {activeTab === 'entities' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {entities.map(e => (
              <div key={e.name} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold font-mono text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded">
                    {e.name}
                  </h3>
                  <Key className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {e.description}
                </p>
                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Constraints & Foreign Keys:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {e.keys.map((k, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                      >
                        {k}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Row-Level Security Policies Matrix */}
      {activeTab === 'rls' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                PostgreSQL Row-Level Security (RLS) Authorization Policies
              </h2>
              <p className="text-xs text-slate-500">
                Enforced directly inside the database engine. Never relies solely on hiding UI buttons.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Table Name</th>
                  <th className="py-2.5 px-3">Target Role</th>
                  <th className="py-2.5 px-3">Command</th>
                  <th className="py-2.5 px-3">RLS USING / CHECK Expression</th>
                  <th className="py-2.5 px-3">Security Principle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {rlsPolicies.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-mono font-semibold text-indigo-700">
                      {p.table}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-900">{p.role}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                        {p.command}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-600 max-w-[280px] truncate">
                      {p.policy}
                    </td>
                    <td className="py-3 px-3 text-slate-500 text-[11px]">
                      {p.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Raw SQL Migration Code */}
      {activeTab === 'sql' && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                PostgreSQL Schema DDL File (/database/schema.sql)
              </h2>
            </div>
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied SQL' : 'Copy Full SQL'}</span>
            </button>
          </div>

          <div className="p-4 bg-slate-950 overflow-x-auto text-emerald-400 font-mono text-xs leading-relaxed max-h-[500px]">
            <pre>{rawSql}</pre>
          </div>
        </div>
      )}

    </div>
  );
};
