const express = require('express');
const store = require('../store');
const { STATUSES } = require('../status');
const {
  validateRegisterPayload,
  validateStatusPayload,
} = require('../validators');

const router = express.Router();

// ---- Feature 1: Register & list -------------------------------------------

// POST /patients  -> register
router.post('/', (req, res) => {
  const errors = validateRegisterPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'ValidationError', details: errors });
  }
  try {
    const patient = store.add({
      patientId: String(req.body.patientId).trim(),
      name: String(req.body.name).trim(),
      doctorAssigned: String(req.body.doctorAssigned).trim(),
      visitDate: req.body.visitDate,
    });
    return res.status(201).json(patient);
  } catch (err) {
    if (err.code === 'DUPLICATE_ID') {
      return res.status(409).json({ error: 'DuplicateId', message: err.message });
    }
    throw err;
  }
});

// GET /patients  -> list (supports ?sort=visitDate&order=asc|desc)
router.get('/', (req, res) => {
  let patients = store.list();
  const { sort, order } = req.query;
  if (sort === 'visitDate') {
    const dir = order === 'desc' ? -1 : 1;
    patients = [...patients].sort(
      (a, b) => dir * (new Date(a.visitDate) - new Date(b.visitDate))
    );
  }
  return res.json(patients);
});

// ---- Feature 3: Smart views ------------------------------------------------
// NOTE: declared before '/:patientId' so they are not shadowed by the param route.

// GET /patients/in-consultation
router.get('/in-consultation', (_req, res) => {
  const inConsult = store
    .list()
    .filter((p) => p.status === STATUSES.IN_CONSULTATION);
  return res.json(inConsult);
});

// GET /patients/today
router.get('/today', (_req, res) => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();
  const startOfDay = new Date(y, m, d).getTime();
  const endOfDay = new Date(y, m, d + 1).getTime();
  const todays = store.list().filter((p) => {
    const t = new Date(p.visitDate).getTime();
    return t >= startOfDay && t < endOfDay;
  });
  return res.json(todays);
});

// ---- Feature 5: Summary ----------------------------------------------------

// GET /patients/summary
router.get('/summary', (_req, res) => {
  const all = store.list();
  const summary = {
    total: all.length,
    registered: 0,
    inConsultation: 0,
    discharged: 0,
  };
  for (const p of all) {
    if (p.status === STATUSES.REGISTERED) summary.registered += 1;
    else if (p.status === STATUSES.IN_CONSULTATION) summary.inConsultation += 1;
    else if (p.status === STATUSES.DISCHARGED) summary.discharged += 1;
  }
  return res.json(summary);
});

// GET /patients/:patientId
router.get('/:patientId', (req, res) => {
  const patient = store.get(req.params.patientId);
  if (!patient) {
    return res
      .status(404)
      .json({ error: 'NotFound', message: `patient '${req.params.patientId}' not found` });
  }
  return res.json(patient);
});

// ---- Feature 2: Status update ---------------------------------------------

// PATCH /patients/:patientId/status  body: { status }
router.patch('/:patientId/status', (req, res) => {
  const errors = validateStatusPayload(req.body);
  if (errors.length) {
    return res.status(400).json({ error: 'ValidationError', details: errors });
  }
  try {
    const updated = store.updateStatus(req.params.patientId, req.body.status);
    return res.json(updated);
  } catch (err) {
    if (err.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'NotFound', message: err.message });
    }
    if (err.code === 'INVALID_TRANSITION') {
      return res
        .status(409)
        .json({ error: 'InvalidTransition', message: err.message });
    }
    throw err;
  }
});

module.exports = router;
