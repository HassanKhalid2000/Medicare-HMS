'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Activity, Eye, EyeOff } from 'lucide-react';

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type SignInFormData = z.infer<typeof signInSchema>;

// Demo accounts for testing (matching backend database)
const demoAccounts = [
  {
    email: 'admin@medicore.com',
    password: 'password123',
    role: 'admin',
    name: 'Admin',
  },
  {
    email: 'doctor@medicore.com',
    password: 'password123',
    role: 'doctor',
    name: 'Doctor',
  },
  {
    email: 'nurse@medicore.com',
    password: 'password123',
    role: 'nurse',
    name: 'Nurse',
  },
  {
    email: 'receptionist@medicore.com',
    password: 'password123',
    role: 'receptionist',
    name: 'Receptionist',
  },
];

export default function SignInPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const onSubmit = async (data: SignInFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
      } else if (result?.ok) {
        // Wait for session to be updated
        await getSession();
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = (account: (typeof demoAccounts)[0]) => {
    setValue('email', account.email);
    setValue('password', account.password);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-6 w-6" />
            </div>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-foreground">
            Welcome to MediCore HMS
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Sign In Form */}
        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  {...register('email')}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    {...register('password')}
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Accounts */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Demo Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Click any demo account to auto-fill the form:
              </p>
              <div className="grid gap-2">
                {demoAccounts.map((account) => (
                  <Button
                    key={account.email}
                    variant="outline"
                    size="sm"
                    onClick={() => handleDemoLogin(account)}
                    disabled={isLoading}
                    className="justify-start text-xs capitalize"
                  >
                    <span className="flex-1 text-left">
                      {account.role}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground">
          <p>© 2024 MediCore HMS. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}