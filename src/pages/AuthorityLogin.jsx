import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../context/StateContext';
import { Shield, Lock, Radio, Key, ArrowRight, UserCheck } from 'lucide-react';

export const AuthorityLogin = () => {
  const navigate = useNavigate();
  const { setCurrentUser, addToast } = useAppState();

  const [email, setEmail] = useState('admin@resqnet.demo');
  const [password, setPassword] = useState('admin123');

  const handleLogin = (e) => {
    e.preventDefault();
    const userObj = {
      email,
      name: 'Commander Admin',
      role: 'AUTHORITY'
    };
    localStorage.setItem('resqnet_user', JSON.stringify(userObj));
    setCurrentUser(userObj);
    addToast("Authority Authenticated", "Logged into ResQNet Emergency Operations Command Center.", "success");
    navigate('/authority/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-gray-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md w-full bg-[#111827] border border-gray-800 rounded-3xl p-8 space-y-6 shadow-2xl relative z-10">
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl shadow-blue-500/20 border border-blue-400/30 mx-auto">
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="font-heading font-black text-2xl text-white">
            ResQNet EOC Command
          </h1>
          <p className="text-xs text-gray-400">
            Emergency Operations Center Authority Authentication
          </p>
        </div>

        {/* Demo Credentials Alert Box */}
        <div className="bg-blue-950/50 border border-blue-800/80 rounded-2xl p-4 space-y-2 text-xs text-blue-200">
          <div className="flex items-center gap-1.5 font-bold font-mono text-blue-400">
            <Key className="w-4 h-4" />
            DEMO AUTHORITY CREDENTIALS
          </div>
          <div className="font-mono text-[11px] space-y-1 text-gray-300">
            <div>Email: <b className="text-white">admin@resqnet.demo</b></div>
            <div>Password: <b className="text-white">admin123</b></div>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-gray-400 block mb-1">Official Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-400 block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-[#151e32] border border-gray-700 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-xl font-heading font-bold text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30 border border-blue-400/30 transition-all flex items-center justify-center gap-2 transform active:scale-95"
          >
            <Lock className="w-4 h-4" />
            <span>ENTER COMMAND CENTER</span>
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-xs text-gray-400 hover:text-white transition-colors"
          >
            ← Return to Public Citizen Portal
          </button>
        </div>
      </div>
    </div>
  );
};
