export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }
  const { name, email, phone, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ success: false, message: "Please fill in all required fields" });
  }
  try {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://digiclick-ai-backend.onrender.com";
    const response = await fetch(`${backendUrl}/api/contact`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone: phone || "", subject, message })
    });
    const data = await response.json();
    if (response.ok) {
      return res.status(200).json({ success: true, message: "Your message has been sent successfully!" });
    } else {
      return res.status(response.status).json({ success: false, message: data.message || "Failed to send message" });
    }
  } catch (error) {
    console.error("Error forwarding contact form to DigiClick AI backend:", error);
    return res.status(500).json({ success: false, message: "Failed to send your message. Please try again later." });
  }
}
