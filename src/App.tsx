import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SearchSection } from './components/SearchSection';
import { ServicesGrid } from './components/ServicesGrid';
import { StatsBanner } from './components/StatsBanner';
import { WidgetsSection } from './components/WidgetsSection';
import { InsurancePartners } from './components/InsurancePartners';
import { Footer } from './components/Footer';
import { Modals } from './components/Modals';
import { LoginPage } from './components/LoginPage';
import { PatientDashboard } from './components/PatientDashboard';
import { DoctorDashboard } from './components/DoctorDashboard';
import { MarketingDashboard } from './components/MarketingDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { HospitalDashboard } from './components/HospitalDashboard';
import { PartnerWithUsPage } from './components/PartnerWithUsPage';
import { BookAppointmentPage } from './components/BookAppointmentPage';
import { AmbulanceBookingPage } from './components/AmbulanceBookingPage';
import { LabTestsPage } from './components/LabTestsPage';
import { HomeServicePage } from './components/HomeServicePage';
import { HospitalGuidancePage } from './components/HospitalGuidancePage';
import { EmergencySupportPage } from './components/EmergencySupportPage';
import { HealthCampsPage } from './components/HealthCampsPage';
import { PartnerHospitalsPage } from './components/PartnerHospitalsPage';
import { CommunityRoleDashboard } from './components/CommunityRoleDashboard';
import { ActiveModal } from './types';
import { useAuth } from './context/AuthContext';

// Helper to safely read from localStorage
const getSavedState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`Error reading localStorage key "${key}":`, e);
  }
  return defaultValue;
};

