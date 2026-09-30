import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Library,
  Search,
  BookOpen,
  Bookmark,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  RotateCw,
  Plus,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { Book } from '../types';
import { USERS } from '../data/mockData';

export const LibraryModule: React.FC = () => {
  const {
    currentUser,
    books,
    circulations,
    reservations,
    reserveBook,
    cancelReservation,
    issueBook,
    returnBook,
    renewBook
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'catalogue' | 'my-books' | 'desk'>('catalogue');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Librarian Desk states
  const [issueBookId, setIssueBookId] = useState<string>(books[0]?.id || '');
  const [issueUserIdentifier, setIssueUserIdentifier] = useState<string>('CSE-2024-042');
  const [issueDays, setIssueDays] = useState<number>(14);

  const isLibrarianOrAdmin = currentUser.role === 'librarian' || currentUser.role === 'admin';

  const categories = ['all', 'Computer Science', 'Operating Systems', 'Database Systems', 'Networking', 'Mathematics'];

  const filteredBooks = books.filter(b => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.isbn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCat = selectedCategory === 'all' || b.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const myCirculations = circulations.filter(c => c.userId === currentUser.id);
  const myReservations = reservations.filter(r => r.userId === currentUser.id);

  const handleReserve = (bookId: string) => {
    const result = reserveBook(bookId);
    setFeedbackMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = issueBook(issueBookId, issueUserIdentifier, issueDays);
    setFeedbackMessage({
      text: result.message,
      type: result.success ? 'success' : 'error'
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleReturn = (circId: string) => {
    const res = returnBook(circId);
    setFeedbackMessage({ text: res.message, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleRenew = (circId: string) => {
    const res = renewBook(circId);
    setFeedbackMessage({ text: res.message, type: 'success' });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      
      {/* Header & Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
            Smart Library Hub
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            OPAC Public Catalogue & Circulation Desk
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time shelf inventory tracking, automated reservation queues, and institutional loan administration.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setActiveTab('catalogue')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'catalogue' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              OPAC Catalogue
            </button>
            <button
              onClick={() => setActiveTab('my-books')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'my-books' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              My Loans ({myCirculations.filter(c => c.status !== 'returned').length})
            </button>
            <button
              onClick={() => setActiveTab('desk')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'desk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Circulation Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedbackMessage && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center justify-between shadow-xs ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-slate-400 hover:text-slate-600 text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab 1: OPAC Catalogue */}
      {activeTab === 'catalogue' && (
        <div className="space-y-6">
          
          {/* Search Bar & Categories */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, author, ISBN (e.g. Tanenbaum, Cormen, CS201)..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'all' ? 'All Subjects' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Book Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBooks.map(book => {
              const hasActiveRes = reservations.some(
                r => r.bookId === book.id && r.userId === currentUser.id && (r.status === 'pending' || r.status === 'ready_for_pickup')
              );

              return (
                <div
                  key={book.id}
                  className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex gap-4">
                      {/* Book Cover Image */}
                      <div className="w-20 h-28 bg-slate-100 rounded-lg overflow-hidden shrink-0 border border-slate-200 shadow-2xs">
                        {book.coverImage ? (
                          <img
                            src={book.coverImage}
                            alt={book.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center text-slate-400 bg-gradient-to-br from-slate-100 to-slate-200">
                            <BookOpen className="w-6 h-6 mb-1 text-slate-500" />
                            <span className="text-[9px] font-semibold text-slate-600 leading-tight">
                              {book.category}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Book Meta */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          {book.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                          {book.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-1">
                          {book.author}
                        </p>
                        <p className="text-[11px] text-slate-400">
                          {book.publisher} ({book.year})
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {book.summary}
                    </p>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div>
                        <div className="text-[11px] text-slate-400">Shelf Location</div>
                        <div className="font-medium text-slate-800">{book.shelfLocation}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[11px] text-slate-400">Availability</div>
                        <div className="font-semibold tabular-nums">
                          {book.availableCopies > 0 ? (
                            <span className="text-emerald-700 font-bold">
                              {book.availableCopies} of {book.totalCopies} available
                            </span>
                          ) : (
                            <span className="text-rose-600 font-medium">0 copies (All on loan)</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      ISBN: {book.isbn.substring(0, 13)}...
                    </span>

                    {hasActiveRes ? (
                      <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Reserved by You</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleReserve(book.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                          book.availableCopies > 0
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        <span>{book.availableCopies > 0 ? 'Reserve for Pickup' : 'Join Hold Queue'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: My Loans & Reservations */}
      {activeTab === 'my-books' && (
        <div className="space-y-6">
          
          {/* Active Loans */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Currently Issued Volumes ({myCirculations.filter(c => c.status !== 'returned').length})
                </h2>
                <p className="text-xs text-slate-500">
                  Standard undergraduate loan duration: 14 days per volume.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Book Title</th>
                    <th className="py-3 px-4">Issue Date</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Accrued Fine</th>
                    <th className="py-3 px-4 text-right">Self Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {myCirculations.map(circ => (
                    <tr key={circ.id} className="hover:bg-slate-50/50">
                      <td className="py-3.5 px-4 font-semibold text-slate-900">
                        {circ.bookTitle}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums">{circ.issueDate}</td>
                      <td className="py-3.5 px-4 tabular-nums font-medium">{circ.dueDate}</td>
                      <td className="py-3.5 px-4">
                        {circ.status === 'overdue' ? (
                          <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded font-semibold text-[11px]">
                            Overdue
                          </span>
                        ) : circ.status === 'returned' ? (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px]">
                            Returned
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-medium text-[11px]">
                            Active Loan
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 tabular-nums font-semibold">
                        {circ.fineAmount > 0 ? (
                          <span className="text-rose-600">${circ.fineAmount.toFixed(2)}</span>
                        ) : (
                          <span className="text-slate-400">$0.00</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {circ.status !== 'returned' && (
                          <button
                            onClick={() => handleRenew(circ.id)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-medium transition-colors inline-flex items-center gap-1"
                          >
                            <RotateCw className="w-3 h-3" />
                            <span>Renew +14d</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Reservations */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">
                Hold Queue & Pickup Reservations ({myReservations.length})
              </h2>
              <p className="text-xs text-slate-500">
                Volumes marked "Ready for Pickup" are held at counter for 48 hours.
              </p>
            </div>

            {myReservations.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400">
                No active hold requests.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 text-xs">
                {myReservations.map(res => (
                  <div
                    key={res.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{res.bookTitle}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Reserved on {res.reservationDate} · Hold expires {res.expiryDate}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        res.status === 'ready_for_pickup'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {res.status === 'ready_for_pickup' ? 'Ready at Desk' : `Queue Position #${res.queuePosition}`}
                      </span>
                      <button
                        onClick={() => cancelReservation(res.id)}
                        className="text-xs text-rose-600 hover:underline"
                      >
                        Cancel Hold
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      )}

      {/* Tab 3: Restricted Circulation Desk (Librarian / Admin) */}
      {activeTab === 'desk' && (
        <div className="space-y-6">
          
          {/* Permission warning if student */}
          {!isLibrarianOrAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-amber-950">Role Authorization Notice:</span>
                <p className="mt-0.5">
                  You are currently browsing as <strong>{currentUser.name} ({currentUser.role.toUpperCase()})</strong>.
                  In production, only accounts with the <strong>LIBRARIAN</strong> or <strong>ADMINISTRATOR</strong> role can execute book issue, return, and inventory reconciliation.
                  You can switch to <strong>Mr. Robert Vance (Librarian)</strong> via the top role switcher to test full issue/return privileges.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Issue Book Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Issue Book to Member</span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Librarian counter checkout tool. Automatically updates live shelf availability.
              </p>

              <form onSubmit={handleIssueSubmit} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Book</label>
                  <select
                    value={issueBookId}
                    onChange={e => setIssueBookId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    {books.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.title} ({b.availableCopies} avail / {b.shelfLocation})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Student / Staff Roll ID</label>
                  <input
                    type="text"
                    value={issueUserIdentifier}
                    onChange={e => setIssueUserIdentifier(e.target.value)}
                    placeholder="e.g. CSE-2024-042 or Alex Chen"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Loan Period (Days)</label>
                  <select
                    value={issueDays}
                    onChange={e => setIssueDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  >
                    <option value={7}>7 Days (Reserve Collection)</option>
                    <option value={14}>14 Days (Standard Undergraduate)</option>
                    <option value={30}>30 Days (Faculty Special)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={!isLibrarianOrAdmin}
                  className={`w-full py-2.5 rounded-lg text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5 ${
                    isLibrarianOrAdmin
                      ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Execute Book Issue</span>
                </button>
              </form>
            </div>

            {/* Master Circulations Table (All records) */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Master Circulation Ledger
                  </h2>
                  <p className="text-xs text-slate-500">
                    Real-time checkout records and return check-in processing.
                  </p>
                </div>
                <span className="text-xs text-slate-500 tabular-nums">
                  {circulations.filter(c => c.status !== 'returned').length} active loans
                </span>
              </div>

              <div className="overflow-x-auto max-h-[380px]">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="py-2.5 px-3">Borrower</th>
                      <th className="py-2.5 px-3">Title</th>
                      <th className="py-2.5 px-3">Due Date</th>
                      <th className="py-2.5 px-3">Status</th>
                      <th className="py-2.5 px-3 text-right">Librarian Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {circulations.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/50">
                        <td className="py-3 px-3">
                          <div className="font-semibold text-slate-900">{c.userName}</div>
                          <div className="text-[10px] text-slate-400 capitalize">{c.userRole}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-800 line-clamp-1 max-w-[180px]">
                          {c.bookTitle}
                        </td>
                        <td className="py-3 px-3 tabular-nums">{c.dueDate}</td>
                        <td className="py-3 px-3">
                          {c.status === 'overdue' ? (
                            <span className="text-rose-600 font-bold">Overdue (${c.fineAmount})</span>
                          ) : c.status === 'returned' ? (
                            <span className="text-slate-400">Returned</span>
                          ) : (
                            <span className="text-emerald-700 font-medium">On Loan</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          {c.status !== 'returned' && (
                            <button
                              onClick={() => handleReturn(c.id)}
                              disabled={!isLibrarianOrAdmin}
                              className={`px-2.5 py-1 rounded text-xs font-semibold transition-colors ${
                                isLibrarianOrAdmin
                                  ? 'bg-slate-900 hover:bg-slate-800 text-white'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Check In (Return)
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
