import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { authService } from '../services/authService';
import {
  Shield,
  Lock,
  Radio,
  Key,
  ArrowRight,
  UserCheck,
  UserPlus,
  Database,
  Building2,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser, addToast } = useAppState();

  const [mode, setMode] = useState('LOGIN'); // 'LOGIN' or 'REGISTER'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbStatus, setDbStatus] = useState({ status: 'CHECKING', dbEngine: 'Loading...' });

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: 'admin@resqnet.gov.in',
    phone: '+91 94370 10100',
    password: 'admin123',
    role: 'ADMIN',
    district: 'Khordha',
    badgeNumber: 'OSDMA-EOC-01'
  });

  // Check DB status on mount
  useEffect(() => {
    authService.getDbStatus().then(res => setDbStatus(res));
  }, []);

  // 1-Click Demo Credential Presets
  const demoAccounts = [
    {
      title: '🛡️ State EOC Commander',
      email: 'admin@resqnet.gov.in',
      password: 'admin123',
      role: 'ADMIN',
      district: 'Khordha'
    },
    {
      title: '🏛️ Collector Sundargarh',
      email: 'collector.sundargarh@odisha.gov.in',
      password: 'rourkela123',
      role: 'ADMIN',
      district: 'Sundargarh'
    },
    {
      title: '👤 Citizen Account',
      email: 'citizen@resqnet.demo',
      password: 'citizen123',
      role: 'CITIZEN',
      district: 'Khordha'
    }
  ];

  const handleQuickFill = (acc) => {
    setFormData(prev => ({
      ...prev,
      email: acc.email,
      password: acc.password,
      role: acc.role,
      district: acc.district
    }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'LOGIN') {
        const res = await authService.login(formData.email, formData.password);
        setCurrentUser(res.user);
        addToast("Authentication Successful", `Welcome back, ${res.user.name} (${res.user.role}).`, "success");
        if (res.user.role === 'CITIZEN') {
          navigate('/my-reports');
        } else {
          navigate('/authority/dashboard');
        }
      } else {
        const res = await authService.register({
          name: formData.name || 'Disaster Officer',
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          district: formData.district,
          badgeNumber: formData.badgeNumber
        });
        setCurrentUser(res.user);
        addToast("Account Registered", `Welcome to ResQNet, ${res.user.name}!`, "success");
        navigate('/authority/dashboard');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed. Please check credentials.');
      addToast("Authentication Error", err.message || 'Login failed', "critical");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-lg w-full bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10">
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 flex items-center justify-center shadow-xl shadow-blue-500/20 border border-blue-400/30 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            ResQNet EOC Command
          </h1>
          <p className="text-xs text-gray-400">
            Odisha Disaster Management Authority & Citizen Authentication Layer
          </p>
        </div>

        {/* Database & Security Engine Status Banner */}
        <div className="bg-[#151e32] border border-gray-800 rounded-2xl p-3 flex items-center justify-between text-xs font-mono text-gray-300">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-400" />
            <span>Database: <b className="text-white">{dbStatus.dbEngine || 'MongoDB'}</b></span>
          </div>
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded text-[10px] font-bold">
            JWT SECURED
          </span>
        </div>

        {/* Mode Switcher (Sign In vs Register) */}
        <div className="flex bg-[#151e32] p-1 rounded-xl border border-gray-800 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>SIGN IN</span>
          </button>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMessage(''); }}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>REGISTER NEW ACCOUNT</span>
          </button>
        </div>

        {/* 1-Click Quick Fill Demo Accounts */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
            <Key className="w-3 h-3 text-amber-400" />
            <span>Quick-Fill Seeded Accounts:</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-1.5">
            {demoAccounts.map(acc => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleQuickFill(acc)}
                className="bg-[#151e32] hover:bg-blue-950/80 border border-gray-800 hover:border-blue-600 p-2 rounded-xl text-left text-[11px] font-mono transition-all text-gray-300 hover:text-white truncate"
              >
                <div className="font-bold truncate">{acc.title}</div>
                <div className="text-[9px] text-gray-400 truncate">{acc.email}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 rounded-xl p-3 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'REGISTER' && (
            <>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sri Subrat Mohapatra"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-gray-400 block mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                    className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="ADMIN">ADMIN (EOC Command)</option>
                    <option value="AUTHORITY">AUTHORITY (Collector/Officer)</option>
                    <option value="SHELTER_COORDINATOR">SHELTER COORDINATOR</option>
                    <option value="CITIZEN">CITIZEN (Public)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-gray-400 block mb-1">District</label>
                  <select
                    value={formData.district}
                    onChange={e => setFormData({ ...formData, district: e.target.value })}
                    className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                  >
                    <option value="Khordha">Khordha (Bhubaneswar)</option>
                    <option value="Sundargarh">Sundargarh (Rourkela)</option>
                    <option value="Cuttack">Cuttack</option>
                    <option value="Puri">Puri</option>
                    <option value="Balasore">Balasore</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+91 94370 XXXXX"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>
            </>
          )}

          <div>
            <label className="text-xs text-gray-400 block mb-1">Official Email / Username</label>
            <input
              type="email"
              required
              placeholder="user@resqnet.gov.in"
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={e => setFormData({ ...formData, password: e.target.value })}
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <span className="animate-spin">🔄 Authenticating...</span>
            ) : mode === 'LOGIN' ? (
              <>
                <Lock className="w-4 h-4" />
                <span>AUTHENTICATE & ENTER COMMAND</span>
              </>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>CREATE RESQNET ACCOUNT</span>
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Citizen Portal & Proximity Radar
          </Link>
        </div>
      </div>
    </div>
  );
};
