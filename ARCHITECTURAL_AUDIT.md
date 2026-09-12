# Ayudh Vikas Foundation — Comprehensive Architectural Audit

**Date:** September 9, 2026  
**Status:** Development  
**Database:** Hybrid (PostgreSQL + Local JSON fallback)

---

## Executive Summary

The Ayudh Vikas Foundation application is a **full-stack healthcare network platform** combining patient-doctor-hospital interactions with community health initiatives. The architecture uses:

- **Frontend:** React 19 with Vite + Tailwind CSS (SPA with localStorage-based routing)
- **Backend:** Express.js with PostgreSQL (with local JSON fallback)
- **Authentication:** JWT tokens (RS256 equivalent with HS256) + Guest mode
- **Real-time Updates:** Server-Sent Events (SSE) for live data sync
- **Data Models:** 23+ collections with nested JSONB storage

### Key Issues Found
- **No Role-Based Access Control** on most endpoints (only `/api/users` is admin-gated)
- **All patients/doctors/hospitals accessible** via public `/api/records/:collection` endpoints
- **Hardcoded mock data** mixed with real API calls
- **Incomplete workflows** (verification, document uploads, approvals)
- **No deep-linking support** (routing via localStorage, not URL)
- **Guest access** has same permissions as authenticated users

---

## 1. AUTHENTICATION & AUTHORIZATION

### 1.1 Authentication Implementation

**Type:** JWT (JSON Web Tokens) with HS256 signature

**File:** [server/crypto-auth.js](server/crypto-auth.js)

**Details:**
- Tokens signed with `JWT_SECRET` environment variable (default: `ayudh-vikas-dev-secret`)
- Token payload contains: `{ id, role, name, exp }`
- 7-day expiration (60 * 60 * 24 * 7 seconds)
- Custom JWT implementation (not using standard library)

**Login Flow:**
```
POST /api/auth/login
→ findUserByIdentifier (email, phone, or ID)
→ verifyPassword (scrypt comparison)
→ signToken (JWT)
→ Returns { token, user }
```

**Token Storage:**
- Frontend: `localStorage['ayudh_token']`
- Sent in requests as: `Authorization: Bearer <token>`
- Retrieved by: [src/lib/api.ts](src/lib/api.ts) `getToken()`

**Password Hashing:**
- Algorithm: `scrypt` with 32-byte hash, 16-byte salt
- Format: `scrypt$<salt>$<hash>`
- Timing-safe comparison to prevent timing attacks

### 1.2 Defined Roles

**9 Roles in AuthContext:** [src/context/AuthContext.tsx](src/context/AuthContext.tsx)

| Role | Purpose | Access Level |
|------|---------|--------------|
| `patient` | End users seeking healthcare | Full dashboard access |
| `doctor` | Medical professionals | Appointments, patient lookup, prescriptions |
| `hospital` | Hospital administrators | Bed management, doctor roster, visit requests |
| `marketing` | Sales/outreach team | Lead tracking, conversion management |
| `admin` | Super admin | User creation/deletion, system config |
| `volunteer` | Community health workers | Camp coordination, patient guidance |
| `social_organizer` | Community mobilizers | Health camp organization |
| `ambulance` | Ambulance service operators | Dispatch management (stub) |
| `lab` | Laboratory staff | Lab booking coordination (stub) |

### 1.3 Guest User Implementation

**Location:** [src/context/AuthContext.tsx](src/context/AuthContext.tsx), lines 34-42

```typescript
const GUEST_USER: AuthUser = {
  id: 'guest-user',
  role: 'patient',
  name: 'Guest Visitor',
  displayName: 'Guest',
  isGuest: true,
  // ... full patient permissions
};
```

**Issues:**
- ✗ Guest user has **same role (`patient`) as authenticated patients**
- ✗ Can access all patient features (view hospitals, doctors, book appointments)
- ✗ No read-only restrictions
- ✗ Persisted via `localStorage['ayudh_guest']` flag

**Workaround:** `isGuest` flag exists but not checked in most component logic

### 1.4 Role-Based Access Control (RBAC)

**Authorization Checks:** Only 2 places in API

**File:** [server/index.js](server/index.js)

```javascript
// Line 63-65: authOptional middleware
function authOptional(req, _res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();
  try {
    req.user = verifyToken(token);
  } catch {
    req.user = null;
  }
  next();
}

// Line 68-72: authRequired middleware
function authRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }
  next();
}

// Line 74-78: adminRequired middleware
function adminRequired(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Please sign in to continue.' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access is required.' });
  next();
}
```

**Protected Endpoints:**
| Endpoint | Protection | Issue |
|----------|-----------|-------|
| `POST /api/users` | `adminRequired` | ✓ Correct |
| `PATCH /api/users/:id` | `adminRequired` | ✓ Correct |
| `DELETE /api/users/:id` | `adminRequired` | ✓ Correct |
| `PATCH /api/auth/me` | `authRequired` | ✓ Correct (self-service) |
| `DELETE /api/records/:collection/:id` | `authRequired` | ✗ **Anyone can delete any record** |
| `GET /api/records/:collection` | None | ✗ **All records publicly readable** |
| `POST /api/records/:collection` | None | ✗ **Anyone can create records** |
| `PATCH /api/records/:collection/:id` | None | ✗ **Anyone can modify any record** |
| `GET /api/health` | None | ✓ Fine (non-sensitive) |
| `GET /api/bootstrap` | None | ✓ Fine (needed for UI) |

