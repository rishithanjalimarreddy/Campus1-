import React, { useState } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  CreditCard,
  DollarSign,
  Receipt,
  CheckCircle2,
  AlertCircle,
  Clock,
  Download,
  Printer,
  ShieldCheck,
  Award,
  Bell,
  Send,
  Plus,
  ArrowRight,
  Filter,
  FileText,
  X,
  RefreshCw,
  AlertTriangle,
  Building,
  User,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { FeeInvoice, FeePayment, UserProfile } from '../types';

export const FeeManagementModule: React.FC = () => {
  const {
    currentUser,
    users,
    feeInvoices,
    feePayments,
    payFeeInstallment,
    createInvoice,
    recordOfflinePayment,
    applyScholarship,
    sendFeeReminder,
    switchUserRole
  } = useCampus();

  const [activeTab, setActiveTab] = useState<'my-fees' | 'payments' | 'accounts-desk'>('my-fees');
  
  // Checkout Modal State
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [selectedInstallmentNumber, setSelectedInstallmentNumber] = useState<number>(1);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<FeePayment['paymentMethod']>('UPI');
  const [checkoutStep, setCheckoutStep] = useState<'review' | 'method' | 'confirm' | 'processing' | 'success' | 'failed'>('review');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [successfulPayment, setSuccessfulPayment] = useState<FeePayment | null>(null);

  // Payment Form Fields
  const [upiId, setUpiId] = useState<string>('alex.chen@okaxis');
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('883');
  const [bankName, setBankName] = useState<string>('State Bank of India');

  // Receipt Modal State
  const [activeReceipt, setActiveReceipt] = useState<FeePayment | null>(null);

  // Accounts Desk Tabs & Modals
  const [accountsDeskView, setAccountsDeskView] = useState<'reports' | 'create-invoice' | 'record-offline' | 'scholarships'>('reports');
  const [adminFeedback, setAdminFeedback] = useState<string>('');

  // Form: Create Invoice
  const [newInvStudentId, setNewInvStudentId] = useState<string>(users[0]?.id || 'user-std-1');
  const [newInvSemester, setNewInvSemester] = useState<number>(4);
  const [newInvYear, setNewInvYear] = useState<string>('2026-2027');
  const [newInvTuition, setNewInvTuition] = useState<number>(3200);
  const [newInvExam, setNewInvExam] = useState<number>(350);
  const [newInvLibrary, setNewInvLibrary] = useState<number>(150);
  const [newInvLab, setNewInvLab] = useState<number>(400);
  const [newInvHostel, setNewInvHostel] = useState<number>(1800);
  const [newInvDev, setNewInvDev] = useState<number>(200);
  const [newInvScholarshipDiscount, setNewInvScholarshipDiscount] = useState<number>(0);
  const [newInvScholarshipName, setNewInvScholarshipName] = useState<string>('Dean Academic Waiver');
  const [newInvDueDate, setNewInvDueDate] = useState<string>('2026-11-15');

  // Form: Record Offline Payment
  const [offlineInvoiceId, setOfflineInvoiceId] = useState<string>(feeInvoices.find(i => i.outstandingBalance > 0)?.id || '');
  const [offlineAmount, setOfflineAmount] = useState<number>(2000);
  const [offlineMethod, setOfflineMethod] = useState<FeePayment['paymentMethod']>('DemandDraft');
  const [offlineInstrumentNo, setOfflineInstrumentNo] = useState<string>('DD-992014');
  const [offlineBank, setOfflineBank] = useState<string>('State Bank of India');
  const [offlineNotes, setOfflineNotes] = useState<string>('Counter verification with physical instrument copy');

  // Form: Scholarship Adjustment
  const [scholarshipInvoiceId, setScholarshipInvoiceId] = useState<string>('');
  const [scholarshipDiscount, setScholarshipDiscount] = useState<number>(500);
  const [scholarshipTitle, setScholarshipTitle] = useState<string>('Alumni Need-Based Grant');

  const isAccountsOrAdmin = currentUser.role === 'accounts_officer' || currentUser.role === 'admin';

  // Filter student data
  const myInvoices = feeInvoices.filter(i => i.studentId === currentUser.id);
  const myPayments = feePayments.filter(p => p.studentId === currentUser.id);

  // Totals for Student
  const totalBilled = myInvoices.reduce((acc, i) => acc + i.netAmount, 0);
  const totalPaid = myInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const totalOutstanding = myInvoices.reduce((acc, i) => acc + i.outstandingBalance, 0);

  // Totals for Accounts Desk
  const institutionalGross = feeInvoices.reduce((acc, i) => acc + i.grossAmount, 0);
  const institutionalNet = feeInvoices.reduce((acc, i) => acc + i.netAmount, 0);
  const institutionalCollected = feeInvoices.reduce((acc, i) => acc + i.paidAmount, 0);
  const institutionalOutstanding = feeInvoices.reduce((acc, i) => acc + i.outstandingBalance, 0);
  const collectionRate = institutionalNet > 0 ? Math.round((institutionalCollected / institutionalNet) * 100) : 0;
  const overdueCount = feeInvoices.filter(i => i.status === 'overdue').length;

  // Department Collection Breakdown
  const deptBreakdown = ['Computer Science & Engineering', 'Electronics & Communication Engineering', 'Electrical & Electronics Engineering', 'Information Technology', 'Mechanical Engineering'].map(dept => {
    const deptInvs = feeInvoices.filter(i => i.departmentName === dept);
    const net = deptInvs.reduce((acc, i) => acc + i.netAmount, 0);
    const collected = deptInvs.reduce((acc, i) => acc + i.paidAmount, 0);
    const outstanding = deptInvs.reduce((acc, i) => acc + i.outstandingBalance, 0);
    const rate = net > 0 ? Math.round((collected / net) * 100) : 0;
    return { dept, count: deptInvs.length, net, collected, outstanding, rate };
  });

  const handleOpenCheckout = (inv: FeeInvoice, instNum: number, amount: number) => {
    setSelectedInvoice(inv);
    setSelectedInstallmentNumber(instNum);
    setPaymentAmount(amount);
    setCheckoutStep('review');
    setSimulateFailure(false);
    setCheckoutError('');
    setSuccessfulPayment(null);
  };

  const handleAuthorizePayment = async () => {
    if (!selectedInvoice) return;
    setCheckoutStep('processing');
    setCheckoutError('');

    try {
      // Simulate real banking gateway network latency
      await new Promise(r => setTimeout(r, 1400));

      const res = await payFeeInstallment(
        selectedInvoice.id,
        selectedInstallmentNumber,
        paymentAmount,
        paymentMethod,
        `Installment #${selectedInstallmentNumber} settled via CampusOne checkout`,
        simulateFailure
      );

      if (!res.success) {
        setCheckoutError(res.message);
        setCheckoutStep('failed');
      } else {
        setSuccessfulPayment(res.payment || null);
        setCheckoutStep('success');
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Payment execution failed');
      setCheckoutStep('failed');
    }
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = createInvoice(
      newInvStudentId,
      newInvSemester,
      newInvYear,
      {
        tuition: newInvTuition,
        examination: newInvExam,
        library: newInvLibrary,
        laboratory: newInvLab,
        hostel: newInvHostel,
        development: newInvDev
      },
      newInvScholarshipDiscount,
      newInvScholarshipName,
      newInvDueDate
    );

    setAdminFeedback(res.message);
    setTimeout(() => setAdminFeedback(''), 5000);
    if (res.success) {
      setAccountsDeskView('reports');
    }
  };

  const handleRecordOfflineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offlineInvoiceId) return;

    const res = recordOfflinePayment(
      offlineInvoiceId,
      offlineAmount,
      offlineMethod,
      offlineInstrumentNo,
      offlineBank,
      offlineNotes
    );

    setAdminFeedback(res.message);
    setTimeout(() => setAdminFeedback(''), 5000);
    if (res.success && res.payment) {
      setActiveReceipt(res.payment);
      setAccountsDeskView('reports');
    }
  };

  const handleApplyScholarshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarshipInvoiceId) return;

    const res = applyScholarship(scholarshipInvoiceId, scholarshipDiscount, scholarshipTitle);
    setAdminFeedback(res.message);
    setTimeout(() => setAdminFeedback(''), 5000);
  };

  const handleSendReminder = (invId: string) => {
    const res = sendFeeReminder(invId);
    setAdminFeedback(res.message);
    setTimeout(() => setAdminFeedback(''), 4000);
  };

  // Download printable / plain-text official receipt
  const downloadReceiptFile = (payment: FeePayment) => {
    const content = `================================================================================
              CAMPUSONE INSTITUTE OF TECHNOLOGY
             OFFICE OF THE BURSAR & ACADEMIC ACCOUNTS
   [DEMO PAYMENT RECEIPT - SIMULATED RECORD FOR EVALUATION PURPOSES]
================================================================================

RECEIPT NUMBER:        ${payment.receiptNumber}
TRANSACTION DATE:      ${payment.paymentDate}
TRANSACTION REFERENCE: ${payment.transactionReference}
GATEWAY STATUS:        ${payment.gatewayStatus.toUpperCase()} (${payment.gatewayMode})

STUDENT DETAILS:
--------------------------------------------------------------------------------
Student Name:          ${payment.studentName}
Roll Number:           ${payment.studentRoll}
Academic Semester:     Semester ${payment.semester}

FEE ASSESSMENT & PAYMENT BREAKDOWN:
--------------------------------------------------------------------------------
Installment Amount:    $${payment.amount.toLocaleString()}.00
Payment Method:        ${payment.paymentMethod}
Payment Notes:         ${payment.notes || 'Verified through institutional payment system'}

VERIFICATION BADGE:
--------------------------------------------------------------------------------
AUTHENTICATION: [VERIFIED & SETTLED]
ISSUING AUTHORITY: Finance Division, CampusOne ERP
WATERMARK: DEMO ENVIRONMENT - NO REAL FINANCIAL VALUE TRANSFERRED
================================================================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusOne_Receipt_${payment.receiptNumber}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Export Institutional Collection CSV
  const exportCollectionCSV = () => {
    const headers = 'Invoice ID,Student Name,Roll Number,Department,Semester,Academic Year,Gross Fees,Scholarship Discount,Net Fees,Paid Amount,Outstanding Balance,Due Date,Status\n';
    const rows = feeInvoices.map(i =>
      `"${i.id}","${i.studentName}","${i.studentRoll}","${i.departmentName}",${i.semester},"${i.academicYear}",${i.grossAmount},${i.scholarshipDiscount},${i.netAmount},${i.paidAmount},${i.outstandingBalance},"${i.dueDate}","${i.status}"`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CampusOne_Fee_Collection_Report_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6 font-sans">
      
      {/* Header & Sub-Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-600 tracking-wide uppercase">
              Finance & Bursar Division
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              DEMO PAYMENT MODE
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Institutional Fee Management & Verified Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Transparent semester tuition schedules, verified gateway checkout, downloadable official receipts, and bursar ledger reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center p-1 bg-slate-200/80 rounded-lg">
            <button
              onClick={() => setActiveTab('my-fees')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'my-fees' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Fee Schedule
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === 'payments' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Receipts Ledger ({myPayments.length})
            </button>
            <button
              onClick={() => setActiveTab('accounts-desk')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'accounts-desk' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Accounts Officer Desk</span>
            </button>
          </div>
        </div>
      </div>

      {/* Admin Action Feedback Toast */}
      {adminFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{adminFeedback}</span>
        </div>
      )}

      {/* TAB 1: Student Fee Schedule */}
      {activeTab === 'my-fees' && (
        <div className="space-y-6">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Total Assessed Fees</div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-slate-900">
                ${totalBilled.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Inclusive of tuition, hostel & grants
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Total Cleared (Paid)</div>
              <div className="mt-2 text-2xl font-bold tabular-nums text-emerald-600">
                ${totalPaid.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                Verified through banking checkout
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <div className="text-xs font-medium text-slate-500">Outstanding Balance Due</div>
              <div className={`mt-2 text-2xl font-bold tabular-nums ${totalOutstanding > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                ${totalOutstanding.toLocaleString()}
              </div>
              <div className="mt-1 text-xs text-slate-500">
                {totalOutstanding > 0 ? 'Clear installments to avoid registration holds' : 'All accounts settled in full'}
              </div>
            </div>
          </div>

          {/* Student Invoices List */}
          <div className="space-y-5">
            {myInvoices.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-slate-200 text-xs text-slate-500">
                <Receipt className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">No Fee Invoices Found</p>
                <p className="mt-1">No fee schedules have been billed for your user account ({currentUser.name}).</p>
              </div>
            ) : (
              myInvoices.map(inv => (
                <div key={inv.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                  
                  {/* Invoice Header */}
                  <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Semester {inv.semester}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          Academic Year {inv.academicYear} · Invoice #{inv.id}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Student: <strong className="text-slate-800">{inv.studentName} ({inv.studentRoll})</strong> · {inv.departmentName}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                        inv.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Fee Itemization */}
                    <div>
                      <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2">
                        Semester Fee Itemization
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Tuition Fee</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.tuition.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Exam Fee</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.examination.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Library & Dig.</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.library.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Laboratory</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.laboratory.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Hostel & Dining</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.hostel.toLocaleString()}</div>
                        </div>
                        <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500">Campus Dev.</div>
                          <div className="font-semibold text-slate-900 tabular-nums">${inv.breakdown.development.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>

                    {/* Scholarship Grant Applied */}
                    {inv.scholarshipDiscount > 0 && (
                      <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs flex items-center justify-between text-emerald-900">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="font-semibold">Applied Scholarship / Fee Waiver:</span>
                            <span className="ml-1 text-emerald-800">{inv.scholarshipName}</span>
                          </div>
                        </div>
                        <span className="font-bold tabular-nums text-emerald-700">
                          -${inv.scholarshipDiscount.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Financial Summary Row */}
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
                      <div className="flex items-center gap-6">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Gross Assessment:</span>
                          <span className="font-semibold text-slate-900 tabular-nums">${inv.grossAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Net Payable:</span>
                          <span className="font-bold text-indigo-700 tabular-nums">${inv.netAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Amount Settled:</span>
                          <span className="font-semibold text-emerald-600 tabular-nums">${inv.paidAmount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Outstanding Balance:</span>
                          <span className={`font-bold tabular-nums ${inv.outstandingBalance > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                            ${inv.outstandingBalance.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Semester Due Date:</span>
                        <span className="font-semibold text-slate-800">{inv.dueDate}</span>
                      </div>
                    </div>

                    {/* Installments Table with Pay Now button */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2.5">
                        Structured Installment Plan
                      </h4>
                      <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-200">
                        {inv.installmentPlan.map(inst => (
                          <div
                            key={inst.installmentNumber}
                            className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                                inst.paid ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-50 text-indigo-700'
                              }`}>
                                #{inst.installmentNumber}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900">
                                  Installment #{inst.installmentNumber} · ${inst.amount.toLocaleString()}
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {inst.paid ? (
                                    <span className="text-emerald-700 flex items-center gap-1 font-medium mt-0.5">
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                      Settled on {inst.paidAt || '2026-08-12'}
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 mt-0.5">
                                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                                      Due by {inst.dueDate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              {inst.paid ? (
                                <button
                                  type="button"
                                  disabled
                                  className="px-3 py-1.5 bg-slate-100 text-slate-400 font-semibold rounded-lg text-xs cursor-not-allowed flex items-center gap-1"
                                >
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Installment Cleared</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handleOpenCheckout(inv, inst.installmentNumber, inst.amount)}
                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors flex items-center gap-1.5"
                                >
                                  <CreditCard className="w-3.5 h-3.5" />
                                  <span>Pay Now (${inst.amount.toLocaleString()})</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* TAB 2: Payment Receipts History */}
      {activeTab === 'payments' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Verified Payment Receipts & Transaction Log
                </h3>
                <p className="text-xs text-slate-500">
                  Showing authenticated payment records for student {currentUser.name}
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
                {myPayments.length} Settled Transactions
              </span>
            </div>

            {myPayments.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No verified payments found for this account.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Receipt #</th>
                      <th className="px-4 py-3">Date & Time</th>
                      <th className="px-4 py-3">Semester</th>
                      <th className="px-4 py-3">Method</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Transaction Reference</th>
                      <th className="px-4 py-3 text-right">Receipt Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {myPayments.map(pay => (
                      <tr key={pay.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 font-mono font-bold text-indigo-700">
                          {pay.receiptNumber}
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {pay.paymentDate}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                            Semester {pay.semester}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-800">{pay.paymentMethod}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-900 tabular-nums">
                          ${pay.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px] text-slate-500 truncate max-w-[160px]">
                          {pay.transactionReference}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setActiveReceipt(pay)}
                              className="px-2.5 py-1 text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded transition-colors flex items-center gap-1"
                              title="View & Print Official Receipt"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>View / Print</span>
                            </button>
                            <button
                              onClick={() => downloadReceiptFile(pay)}
                              className="px-2.5 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors flex items-center gap-1"
                              title="Download Official Receipt"
                            >
                              <Download className="w-3 h-3 text-indigo-600" />
                              <span>Download</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: Accounts Officer Desk */}
      {activeTab === 'accounts-desk' && (
        <div className="space-y-6">
          
          {/* Permission Guard Banner if logged in as student */}
          {!isAccountsOrAdmin && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Accounts Officer Clearance Required for Full Administrative Control</div>
                  <div className="text-amber-800 mt-0.5">
                    You are currently viewing as student <strong>{currentUser.name}</strong>. Switch to Accounts Officer to create invoices, record verified offline payments, and generate institutional audits.
                  </div>
                </div>
              </div>
              <button
                onClick={() => switchUserRole('accounts_officer')}
                className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-lg font-semibold shrink-0 transition-colors"
              >
                Switch to Accounts Officer Role
              </button>
            </div>
          )}

          {/* Accounts Officer Sub-Navigation */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
            <button
              onClick={() => setAccountsDeskView('reports')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                accountsDeskView === 'reports'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Collection Reports & Analytics</span>
            </button>
            <button
              onClick={() => setAccountsDeskView('create-invoice')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                accountsDeskView === 'create-invoice'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Semester Invoice</span>
            </button>
            <button
              onClick={() => setAccountsDeskView('record-offline')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                accountsDeskView === 'record-offline'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Verified Offline Payment</span>
            </button>
            <button
              onClick={() => setAccountsDeskView('scholarships')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 ${
                accountsDeskView === 'scholarships'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Scholarships & Concessions</span>
            </button>
          </div>

          {/* SUB-VIEW 1: Institutional Collection Reports */}
          {accountsDeskView === 'reports' && (
            <div className="space-y-6">
              
              {/* Institutional Metrics Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Gross Billed</div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-slate-900">
                    ${institutionalGross.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Pre-scholarship tuition</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Net Collectible</div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-indigo-700">
                    ${institutionalNet.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Net of grants & waivers</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Total Realized</div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-emerald-600">
                    ${institutionalCollected.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Verified bank receipts</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Outstanding</div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-rose-600">
                    ${institutionalOutstanding.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">Due across cohorts</div>
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
                  <div className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">Collection Rate</div>
                  <div className="mt-2 text-xl font-bold tabular-nums text-slate-900">
                    {collectionRate}%
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">{overdueCount} overdue invoices</div>
                </div>
              </div>

              {/* Department Collection Breakdown Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Department-Wise Collection Summary
                    </h3>
                    <p className="text-xs text-slate-500">
                      Cross-departmental financial ledger performance across engineering faculties
                    </p>
                  </div>
                  <button
                    onClick={exportCollectionCSV}
                    className="px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export Collection Report (CSV)</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Academic Department</th>
                        <th className="px-4 py-3">Invoiced Students</th>
                        <th className="px-4 py-3">Net Assessed</th>
                        <th className="px-4 py-3">Collected</th>
                        <th className="px-4 py-3">Outstanding</th>
                        <th className="px-4 py-3">Collection Progress</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {deptBreakdown.map(d => (
                        <tr key={d.dept} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {d.dept}
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {d.count} invoices
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">
                            ${d.net.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-emerald-600 tabular-nums">
                            ${d.collected.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-semibold text-rose-600 tabular-nums">
                            ${d.outstanding.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-28 bg-slate-200 rounded-full h-2 overflow-hidden">
                                <div
                                  className="bg-indigo-600 h-2 rounded-full"
                                  style={{ width: `${d.rate}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-800 text-[11px] tabular-nums">{d.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* All Institutional Invoices Management Table */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      All Student Semester Invoices Ledger
                    </h3>
                    <p className="text-xs text-slate-500">
                      Direct bursar actions: send automated payment due notifications & audit status
                    </p>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">
                    Total: {feeInvoices.length} invoices
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Invoice #</th>
                        <th className="px-4 py-3">Student</th>
                        <th className="px-4 py-3">Dept & Sem</th>
                        <th className="px-4 py-3">Net Due</th>
                        <th className="px-4 py-3">Paid</th>
                        <th className="px-4 py-3">Outstanding</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Bursar Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {feeInvoices.map(inv => (
                        <tr key={inv.id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 font-mono font-medium text-slate-900">
                            {inv.id}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-900">{inv.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{inv.studentRoll}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">
                            {inv.departmentName.split(' ')[0]} · Sem {inv.semester}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900 tabular-nums">
                            ${inv.netAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-emerald-600 font-semibold tabular-nums">
                            ${inv.paidAmount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 font-bold tabular-nums text-rose-600">
                            ${inv.outstandingBalance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              inv.status === 'paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'overdue'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {inv.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {inv.outstandingBalance > 0 ? (
                              <button
                                onClick={() => handleSendReminder(inv.id)}
                                className="px-2.5 py-1 text-[11px] font-medium bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded transition-colors inline-flex items-center gap-1"
                              >
                                <Send className="w-3 h-3 text-indigo-600" />
                                <span>Send Reminder</span>
                              </button>
                            ) : (
                              <span className="text-[11px] text-emerald-700 font-medium flex items-center justify-end gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Cleared</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* SUB-VIEW 2: Create Semester Fee Invoice */}
          {accountsDeskView === 'create-invoice' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-3xl mx-auto text-xs">
              <div className="border-b border-slate-200 pb-3 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Create New Student Semester Fee Invoice
                </h3>
                <p className="text-slate-500 text-xs">
                  Issue officially billed semester tuition, laboratory, and hostel assessment to an enrolled student.
                </p>
              </div>

              <form onSubmit={handleCreateInvoiceSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Select Student</label>
                    <select
                      value={newInvStudentId}
                      onChange={e => setNewInvStudentId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    >
                      {users.filter(u => u.role === 'student').map(s => (
                        <option key={s.id} value={s.id}>
                          {s.name} ({s.identifier} · {s.departmentName.split(' ')[0]})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Academic Semester</label>
                    <select
                      value={newInvSemester}
                      onChange={e => setNewInvSemester(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                        <option key={sem} value={sem}>Semester {sem}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Academic Year</label>
                    <input
                      type="text"
                      value={newInvYear}
                      onChange={e => setNewInvYear(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <div className="font-semibold text-slate-800 mb-2">Itemized Fee Breakdown ($)</div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Tuition Fee</label>
                      <input
                        type="number"
                        min="500"
                        max="10000"
                        value={newInvTuition}
                        onChange={e => setNewInvTuition(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Exam Fee</label>
                      <input
                        type="number"
                        min="100"
                        max="2000"
                        value={newInvExam}
                        onChange={e => setNewInvExam(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Library Fee</label>
                      <input
                        type="number"
                        min="50"
                        max="1000"
                        value={newInvLibrary}
                        onChange={e => setNewInvLibrary(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Laboratory Fee</label>
                      <input
                        type="number"
                        min="50"
                        max="2000"
                        value={newInvLab}
                        onChange={e => setNewInvLab(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Hostel & Dining</label>
                      <input
                        type="number"
                        min="0"
                        max="5000"
                        value={newInvHostel}
                        onChange={e => setNewInvHostel(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-500 mb-1 text-[11px]">Campus Dev. Fee</label>
                      <input
                        type="number"
                        min="50"
                        max="1000"
                        value={newInvDev}
                        onChange={e => setNewInvDev(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Scholarship Discount ($)</label>
                    <input
                      type="number"
                      min="0"
                      max="5000"
                      value={newInvScholarshipDiscount}
                      onChange={e => setNewInvScholarshipDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Scholarship Title</label>
                    <input
                      type="text"
                      value={newInvScholarshipName}
                      onChange={e => setNewInvScholarshipName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newInvDueDate}
                      onChange={e => setNewInvDueDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                {/* Live Computed Totals */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Gross Assessment:</span>
                    <span className="font-semibold text-slate-900 tabular-nums">
                      ${(newInvTuition + newInvExam + newInvLibrary + newInvLab + newInvHostel + newInvDev).toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Scholarship Credit:</span>
                    <span className="font-semibold text-emerald-600 tabular-nums">
                      -${newInvScholarshipDiscount.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Net Invoice Payable:</span>
                    <span className="font-bold text-indigo-700 text-sm tabular-nums">
                      ${Math.max(0, (newInvTuition + newInvExam + newInvLibrary + newInvLab + newInvHostel + newInvDev) - newInvScholarshipDiscount).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountsDeskView('reports')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create & Issue Invoice</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUB-VIEW 3: Record Verified Offline Payment */}
          {accountsDeskView === 'record-offline' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto text-xs">
              <div className="border-b border-slate-200 pb-3 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Record Verified Offline Fee Payment
                </h3>
                <p className="text-slate-500 text-xs">
                  Record physical Demand Drafts, Bank Cheques, or Counter Challans verified by the Bursar's Office.
                </p>
              </div>

              <form onSubmit={handleRecordOfflineSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Invoice</label>
                  <select
                    value={offlineInvoiceId}
                    onChange={e => {
                      setOfflineInvoiceId(e.target.value);
                      const inv = feeInvoices.find(i => i.id === e.target.value);
                      if (inv) setOfflineAmount(inv.outstandingBalance);
                    }}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  >
                    {feeInvoices.filter(i => i.outstandingBalance > 0).map(i => (
                      <option key={i.id} value={i.id}>
                        {i.studentName} ({i.studentRoll}) — Sem {i.semester} [Balance: ${i.outstandingBalance.toLocaleString()}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Paid Amount ($)</label>
                    <input
                      type="number"
                      min="1"
                      value={offlineAmount}
                      onChange={e => setOfflineAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Instrument Type</label>
                    <select
                      value={offlineMethod}
                      onChange={e => setOfflineMethod(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="DemandDraft">Demand Draft (DD)</option>
                      <option value="NetBanking">NEFT / RTGS Bank Transfer</option>
                      <option value="DebitCard">Bank Counter Challan</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Instrument Number / DD #</label>
                    <input
                      type="text"
                      value={offlineInstrumentNo}
                      onChange={e => setOfflineInstrumentNo(e.target.value)}
                      placeholder="e.g. DD-881920 or UTR-2026-99"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Issuing / Drawee Bank</label>
                    <input
                      type="text"
                      value={offlineBank}
                      onChange={e => setOfflineBank(e.target.value)}
                      placeholder="e.g. State Bank of India"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-slate-700 mb-1">Verification Notes</label>
                  <input
                    type="text"
                    value={offlineNotes}
                    onChange={e => setOfflineNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAccountsDeskView('reports')}
                    className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Credit Offline Payment</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SUB-VIEW 4: Scholarships & Concessions */}
          {accountsDeskView === 'scholarships' && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto text-xs">
              <div className="border-b border-slate-200 pb-3 mb-5">
                <h3 className="text-base font-bold text-slate-900">
                  Grant Scholarship Waiver or Fee Concession
                </h3>
                <p className="text-slate-500 text-xs">
                  Apply approved merit, sports, or need-based grants directly to student semester fee ledgers.
                </p>
              </div>

              <form onSubmit={handleApplyScholarshipSubmit} className="space-y-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Select Invoice</label>
                  <select
                    value={scholarshipInvoiceId}
                    onChange={e => setScholarshipInvoiceId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    required
                  >
                    <option value="">-- Choose student invoice --</option>
                    {feeInvoices.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.studentName} ({i.studentRoll}) — Sem {i.semester} [Gross: ${i.grossAmount}, Net: ${i.netAmount}]
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Scholarship Grant Title</label>
                    <input
                      type="text"
                      value={scholarshipTitle}
                      onChange={e => setScholarshipTitle(e.target.value)}
                      placeholder="e.g. Dean Merit Fellowship"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Waiver Credit Amount ($)</label>
                    <input
                      type="number"
                      min="50"
                      max="5000"
                      value={scholarshipDiscount}
                      onChange={e => setScholarshipDiscount(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold shadow-xs flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>Apply Scholarship Credit</span>
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      )}

      {/* FULL-CYCLE VERIFIED DEMO PAYMENT CHECKOUT MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-xs text-slate-800">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  CampusOne Institutional Checkout
                </h3>
                <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PAYMENT SANDBOX: VERIFIED DEMO GATEWAY</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Clearly Marked Demo Banner */}
            <div className="mt-3 p-2 bg-amber-50 border border-amber-200 rounded-lg text-[11px] text-amber-800 flex items-center justify-between">
              <span><strong>DEMO PAYMENT MODE:</strong> Simulated banking gateway. No real money transferred.</span>
              <label className="flex items-center gap-1 cursor-pointer text-rose-700 font-semibold text-[10px]">
                <input
                  type="checkbox"
                  checked={simulateFailure}
                  onChange={e => setSimulateFailure(e.target.checked)}
                  className="rounded text-rose-600"
                />
                <span>Simulate Failure</span>
              </label>
            </div>

            {/* Error Banner */}
            {checkoutError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{checkoutError}</span>
              </div>
            )}

            {/* STEP 1: Invoice Review */}
            {checkoutStep === 'review' && (
              <div className="mt-4 space-y-4">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="flex justify-between font-bold text-slate-900 text-sm">
                    <span>Semester {selectedInvoice.semester} Tuition Installment #{selectedInstallmentNumber}</span>
                    <span className="text-indigo-700 tabular-nums">${paymentAmount.toLocaleString()}.00</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    Student: {selectedInvoice.studentName} ({selectedInvoice.studentRoll}) · {selectedInvoice.departmentName}
                  </div>
                  <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
                    <div>Tuition Portion: ${(selectedInvoice.breakdown.tuition / 2).toLocaleString()}</div>
                    <div>Hostel & Lab: ${((selectedInvoice.breakdown.hostel + selectedInvoice.breakdown.laboratory) / 2).toLocaleString()}</div>
                    <div>Due Date: {selectedInvoice.dueDate}</div>
                    <div className="text-emerald-700 font-semibold">Scholarship Discount Applied</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-slate-500">Step 1 of 3: Invoice Verification</span>
                  <button
                    onClick={() => setCheckoutStep('method')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Select Payment Method</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Payment Method Selection */}
            {checkoutStep === 'method' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block font-medium text-slate-700 mb-1.5">
                    Select Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['UPI', 'NetBanking', 'DebitCard'] as FeePayment['paymentMethod'][]).map(method => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`p-2.5 rounded-lg border text-center transition-colors font-medium ${
                          paymentMethod === method
                            ? 'border-indigo-600 bg-indigo-50/70 text-indigo-700 font-bold'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Conditional Fields */}
                {paymentMethod === 'UPI' && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Virtual Payment Address (VPA / UPI ID)
                    </label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={e => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                      required
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Compatible: Google Pay, PhonePe, Paytm, BHIM UPI
                    </span>
                  </div>
                )}

                {paymentMethod === 'DebitCard' && (
                  <div className="space-y-2">
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={e => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={e => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={e => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Select Bank</label>
                    <select
                      value={bankName}
                      onChange={e => setBankName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                    >
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Punjab National Bank</option>
                    </select>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setCheckoutStep('review')}
                    className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                  >
                    Back to Review
                  </button>
                  <button
                    onClick={() => setCheckoutStep('confirm')}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <span>Proceed to Confirm</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Pre-Authorization Confirmation */}
            {checkoutStep === 'confirm' && (
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Payment Pre-Authorization Summary
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Student Roll:</span>
                    <span className="font-semibold text-slate-900">{selectedInvoice.studentRoll}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Fee Purpose:</span>
                    <span className="font-semibold text-slate-900">Semester {selectedInvoice.semester} (Installment #{selectedInstallmentNumber})</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Selected Method:</span>
                    <span className="font-semibold text-slate-900">{paymentMethod}</span>
                  </div>
                  <div className="flex justify-between py-1 text-sm font-bold">
                    <span className="text-slate-900">Total Authorization:</span>
                    <span className="text-indigo-700 tabular-nums">${paymentAmount.toLocaleString()}.00</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setCheckoutStep('method')}
                    className="text-slate-500 hover:text-slate-800 text-xs font-medium"
                  >
                    Change Method
                  </button>
                  <button
                    onClick={handleAuthorizePayment}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm transition-colors flex items-center gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Authorize & Pay ${paymentAmount.toLocaleString()}</span>
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Processing Animation */}
            {checkoutStep === 'processing' && (
              <div className="py-10 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
                <div className="text-sm font-bold text-slate-900">
                  Connecting to Verified Interbank Gateway...
                </div>
                <div className="text-xs text-slate-500 max-w-xs mx-auto">
                  Authorizing two-factor signature and updating institutional ledger records...
                </div>
              </div>
            )}

            {/* STEP 5: Success Screen */}
            {checkoutStep === 'success' && successfulPayment && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Payment Verified Successfully!
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Your payment of <strong>${successfulPayment.amount.toLocaleString()}</strong> has been credited to your institutional account.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Official Receipt #:</span>
                    <span className="font-mono font-bold text-indigo-700">{successfulPayment.receiptNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Transaction Reference:</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate max-w-[200px]">{successfulPayment.transactionReference}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gateway Status:</span>
                    <span className="text-emerald-700 font-semibold">{successfulPayment.gatewayStatus.toUpperCase()}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setActiveReceipt(successfulPayment);
                      setSelectedInvoice(null);
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-medium text-xs flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>View & Print Receipt</span>
                  </button>
                  <button
                    onClick={() => downloadReceiptFile(successfulPayment)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download Receipt</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* STEP 6: Failure Screen */}
            {checkoutStep === 'failed' && (
              <div className="py-6 text-center space-y-4">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Payment Gateway Declined
                  </h4>
                  <p className="text-xs text-rose-700 mt-1 max-w-sm mx-auto">
                    {checkoutError || 'Simulated transaction decline from issuing banking gateway.'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    No amount has been debited. Your invoice balance remains unchanged.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => {
                      setSimulateFailure(false);
                      setCheckoutStep('method');
                    }}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold text-xs flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Retry Payment</span>
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* OFFICIAL PRINTABLE & DOWNLOADABLE FEE RECEIPT MODAL */}
      {activeReceipt && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-300 text-xs text-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Official Institutional Fee Receipt
                </h3>
              </div>
              <button
                onClick={() => setActiveReceipt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Box */}
            <div className="p-6 bg-slate-50 border border-slate-300 rounded-xl space-y-4 font-sans text-xs print:m-0 print:border-none">
              <div className="text-center border-b border-slate-300 pb-3 space-y-0.5">
                <div className="font-bold text-sm uppercase tracking-wider text-slate-900">
                  CampusOne Institute of Technology
                </div>
                <div className="text-[11px] text-slate-600">Office of the Bursar & Academic Accounts</div>
                <div className="text-[10px] text-slate-400">Accredited Grade A+ University · Finance Division</div>
                <div className="text-[10px] font-bold text-amber-800 mt-1">
                  [DEMO RECEIPT - SIMULATED PAYMENT RECORD]
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-400 block text-[10px]">RECEIPT NUMBER:</span>
                  <span className="font-mono font-bold text-slate-900">{activeReceipt.receiptNumber}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">TRANSACTION DATE:</span>
                  <span className="tabular-nums font-semibold">{activeReceipt.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">STUDENT NAME:</span>
                  <span className="font-semibold text-slate-900">{activeReceipt.studentName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">ENROLLMENT ROLL:</span>
                  <span className="font-mono font-semibold">{activeReceipt.studentRoll}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">ACADEMIC SEMESTER:</span>
                  <span>Semester {activeReceipt.semester}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">PAYMENT MODE:</span>
                  <span>{activeReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="space-y-1.5 py-1">
                <div className="flex justify-between font-medium">
                  <span>Tuition & Curriculum Installment Clearance</span>
                  <span className="tabular-nums font-bold text-slate-900">${activeReceipt.amount.toLocaleString()}</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Transaction Ref: <code className="text-slate-700">{activeReceipt.transactionReference}</code>
                </div>
                <div className="text-[10px] text-slate-500">
                  Notes: {activeReceipt.notes}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-300 flex items-center justify-between text-[11px]">
                <div className="text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Payment Verified & Confirmed</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 block text-[9px]">AUTHORIZED SIGNATURE</span>
                  <span className="font-serif italic text-slate-700">Accounts Section (Automated)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                onClick={() => downloadReceiptFile(activeReceipt)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download (.txt)</span>
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Official Copy</span>
              </button>
              <button
                onClick={() => setActiveReceipt(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
