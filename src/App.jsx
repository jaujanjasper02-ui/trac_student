import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";

// Student Components
import Navbar from "./student/components/Navbar";
import LandingPage from "./student/pages/LandingPage";
import AuthPage from "./student/pages/AuthPage";
import Dashboard from "./student/pages/Dashboard";
import RequestDocument from "./student/pages/RequestDocument";
import TrackStatus from "./student/pages/TrackStatus";
import RequestSubmitted from "./student/pages/RequestSubmitted";
import Profile from "./student/pages/Profile";

// Info Pages
import PrivacyNotice from "./student/pages/PrivacyNotice";
import NeedHelp from "./student/pages/NeedHelp";
import FAQ from "./student/pages/FAQ";

export default function App() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith("/admin");
  const isStudentAuth = location.pathname === "/login";
  const navbarlessStudentRoutes = ["/faq", "/need-help", "/privacy"];
  const showStudentNavbar = !isAdminRoute
    && !isStudentAuth
    && location.pathname !== "/"
    && !navbarlessStudentRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen bg-[#F1F8E9]/20">
      {showStudentNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/request" element={<RequestDocument />} />
        <Route path="/track/:id" element={<TrackStatus />} />
        <Route path="/track" element={<TrackStatus />} />
        <Route path="/submitted" element={<RequestSubmitted />} />
        <Route path="/privacy" element={<PrivacyNotice />} />
        <Route path="/need-help" element={<NeedHelp />} />
        <Route path="/faq" element={<FAQ />} />

        <Route path="*" element={<LandingPage />} />
      </Routes>
    </div>
  );
}
