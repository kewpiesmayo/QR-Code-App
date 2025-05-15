// LOGIN BUTTON HANDLER
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('status').innerText = 'Please enter both username and password.';
    return;
  }

  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  document.getElementById('status').innerText = result.message || result.error;

  if (res.ok) {
    window.location.href = 'index.html';
  }
});

// SIGNUP BUTTON HANDLER
document.getElementById('signup-btn').addEventListener('click', async () => {
  const first_name = document.getElementById('first-name').value.trim();
  const last_name = document.getElementById('last-name').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!first_name || !last_name || !username || !password) {
    document.getElementById('status').innerText = 'All fields are required to sign up.';
    return;
  }

  const res = await fetch('/api/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name, username, password })
  });

  const result = await res.json();
  document.getElementById('status').innerText = result.message || result.error;
});

// LOGOUT BUTTON HANDLER
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      const res = await fetch('/api/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await res.json();
      alert(result.message || result.error);
      window.location.reload();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  });
}
