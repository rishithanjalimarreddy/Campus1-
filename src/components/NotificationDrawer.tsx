import React from 'react';
import { useCampus } from '../context/CampusContext';
import {
  Bell,
  X,
  CheckCheck,
  Calendar,
  Library,
  GraduationCap,
  Info
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead
  } = useCampus();

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'library':
        return <Library className="w-4 h-4 text-blue-600" />;
      case 'exam':
        return <GraduationCap className="w-4 h-4 text-amber-600" />;
      case 'timetable':
        return <Calendar className="w-4 h-4 text-indigo-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-2xs">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-sm bg-white shadow-2xl border-l border-slate-200 flex flex-col">
          
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-indigo-600" />
              <h2 className="text-sm font-bold text-slate-900">
                Institutional Notifications
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={markAllNotificationsAsRead}
                className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                title="Mark all as read"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark All Read</span>
              </button>
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                No notifications at this time.
              </div>
            ) : (
              notifications.map(item => (
                <div
                  key={item.id}
                  onClick={() => {
                    markNotificationAsRead(item.id);
                    if (item.actionLink) {
                      onNavigate(item.actionLink);
                      onClose();
                    }
                  }}
                  className={`p-4 transition-colors cursor-pointer space-y-1 ${
                    item.read ? 'bg-white hover:bg-slate-50' : 'bg-indigo-50/40 hover:bg-indigo-50/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold text-slate-900">
                      {getIcon(item.type)}
                      <span>{item.title}</span>
                    </div>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    {item.message}
                  </p>
                  <div className="text-[10px] text-slate-400 pt-1">
                    {item.timestamp}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            PWA service worker in-app messaging queue
          </div>
        </div>
      </div>
    </div>
  );
};
