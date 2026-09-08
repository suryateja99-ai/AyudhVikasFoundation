const defaultSlots = () => [
  { day: 'Today', date: '29', month: 'Aug', isToday: true, slots: ['10:00 AM', '11:30 AM', '04:00 PM', '06:00 PM'] },
  { day: 'Sat', date: '30', month: 'Aug', slots: ['09:30 AM', '12:00 PM', '03:30 PM'] },
  { day: 'Sun', date: '31', month: 'Aug', slots: ['11:00 AM', '01:00 PM'] },
  { day: 'Mon', date: '01', month: 'Sep', slots: ['10:00 AM', '02:30 PM', '05:00 PM'] },
  { day: 'Tue', date: '02', month: 'Sep', slots: ['09:00 AM', '11:30 AM', '04:30 PM'] },
];

export const HOSPITALS = [
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
      { id: 'doc-kims-1', name: 'Dr. V. Rajeshwar Rao', designation: 'Chief Senior Interventional Cardiologist & HOD', speciality: 'Cardiologist', qualification: 'MBBS, MD (Gen Med), DM (Cardiology), FSCAI', experienceYears: 22, rating: 4.9, opdTimings: 'Mon - Sat: 09:30 AM - 02:30 PM', roomNumber: 'OPD Suite 102', consultationFee: 700, status: 'Active' },
      { id: 'doc-kims-2', name: 'Dr. P. Suresh Reddy', designation: 'Senior Consultant Neurologist & Stroke Specialist', speciality: 'Neurologist', qualification: 'MBBS, MD, DM (Neurology)', experienceYears: 18, rating: 4.8, opdTimings: 'Mon - Fri: 10:00 AM - 03:00 PM', roomNumber: 'OPD Suite 108', consultationFee: 650, status: 'Active' },
      { id: 'doc-kims-3', name: 'Dr. M. Sandhya Rani', designation: 'Senior Consultant Gynecologist & High-Risk Pregnancy', speciality: 'Gynecologist', qualification: 'MBBS, MS (OBG), DGO', experienceYears: 16, rating: 4.9, opdTimings: 'Mon - Sat: 11:00 AM - 04:00 PM', roomNumber: 'Women Care OPD 204', consultationFee: 600, status: 'Active' },
      { id: 'doc-kims-4', name: 'Dr. K. Srinivas Murthy', designation: 'Senior General Physician & Diabetologist', speciality: 'General Medicine', qualification: 'MBBS, MD (Internal Medicine)', experienceYears: 20, rating: 4.9, opdTimings: 'Mon - Sat: 09:00 AM - 01:00 PM, 05:00 PM - 08:00 PM', roomNumber: 'OPD Suite 101', consultationFee: 500, status: 'Active' },
    ],
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
      { id: 'doc-yash-1', name: 'Dr. S. Radhika', designation: 'Senior Lead Gynecologist & Laparoscopic Surgeon', speciality: 'Gynecologist', qualification: 'MBBS, MS (OBG), FMAS', experienceYears: 17, rating: 4.9, opdTimings: 'Mon - Sat: 10:00 AM - 04:00 PM', roomNumber: 'Block B, Suite 201', consultationFee: 650, status: 'Active' },
      { id: 'doc-yash-2', name: 'Dr. G. Venkat Ramana', designation: 'Senior Consultant Surgical Oncologist', speciality: 'Oncology', qualification: 'MBBS, MS, MCh (Surgical Oncology)', experienceYears: 21, rating: 4.9, opdTimings: 'Mon, Wed, Fri: 11:00 AM - 03:00 PM', roomNumber: 'Oncology Block Suite 301', consultationFee: 800, status: 'Active' },
      { id: 'doc-yash-3', name: 'Dr. R. Anand Kumar', designation: 'Senior Consultant Urologist & Andrologist', speciality: 'Urology', qualification: 'MBBS, MS, MCh (Urology)', experienceYears: 15, rating: 4.8, opdTimings: 'Tue, Thu, Sat: 02:00 PM - 06:00 PM', roomNumber: 'OPD Suite 105', consultationFee: 700, status: 'Active' },
    ],
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
      { id: 'doc-apo-1', name: 'Dr. M. Pradeep Kumar', designation: 'Senior Consultant Pediatrician & Neonatologist', speciality: 'Pediatrician', qualification: 'MBBS, MD (Pediatrics), FIAP', experienceYears: 16, rating: 4.9, opdTimings: 'Mon - Sat: 09:00 AM - 01:30 PM, 05:00 PM - 07:30 PM', roomNumber: 'Child Care OPD 110', consultationFee: 550, status: 'Active' },
      { id: 'doc-apo-2', name: 'Dr. T. Harinath Reddy', designation: 'Chief Senior Orthopedic & Joint Surgeon', speciality: 'Orthopedic', qualification: 'MBBS, MS (Ortho), MCh Orth (UK)', experienceYears: 24, rating: 4.9, opdTimings: 'Mon - Fri: 10:30 AM - 03:30 PM', roomNumber: 'Ortho OPD Suite 104', consultationFee: 750, status: 'Active' },
      { id: 'doc-apo-3', name: 'Dr. Swapna Gayatri', designation: 'Senior Consultant Dermatologist & Cosmetologist', speciality: 'Dermatologist', qualification: 'MBBS, MD (DVL)', experienceYears: 13, rating: 4.8, opdTimings: 'Mon - Sat: 11:30 AM - 04:30 PM', roomNumber: 'Skin & Laser Suite 208', consultationFee: 500, status: 'Active' },
    ],
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
      { id: 'doc-care-1', name: 'Dr. B. Anuradha', designation: 'Senior Consultant Neurologist & Epileptologist', speciality: 'Neurologist', qualification: 'MBBS, MD, DM (Neurology)', experienceYears: 19, rating: 4.9, opdTimings: 'Mon - Sat: 10:00 AM - 03:00 PM', roomNumber: 'Neuro OPD Suite 103', consultationFee: 650, status: 'Active' },
      { id: 'doc-care-2', name: 'Dr. Prashanth Reddy', designation: 'Senior Consultant Interventional Cardiologist', speciality: 'Cardiologist', qualification: 'MBBS, MD, DM (Cardio)', experienceYears: 15, rating: 4.8, opdTimings: 'Mon - Fri: 09:30 AM - 02:00 PM', roomNumber: 'Cardio Suite 101', consultationFee: 600, status: 'Active' },
    ],
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
      { id: 'doc-aig-1', name: 'Dr. Ch. Nageshwar Rao', designation: 'Senior Medical Gastroenterologist & Hepatologist', speciality: 'General Medicine', qualification: 'MBBS, MD, DM (Gastro)', experienceYears: 23, rating: 4.9, opdTimings: 'Mon - Sat: 10:00 AM - 02:00 PM', roomNumber: 'GI Suite 101', consultationFee: 700, status: 'Active' },
      { id: 'doc-aig-2', name: 'Dr. K. Madhava Reddy', designation: 'Senior Surgical Gastroenterologist & Laparoscopic Surgeon', speciality: 'General Medicine', qualification: 'MBBS, MS, DNB (Surg Gastro)', experienceYears: 17, rating: 4.8, opdTimings: 'Mon, Wed, Fri: 01:00 PM - 05:00 PM', roomNumber: 'Surgical OPD 106', consultationFee: 650, status: 'Active' },
    ],
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
      { id: 'doc-sun-1', name: 'Dr. K. Srinivas', designation: 'Chief Senior Joint Replacement & Spine Surgeon', speciality: 'Orthopedic', qualification: 'MBBS, MS (Orthopedics), MCh Orth', experienceYears: 21, rating: 4.9, opdTimings: 'Mon - Sat: 02:00 PM - 08:00 PM', roomNumber: 'Bone & Joint Clinic 101', consultationFee: 700, status: 'Active' },
      { id: 'doc-sun-2', name: 'Dr. D. Mohan Rao', designation: 'Senior Sports Medicine & Arthroscopy Specialist', speciality: 'Orthopedic', qualification: 'MBBS, D.Ortho, DNB (Ortho)', experienceYears: 14, rating: 4.8, opdTimings: 'Mon - Fri: 09:30 AM - 01:30 PM', roomNumber: 'Ortho Clinic 103', consultationFee: 600, status: 'Active' },
    ],
  },
];

