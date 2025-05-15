
const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const router = express.Router();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(bodyParser.json());
app.use(session({
  secret: 'your_secret_key',
  saveUninitialized: false,
  cookie: { secure: false }
}));

// Middleware
app.use(bodyParser.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'your_secret_key', // Change this to something secure
  saveUninitialized: false,
  cookie: { secure: false } // set to true if using HTTPS
}));
// SIGNUP
app.post('/signup', async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  // Check if username already exists
  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username);

  if (existingError) {
    return res.status(500).json({ error: 'Error checking existing user' });
  }

  if (existing && existing.length > 0) {
    return res.status(400).json({ error: 'Username already exists' });
  }

  // Insert new user
  const { error } = await supabase.from('users').insert([
    { first_name, last_name, username, password }
  ]);

  if (error) {
    return res.status(500).json({ error: 'Signup failed' });
  }

  res.json({ message: 'Signup successful! You can now log in.' });
});

// LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const { data: allUsers, error: fetchError } = await supabase
    .from('users')
    .select('*');

  console.log("🧾 All users from Supabase:", allUsers);

  if (fetchError) {
    console.error("Error fetching all users:", fetchError.message);
    return res.status(500).json({ error: 'Server error while fetching users' });
  }

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password);

  if (error) {
    console.error("Supabase login error:", error.message);
    return res.status(500).json({ error: 'Server error during login' });
  }

  if (!data || data.length === 0) {
    console.log("❌ Invalid credentials:", username, password);
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log("✅ Login success:", data[0]);

  req.session.user = {
    id: data[0].id,
    username: data[0].username,
    first_name: data[0].first_name
  };

  res.json({ message: `Welcome, ${data[0].first_name}!` });
});


// LOGOUT
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid'); // Important: clear cookie
    res.json({ message: 'Logged out successfully' });
  });
});


app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

app.get('/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// Save config
app.post('/configs', async (req, res) => {
  const { user_id, data } = req.body;
  const { error } = await supabase.from('configs').insert([{ user_id, data }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Saved successfully' });
});

// Get user's configs
app.get('/configs', async (req, res) => {
  const user_id = req.query.user;
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Save config to DB
app.post('/save-config', async (req, res) => {
  const config = req.body;
  const { error } = await supabase.from('configs').insert([config]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Saved QR config!' });
});

// Fetch saved configs
app.get('/configs/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// EDIT config
app.put('/edit-config/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const { error } = await supabase
    .from('configs')
    .update({ name })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Config updated successfully!' });
});

// DELETE config
app.delete('/delete-config/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('configs')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Config deleted successfully!' });
});
