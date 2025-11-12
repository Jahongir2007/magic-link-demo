const express = require('express');
const path = require('path');
const AuthVerify = require('./index');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const auth = new AuthVerify({
  mlSecret: 'super_secret_key',
  appUrl: 'http://localhost:3000',
  storeTokens: 'memory'
});

// Configure sender
auth.magic.sender({
  service: 'gmail',
  sender: 'YOUR_GMAIL',
  pass: 'YOUR_APP_PASS'
});

// Endpoint: send magic link
app.post('/api/send-link', async (req, res) => {
  const { email } = req.body;
  try {
    const { link } = await auth.magic.send(email);
    console.log('Magic link:', link);
    res.json({ success: true, message: 'Magic link sent!', link });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Endpoint: verify token
app.get('/auth/verify', async (req, res) => {
  const token = req.query.token;
  try {
    const decoded = await auth.magic.verify(token);
    res.redirect(`/verify.html?email=${decoded.user.email}`);
  } catch (err) {
    res.status(400).send('Invalid or expired link');
  }
});

app.listen(3000, () => console.log('🚀 Magic Link demo running at http://localhost:3000'));