export const BOOKING_DOCTORS = [
  { id: 'doc-1', name: 'Dr. Ravi Teja', speciality: 'Cardiologist', qualifications: 'MBBS, MD (General Medicine), DM (Cardiology)', hospital: 'MGM Hospital, Warangal', hospitalId: 'hosp-3', district: 'Warangal', rating: 4.8, reviewsCount: 256, experience: '15+ Years Experience', experienceYears: 15, consultationFee: 800, image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg', consultationType: 'both', phone: '9000012345', email: 'dr.raviteja@ayudhvikas.org', status: 'Active', availability: 'Today (10:00 AM - 04:00 PM)', opdTimings: 'Mon - Sat: 09:30 AM - 02:00 PM & 05:00 PM - 08:30 PM', roomNumber: 'Cardio OPD 101' },
  { id: 'doc-2', name: 'Dr. Anusha Reddy', speciality: 'Gynecologist', qualifications: 'MBBS, MS (OBG), DNB (OBG)', hospital: 'KIMS Hospital, Warangal', hospitalId: 'hosp-1', district: 'Warangal', rating: 4.7, reviewsCount: 189, experience: '12+ Years Experience', experienceYears: 12, consultationFee: 700, image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg', consultationType: 'both', status: 'Active', availability: 'Today (10:30 AM - 05:00 PM)', opdTimings: 'Mon - Sat: 10:00 AM - 04:00 PM' },
  { id: 'doc-3', name: 'Dr. Prakash Kumar', speciality: 'Orthopedic Surgeon', qualifications: 'MBBS, MS (Orthopedics)', hospital: 'CARE Hospitals, Warangal', hospitalId: 'hosp-4', district: 'Warangal', rating: 4.6, reviewsCount: 142, experience: '10+ Years Experience', experienceYears: 10, consultationFee: 600, image: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg', consultationType: 'both', status: 'Active', availability: 'Today (11:00 AM - 05:30 PM)' },
  { id: 'doc-4', name: 'Dr. Shruthi Menon', speciality: 'Pediatrician', qualifications: 'MBBS, DCH (Paediatrics)', hospital: "Rainbow Children's Hospital, Warangal", hospitalId: 'hosp-3', district: 'Warangal', rating: 4.9, reviewsCount: 210, experience: '8+ Years Experience', experienceYears: 8, consultationFee: 600, image: '/src/assets/images/doctor_shruthi_menon_1787230394773.jpg', consultationType: 'both', status: 'Active', availability: 'Today (09:30 AM - 05:30 PM)' },
  { id: 'doc-5', name: 'Dr. Sandeep Varma', speciality: 'Neurologist', qualifications: 'MBBS, MD, DM (Neurology)', hospital: 'Yashoda Hospitals, Hanamkonda', hospitalId: 'hosp-2', district: 'Hanamkonda', rating: 4.8, reviewsCount: 175, experience: '14+ Years Experience', experienceYears: 14, consultationFee: 900, image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg', consultationType: 'both', status: 'Active', availability: 'Today (11:30 AM - 04:00 PM)' },
  { id: 'doc-6', name: 'Dr. Radhika Sharma', speciality: 'General Physician', qualifications: 'MBBS, MD (Internal Medicine)', hospital: 'Apollo Hospitals, Warangal', hospitalId: 'hosp-3', district: 'Warangal', rating: 4.9, reviewsCount: 310, experience: '16+ Years Experience', experienceYears: 16, consultationFee: 500, image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg', consultationType: 'both', status: 'Active', availability: 'Today (09:00 AM - 06:00 PM)' },
  { id: 'doc-7', name: 'Dr. Harish Rao', speciality: 'Cardiologist', qualifications: 'MBBS, MD, DM (Interventional Cardiology)', hospital: 'CARE Hospitals, Warangal', hospitalId: 'hosp-4', district: 'Warangal', rating: 4.9, reviewsCount: 290, experience: '18+ Years Experience', experienceYears: 18, consultationFee: 850, image: '/src/assets/images/doctor_prakash_kumar_1787230378706.jpg', consultationType: 'both', status: 'Active', availability: 'Today (10:00 AM - 05:00 PM)' },
  { id: 'doc-8', name: 'Dr. Swathi Reddy', speciality: 'Gynecologist', qualifications: 'MBBS, MS (OBG), Laparoscopic Surgeon', hospital: 'Yashoda Hospitals, Hanamkonda', hospitalId: 'hosp-2', district: 'Hanamkonda', rating: 4.8, reviewsCount: 215, experience: '11+ Years Experience', experienceYears: 11, consultationFee: 750, image: '/src/assets/images/doctor_shruthi_menon_1787230394773.jpg', consultationType: 'both', status: 'Active', availability: 'Today (09:30 AM - 04:30 PM)' },
  { id: 'doc-9', name: 'Dr. Srikanth Goud', speciality: 'Orthopedic Surgeon', qualifications: 'MBBS, MS (Ortho), Joint Replacement Specialist', hospital: 'MGM Hospital, Warangal', hospitalId: 'hosp-6', district: 'Warangal', rating: 4.7, reviewsCount: 165, experience: '13+ Years Experience', experienceYears: 13, consultationFee: 650, image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg', consultationType: 'both', status: 'Active', availability: 'Today (10:00 AM - 05:00 PM)' },
  { id: 'doc-10', name: 'Dr. Deepa Nair', speciality: 'Pediatrician', qualifications: 'MBBS, MD (Pediatrics), Neonatologist', hospital: 'KIMS Hospital, Warangal', hospitalId: 'hosp-1', district: 'Warangal', rating: 4.9, reviewsCount: 278, experience: '15+ Years Experience', experienceYears: 15, consultationFee: 700, image: '/src/assets/images/doctor_anusha_reddy_1787230366958.jpg', consultationType: 'both', status: 'Active', availability: 'Today (10:30 AM - 06:00 PM)' },
];

export const HEALTH_CAMPS = [
  { id: 'HC-UP-01', title: 'Free Diabetes Screening Camp', name: 'Free Diabetes Screening Camp', category: 'Diabetes & Metabolism', location: 'Mulugu, Warangal', district: 'Mulugu', date: '22 Sep 2026', time: '9:00 AM - 1:00 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Upcoming', doctorsInvolved: 8, leadDoctor: 'Dr. Ravi Teja (Chief Endocrinologist)', venue: 'Govt High School Grounds, Mulugu', description: 'Comprehensive blood glucose fasting screening, HbA1c tests, diabetic foot examination, and dietary counselling for rural residents.', servicesOffered: ['HbA1c Test', 'Dietary Counseling', 'Eye Screening'], lat: 18.1935, lng: 80.0040 },
  { id: 'HC-UP-02', title: 'General Health Checkup Camp', name: 'General Health Checkup Camp', category: 'General Medicine', location: 'Hanamkonda', district: 'Hanamkonda', date: '18 Sep 2026', time: '9:30 AM - 1:30 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Upcoming', doctorsInvolved: 12, leadDoctor: 'Dr. S. K. Reddy (General Physician)', venue: 'Community Hall, Nakkalagutta, Hanamkonda', description: 'Full vitals check, BP monitoring, ECG screening, paediatric care, and free distribution of essential medications.', servicesOffered: ['BP Check', 'Diabetes Screening', 'General Physician'], lat: 18.0105, lng: 79.5610 },
  { id: 'HC-UP-03', title: "Women's Health Awareness Camp", name: "Women's Health Awareness Camp", category: 'Gynecology & Maternal Care', location: 'Jangaon', district: 'Jangaon', date: '16 Oct 2026', time: '10:00 AM - 2:00 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Upcoming', doctorsInvolved: 10, leadDoctor: 'Dr. Swapna Priya (Senior Gynaecologist)', venue: 'Town Municipal Hall, Jangaon Main Road', description: 'Maternal health education, anaemia screening, pap smears, breast examination awareness, and nutritional supplements distribution.', servicesOffered: ['Gynecological Checkup', 'Anemia Screening', 'Calcium Guidance'], lat: 17.7282, lng: 79.1544 },
  { id: 'HC-UP-04', title: 'Eye Checkup Camp', name: 'Eye Checkup Camp', category: 'Ophthalmology', location: 'Bhupalpally', district: 'Bhupalpally', date: '28 Sep 2026', time: '9:00 AM - 2:00 PM', organizedBy: 'Sri Sri Holistic Hospitals', status: 'Upcoming', doctorsInvolved: 6, leadDoctor: 'Dr. Rajesh Kumar (Ophthalmic Surgeon)', venue: 'Zilla Parishad High School, Bhupalpally', description: 'Refraction testing, cataract early detection, glaucoma check, and prescription of free reading spectacles.', servicesOffered: ['Vision Test', 'Cataract Screening'], lat: 18.4330, lng: 79.8650 },
  { id: 'HC-UP-05', title: 'Free Cardiology Camp', name: 'Free Cardiology Camp', category: 'Cardiology', location: 'Warangal', district: 'Warangal', date: '04 Oct 2026', time: '9:00 AM - 1:00 PM', organizedBy: 'MGM Hospital, Warangal', status: 'Upcoming', doctorsInvolved: 14, leadDoctor: 'Dr. A. Srinivas (Consultant Cardiologist)', venue: 'MGM Hospital Outdoor Auditorium, Warangal', description: '12-lead ECG, 2D Echocardiography triage, hypertension screening, and cardiology specialist consultation.', servicesOffered: ['ECG', 'BP Check', 'Cardiology Consult'], lat: 17.9705, lng: 79.5988 },
  { id: 'camp-1', title: 'Free Health Checkup Camp', name: 'Free Health Checkup Camp', location: 'Warangal Rural', district: 'Warangal', date: '12 Sep 2026', status: 'Upcoming', servicesOffered: ['BP Check', 'Diabetes Screening', 'General Physician'], time: '9:00 AM - 1:00 PM', organizedBy: 'Ayudh Vikas Foundation', category: 'General Medicine', lat: 17.9780, lng: 79.6100 },
  { id: 'camp-2', title: 'Diabetes Awareness Camp', name: 'Diabetes Awareness Camp', location: 'Hanamkonda', district: 'Hanamkonda', date: '18 Sep 2026', status: 'Upcoming', servicesOffered: ['HbA1c Test', 'Dietary Counseling', 'Eye Screening'], time: '9:00 AM - 1:00 PM', organizedBy: 'Ayudh Vikas Foundation', category: 'Diabetes & Metabolism', lat: 18.0105, lng: 79.5610 },
  { id: 'camp-3', title: 'Women Health Camp', name: 'Women Health Camp', location: 'Mulugu', district: 'Mulugu', date: '22 Sep 2026', status: 'Upcoming', servicesOffered: ['Gynecological Checkup', 'Anemia Screening', 'Calcium Guidance'], time: '10:00 AM - 2:00 PM', organizedBy: 'Ayudh Vikas Foundation', category: 'Gynecology & Maternal Care', lat: 18.1935, lng: 80.0040 },
  { id: 'HC-CMP-01', title: 'Orthopedic Camp', name: 'Orthopedic Camp', category: 'Orthopedics & Joint Care', location: 'Mulugu', district: 'Mulugu', date: '20 Aug 2026', time: '9:00 AM - 3:00 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Completed', doctorsInvolved: 52, leadDoctor: 'Dr. K. V. Sharma (Orthopedic Specialist)', venue: 'Mulugu Primary Health Centre Grounds', description: 'Joint pain therapy, bone mineral density checks, posture correction, and free calcium supplements.', servicesOffered: ['Joint Pain Therapy', 'BMD Check', 'Calcium Supplements'], beneficiaries: 652, image: '/src/assets/images/camp_completed_orthopedic.jpg', lat: 18.1910, lng: 80.0006 },
  { id: 'HC-CMP-02', title: 'Dental Checkup Camp', name: 'Dental Checkup Camp', category: 'Dental & Oral Health', location: 'Warangal', district: 'Warangal', date: '16 Aug 2026', time: '9:30 AM - 2:00 PM', organizedBy: 'Kakatiya Dental College & Foundation', status: 'Completed', doctorsInvolved: 10, leadDoctor: 'Dr. Meenakshi (Dental Surgeon)', venue: 'Shambunipet Community Centre, Warangal', description: 'Dental cavity screening, scaling, oral hygiene education, and free dental care kits.', servicesOffered: ['Cavity Screening', 'Scaling', 'Dental Care Kits'], beneficiaries: 498, image: '/src/assets/images/camp_completed_dental.jpg', lat: 17.9689, lng: 79.5941 },
  { id: 'HC-CMP-03', title: 'Thyroid Screening Camp', name: 'Thyroid Screening Camp', category: 'Endocrinology', location: 'Hanamkonda', district: 'Hanamkonda', date: '12 Aug 2026', time: '8:30 AM - 1:30 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Completed', doctorsInvolved: 9, leadDoctor: 'Dr. Harish Rao (Endocrinologist)', venue: 'Subedari Mandal Parishad Office, Hanamkonda', description: 'TSH blood sampling, thyroid nodule palpation, dietary guidance, and prescription management.', servicesOffered: ['TSH Test', 'Thyroid Palpation', 'Dietary Guidance'], beneficiaries: 580, image: '/src/assets/images/camp_completed_thyroid.jpg', lat: 18.0072, lng: 79.5582 },
  { id: 'HC-CMP-04', title: 'General Health Camp', name: 'General Health Camp', category: 'General Medicine & Paediatrics', location: 'Bhupalpally', district: 'Bhupalpally', date: '08 Aug 2026', time: '9:00 AM - 4:00 PM', organizedBy: 'Singareni Collieries & Ayudh Vikas', status: 'Completed', doctorsInvolved: 11, leadDoctor: 'Dr. V. Prasad (Chief Medical Officer)', venue: 'Singareni Workers Welfare Club, Bhupalpally', description: 'Mass health screening for coal miners and local families with multi-specialty triage.', servicesOffered: ['Multi-specialty Triage', 'Basic Diagnostics', 'Family Screening'], beneficiaries: 723, image: '/src/assets/images/camp_completed_general.jpg', lat: 18.4312, lng: 79.8628 },
  { id: 'HC-CMP-05', title: 'Diabetes Awareness Camp', name: 'Diabetes Awareness Camp', category: 'Diabetes & Nutrition', location: 'Jangaon', district: 'Jangaon', date: '02 Aug 2026', time: '9:00 AM - 2:00 PM', organizedBy: 'Ayudh Vikas Foundation', status: 'Completed', doctorsInvolved: 10, leadDoctor: 'Dr. K. Anjaneyulu (Physician)', venue: 'Zilla Parishad Meeting Hall, Jangaon', description: 'Random blood sugar tests, dietary charts, lifestyle risk assessment, and free metformin for senior citizens.', servicesOffered: ['Blood Sugar Test', 'Lifestyle Assessment', 'Diet Charts'], beneficiaries: 685, image: '/src/assets/images/camp_completed_diabetes.jpg', lat: 17.7260, lng: 79.1520 },
];

function flattenDoctors() {
  const fromHospitals = HOSPITALS.flatMap((h) =>
    (h.seniorDoctors || []).map((d) => ({
      ...d,
      hospitalId: h.id,
      hospital: h.shortName,
      hospitalName: h.name,
      district: h.district,
      location: h.location,
      qualifications: d.qualification,
      experience: `${d.experienceYears}+ Years Experience`,
      consultationType: 'both',
      availableSlots: defaultSlots(),
      image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
    }))
  );
  const booking = BOOKING_DOCTORS.map((d) => ({ ...d, availableSlots: defaultSlots() }));
  const seen = new Set();
  return [...booking, ...fromHospitals].filter((d) => {
    if (seen.has(d.id)) return false;
    seen.add(d.id);
    return true;
  });
}

export async function seedDatabase(db, hashPassword) {
  if (!(await db.isEmpty())) {
    console.log('[seed] Database already has data — skipping seed.');
    return;
  }

  const patientPassword = await hashPassword('patient123');
  const doctorPassword = await hashPassword('doctor123');
  const hospitalPassword = await hashPassword('hospital123');
  const marketingPassword = await hashPassword('marketing123');
  const adminPassword = await hashPassword('admin123');
  const volunteerPassword = await hashPassword('volunteer123');
  const organizerPassword = await hashPassword('organizer123');

  const patientProfile = {
    patientId: 'AVP100245',
    memberId: 'AV-2024-8841',
    uhid: 'UHID-AV-884190',
    displayName: 'Ramesh K.',
    age: '42',
    gender: 'Male',
    bloodGroup: 'B+ve',
    maritalStatus: 'Married',
    occupation: 'Govt Teacher',
    address: 'H.No 2-8-450, Subedari, Hanamkonda, Warangal Urban - 506001',
    emergencyContactName: 'Smt. Rama Devi (Spouse)',
    emergencyContactPhone: '9848012345',
    image: '/src/assets/images/patient_avatar_1787229395408.jpg',
    walletBalance: 1250,
    identifier: '9876543210',
  };

  await db.createUser({
    id: 'user-patient-1',
    role: 'patient',
    name: 'Ramesh Kumar',
    email: 'ramesh.kumar@example.com',
    phone: '9876543210',
    password_hash: patientPassword,
    data: patientProfile,
  });

  await db.createUser({
    id: 'user-doctor-1',
    role: 'doctor',
    name: 'Dr. Ravi Teja',
    email: 'dr.raviteja@ayudhvikas.org',
    phone: '9000012345',
    password_hash: doctorPassword,
    data: {
      doctorId: 'doc-1',
      hospitalId: 'hosp-3',
      speciality: 'Cardiologist',
      image: '/src/assets/images/doctor_ravi_teja_1787230351201.jpg',
      identifier: 'dr.raviteja@ayudhvikas.org',
    },
  });

  await db.createUser({
    id: 'user-hospital-1',
    role: 'hospital',
    name: 'KIMS Hospitals Admin',
    email: 'kims@ayudhvikas.org',
    phone: '9876500001',
    password_hash: hospitalPassword,
    data: {
      hospitalId: 'hosp-1',
      identifier: 'kims@ayudhvikas.org',
    },
  });

  await db.createUser({
    id: 'user-marketing-1',
    role: 'marketing',
    name: 'Rohit Kumar',
    email: 'marketing@ayudhvikasfoundation.org',
    phone: '9876500000',
    password_hash: marketingPassword,
    data: { identifier: 'marketing@ayudhvikasfoundation.org' },
  });

  await db.createUser({
    id: 'user-admin-1',
    role: 'admin',
    name: 'Super Administrator',
    email: 'admin@ayudhvikasfoundation.org',
    phone: '9999999999',
    password_hash: adminPassword,
    data: { identifier: 'admin@ayudhvikasfoundation.org' },
  });

  await db.createUser({
    id: 'user-volunteer-1',
    role: 'volunteer',
    name: 'Priya Volunteer',
    email: 'volunteer@ayudhvikas.org',
    phone: '9876500091',
    password_hash: volunteerPassword,
    data: {
      identifier: 'volunteer@ayudhvikas.org',
      district: 'Hanamkonda',
      preferredActivity: 'Health Camps & Patient Guidance',
    },
  });

  await db.createUser({
    id: 'user-organizer-1',
    role: 'social_organizer',
    name: 'Rama Social Organizer',
    email: 'organizer@ayudhvikas.org',
    phone: '9876500092',
    password_hash: organizerPassword,
    data: {
      identifier: 'organizer@ayudhvikas.org',
      district: 'Warangal',
      coverageArea: 'Warangal Rural mandals',
      organizationName: 'Gram Deepthi SHG Network',
    },
  });

  for (const hospital of HOSPITALS) {
    await db.create('hospitals', hospital);
  }

  for (const doctor of flattenDoctors()) {
    await db.create('doctors', doctor);
  }

  for (const camp of HEALTH_CAMPS) {
    await db.create('health_camps', camp);
  }

  await db.create('patients', {
    id: 'AVP100245',
    userId: 'user-patient-1',
    fullName: 'Ramesh Kumar',
    ...patientProfile,
    phone: '9876543210',
    email: 'ramesh.kumar@example.com',
    membershipTier: 'Gold Health Care Member',
    validTill: '31 Dec 2026',
    chronicConditions: ['Post-PTCA Angioplasty (LAD Stent in 2023)', 'Essential Hypertension (Stage 2)'],
    allergies: ['Penicillin', 'Sulfa Antibiotics'],
  });

  await db.create('patients', {
    id: 'AV-2024-9021',
    fullName: 'Lakshmi Devi',
    memberId: 'AV-2024-9021',
    uhid: 'UHID-AV-902144',
    phone: '9440123456',
    age: '48',
    gender: 'Female',
    bloodGroup: 'O+',
    address: 'H.No 2-88, Subedari Colony, Hanamkonda, Warangal - 506001',
    image: '/src/assets/images/support_agent_female_1785560510481.jpg',
    membershipTier: 'Silver Health Care Member',
  });

  await db.create('visit_requests', {
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
    isAyudhMember: true,
  });

  await db.create('visit_requests', {
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
    hospitalNotes: 'Hospital coordination desk is reviewing doctor slot availability.',
    isAyudhMember: true,
  });

  await db.create('appointments', {
    id: 'APT-101',
    patientName: 'Ramesh Kumar',
    patientId: 'AVP100245',
    age: 42,
    gender: 'Male',
    phone: '9876543210',
    location: 'Hanamkonda, Warangal',
    avatar: '/src/assets/images/patient_avatar_1787229395408.jpg',
    bloodGroup: 'B+',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ravi Teja',
    hospital: 'MGM Hospital, Warangal',
    hospitalId: 'hosp-3',
    speciality: 'Cardiologist',
    appointmentDate: '29 Aug 2026',
    appointmentTime: '10:00 AM',
    timeSlotPeriod: 'Morning',
    tokenNumber: 'TK-01',
    visitType: 'Follow-up',
    reason: 'Post-Angioplasty ECG & Stent Evaluation',
    symptoms: ['Mild exertional breathlessness'],
    status: 'Confirmed',
    consultationFee: 800,
    bookedAt: new Date().toISOString(),
    previousVisitsCount: 3,
  });

  await db.create('appointments', {
    id: 'APT-102',
    patientName: 'Lakshmi Devi',
    patientId: 'AV-2024-9021',
    age: 48,
    gender: 'Female',
    phone: '9440123456',
    location: 'Naimnagar, Warangal',
    doctorId: 'doc-1',
    doctorName: 'Dr. Ravi Teja',
    hospital: 'MGM Hospital, Warangal',
    hospitalId: 'hosp-3',
    speciality: 'Cardiologist',
    appointmentDate: '29 Aug 2026',
    appointmentTime: '11:30 AM',
    timeSlotPeriod: 'Morning',
    tokenNumber: 'TK-02',
    visitType: 'Consultation',
    reason: 'Chest Pain & Palpitations on Exertion',
    symptoms: ['Chest tightness', 'High BP history'],
    status: 'Pending',
    consultationFee: 800,
    bookedAt: new Date().toISOString(),
    previousVisitsCount: 1,
  });

  const leadSeeds = [
    { id: 'LD-2024-0101', patientName: 'Rohit Verma', age: 52, gender: 'Male', phone: '9848022334', location: 'Warangal', requirement: 'Cardiology Consultation & ECG check', sourceCategory: 'Health Camps', sourceDetails: 'Free Cardiology Camp - Mulugu Govt High School', status: 'New', registeredAsPatient: false, assignedDoctor: 'Dr. Ravi Teja (Cardiologist)', dateAdded: '2026-08-28', marketerName: 'Rohit Kumar', problem: 'Heart Problem', time: '2 min ago', initials: 'RV', bg: 'bg-blue-100 text-blue-700' },
    { id: 'LD-2024-0102', patientName: 'Priya Sharma', age: 34, gender: 'Female', phone: '9876512340', location: 'Hanamkonda', requirement: 'General Checkup', sourceCategory: 'Website', sourceDetails: 'Landing page enquiry', status: 'Contacted', registeredAsPatient: false, assignedDoctor: 'Dr. Radhika Sharma', dateAdded: '2026-08-28', marketerName: 'Rohit Kumar', problem: 'General Checkup', time: '12 min ago', initials: 'PS', bg: 'bg-teal-100 text-teal-700' },
    { id: 'LD-2024-0103', patientName: 'Suresh Kumar', age: 61, gender: 'Male', phone: '9988776655', location: 'Bhupalpally', requirement: 'Diabetes Consultation', sourceCategory: 'Community Outreach', sourceDetails: 'Village health desk', status: 'In Discussion', registeredAsPatient: false, assignedDoctor: 'Dr. K. Srinivas Murthy', dateAdded: '2026-08-27', marketerName: 'Rohit Kumar', problem: 'Diabetes Consultation', time: '1 hr ago', initials: 'SK', bg: 'bg-amber-100 text-amber-700' },
    { id: 'LD-2024-0104', patientName: 'Neha Reddy', age: 29, gender: 'Female', phone: '9012345678', location: 'Jangaon', requirement: 'Orthopedic Issue', sourceCategory: 'Doctor Referral', sourceDetails: 'Dr. Prakash Kumar', status: 'Converted', registeredAsPatient: true, assignedDoctor: 'Dr. Prakash Kumar', dateAdded: '2026-08-26', marketerName: 'Rohit Kumar', problem: 'Orthopedic Issue', time: '2 hr ago', initials: 'NR', bg: 'bg-purple-100 text-purple-700' },
    { id: 'LD-2024-0105', patientName: 'Anil Reddy', age: 45, gender: 'Male', phone: '9123456780', location: 'Jangaon', requirement: 'Thyroid Problem', sourceCategory: '24x7 Helpline', sourceDetails: 'Call centre ticket', status: 'New', registeredAsPatient: false, assignedDoctor: 'Dr. Radhika Sharma', dateAdded: '2026-08-26', marketerName: 'Rohit Kumar', problem: 'Thyroid Problem', time: '3 hr ago', initials: 'AR', bg: 'bg-pink-100 text-pink-700' },
  ];
  for (const lead of leadSeeds) {
    await db.create('leads', lead);
  }

  await db.create('tickets', {
    id: 'AVT-8921',
    patientId: 'AVP100245',
    subject: 'Clarification on Gold Card pharmacy discount in Subedari',
    description: 'Need list of pharmacies honoring Gold Card 20% discount.',
    date: '22 May 2026',
    status: 'In Progress',
    priority: 'High',
  });

  await db.create('tickets', {
    id: 'AVT-8710',
    patientId: 'AVP100245',
    subject: 'Lab report download link expired for lipid profile',
    description: 'Please re-issue the report link.',
    date: '18 Apr 2026',
    status: 'Resolved',
    priority: 'Medium',
  });

  await db.create('reminders', { id: 'rem-1', patientId: 'AVP100245', title: 'Take Metformin 500mg', time: '08:00 AM (After Breakfast)', type: 'Medication', enabled: true });
  await db.create('reminders', { id: 'rem-2', patientId: 'AVP100245', title: 'Blood Pressure Log', time: '02:00 PM (Daily)', type: 'Health Log', enabled: true });
  await db.create('reminders', { id: 'rem-3', patientId: 'AVP100245', title: 'Evening Brisk Walk (30 mins)', time: '06:00 PM (Daily)', type: 'Exercise', enabled: true });
  await db.create('reminders', { id: 'rem-4', patientId: 'AVP100245', title: 'Take Telmisartan 40mg', time: '09:00 PM (After Dinner)', type: 'Medication', enabled: true });

  await db.create('health_records', { id: 'rec-1', patientId: 'AVP100245', title: 'Cardiology Consultation Rx & Diet Plan', doctor: 'Dr. Prashanth Reddy', facility: 'CARE Hospitals Warangal', date: '28 Apr 2026', type: 'Prescription', file: 'Rx_Cardiology_28Apr2026.pdf', size: '1.2 MB' });
  await db.create('health_records', { id: 'rec-2', patientId: 'AVP100245', title: 'Complete Blood Count (CBC) Diagnostic Report', doctor: 'Dr. S. K. Roy (Pathologist)', facility: 'Vijaya Diagnostic Centre', date: '20 May 2026', type: 'Lab Report', file: 'CBC_Report_AVP100245.pdf', size: '2.4 MB' });

  await db.create('wallet_txns', { id: 'wal-1', patientId: 'AVP100245', amount: 1250, type: 'credit', note: 'Opening wallet balance', balanceAfter: 1250 });

  console.log('[seed] Seeded hospitals, doctors, camps, users, visits, appointments, leads.');
}
