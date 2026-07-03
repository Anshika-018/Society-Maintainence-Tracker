import nodemailer from "nodemailer";

let transporter = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  const host = process.env.EMAIL_HOST;
  const port = parseInt(process.env.EMAIL_PORT || "587");
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (user && pass) {
    console.log("Using user-provided SMTP credentials for email alerts.");
    transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
    });
  } else {
    console.log("No SMTP credentials provided. Creating temporary Ethereal SMTP test account...");
    try {
      const testAccount = await nodemailer.createTestAccount();
      console.log(`\n======================================================`);
      console.log(`Ethereal Test Mail Account Created!`);
      console.log(`User: ${testAccount.user}`);
      console.log(`Pass: ${testAccount.pass}`);
      console.log(`======================================================\n`);

      transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error("Failed to create Ethereal test account, email alerts will be logged to console only.", err.message);
      // Fallback transporter that logs to console
      transporter = {
        sendMail: async (mailOptions) => {
          console.log("\n--- SIMULATED EMAIL ALERT ---");
          console.log(`From: ${mailOptions.from}`);
          console.log(`To: ${mailOptions.to}`);
          console.log(`Subject: ${mailOptions.subject}`);
          console.log(`Body: ${mailOptions.text}`);
          console.log("-----------------------------\n");
          return { messageId: "simulated-id" };
        }
      };
    }
  }

  return transporter;
};

export const sendAlertEmail = async ({ to, subject, text, html }) => {
  try {
    const activeTransporter = await getTransporter();
    const info = await activeTransporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@Society Maintainence Tracker-society.com",
      to,
      subject,
      text,
      html,
    });
    
    console.log(`Email alert sent: ${info.messageId}`);
    
    // If it's an Ethereal test email, log the preview URL!
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`Email Preview URL: ${previewUrl}`);
    }
    return info;
  } catch (error) {
    console.error("Error sending email alert (continuing operation):", error.message);
    return null;
  }
};
