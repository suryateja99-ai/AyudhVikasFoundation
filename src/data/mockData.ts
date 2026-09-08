import { Doctor, HealthCamp, HospitalPartner, ServiceItem, SymptomItem, HospitalVisitRequest } from '../types';

export const DISTRICTS = [
  'Hanamkonda',
  'Warangal',
  'Mulugu',
  'Bhupalpally',
  'Mahabubabad',
  'Jangaon'
];

export const DISTRICT_COORDINATES: Record<string, { lat: number; lng: number }> = {
  Hanamkonda: { lat: 18.0072, lng: 79.5582 },
  Warangal: { lat: 17.9689, lng: 79.5941 },
  Mulugu: { lat: 18.1910, lng: 80.0006 },
  Bhupalpally: { lat: 18.4312, lng: 79.8628 },
  Mahabubabad: { lat: 17.5973, lng: 80.0021 },
  Jangaon: { lat: 17.7260, lng: 79.1520 }
};

export const getDistrictCoordinates = (district?: string) => {
  if (!district) return DISTRICT_COORDINATES.Warangal;
  const match = Object.keys(DISTRICT_COORDINATES).find(
    (name) => name.toLowerCase() === district.toLowerCase()
  );
  return match ? DISTRICT_COORDINATES[match] : DISTRICT_COORDINATES.Warangal;
};

export const haversineKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

export const LOCATIONS_BY_DISTRICT: Record<string, string[]> = {
  Hanamkonda: ['Hunter Road', 'Subedari', 'Kazipet', 'Waddepally', 'Naimnagar', 'Lashkar Bazaar'],
  Warangal: ['Kasamjanatha Sale', 'MGM Hospital Road', 'Kashibugga', 'Girmajipet', 'Deshaipet'],
  Mulugu: ['Mulugu Town', 'Eturnagaram', 'Tadvai', 'Pasra'],
  Bhupalpally: ['Bhupalpally Main', 'Ghanpur', 'Kataram'],
  Mahabubabad: ['Mahabubabad Town', 'Thorr', 'Dornakal', 'Maripeda'],
  Jangaon: ['Jangaon Town', 'Station Ghanpur', 'Palakurthi']
};

export const SPECIALITIES = [
  'Cardiologist',
  'Neurologist',
  'Orthopedic',
  'Pediatrician',
  'Gynecologist',
  'Diagnostic Tests',
  'Ambulance',
  'Eye Specialist',
  'Dermatologist',
  'General Medicine',
  'Oncology',
  'Urology'
];

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: 'doctor-appt',
    title: 'DOCTOR APPOINTMENT',
    subtitle: 'Book with Specialist Doctors',
    iconName: 'UserCheck',
    color: 'bg-blue-600'
  },
  {
    id: 'hospital-guide',
    title: 'HOSPITAL GUIDANCE',
    subtitle: 'Find the Right Hospital',
    iconName: 'Building2',
    color: 'bg-emerald-600'
  },
  {
    id: 'emergency-supp',
    title: 'EMERGENCY SUPPORT',
    subtitle: '24x7 Emergency Assistance',
    iconName: 'PhoneCall',
    color: 'bg-red-600'
  },
  {
    id: 'lab-booking',
    title: 'LAB TEST BOOKING',
    subtitle: 'Book Lab Tests & Packages',
    iconName: 'TestTube',
    color: 'bg-indigo-600'
  },
  {
    id: 'ambulance',
    title: 'AMBULANCE SERVICE',
    subtitle: 'Quick Ambulance Support',
    iconName: 'Ambulance',
    color: 'bg-amber-600'
  },
  {
    id: 'home-care',
    title: 'HOME CARE SERVICE',
    subtitle: 'Elderly & Patient Home Care',
    iconName: 'HeartHandshake',
    color: 'bg-teal-600'
  },
  {
    id: 'health-camps',
    title: 'HEALTH CAMPS & AWARENESS',
    subtitle: 'Camps, Checkups & Awareness Programs',
    iconName: 'Tent',
    color: 'bg-cyan-600'
  },
  {
    id: 'membership',
    title: 'MEMBERSHIP PROGRAM',
    subtitle: 'Exclusive Benefits for Members',
    iconName: 'CreditCard',
    color: 'bg-purple-600'
  }
];

