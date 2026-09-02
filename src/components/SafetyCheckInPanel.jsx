import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, HeartPulse, LocateFixed, Radio, ShieldAlert, Users } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { floodIntelligenceService } from '../services/floodIntelligenceService';

export const SafetyCheckInPanel = () => {
  const {
    notifications,
    currentUser,
    addToast,
    floodIntelligenceRevision
  } = useAppState();
  const [forecasts, setForecasts] = useState([]);
  const [myCheckIns, setMyCheckIns] = useState([]);
  const [peopleCount, setPeopleCount] = useState(1);
  const [vulnerablePeople, setVulnerablePeople] = useState(0);
  const [submitting, setSubmitting] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      floodIntelligenceService.getActiveForecasts().catch(() => ({ forecasts: [] })),
      floodIntelligenceService.getMyCheckIns().catch(() => ({ checkIns: [] }))
    ]).then(([forecastData, checkInData]) => {
      if (!active) return;
      setForecasts(forecastData.forecasts || []);
      setMyCheckIns(checkInData.checkIns || []);
    });
    return () => { active = false; };
  }, [currentUser, floodIntelligenceRevision]);

  const target = useMemo(() => {
    const floodAlert = notifications.find(notification => (
      notification.alert?.type === 'FLOOD'
      && ['CRITICAL', 'HIGH'].includes(notification.severity)
    ));
    if (floodAlert) {
      return {
        entityType: 'ALERT',
        entityId: floodAlert.entityId,
        title: floodAlert.title,
        location: floodAlert.alert?.location
      };
    }
    const forecast = forecasts.find(item => ['CRITICAL', 'HIGH'].includes(item.risk));
    return forecast ? {
      entityType: 'FORECAST',
      entityId: forecast.id,
      title: `${forecast.riverName} ${forecast.risk.toLowerCase()} forecast`,
      location: forecast.location
    } : null;
  }, [notifications, forecasts]);

  const existing = target
    ? myCheckIns.find(checkIn => checkIn.entityId === target.entityId)
    : null;

  const submit = async status => {
    if (!target) return;
    setSubmitting(status);
    try {
      const result = await floodIntelligenceService.checkIn({
        entityType: target.entityType,
        entityId: target.entityId,
        status,
        peopleCount,
        vulnerablePeople,
        location: currentUser?.lastKnownLocation || undefined
      });
      setMyCheckIns(previous => [
        result.checkIn,
        ...previous.filter(checkIn => checkIn.entityId !== target.entityId)
      ]);
      addToast(
        status === 'SAFE' ? 'Safety Status Shared' : 'Rescue Request Sent',
        status === 'SAFE'
          ? 'The command centre can now account for your household.'
          : 'Your household and saved location are now visible to rescue coordinators.',
        status === 'SAFE' ? 'success' : 'critical'
      );
    } catch (error) {
      addToast('Check-in Failed', error.message, 'alert');
    } finally {
      setSubmitting('');
    }
  };

  if (!target) {
    return (
      <section className="rounded-2xl border border-gray-800 bg-[#111827] p-5 text-gray-400">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-200">
          <HeartPulse className="h-4 w-4 text-emerald-400" /> Household safety check-in
        </div>
        <p className="mt-2 text-xs">No high-priority flood warning currently requires a household response.</p>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-red-800/70 bg-gradient-to-br from-red-950/65 to-[#111827] p-5 shadow-xl shadow-red-950/20">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div>
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-300">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Response requested
          </div>
          <h2 className="mt-2 font-heading text-xl font-black text-white">ARE YOU AND YOUR HOUSEHOLD SAFE?</h2>
          <p className="mt-1 text-xs text-gray-300">For: {target.title}</p>
        </div>
        {existing && (
          <span className={`rounded-full border px-3 py-1 text-[10px] font-black ${
            existing.status === 'SAFE'
              ? 'border-emerald-700 bg-emerald-950 text-emerald-300'
              : 'border-red-600 bg-red-950 text-red-200'
          }`}>
            CURRENT: {existing.status.replace('_', ' ')}
          </span>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="rounded-xl border border-gray-700 bg-black/20 p-3 text-xs text-gray-300">
          <span className="mb-2 flex items-center gap-2 font-bold"><Users className="h-3.5 w-3.5" /> People with you</span>
          <input type="number" min="1" max="100" value={peopleCount} onChange={event => setPeopleCount(Math.max(1, Number(event.target.value) || 1))} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500" />
        </label>
        <label className="rounded-xl border border-gray-700 bg-black/20 p-3 text-xs text-gray-300">
          <span className="mb-2 flex items-center gap-2 font-bold"><HeartPulse className="h-3.5 w-3.5" /> Children, elderly or disabled</span>
          <input type="number" min="0" max="100" value={vulnerablePeople} onChange={event => setVulnerablePeople(Math.max(0, Number(event.target.value) || 0))} className="w-full rounded-lg border border-gray-700 bg-gray-950 px-3 py-2 text-white outline-none focus:border-blue-500" />
        </label>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400">
        <LocateFixed className="h-3.5 w-3.5" />
        {currentUser?.lastKnownLocation
          ? 'Your saved alert location will be shared with the command centre.'
          : 'No precise location is saved. Enable Nearby Alerts so rescuers receive your location.'}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <button type="button" disabled={Boolean(submitting)} onClick={() => submit('SAFE')} className="flex items-center justify-center gap-2 rounded-xl border border-emerald-600 bg-emerald-700 px-4 py-3 text-sm font-black text-white hover:bg-emerald-600 disabled:opacity-50">
          <CheckCircle2 className="h-5 w-5" /> {submitting === 'SAFE' ? 'SAVING...' : 'I AM SAFE'}
        </button>
        <button type="button" disabled={Boolean(submitting)} onClick={() => submit('NEED_RESCUE')} className="flex items-center justify-center gap-2 rounded-xl border border-red-500 bg-red-600 px-4 py-3 text-sm font-black text-white shadow-lg shadow-red-900/30 hover:bg-red-500 disabled:opacity-50">
          <ShieldAlert className="h-5 w-5" /> {submitting === 'NEED_RESCUE' ? 'SENDING...' : 'I NEED RESCUE'}
        </button>
      </div>
    </section>
  );
};
