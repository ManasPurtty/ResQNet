import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAppState } from '../context/StateContext';
import { authService } from '../services/authService';

export const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { setCurrentUser } = useAppState();
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const verifySession = async () => {
      const user = await authService.getProfile();
      if (!isActive) return;

      setCurrentUser(user);
      setIsAuthenticated(Boolean(user));
      setIsCheckingSession(false);
    };

    verifySession();

    return () => {
      isActive = false;
    };
  }, [setCurrentUser]);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#090d16] text-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-800 bg-blue-950/60 px-5 py-4 text-sm text-blue-100">
          <ShieldCheck className="h-5 w-5 animate-pulse text-blue-400" />
          Verifying your secure ResQNet session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/authority/login"
        replace
        state={{ from: location, authRequired: true }}
      />
    );
  }

  return children;
};
