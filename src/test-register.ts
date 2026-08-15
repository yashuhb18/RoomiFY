import { PrismaClient } from '@prisma/client';
import axios from 'axios';

async function testRegistration() {
  const prisma = new PrismaClient();
  try {
    const defaultHostel = await prisma.hostel.findFirst();
    const testEmail = `saqib_${Date.now()}@aegis.hostel`;

    console.log('Sending register request to http://127.0.0.1:5000/api/auth/register...');

    const res = await axios.post('http://127.0.0.1:5000/api/auth/register', {
      email: testEmail,
      password: 'Password123!',
      role: 'STUDENT',
      hostelId: defaultHostel?.id,
      profile: {
        fullName: 'Saqib Test User',
        phone: '8232101001',
        studentId: 'ec094',
        college: 'AEGIS Institute',
      },
    });

    console.log('✅ REGISTRATION_SUCCESSFUL:', res.data.user?.id);
  } catch (err: any) {
    console.error('❌ REGISTRATION_FAILED:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRegistration();
