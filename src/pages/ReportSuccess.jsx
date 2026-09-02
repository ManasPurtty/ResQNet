import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { useAppState } from '../context/StateContext';
import {
  findNearestFireStationRescueTeam,
  findNearestHospitalAmbulance,
  findNearestGovernmentSchoolShelter
} from '../services/recommendationEngine';
import {
  CheckCircle2,
  ShieldAlert,
  ArrowRight,
  FileText,
  PlusCircle,
  MapPin,
  Home,
  Flame,
  Building2,
  School,
  Phone,
  Clock,
  BellRing,
  Users
} from 'lucide-react';

export const ReportSuccess = () => {
  const location = useLocation();
  const { resources, shelters } = useAppState();

  const incident = location.state?.incident || {
    id: 'INC-1024',
    location: { name: 'Rasulgarh Canal Basin, Bhubaneswar', lat: 20.2915, lng: 85.8640 },
    priorityScore: 95,
    status: 'Awaiting Rescue'
  };

  const nearestFire = findNearestFireStationRescueTeam(incident.location, resources);
  const nearestAmb = findNearestHospitalAmbulance(incident.location, resources);
  const nearestSchool = findNearestGovernmentSchoolShelter(incident.location, shelters);

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      <main className="flex-1 flex items-center justify-center p-3 sm:p-4 py-5 sm:py-8">
        <div className="max-w-2xl w-full bg-[#111827] border border-gray-800 rounded-3xl p-4 sm:p-8 space-y-5 sm:space-y-6 text-center shadow-2xl relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-emerald-950 border border-emerald-800 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold px-3 py-1 rounded-full uppercase">
              ODISHA STATE EOC NOTIFIED
            </span>
            <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
              EMERGENCY REPORT CONFIRMED
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-lg mx-auto">
              Your report has been logged at the Odisha State Emergency Operations Centre. Priority score computed: <b className="text-red-400 font-mono">{incident.priorityScore}/100</b>.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-4 text-left space-y-2.5 font-mono text-xs">
            <div className="flex flex-wrap justify-between items-center gap-2 border-b border-gray-800 pb-2">
              <span className="text-gray-400">Incident Reference:</span>
              <span className="font-black text-lg text-blue-400">{incident.id}</span>
            </div>

            <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-gray-400">Location:</span>
              <span className="text-left text-gray-200 sm:text-right">{incident.location.name}</span>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-gray-400">Computed Priority Score:</span>
              <span className="text-red-400 font-bold text-sm">{incident.priorityScore} / 100</span>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-2">
              <span className="text-gray-400">Current Status:</span>
              <span className="bg-red-950 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded font-bold">
                {incident.status || 'UNASSIGNED'}
              </span>
            </div>
          </div>

          {incident.communityWarning && (
            <div className="rounded-2xl border border-red-700 bg-gradient-to-r from-red-950/70 to-orange-950/60 p-4 text-left shadow-xl">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-500/40 bg-red-600/20">
                  <BellRing className="h-5 w-5 animate-pulse text-red-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-red-200">Nearby community warned</span>
                    <span className="rounded bg-red-700 px-2 py-0.5 text-[10px] font-bold text-white">
                      {incident.communityWarning.radiusKm} KM RADIUS
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-gray-200">
                    {incident.communityWarning.alert?.message}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-3 text-[11px] font-mono text-red-200">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {incident.communityWarning.recipientsNotified} registered nearby user(s) notified
                    </span>
                    {incident.fusion?.mergedWithExistingIncident && (
                      <span>✓ Merged into verified incident {incident.fusion.clusterId}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USER'S DESIGNATED NEARBY EVACUATION SHELTER (GOVERNMENT SCHOOL) */}
          {nearestSchool && (
            <div className="bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-800/90 rounded-2xl p-4 text-left space-y-2 shadow-xl">
              <div className="flex flex-col items-start gap-2 border-b border-emerald-800/60 pb-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-1.5 font-heading font-bold text-xs text-emerald-300 uppercase tracking-wider">
                  <School className="w-4 h-4 text-emerald-400" />
                  <span>Your Nearest Designated Evacuation School Shelter</span>
                </div>
                <span className="bg-emerald-900 text-emerald-200 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                  📍 {nearestSchool.distanceKm} km away
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <h4 className="font-heading font-bold text-sm text-white">
                  🏫 {nearestSchool.shelter.name}
                </h4>
                <p className="text-[11px] text-gray-300">
                  📍 {nearestSchool.shelter.location.name}
                </p>
                <div className="flex flex-col gap-1 text-[11px] text-emerald-300 font-mono pt-1 sm:flex-row sm:flex-wrap sm:gap-4">
                  <span>Available Beds: <b>{nearestSchool.shelter.available}</b></span>
                  <span>Drinking Water & Kitchen Ready</span>
                </div>
              </div>

              {nearestSchool.shelter.authorizedEmergencyContact && (
                <div className="text-[10px] bg-[#0d1322] p-2 rounded-lg border border-emerald-900/60 flex flex-col items-start gap-1 text-gray-300 font-mono sm:flex-row sm:items-center sm:justify-between">
                  <span>Contact: {nearestSchool.shelter.authorizedEmergencyContact.name}</span>
                  <span className="text-emerald-400 font-bold">{nearestSchool.shelter.authorizedEmergencyContact.phone}</span>
                </div>
              )}
            </div>
          )}

          {/* AUTO-NOTIFIED NEAREST RESCUE UNITS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-left text-xs">
            {nearestFire && (
              <div className="bg-[#151e32] border border-orange-900/60 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-orange-300 text-[11px]">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Nearest Fire Station Alerted</span>
                </div>
                <div className="font-semibold text-gray-200 truncate">{nearestFire.resource.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">📍 {nearestFire.distanceKm} km | ETA ~{nearestFire.etaMinutes} mins</div>
              </div>
            )}

            {nearestAmb && (
              <div className="bg-[#151e32] border border-blue-900/60 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-blue-300 text-[11px]">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Nearest Hospital Ambulance</span>
                </div>
                <div className="font-semibold text-gray-200 truncate">{nearestAmb.resource.name}</div>
                <div className="text-[10px] text-gray-400 font-mono">📍 {nearestAmb.distanceKm} km | ETA ~{nearestAmb.etaMinutes} mins</div>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/my-reports"
              className="flex-1 py-3.5 rounded-xl font-heading font-bold text-xs bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
            >
              <FileText className="w-4 h-4" />
              <span>Track My Report</span>
            </Link>

            <Link
              to="/report"
              className="flex-1 py-3.5 rounded-xl font-heading font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4 text-orange-400" />
              <span>Report Another Emergency</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};
