import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define user type for NextAuth
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      fullName: string;
      role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
      isActive: boolean;
    };
  }

  interface User {
    id: string;
    email: string;
    fullName: string;
    role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
    isActive: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: 'admin' | 'doctor' | 'nurse' | 'receptionist';
    fullName: string;
    isActive: boolean;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiry?: number;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'Enter your email',
        },
        password: {
          label: 'Password',
          type: 'password',
          placeholder: 'Enter your password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        // Demo credentials for testing (matching database)
        const demoUsers = [
          {
            id: 'admin-1',
            email: 'admin@medicore.com',
            password: 'password123',
            fullName: 'Admin',
            role: 'admin' as const,
            isActive: true,
          },
          {
            id: 'doctor-1',
            email: 'doctor@medicore.com',
            password: 'password123',
            fullName: 'Doctor',
            role: 'doctor' as const,
            isActive: true,
          },
          {
            id: 'nurse-1',
            email: 'nurse@medicore.com',
            password: 'password123',
            fullName: 'Nurse',
            role: 'nurse' as const,
            isActive: true,
          },
          {
            id: 'receptionist-1',
            email: 'receptionist@medicore.com',
            password: 'password123',
            fullName: 'Receptionist',
            role: 'receptionist' as const,
            isActive: true,
          },
        ];

        // Check demo credentials first
        const demoUser = demoUsers.find(
          user => user.email === credentials.email && user.password === credentials.password
        );

        // Try backend authentication first
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            if (data.user && data.accessToken) {
              console.log('Backend authentication successful for:', data.user.email);
              return {
                id: data.user.id,
                email: data.user.email,
                fullName: data.user.fullName,
                role: data.user.role,
                isActive: data.user.isActive,
                accessToken: data.accessToken,
                refreshToken: data.refreshToken,
              };
            }
          } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Authentication failed');
          }
        } catch (error) {
          console.error('Backend authentication failed:', error);
          throw error;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days for development
  },
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
    maxAge: 7 * 24 * 60 * 60, // 7 days for development
  },
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.fullName = user.fullName;
        token.isActive = user.isActive;
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        // Access token expires in 15 minutes
        token.accessTokenExpiry = Date.now() + 15 * 60 * 1000;
      }

      // Check if access token is expired or about to expire (within 2 minutes)
      if (token.accessTokenExpiry && Date.now() > token.accessTokenExpiry - 2 * 60 * 1000) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                refreshToken: token.refreshToken,
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            token.accessToken = data.accessToken;
            token.refreshToken = data.refreshToken;
            token.accessTokenExpiry = Date.now() + 15 * 60 * 1000;
            console.log('Access token refreshed successfully');
          } else {
            console.error('Failed to refresh access token');
            // Token refresh failed, user will need to re-authenticate
            return { ...token, error: 'RefreshAccessTokenError' };
          }
        } catch (error) {
          console.error('Error refreshing access token:', error);
          return { ...token, error: 'RefreshAccessTokenError' };
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.id,
          email: token.email!,
          fullName: token.fullName,
          role: token.role,
          isActive: token.isActive,
        };
        (session as any).accessToken = token.accessToken;
        (session as any).error = token.error;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  events: {
    async signOut({ token }) {
      // Optional: Call backend to invalidate token
      try {
        if (token.accessToken) {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token.accessToken}`,
            },
          });
        }
      } catch (error) {
        console.error('Logout error:', error);
      }
    },
  },
  debug: process.env.NODE_ENV === 'development',
};