import { pool } from '../config/database.js';

type SubmissionRecord = {
  id: string;
  data: Record<string, unknown>;
  submittedAt: string;
};

export class ReportGenerator {
  /**
   * Generate a RFC-4180-compliant CSV string from a submissions array.
   * All unique field keys across all submissions become columns.
   */
  static generateCSV(submissions: SubmissionRecord[]): string {
    if (submissions.length === 0) {
      return 'id,submittedAt\n';
    }

    // Collect every unique field key (preserving insertion order)
    const fieldKeys = new Set<string>();
    for (const sub of submissions) {
      for (const key of Object.keys(sub.data)) {
        fieldKeys.add(key);
      }
    }

    const fields = Array.from(fieldKeys);
    const headerRow = ['id', 'submittedAt', ...fields].map(csvEscape).join(',');

    const dataRows = submissions.map((sub) => {
      const cells = [
        csvEscape(sub.id),
        csvEscape(sub.submittedAt),
        ...fields.map((f) => csvEscape(String(sub.data[f] ?? ''))),
      ];
      return cells.join(',');
    });

    return [headerRow, ...dataRows].join('\r\n') + '\r\n';
  }

  /**
   * Generate a JSON report object with summary statistics.
   */
  static generateJSONReport(
    formTitle: string,
    submissions: SubmissionRecord[],
  ): object {
    const total = submissions.length;

    const submittedDates = submissions
      .map((s) => new Date(s.submittedAt).getTime())
      .filter((t) => !isNaN(t));

    const firstSubmission =
      submittedDates.length > 0
        ? new Date(Math.min(...submittedDates)).toISOString()
        : null;

    const lastSubmission =
      submittedDates.length > 0
        ? new Date(Math.max(...submittedDates)).toISOString()
        : null;

    // Count submissions per day
    const byDay: Record<string, number> = {};
    for (const sub of submissions) {
      const day = sub.submittedAt.slice(0, 10);
      byDay[day] = (byDay[day] ?? 0) + 1;
    }

    const dailyCounts = Object.entries(byDay)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Field coverage (how many submissions have each field non-empty)
    const fieldCoverage: Record<string, number> = {};
    for (const sub of submissions) {
      for (const [key, value] of Object.entries(sub.data)) {
        if (value !== null && value !== undefined && value !== '') {
          fieldCoverage[key] = (fieldCoverage[key] ?? 0) + 1;
        }
      }
    }

    const fieldStats = Object.entries(fieldCoverage).map(([field, count]) => ({
      field,
      count,
      completionRate: total > 0 ? Math.round((count / total) * 100) / 100 : 0,
    }));

    return {
      report: {
        formTitle,
        generatedAt: new Date().toISOString(),
        summary: {
          total,
          firstSubmission,
          lastSubmission,
        },
        dailyCounts,
        fieldStats,
      },
      submissions,
    };
  }

  /**
   * Fetch all submissions for a form from the database and produce both
   * CSV and JSON report formats.
   */
  static async generateFormReport(
    formId: string,
  ): Promise<{ csv: string; json: object; filename: string }> {
    // Fetch form metadata
    const formResult = await pool.query<{ title: string }>(
      `SELECT title FROM forms WHERE id = $1`,
      [formId],
    );

    const formTitle =
      formResult.rowCount && formResult.rowCount > 0
        ? formResult.rows[0].title
        : formId;

    // Fetch submissions
    const subResult = await pool.query<{
      id: string;
      data: Record<string, unknown>;
      submitted_at: string;
    }>(
      `
      SELECT id, data, submitted_at
      FROM submissions
      WHERE form_id = $1
      ORDER BY submitted_at ASC
      `,
      [formId],
    );

    const submissions: SubmissionRecord[] = subResult.rows.map((row) => ({
      id: row.id,
      data: row.data,
      submittedAt: row.submitted_at,
    }));

    const csv = ReportGenerator.generateCSV(submissions);
    const json = ReportGenerator.generateJSONReport(formTitle, submissions);

    // Sanitise form title for use in a filename
    const safeTitle = formTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dateStr = new Date().toISOString().slice(0, 10);
    const filename = `${safeTitle}_report_${dateStr}`;

    return { csv, json, filename };
  }
}

/** Escape a value for CSV per RFC 4180. */
function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
