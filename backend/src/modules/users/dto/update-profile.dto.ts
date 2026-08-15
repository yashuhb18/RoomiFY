import { IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

// ─── Symbiotic Strain Model – Enums ──────────────────────────────────────────

export enum PeakEnergyWindow {
  DAWN     = 'dawn',      // 5 AM – 9 AM
  MIDDAY   = 'midday',    // 10 AM – 2 PM
  DUSK     = 'dusk',      // 5 PM – 9 PM
  MIDNIGHT = 'midnight',  // 10 PM – 2 AM
}

export enum FinancialSplitStyle {
  EQUAL_SPLIT  = 'equal_split',   // Bill divided by N
  EXACT_USAGE  = 'exact_usage',   // I pay for what I consume
}

export enum GuestPhilosophy {
  SOCIAL_HUB       = 'social_hub',       // Home is a Social Hub
  PRIVATE_FORTRESS = 'private_fortress', // Home is a Private Fortress
}

// ─── DTO ─────────────────────────────────────────────────────────────────────

export class UpdateProfileDto {
  /** Dominant active period of the day */
  @IsOptional()
  @IsEnum(PeakEnergyWindow)
  peakEnergyWindow?: PeakEnergyWindow;

  /**
   * 1 = fully open (snacks/charger shared freely)
   * 10 = strictly zoned (keep off my shelf)
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  territoriality?: number;

  /** How bills and shared costs are handled */
  @IsOptional()
  @IsEnum(FinancialSplitStyle)
  financialSplitStyle?: FinancialSplitStyle;

  /** Attitude toward having guests over */
  @IsOptional()
  @IsEnum(GuestPhilosophy)
  guestPhilosophy?: GuestPhilosophy;
}
