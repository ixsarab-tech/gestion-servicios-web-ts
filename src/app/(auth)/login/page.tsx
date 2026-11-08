import { connection } from 'next/server';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { LoginForm } from './login-form';

export const metadata = {
  title: 'Iniciar sesión',
};

export const instant = false;

export default async function LoginPage() {
  await connection();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Iniciar sesión</CardTitle>
        <CardDescription>
          Accede con tu cuenta de taller para gestionar tus servicios.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
}
