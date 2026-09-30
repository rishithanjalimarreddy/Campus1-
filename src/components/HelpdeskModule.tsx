import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  LifeBuoy,
  Plus,
  Search,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Filter,
  Send,
  User,
  Shield,
  ArrowRight,
  X,
  UserCheck,
  CheckCircle,
  AlertTriangle,
  History,
  Tag,
  Check
} from 'lucide-react';
import { HelpdeskTicket, UserRole } from '../types';

export const HelpdeskModule: React.FC = () => {
  const {
    currentUser,
    users,
    helpdeskTickets,
    createHelpdeskTicket,
    addTicketMessage,
    updateTicketStatus,
    switchUserRole
  } = useCampus();

  const isStaff = currentUser.role !== 'student';

  // Visible tickets for current user
  const userFilteredTickets = helpdeskTickets.filter(t =>
    isStaff ? true : t.studentId === currentUser.id
  );

  const [activeTicketId, setActiveTicketId] = useState<string | null>(
    userFilteredTickets[0]?.id || null
  );
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);

  // New ticket form
  const [newCategory, setNewCategory] = useState<HelpdeskTicket['category']>('Fee & Billing');
  const [newSubject, setNewSubject] = useState<string>('');
  const [newDescription, setNewDescription] = useState<string>('');
  const [newPriority, setNewPriority] = useState<HelpdeskTicket['priority']>('medium');

  // Reply form
  const [replyContent, setReplyContent] = useState<string>('');

  // Staff Management State
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [selectedNewStatus, setSelectedNewStatus] = useState<HelpdeskTicket['status']>('in_progress');
  const [resolutionInput, setResolutionInput] = useState<string>('');
  const [showResolveModal, setShowResolveModal] = useState<boolean>(false);
  const [actionSuccessNotice, setActionSuccessNotice] = useState<string>('');

  const categories: ('all' | HelpdeskTicket['category'])[] = [
    'all',
    'Fee & Billing',
    'Examination & Admit Card',
    'Library & Fines',
    'Timetable & Course Conflict',
    'Technical Support',
    'General Inquiry'
  ];

  const statuses: ('all' | HelpdeskTicket['status'])[] = [
    'all',
    'open',
    'in_progress',
    'waiting_for_student',
    'resolved',
    'closed'
  ];

  const staffMembers = users.filter(u => u.role !== 'student');

  const visibleTickets = userFilteredTickets.filter(t => {
    const matchesSearch =
      t.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || t.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;

    return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
  });

  const activeTicket = helpdeskTickets.find(t => t.id === activeTicketId);

  // Safety check: if activeTicket does not belong to student, reset
  const isAuthorizedToViewActive = isStaff || (activeTicket && activeTicket.studentId === currentUser.id);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    const created = createHelpdeskTicket(newCategory, newSubject, newDescription, newPriority);
    setActiveTicketId(created.id);
    setNewSubject('');
    setNewDescription('');
    setShowCreateModal(false);
    setActionSuccessNotice(`Ticket #${created.ticketNumber} opened successfully.`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId || !replyContent.trim()) return;

    addTicketMessage(activeTicketId, replyContent);
    setReplyContent('');
    setActionSuccessNotice('Reply posted successfully.');
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const handleAssignStaff = (staffUserId: string) => {
    if (!activeTicketId || !staffUserId) return;
    const staff = users.find(u => u.id === staffUserId);
    if (!staff) return;

    updateTicketStatus(activeTicketId, activeTicket?.status || 'in_progress', staff.id, staff.name);
    setActionSuccessNotice(`Assigned ticket to ${staff.name} (${staff.role.toUpperCase()}).`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const handleStatusChange = (status: HelpdeskTicket['status']) => {
    if (!activeTicketId) return;
    if (status === 'resolved' || status === 'closed') {
      setSelectedNewStatus(status);
      setShowResolveModal(true);
      return;
    }

    updateTicketStatus(activeTicketId, status);
    setActionSuccessNotice(`Status changed to ${status.toUpperCase().replace(/_/g, ' ')}.`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const handleConfirmResolution = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicketId) return;

    updateTicketStatus(
      activeTicketId,
      selectedNewStatus,
      undefined,
      undefined,
      resolutionInput || 'Issue resolved per institutional support guidelines.'
    );

    setShowResolveModal(false);
    setResolutionInput('');
    setActionSuccessNotice(`Ticket marked as ${selectedNewStatus.toUpperCase()}. Resolution notes attached.`);
    setTimeout(() => setActionSuccessNotice(''), 4000);
  };

  const getStatusBadge = (status: HelpdeskTicket['status']) => {
    switch (status) {
      case 'open':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">OPEN</span>;
      case 'in_progress':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">IN PROGRESS</span>;
      case 'waiting_for_student':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">WAITING FOR STUDENT</span>;
      case 'resolved':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">RESOLVED</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">CLOSED</span>;
    }
  };

  const getPriorityBadge = (priority: HelpdeskTicket['priority']) => {
    switch (priority) {
      case 'urgent':
        return <span className="px-1.5 py-0.5 text-[9px] font-bold bg-rose-100 text-rose-800 rounded">URGENT</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 text-[9px] font-bold bg-amber-100 text-amber-800 rounded">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-700 rounded">MED</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 text-slate-500 rounded">LOW</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
              Student Grievances & Academic Helpdesk
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
              {isStaff ? 'STAFF & RESOLUTION DESK' : 'STUDENT DESK'}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Student Helpdesk & Issue Resolution Center
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Submit service requests for fee adjustments, timetable overlaps, library fine disputes, examination queries, and technical support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!isStaff && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Open New Support Ticket</span>
            </button>
          )}

          {isStaff && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500">Logged in as {currentUser.role.toUpperCase()}:</span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-3.5 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Student Ticket</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Action Notice */}
      {actionSuccessNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccessNotice}</span>
        </div>
      )}

      {/* Main 2-Column Interface: Ticket List (5 cols) + Conversation & Timeline (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        
        {/* Left Column: Tickets List */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          
          {/* Search & Multi-Filters */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 space-y-2.5">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket #, subject, student..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs truncate"
              >
                <option value="all">All Categories</option>
                {categories.filter(c => c !== 'all').map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_progress">In Progress</option>
                <option value="waiting_for_student">Waiting for Student</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
              <span>Showing {visibleTickets.length} {isStaff ? 'total institutional tickets' : 'of your tickets'}</span>
              {!isStaff && (
                <span className="text-[10px] text-indigo-600 font-medium">Privacy Protected (Own Records Only)</span>
              )}
            </div>
          </div>

          {/* Ticket Scroll List */}
          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto max-h-[550px]">
            {visibleTickets.length === 0 ? (
              <div className="p-10 text-center text-xs text-slate-500">
                <LifeBuoy className="w-7 h-7 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Support Tickets Found</p>
                <p className="mt-1 text-slate-400">Try clearing active search or category filters.</p>
              </div>
            ) : (
              visibleTickets.map(t => {
                const isSelected = t.id === activeTicketId;
                return (
                  <button
                    key={t.id}
                    onClick={() => setActiveTicketId(t.id)}
                    className={`w-full p-4 text-left transition-colors flex flex-col gap-1.5 ${
                      isSelected
                        ? 'bg-indigo-50/70 border-l-4 border-indigo-600'
                        : 'hover:bg-slate-50 border-l-4 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800">
                        {t.ticketNumber}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(t.priority)}
                        {getStatusBadge(t.status)}
                      </div>
                    </div>

                    <div className="font-medium text-xs text-slate-900 line-clamp-1">
                      {t.subject}
                    </div>

                    <div className="text-[11px] text-slate-500 line-clamp-2">
                      {t.description}
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 mt-0.5 border-t border-slate-100">
                      <span className="font-medium text-slate-600 truncate max-w-[150px]">
                        {t.studentName} ({t.studentRoll})
                      </span>
                      <span>{t.createdAt.split(' ')[0]}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Ticket Conversation Thread & Status Management */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col">
          {activeTicket && isAuthorizedToViewActive ? (
            <div className="flex flex-col h-full">
              
              {/* Ticket Top Header & Actions */}
              <div className="p-5 border-b border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-indigo-700">
                      {activeTicket.ticketNumber}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-medium">
                      {activeTicket.category}
                    </span>
                    {getStatusBadge(activeTicket.status)}
                    {getPriorityBadge(activeTicket.priority)}
                  </div>
                  
                  <div className="text-[11px] text-slate-400">
                    Created: {activeTicket.createdAt}
                  </div>
                </div>

                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {activeTicket.subject}
                  </h2>
                  <div className="text-xs text-slate-600 mt-0.5">
                    Submitted by: <strong className="text-slate-800">{activeTicket.studentName}</strong> ({activeTicket.studentRoll})
                    {activeTicket.assignedToName && (
                      <span className="ml-2 font-medium text-indigo-700">
                        · Assigned to: {activeTicket.assignedToName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Staff Resolution & Status Controls */}
                {isStaff && (
                  <div className="pt-3 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Assign Staff:</span>
                      <select
                        value={activeTicket.assignedTo || ''}
                        onChange={e => handleAssignStaff(e.target.value)}
                        className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                      >
                        <option value="">-- Assign staff member --</option>
                        {staffMembers.map(s => (
                          <option key={s.id} value={s.id}>
                            {s.name} ({s.role.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Update Status:</span>
                      <select
                        value={activeTicket.status}
                        onChange={e => handleStatusChange(e.target.value as any)}
                        className="px-2.5 py-1 border border-slate-300 rounded-lg text-xs bg-white font-medium"
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="waiting_for_student">Waiting for Student</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>
                )}

                {/* Student Close Ticket Action */}
                {!isStaff && activeTicket.status !== 'closed' && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-end">
                    <button
                      onClick={() => handleStatusChange('closed')}
                      className="text-xs text-slate-600 hover:text-slate-900 font-medium underline"
                    >
                      Close this ticket (Resolved on my end)
                    </button>
                  </div>
                )}
              </div>

              {/* Verified Resolution Notes Banner */}
              {activeTicket.resolutionNotes && (
                <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Official Institutional Resolution Notes:</div>
                    <div className="mt-0.5 text-emerald-800">{activeTicket.resolutionNotes}</div>
                  </div>
                </div>
              )}

              {/* Chronological Ticket Timeline */}
              <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500">
                <div className="flex items-center gap-1 shrink-0 font-medium text-slate-800">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  <span>Timeline:</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-slate-700">1. Opened</span>
                  <span className="text-slate-300">→</span>
                  <span className={`font-semibold ${activeTicket.assignedToName ? 'text-slate-700' : 'text-slate-400'}`}>
                    2. Assigned {activeTicket.assignedToName ? `(${activeTicket.assignedToName})` : ''}
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={`font-semibold ${activeTicket.status !== 'open' ? 'text-indigo-600' : 'text-slate-400'}`}>
                    3. Under Review
                  </span>
                  <span className="text-slate-300">→</span>
                  <span className={`font-semibold ${activeTicket.status === 'resolved' || activeTicket.status === 'closed' ? 'text-emerald-600' : 'text-slate-400'}`}>
                    4. {activeTicket.status === 'resolved' ? 'Resolved' : activeTicket.status === 'closed' ? 'Closed' : 'Settlement'}
                  </span>
                </div>
              </div>

              {/* Message Timeline */}
              <div className="flex-1 p-5 space-y-4 overflow-y-auto max-h-[380px]">
                {activeTicket.messages.map((m, idx) => {
                  const isCurrentAuthor = m.senderId === currentUser.id;
                  const isSenderStaff = m.senderRole !== 'student';
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex flex-col ${isCurrentAuthor ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-700">
                          {m.senderName}
                        </span>
                        <span className={`px-1.5 py-0.2 rounded uppercase text-[9px] font-bold ${
                          isSenderStaff ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.senderRole}
                        </span>
                        <span>{m.createdAt}</span>
                      </div>

                      <div
                        className={`p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                          isCurrentAuthor
                            ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                            : isSenderStaff
                            ? 'bg-slate-100 text-slate-900 border border-slate-200 rounded-bl-xs'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs shadow-xs'
                        }`}
                      >
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Reply Form */}
              <div className="p-4 border-t border-slate-200 bg-white">
                <form onSubmit={handleReplySubmit} className="flex gap-2">
                  <input
                    type="text"
                    placeholder={
                      isStaff
                        ? `Respond to student ${activeTicket.studentName}...`
                        : 'Type your message or response to staff...'
                    }
                    value={replyContent}
                    onChange={e => setReplyContent(e.target.value)}
                    className="flex-1 px-3.5 py-2 border border-slate-300 rounded-lg text-xs focus:outline-hidden focus:border-indigo-600"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reply</span>
                  </button>
                </form>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-xs text-slate-500">
              <LifeBuoy className="w-10 h-10 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">Select a support ticket</p>
              <p className="mt-1 max-w-xs text-slate-400">
                Choose a ticket from the left column to view message updates, staff assignments, and resolution notes.
              </p>
            </div>
          )}
        </div>

      </div>

      {/* CREATE TICKET MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Open Institutional Support Ticket
                </h3>
                <p className="text-slate-500 text-xs">
                  Logged by: {currentUser.name} ({currentUser.identifier})
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Issue Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  >
                    <option value="Fee & Billing">Fee & Billing</option>
                    <option value="Examination & Admit Card">Examination & Admit Card</option>
                    <option value="Library & Fines">Library & Fines</option>
                    <option value="Timetable & Course Conflict">Timetable & Course Conflict</option>
                    <option value="Technical Support">Technical Support</option>
                    <option value="General Inquiry">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Urgency Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Ticket Subject / Summary
                </label>
                <input
                  type="text"
                  placeholder="e.g. Request fee extension for 4th Sem Installment 2"
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Detailed Issue Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Provide complete details including course code, date, payment transaction number, or library book barcode..."
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESOLUTION NOTES MODAL */}
      {showResolveModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-xs text-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Resolution & Closure Notes
              </h3>
              <button
                onClick={() => setShowResolveModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmResolution} className="mt-4 space-y-4">
              <p className="text-xs text-slate-500">
                You are marking ticket <strong>{activeTicket?.ticketNumber}</strong> as <strong>{selectedNewStatus.toUpperCase()}</strong>. Please enter the formal resolution explanation for student records.
              </p>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Formal Resolution Notes
                </label>
                <textarea
                  rows={3}
                  value={resolutionInput}
                  onChange={e => setResolutionInput(e.target.value)}
                  placeholder="e.g. Schedule conflict corrected in Master Timetable; Lab session split into Batch A1 and Batch A2."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowResolveModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Resolution</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
