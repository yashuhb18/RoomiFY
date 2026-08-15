import { PrismaClient, Role } from '@prisma/client';

async function updateSuperAdmin() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'roomify.org@gmail.com' },
    });

    if (user) {
      await prisma.user.update({
        where: { email: 'roomify.org@gmail.com' },
        data: { role: Role.SUPER_ADMIN },
      });
      console.log('✅ Updated roomify.org@gmail.com to SUPER_ADMIN!');
    } else {
      const owner = await prisma.user.findUnique({
        where: { email: 'owner@aegis.hostel' },
      });
      if (owner) {
        await prisma.user.update({
          where: { id: owner.id },
          data: { email: 'roomify.org@gmail.com' },
        });
        console.log('✅ Updated owner@aegis.hostel email to roomify.org@gmail.com!');
      }
    }
  } catch (err) {
    console.error('Failed to update SuperAdmin:', err);
  } finally {
    await prisma.$disconnect();
  }
}

updateSuperAdmin();
