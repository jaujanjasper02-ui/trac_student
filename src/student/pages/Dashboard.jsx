import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaFileAlt,
  FaChartBar,
  FaCheckCircle,
  FaTicketAlt,
  FaUsers,
  FaExclamationTriangle,
  FaSpinner,
  FaClock,
  FaEnvelope
} from "react-icons/fa";
import { SCHOOL, THEME, OFFICE, SYSTEM } from "../../config/trac.config";

export default function Dashboard() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: "",
    id_number: "",
    role: ""
  });

  const [avgProcessingTime, setAvgProcessingTime] = useState(SYSTEM.queue.avgProcessingTime);
  const [officeHours, setOfficeHours] = useState(OFFICE.schedule.display);
  const [contactEmail, setContactEmail] = useState(SCHOOL.contact.email);

  const API_BASE_URL = `${SYSTEM.apiBaseUrl}`;

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/public/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.avg_processing_time) setAvgProcessingTime(data.avg_processing_time);
          if (data.office_hours) setOfficeHours(data.office_hours);
          if (data.contact_email) setContactEmail(data.contact_email);
        }
      } catch {
        console.warn('Using default settings from TRAC config');
      }
    };
    fetchSettings();
  }, [API_BASE_URL]);

  useEffect(() => {
    const savedData = localStorage.getItem("currentUser");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        const user = parsedData.user || parsedData;
        setUserData({
          name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || "Student",
          id_number: user.id_number || user.studentId || "N/A",
          role: user.role || "student"
        });
      } catch {
        navigate("/");
      }
    } else {
      navigate("/");
    }
  }, [navigate]);

  const formatStudentId = (id) => {
    const clean = id.toString().replace(/[-\s]/g, '');
    return clean.length >= 7 ? `${clean.substring(0, 2)}-${clean.substring(2, 7)}` : id;
  };

  return (
    <div className="min-h-screen bg-[#F1F8E9] flex flex-col items-center py-8 px-4 font-sans">

      {/* Header */}
      <section className="w-full max-w-4xl bg-white rounded-2xl p-8 mb-6 shadow-sm border border-green-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              Welcome, <span className="text-[#1B5E20]">{userData.name}</span>!
            </h2>
            <p className="text-slate-500 font-medium">
              ID Number: <span className="font-mono text-slate-700">{formatStudentId(userData.id_number)}</span>
            </p>
          </div>
          <div className="flex flex-col items-center md:items-end">
             <span className="bg-[#F1F8E9] text-[#1B5E20] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-green-200 mb-2">
                {userData.role}
             </span>
             <div className="flex items-center gap-2 text-[#2E7D32] text-sm font-semibold">
                <FaCheckCircle className="animate-pulse" /> System Online
             </div>
          </div>
        </div>
      </section>

      {/* Real-Time Queue Monitor - TRAC Theme */}


      {/* Action Grid - TRAC Theme */}
      <section className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-4xl mb-8">
        <button onClick={() => navigate("/request")} className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-xl hover:border-[#1B5E20] transition-all group text-left">
          <div className="w-14 h-14 bg-[#1B5E20] text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <FaFileAlt size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Request Document</h3>


        </button>

        <button onClick={() => navigate("/track")} className="bg-white p-8 rounded-2xl border border-green-100 shadow-sm hover:shadow-xl hover:border-[#F9A825] transition-all group text-left">
          <div className="w-14 h-14 bg-[#F9A825] text-white rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
            <FaChartBar size={24} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Track Status</h3>

        </button>
      </section>

      {/* Office Information - DYNAMIC from TRAC config */}
      <section className="w-full max-w-4xl bg-white rounded-2xl p-8 shadow-sm border border-green-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
          <div className="w-1.5 h-6 bg-[#1B5E20] rounded-full"></div>
          Office Information - {SCHOOL.shortName}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#F1F8E9] rounded-lg text-[#1B5E20]"><FaClock /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Office Hours</p>
              <p className="text-sm font-bold text-slate-700">{officeHours}</p>
              <p className="text-xs text-slate-500">{OFFICE.schedule.days}</p>
              <p className="text-[10px] text-amber-600 mt-1">{OFFICE.schedule.closedNote}</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#FFF8E1] rounded-lg text-[#F57F17]"><FaSpinner /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Processing</p>
              <p className="text-sm font-bold text-slate-700">{avgProcessingTime} minutes per request</p>
              <p className="text-xs text-slate-500">Regular Requests</p>
              <p className="text-[10px] text-slate-400 mt-1">First-come, first-served</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-3 bg-green-50 rounded-lg text-[#2E7D32]"><FaEnvelope /></div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Notifications</p>
              <p className="text-sm font-bold text-[#2E7D32]">Email System Active</p>
              <p className="text-xs text-slate-500">Check your inbox</p>
              <p className="text-[10px] text-slate-400 mt-1">{contactEmail}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-green-50">

        </div>
      </section>
    </div>
  );
}
