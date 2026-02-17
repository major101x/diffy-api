import { Injectable, NotFoundException } from '@nestjs/common';
import { App } from 'octokit';
import type { EmitterWebhookEvent } from '@octokit/webhooks';
import { UsersService } from 'src/users/users.service';
import { PrismaService } from '../prisma.service';

@Injectable()
export class GithubService {
  app: App;

  constructor(
    private readonly userService: UsersService,
    private readonly prisma: PrismaService,
  ) {
    const key = Buffer.from(
      process.env.GITHUB_APP_PRIVATE_KEY!,
      'base64',
    ).toString('utf-8');

    this.app = new App({
      appId: process.env.GITHUB_APP_APP_ID!,
      privateKey: key,
      webhooks: {
        secret: process.env.GITHUB_APP_WEBHOOK_SECRET!,
      },
    });
  }

  private async pullRequestExists(githubDeliveryId: string) {
    return this.prisma.pullRequest.findUnique({
      where: { githubDeliveryId },
    });
  }

  async requestInstallationUrl() {
    const installationUrl = await this.app.getInstallationUrl();
    return installationUrl;
  }

  async handleInstallation(
    installationId: number,
    senderId: number,
    action: string,
  ) {
    if (action !== 'created') {
      return;
    }
    const user = await this.userService.findByGithubId(senderId.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }
    await this.userService.update(user.id, { installationId: installationId });
  }

  async handlePullRequest(
    installationId: number,
    payload: EmitterWebhookEvent<'pull_request'>['payload'],
    deliveryId: string,
  ) {
    const { action, pull_request, sender, repository } = payload;
    if (action !== 'opened') {
      return;
    }
    const user = await this.userService.findByGithubId(sender.id.toString());
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const exists = await this.pullRequestExists(deliveryId);
    if (exists) {
      console.log('Pull request already exists');
      return { status: 'OK', message: 'Pull request already exists' };
    }
    const pullRequest = await this.prisma.pullRequest.create({
      data: {
        id: pull_request.id,
        githubDeliveryId: deliveryId,
        number: pull_request.number,
        title: pull_request.title,
        body: pull_request.body,
        state: pull_request.state,
        htmlUrl: pull_request.html_url,
        diffUrl: pull_request.diff_url,
        createdAt: pull_request.created_at,
        updatedAt: pull_request.updated_at,
        commits: pull_request.commits,
        additions: pull_request.additions,
        deletions: pull_request.deletions,
        changedFiles: pull_request.changed_files,
        authorName: pull_request.user.login,
        repoName: repository.name,
        userId: user.id,
      },
    });
    console.log(pullRequest);
    return pullRequest;
  }

  async createInstallationToken(installationId: number) {
    const octokit = await this.app.getInstallationOctokit(installationId);
    const installationToken = await octokit.request(
      `POST /app/installations/${installationId}/access_tokens`,
      {
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
        },
      },
    );
    return installationToken;
  }

  async validateWebhook(rawBody: string, signature: string) {
    const isValid = await this.app.webhooks.verify(rawBody, signature);
    return isValid;
  }

  async listInstallations() {
    const installations = await this.app.octokit.request(
      'GET /app/installations',
    );
    return installations.data;
  }

  async getPullRequest(
    owner: string,
    repo: string,
    pull_number: number,
    installationId: number,
  ) {
    const octokit = await this.app.getInstallationOctokit(installationId);
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          accept: 'application/vnd.github+json',
        },
      },
    );
    return response.data;
  }

  async getDiff(
    owner: string,
    repo: string,
    pull_number: number,
    installationId: number,
  ) {
    const octokit = await this.app.getInstallationOctokit(installationId);
    const response = await octokit.request(
      'GET /repos/{owner}/{repo}/pulls/{pull_number}',
      {
        owner: owner,
        repo: repo,
        pull_number: pull_number,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28',
          accept: 'application/vnd.github.diff+json',
        },
      },
    );
    return response.data;
  }
}
