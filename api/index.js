// api/index.js  (Vercel Serverless Function)

export default async function handler(req, res) {
  // CORS (so your browser can call this function)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Quick health check for GET /api
  if (req.method === 'GET') {
    return res.status(200).json({ ok: true, message: 'proxy up' });
  }

  // Real upload → Reality Defender
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.RD_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'RD_KEY env var is missing on Vercel' });
  }

  try {
    const providerUrl = 'https://api.realitydefender.com/api/v1/upload';

    // IMPORTANT: forward the incoming Content-Type (multipart/form-data) to RD
    const ct = req.headers['content-type'] || 'application/octet-stream';

    const upstream = await fetch(providerUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': ct
      },
      // pass the raw stream through
      body: req
    });

    const contentType = upstream.headers.get('content-type') || 'text/plain';
    const bodyText = await upstream.text();

    res.status(upstream.status);
    res.setHeader('Content-Type', contentType);
    return res.send(bodyText);
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
