export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Clear any client-side session via a redirect or frontend logic
  // No actual server session to destroy in serverless context
  res.status(200).json({ message: 'Logged out successfully' });
}
