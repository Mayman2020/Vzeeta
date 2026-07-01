/**
 * Vzeeta API smoke test (port 8081, /api/v1).
 * Usage: node scripts/api-integration-test.mjs [baseUrl]
 */

const BASE = (process.argv[2] || process.env.VZEETA_API_BASE || 'http://localhost:8081/api/v1').replace(/\/$/, '');
const DEFAULT_PASSWORD = process.env.VZEETA_PASSWORD || 'Dev@Local2026!';

const CREDS = {
  superAdmin: {
    email: process.env.VZEETA_SUPER_ADMIN_EMAIL || 'superadmin@tabeebi.com',
    password: process.env.VZEETA_SUPER_ADMIN_PASSWORD || DEFAULT_PASSWORD
  },
  clinicAdmin: {
    email: process.env.VZEETA_CLINIC_ADMIN_EMAIL || 'clinicadmin@tabeebi.com',
    password: process.env.VZEETA_CLINIC_ADMIN_PASSWORD || DEFAULT_PASSWORD
  },
  doctor: {
    email: process.env.VZEETA_DOCTOR_EMAIL || 'doctor1@tabeebi.com',
    password: process.env.VZEETA_DOCTOR_PASSWORD || DEFAULT_PASSWORD
  },
  patient: {
    email: process.env.VZEETA_PATIENT_EMAIL || 'patient1@tabeebi.com',
    password: process.env.VZEETA_PATIENT_PASSWORD || DEFAULT_PASSWORD
  }
};

const results = [];
const today = new Date().toISOString().slice(0, 10);

function pass(name, detail = '') {
  results.push({ name, ok: true, detail });
  console.log(`  ✓ ${name}${detail ? ` — ${detail}` : ''}`);
}

