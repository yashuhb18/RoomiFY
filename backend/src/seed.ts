import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding & RLS initialization...');

  // 1. Skip automatic RLS script execution during seed to avoid lock issues
  console.log('🌱 Starting database seeding...');

  // 2. Create / Get Default Hostel
  let hostel = await prisma.hostel.findFirst({
    where: { name: 'AEGIS Campus Hostel 1' },
  });

  if (!hostel) {
    hostel = await prisma.hostel.create({
      data: {
        name: 'AEGIS Campus Hostel 1',
        address: '128 Innovation Way, Sydney, NSW',
      },
    });
    console.log(`✅ Default Hostel created with ID: ${hostel.id}`);
  } else {
    console.log(`ℹ️ Hostel already exists: ${hostel.id}`);
  }

  // 3. Hash default password
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  // 4. Force-Upsert Warden User (ensures password is Password123! and active)
  const warden = await prisma.user.upsert({
    where: { email: 'warden@aegis.hostel' },
    update: {
      passwordHash,
      isActive: true,
      role: Role.WARDEN,
      hostelId: hostel.id,
    },
    create: {
      email: 'warden@aegis.hostel',
      passwordHash,
      role: Role.WARDEN,
      hostelId: hostel.id,
      isActive: true,
    },
  });
  console.log('✅ Warden account active: warden@aegis.hostel / Password123!');

  // 5. Force-Upsert Student User (ensures password is Password123! and active)
  const student = await prisma.user.upsert({
    where: { email: 'student@aegis.hostel' },
    update: {
      passwordHash,
      isActive: true,
      role: Role.STUDENT,
      hostelId: hostel.id,
    },
    create: {
      email: 'student@aegis.hostel',
      passwordHash,
      role: Role.STUDENT,
      hostelId: hostel.id,
      isActive: true,
      profile: {
        sleepSchedule: 'early_bird',
        cleanliness: 'very_clean',
        studyStyle: 'silent',
        smoking: 'non_smoker',
        music: 'headphones',
      },
    },
  });
  console.log('✅ Student account active: student@aegis.hostel / Password123!');

  // 6. Force-Upsert Candidate Student for Matching
  await prisma.user.upsert({
    where: { email: 'alex.smith@aegis.hostel' },
    update: {
      passwordHash,
      isActive: true,
      role: Role.STUDENT,
      hostelId: hostel.id,
    },
    create: {
      email: 'alex.smith@aegis.hostel',
      passwordHash,
      role: Role.STUDENT,
      hostelId: hostel.id,
      isActive: true,
      profile: {
        sleepSchedule: 'early_bird',
        cleanliness: 'very_clean',
        studyStyle: 'silent',
        smoking: 'non_smoker',
        music: 'headphones',
      },
    },
  });
  console.log('✅ Roommate candidate active: alex.smith@aegis.hostel');

  // 7. Create Initial Rooms
  const sampleRooms = [
    { roomNumber: '101', floor: 1, capacity: 2, currentOccupancy: 1 },
    { roomNumber: '102', floor: 1, capacity: 2, currentOccupancy: 0 },
    { roomNumber: '103', floor: 1, capacity: 3, currentOccupancy: 2 },
    { roomNumber: '201', floor: 2, capacity: 2, currentOccupancy: 2 },
    { roomNumber: '202', floor: 2, capacity: 2, currentOccupancy: 0 },
  ];

  for (const r of sampleRooms) {
    const existingRoom = await prisma.room.findUnique({
      where: {
        hostelId_roomNumber: {
          hostelId: hostel.id,
          roomNumber: r.roomNumber,
        },
      },
    });

    if (!existingRoom) {
      await prisma.room.create({
        data: {
          roomNumber: r.roomNumber,
          floor: r.floor,
          capacity: r.capacity,
          currentOccupancy: r.currentOccupancy,
          hostelId: hostel.id,
        },
      });
    }
  }
  console.log('✅ Initial rooms configured for heatmap dashboard.');

  console.log('\n🎉 SEEDING COMPLETE! Both Warden and Student logins are active with password "Password123!".');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
