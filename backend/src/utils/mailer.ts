// src/utils/mailer.ts
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false, // true si port 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendWelcomeEmail(to: string, displayName: string) {
  console.log('Sending email to:', to);

  await transporter.sendMail({
    from: '"EuroGamble" <noreply@paqueriaud.fr>',
    to,
    subject: 'Bienvenue sur EuroGamble !',
    text: `Bonjour ${displayName},\n\nMerci de t'être inscrit sur notre application ! 🎤`,
    html: `<p>Bonjour <strong>${displayName}</strong>,</p><p>Merci de t'être inscrit sur notre application EuroGamble ! 🎤</p>`,
  }).then(() => {
    console.log('Email sent successfully');
  }).catch((error) => {
    console.error('Error sending email:', error);
  });
}
