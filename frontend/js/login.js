const form = document.getElementById('login-form');
const errorEl = document.getElementById('login-error');
const button = document.getElementById('login-button');

// If already logged in, skip straight to the visits page.
if (localStorage.getItem('token')) {
  window.location.href = 'visits.html';
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  button.disabled = true;
  button.textContent = 'Logging in...';

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Login failed';
      return;
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('carerName', data.carer.name);
    window.location.href = 'visits.html';
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Check your connection.';
  } finally {
    button.disabled = false;
    button.textContent = 'Log In';
  }
});