**Critical RBAC Gaps:**
- No permission checks on `/api/records/*` endpoints
- No verification that `patientId` in request matches authenticated user's ID
- No hospital-level isolation (hospital A can modify hospital B's visit requests)
- No cross-entity validation (doctor can create appointments for any patient)

### 1.5 Hardcoded Permissions & Secrets

**File:** [server/crypto-auth.js](server/crypto-auth.js), line 1

```javascript
const KEY = process.env.JWT_SECRET || 'ayudh-vikas-dev-secret';
```

**Issues:**
- ✗ Default secret hardcoded (security risk in production)
- ✗ No key rotation mechanism
- ✗ `.env.example` shows default DATABASE_URL

**File:** [.env.example](.env.example)

```
DATABASE_URL=postgresql://ayudh:ayudh_dev@localhost:5432/ayudh_vikas
JWT_SECRET=change-me-in-production
```

**Issues:**
- ✗ Development credentials visible in example
- ✗ No environment-specific defaults

---

## 2. DATA MODELS & RELATIONSHIPS

### 2.1 Database Architecture

**Storage Mode:** Dual-layer
- **PostgreSQL** (production): When `DATABASE_URL` is set
- **Local JSON** (development): File at [server/local-data.json](server/local-data.json)

**File:** [server/db.js](server/db.js)

**Schema (PostgreSQL):**

```sql
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  role TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  password_hash TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX users_email_idx ON users ((lower(email)));
CREATE INDEX users_phone_idx ON users (phone);
CREATE INDEX users_role_idx ON users (role);

CREATE TABLE records (
  id TEXT PRIMARY KEY,
  collection TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX records_collection_idx ON records (collection);
CREATE INDEX records_data_gin ON records USING GIN (data);
```

### 2.2 Collections & Schemas

**23 Collections Defined:** [server/db.js](server/db.js), lines 7-29

#### Core Collections

| Collection | Purpose | Key Fields | Prefix | Status |
|------------|---------|-----------|--------|--------|
| `hospitals` | Hospital network partners | id, name, specialities, totalBeds, availableBeds, seniorDoctors[] | HOSP | Live |
| `doctors` | Doctor directory | id, name, speciality, hospitalId, consultationFee, rating, availableSlots[] | DOC | Live |
| `patients` | Patient registry | id, patientId, userId, fullName, phone, email, bloodGroup | AVP | Live |
| `health_camps` | Health screening camps | id, title, location, date, doctorsInvolved, servicesOffered[] | CAMP | Live |

#### Appointment & Booking Collections

| Collection | Purpose | Key Fields | Prefix | Status |
|------------|---------|-----------|--------|--------|
| `appointments` | Doctor consultations | id, doctorId, patientId, slotTime, status, tokenNumber | APT | Live |
| `ambulance_bookings` | Emergency ambulance | id, patientId, location, status, driverName, eta | AMB | Live |
| `lab_bookings` | Lab test bookings | id, patientId, labTests[], status | LAB | Live |
| `home_care_bookings` | Home health visits | id, patientId, serviceType, status | HC | Live |
| `visit_requests` | Hospital visit requests | id, patientId, hospitalId, requestId, status | HVR | Live |
| `camp_registrations` | Patient camp registrations | id, patientId, campId, status | CRG | Live |

#### Administrative Collections

| Collection | Purpose | Key Fields | Prefix | Status |
|------------|---------|-----------|--------|--------|
| `leads` | Marketing leads | id, patientName, phone, requirement, status, assignedDoctor | LD | Live |
| `partnerships` | Partner registration requests | id, role, name, email, status | PTR | Live |
| `callbacks` | Callback requests | id, patientName, phone, preferredTime | CB | Partial |
| `emergencies` | Emergency alerts | id, patientId, location, severity, status | EMG | Stub |
| `memberships` | Membership subscriptions | id, patientId, tier, status, benefits[] | MEM | Partial |

#### Clinical & Records

| Collection | Purpose | Key Fields | Prefix | Status |
|------------|---------|-----------|--------|--------|
| `health_records` | Medical records | id, patientId, recordType, uploadedAt | REC | Stub |
| `prescriptions` | Doctor prescriptions | id, patientId, doctorId, medicines[] | RX | Stub |
| `insurance_applications` | Insurance claims | id, patientId, hospitalId, status | INS | Stub |

#### Patient Engagement

| Collection | Purpose | Key Fields | Prefix | Status |
|------------|---------|-----------|--------|--------|
| `reminders` | Medication & health reminders | id, patientId, title, time, type | REM | Stub |
| `wallet_txns` | Patient wallet ledger | id, patientId, amount, balanceAfter | WAL | Stub |
| `notifications` | System notifications | id, userId, message, type | NTF | Stub |
| `tickets` | Support tickets | id, patientId, subject, status | AVT | Partial |
| `feedback` | User feedback & ratings | id, patientId, rating, comments | FB | Stub |
| `enquiries` | General enquiries | id, name, email, message | ENQ | Stub |

**Status Legend:**
- `Live` = Functional backend + frontend
- `Partial` = Backend exists, frontend in progress
- `Stub` = Backend structure only

### 2.3 Relationships

**Entity Relationship Diagram (Logical):**

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │
│ role            │
│ email           │
│ phone           │
│ password_hash   │
│ data (JSONB)    │ ◄─── Contains: patientId, doctorId, hospitalId
└──────┬──────────┘
       │
       ├──────────────────┬───────────────────┬─────────────────┐
       │                  │                   │                 │
       ▼                  ▼                   ▼                 ▼
┌─────────────┐  ┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│  PATIENTS   │  │   DOCTORS   │   │  HOSPITALS   │   │ PARTNERSHIPS │
├─────────────┤  ├─────────────┤   ├──────────────┤   ├──────────────┤
│ id (PK)     │  │ id (PK)     │   │ id (PK)      │   │ id (PK)      │
│ userId (FK) │  │ hospitalId  │   │ name         │   │ role         │
│ patientId   │  │ (FK)        │   │ seniorDoctor │   │ status       │
│ phone       │  │ name        │   │ s[] (nested) │   │              │
└──────┬──────┘  └──────┬──────┘   └──────┬───────┘   └──────────────┘
       │                │                 │
       │ 1:N            │ N:1             │ 1:N
       │                ▼                 ▼
       │          ┌──────────────┐  ┌─────────────────────┐
       │          │ DOCTORS in   │  │ HOSPITAL VISIT      │
       │          │ HOSPITALS    │  │ REQUESTS            │
       │          └──────────────┘  ├─────────────────────┤
       │                            │ hospitalId (FK)     │
       │                            │ patientId (FK)      │
       │                            │ status              │
       │                            └─────────────────────┘
       │
       ├──► APPOINTMENTS
       ├──► AMBULANCE_BOOKINGS
       ├──► LAB_BOOKINGS
       ├──► HOME_CARE_BOOKINGS
       ├──► CAMP_REGISTRATIONS
       ├──► REMINDERS
       ├──► WALLET_TXNS
       └──► TICKETS
```

**Key Observations:**

1. **Foreign Key Storage:**
   - `doctorId`, `patientId`, `hospitalId` stored as text fields (not actual FK constraints)
   - No referential integrity checks in application code
   - Orphaned records possible if parent deleted

2. **Nested Data:**
   - Hospital `seniorDoctors[]` stored as embedded array in JSONB
   - Doctor records duplicated in both `doctors` collection AND `hospitals.seniorDoctors[]`
   - Manual sync required when doctor updated (see [server/index.js](server/index.js), lines 470-476)

3. **Denormalization:**
   - Patient data stored in both `users` table AND `patients` collection
   - Hospital visit request duplicates patient info (patientName, patientPhone) instead of FK
   - Marketing leads store appointment/doctor info as text instead of reference

4. **Missing Relationships:**
   - No explicit `camp_registrations` → `health_camps` link (only `campId` as text)
   - No `appointments` → `doctors` relationship table
   - Prescription-medication relationship not modeled

### 2.4 JSONB Data Columns

**User `data` Column Stores:**
```json
{
  "patientId": "AVP123456",
  "doctorId": "DOC456",
  "hospitalId": "HOSP789",
  "displayName": "Ramesh K.",
  "image": "/path/to/avatar.jpg",
  "status": "Active",
  "walletBalance": 1250,
  "membershipTier": "Gold",
  // ... other custom fields
}
```

**Why Nested:**
- Flexible schema for different role-specific data
- Avoids creating separate user type tables
- Can add new fields without migration

---

## 3. API ENDPOINTS

### 3.1 Complete Endpoint Inventory

**File:** [server/index.js](server/index.js)

#### Authentication Endpoints

```javascript
POST /api/auth/login
  Request:  { identifier, password }
  Response: { token, user }
  Auth:     None (public)
  Role Check: None
  Issues:   ✗ No rate limiting

POST /api/auth/register
  Request:  { role, fullName, email, phone, password, ... }
  Response: { token, user, patientId, referenceNo }
  Auth:     None (public)
  Role Check: None
  Auto-creates: patients/doctors/hospitals/partnerships collections
  Issues:   ✗ No email verification
             ✗ No document upload handling
             ✗ Status auto-set to "APPROVED" (no verification workflow)

GET /api/auth/me
  Response: { user }
  Auth:     authOptional (works without token, returns null user)
  Issues:   ✗ Should be authRequired

PATCH /api/auth/me
  Request:  { name, email, phone, ... }
  Response: { user }
  Auth:     authRequired
  Side Effects: Updates corresponding patients/:id record
  Issues:   ✓ Correct access control
```

#### Health & System Endpoints

```javascript
GET /api/health
  Response: { ok, mode, postgres, configured, counts, hint }
  Auth:     None
  Purpose:  Server status check
  Issues:   ✓ Safe (no data)

GET /api/stats
  Response: { mode, postgres, counts }
  Auth:     None
  Issues:   ✗ No RBAC (anyone can see all statistics)

GET /api/bootstrap
  Response: { mode, postgres, hospitals[], doctors[], health_camps[], stats }
  Auth:     None
  Issues:   ✓ Needed for initial UI load
  Returns:  **ALL HOSPITALS, DOCTORS, CAMPS** (no filtering)
```

#### User Management Endpoints

```javascript
GET /api/users
  Response: { items: user[] }
  Auth:     adminRequired ✓
  Returns:  **ALL USERS** (can filter but no default limit)
  Issues:   ✗ No pagination (no limit param)
             ✗ Unfiltered might be 10,000+ users

POST /api/users
  Request:  { role, name, email, phone, password, ... }
  Response: { item: user }
  Auth:     adminRequired ✓
  Issues:   ✓ Correct

PATCH /api/users/:id
  Auth:     adminRequired ✓
  Issues:   ✓ Correct

DELETE /api/users/:id
  Auth:     adminRequired ✓
  Guard:    Cannot delete own account
  Issues:   ✓ Correct
```

#### Records (Collections) CRUD Endpoints

```javascript
GET /api/records/:collection
  Response: { items: any[] }
  Auth:     authOptional
  Issues:   ✗ **NO RBAC - ALL RECORDS PUBLIC**
             ✗ **No pagination/limit**
  Example:  GET /api/records/patients
  Returns:  **ALL PATIENTS** (names, phones, medical data)
  
  Accessible collections:
    - hospitals (10-20 records) - OK
    - doctors (40+ records) - OK
    - **patients** (N records) - ✗ SECURITY RISK
    - **appointments** (all user appointments) - ✗ PRIVACY ISSUE
    - **ambulance_bookings** (all bookings) - ✗ PRIVACY ISSUE
    - **lab_bookings** (all tests) - ✗ PRIVACY ISSUE
    - leads (marketing prospects) - ✗ PRIVACY ISSUE
    - **prescriptions** (all medications) - ✗ HIPAA VIOLATION
    - insurance_applications - ✗ FINANCIAL DATA

POST /api/records/:collection
  Auth:     authOptional (works without login!)
  Issues:   ✗ **ANYONE can create records**
             ✗ Automatic fields added from context (createdBy, patientId from logged-in user)
             ✗ If not logged in: createdBy = undefined
             ✗ No validation of collection type
             ✗ No required field checks

  Example:  POST /api/records/patients
  → Creates new patient record accessible to all

GET /api/records/:collection/:id
  Auth:     authOptional
  Issues:   ✗ **ANYONE can view specific record**
  Example:  GET /api/records/patients/AVP123456
  → Returns patient's full details

PATCH /api/records/:collection/:id
  Auth:     authOptional (no check!)
  Issues:   ✗ **ANYONE can modify ANY record**
  Example:  PATCH /api/records/appointments/APT123
           Body: { status: "Completed" }
  → Unauthenticated user can mark appointments as done
  
  Doctor-Hospital Sync:
    If collection === 'doctors' and has hospitalId:
    - Updates hospital.seniorDoctors[] array
    - Automatic data sync (good pattern)

DELETE /api/records/:collection/:id
  Auth:     authRequired
  Issues:   ✗ **ANYONE logged in can delete ANY record**
             ✗ No ownership check
             ✗ No soft delete
  Example:  DELETE /api/records/prescriptions/RX123
  → Authenticated attacker can delete any prescription
```

#### Specialized Endpoints

```javascript
GET /api/patients/lookup
  Query:    q (phone, patientId, memberId, uhid, or name)
  Response: { item: patient }
  Auth:     authOptional
  Purpose:  Find patient by identifier (for verification)
  Issues:   ✗ **No auth required**
             ✗ Can enumerate all patients via brute force
             ✗ Used by doctors to verify patients, but no role check

GET /api/stream
  Purpose:  Server-Sent Events (SSE) for real-time updates
  Returns:  Stream of "data: {collection, action, record}\n\n"
  Auth:     (Needs verification)
  Issues:   ✗ Real-time data may leak to unauthorized users
```

### 3.2 Security Issue Summary

**Endpoints Returning ALL Records (without filter):**

| Collection | Records Count | Risk | Example Attack |
|------------|---------------|------|-----------------|
| patients | N (all patients) | HIPAA | Scrape all patient IDs and medical data |
| appointments | N | Privacy | Download entire appointment history |
| ambulance_bookings | N | Privacy | Track patient emergencies |
| lab_bookings | N | Privacy | See all lab tests ordered |
| prescriptions | N | HIPAA | Access medication history |
| insurance_applications | N | Financial | See claims and coverage |
| leads | N | Marketing | Steal lead lists |
| camp_registrations | N | Participation | See who attended camps |

**Public Mutations (anyone can POST/PATCH/DELETE):**
- Create arbitrary records in any collection
- Modify past appointments, health records, etc.
- Delete important data

**No Pagination:**
- `GET /api/users?role=patient` returns **entire patient list** (no limit)
- `GET /api/records/patients` returns **all patients** (no pagination)
- Memory/performance issue if >50K records

---

## 4. PAGES & COMPONENTS

### 4.1 Page Hierarchy & Routing

**Routing Method:** localStorage-based state (NOT React Router URL)

**File:** [src/App.tsx](src/App.tsx)

**Current Routes (as localStorage keys):**

```typescript
activeTab: 'home' | 'about' | 'services' | 'doctors' | 'camps' | 'contact'
isLoginView: boolean
isPartnerView: boolean
isBookAppointmentView: boolean
isAmbulanceView: boolean
isLabTestsView: boolean
isHomeServiceView: boolean
isHospitalGuidanceView: boolean
isEmergencyView: boolean
isHealthCampsView: boolean
isPartnerHospitalsView: boolean
patientActiveTab: 'dashboard' | ...
```

**Issues:**
- ✗ **Cannot deep-link** (refresh loses state)
- ✗ **No browser history** (back button broken)
- ✗ **All state in localStorage** (public, inspectable)
- ✗ **No URL paths** for pages
- ✓ State persistence across browser restart

### 4.2 Component Pages by Role

#### Public Pages (Anyone)

| Component | Purpose | Auth Required | Data Source | Mock Data |
|-----------|---------|----------------|-------------|-----------|
| [HeroSection.tsx](src/components/HeroSection.tsx) | Landing hero | No | Static | ✓ |
| [SearchSection.tsx](src/components/SearchSection.tsx) | Doctor/hospital search | No | Local state | ✓ |
| [ServicesGrid.tsx](src/components/ServicesGrid.tsx) | Service offerings | No | mockData.SERVICES_LIST | ✓ |
| [PartnerHospitalsPage.tsx](src/components/PartnerHospitalsPage.tsx) | Hospital listings | No | API: /api/bootstrap | Mix |
| [HealthCampsPage.tsx](src/components/HealthCampsPage.tsx) | Upcoming camps | No | API: /api/records/health_camps | Mix |
| [InsurancePartners.tsx](src/components/InsurancePartners.tsx) | Insurance info | No | Static | ✓ |

#### Patient Pages (Logged-in)

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [PatientDashboard.tsx](src/components/PatientDashboard.tsx) | Patient hub | Context, hardcoded data | Partial |
| [BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx) | Doctor booking | API: doctors, hospitals | Live |
| [AmbulanceBookingPage.tsx](src/components/AmbulanceBookingPage.tsx) | Emergency ambulance | Hardcoded drivers | Stub |
| [LabTestsPage.tsx](src/components/LabTestsPage.tsx) | Lab test booking | API: lab_bookings | Partial |
| [HomeServicePage.tsx](src/components/HomeServicePage.tsx) | Home care booking | Hardcoded staff | Stub |
| [HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx) | Hospital visit request | API: visit_requests, hospitals | Live |
| [PatientInsuranceBookingPage.tsx](src/components/PatientInsuranceBookingPage.tsx) | Insurance | Hardcoded companies | Stub |

#### Doctor Pages (role='doctor')

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx) | Doctor hub | API: appointments, patients | Live |
| [DoctorAppointmentsPage.tsx](src/components/DoctorAppointmentsPage.tsx) | Appointment queue | Local state + API | Live |
| [PatientVerificationSection.tsx](src/components/PatientVerificationSection.tsx) | Verify patient | API: /api/patients/lookup | Live |

#### Hospital Pages (role='hospital')

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [HospitalDashboard.tsx](src/components/HospitalDashboard.tsx) | Hospital admin | API: visit_requests, doctors | Live |
| Doctor management | Add/edit doctors | API: /api/records/doctors | Live |
| Appointment queue | View all appointments | API: appointments | Live |

#### Marketing Pages (role='marketing')

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [MarketingDashboard.tsx](src/components/MarketingDashboard.tsx) | Lead tracking | API: leads | Live |
| [MarketingLeadsPage.tsx](src/components/MarketingLeadsPage.tsx) | Lead detail | Local state + API | Partial |

#### Admin Pages (role='admin')

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [SuperAdminDashboard.tsx](src/components/SuperAdminDashboard.tsx) | Admin console | API: all collections | Live |
| [AdminRoleManagement.tsx](src/components/AdminRoleManagement.tsx) | User CRUD | API: /api/users | Live |
| [AdminHealthCampsPage.tsx](src/components/AdminHealthCampsPage.tsx) | Camp management | API: health_camps | Partial |

#### Community Pages (role='volunteer' or 'social_organizer')

| Component | Purpose | Data Source | Status |
|-----------|---------|-------------|--------|
| [CommunityRoleDashboard.tsx](src/components/CommunityRoleDashboard.tsx) | Volunteer hub | mockData.UPCOMING_CAMPS | Stub |

### 4.3 Page-to-Role Mapping

**Issue: No Frontend Route Guards**

Currently, pages are conditionally rendered but not protected:
```typescript
// In App.tsx
if (isLoggedIn && userRole === 'doctor') {
  return <DoctorDashboard />;
} else if (isLoggedIn && userRole === 'hospital') {
  return <HospitalDashboard />;
}
```

**Problem:** If user modifies role in JWT (by tampering), frontend still shows wrong dashboard but API still works.

### 4.4 Component Architecture Issues

| Issue | Location | Impact |
|-------|----------|--------|
| **No loading states** | Most pages | UX: No feedback during API calls |
| **No error boundaries** | App-level | Crash: One error crashes entire app |
| **Hardcoded mock data** | PatientDashboard, HospitalDashboard | Confusion: Mix of real + fake |
| **Sidebar state per page** | Multiple dashboards | UX: Sidebar resets on navigation |
| **No form validation** | RegistrationModal, booking forms | Data: Invalid entries accepted |
| **No accessibility (a11y)** | All forms | Compliance: Missing ARIA labels |

---

## 5. DATA FLOW PATTERNS

### 5.1 Data Fetch Methods

#### 1. Bootstrap Flow (Initial Page Load)

**File:** [src/context/LiveDataContext.tsx](src/context/LiveDataContext.tsx)

```
App Mount
  → useEffect in LiveDataProvider
    → api.bootstrap()
    → GET /api/bootstrap
      ← { hospitals, doctors, health_camps, stats, mode, postgres }
    → setCollections({ hospitals, doctors, ... })
    → startEventStream()
```

**What's Fetched:**
- 3 collections only (hospitals, doctors, health_camps)
- **NOT fetched:** patients, appointments, prescriptions (need manual fetch)

#### 2. Real-Time Updates (Server-Sent Events)

**File:** [src/context/LiveDataContext.tsx](src/context/LiveDataContext.tsx), lines 110-150

```typescript
const startEventStream = async () => {
  const eventSource = new EventSource('/api/stream?token=' + token);
  eventSource.addEventListener('data', (event) => {
    const payload = JSON.parse(event.data);
    const { collection, action, record } = payload;
    applyChange(collection, action, record);  // ← local state update
  });
};
```

**File:** [server/index.js](server/index.js), lines 502-532

```javascript
app.get('/api/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  sseClients.add(res);
  res.on('close', () => sseClients.delete(res));
});

