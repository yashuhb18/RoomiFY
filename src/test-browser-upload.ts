import { PrismaClient } from '@prisma/client';
import axios from 'axios';

async function testUploadFromBrowserSimulation() {
  const prisma = new PrismaClient();
  try {
    const warden = await prisma.user.findFirst({ where: { role: 'WARDEN' } });
    const room = await prisma.room.findFirst();
    if (!warden || !room) {
      console.log('NOT_FOUND');
      return;
    }

    const loginRes = await axios.post('http://127.0.0.1:5000/api/auth/login', {
      email: warden.email,
      password: 'Password123!',
    });

    const token = loginRes.data.accessToken;

    const dummyFile = new Blob([Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;')], { type: 'image/gif' });
    const formData = new FormData();
    formData.append('file', dummyFile, 'room-photo-test.gif');

    // Create axios instance matching frontend config
    const api = axios.create({
      baseURL: 'http://127.0.0.1:5000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    api.interceptors.request.use((config) => {
      config.headers.Authorization = `Bearer ${token}`;
      if (config.data instanceof FormData && config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
        if (typeof config.headers.delete === 'function') {
          config.headers.delete('Content-Type');
          config.headers.delete('content-type');
        }
      }
      return config;
    });

    const res = await api.post(`/rooms/${room.id}/images`, formData);

    console.log('✅ BROWSER_FORM_DATA_UPLOAD_SUCCESS:', res.data.id, 'URL:', res.data.secureUrl);
  } catch (err: any) {
    console.error('❌ UPLOAD_FAIL:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

testUploadFromBrowserSimulation();
