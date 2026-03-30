import Stripe from 'stripe';
import { pool } from '../config/database.js';
import { nanoid } from 'nanoid';

// ─── Stripe client ────────────────────────────────────────────────────────────
// Initialised lazily so the API boots without STRIPE_SECRET_KEY in development.
let _stripe: Stripe | null = null;

function getStripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
  _stripe = new Stripe(key, { apiVersion: '2026-02-25.clover' });
  return _stripe;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export type CreatePaymentIntentInput = {
  formId: string;
  submissionId?: string;
  amountCents: number;          // e.g. 2000 = $20.00
  currency?: string;             // default 'usd'
  description?: string;
  metadata?: Record<string, string>;
};

export type PaymentIntentResult = {
  clientSecret: string;
  paymentIntentId: string;
  amountCents: number;
  currency: string;
};

export type PaymentRecord = {
  id: string;
  formId: string;
  submissionId: string | null;
  stripePaymentIntentId: string;
  amountCents: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed' | 'refunded';
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

type PaymentRow = {
  id: string;
  form_id: string;
  submission_id: string | null;
  stripe_payment_intent_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const mapRow = (row: PaymentRow): PaymentRecord => ({
  id: row.id,
  formId: row.form_id,
  submissionId: row.submission_id,
  stripePaymentIntentId: row.stripe_payment_intent_id,
  amountCents: row.amount_cents,
  currency: row.currency,
  status: row.status as PaymentRecord['status'],
  description: row.description,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ─── Service ──────────────────────────────────────────────────────────────────
export class PaymentService {
  /**
   * Creates a Stripe PaymentIntent and stores a pending payment record.
   */
  static async createPaymentIntent(
    input: CreatePaymentIntentInput,
  ): Promise<PaymentIntentResult> {
    const stripe = getStripe();
    const currency = input.currency ?? 'usd';

    const intent = await stripe.paymentIntents.create({
      amount: input.amountCents,
      currency,
      description: input.description,
      metadata: {
        form_id: input.formId,
        submission_id: input.submissionId ?? '',
        ...input.metadata,
      },
      automatic_payment_methods: { enabled: true },
    });

    await pool.query(
      `INSERT INTO payments
         (id, form_id, submission_id, stripe_payment_intent_id, amount_cents, currency, status, description)
       VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7)`,
      [
        nanoid(),
        input.formId,
        input.submissionId ?? null,
        intent.id,
        input.amountCents,
        currency,
        input.description ?? null,
      ],
    );

    return {
      clientSecret: intent.client_secret!,
      paymentIntentId: intent.id,
      amountCents: input.amountCents,
      currency,
    };
  }

  /**
   * Called from the Stripe webhook handler to update payment status.
   */
  static async handleWebhookEvent(rawBody: Buffer, signature: string): Promise<void> {
    const stripe = getStripe();
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error('STRIPE_WEBHOOK_SECRET is not set');

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new Error(`Webhook signature verification failed: ${msg}`);
    }

    const intent = event.data.object as Stripe.PaymentIntent;

    switch (event.type) {
      case 'payment_intent.succeeded':
        await pool.query(
          `UPDATE payments SET status = 'succeeded', updated_at = NOW()
           WHERE stripe_payment_intent_id = $1`,
          [intent.id],
        );
        break;

      case 'payment_intent.payment_failed':
        await pool.query(
          `UPDATE payments SET status = 'failed', updated_at = NOW()
           WHERE stripe_payment_intent_id = $1`,
          [intent.id],
        );
        break;

      case 'charge.refunded':
        await pool.query(
          `UPDATE payments SET status = 'refunded', updated_at = NOW()
           WHERE stripe_payment_intent_id = $1`,
          [intent.id],
        );
        break;

      default:
        // Unhandled event type — no-op
        break;
    }
  }

  /**
   * List all payment records for a given form.
   */
  static async listByForm(formId: string): Promise<PaymentRecord[]> {
    const { rows } = await pool.query<PaymentRow>(
      `SELECT * FROM payments WHERE form_id = $1 ORDER BY created_at DESC`,
      [formId],
    );
    return rows.map(mapRow);
  }

  /**
   * Get a single payment record by its Stripe PaymentIntent ID.
   */
  static async getByIntentId(intentId: string): Promise<PaymentRecord | null> {
    const { rows } = await pool.query<PaymentRow>(
      `SELECT * FROM payments WHERE stripe_payment_intent_id = $1 LIMIT 1`,
      [intentId],
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }

  /**
   * Revenue summary for a form: total collected, count by status.
   */
  static async getRevenueSummary(formId: string): Promise<{
    totalCents: number;
    successCount: number;
    pendingCount: number;
    failedCount: number;
    currency: string;
  }> {
    const { rows } = await pool.query(
      `SELECT
         COALESCE(SUM(CASE WHEN status = 'succeeded' THEN amount_cents ELSE 0 END), 0)::int AS total_cents,
         COUNT(CASE WHEN status = 'succeeded' THEN 1 END)::int AS success_count,
         COUNT(CASE WHEN status = 'pending'   THEN 1 END)::int AS pending_count,
         COUNT(CASE WHEN status = 'failed'    THEN 1 END)::int AS failed_count,
         MIN(currency) AS currency
       FROM payments
       WHERE form_id = $1`,
      [formId],
    );

    const row = rows[0];
    return {
      totalCents: row?.total_cents ?? 0,
      successCount: row?.success_count ?? 0,
      pendingCount: row?.pending_count ?? 0,
      failedCount: row?.failed_count ?? 0,
      currency: row?.currency ?? 'usd',
    };
  }
}
