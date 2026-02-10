import { Controller, Get, Redirect, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('github')
  @UseGuards(AuthGuard('github2'))
  @Redirect(
    `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}`,
    302,
  )
  async GitHub() {}

  @Get('callback')
  @UseGuards(AuthGuard('github2'))
  GitHubCallback(@Res() res: Response, @Req() req: Request) {
    const token = this.authService.generateToken(req.user as JwtPayload);
    return res.redirect(
      `${this.configService.get<string>('GITHUB_REDIRECT_URL')}?token=${token}`,
    );
  }
}
