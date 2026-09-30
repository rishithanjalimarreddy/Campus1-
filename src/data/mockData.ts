import {
  UserProfile,
  Department,
  Classroom,
  Subject,
  TimetableEntry,
  Examination,
  SyllabusUnit,
  QuestionPaper,
  Book,
  BookReservation,
  BookCirculation,
  NotificationItem,
  AuditLog,
  FeeInvoice,
  FeePayment,
  HelpdeskTicket
} from '../types';

export const DEPARTMENTS: Department[] = [
  { id: 'dept-cse', name: 'Computer Science & Engineering', code: 'CSE' },
  { id: 'dept-ece', name: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 'dept-eee', name: 'Electrical & Electronics Engineering', code: 'EEE' },
  { id: 'dept-it', name: 'Information Technology', code: 'IT' },
  { id: 'dept-me', name: 'Mechanical Engineering', code: 'ME' }
];

export const CLASSROOMS: Classroom[] = [
  { id: 'cr-lh101', building: 'Turing Block', roomNumber: 'LH-101', capacity: 70, hasProjector: true },
  { id: 'cr-lh102', building: 'Turing Block', roomNumber: 'LH-102', capacity: 70, hasProjector: true },
  { id: 'cr-cs-lab1', building: 'Ada Lovelace Wing', roomNumber: 'CS-Lab-01', capacity: 45, hasProjector: true },
  { id: 'cr-lh204', building: 'Shannon Block', roomNumber: 'LH-204', capacity: 60, hasProjector: true },
  { id: 'cr-audi-b', building: 'Central Academic Complex', roomNumber: 'Hall-B', capacity: 150, hasProjector: true }
];

// Seeded Institutional Users - Clearly marked as DEMO ACCOUNTS
export const USERS: UserProfile[] = [
  // 12 Fictional Students across CSE, ECE, EEE, IT, and Mechanical Engineering
  {
    id: 'user-std-1',
    name: 'Alex Chen [DEMO]',
    email: 'alex.chen@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    identifier: 'CSE-2024-042',
    semester: 4,
    avatarUrl: '/src/assets/images/avatar_student_1790780195997.jpg'
  },
  {
    id: 'user-std-2',
    name: 'Priya Sharma [DEMO]',
    email: 'priya.sharma@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    identifier: 'CSE-2023-019',
    semester: 6
  },
  {
    id: 'user-std-3',
    name: 'Chloe Dubois [DEMO]',
    email: 'chloe.dubois@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    identifier: 'CSE-2025-007',
    semester: 2
  },
  {
    id: 'user-std-4',
    name: 'Marcus Wright [DEMO]',
    email: 'marcus.wright@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-ece',
    departmentName: 'Electronics & Communication Engineering',
    identifier: 'ECE-2024-055',
    semester: 4
  },
  {
    id: 'user-std-5',
    name: 'Ananya Iyer [DEMO]',
    email: 'ananya.iyer@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-ece',
    departmentName: 'Electronics & Communication Engineering',
    identifier: 'ECE-2023-012',
    semester: 6
  },
  {
    id: 'user-std-6',
    name: 'Tariq Hassan [DEMO]',
    email: 'tariq.hassan@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-ece',
    departmentName: 'Electronics & Communication Engineering',
    identifier: 'ECE-2025-044',
    semester: 2
  },
  {
    id: 'user-std-7',
    name: 'Rohan Verma [DEMO]',
    email: 'rohan.verma@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-eee',
    departmentName: 'Electrical & Electronics Engineering',
    identifier: 'EEE-2024-033',
    semester: 4
  },
  {
    id: 'user-std-8',
    name: 'Sneha Patel [DEMO]',
    email: 'sneha.patel@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-eee',
    departmentName: 'Electrical & Electronics Engineering',
    identifier: 'EEE-2023-078',
    semester: 6
  },
  {
    id: 'user-std-9',
    name: 'Liam Davies [DEMO]',
    email: 'liam.davies@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    identifier: 'IT-2024-021',
    semester: 4
  },
  {
    id: 'user-std-10',
    name: 'Fatima Al-Mansoor [DEMO]',
    email: 'fatima.mansoor@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    identifier: 'IT-2023-064',
    semester: 6
  },
  {
    id: 'user-std-11',
    name: 'Jin Woo Park [DEMO]',
    email: 'jinwoo.park@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-me',
    departmentName: 'Mechanical Engineering',
    identifier: 'ME-2024-015',
    semester: 4
  },
  {
    id: 'user-std-12',
    name: 'Vikram Malhotra [DEMO]',
    email: 'vikram.malhotra@campus.edu',
    password: 'Student123!',
    role: 'student',
    departmentId: 'dept-me',
    departmentName: 'Mechanical Engineering',
    identifier: 'ME-2023-088',
    semester: 6
  },
  // Staff & Faculty demo accounts
  {
    id: 'user-fac-1',
    name: 'Dr. Sarah Jenkins [DEMO]',
    email: 'sarah.jenkins@campus.edu',
    password: 'Faculty123!',
    role: 'faculty',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    identifier: 'FAC-CSE-108'
  },
  {
    id: 'user-lib-1',
    name: 'Mr. Robert Vance [DEMO]',
    email: 'robert.vance@campus.edu',
    password: 'Library123!',
    role: 'librarian',
    departmentId: 'dept-cse',
    departmentName: 'Central Library Operations',
    identifier: 'LIB-OFF-019'
  },
  {
    id: 'user-hod-1',
    name: 'Prof. Michael Rao [DEMO]',
    email: 'michael.rao@campus.edu',
    password: 'Hod123!',
    role: 'hod',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    identifier: 'HOD-CSE-003'
  },
  {
    id: 'user-acc-1',
    name: 'Mr. David Sterling [DEMO]',
    email: 'david.sterling@campus.edu',
    password: 'Accounts123!',
    role: 'accounts_officer',
    departmentId: 'dept-cse',
    departmentName: 'Finance & Accounts Division',
    identifier: 'ACC-FIN-009'
  },
  {
    id: 'user-adm-1',
    name: 'Dean Eleanor Vance [DEMO]',
    email: 'dean.academics@campus.edu',
    password: 'Admin123!',
    role: 'admin',
    departmentId: 'dept-cse',
    departmentName: 'Dean of Academic Affairs',
    identifier: 'ADM-EXEC-001'
  }
];

