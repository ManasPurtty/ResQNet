import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, BellRing, Check, MapPin, Navigation, ShieldAlert } from 'lucide-react';
import { useAppState } from '../context/StateContext';

const severityClass = severity => {
  if (severity === 'CRITICAL') return 'border-red-700 bg-red-950/70 text-red-100';
  if (severity === 'HIGH') return 'border-orange-700 bg-orange-950/60 text-orange-100';
  return 'border-amber-800 bg-amber-950/40 text-amber-100';
};

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadNotificationCount,
    markNotificationRead,
    nearbyAlertsEnabled,
    alertLocationStatus,
    enableNearbyAlerts
  } = useAppState();

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(previous => !previous)}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
          unreadNotificationCount > 0
            ? 'border-red-600 bg-red-950 text-red-300'
            : 'border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800'
        }`}
        aria-label="Nearby emergency alerts"
      >
        {unreadNotificationCount > 0
          ? <BellRing className="h-4 w-4 animate-pulse" />
          : <Bell className="h-4 w-4" />}
        {unreadNotificationCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 min-w-5 rounded-full bg-red-600 px-1 text-center text-[10px] font-black leading-5 text-white">
            {Math.min(99, unreadNotificationCount)}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed left-3 right-3 top-[4.5rem] z-50 w-auto overflow-hidden rounded-2xl border border-gray-700 bg-[#0d1423] shadow-2xl shadow-black/50 sm:absolute sm:left-auto sm:right-0 sm:top-12 sm:w-[min(92vw,24rem)]">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <ShieldAlert className="h-4 w-4 text-red-400" />
                Nearby Emergency Alerts
              </div>
              <div className="mt-0.5 text-[10px] text-gray-400">{alertLocationStatus}</div>
            </div>
            <span className="rounded-full bg-red-950 px-2 py-0.5 text-[10px] font-bold text-red-300">
              {unreadNotificationCount} NEW
            </span>
          </div>

          {!nearbyAlertsEnabled && (
            <div className="border-b border-gray-800 bg-blue-950/30 p-3">
              <p className="mb-2 text-[11px] leading-relaxed text-blue-100">
                Share your current area to receive MongoDB-backed warnings reported near you.
              </p>
              <button
                type="button"
                onClick={enableNearbyAlerts}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500"
              >
                <Navigation className="h-3.5 w-3.5" />
                Enable Nearby Alerts
              </button>
            </div>
          )}

          <div className="max-h-80 space-y-2 overflow-y-auto p-3">
            {notifications.length === 0 ? (
              <div className="py-7 text-center text-xs text-gray-500">
                <Bell className="mx-auto mb-2 h-6 w-6" />
                No emergency warnings near your saved area.
              </div>
            ) : notifications.slice(0, 6).map(notification => (
              <button
                type="button"
                key={notification.id}
                onClick={() => !notification.readAt && markNotificationRead(notification.id)}
                className={`w-full rounded-xl border p-3 text-left transition-opacity ${severityClass(notification.severity)} ${
                  notification.readAt ? 'opacity-55' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-xs font-bold">{notification.title}</div>
                  {notification.readAt
                    ? <Check className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    : <span className="h-2 w-2 shrink-0 rounded-full bg-red-400" />}
                </div>
                <p className="mt-1 line-clamp-3 text-[11px] leading-relaxed text-gray-200">
                  {notification.message}
                </p>
                {notification.distanceKm !== null && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-mono text-gray-400">
                    <MapPin className="h-3 w-3" />
                    {notification.distanceKm} km from your saved location
                  </div>
                )}
              </button>
            ))}
          </div>

          <Link
            to="/nearby-alerts"
            onClick={() => setOpen(false)}
            className="block border-t border-gray-800 px-4 py-3 text-center text-xs font-bold text-blue-300 hover:bg-gray-800/60 hover:text-blue-200"
          >
            View all nearby alerts
          </Link>
        </div>
      )}
    </div>
  );
};
