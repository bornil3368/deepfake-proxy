// api/index.js — fixed for proper stream forwarding

export const config = {
  api: {
    bodyParser: false, // important for file uploads
  },
};

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
  if (req.method === "OPTIONS") return res.status(200).end();

  if (req.method === "GET") {
    return res.status(200).json({ ok: true, message: "proxy up" });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RD_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "RD_KEY env var missing" });
  }

  try {
    const providerUrl = "https://api.realitydefender.com/api/v1/upload";

    // Forward the request stream correctly
    const upstreamResponse = await fetch(providerUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": req.headers["content-type"] || "application/octet-stream",
      },
      body: req,
    });

    const resultText = await upstreamResponse.text();

    res.status(upstreamResponse.status);
    res.setHeader("Content-Type", upstreamResponse.headers.get("content-type") || "application/json");
    res.send(resultText);
  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).json({ error: err.message });
  }
}
