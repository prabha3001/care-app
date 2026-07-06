const params = new URLSearchParams(window.location.search);
const visitId = params.get('visit');

const infoEl = document.getElementById('visit-info');
const starsEl = document.getElementById('stars');
const errorEl = document.getElementById('feedback-error');
const successEl = document.getElementById('feedback-success');
const form = document.getElementById('feedback-form');
const submitButton = document.getElementById('submit-button');

let selectedRating = 0;

if (!visitId) {
  infoEl.textContent = 'No visit specified. Please use the link sent to you after your visit.';
  form.style.display = 'none';
} else {
  loadVisitInfo();
}

async function loadVisitInfo() {
  try {
    const res = await fetch(`/api/feedback/visit/${visitId}`);
    const data = await res.json();

    if (!res.ok) {
      infoEl.textContent = 'Sorry, we could not find that visit.';
      form.style.display = 'none';
      return;
    }

    const visitDate = new Date(data.scheduled_start).toLocaleDateString();
    infoEl.textContent = `Visit with ${data.client_name} on ${visitDate}`;
  } catch (err) {
    infoEl.textContent = 'Could not reach the server. Check your connection.';
    form.style.display = 'none';
  }
}

starsEl.querySelectorAll('button').forEach((starButton) => {
  starButton.addEventListener('click', () => {
    selectedRating = Number(starButton.dataset.value);
    starsEl.querySelectorAll('button').forEach((btn) => {
      btn.classList.toggle('selected', Number(btn.dataset.value) <= selectedRating);
    });
  });
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  successEl.textContent = '';

  if (!selectedRating) {
    errorEl.textContent = 'Please select a star rating.';
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Submitting...';

  try {
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visit_id: Number(visitId),
        rating: selectedRating,
        comment: document.getElementById('comment').value.trim()
      })
    });

    const data = await res.json();

    if (!res.ok) {
      errorEl.textContent = data.error || 'Something went wrong. Please try again.';
      submitButton.disabled = false;
      submitButton.textContent = 'Submit Feedback';
      return;
    }

    successEl.textContent = 'Thank you! Your feedback has been submitted.';
    form.style.display = 'none';
  } catch (err) {
    errorEl.textContent = 'Could not reach the server. Check your connection.';
    submitButton.disabled = false;
    submitButton.textContent = 'Submit Feedback';
  }
});
