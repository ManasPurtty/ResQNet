import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { StateProvider } from './context/StateContext';
import { ToastContainer } from './components/ToastContainer';

import { LandingPage } from './pages/LandingPage';
import { ReportEmergency } from './pages/ReportEmergency';
import { ReportSuccess } from './pages/ReportSuccess';
import { MyReports } from './pages/MyReports';

import { AuthorityLogin } from './pages/AuthorityLogin';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { IncidentsPage, IncidentDetailPage } from './pages/IncidentsPage';
import { ResourcesPage } from './pages/ResourcesPage';
import { SheltersPage } from './pages/SheltersPage';
import { AlertsPage } from './pages/AlertsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

export default function App() {
  return (
    <StateProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Citizen Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/report" element={<ReportEmergency />} />
          <Route path="/report/success" element={<ReportSuccess />} />
          <Route path="/my-reports" element={<MyReports />} />

          {/* Authority Routes */}
          <Route path="/authority/login" element={<AuthorityLogin />} />
          <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
          <Route path="/authority/incidents" element={<IncidentsPage />} />
          <Route path="/authority/incidents/:id" element={<IncidentDetailPage />} />
          <Route path="/authority/resources" element={<ResourcesPage />} />
          <Route path="/authority/shelters" element={<SheltersPage />} />
          <Route path="/authority/alerts" element={<AlertsPage />} />
          <Route path="/authority/analytics" element={<AnalyticsPage />} />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <ToastContainer />
      </BrowserRouter>
    </StateProvider>
  );
}
