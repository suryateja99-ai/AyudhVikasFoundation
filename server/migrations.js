function makeId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`.toUpperCase();
}

function asRoles(user) {
  if (Array.isArray(user.roles) && user.roles.length) return user.roles;
  const role = user.primaryRole || user.role || 'patient';
  return [role];
}

export async function migrateToNewSchema(db) {
  const users = await db.listUsers({});
  for (const user of users) {
    const roles = asRoles(user);
    const primaryRole = user.primaryRole || user.role || roles[0];
    const needsRoles = !Array.isArray(user.roles) || user.roles.length === 0 || user.primaryRole !== primaryRole;
    if (needsRoles) {
      await db.updateUser(user.id, {
        roles,
        primaryRole,
        role: primaryRole,
      });
    }
  }

  const doctors = await db.list('doctors');
  const existingAssignments = await db.list('doctor_hospital_assignments');
  const assignmentKeys = new Set(existingAssignments.map((row) => `${row.doctorId}:${row.hospitalId}`));
  for (const doctor of doctors) {
    const patch = {};
    if (!doctor.verificationStatus) {
      patch.verificationStatus =
        doctor.status === 'PENDING_VERIFICATION' || doctor.status === 'REJECTED' ? doctor.status : 'VERIFIED';
    }
    if (Object.keys(patch).length) {
      await db.update('doctors', doctor.id, patch);
    }
    if (doctor.hospitalId && !assignmentKeys.has(`${doctor.id}:${doctor.hospitalId}`)) {
      await db.create('doctor_hospital_assignments', {
        id: makeId('DHA'),
        doctorId: doctor.id,
        hospitalId: doctor.hospitalId,
        consultationFee: doctor.consultationFee,
        department: doctor.speciality,
        status: 'Active',
      });
      assignmentKeys.add(`${doctor.id}:${doctor.hospitalId}`);
    }
  }

  const hospitals = await db.list('hospitals');
  const allBeds = await db.list('hospital_beds');
  for (const hospital of hospitals) {
    if (!hospital.verificationStatus) {
      await db.update('hospitals', hospital.id, { verificationStatus: 'VERIFIED', status: hospital.status || 'Active' });
    }
    const beds = allBeds.filter((bed) => bed.hospitalId === hospital.id);
    if (!beds.length && Number(hospital.totalBeds || 0) > 0) {
      const general = Math.max(4, Math.floor(Number(hospital.totalBeds) * 0.6));
      const icu = Math.max(1, Number(hospital.icuBeds || Math.floor(Number(hospital.totalBeds) * 0.1)));
      const privateBeds = Math.max(1, Number(hospital.totalBeds) - general - icu);
      const created = [];
      const addBeds = async (count, wardType, prefix) => {
        for (let i = 1; i <= count; i += 1) {
          const bed = await db.create('hospital_beds', {
            id: `${prefix}-${hospital.id}-${String(i).padStart(3, '0')}`.toUpperCase(),
            hospitalId: hospital.id,
            wardType,
            bedNumber: `${wardType.slice(0, 3).toUpperCase()}-${String(i).padStart(3, '0')}`,
            floor: wardType === 'ICU' ? 2 : 1,
            roomNumber: `${wardType.slice(0, 1)}${100 + i}`,
            status: i <= Math.ceil(count * 0.25) ? 'occupied' : 'available',
          });
          created.push(bed);
        }
      };
      await addBeds(Math.min(general, 12), 'General', 'BED');
      await addBeds(Math.min(icu, 6), 'ICU', 'BED');
      await addBeds(Math.min(privateBeds, 6), 'Private', 'BED');
      const occupied = created.filter((bed) => bed.status === 'occupied').length;
      await db.update('hospitals', hospital.id, {
        totalBeds: created.length,
        availableBeds: created.length - occupied,
      });
    }
  }

  console.log('[migrate] Schema compatibility migration complete');
}
