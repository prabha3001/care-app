const token = localStorage.getItem('adminToken');

const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');

if (token) {
  showDashboard();
} else {
  showLogin();
}

function showLogin() {
  loginView.style.display = 'block';
  dashboardView.style.display = 'none';
}

function showDashboard() {
  loginView.style.display = 'none';
  dashboardView.style.display = 'block';
  loadCarers();
  loadClients();
  loadRota();
}

document.getElementById('admin-login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('login-error');
  errorEl.textContent = '';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    localStorage.setItem('adminToken', data.token);
    showDashboard();
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Check your connection.';
  }
});

document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  showLogin();
});

function authHeaders() {
  return { Authorization: `Bearer ${localStorage.getItem('adminToken')}` };
}

async function apiGet(path) {
  const res = await fetch(path, { headers: authHeaders() });
  if (res.status === 401 || res.status === 403) {
    localStorage.removeItem('adminToken');
    showLogin();
    throw new Error('Not authorized');
  }
  return res.json();
}

async function apiPost(path, body) {
  const res = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

async function loadCarers() {
  const carers = await apiGet('/api/admin/carers');
  const select = document.getElementById('visit-carer');
  select.innerHTML = carers.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
}

async function loadClients() {
  const clients = await apiGet('/api/admin/clients');
  const select = document.getElementById('visit-client');
  select.innerHTML = clients.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
}

function visitStatusLabel(visit) {
  if (visit.actual_end) return 'Completed';
  if (visit.actual_start) return 'In progress';
  return 'Scheduled';
}

async function loadRota() {
  const visits = await apiGet('/api/admin/visits');
  const tableEl = document.getElementById('rota-table');

  if (!visits.length) {
    tableEl.innerHTML = '<p class="empty-state">No visits scheduled yet.</p>';
    return;
  }

  const rows = visits
    .map(
      (v) => `
        <tr>
          <td>${new Date(v.scheduled_start).toLocaleString()}</td>
          <td>${v.carer_name}</td>
          <td>${v.client_name}</td>
          <td>${visitStatusLabel(v)}</td>
        </tr>`
    )
    .join('');

  tableEl.innerHTML = `
    <table>
      <thead>
        <tr><th>When</th><th>Carer</th><th>Client</th><th>Status</th></tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

document.getElementById('add-carer-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('carer-error');
  errorEl.textContent = '';

  try {
    await apiPost('/api/admin/carers', {
      name: document.getElementById('carer-name').value.trim(),
      email: document.getElementById('carer-email').value.trim(),
      password: document.getElementById('carer-password').value
    });
    event.target.reset();
    loadCarers();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('add-client-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('client-error');
  errorEl.textContent = '';

  try {
    await apiPost('/api/admin/clients', {
      name: document.getElementById('client-name').value.trim(),
      address: document.getElementById('client-address').value.trim(),
      phone: document.getElementById('client-phone').value.trim()
    });
    event.target.reset();
    loadClients();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});

document.getElementById('add-visit-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const errorEl = document.getElementById('visit-error');
  errorEl.textContent = '';

  const startValue = document.getElementById('visit-start').value;
  const endValue = document.getElementById('visit-end').value;

  try {
    await apiPost('/api/admin/visits', {
      carer_id: Number(document.getElementById('visit-carer').value),
      client_id: Number(document.getElementById('visit-client').value),
      scheduled_start: new Date(startValue).toISOString(),
      scheduled_end: new Date(endValue).toISOString()
    });
    event.target.reset();
    loadRota();
  } catch (err) {
    errorEl.textContent = err.message;
  }
});
