require("dotenv").config();

async function sendWelcomeEmail(toEmail, toName,verifyLink) {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "api-key": process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
            sender: {
                name: "Cafeslist",
                email: process.env.BREVO_SENDER_EMAIL
            },
            to: [
                { email: toEmail, name: toName }
            ],
            subject: "Welcome to Cafeslist!",
              htmlContent: `
                <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
                    <h2>Hi ${toName},</h2>
                    <p>Click below to verify your email and activate your account:</p>
                    <p><a href="${verifyLink}" style="background:#26201A;color:#fff;padding:12px 20px;text-decoration:none;border-radius:4px;display:inline-block;">Verify my email</a></p>
                    <p>Or paste this link into your browser:<br>${verifyLink}</p>
                </div>
            `
        })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Brevo API error (${response.status}): ${errorBody}`);
    }

    return response.json();
}

module.exports = { sendWelcomeEmail };