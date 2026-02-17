import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Param,
  Post,
  Redirect,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { GithubService } from './github.service';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { UsersService } from 'src/users/users.service';
import type { AuthenticatedRequest } from 'src/auth/interfaces/user.interface';
import type { WebhookRequest } from './interfaces/webhook-request.interface';
import type { EmitterWebhookEvent } from '@octokit/webhooks';

@Controller('github')
export class GithubController {
  constructor(
    private readonly githubService: GithubService,
    private readonly userService: UsersService,
  ) {}

  @Get('install')
  @Redirect()
  async install(@Res() res: Response) {
    const url = await this.githubService.requestInstallationUrl();
    return res.redirect(url);
  }

  @Post('webhook')
  async webhook(
    @Req() req: WebhookRequest,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
    @Headers('x-github-delivery') deliveryId: string,
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    const rawBody = req.rawBody.toString();

    const isValid = await this.githubService.validateWebhook(
      rawBody,
      signature,
    );

    if (!isValid) {
      console.log('Invalid webhook');
      return { status: 'ERROR' };
    }

    const installationId = (req.body as { installation: { id: number } })
      .installation.id;

    if (event === 'installation') {
      const body = req.body as EmitterWebhookEvent<'installation'>['payload'];
      await this.githubService.handleInstallation(
        installationId,
        body.sender.id,
        body.action,
      );
    } else if (event === 'pull_request') {
      const body = req.body as EmitterWebhookEvent<'pull_request'>['payload'];
      await this.githubService.handlePullRequest(
        installationId,
        body,
        deliveryId,
      );
    }

    console.log(`Webhook with id ${deliveryId} processed successfully`);
    return { status: 'OK' };
  }

  @Get('pull-request/:owner/:repo/:pull_number')
  @UseGuards(JwtAuthGuard)
  async getPullRequest(
    @Req() req: AuthenticatedRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull_number') pull_number: number,
  ) {
    const installationId = await this.userService.getUserInstallationId(
      req.user.githubId,
    );
    return this.githubService.getPullRequest(
      owner,
      repo,
      pull_number,
      Number(installationId),
    );
  }

  @Get('diff/:owner/:repo/:pull_number')
  @UseGuards(JwtAuthGuard)
  async getDiff(
    @Req() req: AuthenticatedRequest,
    @Param('owner') owner: string,
    @Param('repo') repo: string,
    @Param('pull_number') pull_number: number,
  ) {
    const installationId = await this.userService.getUserInstallationId(
      req.user.githubId,
    );
    return this.githubService.getDiff(
      owner,
      repo,
      pull_number,
      Number(installationId),
    );
  }
}
