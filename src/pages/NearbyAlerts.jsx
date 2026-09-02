import React from 'react';
import { AlertTriangle, BellRing, CheckCheck, MapPin, Navigation, Radio, RefreshCw, ShieldCheck } from 'lucide-react';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { useAppState } from '../context/StateContext';
import { SafetyCheckInPanel } from '../components/SafetyCheckInPanel';

const severityStyles = {
  CRITICAL: 'border-red-700 bg-red-950/55 text-red-200',
  HIGH: 'border-orange-700 bg-orange-950/45 text-orange-200',
  MEDIUM: 'border-amber-700 bg-amber-950/35 text-amber-100',
  LOW: 'border-blue-800 bg-blue-950/35 text-blue-100',
  INFO: 'border-emerald-800 bg-emerald-950/30 text-emerald-100'
};

export const NearbyAlerts = () => {
  const {
    notifications,
    unreadNotificationCount,
    nearbyAlertsEnabled,
    alertLocationStatus,
    notificationPermission,
    enableNearbyAlerts,
    refreshNotifications,
    markNotificationRead,
    markAllNotificationsRead
  } = useAppState();

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100">
      <CitizenNavbar />
      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8">
        <div className="flex flex-col justify-between gap-4 border-b border-gray-800 pb-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-red-400">
              <Radio className="h-3.5 w-3.5 animate-pulse" /> Geo-targeted public safety network
            </div>
            <h1 className="font-heading text-3xl font-black text-white">NEARBY EMERGENCY ALERTS</h1>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-gray-400">
              Warnings created from verified citizen reports and authority feeds are stored in MongoDB and delivered to users inside the affected radius.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={refreshNotifications}
              className="flex items-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2 text-xs font-bold text-gray-200 hover:bg-gray-800"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Refresh
            </button>
            {unreadNotificationCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsRead}
                className="flex items-center gap-2 rounded-xl border border-emerald-800 bg-emerald-950 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900"
              >
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>
        </div>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-blue-800 bg-blue-950/35 p-4 sm:col-span-2">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-200">
              <Navigation className="h-4 w-4" /> Alert location
            </div>
            <p className="mt-2 text-xs text-gray-300">{alertLocationStatus}</p>
            <p className="mt-1 text-[10px] text-gray-500">
              Your location is used only to match active alert radiuses. Browser notification permission: {notificationPermission}.
            </p>
          </div>
          <button
            type="button"
            onClick={enableNearbyAlerts}
            className={`flex min-h-24 flex-col items-center justify-center rounded-2xl border px-4 text-center transition-colors ${
              nearbyAlertsEnabled
                ? 'border-emerald-700 bg-emerald-950/40 text-emerald-200 hover:bg-emerald-900/50'
                : 'border-red-700 bg-red-950/40 text-red-200 hover:bg-red-900/50'
            }`}
          >
            {nearbyAlertsEnabled ? <ShieldCheck className="mb-2 h-6 w-6" /> : <BellRing className="mb-2 h-6 w-6 animate-pulse" />}
            <span className="text-xs font-black">{nearbyAlertsEnabled ? 'UPDATE MY LOCATION' : 'ENABLE NEARBY ALERTS'}</span>
          </button>
        </section>

        <SafetyCheckInPanel />

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-heading text-lg font-bold text-white">
              <AlertTriangle className="h-5 w-5 text-red-400" /> Alert history
            </h2>
            <span className="text-xs font-mono text-gray-500">{unreadNotificationCount} unread</span>
          </div>

          {notifications.length === 0 ? (
            <div className="rounded-3xl border border-gray-800 bg-[#111827] p-10 text-center">
              <BellRing className="mx-auto mb-3 h-8 w-8 text-gray-600" />
              <h3 className="font-bold text-gray-200">No nearby warnings</h3>
              <p className="mt-1 text-xs text-gray-500">Enable your location and new emergency reports in your area will appear here.</p>
            </div>
          ) : notifications.map(notification => (
            <article
              key={notification.id}
              className={`rounded-2xl border p-5 ${severityStyles[notification.severity] || severityStyles.INFO} ${notification.readAt ? 'opacity-65' : 'shadow-lg'}`}
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md border border-current/30 px-2 py-0.5 text-[10px] font-black">{notification.severity}</span>
                    <span className="text-[10px] font-mono uppercase text-gray-400">{notification.category.replaceAll('_', ' ')}</span>
                    {!notification.readAt && <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />}
                  </div>
                  <h3 className="mt-2 font-heading text-lg font-black text-white">{notification.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-200">{notification.message}</p>

                  {notification.alert?.safetyInstructions?.length > 0 && (
                    <ul className="mt-3 space-y-1 rounded-xl bg-black/20 p-3 text-xs text-gray-200">
                      {notification.alert.safetyInstructions.map(instruction => (
                        <li key={instruction} className="flex gap-2">
                          <span className="text-emerald-400">✓</span>{instruction}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="shrink-0 space-y-2 text-right">
                  {notification.distanceKm !== null && (
                    <div className="flex items-center justify-end gap-1 text-xs font-mono text-gray-300">
                      <MapPin className="h-3.5 w-3.5" /> {notification.distanceKm} km away
                    </div>
                  )}
                  <div className="text-[10px] text-gray-500">
                    {new Date(notification.deliveredAt).toLocaleString()}
                  </div>
                  {!notification.readAt && (
                    <button
                      type="button"
                      onClick={() => markNotificationRead(notification.id)}
                      className="rounded-lg bg-white/10 px-3 py-1.5 text-[11px] font-bold text-white hover:bg-white/20"
                    >
                      Acknowledge
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
};
