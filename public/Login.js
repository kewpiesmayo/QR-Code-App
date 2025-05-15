// LOGIN BUTTON HANDLER
document.getElementById('login-btn')?.addEventListener('click', async () => {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('status').innerText = 'Please enter both username and password.';
    return;
  }

  const res = await fetch('/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });

  const result = await res.json();
  document.getElementById('status').innerText = result.message || result.error;

 if (res.ok) {
  document.getElementById('login-fields').style.display = 'none';
  document.getElementById('logout-btn').style.display = 'inline-block';
  document.getElementById('user-section').style.display = 'block';
  document.getElementById('save-btn').style.display = 'inline-block';
  document.getElementById('welcome-msg').textContent = `Welcome, ${result.user?.first_name || username}!`;

  // ✅ Safely get user from session if not included in login response
  const sessionRes = await fetch('/session');
  const sessionData = await sessionRes.json();
  if (sessionData.loggedIn) {
    console.log("Loading configs for:", sessionData.user.id);
    loadUserConfigs(sessionData.user.id);
  }
}


});

// SIGNUP BUTTON HANDLER
document.getElementById('signup-btn')?.addEventListener('click', async () => {
  const first_name = document.getElementById('first-name').value.trim();
  const last_name = document.getElementById('last-name').value.trim();
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;

  if (!first_name || !last_name || !username || !password) {
    document.getElementById('status').innerText = 'All fields are required to sign up.';
    return;
  }

  const res = await fetch('/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ first_name, last_name, username, password })
  });

  const result = await res.json();
  document.getElementById('status').innerText = result.message || result.error;

  if (res.ok) {
    document.getElementById('login-fields').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'inline-block';
    document.getElementById('user-section').style.display = 'block';
    document.getElementById('save-btn').style.display = 'inline-block';
    document.getElementById('welcome-msg').textContent = `Welcome, ${first_name}!`;

    const sessionRes = await fetch('/session');
    const sessionData = await sessionRes.json();
    if (sessionData.loggedIn) {
      loadUserConfigs(sessionData.user.id); // ✅ load saved configs after signup
    }
  }

});

// ✅ LOGOUT BUTTON HANDLER
document.getElementById('logout-btn')?.addEventListener('click', async () => {
  try {
    const res = await fetch('/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    const result = await res.json();
    alert(result.message || result.error);
    window.location.reload(); // Refresh to reflect logout
  } catch (err) {
    console.error('Logout failed:', err);
  }
});

