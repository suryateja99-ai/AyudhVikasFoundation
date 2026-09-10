export interface Doctor {
  id: string;
  name: string;
  speciality: string;
  district: string;
  location: string;
  experienceYears: number;
  hospital: string;
  hospitalId?: string;
  qualification?: string;
  rating: number;
  availability: string;
  image?: string;
  status?: 'Active' | 'On Leave' | 'Emergency Only' | 'In OPD';
  roomNumber?: string;
  consultationFee?: number;
  phone?: string;
  email?: string;
}

export interface SeniorDoctor {
  id: string;
  name: string;
  designation: string;
  speciality: string;
  qualification: string;
  experienceYears: number;
  rating: number;
  opdTimings: string;
  image?: string;
  roomNumber?: string;
  consultationFee?: number;
  status?: 'Active' | 'On Leave' | 'Emergency Only' | 'In OPD';
}

export interface HealthCamp {
  id: string;
  title: string;
  location: string;
  district: string;
  date: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed';
  servicesOffered: string[];
  time?: string;
  organizedBy?: string;
  venue?: string;
  description?: string;
  category?: string;
  leadDoctor?: string;
  doctorsInvolved?: number;
  beneficiaries?: number;
  lat?: number;
  lng?: number;
  image?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: string;
  color: string;
}

export interface HospitalPartner {
  id: string;
  name: string;
  shortName: string;
  district: string;
  location?: string;
  address?: string;
  distanceKm?: number;
  phone?: string;
  emergencyPhone?: string;
  rating?: number;
  totalReviews?: number;
  totalBeds?: number;
  availableBeds?: number;
  icuBeds?: number;
  specialities: string[];
  seniorDoctors?: SeniorDoctor[];
  facilities?: string[];
  logoText: string;
  logoBg: string;
  hasAyudhCashless?: boolean;
  isOpen24x7?: boolean;
  image?: string;
}

export interface HospitalVisitRequest {
  id: string;
  requestId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientAge?: number | string;
  patientGender?: string;
  bloodGroup?: string;
  hospitalId: string;
  hospitalName: string;
  hospitalDistrict: string;
  department: string;
  doctorName?: string;
  doctorId?: string;
  symptoms: string[];
  chiefComplaint?: string;
  preferredDate: string;
  preferredTimeSlot: string;
  visitType: 'OP Consultation' | 'Specialist Review' | 'Emergency' | 'Health Checkup' | 'Second Opinion';
  status: 'Pending' | 'Accepted' | 'Scheduled' | 'CheckedIn' | 'Completed' | 'Rejected' | 'Cancelled';
  assignedDoctorId?: string;
  assignedBedId?: string;
  assignedBedNumber?: string;
  appointmentDateTime?: string;
  rejectionReason?: string;
  responseDeadline?: string;
  confirmationCode?: string;
  qrCode?: string;
  requestedAt: string;
  acceptedAt?: string;
  tokenNumber?: string;
  reportingRoom?: string;
  estimatedWaitMins?: number;
  hospitalNotes?: string;
  isAyudhMember?: boolean;
}

export interface SymptomItem {
  id: string;
  name: string;
  teluguName?: string;
  category: string;
  iconName: string;
  speciality: string;
  description: string;
  urgency: 'Routine' | 'Moderate' | 'Urgent' | 'Emergency';
}

export interface HospitalBed {
  id: string;
  hospitalId: string;
  wardType: 'General' | 'ICU' | 'HDU' | 'Private' | 'OPD' | string;
  bedNumber: string;
  floor?: number;
  roomNumber?: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved' | string;
  assignedPatientId?: string;
  reservedUntil?: string;
  notes?: string;
}

export type ActiveModal = 
  | null 
  | 'register_patient'
  | 'book_appointment'
  | 'find_hospitals'
  | 'become_member'
  | 'emergency_help'
  | 'request_callback'
  | 'camp_register'
  | 'health_camps'
  | 'become_partner'
  | 'patient_portal'
  | 'ambulance_booking'
  | 'book_lab_test'
  | 'home_service';

