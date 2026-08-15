import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

async function testPhotoUpload() {
  const prisma = new PrismaClient();
  try {
    const warden = await prisma.user.findFirst({
      where: { role: 'WARDEN' },
    });
    const room = await prisma.room.findFirst();
    if (!warden || !room) {
      console.log('WARDEN_OR_ROOM_NOT_FOUND');
      return;
    }

    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: warden.email, password: 'Password123!' }),
    }).then((r) => r.json());

    // Create a dummy image buffer
    const dummyImageBuffer = Buffer.from('GIF89a\x01\x00\x01\x00\x80\x00\x00\xff\xff\xff\x00\x00\x00!\xf9\x04\x01\x00\x00\x00\x00,\x00\x00\x00\x00\x01\x00\x01\x00\x00\x02\x02D\x01\x00;');
    const formData = new FormData();
    const blob = new Blob([dummyImageBuffer], { type: 'image/gif' });
    formData.append('file', blob, 'test-room-photo.gif');

    const uploadRes = await fetch(`http://127.0.0.1:5000/api/rooms/${room.id}/images`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${loginRes.accessToken}`,
      },
      body: formData,
    }).then((r) => r.json());

    if (uploadRes.id) {
      console.log('✅ PHOTO_UPLOAD_SUCCESSFUL! Image ID:', uploadRes.id, 'URL:', uploadRes.secureUrl);
    } else {
      console.log('❌ PHOTO_UPLOAD_FAILED:', JSON.stringify(uploadRes));
    }
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

testPhotoUpload();
