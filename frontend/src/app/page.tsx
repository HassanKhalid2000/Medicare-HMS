'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Shield, Users, Calendar, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/dashboard');
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (status === 'authenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Redirecting to Dashboard...</h2>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">MediCore HMS</h1>
            </div>
            <Link href="/auth/signin">
              <Button>
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
            Welcome to{' '}
            <span className="text-primary">MediCore HMS</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            A comprehensive Hospital Management System designed to streamline healthcare operations,
            enhance patient care, and improve efficiency across all departments.
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            <Link href="/auth/signin">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-6 w-6 text-primary mr-2" />
                  Patient Management
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Comprehensive patient records, medical history, and streamlined registration process.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-6 w-6 text-primary mr-2" />
                  Appointment Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Efficient appointment booking, calendar management, and automated reminders.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="h-6 w-6 text-primary mr-2" />
                  Billing & Invoicing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Complete billing system with invoice generation, payment tracking, and financial reports.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Demo Credentials */}
        <div className="mt-20">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Demo Access</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-600 mb-6">
                Use these demo credentials to explore the system:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Admin Access</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: admin@medicore.com<br />
                    Password: admin123
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Doctor Access</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: doctor@medicore.com<br />
                    Password: doctor123
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Nurse Access</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: nurse@medicore.com<br />
                    Password: nurse123
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-900">Receptionist Access</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Email: receptionist@medicore.com<br />
                    Password: reception123
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-20">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 MediCore HMS. Built for healthcare excellence.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
