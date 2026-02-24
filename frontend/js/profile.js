const token = localStorage.getItem('token');
const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
if (token) {
  fetch(`${BASE_URL}/user/profile`, {
    headers: { Authorization: 'Bearer ' + token }
  })
  .then(res => res.json())
  .then(data => {
    document.getElementById('profileData').innerHTML =
      '<pre>' + JSON.stringify(data.user, null, 2) + '</pre>';
  });
}