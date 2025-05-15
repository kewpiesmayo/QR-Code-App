document.querySelectorAll(".question").forEach(q => {
    q.addEventListener("click", () => {
        const answer = q.nextElementSibling;
        answer.style.display = answer.style.display === "block" ? "none" : "block";
    });
});

fetch('/session')
  .then(res => res.json())
  .then(data => {
    if (data.loggedIn) {
      document.getElementById('save-btn').style.display = 'inline-block';
      document.getElementById('user-section').style.display = 'block';
      loadUserConfigs(data.user.id);
    } else {
      // If not logged in, hide everything and optionally redirect
      document.getElementById('save-btn').style.display = 'none';
      document.getElementById('user-section').style.display = 'none';
    }
  })
  .catch(err => console.error('Session check failed:', err));