function broadcast(event) {
  const payload = `data: ${JSON.stringify(event)}\n\n`;
  for (const res of sseClients) {
    try {
      res.write(payload);
    } catch {
      sseClients.delete(res);
    }
  }
}
```

**Issues:**
- ✗ No authentication on SSE stream (token in URL string)
- ✗ Data broadcast to ALL connected clients
- ✗ No filtering by user role/permissions
- ✗ Sensitive data (all appointments, patients) sent to all connected users

#### 3. Lazy Fetch (On-Demand)

**Example:** [DoctorDashboard.tsx](src/components/DoctorDashboard.tsx)

```typescript
const handleLoadAppointments = async () => {
  const res = await api.list('appointments');  // GET /api/records/appointments
  setAppointments(res.items);
};
```

**Pattern:**
- Not auto-fetched in useEffect
- User clicks "Load More" or tab switch
- No caching (fresh fetch each time)

#### 4. Hardcoded Mock Data

**Files:** [src/data/mockData.ts](src/data/mockData.ts) (500+ lines)

**Examples:**
- `HOSPITALS` array (6 hospitals with full details)
- `BOOKING_DOCTORS` array (10 doctors with fake data)
- `HEALTH_CAMPS` array (15 camps)
- `INITIAL_HOSPITAL_VISIT_REQUESTS` array (hardcoded visit requests)

**Issue:** Components import both mockData AND make API calls

```typescript
// In PatientDashboard.tsx
import { INITIAL_HOSPITAL_VISIT_REQUESTS } from '../data/mockData';  // ← Hardcoded

