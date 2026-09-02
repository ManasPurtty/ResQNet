import React from 'react';
import { useAppState } from '../context/StateContext';
import { AlertTriangle, CheckCircle, Info, X, ShieldAlert } from 'lucide-react';

export const ToastContainer = () => {
  const { toasts, removeToast } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-3 left-3 right-3 z-50 flex flex-col gap-3 pointer-events-none sm:bottom-5 sm:left-auto sm:right-5 sm:max-w-md sm:w-full sm:px-4">
      {toasts.map(toast => {
        let borderClass = 'border-blue-500/50 bg-slate-900/95 text-blue-100';
        let icon = <Info className="w-5 h-5 text-blue-400 shrink-0" />;

        if (toast.type === 'critical' || toast.type === 'alert') {
          borderClass = 'border-red-500/70 bg-red-950/95 text-red-100 animate-pulse';
          icon = <ShieldAlert className="w-6 h-6 text-red-400 shrink-0" />;
        } else if (toast.type === 'success') {
          borderClass = 'border-emerald-500/60 bg-emerald-950/95 text-emerald-100';
          icon = <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-2xl transition-all duration-300 ${borderClass}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="font-heading font-semibold text-sm tracking-wide">{toast.title}</h4>
              <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-gray-400 hover:text-white p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
