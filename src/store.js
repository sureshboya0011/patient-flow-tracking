const { STATUSES, isValidTransition } = require('./status');

/**
 * Simple in-memory store for patients. Keyed by patientId.
 * Replace with a real DB later; the API below is intentionally narrow.
 */
class PatientStore {
  constructor() {
    this._patients = new Map();
  }

  has(patientId) {
    return this._patients.has(patientId);
  }

  get(patientId) {
    return this._patients.get(patientId) || null;
  }

  list() {
    return Array.from(this._patients.values());
  }

  add(patient) {
    if (this._patients.has(patient.patientId)) {
      const err = new Error(`patientId '${patient.patientId}' already exists`);
      err.code = 'DUPLICATE_ID';
      throw err;
    }
    const record = {
      patientId: patient.patientId,
      name: patient.name,
      doctorAssigned: patient.doctorAssigned,
      status: STATUSES.REGISTERED,
      visitDate: patient.visitDate || new Date().toISOString(),
    };
    this._patients.set(record.patientId, record);
    return record;
  }

  updateStatus(patientId, nextStatus) {
    const patient = this._patients.get(patientId);
    if (!patient) {
      const err = new Error(`patient '${patientId}' not found`);
      err.code = 'NOT_FOUND';
      throw err;
    }
    if (!isValidTransition(patient.status, nextStatus)) {
      const err = new Error(
        `invalid transition: ${patient.status} -> ${nextStatus}`
      );
      err.code = 'INVALID_TRANSITION';
      throw err;
    }
    patient.status = nextStatus;
    return patient;
  }

  // For tests
  _reset() {
    this._patients.clear();
  }
}

module.exports = new PatientStore();
module.exports.PatientStore = PatientStore;