// Render mockData
visitRequests?.map(req => <VisitRequestCard key={req.id} {...req} />)

// ALSO make API call
useEffect(() => {
  api.list('visit_requests').then(res => setVisitRequests(res.items));
}, []);
```

**Result:** Data sources mixed, confusing which is real

### 5.2 Which Pages Use Mock vs. Real APIs

| Page | Hospitals | Doctors | Patients | Appointments | Mock Data |
|------|-----------|---------|----------|---------------|-----------| 
| PartnerHospitalsPage | API | API | - | - | No |
| BookAppointmentPage | API | API | - | - | Fallback |
| DoctorDashboard | Hardcoded | Hardcoded | API | API | Yes (fallback) |
| HospitalDashboard | API | API | - | API | Fallback |
| PatientDashboard | - | - | Hardcoded | Hardcoded | Yes (only) |
| SuperAdminDashboard | API | API | - | - | No |

**Inconsistency:** Some pages show API data, others show stale mock data

### 5.3 State Management

**No Redux/Context for Shared State**

Instead:
- `AuthContext` (login/user info)
- `LiveDataContext` (collections + real-time)
- Local `useState` in each component

**Data flow for appointments:**
```
Patient Component
  ↓ [local state]
  setAppointments(...)
  
Patient clicks "Book"
  ↓ [calls api.create]
  POST /api/records/appointments
  
