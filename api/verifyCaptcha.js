 /* eslint-disable no-undef */

 //  serverless API handler to verify google reCaptcha token

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end("Method Not Allowed");
  }

  const { token } = req.body;

  //  grab secret key from env variables
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ error: "Server misconfiguration: missing secret key" });
  }
  //  google’s reaCaptcha verification endpoint with query params

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${token}`;

  try {
    const response = await fetch(verifyURL, { method: "POST" }
    );
    const data = await response.json();

    if (!data.success) {
      return res.status(400).json({ error: "CAPTCHA failed", details: data["error-codes"] });
    }

    res.status(200).json({ success: true });
  } catch (err) {
    console.error("reCAPTCHA verification error:", err);
    res.status(500).json({ error: "Server error" });
  }
}
