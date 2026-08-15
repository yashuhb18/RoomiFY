import { PrismaClient } from '@prisma/client';
import * as speakeasy from 'speakeasy';

async function main() {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({
      where: { email: '4mh24ec408@gmail.com' },
    });

    if (!user || !user.mfaSecret) {
      console.log('NO_MFA_SECRET_SET');
      return;
    }

    const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '4mh24ec408@gmail.com', password: 'Password123!' }),
    }).then((r) => r.json());

    console.log('1. LOGIN_RESPONSE:', { requiresMfa: loginRes.requiresMfa, mfaTokenLength: loginRes.mfaToken?.length });

    const code = speakeasy.totp({
      secret: user.mfaSecret,
      encoding: 'base32',
    });

    console.log('2. GENERATED_LIVE_TOTP_CODE:', code);

    const validateRes = await fetch('http://127.0.0.1:5000/api/auth/mfa/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken: loginRes.mfaToken, token: code }),
    }).then((r) => r.json());

    if (validateRes.accessToken) {
      console.log('3. ✅ MFA_VALIDATION_SUCCESSFUL! User authenticated:', validateRes.user.email, 'Role:', validateRes.user.role);
    } else {
      console.log('3. ❌ MFA_VALIDATION_FAILED:', JSON.stringify(validateRes));
    }
  } catch (err) {
    console.error('MFA test error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
