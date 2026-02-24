
function toggleSidebar() {
      document.getElementById('sidebar').classList.toggle('collapsed');
  }

// Fetch and render live results in poll format
async function fetchResults() {
  const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const main = document.getElementById('mainContent');
  const res = await fetch(`${BASE_URL}/results`, {
    headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
  });
  const data = await res.json();

  let content = '<h2>Live Voting Results</h2>';
 data.forEach(item => {
  const nominees = item.nominees || [];
  if (!nominees.length) {
    content += `<div><h3>${item.categoryName}</h3><p>No votes yet.</p></div><hr>`;
    return;
  }

  const totalVotes = nominees.reduce((sum, n) => sum + (n.voteCount || 0), 0) || 1;

  content += `<div style="margin-bottom: 30px;">
    <h3>${item.categoryName}</h3>`;

  nominees.forEach(n => {
    const count = n.voteCount || 0;
   const percent = ((count / totalVotes) * 100).toFixed(1);

    content += `
      <div>
        <strong>${n.name}</strong> - ${n.voteCount} votes (${percent}%)
        <div style="background: #e0e0e0; border-radius: 5px; overflow: hidden; height: 20px;">
          <div style="width: ${percent}%; background: #4caf50; color: white; text-align: center; height: 100%;">
            ${percent}%
          </div>
        </div>
      </div>`;
  });

  content += `</div><hr>`;
});

  main.innerHTML = content;
}
fetchResults();
//notification logic
 let notifications = [];

async function loadNotifications() {
  const icon = document.getElementById('notificationIcon');
  const countBadge = document.getElementById('notificationCount');
  const dropdown = document.getElementById('notificationDropdown');

  // Clear previous notifications
  dropdown.innerHTML = '';
  countBadge.style.display = 'none';
  icon.classList.remove('notification-dot');

  try {
    const res = await fetch(`${BASE_URL}/notifications`);
    notifications = await res.json();

    if (notifications.length > 0) {
      // Show count and red dot
      countBadge.innerText = notifications.length;
      countBadge.style.display = 'inline-block';
      icon.classList.add('notification-dot');

      // Render each notification
      notifications.forEach(n => {
        const li = document.createElement('li');
        li.innerHTML = `<a class="dropdown-item" href="#">${n.message}</a>`;
        dropdown.appendChild(li);
      });
    } else {
      dropdown.innerHTML = '<li><span class="dropdown-item text-muted">No notifications</span></li>';
    }
  } catch (err) {
    console.error('Error fetching notifications:', err);
  }
}

// Clear count when dropdown is opened (mark as viewed)
function markNotificationsViewed() {
  const countBadge = document.getElementById('notificationCount');
  countBadge.style.display = 'none';
  // Optionally: API call to mark as read on backend
}

// Run on page load
window.addEventListener('DOMContentLoaded', loadNotifications);



// Main navigation logic
// async function showPage(page) {
//   const main = document.getElementById('mainContent');

//   // Clear existing interval on page change
//   clearInterval(window.resultsInterval);

//   if (page === 'dashboard') {
//     fetchResults(); // load once
//     window.resultsInterval = setInterval(fetchResults, 5000); // auto-refresh
//   } else if (page === 'manageNominees') {
//     const res = await fetch('http://localhost:3000/nominee/nominees', {
//       headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//     });
//     const data = await res.json();
//     let content = '<h2>Manage Nominees</h2>';

//     data.forEach(n => {
//       content += `
//         <div>
//           <strong>${n.name}</strong> (${n.category.name})<br>
//           ${n.image ? `<img src="${n.image}" width="80" alt="${n.name}"/><br>` : ''}
//           Bio: ${n.description}<br>
//           <button onclick="updateNominee('${n._id}')">Update</button>
//           <button onclick="deleteNominee('${n._id}')">Delete</button>
//           <hr>
//         </div>`;
//     });
//     main.innerHTML = content;
//   } else if (page === 'manageCategories') {
//     const res = await fetch('http://localhost:3000/category/categories', {
//       headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//     });
//     const data = await res.json();

//     let content = '<h2>Manage Categories</h2>';
//     content += '<table border="1"><tr><th>Name</th><th>Description</th><th>Actions</th></tr>';
//     data.data.forEach(c => {
//       content += `
//         <tr>
//           <td>${c.name}</td>
//           <td>${c.description}</td>
//           <td>
//             <button onclick="updateCategory('${c._id}')">Update</button>
//             <button onclick="deleteCategory('${c._id}')">Delete</button>
//           </td>
//         </tr>`;
//     });
//     content += '</table>';
//     main.innerHTML = content;
//   } else if (page === 'home') {
//     main.innerHTML = '<h2>Welcome Admin!</h2>';
//   }
// }

// // Update nominee
// function updateNominee(id) {
//   const name = prompt('Enter new name:');
//   const description = prompt('Enter new bio/description:');
//   const image = prompt('Enter new image URL:');

//   if (name && description && image) {
//     fetch(`http://localhost:3000/nominee/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + localStorage.getItem('token')
//       },
//       body: JSON.stringify({ name, description, image })
//     }).then(() => showPage('manageNominees'));
//   }
// }

// // Delete nominee
// function deleteNominee(id) {
//   if (confirm('Are you sure you want to delete this nominee?')) {
//     fetch(`http://localhost:3000/nominee/${id}`, {
//       method: 'DELETE',
//       headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//     }).then(() => showPage('manageNominees'));
//   }
// }

// // Update category
// function updateCategory(id) {
//   const name = prompt('Enter new name:');
//   const description = prompt('Enter new description:');
//   if (name && description) {
//     fetch(`http://localhost:3000/category/${id}`, {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': 'Bearer ' + localStorage.getItem('token')
//       },
//       body: JSON.stringify({ name, description })
//     }).then(() => showPage('manageCategories'));
//   }
// }

// // Delete category
// function deleteCategory(id) {
//   if (confirm('Are you sure you want to delete this category?')) {
//     fetch(`http://localhost:3000/category/${id}`, {
//       method: 'DELETE',
//       headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
//     }).then(() => showPage('manageCategories'));
//   }
// }

// // Load dashboard by default
// showPage('dashboard');
