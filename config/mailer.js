import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, html, text }) => {
  const msg = {
    to,
    from: process.env.BUSINESS_EMAIL, // must be verified with SendGrid
    subject,
    text,
    html,
  };

  return sgMail.send(msg); // returns a Promise
};
