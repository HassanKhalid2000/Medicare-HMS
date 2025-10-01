'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Building2,
  CreditCard,
  FileText,
  Pill,
  FlaskConical,
  Activity,
  Files,
  Settings,
  LogOut
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    name: 'Patients',
    href: '/patients',
    icon: Users,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    name: 'Doctors',
    href: '/doctors',
    icon: UserCog,
    roles: ['admin', 'receptionist']
  },
  {
    name: 'Appointments',
    href: '/appointments',
    icon: Calendar,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    name: 'Medical Records',
    href: '/medical-records',
    icon: FileText,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    name: 'Medical Documents',
    href: '/medical-documents',
    icon: Files,
    roles: ['admin', 'doctor', 'nurse', 'receptionist']
  },
  {
    name: 'Diagnoses',
    href: '/diagnoses',
    icon: FlaskConical,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    name: 'Prescriptions',
    href: '/prescriptions',
    icon: Pill,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    name: 'Admissions',
    href: '/admissions',
    icon: Building2,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    name: 'Vital Signs',
    href: '/vital-signs',
    icon: Activity,
    roles: ['admin', 'doctor', 'nurse']
  },
  {
    name: 'Billing',
    href: '/billing',
    icon: CreditCard,
    roles: ['admin', 'receptionist']
  },
  {
    name: 'Laboratory',
    href: '/laboratory',
    icon: FlaskConical,
    roles: ['admin', 'doctor', 'nurse']
  }
];

interface SidebarProps {
  userRole?: string;
}

export function Sidebar({ userRole = 'admin' }: SidebarProps) {
  const pathname = usePathname();

  const filteredNavigation = navigation.filter(item =>
    item.roles.includes(userRole)
  );

  return (
    <div className="flex h-full w-64 flex-col bg-white shadow-sm border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-white font-bold">
            M
          </div>
          <span className="text-xl font-bold text-gray-900">MediCore</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {filteredNavigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                isActive
                  ? 'bg-gradient-to-r from-blue-50 to-emerald-50 text-blue-700 border-l-4 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              )}
            >
              <Icon className={cn(
                'mr-3 h-5 w-5',
                isActive ? 'text-blue-600' : 'text-gray-400'
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t p-4 space-y-1">
        <Link
          href="/settings"
          className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Settings className="mr-3 h-5 w-5 text-gray-400" />
          Settings
        </Link>
        <button
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-lg hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5 text-gray-400" />
          Logout
        </button>
      </div>
    </div>
  );
}