import { randomUUID } from 'node:crypto';
import { EmailService } from '../services/EmailService.js';

export type EmailJob = {
  id: string;
  to: string;
  subject: string;
  html: string;
  attempts: number;
  maxAttempts: number;
};

export class EmailWorker {
  private static queue: EmailJob[] = [];

  /**
   * Add an email to the in-memory queue.
   * `id`, `attempts`, and `maxAttempts` are injected automatically.
   */
  static enqueue(job: Omit<EmailJob, 'id' | 'attempts' | 'maxAttempts'>): void {
    const fullJob: EmailJob = {
      ...job,
      id: randomUUID(),
      attempts: 0,
      maxAttempts: 3,
    };

    EmailWorker.queue.push(fullJob);
    console.log(
      `[EmailWorker] Enqueued email ${fullJob.id} to "${fullJob.to}" (queue size: ${EmailWorker.queue.length})`,
    );
  }

  /**
   * Process all pending emails in the queue.
   * Jobs that fail are retried up to `maxAttempts`; on final failure they
   * are dropped with an error log.
   */
  static async flush(): Promise<void> {
    if (EmailWorker.queue.length === 0) {
      console.log('[EmailWorker] Queue is empty, nothing to flush.');
      return;
    }

    console.log(`[EmailWorker] Flushing ${EmailWorker.queue.length} email(s)…`);

    // Snapshot current queue; new items enqueued during flush will be
    // processed on the next flush call.
    const batch = EmailWorker.queue.splice(0, EmailWorker.queue.length);

    for (const job of batch) {
      job.attempts += 1;

      try {
        const result = await EmailService.send({
          to: job.to,
          subject: job.subject,
          html: job.html,
        });

        if (result.success) {
          console.log(`[EmailWorker] Sent email ${job.id} (attempt ${job.attempts})`);
        } else {
          throw new Error('EmailService returned success=false');
        }
      } catch (err) {
        console.error(
          `[EmailWorker] Failed to send email ${job.id} (attempt ${job.attempts}/${job.maxAttempts}):`,
          err,
        );

        if (job.attempts < job.maxAttempts) {
          // Re-queue for next flush
          EmailWorker.queue.push(job);
          console.log(`[EmailWorker] Re-queued email ${job.id} for retry`);
        } else {
          console.error(
            `[EmailWorker] Dropping email ${job.id} to "${job.to}" after ${job.maxAttempts} failed attempts`,
          );
        }
      }
    }
  }

  /** Returns the number of emails currently waiting in the queue. */
  static getQueueSize(): number {
    return EmailWorker.queue.length;
  }
}
