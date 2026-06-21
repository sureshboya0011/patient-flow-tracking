/**
 * Patient status state machine.
 * Allowed transitions:
 *   REGISTERED       -> IN_CONSULTATION
 *   IN_CONSULTATION  -> DISCHARGED
 */
const STATUSES = Object.freeze({
  REGISTERED: 'REGISTERED',
  IN_CONSULTATION: 'IN_CONSULTATION',
  DISCHARGED: 'DISCHARGED',
});

const NEXT_STATUS = Object.freeze({
  [STATUSES.REGISTERED]: STATUSES.IN_CONSULTATION,
  [STATUSES.IN_CONSULTATION]: STATUSES.DISCHARGED,
  [STATUSES.DISCHARGED]: null,
});

function isValidStatus(status) {
  return Object.prototype.hasOwnProperty.call(STATUSES, status);
}

function isValidTransition(from, to) {
  return NEXT_STATUS[from] === to;
}

module.exports = { STATUSES, NEXT_STATUS, isValidStatus, isValidTransition };
