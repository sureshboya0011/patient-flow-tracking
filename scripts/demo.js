/**
 * End-to-end demo: register -> update -> track view.
 * Spins up the app on a free port, hits each endpoint, prints results, exits.
 *
 * Run:  node scripts/demo.js
 */
const http = require('node:http');
const { createApp } = require('../src/app');

function request(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path,
        method,
        headers: data
          ? { 'Content-Type': 'application/json', 'Content-Length': data.length }
          : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed = raw;
          try { parsed = JSON.parse(raw); } catch (_) { /* plain text */ }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function log(title, result) {
  console.log(`\n=== ${title} ===`);
  console.log(`HTTP ${result.status}`);
  console.log(typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2));
}

(async () => {
  const server = createApp().listen(0);
  const { port } = server.address();
  try {
    log('Feature 0 — GET /health', await request(port, 'GET', '/health'));

    log('Feature 1 — POST /patients (register P1)', await request(port, 'POST', '/patients', {
      patientId: 'P1', name: 'Alice', doctorAssigned: 'Dr. Smith',
    }));
    log('Feature 1 — POST /patients (register P2)', await request(port, 'POST', '/patients', {
      patientId: 'P2', name: 'Bob', doctorAssigned: 'Dr. Jones',
    }));
    log('Feature 1 — GET /patients (list)', await request(port, 'GET', '/patients'));

    log('Feature 2 — PATCH /patients/P1/status -> IN_CONSULTATION',
      await request(port, 'PATCH', '/patients/P1/status', { status: 'IN_CONSULTATION' }));
    log('Feature 2 — PATCH /patients/P1/status -> DISCHARGED',
      await request(port, 'PATCH', '/patients/P1/status', { status: 'DISCHARGED' }));
    log('Feature 2 — invalid transition (P2 REGISTERED -> DISCHARGED)',
      await request(port, 'PATCH', '/patients/P2/status', { status: 'DISCHARGED' }));

    log('Feature 3 — GET /patients/in-consultation', await request(port, 'GET', '/patients/in-consultation'));
    log('Feature 3 — GET /patients/today', await request(port, 'GET', '/patients/today'));

    log('Feature 4 — duplicate id', await request(port, 'POST', '/patients', {
      patientId: 'P1', name: 'Dup', doctorAssigned: 'Dr. X',
    }));
    log('Feature 4 — missing fields', await request(port, 'POST', '/patients', { patientId: 'P3' }));

    log('Feature 5 — GET /patients/summary', await request(port, 'GET', '/patients/summary'));
    log('Feature 5 — GET /patients?sort=visitDate&order=desc',
      await request(port, 'GET', '/patients?sort=visitDate&order=desc'));
  } finally {
    server.close();
  }
})();
