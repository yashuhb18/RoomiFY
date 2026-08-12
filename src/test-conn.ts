import { PrismaClient } from '@prisma/client';

const testUrls = [
  'postgresql://postgres.mfxwxjlnuxybupqrouho:2Qy9ihI7PfhhD5Ci@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true',
  'postgresql://postgres.mfxwxjlnuxybupqrouho:2Qy9ihI7PfhhD5Ci@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres',
  'postgresql://postgres:2Qy9ihI7PfhhD5Ci@db.mfxwxjlnuxybupqrouho.supabase.co:5432/postgres',
];

async function testConnections() {
  for (const url of testUrls) {
    console.log(`Testing: ${url.replace(/2Qy9ihI7PfhhD5Ci/, '******')}`);
    const prisma = new PrismaClient({
      datasources: { db: { url } },
    });

    try {
      await prisma.$connect();
      const count = await prisma.user.count();
      console.log(`SUCCESS! Connected with ${count} users.`);
      console.log(`WINNING_URL: ${url}`);
      await prisma.$disconnect();
      return url;
    } catch (e: any) {
      console.log(`FAILED: ${e.message.split('\n')[0]}`);
      await prisma.$disconnect();
    }
  }
}

testConnections();
