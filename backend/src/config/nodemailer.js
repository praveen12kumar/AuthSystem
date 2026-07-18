import ejs from 'ejs';
import MailComposer from 'nodemailer/lib/mail-composer/index.js';
import path from 'path';

import {
  GMAIL_USER,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REFRESH_TOKEN
} from './serverConfig.js';

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SEND_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

// Sends over Gmail's REST API (HTTPS), not SMTP - even OAuth2-authenticated
// SMTP still connects to smtp.gmail.com:465, which stalled for ~2 minutes
// before failing when deployed on Render (outbound SMTP ports are commonly
// blocked/throttled by cloud hosts; HTTPS isn't). This also avoids gmail.com's
// DMARC rejecting the sender identity, since it's genuinely Google's own
// servers sending on the account's behalf, not a third-party relay.
const getAccessToken = async () => {
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: GOOGLE_REFRESH_TOKEN,
      grant_type: 'refresh_token'
    })
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(`Google token refresh failed: ${data.error} - ${data.error_description}`);
  }
  return data.access_token;
};

const buildRawMessage = (mail) =>
  new Promise((resolve, reject) => {
    new MailComposer(mail).compile().build((err, message) => {
      if (err) return reject(err);
      resolve(
        message
          .toString('base64')
          .replace(/\+/g, '-')
          .replace(/\//g, '_')
          .replace(/=+$/, '')
      );
    });
  });

const renderEmailTemplate = async(template, data) => {
    //console.log("Rendering email template", template, data);
    const templatePath = path.join(
        process.cwd(),  // return current working directory
        'src',
        'utils',
        'email-templates',
        `${template}.ejs`

    );
    //console.log("Template path", templatePath);
    return ejs.renderFile(templatePath, data);
}

// send an email using the Gmail API

export const sendEmail = async(to, subject, template, data)=>{
    //console.log("Sending email", to, subject, template, data);
    try {
        const html = await renderEmailTemplate(template, data);
        //console.log("Generated HTML", html);
        const raw = await buildRawMessage({ from: GMAIL_USER, to, subject, html });
        const accessToken = await getAccessToken();

        const res = await fetch(SEND_URL, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ raw })
        });

        if (!res.ok) {
            const errBody = await res.json().catch(() => ({}));
            throw new Error(`Gmail API send failed: ${res.status} ${JSON.stringify(errBody)}`);
        }

        return true;
    } catch (error) {
        console.log("Error sending email", error);
        return false;
    }
}
