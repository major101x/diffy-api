import { Profile, Strategy } from 'passport-github2';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github2') {
  constructor(
    private authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      clientID: configService.get<string>('GITHUB_APP_CLIENT_ID')!,
      clientSecret: configService.get<string>('GITHUB_APP_CLIENT_SECRET')!,
      callbackURL: configService.get<string>('GITHUB_APP_CALLBACK_URL')!,
      scope: ['user:email'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: (err: Error | null, user?: any) => void,
  ): Promise<any> {
    const { id, displayName, username, emails, photos } = profile;
    const userDetails = {
      githubId: id,
      username: username,
      email: emails ? emails[0].value : undefined,
      avatarUrl: photos ? photos[0].value : undefined,
      name: displayName,
      githubAccessToken: accessToken,
      githubRefreshToken: refreshToken,
    };

    try {
      const user = await this.authService.validateOrCreateUser(userDetails);
      done(null, user);
    } catch (err) {
      done(err as Error, null);
    }
  }
}
