import React, { useState, useEffect } from "react";
import {
  Mail,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  CreditCard,
  Users,
  AlertCircle,
  Shield,
  Bell,
  Home
} from "lucide-react";
import { SCHOOL, OFFICE, SYSTEM } from "../../config/trac.config";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const [contactEmail, setContactEmail] = useState(SCHOOL.contact.email);
  const [officeHours, setOfficeHours] = useState(OFFICE.schedule.full);
  const [catalog, setCatalog] = useState([]);
  const [catalogUnavailable, setCatalogUnavailable] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${SYSTEM.apiBaseUrl}/public/settings`);
        if (response.ok) {
          const data = await response.json();
          if (data.contact_email) setContactEmail(data.contact_email);
          if (data.office_hours) setOfficeHours(data.office_hours);
          setCatalog(Array.isArray(data.document_settings)
            ? data.document_settings.filter(item => item.active !== false && Array.isArray(item.allowedRoles) && item.allowedRoles.length > 0)
            : []);
        } else {
          setCatalogUnavailable(true);
        }
      } catch {
        setCatalogUnavailable(true);
        console.warn('Using TRAC default contact email');
      }
    };
    fetchSettings();
  }, []);

  const feeDescription = (item) => {
    const fee = Number(item.fee || 0).toFixed(2);
    const unit = item.feeUnit || item.fee_unit || 'per_copy';
    const unitLabel = unit === 'per_page' ? 'per page' : unit === 'per_subject' ? 'per subject' : 'per copy';
    return `₱${fee} ${unitLabel}`;
  };

  const catalogGroup = (role, category) => {
    const items = catalog.filter(item => (item.category === 'Forms' ? 'Form' : item.category) === category && item.allowedRoles.includes(role));
    const title = `${role === 'student' ? 'Student' : 'Alumni'} ${category.toLowerCase()}s`;
    return `${title}\n${items.length
      ? items.map(item => `• ${item.name} – ${feeDescription(item)} | ${item.processing_days} working day(s)`).join('\n')
      : '• None currently available'}`;
  };

  const catalogAnswer = catalogUnavailable
    ? 'The current request catalog could not be loaded. Please check the Request Document page or contact the Registrar’s Office for current availability, fees, and processing times.'
    : catalog.length
      ? `You can request the following at ${SCHOOL.shortName}:\n\n${catalogGroup('student', 'Document')}\n\n${catalogGroup('student', 'Form')}\n\n${catalogGroup('alumni', 'Document')}\n\n${catalogGroup('alumni', 'Form')}`
      : 'The current request catalog is loading. Please check back shortly.';

  const processingAnswer = catalogUnavailable
    ? 'Current processing times could not be loaded. Please check the Request Document page for the latest information.'
    : catalog.length
      ? `Processing times for active requests:\n\n${catalog.map(item => `• ${item.name} – ${item.processing_days} working day(s)`).join('\n')}\n\nProcessing days exclude weekends and holidays. ${OFFICE.processing.note}\n\nOffice Schedule: ${officeHours}\nLunch break: ${OFFICE.schedule.lunchBreak} (closed)`
      : 'Current processing times are loading. Please check back shortly.';

  const feeAnswer = catalogUnavailable
    ? 'Current fees could not be loaded. Please check the Request Document page for the latest fee and unit before submitting.'
    : catalog.length
      ? `Current fees for active requests:\n\n${catalog.map(item => `• ${item.name}: ${feeDescription(item)}`).join('\n')}\n\nThe request total is calculated from the fee unit and quantity selected on the request form.`
      : 'Current fees are loading. Please check back shortly.';

  const faqList = [
    {
      category: "Account & Login - TRAC",
      icon: <Users className="w-5 h-5" />,
      questions: [
        {
          question: "How do I create an account at TRAC?",
          answer: `Click 'Sign Up' on the login page. You'll need:\n\n• Your TRAC Student ID Number (00-00000 format)\n• Personal information (Last Name, First Name, Middle Name)\n• Year Level (for students) or Year Graduated (for alumni)\n• Institute and Course (e.g., ICS - BSIT, IAS - BSA, etc.)\n• Email address (required for email notifications)\n• A secure password that meets the requirements\n\nTRAC Institutes: ICS (Computing), ISCJS (Criminology), IVTES (Vocational), IAS (Agriculture), GS (Graduate Studies)`
        },
        {
          question: "How do I reset my password?",
          answer: `Click 'Forgot Password?' on the login page. Enter your registered email address to receive a verification code. Enter the code to set a new password. If you no longer have access to your registered email, visit the Registrar's Office at ${SCHOOL.contact.location} with a valid ID for a manual reset.`
        },
        {
          question: "Can I update my email address?",
          answer: "Yes. You can update your email address directly from your Profile page. Log in, go to Profile, click 'Edit Profile', change your email, and save. Your notifications will then be sent to your new email address."
        },
        {
          question: "I'm an alumnus of TRAC, how do I register?",
          answer: `Alumni can register online by:\n1. Selecting 'Alumni' as the role during sign up\n2. Providing their student ID and graduation year\n3. Filling in their institute, course (e.g., BSA, BSF, BSAB, BSIT, etc.), and email address\n4. Creating a secure password\nOnce registered and verified via email, available documents and forms for alumni appear in the Request Document catalog.\n\nTRAC Programs for Alumni: BSIT, BSIS, BSCRIM, BTVTED, BTLED, BSHM, BSHRRM, BSHT, BSA, BSF, BSAB, MAEd, MSA, MSAgEd, MSAg.Mgt.`
        }
      ]
    },
    {
      category: "Document Requests & Processing - TRAC",
      icon: <FileText className="w-5 h-5" />,
      questions: [
        {
          question: "What documents and forms can I request at TRAC?",
          answer: catalogAnswer
        },
        {
          question: "How long does processing take at TRAC?",
          answer: processingAnswer
        },
        {
          question: "What are the requirements for claiming my document at TRAC?",
          answer: `When picking up your document at ${SCHOOL.contact.location}, bring:\n• Valid ID (school ID, passport, driver's license, etc.)\n• Official Receipt from the Cashier's Office\n• Your Request ID or Tracking Code\n\nIf a representative will claim on your behalf:\n• Authorization letter signed by you\n• Valid ID of both you and your representative\n• Official Receipt\n• Your Request ID or Tracking Code\n\nOffice: ${officeHours}`
        },
        {
          question: "Can I cancel my request?",
          answer: `Yes, but it depends on the current status:\n\n• If your request is still Pending, you can contact the Registrar's Office at ${contactEmail} to cancel it.\n• If it is already Processing, cancellation may no longer be possible.\n• If it is Ready for Pickup, you can simply choose not to claim it. Unclaimed documents are kept for 30 days.\n\nTo cancel, email ${contactEmail} with your Request ID and reason.\nLocation: ${SCHOOL.contact.location}`
        },
        {
          question: "What is the manual process for TOR at TRAC?",
          answer: `TRAC TOR Manual Process:\n1. Proceed to respective department (ICS, ISCJS, IVTES, IAS, GS) and obtain clearance\n2. Proceed to library for clearance\n3. Proceed to cashier\n4. Proceed to Registrar's Office\n5. Return to cashier, if required\n6. Wait for TOR to be processed and released\n\nRequirements for TOR: Bound thesis, Diploma, Permanent Record\nCheck the current catalog for TOR availability, fee, and processing days.`
        },
        {
          question: "What if I received the wrong document or it is damaged?",
          answer: "Report it immediately:\n1. Notify the releasing officer at the counter before leaving.\n2. If discovered after leaving, contact the Registrar's Office within 3 days.\n3. Provide your Request ID and official receipt.\n4. The document will be corrected or replaced at no additional cost."
        }
      ]
    },
    {
      category: "Payment & Fees - TRAC Fee Table",
      icon: <CreditCard className="w-5 h-5" />,
      questions: [
        {
          question: "How do I pay for my request at TRAC?",
          answer: `Payment Process at TRAC:\n1. Submit your request online – you will receive a Request ID and Queue Number.\n2. Proceed to the University Cashier's Office.\n3. Present your Request ID or Tracking Code.\n4. Pay the exact amount shown on your request confirmation.\n5. Keep the official receipt – you will need it to claim your document at Registrar's Office.\n\nNote: Online payment is not yet available. All payments must be made in person at the Cashier's Office.\n\nOffice Hours: ${officeHours}\nReview current catalog fees and fee units on the Request Document page before paying.`
        },
        {
          question: "What are the current TRAC document fees?",
          answer: feeAnswer
        }
      ]
    },
    {
      category: "Email Notifications - TRAC",
      icon: <Bell className="w-5 h-5" />,
      questions: [
        {
          question: "What email notifications will I receive from TRAC?",
          answer: `You will receive an email from ${contactEmail} when:\n\n• Your request has been submitted (confirmation with queue number)\n• Your request is being processed\n• Your document is ready for pickup\n• Your request has been rejected (with reason)\n\nNotifications are sent to the email address registered in your profile. Please check your inbox regularly. Office: ${SCHOOL.contact.location}`
        },
        {
          question: "Why am I not receiving email notifications?",
          answer: `Please check the following:\n1. Make sure the email address in your profile is correct.\n2. Check your spam or junk folder.\n3. Add ${contactEmail} to your contacts.\n4. Ensure your email inbox is not full.\n\nIf the problem persists, update your email address in your Profile page or contact the Registrar's Office at ${SCHOOL.contact.phone}.`
        },
        {
          question: "Can I receive notifications on multiple email addresses?",
          answer: "Currently, notifications are sent to only one email address per account — the one registered in your profile. You can change this email anytime from your Profile page."
        }
      ]
    },
    {
      category: "Tracking & Claiming - TRAC",
      icon: <MapPin className="w-5 h-5" />,
      questions: [
        {
          question: "How do I track my request at TRAC?",
          answer: `There are two ways at ${SCHOOL.shortName}:\n1. Log in to your dashboard – your recent requests are listed there with queue numbers.\n2. Go to the 'Track Status' page and enter your Request ID.\n\nThe statuses you will see are:\n• Pending – Awaiting staff review\n• Processing – Your document is being prepared\n• Ready – Your document is ready for pickup at ${SCHOOL.contact.location}\n• Claimed – You have picked up your document\n• Rejected – The request was declined (reason provided)\n\nOffice: ${officeHours}`
        },
        {
          question: "Where do I claim my documents at TRAC?",
          answer: `Claim your documents at ${SCHOOL.contact.location}. Office hours are ${officeHours}. ${OFFICE.schedule.closedNote}. Bring a valid ID, your official receipt, and your Request ID. Documents must be claimed within 30 days after they become Ready.`
        },
        {
          question: "Can someone else claim my documents?",
          answer: "Yes, with these requirements:\n• An authorization letter signed by you\n• A valid ID of both you and your representative\n• The original official receipt\n• The Request ID or Tracking Code"
        },
        {
          question: "What if I lost my tracking information?",
          answer: `If you misplaced your Request ID or tracking details, log in to your dashboard. All your requests are listed there with queue numbers. You can also check your email for the original confirmation message from ${contactEmail}. If you still cannot find it, contact the Registrar's Office at ${SCHOOL.contact.phone} with your student ID.`
        },
        {
          question: "How long will my documents be kept at TRAC?",
          answer: `Documents that are Ready for Pickup are kept for 30 days at ${SCHOOL.shortName} Registrar. After that, they are returned to storage. It is best to claim them as soon as possible once you receive the Ready notification. Processing is first-come, first-served, so queue length affects wait time.`
        }
      ]
    },
    {
      category: "Technical Support - TRAC",
      icon: <AlertCircle className="w-5 h-5" />,
      questions: [
        {
          question: "What browsers are supported for TRAC REQUEST?",
          answer: "The system works best on up-to-date versions of Google Chrome (recommended), Mozilla Firefox, Microsoft Edge, and Safari. Mobile browsers on smartphones and tablets are also supported."
        },
        {
          question: "Is there a mobile app for TRAC REQUEST?",
          answer: "No separate app is needed. The system is a mobile-responsive website that adjusts automatically to your phone or tablet screen. Simply open your browser and log in as usual. Reuses current architecture for v1 to reduce risk."
        },
        {
          question: "What should I do if I encounter an error?",
          answer: `Try these steps:\n1. Refresh the page.\n2. Clear your browser cache.\n3. Try a different browser.\n4. Check your internet connection.\n\nIf the error continues, contact the Registrar's Office at ${SCHOOL.contact.phone} / ${contactEmail} and provide:\n• A screenshot of the error\n• Your Request ID (if applicable)\n• The time the error occurred\n• The browser you are using`
        },
        {
          question: "How is my data protected at TRAC?",
          answer: `Your information at ${SCHOOL.fullName} is protected through:\n• Encrypted data transmission\n• Secure password storage\n• Strict role-based access controls\n• Compliance with the Data Privacy Act of 2012 (RA 10173)\n• Configurable TRAC data architecture - all school constants in single config file\n\nOnly authorized registrar staff have access to your request details.`
        }
      ]
    }
  ];

  const toggleFAQ = (categoryIndex, questionIndex) => {
    const key = `${categoryIndex}-${questionIndex}`;
    setOpenIndex(openIndex === key ? null : key);
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
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-[#1B5E20] to-[#F9A825] rounded-full mb-4 shadow-lg">
            <FileText className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#1B5E20] to-[#F9A825] bg-clip-text text-transparent mb-3">
            Frequently Asked Questions
          </h1>


        </div>

        <div className="space-y-6">
          {faqList.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-green-50">
              <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">{category.icon}</div>
                  <div><h2 className="text-xl font-bold">{category.category}</h2></div>
                </div>
              </div>

              <div className="divide-y divide-green-50">
                {category.questions.map((faq, questionIndex) => {
                  const key = `${categoryIndex}-${questionIndex}`;
                  return (
                    <div key={key} className="border-b last:border-b-0 border-green-50">
                      <button onClick={() => toggleFAQ(categoryIndex, questionIndex)}
                        className="w-full p-5 text-left flex justify-between items-center hover:bg-[#F1F8E9]/50 transition-colors duration-200"
                        aria-expanded={openIndex === key}>
                        <div className="flex items-start gap-4">
                          <div className="w-8 h-8 bg-gradient-to-r from-[#1B5E20] to-[#F9A825] text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {questionIndex + 1}
                          </div>
                          <div className="text-left"><h3 className="font-semibold text-gray-800">{faq.question}</h3></div>
                        </div>
                        {openIndex === key ? <ChevronUp className="w-5 h-5 text-[#1B5E20]" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                      </button>

                      {openIndex === key && (
                        <div className="px-5 pb-5 ml-12">
                          <div className="bg-gradient-to-r from-[#1B5E20]/5 to-[#F9A825]/10 p-4 rounded-lg border-l-4 border-[#1B5E20]">
                            <p className="text-gray-700 whitespace-pre-line leading-relaxed">{faq.answer}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-xl shadow-lg overflow-hidden">
          <div className="p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Still need help? - {SCHOOL.shortName}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><MapPin className="w-6 h-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">Location</p>
                    <p className="text-white/80 mt-2">{SCHOOL.contact.officeLocation}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Clock className="w-6 h-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">Office Hours</p>
                    <p className="text-white/80 mt-2 whitespace-pre-line">{officeHours}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Mail className="w-6 h-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">Email Support</p>
                    <p className="text-white/80 mt-2">{contactEmail}</p>
                    <p className="text-white/60 text-xs mt-1">Response within 1–2 business days</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0"><Shield className="w-6 h-6 text-white" /></div>
                  <div>
                    <p className="font-semibold text-lg">Data Privacy</p>
                    <p className="text-white/80 mt-2">Your information is protected under<br />Data Privacy Act of 2012 (RA 10173)</p>
                  </div>
                </div>
              </div>
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
