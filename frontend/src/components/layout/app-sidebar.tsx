'use client';

import {
  LayoutDashboard,
  Users,
  UserCog,
  Calendar,
  Building2,
  CreditCard,
  Pill,
  FlaskConical,
  Settings,
  ChevronUp,
  User2,
  BarChart3,
  ClipboardList,
  Stethoscope,
  TestTube,
  Package,
  Shield
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Navigation items based on user roles
const navigation = {
  main: [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboard,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      title: 'Patients',
      url: '/patients',
      icon: Users,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    },
    {
      title: 'Doctors',
      url: '/doctors',
      icon: UserCog,
      roles: ['admin', 'receptionist']
    },
    {
      title: 'Appointments',
      url: '/appointments',
      icon: Calendar,
      roles: ['admin', 'doctor', 'nurse', 'receptionist']
    }
  ],
  modules: [
    {
      title: 'Medical Records',
      url: '/medical-records',
      icon: ClipboardList,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Diagnoses',
      url: '/diagnoses',
      icon: Stethoscope,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Prescriptions',
      url: '/prescriptions',
      icon: Pill,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Laboratory',
      url: '/laboratory',
      icon: TestTube,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Pharmacy',
      url: '/pharmacy',
      icon: Package,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Admissions',
      url: '/admissions',
      icon: Building2,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Medical Reports',
      url: '/medical-reports',
      icon: BarChart3,
      roles: ['admin', 'doctor', 'nurse']
    },
    {
      title: 'Billing',
      url: '/billing',
      icon: CreditCard,
      roles: ['admin', 'receptionist']
    }
  ],
  settings: [
    {
      title: 'Permissions',
      url: '/permissions',
      icon: Shield,
      roles: ['admin']
    },
    {
      title: 'Settings',
      url: '/settings',
      icon: Settings,
      roles: ['admin']
    }
  ]
};

interface AppSidebarProps {
  userRole?: string;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AppSidebar({
  userRole,
  user = {
    name: 'User',
    email: 'user@medicore.com'
  }
}: AppSidebarProps) {
  const pathname = usePathname();

  const filterItemsByRole = (items: typeof navigation.main) => {
    if (!userRole) return [];
    return items.filter(item => item.roles.includes(userRole));
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-sidebar-primary-foreground">
                  <span className="text-lg font-bold text-white">M</span>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">MediCore HMS</span>
                  <span className="truncate text-xs">Hospital Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(navigation.main).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Modules */}
        <SidebarGroup>
          <SidebarGroupLabel>Modules</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filterItemsByRole(navigation.modules).map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        {filterItemsByRole(navigation.settings).length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Settings</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filterItemsByRole(navigation.settings).map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.url || pathname.startsWith(item.url + '/')}
                    >
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-emerald-600 text-sidebar-primary-foreground">
                    <User2 className="size-4 text-white" />
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user.name}</span>
                    <span className="truncate text-xs">{user.email}</span>
                  </div>
                  <ChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="right"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuItem>
                  <User2 />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}