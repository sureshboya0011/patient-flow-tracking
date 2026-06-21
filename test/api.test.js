const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');
const { createApp } = require('../src/app');
const store = require('../src/store');

function startServer() {
  const server = createApp().listen(0);
  const { port } = server.address();
  return { server, port };
}

function call(port, method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? Buffer.from(JSON.stringify(body)) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1', port, path, method,
        headers: data ? { 'Content-Type': 'application/json', 'Content-Length': data.length } : {},
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const raw = Buffer.concat(chunks).toString('utf8');
          let parsed = raw;
          try { parsed = JSON.parse(raw); } catch (_) { /* keep text */ }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

test('GET /health returns OK', async () => {
  const { server, port } = startServer();
  try {
    const r = await call(port, 'GET', '/health');
    assert.equal(r.status, 200);
    assert.equal(r.body, 'OK');
  } finally { server.close(); }
});

test('full happy-path flow', async () => {
  store._reset();
  const { server, port } = startServer();
  try {
    let r = await call(port, 'POST', '/patients', {
      patientId: 'A1', name: 'Alice', doctorAssigned: 'Dr. Smith',
    });
    assert.equal(r.status, 201);
    assert.equal(r.body.status, 'REGISTERED');

    r = await call(port, 'PATCH', '/patients/A1/status', { status: 'IN_CONSULTATION' });
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'IN_CONSULTATION');

    r = await call(port, 'GET', '/patients/in-consultation');
    assert.equal(r.status, 200);
    assert.equal(r.body.length, 1);

    r = await call(port, 'PATCH', '/patients/A1/status', { status: 'DISCHARGED' });
    assert.equal(r.status, 200);
    assert.equal(r.body.status, 'DISCHARGED');

    r = await call(port, 'GET', '/patients/summary');
    assert.equal(r.status, 200);
    assert.equal(r.body.total, 1);
    assert.equal(r.body.discharged, 1);
  } finally { server.close(); }
});

test('rejects duplicate patientId', async () => {
  store._reset();
  const { server, port } = startServer();
  try {
    await call(port, 'POST', '/patients', { patientId: 'D1', name: 'X', doctorAssigned: 'Y' });
    const r = await call(port, 'POST', '/patients', { patientId: 'D1', name: 'X', doctorAssigned: 'Y' });
    assert.equal(r.status, 409);
    assert.equal(r.body.error, 'DuplicateId');
  } finally { server.close(); }
});

test('rejects missing fields', async () => {
  store._reset();
  const { server, port } = startServer();
  try {
    const r = await call(port, 'POST', '/patients', { patientId: 'M1' });
    assert.equal(r.status, 400);
    assert.equal(r.body.error, 'ValidationError');
  } finally { server.close(); }
});

test('rejects invalid status transition', async () => {
  store._reset();
  const { server, port } = startServer();
  try {
    await call(port, 'POST', '/patients', { patientId: 'T1', name: 'X', doctorAssigned: 'Y' });
    const r = await call(port, 'PATCH', '/patients/T1/status', { status: 'DISCHARGED' });
    assert.equal(r.status, 409);
    assert.equal(r.body.error, 'InvalidTransition');
  } finally { server.close(); }
});
