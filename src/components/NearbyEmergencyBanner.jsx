import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, MapPin, ShieldCheck, X } from 'lucide-react';
import { useAppState } from '../context/StateContext';

export const NearbyEmergencyBanner = () => {
  const { currentUser, notifications, markNotificationRead } = useAppState();
  const urgentNotification = notifications.find(notification => (
    !notification.readAt
    && ['COMMUNITY_WARNING', 'OFFICIAL_ALERT'].includes(notification.category)
    && ['CRITICAL', 'HIGH'].includes(notification.severity)
  ));
  const [dismissedId, setDismissedId] = useState(null);

  useEffect(() => {
    if (urgentNotification?.id !== dismissedId) setDismissedId(null);
  }, [urgentNotification?.id]);

  if (!currentUser || !urgentNotification || dismissedId === urgentNotification.id) return null;

  const handleAcknowledge = () => {
    markNotificationRead(urgentNotification.id);
    setDismissedId(urgentNotification.id);
  };

  return (
    <div className="fixed bottom-4 left-1/2 z-[1000] w-[min(94vw,46rem)] -translate-x-1/2 overflow-hidden rounded-2xl border border-red-500 bg-gradient-to-r from-red-950 via-[#341215] to-orange-950 text-white shadow-2xl shadow-red-950/70">
      <div className="h-1 w-full animate-pulse bg-gradient-to-r from-red-500 via-amber-400 to-red-500" />
      <div className="flex items-start gap-3 p-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-400/40 bg-red-600/30">
          <AlertTriangle className="h-6 w-6 animate-pulse text-amber-300" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-red-200">Emergency near you</span>
            <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-black">{urgentNotification.severity}</span>
            {urgentNotification.distanceKm !== null && (
              <span className="flex items-center gap-1 text-[10px] font-mono text-amber-200">
                <MapPin className="h-3 w-3" /> {urgentNotification.distanceKm} km away
              </span>
            )}
          </div>
          <h3 className="mt-1 font-heading text-base font-black">{urgentNotification.title}</h3>
          <p className="mt-1 text-xs leading-relaxed text-red-50">{urgentNotification.message}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleAcknowledge}
              className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-[11px] font-bold text-red-900 hover:bg-red-50"
            >
              <ShieldCheck className="h-3.5 w-3.5" /> I understand
            </button>
            <Link
              to="/nearby-alerts"
              className="rounded-lg border border-red-400/50 bg-red-900/60 px-3 py-1.5 text-[11px] font-bold text-red-100 hover:bg-red-800"
            >
              Safety instructions
            </Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDismissedId(urgentNotification.id)}
          className="rounded-lg p-1 text-red-200 hover:bg-red-900 hover:text-white"
          aria-label="Dismiss warning"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
