import * as dotenv from 'dotenv';
// @ts-ignore
import { Client } from 'pg';

dotenv.config();

async function tryConnect(label: string, url: string) {
  console.log(`\n--- ${label} ---`);
  const masked = url.replace(/:([^:@]+)@/, ':****@');
  console.log(masked);

  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 20000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query('SELECT count(*)::int AS count FROM "User"');
    console.log(`OK — ${result.rows[0].count} user(s)`);
    await client.end();
    return true;
  } catch (error: any) {
    console.log(`FAIL — ${error.message}`);
    try {
      await client.end();
    } catch {
      // ignore
    }
    return false;
  }
}

async function main() {
  const passwordMatch = process.env.DATABASE_URL?.match(/:([^:@]+)@/);
  const password = passwordMatch?.[1] ?? '';

  const urls: Array<[string, string | undefined]> = [
    ['DATABASE_URL', process.env.DATABASE_URL],
    ['DATABASE_URL + sslmode', `${process.env.DATABASE_URL}&sslmode=require`],
    ['DIRECT_URL', process.env.DIRECT_URL],
    ['DIRECT_URL + sslmode', `${process.env.DIRECT_URL}?sslmode=require`],
    [
      'Direct db host',
      `postgresql://postgres.mfxwxjlnuxybupqrouho:${password}@db.mfxwxjlnuxybupqrouho.supabase.co:5432/postgres?sslmode=require`,
    ],
  ];

  for (const [label, url] of urls) {
    if (!url) continue;
    const ok = await tryConnect(label, url);
    if (ok) return;
  }
}

main();
