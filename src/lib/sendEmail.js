function getEmailConfig() {
  // For testing/development: use Resend's default domain
  // For production: verify your domain on Resend and use EMAIL_FROM env var
  const senderEmail = process.env.EMAIL_FROM || "onboarding@resend.dev";
  const senderName = "Template Trackers PH";

  return {
    senderEmail,
    senderName,
  };
}

function getProductName(productKey) {
  const productMap = {
    bookkeeping: "Bookkeeping Template",
    "academic-tracking": "Academic Tracking",
    "all-in-one-finance": "All-in-one Finance Tracker",
  };

  return productMap[productKey] || "Digital Template";
}

function generateEmailHtml({
  buyerEmail,
  productKey,
  folderLink,
  folderName,
}) {
  const productName = getProductName(productKey);

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background: #f9f9f9;
          }
          .header {
            background: linear-gradient(90deg, #0b4f78 0%, #2596be 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 8px 8px 0 0;
          }
          .content {
            background: white;
            padding: 30px;
            border-radius: 0 0 8px 8px;
          }
          .product-name {
            font-weight: bold;
            color: #0b4f78;
          }
          .button {
            display: inline-block;
            background: #2596be;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: bold;
          }
          .button:hover {
            background: #0b4f78;
          }
          .footer {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Thank You for Your Purchase!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${buyerEmail}</strong>,</p>
            
            <p>Thank you for purchasing the <span class="product-name">${productName}</span>. Your purchase is confirmed and your template is ready!</p>
            
            <p>Your dedicated folder is now set up with all the files you need:</p>
            
            <div style="background: #f0f4f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p><strong>Folder Name:</strong> ${folderName}</p>
            </div>
            
            <p>Click the link below to access your Google Drive folder:</p>
            
            <a href="${folderLink}" class="button">Open Your Folder</a>
            
            <p>Or copy this link:</p>
            <p style="word-break: break-all; background: #f9f9f9; padding: 10px; border-radius: 4px; font-family: monospace; font-size: 12px;">
              ${folderLink}
            </p>
            
            <p style="margin-top: 30px;">You can now:</p>
            <ul>
              <li>Open and view all templates</li>
              <li>Make a copy to your own Google Drive</li>
              <li>Customize the templates for your needs</li>
              <li>Start using them right away</li>
            </ul>
            
            <p>If you have any questions or need support, feel free to reach out to us.</p>
            
            <p>Happy tracking!</p>
            
            <p>Best regards,<br />
            <strong>Template Trackers PH Team</strong></p>
            
            <div class="footer">
              <p>© 2026 Template Trackers PH. All rights reserved.</p>
              <p>
                <a href="mailto:templatetrackersph@gmail.com" style="color: #2596be;">Contact Support</a> |
                <a href="https://templatetrackersph.com" style="color: #2596be;">Visit Website</a>
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

export async function sendPurchaseConfirmationEmail({
  buyerEmail,
  productKey,
  folderLink,
  folderName,
}) {
  const { senderEmail, senderName } = getEmailConfig();

  // Validate email
  if (!buyerEmail || !folderLink || !folderName) {
    throw new Error("Missing required email parameters.");
  }

  // Email service: using Resend, SendGrid, or custom SMTP
  // For now, we'll use Resend (https://resend.com)
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    console.warn(
      "RESEND_API_KEY not set. Email not sent. Configure email service to enable automatic notifications."
    );
    return { success: false, message: "Email service not configured." };
  }

  const productName = getProductName(productKey);
  const htmlContent = generateEmailHtml({
    buyerEmail,
    productKey,
    folderLink,
    folderName,
  });

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: `${senderName} <${senderEmail}>`,
        to: buyerEmail,
        subject: `Your ${productName} is Ready – Access Your Folder`,
        html: htmlContent,
      }),
    });

    const responseBody = await response.json();

    if (!response.ok) {
      console.error("Email send failed:", responseBody);
      throw new Error(responseBody?.message || "Failed to send email.");
    }

    return {
      success: true,
      message: "Confirmation email sent successfully.",
      emailId: responseBody?.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
