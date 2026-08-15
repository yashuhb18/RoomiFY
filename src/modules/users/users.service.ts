import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuditService } from '../audit/audit.service';

// ─── Symbiotic Strain – Opposite Energy Windows ──────────────────────────────
const OPPOSITE_WINDOWS: Record<string, string> = {
  dawn:     'midnight',
  midnight: 'dawn',
  midday:   'dusk',
  dusk:     'midday',
};

// ─── Symbiotic Strain – Sustainable Co-existence Score ───────────────────────
/**
 * Calculates a "Chance of Peaceful Survival" score (0–100) using the
 * 4-rule Symbiotic Strain Model.
 *
 * Rule 1 – The Golden Rule:  Opposite Peak Energy Windows → +25
 * Rule 2 – The Clash Rule:   Both territoriality > 7   → -40
 *                            Both territoriality < 3   → +10
 * Rule 3 – The Money Rule:   Financial style mismatch  → -35
 * Rule 4 – The Guest Rule:   Guest philosophy mismatch → -20
 */
function calculateCompatibilityScore(
  userA: Record<string, any>,
  userB: Record<string, any>,
): number {
  let score = 100;

  // Rule 1 – Golden Rule
  const windowA = (userA.peakEnergyWindow as string | undefined) ?? '';
  const windowB = (userB.peakEnergyWindow as string | undefined) ?? '';
  if (windowA && windowB && OPPOSITE_WINDOWS[windowA] === windowB) {
    score += 25;
  }

  // Rule 2 – Clash Rule
  const terrA = Number(userA.territoriality) || 0;
  const terrB = Number(userB.territoriality) || 0;
  if (terrA > 0 && terrB > 0) {
    if (terrA > 7 && terrB > 7) {
      score -= 40;
    } else if (terrA < 3 && terrB < 3) {
      score += 10;
    }
  }

  // Rule 3 – Money Rule
  const finA = (userA.financialSplitStyle as string | undefined) ?? '';
  const finB = (userB.financialSplitStyle as string | undefined) ?? '';
  if (finA && finB && finA !== finB) {
    score -= 35;
  }

  // Rule 4 – Guest Rule
  const guestA = (userA.guestPhilosophy as string | undefined) ?? '';
  const guestB = (userB.guestPhilosophy as string | undefined) ?? '';
  if (guestA && guestB && guestA !== guestB) {
    score -= 20;
  }

  // Clamp 0–100
  return Math.max(0, Math.min(100, score));
}

/** 3-Month Forecast string based on the co-existence score */
function get3MonthForecast(score: number): string {
  if (score > 75) {
    return 'Low Stress: You two are rhythmically aligned. Expected conflict: Minimal.';
  } else if (score >= 50) {
    return 'Medium Stress: Compromise needed on finances/guests. Expected conflict: Occasional.';
  } else {
    return 'High Stress: Fundamental lifestyle clash detected. Expected conflict: Weekly.';
  }
}

