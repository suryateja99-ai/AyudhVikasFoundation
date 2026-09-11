import React, { useEffect, useState, useRef } from 'react';
import {
  X,
  User,
  Stethoscope,
  Building2,
  Megaphone,
  Ambulance,
  TestTube,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  ShieldCheck,
  Upload,
  Camera,
  FileText,
  QrCode,
  Download,
  Printer,
  ChevronRight,
  ChevronLeft,
  Users,
  Heart,
  Handshake,
  HeartPulse,
  Activity,
  Check,
  Clock,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertTriangle,
  CreditCard
} from 'lucide-react';
import { DISTRICTS, SPECIALITIES } from '../data/mockData';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

export type RegistrationRole = 'patient' | 'doctor' | 'hospital' | 'marketing' | 'ambulance' | 'lab' | 'volunteer' | 'social_organizer';

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRole?: RegistrationRole;
  onCompleteRegistration?: (patientData: any) => void;
  onNavigateToOP?: (patientId: string) => void;
  onNavigateToDashboard?: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
  initialRole = 'patient',
  onCompleteRegistration,
  onNavigateToOP,
  onNavigateToDashboard
}) => {
  const { register } = useAuth();
  const [selectedRole, setSelectedRole] = useState<RegistrationRole>(initialRole);
  const [donationAmount, setDonationAmount] = useState('501');
  const [customDonationAmount, setCustomDonationAmount] = useState('');
  const [hospitalPlan, setHospitalPlan] = useState('Growth');
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  useEffect(() => {
    setPaymentConfirmed(false);
    setErrors((prev) => ({ ...prev, payment: '' }));
  }, [selectedRole]);
  
  // Patient Form Steps: 1: Personal & Identity, 2: Contact & Address, 3: Health & Emergency, 4: Docs & Signature, 5: Review, 6: Success
  const [patientStep, setPatientStep] = useState<number>(1);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpTimer, setOtpTimer] = useState(30);
  const [otpLoading, setOtpLoading] = useState(false);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Patient Registration Form Data
  const [patientData, setPatientData] = useState({
    // Personal Information
    fullName: '',
    fatherOrSpouseName: '',
    dob: '',
    age: '',
    gender: 'Male' as 'Male' | 'Female' | 'Other',
    maritalStatus: 'Married',
    bloodGroup: 'B+',
    occupation: '',
    motherTongue: 'Telugu',

    // Contact Information
    mobileNumber: '',
    whatsappSameAsMobile: true,
    whatsappNumber: '',
    alternateMobile: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Address
    doorNo: '',
    street: '',
    villageOrTown: '',
    mandal: '',
    district: 'Warangal',
    state: 'Telangana',
    pincode: '',

    // Identity & Verification
    aadhaarNumber: '',
    rationCardNumber: '',
    govtHealthScheme: 'Aarogyasri',
    schemeCardNumber: '',

    // Health Details
    chronicConditions: [] as string[],
    otherCondition: '',
    knownAllergies: '',
    pastSurgeries: '',

    // Emergency Contact
    emergencyName: '',
    emergencyRelation: 'Spouse',
    emergencyPhone: '',
    emergencyAddress: '',

    // Documents & Photo
    photoUrl: '/src/assets/images/patient_avatar_1787229395408.jpg',
    aadhaarFileName: 'aadhaar_scan_front_back.pdf',
    rationCardFileName: '',
    medicalReportsFileName: '',
    signatureType: 'draw' as 'draw' | 'type',
    signatureText: '',
    
    // Consent
    declarationAgreed: false
  });

  // Generated Registration Result
  const [registrationResult, setRegistrationResult] = useState<{
    patientId: string;
    referenceNo: string;
    submittedAt: string;
    status: 'SUBMITTED' | 'UNDER REVIEW' | 'APPROVED';
  } | null>(null);

  const hospitalPlans = [
    { name: 'Starter', amount: 2999, features: 'Profile listing, patient enquiries, basic dashboard' },
    { name: 'Growth', amount: 5999, features: 'Priority listing, visit requests, doctor roster tools' },
    { name: 'Premium', amount: 8999, features: 'Top placement, analytics, unlimited doctor management' },
  ];

  const selectedHospitalPlan = hospitalPlans.find((plan) => plan.name === hospitalPlan) || hospitalPlans[1];
  const payableDonation = Number(customDonationAmount || donationAmount || 0);

  const paymentPayloadForRole = (role: string) => {
    if (role === 'hospital') {
      return {
        paymentType: 'subscription',
        subscriptionPlan: selectedHospitalPlan.name,
        subscriptionAmount: selectedHospitalPlan.amount,
        subscriptionFeatures: selectedHospitalPlan.features,
        paymentStatus: 'Paid',
        paymentReference: `AV-SUB-${Date.now()}`,
      };
    }
    return {
      paymentType: 'donation',
      donationAmount: payableDonation,
      paymentStatus: 'Paid',
      paymentReference: `AV-DON-${Date.now()}`,
    };
  };

  const renderPaymentStep = (role: RegistrationRole | string) => {
    const isHospital = role === 'hospital' || role === 'Hospital';
    return (
      <div className="bg-slate-950 text-white rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-300" />
            <div>
              <h4 className="text-xs font-black uppercase">{isHospital ? 'Hospital Subscription Plan' : 'Registration Donation'}</h4>
              <p className="text-[11px] text-slate-300">
                {isHospital ? 'Choose a plan before the hospital account is activated.' : 'Complete a donation as the final registration step.'}
              </p>
            </div>
          </div>
          <span className={`text-[10px] font-black px-2 py-1 rounded-full ${paymentConfirmed ? 'bg-emerald-500 text-white' : 'bg-amber-400 text-slate-950'}`}>
            {paymentConfirmed ? 'PAYMENT READY' : 'PENDING'}
          </span>
        </div>

        {isHospital ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {hospitalPlans.map((plan) => (
              <button
                key={plan.name}
                type="button"
                onClick={() => {
                  setHospitalPlan(plan.name);
                  setPaymentConfirmed(false);
                }}
                className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${hospitalPlan === plan.name ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                <div className="text-xs font-black">{plan.name}</div>
                <div className="text-lg font-black">Rs. {plan.amount}</div>
                <div className="text-[10px] leading-snug opacity-80">{plan.features}</div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['101', '251', '501', '1001'].map((amount) => (
              <button
                key={amount}
                type="button"
                onClick={() => {
                  setDonationAmount(amount);
                  setCustomDonationAmount('');
                  setPaymentConfirmed(false);
                }}
                className={`rounded-lg border px-3 py-2 text-xs font-black cursor-pointer ${donationAmount === amount && !customDonationAmount ? 'bg-emerald-500 text-white border-emerald-300' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
              >
                Rs. {amount}
              </button>
            ))}
            <input
              value={customDonationAmount}
              onChange={(e) => {
                setCustomDonationAmount(e.target.value);
                setPaymentConfirmed(false);
              }}
              type="number"
              min="1"
              placeholder="Custom"
              className="rounded-lg border border-white/10 bg-white text-slate-900 px-3 py-2 text-xs font-bold"
            />
          </div>
        )}

        <button
          type="button"
          onClick={() => setPaymentConfirmed(true)}
          className="w-full rounded-lg bg-white text-slate-950 py-2.5 text-xs font-black hover:bg-emerald-50 cursor-pointer"
        >
          Confirm {isHospital ? `Rs. ${selectedHospitalPlan.amount} Subscription` : `Rs. ${payableDonation || 0} Donation`}
        </button>
        {errors.payment && <p className="text-[11px] font-bold text-amber-300">{errors.payment}</p>}
      </div>
    );
  };

  // Doctor Form State
  const [doctorData, setDoctorData] = useState({
    fullName: '',
    qualification: 'MBBS, MD',
    speciality: 'Cardiology',
    registrationNo: '',
    stateMedicalCouncil: 'Telangana Medical Council',
    experienceYears: '8',
    currentHospital: '',
    clinicAddress: '',
    district: 'Warangal',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    consultationFee: '500',
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    declaration: false,
    subSpeciality: '',
    additionalSpecialities: [] as string[],
    verificationDocuments: [] as { type: string; name: string; url: string; uploadedAt: string }[],
  });

  // Hospital Form State
  const [hospitalData, setHospitalData] = useState({
    hospitalName: '',
    registrationNo: '',
    category: 'Super Specialty Hospital',
    nabhAccredited: 'Yes',
    totalBeds: '150',
    icuBeds: '30',
    chiefMedicalOfficer: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    password: '',
    confirmPassword: '',
    district: 'Warangal',
    fullAddress: '',
    keySpecialities: [] as string[],
    specialities: [] as string[],
    primarySpeciality: '',
    hasEmergency24x7: true,
    hasAmbulance: true,
    hasBloodBank: true,
    declaration: false,
    verificationDocuments: [] as { type: string; name: string; url: string; uploadedAt: string }[],
  });

  // Marketing Team Form State
  const [marketingData, setMarketingData] = useState({
    fullName: '',
    assignedTerritory: 'Warangal Urban & Rural',
    district: 'Warangal',
    experienceYears: '3',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    qualification: 'Graduate',
    previousOrg: '',
    referralCode: 'AV-MKT-2026',
    declaration: false
  });

  // Ambulance Driver Form State
  const [ambulanceData, setAmbulanceData] = useState({
    driverName: '',
    licenseNumber: '',
    licenseType: 'Commercial Heavy Transport (HMV)',
    mobile: '',
    alternateMobile: '',
    password: '',
    confirmPassword: '',
    vehicleNumber: 'TS 03 UA 1080',
    vehicleType: 'Advanced Life Support (ALS) with Ventilator',
    district: 'Warangal',
    baseLocation: 'MGM Hospital Junction / Hanamkonda',
    hasOxygen: true,
    hasDefibrillator: true,
    hasTrainedParamedic: true,
    declaration: false
  });

  // Lab Team Form State
  const [labData, setLabData] = useState({
    labName: '',
    licenseNumber: '',
    nablApproved: 'Yes',
    contactPerson: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: 'Warangal',
    fullAddress: '',
    testCategories: ['Hematology', 'Biochemistry', 'Microbiology', 'Radiology / X-Ray', 'CT Scan'],
    homeCollectionAvailable: true,
    digitalReportsTurnaround: 'Within 6 Hours',
    declaration: false
  });

  const [volunteerData, setVolunteerData] = useState({
    fullName: '',
    age: '',
    gender: 'Male',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: 'Warangal',
    villageOrTown: '',
    occupation: '',
    languages: 'Telugu, English',
    availability: 'Weekends & Health Camps',
    preferredActivity: 'Health Camps & Patient Guidance',
    skills: '',
    emergencyName: '',
    emergencyPhone: '',
    motivation: '',
    declaration: false
  });

  const [socialOrganizerData, setSocialOrganizerData] = useState({
    fullName: '',
    organizationName: '',
    designation: 'Community Leader',
    mobileNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    district: 'Warangal',
    coverageArea: '',
    communityType: 'Village / SHG / NGO',
    yearsOfWork: '3',
    peopleCanMobilize: '50-100',
    previousCamps: '',
    bankOrUpi: '',
    motivation: '',
    declaration: false
  });

  const [nonPatientSubmitted, setNonPatientSubmitted] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  if (!isOpen) return null;

  const passwordErrors = (password: string, confirmPassword: string) => {
    const errs: Record<string, string> = {};
    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters / పాస్‌వర్డ్ కనీసం 8 అక్షరాలు ఉండాలి';
    } else if (!/[A-Z]/.test(password) || !/[0-9]/.test(password) || !/[!@#$%^&*]/.test(password)) {
      errs.password = 'Must include uppercase, number and special character / పెద్ద అక్షరం, సంఖ్య, ప్రత్యేక అక్షరం అవసరం';
    }
    if (!confirmPassword) {
      errs.confirmPassword = 'Please confirm your password / పాస్‌వర్డ్‌ను నిర్ధారించండి';
    } else if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match / పాస్‌వర్డ్‌లు సరిపోలడం లేదు';
    }
    return errs;
  };

  const attachDocument = (
    setCurrent: React.Dispatch<React.SetStateAction<any>>,
    type: string,
    file?: File
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCurrent((prev: any) => {
        const docs = (prev.verificationDocuments || []).filter((d: any) => d.type !== type);
        docs.push({ type, name: file.name, url: String(reader.result || ''), uploadedAt: new Date().toISOString() });
        return { ...prev, verificationDocuments: docs };
      });
    };
    reader.readAsDataURL(file);
  };

  const uploadedName = (docs: { type: string; name: string }[] | undefined, type: string) =>
    docs?.find((d) => d.type === type)?.name;

  const renderPasswordFields = (
    password: string,
    confirmPassword: string,
    onPassword: (value: string) => void,
    onConfirm: (value: string) => void,
    ringClass = 'focus:ring-emerald-600'
  ) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div>
        <label className="block font-bold text-slate-800 mb-1">
          Login Password / లాగిన్ పాస్‌వర్డ్ <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            required
            type={showPassword ? 'text' : 'password'}
            minLength={6}
            value={password}
            onChange={(e) => onPassword(e.target.value)}
            placeholder="Min. 6 characters"
            autoComplete="new-password"
            className={`w-full p-2.5 pl-9 pr-10 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 ${ringClass} ${
              errors.password ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.password}</p>}
      </div>
      <div>
        <label className="block font-bold text-slate-800 mb-1">
          Confirm Password / పాస్‌వర్డ్ నిర్ధారణ <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            required
            type={showConfirmPassword ? 'text' : 'password'}
            minLength={6}
            value={confirmPassword}
            onChange={(e) => onConfirm(e.target.value)}
            placeholder="Re-enter password"
            autoComplete="new-password"
            className={`w-full p-2.5 pl-9 pr-10 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 ${ringClass} ${
              errors.confirmPassword ? 'border-red-500' : 'border-slate-300'
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
            aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
          >
            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.confirmPassword}</p>}
      </div>
    </div>
  );

  // Handle Calculate Age from DOB
  const handleDobChange = (dobString: string) => {
    setPatientData(prev => {
      let calculatedAge = prev.age;
      if (dobString) {
        const birthDate = new Date(dobString);
        const diff = Date.now() - birthDate.getTime();
        const ageDate = new Date(diff);
        const age = Math.abs(ageDate.getUTCFullYear() - 1970);
        if (!isNaN(age)) calculatedAge = age.toString();
      }
      return { ...prev, dob: dobString, age: calculatedAge };
    });
  };

  // OTP Handlers
  const handleSendOtp = () => {
    if (!patientData.mobileNumber || patientData.mobileNumber.length < 10) {
      setErrors(prev => ({ ...prev, mobileNumber: 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబరును నమోదు చేయండి / Please enter valid 10-digit mobile number' }));
      return;
    }
    setErrors(prev => ({ ...prev, mobileNumber: '' }));
    setOtpLoading(true);
    setTimeout(() => {
      setOtpLoading(false);
      setOtpSent(true);
      setOtpTimer(30);
    }, 600);
  };

  const handleVerifyOtp = () => {
    if (otpValue === '123456' || otpValue.length === 6 || otpValue === '999999' || otpValue === '111111') {
      setOtpVerified(true);
      setErrors(prev => ({ ...prev, otp: '' }));
    } else {
      setErrors(prev => ({ ...prev, otp: 'దయచేసి సరైన OTP నమోదు చేయండి (Demo OTP: 123456)' }));
    }
  };

  // Toggle Chronic Condition
  const toggleCondition = (condition: string) => {
    setPatientData(prev => {
      const exists = prev.chronicConditions.includes(condition);
      const updated = exists 
        ? prev.chronicConditions.filter(c => c !== condition)
        : [...prev.chronicConditions.filter(c => c !== 'None'), condition];
      return { ...prev, chronicConditions: updated };
    });
  };

  // Step Validation
  const validateStep = (step: number): boolean => {
    const errs: Record<string, string> = {};

    if (step === 1) {
      if (!patientData.fullName.trim()) errs.fullName = 'రోగి పూర్తి పేరు తప్పనిసరి / Full Name is required';
      if (!patientData.fatherOrSpouseName.trim()) errs.fatherOrSpouseName = 'తండ్రి / భర్త పేరు తప్పనిసరి / Father or Spouse Name is required';
      if (!patientData.age || parseInt(patientData.age) <= 0) errs.age = 'దయచేసి వయస్సు నమోదు చేయండి / Valid Age is required';
      if (!patientData.gender) errs.gender = 'లింగం ఎంచుకోండి / Gender is required';
    }

    if (step === 2) {
      if (!patientData.mobileNumber || patientData.mobileNumber.length < 10) errs.mobileNumber = '10 అంకెల మొబైల్ సంఖ్య తప్పనిసరి / 10-digit Mobile is required';
      Object.assign(errs, passwordErrors(patientData.password, patientData.confirmPassword));
      if (!patientData.doorNo.trim()) errs.doorNo = 'ఇంటి నంబరు తప్పనిసరి / Door No is required';
      if (!patientData.villageOrTown.trim()) errs.villageOrTown = 'గ్రామం / పట్టణం తప్పనిసరి / Village or Town is required';
      if (!patientData.mandal.trim()) errs.mandal = 'మండలం తప్పనిసరి / Mandal is required';
      if (!patientData.pincode || patientData.pincode.length < 6) errs.pincode = '6 అంకెల పిన్‌కోడ్ తప్పనిసరి / 6-digit PIN code is required';
    }

    if (step === 3) {
      if (!patientData.emergencyName.trim()) errs.emergencyName = 'అత్యవసర సంప్రదింపు వ్యక్తి పేరు తప్పనిసరి / Emergency Contact Name is required';
      if (!patientData.emergencyPhone || patientData.emergencyPhone.length < 10) errs.emergencyPhone = 'అత్యవసర ఫోన్ నంబరు తప్పనిసరి / Emergency Phone is required';
      if (!patientData.aadhaarNumber || patientData.aadhaarNumber.replace(/\s/g, '').length < 12) {
        errs.aadhaarNumber = '12 అంకెల ఆధార్ సంఖ్య తప్పనిసరి / Valid 12-digit Aadhaar is required';
      }
    }

    if (step === 4) {
      if (!patientData.declarationAgreed) {
        errs.declarationAgreed = 'దయచేసి డిక్లరేషన్ నిబంధనలను అంగీకరించండి / Please accept the declaration and consent';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep(patientStep)) {
      setPatientStep(prev => prev + 1);
    }
  };

  const handleFinalSubmit = async () => {
    if (!paymentConfirmed || payableDonation <= 0) {
      setErrors({ payment: 'Please confirm the final registration donation before submitting.' });
      return;
    }
    if (!patientData.declarationAgreed) {
      setErrors({ declarationAgreed: 'దయచేసి డిక్లరేషన్ నిబంధనలను అంగీకరించండి / Please accept the declaration' });
      return;
    }
    const pwdErrs = passwordErrors(patientData.password, patientData.confirmPassword);
    if (Object.keys(pwdErrs).length) {
      setErrors(pwdErrs);
      setPatientStep(2);
      return;
    }

    try {
      const { confirmPassword, ...safePatient } = patientData;
      const res = await register({
        role: 'patient',
        ...safePatient,
        ...paymentPayloadForRole('patient'),
        password: patientData.password,
      });
      const patientId = res.patientId || res.user.patientId || `AV-PAT-2026-${Math.floor(10000 + Math.random() * 90000)}`;
      const referenceNo = res.referenceNo || `AV-REG-${Math.floor(100000 + Math.random() * 900000)}`;

      const result = {
        patientId,
        referenceNo,
        submittedAt: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        status: 'APPROVED' as const
      };

      setRegistrationResult(result);
      setPatientStep(6);

      if (onCompleteRegistration) {
        onCompleteRegistration({
          ...patientData,
          patientId,
          referenceNo
        });
      }
    } catch (err: any) {
      setErrors({
        password: err.message || 'Registration failed. Please try again.',
        declarationAgreed: err.message || 'Registration failed. Please try again.',
      });
    }
  };

  // Non-patient submissions
  const handleNonPatientSubmit = async (roleName: string) => {
    const roleMap: Record<string, string> = {
      Doctor: 'doctor',
      Hospital: 'hospital',
      Marketing: 'marketing',
      Ambulance: 'ambulance',
      Lab: 'lab',
      Volunteer: 'volunteer',
      SocialOrganizer: 'social_organizer',
    };
    const payloadByRole: Record<string, any> = {
      Doctor: doctorData,
      Hospital: hospitalData,
      Marketing: marketingData,
      Ambulance: ambulanceData,
      Lab: labData,
      Volunteer: volunteerData,
      SocialOrganizer: socialOrganizerData,
    };
    const data = payloadByRole[roleName] || {};
    const pwdErrs = passwordErrors(data.password || '', data.confirmPassword || '');
    if (Object.keys(pwdErrs).length) {
      setErrors(pwdErrs);
      return;
    }
    if (roleName === 'Doctor' && (!data.verificationDocuments || data.verificationDocuments.length < 3)) {
      setErrors({ password: 'Upload degree, medical council, and license certificates for verification.' });
      return;
    }
    if (roleName === 'Doctor' && !data.speciality) {
      setErrors({ password: 'Select your primary speciality so patients can find you.' });
      return;
    }
    if (roleName === 'Hospital' && (!data.specialities || data.specialities.length < 1)) {
      setErrors({ password: 'Select at least one hospital speciality so patients can find you.' });
      return;
    }
    if (roleName === 'Hospital' && (!data.verificationDocuments || data.verificationDocuments.length < 2)) {
      setErrors({ password: 'Upload hospital registration and clinical establishment certificates.' });
      return;
    }
    const role = roleMap[roleName] || 'patient';
    if (!paymentConfirmed || (role !== 'hospital' && payableDonation <= 0)) {
      setErrors({ payment: role === 'hospital' ? 'Please confirm a hospital subscription plan before submitting.' : 'Please confirm the registration donation before submitting.' });
      return;
    }
    const { confirmPassword, ...safeData } = data;
    try {
      await register({
        role,
        ...safeData,
        ...paymentPayloadForRole(role),
        password: data.password,
        phone: data.mobile || data.mobileNumber || data.contactPhone || '',
        mobileNumber: data.mobile || data.mobileNumber || data.contactPhone || '',
        speciality: data.speciality || data.primarySpeciality,
        specialities: data.specialities?.length ? data.specialities : [data.speciality, ...(data.additionalSpecialities || [])].filter(Boolean),
        additionalSpecialities: data.additionalSpecialities,
      });
      setNonPatientSubmitted(roleName);
    } catch (err: any) {
      setErrors({ password: err.message || 'Registration failed. Please try again.' });
    }
  };

  const resetAll = () => {
    setPatientStep(1);
    setRegistrationResult(null);
    setNonPatientSubmitted(null);
    setPaymentConfirmed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto selection:bg-emerald-600 selection:text-white">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-4xl w-full my-4 overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95">
        
        {/* ========================================================================= */}
        {/* TOP BRANDING & MODAL HEADER */}
        {/* ========================================================================= */}
        <div className="bg-[#0a2540] text-white px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-[#133860] shrink-0">
          <div className="flex items-center gap-3">
            <BrandLogo className="w-10 h-10 shadow-md" />
            <div>
              <div className="text-sm sm:text-base font-black tracking-tight flex items-center gap-2">
                <span>AYUDH VIKAS HEALTH CARE NETWORK</span>
                <span className="hidden sm:inline-block text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  Govt. Regd Foundation
                </span>
              </div>
              <div className="text-[11px] font-medium text-emerald-300/90 flex items-center gap-1.5">
                <span>ఆయుధ్ వికాస్ హెల్త్‌కేర్ నెట్‌వర్క్ — అధికారిక నమోదు పోర్టల్</span>
              </div>
            </div>
          </div>

          <button
            onClick={resetAll}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* ROLE TOGGLE TABS (Patient, Doctor, Hospital, Marketing, Ambulance, Lab) */}
        {/* ========================================================================= */}
        <div className="bg-[#0f2e5a] px-3 sm:px-6 py-2.5 border-b border-[#1b4375] shrink-0">
          <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>నమోదు వర్గాన్ని ఎంచుకోండి / SELECT REGISTRATION CATEGORY:</span>
            <span className="text-emerald-400 font-bold hidden sm:inline">24x7 Helpline: 0870-4210820</span>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            {/* 1. Patient */}
            <button
              type="button"
              onClick={() => setSelectedRole('patient')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'patient'
                  ? 'bg-emerald-600 text-white shadow-md ring-2 ring-emerald-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Patient (రోగి)</span>
            </button>

            {/* 2. Doctor */}
            <button
              type="button"
              onClick={() => setSelectedRole('doctor')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'doctor'
                  ? 'bg-blue-600 text-white shadow-md ring-2 ring-blue-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5 shrink-0" />
              <span>Doctor (వైద్యులు)</span>
            </button>

            {/* 3. Hospital */}
            <button
              type="button"
              onClick={() => setSelectedRole('hospital')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'hospital'
                  ? 'bg-amber-600 text-white shadow-md ring-2 ring-amber-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 shrink-0" />
              <span>Hospital (ఆసుపత్రి)</span>
            </button>

            {/* 4. Marketing Team */}
            <button
              type="button"
              onClick={() => setSelectedRole('marketing')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'marketing'
                  ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Megaphone className="w-3.5 h-3.5 shrink-0" />
              <span>Marketing (విభాగం)</span>
            </button>

            {/* 5. Ambulance Driver */}
            <button
              type="button"
              onClick={() => setSelectedRole('ambulance')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'ambulance'
                  ? 'bg-rose-600 text-white shadow-md ring-2 ring-rose-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Ambulance className="w-3.5 h-3.5 shrink-0" />
              <span>Ambulance (డ్రైవర్)</span>
            </button>

            {/* 6. Lab Team */}
            <button
              type="button"
              onClick={() => setSelectedRole('lab')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'lab'
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <TestTube className="w-3.5 h-3.5 shrink-0" />
              <span>Lab Team (ల్యాబ్)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('volunteer')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'volunteer'
                  ? 'bg-teal-600 text-white shadow-md ring-2 ring-teal-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Handshake className="w-3.5 h-3.5 shrink-0" />
              <span>Volunteer (స్వచ్ఛంద)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedRole('social_organizer')}
              className={`flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedRole === 'social_organizer'
                  ? 'bg-lime-600 text-white shadow-md ring-2 ring-lime-400'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0" />
              <span>Social Organizer</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODAL BODY CONTENT */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
          {selectedRole !== 'patient' && selectedRole !== 'hospital' && nonPatientSubmitted === null && (
            <div className="mb-4">
              {renderPaymentStep(selectedRole)}
            </div>
          )}
          
          {/* ===================================================================== */}
          {/* ROLE 1: PATIENT REGISTRATION FORM (THE AUTHORITATIVE SPECIFICATION) */}
          {/* ===================================================================== */}
          {selectedRole === 'patient' && (
            <div>
              {/* Progress Steps Header (Only shown during steps 1 to 5) */}
              {patientStep < 6 && (
                <div className="mb-5 bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                    <span className="text-[#0a2540]">
                      Step {patientStep} of 5:{' '}
                      {patientStep === 1 && 'Personal Information (వ్యక్తిగత వివరాలు)'}
                      {patientStep === 2 && 'Contact & Address (సంప్రదింపు & చిరునామా)'}
                      {patientStep === 3 && 'Healthcare & Emergency (ఆరోగ్యం & అత్యవసర)'}
                      {patientStep === 4 && 'Documents & Verification (పత్రాలు & ధ్రువీకరణ)'}
                      {patientStep === 5 && 'Review & Declaration (సమీక్ష & అంగీకారం)'}
                    </span>
                    <span className="text-emerald-700 font-extrabold">{patientStep * 20}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${patientStep * 20}%` }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 1: PERSONAL INFORMATION (వ్యక్తిగత వివరాలు) */}
              {patientStep === 1 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-emerald-50/80 border border-emerald-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-black">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-emerald-950">
                        వ్యక్తిగత సమాచారం / Personal Information
                      </h3>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        దయచేసి మీ ఆధార్ కార్డు ప్రకారం సరైన వివరాలను నమోదు చేయండి (Please enter details as per Aadhaar).
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    
                    {/* Full Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        రోగి పూర్తి పేరు / Patient Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientData.fullName}
                        onChange={e => setPatientData({ ...patientData, fullName: e.target.value })}
                        placeholder="ఉదా: Ramesh Kumar / As per Aadhaar"
                        className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${
                          errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.fullName && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.fullName}</p>}
                    </div>

                    {/* Father / Spouse Name */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        తండ్రి / భర్త / సంరక్షకుని పేరు / Father's / Husband's / Guardian's Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={patientData.fatherOrSpouseName}
                        onChange={e => setPatientData({ ...patientData, fatherOrSpouseName: e.target.value })}
                        placeholder="Father or Spouse Name"
                        className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${
                          errors.fatherOrSpouseName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                        }`}
                      />
                      {errors.fatherOrSpouseName && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.fatherOrSpouseName}</p>}
                    </div>

                    {/* DOB, Age, Gender */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          పుట్టిన తేదీ / Date of Birth
                        </label>
                        <input
                          type="date"
                          value={patientData.dob}
                          onChange={e => handleDobChange(e.target.value)}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          వయస్సు / Age (Years) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={patientData.age}
                          onChange={e => setPatientData({ ...patientData, age: e.target.value })}
                          placeholder="e.g. 45"
                          min="1"
                          max="120"
                          className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                            errors.age ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                          }`}
                        />
                        {errors.age && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.age}</p>}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          లింగం / Gender <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={patientData.gender}
                          onChange={e => setPatientData({ ...patientData, gender: e.target.value as any })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Male">పురుషుడు / Male</option>
                          <option value="Female">స్త్రీ / Female</option>
                          <option value="Other">ఇతరులు / Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Marital Status, Blood Group, Mother Tongue */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          వైవాహిక స్థితి / Marital Status
                        </label>
                        <select
                          value={patientData.maritalStatus}
                          onChange={e => setPatientData({ ...patientData, maritalStatus: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        >
                          <option value="Married">వివాహితులు / Married</option>
                          <option value="Unmarried">అవివాహితులు / Single</option>
                          <option value="Widowed">వితంతువు / Widowed</option>
                          <option value="Other">ఇతర / Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          రక్త వర్గం / Blood Group
                        </label>
                        <select
                          value={patientData.bloodGroup}
                          onChange={e => setPatientData({ ...patientData, bloodGroup: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold text-slate-800"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                            <option key={bg} value={bg}>{bg}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          వృత్తి / Occupation
                        </label>
                        <input
                          type="text"
                          value={patientData.occupation}
                          onChange={e => setPatientData({ ...patientData, occupation: e.target.value })}
                          placeholder="ఉదా: వ్యవసాయం / Farmer / Govt / Private"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#0a2540] hover:bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:gap-3"
                    >
                      <span>తరువాతి విభాగం / Next: Contact & Address</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: CONTACT & ADDRESS INFORMATION + OTP VERIFICATION */}
              {patientStep === 2 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-blue-950">
                        సంప్రదింపు & చిరునామా / Contact & Address Information
                      </h3>
                      <p className="text-[11px] text-blue-800 font-medium">
                        మొబైల్ నంబరు ధ్రువీకరణ మరియు శాశ్వత నివాస వివరాలు.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    
                    {/* Primary Mobile Number with OTP Verification Flow */}
                    <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <label className="font-bold text-slate-800">
                          మొబైల్ సంఖ్య / Primary Mobile Number (OTP Verification) <span className="text-red-500">*</span>
                        </label>
                        {otpVerified && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5" /> మొబైల్ ధ్రువీకరించబడింది / Verified
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            maxLength={10}
                            disabled={otpVerified}
                            value={patientData.mobileNumber}
                            onChange={e => setPatientData({ ...patientData, mobileNumber: e.target.value.replace(/\D/g, '') })}
                            placeholder="10-digit mobile number"
                            className={`w-full p-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 ${
                              errors.mobileNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                        </div>

                        {!otpVerified && (
                          <button
                            type="button"
                            disabled={otpLoading}
                            onClick={handleSendOtp}
                            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer shrink-0"
                          >
                            {otpLoading ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP (OTP పంపు)'}
                          </button>
                        )}
                      </div>

                      {errors.mobileNumber && <p className="text-red-600 text-[11px] font-semibold">{errors.mobileNumber}</p>}

                      {/* OTP Input Sub-box if OTP sent */}
                      {otpSent && !otpVerified && (
                        <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                          <input
                            type="text"
                            maxLength={6}
                            value={otpValue}
                            onChange={e => setOtpValue(e.target.value)}
                            placeholder="Enter 6-digit OTP (e.g. 123456)"
                            className="w-full sm:w-60 p-2 bg-white border border-blue-400 rounded-lg text-center tracking-widest font-black focus:ring-2 focus:ring-blue-600 focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg transition-colors cursor-pointer"
                          >
                            Verify OTP (ధ్రువీకరించు)
                          </button>
                          <span className="text-[10px] text-slate-500 font-medium">Demo OTP: 123456</span>
                        </div>
                      )}
                      {errors.otp && <p className="text-red-600 text-[11px] font-semibold">{errors.otp}</p>}
                    </div>

                    {/* Alternate Mobile & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ప్రత్యామ్నాయ ఫోన్ నంబరు / Alternate Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          maxLength={10}
                          value={patientData.alternateMobile}
                          onChange={e => setPatientData({ ...patientData, alternateMobile: e.target.value.replace(/\D/g, '') })}
                          placeholder="Alternate mobile"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ఈమెయిల్ ఐడి / Email ID (Optional)
                        </label>
                        <input
                          type="email"
                          value={patientData.email}
                          onChange={e => setPatientData({ ...patientData, email: e.target.value })}
                          placeholder="e.g. patient@example.com"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {renderPasswordFields(
                      patientData.password,
                      patientData.confirmPassword,
                      (value) => setPatientData({ ...patientData, password: value }),
                      (value) => setPatientData({ ...patientData, confirmPassword: value }),
                      'focus:ring-emerald-600'
                    )}

                    {/* Address Fields */}
                    <div className="pt-2 border-t border-slate-200">
                      <h4 className="font-black text-slate-900 text-xs mb-2">
                        నివాస చిరునామా / Residential Address
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            ఇంటి నంబరు / Door / Flat No <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={patientData.doorNo}
                            onChange={e => setPatientData({ ...patientData, doorNo: e.target.value })}
                            placeholder="e.g. 4-12/1, Flat 204"
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                              errors.doorNo ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.doorNo && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.doorNo}</p>}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            వీధి / కాలనీ / Street / Colony / Landmark
                          </label>
                          <input
                            type="text"
                            value={patientData.street}
                            onChange={e => setPatientData({ ...patientData, street: e.target.value })}
                            placeholder="e.g. Naimnagar Main Road, Near SBI"
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            గ్రామం / పట్టణం / Village / Town <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={patientData.villageOrTown}
                            onChange={e => setPatientData({ ...patientData, villageOrTown: e.target.value })}
                            placeholder="e.g. Hanamkonda"
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                              errors.villageOrTown ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.villageOrTown && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.villageOrTown}</p>}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            మండలం / Mandal <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={patientData.mandal}
                            onChange={e => setPatientData({ ...patientData, mandal: e.target.value })}
                            placeholder="e.g. Hanamkonda"
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                              errors.mandal ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.mandal && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.mandal}</p>}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            పిన్‌కోడ్ / PIN Code <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            maxLength={6}
                            value={patientData.pincode}
                            onChange={e => setPatientData({ ...patientData, pincode: e.target.value.replace(/\D/g, '') })}
                            placeholder="e.g. 506001"
                            className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                              errors.pincode ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.pincode && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.pincode}</p>}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            జిల్లా / District <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={patientData.district}
                            onChange={e => setPatientData({ ...patientData, district: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                          >
                            {DISTRICTS.map(d => (
                              <option key={d} value={d}>{d}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            రాష్ట్రం / State <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={patientData.state}
                            onChange={e => setPatientData({ ...patientData, state: e.target.value })}
                            className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                          >
                            <option value="Telangana">తెలంగాణ / Telangana</option>
                            <option value="Andhra Pradesh">ఆంధ్రప్రదేశ్ / Andhra Pradesh</option>
                            <option value="Karnataka">కర్ణాటక / Karnataka</option>
                            <option value="Maharashtra">మహారాష్ట్ర / Maharashtra</option>
                            <option value="Other">ఇతర రాష్ట్రం / Other</option>
                          </select>
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPatientStep(1)}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#0a2540] hover:bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:gap-3"
                    >
                      <span>తరువాతి విభాగం / Next: Health & Emergency</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: HEALTHCARE & EMERGENCY INFORMATION */}
              {patientStep === 3 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-950">
                        ఆరోగ్య స్థితి, పథకాలు & అత్యవసర సంప్రదింపు / Health & Emergency
                      </h3>
                      <p className="text-[11px] text-amber-800 font-medium">
                        ఆధార్ సంఖ్య, ముందస్తు ఆరోగ్య సమస్యలు మరియు అత్యవసర కాంటాక్ట్ వివరాలు.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    
                    {/* Aadhaar Number & Ration Card */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ఆధార్ సంఖ్య / Aadhaar Number (12 Digits) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          maxLength={14}
                          value={patientData.aadhaarNumber}
                          onChange={e => {
                            const val = e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
                            setPatientData({ ...patientData, aadhaarNumber: val });
                          }}
                          placeholder="XXXX XXXX XXXX"
                          className={`w-full p-2.5 bg-slate-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-mono ${
                            errors.aadhaarNumber ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                          }`}
                        />
                        {errors.aadhaarNumber && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.aadhaarNumber}</p>}
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          రేషన్ కార్డు / ఆహార భద్రత కార్డు సంఖ్య / Ration Card No. (Optional)
                        </label>
                        <input
                          type="text"
                          value={patientData.rationCardNumber}
                          onChange={e => setPatientData({ ...patientData, rationCardNumber: e.target.value })}
                          placeholder="e.g. WAP2001984201"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Government Scheme */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          ప్రభుత్వ ఆరోగ్య పథకం / Linked Health Scheme
                        </label>
                        <select
                          value={patientData.govtHealthScheme}
                          onChange={e => setPatientData({ ...patientData, govtHealthScheme: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-bold"
                        >
                          <option value="Aarogyasri">ఆరోగ్యశ్రీ / Aarogyasri</option>
                          <option value="PM-JAY">ఆయుష్మాన్ భారత్ / PM-JAY</option>
                          <option value="EHS">EHS (Telangana Govt Employees Scheme)</option>
                          <option value="Private Insurance">ప్రైవేట్ హెల్త్ ఇన్సూరెన్స్ / Private Insurance</option>
                          <option value="None">ఏదీ లేదు / None</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-800 mb-1">
                          పథకం కార్డు నంబరు / Health Scheme Card No.
                        </label>
                        <input
                          type="text"
                          value={patientData.schemeCardNumber}
                          onChange={e => setPatientData({ ...patientData, schemeCardNumber: e.target.value })}
                          placeholder="Card / Policy Number"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                        />
                      </div>
                    </div>

                    {/* Chronic Health Conditions Checkboxes */}
                    <div className="pt-2 border-t border-slate-200">
                      <label className="block font-black text-slate-900 mb-1.5">
                        ముందస్తు అనారోగ్య సమస్యలు / Pre-existing Health Conditions (Select all that apply):
                      </label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {[
                          { id: 'Diabetes', label: 'మధుమేహం / Diabetes (Sugar)' },
                          { id: 'Hypertension', label: 'రక్తపోటు / Hypertension (BP)' },
                          { id: 'Cardiac', label: 'గుండె జబ్బులు / Heart Disease' },
                          { id: 'Asthma', label: 'శ్వాసకోశ / Asthma / Lung' },
                          { id: 'Kidney', label: 'కిడ్నీ సమస్యలు / Kidney Disease' },
                          { id: 'Thyroid', label: 'థైరాయిడ్ / Thyroid' },
                        ].map(c => {
                          const checked = patientData.chronicConditions.includes(c.id);
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => toggleCondition(c.id)}
                              className={`p-2 rounded-lg border text-left flex items-center gap-2 cursor-pointer transition-all ${
                                checked 
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' 
                                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                checked ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
                              }`}>
                                {checked && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <span className="text-[11px]">{c.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Emergency Contact Information */}
                    <div className="pt-3 border-t border-slate-200 bg-rose-50/50 p-3.5 rounded-xl border border-rose-200/80 space-y-3">
                      <div className="flex items-center gap-2 text-rose-900 font-black">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                        <span>అత్యవసర సంప్రదింపు వ్యక్తి / Emergency Contact Person</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            సంప్రదింపు వ్యక్తి పేరు / Contact Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={patientData.emergencyName}
                            onChange={e => setPatientData({ ...patientData, emergencyName: e.target.value })}
                            placeholder="e.g. Sunita Kumar"
                            className={`w-full p-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                              errors.emergencyName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.emergencyName && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.emergencyName}</p>}
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            సంబంధం / Relationship <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={patientData.emergencyRelation}
                            onChange={e => setPatientData({ ...patientData, emergencyRelation: e.target.value })}
                            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 font-bold"
                          >
                            <option value="Spouse">భార్య / భర్త / Spouse</option>
                            <option value="Father">తండ్రి / Father</option>
                            <option value="Mother">తల్లి / Mother</option>
                            <option value="Son">కుమారుడు / Son</option>
                            <option value="Daughter">కుమార్తె / Daughter</option>
                            <option value="Brother">సోదరుడు / Brother</option>
                            <option value="Sister">సోదరి / Sister</option>
                            <option value="Friend">స్నేహితుడు / Friend</option>
                            <option value="Other">ఇతరులు / Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-800 mb-1">
                            అత్యవసర ఫోన్ నంబరు / Emergency Phone <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            maxLength={10}
                            value={patientData.emergencyPhone}
                            onChange={e => setPatientData({ ...patientData, emergencyPhone: e.target.value.replace(/\D/g, '') })}
                            placeholder="10-digit mobile"
                            className={`w-full p-2.5 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 ${
                              errors.emergencyPhone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300'
                            }`}
                          />
                          {errors.emergencyPhone && <p className="text-red-600 text-[11px] font-semibold mt-1">{errors.emergencyPhone}</p>}
                        </div>
                      </div>
                    </div>

                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPatientStep(2)}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#0a2540] hover:bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:gap-3"
                    >
                      <span>తరువాతి విభాగం / Next: Documents & Signature</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: DOCUMENTS, PHOTO & DIGITAL SIGNATURE */}
              {patientStep === 4 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black">
                      4
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-purple-950">
                        పత్రాల అప్‌లోడ్ & డిజిటల్ సంతకం / Documents & Signature
                      </h3>
                      <p className="text-[11px] text-purple-800 font-medium">
                        పాస్‌పోర్ట్ సైజు ఫోటో, ఆధార్ కార్డ్ కాపీ మరియు ధ్రువీకరణ సంతకం.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    
                    {/* Photo and Aadhaar Upload Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      
                      {/* Photo Upload Box */}
                      <div className="border border-dashed border-slate-300 rounded-xl p-3.5 text-center bg-slate-50 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-emerald-500 shadow-sm mb-2 bg-slate-200 relative group">
                          <img
                            src={patientData.photoUrl}
                            alt="Patient Preview"
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                            Change
                          </div>
                        </div>
                        <div className="font-bold text-slate-800 text-xs">పాస్‌పోర్ట్ సైజు ఫోటో / Patient Photo</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">JPG / PNG, Max 2MB</p>
                        <div className="flex gap-2 mt-2">
                          <label className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Upload Photo</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={e => {
                                if (e.target.files?.[0]) {
                                  const url = URL.createObjectURL(e.target.files[0]);
                                  setPatientData({ ...patientData, photoUrl: url });
                                }
                              }}
                            />
                          </label>
                        </div>
                      </div>

                      {/* Aadhaar Card Document Upload */}
                      <div className="border border-dashed border-slate-300 rounded-xl p-3.5 text-center bg-slate-50 flex flex-col items-center justify-center">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                          <FileText className="w-6 h-6" />
                        </div>
                        <div className="font-bold text-slate-800 text-xs">ఆధార్ కార్డు కాపీ / Aadhaar Card Scan</div>
                        <p className="text-[10px] text-slate-500 mt-0.5">PDF or Image (Front & Back)</p>
                        
                        {patientData.aadhaarFileName ? (
                          <div className="mt-2 bg-blue-50 border border-blue-200 px-3 py-1 rounded-lg text-[11px] font-bold text-blue-900 flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{patientData.aadhaarFileName}</span>
                          </div>
                        ) : (
                          <label className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1">
                            <Upload className="w-3 h-3" />
                            <span>Select Document</span>
                            <input
                              type="file"
                              className="hidden"
                              onChange={e => {
                                if (e.target.files?.[0]) {
                                  setPatientData({ ...patientData, aadhaarFileName: e.target.files[0].name });
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>

                    </div>

                    {/* Patient Undertaking & Digital Signature */}
                    <div className="pt-2 border-t border-slate-200 space-y-3">
                      <div className="font-black text-slate-900 text-xs">
                        డిజిటల్ సంతకం / Digital Signature
                      </div>

                      <div className="bg-slate-50 border border-slate-300 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-600 font-bold">
                            Type your full legal name as authorized electronic signature:
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">E-SIGN V2.1</span>
                        </div>
                        <input
                          type="text"
                          value={patientData.signatureText || patientData.fullName}
                          onChange={e => setPatientData({ ...patientData, signatureText: e.target.value })}
                          placeholder="Type your name to sign"
                          className="w-full p-2.5 bg-white border border-slate-300 rounded-lg font-serif italic text-base text-blue-950 focus:ring-2 focus:ring-purple-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Legal Declaration Checkbox (Authoritative Exact Bilingual Translation) */}
                    <div className="pt-3 border-t border-slate-200">
                      <div className={`p-3.5 rounded-xl border transition-all ${
                        patientData.declarationAgreed 
                          ? 'bg-emerald-50/70 border-emerald-300' 
                          : 'bg-slate-50 border-slate-300'
                      }`}>
                        <label className="flex items-start gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={patientData.declarationAgreed}
                            onChange={e => {
                              setPatientData({ ...patientData, declarationAgreed: e.target.checked });
                              if (e.target.checked) setErrors(prev => ({ ...prev, declarationAgreed: '' }));
                            }}
                            className="w-4 h-4 mt-0.5 text-emerald-600 rounded focus:ring-emerald-500 border-slate-300 cursor-pointer"
                          />
                          <div className="space-y-1">
                            <div className="text-[11.5px] font-bold text-slate-900 leading-snug">
                              డిక్లరేషన్ & అంగీకారం / Declaration & Undertaking <span className="text-red-500">*</span>
                            </div>
                            <p className="text-[10.5px] text-slate-700 leading-relaxed">
                              "నేను పైన తెలిపిన వివరాలన్నీ సత్యమైనవని, సరైనవని ప్రమాణపూర్వకంగా ధృవీకరిస్తున్నాను. ఆయుధ్ వికాస్ హెల్త్‌కేర్ నెట్‌వర్క్ నిబంధనలకు కట్టుబడి ఉంటానని అంగీకరిస్తున్నాను."
                            </p>
                            <p className="text-[10px] text-slate-500 italic leading-relaxed">
                              "I hereby declare that all the information provided above is true and correct to the best of my knowledge. I agree to abide by the healthcare network guidelines of Ayudh Vikas Foundation."
                            </p>
                          </div>
                        </label>
                      </div>
                      {errors.declarationAgreed && (
                        <p className="text-red-600 text-[11px] font-semibold mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors.declarationAgreed}</span>
                        </p>
                      )}
                    </div>

                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPatientStep(3)}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="bg-[#0a2540] hover:bg-slate-900 text-white font-black text-xs px-6 py-2.5 rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:gap-3"
                    >
                      <span>సమీక్ష / Review Before Submission</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 5: REVIEW BEFORE SUBMISSION (సమీక్ష మరియు సమర్పణ) */}
              {patientStep === 5 && (
                <div className="space-y-4 animate-in fade-in">
                  <div className="bg-indigo-50/80 border border-indigo-200 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black">
                        5
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-indigo-950">
                          నమోదు వివరాల సమీక్ష / Review Registration Details
                        </h3>
                        <p className="text-[11px] text-indigo-800 font-medium">
                          దయచేసి తుది సమర్పణకు ముందు అన్ని వివరాలను సరిచూసుకోండి (Verify all fields before final submit).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 text-xs">
                    
                    {/* Header Summary Box */}
                    <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-emerald-500 shadow-xs shrink-0">
                        <img src={patientData.photoUrl} alt="Patient" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <div className="text-base font-black text-[#0a2540]">{patientData.fullName || 'Patient Name'}</div>
                        <div className="text-xs text-slate-600 font-medium">
                          {patientData.age} Yrs, {patientData.gender} | Blood Group: <strong className="text-rose-700">{patientData.bloodGroup}</strong>
                        </div>
                        <div className="text-xs text-slate-500">
                          Mobile: <strong>{patientData.mobileNumber}</strong> | Aadhaar: <span className="font-mono">{patientData.aadhaarNumber}</span>
                        </div>
                      </div>
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2.5 py-1 rounded-full border border-emerald-300">
                        Ready for Submission
                      </span>
                    </div>

                    {/* Section 1 Summary */}
                    <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-black text-slate-900">1. Personal & Contact Information</span>
                        <button
                          type="button"
                          onClick={() => setPatientStep(1)}
                          className="text-blue-600 hover:underline font-bold text-[11px]"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                        <div><span className="text-slate-500">Father/Spouse:</span> <strong>{patientData.fatherOrSpouseName}</strong></div>
                        <div><span className="text-slate-500">Marital Status:</span> <strong>{patientData.maritalStatus}</strong></div>
                        <div><span className="text-slate-500">Mother Tongue:</span> <strong>{patientData.motherTongue}</strong></div>
                        <div><span className="text-slate-500">Occupation:</span> <strong>{patientData.occupation || 'N/A'}</strong></div>
                      </div>
                    </div>

                    {/* Section 2 Summary */}
                    <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-black text-slate-900">2. Residential Address</span>
                        <button
                          type="button"
                          onClick={() => setPatientStep(2)}
                          className="text-blue-600 hover:underline font-bold text-[11px]"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-800 pt-1">
                        {patientData.doorNo}, {patientData.street && `${patientData.street}, `}
                        {patientData.villageOrTown}, {patientData.mandal} Mandal, {patientData.district} District, {patientData.state} - {patientData.pincode}
                      </p>
                    </div>

                    {/* Section 3 Summary */}
                    <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                      <div className="flex items-center justify-between pb-1 border-b border-slate-200">
                        <span className="font-black text-slate-900">3. Health Schemes & Emergency Contact</span>
                        <button
                          type="button"
                          onClick={() => setPatientStep(3)}
                          className="text-blue-600 hover:underline font-bold text-[11px]"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                        <div><span className="text-slate-500">Scheme:</span> <strong>{patientData.govtHealthScheme}</strong></div>
                        <div><span className="text-slate-500">Emergency Person:</span> <strong>{patientData.emergencyName} ({patientData.emergencyRelation}) - {patientData.emergencyPhone}</strong></div>
                      </div>
                      {patientData.chronicConditions.length > 0 && (
                        <div className="text-[11px] pt-1">
                          <span className="text-slate-500">Pre-existing Conditions:</span>{' '}
                          <span className="font-bold text-amber-900">{patientData.chronicConditions.join(', ')}</span>
                        </div>
                      )}
                    </div>

                    {/* Undertaking check confirmation */}
                    <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-[11px] text-emerald-900 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Declaration accepted and E-Signed as: <strong>{patientData.signatureText || patientData.fullName}</strong></span>
                    </div>

                    {renderPaymentStep('patient')}

                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => setPatientStep(4)}
                      className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Back to Documents</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleFinalSubmit}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-8 py-3 rounded-xl shadow-lg flex items-center gap-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>CONFIRM & SUBMIT REGISTRATION (నమోదును సమర్పించండి)</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: POST-SUBMISSION SUCCESS ARTIFACTS (PATIENT ID, DIGITAL ID CARD, CERTIFICATE, OP REQUEST) */}
              {patientStep === 6 && registrationResult && (
                <div className="space-y-5 animate-in fade-in zoom-in-95">
                  
                  {/* Success Banner */}
                  <div className="bg-emerald-600 text-white p-5 rounded-2xl shadow-lg text-center space-y-2 relative overflow-hidden">
                    <div className="w-14 h-14 bg-white text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-md">
                      <CheckCircle2 className="w-9 h-9" />
                    </div>
                    <h2 className="text-xl font-black uppercase tracking-tight">
                      రోగి నమోదు విజయవంతంగా పూర్తయింది!
                    </h2>
                    <p className="text-sm font-semibold text-emerald-100 max-w-lg mx-auto">
                      Patient Registration Successfully Submitted & Approved. Your permanent Ayudh Vikas Patient ID has been generated.
                    </p>
                    <p className="text-xs font-semibold text-white/90">
                      Sign in with your mobile number and the password you created.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs">
                      <div className="bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl font-mono">
                        Patient ID: <strong className="text-white text-sm">{registrationResult.patientId}</strong>
                      </div>
                      <div className="bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-xl font-mono">
                        Ref No: <strong className="text-white text-sm">{registrationResult.referenceNo}</strong>
                      </div>
                      <div className="bg-emerald-800 text-emerald-200 px-3 py-1 rounded-full text-[11px] font-bold">
                        Status: APPROVED & ACTIVE
                      </div>
                    </div>
                  </div>

                  {/* Generated Official Digital Patient ID Card Preview */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-md space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-black text-slate-800 uppercase">
                        <QrCode className="w-4 h-4 text-emerald-600" />
                        <span>Digital Ayudh Vikas Health Card</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                        Valid Till: 31-DEC-2027
                      </span>
                    </div>

                    {/* Realistic ID Card Visual */}
                    <div className="bg-gradient-to-r from-[#0a2540] via-[#0f345a] to-[#144473] text-white p-4 rounded-xl shadow-inner relative overflow-hidden border border-blue-400/30">
                      <div className="flex items-center justify-between pb-3 border-b border-white/20">
                        <div className="flex items-center gap-2">
                          <BrandLogo className="w-7 h-7" />
                          <div>
                            <div className="text-xs font-black tracking-tight leading-none">AYUDH VIKAS HEALTH CARE</div>
                            <div className="text-[8px] text-emerald-300 font-bold uppercase">Patient Identity Card</div>
                          </div>
                        </div>
                        <div className="text-right font-mono text-[10px] text-emerald-300">
                          {registrationResult.patientId}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 pt-3">
                        <div className="w-16 h-16 rounded-xl overflow-hidden bg-white/20 border-2 border-emerald-400 shrink-0">
                          <img src={patientData.photoUrl} alt="Patient Avatar" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-0.5 text-xs">
                          <div className="text-sm font-black text-white">{patientData.fullName}</div>
                          <div className="text-[11px] text-blue-200">
                            Age: <strong>{patientData.age} Yrs</strong> | Blood: <strong className="text-emerald-300">{patientData.bloodGroup}</strong>
                          </div>
                          <div className="text-[10px] text-slate-300">
                            District: <strong>{patientData.district}</strong> | Ph: <strong>{patientData.mobileNumber}</strong>
                          </div>
                        </div>
                        <div className="w-14 h-14 bg-white p-1 rounded-lg shrink-0 flex flex-col items-center justify-center text-slate-900">
                          <QrCode className="w-10 h-10" />
                          <span className="text-[6px] font-black uppercase">SCAN TO VERIFY</span>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => alert(`Downloading Digital Health Card for ${patientData.fullName} (${registrationResult.patientId})...`)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Download ID Card</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => window.print()}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-lg border border-slate-300 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5 text-blue-600" />
                          <span>Print Certificate</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500 font-semibold">
                        Registered: {registrationResult.submittedAt}
                      </div>
                    </div>
                  </div>

                  {/* Immediate Next Step Action: Request OP / Checkup */}
                  <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
                    <div className="space-y-0.5 text-center sm:text-left">
                      <div className="text-xs font-black text-emerald-950 uppercase flex items-center gap-1.5 justify-center sm:justify-start">
                        <Stethoscope className="w-4 h-4 text-emerald-700" />
                        <span>Ready to Consult a Doctor or Book OP?</span>
                      </div>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        Now that your registration is active, you can immediately request an Out-Patient (OP) consultation or health checkup.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToOP) {
                            onNavigateToOP(registrationResult.patientId);
                            resetAll();
                          } else {
                            alert(`Proceeding to OP Request for Patient ID: ${registrationResult.patientId}`);
                            resetAll();
                          }
                        }}
                        className="flex-1 sm:flex-none bg-[#0a2540] hover:bg-slate-900 text-white font-black text-xs px-5 py-2.5 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <span>Request OP / Consult Doctor</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (onNavigateToDashboard) {
                            onNavigateToDashboard();
                          }
                          resetAll();
                        }}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2.5 rounded-xl shadow-md cursor-pointer"
                      >
                        Go to Dashboard
                      </button>
                    </div>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* ===================================================================== */}
          {/* ROLE 2: DOCTOR REGISTRATION FORM (వైద్యుల నమోదు ఫారం) */}
          {/* ===================================================================== */}
          {selectedRole === 'doctor' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Doctor' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Doctor Registration Submitted
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you, Dr. {doctorData.fullName || 'Doctor'}. Your credentials and Medical Council Reg. No. ({doctorData.registrationNo || 'MCI-19402'}) have been submitted for verification by the Ayudh Vikas Medical Board.
                  </p>
                  <button
                    onClick={resetAll}
                    className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Doctor'); }} className="space-y-4">
                  <div className="bg-blue-50/80 border border-blue-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                      🩺
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-blue-950">
                        వైద్యుల నమోదు ఫారం / Doctor Onboarding & Network Registration
                      </h3>
                      <p className="text-[11px] text-blue-800 font-medium">
                        Join Ayudh Vikas Healthcare Network to provide consultations and participate in health camps.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Doctor Full Name *</label>
                        <input
                          required
                          type="text"
                          value={doctorData.fullName}
                          onChange={e => setDoctorData({ ...doctorData, fullName: e.target.value })}
                          placeholder="e.g. Dr. Ravi Teja, MD"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Primary Speciality *</label>
                        <select
                          value={doctorData.speciality}
                          onChange={e => setDoctorData({ ...doctorData, speciality: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                        >
                          {SPECIALITIES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Sub-speciality / Focus area</label>
                      <input
                        type="text"
                        value={doctorData.subSpeciality}
                        onChange={(e) => setDoctorData({ ...doctorData, subSpeciality: e.target.value })}
                        placeholder="e.g. Interventional Cardiology, Pediatric Orthopedics"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Additional specialities (shown in patient search)</label>
                      <div className="flex flex-wrap gap-1.5">
                        {SPECIALITIES.filter((s) => s !== doctorData.speciality).map((spec) => {
                          const selected = doctorData.additionalSpecialities.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                const next = selected
                                  ? doctorData.additionalSpecialities.filter((s) => s !== spec)
                                  : [...doctorData.additionalSpecialities, spec];
                                setDoctorData({ ...doctorData, additionalSpecialities: next });
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                                selected ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Medical Council Reg. No. *</label>
                        <input
                          required
                          type="text"
                          value={doctorData.registrationNo}
                          onChange={e => setDoctorData({ ...doctorData, registrationNo: e.target.value })}
                          placeholder="e.g. TSMC / MCI 84920"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Experience (Years) *</label>
                        <input
                          required
                          type="number"
                          value={doctorData.experienceYears}
                          onChange={e => setDoctorData({ ...doctorData, experienceYears: e.target.value })}
                          placeholder="e.g. 10"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Practice District *</label>
                        <select
                          value={doctorData.district}
                          onChange={e => setDoctorData({ ...doctorData, district: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-bold"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Mobile Number *</label>
                        <input
                          required
                          type="tel"
                          value={doctorData.mobile}
                          onChange={e => setDoctorData({ ...doctorData, mobile: e.target.value })}
                          placeholder="10-digit mobile"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Hospital / Clinic Attachment</label>
                        <input
                          type="text"
                          value={doctorData.currentHospital}
                          onChange={e => setDoctorData({ ...doctorData, currentHospital: e.target.value })}
                          placeholder="Hospital Name"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Email</label>
                      <input
                        type="email"
                        value={doctorData.email}
                        onChange={e => setDoctorData({ ...doctorData, email: e.target.value })}
                        placeholder="doctor@email.com"
                        className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3 space-y-3">
                      <p className="font-black text-blue-950 uppercase text-[11px]">Verification certificates (PDF or image) *</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          ['degree', 'MBBS / MD / MS Degree *'],
                          ['council', 'State Medical Council Certificate *'],
                          ['license', 'Practice License / Registration *'],
                          ['specialty_cert', 'Speciality / Super-speciality Certificate'],
                          ['id_proof', 'Aadhaar / PAN (ID proof)'],
                          ['experience', 'Experience / Hospital appointment letter'],
                        ].map(([type, label]) => (
                          <div key={type}>
                            <label className="block font-bold text-slate-800 mb-1">{label}</label>
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => attachDocument(setDoctorData, type, e.target.files?.[0])}
                              className="w-full text-xs"
                            />
                            {uploadedName(doctorData.verificationDocuments, type) && (
                              <p className="text-[10px] text-emerald-700 font-bold mt-1">Uploaded: {uploadedName(doctorData.verificationDocuments, type)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {renderPasswordFields(
                      doctorData.password,
                      doctorData.confirmPassword,
                      (value) => setDoctorData({ ...doctorData, password: value }),
                      (value) => setDoctorData({ ...doctorData, confirmPassword: value }),
                      'focus:ring-blue-600'
                    )}

                    <button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
                    >
                      SUBMIT DOCTOR REGISTRATION (వైద్యుల నమోదు సమర్పించండి)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* ROLE 3: HOSPITAL REGISTRATION FORM (ఆసుపత్రి నమోదు ఫారం) */}
          {/* ===================================================================== */}
          {selectedRole === 'hospital' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Hospital' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Hospital Empanelment Application Submitted
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you. {hospitalData.hospitalName || 'Your Hospital'} empanelment request has been received. Our hospital empanelment committee will contact you for facility verification.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Hospital'); }} className="space-y-4">
                  <div className="bg-amber-50/80 border border-amber-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-600 text-white flex items-center justify-center font-black">
                      🏥
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-amber-950">
                        ఆసుపత్రి నమోదు & భాగస్వామ్యం / Hospital Network Empanelment
                      </h3>
                      <p className="text-[11px] text-amber-800 font-medium">
                        Register your hospital to become an official Ayudh Vikas Network Empaneled Center.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Hospital / Medical Center Name *</label>
                        <input
                          required
                          type="text"
                          value={hospitalData.hospitalName}
                          onChange={e => setHospitalData({ ...hospitalData, hospitalName: e.target.value })}
                          placeholder="e.g. MGM Care Super Specialty Hospital"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Hospital Category *</label>
                        <select
                          value={hospitalData.category}
                          onChange={e => setHospitalData({ ...hospitalData, category: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-bold"
                        >
                          <option value="Super Specialty Hospital">Super Specialty Hospital</option>
                          <option value="Multi Specialty Hospital">Multi Specialty Hospital</option>
                          <option value="District General Hospital">District General Hospital</option>
                          <option value="Eye / Dental / Maternity Care">Eye / Dental / Maternity Care</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">NABH / NABL Accredited *</label>
                        <select
                          value={hospitalData.nabhAccredited}
                          onChange={e => setHospitalData({ ...hospitalData, nabhAccredited: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        >
                          <option value="Yes">Yes (Accredited)</option>
                          <option value="Under Process">Under Process</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Total Bed Capacity *</label>
                        <input
                          required
                          type="number"
                          value={hospitalData.totalBeds}
                          onChange={e => setHospitalData({ ...hospitalData, totalBeds: e.target.value })}
                          placeholder="e.g. 150"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">District *</label>
                        <select
                          value={hospitalData.district}
                          onChange={e => setHospitalData({ ...hospitalData, district: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 font-bold"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Hospital specialities * (used in patient search)</label>
                      <p className="text-[10px] text-slate-500 font-semibold mb-2">Select every department you want patients to find you under.</p>
                      <div className="flex flex-wrap gap-1.5">
                        {SPECIALITIES.map((spec) => {
                          const selected = hospitalData.specialities.includes(spec);
                          return (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => {
                                const next = selected
                                  ? hospitalData.specialities.filter((s) => s !== spec)
                                  : [...hospitalData.specialities, spec];
                                setHospitalData({
                                  ...hospitalData,
                                  specialities: next,
                                  keySpecialities: next,
                                  primarySpeciality: next[0] || '',
                                });
                              }}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black border cursor-pointer ${
                                selected ? 'bg-amber-600 text-white border-amber-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {spec}
                            </button>
                          );
                        })}
                      </div>
                      {hospitalData.specialities.length > 0 && (
                        <p className="text-[10px] text-amber-800 font-bold mt-1.5">Selected: {hospitalData.specialities.join(', ')}</p>
                      )}
                    </div>

                    <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3 space-y-3">
                      <p className="font-black text-amber-950 uppercase text-[11px]">Hospital certificates (PDF or image) *</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                          ['registration', 'Hospital Registration Certificate *'],
                          ['clinical_license', 'Clinical Establishment License *'],
                          ['nabh', 'NABH / NABL Certificate'],
                          ['fire_safety', 'Fire & Safety NOC'],
                          ['pollution', 'Pollution Control Board certificate'],
                          ['gst', 'GST / PAN of hospital'],
                        ].map(([type, label]) => (
                          <div key={type}>
                            <label className="block font-bold text-slate-800 mb-1">{label}</label>
                            <input
                              type="file"
                              accept=".pdf,image/*"
                              onChange={(e) => attachDocument(setHospitalData, type, e.target.files?.[0])}
                              className="w-full text-xs"
                            />
                            {uploadedName(hospitalData.verificationDocuments, type) && (
                              <p className="text-[10px] text-emerald-700 font-bold mt-1">Uploaded: {uploadedName(hospitalData.verificationDocuments, type)}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Contact Administrator Name *</label>
                        <input
                          required
                          type="text"
                          value={hospitalData.contactPerson}
                          onChange={e => setHospitalData({ ...hospitalData, contactPerson: e.target.value })}
                          placeholder="Medical Superintendent / Admin"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Official Contact Phone *</label>
                        <input
                          required
                          type="tel"
                          value={hospitalData.contactPhone}
                          onChange={e => setHospitalData({ ...hospitalData, contactPhone: e.target.value })}
                          placeholder="Official Mobile / Landline"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                        />
                      </div>
                    </div>

                    {renderPasswordFields(
                      hospitalData.password,
                      hospitalData.confirmPassword,
                      (value) => setHospitalData({ ...hospitalData, password: value }),
                      (value) => setHospitalData({ ...hospitalData, confirmPassword: value }),
                      'focus:ring-amber-600'
                    )}

                    <div className="pt-2">
                      {renderPaymentStep('hospital')}
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black text-xs uppercase py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
                    >
                      SUBMIT HOSPITAL EMPANELMENT (ఆసుపత్రి నమోదు సమర్పించండి)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* ROLE 4: MARKETING TEAM ENROLLMENT (మార్కెటింగ్ విభాగం నమోదు) */}
          {/* ===================================================================== */}
          {selectedRole === 'marketing' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Marketing' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Marketing Team Application Received
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you {marketingData.fullName}. Your application for Ayudh Vikas Community Healthcare Outreach & Marketing Coordinator in {marketingData.district} has been received.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Marketing'); }} className="space-y-4">
                  <div className="bg-purple-50/80 border border-purple-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center font-black">
                      📢
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-purple-950">
                        మార్కెటింగ్ బృందం & ఫీల్డ్ కోఆర్డినేటర్ నమోదు / Marketing Team Enrollment
                      </h3>
                      <p className="text-[11px] text-purple-800 font-medium">
                        Join our healthcare outreach team to coordinate camps, patient admissions, and awareness.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                        <input
                          required
                          type="text"
                          value={marketingData.fullName}
                          onChange={e => setMarketingData({ ...marketingData, fullName: e.target.value })}
                          placeholder="e.g. Rohit Kumar"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Assigned Territory / Zone *</label>
                        <input
                          required
                          type="text"
                          value={marketingData.assignedTerritory}
                          onChange={e => setMarketingData({ ...marketingData, assignedTerritory: e.target.value })}
                          placeholder="e.g. Warangal Urban, Narsampet, Parkal"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">District *</label>
                        <select
                          value={marketingData.district}
                          onChange={e => setMarketingData({ ...marketingData, district: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 font-bold"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Mobile Number *</label>
                        <input
                          required
                          type="tel"
                          value={marketingData.mobile}
                          onChange={e => setMarketingData({ ...marketingData, mobile: e.target.value })}
                          placeholder="10-digit mobile"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Experience (Years)</label>
                        <input
                          type="number"
                          value={marketingData.experienceYears}
                          onChange={e => setMarketingData({ ...marketingData, experienceYears: e.target.value })}
                          placeholder="e.g. 2"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                        />
                      </div>
                    </div>

                    {renderPasswordFields(
                      marketingData.password,
                      marketingData.confirmPassword,
                      (value) => setMarketingData({ ...marketingData, password: value }),
                      (value) => setMarketingData({ ...marketingData, confirmPassword: value }),
                      'focus:ring-purple-600'
                    )}

                    <button
                      type="submit"
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white font-black text-xs uppercase py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
                    >
                      SUBMIT MARKETING REGISTRATION (నమోదును సమర్పించండి)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* ROLE 5: AMBULANCE DRIVER REGISTRATION (అంబులెన్స్ డ్రైవర్ నమోదు) */}
          {/* ===================================================================== */}
          {selectedRole === 'ambulance' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Ambulance' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Ambulance Driver Registered
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Vehicle ({ambulanceData.vehicleNumber}) has been enlisted to the Ayudh Vikas Emergency Dispatch System.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Ambulance'); }} className="space-y-4">
                  <div className="bg-rose-50/80 border border-rose-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center font-black">
                      🚑
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-rose-950">
                        అంబులెన్స్ డ్రైవర్ & వాహన నమోదు / 24x7 Ambulance Network Enrollment
                      </h3>
                      <p className="text-[11px] text-rose-800 font-medium">
                        Register emergency transport vehicles for rapid patient shifting and critical dispatch.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Driver Full Name *</label>
                        <input
                          required
                          type="text"
                          value={ambulanceData.driverName}
                          onChange={e => setAmbulanceData({ ...ambulanceData, driverName: e.target.value })}
                          placeholder="e.g. S. Venkatesh"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Driving License No. *</label>
                        <input
                          required
                          type="text"
                          value={ambulanceData.licenseNumber}
                          onChange={e => setAmbulanceData({ ...ambulanceData, licenseNumber: e.target.value })}
                          placeholder="e.g. TS032018002941"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Ambulance Vehicle No. *</label>
                        <input
                          required
                          type="text"
                          value={ambulanceData.vehicleNumber}
                          onChange={e => setAmbulanceData({ ...ambulanceData, vehicleNumber: e.target.value })}
                          placeholder="e.g. TS 03 UA 1080"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 font-mono font-bold"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Vehicle Type *</label>
                        <select
                          value={ambulanceData.vehicleType}
                          onChange={e => setAmbulanceData({ ...ambulanceData, vehicleType: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 font-bold"
                        >
                          <option value="Advanced Life Support (ALS) with Ventilator">ALS (Advanced Life Support)</option>
                          <option value="Basic Life Support (BLS) with Oxygen">BLS (Basic Life Support)</option>
                          <option value="Patient Transport Vehicle (Eco/Van)">Patient Transport Vehicle</option>
                          <option value="ICU on Wheels / Neonatal Care">ICU on Wheels / Neonatal</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Base District *</label>
                        <select
                          value={ambulanceData.district}
                          onChange={e => setAmbulanceData({ ...ambulanceData, district: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600 font-bold"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Mobile Number (Emergency 24x7) *</label>
                        <input
                          required
                          type="tel"
                          value={ambulanceData.mobile}
                          onChange={e => setAmbulanceData({ ...ambulanceData, mobile: e.target.value })}
                          placeholder="10-digit mobile"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Base Station / Parking Location *</label>
                        <input
                          required
                          type="text"
                          value={ambulanceData.baseLocation}
                          onChange={e => setAmbulanceData({ ...ambulanceData, baseLocation: e.target.value })}
                          placeholder="e.g. MGM Hospital Junction / Collectorate"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-600"
                        />
                      </div>
                    </div>

                    {renderPasswordFields(
                      ambulanceData.password,
                      ambulanceData.confirmPassword,
                      (value) => setAmbulanceData({ ...ambulanceData, password: value }),
                      (value) => setAmbulanceData({ ...ambulanceData, confirmPassword: value }),
                      'focus:ring-rose-600'
                    )}

                    <button
                      type="submit"
                      className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
                    >
                      SUBMIT AMBULANCE REGISTRATION (డ్రైవర్ నమోదును సమర్పించండి)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* ===================================================================== */}
          {/* ROLE 6: LAB TEAM REGISTRATION (ల్యాబ్ & డయాగ్నోస్టిక్స్ నమోదు) */}
          {/* ===================================================================== */}
          {selectedRole === 'lab' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Lab' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">
                    Diagnostic Lab Empanelment Submitted
                  </h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you {labData.labName}. Your diagnostic center application has been forwarded to Ayudh Vikas Pathology Network.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Lab'); }} className="space-y-4">
                  <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-xl flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center font-black">
                      🧪
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-teal-950">
                        డయాగ్నోస్టిక్ ల్యాబ్ & పాథాలజీ సెంటర్ నమోదు / Diagnostic Center Empanelment
                      </h3>
                      <p className="text-[11px] text-teal-800 font-medium">
                        Partner with Ayudh Vikas for subsidized blood tests, health camp samples, and home collections.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Diagnostic Center / Lab Name *</label>
                        <input
                          required
                          type="text"
                          value={labData.labName}
                          onChange={e => setLabData({ ...labData, labName: e.target.value })}
                          placeholder="e.g. Vijaya Diagnostic & Pathology Lab"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">NABL Accreditation Status *</label>
                        <select
                          value={labData.nablApproved}
                          onChange={e => setLabData({ ...labData, nablApproved: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold"
                        >
                          <option value="Yes">Yes (NABL Accredited)</option>
                          <option value="Under Process">Under Process</option>
                          <option value="ISO Certified">ISO 9001 Certified</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">District *</label>
                        <select
                          value={labData.district}
                          onChange={e => setLabData({ ...labData, district: e.target.value })}
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600 font-bold"
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Contact Person Name *</label>
                        <input
                          required
                          type="text"
                          value={labData.contactPerson}
                          onChange={e => setLabData({ ...labData, contactPerson: e.target.value })}
                          placeholder="Lab Manager / Pathologist"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Official Mobile *</label>
                        <input
                          required
                          type="tel"
                          value={labData.mobile}
                          onChange={e => setLabData({ ...labData, mobile: e.target.value })}
                          placeholder="10-digit mobile"
                          className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-600"
                        />
                      </div>
                    </div>

                    {renderPasswordFields(
                      labData.password,
                      labData.confirmPassword,
                      (value) => setLabData({ ...labData, password: value }),
                      (value) => setLabData({ ...labData, confirmPassword: value }),
                      'focus:ring-teal-600'
                    )}

                    <button
                      type="submit"
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase py-3 rounded-xl shadow-md cursor-pointer transition-all mt-2"
                    >
                      SUBMIT LAB EMPANELMENT (ల్యాబ్ నమోదును సమర్పించండి)
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {selectedRole === 'volunteer' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'Volunteer' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">Volunteer Application Submitted</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you {volunteerData.fullName || 'Volunteer'}. Our camp coordination team will call you for orientation and rostering.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">Done</button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('Volunteer'); }} className="space-y-4">
                  <div className="bg-teal-50/80 border border-teal-200 p-3 rounded-xl">
                    <h3 className="text-sm font-black text-teal-950">Volunteer Registration / స్వచ్ఛంద సేవకుల నమోదు</h3>
                    <p className="text-[11px] text-teal-800 font-medium">Support health camps, patient guidance, awareness drives and ambulance coordination.</p>
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                        <input required value={volunteerData.fullName} onChange={e => setVolunteerData({ ...volunteerData, fullName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Your name" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Mobile Number *</label>
                        <input required type="tel" value={volunteerData.mobileNumber} onChange={e => setVolunteerData({ ...volunteerData, mobileNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="10-digit mobile" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Age *</label>
                        <input required value={volunteerData.age} onChange={e => setVolunteerData({ ...volunteerData, age: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Age" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Gender</label>
                        <select value={volunteerData.gender} onChange={e => setVolunteerData({ ...volunteerData, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          <option>Male</option><option>Female</option><option>Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Email</label>
                        <input type="email" value={volunteerData.email} onChange={e => setVolunteerData({ ...volunteerData, email: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Email" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">District *</label>
                        <select value={volunteerData.district} onChange={e => setVolunteerData({ ...volunteerData, district: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Village / Town</label>
                        <input value={volunteerData.villageOrTown} onChange={e => setVolunteerData({ ...volunteerData, villageOrTown: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Occupation / Skills</label>
                        <input value={volunteerData.occupation} onChange={e => setVolunteerData({ ...volunteerData, occupation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="Student, ASHA, teacher..." />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Availability *</label>
                        <select value={volunteerData.availability} onChange={e => setVolunteerData({ ...volunteerData, availability: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          <option>Weekends & Health Camps</option>
                          <option>Weekdays</option>
                          <option>Evenings only</option>
                          <option>Full-time / On call</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Preferred Activity *</label>
                        <select value={volunteerData.preferredActivity} onChange={e => setVolunteerData({ ...volunteerData, preferredActivity: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          <option>Health Camps & Patient Guidance</option>
                          <option>Public Awareness</option>
                          <option>Ambulance Coordination</option>
                          <option>Membership Enrolment</option>
                          <option>Hospital Helpdesk</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Emergency Contact Name</label>
                        <input value={volunteerData.emergencyName} onChange={e => setVolunteerData({ ...volunteerData, emergencyName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Emergency Phone</label>
                        <input value={volunteerData.emergencyPhone} onChange={e => setVolunteerData({ ...volunteerData, emergencyPhone: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Why do you want to volunteer?</label>
                      <textarea value={volunteerData.motivation} onChange={e => setVolunteerData({ ...volunteerData, motivation: e.target.value })} rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                    </div>
                    {renderPasswordFields(
                      volunteerData.password,
                      volunteerData.confirmPassword,
                      (value) => setVolunteerData({ ...volunteerData, password: value }),
                      (value) => setVolunteerData({ ...volunteerData, confirmPassword: value }),
                      'focus:ring-teal-600'
                    )}
                    <button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white font-black text-xs uppercase py-3 rounded-xl">
                      Submit Volunteer Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {selectedRole === 'social_organizer' && (
            <div className="space-y-4 animate-in fade-in">
              {nonPatientSubmitted === 'SocialOrganizer' ? (
                <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-14 h-14 bg-lime-100 text-lime-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-black text-slate-900 uppercase">Social Organizer Application Submitted</h3>
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Thank you {socialOrganizerData.fullName || socialOrganizerData.organizationName}. Our community partnership cell will contact you to plan camps in your area.
                  </p>
                  <button onClick={resetAll} className="bg-[#0a2540] text-white font-bold text-xs px-6 py-2.5 rounded-xl cursor-pointer">Done</button>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); handleNonPatientSubmit('SocialOrganizer'); }} className="space-y-4">
                  <div className="bg-lime-50/80 border border-lime-200 p-3 rounded-xl">
                    <h3 className="text-sm font-black text-lime-950">Social Organizer Registration / సామాజిక సంఘటకులు</h3>
                    <p className="text-[11px] text-lime-800 font-medium">For SHG leaders, village elders, NGOs and community mobilisers who can bring people to camps.</p>
                  </div>
                  <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 space-y-3 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Full Name *</label>
                        <input required value={socialOrganizerData.fullName} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, fullName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Organization / Group Name</label>
                        <input value={socialOrganizerData.organizationName} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, organizationName: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" placeholder="SHG / NGO / Village committee" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Designation</label>
                        <input value={socialOrganizerData.designation} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, designation: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Mobile Number *</label>
                        <input required type="tel" value={socialOrganizerData.mobileNumber} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, mobileNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Email</label>
                        <input type="email" value={socialOrganizerData.email} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, email: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">District *</label>
                        <select value={socialOrganizerData.district} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, district: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          {DISTRICTS.map(d => <option key={d}>{d}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Coverage Area (villages / mandal) *</label>
                        <input required value={socialOrganizerData.coverageArea} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, coverageArea: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Community Type</label>
                        <select value={socialOrganizerData.communityType} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, communityType: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          <option>Village / SHG / NGO</option>
                          <option>Self Help Group</option>
                          <option>NGO / Trust</option>
                          <option>Temple / Church / Mosque committee</option>
                          <option>School / College</option>
                          <option>Trade union / Worker welfare</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">Years of Community Work</label>
                        <input value={socialOrganizerData.yearsOfWork} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, yearsOfWork: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">People you can mobilise</label>
                        <select value={socialOrganizerData.peopleCanMobilize} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, peopleCanMobilize: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg">
                          <option>25-50</option>
                          <option>50-100</option>
                          <option>100-250</option>
                          <option>250+</option>
                        </select>
                      </div>
                      <div>
                        <label className="block font-bold text-slate-800 mb-1">UPI / Bank for camp expenses (optional)</label>
                        <input value={socialOrganizerData.bankOrUpi} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, bankOrUpi: e.target.value })} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">Previous camps or community programmes</label>
                      <textarea value={socialOrganizerData.previousCamps} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, previousCamps: e.target.value })} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">How will you work with Ayudh Vikas?</label>
                      <textarea value={socialOrganizerData.motivation} onChange={e => setSocialOrganizerData({ ...socialOrganizerData, motivation: e.target.value })} rows={2} className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg" />
                    </div>
                    {renderPasswordFields(
                      socialOrganizerData.password,
                      socialOrganizerData.confirmPassword,
                      (value) => setSocialOrganizerData({ ...socialOrganizerData, password: value }),
                      (value) => setSocialOrganizerData({ ...socialOrganizerData, confirmPassword: value }),
                      'focus:ring-lime-600'
                    )}
                    <button type="submit" className="w-full bg-lime-600 hover:bg-lime-700 text-white font-black text-xs uppercase py-3 rounded-xl">
                      Submit Social Organizer Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
