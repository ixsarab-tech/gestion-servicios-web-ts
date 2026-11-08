import { redirect } from 'next/navigation';
import { connection } from 'next/server';

import { getSession } from '@/shared/auth';
export const instant = false; // ← AÑADIR

export default async function HomePage() {
  await connection();

  const session = await getSession();

  if (session) {
    redirect('/dashboard');
  }

  redirect('/login');
}
