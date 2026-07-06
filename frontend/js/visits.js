const token = localStorage.getItem('token');
const listEl = document.getElementById('visits-list');

if (!token) {
  window.location.href = 'carer-login.html';
}

document.getElementById('logout-button').addEventListener('click', () => {
  localStorage.removeItem('token');
  localStorage.removeItem('carerName');
  window.location.href = 'carer-login.html';
});

function formatTime(isoString) {
  if (!isoString) return '';
  return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function visitStatus(visit) {
  if (visit.actual_end) return { key: 'completed', label: 'Completed' };
  if (visit.actual_start) return { key: 'in-progress', label: 'In progress' };
  return { key: 'scheduled', label: 'Scheduled' };
}

function getLocation() {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: null, lng: null });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => resolve({ lat: null, lng: null }),
      { timeout: 8000 }
    );
  });
}

async function loadVisits() {
  listEl.innerHTML = '<p class="empty-state">Loading visits...</p>';

  const res = await fetch('/api/visits/today', {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = 'carer-login.html';
    return;
  }

  const visits = await res.json();
  renderVisits(visits);
}

function renderVisits(visits) {
  if (!visits.length) {
    listEl.innerHTML = '<p class="empty-state">No visits scheduled for today.</p>';
    return;
  }

  listEl.innerHTML = '';

  visits.forEach((visit) => {
    const status = visitStatus(visit);
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
      <span class="status ${status.key}">${status.label}</span>
      <h2>${visit.client_name}</h2>
      <div class="meta">${visit.client_address || ''}</div>
      <div class="meta">Scheduled: ${formatTime(visit.scheduled_start)} - ${formatTime(visit.scheduled_end)}</div>
      <div class="actions"></div>
      <div class="feedback-link" style="display:none;"></div>
    `;

    const actions = card.querySelector('.actions');
    const feedbackBox = card.querySelector('.feedback-link');

    if (!visit.actual_start) {
      const clockInBtn = document.createElement('button');
      clockInBtn.textContent = 'Start Visit';
      clockInBtn.addEventListener('click', async () => {
        clockInBtn.disabled = true;
        clockInBtn.textContent = 'Starting...';
        const { lat, lng } = await getLocation();

        const res = await fetch(`/api/visits/${visit.id}/clock-in`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lat, lng })
        });

        if (res.ok) {
          loadVisits();
        } else {
          clockInBtn.disabled = false;
          clockInBtn.textContent = 'Start Visit';
        }
      });
      actions.appendChild(clockInBtn);
    } else if (!visit.actual_end) {
      const clockOutBtn = document.createElement('button');
      clockOutBtn.className = 'danger';
      clockOutBtn.textContent = 'End Visit';
      clockOutBtn.addEventListener('click', async () => {
        clockOutBtn.disabled = true;
        clockOutBtn.textContent = 'Ending...';
        const { lat, lng } = await getLocation();

        const res = await fetch(`/api/visits/${visit.id}/clock-out`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ lat, lng })
        });

        if (res.ok) {
          loadVisits();
        } else {
          clockOutBtn.disabled = false;
          clockOutBtn.textContent = 'End Visit';
        }
      });
      actions.appendChild(clockOutBtn);
    } else {
      const link = `${window.location.origin}/feedback.html?visit=${visit.id}`;
      feedbackBox.style.display = 'block';
      feedbackBox.textContent = `Feedback link for this visit: ${link}`;
    }

    listEl.appendChild(card);
  });
}

loadVisits();
