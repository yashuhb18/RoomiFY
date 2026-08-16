import { Injectable, BadRequestException, NotFoundException, UnauthorizedException, Logger, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditService } from '../../audit/audit.service';
import { AuthService } from '../auth.service';
import * as crypto from 'crypto';

const EMOJI_PALETTE = [
  '🏠', '🌟', '🎯', '💎', '🔥', '⚡', '🚀', '🔑',
  '🛡️', '👑', '🌌', '🎨', '🦁', '🔮', '🍀', '🍕',
  '🎸', '👾', '🏆', '💎', '🌈', '🧩', '⚓', '🛸'
];

@Injectable()
export class EmojiCipherService {
  private readonly logger = new Logger(EmojiCipherService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly auditService: AuditService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  /**
   * One-Time Setup of secret 4-emoji sequence
   */
  async setupSequence(userId: string, emojis: string[]) {
    if (!Array.isArray(emojis) || emojis.length !== 4) {
      throw new BadRequestException('Emoji Cipher requires a sequence of exactly 4 emojis.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found.');

    const sequenceString = emojis.join('');
    const sequenceHash = crypto.createHash('sha256').update(sequenceString).digest('hex');

    const cipher = await this.prisma.emojiCipher.upsert({
      where: { userId },
      create: {
        userId,
        sequenceHash,
        emojis,
      },
      update: {
        sequenceHash,
        emojis,
      },
    });

    await this.auditService.log({
      action: 'EMOJI_CIPHER_SETUP',
      newValue: { count: emojis.length },
      hostelId: user.hostelId,
      userId,
    });

    return { success: true, message: 'Emoji Cipher 4-emoji sequence configured successfully!' };
  }

  /**
   * Get user's configured Emoji Cipher status
   */
  async getStatus(userId: string) {
    const cipher = await this.prisma.emojiCipher.findUnique({ where: { userId } });
    return {
      isConfigured: !!cipher,
      configuredAt: cipher?.updatedAt || null,
    };
  }

  /**
   * Generate dynamic 3x3 challenge grid (9 slots) for SuperAdmin login step 3
   */
  async generateChallengeGrid(userId: string) {
    let user = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user && userId?.includes('@')) {
      user = await this.prisma.user.findUnique({ where: { email: userId.toLowerCase().trim() } });
    }
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    }

    const actualUserId = user?.id || userId;
    const cipher = await this.prisma.emojiCipher.findUnique({ where: { userId: actualUserId } });
    
    // Default sequence fallback if not pre-configured
    const secretEmojis = cipher ? (cipher.emojis as string[]) : ['🏠', '🌟', '🎯', '💎'];
    const targetEmoji = secretEmojis[0]; // First emoji in secret sequence

    // Select 8 filler emojis different from targetEmoji
    const fillers = EMOJI_PALETTE.filter((e) => e !== targetEmoji);
    const shuffledFillers = [...fillers].sort(() => Math.random() - 0.5).slice(0, 8);

    // Insert target emoji at random index (0-8)
    const targetIndex = Math.floor(Math.random() * 9);
    const grid: Array<{ id: number; emoji: string; isLocked: boolean }> = [];

    let fillerIdx = 0;
    for (let i = 0; i < 9; i++) {
      if (i === targetIndex) {
        grid.push({ id: i, emoji: '🔒', isLocked: true });
      } else {
        grid.push({ id: i, emoji: shuffledFillers[fillerIdx++], isLocked: false });
      }
    }

    const challenge = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await this.prisma.authChallengeSession.create({
      data: {
        userId: actualUserId,
        type: 'EMOJI_CIPHER_PUZZLE',
        challenge: `${challenge}:${targetIndex}:${targetEmoji}`,
        expiresAt,
      },
    });

    return {
      challengeId: challenge,
      grid,
      promptHint: `Identify the 🔒 slot and replace it with your 1st secret emoji!`,
      secretFirstEmoji: secretEmojis[0], // Provided for demo interaction
      secretSequence: secretEmojis,
    };
  }

  /**
   * Verify solved Emoji Cipher attempt
   */
  async verifyPuzzleAttempt(userId: string, selectedEmoji: string, slotIndex: number) {
    let user = userId ? await this.prisma.user.findUnique({ where: { id: userId } }) : null;
    if (!user && userId?.includes('@')) {
      user = await this.prisma.user.findUnique({ where: { email: userId.toLowerCase().trim() } });
    }
    if (!user) {
      user = await this.prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    }
    if (!user) throw new NotFoundException('User not found.');

    const cipher = await this.prisma.emojiCipher.findUnique({ where: { userId: user.id } });
    const secretEmojis = cipher ? (cipher.emojis as string[]) : ['🏠', '🌟', '🎯', '💎'];
    const expectedFirstEmoji = secretEmojis[0];

    if (selectedEmoji !== expectedFirstEmoji) {
      throw new UnauthorizedException('Incorrect Emoji Cipher solution. Access denied.');
    }

    await this.auditService.log({
      action: 'EMOJI_CIPHER_SOLVED',
      newValue: { solved: true },
      hostelId: user.hostelId,
      userId: user.id,
    });

    const session = await this.authService.issueTokensForUser(user.id);
    return {
      verified: true,
      message: 'Emoji Cipher verified — Access Granted!',
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      user: session.user,
    };
  }
}
