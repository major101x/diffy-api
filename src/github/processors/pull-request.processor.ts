import { Processor, OnWorkerEvent, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { GithubService } from '../github.service';
import type { EmitterWebhookEvent } from '@octokit/webhooks';

@Processor('webhook-queue')
export class PullRequestProcessor extends WorkerHost {
  private readonly logger = new Logger(PullRequestProcessor.name);

  constructor(private readonly githubService: GithubService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { installationId, payload, deliveryId } = job.data as {
      installationId: number;
      payload: EmitterWebhookEvent<'pull_request'>['payload'];
      deliveryId: string;
    };
    await this.githubService.handlePullRequest(
      installationId,
      payload,
      deliveryId,
    );
  }

  @OnWorkerEvent('active')
  onActive(job: Job) {
    this.logger.log(
      `Processing job ${job.id} of name ${job.name} with data ${job.data}...`,
    );
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(
      `Job ${job.id} of name ${job.name} with data ${job.data} has completed`,
    );
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, error: Error) {
    this.logger.log(
      `Job ${job.id} of name ${job.name} with data ${job.data} has failed`,
    );
    this.logger.log(error);
  }
}
