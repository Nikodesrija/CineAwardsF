document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const pwd = form.password.value;
  const confirm = form.confirmPassword.value;

  if (pwd !== confirm) {
    alert('Passwords do not match!');
    return;
  }

  const data = {
    name: form.name.value,
    age: form.age.value,
    mobile: form.mobile.value,
    address: form.address.value,
    aadharCardNumber: form.aadharCardNumber.value,
    password: pwd
  };

  try {
    const res = await fetch(`${BASE_URL}/user/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const text = await res.text();
    let result;

    try {
      result = JSON.parse(text);
    } catch (err) {
      console.error('Invalid JSON:', text);
      alert('Server response was not JSON:\n' + text);
      return;
    }

    if (res.ok) {
      localStorage.setItem('token', result.token);
      showVoterId(result.response.voterId || result.response.username);
    } else {
      alert(`Signup failed (${res.status}): ${result.error || result.message || 'Unknown error'}`);
    }
  } catch (err) {
    alert('Network/server error – check console and try again.');
  }
});