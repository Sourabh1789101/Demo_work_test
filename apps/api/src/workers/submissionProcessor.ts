import { pool } from '../config/database.js';
import { WebhookService, type WebhookConfig } from '../services/WebhookService.js';
import { EmailService } from '../services/EmailService.js';

export type SubmissionJob = {
  submissionId: string;
  formId: string;
  data: Record<string, unknown>;
  metadata: { ip: string | null; userAgent: string | null };
};

type FormRow = {
  title: string;
  owner_email: string | null;
  webhook_url: string | null;
  webhook_secret: string | null;
};

export class SubmissionProcessor {
  private static queue: SubmissionJob[] = [];
  private static processing = false;

  /** Add a job to the in-memory queue and trigger processing if idle. */
  static enqueue(job: SubmissionJob): void {
    SubmissionProcessor.queue.push(job);
    console.log(
      `[SubmissionProcessor] Enqueued job for submission ${job.submissionId} (queue size: ${SubmissionProcessor.queue.length})`,
    );

    if (!SubmissionProcessor.processing) {
      // Fire-and-forget; errors are caught inside processQueue
      void SubmissionProcessor.processQueue();
    }
  }

  /** Drain the queue sequentially. */
  static async processQueue(): Promise<void> {
    if (SubmissionProcessor.processing) return;

    SubmissionProcessor.processing = true;

    while (SubmissionProcessor.queue.length > 0) {
      const job = SubmissionProcessor.queue.shift()!;
      try {
        await SubmissionProcessor.processJob(job);
      } catch (err) {
        console.error(
          `[SubmissionProcessor] Unhandled error processing submission ${job.submissionId}:`,
          err,
        );
      }
    }

    SubmissionProcessor.processing = false;
  }

  private static async processJob(job: SubmissionJob): Promise<void> {
    console.log(
      `[SubmissionProcessor] Processing submission ${job.submissionId} for form ${job.formId}`,
    );

    // 1. Audit log
    console.log(
      `[AUDIT] submission.created | submissionId=${job.submissionId} formId=${job.formId} ip=${job.metadata.ip ?? 'unknown'}`,
    );

    // 2. Fetch form details, gracefully handling missing optional columns
    let formRow: FormRow | null = null;
    try {
      // Try to fetch webhook_url if the column exists
      const result = await pool.query<FormRow>(
        `
        SELECT
          title,
          NULL::TEXT AS owner_email,
          NULL::TEXT AS webhook_url,
          NULL::TEXT AS webhook_secret
        FROM forms
        WHERE id = $1
        `,
        [job.formId],
      );

      if ((result.rowCount ?? 0) > 0) {
        formRow = result.rows[0];
      }

      // Attempt to read optional columns (webhook_url, webhook_secret) that may
      // have been added via migration.  We catch the error and silently continue
      // if the columns don't exist yet.
      try {
        const extResult = await pool.query<{ webhook_url: string | null; webhook_secret: string | null }>(
          `SELECT webhook_url, webhook_secret FROM forms WHERE id = $1`,
          [job.formId],
        );
        if (formRow && (extResult.rowCount ?? 0) > 0) {
          formRow.webhook_url = extResult.rows[0].webhook_url;
          formRow.webhook_secret = extResult.rows[0].webhook_secret;
        }
      } catch {
        // webhook_url / webhook_secret columns not present — skip silently
      }
    } catch (err) {
      console.error(
        `[SubmissionProcessor] Could not fetch form ${job.formId} from DB:`,
        err,
      );
    }

    // 3. Trigger webhook if configured
    if (formRow?.webhook_url) {
      const webhookConfig: WebhookConfig = {
        url: formRow.webhook_url,
        secret: formRow.webhook_secret ?? undefined,
        events: ['submission.created'],
      };

      const webhookPayload = {
        submissionId: job.submissionId,
        formId: job.formId,
        data: job.data,
        metadata: job.metadata,
      };

      // Retry delivery in the background — never block the queue
      void WebhookService.deliverWithRetry(webhookConfig, 'submission.created', webhookPayload);
    }

    // 4. Send email notification if SMTP is configured and owner email is known
    if (process.env['SMTP_HOST'] && formRow?.owner_email && formRow.title) {
      try {
        await EmailService.sendSubmissionNotification(
          formRow.title,
          formRow.owner_email,
          job.data,
        );
      } catch (err) {
        console.error(
          `[SubmissionProcessor] Email notification failed for submission ${job.submissionId}:`,
          err,
        );
      }
    }

    console.log(`[SubmissionProcessor] Finished processing submission ${job.submissionId}`);
  }
}
