import { PrismaClient } from '@prisma/client';

async function testRoomAllocationEmails() {
  const prisma = new PrismaClient();
  try {
    const student = await prisma.user.findUnique({
      where: { email: 'prajwalprajwal1648@gmail.com' },
    });
    if (!student) {
      console.log('STUDENT_NOT_FOUND');
      return;
    }

    const availableRoom = await prisma.room.findFirst({
      where: { hostelId: student.hostelId, currentOccupancy: { lt: 2 } },
    });

    if (!availableRoom) {
      console.log('NO_AVAILABLE_ROOM');
      return;
    }

    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'prajwalprajwal1648@gmail.com', password: 'Password123!' }),
    }).then((r) => r.json());

    console.log('1. STUDENT_LOGIN_SUCCESS');

    // Create room request
    const reqRes = await fetch('http://127.0.0.1:5000/api/room-requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${loginRes.accessToken}`,
      },
      body: JSON.stringify({ roomId: availableRoom.id, notes: 'Prefer window bed' }),
    }).then((r) => r.json());

    console.log('2. ROOM_REQUEST_RESPONSE:', reqRes.id ? `REQUEST_CREATED_ID:${reqRes.id}` : JSON.stringify(reqRes));
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testRoomAllocationEmails();
