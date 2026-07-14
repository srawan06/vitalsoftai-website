export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle contact form submissions
    if (url.pathname === "/api/contact" && request.method === "POST") {
      return handleContact(request, env);
    }

    // Existing static site handling
    return env.ASSETS.fetch(request);
  },
};
async function handleContact(request, env) {
  try {
    const data = await request.json();

    const emailContent = `
Name: ${data.name}

Organization: ${data.organization}

Email: ${data.email}

Interest: ${data.interest}

Message:
${data.message}
`;

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "website@vitalsoftai.ca",
        to: ["hello@vitalsoftai.ca"],
        reply_to: data.email,
        subject: "New Contact Form Submission",
        text: emailContent,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return Response.json({ success: false, error }, { status: 500 });
    }

    return Response.json({
      success: true,
    });
  } catch (err) {
    return Response.json(
      {
        success: false,
        error: err.message,
      },
      { status: 500 },
    );
  }
}
