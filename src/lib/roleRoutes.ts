import type { UserRole } from '../context/AuthContext';

export const ROLE_HOME: Record<string, string> = {
  patient: '/patient/dashboard',
  doctor: '/doctor/dashboard',
  hospital: '/hospital/dashboard',
  admin: '/admin/dashboard',
  marketing: '/marketing/dashboard',
  volunteer: '/community/dashboard',
  social_organizer: '/community/dashboard',
  ambulance: '/',
  lab: '/',
};

export function roleHome(role?: string | null) {
  if (!role) return '/';
  return ROLE_HOME[role] || '/';
}

export const PATIENT_TAB_PATHS: Record<string, string> = {
  dashboard: '/patient/dashboard',
  profile: '/patient/profile',
  find_hospitals: '/patient/requests',
  appointments: '/patient/appointments',
  my_appointment: '/patient/my-appointment',
  lab_tests: '/patient/lab-tests',
  ambulance_booking: '/patient/ambulance',
  home_service: '/patient/home-care',
  records: '/patient/health-records',
  membership: '/patient/membership',
  reports: '/patient/reports',
  prescriptions: '/patient/prescriptions',
  follow_ups: '/patient/follow-ups',
  reminders: '/patient/reminders',
  wallet: '/patient/wallet',
  insurance: '/patient/insurance',
  emergency: '/patient/emergency',
  tickets: '/patient/tickets',
  feedback: '/patient/feedback',
  downloads: '/patient/downloads',
  settings: '/patient/settings',
};

export const PATIENT_PATH_TABS: Record<string, string> = Object.entries(PATIENT_TAB_PATHS).reduce(
  (acc, [tab, path]) => ({ ...acc, [path]: tab }),
  {} as Record<string, string>
);

export const DOCTOR_NAV_PATHS: Record<string, string> = {
  Dashboard: '/doctor/dashboard',
  Appointments: '/doctor/appointments',
  Patients: '/doctor/patients',
  Profile: '/doctor/profile',
};

export const HOSPITAL_NAV_PATHS: Record<string, string> = {
  Dashboard: '/hospital/dashboard',
  Appointments: '/hospital/requests',
  'Doctors Management': '/hospital/doctors',
  Beds: '/hospital/beds',
  Profile: '/hospital/profile',
};

export const ADMIN_NAV_PATHS: Record<string, string> = {
  Dashboard: '/admin/dashboard',
  'Users Management': '/admin/users',
  'Doctor Verifications': '/admin/verify/doctors',
  'Hospital Verifications': '/admin/verify/hospitals',
};

export function patientTabFromPath(pathname: string) {
  if (pathname.startsWith('/patient/appointments/')) return 'appointments';
  return PATIENT_PATH_TABS[pathname] || 'dashboard';
}

export function isStaffRole(role?: UserRole | string | null) {
  return Boolean(role && role !== 'patient');
}
