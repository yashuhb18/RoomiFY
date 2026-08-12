import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import * as speakeasy from 'speakeasy';
import * as QRCode from 'qrcode';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { AuditService } from '../audit/audit.service';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase().trim() },
      });

      if (!user) {
        // Timing-safe: still hash to prevent timing attacks
        await argon2.hash('dummy-password-for-timing');
        return null;
      }

      if (!user.isActive) {
        return null;
      }

      const isPasswordValid = await argon2.verify(user.passwordHash, password);

      if (!isPasswordValid) {
        return null;
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        hostelId: user.hostelId,
        isMfaEnabled: user.isMfaEnabled,
      };
    } catch (error) {
      this.logger.error('Error validating user', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Authentication service error.');
    }
  }

  async register(dto: RegisterDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase().trim() },
      });

      if (existingUser) {
        throw new ConflictException('An account with this email already exists.');
      }

      // Verify hostel exists
      const hostel = await this.prisma.hostel.findUnique({
        where: { id: dto.hostelId },
      });

      if (!hostel) {
        throw new BadRequestException('The specified hostel does not exist.');
      }

      const passwordHash = await argon2.hash(dto.password, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      const user = await this.prisma.user.create({
        data: {
          email: dto.email.toLowerCase().trim(),
          passwordHash,
          hostelId: dto.hostelId,
          role: dto.role || Role.STUDENT,
        },
        select: {
          id: true,
          email: true,
          role: true,
          hostelId: true,
        },
      });

      await this.auditService.log({
        action: 'USER_REGISTERED',
        newValue: { email: user.email, role: user.role },
        hostelId: user.hostelId,
        userId: user.id,
      });

      return {
        message: 'Registration successful.',
        user,
      };
    } catch (error) {
      if (error instanceof ConflictException || error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error('Registration error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Registration failed. Please try again.');
    }
  }

  async login(user: any, ipAddress?: string, userAgent?: string) {
    try {
      if (user.isMfaEnabled) {
        // Return a temporary token that can only be used for MFA validation
        const mfaToken = this.jwtService.sign(
          { sub: user.id, mfaPending: true },
          {
            secret: this.configService.get<string>('jwt.accessSecret'),
            expiresIn: '5m',
          },
        );

        return {
          requiresMfa: true,
          mfaToken,
        };
      }

      const tokens = await this.generateTokens(user);

      // Store hashed refresh token
      const refreshTokenHash = await argon2.hash(tokens.refreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash },
      });

      await this.auditService.log({
        action: 'USER_LOGIN',
        hostelId: user.hostelId,
        userId: user.id,
        ipAddress,
        userAgent,
      });

      return {
        requiresMfa: false,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          hostelId: user.hostelId,
        },
      };
    } catch (error) {
      this.logger.error('Login error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Login failed. Please try again.');
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.isActive || !user.refreshTokenHash) {
        throw new UnauthorizedException('Invalid refresh token.');
      }

      // Verify refresh token matches stored hash
      const isValid = await argon2.verify(user.refreshTokenHash, refreshToken);
      if (!isValid) {
        // Potential token theft — invalidate all sessions
        await this.prisma.user.update({
          where: { id: user.id },
          data: { refreshTokenHash: null },
        });
        throw new UnauthorizedException('Refresh token has been revoked. Please login again.');
      }

      // Rotate: issue new tokens and update stored hash
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        hostelId: user.hostelId,
      });

      const newRefreshTokenHash = await argon2.hash(tokens.refreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: newRefreshTokenHash },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Refresh token error', error instanceof Error ? error.stack : undefined);
      throw new UnauthorizedException('Invalid or expired refresh token.');
    }
  }

  async logout(userId: string) {
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { refreshTokenHash: null },
      });

      return { message: 'Logged out successfully.' };
    } catch (error) {
      this.logger.error('Logout error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Logout failed.');
    }
  }

  async setupMfa(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException('User not found.');
      }

      if (user.isMfaEnabled) {
        throw new BadRequestException('MFA is already enabled.');
      }

      const secret = speakeasy.generateSecret({
        name: `AEGIS Hostel (${user.email})`,
        issuer: 'AEGIS Hostel',
        length: 32,
      });

      // Store the secret (not yet enabled)
      await this.prisma.user.update({
        where: { id: userId },
        data: { mfaSecret: secret.base32 },
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('MFA setup error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('MFA setup failed.');
    }
  }

  async verifyAndEnableMfa(userId: string, token: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user || !user.mfaSecret) {
        throw new BadRequestException('MFA has not been set up. Please set up MFA first.');
      }

      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token,
        window: 1,
      });

      if (!isValid) {
        throw new BadRequestException('Invalid OTP. Please try again.');
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { isMfaEnabled: true },
      });

      await this.auditService.log({
        action: 'MFA_ENABLED',
        hostelId: user.hostelId,
        userId: user.id,
      });

      return { message: 'MFA has been enabled successfully.' };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      this.logger.error('MFA verify error', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('MFA verification failed.');
    }
  }

  async validateMfaToken(mfaToken: string, otpToken: string) {
    try {
      const payload = this.jwtService.verify(mfaToken, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      });

      if (!payload.mfaPending) {
        throw new UnauthorizedException('Invalid MFA token.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || !user.mfaSecret || !user.isMfaEnabled) {
        throw new UnauthorizedException('MFA is not configured for this account.');
      }

      const isValid = speakeasy.totp.verify({
        secret: user.mfaSecret,
        encoding: 'base32',
        token: otpToken,
        window: 1,
      });

      if (!isValid) {
        throw new UnauthorizedException('Invalid OTP code.');
      }

      // MFA passed — issue full tokens
      const tokens = await this.generateTokens({
        id: user.id,
        email: user.email,
        role: user.role,
        hostelId: user.hostelId,
      });

      const refreshTokenHash = await argon2.hash(tokens.refreshToken);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash },
      });

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          hostelId: user.hostelId,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;
      this.logger.error('MFA validation error', error instanceof Error ? error.stack : undefined);
      throw new UnauthorizedException('MFA validation failed.');
    }
  }

  private async generateTokens(user: {
    id: string;
    email: string;
    role: string;
    hostelId: string;
  }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      hostelId: user.hostelId,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.accessSecret'),
        expiresIn: this.configService.get<number>('jwt.accessExpiry'),
      }),
      this.jwtService.signAsync(
        { sub: user.id },
        {
          secret: this.configService.get<string>('jwt.refreshSecret'),
          expiresIn: this.configService.get<number>('jwt.refreshExpiry'),
        },
      ),
    ]);

    return { accessToken, refreshToken };
  }
}