Server broadcasts SSE event
  ↓ [LiveDataContext receives]
  setCollections({... appointments: [...updated]})
  
Doctor Component (if connected)
  ↓ [SSE listener]
  updates appointments list in real-time
```

---

## 6. FORMS & WORKFLOWS

### 6.1 Registration Workflow

**File:** [src/components/RegistrationModal.tsx](src/components/RegistrationModal.tsx)

**Step-by-Step (Patient Registration Example):**

```
Step 1: Role Selection
  → Select "Patient"

Step 2: Personal Information
  Fields: fullName, fatherName, DOB, age, gender, bloodGroup, occupation, motherTongue
  Validation: ✗ None on frontend (empty strings accepted)

Step 3: Contact Information
  Fields: mobileNumber, email, password, confirmPassword
  Validation: ✗ No email format check
              ✗ No mobile format check (should be 10 digits)
              ✗ No password complexity

Step 4: Address & Location
  Fields: doorNo, street, village, mandal, district, pincode
  Validation: ✗ None

Step 5: Identity Verification
  Fields: Aadhaar, Ration card, govt health scheme, scheme card #
  Document Upload: Stub (field exists but no actual upload)
  Validation: ✗ Aadhaar format not validated (should be 12 digits)

Step 6: Health Details
  Fields: Chronic conditions, allergies, past surgeries
  Validation: ✗ None

Step 7: Emergency Contact
  Fields: Name, relation, phone, address
  Validation: ✗ None

