import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Lock,
  Mail,
  Shield,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  GraduationCap,
  Users,
  X,
  CreditCard
} from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { users, login, requestPasswordReset } = useCampus();

  const [email, setEmail] = useState<string>('alex.chen@campus.edu');
  const [password, setPassword] = useState<string>('Student123!');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Password Reset Modal state
  const [showForgotModal, setShowForgotModal] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('alex.chen@campus.edu');
  const [resetFeedback, setResetFeedback] = useState<string>('');

  const [accountTypeTab, setAccountTypeTab] = useState<'staff' | 'students'>('staff');

  const staffAccounts = [
    { role: 'accounts_officer' as UserRole, name: 'David Sterling [DEMO]', email: 'david.sterling@campus.edu', pw: 'Accounts123!', label: 'Accounts Officer (Finance & Bursar)' },
    { role: 'admin' as UserRole, name: 'Dean Eleanor Vance [DEMO]', email: 'dean.academics@campus.edu', pw: 'Admin123!', label: 'Dean / Administrator' },
    { role: 'faculty' as UserRole, name: 'Dr. Sarah Jenkins [DEMO]', email: 'sarah.jenkins@campus.edu', pw: 'Faculty123!', label: 'Faculty (Assoc. Prof, CSE)' },
    { role: 'librarian' as UserRole, name: 'Robert Vance [DEMO]', email: 'robert.vance@campus.edu', pw: 'Library123!', label: 'Head Librarian (OPAC & Desk)' },
    { role: 'hod' as UserRole, name: 'Prof. Michael Rao [DEMO]', email: 'michael.rao@campus.edu', pw: 'Hod123!', label: 'Head of Dept (Computer Science)' }
  ];

  const studentAccounts = [
    { role: 'student' as UserRole, name: 'Alex Chen [DEMO]', email: 'alex.chen@campus.edu', pw: 'Student123!', label: 'CSE · Sem 4 (Partial Fee Paid)' },
    { role: 'student' as UserRole, name: 'Priya Sharma [DEMO]', email: 'priya.sharma@campus.edu', pw: 'Student123!', label: 'CSE · Sem 6 (Fee Overdue)' },
    { role: 'student' as UserRole, name: 'Marcus Wright [DEMO]', email: 'marcus.wright@campus.edu', pw: 'Student123!', label: 'ECE · Sem 4 (Full Paid / Fellowship)' },
    { role: 'student' as UserRole, name: 'Rohan Verma [DEMO]', email: 'rohan.verma@campus.edu', pw: 'Student123!', label: 'EEE · Sem 4 (Partial Paid)' },
    { role: 'student' as UserRole, name: 'Liam Davies [DEMO]', email: 'liam.davies@campus.edu', pw: 'Student123!', label: 'IT · Sem 4 (Partial Paid)' },
    { role: 'student' as UserRole, name: 'Jin Woo Park [DEMO]', email: 'jinwoo.park@campus.edu', pw: 'Student123!', label: 'Mechanical · Sem 4 (Pending)' }
  ];

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message);
      } else {
        setSuccessMessage(`Authentication confirmed. Opening ${res.user?.role.toUpperCase()} portal...`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (accEmail: string, accPw: string) => {
    setEmail(accEmail);
    setPassword(accPw);
    setErrorMessage('');
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await requestPasswordReset(resetEmail);
    setResetFeedback(res.message);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Architectural Scrim */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <img
          src="/src/assets/images/campus_hub_library_1790780161716.jpg"
          alt="Campus Architecture Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/90 to-slate-950" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-600/30">
            C1
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white">CampusOne</span>
            <span className="text-xs text-indigo-400 block -mt-1 font-medium">Institutional ERP & Academic Portal</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-xl font-bold tracking-tight text-white">
          Sign In to Your Institutional Account
        </h2>
        <p className="mt-1 text-center text-xs text-slate-400">
          Enforced role-based access for Students, Faculty, Accounts Officers & Administrators
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-800/90 backdrop-blur-md py-8 px-6 shadow-2xl rounded-2xl border border-slate-700 sm:px-8 space-y-6">
          
          {errorMessage && (
            <div className="p-3 bg-rose-950/80 border border-rose-800 rounded-lg text-xs text-rose-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-xs text-emerald-300 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-medium text-slate-300 mb-1">
                Institutional Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block font-medium text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-hidden focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-lg text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In Securely'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Fill Demo Roles for Hackathon Evaluators */}
          <div className="pt-4 border-t border-slate-700/80">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
                <span>Demo Profiles (Click to fill)</span>
              </div>
              <div className="flex items-center bg-slate-900 rounded p-0.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setAccountTypeTab('staff')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    accountTypeTab === 'staff' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Staff/Admin
                </button>
                <button
                  type="button"
                  onClick={() => setAccountTypeTab('students')}
                  className={`px-2 py-0.5 rounded font-medium ${
                    accountTypeTab === 'students' ? 'bg-indigo-600 text-white' : 'text-slate-400'
                  }`}
                >
                  Students
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {(accountTypeTab === 'staff' ? staffAccounts : studentAccounts).map(acc => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => handleQuickFill(acc.email, acc.pw)}
                  className={`p-2 rounded-lg border text-left transition-colors flex flex-col justify-between ${
                    email === acc.email
                      ? 'bg-indigo-950/80 border-indigo-500 text-white'
                      : 'bg-slate-900/60 border-slate-700 hover:border-slate-600 text-slate-300'
                  }`}
                >
                  <span className="font-semibold text-white truncate">{acc.name}</span>
                  <span className="text-[10px] text-slate-400 truncate">{acc.label}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Protected by server-enforced role access control.
            </p>
          </div>

        </div>
      </div>

      {/* Password Reset Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-700 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Reset Institutional Password</h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotModal(false);
                  setResetFeedback('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {resetFeedback ? (
              <div className="mt-4 p-3 bg-emerald-950/80 border border-emerald-800 rounded-lg text-emerald-300 text-xs">
                {resetFeedback}
              </div>
            ) : (
              <form onSubmit={handleResetSubmit} className="mt-4 space-y-3">
                <p className="text-slate-400 text-xs leading-relaxed">
                  Enter your registered college email. An encrypted session reset token will be logged and dispatched to your mailbox.
                </p>

                <div>
                  <label className="block font-medium text-slate-300 mb-1">Your Institutional Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-3 py-1.5 text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium"
                  >
                    Send Reset Token
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