export default function App() {
  const { user, isLoggedIn, logout } = useAuth();
  const userRole = user?.role || 'patient';
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [activeTab, setActiveTab] = useState<string>(() => getSavedState('ayudh_activeTab', 'home'));
  const [isLoginView, setIsLoginView] = useState<boolean>(() => getSavedState('ayudh_isLoginView', false));
  const [isPartnerView, setIsPartnerView] = useState<boolean>(() => getSavedState('ayudh_isPartnerView', false));
  const [isBookAppointmentView, setIsBookAppointmentView] = useState<boolean>(() => getSavedState('ayudh_isBookAppointmentView', false));
  const [isAmbulanceView, setIsAmbulanceView] = useState<boolean>(() => getSavedState('ayudh_isAmbulanceView', false));
  const [isLabTestsView, setIsLabTestsView] = useState<boolean>(() => getSavedState('ayudh_isLabTestsView', false));
  const [isHomeServiceView, setIsHomeServiceView] = useState<boolean>(() => getSavedState('ayudh_isHomeServiceView', false));
  const [isHospitalGuidanceView, setIsHospitalGuidanceView] = useState<boolean>(() => getSavedState('ayudh_isHospitalGuidanceView', false));
  const [isEmergencyView, setIsEmergencyView] = useState<boolean>(() => getSavedState('ayudh_isEmergencyView', false));
  const [isHealthCampsView, setIsHealthCampsView] = useState<boolean>(() => getSavedState('ayudh_isHealthCampsView', false));
  const [isPartnerHospitalsView, setIsPartnerHospitalsView] = useState<boolean>(() => getSavedState('ayudh_isPartnerHospitalsView', false));
  const [patientActiveTab, setPatientActiveTab] = useState<string>(() => getSavedState('ayudh_patientActiveTab', 'dashboard'));
  const [pendingAfterRegister, setPendingAfterRegister] = useState<{
    type: 'hospital_visit' | 'tab';
    hospitalId?: string;
    doctorId?: string;
    tab?: string;
  } | null>(() => getSavedState('ayudh_pendingAfterRegister', null));

  // Persist routing state changes to localStorage
  useEffect(() => {
    localStorage.setItem('ayudh_activeTab', JSON.stringify(activeTab));
  }, [activeTab]);

  useEffect(() => {
    localStorage.setItem('ayudh_isLoginView', JSON.stringify(isLoginView));
  }, [isLoginView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isPartnerView', JSON.stringify(isPartnerView));
  }, [isPartnerView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isBookAppointmentView', JSON.stringify(isBookAppointmentView));
  }, [isBookAppointmentView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isAmbulanceView', JSON.stringify(isAmbulanceView));
  }, [isAmbulanceView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isLabTestsView', JSON.stringify(isLabTestsView));
  }, [isLabTestsView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isHomeServiceView', JSON.stringify(isHomeServiceView));
  }, [isHomeServiceView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isHospitalGuidanceView', JSON.stringify(isHospitalGuidanceView));
  }, [isHospitalGuidanceView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isEmergencyView', JSON.stringify(isEmergencyView));
  }, [isEmergencyView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isHealthCampsView', JSON.stringify(isHealthCampsView));
  }, [isHealthCampsView]);

  useEffect(() => {
    localStorage.setItem('ayudh_isPartnerHospitalsView', JSON.stringify(isPartnerHospitalsView));
  }, [isPartnerHospitalsView]);

  useEffect(() => {
    localStorage.setItem('ayudh_patientActiveTab', JSON.stringify(patientActiveTab));
  }, [patientActiveTab]);

  useEffect(() => {
    localStorage.setItem('ayudh_pendingAfterRegister', JSON.stringify(pendingAfterRegister));
  }, [pendingAfterRegister]);

  const resetPublicViews = () => {
    setIsLoginView(false);
    setIsPartnerView(false);
    setIsBookAppointmentView(false);
    setIsAmbulanceView(false);
    setIsLabTestsView(false);
    setIsHomeServiceView(false);
    setIsHospitalGuidanceView(false);
    setIsEmergencyView(false);
    setIsHealthCampsView(false);
    setIsPartnerHospitalsView(false);
  };

  const userProfile = {
    name: user?.name || 'Guest',
    displayName: user?.displayName || user?.name || 'Guest',
    patientId: user?.patientId || user?.id || '',
    phone: user?.phone || '',
    email: user?.email || '',
    image: user?.image || '/src/assets/images/patient_avatar_1787229395408.jpg',
    address: user?.address || '',
  };
  
  const [selectedCampTitle, setSelectedCampTitle] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState({
    lookingFor: '',
    speciality: '',
    district: '',
    location: ''
  });

  const handleOpenModal = (modal: ActiveModal) => {
    if (isLoggedIn && userRole === 'patient') {
      if (modal === 'patient_portal') {
        setPatientActiveTab('dashboard');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'book_lab_test') {
        setPatientActiveTab('lab_tests');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'ambulance_booking') {
        setPatientActiveTab('ambulance_booking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'home_service') {
        setPatientActiveTab('home_service');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'book_appointment') {
        setPatientActiveTab('appointments');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'become_member') {
        setPatientActiveTab('membership');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'emergency_help') {
        setPatientActiveTab('emergency');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'find_hospitals') {
        setPatientActiveTab('find_hospitals');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      if (modal === 'health_camps') {
        setActiveModal('camp_register');
        return;
      }
    }

    if (modal === 'patient_portal') {
      resetPublicViews();
      if (!isLoggedIn) {
        setIsLoginView(true);
      }
      return;
    }
    if (modal === 'become_member' || modal === 'become_partner') {
      resetPublicViews();
      setIsPartnerView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'book_appointment') {
      resetPublicViews();
      setIsBookAppointmentView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'ambulance_booking') {
      resetPublicViews();
      setIsAmbulanceView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'book_lab_test') {
      resetPublicViews();
      setIsLabTestsView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'home_service') {
      resetPublicViews();
      setIsHomeServiceView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'find_hospitals') {
      resetPublicViews();
      setIsHospitalGuidanceView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'emergency_help') {
      resetPublicViews();
      setIsEmergencyView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (modal === 'health_camps') {
      resetPublicViews();
      setIsHealthCampsView(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setActiveModal(modal);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleSearchSubmit = (filters: { lookingFor: string; speciality: string; district: string; location: string }) => {
    setSearchFilters(filters);
  };

  const handleShowLogin = () => {
    resetPublicViews();
    if (!isLoggedIn) {
      setIsLoginView(true);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToHome = () => {
    resetPublicViews();
    setActiveTab('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowPartner = () => {
    resetPublicViews();
    setIsPartnerView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowAmbulance = () => {
    resetPublicViews();
    setIsAmbulanceView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowLabTests = () => {
    resetPublicViews();
    setIsLabTestsView(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleShowPartnerHospitals = () => {
    resetPublicViews();
    setIsPartnerHospitalsView(true);
    setActiveTab('hospitals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRequestHospitalVisit = (hospitalId: string, doctorId?: string) => {
    setPendingAfterRegister({ type: 'hospital_visit', hospitalId, doctorId });
    if (isLoggedIn && userRole === 'patient' && !user?.isGuest) {
      resetPublicViews();
      setPatientActiveTab('find_hospitals');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    handleOpenModal('register_patient');
  };

  const handleSetActiveTab = (tab: string) => {
    if (tab === 'membership' || tab === 'community') {
      handleShowPartner();
      return;
    }
    if (tab === 'hospitals') {
      handleShowPartnerHospitals();
      return;
    }
    if (tab === 'camps') {
      resetPublicViews();
      setIsHealthCampsView(true);
      setActiveTab('camps');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    resetPublicViews();
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
      const el = document.getElementById(`section-${tab}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleLoginSuccess = (_role: 'patient' | 'doctor' | 'hospital' | 'marketing' | 'admin' = 'patient') => {
    resetPublicViews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    resetPublicViews();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const applyPendingAfterRegister = () => {
    if (pendingAfterRegister?.type === 'hospital_visit') {
      setPatientActiveTab('find_hospitals');
    } else if (pendingAfterRegister?.type === 'tab' && pendingAfterRegister.tab) {
      setPatientActiveTab(pendingAfterRegister.tab);
    } else {
      setPatientActiveTab('dashboard');
    }
  };

  const handleCompleteRegistration = (_newPatient: any) => {
    resetPublicViews();
    applyPendingAfterRegister();
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToOP = (_patientId: string) => {
    if (pendingAfterRegister?.type === 'hospital_visit') {
      setPatientActiveTab('find_hospitals');
    } else {
      setPatientActiveTab('appointments');
    }
    resetPublicViews();
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToDashboardFromModal = () => {
    applyPendingAfterRegister();
    resetPublicViews();
    setActiveModal(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPublicShell = (body: React.ReactNode) => (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <TopBar
        onOpenModal={handleOpenModal}
        onSignInClick={handleShowLogin}
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onLogout={handleLogout}
        onNavigateDashboard={() => {
          resetPublicViews();
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
      <Navbar
        onOpenModal={handleOpenModal}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onSignInClick={handleShowLogin}
        onPartnerClick={handleShowPartner}
        onAmbulanceClick={handleShowAmbulance}
        onLabsClick={handleShowLabTests}
      />
      <main className="flex-1">{body}</main>
      <Footer
        onOpenModal={handleOpenModal}
        setActiveTab={handleSetActiveTab}
        onSignInClick={handleShowLogin}
      />
      <Modals
        activeModal={activeModal}
        onClose={handleCloseModal}
        selectedCampTitle={selectedCampTitle}
        onCompleteRegistration={handleCompleteRegistration}
        onNavigateToOP={handleNavigateToOP}
        onNavigateToDashboard={handleNavigateToDashboardFromModal}
      />
    </div>
  );

  // 1. IF SUPER ADMIN IS LOGGED IN, RENDER THE SUPER ADMIN DASHBOARD (EXACT AS USER IMAGE)
  if (isLoggedIn && userRole === 'admin') {
    return (
      <SuperAdminDashboard 
        onLogout={handleLogout}
        onNavigateHome={handleBackToHome}
      />
    );
  }

  // 2. IF HOSPITAL IS LOGGED IN, RENDER THE HOSPITAL DASHBOARD (DOCTOR MANAGEMENT & VISITS)
  if (isLoggedIn && userRole === 'hospital') {
    return (
      <HospitalDashboard 
        onLogout={handleLogout}
        onNavigateHome={handleBackToHome}
      />
    );
  }

  // 3. IF MARKETING TEAM IS LOGGED IN, RENDER THE MARKETING TEAM DASHBOARD
  if (isLoggedIn && userRole === 'marketing') {
    return (
      <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <MarketingDashboard 
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
        />
      </div>
    );
  }

  // 4. IF DOCTOR IS LOGGED IN, RENDER THE DEDICATED DOCTOR DASHBOARD REPLICATING THE IMAGE
  if (isLoggedIn && userRole === 'doctor') {
    return (
      <div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <DoctorDashboard 
          onLogout={handleLogout}
          onNavigateHome={handleBackToHome}
        />
      </div>
    );
  }

  if (isLoggedIn && (userRole === 'volunteer' || userRole === 'social_organizer')) {
    return (
      <CommunityRoleDashboard
        onLogout={handleLogout}
        onNavigateHome={handleBackToHome}
      />
    );
  }

  // 3. IF PATIENT IS LOGGED IN, RENDER PATIENT DASHBOARD
  if (isLoggedIn && userRole === 'patient') {
    return (
      <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <PatientDashboard 
          onLogout={handleLogout}
          onOpenModal={handleOpenModal}
          onNavigateHome={handleBackToHome}
          activeTab={patientActiveTab}
          onTabChange={(tab) => setPatientActiveTab(tab)}
          pendingHospitalId={pendingAfterRegister?.type === 'hospital_visit' ? pendingAfterRegister.hospitalId : undefined}
          pendingDoctorId={pendingAfterRegister?.type === 'hospital_visit' ? pendingAfterRegister.doctorId : undefined}
          onPendingVisitConsumed={() => setPendingAfterRegister(null)}
          onRequireRegister={(hospitalId, doctorId) => {
            setPendingAfterRegister({ type: 'hospital_visit', hospitalId, doctorId });
            handleOpenModal('register_patient');
          }}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 3. If in Lab Tests Booking View (for guest / non-logged in visitor)
  if (isLabTestsView) {
    return (
      <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <LabTestsPage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onSignInClick={handleShowLogin}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onNavigateDashboard={() => {
            setIsLabTestsView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          isDashboardContext={false}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 4. If in Ambulance Booking View (for guest / non-logged in visitor)
  if (isAmbulanceView) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <AmbulanceBookingPage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onSignInClick={handleShowLogin}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onNavigateDashboard={() => {
            setIsAmbulanceView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          isDashboardContext={false}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 5. If in Book Doctor Appointment View (for guest / non-logged in visitor)
  if (isBookAppointmentView) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <BookAppointmentPage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onSignInClick={handleShowLogin}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onNavigateDashboard={() => {
            setIsBookAppointmentView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 6. If in Home Service View (for guest / non-logged in visitor)
  if (isHomeServiceView) {
    return (
      <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <HomeServicePage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onSignInClick={handleShowLogin}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onNavigateDashboard={() => {
            setIsHomeServiceView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
          isDashboardContext={false}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  if (isHospitalGuidanceView) {
    return renderPublicShell(
      <HospitalGuidancePage
        onBackToHome={handleBackToHome}
        onOpenModal={handleOpenModal}
        userProfile={userProfile}
      />
    );
  }

  if (isEmergencyView) {
    return renderPublicShell(
      <EmergencySupportPage
        onBackToHome={handleBackToHome}
        onOpenModal={handleOpenModal}
        userProfile={userProfile}
      />
    );
  }

  if (isHealthCampsView) {
    return renderPublicShell(
      <HealthCampsPage
        onBackToHome={handleBackToHome}
        onOpenModal={handleOpenModal}
        onSelectCamp={(title) => setSelectedCampTitle(title)}
      />
    );
  }

  if (isPartnerHospitalsView) {
    return renderPublicShell(
      <PartnerHospitalsPage
        onBackToHome={handleBackToHome}
        onOpenModal={handleOpenModal}
        onRequestVisit={handleRequestHospitalVisit}
      />
    );
  }

  // 7. If in Partner with Us / Become a Member View
  if (isPartnerView) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
        <PartnerWithUsPage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onSignInClick={handleShowLogin}
          isLoggedIn={isLoggedIn}
          userProfile={userProfile}
          onNavigateDashboard={() => {
            setIsPartnerView(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onLogout={handleLogout}
        />

        {/* Interactive Action Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 8. If in Login view, show the full dedicated Login page
  if (isLoginView) {
    return (
      <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-center selection:bg-emerald-500 selection:text-white">
        <LoginPage 
          onBackToHome={handleBackToHome}
          onOpenModal={handleOpenModal}
          onLoginSuccess={handleLoginSuccess}
          onRegisterClick={() => {
            setIsLoginView(false);
            handleOpenModal('register_patient');
          }}
        />

        {/* Interactive Modals */}
        <Modals 
          activeModal={activeModal} 
          onClose={handleCloseModal}
          selectedCampTitle={selectedCampTitle}
          onCompleteRegistration={handleCompleteRegistration}
          onNavigateToOP={handleNavigateToOP}
          onNavigateToDashboard={handleNavigateToDashboardFromModal}
        />
      </div>
    );
  }

  // 9. Main Landing Homepage
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      
      {/* 1. Top Bar */}
      <TopBar 
        onOpenModal={handleOpenModal} 
        onSignInClick={handleShowLogin}
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onLogout={handleLogout}
        onNavigateDashboard={() => {
          setIsLoginView(false);
          setIsPartnerView(false);
          setIsBookAppointmentView(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* 2. Navigation Header */}
      <Navbar 
        onOpenModal={handleOpenModal} 
        activeTab={activeTab} 
        setActiveTab={handleSetActiveTab} 
        onSignInClick={handleShowLogin}
        onPartnerClick={handleShowPartner}
        onAmbulanceClick={handleShowAmbulance}
        onLabsClick={handleShowLabTests}
      />

      {/* Main Page Layout */}
      <main className="flex-1">
        
        {/* 3. Hero Section */}
        <HeroSection 
          onOpenModal={handleOpenModal} 
          onBecomeMemberClick={handleShowPartner}
        />

        {/* 4. Find & Book Healthcare Services Search Bar */}
        <SearchSection 
          onSearchSubmit={handleSearchSubmit} 
          onOpenModal={handleOpenModal} 
        />

        {/* 5. Quick Services Icons Grid & Call Centre Support */}
        <ServicesGrid onOpenModal={handleOpenModal} />

        {/* 6. Key Stats Navy Counter Banner */}
        <StatsBanner />

        {/* 7. Multi-Widget Section (Health Camps, Network, Community Partners, Patient Portal, Partner Hospitals) */}
        <WidgetsSection 
          onOpenModal={handleOpenModal} 
          onSelectCamp={(title) => setSelectedCampTitle(title)}
          onSignInClick={handleShowLogin}
          onBecomePartnerClick={handleShowPartner}
        />

        {/* 8. Insurance Partners Row */}
        <InsurancePartners />

      </main>

      {/* 9. Footer */}
      <Footer 
        onOpenModal={handleOpenModal} 
        setActiveTab={handleSetActiveTab} 
        onSignInClick={handleShowLogin}
      />

      {/* 10. Interactive Action Modals */}
      <Modals 
        activeModal={activeModal} 
        onClose={handleCloseModal}
        selectedCampTitle={selectedCampTitle}
        onCompleteRegistration={handleCompleteRegistration}
        onNavigateToOP={handleNavigateToOP}
        onNavigateToDashboard={handleNavigateToDashboardFromModal}
      />

    </div>
  );
}
