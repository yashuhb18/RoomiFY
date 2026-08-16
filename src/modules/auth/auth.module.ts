import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PasskeyService } from './services/passkey.service';
import { EmojiCipherService } from './services/emoji-cipher.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { GoogleStrategy, GoogleStartGuard, GoogleCallbackGuard } from './strategies/google.strategy';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.accessSecret'),
        signOptions: {
          expiresIn: configService.get<number>('jwt.accessExpiry'),
        },
      }),
    }),
    AuditModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, PasskeyService, EmojiCipherService, JwtStrategy, LocalStrategy, GoogleStrategy, GoogleStartGuard, GoogleCallbackGuard],
  exports: [AuthService, PasskeyService, EmojiCipherService, GoogleStartGuard, GoogleCallbackGuard],
})
export class AuthModule {}