export interface MatchResult {
  userId: string;
  email: string;
  name: string;
  score: number;
  matchingTraits: string[];
  forecast: string;
}

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly auditService: AuditService,
  ) {}

  async getProfile(userId: string) {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error fetching profile', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch profile.');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto, hostelId: string) {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const oldProfile = user.profile;
      const updatedUser = await this.usersRepository.updateProfile(userId, dto as Record<string, any>);

      await this.auditService.log({
        action: 'PROFILE_UPDATED',
        oldValue: oldProfile as Record<string, any> | undefined,
        newValue: dto as Record<string, any>,
        hostelId,
        userId,
      });

      return updatedUser;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error updating profile', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to update profile.');
    }
  }

  async findMatches(userId: string, hostelId: string): Promise<MatchResult[]> {
    try {
      const user = await this.usersRepository.findById(userId);

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const userProfile = user.profile as Record<string, any> | null;

      // Require at least the core Symbiotic Strain fields to be set
      const coreFields = ['peakEnergyWindow', 'territoriality', 'financialSplitStyle', 'guestPhilosophy'];
      const hasSymbioticProfile =
        userProfile &&
        coreFields.some((f) => userProfile[f] !== undefined && userProfile[f] !== null);

      if (!hasSymbioticProfile) {
        return [];
      }

      // Fetch all other students in the same hostel
      const candidates = await this.usersRepository.findStudentsByHostel(
        hostelId,
        userId,
      );

      if (candidates.length === 0) {
        return [];
      }

      const scoredCandidates: MatchResult[] = candidates.map((candidate) => {
        const candidateProfile = candidate.profile as Record<string, any> | null;

        if (!candidateProfile) {
          return {
            userId: candidate.id,
            email: candidate.email,
            name: candidate.email,
            score: 0,
            matchingTraits: [],
            forecast: get3MonthForecast(0),
          };
        }

        // ── Symbiotic Strain: Sustainable Co-existence Score ──────────────
        const score = calculateCompatibilityScore(userProfile!, candidateProfile);

        // Build human-readable matching trait labels
        const matchingTraits: string[] = [];
        const windowA = userProfile!.peakEnergyWindow as string | undefined;
        const windowB = candidateProfile.peakEnergyWindow as string | undefined;
        if (windowA && windowB) {
          if (OPPOSITE_WINDOWS[windowA] === windowB) {
            matchingTraits.push('Opposite Energy Windows ✓');
          }
        }
        const terrA = Number(userProfile!.territoriality) || 0;
        const terrB = Number(candidateProfile.territoriality) || 0;
        if (terrA > 0 && terrB > 0 && terrA < 3 && terrB < 3) {
          matchingTraits.push('Shared Open Space Vibe ✓');
        }
        if (
          userProfile!.financialSplitStyle &&
          userProfile!.financialSplitStyle === candidateProfile.financialSplitStyle
        ) {
          matchingTraits.push('Aligned Financial Style ✓');
        }
        if (
          userProfile!.guestPhilosophy &&
          userProfile!.guestPhilosophy === candidateProfile.guestPhilosophy
        ) {
          matchingTraits.push('Same Guest Philosophy ✓');
        }

        return {
          userId: candidate.id,
          email: candidate.email,
          name:
            candidateProfile.fullName ||
            candidateProfile.name ||
            candidate.email,
          score,
          matchingTraits,
          forecast: get3MonthForecast(score),
        };
      });

      // Sort by "Chance of Peaceful Survival" score descending, return top 5
      return scoredCandidates
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error finding matches', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to find matches.');
    }
  }

  async findAll(hostelId: string) {
    try {
      return this.usersRepository.findAll(hostelId);
    } catch (error) {
      this.logger.error('Error fetching users', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to fetch users.');
    }
  }

  async deactivateUser(userId: string, adminId: string, hostelId: string) {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      await this.usersRepository.deactivate(userId);

      await this.auditService.log({
        action: 'USER_DEACTIVATED',
        oldValue: { isActive: true },
        newValue: { isActive: false },
        hostelId,
        userId: adminId,
      });

      return { message: 'User deactivated successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      this.logger.error('Error deactivating user', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to deactivate user.');
    }
  }

  async changePassword(userId: string, dto: ChangePasswordDto, hostelId: string) {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (!user.passwordHash) {
        throw new BadRequestException('Accounts registered via Google SSO must use Forgot Password to set an initial password.');
      }

      const isCurrentValid = await argon2.verify(user.passwordHash, dto.currentPassword);
      if (!isCurrentValid) {
        throw new BadRequestException('Current password is incorrect.');
      }

      const newHash = await argon2.hash(dto.newPassword, {
        type: argon2.argon2id,
        memoryCost: 65536,
        timeCost: 3,
        parallelism: 4,
      });

      await this.usersRepository.updatePasswordHash(userId, newHash);

      await this.auditService.log({
        action: 'PASSWORD_CHANGED',
        hostelId,
        userId,
      });

      return { message: 'Password updated successfully.' };
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) throw error;
      this.logger.error('Error changing password', error instanceof Error ? error.stack : undefined);
      throw new InternalServerErrorException('Failed to change password.');
    }
  }
}
