require('dotenv').config();
const { Client } = require('pg');

async function tryConnect(label, url) {
  console.log(`\n--- ${label} ---`);
  console.log(url.replace(/:([^:@]+)@/, ':****@'));

  const client = new Client({
    connectionString: url,
    connectionTimeoutMillis: 20000,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    const result = await client.query(
      "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename",
    );
    console.log(`OK — tables: ${result.rows.map((r) => r.tablename).join(', ') || '(none)'}`);
    await client.end();
    return true;
  } catch (error) {
    console.log(`FAIL — ${error.message}`);
    try {
      await client.end();
    } catch {}
    return false;
  }
}

async function main() {
  const passwordMatch = process.env.DATABASE_URL.match(/:([^:@]+)@/);
  const password = passwordMatch ? passwordMatch[1] : '';

  const urls = [
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
