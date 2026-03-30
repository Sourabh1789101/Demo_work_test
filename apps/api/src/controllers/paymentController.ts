import type { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService.js';

// ─── POST /api/payments/intent ────────────────────────────────────────────────
// Create a Stripe PaymentIntent. Returns the clientSecret for the frontend.
export const createPaymentIntent = async (req: Request, res: Response): Promise<void> => {
  const { formId, submissionId, amountCents, currency, description } = req.body as {
    formId?: string;
    submissionId?: string;
    amountCents?: number;
    currency?: string;
    description?: string;
  };

  if (!formId) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'formId is required' } });
    return;
  }

  if (typeof amountCents !== 'number' || amountCents < 50) {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'amountCents must be a number >= 50 (minimum $0.50)' } });
    return;
  }

  try {
    const result = await PaymentService.createPaymentIntent({
      formId,
      submissionId,
      amountCents,
      currency: currency ?? 'usd',
      description,
    });
    res.status(201).json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create payment intent';
    res.status(500).json({ success: false, error: { code: 'PAYMENT_ERROR', message } });
  }
};

// ─── POST /api/payments/webhook ───────────────────────────────────────────────
// Stripe webhook — must be called with raw body (before JSON parsing).
export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'];

  if (!signature || typeof signature !== 'string') {
    res.status(400).json({ success: false, error: { code: 'BAD_REQUEST', message: 'Missing Stripe-Signature header' } });
    return;
  }

  try {
    await PaymentService.handleWebhookEvent(req.body as Buffer, signature);
    res.status(200).json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook error';
    res.status(400).json({ success: false, error: { code: 'WEBHOOK_ERROR', message } });
  }
};

// ─── GET /api/payments/forms/:formId ─────────────────────────────────────────
// List all payment records for a form.
export const listFormPayments = async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  try {
    const payments = await PaymentService.listByForm(String(formId));
    res.json({ success: true, data: payments });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to list payments';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// ─── GET /api/payments/forms/:formId/summary ──────────────────────────────────
// Revenue summary for a form.
export const getFormRevenueSummary = async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;
  try {
    const summary = await PaymentService.getRevenueSummary(String(formId));
    res.json({ success: true, data: summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get revenue summary';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};

// ─── GET /api/payments/intent/:intentId ──────────────────────────────────────
// Look up a payment record by its Stripe PaymentIntent ID.
export const getPaymentByIntent = async (req: Request, res: Response): Promise<void> => {
  const { intentId } = req.params;
  try {
    const payment = await PaymentService.getByIntentId(String(intentId));
    if (!payment) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Payment not found' } });
      return;
    }
    res.json({ success: true, data: payment });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to get payment';
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message } });
  }
};
