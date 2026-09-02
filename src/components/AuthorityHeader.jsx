import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { authService } from '../services/authService';
import {
  Shield,
  Activity,
  Radio,
  Play,
  Bell,
  AlertTriangle,
  LayoutDashboard,
  Layers,
  Truck,
  Home,
  BarChart3,
  LogOut,
  Sparkles,
  RefreshCw,
  Waves,
  Menu,
  X
} from 'lucide-react';

export const AuthorityHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    isLiveSimulation,
    setIsLiveSimulation,
    isDemoPlaying,
    demoStep,
    runDemoMode,
    simulateNewAlert,
    alerts,
    currentUser,
    setCurrentUser
  } = useAppState();

  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    navigate('/authority/login', { replace: true });
  };

  const navItems = [
    { label: 'EOC Dashboard', path: '/authority/dashboard', icon: LayoutDashboard },
    { label: 'Incidents', path: '/authority/incidents', icon: Layers },
    { label: 'Flood Intel', path: '/authority/flood-intelligence', icon: Waves },
    { label: 'Resources', path: '/authority/resources', icon: Truck },
    { label: 'Shelters', path: '/authority/shelters', icon: Home },
    { label: 'Alerts', path: '/authority/alerts', icon: AlertTriangle, badge: alerts.length },
    { label: 'Analytics', path: '/authority/analytics', icon: BarChart3 }
  ];

  return (
    <header className="bg-[#0b111e] border-b border-gray-800 text-white sticky top-0 z-40 shadow-xl">
      {/* Top Banner Ticker */}
      <div className="bg-[#111827] px-3 sm:px-4 py-1.5 border-b border-gray-800/80 text-xs flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-mono font-bold tracking-wider text-emerald-400 whitespace-nowrap">
              <span className="sm:hidden">ONLINE</span><span className="hidden sm:inline">SYSTEM OPERATIONAL</span>
            </span>
          </div>

          <span className="hidden sm:inline text-gray-600">|</span>

          <div className="hidden sm:flex items-center gap-2 text-gray-300 min-w-0">
            <span className="bg-red-500/20 text-red-400 px-2 py-0.5 rounded font-mono font-semibold text-[10px] border border-red-500/30">
              ACTIVE DISASTER
            </span>
            <span className="font-medium text-gray-200 truncate">
              FLOOD RESPONSE — ADYAR & COOUM BASIN
            </span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          {/* Live Simulation Toggle */}
          <button
            onClick={() => setIsLiveSimulation(!isLiveSimulation)}
            className={`flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 rounded-full font-mono text-[10px] sm:text-[11px] font-semibold border transition-all ${
              isLiveSimulation
                ? 'bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveSimulation ? 'animate-pulse text-blue-400' : ''}`} />
            <span className="sm:hidden">SIM: {isLiveSimulation ? 'ON' : 'OFF'}</span>
            <span className="hidden sm:inline">LIVE SIMULATION: {isLiveSimulation ? 'ON' : 'OFF'}</span>
          </button>

          <span className="hidden sm:inline text-gray-600">|</span>
          <span className="hidden min-[360px]:inline font-mono text-[10px] sm:text-xs text-gray-400">{currentTime}</span>
        </div>
      </div>

      {/* Main Command Bar */}
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand Title */}
        <div className="flex items-center gap-3">
          <Link to="/authority/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-xl tracking-wider text-white">
                  ResQNet
                </span>
                <span className="hidden min-[350px]:inline bg-blue-950 text-blue-400 border border-blue-800 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase whitespace-nowrap">
                  EOC COMMAND
                </span>
              </div>
              <p className="text-[10px] text-gray-400 tracking-wide hidden sm:block">
                Sense. Understand. Prioritize. Allocate. Respond.
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden xl:flex items-center gap-1 bg-[#151e32] p-1 rounded-xl border border-gray-800">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-medium text-xs transition-all relative ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge ? (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Demo Mode Player */}
        <div className="hidden xl:flex items-center gap-2.5">
          {/* Demo Mode Button */}
          <button
            onClick={runDemoMode}
            disabled={isDemoPlaying}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold font-heading transition-all border ${
              isDemoPlaying
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 animate-pulse cursor-wait'
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white border-blue-400/30 shadow-lg shadow-blue-600/20'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            {isDemoPlaying ? (
              <span>DEMO STEP {demoStep}/10 IN PROGRESS...</span>
            ) : (
              <span>DEMO MODE (30-Sec Script)</span>
            )}
          </button>

          {/* Quick Simulate Alert */}
          <button
            onClick={simulateNewAlert}
            title="Simulate IMD Hazard Alert"
            className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900/80 border border-red-800/60 text-red-300 text-xs font-medium transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            <span>Simulate Alert</span>
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-gray-700 flex items-center justify-center text-xs font-bold text-blue-400">
              AD
            </div>
            <div className="hidden lg:block text-left text-[11px]">
              <div className="font-semibold text-gray-200">{currentUser?.name || 'Admin Authority'}</div>
              <div className="text-gray-400 text-[10px]">{currentUser?.email || 'Authority session'}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition-colors ml-1"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 xl:hidden">
          <button
            type="button"
            onClick={runDemoMode}
            disabled={isDemoPlaying}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-700 bg-blue-950 text-amber-300 disabled:opacity-50"
            aria-label={isDemoPlaying ? `Demo step ${demoStep} in progress` : 'Run demo mode'}
          >
            <Sparkles className={`h-4 w-4 ${isDemoPlaying ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(previous => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-200"
            aria-label={mobileMenuOpen ? 'Close command navigation' : 'Open command navigation'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-800 bg-[#0b111e] px-3 pb-4 pt-3 xl:hidden">
          <nav className="grid grid-cols-2 gap-2">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={`relative flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-bold ${isActive ? 'border-blue-500 bg-blue-600 text-white' : 'border-gray-800 bg-gray-900 text-gray-300'}`}>
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                  {item.badge ? <span className="ml-auto rounded-full bg-red-500 px-1.5 text-[9px] text-white">{item.badge}</span> : null}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-gray-800 bg-gray-900/70 p-3">
            <div className="min-w-0 text-xs">
              <div className="truncate font-bold text-gray-200">{currentUser?.name || 'Admin Authority'}</div>
              <div className="truncate text-[10px] text-gray-500">{currentUser?.email || 'Authority session'}</div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button type="button" onClick={simulateNewAlert} className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-800 bg-red-950 text-red-300" aria-label="Simulate hazard alert"><AlertTriangle className="h-4 w-4" /></button>
              <button type="button" onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-800 text-gray-300" aria-label="Log out"><LogOut className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
