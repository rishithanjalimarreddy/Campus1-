import React, { useState, useRef, useEffect } from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Sparkles,
  Send,
  X,
  Database,
  ArrowRight,
  Bot,
  User,
  RotateCcw,
  RefreshCw,
  AlertCircle,
  Clock,
  ShieldAlert,
  Calendar,
  CreditCard,
  BookOpen,
  LifeBuoy,
  Bell,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

interface AcademicAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  sources?: string[];
  navigationTab?: string;
  timestamp: string;
  isError?: boolean;
  failedQuery?: string;
}

export const AcademicAssistantModal: React.FC<AcademicAssistantModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const { queryCampusAssistant, currentUser, isOfflineMode } = useCampus();

  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [inputWarning, setInputWarning] = useState<string | null>(null);
  const isSubmittingRef = useRef<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const initialGreeting: Message = {
    id: 'm-init',
    sender: 'assistant',
    text: `Hello **${currentUser.name}**! I am your verified CampusOne Academic & Services Assistant.\n\nI am connected directly to your institution's live database. Here is what you can ask me:\n• **Class Timetables & Conflicts**: "Today's lectures", "Do I have timetable conflicts?"\n• **Examinations & PYQs**: "When is my Data Structures exam?", "Show exam countdown"\n• **Syllabus & Milestones**: "What syllabus topics are incomplete?", "Revision hours"\n• **Smart Library OPAC**: "Which books are available for Operating Systems?", "Check my active loans & fines"\n• **Fee Schedules & Balances**: "What is my tuition balance?", "When is my fee installment due?"\n• **Helpdesk Tickets**: "Check my open support tickets"\n• **Official Announcements**: "Show latest campus circulars"\n\nHow can I help you today?`,
    sources: ['CampusOne Central Knowledge Graph'],
    timestamp: 'Just now'
  };

  const [messages, setMessages] = useState<Message[]>([initialGreeting]);

  // Suggested questions grouped by intent
  const suggestedQueries = [
    { label: "Today's Classes", query: "What are today's classes?", icon: Calendar },
    { label: "Exam Countdown", query: "When is my next examination?", icon: Clock },
    { label: "Tuition Balance", query: "What is my outstanding tuition fee balance?", icon: CreditCard },
    { label: "Library Books & Fines", query: "Check my borrowed library books and fines", icon: BookOpen },
    { label: "My Support Tickets", query: "Check my open support tickets", icon: LifeBuoy },
    { label: "Timetable Conflicts", query: "Do I have any timetable conflicts?", icon: AlertCircle },
    { label: "Campus Announcements", query: "Show latest campus circulars & announcements", icon: Bell },
    { label: "Revision Topics", query: "What syllabus topics do I still need to revise?", icon: Sparkles }
  ];

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading, isOpen]);

  // Auto-focus textarea on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleResetChat = () => {
    setMessages([
      {
        ...initialGreeting,
        id: 'm-' + Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setInput('');
    setInputWarning(null);
  };

  const handleSend = async (queryText?: string) => {
    const textToSend = (queryText !== undefined ? queryText : input).trim();

    if (!textToSend) {
      setInputWarning('Please type a question before sending.');
      setTimeout(() => setInputWarning(null), 2500);
      return;
    }

    if (loading || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setInputWarning(null);

    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsgId = 'u-' + Date.now();
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: currentTime
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Prepare conversation history for contextual AI turns
    const historyPayload = messages.slice(-6).map(m => ({
      role: (m.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
      text: m.text
    }));

    try {
      const response = await queryCampusAssistant(textToSend, historyPayload);
      const assistantMsg: Message = {
        id: 'a-' + Date.now(),
        sender: 'assistant',
        text: response.answer,
        sources: response.sources,
        navigationTab: response.navigationTab,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errMsg = err?.message || 'Unable to connect to campus services.';
      const isRateLimit = errMsg.toLowerCase().includes('rate limit');
      const errorMsg: Message = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: isRateLimit
          ? '⚠️ **Rate Limit Alert**: The campus AI provider is experiencing high traffic. Please wait a moment or click Retry below.'
          : `⚠️ **Connection Notice**: ${errMsg}\n\nPlease check your network connection or click Retry to re-query the local institutional database.`,
        sources: ['CampusOne Network Diagnostics'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isError: true,
        failedQuery: textToSend
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Tab navigation badge label helper
  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'fees':
        return 'Go to Fee Management';
      case 'library':
        return 'Go to Smart Library';
      case 'helpdesk':
        return 'Go to Student Helpdesk';
      case 'timetable':
        return 'Go to Timetable';
      case 'exams':
        return 'Go to Exams & PYQ';
      case 'planner':
        return 'Go to Academic Planner';
      case 'dashboard':
        return 'Go to Student Dashboard';
      default:
        return `Open ${tab.toUpperCase()} Module`;
    }
  };

  // Helper to render bold markdown and lists nicely
  const renderFormattedText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold rendering regex
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const renderedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return (
            <strong key={pIdx} className="font-semibold text-slate-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      });

      // Privacy or security alert highlight box
      if (line.includes('🔒') || line.includes('Access Restricted') || line.includes('Access Denied')) {
        return (
          <div
            key={idx}
            className="my-1.5 p-2.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-[11px] leading-relaxed flex items-start gap-2"
          >
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>{renderedParts}</div>
          </div>
        );
      }

      // Warning or consequential action box
      if (line.includes('⚠️') || line.includes('Requires Direct Confirmation')) {
        return (
          <div
            key={idx}
            className="my-1.5 p-2.5 bg-blue-50 border border-blue-200 text-blue-900 rounded-lg text-[11px] leading-relaxed flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
            <div>{renderedParts}</div>
          </div>
        );
      }

      // Bullet points
      if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
        return (
          <div key={idx} className="flex items-start gap-1.5 pl-1.5 py-0.5">
            <span className="text-indigo-600 font-bold">•</span>
            <span className="flex-1">{renderedParts}</span>
          </div>
        );
      }

      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="h-1.5" />;
      }

      return (
        <p key={idx} className="py-0.5">
          {renderedParts}
        </p>
      );
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[90vh] sm:h-[640px] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="px-4 sm:px-5 py-3.5 bg-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold tracking-tight">
                  CampusOne Verified Assistant
                </h2>
                <span className="text-[10px] px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-full font-medium border border-indigo-400/30">
                  {isOfflineMode ? 'Offline Mode' : 'Institutional Live'}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Timetables · Exams & PYQ · OPAC Library · Fees · Helpdesk · Circulars
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleResetChat}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-1 text-xs"
              title="Reset conversation (New Chat)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">New Chat</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors ml-1"
              title="Close Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 shrink-0 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Suggested:
            </span>
            {suggestedQueries.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(item.query)}
                disabled={loading}
                className="px-2.5 py-1 text-[11px] font-medium bg-white hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 text-slate-700 border border-slate-200 rounded-full transition-colors flex items-center gap-1.5 shadow-2xs shrink-0 disabled:opacity-50"
              >
                <item.icon className="w-3 h-3 text-slate-400" />
                <span>{item.label}</span>
                <ArrowRight className="w-2.5 h-2.5 text-slate-300" />
              </button>
            ))}
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/50">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold shadow-2xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : msg.isError
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-900 text-white'
                }`}
              >
                {msg.sender === 'user' ? (
                  <User className="w-3.5 h-3.5" />
                ) : msg.isError ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : (
                  <Bot className="w-3.5 h-3.5" />
                )}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[88%] sm:max-w-[82%] rounded-2xl p-3.5 space-y-2 leading-relaxed shadow-xs ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-amber-50/90 text-amber-950 rounded-tl-none border border-amber-200'
                    : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/80'
                }`}
              >
                <div className="text-xs">
                  {msg.sender === 'user' ? (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  ) : (
                    renderFormattedText(msg.text)
                  )}
                </div>

                {/* Interactive Navigation Action Button */}
                {msg.navigationTab && onNavigate && (
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onNavigate(msg.navigationTab!);
                        onClose();
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg border border-indigo-200 transition-colors shadow-2xs group"
                    >
                      <span>{getTabLabel(msg.navigationTab)}</span>
                      <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                )}

                {/* Error Retry Button */}
                {msg.isError && msg.failedQuery && (
                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between">
                    <span className="text-[10px] text-amber-700">Request interrupted</span>
                    <button
                      onClick={() => handleSend(msg.failedQuery)}
                      disabled={loading}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white text-[11px] font-semibold rounded-md flex items-center gap-1 transition-colors shadow-2xs"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Retry Question</span>
                    </button>
                  </div>
                )}

                {/* Source Citations */}
                {msg.sources && msg.sources.length > 0 && !msg.isError && (
                  <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                    <div className="font-semibold text-slate-600 flex items-center gap-1">
                      <Database className="w-3 h-3 text-indigo-600" />
                      <span>Verified Institutional Source:</span>
                    </div>
                    <div className="text-slate-500 pl-4 space-y-0.5">
                      {msg.sources.map((s, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <span className="text-indigo-400">›</span>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamp */}
                <div
                  className={`text-[9px] text-right font-medium ${
                    msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}

          {/* Animated Loading Typing Indicator */}
          {loading && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 text-[10px] shadow-2xs">
                <Bot className="w-3.5 h-3.5 animate-pulse" />
              </div>
              <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-slate-200 shadow-2xs flex items-center gap-2 text-xs text-slate-600">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-[11px] text-slate-500">
                  Querying verified CampusOne institutional records...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Empty Input Warning Banner */}
        {inputWarning && (
          <div className="bg-amber-100 text-amber-900 px-4 py-1.5 text-[11px] font-medium flex items-center gap-1.5 border-t border-amber-200">
            <AlertCircle className="w-3.5 h-3.5 text-amber-700 shrink-0" />
            <span>{inputWarning}</span>
          </div>
        )}

        {/* Input Bar with Textarea (Enter to send, Shift+Enter for newline) */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  if (inputWarning) setInputWarning(null);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Ask about timetables, exams, fees, library books, tickets... (Enter to send, Shift+Enter for newline)"
                rows={1}
                disabled={loading}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-hidden focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 resize-none max-h-24 min-h-[42px] leading-relaxed transition-all disabled:bg-slate-50"
              />
            </div>
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-3.5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0 min-h-[42px] min-w-[42px]"
              title="Send message (Enter)"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </form>

          {/* Footer Safety & Guideline Note */}
          <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 mt-1.5">
            <span>Press <strong>Enter</strong> to send · <strong>Shift+Enter</strong> for newline</span>
            <span className="hidden sm:inline text-slate-400">
              Consequential actions require confirmation in portal
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
