import React, { useEffect, useState } from 'react';
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { TopBar } from '../components/TopBar';
import { Navbar } from '../components/Navbar';
import { HeroSection } from '../components/HeroSection';
import { SearchSection } from '../components/SearchSection';
import { ServicesGrid } from '../components/ServicesGrid';
import { StatsBanner } from '../components/StatsBanner';
import { WidgetsSection } from '../components/WidgetsSection';
import { InsurancePartners } from '../components/InsurancePartners';
import { AboutUs } from '../components/AboutUs';
import { Footer } from '../components/Footer';
import { Modals } from '../components/Modals';
import { LoginPage } from '../components/LoginPage';
import { PatientDashboard } from '../components/PatientDashboard';
import { DoctorDashboard } from '../components/DoctorDashboard';
import { MarketingDashboard } from '../components/MarketingDashboard';
import { HospitalDashboard } from '../components/HospitalDashboard';
import { LabDashboard } from '../components/LabDashboard';
import { AmbulanceDashboard } from '../components/AmbulanceDashboard';
import { DonationPage } from '../components/DonationPage';
import { DonatePromoter } from '../components/DonatePromoter';
import { RoleDonationShell } from '../components/RoleDonationShell';
import { Fund360Portal } from '../components/Fund360Portal';
import { PartnerWithUsPage } from '../components/PartnerWithUsPage';
import { BookAppointmentPage } from '../components/BookAppointmentPage';
import { AmbulanceBookingPage } from '../components/AmbulanceBookingPage';
import { LabTestsPage } from '../components/LabTestsPage';
import { HomeServicePage } from '../components/HomeServicePage';
import { HospitalGuidancePage } from '../components/HospitalGuidancePage';
import { EmergencySupportPage } from '../components/EmergencySupportPage';
import { HealthCampsPage } from '../components/HealthCampsPage';
import { PartnerHospitalsPage } from '../components/PartnerHospitalsPage';
import { CommunityRoleDashboard } from '../components/CommunityRoleDashboard';
import { AdminDashboard } from '../components/AdminDashboard';
import { VerifyEmailPage } from '../components/VerifyEmailPage';
import { NotFound } from '../components/NotFound';
import { ActiveModal } from '../types';
import { useAuth } from '../context/AuthContext';
import { PrivateRoute } from './PrivateRoute';
import { patientTabFromPath, PATIENT_TAB_PATHS, roleHome } from '../lib/roleRoutes';

const getSavedState = <T,>(key: string, defaultValue: T): T => {
  try {
    const saved = localStorage.getItem(key);
    if (saved !== null) return JSON.parse(saved);
  } catch {
    /* ignore */
  }
  return defaultValue;
};

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

function DashboardRedirect() {
  const { user, isLoggedIn } = useAuth();
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <Navigate to={roleHome(user?.primaryRole || user?.role)} replace />;
}

