import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

async function main() {
  const prisma = new PrismaClient();
  try {
    const passwordHash = await argon2.hash('Password123!', {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    const result = await prisma.user.updateMany({
      data: {
        passwordHash,
        isActive: true,
      },
    });

    console.log(`✅ Successfully updated password for ALL ${result.count} users in PostgreSQL to "Password123!"`);
  } catch (err) {
    console.error('Error resetting passwords:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
