import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  BookOpen,
  CheckCircle,
  Circle,
  FileText,
  Download,
  ExternalLink,
  Layers,
  Award,
  Clock,
  Sparkles
} from 'lucide-react';
import { SUBJECTS } from '../data/mockData';

export const SyllabusModule: React.FC = () => {
  const {
    syllabus,
    completedTopicIds,
    toggleTopicCompletion,
    getSyllabusProgress
  } = useCampus();

  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(SUBJECTS[0].id);

  const selectedSubject = SUBJECTS.find(s => s.id === selectedSubjectId) || SUBJECTS[0];
  const units = syllabus.filter(u => u.subjectId === selectedSubjectId);

  const subjectProgress = getSyllabusProgress(selectedSubjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header and Subject Selectors */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Curriculum & Resources
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Syllabus Tracker & Learning Materials
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Unit-wise learning outcomes, self-paced topic tracking, and verified faculty lecture notes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/80 rounded-lg overflow-x-auto">
            {SUBJECTS.map(sub => {
              const isSelected = selectedSubjectId === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSubjectId(sub.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                    isSelected ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>{sub.code}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Subject Summary Card with Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                {selectedSubject.code}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {selectedSubject.credits} Credits · Semester {selectedSubject.semester}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-1">
              {selectedSubject.name}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Faculty In-Charge: <strong className="text-slate-700">{selectedSubject.facultyName}</strong>
            </p>
          </div>

          <div className="sm:text-right shrink-0">
            <div className="text-2xl font-bold tabular-nums text-slate-900">
              {subjectProgress}%
            </div>
            <div className="text-xs text-slate-500">Curriculum Completed</div>
          </div>
        </div>

        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${subjectProgress}%` }}
          />
        </div>
      </div>

      {/* Units List */}
      <div className="space-y-6">
        {units.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            No syllabus units mapped for {selectedSubject.code} yet.
          </div>
        ) : (
          units.map(unit => {
            const unitTopicIds = unit.topics.map(t => t.id);
            const unitCompletedCount = unitTopicIds.filter(id => completedTopicIds.includes(id)).length;
            const unitPercent = Math.round((unitCompletedCount / unit.topics.length) * 100);

            return (
              <div
                key={unit.id}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs"
              >
                {/* Unit Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Unit {unit.unitNumber}
                    </div>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">
                      {unit.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium tabular-nums text-slate-600">
                      {unitCompletedCount}/{unit.topics.length} topics ({unitPercent}%)
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-5">
                  {/* Learning Outcomes */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Specified Learning Outcomes</span>
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside pl-1">
                      {unit.learningOutcomes.map((outcome, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Topic Checklist */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Syllabus Topics & Self-Study Checkpoints</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {unit.topics.map(topic => {
                        const isDone = completedTopicIds.includes(topic.id);
                        return (
                          <button
                            key={topic.id}
                            onClick={() => toggleTopicCompletion(topic.id)}
                            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-2.5 ${
                              isDone
                                ? 'bg-emerald-50/60 border-emerald-200 text-slate-800'
                                : 'bg-slate-50/40 border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {isDone ? (
                              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            ) : (
                              <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                            )}
                            <div className="flex-1 min-w-0">
                              <div className={`text-xs font-medium leading-snug ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {topic.name}
                              </div>
                              <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                <span>~{topic.estimatedHours} study hours</span>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Attached Notes & Learning Resources */}
                  {unit.resources.length > 0 && (
                    <div className="pt-3 border-t border-slate-100">
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Faculty Attached Resources & Slides</span>
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unit.resources.map(res => (
                          <div
                            key={res.id}
                            className="p-2.5 rounded-lg border border-slate-200 bg-white flex items-center justify-between text-xs"
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <FileText className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                              <span className="font-medium text-slate-900 truncate">
                                {res.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-[10px] text-slate-400 tabular-nums">
                                {res.fileSize}
                              </span>
                              <a
                                href={res.fileUrl}
                                onClick={e => {
                                  e.preventDefault();
                                  alert(`Downloading faculty resource: ${res.title}`);
                                }}
                                className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                                title="Download file"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