function PatientArea(props: {
  patientActiveTab: string;
  setPatientActiveTab: (tab: string) => void;
  pendingAfterRegister: { type: 'hospital_visit' | 'tab' | 'fund360'; hospitalId?: string; doctorId?: string; tab?: string } | null;
  onPendingVisitConsumed: () => void;
  onRequireRegister: (hospitalId: string, doctorId?: string) => void;
  onLogout: () => void;
  onOpenModal: (modal: ActiveModal) => void;
  onNavigateHome: () => void;
  modals: React.ReactNode;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = patientTabFromPath(location.pathname) || props.patientActiveTab;
  return (
    <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <PatientDashboard
        onLogout={props.onLogout}
        onOpenModal={props.onOpenModal}
        onNavigateHome={props.onNavigateHome}
        activeTab={tab}
        onTabChange={(next) => {
          props.setPatientActiveTab(next);
          const nextPath = PATIENT_TAB_PATHS[next] || '/patient/dashboard';
          if (nextPath === '/donate') {
            const from = `${location.pathname}${location.search}${location.hash}`;
            try {
              sessionStorage.setItem('ayudh_donate_from', from);
            } catch {
              /* ignore storage restrictions */
            }
            navigate(nextPath, { state: { from } });
            return;
          }
          navigate(nextPath);
        }}
        pendingHospitalId={props.pendingAfterRegister?.type === 'hospital_visit' ? props.pendingAfterRegister.hospitalId : undefined}
        pendingDoctorId={props.pendingAfterRegister?.type === 'hospital_visit' ? props.pendingAfterRegister.doctorId : undefined}
        onPendingVisitConsumed={props.onPendingVisitConsumed}
        onRequireRegister={props.onRequireRegister}
      />
      {props.modals}
    </div>
  );
}

export const AppRoutes: React.FC = () => {
  const { user, isLoggedIn, logout } = useAuth();
  const userRole = user?.primaryRole || user?.role || 'patient';
  const navigate = useNavigate();
  const location = useLocation();
  const [activeModal, setActiveModal] = useState<ActiveModal>(location.pathname === '/register' ? 'register_patient' : null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [patientActiveTab, setPatientActiveTab] = useState<string>(() => getSavedState('ayudh_patientActiveTab', 'dashboard'));
  const [pendingAfterRegister, setPendingAfterRegister] = useState<{
    type: 'hospital_visit' | 'tab' | 'fund360';
    hospitalId?: string;
    doctorId?: string;
    tab?: string;
  } | null>(() => getSavedState('ayudh_pendingAfterRegister', null));
  const [selectedCampTitle, setSelectedCampTitle] = useState<string>('');
  const [searchFilters, setSearchFilters] = useState({
    lookingFor: '',
    speciality: '',
    district: '',
    location: '',
  });

  useEffect(() => {
    localStorage.setItem('ayudh_patientActiveTab', JSON.stringify(patientActiveTab));
  }, [patientActiveTab]);

  useEffect(() => {
    localStorage.setItem('ayudh_pendingAfterRegister', JSON.stringify(pendingAfterRegister));
  }, [pendingAfterRegister]);

  useEffect(() => {
    if (location.pathname === '/register') setActiveModal('register_patient');
  }, [location.pathname]);

  const userProfile = {
    name: user?.name || 'Guest',
    displayName: user?.displayName || user?.name || 'Guest',
    patientId: user?.patientId || user?.id || '',
    phone: user?.phone || '',
    email: user?.email || '',
    image: user?.image || '/src/assets/images/patient_avatar_1787229395408.jpg',
    address: user?.address || '',
  };

  const handleOpenModal = (modal: ActiveModal) => {
    if (isLoggedIn && userRole === 'patient') {
      const tabMap: Record<string, string> = {
        patient_portal: 'dashboard',
        book_lab_test: 'lab_tests',
        ambulance_booking: 'ambulance_booking',
        home_service: 'home_service',
        book_appointment: 'appointments',
        become_member: 'membership',
        emergency_help: 'emergency',
        find_hospitals: 'find_hospitals',
      };
      if (modal && tabMap[modal]) {
        const tab = tabMap[modal];
        setPatientActiveTab(tab);
        navigate(PATIENT_TAB_PATHS[tab] || '/patient/dashboard');
        return;
      }
      if (modal === 'health_camps') {
        setActiveModal('camp_register');
        return;
      }
    }

    if (modal === 'patient_portal') {
      if (!isLoggedIn) navigate('/login');
      else navigate(roleHome(userRole));
      return;
    }
    if (modal === 'become_member' || modal === 'become_partner') {
      navigate('/partner-with-us');
      return;
    }
    if (modal === 'book_appointment') {
      navigate('/book-appointment');
      return;
    }
    if (modal === 'ambulance_booking') {
      navigate('/ambulance-booking');
      return;
    }
    if (modal === 'book_lab_test') {
      navigate('/lab-tests');
      return;
    }
    if (modal === 'home_service') {
      navigate('/home-care');
      return;
    }
    if (modal === 'find_hospitals') {
      navigate('/hospital-guidance');
      return;
    }
    if (modal === 'emergency_help') {
      navigate('/emergency-support');
      return;
    }
    if (modal === 'health_camps') {
      navigate('/health-camps');
      return;
    }
    setActiveModal(modal);
  };

  const handleCloseModal = () => setActiveModal(null);

  const handleShowLogin = () => {
    if (!isLoggedIn) navigate('/login');
    else navigate(roleHome(userRole));
  };

  const handleBackToHome = () => {
    setActiveTab('home');
    navigate('/');
  };
  const handleShowPartner = () => navigate('/partner-with-us');
  const handleShowAmbulance = () => navigate('/ambulance-booking');
  const handleShowLabTests = () => navigate('/lab-tests');
  const handleShowPartnerHospitals = () => {
    setActiveTab('hospitals');
    navigate('/partner-hospitals');
  };
  const handleFund360Entry = () => {
    if (isLoggedIn && !user?.isGuest) {
      navigate('/fund360');
      return;
    }
    setPendingAfterRegister({ type: 'fund360' });
    setActiveModal('register_patient');
  };
  const handleBackFromDonation = () => {
    const state = location.state as { from?: string } | null;
    let storedFrom = '';
    try {
      storedFrom = sessionStorage.getItem('ayudh_donate_from') || '';
      sessionStorage.removeItem('ayudh_donate_from');
    } catch {
      /* ignore storage restrictions */
    }
    const from = state?.from || storedFrom;
    if (from && from !== location.pathname) {
      navigate(from, { replace: true });
      return;
    }
    if ((window.history.state?.idx || 0) > 0) {
      navigate(-1);
      return;
    }
    navigate(isLoggedIn && !user?.isGuest ? roleHome(userRole) : '/');
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
      setActiveTab('camps');
      navigate('/health-camps');
      return;
    }
    setActiveTab(tab);
    navigate('/');
    setTimeout(() => {
      const el = document.getElementById(`section-${tab}`);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 80);
  };

  const handleRequestHospitalVisit = (hospitalId: string, doctorId?: string) => {
    setPendingAfterRegister({ type: 'hospital_visit', hospitalId, doctorId });
    if (isLoggedIn && userRole === 'patient' && !user?.isGuest) {
      setPatientActiveTab('find_hospitals');
      navigate('/patient/requests');
      return;
    }
    handleOpenModal('register_patient');
  };

  const applyPendingAfterRegister = () => {
    if (pendingAfterRegister?.type === 'hospital_visit') {
      setPatientActiveTab('find_hospitals');
      navigate('/patient/requests');
    } else if (pendingAfterRegister?.type === 'fund360') {
      navigate('/fund360/onboarding');
    } else if (pendingAfterRegister?.type === 'tab' && pendingAfterRegister.tab) {
      setPatientActiveTab(pendingAfterRegister.tab);
      navigate(PATIENT_TAB_PATHS[pendingAfterRegister.tab] || '/patient/dashboard');
    } else {
      setPatientActiveTab('dashboard');
      navigate('/patient/dashboard');
    }
  };

  const handleCompleteRegistration = (_newPatient: any) => {
    applyPendingAfterRegister();
    setPendingAfterRegister(null);
    setActiveModal(null);
  };

  const handleNavigateToOP = (_patientId: string) => {
    if (pendingAfterRegister?.type === 'hospital_visit') {
      setPatientActiveTab('find_hospitals');
      navigate('/patient/requests');
    } else {
      setPatientActiveTab('appointments');
      navigate('/patient/appointments');
    }
    setActiveModal(null);
  };

  const handleNavigateToDashboardFromModal = () => {
    applyPendingAfterRegister();
    setPendingAfterRegister(null);
    setActiveModal(null);
  };

  const handleLogout = () => {
    logout();
  };

  const sharedModals = (
    <Modals
      activeModal={activeModal}
      onClose={handleCloseModal}
      selectedCampTitle={selectedCampTitle}
      onCompleteRegistration={handleCompleteRegistration}
      onNavigateToOP={handleNavigateToOP}
      onNavigateToDashboard={handleNavigateToDashboardFromModal}
    />
  );

  const renderPublicShell = (body: React.ReactNode, tab = 'home') => (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <TopBar
        onOpenModal={handleOpenModal}
        onSignInClick={handleShowLogin}
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onLogout={handleLogout}
        onNavigateDashboard={() => navigate(roleHome(userRole))}
      />
      <Navbar
        onOpenModal={handleOpenModal}
        activeTab={tab}
        setActiveTab={handleSetActiveTab}
        onSignInClick={handleShowLogin}
        onPartnerClick={handleShowPartner}
        onAmbulanceClick={handleShowAmbulance}
        onLabsClick={handleShowLabTests}
        onFund360Click={handleFund360Entry}
      />
      <main className="flex-1 route-page">{body}</main>
      <Footer onOpenModal={handleOpenModal} setActiveTab={handleSetActiveTab} onSignInClick={handleShowLogin} />
      {sharedModals}
    </div>
  );

  const HomePage = (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
      <TopBar
        onOpenModal={handleOpenModal}
        onSignInClick={handleShowLogin}
        isLoggedIn={isLoggedIn}
        userProfile={userProfile}
        onLogout={handleLogout}
        onNavigateDashboard={() => navigate(roleHome(userRole))}
      />
      <Navbar
        onOpenModal={handleOpenModal}
        activeTab={activeTab}
        setActiveTab={handleSetActiveTab}
        onSignInClick={handleShowLogin}
        onPartnerClick={handleShowPartner}
        onAmbulanceClick={handleShowAmbulance}
        onLabsClick={handleShowLabTests}
        onFund360Click={handleFund360Entry}
      />
      <main className="flex-1 route-page">
        {activeTab === 'about' ? (
          <AboutUs />
        ) : (
          <>
            <HeroSection onOpenModal={handleOpenModal} onBecomeMemberClick={handleShowPartner} onFund360Click={handleFund360Entry} />
            <SearchSection onSearchSubmit={setSearchFilters} onOpenModal={handleOpenModal} />
            <ServicesGrid onOpenModal={handleOpenModal} />
            <StatsBanner />
            <WidgetsSection
              onOpenModal={handleOpenModal}
              onSelectCamp={(title) => setSelectedCampTitle(title)}
              onSignInClick={handleShowLogin}
              onBecomePartnerClick={handleShowPartner}
            />
            <InsurancePartners />
          </>
        )}
      </main>
      <Footer onOpenModal={handleOpenModal} setActiveTab={handleSetActiveTab} onSignInClick={handleShowLogin} />
      {sharedModals}
    </div>
  );

  const patientAreaProps = {
    patientActiveTab,
    setPatientActiveTab,
    pendingAfterRegister,
    onPendingVisitConsumed: () => setPendingAfterRegister(null),
    onRequireRegister: (hospitalId: string, doctorId?: string) => {
      setPendingAfterRegister({ type: 'hospital_visit', hospitalId, doctorId });
      handleOpenModal('register_patient');
    },
    onLogout: handleLogout,
    onOpenModal: handleOpenModal,
    onNavigateHome: handleBackToHome,
    modals: sharedModals,
  };

  const pageChrome = {
    onBackToHome: handleBackToHome,
    onOpenModal: handleOpenModal,
    onSignInClick: handleShowLogin,
    isLoggedIn,
    userProfile,
    onNavigateDashboard: () => navigate(roleHome(userRole)),
    onLogout: handleLogout,
  };

  const DonationRoute = isLoggedIn && !user?.isGuest && userRole === 'patient' ? (
    <PatientArea {...patientAreaProps} />
  ) : isLoggedIn && !user?.isGuest ? (
    <RoleDonationShell
      role={userRole}
      user={user}
      onLogout={handleLogout}
      onNavigateHome={handleBackToHome}
    >
      <DonationPage onBackToHome={handleBackFromDonation} />
    </RoleDonationShell>
  ) : renderPublicShell(
    <DonationPage onBackToHome={handleBackFromDonation} />
  );

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={HomePage} />
        <Route path="/register" element={HomePage} />
        <Route path="/login" element={
          isLoggedIn && !user?.isGuest ? (
            <Navigate to={roleHome(userRole)} replace />
          ) : (
            <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col justify-center selection:bg-emerald-500 selection:text-white">
              <LoginPage
                onBackToHome={handleBackToHome}
                onOpenModal={handleOpenModal}
                onLoginSuccess={() => undefined}
                onRegisterClick={() => {
                  navigate('/register');
                  setActiveModal('register_patient');
                }}
              />
              {sharedModals}
            </div>
          )
        } />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/donate" element={DonationRoute} />
        <Route path="/search-hospitals" element={<Navigate to="/partner-hospitals" replace />} />
        <Route path="/search-doctors" element={<Navigate to="/book-appointment" replace />} />
        <Route path="/partner-with-us" element={
          <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
            <PartnerWithUsPage {...pageChrome} />
            {sharedModals}
          </div>
        } />
        <Route path="/book-appointment" element={
          <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
            <BookAppointmentPage {...pageChrome} />
            {sharedModals}
          </div>
        } />
        <Route path="/ambulance-booking" element={
          <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
            <AmbulanceBookingPage {...pageChrome} isDashboardContext={false} />
            {sharedModals}
          </div>
        } />
        <Route path="/lab-tests" element={
          <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
            <LabTestsPage {...pageChrome} isDashboardContext={false} />
            {sharedModals}
          </div>
        } />
        <Route path="/home-care" element={
          <div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col selection:bg-emerald-500 selection:text-white">
            <HomeServicePage {...pageChrome} isDashboardContext={false} />
            {sharedModals}
          </div>
        } />
        <Route path="/hospital-guidance" element={renderPublicShell(
          <HospitalGuidancePage onBackToHome={handleBackToHome} onOpenModal={handleOpenModal} userProfile={userProfile} />
        )} />
        <Route path="/emergency-support" element={renderPublicShell(
          <EmergencySupportPage onBackToHome={handleBackToHome} onOpenModal={handleOpenModal} userProfile={userProfile} />
        )} />
        <Route path="/health-camps" element={renderPublicShell(
          <HealthCampsPage onBackToHome={handleBackToHome} onOpenModal={handleOpenModal} onSelectCamp={(title) => setSelectedCampTitle(title)} />,
          'camps'
        )} />
        <Route path="/partner-hospitals" element={renderPublicShell(
          <PartnerHospitalsPage onBackToHome={handleBackToHome} onOpenModal={handleOpenModal} onRequestVisit={handleRequestHospitalVisit} />,
          'hospitals'
        )} />
        <Route path="/dashboard" element={<DashboardRedirect />} />

        <Route element={<PrivateRoute />}>
          <Route path="/fund360" element={<Fund360Portal />} />
          <Route path="/fund360/onboarding" element={<Fund360Portal />} />
          <Route path="/fund360/dashboard" element={<Fund360Portal />} />
          <Route path="/fund360/profile" element={<Fund360Portal />} />
          <Route path="/fund360/finance" element={<Fund360Portal />} />
          <Route path="/fund360/payments" element={<Fund360Portal />} />
          <Route path="/fund360/milestones" element={<Fund360Portal />} />
          <Route path="/fund360/benefits" element={<Fund360Portal />} />
          <Route path="/fund360/history" element={<Fund360Portal />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="patient" />}>
          <Route path="/patient/dashboard" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/appointments" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/appointments/:id" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/my-appointment" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/requests" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/prescriptions" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/health-records" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/membership" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/wallet" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/profile" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/lab-tests" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/ambulance" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/home-care" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/emergency" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/insurance" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/reports" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/follow-ups" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/reminders" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/tickets" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/feedback" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/downloads" element={<PatientArea {...patientAreaProps} />} />
          <Route path="/patient/settings" element={<PatientArea {...patientAreaProps} />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="doctor" />}>
          <Route path="/doctor/dashboard" element={<div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 flex flex-col"><DoctorDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Dashboard" /></div>} />
          <Route path="/doctor/appointments" element={<div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 flex flex-col"><DoctorDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Appointments" /></div>} />
          <Route path="/doctor/patients" element={<div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 flex flex-col"><DoctorDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Patients" /></div>} />
          <Route path="/doctor/profile" element={<div className="min-h-screen bg-[#f4f7fb] font-sans text-slate-800 flex flex-col"><DoctorDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Profile" /></div>} />
        </Route>

        <Route element={<PrivateRoute requiredRole="hospital" />}>
          <Route path="/hospital/dashboard" element={<HospitalDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Dashboard" />} />
          <Route path="/hospital/requests" element={<HospitalDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Appointments" />} />
          <Route path="/hospital/doctors" element={<HospitalDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Doctors Management" />} />
          <Route path="/hospital/beds" element={<HospitalDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Beds" />} />
          <Route path="/hospital/profile" element={<HospitalDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Profile" />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} />} />
          <Route path="/admin/users" element={<AdminDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} />} />
          <Route path="/admin/verify/doctors" element={<AdminDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} />} />
          <Route path="/admin/verify/hospitals" element={<AdminDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="marketing" />}>
          <Route path="/marketing/dashboard" element={<div className="min-h-screen bg-[#f3f5f8] font-sans text-slate-800 flex flex-col"><MarketingDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} /></div>} />
        </Route>

        <Route element={<PrivateRoute requiredRole="lab" />}>
          <Route path="/lab/dashboard" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Dashboard" />} />
          <Route path="/lab/requests" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Requests" />} />
          <Route path="/lab/verification" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Verification" />} />
          <Route path="/lab/reports" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Reports" />} />
          <Route path="/lab/history" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="History" />} />
          <Route path="/lab/profile" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Profile" />} />
          <Route path="/lab/support" element={<LabDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Support" />} />
        </Route>

        <Route element={<PrivateRoute requiredRole="ambulance" />}>
          <Route path="/ambulance/dashboard" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Dashboard" />} />
          <Route path="/ambulance/requests" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Requests" />} />
          <Route path="/ambulance/upcoming" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Upcoming" />} />
          <Route path="/ambulance/accepted" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Accepted" />} />
          <Route path="/ambulance/history" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="History" />} />
          <Route path="/ambulance/profile" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Profile" />} />
          <Route path="/ambulance/support" element={<AmbulanceDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} initialNav="Support" />} />
        </Route>

        <Route element={<PrivateRoute requiredRole={['volunteer', 'social_organizer']} />}>
          <Route path="/community/dashboard" element={<CommunityRoleDashboard onLogout={handleLogout} onNavigateHome={handleBackToHome} />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <DonatePromoter activeModal={activeModal} />
    </>
  );
};
