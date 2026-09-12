export function userRolesOf(user) {
  if (!user) return [];
  if (Array.isArray(user.roles) && user.roles.length) return user.roles;
  const single = user.primaryRole || user.role;
  return single ? [single] : [];
}

export function userHasRole(user, roles) {
  const needed = Array.isArray(roles) ? roles : [roles];
  const have = userRolesOf(user);
  return needed.some((role) => have.includes(role));
}

export function authRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!userHasRole(req.user, roles)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
}

export function requireOwnership(getOwnerId) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    const ownerId = getOwnerId(req);
    if (req.user.id !== ownerId && !userHasRole(req.user, 'admin')) {
      return res.status(403).json({ error: 'You do not have permission to access this resource' });
    }
    next();
  };
}

export function requirePatientMatch(req, res, next) {
  const userPatientId = req.user?.patientId || req.user?.data?.patientId;
  const queryPatientId = req.query.patientId || req.body?.patientId;

  if (queryPatientId && queryPatientId !== userPatientId && !userHasRole(req.user, 'admin')) {
    return res.status(403).json({ error: 'Cannot access other patient records' });
  }
  next();
}

export function applyRoleBasedFilters(collection, filter, userRole, userId, userData = {}) {
  const filters = { ...filter };
  const roles = Array.isArray(userRole) ? userRole : [userRole];
  const isAdmin = roles.includes('admin');
  if (isAdmin) return filters;

  const patientId = userData.patientId;
  const doctorId = userData.doctorId;
  const hospitalId = userData.hospitalId;

  switch (collection) {
    case 'patients':
      if (roles.includes('patient') && patientId) {
        filters.id = patientId;
      }
      break;
    case 'appointments':
    case 'ambulance_bookings':
    case 'lab_bookings':
    case 'home_care_bookings':
    case 'camp_registrations':
    case 'memberships':
    case 'tickets':
    case 'feedback':
    case 'health_records':
    case 'reminders':
    case 'wallet_txns':
    case 'insurance_applications':
      if (roles.includes('patient') && patientId) filters.patientId = patientId;
      else if (roles.includes('doctor') && doctorId && collection === 'appointments') filters.doctorId = doctorId;
      else if (roles.includes('hospital') && hospitalId) filters.hospitalId = hospitalId;
      break;
    case 'visit_requests':
      if (roles.includes('patient') && patientId) filters.patientId = patientId;
      else if (roles.includes('hospital') && hospitalId) filters.hospitalId = hospitalId;
      break;
    case 'prescriptions':
      if (roles.includes('patient') && patientId) filters.patientId = patientId;
      else if (roles.includes('doctor') && doctorId) filters.doctorId = doctorId;
      else if (roles.includes('hospital') && hospitalId) filters.hospitalId = hospitalId;
      break;
    case 'leads':
      if (roles.includes('marketing')) filters.assignedTo = userId;
      break;
    case 'notifications':
      filters.userId = userId;
      break;
    case 'hospital_beds':
      if (roles.includes('hospital') && hospitalId) filters.hospitalId = hospitalId;
      else if (!roles.includes('admin') && !roles.includes('doctor')) {
        filters.hospitalId = '__none__';
      }
      break;
    case 'doctor_hospital_assignments':
      if (roles.includes('hospital') && hospitalId) filters.hospitalId = hospitalId;
      else if (roles.includes('doctor') && doctorId) filters.doctorId = doctorId;
      else if (!roles.includes('admin')) filters.doctorId = '__none__';
      break;
    default:
      break;
  }

  return filters;
}

export function canModifyRecord(user, collection, record) {
  if (!user) return false;
  if (userHasRole(user, 'admin')) return true;
  const patientId = user.patientId || user.data?.patientId;
  const doctorId = user.doctorId || user.data?.doctorId;
  const hospitalId = user.hospitalId || user.data?.hospitalId;

  if (record.createdBy && record.createdBy === user.id) return true;
  if (userHasRole(user, 'patient') && patientId && (record.patientId === patientId || record.id === patientId)) return true;
  if (userHasRole(user, 'doctor') && doctorId && (record.doctorId === doctorId || record.id === doctorId)) return true;
  if (userHasRole(user, 'hospital') && hospitalId && (record.hospitalId === hospitalId || record.id === hospitalId)) return true;
  if (collection === 'notifications' && record.userId === user.id) return true;
  return false;
}

export const PUBLIC_READ_COLLECTIONS = ['hospitals', 'doctors', 'health_camps'];
export const PUBLIC_CREATE_COLLECTIONS = [
  'callbacks',
  'camp_registrations',
  'enquiries',
  'emergencies',
  'partnerships',
  'memberships',
  'appointments',
  'ambulance_bookings',
  'lab_bookings',
  'home_care_bookings',
];
