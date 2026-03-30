import { createHmac } from 'node:crypto';

// ─── Integration Types ────────────────────────────────────────────────────────
export type IntegrationType = 'zapier' | 'make' | 'n8n' | 'generic';

export type IntegrationWebhookConfig = {
  url: string;
  secret?: string;
  events: string[];
  integrationType?: IntegrationType;
};

type DeliveryResult = {
  success: boolean;
  statusCode?: number;
  error?: string;
  attempt?: number;
};

// ─── Payload Formatters ───────────────────────────────────────────────────────

/**
 * Zapier expects a flat key→value JSON object.
 * Nested objects are stringified.
 */
function formatZapierPayload(event: string, payload: unknown): Record<string, unknown> {
  const raw = typeof payload === 'object' && payload !== null ? payload : { data: payload };
  const flat: Record<string, unknown> = { _event: event, _timestamp: new Date().toISOString() };

  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    flat[key] = typeof value === 'object' && value !== null ? JSON.stringify(value) : value;
  }

  return flat;
}

/**
 * Make.com (formerly Integromat) accepts any JSON.
 * Wraps in their preferred envelope.
 */
function formatMakePayload(event: string, payload: unknown): Record<string, unknown> {
  return {
    event,
    timestamp: new Date().toISOString(),
    data: payload,
  };
}

/**
 * n8n accepts any JSON; it just needs the event at root level.
 */
function formatN8nPayload(event: string, payload: unknown): Record<string, unknown> {
  return {
    event,
    timestamp: new Date().toISOString(),
    ...(typeof payload === 'object' && payload !== null ? (payload as object) : { payload }),
  };
}

/**
 * Generic / default format — same as WebhookService.deliver.
 */
function formatGenericPayload(event: string, payload: unknown): Record<string, unknown> {
  return {
    event,
    payload,
    timestamp: new Date().toISOString(),
  };
}

// ─── ZapierService ────────────────────────────────────────────────────────────
export class ZapierService {
  /**
   * Deliver a webhook event formatted for the target integration platform.
   * Signs the body with HMAC-SHA256 when a secret is provided.
   */
  static async deliver(
    config: IntegrationWebhookConfig,
    event: string,
    payload: unknown,
  ): Promise<DeliveryResult> {
    if (!config.events.includes(event) && !config.events.includes('*')) {
      return { success: true }; // silently skip unsubscribed events
    }

    const integrationType: IntegrationType = config.integrationType ?? 'generic';

    let formattedPayload: Record<string, unknown>;
    switch (integrationType) {
      case 'zapier':
        formattedPayload = formatZapierPayload(event, payload);
        break;
      case 'make':
        formattedPayload = formatMakePayload(event, payload);
        break;
      case 'n8n':
        formattedPayload = formatN8nPayload(event, payload);
        break;
      default:
        formattedPayload = formatGenericPayload(event, payload);
    }

    const body = JSON.stringify(formattedPayload);

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'KIM-AI-FormBuilder/1.0',
      'X-Webhook-Event': event,
      'X-Integration-Type': integrationType,
    };

    if (config.secret) {
      const signature = createHmac('sha256', config.secret).update(body).digest('hex');
      headers['X-Webhook-Signature'] = `sha256=${signature}`;
      // Zapier also reads X-Hub-Signature-256 (GitHub-compatible)
      if (integrationType === 'zapier') {
        headers['X-Hub-Signature-256'] = `sha256=${signature}`;
      }
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(15_000),
      });

      return {
        success: response.ok,
        statusCode: response.status,
        error: response.ok ? undefined : `HTTP ${response.status}`,
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return { success: false, error };
    }
  }

  /**
   * Retry delivery up to 3 times with exponential back-off.
   */
  static async deliverWithRetry(
    config: IntegrationWebhookConfig,
    event: string,
    payload: unknown,
  ): Promise<void> {
    const delays = [1_000, 3_000, 9_000];
    const integrationType = config.integrationType ?? 'generic';

    for (let attempt = 1; attempt <= 3; attempt++) {
      const result = await ZapierService.deliver(config, event, payload);

      if (result.success) {
        console.log(
          `[ZapierService] ✓ Delivered "${event}" → ${config.url} [${integrationType}] (attempt ${attempt})`,
        );
        return;
      }

      console.warn(
        `[ZapierService] ✗ Attempt ${attempt}/3 failed for "${event}" → ${config.url}: ${result.error}`,
      );

      if (attempt < 3) {
        await new Promise<void>((resolve) => setTimeout(resolve, delays[attempt - 1]));
      }
    }

    console.error(`[ZapierService] All 3 attempts exhausted for "${event}" → ${config.url}`);
  }

  /**
   * Fan out a single event to multiple webhook targets in parallel.
   * Each delivery is independent — one failure doesn't block others.
   */
  static async fanOut(
    configs: IntegrationWebhookConfig[],
    event: string,
    payload: unknown,
  ): Promise<void> {
    await Promise.allSettled(
      configs.map((cfg) => ZapierService.deliverWithRetry(cfg, event, payload)),
    );
  }

  /**
   * Verify an incoming Zapier/Make.com webhook signature.
   * Returns true if the signature is valid, false otherwise.
   */
  static verifySignature(body: string, secret: string, signature: string): boolean {
    const expected = `sha256=${createHmac('sha256', secret).update(body).digest('hex')}`;
    // constant-time comparison to prevent timing attacks
    if (expected.length !== signature.length) return false;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
    }
    return diff === 0;
  }
}
