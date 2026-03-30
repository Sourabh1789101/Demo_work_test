import { pool } from '../config/database.js';

export class AnalyticsService {
  /**
   * Returns submission counts grouped by day for the last N days.
   * Days with zero submissions are included so the caller always
   * receives a continuous date series.
   */
  static async getSubmissionTrend(
    formId: string,
    days = 30,
  ): Promise<Array<{ date: string; count: number }>> {
    const result = await pool.query<{ day: string; count: string }>(
      `
      SELECT
        to_char(DATE_TRUNC('day', submitted_at), 'YYYY-MM-DD') AS day,
        COUNT(*) AS count
      FROM submissions
      WHERE form_id = $1
        AND submitted_at >= NOW() - ($2 || ' days')::INTERVAL
      GROUP BY day
      ORDER BY day ASC
      `,
      [formId, days],
    );

    // Build a dense map of counted days
    const counted = new Map<string, number>();
    for (const row of result.rows) {
      counted.set(row.day, parseInt(row.count, 10));
    }

    // Fill every day in the range (oldest → today)
    const trend: Array<{ date: string; count: number }> = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setUTCDate(d.getUTCDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      trend.push({ date: dateStr, count: counted.get(dateStr) ?? 0 });
    }

    return trend;
  }

  /**
   * Returns placeholder field completion rates.
   * A real implementation would analyse partial-submission telemetry;
   * for now we fetch the form schema fields and return mock rates.
   */
  static async getFieldCompletionRates(
    formId: string,
  ): Promise<Array<{ fieldId: string; completionRate: number }>> {
    const result = await pool.query<{ schema: { components?: Array<{ id: string }> } }>(
      `SELECT schema FROM forms WHERE id = $1`,
      [formId],
    );

    if (result.rowCount === 0) {
      return [];
    }

    const schema = result.rows[0].schema as { components?: Array<{ id: string }> };
    const components: Array<{ id: string }> = schema?.components ?? [];

    // Deterministic mock: completion rate falls off linearly per field position
    return components.map((field, index) => ({
      fieldId: field.id,
      completionRate: Math.max(0.4, 1 - index * 0.05),
    }));
  }

  /**
   * Returns summary stats for a single form.
   */
  static async getFormStats(formId: string): Promise<{
    total: number;
    today: number;
    thisWeek: number;
    avgPerDay: number;
    firstSubmission: string | null;
    lastSubmission: string | null;
  }> {
    const result = await pool.query<{
      total: string;
      today: string;
      this_week: string;
      first_submission: string | null;
      last_submission: string | null;
    }>(
      `
      SELECT
        COUNT(*)                                                                 AS total,
        COUNT(*) FILTER (WHERE submitted_at >= CURRENT_DATE)                    AS today,
        COUNT(*) FILTER (WHERE submitted_at >= DATE_TRUNC('week', NOW()))       AS this_week,
        MIN(submitted_at)                                                        AS first_submission,
        MAX(submitted_at)                                                        AS last_submission
      FROM submissions
      WHERE form_id = $1
      `,
      [formId],
    );

    const row = result.rows[0];
    const total = parseInt(row.total, 10);

    // Calculate days the form has been active for avg/day
    let avgPerDay = 0;
    if (row.first_submission) {
      const firstDate = new Date(row.first_submission);
      const diffMs = Date.now() - firstDate.getTime();
      const diffDays = Math.max(1, diffMs / (1000 * 60 * 60 * 24));
      avgPerDay = Math.round((total / diffDays) * 100) / 100;
    }

    return {
      total,
      today: parseInt(row.today, 10),
      thisWeek: parseInt(row.this_week, 10),
      avgPerDay,
      firstSubmission: row.first_submission ?? null,
      lastSubmission: row.last_submission ?? null,
    };
  }

  /**
   * Returns overview stats across all forms (for the admin dashboard).
   */
  static async getDashboardStats(): Promise<{
    totalForms: number;
    totalSubmissions: number;
    formsThisMonth: number;
    submissionsThisMonth: number;
  }> {
    const formsResult = await pool.query<{
      total_forms: string;
      forms_this_month: string;
    }>(
      `
      SELECT
        COUNT(*)                                                                          AS total_forms,
        COUNT(*) FILTER (WHERE created_at >= DATE_TRUNC('month', NOW()))                 AS forms_this_month
      FROM forms
      `,
    );

    const submissionsResult = await pool.query<{
      total_submissions: string;
      submissions_this_month: string;
    }>(
      `
      SELECT
        COUNT(*)                                                                          AS total_submissions,
        COUNT(*) FILTER (WHERE submitted_at >= DATE_TRUNC('month', NOW()))               AS submissions_this_month
      FROM submissions
      `,
    );

    const fr = formsResult.rows[0];
    const sr = submissionsResult.rows[0];

    return {
      totalForms: parseInt(fr.total_forms, 10),
      totalSubmissions: parseInt(sr.total_submissions, 10),
      formsThisMonth: parseInt(fr.forms_this_month, 10),
      submissionsThisMonth: parseInt(sr.submissions_this_month, 10),
    };
  }
}