export const SUBJECTS: Subject[] = [
  {
    id: 'sub-cs201',
    departmentId: 'dept-cse',
    code: 'CS201',
    name: 'Data Structures and Algorithms',
    semester: 4,
    credits: 4,
    facultyName: 'Dr. Sarah Jenkins',
    facultyId: 'user-fac-1'
  },
  {
    id: 'sub-cs202',
    departmentId: 'dept-cse',
    code: 'CS202',
    name: 'Operating Systems',
    semester: 4,
    credits: 4,
    facultyName: 'Prof. Michael Rao',
    facultyId: 'user-hod-1'
  },
  {
    id: 'sub-cs203',
    departmentId: 'dept-cse',
    code: 'CS203',
    name: 'Database Management Systems',
    semester: 4,
    credits: 4,
    facultyName: 'Dr. Aris Thorne',
    facultyId: 'user-fac-2'
  },
  {
    id: 'sub-cs204',
    departmentId: 'dept-cse',
    code: 'CS204',
    name: 'Computer Networks',
    semester: 4,
    credits: 3,
    facultyName: 'Prof. Linda Wu',
    facultyId: 'user-fac-3'
  },
  {
    id: 'sub-ma201',
    departmentId: 'dept-cse',
    code: 'MA201',
    name: 'Discrete Mathematics & Graph Theory',
    semester: 4,
    credits: 3,
    facultyName: 'Dr. David Kumar',
    facultyId: 'user-fac-4'
  },
  {
    id: 'sub-cs301',
    departmentId: 'dept-cse',
    code: 'CS301',
    name: 'Compiler Design & Program Analysis',
    semester: 6,
    credits: 4,
    facultyName: 'Dr. Sarah Jenkins',
    facultyId: 'user-fac-1'
  },
  {
    id: 'sub-ec201',
    departmentId: 'dept-ece',
    code: 'EC201',
    name: 'Digital Signal Processing',
    semester: 4,
    credits: 4,
    facultyName: 'Dr. Ramesh Iyer',
    facultyId: 'user-fac-5'
  },
  {
    id: 'sub-ec301',
    departmentId: 'dept-ece',
    code: 'EC301',
    name: 'VLSI Circuit Design',
    semester: 6,
    credits: 4,
    facultyName: 'Dr. Ramesh Iyer',
    facultyId: 'user-fac-5'
  },
  {
    id: 'sub-ee201',
    departmentId: 'dept-eee',
    code: 'EE201',
    name: 'Electrical Power Systems',
    semester: 4,
    credits: 4,
    facultyName: 'Prof. Suresh Nair',
    facultyId: 'user-fac-6'
  },
  {
    id: 'sub-ee301',
    departmentId: 'dept-eee',
    code: 'EE301',
    name: 'Control Systems Engineering',
    semester: 6,
    credits: 4,
    facultyName: 'Prof. Suresh Nair',
    facultyId: 'user-fac-6'
  },
  {
    id: 'sub-it201',
    departmentId: 'dept-it',
    code: 'IT201',
    name: 'Web Systems & Cloud Architecture',
    semester: 4,
    credits: 4,
    facultyName: 'Dr. Alan Turing',
    facultyId: 'user-fac-7'
  },
  {
    id: 'sub-it301',
    departmentId: 'dept-it',
    code: 'IT301',
    name: 'Network Security & Cryptography',
    semester: 6,
    credits: 4,
    facultyName: 'Dr. Alan Turing',
    facultyId: 'user-fac-7'
  },
  {
    id: 'sub-me201',
    departmentId: 'dept-me',
    code: 'ME201',
    name: 'Applied Thermodynamics',
    semester: 4,
    credits: 4,
    facultyName: 'Prof. Hans Weber',
    facultyId: 'user-fac-8'
  },
  {
    id: 'sub-me301',
    departmentId: 'dept-me',
    code: 'ME301',
    name: 'Heat and Mass Transfer',
    semester: 6,
    credits: 4,
    facultyName: 'Prof. Hans Weber',
    facultyId: 'user-fac-8'
  }
];

