import Link from 'next/link';
import Logo from '@/components/layout/logo';
import { LoginForm } from '@/components/auth/login-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary">
      <div className="absolute left-4 top-4">
        <Logo />
      </div>
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Willkommen zurück</CardTitle>
          <CardDescription>Geben Sie Ihre Anmeldeinformationen ein, um auf Ihr Konto zuzugreifen.</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link href="/dashboard" className="underline underline-offset-4 hover:text-primary">
          Oder im Demomodus fortfahren
        </Link>
      </p>
    </div>
  );
}
