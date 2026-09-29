import React, { useState, useEffect } from "react";
import {
  Phone, Mail, MapPin, Clock, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, Users, FileText, Shield, HelpCircle, CreditCard, Home
} from "lucide-react";
import { SCHOOL, OFFICE, SYSTEM } from "../../config/trac.config";

export default function NeedHelp() {
  const [openCategory, setOpenCategory] = useState(null);
  const [contactEmail, setContactEmail] = useState(SCHOOL.contact.email);
  const [officeHours, setOfficeHours] = useState(OFFICE.schedule.full);
  const [maxCopies, setMaxCopies] = useState(SYSTEM.requests.maxCopies);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${SYSTEM.apiBaseUrl}/public/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.contact_email) setContactEmail(data.contact_email);
          if (data.office_hours) setOfficeHours(data.office_hours);
          if (Number.isInteger(Number(data.max_copies_per_request)) && Number(data.max_copies_per_request) > 0) {
            setMaxCopies(Number(data.max_copies_per_request));
          }
        }
      } catch {
        console.warn('Using TRAC default contact email');
      }
    };
    fetchSettings();
  }, []);

  const helpCategories = [
    {
      title: "Common Problems & Solutions - TRAC",
      icon: <AlertCircle className="w-5 h-5" />,
      color: "from-[#1B5E20] to-[#2E7D32]",
      items: [
        { problem: "Can't login to my TRAC account", solution: "1. Check if your ID number (00-00000) and password are correct\n2. Use 'Forgot Password?' feature to reset via Email\n3. If still issues, visit Registrar's Office at Sanga-Sanga, Bongao Tawi-Tawi with valid ID\n4. Ensure you selected correct institute (ICS, ISCJS, IVTES, IAS, GS)", icon: <AlertCircle className="w-5 h-5 text-[#1B5E20]" /> },
        { problem: "Not receiving email notifications from TRAC", solution: `1. Check your email address in Profile settings\n2. Check spam/junk folder\n3. Add ${contactEmail} to contacts\n4. Update email at Registrar's Office if needed\n5. System sends from ${contactEmail}`, icon: <Mail className="w-5 h-5 text-[#1B5E20]" /> },
        { problem: "Document request not submitting", solution: `1. Check internet connection\n2. Make sure all required fields are filled\n3. Check that quantity does not exceed the configured limit of ${maxCopies}\n4. You can request each document type once per day\n5. Try using Chrome or Edge browser\n6. Check current fees and processing times on the Request Document page`, icon: <FileText className="w-5 h-5 text-[#F9A825]" /> },
        { problem: "Payment confirmation issues at TRAC Cashier", solution: `1. Bring payment receipt to Cashier's Office for verification\n2. Contact Registrar with payment reference number\n3. Keep official receipt safe until document is claimed\n4. TRAC Office Hours: ${officeHours}`, icon: <CreditCard className="w-5 h-5 text-[#2E7D32]" /> },
        { problem: "Wrong document requested", solution: "1. Contact Registrar immediately if still pending\n2. Provide Request ID and correction needed\n3. Visit office if processing has started\n4. May need to submit a new request\n5. Verify the current item and fee unit on the Request Document page before submitting.", icon: <AlertCircle className="w-5 h-5 text-amber-500" /> }
      ]
    },
    {
      title: "When to Visit the TRAC Registrar Office",
      icon: <Users className="w-5 h-5" />,
      color: "from-[#F9A825] to-[#F57F17]",
      items: [
        { problem: "First-time registration help at TRAC", solution: "For new students who need assistance with account creation or verification. Bring valid ID and know your institute (ICS, ISCJS, IVTES, IAS, GS) and program (BSIT, BSIS, BSCRIM, BTVTED, BTLED, BSHM, BSHRRM, BSHT, BSA, BSF, BSAB).", number: "1" },
        { problem: "Document authentication & CAV", solution: "For alumni documents requiring verification, request the Certificate of Authentication and Verification (CAV) through the approved catalog. Fee and processing follow the current request form.", number: "2" },
        { problem: "Special requests at TRAC", solution: "For requests not available in the online system or urgent/priority requests. Manual process may apply: department clearance, library clearance, cashier, registrar.", number: "3" },
        { problem: "Alumni record issues", solution: "For graduates (MAEd, MSA, MSAgEd, MSAg.Mgt., BSIT, etc.) having trouble registering online or needing verification of old records. Bring Diploma, Permanent Record, Bound thesis for TOR.", number: "4" },
        { problem: "Payment and receipt help", solution: "If you need assistance with payment confirmation or receipt verification at Cashier's Office. Confirm the current fee and fee unit shown on your request confirmation.", number: "5" },
        { problem: "Authorized representatives", solution: "To register SPA (Special Power of Attorney) for document claiming. Requirements: Authorization letter, Valid IDs, Official Receipt, Request ID.", number: "6" }
      ]
    },
    {
      title: "Quick Tips & Best Practices - TRAC",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "from-[#2E7D32] to-[#1B5E20]",
      items: [
        { problem: "Account Security at TRAC", solution: "• Never share your password\n• Use strong passwords with special characters\n• Logout from public computers\n• Update password regularly\n• Your ID format: 00-00000", tip: "Security First" },
        { problem: "Email Notification Management", solution: `• Keep email address updated in Profile\n• Check spam folder regularly\n• Save Request ID and Queue Number for tracking\n• Add ${contactEmail} to contacts\n• TRAC sends from ${contactEmail}`, tip: "Stay Updated" },
        { problem: "Document Requests at TRAC", solution: `• Double-check the document or form before submitting\n• Quantity limit is ${maxCopies} per request\n• You can only request each type once per day\n• Request early before deadlines\n• Review the current fee and unit on the request form\n• Manual process: Clearance → Library → Cashier → Registrar`, tip: "Plan Ahead" },
        { problem: "Office Visits to TRAC", solution: `• Come during office hours: ${officeHours}\n• Lunch break closed: ${OFFICE.schedule.lunchBreak}\n• Bring valid ID and requirements (Thesis, Diploma, Permanent Record for TOR)\n• Check request status online first\n• Avoid peak hours (lunch, 3-5PM)\n• Location: ${SCHOOL.contact.location}`, tip: "Be Prepared" },
        { problem: "Payment Tips at TRAC", solution: "• Pay the exact amount shown on your request confirmation\n• Keep official receipt safe\n• Bring receipt when claiming documents\n• All payments are made at the Cashier's Office\n• Confirm the fee and fee unit shown on the request form before payment", tip: "Payment Wise" },
        { problem: "Tracking Requests at TRAC", solution: "• Use Request ID and Queue Number for tracking\n• Check email for status updates\n• Monitor estimated completion date\n• Claim immediately when ready (within 30 days)\n• First-come, first-served basis", tip: "Track Smart" }
      ]
    }
  ];

  const contactInfo = [
    { icon: <Phone className="w-6 h-6" />, title: "Phone Hotline", detail: SCHOOL.contact.phone, sub: "For urgent concerns - TRAC", gradient: "from-[#1B5E20] to-[#2E7D32]" },
    { icon: <Mail className="w-6 h-6" />, title: "Email Support", detail: contactEmail, sub: "For inquiries and follow-ups", gradient: "from-[#2E7D32] to-[#33691E]" },
    { icon: <MapPin className="w-6 h-6" />, title: "Office Location", detail: "Registrar's Office, TRAC", sub: SCHOOL.footer.location, gradient: "from-[#F9A825] to-[#F57F17]" },
    { icon: <Clock className="w-6 h-6" />, title: "Office Hours", detail: officeHours, sub: `Lunch: ${OFFICE.schedule.lunchBreak}`, gradient: "from-[#1B5E20] to-[#33691E]" },
  ];

  const toggleCategory = (index) => {
    setOpenCategory(openCategory === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F1F8E9]/30 to-white py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6 flex justify-end">
          <a href="/" aria-label="Go to home" title="Home" className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[#1B5E20] text-white shadow-sm transition hover:bg-[#2E7D32] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1B5E20]/30">
            <Home className="h-5 w-5" />
          </a>
        </div>

        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1B5E20] to-[#F9A825] rounded-full mb-4 shadow-lg">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B5E20] to-[#F9A825] bg-clip-text text-transparent mb-3">Need Help? - {SCHOOL.shortName}</h1>
          <p className="text-gray-600 text-lg">We're here to assist you with the {SCHOOL.systemName} - {SCHOOL.fullName}</p>
  
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {contactInfo.map((item, index) => (
            <div key={index} className={`bg-gradient-to-r ${item.gradient} rounded-xl shadow-lg p-5 text-white hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">{item.icon}</div>
                <div className="font-bold text-lg">{item.title}</div>
              </div>
              <div className="text-white/90 font-medium text-sm break-all">{item.detail}</div>
              <div className="text-white/70 text-xs mt-1">{item.sub}</div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {helpCategories.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-green-50">
              <button onClick={() => toggleCategory(categoryIndex)}
                className={`w-full bg-gradient-to-r ${category.color} text-white p-5 flex justify-between items-center hover:opacity-95 transition-opacity`}
                aria-expanded={openCategory === categoryIndex}>
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white/20 rounded-lg">{category.icon}</div>
                  <div className="text-left">
                    <h2 className="text-xl font-bold">{category.title}</h2>
                    <p className="text-white/80 text-sm mt-1">{category.items.length} helpful solutions</p>
                  </div>
                </div>
                {openCategory === categoryIndex ? <ChevronUp className="w-6 h-6 text-white" /> : <ChevronDown className="w-6 h-6 text-white" />}
              </button>

              {openCategory === categoryIndex && (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {category.items.map((item, itemIndex) => (
                      <div key={itemIndex} className="border border-green-100 rounded-lg p-4 hover:border-[#1B5E20]/30 hover:shadow-sm transition-all duration-200">
                        <div className="flex items-start gap-3">
                          {item.icon && <div className="mt-1 flex-shrink-0">{item.icon}</div>}
                          {item.number && (
                            <div className="w-8 h-8 bg-gradient-to-r from-[#1B5E20] to-[#F9A825] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{item.number}</div>
                          )}
                          {item.tip && (
                            <div className="px-3 py-1 bg-gradient-to-r from-[#F1F8E9] to-[#DCEDC8] text-[#1B5E20] rounded-full text-xs font-semibold border border-green-100">{item.tip}</div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-800 mb-2">{item.problem}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{item.solution}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-white" /></div>
              <div>
                <h3 className="text-xl font-bold mb-3">Important Notice - {SCHOOL.shortName}</h3>
                <p className="text-white/90"><strong>For immediate assistance:</strong> Visit the Registrar's Office in person with your valid ID and relevant documents. {officeHours}, {OFFICE.schedule.closedNote}</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/10 rounded-lg p-3"><p className="font-semibold">📞 Phone Support</p><p className="text-sm text-white/80">{SCHOOL.contact.phone} ({officeHours})</p></div>
                  <div className="bg-white/10 rounded-lg p-3"><p className="font-semibold">📧 Email Support</p><p className="text-sm text-white/80">{contactEmail}</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="inline-flex flex-col items-center bg-gradient-to-r from-[#1B5E20]/10 to-[#F9A825]/10 rounded-xl p-6 border border-green-100">
            <h3 className="font-bold text-gray-800 mb-2">Check our FAQ Section - TRAC</h3>
            <p className="text-gray-700 mb-4 max-w-md">Many common questions about TRAC document requests, current fees and processing times, and notifications are already answered.</p>
            <a href="/faq" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white rounded-lg hover:opacity-90 transition-opacity shadow-sm hover:shadow">Go to FAQ Section <ChevronUp className="w-4 h-4 rotate-90" /></a>
          </div>
        </div>

        <div className="mt-10 text-center">
          <p className="text-gray-500 text-sm">{SCHOOL.fullName}<br/>Office of the Campus Registrar • {SCHOOL.footer.location}</p>
         
        </div>
      </div>
    </div>
  );
}