export const INITIAL_TIMETABLES: TimetableEntry[] = [
  {
    id: 'tt-1',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    facultyId: 'user-fac-1',
    facultyName: 'Dr. Sarah Jenkins',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-2',
    dayOfWeek: 'Monday',
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    facultyId: 'user-hod-1',
    facultyName: 'Prof. Michael Rao',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-3',
    dayOfWeek: 'Monday',
    startTime: '11:30',
    endTime: '12:30',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'Database Management Systems',
    facultyId: 'user-fac-2',
    facultyName: 'Dr. Aris Thorne',
    classroomId: 'cr-lh102',
    classroomName: 'LH-102 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-4',
    dayOfWeek: 'Tuesday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub-cs204',
    subjectCode: 'CS204',
    subjectName: 'Computer Networks',
    facultyId: 'user-fac-3',
    facultyName: 'Prof. Linda Wu',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-5',
    dayOfWeek: 'Tuesday',
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub-ma201',
    subjectCode: 'MA201',
    subjectName: 'Discrete Mathematics & Graph Theory',
    facultyId: 'user-fac-4',
    facultyName: 'Dr. David Kumar',
    classroomId: 'cr-lh102',
    classroomName: 'LH-102 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-6',
    dayOfWeek: 'Tuesday',
    startTime: '13:30',
    endTime: '15:30',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures Lab (Practical)',
    facultyId: 'user-fac-1',
    facultyName: 'Dr. Sarah Jenkins',
    classroomId: 'cr-cs-lab1',
    classroomName: 'CS-Lab-01 (Ada Lovelace)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-7',
    dayOfWeek: 'Wednesday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    facultyId: 'user-hod-1',
    facultyName: 'Prof. Michael Rao',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-8',
    dayOfWeek: 'Wednesday',
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    facultyId: 'user-fac-1',
    facultyName: 'Dr. Sarah Jenkins',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-9',
    dayOfWeek: 'Thursday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'Database Management Systems',
    facultyId: 'user-fac-2',
    facultyName: 'Dr. Aris Thorne',
    classroomId: 'cr-lh102',
    classroomName: 'LH-102 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-10',
    dayOfWeek: 'Thursday',
    startTime: '10:15',
    endTime: '11:15',
    subjectId: 'sub-cs204',
    subjectCode: 'CS204',
    subjectName: 'Computer Networks',
    facultyId: 'user-fac-3',
    facultyName: 'Prof. Linda Wu',
    classroomId: 'cr-lh101',
    classroomName: 'LH-101 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-11',
    dayOfWeek: 'Friday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: 'sub-ma201',
    subjectCode: 'MA201',
    subjectName: 'Discrete Mathematics & Graph Theory',
    facultyId: 'user-fac-4',
    facultyName: 'Dr. David Kumar',
    classroomId: 'cr-lh102',
    classroomName: 'LH-102 (Turing Block)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  },
  {
    id: 'tt-12',
    dayOfWeek: 'Friday',
    startTime: '10:15',
    endTime: '12:15',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'DBMS Query Optimization Workshop',
    facultyId: 'user-fac-2',
    facultyName: 'Dr. Aris Thorne',
    classroomId: 'cr-cs-lab1',
    classroomName: 'CS-Lab-01 (Ada Lovelace)',
    department: 'CSE',
    semester: 4,
    section: 'A'
  }
];

export const INITIAL_EXAMINATIONS: Examination[] = [
  {
    id: 'exam-1',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    examDate: '2026-10-12',
    session: 'Morning',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Academic Complex Hall A',
    totalMarks: 100,
    type: 'Mid-Term',
    status: 'published'
  },
  {
    id: 'exam-2',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    examDate: '2026-10-15',
    session: 'Morning',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Academic Complex Hall A',
    totalMarks: 100,
    type: 'Mid-Term',
    status: 'published'
  },
  {
    id: 'exam-3',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'Database Management Systems',
    examDate: '2026-10-18',
    session: 'Afternoon',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Shannon Block Auditorium',
    totalMarks: 100,
    type: 'Mid-Term',
    status: 'published'
  },
  {
    id: 'exam-4',
    subjectId: 'sub-cs204',
    subjectCode: 'CS204',
    subjectName: 'Computer Networks',
    examDate: '2026-10-21',
    session: 'Morning',
    startTime: '09:30',
    endTime: '12:30',
    venue: 'Academic Complex Hall B',
    totalMarks: 100,
    type: 'Mid-Term',
    status: 'published'
  },
  {
    id: 'exam-5',
    subjectId: 'sub-ma201',
    subjectCode: 'MA201',
    subjectName: 'Discrete Mathematics & Graph Theory',
    examDate: '2026-10-24',
    session: 'Afternoon',
    startTime: '14:00',
    endTime: '17:00',
    venue: 'Turing Block LH-101',
    totalMarks: 100,
    type: 'Mid-Term',
    status: 'published'
  }
];

export const INITIAL_SYLLABUS: SyllabusUnit[] = [
  {
    id: 'syl-cs201-u1',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    unitNumber: 1,
    title: 'Linear Data Structures & Complexity Analysis',
    learningOutcomes: [
      'Analyze asymptotic bounds using Big-O, Omega, and Theta notations',
      'Implement dynamic arrays, singly and doubly linked lists with edge-case handling',
      'Design stack-based expression evaluators and queue ring buffers'
    ],
    topics: [
      { id: 'top-101', name: 'Asymptotic Analysis & Master Theorem', estimatedHours: 3 },
      { id: 'top-102', name: 'Singly & Doubly Linked Lists Implementation', estimatedHours: 4 },
      { id: 'top-103', name: 'Circular Queues & Priority Deques', estimatedHours: 3 },
      { id: 'top-104', name: 'Stack Applications: Infix to Postfix & Recursion', estimatedHours: 2 }
    ],
    resources: [
      { id: 'res-1', title: 'Unit 1 Lecture Slides: Complexity Analysis', type: 'slides', fileUrl: '#', fileSize: '2.4 MB' },
      { id: 'res-2', title: 'Linked Lists & Deque Code Templates', type: 'notes', fileUrl: '#', fileSize: '1.1 MB' }
    ]
  },
  {
    id: 'syl-cs201-u2',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    unitNumber: 2,
    title: 'Non-Linear Trees & Balanced Search Trees',
    learningOutcomes: [
      'Construct and traverse Binary Search Trees (BST)',
      'Maintain AVL and Red-Black tree invariants through rotations',
      'Utilize Binary Heaps for optimal Priority Queue operations'
    ],
    topics: [
      { id: 'top-105', name: 'Binary Tree Traversals (Inorder, Preorder, Postorder)', estimatedHours: 3 },
      { id: 'top-106', name: 'AVL Tree Self-Balancing Single/Double Rotations', estimatedHours: 4 },
      { id: 'top-107', name: 'Min-Heap and Max-Heap Operations & HeapSort', estimatedHours: 3 },
      { id: 'top-108', name: 'Trie Data Structure for Prefix Search', estimatedHours: 2 }
    ],
    resources: [
      { id: 'res-3', title: 'AVL Tree Rotation Invariants Reference Sheet', type: 'reference', fileUrl: '#', fileSize: '850 KB' },
      { id: 'res-4', title: 'Assignment 2: Heaps & Priority Queues', type: 'assignment', fileUrl: '#', fileSize: '520 KB' }
    ]
  },
  {
    id: 'syl-cs202-u1',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    unitNumber: 1,
    title: 'Process Management, Threads & Concurrency',
    learningOutcomes: [
      'Contrast process memory layouts, context switches, and fork/exec semantics',
      'Analyze CPU scheduling algorithms (CFS, Multi-Level Feedback Queue)',
      'Resolve race conditions using mutex locks, semaphores, and monitors'
    ],
    topics: [
      { id: 'top-201', name: 'Process Control Blocks & Context Switch Overhead', estimatedHours: 3 },
      { id: 'top-202', name: 'Preemptive vs Non-Preemptive CPU Schedulers', estimatedHours: 4 },
      { id: 'top-203', name: 'POSIX Threads & Peterson Mutual Exclusion Solution', estimatedHours: 3 },
      { id: 'top-204', name: 'Classical Sync Problems: Producer-Consumer & Readers-Writers', estimatedHours: 3 }
    ],
    resources: [
      { id: 'res-5', title: 'Process Scheduling Algorithms Comparison', type: 'notes', fileUrl: '#', fileSize: '1.8 MB' },
      { id: 'res-6', title: 'Semaphore Programming in C (POSIX)', type: 'reference', fileUrl: '#', fileSize: '720 KB' }
    ]
  },
  {
    id: 'syl-cs202-u2',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    unitNumber: 2,
    title: 'Memory Management & Virtual Memory',
    learningOutcomes: [
      'Design paging systems with Multi-level Page Tables and TLBs',
      'Evaluate page replacement algorithms (FIFO, LRU, Clock, Optimal)',
      'Diagnose thrashing and working-set model strategies'
    ],
    topics: [
      { id: 'top-205', name: 'Paging Hardware, TLB Misses & Effective Access Time', estimatedHours: 4 },
      { id: 'top-206', name: 'Page Replacement Algorithms & Belady Anomaly', estimatedHours: 3 },
      { id: 'top-207', name: 'Demand Paging, Inverted Page Tables & Segmentation', estimatedHours: 3 }
    ],
    resources: [
      { id: 'res-7', title: 'Virtual Memory & TLB Calculation Handout', type: 'notes', fileUrl: '#', fileSize: '1.2 MB' }
    ]
  },
  {
    id: 'syl-cs203-u1',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'Database Management Systems',
    unitNumber: 1,
    title: 'Relational Model, Normalization & ACID Transactions',
    learningOutcomes: [
      'Model enterprise schemas using ER diagrams and relational algebra',
      'Normalize tables up to BCNF and 4NF to eliminate anomalies',
      'Verify serializability and Two-Phase Locking (2PL) protocols'
    ],
    topics: [
      { id: 'top-301', name: 'Relational Algebra Expressions & SQL Equivalence', estimatedHours: 3 },
      { id: 'top-302', name: 'Functional Dependencies & Normal Forms (1NF through BCNF)', estimatedHours: 4 },
      { id: 'top-303', name: 'ACID Properties & Write-Ahead Logging (WAL)', estimatedHours: 3 },
      { id: 'top-304', name: 'Conflict Serializability & Strict 2PL Protocol', estimatedHours: 3 }
    ],
    resources: [
      { id: 'res-8', title: 'Normalization Decomposition Algorithms Guide', type: 'notes', fileUrl: '#', fileSize: '980 KB' }
    ]
  }
];

export const INITIAL_QUESTION_PAPERS: QuestionPaper[] = [
  {
    id: 'pyq-1',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    year: 2024,
    semester: 4,
    examType: 'End-Semester',
    fileUrl: '/docs/pyq/CS201_EndSem_2024.pdf',
    fileSize: '1.4 MB',
    downloadCount: 382,
    uploadedDate: '2025-01-15'
  },
  {
    id: 'pyq-2',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    year: 2024,
    semester: 4,
    examType: 'Mid-Term',
    fileUrl: '/docs/pyq/CS201_MidTerm_2024.pdf',
    fileSize: '890 KB',
    downloadCount: 421,
    uploadedDate: '2024-11-02'
  },
  {
    id: 'pyq-3',
    subjectId: 'sub-cs201',
    subjectCode: 'CS201',
    subjectName: 'Data Structures and Algorithms',
    year: 2023,
    semester: 4,
    examType: 'End-Semester',
    fileUrl: '/docs/pyq/CS201_EndSem_2023.pdf',
    fileSize: '1.2 MB',
    downloadCount: 512,
    uploadedDate: '2024-01-18'
  },
  {
    id: 'pyq-4',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    year: 2024,
    semester: 4,
    examType: 'End-Semester',
    fileUrl: '/docs/pyq/CS202_EndSem_2024.pdf',
    fileSize: '1.6 MB',
    downloadCount: 295,
    uploadedDate: '2025-01-20'
  },
  {
    id: 'pyq-5',
    subjectId: 'sub-cs202',
    subjectCode: 'CS202',
    subjectName: 'Operating Systems',
    year: 2024,
    semester: 4,
    examType: 'Mid-Term',
    fileUrl: '/docs/pyq/CS202_MidTerm_2024.pdf',
    fileSize: '950 KB',
    downloadCount: 334,
    uploadedDate: '2024-11-05'
  },
  {
    id: 'pyq-6',
    subjectId: 'sub-cs203',
    subjectCode: 'CS203',
    subjectName: 'Database Management Systems',
    year: 2024,
    semester: 4,
    examType: 'End-Semester',
    fileUrl: '/docs/pyq/CS203_EndSem_2024.pdf',
    fileSize: '1.3 MB',
    downloadCount: 278,
    uploadedDate: '2025-01-22'
  },
  {
    id: 'pyq-7',
    subjectId: 'sub-cs204',
    subjectCode: 'CS204',
    subjectName: 'Computer Networks',
    year: 2024,
    semester: 4,
    examType: 'End-Semester',
    fileUrl: '/docs/pyq/CS204_EndSem_2024.pdf',
    fileSize: '1.5 MB',
    downloadCount: 241,
    uploadedDate: '2025-01-24'
  }
];

export const INITIAL_BOOKS: Book[] = [
  {
    id: 'book-1',
    isbn: '978-0262033848',
    title: 'Data Structures and Algorithms in Modern Computing',
    author: 'Thomas H. Cormen, Charles E. Leiserson, Ronald L. Rivest',
    publisher: 'MIT Press',
    year: 2022,
    departmentId: 'dept-cse',
    category: 'Computer Science',
    shelfLocation: 'Stack CS-04 / Rack 2B',
    totalCopies: 6,
    availableCopies: 2,
    coverImage: '/src/assets/images/book_algorithms_1790780173257.jpg',
    summary: 'Comprehensive reference text covering fundamental algorithms, greedy strategies, dynamic programming, advanced graph algorithms, and asymptotic amortized analysis.',
    keywords: ['algorithms', 'data structures', 'sorting', 'graphs', 'dynamic programming', 'CS201']
  },
  {
    id: 'book-2',
    isbn: '978-0133591620',
    title: 'Modern Operating Systems and Distributed Architecture',
    author: 'Andrew S. Tanenbaum, Herbert Bos',
    publisher: 'Pearson Higher Education',
    year: 2023,
    departmentId: 'dept-cse',
    category: 'Operating Systems',
    shelfLocation: 'Stack CS-02 / Rack 1A',
    totalCopies: 5,
    availableCopies: 1,
    coverImage: '/src/assets/images/book_os_1790780184821.jpg',
    summary: 'In-depth coverage of contemporary operating system design, virtualization, multiprocessor scheduling, microkernel architectures, and security mechanisms.',
    keywords: ['operating systems', 'concurrency', 'kernel', 'paging', 'virtualization', 'CS202']
  },
  {
    id: 'book-3',
    isbn: '978-0078022159',
    title: 'Database System Concepts (7th Edition)',
    author: 'Abraham Silberschatz, Henry F. Korth, S. Sudarshan',
    publisher: 'McGraw-Hill Education',
    year: 2021,
    departmentId: 'dept-cse',
    category: 'Database Systems',
    shelfLocation: 'Stack CS-05 / Rack 3A',
    totalCopies: 4,
    availableCopies: 0,
    coverImage: undefined,
    summary: 'Core principles of database architecture, relational calculus, query optimization engines, indexing structures (B+ trees), and distributed transaction consensus.',
    keywords: ['database', 'sql', 'acid', 'transactions', 'normalization', 'b-trees', 'CS203']
  },
  {
    id: 'book-4',
    isbn: '978-0136681557',
    title: 'Computer Networking: A Top-Down Approach (8th Edition)',
    author: 'James Kurose, Keith Ross',
    publisher: 'Pearson',
    year: 2022,
    departmentId: 'dept-cse',
    category: 'Networking',
    shelfLocation: 'Stack CS-03 / Rack 4C',
    totalCopies: 5,
    availableCopies: 3,
    coverImage: undefined,
    summary: 'Layered network paradigm focusing on the application layer first, down through transport layer TCP/UDP congestion control, routing protocols, and link layer framing.',
    keywords: ['networking', 'tcp', 'udp', 'http3', 'routing', 'bgp', 'dns', 'CS204']
  },
  {
    id: 'book-5',
    isbn: '978-0073383095',
    title: 'Discrete Mathematics and Its Applications',
    author: 'Kenneth H. Rosen',
    publisher: 'McGraw-Hill Science',
    year: 2019,
    departmentId: 'dept-cse',
    category: 'Mathematics',
    shelfLocation: 'Stack MA-01 / Rack 2A',
    totalCopies: 8,
    availableCopies: 4,
    coverImage: undefined,
    summary: 'Foundational text exploring combinatorics, propositional logic, mathematical induction, graph coloring, Euler circuits, and Boolean algebra.',
    keywords: ['discrete math', 'graphs', 'combinatorics', 'logic', 'induction', 'MA201']
  }
];

export const INITIAL_CIRCULATIONS: BookCirculation[] = [
  {
    id: 'circ-1',
    bookId: 'book-1',
    bookTitle: 'Data Structures and Algorithms in Modern Computing',
    userId: 'user-std-1',
    userName: 'Alex Chen',
    userRole: 'student',
    issueDate: '2026-09-18',
    dueDate: '2026-10-04',
    status: 'issued',
    fineAmount: 0.00
  },
  {
    id: 'circ-2',
    bookId: 'book-3',
    bookTitle: 'Database System Concepts (7th Edition)',
    userId: 'user-std-1',
    userName: 'Alex Chen',
    userRole: 'student',
    issueDate: '2026-09-10',
    dueDate: '2026-09-24', // overdue!
    status: 'overdue',
    fineAmount: 12.00
  }
];

export const INITIAL_RESERVATIONS: BookReservation[] = [
  {
    id: 'resv-1',
    bookId: 'book-2',
    bookTitle: 'Modern Operating Systems and Distributed Architecture',
    userId: 'user-std-1',
    userName: 'Alex Chen',
    userRole: 'student',
    reservationDate: '2026-09-28',
    expiryDate: '2026-10-05',
    status: 'pending',
    queuePosition: 1
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'user-std-1',
    title: 'Overdue Book Alert',
    message: 'Your borrowed book "Database System Concepts" was due on Sep 24. Outstanding overdue fine is $12.00.',
    type: 'library',
    timestamp: '2 hours ago',
    read: false,
    actionLink: 'library'
  },
  {
    id: 'notif-2',
    userId: 'user-std-1',
    title: 'Mid-Term Exam Schedule Confirmed',
    message: 'The official Mid-Term schedule for CSE 4th Semester is published. CS201 exam starts Oct 12 at 09:30 AM.',
    type: 'exam',
    timestamp: '1 day ago',
    read: false,
    actionLink: 'exams'
  },
  {
    id: 'notif-3',
    userId: 'user-std-1',
    title: 'Upcoming Book Return',
    message: '"Data Structures and Algorithms" is due in 4 days (Oct 04). Please renew or return on time.',
    type: 'library',
    timestamp: '2 days ago',
    read: true,
    actionLink: 'library'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-09-30 07:15:20 UTC',
    actorId: 'user-adm-1',
    actorName: 'Dean Eleanor Vance',
    actorRole: 'admin',
    action: 'PUBLISH_EXAM_SCHEDULE',
    affectedRecord: 'Semester 4 Mid-Term Schedule (CSE/ECE/IT)',
    reason: 'Approved by Academic Senate Resolution 42-B'
  },
  {
    id: 'log-2',
    timestamp: '2026-09-29 14:32:00 UTC',
    actorId: 'user-lib-1',
    actorName: 'Mr. Robert Vance',
    actorRole: 'librarian',
    action: 'INVENTORY_RECONCILIATION',
    affectedRecord: 'Stack CS-02 / Rack 1A',
    reason: 'Routine quarterly audit of 48 technical monographs'
  },
  {
    id: 'log-3',
    timestamp: '2026-09-28 11:20:44 UTC',
    actorId: 'user-hod-1',
    actorName: 'Prof. Michael Rao',
    actorRole: 'hod',
    action: 'UPDATE_SYLLABUS_RESOURCES',
    affectedRecord: 'CS202 Unit 2 Virtual Memory Handout',
    reason: 'Added updated TLB calculation reference sheet'
  },
  {
    id: 'log-4',
    timestamp: '2026-09-26 09:00:12 UTC',
    actorId: 'user-fac-1',
    actorName: 'Dr. Sarah Jenkins',
    actorRole: 'faculty',
    action: 'UPLOAD_QUESTION_PAPER',
    affectedRecord: 'CS201_EndSem_2024.pdf',
    reason: 'Published for open student revision repository'
  }
];

export const INITIAL_FEE_INVOICES: FeeInvoice[] = [
  // Student 1: Alex Chen (CSE Sem 4) - Partial Paid
  {
    id: 'inv-cse4-001',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    departmentName: 'Computer Science & Engineering',
    semester: 4,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3200,
      examination: 350,
      library: 150,
      laboratory: 400,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6100,
    scholarshipDiscount: 640,
    scholarshipName: 'Merit Academic Excellence Grant (20% Tuition Waiver)',
    netAmount: 5460,
    paidAmount: 2730,
    outstandingBalance: 2730,
    dueDate: '2026-10-15',
    status: 'partial',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2730,
        dueDate: '2026-08-15',
        paid: true,
        paidAt: '2026-08-12'
      },
      {
        installmentNumber: 2,
        amount: 2730,
        dueDate: '2026-10-15',
        paid: false
      }
    ]
  },
  {
    id: 'inv-cse3-001',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    departmentName: 'Computer Science & Engineering',
    semester: 3,
    academicYear: '2025-2026',
    breakdown: {
      tuition: 3200,
      examination: 350,
      library: 150,
      laboratory: 400,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6100,
    scholarshipDiscount: 640,
    scholarshipName: 'Merit Academic Excellence Grant (20% Tuition Waiver)',
    netAmount: 5460,
    paidAmount: 5460,
    outstandingBalance: 0,
    dueDate: '2026-02-15',
    status: 'paid',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2730,
        dueDate: '2026-01-15',
        paid: true,
        paidAt: '2026-01-10'
      },
      {
        installmentNumber: 2,
        amount: 2730,
        dueDate: '2026-02-15',
        paid: true,
        paidAt: '2026-02-12'
      }
    ]
  },
  // Student 2: Priya Sharma (CSE Sem 6) - Overdue
  {
    id: 'inv-cse6-002',
    studentId: 'user-std-2',
    studentName: 'Priya Sharma [DEMO]',
    studentRoll: 'CSE-2023-019',
    departmentName: 'Computer Science & Engineering',
    semester: 6,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3400,
      examination: 350,
      library: 150,
      laboratory: 450,
      hostel: 0,
      development: 250
    },
    grossAmount: 4600,
    scholarshipDiscount: 0,
    netAmount: 4600,
    paidAmount: 2300,
    outstandingBalance: 2300,
    dueDate: '2026-09-20',
    status: 'overdue',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2300,
        dueDate: '2026-08-15',
        paid: true,
        paidAt: '2026-08-14'
      },
      {
        installmentNumber: 2,
        amount: 2300,
        dueDate: '2026-09-20',
        paid: false
      }
    ]
  },
  // Student 3: Chloe Dubois (CSE Sem 2) - Pending
  {
    id: 'inv-cse2-003',
    studentId: 'user-std-3',
    studentName: 'Chloe Dubois [DEMO]',
    studentRoll: 'CSE-2025-007',
    departmentName: 'Computer Science & Engineering',
    semester: 2,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3100,
      examination: 350,
      library: 150,
      laboratory: 350,
      hostel: 1800,
      development: 200
    },
    grossAmount: 5950,
    scholarshipDiscount: 500,
    scholarshipName: 'International Admissions Bursary',
    netAmount: 5450,
    paidAmount: 0,
    outstandingBalance: 5450,
    dueDate: '2026-10-30',
    status: 'pending',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2725,
        dueDate: '2026-10-30',
        paid: false
      },
      {
        installmentNumber: 2,
        amount: 2725,
        dueDate: '2026-12-15',
        paid: false
      }
    ]
  },
  // Student 4: Marcus Wright (ECE Sem 4) - Full Paid
  {
    id: 'inv-ece4-004',
    studentId: 'user-std-4',
    studentName: 'Marcus Wright [DEMO]',
    studentRoll: 'ECE-2024-055',
    departmentName: 'Electronics & Communication Engineering',
    semester: 4,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3200,
      examination: 350,
      library: 150,
      laboratory: 450,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6150,
    scholarshipDiscount: 1000,
    scholarshipName: 'Dean STEM Innovation Fellowship',
    netAmount: 5150,
    paidAmount: 5150,
    outstandingBalance: 0,
    dueDate: '2026-10-10',
    status: 'paid',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 5150,
        dueDate: '2026-10-10',
        paid: true,
        paidAt: '2026-09-15'
      }
    ]
  },
  // Student 5: Ananya Iyer (ECE Sem 6) - Partial Paid
  {
    id: 'inv-ece6-005',
    studentId: 'user-std-5',
    studentName: 'Ananya Iyer [DEMO]',
    studentRoll: 'ECE-2023-012',
    departmentName: 'Electronics & Communication Engineering',
    semester: 6,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3300,
      examination: 350,
      library: 150,
      laboratory: 500,
      hostel: 0,
      development: 200
    },
    grossAmount: 4500,
    scholarshipDiscount: 300,
    scholarshipName: 'Women in Engineering Grant',
    netAmount: 4200,
    paidAmount: 2100,
    outstandingBalance: 2100,
    dueDate: '2026-10-25',
    status: 'partial',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2100,
        dueDate: '2026-08-20',
        paid: true,
        paidAt: '2026-08-18'
      },
      {
        installmentNumber: 2,
        amount: 2100,
        dueDate: '2026-10-25',
        paid: false
      }
    ]
  },
  // Student 6: Tariq Hassan (ECE Sem 2) - Pending
  {
    id: 'inv-ece2-006',
    studentId: 'user-std-6',
    studentName: 'Tariq Hassan [DEMO]',
    studentRoll: 'ECE-2025-044',
    departmentName: 'Electronics & Communication Engineering',
    semester: 2,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3100,
      examination: 350,
      library: 150,
      laboratory: 400,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6000,
    scholarshipDiscount: 0,
    netAmount: 6000,
    paidAmount: 0,
    outstandingBalance: 6000,
    dueDate: '2026-11-05',
    status: 'pending',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 3000,
        dueDate: '2026-11-05',
        paid: false
      },
      {
        installmentNumber: 2,
        amount: 3000,
        dueDate: '2026-12-20',
        paid: false
      }
    ]
  },
  // Student 7: Rohan Verma (EEE Sem 4) - Partial Paid
  {
    id: 'inv-eee4-007',
    studentId: 'user-std-7',
    studentName: 'Rohan Verma [DEMO]',
    studentRoll: 'EEE-2024-033',
    departmentName: 'Electrical & Electronics Engineering',
    semester: 4,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3150,
      examination: 350,
      library: 150,
      laboratory: 420,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6070,
    scholarshipDiscount: 600,
    scholarshipName: 'Power Grid Merit Scholarship',
    netAmount: 5470,
    paidAmount: 2735,
    outstandingBalance: 2735,
    dueDate: '2026-10-18',
    status: 'partial',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2735,
        dueDate: '2026-08-15',
        paid: true,
        paidAt: '2026-08-11'
      },
      {
        installmentNumber: 2,
        amount: 2735,
        dueDate: '2026-10-18',
        paid: false
      }
    ]
  },
  // Student 8: Sneha Patel (EEE Sem 6) - Paid
  {
    id: 'inv-eee6-008',
    studentId: 'user-std-8',
    studentName: 'Sneha Patel [DEMO]',
    studentRoll: 'EEE-2023-078',
    departmentName: 'Electrical & Electronics Engineering',
    semester: 6,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3350,
      examination: 350,
      library: 150,
      laboratory: 480,
      hostel: 0,
      development: 220
    },
    grossAmount: 4550,
    scholarshipDiscount: 900,
    scholarshipName: 'State Technical Endowment',
    netAmount: 3650,
    paidAmount: 3650,
    outstandingBalance: 0,
    dueDate: '2026-09-30',
    status: 'paid',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 3650,
        dueDate: '2026-09-30',
        paid: true,
        paidAt: '2026-09-20'
      }
    ]
  },
  // Student 9: Liam Davies (IT Sem 4) - Partial Paid
  {
    id: 'inv-it4-009',
    studentId: 'user-std-9',
    studentName: 'Liam Davies [DEMO]',
    studentRoll: 'IT-2024-021',
    departmentName: 'Information Technology',
    semester: 4,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3200,
      examination: 350,
      library: 150,
      laboratory: 400,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6100,
    scholarshipDiscount: 500,
    scholarshipName: 'Cloud Foundation Grant',
    netAmount: 5600,
    paidAmount: 2800,
    outstandingBalance: 2800,
    dueDate: '2026-10-22',
    status: 'partial',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2800,
        dueDate: '2026-08-15',
        paid: true,
        paidAt: '2026-08-14'
      },
      {
        installmentNumber: 2,
        amount: 2800,
        dueDate: '2026-10-22',
        paid: false
      }
    ]
  },
  // Student 10: Fatima Al-Mansoor (IT Sem 6) - Overdue
  {
    id: 'inv-it6-010',
    studentId: 'user-std-10',
    studentName: 'Fatima Al-Mansoor [DEMO]',
    studentRoll: 'IT-2023-064',
    departmentName: 'Information Technology',
    semester: 6,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3350,
      examination: 350,
      library: 150,
      laboratory: 420,
      hostel: 0,
      development: 200
    },
    grossAmount: 4470,
    scholarshipDiscount: 0,
    netAmount: 4470,
    paidAmount: 2235,
    outstandingBalance: 2235,
    dueDate: '2026-09-15',
    status: 'overdue',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2235,
        dueDate: '2026-08-10',
        paid: true,
        paidAt: '2026-08-08'
      },
      {
        installmentNumber: 2,
        amount: 2235,
        dueDate: '2026-09-15',
        paid: false
      }
    ]
  },
  // Student 11: Jin Woo Park (ME Sem 4) - Pending
  {
    id: 'inv-me4-011',
    studentId: 'user-std-11',
    studentName: 'Jin Woo Park [DEMO]',
    studentRoll: 'ME-2024-015',
    departmentName: 'Mechanical Engineering',
    semester: 4,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3150,
      examination: 350,
      library: 150,
      laboratory: 450,
      hostel: 1800,
      development: 200
    },
    grossAmount: 6100,
    scholarshipDiscount: 600,
    scholarshipName: 'Automotive Design Bursary',
    netAmount: 5500,
    paidAmount: 0,
    outstandingBalance: 5500,
    dueDate: '2026-10-28',
    status: 'pending',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 2750,
        dueDate: '2026-10-28',
        paid: false
      },
      {
        installmentNumber: 2,
        amount: 2750,
        dueDate: '2026-12-10',
        paid: false
      }
    ]
  },
  // Student 12: Vikram Malhotra (ME Sem 6) - Paid
  {
    id: 'inv-me6-012',
    studentId: 'user-std-12',
    studentName: 'Vikram Malhotra [DEMO]',
    studentRoll: 'ME-2023-088',
    departmentName: 'Mechanical Engineering',
    semester: 6,
    academicYear: '2026-2027',
    breakdown: {
      tuition: 3300,
      examination: 350,
      library: 150,
      laboratory: 480,
      hostel: 0,
      development: 220
    },
    grossAmount: 4500,
    scholarshipDiscount: 500,
    scholarshipName: 'Heavy Engineering Council Award',
    netAmount: 4000,
    paidAmount: 4000,
    outstandingBalance: 0,
    dueDate: '2026-09-25',
    status: 'paid',
    installmentPlan: [
      {
        installmentNumber: 1,
        amount: 4000,
        dueDate: '2026-09-25',
        paid: true,
        paidAt: '2026-09-20'
      }
    ]
  }
];

