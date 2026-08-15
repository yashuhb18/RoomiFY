import { Injectable, ExecutionContext } from '@nestjs/common';
import { PassportStrategy, AuthGuard } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('google.clientId') || process.env.GOOGLE_CLIENT_ID || 'dummy-client-id',
      clientSecret: configService.get<string>('google.clientSecret') || process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret',
      callbackURL: configService.get<string>('google.callbackUrl') || process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5000/api/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  async validate(
    req: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const googleId = profile?.id || '';
    const email = profile?.emails?.[0]?.value || profile?._json?.email || '';
    const givenName = profile?.name?.givenName || '';
    const familyName = profile?.name?.familyName || '';
    const displayName = profile?.displayName || profile?._json?.name || '';
    const name = (givenName || familyName) ? `${givenName} ${familyName}`.trim() : displayName;
    const picture = profile?.photos?.[0]?.value || profile?._json?.picture || '';

    const userPayload = {
      googleId,
      email,
      name,
      picture,
      accessToken,
    };
    done(null, userPayload);
  }
}

// Guard for initiating OAuth redirect to Google
@Injectable()
export class GoogleStartGuard extends AuthGuard('google') {}

// Guard for handling OAuth callback return from Google
@Injectable()
export class GoogleCallbackGuard extends AuthGuard('google') {
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const res = context.switchToHttp().getResponse();
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const errMsg = encodeURIComponent(info?.message || err?.message || 'Google authentication was cancelled or failed.');
      return res.redirect(`${frontendUrl}/login?error=${errMsg}`);
    }
    return user;
  }
}
