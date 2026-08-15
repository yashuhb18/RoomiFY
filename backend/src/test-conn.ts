import { PrismaClient } from '@prisma/client';

async function testAll() {
  const urls = [
    'postgresql://postgres.mfxwxjlnuxybupqrouho:2Qy9ihI7PfhhD5Ci@aws-0-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true&sslmode=require',
    'postgresql://postgres.mfxwxjlnuxybupqrouho:2Qy9ihI7PfhhD5Ci@aws-0-ap-southeast-2.pooler.supabase.com:5432/postgres?sslmode=require',
    'postgresql://postgres:2Qy9ihI7PfhhD5Ci@db.mfxwxjlnuxybupqrouho.supabase.co:5432/postgres?sslmode=require',
  ];

  for (const url of urls) {
    console.log(`Testing: ${url.replace(/2Qy9ihI7PfhhD5Ci/, '******')}`);
    const client = new PrismaClient({
      datasources: { db: { url } },
    });

    try {
      await client.$connect();
      const count = await client.user.count();
      console.log(`SUCCESS! Connected with ${count} users.`);
      console.log(`WINNING_URL: ${url}`);
      await client.$disconnect();
      return url;
    } catch (err: any) {
      console.log(`Failed: ${err.message}`);
      await client.$disconnect();
    }
  }
}

testAll();
