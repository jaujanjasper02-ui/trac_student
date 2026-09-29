import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaSignOutAlt, FaArrowLeft, FaUserCircle } from "react-icons/fa";
import { SCHOOL, SYSTEM, THEME } from "../../config/trac.config";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState('');

  useEffect(() => {
    const loadAvatar = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const user = storedUser.user || storedUser;
        setAvatarUrl(user.avatar_url || '');

        const token = localStorage.getItem('authToken');
        if (!token) return;

        const response = await fetch(`${SYSTEM.apiBaseUrl}/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) return;

        const data = await response.json();
        const profile = data.profile;
        if (!profile) return;

        setAvatarUrl(profile.avatar_url || '');
        localStorage.setItem('currentUser', JSON.stringify({ ...user, ...profile, name: profile.full_name }));
      } catch {
        setAvatarUrl('');
      }
    };

    loadAvatar();
    window.addEventListener('auth-changed', loadAvatar);
    return () => window.removeEventListener('auth-changed', loadAvatar);
  }, []);

  useEffect(() => {
    if (!showLogoutConfirm) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setShowLogoutConfirm(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [showLogoutConfirm]);

  const isDashboard = location.pathname === "/dashboard";

  const showBackButton = ["/request", "/track", "/help", "/profile", "/faq", "/privacy", "/need-help"].includes(
    location.pathname
  ) || location.pathname.startsWith("/track/");

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("authToken");
    localStorage.removeItem("authResponse");
    setShowLogoutConfirm(false);
    navigate("/");
  };

  const handleLogoClick = () => {
    navigate("/dashboard");
  };

  return (
    <>
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-green-100 bg-white shadow-sm">
        <div className="mx-auto flex min-w-0 max-w-5xl items-center justify-between px-3 py-3 sm:px-6 sm:py-4">

          {/* LEFT: Back Button + Logo + Title */}
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            {showBackButton && (
              <button
                onClick={() => navigate(-1)}
                className="flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full text-[#1B5E20] transition-all duration-200 hover:bg-[#F1F8E9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
                aria-label="Back"
              >
                <FaArrowLeft />
              </button>
            )}

            <button
              onClick={handleLogoClick}
              className="flex min-h-11 min-w-11 shrink-0 items-center justify-center transition-transform hover:scale-105 active:scale-95 focus:outline-none"
              aria-label="Go to Dashboard"
              title="Go to Dashboard"
            >
              <img
                src={SCHOOL.logo}
                alt={`${SCHOOL.shortName} Logo`}
                className="h-10 w-10 cursor-pointer rounded-full border border-green-100 bg-white object-cover shadow-sm sm:h-12 sm:w-12"
                onError={(e) => { e.target.src = SCHOOL.logoFallback; }}
              />
            </button>

            <button
              onClick={handleLogoClick}
              className="min-w-0 flex-1 text-left focus:outline-none"
              aria-label="Go to Dashboard"
            >
                <h1 className="truncate bg-gradient-to-r from-[#1B5E20] to-[#F9A825] bg-clip-text text-sm font-black leading-tight tracking-tight text-transparent sm:text-xl">
                {SCHOOL.systemName}
              </h1>
              <p className="text-[9px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider leading-tight hidden sm:block">
                {SCHOOL.subtitle}
              </p>
              <p className="text-[8px] sm:hidden text-gray-400">
                {SCHOOL.fullName}
              </p>
            </button>
          </div>

          {/* RIGHT: Profile & Logout */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {isDashboard && (
              <>
                <button
                  onClick={() => navigate("/profile")}
                  title="Profile"
                  className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#1B5E20] transition-all hover:bg-[#F1F8E9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9" />
                  ) : (
                    <FaUserCircle className="text-xl sm:text-2xl" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="trac-button flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold sm:px-5 sm:text-sm"
                >
                  <FaSignOutAlt className="text-sm" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            )}
            {!isDashboard && (
              <button
                onClick={() => navigate("/profile")}
                title="Profile"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-full text-[#1B5E20] transition-all hover:bg-[#F1F8E9] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Profile" className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9" />
                ) : (
                  <FaUserCircle className="text-xl sm:text-2xl" />
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      {/* LOGOUT MODAL - TRAC Theme */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-3 backdrop-blur-sm sm:p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="logout-title" className="max-h-[calc(100vh-2rem)] w-full max-w-sm overflow-y-auto rounded-2xl bg-white shadow-2xl">
            {/* Header with TRAC Gradient */}
            <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] px-6 py-4">
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <FaSignOutAlt className="text-white text-xl" />
                </div>
              </div>
            </div>

            <div className="p-6 text-center">
              <h3 id="logout-title" className="mb-2 text-xl font-bold text-gray-800">
                Confirm Logout
              </h3>
              <p className="text-gray-500 text-sm mb-6">
                Are you sure you want to sign out of your account?
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="trac-button-outline flex-1 rounded-xl px-4 py-3 text-sm font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-xl hover:opacity-90 transition font-semibold text-sm shadow-md"
                >
                  Yes, Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
