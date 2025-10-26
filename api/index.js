// api/index.js
export const config = {
  api: {
    bodyParser: false, // Important for binary uploads
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");

  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "proxy active" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const apiKey = process.env.RD_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Missing RD_KEY" });
    }

    const upstream = await fetch("https://api.realitydefender.com/api/v1/upload", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        // note: no Content-Type header — lets fetch stream binary correctly
      },
      body: req,
      // 👇 THIS FIXES THE “duplex” ERROR 👇
      duplex: "half",
    });

    const text = await upstream.text();
    res.status(upstream.status);
    res.setHeader("Content-Type", upstream.headers.get("content-type") || "application/json");
    res.send(text);
  } catch (err) {
    console.error("Proxy Error:", err);
    res.status(500).json({ error: err.message });
  }
}
