import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Building,
  User,
  Filter,
  Download
} from 'lucide-react';
import { CLASSROOMS, SUBJECTS, USERS } from '../data/mockData';

export const TimetableModule: React.FC = () => {
  const {
    currentUser,
    timetables,
    addTimetableEntry,
    deleteTimetableEntry,
    timetableConflicts
  } = useCampus();

  const [selectedDay, setSelectedDay] = useState<string>('Monday');
  const [viewMode, setViewMode] = useState<'day' | 'week'>('day');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState<'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Monday');
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('10:00');
  const [subjectId, setSubjectId] = useState<string>(SUBJECTS[0].id);
  const [facultyId, setFacultyId] = useState<string>(USERS[1].id);
  const [classroomId, setClassroomId] = useState<string>(CLASSROOMS[0].id);
  const [section, setSection] = useState<string>('A');

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];

  const canManage = currentUser.role === 'faculty' || currentUser.role === 'hod' || currentUser.role === 'admin';

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (startTime >= endTime) {
      setFormError('Class end time must be after start time.');
      return;
    }

    const sub = SUBJECTS.find(s => s.id === subjectId);
    const fac = USERS.find(u => u.id === facultyId);
    const cr = CLASSROOMS.find(c => c.id === classroomId);

    if (!sub || !fac || !cr) {
      setFormError('Please select valid subject, faculty, and classroom records.');
      return;
    }

    const success = addTimetableEntry({
      dayOfWeek,
      startTime,
      endTime,
      subjectId: sub.id,
      subjectCode: sub.code,
      subjectName: sub.name,
      facultyId: fac.id,
      facultyName: fac.name,
      classroomId: cr.id,
      classroomName: `${cr.roomNumber} (${cr.building})`,
      department: 'CSE',
      semester: 4,
      section
    });

    if (!success) {
      // It adds with conflict warning
    }

    setShowAddModal(false);
  };

  const filteredTimetables = timetables
    .filter(t => (viewMode === 'day' ? t.dayOfWeek === selectedDay : true))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Academic Hub
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Dynamic Timetable & Schedule Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time conflict detection engine across classrooms, faculty schedules, and student sections.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Day / Week segmented control */}
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'day' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Daily View
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                viewMode === 'week' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Week
            </button>
          </div>

          {canManage && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Class Slot</span>
            </button>
          )}
        </div>
      </div>

      {/* Conflict Alert Banner if conflicts detected */}
      {timetableConflicts.length > 0 ? (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold text-amber-950">
                Timetable Overlap Conflict Detected ({timetableConflicts.length})
              </span>
              <ul className="list-disc list-inside space-y-0.5 text-amber-800">
                {timetableConflicts.map((c, i) => (
                  <li key={i}>{c.description}</li>
                ))}
              </ul>
              <span className="text-[11px] text-amber-700 block mt-1">
                Authorized faculty or administrators should reassign classroom or time slots to avoid overlapping schedules.
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>No timetable conflicts detected. Classrooms and faculty assignments are verified consistent.</span>
        </div>
      )}

      {/* Day Selector Tabs (if daily view) */}
      {viewMode === 'day' && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {days.map(d => {
            const count = timetables.filter(t => t.dayOfWeek === d).length;
            const isSelected = selectedDay === d;
            return (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-4 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-2 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <span>{d}</span>
                <span className={`text-[11px] tabular-nums px-1.5 py-0.2 rounded ${
                  isSelected ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Timetable List Grid */}
      {viewMode === 'day' ? (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              {selectedDay} Lecture Schedule · CSE Semester 4 (Section A)
            </h2>
            <span className="text-xs text-slate-500 tabular-nums">
              {filteredTimetables.length} periods scheduled
            </span>
          </div>

          {filteredTimetables.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No lecture sessions scheduled for {selectedDay}.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTimetables.map(slot => (
                <div
                  key={slot.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Time pill */}
                    <div className="w-24 shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-2 text-center">
                      <div className="text-xs font-bold tabular-nums text-slate-900">
                        {slot.startTime}
                      </div>
                      <div className="text-[10px] text-slate-400 tabular-nums">
                        to {slot.endTime}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {slot.subjectCode}
                        </span>
                        <h3 className="text-sm font-semibold text-slate-900">
                          {slot.subjectName}
                        </h3>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.facultyName}</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{slot.classroomName}</span>
                        </span>
                        <span>Sec: {slot.section}</span>
                      </div>
                    </div>
                  </div>

                  {canManage && (
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <button
                        onClick={() => deleteTimetableEntry(slot.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md hover:bg-rose-50 transition-colors"
                        title="Delete slot"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Full Week Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {days.map(d => {
            const daySlots = timetables
              .filter(t => t.dayOfWeek === d)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div key={d} className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                    {d}
                  </h3>
                  <span className="text-[11px] text-slate-400 tabular-nums">
                    {daySlots.length} classes
                  </span>
                </div>

                {daySlots.length === 0 ? (
                  <div className="text-xs text-slate-400 py-4 text-center">No classes</div>
                ) : (
                  <div className="space-y-2">
                    {daySlots.map(s => (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/70 text-xs space-y-1 hover:border-slate-200 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-700">{s.subjectCode}</span>
                          <span className="text-[11px] tabular-nums text-slate-500">
                            {s.startTime} - {s.endTime}
                          </span>
                        </div>
                        <div className="font-medium text-slate-900 line-clamp-1">{s.subjectName}</div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">
                          {s.classroomName} · {s.facultyName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">
              Add New Timetable Slot
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add a lecture or laboratory session. The conflict engine will automatically verify room & faculty availability.
            </p>

            {formError && (
              <div className="mt-3 p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Day of Week</label>
                <select
                  value={dayOfWeek}
                  onChange={e => setDayOfWeek(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {days.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Subject</label>
                <select
                  value={subjectId}
                  onChange={e => setSubjectId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Assigned Faculty</label>
                <select
                  value={facultyId}
                  onChange={e => setFacultyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {USERS.filter(u => u.role === 'faculty' || u.role === 'hod').map(f => (
                    <option key={f.id} value={f.id}>{f.name} ({f.role.toUpperCase()})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Classroom</label>
                  <select
                    value={classroomId}
                    onChange={e => setClassroomId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {CLASSROOMS.map(c => (
                      <option key={c.id} value={c.id}>{c.roomNumber} ({c.building})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Section</label>
                  <input
                    type="text"
                    value={section}
                    onChange={e => setSection(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium shadow-xs transition-colors"
                >
                  Save Class Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
