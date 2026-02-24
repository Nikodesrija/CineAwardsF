// add_category.js

document.addEventListener("DOMContentLoaded", async () => {
  const BASE_URL = window.location.hostname === "localhost"
  ? "http://localhost:3000"
  : "https://cineawards.onrender.com";
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Unauthorized. Please login first.');
    window.location.href = '../login.html';
    return;
  }

  await loadParentCategories();

  document.getElementById('addCategoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const form = e.target;
    const data = {
      name: form.name.value.trim(),
      description: form.description.value.trim(),
      group: form.group.value.trim(), 
      parentCategory: form.parentCategory.value || null,
      votingStart: form.votingStart.value,
      votingEnd: form.votingEnd.value
    };

    if (!data.name || !data.votingStart || !data.votingEnd) {
      document.getElementById('message').textContent = '❗ All fields except description and parent are required.';
      return;
    }

    try {
      const res = await fetch(`${BASE_URL}/category/add`, {
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
        msg.textContent = 'Category added successfully!';
        form.reset();
        await loadParentCategories();
      } else {
        msg.textContent = 'Error: ' + (result.message || result.error || 'Unknown error');
      }
    } catch (error) {
      document.getElementById('message').textContent = 'Server error';
    }
  });
});

async function loadParentCategories() {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/parents`, {
    headers: { Authorization: 'Bearer ' + token }
  });

  const result = await res.json();
  const select = document.getElementById('parentCategory');
  if (!select) return;

  select.innerHTML = '<option value="">-- None (Top-Level Category) --</option>';

  // Only show top-level group categories (Acting, Technical, etc.)
  result.data.forEach(cat => {
    // Only show true "group" categories like Acting, Technical, etc.
    if (["Acting", "Technical", "Writing", "Directing"].includes(cat.name)) {
      const option = document.createElement('option');
      option.value = cat._id;
      option.textContent = cat.name;
      select.appendChild(option);
    }
  });
}

