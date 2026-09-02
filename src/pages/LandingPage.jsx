import React from 'react';
import { Link } from 'react-router-dom';
import { CitizenNavbar } from '../components/CitizenNavbar';
import { CitizenNearbyLocator } from '../components/CitizenNearbyLocator';
import { useAppState } from '../context/StateContext';
import {
  Shield,
  AlertCircle,
  Radio,
  Sparkles,
  ArrowRight,
  Activity,
  Layers,
  MapPin,
  CheckCircle2,
  SignalHigh,
  Phone,
  PhoneCall,
  School,
  Building2,
  Flame,
  AlertTriangle,
  FileText,
  HeartHandshake
} from 'lucide-react';

export const LandingPage = () => {
  const { myIncidents, shelters, resources, alerts } = useAppState();

  const activeAlert = alerts[0];
  const totalShelterBeds = shelters.reduce((acc, s) => acc + s.capacity, 0);
  const totalOccupiedBeds = shelters.reduce((acc, s) => acc + s.occupied, 0);
  const totalFreeBeds = totalShelterBeds - totalOccupiedBeds;

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col font-sans">
      <CitizenNavbar />

      {/* Top Official Odisha Early-Warning Alert Ticker */}
      {activeAlert && (
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-orange-950 border-b border-red-800/80 px-4 py-2.5 text-xs font-mono">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-red-200">
            <div className="flex min-w-0 items-start sm:items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping shrink-0"></span>
              <span className="font-bold text-white bg-red-800 px-2 py-0.5 rounded text-[10px] uppercase">
                {activeAlert.severity} WARNING
              </span>
              <span className="min-w-0 line-clamp-2 font-semibold sm:truncate">{activeAlert.title}</span>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-red-300 shrink-0">
              <span>Region: <b className="text-white">{activeAlert.affectedRegion.split(',')[0]}</b></span>
              <Link to="/report" className="text-white underline font-bold hover:text-amber-300">
                Seek Assistance →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-8 sm:space-y-10">
        
        {/* Hero Section: Citizen Emergency Command */}
        <section className="space-y-6 text-center max-w-3xl mx-auto">
          <div className="inline-flex max-w-full items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/90 border border-blue-800 text-blue-400 text-[10px] sm:text-xs leading-relaxed text-center font-mono font-semibold shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            ODISHA STATE REAL-TIME DISASTER & CITIZEN SAFETY NETWORK
          </div>

          <h1 className="font-heading font-black text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1]">
            Emergency Help & Nearby Evacuation Shelters.{' '}
            <span className="bg-gradient-to-r from-red-500 via-orange-400 to-blue-400 bg-clip-text text-transparent">
              Right at Your Location.
            </span>
          </h1>

          <p className="text-gray-300 text-sm sm:text-lg leading-relaxed font-normal">
            Instantly detect nearest Government School Shelters, 108 Hospital Ambulances, and Fire Stations in your area. Report emergencies in 1-tap with automatic state coordination.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/report"
              className="w-full sm:w-auto px-4 sm:px-8 py-4 rounded-2xl font-heading font-bold text-xs sm:text-sm bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-2xl shadow-red-600/40 border border-red-400/30 transition-all flex items-center justify-center gap-2.5 text-center transform hover:-translate-y-0.5"
            >
              <AlertCircle className="w-5 h-5 animate-pulse" />
              <span>REPORT EMERGENCY (1-TAP SOS)</span>
            </Link>

            <Link
              to="/my-reports"
              className="w-full sm:w-auto px-4 sm:px-8 py-4 rounded-2xl font-heading font-bold text-xs sm:text-sm bg-[#151e32] hover:bg-gray-800 text-white border border-gray-700 shadow-xl transition-all flex items-center justify-center gap-2.5 text-center transform hover:-translate-y-0.5"
            >
              <FileText className="w-5 h-5 text-blue-400" />
              <span>TRACK MY REPORT ({myIncidents.length})</span>
            </Link>
          </div>

          {/* 24x7 Official Emergency Helplines Strip */}
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-gray-400">
            <span className="text-gray-500 uppercase">24x7 State Helplines:</span>
            <a href="tel:1070" className="bg-[#151e32] px-3 py-1 rounded-lg border border-gray-800 text-amber-300 font-bold hover:border-amber-500 flex items-center gap-1">
              📞 1070 (OSDMA Control)
            </a>
            <a href="tel:112" className="bg-[#151e32] px-3 py-1 rounded-lg border border-gray-800 text-red-300 font-bold hover:border-red-500 flex items-center gap-1">
              🚨 112 (Emergency)
            </a>
            <a href="tel:108" className="bg-[#151e32] px-3 py-1 rounded-lg border border-gray-800 text-blue-300 font-bold hover:border-blue-500 flex items-center gap-1">
              🚑 108 (Ambulance)
            </a>
            <a href="tel:101" className="bg-[#151e32] px-3 py-1 rounded-lg border border-gray-800 text-orange-300 font-bold hover:border-orange-500 flex items-center gap-1">
              🚒 101 (Fire)
            </a>
          </div>
        </section>

        {/* FEATURED: Live Citizen Proximity Radar & Nearby Facility Locator */}
        <section id="nearby-locator" className="pt-2">
          <CitizenNearbyLocator />
        </section>

        {/* 4 Essential Citizen Safety & Resource Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: School Shelter Network */}
          <div className="bg-[#111827] border border-emerald-900/60 rounded-3xl p-6 space-y-3 shadow-xl hover:border-emerald-500/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center text-emerald-400 text-xl">
              🏫
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Government School Shelters</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Equipped with RO drinking water, power generator backups, wheelchair ramps, and community kitchens.
            </p>
            <div className="text-xs font-mono text-emerald-400 pt-2 border-t border-gray-800">
              Statewide Free Beds: <b>{totalFreeBeds}</b> / {totalShelterBeds}
            </div>
          </div>

          {/* Card 2: Offline SMS / IVR Protocol */}
          <div className="bg-[#111827] border border-amber-900/60 rounded-3xl p-6 space-y-3 shadow-xl hover:border-amber-500/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 text-xl">
              📱
            </div>
            <h3 className="font-heading font-bold text-lg text-white">Zero Internet SMS Fallback</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              If cellular internet collapses, text: <br />
              <code className="text-amber-300 bg-black/40 px-1.5 py-0.5 rounded font-mono text-[11px]">FLOOD [PEOPLE] [LOCATION]</code> to <b className="text-white">+91 94370 88221</b>.
            </p>
            <div className="text-xs font-mono text-amber-400 pt-2 border-t border-gray-800">
              Direct ingestion into State EOC
            </div>
          </div>

          {/* Card 3: 108 Emergency Medical Response */}
          <div className="bg-[#111827] border border-blue-900/60 rounded-3xl p-6 space-y-3 shadow-xl hover:border-blue-500/60 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-800 flex items-center justify-center text-blue-400 text-xl">
              🚑
            </div>
            <h3 className="font-heading font-bold text-lg text-white">108 ALS Ambulance Hubs</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Mobile ICU units equipped with defibrillators, oxygen supplies, and trauma paramedics across every Odisha district.
            </p>
            <div className="text-xs font-mono text-blue-400 pt-2 border-t border-gray-800">
              Average State Response ETA: <b>~5-7 mins</b>
            </div>
          </div>

          {/* Card 4: Authority Command Dashboard */}
          <div className="bg-[#111827] border border-red-900/60 rounded-3xl p-6 space-y-3 shadow-xl hover:border-red-500/60 transition-colors flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-950 border border-red-800 flex items-center justify-center text-red-400 text-xl">
                🛡️
              </div>
              <h3 className="font-heading font-bold text-lg text-white">Disaster Authority EOC</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                Official command portal for District Collectors, ODRAF, Fire Officers, and School Shelter coordinators.
              </p>
            </div>
            <Link
              to="/authority/login"
              className="w-full py-2.5 rounded-xl font-heading font-bold text-xs bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition-all flex items-center justify-center gap-1.5"
            >
              <span>Authority Login</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-[#0b111e] border-t border-gray-800 py-8 text-center text-xs text-gray-500">
        <p>ResQNet — Odisha Real-Time Disaster Early-Warning & Resource Coordination Platform</p>
        <p className="mt-1 font-mono text-[11px] text-gray-600">Smart India Hackathon Project</p>
      </footer>
    </div>
  );
};
