import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, AlertCircle, FileText, Lock, LogOut, UserCircle2 } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { authService } from '../services/authService';
import { NotificationCenter } from './NotificationCenter';

export const CitizenNavbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useAppState();

  const handleLogout = () => {
    authService.clearSession();
    setCurrentUser(null);
    navigate('/authority/login', { replace: true });
  };

  return (
    <nav className="bg-[#0b111e]/90 backdrop-blur-md border-b border-gray-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-orange-600 to-blue-600 flex items-center justify-center shadow-lg shadow-red-500/20 border border-red-400/30 group-hover:scale-105 transition-transform">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-black text-2xl tracking-wider bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ResQNet
              </span>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold uppercase">
                EMERGENCY PORTAL
              </span>
            </div>
            <p className="text-[10px] text-gray-400 font-medium hidden sm:block">
              From fragmented disaster reports to coordinated action.
            </p>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-3">
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
      </div>
    </nav>
  );
};