export const INITIAL_FEE_PAYMENTS: FeePayment[] = [
  {
    id: 'pay-2026-881',
    invoiceId: 'inv-cse4-001',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    amount: 2730,
    paymentDate: '2026-08-12 10:45:10',
    paymentMethod: 'UPI',
    transactionReference: 'UPI/2026/DEMO-TXN891726019A',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-04218',
    semester: 4,
    notes: '[DEMO TRANSACTION] Installment 1 of 2 cleared successfully via verified checkout.'
  },
  {
    id: 'pay-2026-302',
    invoiceId: 'inv-cse3-001',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    amount: 2730,
    paymentDate: '2026-01-10 14:22:00',
    paymentMethod: 'NetBanking',
    transactionReference: 'NET/2026/DEMO-HDFC7728190',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-01044',
    semester: 3,
    notes: '[DEMO TRANSACTION] Semester 3 Installment 1 of 2.'
  },
  {
    id: 'pay-2026-399',
    invoiceId: 'inv-cse3-001',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    amount: 2730,
    paymentDate: '2026-02-12 09:15:30',
    paymentMethod: 'DebitCard',
    transactionReference: 'CARD/2026/DEMO-VISA4490192',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-02195',
    semester: 3,
    notes: '[DEMO TRANSACTION] Semester 3 Installment 2 of 2 - Full clearance.'
  },
  {
    id: 'pay-2026-554',
    invoiceId: 'inv-ece4-004',
    studentId: 'user-std-4',
    studentName: 'Marcus Wright [DEMO]',
    studentRoll: 'ECE-2024-055',
    amount: 5150,
    paymentDate: '2026-09-15 16:30:12',
    paymentMethod: 'NetBanking',
    transactionReference: 'NET/2026/DEMO-ICICI9920144',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-05591',
    semester: 4,
    notes: '[DEMO TRANSACTION] Full semester tuition cleared with Dean STEM Fellowship.'
  },
  {
    id: 'pay-2026-778',
    invoiceId: 'inv-eee6-008',
    studentId: 'user-std-8',
    studentName: 'Sneha Patel [DEMO]',
    studentRoll: 'EEE-2023-078',
    amount: 3650,
    paymentDate: '2026-09-20 11:15:00',
    paymentMethod: 'DemandDraft',
    transactionReference: 'DD/2026/DEMO-SBI882194',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-07833',
    semester: 6,
    notes: '[DEMO TRANSACTION] Verified offline DD payment counter cleared by Accounts Officer.'
  },
  {
    id: 'pay-2026-902',
    invoiceId: 'inv-me6-012',
    studentId: 'user-std-12',
    studentName: 'Vikram Malhotra [DEMO]',
    studentRoll: 'ME-2023-088',
    amount: 4000,
    paymentDate: '2026-09-20 14:10:00',
    paymentMethod: 'UPI',
    transactionReference: 'UPI/2026/DEMO-GPAY55102',
    gatewayMode: 'VERIFIED_GATEWAY_DEMO',
    gatewayStatus: 'verified_success',
    receiptNumber: 'REC-2026-08819',
    semester: 6,
    notes: '[DEMO TRANSACTION] Full clearance via UPI gateway.'
  }
];

