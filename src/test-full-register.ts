import { PrismaClient } from '@prisma/client';
import axios from 'axios';

async function testFullRegistration() {
  const prisma = new PrismaClient();
  try {
    const defaultHostel = await prisma.hostel.findFirst();
    const testEmail = `saqib_full_${Date.now()}@aegis.hostel`;

    console.log('Sending registration request to http://localhost:5000/api/auth/register...');

    const res = await axios.post('http://localhost:5000/api/auth/register', {
      email: testEmail,
      password: 'Password123!',
      role: 'STUDENT',
      hostelId: defaultHostel?.id,
      profile: {
        fullName: 'Saqib Full Registration Test',
        phone: '8232101001',
        studentId: 'ec094',
        college: 'AEGIS Institute of Technology',
        course: 'Computer Science',
        yearSemester: '1st Year',
        roomNumber: 'A-101',
        emergencyContact: '9876543210',
        sleepSchedule: 'early_bird',
        cleanliness: 'very_clean',
        studyStyle: 'silent',
        smoking: 'non_smoker',
        music: 'headphones',
      },
    });

    if (res.data.accessToken && res.data.user) {
      console.log('✅ REGISTRATION_FLOW_SUCCESS!');
      console.log('   User ID:', res.data.user.id);
      console.log('   Email:', res.data.user.email);
      console.log('   Role:', res.data.user.role);
    } else {
      console.log('❌ REGISTRATION_FAILED:', JSON.stringify(res.data));
    }
  } catch (err: any) {
    console.error('❌ REGISTRATION_ERROR:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testFullRegistration();
