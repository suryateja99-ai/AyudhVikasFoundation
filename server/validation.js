import { z } from 'zod';

const optionalEmail = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)), 'Invalid email address');

const mobile10 = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((value) => !value || /^[0-9]{10}$/.test(String(value)), 'Mobile number must be 10 digits');

const strongPassword = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[!@#$%^&*]/, 'Must contain special character');

export const schemas = {
  login: z.object({
    identifier: z.string().min(1, 'Email/phone required'),
    password: z.string().min(1, 'Password required'),
  }),

  registerPatient: z.object({
    fullName: z.string().min(2, 'Name must be at least 2 characters').optional(),
    name: z.string().min(2).optional(),
    email: optionalEmail,
    mobileNumber: mobile10,
    phone: mobile10,
    password: strongPassword,
    age: z.coerce.number().min(0).max(120).optional(),
    gender: z.enum(['Male', 'Female', 'Other']).optional(),
    bloodGroup: z.string().optional(),
    address: z.string().optional(),
    role: z.string().optional(),
  }).passthrough(),

  registerDoctor: z.object({
    fullName: z.string().min(2, 'Name required').optional(),
    name: z.string().min(2).optional(),
    email: optionalEmail,
    mobileNumber: mobile10,
    mobile: mobile10,
    phone: mobile10,
    password: strongPassword,
    speciality: z.string().min(2, 'Speciality required'),
    qualification: z.string().optional(),
    qualifications: z.string().optional(),
    experienceYears: z.coerce.number().min(0).max(70).optional(),
    consultationFee: z.coerce.number().min(0).max(10000).optional(),
    district: z.string().optional(),
    role: z.string().optional(),
  }).passthrough(),

  registerHospital: z.object({
    hospitalName: z.string().min(2).optional(),
    name: z.string().optional(),
    email: optionalEmail,
    contactEmail: optionalEmail,
    contactPhone: mobile10,
    phone: mobile10,
    password: strongPassword,
    district: z.string().optional(),
    specialities: z.array(z.string()).optional(),
    primarySpeciality: z.string().optional(),
    role: z.string().optional(),
  }).passthrough(),

  registerGeneric: z.object({
    password: strongPassword,
    role: z.string().optional(),
  }).passthrough(),

  updateAppointment: z.object({
    status: z.enum(['Pending', 'Confirmed', 'Completed', 'Cancelled', 'Scheduled', 'CheckedIn', 'Accepted', 'Rejected']).optional(),
    tokenNumber: z.string().optional(),
    notes: z.string().optional(),
  }).passthrough(),

  visitRequestAccept: z.object({
    appointmentDateTime: z.string().optional(),
    doctorId: z.string().optional(),
    bedId: z.string().optional(),
    hospitalNotes: z.string().optional(),
  }).passthrough(),

  visitRequestReject: z.object({
    rejectionReason: z.string().min(2, 'Rejection reason is required').optional(),
    reason: z.string().optional(),
  }).passthrough(),
};

export function validate(schema, data) {
  try {
    const parsed = schema.parse(data);
    return { valid: true, data: parsed };
  } catch (error) {
    const issue = error?.issues?.[0] || error?.errors?.[0];
    return { valid: false, error: issue?.message || 'Invalid input' };
  }
}

export function schemaForRole(role) {
  if (role === 'doctor') return schemas.registerDoctor;
  if (role === 'hospital') return schemas.registerHospital;
  if (role === 'patient') return schemas.registerPatient;
  return schemas.registerGeneric;
}
