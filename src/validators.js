const { STATUSES, isValidStatus } = require('./status');

const REQUIRED_REGISTER_FIELDS = ['patientId', 'name', 'doctorAssigned'];

function validateRegisterPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['request body must be a JSON object'];
  }
  for (const field of REQUIRED_REGISTER_FIELDS) {
    const value = body[field];
    if (value === undefined || value === null || String(value).trim() === '') {
      errors.push(`'${field}' is required`);
    }
  }
  if (body.visitDate !== undefined && Number.isNaN(Date.parse(body.visitDate))) {
    errors.push("'visitDate' must be a valid ISO date string");
  }
  if (body.status !== undefined && body.status !== STATUSES.REGISTERED) {
    errors.push(`'status' on registration must be '${STATUSES.REGISTERED}' or omitted`);
  }
  return errors;
}

function validateStatusPayload(body) {
  const errors = [];
  if (!body || typeof body !== 'object') {
    return ['request body must be a JSON object'];
  }
  if (!body.status) {
    errors.push("'status' is required");
  } else if (!isValidStatus(body.status)) {
    errors.push(
      `'status' must be one of: ${Object.values(STATUSES).join(', ')}`
    );
  }
  return errors;
}

module.exports = { validateRegisterPayload, validateStatusPayload };
