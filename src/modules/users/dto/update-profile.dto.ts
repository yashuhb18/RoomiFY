import { IsOptional, IsString, IsEnum } from 'class-validator';

export enum SleepSchedule {
  EARLY_BIRD = 'early_bird',
  NIGHT_OWL = 'night_owl',
  FLEXIBLE = 'flexible',
}

export enum CleanlinessLevel {
  VERY_CLEAN = 'very_clean',
  MODERATE = 'moderate',
  RELAXED = 'relaxed',
}

export enum StudyStyle {
  SILENT = 'silent',
  BACKGROUND_NOISE = 'background_noise',
  GROUP_STUDY = 'group_study',
}

export enum SmokingPreference {
  NON_SMOKER = 'non_smoker',
  SMOKER = 'smoker',
  OUTDOOR_ONLY = 'outdoor_only',
}

export enum MusicPreference {
  HEADPHONES = 'headphones',
  SPEAKERS = 'speakers',
  NO_MUSIC = 'no_music',
}

export class UpdateProfileDto {
  @IsOptional()
  @IsEnum(SleepSchedule)
  sleepSchedule?: SleepSchedule;

  @IsOptional()
  @IsEnum(CleanlinessLevel)
  cleanliness?: CleanlinessLevel;

  @IsOptional()
  @IsEnum(StudyStyle)
  studyStyle?: StudyStyle;

  @IsOptional()
  @IsEnum(SmokingPreference)
  smoking?: SmokingPreference;

  @IsOptional()
  @IsEnum(MusicPreference)
  music?: MusicPreference;
}
