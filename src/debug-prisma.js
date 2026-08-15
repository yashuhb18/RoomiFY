require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

async function testUrl(label, url) {
  console.log(`\n--- ${label} ---`);
  console.log(url.replace(/:([^:@]+)@/, ':****@'));

  const prisma = new PrismaClient({
    datasources: { db: { url } },
  });

  try {
    await prisma.$connect();
    const user = await prisma.user.findUnique({
      where: { email: 'student@aegis.hostel' },
      select: { email: true, role: true, isActive: true },
    });
    console.log('OK', user);
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.log('FAIL', error.message);
    await prisma.$disconnect();
    return false;
  }
}

async function main() {
  const current = process.env.DATABASE_URL;
  const passwordMatch = current.match(/:([^:@]+)@/);
  const password = passwordMatch ? passwordMatch[1] : '';

  const candidates = [
    ['current DATABASE_URL', current],
    [
      'session pooler 5432',
      `postgresql://postgres.mfxwxjlnuxybupqrouho:${password}@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1`,
    ],
    [
      'session pooler 5432 + sslmode',
      `postgresql://postgres.mfxwxjlnuxybupqrouho:${password}@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=1&sslmode=require`,
    ],
    [
      'direct db host',
      `postgresql://postgres.mfxwxjlnuxybupqrouho:${password}@db.mfxwxjlnuxybupqrouho.supabase.co:5432/postgres?sslmode=require`,
    ],
  ];

  for (const [label, url] of candidates) {
    const ok = await testUrl(label, url);
    if (ok) {
      console.log('\nWINNER:', label);
      return;
    }
  }
}

main();
