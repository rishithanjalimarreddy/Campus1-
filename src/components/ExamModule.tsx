import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  GraduationCap,
  Calendar,
  Clock,
  MapPin,
  Download,
  Search,
  Plus,
  FileText,
  CheckCircle,
  Eye,
  X
} from 'lucide-react';
import { Examination, QuestionPaper } from '../types';
import { SUBJECTS } from '../data/mockData';

export const ExamModule: React.FC = () => {
  const {
    currentUser,
    examinations,
    addExamination,
    questionPapers,
    downloadQuestionPaper,
    uploadQuestionPaper
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'schedule' | 'pyq'>('schedule');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewPyq, setPreviewPyq] = useState<QuestionPaper | null>(null);

  // Upload PYQ form
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);
  const [showAddExamModal, setShowAddExamModal] = useState<boolean>(false);
  const [uploadSubjectId, setUploadSubjectId] = useState<string>(SUBJECTS[0].id);
  const [uploadYear, setUploadYear] = useState<number>(2024);
  const [uploadExamType, setUploadExamType] = useState<'Mid-Term' | 'End-Semester'>('End-Semester');
  const [uploadSemester, setUploadSemester] = useState<number>(4);

  // New Exam form
  const [examSubId, setExamSubId] = useState<string>(SUBJECTS[0].id);
  const [examDate, setExamDate] = useState<string>('2026-10-26');
  const [examSession, setExamSession] = useState<'Morning' | 'Afternoon'>('Morning');
  const [examVenue, setExamVenue] = useState<string>('Academic Complex Hall A');
  const [examType, setExamType] = useState<'Mid-Term' | 'End-Semester' | 'Practical'>('Mid-Term');

  const canManage = currentUser.role === 'faculty' || currentUser.role === 'hod' || currentUser.role === 'admin';

  // Filter examinations (students only see 'published')
  const visibleExams = examinations.filter(e =>
    currentUser.role === 'student' ? e.status === 'published' : true
  );

  const filteredPyqs = questionPapers.filter(paper => {
    const matchesSearch =
      paper.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paper.subjectCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesYear = selectedYear === 'all' || paper.year.toString() === selectedYear;
    const matchesType = selectedType === 'all' || paper.examType === selectedType;
    return matchesSearch && matchesYear && matchesType;
  });

  const handleUploadPyq = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = SUBJECTS.find(s => s.id === uploadSubjectId);
    if (!sub) return;

    uploadQuestionPaper({
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      year: uploadYear,
      semester: uploadSemester,
      examType: uploadExamType,
      fileUrl: `/docs/pyq/${sub.code}_${uploadExamType}_${uploadYear}.pdf`,
      fileSize: '1.2 MB'
    });

    setShowUploadModal(false);
  };

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = SUBJECTS.find(s => s.id === examSubId);
    if (!sub) return;

    addExamination({
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      examDate,
      session: examSession,
      startTime: examSession === 'Morning' ? '09:30' : '14:00',
      endTime: examSession === 'Morning' ? '12:30' : '17:00',
      venue: examVenue,
      totalMarks: 100,
      type: examType,
      status: 'published'
    });

    setShowAddExamModal(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header and Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Examination Lifecycle & Archives
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Examinations & Past Question Papers (PYQ)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official university timetable countdowns, venue seating allocations, and digitized past question repositories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'schedule' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Exam Schedule
            </button>
            <button
              onClick={() => setActiveTab('pyq')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'pyq' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PYQ Question Archive
            </button>
          </div>

          {canManage && activeTab === 'schedule' && (
            <button
              onClick={() => setShowAddExamModal(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </button>
          )}

          {canManage && activeTab === 'pyq' && (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Upload PYQ</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Examination Lifecycle */}
      {activeTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Semester 4 Mid-Term Examinations (October 2026)
                </h2>
                <p className="text-xs text-slate-500">
                  Admit cards required. Please report 20 minutes prior to session start.
                </p>
              </div>
              <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Official Senate Confirmed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Subject Code</th>
                    <th className="py-3 px-4">Subject Title</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Session & Timing</th>
                    <th className="py-3 px-4">Venue</th>
                    <th className="py-3 px-4 text-right">Marks</th>
                    <th className="py-3 px-4 text-center">Countdown</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visibleExams.map(exam => {
                    const examDateObj = new Date(`${exam.examDate}T09:30:00`);
                    const diffDays = Math.ceil(
                      (examDateObj.getTime() - new Date('2026-09-30T07:55:00').getTime()) / (1000 * 60 * 60 * 24)
                    );

                    return (
                      <tr key={exam.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3.5 px-4 font-semibold text-indigo-700">
                          {exam.subjectCode}
                        </td>
                        <td className="py-3.5 px-4 font-medium text-slate-900">
                          {exam.subjectName}
                        </td>
                        <td className="py-3.5 px-4 tabular-nums font-medium">
                          {exam.examDate}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {exam.session} ({exam.startTime} - {exam.endTime})
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>{exam.venue}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right tabular-nums font-semibold">
                          {exam.totalMarks}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold tabular-nums ${
                            diffDays <= 12 ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {diffDays > 0 ? `${diffDays} days left` : 'Completed'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: PYQ Question Paper Archive */}
      {activeTab === 'pyq' && (
        <div className="space-y-6">
          
          {/* Search and Filters */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search subject title or code (e.g. CS201, OS)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedYear}
                onChange={e => setSelectedYear(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">All Academic Years</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
                <option value="2022">2022</option>
              </select>

              <select
                value={selectedType}
                onChange={e => setSelectedType(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">All Exam Types</option>
                <option value="Mid-Term">Mid-Term</option>
                <option value="End-Semester">End-Semester</option>
              </select>
            </div>
          </div>

          {/* Papers Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Subject</th>
                    <th className="py-3 px-4">Exam Type</th>
                    <th className="py-3 px-4">Year</th>
                    <th className="py-3 px-4">File Size</th>
                    <th className="py-3 px-4">Downloads</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPyqs.map(paper => (
                    <tr key={paper.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{paper.subjectCode}</div>
                        <div className="text-slate-500">{paper.subjectName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-medium">{paper.examType}</td>
                      <td className="py-3.5 px-4 tabular-nums">{paper.year}</td>
                      <td className="py-3.5 px-4 text-slate-500 tabular-nums">{paper.fileSize}</td>
                      <td className="py-3.5 px-4 tabular-nums text-slate-600">
                        {paper.downloadCount} downloads
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setPreviewPyq(paper)}
                            className="px-2.5 py-1 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded font-medium transition-colors flex items-center gap-1"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            onClick={() => downloadQuestionPaper(paper.id)}
                            className="px-2.5 py-1 text-indigo-700 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 rounded font-medium transition-colors flex items-center gap-1"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Download PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PYQ Preview Modal */}
      {previewPyq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {previewPyq.subjectCode} · {previewPyq.examType} ({previewPyq.year})
                </h3>
                <p className="text-xs text-slate-500">{previewPyq.subjectName}</p>
              </div>
              <button
                onClick={() => setPreviewPyq(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Verified University Exam Document */}
            <div className="mt-4 p-6 bg-slate-50 border border-slate-200 rounded-xl space-y-4 font-serif text-slate-800 text-xs">
              <div className="text-center space-y-1 border-b border-slate-300 pb-3 font-sans">
                <div className="font-bold text-sm tracking-wider uppercase text-slate-900">
                  CampusOne University Examination Board
                </div>
                <div className="text-xs font-medium">B.Tech 4th Semester Regular Examination · {previewPyq.year}</div>
                <div className="text-xs font-semibold">{previewPyq.subjectCode}: {previewPyq.subjectName}</div>
                <div className="text-[11px] text-slate-500">Time Allowed: 3 Hours · Maximum Marks: 100</div>
              </div>

              <div className="space-y-3 font-sans">
                <div className="font-bold text-xs uppercase tracking-wide text-slate-900">
                  Section A (Answer All Questions - 10 x 2 = 20 Marks)
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-slate-700 pl-1">
                  <li>Define asymptotic Big-Theta notation and state the Master Theorem recurrence conditions.</li>
                  <li>Compare preemptive shortest remaining time first (SRTF) scheduling with standard Round Robin.</li>
                  <li>State the difference between B-Trees and B+ Trees in disk-based relational storage engines.</li>
                  <li>Explain the role of the Transport Layer 3-way handshake in establishing a reliable TCP connection.</li>
                </ol>

                <div className="font-bold text-xs uppercase tracking-wide text-slate-900 pt-2">
                  Section B (Answer Any Four Questions - 4 x 20 = 80 Marks)
                </div>
                <div className="space-y-2 text-slate-700 pl-1">
                  <p><strong>Q5.</strong> (a) Construct an AVL Tree by inserting keys: [45, 12, 67, 89, 34, 23, 78]. Clearly show Single and Double rotations.</p>
                  <p><strong>Q6.</strong> (a) Describe Peterson algorithm for 2-process mutual exclusion. Prove that mutual exclusion, progress, and bounded waiting hold.</p>
                  <p><strong>Q7.</strong> (a) Given relational schema R(A, B, C, D, E) with functional dependencies: A &rarr; BC, CD &rarr; E, B &rarr; D, E &rarr; A. Determine candidate keys and normalize to BCNF.</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between pt-2">
              <span className="text-xs text-slate-500 tabular-nums">
                Verified university question repository item #{previewPyq.id}
              </span>
              <button
                onClick={() => {
                  downloadQuestionPaper(previewPyq.id);
                  setPreviewPyq(null);
                }}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save Offline PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload PYQ Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Upload Past Question Paper</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add verified previous semester question papers to the student repository.
            </p>

            <form onSubmit={handleUploadPyq} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={uploadSubjectId}
                  onChange={e => setUploadSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Exam Year</label>
                  <input
                    type="number"
                    min="2018"
                    max="2026"
                    value={uploadYear}
                    onChange={e => setUploadYear(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Exam Type</label>
                  <select
                    value={uploadExamType}
                    onChange={e => setUploadExamType(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Mid-Term">Mid-Term</option>
                    <option value="End-Semester">End-Semester</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Publish to Archive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Examination Modal */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Schedule Official Examination</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add exam date, session, and venue to the published academic lifecycle calendar.
            </p>

            <form onSubmit={handleAddExam} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={examSubId}
                  onChange={e => setExamSubId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={e => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Session</label>
                  <select
                    value={examSession}
                    onChange={e => setExamSession(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="Morning">Morning (09:30 - 12:30)</option>
                    <option value="Afternoon">Afternoon (14:00 - 17:00)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Venue / Examination Hall</label>
                <input
                  type="text"
                  value={examVenue}
                  onChange={e => setExamVenue(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Exam Type</label>
                <select
                  value={examType}
                  onChange={e => setExamType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="End-Semester">End-Semester</option>
                  <option value="Practical">Practical Examination</option>
                </select>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Confirm & Notify Students
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
