const express = require('express');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const session = require('express-session');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
const router = express.Router();

// Supabase setup
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use(session({
  secret: 'your_secret_key',
  saveUninitialized: false,
  cookie: { secure: false }
}));

// SIGNUP
app.post('/api/signup', async (req, res) => {
  const { first_name, last_name, username, password } = req.body;

  const { data: existing, error: existingError } = await supabase
    .from('users')
    .select('*')
    .eq('username', username);

  if (existingError) return res.status(500).json({ error: 'Error checking existing user' });
  if (existing.length > 0) return res.status(400).json({ error: 'Username already exists' });

  const { error } = await supabase.from('users').insert([{ first_name, last_name, username, password }]);
  if (error) return res.status(500).json({ error: 'Signup failed' });

  res.json({ message: 'Signup successful! You can now log in.' });
});

// LOGIN
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password);

  if (error) return res.status(500).json({ error: 'Server error during login' });
  if (!data || data.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

  req.session.user = {
    id: data[0].id,
    username: data[0].username,
    first_name: data[0].first_name
  };

  res.json({ message: `Welcome, ${data[0].first_name}!` });
});

// LOGOUT
app.post('/api/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ error: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out successfully' });
  });
});

// SESSION
app.get('/api/session', (req, res) => {
  if (req.session.user) {
    res.json({ loggedIn: true, user: req.session.user });
  } else {
    res.json({ loggedIn: false });
  }
});

// CONFIG ROUTES
app.post('/api/configs', async (req, res) => {
  const { user_id, data } = req.body;
  const { error } = await supabase.from('configs').insert([{ user_id, data }]);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Saved successfully' });
});

app.get('/api/configs', async (req, res) => {
  const user_id = req.query.user;
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post('/api/save-config', async (req, res) => {
  const config = req.body;
  const { error } = await supabase.from('configs').insert([config]);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: 'Saved QR config!' });
});

app.get('/api/configs/:userId', async (req, res) => {
  const { userId } = req.params;
  const { data, error } = await supabase
    .from('configs')
    .select('*')
    .eq('user_id', userId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.put('/api/edit-config/:id', async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  const { error } = await supabase
    .from('configs')
    .update({ name })
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Config updated successfully!' });
});

app.delete('/api/delete-config/:id', async (req, res) => {
  const { id } = req.params;

  const { error } = await supabase
    .from('configs')
    .delete()
    .eq('id', id);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ message: 'Config deleted successfully!' });
});

// Export handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);
