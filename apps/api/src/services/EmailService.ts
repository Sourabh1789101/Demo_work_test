import { randomUUID } from 'node:crypto';

export type EmailOptions = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Minimal SMTP sender that works without nodemailer.
 *
 * Strategy:
 *  - If SMTP_HOST env var is set we attempt a raw SMTP conversation
 *    using Node.js built-in `net` module.
 *  - In all cases the email is logged to the console so nothing is lost
 *    during development / when SMTP is not configured.
 *  - `send()` always resolves to `{ success: true }` so the submission
 *    flow is never blocked by email failures.
 */
export class EmailService {
  private static get smtpConfigured(): boolean {
    return Boolean(process.env['SMTP_HOST']);
  }

  static async send(options: EmailOptions): Promise<{ success: boolean; messageId?: string }> {
    const messageId = `<${randomUUID()}@kim-ai>`;

    // Always log so we never silently drop emails
    console.log(
      `[EMAIL] To: ${options.to} | Subject: ${options.subject} | MessageId: ${messageId}`,
    );
    if (options.text) {
      console.log(`[EMAIL] Text preview: ${options.text.slice(0, 120)}`);
    }

    if (EmailService.smtpConfigured) {
      try {
        await EmailService.sendViaSMTP(options, messageId);
        console.log(`[EMAIL] Sent via SMTP: ${messageId}`);
      } catch (err) {
        // Non-fatal: log and continue
        console.error(`[EMAIL] SMTP delivery failed (${messageId}):`, err);
      }
    } else {
      console.log(`[EMAIL] SMTP not configured — email logged only (set SMTP_HOST to enable delivery)`);
    }

    return { success: true, messageId };
  }

  static async sendSubmissionNotification(
    formTitle: string,
    ownerEmail: string,
    submissionData: Record<string, unknown>,
  ): Promise<void> {
    const fieldRows = Object.entries(submissionData)
      .map(([k, v]) => `<tr><td style="padding:4px 8px;font-weight:bold">${escapeHtml(k)}</td><td style="padding:4px 8px">${escapeHtml(String(v ?? ''))}</td></tr>`)
      .join('');

    await EmailService.send({
      to: ownerEmail,
      subject: `New submission for "${formTitle}"`,
      html: `
        <h2>New form submission</h2>
        <p>Your form <strong>${escapeHtml(formTitle)}</strong> received a new submission.</p>
        <table border="1" cellpadding="0" cellspacing="0" style="border-collapse:collapse">
          <tbody>${fieldRows}</tbody>
        </table>
      `,
      text: `New submission for "${formTitle}":\n${Object.entries(submissionData).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
    });
  }

  static async sendWelcomeEmail(name: string, email: string): Promise<void> {
    await EmailService.send({
      to: email,
      subject: 'Welcome to KIM AI Form Builder',
      html: `
        <h1>Welcome, ${escapeHtml(name)}!</h1>
        <p>Your KIM AI Form Builder account is ready. Start building beautiful forms today.</p>
        <p><a href="${process.env['APP_URL'] ?? 'https://kimai.app'}">Open Form Builder →</a></p>
      `,
      text: `Welcome, ${name}! Your KIM AI Form Builder account is ready.`,
    });
  }

  /**
   * Minimal raw-SMTP implementation using Node.js built-in `net`.
   * Supports plain (port 25/587) only; TLS/STARTTLS would require `tls`.
   * For production use replace this block with nodemailer.
   */
  private static async sendViaSMTP(options: EmailOptions, messageId: string): Promise<void> {
    const { createConnection } = await import('node:net');

    const host = process.env['SMTP_HOST']!;
    const port = parseInt(process.env['SMTP_PORT'] ?? '587', 10);
    const from = process.env['SMTP_FROM'] ?? 'noreply@kimai.app';
    const user = process.env['SMTP_USER'];
    const pass = process.env['SMTP_PASS'];

    await new Promise<void>((resolve, reject) => {
      const socket = createConnection(port, host);
      const lines: string[] = [];
      let step = 0;

      const send = (line: string) => {
        socket.write(line + '\r\n');
      };

      const next = () => {
        step++;
        switch (step) {
          case 1: send(`EHLO kimai`); break;
          case 2:
            if (user && pass) {
              send('AUTH LOGIN');
            } else {
              step++; // skip auth
              next();
            }
            break;
          case 3: send(Buffer.from(user ?? '').toString('base64')); break;
          case 4: send(Buffer.from(pass ?? '').toString('base64')); break;
          case 5: send(`MAIL FROM:<${from}>`); break;
          case 6: send(`RCPT TO:<${options.to}>`); break;
          case 7: send('DATA'); break;
          case 8:
            send(
              `From: ${from}\r\nTo: ${options.to}\r\nSubject: ${options.subject}\r\nMessage-ID: ${messageId}\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n${options.html}\r\n.`,
            );
            break;
          case 9: send('QUIT'); break;
          default: break;
        }
      };

      socket.setEncoding('utf8');

      socket.on('data', (chunk: string) => {
        lines.push(chunk);
        const code = chunk.slice(0, 3);

        if (chunk.includes('\n')) {
          // Ready / greeting
          if (step === 0 && code === '220') { next(); return; }
          // EHLO accepted
          if (step === 1 && (code === '250' || chunk.startsWith('250'))) { next(); return; }
          // AUTH LOGIN prompt
          if (step === 2 && code === '334') { next(); return; }
          // Username accepted
          if (step === 3 && code === '334') { next(); return; }
          // Password accepted
          if (step === 4 && code === '235') { next(); return; }
          // MAIL FROM accepted
          if (step === 5 && code === '250') { next(); return; }
          // RCPT TO accepted
          if (step === 6 && code === '250') { next(); return; }
          // DATA start
          if (step === 7 && code === '354') { next(); return; }
          // Message accepted
          if (step === 8 && code === '250') { next(); return; }
          // QUIT
          if (step === 9 && (code === '221' || code === '250')) {
            socket.destroy();
            resolve();
            return;
          }
          // Any 5xx is an error
          if (code.startsWith('5') || code.startsWith('4')) {
            socket.destroy();
            reject(new Error(`SMTP error at step ${step}: ${chunk.trim()}`));
          }
        }
      });

      socket.on('error', reject);
      socket.on('close', () => {
        if (step < 9) resolve(); // connection closed after QUIT is fine
      });

      socket.setTimeout(15_000, () => {
        socket.destroy();
        reject(new Error('SMTP connection timed out'));
      });
    });
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
