import { createHmac } from 'node:crypto';

export type WebhookConfig = {
  url: string;
  secret?: string;
  events: string[];
};

type DeliveryResult = {
  success: boolean;
  statusCode?: number;
  error?: string;
};

export class WebhookService {
  /**
   * Deliver a single event payload to the webhook URL.
   * Adds an HMAC-SHA256 signature in `X-Webhook-Signature` when a secret
   * is configured.  Returns the delivery result without throwing.
   */
  static async deliver(
    config: WebhookConfig,
    event: string,
    payload: unknown,
  ): Promise<DeliveryResult> {
    // Only deliver if the config is listening for this event
    if (!config.events.includes(event) && !config.events.includes('*')) {
      return { success: true }; // silently skip unsubscribed events
    }

    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Webhook-Event': event,
    };

    if (config.secret) {
      const signature = createHmac('sha256', config.secret)
        .update(body)
        .digest('hex');
      headers['X-Webhook-Signature'] = signature;
    }

    try {
      const response = await fetch(config.url, {
        method: 'POST',
        headers,
        body,
        signal: AbortSignal.timeout(10_000), // 10 s hard timeout
      });

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          error: `Webhook endpoint returned HTTP ${response.status}`,
        };
      }

      return { success: true, statusCode: response.status };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      return { success: false, error: message };
    }
  }

  /**
   * Attempt delivery up to 3 times with exponential back-off (1 s, 2 s, 4 s).
   * Logs each attempt; never throws so callers are never blocked.
   */
  static async deliverWithRetry(
    config: WebhookConfig,
    event: string,
    payload: unknown,
  ): Promise<void> {
    const maxAttempts = 3;
    const backoffMs = [1_000, 2_000, 4_000];

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const result = await WebhookService.deliver(config, event, payload);

      if (result.success) {
        console.log(`[WebhookService] Delivered event "${event}" to ${config.url} (attempt ${attempt})`);
        return;
      }

      console.warn(
        `[WebhookService] Delivery attempt ${attempt}/${maxAttempts} failed for "${event}" → ${config.url}: ${result.error ?? result.statusCode}`,
      );

      if (attempt < maxAttempts) {
        const delay = backoffMs[attempt - 1] ?? 4_000;
        await new Promise<void>((resolve) => setTimeout(resolve, delay));
      }
    }

    console.error(
      `[WebhookService] All ${maxAttempts} delivery attempts exhausted for event "${event}" → ${config.url}`,
    );
  }
}