Step 8: Photo & Signature
  Photo Upload: Stub (uses default avatar)
  Signature: Two types
    - Draw (canvas): Stub (doesn't save)
    - Type: Captures text
  Validation: ✗ None

Step 9: Consent & Review
  Declarati on checkbox required
  Review all data

Step 10: Submit
  POST /api/auth/register
    Body: {
      role: 'patient',
      fullName, email, mobileNumber, password,
      // + 50+ other fields
    }
  Response: { token, user, patientId, referenceNo }
  Auto-creates: patients collection entry with status='APPROVED'
  Validation: ✗ Server only checks password.length >= 6
```

**Issues:**

| Issue | Impact | Location |
|-------|--------|----------|
| **No email verification** | Anyone can use fake email | No endpoint for email confirm |
| **No phone OTP** | OTP stub but never verified | [RegistrationModal.tsx](src/components/RegistrationModal.tsx#L290) |
| **No document upload** | No identity verification | Hardcoded file names in form |
| **Instant approval** | Patient status='APPROVED' on registration | [server/index.js](server/index.js#L176) |
| **No KYC validation** | Can register with fake Aadhaar | No backend check |
| **Same password min** | Only 6 characters required | [server/index.js](server/index.js#L134) |
| **No CAPTCHA** | Bot registration possible | None implemented |

### 6.2 Doctor Registration

**File:** [src/components/RegistrationModal.tsx](src/components/RegistrationModal.tsx) (role='doctor')

**Workflow:**
```
Step 1: Select "Doctor"

Step 2: Personal Information
  Fields: fullName, qualifications, speciality, experienceYears
  Validation: ✗ Qualifications not validated against registry
             ✗ No speciality restrictions

Step 3: Hospital Assignment
  Fields: currentHospital (text input or select from list)
  Issue: ✗ No validation that hospital exists
  
Step 4: Consultation Details
  Fields: consultationFee, availability slots
  Validation: ✗ Fee must be > 0 (not checked)

Step 5: Contact & Credentials
  Same as patient (email, phone, password)

Submit:
  POST /api/auth/register { role: 'doctor', ... }
  Auto-creates: doctors collection entry
                doctors.status = 'Active' (no approval workflow)
                User.role = 'doctor'
  
  Backend logic [server/index.js#L186-198]:
    - If speciality not provided: defaults to 'General Medicine'
    - If hospital not provided: defaults to 'Ayudh Network'
    - If experien ceYears not provided: defaults to 5
    - Rating hardcoded to 4.8
```

**Workflow Issues:**
- ✗ No verification of medical license
- ✗ No credential validation against MCI registry
- ✗ No background check
- ✗ Can create fake doctors immediately
- ✗ No approval by hospital

### 6.3 Hospital Registration

**Workflow:**
```
Fields: hospitalName, district, location, totalBeds, availableBeds, specialities
Submit: POST /api/auth/register { role: 'hospital', ... }
Result: hospitals collection created with status='Active' (stub)

Issues:
  ✗ No license verification
  ✗ No accreditation check
  ✗ No admin approval
  ✗ Can immediately access hospital dashboard
```

### 6.4 Booking Workflows

#### Doctor Appointment Booking

**File:** [src/components/BookAppointmentPage.tsx](src/components/BookAppointmentPage.tsx)

```
Step 1: Search/Select Doctor
  - Filter by speciality, location, availability
  - Click doctor card

Step 2: Select Appointment Slot
  - Shows hardcoded availableSlots[] from doctor record
  - Click desired time slot

Step 3: Reason for Visit (optional)
  - Text input (not required)

Step 4: Confirm & Submit
  POST /api/records/appointments
    Body: {
      doctorId, patientId, slotTime, reason,
      status: 'Pending'
      tokenNumber: 'TK-XX' (auto-generated)
    }

Step 5: Display Confirmation
  - Shows appointmentId, token number, OPD location
  - Prints receipt option

Issues:
  ✗ No payment/consultation fee charged
  ✗ No OPD availability validation (just hardcoded slots)
  ✗ Can book same slot multiple times
  ✗ No cancellation workflow
  ✗ Doctor doesn't approve appointment
```

#### Hospital Visit Request

**File:** [src/components/HospitalSearchVisitSection.tsx](src/components/HospitalSearchVisitSection.tsx)

```
Step 1: Search Hospital
  - Filter by location, specialities
  - Click hospital

Step 2: Select Department/Doctor
  - Choose speciality from hospital.specialities[]
  - Optional: select specific doctor

Step 3: Enter Reason
  - Text input (required)

Step 4: Submit Request
  POST /api/records/visit_requests
    Body: {
      patientId, hospitalId,
      reason, preferredDate (optional),
      status: 'Pending',
      requestId: 'AV-VISIT-2024-XXXX' (auto-generated)
    }

Step 5: Hospital Response (Dashboard)
  Hospital sees visit_requests with status='Pending'
  Hospital can:
    - Accept: PATCH status='Accepted'
    - Reject: PATCH status='Rejected'

Issues:
  ✗ No doctor assignment before acceptance
  ✗ No confirmation email sent to patient
  ✗ Patient can't track status (only in dashboard)
  ✗ No cancellation option
  ✗ No appointment slots scheduled
```

### 6.5 Ambulance Booking

**File:** [src/components/AmbulanceBookingPage.tsx](src/components/AmbulanceBookingPage.tsx)

```
Step 1: Select Pickup Location
  - Text input (current location or custom)

Step 2: Select Destination
  - Select from hospital list or enter custom

Step 3: Reason for Ambulance
  - Select from dropdown (Emergency, Routine transfer, etc.)

Step 4: Submit
  POST /api/records/ambulance_bookings
    Body: {
      patientId, pickupLocation, destination, reason,
      status: 'Dispatched'
      driverName: 'Suresh Varma (Paramedic Driver)' (hardcoded)
      driverContact: '9000045073' (hardcoded)
      eta: '8 - 12 Minutes' (hardcoded)
    }

Issues:
  ✗ Driver info hardcoded (no real assignment)
  ✗ ETA fake (no GPS/routing)
  ✗ No real ambulance fleet management
  ✗ Payment not collected
  ✗ No tracking
```

### 6.6 Incomplete Workflows

| Workflow | Status | Missing Pieces |
|----------|--------|-----------------|
| Lab Test Booking | Partial | No lab selection, no package pricing |
| Home Care | Stub | No staff assignment, no scheduling |
| Insurance Claims | Stub | No claim form, no payment |
| Prescriptions | Stub | No medicine info, no pharmacy link |
| Health Records | Stub | No file upload, no document storage |
| Membership | Partial | Form exists, no payment/approval |
| Emergency Support | Stub | No dispatcher, no SOS location |
| Callback Requests | Stub | No agent assignment |

---

## 7. ROUTING & NAVIGATION

### 7.1 Routing Mechanism

**Current Method:** localStorage-based state machine (NOT React Router)

**Navigation Keys:**
```typescript
// Main navigation
'ayudh_activeTab' → 'home' | 'about' | 'services' | 'doctors' | ...

// Modal states (overlays)
activeModal → 'login' | 'register' | 'book_appointment' | ...

// View toggles
'ayudh_isLoginView' → true/false
'ayudh_isPartnerView' → true/false
'ayudh_isBookAppointmentView' → true/false
// ... 9 more similar flags

// Nested navigation
'ayudh_patientActiveTab' → 'dashboard' | 'appointments' | ...

// Post-registration flow
'ayudh_pendingAfterRegister' → {
  type: 'hospital_visit' | 'tab',
  hospitalId?: string,
  tab?: string
}
```

**Issues:**

| Issue | Impact |
|-------|--------|
| **No URL routing** | Cannot deep-link: `ayudh.com/patient/appointments` doesn't work |
| **No browser history** | Back button doesn't navigate within app |
| **Refresh loses state** | F5 reloads public homepage, not current page |
| **Debugging hard** | Can't share "current page" link |
| **SEO broken** | All pages at `/` (no crawlable routes) |
| **State in localStorage** | Public + large (every flag stored) |
| **Flag explosion** | 11+ boolean flags for page state |

### 7.2 Navigation Flows

#### Public User Journey

```
[Landing Page]
  ↓ [Click "Book Doctor" button]
  {activeModal: 'book_appointment'}  [Modal opens]
  ↓ [Choose doctor]
  {isBookAppointmentView: true}  [Page changes view]
  ↓ [Continue without login]
  {modal closes, back to home page}
  ↓ [Click "Sign In"]
  {isLoginView: true, activeTab: 'home'}  [Login view overlays]
  ↓ [Submit login]
  {isLoginView: false, user set, redirect to PatientDashboard}
  
[Patient Dashboard]
  Tabs: dashboard | appointments | hospitals | doctors | settings | logout
  ↓ [Click "Book Appointment"]
  {patientActiveTab: 'appointments', modal: 'book_appointment'}
  ↓ [Book and close]
  {patientActiveTab: 'appointments', appointments list updates via SSE}
```

**Flow Issues:**
- ✗ Can navigate back to home by clicking logo, but state not cleared
- ✗ Modal-based navigation (not proper pages)
- ✗ No confirmation before leaving unsaved forms

### 7.3 Missing Routes

| Route Needed | Current Solution | Impact |
|--------------|------------------|--------|
| `/dashboard` | isLoginView=false + user set | Not accessible directly |
| `/appointments/:id` | Tab selection in dashboard | Can't link to specific appointment |
| `/doctor/:id` | Modal with doctor details | Can't share doctor profile |
| `/hospital/:id` | Modal with hospital details | Can't link to hospital page |
| `/health-camps/:id` | Modal or tab | No camp detail page |
| `/registration` | Modal inside login | Can't start registration directly |
| `/404` | Undefined behavior | Missing pages crash app |
| `/admin` | SuperAdminDashboard | Role hardcoded, no URL |

### 7.4 Can Deep-Linking Work?

**Current State:** NO

**Example Attempted Deep-Links:**
- `https://ayudh-vikas.com/patient/appointments`
  → Result: Lands on public home (localStorage not set)
  
- `https://ayudh-vikas.com/doctor/doc-123`
  → Result: Lands on public home (no routing logic)

**Why Broken:**
```typescript
// App.tsx render logic
export default function App() {
  const savedTab = getSavedState('ayudh_activeTab', 'home');
  // ← Only restores from localStorage, not URL
  
  // No route parsing
  if (window.location.pathname !== '/') {
    // No handling
  }
}
```

**To Fix:** Implement React Router
```typescript
// What should exist
import { BrowserRouter, Routes, Route } from 'react-router-dom';

<Routes>
  <Route path="/" element={<PublicLayout />}>
    <Route index element={<Home />} />
    <Route path="doctor/:id" element={<DoctorDetail />} />
    <Route path="hospital/:id" element={<HospitalDetail />} />
  </Route>
  <Route path="/dashboard" element={<ProtectedRoute><PatientDashboard /></ProtectedRoute>} />
  <Route path="/dashboard/appointments" element={<ProtectedRoute><AppointmentsPage /></ProtectedRoute>} />
  <Route path="*" element={<NotFound />} />
</Routes>
```

---

## 8. MISSING FEATURES & INCOMPLETE WORKFLOWS

### 8.1 Started But Not Finished

| Feature | Location | Status | Issue |
|---------|----------|--------|-------|
| **OTP Verification** | RegistrationModal.tsx | Stub (60% UI) | Logic present but never called |
| **Document Upload** | RegistrationModal.tsx | Field only | Files sent as names not binary |
| **Signature Capture** | RegistrationModal.tsx | Canvas + text | Never persisted to backend |
| **Payment Processing** | Various | None | All bookings free |
| **Insurance Claims** | InsuranceApp form | Stub | No backend processing |
| **Prescription Fulfillment** | PatientDashboard | Tab only | Can't view medicines |
| **Real-time Chat** | Component stub | Not started | Placeholder only |
| **Video Consultations** | Not present | Not started | No infrastructure |
| **Referral System** | Not present | Not started | Doctor → Doctor referral |

### 8.2 Pages Without Backend Integration

| Page | Frontend Exists | API Calls | Issue |
|------|-----------------|-----------|-------|
| HomeServicePage | Yes | ✗ None | Hardcoded staff, no actual staff availability |
| PatientDashboard (profile) | Yes | Partial | Shows mockData profile, not API data |
| DoctorDashboard (profile) | Yes | Partial | Hardcoded doctor details |
| HospitalDashboard (beds) | Yes | Partial | Shows mock bed availability |
| PatientInsuranceBookingPage | Yes | ✗ None | Form-only, no insurance companies from API |
| EmergencySupportPage | Yes | ✗ None | No dispatcher backend |
| PartnerWithUsPage | Yes | ✓ Creates | Form submits to partnerships collection |

### 8.3 Verification Workflows Missing

| Verification Type | Exists | Backend | Frontend | Issue |
|-------------------|--------|---------|----------|-------|
| **Email Verification** | No | ✗ | ✗ | Anyone can register with fake email |
| **Phone OTP** | Partial | ✗ | Stub | OTP form exists but not verified |
| **Patient ID Lookup** | Yes | ✓ | ✓ | Works but public (no auth required) |
| **Doctor License Verification** | No | ✗ | ✗ | Can register as doctor without credentials |
| **Hospital Accreditation** | No | ✗ | ✗ | Can register hospital without approval |
| **Address Verification** | No | ✗ | ✗ | No geocoding/pincode validation |
| **Aadhaar Verification** | No | ✗ | ✗ | Field exists, not validated |
| **Document Verification** | No | ✗ | ✗ | Files not uploaded, not scanned |
| **Appointment Confirmation** | Partial | ✓ | ✓ | Patient sees appointment, doctor must accept manually |

### 8.4 Data Validation Gaps

| Input Field | Frontend Validation | Backend Validation | Issue |
|-------------|--------------------|--------------------|-------|
| Email | ✗ | ✗ | No format check, no verification |
| Phone | ✗ | ✗ | Accepts non-10-digit numbers |
| Password | Length >= 6 only | Length >= 6 only | No complexity (uppercase, special chars) |
| Aadhaar | ✗ | ✗ | Not 12-digit check |
| Pincode | ✗ | ✗ | No state/district validation |
| Appointment Reason | ✗ | ✗ | Can be empty |
| Doctor Consultation Fee | ✗ (frontend: optional) | ✗ | Can be 0 or negative |
| Hospital Beds | ✗ | ✗ | Can be negative |
| Blood Group | Dropdown select | ✗ | Good, but no backend check |
| Age | Text input | ✗ | Accepts negative, >150 |

### 8.5 Permission Gaps in Workflows

| Workflow | Gap | Impact |
|----------|-----|--------|
| **Doctor views patients** | No role check on /api/patients/lookup | Any logged-in user can enumerate patients |
| **Doctor creates prescriptions** | No check that patient is doctor's | Can prescribe for any patient |
| **Hospital confirms visit** | No check that request is for hospital's patients | Any hospital can confirm any patient's visit |
| **Ambulance booking** | No driver/ambulance assignment | Fake vehicles in bookings |
| **Lab test booking** | No lab partner linked | Tests not sent to actual lab |
| **Camp registration** | No duplicate prevention | Can register same patient multiple times |
| **Marketing lead assignment** | No validation that doctor exists | Can assign to fake doctors |

### 8.6 Integration Gaps

| System | Status | Gap |
|--------|--------|-----|
| **Payment Gateway** | ✗ | No Razorpay/PayU integration |
| **SMS Gateway** | ✗ | No OTP/appointment reminders sent |
| **Email Service** | ✗ | No registration confirmation emails |
| **Aadhaar Verification** | ✗ | No e-KYC API |
| **Insurance API** | ✗ | No policy lookup |
| **Geolocation Services** | ✗ | No GPS-based search |
| **Maps/Directions** | Partial | Google Maps embed but no actual routing |
| **File Storage** | ✗ | No S3/cloud storage for documents |
| **Analytics** | ✗ | No tracking/events |

---

## 9. CRITICAL SECURITY & ARCHITECTURAL ISSUES

### Priority 1: CRITICAL (Fix Immediately)

| Issue | Risk | Location | Impact |
|-------|------|----------|--------|
| **All records publicly readable** | HIPAA violation | `/api/records/:collection` | Patients, prescriptions, insurances, ambulance records exposed |
| **Anyone can modify any record** | Data integrity | `PATCH /api/records/:collection/:id` | Attacker can edit appointments, prescriptions, health records |
| **No RBAC on CRUD** | Privilege escalation | All endpoints | Doctor can see all patient data, not just own |
| **JWT secret hardcoded** | Token forgery | crypto-auth.js | Attacker can create fake tokens |
| **No email verification** | Fake accounts | /api/auth/register | Can register with anyone's email |
| **Guest has patient perms** | Unauthorized access | AuthContext | Unauthenticated users can view hospital/doctor data |
| **SSE broadcasts all data** | Data leakage | /api/stream | Real-time data sent to all connected users |

### Priority 2: HIGH (Fix Soon)

| Issue | Impact |
|-------|--------|
| **No pagination on user list** | DoS: GET /api/users?role=patient returns 100K+ records |
| **Can delete own admin account** | Privileged access escalation if admin token compromised |
| **No rate limiting on login** | Brute force attacks on credentials |
| **No input validation** | SQL injection (if using dynamic queries), XSS on display |
| **localStorage stores token** | XSS vulnerability (JS can steal token) |
| **No CORS restrictions** | CSRF attacks possible |
| **Status auto-approved** | Any registration instantly active |
| **No soft deletes** | Audit trail impossible |

### Priority 3: MEDIUM (Fix This Sprint)

| Issue | Impact |
|-------|--------|
| **No form validation** | Bad data in database |
| **Hardcoded mock data** | Confusion between real/fake data |
| **No error handling** | App crashes on API errors |
| **localStorage-based routing** | No deep linking, no SEO |
| **No loading/error states** | Poor UX |
| **Doctor-Hospital sync manual** | Data inconsistency risk |

---

## 10. RECOMMENDATIONS & NEXT STEPS

### Short Term (Week 1)

```markdown
1. [ ] Add role-based access control to all /api/records/* endpoints
   - Patients can only read own records
   - Doctors can read patient records only if appointment exists
   - Hospitals can read own visit requests and appointments
   - Admin only can read all

2. [ ] Add email verification workflow
   - Send OTP to email on registration
   - Require verification before account activation

3. [ ] Add input validation on backend
   - Email format (RFC 5322)
   - Phone length (10 digits for India)
   - Password complexity (min 8 chars, 1 uppercase, 1 number, 1 special)
   - Aadhaar format (12 digits)

4. [ ] Fix guest user
   - Remove patient permissions
   - Make guest read-only (view-only mode)
   - Or remove guest mode entirely

5. [ ] Add basic rate limiting
   - login endpoint: max 5 attempts/minute per IP
   - /api/records: max 100 requests/minute per user
```

### Medium Term (Week 2-3)

```markdown
1. [ ] Implement proper routing with React Router
   - Define /dashboard, /appointments/:id, /doctor/:id, etc.
   - Add ProtectedRoute component for auth checks
   - Fix deep-linking

2. [ ] Add RBAC middleware
   - canViewRecord(user, collection, recordId) function
   - canEditRecord(user, collection, recordId) function
   - canCreateRecord(user, collection) function
   - Use in all endpoints

3. [ ] Implement document upload
   - S3 or similar cloud storage
   - File type validation (PDF, JPG only)
   - Virus scan
   - Link documents to records (Aadhaar, license, etc.)

4. [ ] Add SSE authentication
   - Token in URL (current) OR header (better)
   - Filter events by user role/permissions
   - Don't broadcast sensitive data to all users

5. [ ] Improve form validation
   - Frontend: React Hook Form + Zod schemas
   - Backend: Validate schema before creating record
   - Show field-level errors

6. [ ] Add status workflow states
   - Registration: pending → approved/rejected
   - Appointment: pending → confirmed → completed/cancelled
   - Prescription: pending → filled → collected
   - Implement proper state machine
```

### Long Term (Month 2)

```markdown
1. [ ] Add multi-factor authentication (MFA)
   - SMS OTP option
   - TOTP app support
   - Backup codes

2. [ ] Implement audit logging
   - Log all mutations (create/update/delete)
   - Include user ID, timestamp, old value, new value
   - Immutable audit table

3. [ ] Add comprehensive error handling
   - Error boundaries at component level
   - User-friendly error messages
   - Automatic error reporting to Sentry

4. [ ] Implement caching & pagination
   - Cache bootstrap data (hospitals, doctors, camps)
   - Add pagination to all list endpoints
   - Cache invalidation strategy

5. [ ] Add real-time notifications
   - When appointment confirmed
   - When ambulance dispatched
   - When prescription ready
   - Use push notifications (web + mobile)

6. [ ] Implement proper payment processing
   - Razorpay integration
   - Booking status only confirmed after payment
   - Refund handling

7. [ ] Add analytics & monitoring
   - Track user flows
   - Monitor API performance
   - Alert on error rate spikes
```

### Code Quality Improvements

```markdown
1. [ ] Add TypeScript strict mode
   - Enable noImplicitAny, strictNullChecks
   - Fix type errors

2. [ ] Add unit tests
   - Auth flows (login, register)
   - RBAC permission checks
   - Data validation

3. [ ] Add integration tests
   - End-to-end booking workflows
   - Multi-user scenarios

4. [ ] Setup CI/CD
   - GitHub Actions for tests on PR
   - Lint on push
   - Auto-deploy to staging

5. [ ] Add API documentation
   - OpenAPI/Swagger spec
   - Document all endpoints
   - Document error responses
```

---

## 11. SECURITY CHECKLIST

- [ ] All API endpoints protected with appropriate auth middleware
- [ ] Role-based access control on all CRUD operations
- [ ] Email verification on account creation
- [ ] Input validation on all forms (frontend + backend)
- [ ] Rate limiting on auth endpoints
- [ ] CORS properly configured (no `*`)
- [ ] JWT secret strong and in environment variables only
- [ ] No hardcoded secrets in code or .env.example
- [ ] Password hashing with salt (implemented correctly)
- [ ] No sensitive data in localStorage (only token)
- [ ] Error messages don't leak system info
- [ ] Admin actions logged and auditable
- [ ] Document upload with type/size validation
- [ ] SSE streams authenticated per-user
- [ ] SQL injection protection (parameterized queries exist)
- [ ] XSS protection (React auto-escapes by default)
- [ ] CSRF tokens on state-changing requests
- [ ] Secure cookie attributes (HttpOnly, Secure, SameSite)

---

## 12. SUMMARY TABLE

| Category | Status | Score | Notes |
|----------|--------|-------|-------|
| **Authentication** | Partial | 6/10 | JWT works, but guest mode too permissive |
| **Authorization** | Critical Gap | 2/10 | Almost no RBAC on records endpoints |
| **Data Models** | Good | 7/10 | 23 collections, but denormalized, no FK constraints |
| **API Design** | Poor | 4/10 | Generic CRUD endpoints with no filtering |
| **Routing** | Critical Gap | 1/10 | No URL routing, localStorage-based only |
| **Forms & Validation** | Partial | 4/10 | No client/server validation, workflows incomplete |
| **Real-time Updates** | Good | 7/10 | SSE works but not secured |
| **Documentation** | None | 0/10 | No API docs, no architecture docs |
| **Testing** | None | 0/10 | No unit/integration tests |
| **Code Quality** | Fair | 5/10 | Inconsistent patterns, mix of TS/JS |

**Overall Score:** 3.6 / 10

**Verdict:** App is functionally usable for development/demo but **NOT production-ready** due to critical security gaps in RBAC and data access control.

---

## Appendix: File Structure Reference

```
├── server/
│   ├── index.js ..................... Express app + all API endpoints
│   ├── db.js ........................ Database layer (PostgreSQL + local)
│   ├── crypto-auth.js ............... JWT + password hashing
│   ├── seed.js ...................... Initial data for local JSON
│   ├── local-data.json .............. SQLite-like JSON store
│   └── dev.mjs ...................... Dev server startup
│
├── src/
│   ├── App.tsx ...................... Main app (routing via localStorage)
│   ├── main.tsx ..................... React entry point
│   ├── types.ts ..................... TypeScript interfaces
│   ├── context/
│   │   ├── AuthContext.tsx .......... User auth state + JWT
│   │   └── LiveDataContext.tsx ...... Real-time collections + SSE
│   ├── lib/
│   │   └── api.ts ................... Fetch wrapper + API methods
│   ├── components/
│   │   ├── LoginPage.tsx ............ Login form
│   │   ├── RegistrationModal.tsx .... Multi-step registration
│   │   ├── PatientDashboard.tsx ..... Patient hub
│   │   ├── DoctorDashboard.tsx ...... Doctor hub
│   │   ├── HospitalDashboard.tsx .... Hospital admin
│   │   ├── SuperAdminDashboard.tsx .. System admin
│   │   ├── MarketingDashboard.tsx ... Lead tracking
│   │   ├── CommunityRoleDashboard.tsx Volunteer/organizer hub
│   │   ├── BookAppointmentPage.tsx .. Doctor booking flow
│   │   ├── HospitalSearchVisitSection.tsx Visit request flow
│   │   ├── AmbulanceBookingPage.tsx  Emergency ambulance
│   │   ├── LabTestsPage.tsx ......... Lab test booking
│   │   └── ... (20+ more pages)
│   └── data/
│       └── mockData.ts .............. Hardcoded demo data
│
├── .env.example ..................... Environment template
├── package.json ..................... Dependencies
├── tsconfig.json .................... TypeScript config
├── vite.config.ts ................... Vite build config
└── docker-compose.yml ............... PostgreSQL for dev
```

---

**End of Audit Report**

Generated: September 9, 2026  
Auditor: Architectural Review  
Status: Draft for Review
