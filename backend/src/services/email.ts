import nodemailer from 'nodemailer';
import { query } from '../db';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  fromEmail: string;
  fromName: string;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    const result = await query(`
      SELECT key, value FROM settings 
      WHERE key IN ('smtp_host', 'smtp_port', 'smtp_user', 'smtp_pass', 'smtp_from_email', 'smtp_from_name')
    `);

    const config: Record<string, string> = {};
    for (const row of result.rows) {
      config[row.key] = row.value;
    }

    if (!config.smtp_host || !config.smtp_user || !config.smtp_pass) {
      return null;
    }

    return {
      host: config.smtp_host,
      port: parseInt(config.smtp_port) || 587,
      user: config.smtp_user,
      pass: config.smtp_pass,
      fromEmail: config.smtp_from_email || config.smtp_user,
      fromName: config.smtp_from_name || 'Nexamind',
    };
  } catch (error) {
    console.error('Error getting SMTP config:', error);
    return null;
  }
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const config = await getSmtpConfig();
  
  if (!config) {
    console.log('SMTP not configured, skipping email');
    return false;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromEmail}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });

    console.log('Email sent successfully to:', options.to);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

export async function sendLeadNotification(lead: {
  name: string;
  email: string;
  phone?: string;
  source?: string;
}): Promise<void> {
  // Check if notifications are enabled
  const settingsResult = await query(`
    SELECT key, value FROM settings 
    WHERE key IN ('notify_new_lead', 'notify_email')
  `);

  const settings: Record<string, string> = {};
  for (const row of settingsResult.rows) {
    settings[row.key] = row.value;
  }

  if (settings.notify_new_lead !== 'true' || !settings.notify_email) {
    return;
  }

  // Get email template
  const templateResult = await query(
    `SELECT subject, body FROM email_templates WHERE name = 'new_lead'`
  );

  if (!templateResult.rows[0]) {
    return;
  }

  const { subject, body } = templateResult.rows[0];

  // Replace placeholders
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, lead.name)
      .replace(/\{\{email\}\}/g, lead.email)
      .replace(/\{\{phone\}\}/g, lead.phone || 'Não informado')
      .replace(/\{\{source\}\}/g, lead.source || 'landing_page');
  };

  await sendEmail({
    to: settings.notify_email,
    subject: replacePlaceholders(subject),
    html: replacePlaceholders(body),
  });
}

export async function testSmtpConnection(config: SmtpConfig): Promise<boolean> {
  try {
    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.port === 465,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    await transporter.verify();
    return true;
  } catch (error) {
    console.error('SMTP connection test failed:', error);
    return false;
  }
}
