# Challenge 3 — Patient Flow Tracker

## Goal
Track a patient's journey through a clinic:

```
REGISTERED  ->  IN_CONSULTATION  ->  DISCHARGED
```

## Model (minimum fields)
| Field            | Type     | Notes                                         |
|------------------|----------|-----------------------------------------------|
| `patientId`      | string   | unique, required                              |
| `name`           | string   | required                                      |
| `doctorAssigned` | string   | required                                      |
| `status`         | enum     | `REGISTERED` \| `IN_CONSULTATION` \| `DISCHARGED` |
| `visitDate`      | ISO date | defaults to "now" on register                 |

## Feature Ladder

### Feature 0 — Start Your App (5 mins)
- Add `/health` endpoint returning `OK`.
- **Done when** the app runs and `/health` works.

### Feature 1 — Register Patient
- In-memory storage.
- Register a new patient.
- List all patients.

### Feature 2 — Update Patient Status
- Update status with valid transitions:
  `REGISTERED -> IN_CONSULTATION -> DISCHARGED`.
- Reject any other transition.

### Feature 3 — Smart Views
- View patients currently `IN_CONSULTATION`.
- View patients registered today.

### Feature 4 — Robustness
- Validate unique `patientId`.
- Validate required fields.
- Return proper error messages and HTTP codes.

### Feature 5 — Bonus
- Generate summary (total, discharged count, …).
- Sort patients by `visitDate`.

## Deliverables
- Working system.
- Demo: register -> update -> track view.
- Show Copilot usage.