function fail(name, detail = '') {
  results.push({ name, ok: false, detail });
  console.log(`  ✗ ${name}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, { token, body, expect = [200] } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });

  const raw = await response.text();
  let json;
  try {
    json = raw ? JSON.parse(raw) : null;
  } catch {
    json = { raw };
  }

  return {
    ok: expect.includes(response.status),
    status: response.status,
    json
  };
}

async function check(name, method, path, opts = {}) {
  try {
    const res = await request(method, path, opts);
    if (res.ok) {
      pass(name, `${res.status}`);
      return res.json;
    }
    fail(name, `HTTP ${res.status} ${res.json?.message || ''}`.trim());
    return null;
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function login(roleName, credentials) {
  const loginRes = await check(`POST /auth/login (${roleName})`, 'POST', '/auth/login', {
    body: credentials,
    expect: [200],
  });
  const token = loginRes?.data?.accessToken || '';
  if (!token) {
    throw new Error(`Missing token for ${roleName} login`);
  }
  return token;
}

async function runPublicChecks() {
  await check('GET /public/specialties', 'GET', '/public/specialties');
  await check('GET /public/cities', 'GET', '/public/cities');
  await check('GET /public/areas', 'GET', '/public/areas?cityId=1');
  await check('GET /public/doctors', 'GET', '/public/doctors?page=0&size=5');
  await check('GET /public/doctors?city=1', 'GET', '/public/doctors?page=0&size=5&city=1');
  await check('GET /public/doctors/featured', 'GET', '/public/doctors/featured');
  await check('GET /public/doctors/{id}', 'GET', '/public/doctors/1');
  await check('GET /public/doctors/{id}/slots', 'GET', `/public/doctors/1/slots?date=${today}`);
}

async function checkPaged(name, method, path, opts = {}) {
  const json = await check(name, method, path, opts);
  if (!json?.data) return json;
  const data = json.data;
  const hasPageShape = Array.isArray(data.content)
    && typeof data.totalElements === 'number'
    && typeof data.number === 'number'
    && typeof data.size === 'number';
  if (hasPageShape) {
    pass(`${name} (page metadata)`, `total=${data.totalElements}`);
  } else if (Array.isArray(data)) {
    pass(`${name} (list)`, `count=${data.length}`);
  } else {
    fail(`${name} (page metadata)`, 'missing content/totalElements/number/size');
  }
  return json;
}

async function runSuperAdminChecks(token) {
  await check('GET /auth/me (SUPER_ADMIN)', 'GET', '/auth/me', { token });
  await check('GET /super-admin/dashboard', 'GET', '/super-admin/dashboard', { token });
  await checkPaged('GET /super-admin/clinics', 'GET', '/super-admin/clinics?page=0&size=5', { token });
  await checkPaged('GET /super-admin/clinics?q=search', 'GET', '/super-admin/clinics?page=0&size=5&q=clinic', { token });
  await checkPaged('GET /super-admin/users', 'GET', '/super-admin/users?page=0&size=5', { token });
  await checkPaged('GET /super-admin/users?q=search', 'GET', '/super-admin/users?page=0&size=5&q=admin', { token });
  await checkPaged('GET /super-admin/doctors', 'GET', '/super-admin/doctors?verified=true&page=0&size=5', { token });
  await checkPaged('GET /super-admin/payments', 'GET', '/super-admin/payments?page=0&size=5', { token });
  await checkPaged('GET /super-admin/payments?q=search', 'GET', '/super-admin/payments?page=0&size=5&q=1', { token });
  const settingsRes = await checkPaged('GET /super-admin/settings', 'GET', '/super-admin/settings?page=0&size=5', { token });
  await checkPaged('GET /super-admin/settings?q=search', 'GET', '/super-admin/settings?page=0&size=5&q=app', { token });

  const firstSetting = settingsRes?.data?.content?.[0];
  if (firstSetting?.settingKey) {
    const original = firstSetting.settingValue ?? '';
    const probe = `${original}-test`;
    await check(
      'PUT /super-admin/settings/{key}',
      'PUT',
      `/super-admin/settings/${encodeURIComponent(firstSetting.settingKey)}?value=${encodeURIComponent(probe)}`,
      { token, expect: [200] }
    );
    await check(
      'PUT /super-admin/settings/{key} (restore)',
      'PUT',
      `/super-admin/settings/${encodeURIComponent(firstSetting.settingKey)}?value=${encodeURIComponent(original)}`,
      { token, expect: [200] }
    );
  } else {
    fail('PUT /super-admin/settings/{key}', 'no settings row to test');
  }

  await check('GET /role-permissions', 'GET', '/role-permissions', { token });
  await check('GET /role-permissions/me', 'GET', '/role-permissions/me', { token });
  await check('GET /role-permissions/{role}', 'GET', '/role-permissions/SUPER_ADMIN', { token });
  await check('GET /lookups/admin/by-type', 'GET', '/lookups/admin/by-type?type=CLINIC_TYPE', { token });
  await check('GET /super-admin/areas', 'GET', '/super-admin/areas?cityId=1', { token });
}

async function runClinicAdminChecks(token) {
  await checkPaged('GET /clinic-admin/doctors', 'GET', '/clinic-admin/doctors?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/doctors?q=search', 'GET', '/clinic-admin/doctors?page=0&size=5&q=doc', { token });
  await check('GET /clinic-admin/specialties', 'GET', '/clinic-admin/specialties', { token });
  await checkPaged('GET /clinic-admin/appointments', 'GET', '/clinic-admin/appointments?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/appointments?q=search', 'GET', '/clinic-admin/appointments?page=0&size=5&q=APT', { token });
  await checkPaged('GET /clinic-admin/patients', 'GET', '/clinic-admin/patients?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/branches', 'GET', '/clinic-admin/branches?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/branches?q=search', 'GET', '/clinic-admin/branches?page=0&size=5&q=branch', { token });
  await checkPaged('GET /clinic-admin/services', 'GET', '/clinic-admin/services?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/lab-results', 'GET', '/clinic-admin/lab-results?page=0&size=5', { token });
  await checkPaged('GET /clinic-admin/lab-results?q=search', 'GET', '/clinic-admin/lab-results?page=0&size=5&q=test', { token });
  await check('GET /clinic-admin/analytics', 'GET', '/clinic-admin/analytics', { token });
}

async function runDoctorChecks(token) {
  await check('GET /doctor/profile', 'GET', '/doctor/profile', { token });
  await check('GET /doctor/availability', 'GET', '/doctor/availability', { token });
  await checkPaged('GET /doctor/appointments', 'GET', '/doctor/appointments?page=0&size=5', { token });
  await checkPaged('GET /doctor/prescriptions', 'GET', '/doctor/prescriptions?page=0&size=5', { token });
  await checkPaged('GET /doctor/medical-records', 'GET', '/doctor/medical-records?page=0&size=5', { token });
  await check('POST /doctor/medical-records', 'POST', '/doctor/medical-records', {
    token,
    body: { patientId: 1, recordType: 'DIAGNOSIS', titleAr: 'Smoke test record', descriptionAr: 'API smoke' }
  });
  await check('GET /doctor/earnings', 'GET', '/doctor/earnings', { token });
}

async function checkUpload(name, token) {
  try {
    const form = new FormData();
    const blob = new Blob(['%PDF-1.4 smoke test'], { type: 'application/pdf' });
    form.append('file', blob, 'smoke-test.pdf');
    const response = await fetch(`${BASE}/files/upload`, {
      method: 'POST',
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
      body: form
    });
    const json = await response.json();
    if (response.status !== 200 || !json?.url) {
      fail(name, `HTTP ${response.status} ${json?.message || ''}`.trim());
      return null;
    }
    pass(name, `${response.status}`);
    return json;
  } catch (error) {
    fail(name, error instanceof Error ? error.message : String(error));
    return null;
  }
}

async function runPatientChecks(token) {
  await check('GET /patient/profile', 'GET', '/patient/profile', { token });
  await checkPaged('GET /patient/appointments', 'GET', '/patient/appointments?page=0&size=5', { token });
  await checkPaged('GET /patient/appointments?statusGroup=upcoming', 'GET', '/patient/appointments?page=0&size=5&statusGroup=upcoming', { token });
  await checkPaged('GET /patient/appointments?statusGroup=completed', 'GET', '/patient/appointments?page=0&size=5&statusGroup=completed', { token });
  await check('GET /patient/favorites', 'GET', '/patient/favorites', { token });
  await checkPaged('GET /patient/prescriptions', 'GET', '/patient/prescriptions?page=0&size=5', { token });
  await checkPaged('GET /patient/lab-results', 'GET', '/patient/lab-results?page=0&size=5', { token });
  await checkPaged('GET /patient/medical-records', 'GET', '/patient/medical-records?page=0&size=5', { token });
  await checkPaged('GET /patient/notifications', 'GET', '/patient/notifications?page=0&size=5', { token });

  const apptsRes = await checkPaged('GET /patient/appointments?statusGroup=completed', 'GET', '/patient/appointments?page=0&size=5&statusGroup=completed', { token });
  const completedAppt = apptsRes?.data?.content?.[0];
  if (completedAppt?.id) {
    await check('POST /patient/reviews', 'POST', '/patient/reviews', {
      token,
      body: { appointmentId: completedAppt.id, rating: 5, comment: 'Smoke test review' },
      expect: [200, 400, 409]
    });
    await check('GET /payments/appointment/{id}', 'GET', `/payments/appointment/${completedAppt.id}`, {
      token,
      expect: [200, 404]
    });
    await check('POST /payments', 'POST', '/payments', {
      token,
      body: { appointmentId: completedAppt.id, paymentMethod: 'ONLINE' },
      expect: [200, 409]
    });
  } else {
    fail('POST /patient/reviews', 'no completed appointment for review test');
    fail('POST /payments', 'no completed appointment for payment test');
  }

  const uploaded = await checkUpload('POST /files/upload', token);
  await check('GET /patient/attachments', 'GET', '/patient/attachments', { token });
  if (uploaded?.url) {
    const created = await check('POST /patient/attachments', 'POST', '/patient/attachments', {
      token,
      body: { type: 'LAB', fileUrl: uploaded.url, titleAr: 'smoke-test.pdf' }
    });
    const attachmentId = created?.data?.id;
    if (attachmentId) {
      await check('DELETE /patient/attachments/{id}', 'DELETE', `/patient/attachments/${attachmentId}`, { token });
    }
  }
}

async function run() {
  console.log(`\nVzeeta API Integration Test\nBase: ${BASE}\n`);

  await runPublicChecks();

  const superAdminToken = await login('SUPER_ADMIN', CREDS.superAdmin);
  await runSuperAdminChecks(superAdminToken);

  const clinicAdminToken = await login('CLINIC_ADMIN', CREDS.clinicAdmin);
  await runClinicAdminChecks(clinicAdminToken);

  const doctorToken = await login('DOCTOR', CREDS.doctor);
  await runDoctorChecks(doctorToken);

  const patientToken = await login('PATIENT', CREDS.patient);
  await runPatientChecks(patientToken);

  await check('POST /auth/logout (PATIENT)', 'POST', '/auth/logout', {
    token: patientToken,
    body: {},
    expect: [200]
  });

  await check('POST /auth/forgot-password', 'POST', '/auth/forgot-password', {
    body: { email: CREDS.patient.email },
    expect: [200]
  });

  const passed = results.filter((result) => result.ok).length;
  const failed = results.length - passed;

  console.log(`\n${'─'.repeat(56)}`);
  console.log(`Passed: ${passed}  Failed: ${failed}  Total: ${results.length}`);

  if (failed > 0) {
    console.log('\nFailed checks:');
    for (const item of results.filter((result) => !result.ok)) {
      console.log(`  - ${item.name}: ${item.detail}`);
    }
    process.exit(1);
  }

  console.log('\nAll API checks passed.\n');
}

run().catch((error) => {
  console.error('\nSmoke test crashed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
