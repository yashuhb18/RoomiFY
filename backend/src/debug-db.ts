import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  const urls = [
    { label: 'DATABASE_URL', url: process.env.DATABASE_URL! },
    { label: 'DIRECT_URL', url: process.env.DIRECT_URL! },
  ];

  for (const { label, url } of urls) {
    const masked = url.replace(/:([^:@]+)@/, ':****@');
    console.log(`\nTesting ${label}: ${masked}`);

    const client = new PrismaClient({
      datasources: { db: { url } },
      log: ['error'],
    });

    try {
      await client.$connect();
      const count = await client.user.count();
      console.log(`SUCCESS — ${count} user(s) found`);
      await client.$disconnect();
      return;
    } catch (err: any) {
      console.log(`FAILED — ${err.message}`);
      if (err.meta) console.log('Meta:', err.meta);
      await client.$disconnect();
    }
  }
}

main();
