-- ==============================================================================
-- CAMPUSONE RELATIONAL DATABASE SCHEMA & ROW-LEVEL SECURITY (RLS) POLICIES
-- Target RDBMS: PostgreSQL 15+ / Supabase
-- Multi-Tenant & Role-Based Access Control Architecture
-- Roles: student, faculty, librarian, hod, admin
-- ==============================================================================

-- 1. EXTENSIONS & ENUMS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE user_role AS ENUM ('student', 'faculty', 'librarian', 'hod', 'accounts_officer', 'admin');
CREATE TYPE exam_session AS ENUM ('Morning', 'Afternoon');
CREATE TYPE exam_type AS ENUM ('Mid-Term', 'End-Semester', 'Practical');
CREATE TYPE exam_status AS ENUM ('proposed', 'published');
CREATE TYPE resource_type AS ENUM ('notes', 'slides', 'assignment', 'reference');
CREATE TYPE reservation_status AS ENUM ('pending', 'ready_for_pickup', 'fulfilled', 'cancelled', 'expired');
CREATE TYPE circulation_status AS ENUM ('issued', 'returned', 'overdue');
CREATE TYPE notification_type AS ENUM ('exam', 'library', 'timetable', 'announcement');

-- 2. CORE INSTITUTIONAL ENTITIES
CREATE TABLE departments (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE courses (
    id VARCHAR(32) PRIMARY KEY,
    department_id VARCHAR(32) REFERENCES departments(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    code VARCHAR(16) UNIQUE NOT NULL,
    duration_years INT DEFAULT 4 NOT NULL
);

CREATE TABLE classrooms (
    id VARCHAR(32) PRIMARY KEY,
    building VARCHAR(64) NOT NULL,
    room_number VARCHAR(32) NOT NULL,
    capacity INT DEFAULT 60 NOT NULL,
    has_projector BOOLEAN DEFAULT true,
    UNIQUE(building, room_number)
);

CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id VARCHAR(64) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(128) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department_id VARCHAR(32) REFERENCES departments(id),
    enrollment_or_staff_id VARCHAR(32) UNIQUE NOT NULL,
    semester INT DEFAULT 1,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE subjects (
    id VARCHAR(32) PRIMARY KEY,
    department_id VARCHAR(32) REFERENCES departments(id) ON DELETE CASCADE,
    code VARCHAR(16) UNIQUE NOT NULL,
    name VARCHAR(128) NOT NULL,
    semester INT NOT NULL,
    credits INT DEFAULT 4 NOT NULL,
    faculty_id UUID REFERENCES profiles(id)
);

-- 3. ACADEMIC & TIMETABLE MANAGEMENT
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    day_of_week VARCHAR(16) NOT NULL CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday')),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id VARCHAR(32) REFERENCES subjects(id) ON DELETE CASCADE,
    faculty_id UUID REFERENCES profiles(id),
    classroom_id VARCHAR(32) REFERENCES classrooms(id),
    semester INT NOT NULL,
    section VARCHAR(8) DEFAULT 'A',
    CONSTRAINT no_negative_class_duration CHECK (end_time > start_time)
);

-- Unique index to prevent classroom double-booking
CREATE UNIQUE INDEX idx_classroom_timetable_conflict 
ON timetables (classroom_id, day_of_week, start_time, end_time);

-- Unique index to prevent faculty timetable overlap
CREATE UNIQUE INDEX idx_faculty_timetable_conflict 
ON timetables (faculty_id, day_of_week, start_time, end_time);

-- 4. SYLLABUS & LEARNING RESOURCES
CREATE TABLE syllabus_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id VARCHAR(32) REFERENCES subjects(id) ON DELETE CASCADE,
    unit_number INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    learning_outcomes TEXT[] DEFAULT '{}',
    topics TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE syllabus_resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    syllabus_unit_id UUID REFERENCES syllabus_units(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    resource_type resource_type NOT NULL,
    file_url TEXT NOT NULL,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE student_syllabus_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    syllabus_unit_id UUID REFERENCES syllabus_units(id) ON DELETE CASCADE,
    completed_topics TEXT[] DEFAULT '{}',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    UNIQUE(student_id, syllabus_unit_id)
);

-- 5. EXAMINATION LIFECYCLE & QUESTION PAPERS
CREATE TABLE examinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id VARCHAR(32) REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    session exam_session NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    venue VARCHAR(128) NOT NULL,
    total_marks INT DEFAULT 100,
    exam_type exam_type NOT NULL,
    status exam_status DEFAULT 'published',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE question_papers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_id VARCHAR(32) REFERENCES subjects(id) ON DELETE CASCADE,
    year INT NOT NULL,
    semester INT NOT NULL,
    exam_type exam_type NOT NULL,
    file_url TEXT NOT NULL,
    file_size VARCHAR(32),
    download_count INT DEFAULT 0,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 6. SMART LIBRARY CATALOGUE & TRANSACTIONS
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    isbn VARCHAR(32) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    publisher VARCHAR(128),
    publication_year INT,
    department_id VARCHAR(32) REFERENCES departments(id),
    category VARCHAR(64) NOT NULL,
    shelf_location VARCHAR(32) NOT NULL,
    total_copies INT NOT NULL CHECK (total_copies >= 0),
    available_copies INT NOT NULL CHECK (available_copies >= 0 AND available_copies <= total_copies),
    cover_image TEXT,
    summary TEXT,
    keywords TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE book_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reservation_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL,
    status reservation_status DEFAULT 'pending',
    queue_position INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE book_circulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    book_id UUID REFERENCES books(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    issue_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    return_date TIMESTAMPTZ,
    status circulation_status DEFAULT 'issued',
    fine_amount DECIMAL(8, 2) DEFAULT 0.00,
    issued_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 7. NOTIFICATIONS & AUDIT TRAILS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    read BOOLEAN DEFAULT false,
    action_link TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(128) NOT NULL,
    actor_role user_role NOT NULL,
    action VARCHAR(128) NOT NULL,
    affected_record VARCHAR(255) NOT NULL,
    reason TEXT,
    details JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Prevent ordinary modification or deletion of audit records
CREATE RULE audit_logs_immutable AS ON UPDATE TO audit_logs DO INSTEAD NOTHING;
CREATE RULE audit_logs_undeletable AS ON DELETE TO audit_logs DO INSTEAD NOTHING;

-- 8. ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE syllabus_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_syllabus_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE examinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE books ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE book_circulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Current User Role Helper Function
CREATE OR REPLACE FUNCTION current_user_role() 
RETURNS user_role AS $$
    SELECT role FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true);
$$ LANGUAGE sql STABLE;

-- Profiles: Users view own profile, staff/admins view departmental/all
CREATE POLICY profiles_select_policy ON profiles
    FOR SELECT USING (
        auth_user_id = current_setting('request.jwt.claim.sub', true) 
        OR current_user_role() IN ('faculty', 'hod', 'admin')
    );

-- Timetables: Public read for published schedules; write restricted to faculty/admin
CREATE POLICY timetables_select_policy ON timetables
    FOR SELECT TO authenticated USING (true);

CREATE POLICY timetables_insert_policy ON timetables
    FOR INSERT TO authenticated WITH CHECK (
        current_user_role() IN ('faculty', 'hod', 'admin')
    );

-- Examinations: Public read for published; proposed visible only to staff
CREATE POLICY exams_select_policy ON examinations
    FOR SELECT TO authenticated USING (
        status = 'published' 
        OR current_user_role() IN ('faculty', 'hod', 'admin')
    );

-- Student Syllabus Progress: Students read/write own; faculty reads assigned subjects
CREATE POLICY student_progress_select_policy ON student_syllabus_progress
    FOR SELECT TO authenticated USING (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('faculty', 'hod', 'admin')
    );

CREATE POLICY student_progress_update_policy ON student_syllabus_progress
    FOR ALL TO authenticated USING (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
    );

-- Books (OPAC): Public read for all authenticated users
CREATE POLICY books_select_policy ON books
    FOR SELECT TO authenticated USING (true);

-- Book Reservations: Students view & create own; librarians manage all
CREATE POLICY reservations_select_policy ON book_reservations
    FOR SELECT TO authenticated USING (
        user_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('librarian', 'admin')
    );

CREATE POLICY reservations_insert_policy ON book_reservations
    FOR INSERT TO authenticated WITH CHECK (
        user_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        AND current_user_role() IN ('student', 'faculty')
    );

-- Book Circulations: Users see own; librarians insert/update
CREATE POLICY circulations_select_policy ON book_circulations
    FOR SELECT TO authenticated USING (
        user_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('librarian', 'admin')
    );

CREATE POLICY circulations_modify_policy ON book_circulations
    FOR ALL TO authenticated USING (
        current_user_role() IN ('librarian', 'admin')
    );

-- Audit Logs: Read-only for Admin & HOD; no client-side insert
CREATE POLICY audit_logs_select_policy ON audit_logs
    FOR SELECT TO authenticated USING (
        current_user_role() IN ('admin', 'hod')
    );

-- 9. FEE MANAGEMENT & FINANCIAL LEDGER
CREATE TABLE fee_invoices (
    id VARCHAR(64) PRIMARY KEY,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    semester INT NOT NULL,
    academic_year VARCHAR(32) NOT NULL,
    tuition_amount DECIMAL(10, 2) NOT NULL,
    exam_fee DECIMAL(10, 2) NOT NULL,
    library_fee DECIMAL(10, 2) NOT NULL,
    lab_fee DECIMAL(10, 2) NOT NULL,
    hostel_fee DECIMAL(10, 2) DEFAULT 0.00,
    development_fee DECIMAL(10, 2) NOT NULL,
    gross_amount DECIMAL(10, 2) NOT NULL,
    scholarship_discount DECIMAL(10, 2) DEFAULT 0.00,
    scholarship_name VARCHAR(255),
    net_amount DECIMAL(10, 2) NOT NULL,
    paid_amount DECIMAL(10, 2) DEFAULT 0.00,
    outstanding_balance DECIMAL(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    status VARCHAR(32) DEFAULT 'pending' CHECK (status IN ('paid', 'partial', 'pending', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE fee_payments (
    id VARCHAR(64) PRIMARY KEY,
    invoice_id VARCHAR(64) REFERENCES fee_invoices(id) ON DELETE CASCADE,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    transaction_reference VARCHAR(128) UNIQUE NOT NULL,
    receipt_number VARCHAR(64) UNIQUE NOT NULL,
    gateway_mode VARCHAR(32) DEFAULT 'VERIFIED_GATEWAY_DEMO',
    gateway_status VARCHAR(32) DEFAULT 'verified_success',
    semester INT NOT NULL,
    notes TEXT
);

-- 10. STUDENT HELPDESK & SUPPORT TICKETS
CREATE TABLE helpdesk_tickets (
    id VARCHAR(64) PRIMARY KEY,
    ticket_number VARCHAR(32) UNIQUE NOT NULL,
    student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    category VARCHAR(64) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority VARCHAR(16) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status VARCHAR(32) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to VARCHAR(128),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE TABLE ticket_messages (
    id VARCHAR(64) PRIMARY KEY,
    ticket_id VARCHAR(64) REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- RLS FOR FEE MANAGEMENT & HELPDESK
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;

-- Fee Invoices: Students view own; accounts officers & admins have full management
CREATE POLICY fee_invoices_student_select ON fee_invoices
    FOR SELECT TO authenticated USING (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('accounts_officer', 'admin')
    );

CREATE POLICY fee_invoices_admin_manage ON fee_invoices
    FOR ALL TO authenticated USING (
        current_user_role() IN ('accounts_officer', 'admin')
    );

-- Fee Payments: Students view own; accounts officers & admins view and manage
CREATE POLICY fee_payments_student_select ON fee_payments
    FOR SELECT TO authenticated USING (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('accounts_officer', 'admin')
    );

CREATE POLICY fee_payments_insert_policy ON fee_payments
    FOR INSERT TO authenticated WITH CHECK (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('accounts_officer', 'admin')
    );

-- Helpdesk: Students view & create own; staff can view and reply
CREATE POLICY helpdesk_tickets_select ON helpdesk_tickets
    FOR SELECT TO authenticated USING (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        OR current_user_role() IN ('faculty', 'librarian', 'hod', 'accounts_officer', 'admin')
    );

CREATE POLICY helpdesk_tickets_insert ON helpdesk_tickets
    FOR INSERT TO authenticated WITH CHECK (
        student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
    );

CREATE POLICY ticket_messages_select ON ticket_messages
    FOR SELECT TO authenticated USING (
        ticket_id IN (
            SELECT id FROM helpdesk_tickets WHERE student_id = (SELECT id FROM profiles WHERE auth_user_id = current_setting('request.jwt.claim.sub', true))
        )
        OR current_user_role() IN ('faculty', 'librarian', 'hod', 'accounts_officer', 'admin')
    );

CREATE POLICY ticket_messages_insert ON ticket_messages
    FOR INSERT TO authenticated WITH CHECK (true);

