import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  BookOpen,
  GraduationCap,
  Library,
  Sliders,
  AlertCircle
} from 'lucide-react';
import { SUBJECTS } from '../data/mockData';

export const AcademicPlanner: React.FC = () => {
  const {
    plannerTasks,
    generateRevisionPlan,
    togglePlannerTask,
    addPlannerTask,
    syllabus,
    completedTopicIds,
    examinations,
    circulations
  } = useCampus();

  const [dailyHours, setDailyHours] = useState<number>(3);
  const [showAddTask, setShowAddTask] = useState<boolean>(false);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customSubjectCode, setCustomSubjectCode] = useState<string>('CS201');
  const [customDueDate, setCustomDueDate] = useState<string>('2026-10-08');
  const [customHours, setCustomHours] = useState<number>(2);

  // Incomplete topics count
  let incompleteCount = 0;
  syllabus.forEach(u => {
    u.topics.forEach(t => {
      if (!completedTopicIds.includes(t.id)) incompleteCount++;
    });
  });

  const completedTasks = plannerTasks.filter(t => t.completed).length;
  const totalTasks = plannerTasks.length;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const handleCreateCustomTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim()) return;

    const sub = SUBJECTS.find(s => s.code === customSubjectCode);
    addPlannerTask({
      subjectCode: customSubjectCode,
      subjectName: sub ? sub.name : customSubjectCode,
      title: customTitle,
      dueDate: customDueDate,
      estimatedHours: customHours,
      completed: false,
      generatedFrom: 'manual'
    });

    setCustomTitle('');
    setShowAddTask(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header and Generator Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Personalized Student Experience
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Intelligent Academic & Revision Planner
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-synthesize a realistic revision schedule combining incomplete syllabus units, exam countdowns, and library book return checkpoints.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddTask(true)}
            className="px-3.5 py-1.5 text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Study Goal</span>
          </button>
        </div>
      </div>

      {/* Synthesis Configuration Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-600" />
              <span>Revision Timetable Generator Engine</span>
            </h2>
            <p className="text-xs text-slate-500">
              Algorithm scans {incompleteCount} pending syllabus topics across 5 enrolled courses and spaces them before your first exam on Oct 12.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-600 font-medium">Daily Study Capacity:</span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                {[2, 3, 4, 5].map(hrs => (
                  <button
                    key={hrs}
                    onClick={() => setDailyHours(hrs)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                      dailyHours === hrs
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {hrs}h/day
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => generateRevisionPlan(dailyHours)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Revision Schedule</span>
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Plan Progress: <strong className="text-slate-900 tabular-nums">{completedTasks} of {totalTasks} milestones completed</strong> ({completionPercent}%)
            </span>
          </div>

          <div className="w-full sm:w-64 bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Scheduled Study Milestones & Deadlines
          </h2>
          <span className="text-xs text-slate-400 tabular-nums">
            Ordered chronologically
          </span>
        </div>

        {plannerTasks.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <div>No revision plan currently generated.</div>
            <button
              onClick={() => generateRevisionPlan(dailyHours)}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Click here to auto-generate a schedule based on your syllabus
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {plannerTasks.map(task => {
              const isExam = task.generatedFrom === 'exam';
              const isLib = task.generatedFrom === 'library_due';

              return (
                <div
                  key={task.id}
                  className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                    task.completed ? 'bg-slate-50/70' : 'hover:bg-slate-50/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => togglePlannerTask(task.id)}
                      className="mt-0.5 text-slate-400 hover:text-indigo-600 shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          isExam
                            ? 'bg-amber-100 text-amber-900'
                            : isLib
                            ? 'bg-rose-100 text-rose-900'
                            : 'bg-indigo-50 text-indigo-700'
                        }`}>
                          {isExam ? 'Exam Milestone' : isLib ? 'Library Due Date' : task.subjectCode}
                        </span>

                        <h3 className={`text-xs font-semibold ${
                          task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                        }`}>
                          {task.title}
                        </h3>
                      </div>

                      <div className="text-[11px] text-slate-500 flex items-center gap-3">
                        <span>{task.subjectName}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{task.estimatedHours} hrs allocated</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="sm:text-right shrink-0 pl-8 sm:pl-0">
                    <div className="text-xs font-medium tabular-nums text-slate-700">
                      Target: {task.dueDate}
                    </div>
                    <div className="text-[10px] text-slate-400 capitalize">
                      {task.generatedFrom} trigger
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Custom Goal Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Add Custom Study Goal</h2>
            <p className="text-xs text-slate-500 mt-1">
              Add a personal study topic, project milestone, or mock exam practice.
            </p>

            <form onSubmit={handleCreateCustomTask} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Goal Description</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder="e.g. Solve 2024 End-Sem Question Paper Section B"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Associated Subject</label>
                <select
                  value={customSubjectCode}
                  onChange={e => setCustomSubjectCode(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {SUBJECTS.map(s => (
                    <option key={s.id} value={s.code}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Target Date</label>
                  <input
                    type="date"
                    value={customDueDate}
                    onChange={e => setCustomDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Estimated Hours</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={customHours}
                    onChange={e => setCustomHours(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTask(false)}
                  className="px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium"
                >
                  Save Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
