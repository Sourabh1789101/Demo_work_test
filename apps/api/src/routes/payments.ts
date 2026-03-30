import { Router } from 'express';
import express from 'express';
import {
  createPaymentIntent,
  stripeWebhook,
  listFormPayments,
  getFormRevenueSummary,
  getPaymentByIntent,
} from '../controllers/paymentController.js';

export const paymentsRouter = Router();

// ── Stripe webhook (MUST use raw body — mounted before json middleware in app.ts) ──
paymentsRouter.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  stripeWebhook,
);

// ── Payment intent creation ──
paymentsRouter.post('/intent', createPaymentIntent);

// ── Look up by Stripe intent ID ──
paymentsRouter.get('/intent/:intentId', getPaymentByIntent);

// ── Per-form payment records ──
paymentsRouter.get('/forms/:formId', listFormPayments);
paymentsRouter.get('/forms/:formId/summary', getFormRevenueSummary);