export const UPCOMING_CAMPS: HealthCamp[] = [
  {
    id: 'camp-1',
    title: 'Free Health Checkup Camp',
    location: 'Warangal Rural',
    district: 'Warangal',
    date: '12 Sep 2026',
    time: '9:00 AM - 1:00 PM',
    status: 'Upcoming',
    servicesOffered: ['BP Check', 'Diabetes Screening', 'General Physician'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Community Grounds, Warangal Rural',
    category: 'General Medicine',
    leadDoctor: 'Dr. S. K. Reddy (General Physician)',
    doctorsInvolved: 12,
    description: 'Full vitals check, BP monitoring, ECG screening, paediatric care, and free distribution of essential medications.',
    lat: 17.9780,
    lng: 79.6100
  },
  {
    id: 'camp-2',
    title: 'Diabetes Awareness Camp',
    location: 'Hanamkonda',
    district: 'Hanamkonda',
    date: '18 Sep 2026',
    time: '9:00 AM - 1:00 PM',
    status: 'Upcoming',
    servicesOffered: ['HbA1c Test', 'Dietary Counseling', 'Eye Screening'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Community Hall, Nakkalagutta, Hanamkonda',
    category: 'Diabetes & Metabolism',
    leadDoctor: 'Dr. Ravi Teja (Chief Endocrinologist)',
    doctorsInvolved: 8,
    description: 'Blood glucose fasting screening, HbA1c tests, diabetic foot examination, and dietary counselling.',
    lat: 18.0105,
    lng: 79.5610
  },
  {
    id: 'camp-3',
    title: 'Women Health Camp',
    location: 'Mulugu',
    district: 'Mulugu',
    date: '22 Sep 2026',
    time: '10:00 AM - 2:00 PM',
    status: 'Upcoming',
    servicesOffered: ['Gynecological Checkup', 'Anemia Screening', 'Calcium Guidance'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Govt High School Grounds, Mulugu',
    category: 'Gynecology & Maternal Care',
    leadDoctor: 'Dr. Swapna Priya (Senior Gynaecologist)',
    doctorsInvolved: 10,
    description: 'Maternal health education, anaemia screening, pap smears, and nutritional supplements distribution.',
    lat: 18.1935,
    lng: 80.0040
  },
  {
    id: 'camp-4',
    title: 'Eye Checkup Camp',
    location: 'Bhupalpally',
    district: 'Bhupalpally',
    date: '28 Sep 2026',
    time: '9:00 AM - 2:00 PM',
    status: 'Upcoming',
    servicesOffered: ['Vision Test', 'Cataract Screening'],
    organizedBy: 'Sri Sri Holistic Hospitals',
    venue: 'Zilla Parishad High School, Bhupalpally',
    category: 'Ophthalmology',
    leadDoctor: 'Dr. Rajesh Kumar (Ophthalmic Surgeon)',
    doctorsInvolved: 6,
    description: 'Refraction testing, cataract early detection, glaucoma check, and free reading spectacles.',
    lat: 18.4330,
    lng: 79.8650
  },
  {
    id: 'camp-5',
    title: 'Free Cardiology Camp',
    location: 'Warangal',
    district: 'Warangal',
    date: '04 Oct 2026',
    time: '9:00 AM - 1:00 PM',
    status: 'Upcoming',
    servicesOffered: ['ECG', 'BP Check', 'Cardiology Consult'],
    organizedBy: 'MGM Hospital, Warangal',
    venue: 'MGM Hospital Outdoor Auditorium, Warangal',
    category: 'Cardiology',
    leadDoctor: 'Dr. A. Srinivas (Consultant Cardiologist)',
    doctorsInvolved: 14,
    description: '12-lead ECG, 2D echocardiography triage, hypertension screening, and specialist consultation.',
    lat: 17.9705,
    lng: 79.5988
  },
  {
    id: 'camp-6',
    title: 'Paediatric Nutrition Camp',
    location: 'Mahabubabad',
    district: 'Mahabubabad',
    date: '10 Oct 2026',
    time: '9:30 AM - 1:30 PM',
    status: 'Upcoming',
    servicesOffered: ['Growth Check', 'Immunization Guidance', 'Nutrition Counseling'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Town Municipal Hall, Mahabubabad',
    category: 'Paediatrics',
    leadDoctor: 'Dr. Shruthi Menon (Pediatrician)',
    doctorsInvolved: 7,
    description: 'Child growth assessment, anaemia screening, deworming, and nutrition counselling for rural families.',
    lat: 17.5990,
    lng: 80.0055
  },
  {
    id: 'camp-7',
    title: "Women's Health Awareness Camp",
    location: 'Jangaon',
    district: 'Jangaon',
    date: '16 Oct 2026',
    time: '10:00 AM - 2:00 PM',
    status: 'Upcoming',
    servicesOffered: ['Gynecological Checkup', 'Anemia Screening', 'Calcium Guidance'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Town Municipal Hall, Jangaon Main Road',
    category: 'Gynecology & Maternal Care',
    leadDoctor: 'Dr. Anusha Reddy (Gynaecologist)',
    doctorsInvolved: 9,
    description: 'Maternal health education, anaemia screening and nutritional supplements distribution.',
    lat: 17.7282,
    lng: 79.1544
  }
];

export const COMPLETED_CAMPS: HealthCamp[] = [
  {
    id: 'HC-CMP-01',
    title: 'Orthopedic Camp',
    location: 'Mulugu',
    district: 'Mulugu',
    date: '20 Aug 2026',
    time: '9:00 AM - 3:00 PM',
    status: 'Completed',
    servicesOffered: ['Joint Pain Therapy', 'BMD Check', 'Calcium Supplements'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Mulugu Primary Health Centre Grounds',
    category: 'Orthopedics & Joint Care',
    leadDoctor: 'Dr. K. V. Sharma (Orthopedic Specialist)',
    doctorsInvolved: 52,
    beneficiaries: 652,
    description: 'Joint pain therapy, bone mineral density checks, posture correction, and free calcium supplements for rural residents.',
    image: '/src/assets/images/camp_completed_orthopedic.jpg',
    lat: 18.1910,
    lng: 80.0006
  },
  {
    id: 'HC-CMP-02',
    title: 'Dental Checkup Camp',
    location: 'Warangal',
    district: 'Warangal',
    date: '16 Aug 2026',
    time: '9:30 AM - 2:00 PM',
    status: 'Completed',
    servicesOffered: ['Cavity Screening', 'Scaling', 'Dental Care Kits'],
    organizedBy: 'Kakatiya Dental College & Foundation',
    venue: 'Shambunipet Community Centre, Warangal',
    category: 'Dental & Oral Health',
    leadDoctor: 'Dr. Meenakshi (Dental Surgeon)',
    doctorsInvolved: 10,
    beneficiaries: 498,
    description: 'Dental cavity screening, scaling, oral hygiene education, and free dental care kits.',
    image: '/src/assets/images/camp_completed_dental.jpg',
    lat: 17.9689,
    lng: 79.5941
  },
  {
    id: 'HC-CMP-03',
    title: 'Thyroid Screening Camp',
    location: 'Hanamkonda',
    district: 'Hanamkonda',
    date: '12 Aug 2026',
    time: '8:30 AM - 1:30 PM',
    status: 'Completed',
    servicesOffered: ['TSH Test', 'Thyroid Palpation', 'Dietary Guidance'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Subedari Mandal Parishad Office, Hanamkonda',
    category: 'Endocrinology',
    leadDoctor: 'Dr. Harish Rao (Endocrinologist)',
    doctorsInvolved: 9,
    beneficiaries: 580,
    description: 'TSH blood sampling, thyroid nodule palpation, dietary guidance, and prescription management.',
    image: '/src/assets/images/camp_completed_thyroid.jpg',
    lat: 18.0072,
    lng: 79.5582
  },
  {
    id: 'HC-CMP-04',
    title: 'General Health Camp',
    location: 'Bhupalpally',
    district: 'Bhupalpally',
    date: '08 Aug 2026',
    time: '9:00 AM - 4:00 PM',
    status: 'Completed',
    servicesOffered: ['Multi-specialty Triage', 'Basic Diagnostics', 'Family Screening'],
    organizedBy: 'Singareni Collieries & Ayudh Vikas',
    venue: 'Singareni Workers Welfare Club, Bhupalpally',
    category: 'General Medicine & Paediatrics',
    leadDoctor: 'Dr. V. Prasad (Chief Medical Officer)',
    doctorsInvolved: 11,
    beneficiaries: 723,
    description: 'Mass health screening for coal miners and local families with multi-specialty triage and basic diagnostic tests.',
    image: '/src/assets/images/camp_completed_general.jpg',
    lat: 18.4312,
    lng: 79.8628
  },
  {
    id: 'HC-CMP-05',
    title: 'Diabetes Awareness Camp',
    location: 'Jangaon',
    district: 'Jangaon',
    date: '02 Aug 2026',
    time: '9:00 AM - 2:00 PM',
    status: 'Completed',
    servicesOffered: ['Blood Sugar Test', 'Lifestyle Assessment', 'Diet Charts'],
    organizedBy: 'Ayudh Vikas Foundation',
    venue: 'Zilla Parishad Meeting Hall, Jangaon',
    category: 'Diabetes & Nutrition',
    leadDoctor: 'Dr. K. Anjaneyulu (Physician)',
    doctorsInvolved: 10,
    beneficiaries: 685,
    description: 'Random blood sugar tests, dietary charts, lifestyle risk assessment, and free metformin for senior citizens.',
    image: '/src/assets/images/camp_completed_diabetes.jpg',
    lat: 17.7260,
    lng: 79.1520
  }
];

export const HOSPITAL_TESTIMONIALS = [
  {
    id: 'rev-1',
    name: 'Lakshmi Devi',
    location: 'Hanamkonda',
    hospital: 'KIMS Hospitals',
    rating: 5,
    quote: 'Ayudh Vikas coordinated my mother\'s cardiology visit at KIMS. Cashless admission and a senior doctor within one hour. Truly care beyond boundaries.',
    date: '12 Aug 2026'
  },
  {
    id: 'rev-2',
    name: 'Srinivas Rao',
    location: 'Warangal Rural',
    hospital: 'Apollo Hospitals',
    rating: 5,
    quote: 'From the village we did not know which hospital to choose. The foundation guided us to Apollo for our child\'s fever and followed up till discharge.',
    date: '28 Jul 2026'
  },
  {
    id: 'rev-3',
    name: 'Fatima Begum',
    location: 'Kazipet',
    hospital: 'Yashoda Hospitals',
    rating: 5,
    quote: 'Women\'s health camp referral to Yashoda was handled with respect and privacy. The Ayudh helpdesk at the hospital made billing simple.',
    date: '04 Aug 2026'
  },
  {
    id: 'rev-4',
    name: 'Raju Goud',
    location: 'Mulugu',
    hospital: 'CARE Hospitals',
    rating: 4,
    quote: 'Stroke symptoms at night — Ayudh emergency desk sent us to CARE. ICU bed was reserved before we reached. Grateful to the network.',
    date: '19 Jul 2026'
  },
  {
    id: 'rev-5',
    name: 'Anitha Reddy',
    location: 'Jangaon',
    hospital: 'Sunshine Hospitals',
    rating: 5,
    quote: 'Knee replacement through Ayudh membership at Sunshine saved us both time and money. Physiotherapy follow-up was arranged at home.',
    date: '02 Sep 2026'
  }
];

export const HOSPITAL_PHOTOS: Record<string, string> = {
  'hosp-1': '/src/assets/images/modern_hospital_facade_1787227836867.jpg',
  'hosp-2': '/src/assets/images/doctor_hero_bg_1787230335675.jpg',
  'hosp-3': '/src/assets/images/partner_hero_team_1787229787269.jpg',
  'hosp-4': '/src/assets/images/partner_doctor_kims_1787229821989.jpg',
  'hosp-5': '/src/assets/images/partner_ceo_care_1787229842597.jpg',
  'hosp-6': '/src/assets/images/lab_tests_banner_1787233112561.jpg'
};

export const PARTNER_HOSPITALS: HospitalPartner[] = [
  {
    id: 'hosp-1',
    name: 'KIMS Hospitals (Krishna Institute of Medical Sciences)',
    shortName: 'KIMS Hospitals',
    district: 'Hanamkonda',
    location: 'Hunter Road',
    address: 'Survey No. 423, Hunter Road, Hanamkonda, Warangal - 506001',
    distanceKm: 0.8,
    phone: '+91 870 245 9999',
    emergencyPhone: '+91 870 245 9911',
    rating: 4.9,
    totalReviews: 1420,
    totalBeds: 350,
    availableBeds: 48,
    icuBeds: 12,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Cardiology', 'Neurology', 'Orthopedics', 'General Medicine', 'Critical Care', 'Gastroenterology'],
    facilities: ['Advanced 24x7 Cath Lab', '50-Bed ICU & CCU', 'Emergency Trauma Unit', 'Ayudh Foundation Cashless Desk', 'Digital MRI & CT'],
    logoText: 'KIMS',
    logoBg: 'bg-red-700',
    seniorDoctors: [
      {
        id: 'doc-kims-1',
        name: 'Dr. V. Rajeshwar Rao',
        designation: 'Chief Senior Interventional Cardiologist & HOD',
        speciality: 'Cardiologist',
        qualification: 'MBBS, MD (Gen Med), DM (Cardiology), FSCAI',
        experienceYears: 22,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 09:30 AM - 02:30 PM',
        roomNumber: 'OPD Suite 102',
        consultationFee: 700,
        status: 'Active'
      },
      {
        id: 'doc-kims-2',
        name: 'Dr. P. Suresh Reddy',
        designation: 'Senior Consultant Neurologist & Stroke Specialist',
        speciality: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        experienceYears: 18,
        rating: 4.8,
        opdTimings: 'Mon - Fri: 10:00 AM - 03:00 PM',
        roomNumber: 'OPD Suite 108',
        consultationFee: 650,
        status: 'Active'
      },
      {
        id: 'doc-kims-3',
        name: 'Dr. M. Sandhya Rani',
        designation: 'Senior Consultant Gynecologist & High-Risk Pregnancy',
        speciality: 'Gynecologist',
        qualification: 'MBBS, MS (OBG), DGO',
        experienceYears: 16,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 11:00 AM - 04:00 PM',
        roomNumber: 'Women Care OPD 204',
        consultationFee: 600,
        status: 'Active'
      },
      {
        id: 'doc-kims-4',
        name: 'Dr. K. Srinivas Murthy',
        designation: 'Senior General Physician & Diabetologist',
        speciality: 'General Medicine',
        qualification: 'MBBS, MD (Internal Medicine)',
        experienceYears: 20,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM',
        roomNumber: 'OPD Suite 101',
        consultationFee: 500,
        status: 'Active'
      }
    ]
  },
  {
    id: 'hosp-2',
    name: 'Yashoda Hospitals',
    shortName: 'Yashoda Hospitals',
    district: 'Hanamkonda',
    location: 'Subedari',
    address: 'Near District Collectorate, Subedari, Hanamkonda - 506001',
    distanceKm: 1.4,
    phone: '+91 870 244 8888',
    emergencyPhone: '+91 870 244 8800',
    rating: 4.8,
    totalReviews: 1180,
    totalBeds: 280,
    availableBeds: 34,
    icuBeds: 8,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Oncology', 'Organ Transplant', 'Emergency', 'Gynecology', 'Urology', 'General Medicine'],
    facilities: ['Linear Accelerator Radiation Unit', 'Dedicated Cancer OPD', 'Organ Transplant ICU', '24x7 Blood Bank', 'Ayudh Helpdesk'],
    logoText: 'YASHODA',
    logoBg: 'bg-amber-600',
    seniorDoctors: [
      {
        id: 'doc-yash-1',
        name: 'Dr. S. Radhika',
        designation: 'Senior Lead Gynecologist & Laparoscopic Surgeon',
        speciality: 'Gynecologist',
        qualification: 'MBBS, MS (OBG), FMAS',
        experienceYears: 17,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 10:00 AM - 04:00 PM',
        roomNumber: 'Block B, Suite 201',
        consultationFee: 650,
        status: 'Active'
      },
      {
        id: 'doc-yash-2',
        name: 'Dr. G. Venkat Ramana',
        designation: 'Senior Consultant Surgical Oncologist',
        speciality: 'Oncology',
        qualification: 'MBBS, MS, MCh (Surgical Oncology)',
        experienceYears: 21,
        rating: 4.9,
        opdTimings: 'Mon, Wed, Fri: 11:00 AM - 03:00 PM',
        roomNumber: 'Oncology Block Suite 301',
        consultationFee: 800,
        status: 'Active'
      },
      {
        id: 'doc-yash-3',
        name: 'Dr. R. Anand Kumar',
        designation: 'Senior Consultant Urologist & Andrologist',
        speciality: 'Urology',
        qualification: 'MBBS, MS, MCh (Urology)',
        experienceYears: 15,
        rating: 4.8,
        opdTimings: 'Tue, Thu, Sat: 02:00 PM - 06:00 PM',
        roomNumber: 'OPD Suite 105',
        consultationFee: 700,
        status: 'Active'
      }
    ]
  },
  {
    id: 'hosp-3',
    name: 'Apollo Reach Hospitals',
    shortName: 'Apollo Hospitals',
    district: 'Warangal',
    location: 'MGM Hospital Road',
    address: 'Near Head Post Office, MGM Hospital Road, Warangal - 506002',
    distanceKm: 2.3,
    phone: '+91 870 256 1234',
    emergencyPhone: '+91 870 256 1066',
    rating: 4.9,
    totalReviews: 2100,
    totalBeds: 250,
    availableBeds: 29,
    icuBeds: 10,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Cardiology', 'Orthopedics', 'Pediatrics', 'Eye Specialist', 'Dermatologist'],
    facilities: ['Apollo 24x7 Emergency Care', 'Level-3 NICU & PICU', 'Robotic Joint Replacement', 'Ayudh Express Admission Counter'],
    logoText: 'Apollo',
    logoBg: 'bg-blue-700',
    seniorDoctors: [
      {
        id: 'doc-apo-1',
        name: 'Dr. M. Pradeep Kumar',
        designation: 'Senior Consultant Pediatrician & Neonatologist',
        speciality: 'Pediatrician',
        qualification: 'MBBS, MD (Pediatrics), FIAP',
        experienceYears: 16,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 09:00 AM - 01:30 PM, 05:00 PM - 07:30 PM',
        roomNumber: 'Child Care OPD 110',
        consultationFee: 550,
        status: 'Active'
      },
      {
        id: 'doc-apo-2',
        name: 'Dr. T. Harinath Reddy',
        designation: 'Chief Senior Orthopedic & Joint Surgeon',
        speciality: 'Orthopedic',
        qualification: 'MBBS, MS (Ortho), MCh Orth (UK)',
        experienceYears: 24,
        rating: 4.9,
        opdTimings: 'Mon - Fri: 10:30 AM - 03:30 PM',
        roomNumber: 'Ortho OPD Suite 104',
        consultationFee: 750,
        status: 'Active'
      },
      {
        id: 'doc-apo-3',
        name: 'Dr. Swapna Gayatri',
        designation: 'Senior Consultant Dermatologist & Cosmetologist',
        speciality: 'Dermatologist',
        qualification: 'MBBS, MD (DVL)',
        experienceYears: 13,
        rating: 4.8,
        opdTimings: 'Mon - Sat: 11:30 AM - 04:30 PM',
        roomNumber: 'Skin & Laser Suite 208',
        consultationFee: 500,
        status: 'Active'
      }
    ]
  },
  {
    id: 'hosp-4',
    name: 'CARE Hospitals',
    shortName: 'CARE Hospitals',
    district: 'Hanamkonda',
    location: 'Naimnagar',
    address: 'Main Road, Naimnagar, Hanamkonda - 506009',
    distanceKm: 3.1,
    phone: '+91 870 243 5555',
    emergencyPhone: '+91 870 243 5500',
    rating: 4.8,
    totalReviews: 970,
    totalBeds: 200,
    availableBeds: 22,
    icuBeds: 6,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Cardiology', 'Critical Care', 'Gastroenterology', 'Neurology', 'General Medicine'],
    facilities: ['Dedicated Cardiac ICU', 'Advanced Endoscopy Suite', '24x7 Dialysis Unit', 'Ayudh Health Card Cashless Desk'],
    logoText: 'CARE',
    logoBg: 'bg-sky-600',
    seniorDoctors: [
      {
        id: 'doc-care-1',
        name: 'Dr. B. Anuradha',
        designation: 'Senior Consultant Neurologist & Epileptologist',
        speciality: 'Neurologist',
        qualification: 'MBBS, MD, DM (Neurology)',
        experienceYears: 19,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 10:00 AM - 03:00 PM',
        roomNumber: 'Neuro OPD Suite 103',
        consultationFee: 650,
        status: 'Active'
      },
      {
        id: 'doc-care-2',
        name: 'Dr. Prashanth Reddy',
        designation: 'Senior Consultant Interventional Cardiologist',
        speciality: 'Cardiologist',
        qualification: 'MBBS, MD, DM (Cardio)',
        experienceYears: 15,
        rating: 4.8,
        opdTimings: 'Mon - Fri: 09:30 AM - 02:00 PM',
        roomNumber: 'Cardio Suite 101',
        consultationFee: 600,
        status: 'Active'
      }
    ]
  },
  {
    id: 'hosp-5',
    name: 'AIG Hospitals (Asian Institute of Gastroenterology)',
    shortName: 'AIG Hospitals',
    district: 'Hanamkonda',
    location: 'Kazipet Road',
    address: 'Kazipet Main Road, Hanamkonda - 506004',
    distanceKm: 4.2,
    phone: '+91 870 248 1000',
    emergencyPhone: '+91 870 248 1001',
    rating: 4.9,
    totalReviews: 1350,
    totalBeds: 180,
    availableBeds: 30,
    icuBeds: 9,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Gastroenterology', 'Liver Care', 'General Surgery', 'General Medicine'],
    facilities: ['Advanced ERCP & Colonoscopy', 'Liver ICU', 'Minimally Invasive GI Surgery', 'Ayudh Express OPD Token Queue'],
    logoText: 'AIG',
    logoBg: 'bg-blue-900',
    seniorDoctors: [
      {
        id: 'doc-aig-1',
        name: 'Dr. Ch. Nageshwar Rao',
        designation: 'Senior Medical Gastroenterologist & Hepatologist',
        speciality: 'General Medicine',
        qualification: 'MBBS, MD, DM (Gastro)',
        experienceYears: 23,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 10:00 AM - 02:00 PM',
        roomNumber: 'GI Suite 101',
        consultationFee: 700,
        status: 'Active'
      },
      {
        id: 'doc-aig-2',
        name: 'Dr. K. Madhava Reddy',
        designation: 'Senior Surgical Gastroenterologist & Laparoscopic Surgeon',
        speciality: 'General Medicine',
        qualification: 'MBBS, MS, DNB (Surg Gastro)',
        experienceYears: 17,
        rating: 4.8,
        opdTimings: 'Mon, Wed, Fri: 01:00 PM - 05:00 PM',
        roomNumber: 'Surgical OPD 106',
        consultationFee: 650,
        status: 'Active'
      }
    ]
  },
  {
    id: 'hosp-6',
    name: 'Sunshine Bone & Joint Institute',
    shortName: 'Sunshine Hospitals',
    district: 'Warangal',
    location: 'Kashibugga',
    address: 'Near Kashibugga Flyover, Warangal - 506006',
    distanceKm: 5.0,
    phone: '+91 870 252 7777',
    emergencyPhone: '+91 870 252 7700',
    rating: 4.9,
    totalReviews: 890,
    totalBeds: 160,
    availableBeds: 18,
    icuBeds: 5,
    hasAyudhCashless: true,
    isOpen24x7: true,
    specialities: ['Orthopedic', 'Joint Replacement', 'Trauma', 'Urology', 'General Medicine'],
    facilities: ['Navigation-Guided Joint Surgery', 'Trauma & Fracture Unit', 'Rehabilitation & Physiotherapy Wing', 'Ayudh Card Support'],
    logoText: 'SUNSHINE',
    logoBg: 'bg-orange-600',
    seniorDoctors: [
      {
        id: 'doc-sun-1',
        name: 'Dr. K. Srinivas',
        designation: 'Chief Senior Joint Replacement & Spine Surgeon',
        speciality: 'Orthopedic',
        qualification: 'MBBS, MS (Orthopedics), MCh Orth',
        experienceYears: 21,
        rating: 4.9,
        opdTimings: 'Mon - Sat: 02:00 PM - 08:00 PM',
        roomNumber: 'Bone & Joint Clinic 101',
        consultationFee: 700,
        status: 'Active'
      },
      {
        id: 'doc-sun-2',
        name: 'Dr. D. Mohan Rao',
        designation: 'Senior Sports Medicine & Arthroscopy Specialist',
        speciality: 'Orthopedic',
        qualification: 'MBBS, D.Ortho, DNB (Ortho)',
        experienceYears: 14,
        rating: 4.8,
        opdTimings: 'Mon - Fri: 09:30 AM - 01:30 PM',
        roomNumber: 'Ortho Clinic 103',
        consultationFee: 600,
        status: 'Active'
      }
    ]
  }
];

export const SYMPTOMS_LIST: SymptomItem[] = [
  {
    id: 'symp-1',
    name: 'Chest Pain / Heart Palpitations',
    teluguName: 'గుండె నొప్పి / దడ',
    category: 'Heart & Chest',
    iconName: 'HeartPulse',
    speciality: 'Cardiologist',
    description: 'Pain, pressure, squeezing in chest, shortness of breath, left arm pain.',
    urgency: 'Emergency'
  },
  {
    id: 'symp-2',
    name: 'Knee / Joint Pain / Swelling',
    teluguName: 'కీళ్ల నొప్పులు / మోకాళ్ల వాపు',
    category: 'Bones & Joints',
    iconName: 'Activity',
    speciality: 'Orthopedic',
    description: 'Severe knee pain, difficulty walking, joint swelling, arthritis, fracture.',
    urgency: 'Moderate'
  },
  {
    id: 'symp-3',
    name: 'High Fever / Shivering / Cold',
    teluguName: 'తీవ్ర జ్వరం / చలి / దగ్గు',
    category: 'General Health',
    iconName: 'Thermometer',
    speciality: 'General Medicine',
    description: 'Persistent body temperature > 101°F, body aches, viral fever, dengue symptoms.',
    urgency: 'Routine'
  },
  {
    id: 'symp-4',
    name: 'Child Fever / Cough / Vomiting',
    teluguName: 'పిల్లల జ్వరం / వాంతులు / దగ్గు',
    category: 'Child Care',
    iconName: 'Baby',
    speciality: 'Pediatrician',
    description: 'Pediatric infection, crying incessantly, lack of feeding, fever in kids.',
    urgency: 'Moderate'
  },
  {
    id: 'symp-5',
    name: 'Pregnancy Care / Gynecological Pain',
    teluguName: 'గర్భధారణ / స్త్రీల సమస్యలు',
    category: 'Women Health',
    iconName: 'Heart',
    speciality: 'Gynecologist',
    description: 'Pregnancy antenatal checks, irregular periods, lower abdomen pain, bleeding.',
    urgency: 'Moderate'
  },
  {
    id: 'symp-6',
    name: 'Severe Headache / Dizziness / Numbness',
    teluguName: 'తీవ్రమైన తలనొప్పి / మైకం',
    category: 'Brain & Nerves',
    iconName: 'Brain',
    speciality: 'Neurologist',
    description: 'Migraine, sudden weakness on one side, speech difficulty, stroke alert.',
    urgency: 'Urgent'
  },
  {
    id: 'symp-7',
    name: 'Stomach Pain / Acidity / Loose Motion',
    teluguName: 'కడుపు నొప్పి / అసిడిటీ / విరేచనాలు',
    category: 'Digestive / GI',
    iconName: 'Utensils',
    speciality: 'General Medicine',
    description: 'Gastric burning, vomiting, food poisoning, jaundice, severe stomach cramp.',
    urgency: 'Moderate'
  },
  {
    id: 'symp-8',
    name: 'Skin Rash / Itching / Fungal Infection',
    teluguName: 'చర్మంపై దద్దుర్లు / దురద',
    category: 'Skin & Allergy',
    iconName: 'Sparkles',
    speciality: 'Dermatologist',
    description: 'Red spots, eczema, severe itching, allergic reaction, hair fall.',
    urgency: 'Routine'
  },
  {
    id: 'symp-9',
    name: 'Eye Irritation / Blurry Vision / Redness',
    teluguName: 'కంటి మసక / ఎరుపు / నొప్పి',
    category: 'Eye Care',
    iconName: 'Eye',
    speciality: 'Eye Specialist',
    description: 'Sudden loss of vision, eye infection, foreign body in eye, cataract check.',
    urgency: 'Routine'
  },
  {
    id: 'symp-10',
    name: 'Urinary Burning / Kidney Stone Pain',
    teluguName: 'మూత్రంలో మంట / మూత్రపిండాల నొప్పి',
    category: 'Kidney & Urinary',
    iconName: 'ShieldAlert',
    speciality: 'Urology',
    description: 'Pain in flanks/back, burning sensation while urinating, bloody urine.',
    urgency: 'Urgent'
  },
  {
    id: 'symp-11',
    name: 'Unexplained Weight Loss / Lump',
    teluguName: 'శరీరంలో గడ్డలు / బరువు తగ్గడం',
    category: 'Cancer / Oncology',
    iconName: 'Shield',
    speciality: 'Oncology',
    description: 'Painless lump in breast or body, chronic fatigue, non-healing ulcer.',
    urgency: 'Moderate'
  }
];

export const INITIAL_HOSPITAL_VISIT_REQUESTS: HospitalVisitRequest[] = [
  {
    id: 'HVR-101',
    requestId: 'AV-VISIT-2026-9042',
    patientId: 'AVP100245',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientAge: 42,
    patientGender: 'Male',
    bloodGroup: 'B+ve',
    hospitalId: 'hosp-1',
    hospitalName: 'KIMS Hospitals (Krishna Institute of Medical Sciences)',
    hospitalDistrict: 'Hanamkonda',
    department: 'Cardiology',
    doctorName: 'Dr. V. Rajeshwar Rao',
    doctorId: 'doc-kims-1',
    symptoms: ['Chest Pain / Heart Palpitations', 'Breathlessness on exertion'],
    chiefComplaint: 'Mild chest heaviness after brisk walking, needs follow-up ECG & senior cardiologist review',
    preferredDate: '29 May 2026',
    preferredTimeSlot: 'Morning (10:30 AM - 11:30 AM)',
    visitType: 'OP Consultation',
    status: 'Accepted',
    requestedAt: '28 May 2026, 08:30 PM',
    acceptedAt: '28 May 2026, 09:15 PM',
    tokenNumber: 'KIMS-CARD-08',
    reportingRoom: 'OPD Suite 102 (1st Floor, Main Hospital Block)',
    estimatedWaitMins: 15,
    hospitalNotes: 'Visit Request Confirmed by Hospital Reception. Please carry your Ayudh Digital Smart Card for cashless registration at Counter 4.',
    isAyudhMember: true
  },
  {
    id: 'HVR-102',
    requestId: 'AV-VISIT-2026-9088',
    patientId: 'AVP100245',
    patientName: 'Ramesh Kumar',
    patientPhone: '9876543210',
    patientAge: 42,
    patientGender: 'Male',
    bloodGroup: 'B+ve',
    hospitalId: 'hosp-2',
    hospitalName: 'Yashoda Hospitals',
    hospitalDistrict: 'Hanamkonda',
    department: 'General Medicine',
    doctorName: 'Senior Physician on Duty',
    symptoms: ['High Fever / Shivering / Cold'],
    chiefComplaint: 'Viral fever with body ache for 2 days, requesting OPD doctor checkup',
    preferredDate: '30 May 2026',
    preferredTimeSlot: 'Evening (05:00 PM - 06:00 PM)',
    visitType: 'OP Consultation',
    status: 'Pending',
    requestedAt: '28 May 2026, 09:45 PM',
    hospitalNotes: 'Hospital coordination desk is reviewing doctor slot availability. Confirmation SMS & app update will appear within 15 minutes.',
    isAyudhMember: true
  }
];


export const INSURANCE_PARTNERS = [
  { name: 'Star Health Insurance', color: 'border-blue-500 text-blue-700' },
  { name: 'Care Health Insurance', color: 'border-amber-500 text-amber-700' },
  { name: 'Bajaj Allianz', color: 'border-sky-600 text-sky-800' },
  { name: 'HDFC ERGO', color: 'border-red-600 text-red-800' },
  { name: 'ICICI Lombard', color: 'border-orange-600 text-orange-800' },
  { name: 'Niva Bupa', color: 'border-cyan-600 text-cyan-800' },
  { name: 'Reliance General', color: 'border-blue-700 text-blue-900' },
  { name: 'SBI General', color: 'border-blue-800 text-blue-900' },
  { name: 'Tata AIG', color: 'border-indigo-800 text-indigo-950' },
  { name: 'Digit Insurance', color: 'border-yellow-500 text-slate-900' }
];

export const MOCK_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. V. Rajeshwar Rao',
    speciality: 'Cardiologist',
    district: 'Hanamkonda',
    location: 'Hunter Road',
    experienceYears: 18,
    hospital: 'KIMS Hospitals',
    rating: 4.9,
    availability: 'Today (10:00 AM - 04:00 PM)'
  },
  {
    id: 'doc-2',
    name: 'Dr. S. Radhika',
    speciality: 'Gynecologist',
    district: 'Hanamkonda',
    location: 'Subedari',
    experienceYears: 14,
    hospital: 'Yashoda Hospitals',
    rating: 4.8,
    availability: 'Tomorrow (11:00 AM - 05:00 PM)'
  },
  {
    id: 'doc-3',
    name: 'Dr. K. Srinivas',
    speciality: 'Orthopedic',
    district: 'Warangal',
    location: 'MGM Hospital Road',
    experienceYears: 20,
    hospital: 'Sunshine Hospitals',
    rating: 4.9,
    availability: 'Today (02:00 PM - 08:00 PM)'
  },
  {
    id: 'doc-4',
    name: 'Dr. M. Pradeep Kumar',
    speciality: 'Pediatrician',
    district: 'Hanamkonda',
    location: 'Kazipet',
    experienceYears: 12,
    hospital: 'Apollo Hospitals',
    rating: 4.7,
    availability: 'Today (09:00 AM - 01:00 PM)'
  },
  {
    id: 'doc-5',
    name: 'Dr. B. Anuradha',
    speciality: 'Neurologist',
    district: 'Hanamkonda',
    location: 'Naimnagar',
    experienceYears: 16,
    hospital: 'CARE Hospitals',
    rating: 4.9,
    availability: 'Tomorrow (10:00 AM - 02:00 PM)'
  }
];
