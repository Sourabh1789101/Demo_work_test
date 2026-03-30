import type { Request, Response } from 'express';
import { AnalyticsService } from '../services/AnalyticsService.js';

/* ── Dashboard overview ─────────────────────────────────────────────────── */
export const getDashboardStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await AnalyticsService.getDashboardStats();
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[analyticsController] getDashboardStats error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard stats' },
    });
  }
};

/* ── Per-form stats ─────────────────────────────────────────────────────── */
export const getFormStats = async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;

  if (!formId) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'formId is required' },
    });
    return;
  }

  try {
    const data = await AnalyticsService.getFormStats(String(formId));
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[analyticsController] getFormStats error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch form stats' },
    });
  }
};

/* ── Submission trend ───────────────────────────────────────────────────── */
export const getSubmissionTrend = async (req: Request, res: Response): Promise<void> => {
  const { formId } = req.params;

  if (!formId) {
    res.status(400).json({
      success: false,
      error: { code: 'BAD_REQUEST', message: 'formId is required' },
    });
    return;
  }

  const rawDays = req.query['days'];
  const days = rawDays ? parseInt(String(rawDays), 10) : 30;

  if (isNaN(days) || days < 1 || days > 365) {
    res.status(400).json({
      success: false,
      error: {
        code: 'BAD_REQUEST',
        message: 'days must be a number between 1 and 365',
      },
    });
    return;
  }

  try {
    const data = await AnalyticsService.getSubmissionTrend(String(formId), days);
    res.status(200).json({ success: true, data });
  } catch (err) {
    console.error('[analyticsController] getSubmissionTrend error:', err);
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch submission trend' },
    });
  }
};
