function isVerified(record) {
  const status = String(record?.verificationStatus || record?.status || 'VERIFIED').toUpperCase();
  return status !== 'PENDING_VERIFICATION' && status !== 'REJECTED' && status !== 'PENDING';
}

export function normalizeSpeciality(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z]/g, ' ')
    .replace(/\b(ologist|ology|ician|ics|ic|s)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function specialityMatches(haystack, needle) {
  if (!needle) return true;
  const want = normalizeSpeciality(needle);
  if (!want) return true;
  const list = Array.isArray(haystack) ? haystack : [haystack];
  return list.some((item) => {
    const have = normalizeSpeciality(item);
    if (!have) return false;
    return have.includes(want) || want.includes(have);
  });
}

function hospitalSpecialities(hospital, doctors = []) {
  const fromHospital = [
    ...(hospital.specialities || []),
    hospital.speciality,
    hospital.primarySpeciality,
    ...(hospital.keySpecialities || []),
  ];
  const fromDoctors = doctors.flatMap((doctor) => [doctor.speciality, ...(doctor.specialities || [])]);
  return [...fromHospital, ...fromDoctors].filter(Boolean);
}

export async function searchHospitals(db, query = {}) {
  const q = String(query.q || query.query || '').trim().toLowerCase();
  const district = String(query.district || '').trim();
  const speciality = String(query.speciality || query.department || '').trim();
  const sort = String(query.sort || 'distance');

  const [hospitals, doctors] = await Promise.all([db.list('hospitals'), db.list('doctors')]);
  const verifiedHospitals = hospitals.filter(isVerified);
  const verifiedDoctors = doctors.filter(isVerified);

  const items = verifiedHospitals
    .map((hospital) => {
      const attached = verifiedDoctors.filter(
        (doctor) =>
          doctor.hospitalId === hospital.id ||
          String(doctor.hospital || '').toLowerCase().includes(String(hospital.shortName || hospital.name || '').toLowerCase())
      );
      const seniorDoctors = (hospital.seniorDoctors || []).length ? hospital.seniorDoctors : attached;
      const specialities = Array.from(new Set(hospitalSpecialities(hospital, attached)));
      return { ...hospital, seniorDoctors, specialities, matchedDoctors: attached };
    })
    .filter((hospital) => {
      if (district && district !== 'All' && String(hospital.district || '').toLowerCase() !== district.toLowerCase()) {
        return false;
      }
      if (speciality && speciality !== 'All' && !specialityMatches(hospital.specialities, speciality)) {
        return false;
      }
      if (q) {
        const blob = [
          hospital.name,
          hospital.shortName,
          hospital.location,
          hospital.address,
          hospital.district,
          ...(hospital.specialities || []),
          ...(hospital.seniorDoctors || []).map((d) => `${d.name} ${d.speciality} ${d.designation || ''}`),
        ]
          .join(' ')
          .toLowerCase();
        if (!blob.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sort === 'rating') return Number(b.rating || 0) - Number(a.rating || 0);
      if (sort === 'beds') return Number(b.availableBeds || 0) - Number(a.availableBeds || 0);
      return Number(a.distanceKm || 99) - Number(b.distanceKm || 99);
    });

  return { items, total: items.length };
}

export async function searchDoctors(db, query = {}) {
  const q = String(query.q || '').trim().toLowerCase();
  const district = String(query.district || '').trim();
  const speciality = String(query.speciality || '').trim();
  const hospitalId = String(query.hospitalId || '').trim();

  const doctors = (await db.list('doctors')).filter(isVerified);
  const items = doctors.filter((doctor) => {
    if (hospitalId && doctor.hospitalId !== hospitalId) return false;
    if (district && district !== 'All' && String(doctor.district || '').toLowerCase() !== district.toLowerCase()) return false;
    const specs = [doctor.speciality, ...(doctor.specialities || [])];
    if (speciality && speciality !== 'All' && !specialityMatches(specs, speciality)) return false;
    if (q) {
      const blob = `${doctor.name} ${doctor.speciality} ${(doctor.specialities || []).join(' ')} ${doctor.hospital || ''} ${doctor.district || ''}`.toLowerCase();
      if (!blob.includes(q)) return false;
    }
    return true;
  });

  return { items, total: items.length };
}
