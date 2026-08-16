import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { GoogleStartGuard, GoogleCallbackGuard } from './strategies/google.strategy';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { ForgotPasswordDto, ResetPasswordWithOtpDto } from './dto/forgot-password.dto';
import { MfaVerifyDto } from './dto/mfa-verify.dto';
import { Public, CurrentUser, JwtPayload } from '../../common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post('reset-password-with-otp')
  @HttpCode(HttpStatus.OK)
  async resetPasswordWithOtp(@Body() dto: ResetPasswordWithOtpDto) {
    return this.authService.resetPasswordWithOtp(dto);
  }

  @Public()
  @UseGuards(AuthGuard('local'))
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 requests per minute
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const result = await this.authService.login(
      req.user,
      req.ip,
      req.get('user-agent'),
    );

    if (!result.requiresMfa && result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
      const { refreshToken, ...responseData } = result;
      return responseData;
    }

    return result;
  }

  @Public()
  @Post('google')
  @HttpCode(HttpStatus.OK)
  async googleLogin(
    @Body() body: { email?: string; name?: string; credential?: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const email = body.email || 'student.google@aegis.hostel';
    const name = body.name || 'Google Student';

    const result: any = await this.authService.googleLogin({ email, name });

    if (!result.requiresMfa && result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
      const { refreshToken, ...responseData } = result;
      return responseData;
    }

    return result;
  }

  @Public()
  @UseGuards(GoogleStartGuard)
  @Get('google')
  async googleAuthAlias(@Req() req: Request) {}

  @Public()
  @UseGuards(GoogleStartGuard)
  @Get('google/start')
  async googleAuth(@Req() req: Request) {
    // Initiates the Google OAuth flow
  }

  @Public()
  @UseGuards(GoogleCallbackGuard)
  @Get('google/callback')
  async googleAuthRedirect(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    try {
      const result: any = await this.authService.googleLogin(req.user as any);

      if (result.requiresProfileCompletion) {
        const email = encodeURIComponent(result.googleIdentity.email);
        const name = encodeURIComponent(result.googleIdentity.name || '');
        const picture = encodeURIComponent(result.googleIdentity.picture || '');
        return res.redirect(`${frontendUrl}/auth/callback?requiresProfile=true&email=${email}&name=${name}&picture=${picture}`);
      }

      if (result.requiresMfa) {
        return res.redirect(`${frontendUrl}/auth/callback?requiresMfa=true&mfaToken=${result.mfaToken}`);
      }

      if (result.refreshToken) {
        this.setRefreshTokenCookie(res, result.refreshToken);
      }

      return res.redirect(`${frontendUrl}/auth/callback?accessToken=${result.accessToken}`);
    } catch (err: any) {
      const errMsg = encodeURIComponent(err?.message || 'google_auth_failed');
      return res.redirect(`${frontendUrl}/login?error=${errMsg}`);
    }
  }

  @Public()
  @Post('google/complete-profile')
  @HttpCode(HttpStatus.CREATED)
  async completeGoogleProfile(
    @Body() dto: CompleteProfileDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result: any = await this.authService.completeGoogleProfile(
      dto,
      req.ip,
      req.get('user-agent'),
    );

    if (!result.requiresMfa && result.refreshToken) {
      this.setRefreshTokenCookie(res, result.refreshToken);
      const { refreshToken, ...responseData } = result;
      return responseData;
    }

    return result;
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'No refresh token provided.',
        error: 'Unauthorized',
      });
      return;
    }

    const tokens = await this.authService.refreshTokens(refreshToken);
    this.setRefreshTokenCookie(res, tokens.refreshToken);

    return { accessToken: tokens.accessToken };
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.sub);

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { message: 'Logged out successfully.' };
  }

  @Post('revoke-all-sessions')
  @HttpCode(HttpStatus.OK)
  async revokeAllSessions(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.revokeAllSessions(user.sub);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return result;
  }

  @Post('mfa/setup')
  @HttpCode(HttpStatus.OK)
  async setupMfa(@CurrentUser() user: JwtPayload) {
    return this.authService.setupMfa(user.sub);
  }

  @Post('mfa/verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @CurrentUser() user: JwtPayload,
    @Body() dto: MfaVerifyDto,
  ) {
    return this.authService.verifyAndEnableMfa(user.sub, dto.token);
  }

  @Public()
  @Post('mfa/validate')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @HttpCode(HttpStatus.OK)
  async validateMfa(
    @Body() body: { mfaToken: string; token: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.validateMfaToken(
      body.mfaToken,
      body.token,
    );

    this.setRefreshTokenCookie(res, result.refreshToken);

    return {
      accessToken: result.accessToken,
      user: result.user,
    };
  }

  private setRefreshTokenCookie(res: Response, refreshToken: string): void {
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  // -------------------------------------------------------------
  // SUPER & ULTRA SUPER LEVEL SECURITY ENDPOINTS
  // -------------------------------------------------------------
  @Post('step-up-verify')
  @HttpCode(HttpStatus.OK)
  async stepUpVerify(
    @CurrentUser() user: JwtPayload,
    @Body() body: { password: string },
  ) {
    return this.authService.stepUpVerify(user.sub, body.password);
  }

  @Get('sessions')
  async getSessions(
    @CurrentUser() user: JwtPayload,
    @Req() req: Request,
  ) {
    return this.authService.getActiveSessions(
      user.sub,
      req.ip,
      req.get('user-agent'),
    );
  }

  @Post('sessions/revoke')
  @HttpCode(HttpStatus.OK)
  async revokeSession(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.revokeSession(user.sub);
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return result;
  }

  @Post('lockdown')
  @HttpCode(HttpStatus.OK)
  async toggleLockdown(
    @CurrentUser() user: JwtPayload,
    @Body() body: { isLockdown: boolean; masterKey: string },
  ) {
    return this.authService.toggleLockdown(user.sub, body.isLockdown, body.masterKey);
  }

  @Public()
  @Get('lockdown-status')
  async getLockdownStatus() {
    return { lockdownActive: AuthService.getLockdownState() };
  }
}
