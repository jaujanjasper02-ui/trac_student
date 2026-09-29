import React, { useEffect, useState } from "react";
import {
  Shield,
  Lock,
  FileText,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  Database,
  UserCheck,
  Bell,
  Clock,
  Home
} from "lucide-react";
import { SCHOOL, OFFICE, SYSTEM } from "../../config/trac.config";

export default function PrivacyNotice() {
  const [openIndex, setOpenIndex] = useState(null);
  const [contactEmail, setContactEmail] = useState(SCHOOL.contact.email);
  const [officeHours, setOfficeHours] = useState(OFFICE.schedule.full);

  useEffect(() => {
    const fetchPublicSettings = async () => {
      try {
        const response = await fetch(`${SYSTEM.apiBaseUrl}/public/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.contact_email) setContactEmail(data.contact_email);
          if (data.office_hours) setOfficeHours(data.office_hours);
        }
      } catch {
        console.warn('Using default contact information');
      }
    };
    fetchPublicSettings();
  }, []);

  const privacySections = [
    {
      title: "About This System & Data Collection",
      icon: <Database className="w-5 h-5" />,
      content: (
        <div>
          <p className="mb-4 text-gray-700">
            The {SCHOOL.systemName} is a "{SCHOOL.subtitle}" designed to enable Students/Alumni to submit document requests, track their status in the digital queue, and receive real-time updates via email. This Privacy Notice explains how we handle your personal information in compliance with the Data Privacy Act of 2012 (Republic Act No. 10173).
          </p>

          <div className="bg-gradient-to-r from-[#1B5E20]/5 to-[#F9A825]/5 p-4 rounded-lg border border-green-100">
            <h4 className="font-semibold text-gray-800 mb-2">What Data We Collect:</h4>
            <ul className="list-disc list-inside text-gray-700 space-y-1">
              <li>Student ID number (format: 00-00000)</li>
              <li>Full name (Last, First, Middle)</li>
              <li>Year level, institute, and course (BSIT, BSIS, BSCRIM, BTVTED, BTLED, BSHM, BSHRRM, BSHT, BSA, BSF, BSAB, MAEd, MSA, MSAgEd, MSAg.Mgt.)</li>
              <li><span className="font-semibold">Email address</span> (for email notifications)</li>
              <li>Document request history and tracking codes (TOR, COR, COG, GWA, CAV, INC, etc.)</li>
              <li>Queue position and status updates</li>
              <li>Payment records and official receipts</li>
            </ul>
          </div>

          <p className="mt-4 text-gray-700">
            Your data is used for processing document requests, managing your position in the queue, sending real-time email updates, and system improvement. We may also use anonymized data for reporting, research, and accreditation purposes.
          </p>
        </div>
      )
    },
    {
      title: "How We Use Your Information",
      icon: <FileText className="w-5 h-5" />,
      content: (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-[#1B5E20]/10 to-[#2E7D32]/10 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-800 mb-2">Queue Management</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Assign queue numbers and track position</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Process document requests in FIFO order (first-come, first-served)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Update request status (Pending, Processing, Ready, Claimed, Rejected)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Calculate processing times based on document type</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-[#F9A825]/10 to-[#F57F17]/10 p-4 rounded-lg border border-amber-100">
              <h4 className="font-semibold text-gray-800 mb-2">Email Notification System</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-[#F57F17]" /><span className="font-medium">Email Alerts:</span> Real-time queue and status updates</li>
                <li className="flex items-center gap-2"><Bell className="w-4 h-4 text-[#F57F17]" /><span className="font-medium">Status Notifications:</span> Detailed status changes via email</li>
              </ul>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-[#1B5E20]/10 to-[#F9A825]/10 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-800 mb-2">Document Processing - TRAC</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><FileText className="w-4 h-4 text-[#1B5E20]" />Available documents and forms, fees, and processing days are shown on the current request form.</li>
                <li className="flex items-center gap-2"><Clock className="w-4 h-4 text-[#1B5E20]" />Track estimated completion dates</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-[#1B5E20]/10 to-[#2E7D32]/10 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-800 mb-2">Payment Processing</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Record payment status and official receipts</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Confirm the current fee and fee unit shown on the request before payment</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Data Protection & Security Measures",
      icon: <Lock className="w-5 h-5" />,
      content: (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-gradient-to-r from-[#1B5E20]/10 to-[#2E7D32]/10 p-4 rounded-lg border border-green-100">
              <h4 className="font-semibold text-gray-800 mb-2">Security Measures</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Secure servers with restricted access</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Encrypted data transmission (SSL/TLS)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Password hashing for account security</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Role-based access control (Students vs Staff)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-[#1B5E20]" />Regular security updates and audits</li>
              </ul>
            </div>
            <div className="bg-gradient-to-r from-[#F9A825]/10 to-[#F57F17]/10 p-4 rounded-lg border border-amber-100">
              <h4 className="font-semibold text-gray-800 mb-2">Data Retention</h4>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Active requests: Until completion + 30 days</li>
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Request history: As required by university policy</li>
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Email logs: 1 year for audit purposes</li>
                <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-600" />Inactive accounts: 2 years before purging</li>
              </ul>
            </div>
          </div>

          <p className="text-gray-700">
            Your personal information will not be shared with third parties except as required by law (CHED, COA) or with your explicit consent. We do not sell, rent, or trade your personal data. All access to your information is logged and monitored.
          </p>
        </div>
      )
    },
    {
      title: "Your Data Privacy Rights",
      icon: <UserCheck className="w-5 h-5" />,
      content: (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
            {[
              { right: "Right to be Informed", desc: "Know how your data is collected and used" },
              { right: "Right to Access", desc: "Request copies of your personal data" },
              { right: "Right to Rectify", desc: "Correct inaccurate or incomplete information" },
              { right: "Right to Erase", desc: "Request deletion of your data (subject to retention policies)" },
              { right: "Right to Object", desc: "Object to data processing for specific purposes" },
              { right: "Right to Data Portability", desc: "Receive your data in electronic format" },
              { right: "Right to Complain", desc: "File complaints with National Privacy Commission" },
            ].map((item, index) => (
              <div key={index} className="bg-gradient-to-r from-[#1B5E20]/5 to-[#F9A825]/5 p-3 rounded-lg hover:from-[#1B5E20]/10 hover:to-[#F9A825]/10 transition-all border border-green-50">
                <div className="font-medium text-gray-800">{item.right}</div>
                <div className="text-sm text-gray-600">{item.desc}</div>
              </div>
            ))}
          </div>
          <p className="text-gray-700 text-sm">
            To exercise any of these rights, please contact our Data Privacy Officer using the contact information below. You will need to provide valid identification and specify the right you wish to exercise.
          </p>
        </div>
      )
    }
  ];

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F8E9]/30 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex justify-end">
          <a href="/" aria-label="Go to home" title="Home" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-sm transition hover:bg-[#2E7D32] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30">
            <Home className="h-5 w-5" />
          </a>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-full mb-4 shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B5E20] to-[#F9A825] bg-clip-text text-transparent mb-3">
            Privacy Notice
          </h1>
          <p className="text-gray-600 text-lg">{SCHOOL.fullName} - {SCHOOL.subtitle}</p>
        </div>

        <div className="space-y-6">
          {privacySections.map((section, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-green-50">
              <button
                onClick={() => toggleSection(index)}
                className="w-full bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white p-5 flex justify-between items-center hover:opacity-95 transition-opacity"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">
                    {section.icon}
                  </div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>
                </div>
                {openIndex === index ? (
                  <ChevronUp className="w-6 h-6 text-white" />
                ) : (
                  <ChevronDown className="w-6 h-6 text-white" />
                )}
              </button>

              {openIndex === index && (
                <div className="p-6">
                  <div className="border-l-4 border-[#1B5E20] pl-4">
                    {section.content}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Contact for Privacy Concerns - {SCHOOL.shortName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Phone Number</p>
                    <p className="text-white/80 mt-2">{SCHOOL.contact.phone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Office Location</p>
                    <p className="text-white/80 mt-2">
                      Office of the Campus Registrar<br/>
                      {SCHOOL.fullName}<br/>
                      {SCHOOL.footer.location} 7500
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Email Address</p>
                    <p className="text-white/80 mt-2">{contactEmail}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                    <UserCheck className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Data Privacy Officer</p>
                    <p className="text-white/80 mt-2">
                      {SCHOOL.shortName} Data Protection Office<br/>
                      Office of the Campus Registrar
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6 pt-6 border-t border-white/20 text-center">
              <p className="text-white/80 text-sm">
                For data privacy concerns or to exercise your rights under RA 10173, contact our Data Privacy Officer.<br/>
                Office Hours: {officeHours}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm">{SCHOOL.systemName} - {SCHOOL.subtitle}</p>

        </div>
      </div>
    </div>
  );
}
