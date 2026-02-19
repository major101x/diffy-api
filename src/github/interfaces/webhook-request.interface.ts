import { EmitterWebhookEvent } from '@octokit/webhooks';
import { Request } from 'express';

export interface WebhookRequest extends Request {
  body:
    | EmitterWebhookEvent<'installation'>['payload']
    | EmitterWebhookEvent<'pull_request'>['payload'];
  rawBody?: Buffer;
}
