import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, BellRing, FileText, Lock, LogOut, Menu, UserCircle2, X } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { authService } from '../services/authService';
import { NotificationCenter } from './NotificationCenter';

export const CitizenNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppState();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    navigate('/authority/login', { replace: true });
  };

  return (
    <nav className="bg-[#0b111e]/90 backdrop-blur-md border-b border-gray-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/30 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-xl sm:text-2xl tracking-wider bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ResQNet
              </span>
              <span className="hidden min-[360px]:inline bg-red-950 text-red-400 border border-red-800 text-[9px] sm:text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase whitespace-nowrap">
                EMERGENCY PORTAL
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
              From fragmented disaster reports to coordinated action.
            </p>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-3">
          {currentUser && <NotificationCenter />}
          <Link
            to="/my-reports"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              location.pathname === '/my-reports'
                ? 'bg-gray-800 text-white border border-gray-700'
                : 'text-gray-300 hover:text-white hover:bg-gray-800/60'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-400" />
            <span>Track My Reports</span>
          </Link>

          <Link
            to="/report"
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-600/30 border border-red-400/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <AlertCircle className="w-4 h-4 animate-bounce" />
            <span>Report Emergency</span>
          </Link>

          {currentUser ? (
            <div className="flex items-center gap-2 ml-1">
              <div className="hidden lg:flex items-center gap-1.5 text-xs text-gray-300 max-w-40">
                <UserCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="truncate">{currentUser.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-800 text-red-200 hover:text-white text-xs font-semibold transition-all shadow"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/authority/login"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-900/90 hover:bg-gray-800 border border-gray-700/80 text-gray-200 hover:text-white text-xs font-semibold transition-all ml-1 shadow"
            >
              <Lock className="w-3.5 h-3.5 text-blue-400" />
              <span>Login / Sign Up</span>
            </Link>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2 md:hidden">
          {currentUser && <NotificationCenter />}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(previous => !previous)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-700 bg-gray-900 text-gray-200"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-gray-800 bg-[#0b111e] px-3 pb-4 pt-3 md:hidden">
          {currentUser && (
            <div className="mb-3 flex items-center gap-2 rounded-xl border border-gray-800 bg-gray-900/70 px-3 py-2.5 text-xs text-gray-300">
              <UserCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              <span className="min-w-0 truncate">{currentUser.name}</span>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link to="/report" className="col-span-2 flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-500/40 bg-gradient-to-r from-red-600 to-orange-600 px-3 py-2.5 text-xs font-black text-white">
              <AlertCircle className="h-4 w-4" /> Report Emergency
            </Link>
            <Link to="/my-reports" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs font-bold text-gray-200">
              <FileText className="h-4 w-4 text-blue-400" /> My Reports
            </Link>
            <Link to="/nearby-alerts" className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs font-bold text-gray-200">
              <BellRing className="h-4 w-4 text-red-400" /> Nearby Alerts
            </Link>
          </div>
          {currentUser ? (
            <button type="button" onClick={handleLogout} className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-red-800 bg-red-950/70 px-3 py-2.5 text-xs font-bold text-red-200">
              <LogOut className="h-4 w-4" /> Logout
            </button>
          ) : (
            <Link to="/authority/login" className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-gray-700 bg-gray-900 px-3 py-2.5 text-xs font-bold text-gray-200">
              <Lock className="h-4 w-4 text-blue-400" /> Login / Sign Up
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};
