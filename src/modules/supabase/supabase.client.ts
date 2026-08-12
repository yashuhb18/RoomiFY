import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

export function createSupabaseAdmin(
  configService: ConfigService,
): SupabaseClient {
  const supabaseUrl = configService.get<string>('supabase.url')!;
  const serviceRoleKey = configService.get<string>('supabase.serviceRoleKey')!;

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
