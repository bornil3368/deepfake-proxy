import fetch from 'node-fetch';

export default async function handler(req, res) {
  const providerUrl = 'https://api.realitydefender.com/api/v1/upload';
  const apiKey = process.env.RD_KEY;
  const proxied = await fetch(providerUrl, {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + apiKey },
    body: req,
  });
  const text = await proxied.text();
  res.status(proxied.status).send(text);
}
