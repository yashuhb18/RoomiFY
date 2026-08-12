import { PrismaClient, Role } from '@prisma/client';
import * as argon2 from 'argon2';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding & RLS initialization...');

  // 1. Read & apply rls_policies.sql
  const rlsPath = path.join(__dirname, '../../rls_policies.sql');
  if (fs.existsSync(rlsPath)) {
    const rlsSql = fs.readFileSync(rlsPath, 'utf-8');
    // Split statements by semicolon
    const statements = rlsSql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const stmt of statements) {
      try {
        await prisma.$executeRawUnsafe(stmt);
      } catch (err: any) {
        console.warn(`RLS statement warning: ${err.message}`);
      }
    }
    console.log('✅ PostgreSQL RLS policies applied.');
  }

  // 2. Create Default Hostel
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

  // 3. Create Default Warden User
  const passwordHash = await argon2.hash('Password123!', {
    type: argon2.argon2id,
  });

  let warden = await prisma.user.findUnique({
    where: { email: 'warden@aegis.hostel' },
  });

  if (!warden) {
    warden = await prisma.user.create({
      data: {
        email: 'warden@aegis.hostel',
        passwordHash,
        role: Role.WARDEN,
        hostelId: hostel.id,
      },
    });
    console.log('✅ Warden account created: warden@aegis.hostel / Password123!');
  }

  // 4. Create Default Student User
  let student = await prisma.user.findUnique({
    where: { email: 'student@aegis.hostel' },
  });

  if (!student) {
    student = await prisma.user.create({
      data: {
        email: 'student@aegis.hostel',
        passwordHash,
        role: Role.STUDENT,
        hostelId: hostel.id,
        profile: {
          sleepSchedule: 'early_bird',
          cleanliness: 'very_clean',
          studyStyle: 'silent',
          smoking: 'non_smoker',
          music: 'headphones',
        },
      },
    });
    console.log('✅ Student account created: student@aegis.hostel / Password123!');
  }

  // 5. Create Default Candidate Student for Matching
  let candidate = await prisma.user.findUnique({
    where: { email: 'alex.smith@aegis.hostel' },
  });

  if (!candidate) {
    await prisma.user.create({
      data: {
        email: 'alex.smith@aegis.hostel',
        passwordHash,
        role: Role.STUDENT,
        hostelId: hostel.id,
        profile: {
          sleepSchedule: 'early_bird',
          cleanliness: 'very_clean',
          studyStyle: 'silent',
          smoking: 'non_smoker',
          music: 'headphones',
        },
      },
    });
    console.log('✅ Roommate candidate created: alex.smith@aegis.hostel');
  }

  // 6. Create Initial Rooms
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

  console.log('\n🎉 SEEDING COMPLETE! You can now log in directly.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
