import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaLock,
  FaBookOpen,
  FaGraduationCap,
  FaBuilding,
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaCheckCircle,
  FaGoogle
} from "react-icons/fa";
import { useNavigate, Link } from "react-router-dom";
import { SCHOOL, SYSTEM } from "../../config/trac.config";
import Toast from "../components/Toast";

/* =====================================================
   PASSWORD REQUIREMENTS CHECKLIST COMPONENT
===================================================== */
const PasswordRequirements = ({ password }) => {
  const requirements = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase Letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase Letter", met: /[a-z]/.test(password) },
    { label: "Number (0-9)", met: /[0-9]/.test(password) },
    { label: "Special Character (!@#$%^&*)", met: /[^A-Za-z0-9]/.test(password) },
  ];

  const metCount = requirements.filter(req => req.met).length;
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Good", "Strong", "Very Strong"];
  const strengthColors = ['text-red-600', 'text-orange-600', 'text-yellow-600', 'text-blue-600', 'text-green-600', 'text-green-700'];

  return (
    <div className="mt-2">
      <div className="space-y-1 mb-2">
        {requirements.map((req, idx) => (
          <div key={idx} className="flex items-center">
            <div className={`w-4 h-4 mr-2 flex items-center justify-center rounded-full border ${req.met ? 'bg-green-500 border-green-500' : 'bg-gray-100 border-gray-300'}`}>
              {req.met && <span className="text-white text-xs">✓</span>}
            </div>
            <span className={`text-xs ${req.met ? 'text-green-600' : 'text-gray-500'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>

      {password && (
        <div className="mt-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Password strength:</span>
            <span className={`text-xs font-semibold ${strengthColors[metCount]}`}>
              {strengthLabels[metCount]}
            </span>
          </div>
          <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map(i => (
              <div
                key={i}
                className={`h-1 flex-1 rounded-full ${i <= metCount ?
                  metCount <= 1 ? 'bg-red-500' :
                  metCount === 2 ? 'bg-orange-500' :
                  metCount === 3 ? 'bg-yellow-500' :
                  metCount === 4 ? 'bg-blue-500' : 'bg-green-500'
                  : 'bg-gray-200'}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* =====================================================
   ID NUMBER FORMATTING (00-00000 format)
===================================================== */
const formatIDNumber = (value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 2) return numbers;
  return `${numbers.slice(0, 2)}-${numbers.slice(2, 7)}`;
};

/* =====================================================
   EMAIL VALIDATION
===================================================== */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export default function AuthPage() {
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [academicCatalog, setAcademicCatalog] = useState([]);
  const [academicCatalogLoading, setAcademicCatalogLoading] = useState(true);
  const [academicCatalogError, setAcademicCatalogError] = useState('');

  const API_BASE_URL = `${SYSTEM.apiBaseUrl}/auth`;

  // FORGOT PASSWORD STATES
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState("");
  const [forgotUserId, setForgotUserId] = useState(null);
  const [resetToken, setResetToken] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const [verificationCode, setVerificationCode] = useState(["", "", "", "", "", ""]);
  const [showEnterCode, setShowEnterCode] = useState(false);
  const [codeError, setCodeError] = useState("");
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState('');
  const [verificationPassword, setVerificationPassword] = useState('');
  const [verificationCodeInput, setVerificationCodeInput] = useState(["", "", "", "", "", ""]);
  const [verificationError, setVerificationError] = useState('');
  const [verificationResendTimer, setVerificationResendTimer] = useState(60);
  const [verificationCanResend, setVerificationCanResend] = useState(false);

  const [formData, setFormData] = useState({
    role: 'student',
    id_number: '',
    last_name: '',
    first_name: '',
    middle_name: '',
    year_level: '',
    department: '',
    course: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [toast, setToast] = useState(null);

  const departments = academicCatalog.map(institute => ({
    code: institute.code,
    name: `${institute.code} - ${institute.name}`,
    fullName: institute.name
  }));
  const departmentCourseMap = Object.fromEntries(academicCatalog.map(institute => [
    institute.code,
    institute.programs.map(program => program.name)
  ]));
  const courseDepartmentMap = Object.fromEntries(academicCatalog.flatMap(institute =>
    institute.programs.map(program => [program.name, institute.code])
  ));

  useEffect(() => {
    let isCurrent = true;
    const fetchAcademicCatalog = async () => {
      setAcademicCatalogLoading(true);
      setAcademicCatalogError('');
      try {
        const response = await fetch(`${SYSTEM.apiBaseUrl}/public/settings`);
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Signup options are unavailable right now.');
        const institutes = Array.isArray(data.academic_settings) ? data.academic_settings : [];
        if (!institutes.length) throw new Error('No institutes or courses are currently configured. Contact the Registrar’s Office.');
        if (isCurrent) setAcademicCatalog(institutes.filter(institute => institute.code && institute.name && Array.isArray(institute.programs)));
      } catch (error) {
        if (isCurrent) {
          setAcademicCatalog([]);
          setAcademicCatalogError(error.message || 'Signup options are unavailable right now. Please try again later.');
        }
      } finally {
        if (isCurrent) setAcademicCatalogLoading(false);
      }
    };
    fetchAcademicCatalog();
    return () => { isCurrent = false; };
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    console.log('🔍 AuthPage TRAC - localStorage check:', {
      hasToken: !!token,
      hasUser: !!user
    });
  }, []);

  useEffect(() => {
    let timer;
    if (showEnterCode && resendTimer > 0 && !canResend) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [showEnterCode, resendTimer, canResend]);

  useEffect(() => {
    let timer;
    if (showVerificationModal && verificationResendTimer > 0 && !verificationCanResend) {
      timer = setTimeout(() => setVerificationResendTimer(verificationResendTimer - 1), 1000);
    } else if (verificationResendTimer === 0 && showVerificationModal) {
      setVerificationCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [showVerificationModal, verificationResendTimer, verificationCanResend]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handlePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotError("");
    setIsLoading(true);

    try {
      const payload = { email: forgotEmail };
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to send code');
      setForgotSubmitted(true);
      setShowEnterCode(true);
      setResendTimer(60);
      setCanResend(false);
      setVerificationCode(["", "", "", "", "", ""]);
      setForgotUserId(data.userId);
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail("");
    setForgotSubmitted(false);
    setForgotError("");
    setShowEnterCode(false);
    setShowResetPassword(false);
    setVerificationCode(["", "", "", "", "", ""]);
    setCodeError("");
    setResendTimer(60);
    setCanResend(false);
    setForgotUserId(null);
    setResetToken('');
    setNewPassword('');
    setConfirmNewPassword('');
    setResetError('');
    setIsLoading(false);
  };

  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    const newCode = [...verificationCode];
    newCode[index] = value.replace(/\D/g, '');
    setVerificationCode(newCode);
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
    if (codeError) setCodeError("");
  };

  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleVerifyCode = async () => {
    const code = verificationCode.join('');
    if (code.length !== 6) {
      setCodeError("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: forgotUserId, otpCode: code })
      });
      const data = await response.json();
      if (!response.ok) {
        setCodeError(data.message || 'Invalid code');
        throw new Error(data.message || 'Invalid code');
      }
      setResetToken(data.resetToken);
      setShowResetPassword(true);
      setShowEnterCode(false);
    } catch (err) {
      setCodeError(err.message);
      setVerificationCode(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;
    setIsLoading(true);
    try {
      const payload = { email: forgotEmail };
      const response = await fetch(`${API_BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to resend code');
      setResendTimer(60);
      setCanResend(false);
      setVerificationCode(["", "", "", "", "", ""]);
      setToast({ type: 'success', message: `New code sent to ${forgotEmail}` });
    } catch (err) {
      setForgotError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmNewPassword) {
      setResetError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setResetError("Password must be at least 8 characters");
      return;
    }
    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
    if (!hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setResetError("Password must contain uppercase, lowercase, number, and special character");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: forgotUserId,
          resetToken: resetToken,
          newPassword: newPassword,
          confirmPassword: confirmNewPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to reset password');
      resetForgotPassword();
      setIsSignUp(false);
      setToast({ type: 'success', message: 'Password reset successfully. You can now log in with your new password.' });
    } catch (err) {
      setResetError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    const code = verificationCodeInput.join('');
    if (code.length !== 6) {
      setVerificationError("Please enter a valid 6-digit code");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, otpCode: code })
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Invalid verification code');
        error.data = data;
        throw error;
      }
      setToast({ type: 'success', message: 'Email verified successfully! You can now log in.' });
      setShowVerificationModal(false);
      setVerificationCodeInput(["", "", "", "", "", ""]);
      setVerificationEmail('');
      setVerificationPassword('');
      setVerificationError('');
      setIsSignUp(false);
    } catch (err) {
      if (err.data?.restartSignup) {
        setShowVerificationModal(false);
        setVerificationEmail('');
        setVerificationPassword('');
        setIsSignUp(true);
        setErrors({ general: err.message });
      } else {
        setVerificationError(err.message);
      }
      setVerificationCodeInput(["", "", "", "", "", ""]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!verificationCanResend) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: verificationEmail, password: verificationPassword })
      });
      const data = await response.json();
      if (!response.ok) {
        const error = new Error(data.message || 'Failed to resend code');
        error.data = data;
        throw error;
      }
      const cooldown = data.retryAfterSeconds || 60;
      setVerificationResendTimer(cooldown);
      setVerificationCanResend(false);
      setVerificationCodeInput(["", "", "", "", "", ""]);
      setVerificationError('');
      setToast({ type: 'success', message: 'A new verification code was sent to your email.' });
    } catch (err) {
      if (err.data?.restartSignup) {
        setShowVerificationModal(false);
        setVerificationEmail('');
        setVerificationPassword('');
        setIsSignUp(true);
        setErrors({ general: err.message });
      } else {
        setVerificationError(err.message);
      }
      if (err.data?.retryAfterSeconds) {
        setVerificationResendTimer(err.data.retryAfterSeconds);
        setVerificationCanResend(false);
      } else if (err.data?.deliveryFailed) {
        setVerificationResendTimer(60);
        setVerificationCanResend(false);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const validateIdNumber = (id) => {
    const cleanId = id.replace(/[-\s]/g, '');
    return /^\d{7}$/.test(cleanId);
  };

  const validateYearGraduated = (year) => {
    const currentYear = new Date().getFullYear();
    const gradYear = parseInt(year);
    return gradYear >= 1980 && gradYear <= currentYear;
  };

  const validatePassword = (password) => {
    const requirements = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password)
    ];
    return requirements.every(req => req);
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };
    switch(field) {
      case 'id_number':
        if (isSignUp && !value) newErrors.id_number = 'ID Number is required';
        else if (isSignUp && !validateIdNumber(value)) newErrors.id_number = 'ID Number must be in format: 00-00000 (7 digits)';
        else delete newErrors.id_number;
        break;
      case 'email':
        if (isSignUp && value && !validateEmail(value)) newErrors.email = 'Please enter a valid email address';
        else delete newErrors.email;
        break;
      case 'year_level':
        if (formData.role === 'alumni' && !validateYearGraduated(value)) newErrors.year_level = `Enter a valid graduation year (1980-${new Date().getFullYear()})`;
        else delete newErrors.year_level;
        break;
      case 'password':
        if (isSignUp && !validatePassword(value)) newErrors.password = 'Password must meet all requirements below';
        else if (value.length < 8) newErrors.password = 'Password must be at least 8 characters';
        else delete newErrors.password;
        break;
      case 'confirmPassword':
        if (value !== formData.password) newErrors.confirmPassword = 'Passwords do not match';
        else delete newErrors.confirmPassword;
        break;
      default:
        if (!value && field !== 'middle_name' && field !== 'email') newErrors[field] = 'This field is required';
        else delete newErrors[field];
    }
    setErrors(newErrors);
  };

  const handleCourseChange = (e) => {
    const value = e.target.value;
    handleInputChange('course', value);
    if (courseDepartmentMap[value]) {
      handleInputChange('department', courseDepartmentMap[value]);
    }
  };

  const handleDepartmentChange = (e) => {
    const value = e.target.value;
    handleInputChange('department', value);
    if (value && formData.course) {
      const validCourses = departmentCourseMap[value] || [];
      if (!validCourses.includes(formData.course)) {
        handleInputChange('course', '');
      }
    }
  };

  const formatMiddleName = (name) => {
    if (!name) return '';
    const trimmed = name.trim();
    if (!trimmed) return '';
    return trimmed.charAt(0).toUpperCase();
  };

  const signUpUser = async (userData) => {
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok && !data.requiresVerification) {
      const error = new Error(data.message || 'Signup failed');
      error.data = data;
      throw error;
    }
    return data;
  };

  const signInUser = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data.message || 'Login failed');
      error.data = data;
      throw error;
    }
    return data;
  };

  const openVerificationModal = (email, password, { retryAfterSeconds = 60, message = '' } = {}) => {
    setVerificationEmail(email);
    setVerificationPassword(password);
    setVerificationCodeInput(["", "", "", "", "", ""]);
    setVerificationError(message);
    setVerificationResendTimer(retryAfterSeconds);
    setVerificationCanResend(retryAfterSeconds <= 0);
    setShowVerificationModal(true);
  };

  const saveUserToLocalStorage = (response) => {
    if (!response.token) return false;
    localStorage.setItem("authToken", response.token);
    localStorage.setItem("authResponse", JSON.stringify(response));
    if (response.user) localStorage.setItem("currentUser", JSON.stringify(response.user));
    else if (response.id_number) localStorage.setItem("currentUser", JSON.stringify(response));
    else return false;
    return !!localStorage.getItem('currentUser');
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      if (!formData.id_number || !formData.password) {
        setErrors({ general: 'Please enter your ID and password.' });
        setIsLoading(false);
        return;
      }
      const credentials = { id_number: formData.id_number, password: formData.password };
      const response = await signInUser(credentials);
      if (!response.token) throw new Error('No authentication token received from server');
      const saved = saveUserToLocalStorage(response);
      if (!saved) throw new Error('Failed to save authentication data');
      setSuccessMessage('Login successful! Redirecting...');
      setTimeout(() => navigate("/dashboard"), 500);
    } catch (error) {
      if (error.data?.requiresVerification) {
        openVerificationModal(error.data.email, formData.password, {
          retryAfterSeconds: error.data.retryAfterSeconds || 60,
          message: error.data.deliveryFailed ? error.data.message : ''
        });
        setErrors({ general: error.data.message });
      } else {
        setErrors({ general: error.message || 'Login failed. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      if (academicCatalogLoading || academicCatalogError) {
        throw new Error(academicCatalogError || 'Wait for the current institute and course list to load.');
      }
      const selectedInstitute = academicCatalog.find(institute => institute.code === formData.department);
      if (!selectedInstitute || !selectedInstitute.programs.some(program => program.name === formData.course)) {
        setErrors({ department: 'Select an institute and a course offered by it.' });
        throw new Error('Please select a valid institute and course.');
      }
      if (!formData.last_name) setErrors(prev => ({ ...prev, last_name: 'Last name is required' }));
      if (!formData.first_name) setErrors(prev => ({ ...prev, first_name: 'First name is required' }));
      if (!formData.id_number) setErrors(prev => ({ ...prev, id_number: 'ID Number is required' }));
      if (!formData.password) setErrors(prev => ({ ...prev, password: 'Password is required' }));
      if (!formData.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: 'Please confirm your password' }));
      if (formData.role === 'student' && !formData.year_level) setErrors(prev => ({ ...prev, year_level: 'Please select your year level.' }));
      if (formData.role === 'alumni' && !formData.year_level) setErrors(prev => ({ ...prev, year_level: 'Please enter your graduation year.' }));
      if (Object.keys(errors).length > 0) throw new Error('Please fill in all required fields');
      if (!formData.email || !validateEmail(formData.email)) {
        setErrors(prev => ({ ...prev, email: 'Please enter a valid email address' }));
        throw new Error('Valid email address is required for notifications');
      }
      if (!validateIdNumber(formData.id_number)) {
        setErrors(prev => ({ ...prev, id_number: 'ID Number must be in format: 00-00000 (7 digits)' }));
        throw new Error('Invalid ID number format');
      }
      if (!validatePassword(formData.password)) {
        setErrors(prev => ({ ...prev, password: 'Password must meet all requirements' }));
        throw new Error('Password does not meet requirements');
      }
      if (formData.password !== formData.confirmPassword) {
        setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match.' }));
        throw new Error('Passwords do not match');
      }
      const formattedMiddleName = formatMiddleName(formData.middle_name);
      const userData = {
        role: formData.role,
        id_number: formData.id_number,
        last_name: formData.last_name.trim(),
        first_name: formData.first_name.trim(),
        middle_name: formattedMiddleName,
        year_level: formData.role === 'student' ? formData.year_level : null,
        year_graduated: formData.role === 'alumni' ? formData.year_level : null,
        department: formData.department,
        course: formData.course,
        email: formData.email.trim().toLowerCase(),
        notification_preferences: { email: true },
        password: formData.password,
        confirmPassword: formData.confirmPassword
      };
      const response = await signUpUser(userData);
      if (response.requiresVerification) {
        setFormData({
          role: 'student',
          id_number: '',
          last_name: '',
          first_name: '',
          middle_name: '',
          year_level: '',
          department: '',
          course: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setShowPassword({ password: false, confirmPassword: false });
        openVerificationModal(response.email || userData.email, userData.password, {
          retryAfterSeconds: response.retryAfterSeconds || 60,
          message: response.deliveryFailed ? response.message : ''
        });
        setSuccessMessage(response.deliveryFailed ? '' : response.message);
        return;
      }
      setFormData({
        role: 'student',
        id_number: '',
        last_name: '',
        first_name: '',
        middle_name: '',
        year_level: '',
        department: '',
        course: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setShowPassword({ password: false, confirmPassword: false });
      setSuccessMessage('Account created successfully! You can now login.');
      setTimeout(() => {
        setIsSignUp(false);
        setSuccessMessage('');
      }, 2000);
    } catch (error) {
      if (!errors.general) {
        setErrors(prev => ({ ...prev, general: error.message || 'Signup failed. Please try again.' }));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setErrors({});
    setSuccessMessage('');
  };

  const inputClass = "flex-1 py-2 px-3 bg-[#fafafa] rounded-r-lg outline-none text-sm border border-gray-300 focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] disabled:opacity-50";
  const selectClass = "min-w-0 flex-1 py-2 px-3 bg-[#fafafa] rounded-r-lg outline-none text-sm border border-gray-300 focus:border-[#1B5E20] focus:ring-1 focus:ring-[#1B5E20] disabled:opacity-50";
  const courseSelectClass = `${selectClass} truncate`;
  const iconClass = "shrink-0 text-gray-400 p-2 bg-[#fafafa] rounded-l-lg";

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-b from-white via-[#F9FBE7] to-[#F1F8E9] px-4 py-8 text-gray-800 sm:py-10">
      <Toast type={toast?.type} message={toast?.message} onDismiss={() => setToast(null)} />
      <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <div className="w-full text-center">
        <img src={SCHOOL.logo} alt={`${SCHOOL.shortName} Logo`} className="mx-auto mb-4 h-32 w-32 object-contain sm:h-36 sm:w-36" onError={(e)=>{e.target.src=SCHOOL.logoFallback}} />
        <h1 className="text-4xl font-black leading-tight tracking-tight sm:text-5xl"><span className="text-[#2E7D32]">TRAC</span>{" "}<span className="text-[#F9A825]">REQUEST</span></h1>
        <p className="mb-1 mt-3 text-base font-semibold leading-relaxed text-[#33691E] sm:text-lg">{SCHOOL.subtitle}</p>

      </div>

      <div className="mt-7 w-full max-w-md rounded-2xl border border-[#DCE8D2] bg-white p-6 shadow-lg shadow-[#33691E]/10 sm:p-7">
        <div className="flex bg-[#F1F8E9] rounded-full p-1 mb-5">
          <button
            onClick={() => { setIsSignUp(false); resetForm(); }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${!isSignUp ? "trac-button shadow" : "text-gray-500 hover:text-[#1B5E20]"}`}
            disabled={isLoading}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsSignUp(true); resetForm(); }}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${isSignUp ? "trac-button shadow" : "text-gray-500 hover:text-[#1B5E20]"}`}
            disabled={isLoading}
          >
            Sign Up
          </button>
        </div>

        {errors.general && <div className="mb-3 text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">{errors.general}</div>}
        {successMessage && <div className="mb-3 text-sm text-green-600 bg-green-50 p-2 rounded border border-green-200">{successMessage}</div>}

        {isSignUp ? (
          <form onSubmit={handleSignUp} className="space-y-4">
            {academicCatalogError && (
              <div role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                {academicCatalogError}
              </div>
            )}
            <div className="mt-6 flex justify-center gap-6">
              {["student", "alumni"].map((r) => (
                <label key={r} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="role" value={r} checked={formData.role === r} onChange={() => handleInputChange('role', r)} className="accent-[#1B5E20]" disabled={isLoading} />
                  {r === 'student' ? 'Student' : 'Alumni'}
                </label>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <div className="flex items-center mt-1">
                <FaUser className={iconClass} />
                <input value={formatIDNumber(formData.id_number)} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ''); handleInputChange('id_number', raw.slice(0, 7)); }} onBlur={() => validateField('id_number', formData.id_number)} placeholder="00-00000" className={inputClass} disabled={isLoading} maxLength={8} required />
              </div>
              <p className="text-xs text-gray-500 mt-1">Format: 00-00000</p>
              {errors.id_number && <p className="text-xs text-red-600 mt-1">{errors.id_number}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <div className="flex items-center mt-1">
                <FaUser className={iconClass} />
                <input value={formData.last_name} onChange={(e) => handleInputChange('last_name', e.target.value)} onBlur={() => validateField('last_name', formData.last_name)} placeholder="Enter Last Name" className={inputClass} disabled={isLoading} required />
              </div>
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <div className="flex items-center mt-1">
                <FaUser className={iconClass} />
                <input value={formData.first_name} onChange={(e) => handleInputChange('first_name', e.target.value)} onBlur={() => validateField('first_name', formData.first_name)} placeholder="Enter First Name" className={inputClass} disabled={isLoading} required />
              </div>
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Middle Name <span className="text-gray-500 text-xs">(Optional)</span></label>
              <div className="flex items-center mt-1">
                <FaUser className={iconClass} />
                <input value={formData.middle_name} onChange={(e) => handleInputChange('middle_name', e.target.value)} placeholder="Enter Middle Name" className={inputClass} disabled={isLoading} />
              </div>
            </div>

            {formData.role === "student" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Year Level</label>
                <div className="flex items-center mt-1">
                  <FaGraduationCap className={iconClass} />
                  <select value={formData.year_level} onChange={(e) => handleInputChange('year_level', e.target.value)} onBlur={() => validateField('year_level', formData.year_level)} className={selectClass} disabled={isLoading} required>
                    <option value="" disabled>Select Year Level</option>
                    <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                  </select>
                </div>
                {errors.year_level && <p className="text-xs text-red-600 mt-1">{errors.year_level}</p>}
              </div>
            )}

            {formData.role === "alumni" && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Year Graduated</label>
                <div className="flex items-center mt-1">
                  <FaGraduationCap className={iconClass} />
                  <input type="number" value={formData.year_level} onChange={(e) => handleInputChange('year_level', e.target.value)} onBlur={() => validateField('year_level', formData.year_level)} placeholder="ex. 2020" className={inputClass} disabled={isLoading} min="1980" max={new Date().getFullYear()} required />
                </div>
                {errors.year_level && <p className="text-xs text-red-600 mt-1">{errors.year_level}</p>}
              </div>
            )}

          <div className="w-full">
  <label
    htmlFor="department"
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    Institute / Department
  </label>

  <div className="relative w-full">
    {/* Building Icon */}
    <FaBuilding
      className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      size={16}
    />

    {/* Department Dropdown */}
    <select
      id="department"
      value={formData.department}
      onChange={handleDepartmentChange}
      onBlur={() =>
        validateField("department", formData.department)
      }
      disabled={isLoading || academicCatalogLoading || Boolean(academicCatalogError)}
      required
      className="
        w-full
        h-10
        rounded-md
        border border-gray-300
        bg-white
        pl-10
        pr-10
        text-sm
        text-gray-700
        outline-none
        transition
        focus:border-blue-500
        focus:ring-2
        focus:ring-blue-100
        disabled:bg-gray-100
        disabled:cursor-not-allowed
      "
    >
      <option value="" disabled>
        {academicCatalogLoading ? 'Loading institutes...' : 'Select Institute'}
      </option>

              {departments.map((d) => (
        <option key={d.code} value={d.code}>
          {d.name}
        </option>
      ))}
    </select>
  </div>

  {errors.department && (
    <p className="mt-1 text-xs text-red-600">
      {errors.department}
    </p>
  )}
</div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Course / Program</label>
              <div className="flex min-w-0 items-center mt-1">
                <FaBookOpen className={iconClass} />
                <select value={formData.course} onChange={handleCourseChange} onBlur={() => validateField('course', formData.course)} className={courseSelectClass} disabled={isLoading || academicCatalogLoading || Boolean(academicCatalogError) || !formData.department} required>
                  <option value="" disabled>{academicCatalogLoading ? 'Loading courses...' : 'Select Course'}</option>
                  {formData.department && departmentCourseMap[formData.department]?.map((c) => (<option key={c} value={c}>{c}</option>))}
                </select>
              </div>
              {errors.course && <p className="text-xs text-red-600 mt-1">{errors.course}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address <span className="text-red-500">*</span></label>
              <div className="flex items-center mt-1">
                <FaGoogle className={`${iconClass} text-[#1B5E20]`} />
                <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} onBlur={() => validateField('email', formData.email)} placeholder="your.email@example.com" className={inputClass} disabled={isLoading} required />
              </div>
              <p className="text-xs text-gray-500 mt-1">Required for request updates and notifications</p>
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="flex items-center mt-1">
                <FaLock className={iconClass} />
                <input type={showPassword.password ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} onBlur={() => validateField('password', formData.password)} placeholder="Create a strong password" className={inputClass} disabled={isLoading} required />
                <button type="button" onClick={() => handlePasswordVisibility('password')} className="trac-button-outline ml-2 flex min-h-10 min-w-10 items-center justify-center rounded-lg text-gray-500" disabled={isLoading} aria-label={showPassword.password ? 'Hide password' : 'Show password'}>{showPassword.password ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {isSignUp && formData.password && <PasswordRequirements password={formData.password} />}
              {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="flex items-center mt-1">
                <FaLock className={iconClass} />
                <input type={showPassword.confirmPassword ? "text" : "password"} value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} onBlur={() => validateField('confirmPassword', formData.confirmPassword)} placeholder="Re-enter your password" className={inputClass} disabled={isLoading} required />
                <button type="button" onClick={() => handlePasswordVisibility('confirmPassword')} className="trac-button-outline ml-2 flex min-h-10 min-w-10 items-center justify-center rounded-lg text-gray-500" disabled={isLoading} aria-label={showPassword.confirmPassword ? 'Hide password' : 'Show password'}>{showPassword.confirmPassword ? <FaEyeSlash /> : <FaEye />}</button>
              </div>
              {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={isLoading || academicCatalogLoading || Boolean(academicCatalogError)} className="trac-button mt-1 w-full rounded-xl py-3 font-semibold">
              {isLoading ? <span className="flex items-center justify-center"><svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Creating Account...</span> : 'Sign Up'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Number</label>
              <div className="flex items-center mt-1">
                <FaUser className={iconClass} />
                <input value={formatIDNumber(formData.id_number)} onChange={(e) => { const raw = e.target.value.replace(/\D/g, ''); handleInputChange('id_number', raw.slice(0, 7)); }} placeholder="00-00000" className={inputClass} disabled={isLoading} maxLength={8} required />
              </div>
              {errors.id_number && <p className="text-xs text-red-600 mt-1">{errors.id_number}</p>}
            </div>

            <div>
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs text-[#1B5E20] hover:underline focus:outline-none" disabled={isLoading}>Forgot Password?</button>
              </div>
              <div className="flex items-center mt-1">
                <FaLock className={iconClass} />
                <input type={showPassword.password ? "text" : "password"} value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} placeholder="Enter password" className={inputClass} disabled={isLoading} required />
              </div>
              <label className="flex items-center gap-2 text-sm mt-3 cursor-pointer">
                <input type="checkbox" checked={showPassword.password} onChange={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))} disabled={isLoading} className="accent-[#1B5E20]" />
                <span className="text-gray-700">Show Password</span>
              </label>
            </div>

            <button type="submit" disabled={isLoading} className="trac-button w-full rounded-xl py-3 font-semibold">
              {isLoading ? <span className="flex items-center justify-center"><svg className="animate-spin h-4 w-4 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Logging in...</span> : 'Login'}
            </button>

            <div className="text-xs text-center mt-3 text-gray-500">
              <Link to="/privacy" className="text-[#1B5E20] hover:underline">Privacy Notice</Link> | <Link to="/need-help" className="text-[#1B5E20] hover:underline">Need Help?</Link> | <Link to="/faq" className="text-[#1B5E20] hover:underline">FAQ</Link>
            </div>
          </form>
        )}
      </div>



      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">Reset Your Password</h3>
                <button onClick={resetForgotPassword} className="text-white text-2xl hover:opacity-80" disabled={isLoading}>×</button>
              </div>
              <p className="text-white/80 text-sm mt-1">{!forgotSubmitted ? 'Enter your email to reset your password' : showEnterCode ? 'Enter the 6-digit code sent to your email' : showResetPassword ? 'Create new password' : 'Code sent!'}</p>
            </div>
            <div className="p-6">
              {!forgotSubmitted ? (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="your.email@example.com" className="w-full py-3 px-4 bg-white border border-gray-300 rounded-lg outline-none focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20]" disabled={isLoading} autoFocus />
                    <p className="text-xs text-gray-500 mt-2">Enter the email address associated with your account.</p>
                  </div>
                  {forgotError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600 text-center">{forgotError}</p></div>}
                  <div className="flex gap-3">
                    <button type="button" onClick={resetForgotPassword} className="trac-button-outline flex-1 rounded-lg py-3 font-medium" disabled={isLoading}>Cancel</button>
                    <button onClick={handleForgotPassword} disabled={isLoading || !forgotEmail} className="trac-button flex-1 rounded-lg py-3 font-medium">{isLoading ? 'Sending...' : 'Send Code'}</button>
                  </div>
                </div>
              ) : showEnterCode ? (
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3"><FaCheckCircle className="w-8 h-8 text-green-600" /></div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1">Check Your Email</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-2"><p className="text-sm text-gray-600 mb-1">We sent a code to:</p><p className="font-semibold text-[#1B5E20]">{forgotEmail}</p></div>
                    <p className="text-sm text-gray-600">Enter the 6-digit verification code below.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3 text-center">Verification Code</label>
                    <div className="flex justify-center gap-2">
                      {[0, 1, 2, 3, 4, 5].map((index) => (<input key={index} id={`code-${index}`} type="text" inputMode="numeric" pattern="[0-9]*" maxLength="1" value={verificationCode[index]} onChange={(e) => handleCodeChange(index, e.target.value)} onKeyDown={(e) => handleCodeKeyDown(index, e)} className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20] outline-none" disabled={isLoading} autoFocus={index === 0} />))}
                    </div>
                    {codeError && <p className="text-sm text-red-600 text-center mt-2">{codeError}</p>}
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-2">Didn't receive the code?</p>
                    {canResend ? <button onClick={handleResendCode} disabled={isLoading} className="text-[#1B5E20] font-medium hover:underline">Resend Code</button> : <p className="text-sm text-gray-500">Resend available in {resendTimer} seconds</p>}
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button type="button" onClick={() => { setForgotSubmitted(false); setShowEnterCode(false); setVerificationCode(["", "", "", "", "", ""]); }} className="trac-button-outline flex-1 rounded-lg py-3 font-medium" disabled={isLoading}>Back</button>
                    <button onClick={handleVerifyCode} disabled={isLoading || verificationCode.join('').length !== 6} className="trac-button flex-1 rounded-lg py-3 font-medium">{isLoading ? 'Verifying...' : 'Verify Code'}</button>
                  </div>
                </div>
              ) : showResetPassword ? (
                <div className="space-y-6">
                  <div className="text-center"><h4 className="text-lg font-bold text-gray-800 mb-2">Create New Password</h4><p className="text-sm text-gray-600">Enter your new password below</p></div>
                  {resetError && <div className="bg-red-50 border border-red-200 rounded-lg p-3"><p className="text-sm text-red-600 text-center">{resetError}</p></div>}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                    <div className="relative"><input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter new password" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1B5E20]" autoFocus /><button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="trac-button-outline absolute right-2 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500" aria-label={showNewPassword ? 'Hide password' : 'Show password'}>{showNewPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
                    <p className="text-xs text-gray-500 mt-1">At least 8 characters with uppercase, lowercase, number, and special character</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                    <div className="relative"><input type={showConfirmNewPassword ? "text" : "password"} value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} placeholder="Confirm new password" className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:ring-2 focus:ring-[#1B5E20]" /><button type="button" onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} className="trac-button-outline absolute right-2 top-1/2 flex min-h-9 min-w-9 -translate-y-1/2 items-center justify-center rounded-md text-gray-500" aria-label={showConfirmNewPassword ? 'Hide password' : 'Show password'}>{showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}</button></div>
                  </div>
                  <button onClick={handleResetPassword} disabled={isLoading} className="trac-button w-full rounded-lg py-3 font-medium">{isLoading ? 'Resetting...' : 'Reset Password'}</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] text-white">
              <div className="flex items-center justify-between"><h3 className="text-xl font-bold">Verify Your Email</h3><button onClick={() => setShowVerificationModal(false)} className="text-white text-2xl hover:opacity-80">×</button></div>
              <p className="text-white/80 text-sm mt-1">Enter the 6-digit code sent to your email</p>
            </div>
            <div className="p-6">
              <div className="text-center mb-4"><div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3"><FaEnvelope className="w-8 h-8 text-green-600" /></div><p className="text-sm text-gray-600">Verification for</p><p className="text-sm font-medium text-gray-800 break-all">{verificationEmail}</p></div>
              <div className="flex justify-center gap-2 mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (<input key={index} id={`verify-${index}`} type="text" inputMode="numeric" pattern="[0-9]*" maxLength="1" value={verificationCodeInput[index]} onChange={(e) => { const newCode = [...verificationCodeInput]; newCode[index] = e.target.value.replace(/\D/g, ''); setVerificationCodeInput(newCode); if (e.target.value && index < 5) { document.getElementById(`verify-${index + 1}`)?.focus(); } if (verificationError) setVerificationError(''); }} onKeyDown={(e) => { if (e.key === 'Backspace' && !verificationCodeInput[index] && index > 0) { document.getElementById(`verify-${index - 1}`)?.focus(); } }} className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#1B5E20] focus:ring-2 focus:ring-[#1B5E20] outline-none" disabled={isLoading} />))}
              </div>
              {verificationError && <p className="text-red-600 text-sm text-center mb-4">{verificationError}</p>}
              <button onClick={handleVerifyEmail} disabled={isLoading || verificationCodeInput.join('').length !== 6} className="trac-button w-full rounded-lg py-3 font-medium">{isLoading ? 'Verifying...' : 'Verify Email'}</button>
              <div className="text-center mt-4"><p className="text-sm text-gray-600">Didn't receive code? {verificationCanResend ? <button onClick={handleResendVerification} className="text-[#1B5E20] font-medium hover:underline">Resend Code</button> : <span className="text-gray-400">Resend available in {verificationResendTimer}s</span>}</p></div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
