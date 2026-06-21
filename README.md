# Patient Flow Tracker

A small Node.js + Express service that tracks a patient's journey:

```
REGISTERED  ->  IN_CONSULTATION  ->  DISCHARGED
```

> Problem statement: [problem-statements/challenge-3-patient-flow-tracker.md](problem-statements/challenge-3-patient-flow-tracker.md)

---

## Quick start

```powershell
npm install
npm start          # http://localhost:3000
```

In another terminal:

```powershell
curl http://localhost:3000/health
```

Run the end-to-end demo (no server needed in a separate terminal — the script
spins one up on a free port):

```powershell
npm run demo
```

Run tests:

```powershell
npm test
```

---

## Project layout

```
src/
  app.js          Express app factory + /health (Feature 0)
  server.js       Entry point (npm start)
  status.js       Status enum + transition rules (Feature 2)
  store.js        In-memory PatientStore (Feature 1)
  validators.js   Field & payload validation (Feature 4)
  routes/
    patients.js   All /patients endpoints (Features 1–5)
scripts/
  demo.js         End-to-end demo: register -> update -> view
test/
  api.test.js     Node built-in test runner suite
problem-statements/
  challenge-3-patient-flow-tracker.md
```

---

## API

| Method | Path                                | Feature | Description                          |
|--------|-------------------------------------|---------|--------------------------------------|
| GET    | `/health`                           | 0       | Returns `OK`                         |
| POST   | `/patients`                         | 1       | Register a new patient               |
| GET    | `/patients`                         | 1, 5    | List all (supports `?sort=visitDate&order=asc\|desc`) |
| GET    | `/patients/:patientId`              | 1       | Fetch one                            |
| PATCH  | `/patients/:patientId/status`       | 2       | Update status (validated transition) |
| GET    | `/patients/in-consultation`         | 3       | Patients currently in consultation   |
| GET    | `/patients/today`                   | 3       | Patients with `visitDate` = today    |
| GET    | `/patients/summary`                 | 5       | Counts by status                     |

### Register

```http
POST /patients
Content-Type: application/json

{ "patientId": "P1", "name": "Alice", "doctorAssigned": "Dr. Smith" }
```

`visitDate` is optional; defaults to the current time.

### Update status

```http
PATCH /patients/P1/status
Content-Type: application/json

{ "status": "IN_CONSULTATION" }
```

Valid transitions only — anything else returns `409 InvalidTransition`.

### Error shape

```json
{ "error": "ValidationError", "details": ["'name' is required"] }
```

| HTTP | Error               | When                                         |
|------|---------------------|----------------------------------------------|
| 400  | `ValidationError`   | Missing/invalid fields                       |
| 404  | `NotFound`          | Unknown `patientId`                          |
| 409  | `DuplicateId`       | `patientId` already exists                   |
| 409  | `InvalidTransition` | Status change is not allowed by the FSM      |

---

## Demo walk-through (register -> update -> track view)

```powershell
# Terminal 1
npm start

# Terminal 2
curl http://localhost:3000/health

curl -X POST http://localhost:3000/patients `
  -H "Content-Type: application/json" `
  -d '{ "patientId": "P1", "name": "Alice", "doctorAssigned": "Dr. Smith" }'

curl -X PATCH http://localhost:3000/patients/P1/status `
  -H "Content-Type: application/json" `
  -d '{ "status": "IN_CONSULTATION" }'

curl http://localhost:3000/patients/in-consultation
curl http://localhost:3000/patients/summary
```

Or just run `npm run demo` to see the whole flow at once.

---

## Copilot usage notes

This project was scaffolded with **GitHub Copilot** in VS Code. Useful prompts
that worked well during the build:

- *"Generate an Express in-memory store keyed by patientId with add/get/list and
  a status state machine REGISTERED -> IN_CONSULTATION -> DISCHARGED."*
- *"Add a validator that returns a list of human-readable errors for missing
  required fields."*
- *"Write a Node built-in test runner suite covering the happy path, duplicate
  IDs, missing fields, and invalid transitions."*
- *"Write a demo script that boots the app on a free port and exercises every
  endpoint, then exits."*

Tip: ask Copilot Chat to **explain a failing test** or to **generate the next
feature on the ladder** by referencing the problem statement file.