export const INITIAL_HELPDESK_TICKETS: HelpdeskTicket[] = [
  {
    id: 'tick-2026-101',
    ticketNumber: 'TICK-10142',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    category: 'Fee & Billing',
    subject: 'Request for 10-day extension on Semester 4 Installment 2',
    description: 'Due to family banking transfer delays, requesting an extension of Installment 2 from Oct 15 to Oct 25. Installment 1 has been paid in full.',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-09-28 14:15:00',
    updatedAt: '2026-09-29 11:30:00',
    assignedTo: 'user-acc-1',
    assignedToName: 'Mr. David Sterling',
    assignedToRole: 'accounts_officer',
    messages: [
      {
        id: 'msg-1',
        ticketId: 'tick-2026-101',
        senderId: 'user-std-1',
        senderName: 'Alex Chen [DEMO]',
        senderRole: 'student',
        content: 'Dear Accounts Division, requesting a 10-day extension on Semester 4 Installment 2. Bank transfer is scheduled to clear by Oct 24.',
        createdAt: '2026-09-28 14:15:00'
      },
      {
        id: 'msg-2',
        ticketId: 'tick-2026-101',
        senderId: 'user-acc-1',
        senderName: 'Mr. David Sterling',
        senderRole: 'accounts_officer',
        content: 'Hello Alex, your request is noted. Since your first installment was paid punctually, the Finance Committee will approve the grace period without late penalty. A formal update will be posted here.',
        createdAt: '2026-09-29 11:30:00'
      }
    ]
  },
  {
    id: 'tick-2026-088',
    ticketNumber: 'TICK-10088',
    studentId: 'user-std-1',
    studentName: 'Alex Chen [DEMO]',
    studentRoll: 'CSE-2024-042',
    category: 'Timetable & Course Conflict',
    subject: 'Classroom capacity note for Friday CS203 Workshop',
    description: 'CS203 DBMS Query Optimization Workshop was held in CS-Lab-01 which has 45 seats for 52 enrolled students.',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-09-22 16:00:00',
    updatedAt: '2026-09-24 10:00:00',
    assignedTo: 'user-fac-1',
    assignedToName: 'Dr. Sarah Jenkins',
    assignedToRole: 'faculty',
    resolutionNotes: 'Classroom CS-Lab-01 has been divided into two alternating batches (Batch A1 and A2) with duplicate Friday sessions. Resolved timetable conflict on 2026-09-24.',
    messages: [
      {
        id: 'msg-3',
        ticketId: 'tick-2026-088',
        senderId: 'user-std-1',
        senderName: 'Alex Chen [DEMO]',
        senderRole: 'student',
        content: 'The CS Lab seating was insufficient for all Section A attendees on Friday.',
        createdAt: '2026-09-22 16:00:00'
      },
      {
        id: 'msg-4',
        ticketId: 'tick-2026-088',
        senderId: 'user-fac-1',
        senderName: 'Dr. Sarah Jenkins',
        senderRole: 'faculty',
        content: 'Section has been partitioned into Batch A1 and Batch A2 with alternating lab slots. Updated in timetable.',
        createdAt: '2026-09-24 10:00:00'
      }
    ]
  },
  {
    id: 'tick-2026-115',
    ticketNumber: 'TICK-10115',
    studentId: 'user-std-4',
    studentName: 'Marcus Wright [DEMO]',
    studentRoll: 'ECE-2024-055',
    category: 'Library & Fines',
    subject: 'RFID book drop clearance inquiry for Microcontrollers book',
    description: 'Dropped book in Smart RFID kiosk drop-box on Sunday evening, but portal circulation shows fine calculated for Monday morning.',
    priority: 'low',
    status: 'waiting_for_student',
    createdAt: '2026-09-25 09:20:00',
    updatedAt: '2026-09-26 14:00:00',
    assignedTo: 'user-lib-1',
    assignedToName: 'Mr. Robert Vance',
    assignedToRole: 'librarian',
    messages: [
      {
        id: 'msg-5',
        ticketId: 'tick-2026-115',
        senderId: 'user-std-4',
        senderName: 'Marcus Wright [DEMO]',
        senderRole: 'student',
        content: 'Hello, I returned the book via the library drop slot at 8:15 PM on Sep 24. Could you please verify the timestamp log?',
        createdAt: '2026-09-25 09:20:00'
      },
      {
        id: 'msg-6',
        ticketId: 'tick-2026-115',
        senderId: 'user-lib-1',
        senderName: 'Mr. Robert Vance',
        senderRole: 'librarian',
        content: 'Hi Marcus, please provide the transaction slip or photo receipt from the drop kiosk screen so we can adjust the waiver.',
        createdAt: '2026-09-26 14:00:00'
      }
    ]
  },
  {
    id: 'tick-2026-130',
    ticketNumber: 'TICK-10130',
    studentId: 'user-std-7',
    studentName: 'Rohan Verma [DEMO]',
    studentRoll: 'EEE-2024-033',
    category: 'Technical Support',
    subject: 'Institutional email sync issue on mobile PWA',
    description: 'CampusOne push notifications not prompting on iOS mobile Safari after saving to home screen.',
    priority: 'medium',
    status: 'open',
    createdAt: '2026-09-29 18:00:00',
    updatedAt: '2026-09-29 18:00:00',
    messages: [
      {
        id: 'msg-7',
        ticketId: 'tick-2026-130',
        senderId: 'user-std-7',
        senderName: 'Rohan Verma [DEMO]',
        senderRole: 'student',
        content: 'Web push notifications are blocked on Safari iOS 17 unless explicitly granted under site settings. Can a guide be added?',
        createdAt: '2026-09-29 18:00:00'
      }
    ]
  },
  {
    id: 'tick-2026-065',
    ticketNumber: 'TICK-10065',
    studentId: 'user-std-2',
    studentName: 'Priya Sharma [DEMO]',
    studentRoll: 'CSE-2023-019',
    category: 'Examination & Admit Card',
    subject: 'Admit Card Hall Ticket photo update for Semester 6 End-Sem',
    description: 'Previous year photo displayed on admit card preview. Submitted updated passport photograph to Academic Affairs.',
    priority: 'high',
    status: 'closed',
    createdAt: '2026-09-15 11:00:00',
    updatedAt: '2026-09-18 16:30:00',
    assignedTo: 'user-adm-1',
    assignedToName: 'Dean Eleanor Vance',
    assignedToRole: 'admin',
    resolutionNotes: 'Updated photograph has been processed and synced with Central Student Registry. Digital admit card regenerated and verified.',
    messages: [
      {
        id: 'msg-8',
        ticketId: 'tick-2026-065',
        senderId: 'user-std-2',
        senderName: 'Priya Sharma [DEMO]',
        senderRole: 'student',
        content: 'Please verify updated photo for examination gate biometrics.',
        createdAt: '2026-09-15 11:00:00'
      },
      {
        id: 'msg-9',
        ticketId: 'tick-2026-065',
        senderId: 'user-adm-1',
        senderName: 'Dean Eleanor Vance',
        senderRole: 'admin',
        content: 'Admit card photo updated. Digital copy is now valid for entry.',
        createdAt: '2026-09-18 16:30:00'
      }
    ]
  }
];

