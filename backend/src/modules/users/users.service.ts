import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AuditService } from '../audit/audit.service';

export interface MatchResult {
  userId: string;
  email: string;
  score: number;
  matchingTraits: string[];
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

      if (!userProfile || Object.keys(userProfile).length === 0) {
        return [];
      }

      // Fetch all other students in the same hostel with profiles
      const candidates = await this.usersRepository.findStudentsByHostel(
        hostelId,
        userId,
      );

      if (candidates.length === 0) {
        return [];
      }

      const profileKeys = Object.keys(userProfile);
      const totalQuestions = profileKeys.length;

      const scoredCandidates: MatchResult[] = candidates.map((candidate) => {
        const candidateProfile = candidate.profile as Record<string, any> | null;

        if (!candidateProfile) {
          return {
            userId: candidate.id,
            email: candidate.email,
            score: 0,
            matchingTraits: [],
          };
        }

        let matches = 0;
        const matchingTraits: string[] = [];

        for (const key of profileKeys) {
          if (
            candidateProfile[key] !== undefined &&
            candidateProfile[key] === userProfile[key]
          ) {
            matches++;
            matchingTraits.push(key);
          }
        }

        const score =
          totalQuestions > 0
            ? Math.round((matches / totalQuestions) * 100)
            : 0;

        return {
          userId: candidate.id,
          email: candidate.email,
          score,
          matchingTraits,
        };
      });

      // Sort by score descending and return top 5
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
}
