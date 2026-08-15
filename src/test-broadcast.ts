import { PrismaClient } from '@prisma/client';
import axios from 'axios';

async function testBroadcastAndNotifications() {
  const prisma = new PrismaClient();
  try {
    const warden = await prisma.user.findFirst({ where: { role: 'WARDEN' } });
    const student = await prisma.user.findFirst({ where: { role: 'STUDENT' } });

    if (!warden || !student) {
      console.log('WARDEN_OR_STUDENT_NOT_FOUND');
      return;
    }

    // 1. Warden Login
    const wardenLogin = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: warden.email,
      password: 'Password123!',
    });
    const wardenToken = wardenLogin.data.accessToken;

    // 2. Warden sends Broadcast Announcement
    const broadcastRes = await axios.post(
      'http://127.0.0.1:5000/api/api/messages/broadcast'.replace('/api/api', '/api'),
      {
        title: '🔥 Water Tank Cleaning Notice',
        content: 'Water supply will be temporarily paused today between 2:00 PM and 4:00 PM.',
      },
      {
        headers: { Authorization: `Bearer ${wardenToken}` },
      }
    );

    console.log('1. BROADCAST_SENT:', broadcastRes.data);

    // 3. Student Login
    const studentLogin = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: student.email,
      password: 'Password123!',
    });
    const studentToken = studentLogin.data.accessToken;

    // 4. Student fetches notifications
    const notifRes = await axios.get('http://127.0.0.1:5000/api/messages/notifications', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });

    console.log('2. STUDENT_NOTIFICATIONS_RECEIVED!');
    console.log('   Unread Count:', notifRes.data.unreadCount);
    console.log('   Latest Notification:', notifRes.data.notifications[0]);
  } catch (err: any) {
    console.error('❌ TEST_ERROR:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testBroadcastAndNotifications();
