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
  AlertCircle,
  Sparkles
} from 'lucide-react';

export const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser, addToast } = useAppState();

  const [tab, setTab] = useState('LOGIN'); // 'LOGIN' or 'SIGNUP'
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dbStatus, setDbStatus] = useState({ status: 'ONLINE', dbEngine: 'MongoDB' });

  // Login Form
  const [loginEmail, setLoginEmail] = useState('admin@resqnet.gov.in');
  const [loginPassword, setLoginPassword] = useState('admin123');

  // User Signup Form (Simple for Citizens)
  const [signupData, setSignupData] = useState({
    name: '',
    phone: '',
    email: '',
    password: ''
  });

  useEffect(() => {
    authService.getDbStatus().then(res => setDbStatus(res));
  }, []);

  // 1-Click Fill Admin Credentials
  const fillAdminCredentials = () => {
    setLoginEmail('admin@resqnet.gov.in');
    setLoginPassword('admin123');
    setTab('LOGIN');
    setErrorMessage('');
    addToast("Admin Credentials Filled", "admin@resqnet.gov.in / admin123", "info");
  };

  // 1-Click Fill Demo Citizen
  const fillCitizenCredentials = () => {
    setLoginEmail('citizen@resqnet.demo');
    setLoginPassword('citizen123');
    setTab('LOGIN');
    setErrorMessage('');
    addToast("Citizen Credentials Filled", "citizen@resqnet.demo / citizen123", "info");
  };

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await authService.login(loginEmail, loginPassword);
      setCurrentUser(res.user);
      addToast("Login Successful", `Welcome, ${res.user.name}!`, "success");

      if (res.user.role === 'ADMIN' || res.user.role === 'AUTHORITY') {
        navigate('/authority/dashboard');
      } else {
        navigate('/my-reports');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Invalid email or password.');
      addToast("Login Failed", err.message || 'Please check your credentials', "critical");
    } finally {
      setLoading(false);
    }
  };

  // Handle User Sign Up (Simple User Registration)
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await authService.register({
        name: signupData.name,
        email: signupData.email,
        phone: signupData.phone,
        password: signupData.password,
        role: 'CITIZEN' // Only Citizen User Signup
      });

      setCurrentUser(res.user);
      addToast("Account Created", `Welcome to ResQNet, ${res.user.name}!`, "success");
      navigate('/my-reports');
    } catch (err) {
      setErrorMessage(err.message || 'Sign up failed.');
      addToast("Sign Up Error", err.message || 'Please check your details', "critical");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-orange-600 to-blue-600 flex items-center justify-center shadow-xl shadow-red-500/20 border border-red-400/30 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            ResQNet Portal
          </h1>
          <p className="text-xs text-gray-400">
            Odisha Real-Time Disaster & Citizen Emergency Network
          </p>
        </div>

        {/* Example Test Credentials for Admin (1-Click) */}
        <div className="bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-800/80 rounded-2xl p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-mono font-bold text-amber-300">
              <Key className="w-3.5 h-3.5" />
              <span>TEST ADMIN CREDENTIALS</span>
            </div>
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-[10px] font-bold px-2.5 py-1 rounded-lg transition-all shadow"
            >
              ⚡ Fill Admin Test
            </button>
          </div>

          <div className="font-mono text-[11px] text-gray-300 flex items-center justify-between border-t border-gray-800/80 pt-1.5">
            <span>Email: <b className="text-white">admin@resqnet.gov.in</b></span>
            <span>Password: <b className="text-white">admin123</b></span>
          </div>
        </div>

        {/* Clean 2-Tab Switcher */}
        <div className="flex bg-[#151e32] p-1 rounded-xl border border-gray-800 text-xs font-mono font-bold">
          <button
            type="button"
            onClick={() => { setTab('LOGIN'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'LOGIN' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>LOGIN</span>
          </button>
          <button
            type="button"
            onClick={() => { setTab('SIGNUP'); setErrorMessage(''); }}
            className={`flex-1 py-2.5 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              tab === 'SIGNUP' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>USER SIGN UP</span>
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-800 rounded-xl p-3 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* TAB 1: LOGIN (User & Admin) */}
        {tab === 'LOGIN' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Email / Username</label>
              <input
                type="email"
                required
                placeholder="name@email.com"
                value={loginEmail}
                onChange={e => setLoginEmail(e.target.value)}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={loginPassword}
                onChange={e => setLoginPassword(e.target.value)}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">🔄 Logging In...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>LOGIN TO RESQNET</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: USER SIGN UP (Simple for Citizens) */}
        {tab === 'SIGNUP' && (
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="Your Full Name"
                value={signupData.name}
                onChange={e => setSignupData({ ...signupData, name: e.target.value })}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-sans"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Mobile Phone Number</label>
              <input
                type="tel"
                required
                placeholder="+91 94370 XXXXX"
                value={signupData.phone}
                onChange={e => setSignupData({ ...signupData, phone: e.target.value })}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="you@email.com"
                value={signupData.email}
                onChange={e => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Create Password (min 6 chars)</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={signupData.password}
                onChange={e => setSignupData({ ...signupData, password: e.target.value })}
                className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-600/30 border border-emerald-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span className="animate-spin">🔄 Creating Account...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>CREATE CITIZEN ACCOUNT</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation Link */}
        <div className="text-center pt-1 border-t border-gray-800">
          <Link
            to="/"
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Citizen Map & Emergency Portal
          </Link>
        </div>
      </div>
    </div>
  );
};
