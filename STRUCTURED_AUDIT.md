# Ayudh Vikas Foundation - Structured Technical Audit
**Date:** September 9, 2026  
**Project:** Full-stack healthcare platform  
**Status:** Active Development with significant gaps

---

## TABLE OF CONTENTS
- [A. Authentication/RBAC](#a-authenticationrbac)
- [B. Role Architecture](#b-role-architecture)
- [C. Registration/Verification](#c-registrationverification)
- [D. Hospital/Doctor Relationships](#d-hospitaldoctor-relationships)
- [E. Membership/Plans](#e-membershipplans)
- [F. Patient Workflows](#f-patient-workflows)
- [G. Hospital Workflows](#g-hospital-workflows)
- [H. Doctor Workflows](#h-doctor-workflows)
- [I. Admin Workflows](#i-admin-workflows)
- [J. API/Backend](#j-apibackend)
- [K. Database](#k-database)
- [L. Routing/Navigation](#l-routingnavigation)
- [M. Loading/Error/Empty States](#m-loadingerrorempty-states)
- [N. File/Document Handling](#n-filedocument-handling)
- [O. Security](#o-security)
- [P. Missing Interconnections](#p-missing-interconnections)

---

# A. Authentication/RBAC

## A.1: Public Access to All Patient Records

**Current Behavior:**
- Endpoint `GET /api/records/patients` returns ALL patient records without authentication
- Anyone can see patient names, phone numbers, email, medical history via public API
- No role checks, no user isolation, no data filtering
- Works same way for: doctors, appointments, ambulance_bookings, lab_bookings, prescriptions, insurance_applications

**Expected Behavior:**
- Only authenticated users should access records
- Patients can only view/modify their own records
- Doctors can only view assigned patients or referral patients
- Hospitals can only view patients with visit requests to them
- Admins can view all records (with filtering/pagination)

**Affected Pages/Components:**
- All pages that fetch data: PatientDashboard, HospitalDashboard, DoctorDashboard, MarketingDashboard
- API calls in [src/lib/api.ts](src/lib/api.ts): `api.list()`, `api.get()`
- Backend endpoints in [server/index.js](server/index.js): Lines 270-320

**Affected Database Entities:**
- `patients`, `doctors`, `appointments`, `ambulance_bookings`, `lab_bookings`, `prescriptions`, `insurance_applications`, `leads`, `health_records`

**Security Impact:** HIGH - HIPAA violation, privacy breach, data exposure

**Recommended Fix:**
1. Add `authRequired` middleware to all data endpoints
2. Implement row-level security queries based on user role/ID
3. Add `filter` parameter validation to prevent data leakage
4. Check `patientId` matches `req.user.patientId` before returning patient data
5. Check `doctorId` matches `req.user.doctorId` before returning doctor data
6. Check `hospitalId` matches `req.user.hospitalId` before returning hospital data

---

## A.2: Guest User Has Full Patient Permissions

**Current Behavior:**
- Guest users (not logged in) can:
  - View all hospitals and doctors
  - Book appointments (creates appointment record attributed to "guest-user")
  - Call doctor lookup endpoints
  - Browse health camps
  - Access ambulance booking UI
- Guest status persisted in `localStorage['ayudh_guest'] = '1'`
- `isGuest` flag exists but not checked in most components
- Guest attempts to access protected features show blank screens, not login prompts

**Expected Behavior:**
- Guest users should have read-only access (view hospitals, doctors, camps)
- Cannot create bookings, appointments, or accounts without registering
- Should show "Sign in to book" CTA instead of allowing action
- Clicking "Book" should trigger login modal, not allow empty booking

**Affected Pages/Components:**
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Allows booking without login
- [AmbulanceBookingPage.tsx](src/components/AmbulanceBookingPage.tsx) - Allows booking without authentication
- [LabTestsPage.tsx](src/components/LabTestsPage.tsx) - Similar issue
- [HomeServicePage.tsx](src/components/HomeServicePage.tsx) - Similar issue
- [HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx) - Creates visit request without auth

**Affected API Endpoints:**
- `POST /api/records/appointments`
- `POST /api/records/ambulance_bookings`
- `POST /api/records/visit_requests`
- `POST /api/records/lab_bookings`
- `POST /api/records/home_care_bookings`

**Recommended Fix:**
1. Add guard before `onCreate()` calls: Check `if (!isLoggedIn && !isGuest)` or `if (isGuest)` → show login modal
2. In UI: Disable "Book" buttons for guests, show "Sign in to book" text
3. In API: Validate `req.user` is not guest before creating bookings
4. Remove guest functionality OR make it truly read-only (remove guest flag from PATIENT_ROLE)

---

## A.3: No Role Isolation on API Responses

**Current Behavior:**
- A doctor calls `GET /api/records/patients` → gets ALL 5,000 patients' data
- A patient calls `GET /api/records/doctors` → gets ALL 300 doctors
- Marketing calls `GET /api/records/leads` → could theoretically see all leads (not restricted)
- Hospital calls `POST /api/records/visit_requests` → no validation that it's actually their hospital

**Expected Behavior:**
- Doctor queries return only patients they've seen/been assigned
- Patient queries return only their own records
- Hospital sees only their own bed availability, doctor roster, visit requests
- Marketing sees only assigned leads (not others')
- Each role's data is pre-filtered at query level

**Affected API Patterns:**
- Backend filter logic in [server/db.js](server/db.js): `list()`, `listUsers(filter)`
- Frontend filters in [src/lib/api.ts](src/lib/api.ts): `api.list(collection, filter)`

**Recommended Fix:**
1. Server-side: Modify `db.list(collection, filter)` to apply role-based WHERE clauses
2. For patients: Auto-filter by `patientId = req.user.data.patientId`
3. For doctors: Auto-filter by `doctorId = req.user.data.doctorId` OR filter records assigned to them
4. For hospitals: Auto-filter by `hospitalId = req.user.data.hospitalId`
5. Implement view-level security (PostgreSQL RLS policies if available)

---

## A.4: No Session Management or Token Expiration Checks

**Current Behavior:**
- JWT tokens expire after 7 days (hardcoded in [server/crypto-auth.js](server/crypto-auth.js))
- No refresh token mechanism
- Frontend stores token in localStorage indefinitely
- If token expires, next API call fails silently
- No automatic logout or token refresh on 401 response
- Users don't know their session expired

**Expected Behavior:**
- Tokens should have shorter expiration (1-2 hours)
- Refresh tokens should extend session
- 401 responses should trigger logout and redirect to login
- "Session expired" message shown to user
- Option to re-authenticate without losing unsaved work

**Affected Files:**
- [server/crypto-auth.js](server/crypto-auth.js) - Line: `exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7`
- [src/lib/api.ts](src/lib/api.ts) - No 401 error handling
- [src/context/AuthContext.tsx](src/context/AuthContext.tsx) - No logout on 401

**Recommended Fix:**
1. Change token expiration to 2 hours (7200 seconds)
2. Implement refresh token endpoint: `POST /api/auth/refresh`
3. Intercept 401 responses in API layer, attempt refresh
4. On refresh failure, logout user and redirect to login page
5. Show "Session expired, please log in again" toast

---

## A.5: Missing Rate Limiting and Attack Prevention

**Current Behavior:**
- No rate limiting on login/register endpoints
- No captcha on public endpoints
- No account lockout after failed login attempts
- No email/phone verification before account creation
- Any IP can make unlimited API requests
- No API key management or quota system

**Expected Behavior:**
- Login: Max 5 attempts per IP per 15 minutes
- Register: Max 3 per IP per hour
- Public endpoints: Rate limit to 100 req/min per IP
- Captcha on signup
- Email verification required before account approval
- Account lockout after 5 failed logins

**Affected Endpoints:**
- `POST /api/auth/login` - [server/index.js](server/index.js) line ~107
- `POST /api/auth/register` - [server/index.js](server/index.js) line ~137
- All public endpoints

**Recommended Fix:**
1. Install `express-rate-limit` package
2. Add rate limiter middleware to login/register
3. Implement redis-backed store for persistent rate limiting
4. Add Google reCAPTCHA v3 to registration form
5. Implement email verification workflow (see Section C.2)

---

# B. Role Architecture

## B.1: Nine Roles Defined But Only Two Have Differentiated Dashboards

**Current Behavior:**
- Defined roles: `patient`, `doctor`, `hospital`, `admin`, `marketing`, `volunteer`, `social_organizer`, `ambulance`, `lab`
- Separate dashboards exist for: patient, doctor, hospital, admin, marketing, super-admin, community-role
- After login, user directed to single dashboard based on role
- No role-switching capability
- Some roles (ambulance, lab) have no dashboard UI at all

**Expected Behavior:**
- Each role has dedicated dashboard with role-specific features
- Ambulance driver should see: bookings assigned to them, current job, delivery status
- Lab staff should see: bookings, test list, results upload
- Volunteer should see: assigned camps, patient count, checklist
- Social organizer should see: camp calendar, team management, attendance
- Marketing should see: assigned leads, conversion pipeline, targets

**Affected Files:**
- [App.tsx](src/App.tsx) - Role-based routing (lines ~300-500)
- Dashboard files:
  - [PatientDashboard.tsx](src/components/PatientDashboard.tsx) ✓ Exists
  - [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) ✓ Exists
  - [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) ✓ Exists
  - [MarketingDashboard.tsx](src/components/MarketingDashboard.tsx) ✓ Exists
  - [SuperAdminDashboard.tsx](src/components/SuperAdminDashboard.tsx) ✓ Exists
  - [CommunityRoleDashboard.tsx](src/components/CommunityRoleDashboard.tsx) ✓ Exists
  - AmbulanceDashboard ✗ Missing
  - LabDashboard ✗ Missing
  - VolunteerDashboard ✗ Missing
  - SocialOrganizerDashboard ✗ Missing

**Recommended Fix:**
1. Create missing dashboards: AmbulanceDashboard, LabDashboard, VolunteerDashboard, SocialOrganizerDashboard
2. In `App.tsx` routing logic, add cases for these roles
3. For ambulance: Show dispatch queue, pickup location on map, delivery status
4. For lab: Show test bookings, test panels, results upload form, patient reports
5. For volunteer: Show assigned camps, patient check-in, health screening form
6. For social organizer: Show calendar of camps, team roster, attendance tracking

---

## B.2: No Multi-Role Support (User Can Only Have One Role)

**Current Behavior:**
- User table has single `role` field (TEXT)
- After login, user directed to single dashboard
- If a doctor also wants to register as admin, must create second account
- No permission inheritance or role hierarchy
- A hospital administrator cannot switch to viewing patient dashboard

**Expected Behavior:**
- User can have multiple roles (e.g., Doctor + Super Admin)
- Role selector in navbar/profile menu: "Switch to: Patient | Doctor | Admin"
- Permissions combine: if user is doctor + admin, can access both dashboards
- Sub-admins for hospitals: hospital staff who manage beds/appointments
- Marketing + doctor: person who both recruits leads and provides consultation

**Affected Files:**
- [AuthContext.tsx](src/context/AuthContext.tsx) - `role: UserRole` (single value)
- [users table](server/db.js) - `role TEXT NOT NULL`
- Navigation in [TopBar.tsx](src/components/TopBar.tsx), [Navbar.tsx](src/components/Navbar.tsx)

**Current Data Model:** 
```typescript
role: 'patient' | 'doctor' | 'hospital' | 'admin' | ...
```

**Recommended Data Model:**
```typescript
roles: ('patient' | 'doctor' | 'hospital' | 'admin' | ...)[]
primaryRole: 'patient' // for dashboard routing
```

**Recommended Fix:**
1. Migrate `users.role` → `users.roles` (array), `users.primaryRole` (string)
2. Update AuthContext to store array of roles
3. Add role selector in TopBar when user.roles.length > 1
4. Modify dashboard routing to check `primaryRole`
5. Modify permission checks to look for ANY matching role: `req.user.roles.includes('admin')`
6. Create role assignment endpoints: `PATCH /api/users/:id/roles`

---

## B.3: Role Permissions Not Enforced Consistently

**Current Behavior:**
- `adminRequired` middleware only on user management endpoints
- No checks for doctor-specific endpoints (e.g., viewing appointments)
- Hospital can create visit requests but no validation it's their hospital
- Marketing can see all leads but not just assigned ones
- No "owner" check: user can modify/delete other users' data

**Expected Behavior:**
- Every data-modifying endpoint checks if user has permission
- Doctor endpoints require `role === 'doctor'` OR `role.includes('doctor')`
- Hospital endpoints require `role === 'hospital'` AND `hospitalId === user.hospitalId`
- Patient can only modify own profile: `patientId === user.patientId`
- Marketing can only see assigned leads: `lead.assignedTo === user.id`

**Affected Endpoints:**
- `POST /api/records/appointments` - Should check `doctorId belongs to user`
- `POST /api/records/visit_requests` - Should check `hospitalId belongs to user`
- `PATCH /api/records/:collection/:id` - Should check ownership
- `DELETE /api/records/:collection/:id` - Should check ownership

**Recommended Fix:**
1. Create permission middleware: `requireRole('patient')`, `requireRole('doctor')`, etc.
2. Add ownership checks: before updating record, verify `createdBy === req.user.id`
3. For hospitals: verify `req.user.hospitalId === record.hospitalId`
4. For patients: verify `req.user.patientId === record.patientId`
5. Return 403 Forbidden if user lacks permission

---

# C. Registration/Verification

## C.1: Instant Auto-Approval of Patient, Doctor, Hospital Registrations

**Current Behavior:**
- Patient registration (Line 147-166 of [server/index.js](server/index.js)):
  ```javascript
  await db.create('patients', {
    id: patientId,
    status: 'APPROVED',  // ← Auto-approved!
  });
  ```
- Doctor registration:
  ```javascript
  await db.create('doctors', {
    status: 'Active',  // ← Auto-approved!
  });
  ```
- Hospital registration:
  ```javascript
  // No explicit status, defaults to active
  ```
- No email verification, no document review, no admin approval step
- Users have immediate access to all features after registration

**Expected Behavior:**
- Patient: Registered with `status: 'PENDING'`
  - Email verification required (verify they own email)
  - Auto-approve after email verified (or admin approval for certain conditions)
  - Show "Verify your email" message on first login
- Doctor: Registered with `status: 'PENDING_VERIFICATION'`
  - Requires document upload (medical license, degree)
  - Admin review of credentials before approval
  - Email and phone verification
  - Can view own profile but limited features until verified
- Hospital: Registered with `status: 'PENDING_VERIFICATION'`
  - Requires: hospital registration document, tax ID
  - Admin approval required
  - Limited to 10 beds during trial period
  - Cannot assign doctors until verified

**Affected Files:**
- Registration endpoint: [server/index.js](server/index.js) lines ~137-180
- Patient creation: `api.register()` in [src/lib/api.ts](src/lib/api.ts)
- After-registration flow: [RegistrationModal.tsx](src/components/RegistrationModal.tsx)

**Affected Database Entities:**
- `users.data.status` (currently not used)
- `patients.status` (always "APPROVED")
- `doctors.status` (always "Active")
- `hospitals.status` (not tracked)

**Recommended Fix:**
1. Add `status` field to registration request
2. Generate unique verification tokens: `users.verificationToken`
3. Send verification email with link: `/verify?token=ABC123`
4. Add `POST /api/auth/verify-email` endpoint
5. Only set `status: 'APPROVED'` after email verification
6. Create `/admin/pending-verifications` page to review documents
7. Add document upload handler (see Section N)

---

## C.2: No Email/Phone Verification

**Current Behavior:**
- Patient registers with email/phone without verification
- No confirmation email sent
- User immediately logged in regardless of email validity
- Anyone can register with random/invalid email addresses
- No way to contact user if email is wrong (no password recovery possible)

**Expected Behavior:**
- Registration sends verification email with 24-hour expiring link
- User must click link to verify email
- Phone verification via OTP (6-digit code, 5-minute expiry)
- Cannot change email without re-verification
- Password recovery requires email verification
- Show verification status in account settings

**Affected Files:**
- [server/index.js](server/index.js) - `POST /api/auth/register` (line ~137)
- Email service: NOT IMPLEMENTED
- OTP service: NOT IMPLEMENTED

**Missing Infrastructure:**
- Email service (SendGrid, SES, Nodemailer)
- SMS service (Twilio, AWS SNS)
- Verification token storage
- Email templates

**Recommended Fix:**
1. Install Nodemailer or use SendGrid API
2. Add `verificationToken` and `verificationTokenExpiry` to users table
3. Add `emailVerified` and `phoneVerified` boolean flags
4. After registration, generate token and send email
5. Create `POST /api/auth/verify-email` with token validation
6. Implement OTP flow: `POST /api/auth/send-otp`, `POST /api/auth/verify-otp`
7. Show blue badge "Verified" in user profiles once verified

---

## C.3: Doctor Registration Has No Document Verification

**Current Behavior:**
- Doctor registers with just name, qualifications (text), email, phone
- No upload of medical degree, medical license, registration certificate
- No validation that doctor is real/qualified
- No admin review process
- Doctor immediately appears in search results
- No background check or credential verification

**Expected Behavior:**
- Doctor registration form includes:
  - Medical qualification documents (degree certificate, scanned)
  - Medical council registration number + verification link
  - License/registration certificate images
  - Proof of specialization (if applicable)
  - Professional liability insurance documents
- Documents uploaded to secure storage (S3, Google Cloud)
- Admin dashboard shows pending doctor verifications with document review
- Doctor cannot appear in search until verified
- Doctor can update documents if rejected
- Audit trail of verification approvals

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - Doctor form
- [server/index.js](server/index.js) - Doctor registration endpoint
- No file upload handling currently

**Affected Database Entities:**
- `doctors.status` (currently "Active", should be "PENDING_VERIFICATION")
- `doctors.documents` (doesn't exist)
- `doctors.verifiedAt` (doesn't exist)
- `doctors.verifiedBy` (doesn't exist)

**Recommended Fix:**
1. Add document upload fields to doctor registration form (3-5 files)
2. Implement file upload handler (see Section N)
3. Store files in cloud storage with doctor ID as prefix
4. Add `verificationDocuments: { documentType, url, uploadedAt }[]`
5. Create admin verification dashboard page
6. Add status workflow: PENDING_VERIFICATION → VERIFIED OR REJECTED
7. Send email notification on approval/rejection

---

## C.4: Hospital Registration Missing Organization Validation

**Current Behavior:**
- Hospital registers with name, phone, location, specialities
- No verification that hospital exists or is legitimate
- No upload of hospital registration documents
- No bed capacity validation
- Anyone can create 100 fake hospitals
- No admin review before hospital gets bed management features

**Expected Behavior:**
- Hospital registration requires:
  - Hospital registration document (government certificate)
  - Tax ID/GST number (with verification against tax authority)
  - Organization address proof
  - Board of directors/owner information
  - Photo of hospital building
- Hospital appears as "UNVERIFIED" until admin approves
- Limited features for unverified hospitals (no bed management, no appointment bookings)
- Verification badge appears once confirmed
- Annual renewal of credentials

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - Hospital form
- [server/index.js](server/index.js) - Hospital registration endpoint

**Affected Database Entities:**
- `hospitals.status` (doesn't track verification status)
- `hospitals.documents` (doesn't exist)
- `hospitals.verifiedAt` (doesn't exist)

**Recommended Fix:**
1. Add document upload to hospital registration (organization docs)
2. Add GST/Tax ID field with format validation
3. Create `hospitals.status: 'PENDING_VERIFICATION' | 'VERIFIED' | 'SUSPENDED'`
4. Unverified hospitals hidden from public search (admin-only view)
5. Add verification checklist in admin dashboard
6. Add `verifiedBy: userId` and `verifiedAt: timestamp`

---

# D. Hospital/Doctor Relationships

## D.1: Doctors and Hospitals Not Properly Linked

**Current Behavior:**
- `doctors` collection has `hospitalId` field that points to hospital
- Problem: Multiple representations of same doctor
  1. Record in `doctors` collection: `{ id: 'DOC123', name: 'Dr. Smith', hospitalId: 'HOSP1' }`
  2. Nested in `hospitals.seniorDoctors[]`: `{ id: 'DOC123', name: 'Dr. Smith', ... }`
  3. When doctor updated, both places must be updated manually
- Relationship is stored as text field (not foreign key constraint)
- No validation that doctor's hospital exists
- Doctor can be in multiple hospitals but no explicit "assignments" table

**Expected Behavior:**
- Single source of truth for doctor record (in `doctors` collection)
- Relationship stored via proper foreign key or reference
- Hospital stores only doctor IDs in `seniorDoctors`, not full copy
- Querying hospital returns doctor IDs, then client fetches doctor details
- When doctor's name changes, updates automatically in all places
- Explicit "doctor_hospital_assignments" table for:
  - Doctor working multiple hospitals
  - Department assignment
  - On-leave dates
  - Consultation fee by hospital

**Affected Components:**
- [PartnerHospitalsPage.tsx](src/components/PartnerHospitalsPage.tsx) - Displays `hospital.seniorDoctors[]`
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - Manages doctor list
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Books with doctor
- Backend sync code: [server/index.js](server/index.js) lines ~470-476

**Database Schema Issues:**
- No referential integrity (doctor can point to deleted hospital)
- No cascade delete (deleting hospital orphans doctors)
- Denormalization causes sync bugs

**Recommended Fix:**
1. Create `doctor_hospital_assignments` table:
   ```sql
   CREATE TABLE doctor_hospital_assignments (
     id TEXT PRIMARY KEY,
     doctorId TEXT NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
     hospitalId TEXT NOT NULL REFERENCES hospitals(id) ON DELETE CASCADE,
     department TEXT,
     consultationFee INTEGER,
     availableSlots JSONB,
     status TEXT DEFAULT 'Active',
     startDate TIMESTAMP,
     endDate TIMESTAMP
   );
   ```
2. Remove `hospitalId` from doctors table
3. Remove `seniorDoctors[]` from hospitals JSONB
4. When fetching hospital, separately query assignments and join with doctor details
5. Update API responses to return references instead of full objects

---

## D.2: Hospital Bed Management Not Implemented

**Current Behavior:**
- `hospitals` table has `totalBeds` and `availableBeds` fields (numeric)
- These are static numbers set at hospital creation, never updated
- No bed occupancy tracking
- No ward/department bed allocation
- When visit request accepted, no bed reserved
- No real-time bed status updates to patients
- Hospitals cannot update available beds through dashboard

**Expected Behavior:**
- Each hospital tracks beds by type:
  - General wards: 50 beds
  - ICU: 10 beds
  - Private: 15 beds
  - HDU: 5 beds
- Real-time occupancy: occupied / total
- When patient admitted, bed marked occupied + assigned bed number
- When patient discharged, bed marked available
- Dashboard shows bed availability by department
- Bed allocation algorithm for visit requests (assign to available bed)
- Patients can check real-time availability before requesting visit
- Alert when occupancy >90%

**Affected Files:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - No bed management UI
- Database: `hospitals.availableBeds` (static)
- No occupancy tracking in `visit_requests`

**Affected Database Entities:**
- Need new `hospital_beds` collection:
  ```json
  {
    "id": "BED-HOSP1-ICU-001",
    "hospitalId": "HOSP1",
    "wardType": "ICU",
    "bedNumber": "ICU-001",
    "status": "occupied|available|maintenance",
    "assignedPatientId": "AVP123",
    "reservedUntil": "2026-09-15",
    "notes": "Monitor required"
  }
  ```

**Recommended Fix:**
1. Create `hospital_beds` collection with bed details
2. Add bed type hierarchy: ward → floor → bed
3. Implement occupancy counter: `SELECT COUNT(*) WHERE status='occupied'`
4. When visit accepted: CREATE bed if available, UPDATE bed status
5. When patient discharged: UPDATE bed status to 'available'
6. Add `currentBedOccupancy` to hospitals (calculated field)
7. Real-time SSE broadcasts for bed status changes

---

## D.3: No Explicit Doctor-Hospital Assignment Management

**Current Behavior:**
- Doctor registration creates link to ONE hospital via `hospitalId` field
- No way to assign doctor to multiple hospitals
- No way to manage on-leave periods
- No way to set different consultation fees per hospital
- No way to set different available hours per hospital
- Doctor's schedule is global, not hospital-specific

**Expected Behavior:**
- Doctor can have multiple active assignments to different hospitals
- Hospital admin can assign/remove doctors
- Doctor can accept/decline assignment requests
- Each assignment has:
  - Department
  - Consultation fee (can vary per hospital)
  - Available hours/slots (can vary per hospital)
  - On-leave periods
  - Status: Active / On Leave / Suspended
- Doctor approval required before appearing in hospital's doctor list

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - Only single hospital
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - No assignment UI
- Backend registration: [server/index.js](server/index.js) lines ~160-175

**Affected Database Entities:**
- Need `doctor_hospital_assignments` table (see D.1)

**Recommended Fix:**
1. Create explicit assignments table (D.1)
2. Add hospital management page: "Manage Doctors"
   - Search & assign doctors
   - Set department, fee, hours per doctor
   - Mark on-leave
3. Add doctor management page: "My Hospital Assignments"
   - View all hospitals
   - Accept/decline invitations
   - Set hours/availability
   - Go on leave with dates
4. API endpoints:
   - `POST /api/doctor-assignments` (hospital creates)
   - `PATCH /api/doctor-assignments/:id/accept` (doctor accepts)
   - `PATCH /api/doctor-assignments/:id/reject`

---

# E. Membership/Plans

## E.1: Membership Collection Exists But Unused

**Current Behavior:**
- `memberships` collection defined in schema ([server/db.js](server/db.js) line 18)
- No records created during patient registration
- No membership tier selection during signup
- Patient dashboard shows membership section but hardcoded data only
- No plan selection UI or pricing display
- API `POST /api/records/memberships` exists but never called

**Expected Behavior:**
- Patient registration includes membership selection: Free / Silver / Gold / Platinum
- Different tiers unlock features:
  - Free: Basic appointment booking
  - Silver: Cashless at 5 partner hospitals
  - Gold: Cashless at all hospitals + free health checkup 2x/year
  - Platinum: All gold benefits + priority appointment slots + doctor on-call
- Membership billing: Monthly/Annual
- Payment integration for paid tiers
- Renewal notifications 7 days before expiry
- Automatic downgrade to Free if payment fails

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - No membership selection
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Hardcoded "Gold" tier
- Database: `memberships` collection unused

**Affected Database Entities:**
- `memberships` - unused
- `users.data.membershipTier` - exists but never set
- `wallet_txns` - exists but only used for manual balance additions

**Recommended Fix:**
1. Add membership selection form to patient registration
2. Create membership plan records in DB:
   ```json
   {
     "id": "MEM-GOLD-001",
     "patientId": "AVP123",
     "tier": "gold",
     "startDate": "2026-09-01",
     "endDate": "2027-09-01",
     "status": "active|expired|suspended",
     "billingCycle": "monthly|annual",
     "amount": 500,
     "renewalDate": "2027-09-01"
   }
   ```
3. Add membership selection UI to registration
4. Implement tier-based feature toggles (see F.2)
5. Add renewal reminder notifications

---

## E.2: Hospital Plans Collection Missing

**Current Behavior:**
- No hospital-specific plan system
- Hospitals don't have packages or pricing tiers
- No concept of "partnership levels"
- `partnerships` collection exists but unused
- No payment terms for hospital partners

**Expected Behavior:**
- Hospital partner has "plan" based on:
  - Annual partnership fee (Standard / Premium / Enterprise)
  - Services included (telemed, home care, lab, ambulance)
  - Bed inventory management features
  - Marketing support tier
  - Dedicated account manager (for Premium/Enterprise)
  - Data analytics dashboard
- Plan impacts:
  - Visibility in search results (free hospitals buried, premium featured)
  - Feature access (export reports, bulk uploads, API access)
  - Support response time (24/48/72 hours)

**Affected Files:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - No plan info
- Database: No hospital_plans collection

**Affected Database Entities:**
- Need `hospital_plans` collection:
  ```json
  {
    "id": "HPLAN-HOSP1-001",
    "hospitalId": "HOSP1",
    "planTier": "standard|premium|enterprise",
    "startDate": "2026-01-01",
    "endDate": "2027-01-01",
    "annualFee": 50000,
    "includedServices": ["telemed", "ambulance"],
    "dedicatedManager": "user-id",
    "billingContact": "billing@hospital.com"
  }
  ```

**Recommended Fix:**
1. Create hospital_plans collection
2. Add plan selector to hospital registration form
3. Show plan benefits/pricing page
4. Create admin workflow for plan activation/renewal
5. Implement feature gates based on plan tier

---

## E.3: Wallet and Payments System Incomplete

**Current Behavior:**
- `wallet_txns` collection exists with `balanceAfter` tracking
- Only hardcoded addition: when booking ambulance, fixed amount deducted
- No real payment gateway integration
- No way to add money to wallet
- No payment methods (credit card, UPI, net banking)
- Wallet balance stored in `users.data.walletBalance` (redundant)
- No invoice/receipt generation

**Expected Behavior:**
- Patient wallet with balance
- Add money via: Credit/Debit card, UPI, Net Banking
- Auto-deduction for services (appointment, ambulance, lab)
- Refund mechanism for cancellations
- Promotion/coupon codes that add credits
- Invoice email after each transaction
- Wallet statement download (PDF)
- Recurring billing for memberships

**Affected Files:**
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Shows wallet but no Add Money button
- Database: `wallet_txns` collection
- No payment gateway integration

**Affected Database Entities:**
- `wallet_txns` - partially used
- `users.data.walletBalance` - redundant
- Need: `wallet_payments` (payment attempts), `promotions` (coupon codes), `invoices`

**Recommended Fix:**
1. Implement Razorpay/Stripe payment integration
2. Add wallet page with "Add Money" button
3. Create payment method management
4. Add `wallet_payments` table to track payment attempts
5. Implement refund logic on cancellations
6. Generate invoices from transactions
7. Add coupon/promotion code support

---

# F. Patient Workflows

## F.1: Patient Registration Missing Field Mapping

**Current Behavior:**
- Registration form has many fields: age, gender, blood group, address, city, etc.
- Fields captured but stored inconsistently
- Some go into `users` table, some into `users.data`, some into `patients` collection
- During registration, `safeBo dy` stores everything in users.data (overkill)
- Patient edit form hardcoded with initial values that don't match database

**Expected Behavior:**
- Clear field mapping:
  - Name → users.name, patients.fullName
  - Email → users.email
  - Phone → users.phone, patients.phone
  - Age → users.data.age, patients.age
  - Gender → users.data.gender, patients.gender
  - Blood Group → patients.bloodGroup
  - Address → patients.address
  - City → patients.city
  - Medical History → patients.medicalHistory
  - Allergies → patients.allergies
- Form should fetch from database on edit, pre-populate, then update
- No data duplication between users and patients tables

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - Registration form
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Profile edit (hardcoded data)
- [server/index.js](server/index.js) - Registration endpoint (line ~147-166)

**Affected Database Entities:**
- `users` table
- `patients` collection

**Recommended Fix:**
1. Define explicit field mapping document
2. Update registration endpoint to split fields properly
3. Update patient edit to fetch from DB and populate form
4. Remove hardcoded initial values in PatientDashboard
5. Implement debounced auto-save on profile edit
6. Show "Saving..." feedback during update

---

## F.2: Tier-Based Feature Restrictions Not Enforced

**Current Behavior:**
- All patient features available to all users regardless of membership
- Free patients can book appointments same as Gold members
- No feature gating (showing/hiding based on tier)
- Membership tier exists but not checked in any component
- No "Upgrade to Gold" prompts

**Expected Behavior:**
- Free Tier: Can view hospitals/doctors but:
  - ✗ No appointment booking (or 1 free per month)
  - ✗ Cannot use cashless facilities
  - ✗ No lab test booking
  - ✗ No ambulance service
  - CTA: "Upgrade to Gold to book appointments"
- Silver Tier:
  - ✓ Unlimited appointments
  - ✓ Cashless at 5 partner hospitals
  - ✓ Lab tests (Rs 500/month limit)
- Gold Tier:
  - ✓ All above
  - ✓ Cashless at ALL hospitals
  - ✓ Free health checkup 2x/year
  - ✓ Priority appointment slots
- Platinum Tier:
  - ✓ All gold benefits
  - ✓ 24/7 doctor consultation
  - ✓ Home health services included
  - ✓ No cashless limits

**Affected Components:**
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Should check tier
- [AmbulanceBookingPage.tsx](src/components/AmbulanceBookingPage.tsx) - Only for Silver+
- [LabTestsPage.tsx](src/components/LabTestsPage.tsx) - Limited for Free, unlimited for Gold+
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Should show tier benefits

**Recommended Fix:**
1. Create feature matrix based on tier:
   ```typescript
   const TIER_FEATURES = {
     free: { appointments: 1, cashless: false, labs: false, ambulance: false },
     silver: { appointments: unlimited, cashless: 5, labs: 2, ambulance: true },
     gold: { appointments: unlimited, cashless: 'all', labs: unlimited, ambulance: true },
     platinum: { all: true }
   };
   ```
2. In component, check: `if (!canUserAccessFeature(user.membershipTier, 'appointments'))` → show CTA
3. At API level, validate tier before creating booking
4. Show "Upgrade" modal with pricing if restricted

---

## F.3: Patient Hospital Visit Request Workflow Incomplete

**Current Behavior:**
- Patient can fill form: select hospital, symptoms, preferred date
- Form submits to `POST /api/records/visit_requests`
- Creates record with `status: 'Pending'`
- No confirmation shown to patient
- Patient has no way to track request status
- Hospital never notified of request
- No automatic response/rejection
- Request shows only in hospital dashboard, patient doesn't see own requests

**Expected Behavior:**
- Patient submits visit request form
- Confirmation: "Request submitted. Expected response in 2-4 hours"
- Show request ID and booking reference number
- Patient dashboard shows "My Requests" tab with status tracking
- Hospital dashboard shows new request with CTA "Accept" / "Reject"
- Hospital can set appointment date/time when accepting
- When accepted, patient notified via email/SMS/app notification
- Patient receives acceptance with:
  - Appointment date/time
  - Bed number/ward
  - Doctor assigned
  - Required documents
  - Cancellation policy
- Patient can cancel with reason (auto-refund or credit)

**Affected Files:**
- [HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx) - Visit request form
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Should show request tracking
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - Should accept/reject requests

**Affected Database Entities:**
- `visit_requests` collection
- No notification/email system
- No status transition tracking

**Current Fields:** `patientId`, `hospitalId`, `status`, `requestId`, `symptoms`, `preferredDate`, `visitType`

**Missing Fields:** `responseDeadline`, `acceptedAt`, `rejectedAt`, `rejectionReason`, `appointmentDateTime`, `assignedDoctorId`, `assignedBedNumber`, `cancellationReason`

**Recommended Fix:**
1. Add missing fields to `visit_requests` schema
2. After `POST`, return request ID and confirmation message
3. Add "My Requests" tab to PatientDashboard listing all visit_requests for user
4. Add status indicators: Pending / Accepted / Rejected / Scheduled / Completed
5. Hospital workflow: Show requests in queue, click to accept (set date/doctor/bed), or reject
6. Implement notification system (see Section P)
7. Add automatic rejection if not responded in 24 hours (background job)

---

## F.4: Appointment Booking Missing Doctor Availability

**Current Behavior:**
- Appointment booking form shows "Select Doctor"
- Doctor data fetched from `/api/bootstrap` (all doctors, all slots hardcoded)
- Hardcoded `availableSlots` never updated from database
- Same 4 slots shown regardless of actual availability
- Booking creates appointment with `status: 'Pending'`, no confirmation
- No doctor confirmation workflow
- Doctor never notified of appointment request
- Patient doesn't receive appointment confirmation email/SMS
- No reschedule/cancel functionality in UI

**Expected Behavior:**
- Book appointment form shows:
  1. Doctor selection with filters (speciality, hospital, rating)
  2. Real-time availability from database:
     - Today's slots
     - Next 7 days' slots
     - Shows "Booked" vs "Available"
  3. Time slot selection (not multiple per day)
  4. After booking, confirmation with:
     - Appointment ID
     - QR code for check-in
     - Doctor name/room number
     - Cancellation policy
     - Email/SMS sent to patient and doctor
- Doctor receives appointment notification
- Doctor can view/reschedule/cancel in dashboard
- Patient can reschedule 24 hours before appointment
- Automatic reminder: 24 hours before, 1 hour before

**Affected Files:**
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Static availability
- [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) - No appointment confirmation
- Database: `appointments` collection, `doctors.availableSlots` (static)

**Affected Database Entities:**
- `appointments` needs: `slotTime`, `status: 'Requested'|'Confirmed'|'Completed'|'Cancelled'`, `confirmationCode`, `qrCode`
- `doctors.availableSlots` needs real-time updates
- Need `appointment_slots` table to track per-slot bookings

**Recommended Fix:**
1. Create `appointment_slots` table (doctor_id, slot_datetime, status, bookingId)
2. Update availability logic to check `appointment_slots` table
3. Appointment POST checks `appointment_slots.status = 'available'`, marks as 'booked'
4. Add `confirmationCode` generation (unique per appointment)
5. Generate QR code from appointment ID
6. Send confirmation email to patient and doctor
7. Add reschedule endpoint: `PATCH /api/appointments/:id/reschedule`
8. Implement automatic SMS reminders (24hr, 1hr before)

---

# G. Hospital Workflows

## G.1: Hospital Dashboard Shows No Real Data Integration

**Current Behavior:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) shows:
  - Hardcoded "Total Patients: 1250", "Appointments Today: 8"
  - Charts with fake data (not fetched from DB)
  - Doctor list from mockData: `PARTNER_HOSPITALS[0].seniorDoctors`
  - Visit requests from mockData: `INITIAL_HOSPITAL_VISIT_REQUESTS`
  - No real API calls to fetch hospital-specific data
  - Edit hospital info button exists but not connected to backend

**Expected Behavior:**
- Dashboard fetches real data:
  - `GET /api/records/hospitals/:id` → hospital info
  - `GET /api/records/visit_requests?hospitalId=HOSP1` → visit requests for this hospital
  - Query `appointments` where `hospitalId=HOSP1` → today's appointments
  - Query `doctors` where `hospitalId=HOSP1` → doctor list
  - Query `hospital_beds` where `hospitalId=HOSP1` → bed occupancy
- Real-time updates via SSE for new requests
- Charts calculate from actual data (not hardcoded)
- Edit hospital button updates database
- Show metrics:
  - Occupancy rate (beds)
  - Appointment confirmation rate (% accepted within 2 hours)
  - Patient satisfaction (if reviews exist)
  - Revenue (if payments tracked)

**Affected Files:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - uses mockData, hardcoded values
- No real API integration visible
- Data mocked from [seed.js](server/seed.js): HOSPITALS array

**Recommended Fix:**
1. Update component to use `useLiveData()` context
2. Fetch hospital data on mount: `const hospital = collections.hospitals.find(h => h.id === hospitalId)`
3. Calculate metrics from collections:
   - Visit requests count: `collections.visit_requests.filter(v => v.hospitalId === hospitalId)`
   - Today's appointments: `collections.appointments.filter(a => a.hospitalId === hospitalId && isToday(a.date))`
   - Occupancy: `occupiedBeds / totalBeds`
4. Wire up Edit button to `PATCH /api/records/hospitals/:id`
5. Subscribe to SSE events for new visit requests
6. Replace hardcoded charts with Chart.js/Recharts using real data

---

## G.2: No Bulk Doctor Registration or CSV Import

**Current Behavior:**
- Hospital must add doctors one-by-one via registration form
- No bulk import capability
- No CSV upload
- For hospital with 50 doctors, requires 50 individual registrations
- No batch operations API

**Expected Behavior:**
- Hospital admin can:
  - Upload CSV with doctor list
  - CSV columns: Name, Qualification, Speciality, Fee, Available Hours
  - System validates and imports all doctors
  - Bulk assign to hospital with one operation
  - Bulk update availability/fees
  - Bulk set on-leave dates

**Affected Files:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - No import UI
- No file upload/import endpoint

**Recommended Fix:**
1. Add "Import Doctors" button to hospital dashboard
2. Create file upload handler (see Section N)
3. Parse CSV and validate:
   - Required fields: name, speciality
   - Validate speciality against SPECIALITIES list
   - Validate fee is number > 0
4. Batch create doctors with hospital assignment
5. Show import summary: "Imported 45 of 50 doctors, 5 errors"
6. Create bulk operations API endpoint

---

## G.3: Hospital Response to Visit Requests Not Implemented

**Current Behavior:**
- Hospital dashboard shows visit requests list
- No "Accept" or "Reject" buttons visible
- No way to set appointment date when accepting
- No way to assign doctor to visit request
- No way to assign bed number
- Patient has no way to know if request was accepted

**Expected Behavior:**
- Hospital clicks visit request → details view opens
- CTA buttons: "Accept" / "Reject" 
- If Accept:
  - Modal opens to set:
    - Appointment date/time (next 7 days)
    - Doctor to assign (doctor selector)
    - Ward/bed number (autocomplete from available)
    - Special notes/requirements
  - Confirmation email sent to patient with appointment details
  - Patient receives notification in app
- If Reject:
  - Modal asks for rejection reason
  - Auto-response email sent to patient
  - Can suggest alternative hospital

**Affected Files:**
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - Visit requests section
- No API for acceptance workflow

**Affected Database Entities:**
- `visit_requests.status` needs transition: "Pending" → "Accepted" | "Rejected"
- `visit_requests.acceptedAt`, `rejecttedAt`, `rejectionReason`, `assignedDoctorId`, `appointmentDateTime`

**Recommended Fix:**
1. Add PATCH endpoint: `/api/records/visit_requests/:id/accept`
   - Body: { appointmentDateTime, doctorId, bedNumber, notes }
   - Updates record status, sets fields
   - Sends notification to patient
2. Add PATCH endpoint: `/api/records/visit_requests/:id/reject`
   - Body: { reason }
   - Updates status, reason
   - Sends notification to patient
3. Add "Accept" / "Reject" buttons in UI
4. Modal form for acceptance details
5. Send confirmation email/SMS to patient

---

# H. Doctor Workflows

## H.1: Doctor Dashboard Shows No Real Patient Data

**Current Behavior:**
- [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) displays:
  - Hardcoded "Total Consultations: 1,250"
  - Fake appointment list (not from DB)
  - Static patient list (mocked)
  - No real data integration
  - Edit profile button exists but not connected
  - "Mark as on-leave" feature exists but non-functional

**Expected Behavior:**
- Dashboard shows real data:
  - `GET /api/records/appointments?doctorId=DOC1` → appointments for this doctor
  - Today's appointment schedule (not generic)
  - Patient consultation history (previous appointments)
  - Prescription history (prescriptions created by this doctor)
  - Patient feedback/ratings on consultations
- Real-time notifications when new appointment booked
- One-click actions:
  - View appointment details
  - Mark appointment as completed
  - Create prescription
  - Upload medical report
  - Reschedule appointment

**Affected Files:**
- [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) - Hardcoded/mocked data
- No real API integration for appointments, prescriptions, patients
- Hardcoded appointments in render

**Recommended Fix:**
1. On component mount, fetch doctor data: `GET /api/records/doctors/:doctorId`
2. Fetch today's appointments: `GET /api/records/appointments?doctorId=doctorId&date=today`
3. Fetch all appointments: `GET /api/records/appointments?doctorId=doctorId`
4. Render real data instead of hardcoded
5. Add appointment detail modal with:
   - Patient info
   - Medical history
   - CTA: "Mark Completed" / "Create Prescription" / "Upload Report"
6. Subscribe to SSE for new appointment notifications

---

## H.2: Doctor Registration Verification Missing

**Current Behavior:**
- Doctor registration creates account immediately with status "Active"
- No document verification
- No council registration validation
- No background check
- Any "Dr. " name is accepted
- Can start consulting immediately
- No restrictions on specialities claimed

**Expected Behavior:**
- Doctor registration requires:
  - Medical degree certificate upload
  - Medical council registration certificate
  - Council registration number + verification against council database
  - Proof of specialization (if any)
  - Photo ID (passport/Aadhar)
  - Professional liability insurance
- Status workflow: PENDING_VERIFICATION → VERIFIED | REJECTED
- Admin dashboard shows pending doctor verifications
- Can request document re-upload if rejected
- Verification email sent when approved
- Doctor appears in search only when VERIFIED
- Annual re-verification required

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - Doctor registration form
- [server/index.js](server/index.js) - Doctor creation (line ~160-175)
- No verification workflow

**Recommended Fix:**
1. Add document upload fields to doctor registration
2. Set initial status: "PENDING_VERIFICATION"
3. Create verification request in backend
4. Create admin dashboard page: "Verify Doctors"
5. Add document viewer and approve/reject buttons
6. Implement council registration validation API call
7. Send verification email when approved
8. Hide unverified doctors from search results

---

## H.3: No Prescription Management System

**Current Behavior:**
- `prescriptions` collection defined in schema
- No prescription creation UI in doctor dashboard
- No prescription storage/retrieval
- No patient prescription history
- No medication tracking
- No refill reminders

**Expected Behavior:**
- Doctor can create prescription after consultation:
  - Medicine name, dosage, frequency, duration
  - Quantity
  - Refill instructions
  - Precautions/notes
  - Save button
- Prescription stored in database with:
  - `id`, `doctorId`, `patientId`, `date`
  - Medicines array: `[{ name, dosage, frequency, duration }, ...]`
  - Digital signature/verification
- Patient can:
  - View all prescriptions
  - Download as PDF
  - Share with pharmacy
  - Get refill reminders
  - Medication adherence tracking (did I take it today?)
- Pharmacy can view prescription (with expiry check)

**Affected Files:**
- [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) - No prescription UI
- `prescriptions` collection unused
- No prescription schema defined

**Affected Database Entities:**
- `prescriptions` collection needs schema:
  ```json
  {
    "id": "RX-12345",
    "doctorId": "DOC1",
    "patientId": "AVP1",
    "createdAt": "2026-09-09T10:30:00Z",
    "expiresAt": "2026-12-09T10:30:00Z",
    "medicines": [
      {
        "name": "Paracetamol",
        "dosage": "500mg",
        "frequency": "3 times daily",
        "duration": "7 days",
        "quantity": 21
      }
    ],
    "notes": "Take after food",
    "status": "active|used|expired"
  }
  ```

**Recommended Fix:**
1. Create prescription form in doctor dashboard
2. Form fields: Medicine, Dosage, Frequency, Duration, Quantity, Notes
3. POST /api/records/prescriptions endpoint
4. Add patient prescription viewer in patient dashboard
5. Implement PDF generation and download
6. Add prescription expiry validation (typically 1-3 months)
7. Patient notification when new prescription available

---

## H.4: No Report/Test Result Upload

**Current Behavior:**
- No way for doctor to upload medical reports or lab results
- No report storage system
- Patient has no view of medical records
- No patient-doctor file sharing
- No audit trail of documents

**Expected Behavior:**
- Doctor can upload after appointment:
  - Medical report (text or file)
  - Prescription (as seen above)
  - Test result attachments (PDF, images)
  - Follow-up instructions
- Files stored with:
  - Upload date, doctor ID, patient ID
  - File type/MIME
  - Encryption at rest
  - Access log (who viewed when)
- Patient can:
  - View all reports/results
  - Download files
  - Share with specialists
  - Get notifications when report available
- Secure: Only patient + doctor can access (not public)

**Affected Files:**
- [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) - No upload UI
- `health_records` collection unused
- No file storage system

**Recommended Fix:**
1. Implement file upload handler (see Section N)
2. Add report upload form to doctor dashboard
3. Create health_records endpoint to store metadata
4. Add patient health records view in patient dashboard
5. Implement access control for file downloads
6. Add encryption for sensitive files
7. Implement audit log (who accessed when)

---

# I. Admin Workflows

## I.1: No Comprehensive Admin Dashboard

**Current Behavior:**
- [SuperAdminDashboard.tsx](src/components/SuperAdminDashboard.tsx) exists but:
  - Shows hardcoded statistics
  - No real data integration
  - Limited functionality
  - No user management UI visible
  - No doctor/hospital verification
  - No lead management
  - No approval workflows
  - Admin can only create users via API, not UI

**Expected Behavior:**
- Admin dashboard has tabs:
  1. **Overview:** Real metrics
     - Total users by role
     - Active memberships
     - Revenue (if tracked)
     - System health (DB, API status)
  2. **User Management**
     - List all users (with pagination/search)
     - Create user (form, not API only)
     - Edit user (name, role, permissions)
     - Disable/suspend user
     - Delete user with confirmation
     - View login history
  3. **Doctor Verification**
     - List pending doctor approvals
     - View documents
     - Approve / Reject / Request More Info
     - View verified doctors
     - Suspend/remove doctor
  4. **Hospital Verification**
     - List pending hospital partners
     - View registration documents
     - Approve / Reject
     - Manage hospital plans
     - Update hospital info (beds, facilities)
  5. **Lead Management**
     - View all marketing leads
     - Assign to marketing staff
     - Track conversion (lead → appointment → patient)
     - View conversion funnel
  6. **Appointments & Requests**
     - View all visit requests
     - View all appointments
     - Manually resolve conflicts
     - View cancellation reasons
  7. **Reports & Analytics**
     - Dashboard metrics (queries per day, errors, etc.)
     - Doctor performance (consultations, ratings)
     - Hospital performance (occupancy, appointment rate)
     - Patient satisfaction
     - Revenue reports (if payments tracked)
  8. **Settings**
     - System configuration
     - Email/SMS templates
     - Plan management (edit membership plans)
     - Feature toggles

**Affected Files:**
- [SuperAdminDashboard.tsx](src/components/SuperAdminDashboard.tsx) - Very limited
- Backend: Only `/api/users` endpoint partially implemented

**Recommended Fix:**
1. Expand SuperAdminDashboard with multiple tabs
2. Create sub-components for each section:
   - UserManagementPanel
   - DoctorVerificationPanel
   - HospitalVerificationPanel
   - LeadManagementPanel
   - ReportsPanel
3. Implement admin endpoints for each panel
4. Add pagination/search to all list views
5. Implement bulk operations (bulk approve, bulk email, etc.)
6. Add audit logging for admin actions

---

## I.2: No Doctor/Hospital Verification Workflow

**Current Behavior:**
- Doctors and hospitals auto-approved on registration
- No admin review process
- No document verification
- No rejection mechanism
- No re-submission workflow

**Expected Behavior:**
- Admin sees "Pending Verifications" section
- For each doctor/hospital:
  - View submitted documents
  - Verify credentials against council/authority databases
  - Add comments
  - Approve / Reject / Request More Info
  - Set verification date and approver name
  - Send notification email
- Doctor/hospital can respond to rejection with new docs
- Approval adds green checkmark to profile
- Unverified doctors/hospitals hidden from public search

**Affected Files:**
- [SuperAdminDashboard.tsx](src/components/SuperAdminDashboard.tsx) - No verification section

**Affected Database Entities:**
- `doctors.status`, `doctors.verifiedAt`, `doctors.verifiedBy`
- `hospitals.status`, `hospitals.verifiedAt`
- Need audit trail table

**Recommended Fix:**
1. Create verification endpoints:
   - `PATCH /api/doctors/:id/approve`
   - `PATCH /api/doctors/:id/reject` with reason
   - `PATCH /api/hospitals/:id/approve`
   - `PATCH /api/hospitals/:id/reject` with reason
2. Create VerificationPanel component in admin dashboard
3. Implement document viewer for uploaded files
4. Add comment/note field
5. Send approval/rejection emails with details
6. Track verifiedAt and verifiedBy fields

---

# J. API/Backend

## J.1: No Input Validation

**Current Behavior:**
- No server-side validation of request payloads
- Email not validated format
- Phone not validated (could be text like "abc123")
- Password not checked for complexity
- Fields can be empty strings or null
- Names can contain XSS payloads
- Numeric fields can be strings
- Arrays can be objects

**Expected Behavior:**
- Email: Must be valid email format (RFC 5322)
- Phone: Must be 10-digit Indian number (or configurable)
- Password: Minimum 8 chars, at least 1 uppercase, 1 number, 1 symbol
- Names: Only letters, spaces, hyphens (no numbers, no HTML)
- Age: Must be number 18-120
- Bed count: Must be positive integer
- Arrays: Validate each element
- Required fields: Cannot be empty

**Affected Endpoints:**
- `POST /api/auth/register` - [server/index.js](server/index.js) line ~137
- `POST /api/auth/login` - line ~107
- `PATCH /api/auth/me` - line ~194
- `POST /api/records/:collection` - line ~270
- `PATCH /api/records/:collection/:id` - line ~470

**Recommended Fix:**
1. Install validation library (joi, yup, zod)
2. Create schemas for each collection
3. Validate all inputs before database operation
4. Return 400 Bad Request with error details if invalid
5. Log validation errors for debugging
6. Add request size limit (to prevent DoS)

Example with joi:
```javascript
const schema = joi.object({
  email: joi.string().email().required(),
  phone: joi.string().regex(/^\d{10}$/).required(),
  password: joi.string().min(8).pattern(/[A-Z]/).pattern(/[0-9]/).required(),
});
const { error, value } = schema.validate(req.body);
if (error) return res.status(400).json({ error: error.details[0].message });
```

---

## J.2: No Pagination on List Endpoints

**Current Behavior:**
- `GET /api/users` returns ALL users (could be thousands)
- `GET /api/records/:collection` returns all records
- No `limit`, `offset`, or `page` parameters
- No `total` count in response
- No sorting options
- Frontend receives huge JSON payload
- Memory issues if many records

**Expected Behavior:**
- All list endpoints support:
  - `?page=1&limit=20` → offset-based pagination
  - `?offset=0&limit=20` → cursor-based pagination
  - `?sort=name&order=asc` → sorting
- Response includes: `{ items: [...], total: 1250, page: 1, limit: 20, pages: 63 }`
- Default limit: 20 items per page
- Maximum limit: 100 items per page (to prevent abuse)
- Frontend shows pagination controls

**Affected Endpoints:**
- `GET /api/users` - [server/index.js](server/index.js) line ~232
- `GET /api/records/:collection` - line ~275
- `GET /api/records/hospitals`, `/api/records/doctors` etc.

**Current Pagination:** None detected (comments in code: "page, limit")

**Recommended Fix:**
1. Update `db.list()` to accept limit and offset
2. Add LIMIT and OFFSET to SQL queries (or array slicing for JSON)
3. Update all GET endpoints to handle query params
4. Return pagination metadata in response
5. Frontend: Add pagination controls (First, Prev, Page #, Next, Last)
6. Cache total counts (recalculate on modification)

---

## J.3: No Sorting or Filtering

**Current Behavior:**
- Records returned in insertion order
- No way to sort by name, date, rating, etc.
- Filtering works minimally (exact match only, not case-insensitive)
- No multi-field filtering
- No range queries (date between, price range, etc.)
- Frontend sorts in-memory (inefficient for large datasets)

**Expected Behavior:**
- Sort options:
  - `?sort=name&order=asc|desc`
  - `?sort=rating&order=desc` (for doctors, hospitals)
  - `?sort=date&order=newest|oldest` (for appointments, requests)
  - Default: sort by `createdAt` descending
- Filter options:
  - `?role=doctor&status=active` (multiple filters)
  - `?district=Warangal&speciality=Cardiology` (for doctors)
  - `?status=pending&createdAfter=2026-09-01` (date range)
  - `?rating_min=4.0` (range queries)
  - `?search=smith` (full-text search on name/description)

**Affected Endpoints:**
- `/api/records/:collection` - needs comprehensive filtering
- `/api/users` - needs sorting/filtering
- Doctor search: needs district, speciality, rating filters
- Hospital search: needs district, speciality, availability filters

**Recommended Fix:**
1. Update `db.list(filter)` to support:
   - Sorting: `sort: 'name', order: 'asc'`
   - Range: `fieldName_min`, `fieldName_max`, `dateAfter`, `dateBefore`
   - Multi-field: Multiple filter params
   - Search: `q` parameter for text search
2. Build SQL WHERE clauses dynamically based on filters
3. Add indexes for commonly-filtered fields
4. Frontend: Add filter UI component (Select, Slider, Date Range picker)
5. Show "No results matching filters" if empty

---

## J.4: Missing Error Handling and Logging

**Current Behavior:**
- Generic error messages ("Login failed.", "Registration failed.")
- No error codes or details
- Server errors logged to console only
- No log file or centralized logging
- Failed API calls not tracked
- No alerting on repeated errors
- Client receives same error for different server problems

**Expected Behavior:**
- Specific error codes: `E001_INVALID_EMAIL`, `E002_USER_EXISTS`, `E003_WRONG_PASSWORD`
- Error messages: "No account found for email: user@example.com"
- All errors logged to:
  - Console (development)
  - File (production): `/var/log/app.log`
  - Monitoring service (Sentry, DataDog, etc.)
- Errors include context: user ID, endpoint, request ID
- High-frequency errors trigger alerts (rate spike)
- Dashboard shows error rate over time
- Server 5xx errors return unique ID for user to report ("Error ID: XYZ123")

**Affected Files:**
- [server/index.js](server/index.js) - All error handlers (lines ~107, ~137, etc.)
- No logging infrastructure

**Recommended Fix:**
1. Create logger utility (winston, pino)
2. Configure file transport for production
3. Add request ID middleware (uuid per request)
4. Log all errors with context:
   ```javascript
   logger.error('Login failed', {
     requestId: req.id,
     userId: req.user?.id,
     email: req.body.email,
     error: err.message,
   });
   ```
5. Return structured error responses:
   ```json
   {
     "error": "No account found for email",
     "code": "E002_USER_NOT_FOUND",
     "errorId": "req-123-xyz"
   }
   ```
6. Connect to error tracking service (Sentry)

---

## J.5: No Real-Time Update Invalidation

**Current Behavior:**
- SSE broadcasts (in [server/index.js](server/index.js)) but no subscription/filtering
- ALL clients receive ALL updates
- Frontend polls for data instead of using SSE
- No way to know when specific data changed
- Real-time data might be stale

**Expected Behavior:**
- SSE events include type and entity:
  ```json
  {
    "event": "record_updated",
    "collection": "appointments",
    "id": "APT123",
    "action": "created|updated|deleted",
    "data": { ... }
  }
  ```
- Client subscribes to specific collections
- Client updates cache when SSE event received
- No polling needed
- Real-time sync: If hospital accepts request, patient sees immediately
- Client-side cache invalidation: When data changes server-side, frontend updates

**Affected Files:**
- [server/index.js](server/index.js) - SSE broadcast function (line ~46-52)
- [LiveDataContext.tsx](src/context/LiveDataContext.tsx) - Data fetching/caching
- No SSE subscription in frontend

**Recommended Fix:**
1. Modify broadcast to include event metadata
2. Add `collection` and `action` to event payload
3. Frontend: Subscribe to SSE stream
4. Parse events and update local state:
   ```javascript
   eventSource.onmessage = (event) => {
     const { collection, id, action, data } = JSON.parse(event.data);
     if (collection === 'appointments') {
       updateAppointmentCache(id, data);
     }
   };
   ```
5. Show "Real-time" indicator when connected
6. Graceful fallback to polling if SSE disconnected

---

# K. Database

## K.1: No Referential Integrity Constraints

**Current Behavior:**
- Foreign keys stored as text (e.g., `patientId: 'AVP123'`, `hospitalId: 'HOSP1'`)
- No database constraints enforcing relationships exist
- Can create appointment for non-existent patient (DB accepts it)
- Can delete hospital while doctors/visits still reference it (orphaned records)
- Application code handles relationship manually (error-prone)
- Data inconsistency possible

**Expected Behavior:**
- Foreign key constraints defined in schema:
  ```sql
  ALTER TABLE appointments
  ADD CONSTRAINT fk_patient
  FOREIGN KEY (patientId) REFERENCES patients(id) ON DELETE CASCADE;

  ALTER TABLE visit_requests
  ADD CONSTRAINT fk_hospital
  FOREIGN KEY (hospitalId) REFERENCES hospitals(id) ON DELETE CASCADE;
  ```
- Database enforces:
  - Cannot create appointment for non-existent patient
  - Deleting patient cascades to appointments/prescriptions
  - Deleting hospital cascades to visit requests/bed records
- Application receives error if constraint violated, not silent failure

**Affected Files:**
- [server/db.js](server/db.js) - Schema definition (lines ~71-100)
- No FK constraints added in SCHEMA_STATEMENTS

**Affected Collections:**
- `appointments.patientId` → `patients.id`
- `appointments.doctorId` → `doctors.id`
- `visit_requests.patientId` → `patients.id`
- `visit_requests.hospitalId` → `hospitals.id`
- `doctors.hospitalId` → `hospitals.id`
- And many others

**Recommended Fix:**
1. Add FK constraints to PostgreSQL schema
2. Use ON DELETE CASCADE for dependent records
3. Add index on FK columns for performance
4. Test cascade deletes in development
5. For JSON storage fallback, add application-level validation
6. Implement foreign key validation before creating records

---

## K.2: Database Indexes Missing

**Current Behavior:**
- Only basic indexes created: email, phone, role
- No indexes on:
  - `patientId` (queries: get my appointments, prescriptions)
  - `doctorId` (queries: get my appointments)
  - `hospitalId` (queries: get hospital's visit requests)
  - `collectionname`, `status` (queries: filter by status)
  - `createdAt` (queries: sort by date)
- Queries do full table scans (slow with millions of records)

**Expected Behavior:**
- Index on all frequently-queried fields:
  ```sql
  CREATE INDEX idx_appointments_patientId ON appointments(patientId);
  CREATE INDEX idx_appointments_doctorId ON appointments(doctorId);
  CREATE INDEX idx_appointments_hospitalId ON appointments(hospitalId);
  CREATE INDEX idx_appointments_status ON appointments(status);
  CREATE INDEX idx_appointments_createdAt ON appointments(createdAt DESC);
  CREATE INDEX idx_visit_requests_status_createdAt ON visit_requests(status, createdAt DESC);
  ```
- Composite indexes for common queries:
  ```sql
  CREATE INDEX idx_appt_patient_status ON appointments(patientId, status);
  ```
- Query performance: <100ms even with 1M+ records
- EXPLAIN plan shows index usage (not seq scan)

**Affected Queries:**
- `SELECT * FROM appointments WHERE patientId = '...'` → should use index
- `SELECT * FROM appointments WHERE status = 'Pending'` → should use index
- `SELECT * FROM appointments WHERE patientId = '...' ORDER BY createdAt DESC` → should use composite index

**Recommended Fix:**
1. In SCHEMA_STATEMENTS, add indexes for each field used in WHERE/ORDER BY clauses
2. Identify N+1 query problems (backend fetching doctor for each appointment)
3. Use database indexes to optimize sort operations
4. Monitor query performance with EXPLAIN ANALYZE
5. Add indexes for any new frequently-queried fields

---

## K.3: No Database Transactions for Multi-Step Operations

**Current Behavior:**
- When accepting a visit request, multiple updates happen:
  1. Update visit_request status
  2. Create appointment record
  3. Update hospital bed availability
  4. Send notification
- If step 2 fails after step 1 succeeds, database is inconsistent
- No rollback mechanism
- Multi-step workflows can leave orphaned records

**Expected Behavior:**
- Wrapped in database transaction:
  ```javascript
  await db.transaction(async (trx) => {
    await trx('visit_requests').where('id', id).update({ status: 'Accepted' });
    await trx('appointments').insert({ visitId: id, ... });
    await trx('hospital_beds').where('id', bedId).update({ status: 'occupied' });
  });
  ```
- If any step fails, entire transaction rolled back
- Database consistent even on partial failure
- All-or-nothing semantics

**Affected Operations:**
- Accept visit request (visit_request + appointment + bed)
- Create membership (user + membership record + wallet init)
- Process refund (wallet txn + appointment cancellation)
- Doctor assignment (create assignment + notify + update hospital list)

**Recommended Fix:**
1. Use Knex.js or Sequelize transaction support
2. Wrap multi-step operations in `db.transaction()`
3. Test rollback scenarios
4. Add transaction logging (track transaction IDs)
5. Handle deadlocks and retries gracefully

---

## K.4: No Data Backup or Recovery Plan

**Current Behavior:**
- No automated database backups
- No disaster recovery procedure
- If database deleted, all data lost (patient records, appointments, etc.)
- No way to restore from point-in-time
- Local JSON file ([server/local-data.json](server/local-data.json)) is only backup
- No encryption for sensitive data

**Expected Behavior:**
- Automated daily backups
- Backups encrypted at rest
- Backups stored off-site (AWS S3, Google Cloud Storage)
- Point-in-time recovery available (last 30 days)
- Recovery procedure tested monthly
- Encryption of sensitive fields:
  - `users.password_hash` (already hashed)
  - Patient medical history
  - Insurance data
  - Financial records
- Data retention policy:
  - Active records: indefinite
  - Deleted records: 90-day recovery window
  - Backups: 7-year retention (for compliance)

**Recommended Fix:**
1. Set up automated PostgreSQL backups:
   - Hourly: WAL archiving
   - Daily: Full backup to S3
2. Encrypt backups with KMS
3. Document recovery procedure
4. Set up monitoring for backup failures
5. Test recovery quarterly
6. Implement field-level encryption for sensitive data

---

# L. Routing/Navigation

## L.1: No URL-Based Routing (localStorage-Only)

**Current Behavior:**
- All routing stored in localStorage, not browser URL
- State persisted: `localStorage['ayudh_activeTab']`, `localStorage['ayudh_isLoginView']`
- Visiting app URL `/` always lands on home, regardless of user role
- After login, URL still shows `/` (no `/patient-dashboard` or `/doctor-dashboard`)
- Cannot share direct link to patient's appointments dashboard
- Deep-linking doesn't work: bookmark `/hospital/visit-requests` and it's lost
- Browser back/forward don't work correctly
- Cannot send email link: "View your appointment: https://app.ayudh.com/appointments/APT123"
- Refresh loses page state (user routed back to home)

**Expected Behavior:**
- URL-based routing with React Router:
  - `/` → Home/Landing
  - `/login` → Login page
  - `/register` → Registration page
  - `/patient/dashboard` → Patient dashboard (patient only)
  - `/patient/appointments` → Patient appointments
  - `/patient/appointments/:id` → Appointment detail
  - `/doctor/dashboard` → Doctor dashboard (doctor only)
  - `/doctor/appointments` → Doctor's appointments
  - `/hospital/dashboard` → Hospital dashboard (hospital only)
  - `/hospital/requests` → Visit requests
  - `/admin/users` → Admin user management
  - `/book-appointment` → Book appointment page
  - `/search-hospitals` → Search hospitals
- Direct URL access routes to correct page
- Refresh preserves page/state
- Browser back/forward work correctly
- Can email shareable links
- Deep linking works: `/appointments/:id` shows that specific appointment
- Browser history clear (can navigate up)

**Affected Files:**
- [App.tsx](src/App.tsx) - Has routing logic but uses localStorage state, not React Router
- Navigation in [TopBar.tsx](src/components/TopBar.tsx), [Navbar.tsx](src/components/Navbar.tsx)
- Component rendering based on `activeTab`, `isLoginView` state, not URL

**Current Code Pattern:**
```typescript
const [activeTab, setActiveTab] = useState(() => getSavedState('ayudh_activeTab', 'home'));
// ...
if (isLoginView) return <LoginPage />;
if (isPartnerView) return <PartnerWithUsPage />;
// ... no URL bar involved
```

**Recommended Fix:**
1. Install React Router: `npm install react-router-dom`
2. Wrap App with `<BrowserRouter>`
3. Create route definitions:
   ```typescript
   <Routes>
     <Route path="/" element={<HomePage />} />
     <Route path="/login" element={<LoginPage />} />
     <Route path="/patient/dashboard" element={<PatientDashboard />} />
     <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
     {/* ... */}
   </Routes>
   ```
4. Update navigation: `useNavigate()` to `navigate('/patient/dashboard')`
5. Update component links to use `<Link>`
6. Persist current route in localStorage (for SSR if needed later)
7. Test: Refresh page, back/forward, share URL, bookmark

---

## L.2: Missing Dashboard Routes Based on Role

**Current Behavior:**
- After login, no automatic redirect to role-specific dashboard
- User stays on landing page showing "Home" tab
- Must manually click dashboard link from navbar
- Different roles all routed to same page initially
- No role-based route protection

**Expected Behavior:**
- After successful login, automatic redirect:
  - Patient role → `/patient/dashboard`
  - Doctor role → `/doctor/dashboard`
  - Hospital role → `/hospital/dashboard`
  - Admin role → `/admin/dashboard`
  - Marketing role → `/marketing/dashboard`
  - Community role → `/community/dashboard`
- Route protection: If user tries `/doctor/dashboard` without doctor role → redirected to login
- Route guard component checks `user.role` and renders appropriate page
- Non-existent roles fallback to home page

**Affected Files:**
- [App.tsx](src/App.tsx) - No role-based redirection after login
- [AuthContext.tsx](src/context/AuthContext.tsx) - Has user.role but doesn't drive routing

**Current Code:** After login, component renders but doesn't navigate

**Recommended Fix:**
1. Create PrivateRoute component (checks auth + role):
   ```typescript
   function PrivateRoute({ children, requiredRole }) {
     const { user, isLoggedIn } = useAuth();
     if (!isLoggedIn) return <Navigate to="/login" />;
     if (requiredRole && user?.role !== requiredRole) return <Navigate to="/" />;
     return children;
   }
   ```
2. After login succeeds, redirect based on role:
   ```typescript
   const roleRoutes = {
     patient: '/patient/dashboard',
     doctor: '/doctor/dashboard',
     // ... etc
   };
   navigate(roleRoutes[user.role] || '/');
   ```
3. Wrap role-specific routes with PrivateRoute
4. Test: Try accessing `/doctor/dashboard` as patient → should redirect

---

## L.3: Missing Key Resource Pages

**Current Behavior:**
- No dedicated page URLs for:
  - Specific appointment details
  - Specific hospital details (from search, not just list)
  - Specific doctor profile
  - Patient's prescription list
  - Health records/documents
  - Membership details/billing history
- Can only view these by navigating UI, not via direct URL

**Expected Behavior:**
- Dedicated pages for each resource:
  - `/appointments/:appointmentId` → Appointment detail (date, doctor, status, notes, reschedule/cancel buttons)
  - `/hospitals/:hospitalId` → Hospital profile (doctors, beds, specialities, reviews, address, contact)
  - `/doctors/:doctorId` → Doctor profile (qualifications, experience, ratings, availability, book button)
  - `/patient/prescriptions` → List of all prescriptions
  - `/patient/prescriptions/:prescriptionId` → Single prescription detail (download PDF, share)
  - `/patient/health-records` → All medical records uploaded
  - `/patient/membership` → Membership details, renewal date, benefits, upgrade options
  - `/patient/billing` → Invoice history, wallet transactions
- Shareable links: Can email link to appointment/doctor/hospital
- Public vs Private:
  - `/doctors/:id` can be public (view ratings, bio, book)
  - `/patient/appointments/:id` is private (only that patient can view)

**Affected Files:**
- Multiple pages need dedicated routes
- No individual detail page components

**Recommended Fix:**
1. Create detail page components for each resource
2. Add to routing:
   ```typescript
   <Route path="/appointments/:id" element={<AppointmentDetail />} />
   <Route path="/hospitals/:id" element={<HospitalDetail />} />
   <Route path="/doctors/:id" element={<DoctorDetail />} />
   ```
3. Fetch resource by ID from URL params
4. Implement access control: verify user can view this resource
5. Add meta tags for sharing (Open Graph)

---

# M. Loading/Error/Empty States

## M.1: No Loading States on Data Fetches

**Current Behavior:**
- Components fetch data (e.g., `GET /api/bootstrap`) but don't show loading UI
- User sees blank screen or stale data while loading
- No indication data is being fetched
- No loading skeleton/spinner
- Takes 2-5 seconds to load data with no feedback
- User thinks app is broken if nothing appears for 3 seconds

**Expected Behavior:**
- Show loading state while fetching:
  - Spinner or skeleton loaders
  - "Loading doctors..." text
  - Placeholder cards/boxes
  - Progress bar for multi-step loads
- Once data arrives, replace loading UI with actual content
- If load takes >3 seconds, show "This is taking longer than usual" message
- If load fails, show error message (not blank screen)
- Abort pending requests when user navigates away

**Affected Components:**
- [PatientDashboard.tsx](src/components/PatientDashboard.tsx) - Fetches appointments, requests, etc.
- [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) - Fetches visit requests, doctor list
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Fetches doctors, hospital list
- [PartnerHospitalsPage.tsx](src/components/PartnerHospitalsPage.tsx) - Fetches hospitals
- [HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx) - Fetches hospitals

**Current Pattern:** No loading state tracked

**Recommended Fix:**
1. Add loading state to component:
   ```typescript
   const [loading, setLoading] = useState(true);
   const [data, setData] = useState(null);
   
   useEffect(() => {
     fetchData().then(data => {
       setData(data);
       setLoading(false);
     });
   }, []);
   
   if (loading) return <LoadingSkeleton />;
   return <Content data={data} />;
   ```
2. Create LoadingSkeleton component (matches layout of actual content)
3. Add timeout: if loading >3 seconds, show extra message
4. Abort fetch on component unmount:
   ```typescript
   const controller = new AbortController();
   fetch(url, { signal: controller.signal });
   return () => controller.abort();
   ```

---

## M.2: No Error State Handling

**Current Behavior:**
- If API call fails, error logged to console only
- User sees nothing or blank screen
- No error message shown
- No retry button
- Component might crash if data expected but missing

**Expected Behavior:**
- Catch errors and show user-friendly message:
  - "Failed to load appointments. Please try again."
  - "No internet connection. Check your connection and reload."
  - "Server error. Please try again later or contact support."
- Provide retry button: "Retry Loading"
- Specific errors for specific problems:
  - 401 → "Session expired. Please log in again."
  - 404 → "Appointment not found."
  - 5xx → "Server error. Please try again in a few minutes."
- Error is visible, not in console only

**Affected Components:**
- All components that fetch data (see M.1 list)

**Current Pattern:** Try/catch exists but errors not handled:
```typescript
try {
  const res = await api.bootstrap();
} catch (err) {
  console.error(err); // No UI feedback
}
```

**Recommended Fix:**
1. Add error state:
   ```typescript
   const [error, setError] = useState(null);
   
   try {
     const data = await fetchData();
     setData(data);
   } catch (err) {
     setError(err.message);
   }
   
   if (error) return <ErrorMessage error={error} onRetry={handleRetry} />;
   ```
2. Create ErrorMessage component
3. Add retry logic:
   ```typescript
   const handleRetry = () => {
     setError(null);
     setLoading(true);
     fetchData().then(...).catch(...);
   };
   ```
4. Map specific error codes to user messages
5. Show support contact info in error message

---

## M.3: No Empty State Messages

**Current Behavior:**
- If list is empty (no appointments, no visit requests, no doctors), page shows:
  - Blank space
  - Empty array render bug (line count wrong)
  - Confusing UI (button to add but no instruction)
- User unsure if:
  - Data loading?
  - No data exists?
  - Filter too restrictive?
  - Feature not available?

**Expected Behavior:**
- When list empty, show helpful message:
  - "No appointments yet" → "Book your first appointment with a doctor"
  - "No visit requests" → "Patients can request visits using the hospital search"
  - "No doctors" → "Add doctors to your hospital to start accepting appointments"
- Include CTA button:
  - "Book Now" for patients
  - "Add Doctor" for hospitals
- Illustration/icon to make it less stark
- Message should be in center of page (not corner)

**Affected Components:**
- PatientDashboard (appointments list)
- HospitalDashboard (visit requests list, doctor list)
- MarketingDashboard (leads list)
- DoctorDashboard (appointments list, patients list)

**Current Pattern:** Conditional rendering but no empty state:
```typescript
{appointments.length > 0 ? (
  appointments.map(a => <AppointmentCard key={a.id} {...a} />)
) : null} {/* blank screen */}
```

**Recommended Fix:**
1. Create EmptyState component:
   ```typescript
   <EmptyState
     icon={<Calendar />}
     title="No Appointments"
     message="Schedule your first consultation"
     action={{ label: "Book Now", onClick: handleBook }}
   />
   ```
2. Use in all list renders:
   ```typescript
   {appointments.length > 0 ? (
     appointments.map(...)
   ) : (
     <EmptyState title="No Appointments" ... />
   )}
   ```

---

## M.4: No Error Boundaries for Crash Prevention

**Current Behavior:**
- If any component throws an error (missing data, type mismatch), entire page crashes
- White screen of death
- No error recovery
- User must refresh page
- Error not tracked

**Expected Behavior:**
- Error boundary component catches errors
- Shows crash page with:
  - "Something went wrong" message
  - Stack trace (development only)
  - "Go Home" button
  - Error ID for support reference
- Page doesn't crash, only component fails gracefully
- Error sent to error tracking service
- Rest of page still works

**Recommended Fix:**
1. Create ErrorBoundary component:
   ```typescript
   class ErrorBoundary extends React.Component {
     componentDidCatch(error, info) {
       logError(error, info);
       this.setState({ hasError: true });
     }
     render() {
       if (this.state.hasError) {
         return <CrashPage error={this.state.error} />;
       }
       return this.props.children;
     }
   }
   ```
2. Wrap high-level components:
   ```typescript
   <ErrorBoundary>
     <PatientDashboard />
   </ErrorBoundary>
   ```
3. Send errors to Sentry/Rollbar for monitoring

---

# N. File/Document Handling

## N.1: No File Upload System

**Current Behavior:**
- Doctor registration form has fields like "qualifications" but:
  - No file input fields
  - Cannot upload degree certificate
  - Cannot upload license
  - Qualifications stored as text only ("MBBS")
- Hospital registration has no document upload
- Patient cannot upload prescriptions or medical records
- No file storage (S3, GCS, local disk)
- No file download functionality

**Expected Behavior:**
- File upload forms for:
  - Doctor: Medical degree, license, registration certificate
  - Hospital: Registration document, tax ID
  - Patient: Medical records, existing prescriptions (on-board)
- Upload to secure storage (AWS S3, Google Cloud Storage, or local disk)
- Files encrypted
- File URL stored in database
- Download/view capability with access control
- File type validation (PDF, JPG, PNG only)
- File size limits (5MB per file, 20MB total)
- Scan for viruses before storing

**Affected Files:**
- [RegistrationModal.tsx](src/components/RegistrationModal.tsx) - No file inputs
- No file upload API endpoint
- No file storage configured

**Recommended Fix:**
1. Install file upload library (multer for Express)
2. Create file upload endpoint:
   ```javascript
   app.post('/api/files/upload', authRequired, upload.single('file'), (req, res) => {
     const fileUrl = `https://s3.amazonaws.com/bucket/${req.file.key}`;
     res.json({ url: fileUrl });
   });
   ```
3. Configure storage backend (AWS S3):
   ```javascript
   const s3 = new AWS.S3();
   const upload = multer({ storage: multerS3({ s3, bucket: 'ayudh-files' }) });
   ```
4. Add file input to forms:
   ```tsx
   <input type="file" accept=".pdf,.jpg,.png" onChange={handleFileUpload} />
   ```
5. Store file URL in database:
   ```javascript
   await db.update('doctors', doctorId, { verificationDocuments: [{ url, type }] });
   ```
6. Implement file download with auth check

---

## N.2: No QR Code or Receipt Generation

**Current Behavior:**
- Appointment created but no confirmation
- No unique identifier shown to patient
- No QR code for check-in
- Patient has no proof of booking
- No receipt or invoice
- No digital pass/ticket

**Expected Behavior:**
- After booking, show confirmation with:
  - Unique confirmation code (e.g., "CONF-HOSP1-APT-12345")
  - QR code encoding confirmation code
  - Appointment details (date, time, doctor, location)
  - Hospital instructions (where to go, what to bring)
  - Cancel/reschedule options
- Email confirmation with:
  - Confirmation code
  - QR code as image
  - iCalendar file (.ics) for adding to calendar
  - PDF receipt
- Patient can:
  - Screenshot confirmation
  - Print QR code
  - Add to phone calendar
  - Share with caregiver

**Affected Workflows:**
- Appointment booking confirmation
- Ambulance booking confirmation
- Health camp registration confirmation
- Lab test booking confirmation

**Recommended Fix:**
1. Generate unique confirmation code:
   ```javascript
   confirmationCode = `CONF-${hospitalId}-${randomString()}`;
   ```
2. Generate QR code (qrcode library):
   ```javascript
   const qr = await QRCode.toDataURL(confirmationCode);
   ```
3. Store in database:
   ```javascript
   await db.update('appointments', id, { confirmationCode, qrCode });
   ```
4. Generate PDF receipt:
   ```javascript
   const pdf = createPDF({ appointmentData, qr });
   res.contentType('application/pdf');
   res.send(pdf);
   ```
5. Send email with receipt attachment
6. Show QR on confirmation screen

---

# O. Security

## O.1: No HTTPS Enforcement

**Current Behavior:**
- Development: Running on HTTP (localhost:3000, localhost:4000)
- No SSL/TLS certificates configured
- No HTTPS redirect
- Tokens sent over unencrypted connections (vulnerable to man-in-the-middle)
- No HSTS headers

**Expected Behavior:**
- Production: All traffic over HTTPS
- SSL/TLS certificate from trusted CA (Let's Encrypt, AWS ACM)
- Automatic HTTP → HTTPS redirect
- HSTS headers set (tell browsers to always use HTTPS)
- No mixed content (HTTP resources on HTTPS pages)
- Certificate renewal automated

**Recommended Fix:**
1. Install SSL certificate (free from Let's Encrypt)
2. Configure Express to redirect HTTP to HTTPS:
   ```javascript
   app.use((req, res, next) => {
     if (process.env.NODE_ENV === 'production' && !req.secure) {
       res.redirect(`https://${req.host}${req.originalUrl}`);
     }
     next();
   });
   ```
3. Add HSTS header:
   ```javascript
   app.use(helmet({ hsts: { maxAge: 31536000 } }));
   ```
4. Ensure frontend uses HTTPS URLs (API calls, asset paths)

---

## O.2: HIPAA Compliance Missing

**Current Behavior:**
- No encryption of medical data at rest
- No access logs (who viewed patient records)
- No audit trail of data access
- Patient data publicly readable via API
- No patient data deletion/anonymization request handling
- No breach notification procedure
- No data retention policy

**Expected Behavior:**
- Compliance checklist:
  - [ ] Encrypt all patient health data (field-level encryption)
  - [ ] Access logs for all data access (who, when, what)
  - [ ] Audit trail: Data modifications tracked
  - [ ] Patient data accessible only to authorized users
  - [ ] Breach notification: Notify patients within 24 hours
  - [ ] Right to deletion: Patient can request account deletion (anonymize instead)
  - [ ] Data retention: Define how long data kept after patient leaves
  - [ ] Business Associate Agreements: Document with hospital partners
- Data isolation: Hospital A cannot see Hospital B's patient records

**Affected Areas:**
- Patient records access control (Section A.1)
- Data encryption (new)
- Access logging (new)
- Audit trails (new)

**Recommended Fix:**
1. Encrypt sensitive fields using database encryption or field-level:
   ```javascript
   const encrypted = crypto.encrypt(patientData.medicalHistory);
   ```
2. Add access log collection:
   ```javascript
   await db.create('access_logs', {
     userId, recordType, recordId, action, timestamp
   });
   ```
3. Implement audit middleware on PATCH/DELETE
4. Add patient data deletion endpoint (anonymize, not hard delete)
5. Document HIPAA compliance in architecture doc
6. Annual compliance audit

---

## O.3: No CORS Configuration

**Current Behavior:**
- CORS header set to allow all origins:
  ```javascript
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  ```
- Any domain can make API requests
- Vulnerable to cross-site request forgery (CSRF)
- No CSRF token protection

**Expected Behavior:**
- Whitelist specific domains:
  ```javascript
  const allowedOrigins = ['https://app.ayudh.com', 'https://admin.ayudh.com'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  ```
- CSRF token for state-changing requests (POST, PATCH, DELETE)
- Cookies marked HttpOnly (not accessible via JS)
- SameSite cookie attribute set

**Recommended Fix:**
1. Define allowed origins based on environment
2. Implement CSRF middleware:
   ```javascript
   const csrf = require('csurf');
   app.use(csrf());
   ```
3. Include token in forms/AJAX requests
4. Set cookie flags:
   ```javascript
   res.cookie('token', token, {
     httpOnly: true,
     secure: process.env.NODE_ENV === 'production',
     sameSite: 'strict'
   });
   ```

---

## O.4: Password Security Inadequate

**Current Behavior:**
- Minimum 6 characters (too short)
- No complexity requirements (any 6 chars, even "aaaaaa")
- No password history (can reuse old password)
- No password reset via email
- Token expiration long (7 days)

**Expected Behavior:**
- Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 number
  - At least 1 special character (!@#$%^&*)
- No password reuse (can't reuse last 5 passwords)
- Token expiration: 2 hours (access token), 7 days (refresh token)
- Automatic logout on inactivity (15 minutes)
- Password reset via email:
  1. User clicks "Forgot Password"
  2. Email sent with reset link (expires in 1 hour)
  3. Click link → reset password form
  4. Password updated, old session logged out
- No email showing last login time for security check

**Affected Files:**
- [server/index.js](server/index.js) - Registration validation (line ~111)
- [src/lib/api.ts](src/lib/api.ts) - No password reset endpoint

**Current Validation:**
```javascript
if (password.length < 6) {
  return res.status(400).json({ error: 'Password must be at least 6 characters.' });
}
```

**Recommended Fix:**
1. Update password validation:
   ```javascript
   const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/;
   if (password.length < 8 || !passwordRegex.test(password)) {
     return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, number, symbol' });
   }
   ```
2. Implement password reset flow:
   - `POST /api/auth/forgot-password` - sends email
   - `POST /api/auth/reset-password` - validates token, resets
3. Track password history (hash + date)
4. Add `lastLoginAt` field and show in account settings
5. Implement auto-logout on inactivity using IdleTimer

---

# P. Missing Interconnections

## P.1: No Notification System

**Current Behavior:**
- No notifications sent to users
- Patient registers but no welcome email
- Doctor booking request created but doctor not notified
- Hospital request accepted but patient not notified
- Appointment reminder: doesn't exist
- Prescription ready: patient not notified
- Verification approved: user not notified

**Expected Behavior:**
- Notification system with channels:
  1. **Email**:
     - Welcome email after registration
     - Appointment confirmation (to patient + doctor)
     - Appointment reminders (24h, 1h before)
     - Verification approval/rejection
     - Visit request accepted/rejected
     - Prescription ready notification
  2. **SMS (optional)**:
     - Appointment confirmation
     - Appointment reminder
     - Emergency alerts
  3. **In-app (push)**:
     - Real-time appointment notifications
     - Request status updates
     - System alerts
- Notification preferences:
  - User can opt-in/out for each notification type
  - Frequency: Immediately, Digest (daily), Never
- Notification history:
  - User can view all past notifications

**Affected Workflows:**
- User registration
- Appointment booking (both parties)
- Visit request acceptance/rejection
- Prescription creation
- Doctor/hospital verification
- Membership renewal
- Payment receipt

**Recommended Fix:**
1. Create notifications collection:
   ```json
   {
     "id": "NTF-123",
     "userId": "USR-1",
     "type": "appointment_confirmed|verification_approved|...",
     "title": "Appointment Confirmed",
     "message": "Your appointment with Dr. Smith is confirmed for...",
     "data": { appointmentId: "APT-1" },
     "read": false,
     "createdAt": "2026-09-09T10:30:00Z"
   }
   ```
2. Install email service (Nodemailer, SendGrid)
3. Create email templates (welcome, confirmation, reminder, etc.)
4. Add notification queue (Bull, RabbitMQ) for async sending
5. Trigger notifications from workflows:
   - After appointment created: Send notification to both parties
   - After visit request accepted: Send notification
6. Add notification preferences page in settings
7. Show in-app notification badge/toast

---

## P.2: No Search/Filtering Interconnection

**Current Behavior:**
- Search hospitals by district: Works (hardcoded data)
- Filter doctors by speciality: Works (hardcoded data)
- But real data from API never filtered:
  - Get all hospitals, filter in frontend (memory intensive)
  - Get all doctors, filter in frontend (slow)
  - No backend query optimization
- Search doesn't persist across page navigations
- Search results not shareable (no URL)

**Expected Behavior:**
- Search/filtering integrated across app:
  - Hospital search by: district, speciality available, bed availability, rating
  - Doctor search by: speciality, hospital, availability, rating
  - Appointment search: past/upcoming, by doctor, status
  - Lead search/filter: status, assigned to, source
- Backend filtering:
  - `GET /api/records/hospitals?district=Warangal&speciality=Cardiology`
  - `GET /api/records/doctors?speciality=Cardiology&rating_min=4.0`
- Search state in URL:
  - Share link: `/search/hospitals?district=Warangal&speciality=Cardiology`
- Persistent search:
  - Save search filters in user preferences
  - Quick re-search favorite filters

**Affected Components:**
- [HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx) - Frontend filtering only
- [PartnerHospitalsPage.tsx](src/components/PartnerHospitalsPage.tsx) - No filtering
- [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) - Limited filtering

**Recommended Fix:**
1. Implement backend filtering (see Section J.3)
2. Update search components to use URL params:
   ```typescript
   const [searchParams] = useSearchParams();
   const district = searchParams.get('district');
   const fetch = async () => {
     const hospitals = await api.list('hospitals', { district });
     setHospitals(hospitals);
   };
   ```
3. Update URL when search changes:
   ```typescript
   navigate(`?district=${district}&speciality=${speciality}`);
   ```
4. Persist search via localStorage for user preferences

---

## P.3: No Cross-Module Workflow Integration

**Current Behavior:**
- Patient books appointment in one module
- Doctor receives in separate dashboard
- Hospital never aware of appointment
- No workflow tracking: booking → confirmation → completion
- Multiple isolated data silos:
  - Patient silo (my appointments)
  - Doctor silo (my appointments)
  - Hospital silo (visit requests)
  - Marketing silo (leads)
- No way to see full patient journey

**Expected Behavior:**
- Integrated workflow:
  1. Patient searches hospitals (PartnerHospitalsPage)
  2. Patient requests visit (HospitalSearchVisitSection)
  3. Hospital dashboard notified of request (HospitalDashboard)
  4. Hospital accepts, assigns doctor and time
  5. Doctor dashboard shows appointment (DoctorDashboard)
  6. Patient notified, sees in PatientDashboard
  7. Patient checks in (show QR code)
  8. Doctor completes, writes report
  9. Patient gets report notification, views in records
  10. System sends feedback survey
- Admin can see entire flow (admin dashboard)
- Real-time sync: When one role updates, all others see change

**Missing Connections:**
- Marketing lead → doesn't link to actual appointment/patient
- Doctor verification → doesn't enable appointments
- Hospital bed booking → doesn't reserve beds
- Prescription → doesn't track patient adherence

**Recommended Fix:**
1. Create state machine for appointment workflow:
   ```
   PENDING → ACCEPTED → SCHEDULED → CHECKED_IN → COMPLETED → REVIEWED
            → REJECTED / CANCELLED
   ```
2. Add workflow tracking to appointments:
   ```json
   {
     "status": "PENDING",
     "workflow": [
       { action: "created", by: "patient", at: "2026-09-09T10:00Z" },
       { action: "accepted", by: "hospital", at: "2026-09-09T10:15Z" },
       { action: "assigned", by: "hospital", doctor: "DOC1", at: "2026-09-09T10:20Z" }
     ]
   }
   ```
3. Implement SSE events for workflow transitions
4. Show workflow timeline in appointment detail
5. Add admin workflow dashboard (view all in-progress workflows)

---

## P.4: Doctor Availability Not Synchronized

**Current Behavior:**
- Doctor has `availableSlots` array (hardcoded):
  ```javascript
  availableSlots: [
    { day: 'Today', slots: ['10:00 AM', '04:00 PM'] },
    { day: 'Sat', slots: ['09:30 AM', '12:00 PM'] },
  ]
  ```
- When patient books 10:00 AM, slot never marked as occupied
- Same slot appears available to other patients
- Doctor could receive 3 appointments at same time
- No overbooking prevention
- Availability never updated from reality

**Expected Behavior:**
- `appointment_slots` table tracks each slot:
  ```json
  {
    "id": "SLOT-DOC1-2026-09-09-10:00",
    "doctorId": "DOC1",
    "slotDateTime": "2026-09-09T10:00:00Z",
    "duration": 30,
    "status": "available|booked|cancelled",
    "appointmentId": "APT-123" (if booked)
  }
  ```
- When patient books: Find available slot, mark as booked, create appointment
- When appointment cancelled: Mark slot as available again
- Doctor can update availability (mark unavailable, set on-leave)
- Real-time sync: When slot booked, removed from frontend search

**Affected Workflows:**
- Appointment booking
- Doctor dashboard (shows correct availability)
- Doctor on-leave management

**Recommended Fix:**
1. Create `appointment_slots` collection/table
2. Pre-populate slots for next 30 days on doctor creation
3. When booking: Check slot status, atomically update to 'booked'
4. When cancelling: Update slot status to 'available'
5. Doctor dashboard: Ability to set/remove availability
6. Frontend: Disable booked slots in booking form
7. SSE: Broadcast slot status changes to all listening clients

---

## P.5: Admin Approval Workflows Missing

**Current Behavior:**
- Doctor registration auto-approved (no review)
- Hospital registration auto-approved (no review)
- Doctor-hospital assignment auto-approved (if added)
- Partnership requests not reviewed
- Lead assignments not reviewed
- No admin action required for any user action
- Fraudulent doctors/hospitals could exist

**Expected Behavior:**
- Admin workflow dashboard showing:
  1. **Doctor Approvals**:
     - List: Doctor name, credentials, status, submitted date
     - Action: View documents, Approve/Reject
     - Rejection reason field
     - Notification sent to doctor
     - After approval: Doctor appears in search
  2. **Hospital Approvals**:
     - Similar to doctor
  3. **Partnership Requests**:
     - List: Role, name, contact, status
     - Action: Reach out to user, Approve/Reject
     - Email notification to user
  4. **Lead Assignments**:
     - List: Lead name, status, assigned to, date
     - Action: Change assignment, mark converted, archive
  5. **Refund/Dispute Requests**:
     - Patient requests refund for booking
     - Admin reviews, approves/denies
     - Refund sent to patient wallet

**Affected Database Entities:**
- `doctors.status`: Should stay "PENDING_VERIFICATION" until admin approves
- `hospitals.status`: Should stay "PENDING_VERIFICATION" until admin approves
- New collection: `admin_actions`:
  ```json
  {
    "id": "ACT-123",
    "entityType": "doctor|hospital|partnership",
    "entityId": "DOC-1",
    "action": "approved|rejected",
    "reason": "Credentials verified",
    "by": "admin-user-id",
    "at": "2026-09-09T10:30:00Z"
  }
  ```

**Recommended Fix:**
1. Add approval workflow endpoints:
   - `PATCH /api/doctors/:id/approve`
   - `PATCH /api/doctors/:id/reject` (with reason)
   - `PATCH /api/hospitals/:id/approve`
   - `PATCH /api/hospitals/:id/reject`
2. Create AdminApprovals component with tabs for each entity type
3. Add document viewer for verification documents
4. Send approval/rejection emails
5. Track approval history in admin_actions table
6. Show "Verified" badge on approved entities

---

## P.6: Patient Journey Not Tracked End-to-End

**Current Behavior:**
- No way to track patient lifecycle:
  - When did patient register?
  - How many appointments booked?
  - How many completed?
  - What's their satisfaction?
  - Are they a paid member?
  - When did they churn?
- Marketing doesn't know which patients are high-value
- No patient segments for targeted outreach
- No retention metrics

**Expected Behavior:**
- Patient profile shows full journey:
  - Registration date
  - Total appointments (booked, completed, cancelled)
  - Avg satisfaction rating
  - Membership tier and renewal date
  - Total spending/wallet usage
  - Last visit date
  - Churn risk (flag if inactive 3+ months)
- Patient segments:
  - New (registered <1 month, no appointment)
  - Active (2+ appointments in last 3 months)
  - Inactive (no appointment in 3+ months)
  - VIP (gold member + 10+ appointments)
- Analytics:
  - Funnel: Registered → Booked → Completed → Satisfied
  - Retention rate: % of patients with repeat visits
  - Revenue per patient
  - Lifetime value

**Missing Data Points:**
- `patients.lastAppointmentDate`
- `patients.totalAppointments`
- `patients.totalSpend`
- `patients.satisfactionRating`
- `patients.churnRisk`
- `patients.segment`

**Recommended Fix:**
1. Add calculated fields to patient record:
   ```sql
   SELECT
     p.id,
     COUNT(a.id) as totalAppointments,
     MAX(a.createdAt) as lastAppointmentDate,
     AVG(a.rating) as avgRating,
     SUM(w.amount) as totalSpend,
     CASE
       WHEN NOW() - MAX(a.createdAt) > interval '3 months' THEN 'inactive'
       WHEN COUNT(a.id) >= 2 AND MAX(a.createdAt) > NOW() - interval '3 months' THEN 'active'
       ELSE 'new'
     END as segment
   FROM patients p
   LEFT JOIN appointments a ON p.id = a.patientId
   LEFT JOIN wallet_txns w ON p.id = w.patientId
   ```
2. Create patient journey dashboard (admin)
3. Add segmentation queries for marketing
4. Implement churn prediction (flag inactive patients)
5. Add re-engagement campaigns (email inactive patients)

---

## Summary Table of Critical Issues

| Issue | Severity | Affected | Fix Time | Dependencies |
|-------|----------|----------|----------|--------------|
| **A.1: Public Patient Records** | CRITICAL | API, Security | 2-3 days | RBAC middleware |
| **A.2: Guest User Permissions** | HIGH | Bookings, Features | 1 day | RBAC |
| **C.1: Auto-Approval** | HIGH | Verification | 3-4 days | Email service |
| **L.1: No URL Routing** | HIGH | Navigation | 2-3 days | React Router |
| **M.1: No Loading States** | MEDIUM | UX | 1-2 days | Components |
| **O.1: No HTTPS** | HIGH | Security | 1 day | SSL cert |
| **O.2: HIPAA Compliance** | CRITICAL | Legal | 5-7 days | Encryption |
| **P.1: No Notifications** | HIGH | User experience | 3-4 days | Email service |
| **P.3: Workflow Integration** | HIGH | Features | 4-5 days | SSE, API |

---

**END OF STRUCTURED AUDIT**

This audit identifies every major gap without suggesting redesigns. Each issue includes:
- Current problematic behavior
- Expected correct behavior
- Affected files and components
- Database impacts
- Specific recommended fixes with code examples
