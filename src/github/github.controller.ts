import {
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
    @Req() req: Request,
    @Headers('x-hub-signature-256') signature: string,
    @Headers('x-github-event') event: string,
  ) {
    const rawBody = (req as any).rawBody.toString();
    console.log(rawBody);
    console.log(signature);
    console.log(event);

    const isValid = await this.githubService.validateWebhook(
      rawBody,
      signature,
    );

    if (!isValid) {
      console.log('Invalid webhook');
      return { status: 'ERROR' };
    }

    if (event === 'installation') {
      await this.githubService.handleInstallation(
        req.body.installation.id,
        req.body.sender.id,
        req.body.action,
      );
    } else if (event === 'pull_request') {
      await this.githubService.handlePullRequest(
        req.body.installation.id,
        req.body,
      );
    }

    return { status: 'OK' };
    console.log(req.body);
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
