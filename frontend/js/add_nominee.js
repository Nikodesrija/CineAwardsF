document.getElementById('addNomineeForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const form = e.target;
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Unauthorized. Please login as admin.');
    return;
  }

  // Always required fields
  const data = {
    name: form.name.value.trim(),
    description: form.description.value.trim(),
    image: form.image.value.trim(),
    category: form.category.value
  };

  // Optional fields – only include them if they're visible and filled
  if (form.film.style.display !== 'none' && form.film.value.trim()) {
    data.film = form.film.value.trim();
  }

  if (form.role.style.display !== 'none' && form.role.value.trim()) {
    data.role = form.role.value.trim();
  }

  if (form.workTitle.style.display !== 'none' && form.workTitle.value.trim()) {
    data.workTitle = form.workTitle.value.trim();
  }

  // Validate required fields
  if (!data.name || !data.description || !data.category) {
    document.getElementById('message').textContent = 'All fields except image are required.';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/nominee/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + token
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();
    const msg = document.getElementById('message');

    if (res.ok) {
      msg.textContent = 'Nominee successfully added!';
      form.reset();

      // Hide dynamic fields again after reset
      ['film', 'role', 'workTitle'].forEach(id => {
        document.getElementById(id).style.display = 'none';
      });

    } else {
      msg.textContent = 'Failed to add nominee: ' + (result.error || result.message || 'Unknown error');
    }
  } catch (err) {
    document.getElementById('message').textContent = 'Server error. Try again later.';
  }
});
