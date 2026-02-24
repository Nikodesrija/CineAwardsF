document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const form = e.target;
  const entered = form.username.value;
  const password = form.password.value;

  // Check if it's admin login
  let data = {};
  if (entered === 'admin') {
    data = {
      username: entered,
      password: password
    };
  } else {
    data = {
      voterId: entered,
      password: password
    };
  }
  const res = await fetch(`${BASE_URL}/user/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  const result = await res.json();
  if (res.ok) {
    localStorage.setItem('token', result.token);

    // Redirect to admin panel or profile
    if (entered === 'admin') {
      window.location.href = 'admin/dashboard.html';  l
    } else {
      window.location.href = 'profile.html';       
    }
  } else {
    alert('Login failed: ' + result.error);
  }
});

  function openModal() {
    document.getElementById('forgotModal').style.display = 'flex';
  }
 function closeModal() {
  document.getElementById('forgotModal').style.display = 'none';

  // Clear all input fields
  document.getElementById('voterId').value = '';
  document.getElementById('mobileNumber').value = '';
  document.getElementById('newPassword').value = '';
  document.getElementById('confirmPassword').value = '';

  // Reset message and style
  const msg = document.getElementById('forgotMsg');
  msg.textContent = '';
  msg.style.color = ''; // remove success color if applied

  // Reset to initial step
  document.getElementById('step1').style.display = 'block';
  document.getElementById('step2').style.display = 'none';
}

  async function verifyIdentity() {
    const voterId = document.getElementById('voterId').value.trim();
    const mobile = document.getElementById('mobileNumber').value.trim();
    if (!voterId || !mobile) {
    document.getElementById('forgotMsg').textContent = 'Please enter both Voter ID and Mobile Number.';
    return;
  }
    const res = await fetch(`${BASE_URL}/user/verify-for-reset`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ voterId, mobile })
    });

    const data = await res.json();
    if (res.ok) {
      document.getElementById('step1').style.display = 'none';
      document.getElementById('step2').style.display = 'block';
    } else {
      document.getElementById('forgotMsg').textContent = data.message || 'Verification failed';
    }
  }
  async function resetPassword() {
    const voterId = document.getElementById('voterId').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      document.getElementById('forgotMsg').textContent = "Passwords do not match";
      return;
    }

    const res = await fetch(`${BASE_URL}/user/reset-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ voterId, newPassword })
    });

    const data = await res.json();
    if (res.ok) {
  document.getElementById('forgotMsg').style.color = 'green';
  document.getElementById('forgotMsg').textContent = "Password reset successful!";
  setTimeout(closeModal, 2000);
}
 else {
      document.getElementById('forgotMsg').textContent = data.message || "Reset failed";
    }
  }