import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import FormData from 'form-data';

async function main() {
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

    const form = new FormData();
    form.append(
      'file',
      Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;'),
      { filename: 'test.gif', contentType: 'image/gif' }
    );

    const res = await axios.post(`http://127.0.0.1:5000/api/rooms/${room.id}/images`, form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('✅ AXIOS_FORM_DATA_UPLOAD_SUCCESSFUL! Image ID:', res.data.id, 'URL:', res.data.secureUrl);
  } catch (err: any) {
    console.error('❌ UPLOAD_ERROR:', err.response?.data || err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
