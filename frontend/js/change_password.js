document.getElementById('changePasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const form = e.target;
  const data = {
    currentPassword: form.currentPassword.value,
    newPassword: form.newPassword.value
  };
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/user/profile/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + token
    },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (res.ok) {
    alert('Password changed successfully!');
  } else {
    alert('Error: ' + result.error);
  }
});