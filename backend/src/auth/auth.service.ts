import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../config/prisma.service';
import { RedisService } from '../config/redis.service';
import { AuditService } from '../common/security/audit.service';
import { PasswordValidator } from '../common/security/password.validator';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  fullName: string;
  jti: string;
  type: 'access' | 'refresh';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
    private readonly auditService: AuditService,
  ) {}

  async validateUser(email: string, password: string, ipAddress?: string): Promise<User | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        await this.auditService.logAuthFailure(email, ipAddress || 'unknown', 'User not found');
        return null;
      }

      if (user.status !== 'active') {
        await this.auditService.logAuthFailure(email, ipAddress || 'unknown', 'Account deactivated');
        return null;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await this.auditService.logAuthFailure(email, ipAddress || 'unknown', 'Invalid password');
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating user:', error);
      await this.auditService.logAuthFailure(email, ipAddress || 'unknown', 'System error during validation');
      return null;
    }
  }

  async login(user: User) {
    const jti = this.generateTokenId();

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
      jti,
      type: 'access',
    };

    const refreshPayload: JwtPayload = {
      ...payload,
      type: 'refresh',
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      expiresIn: '7d',
    });

    // Store refresh token in Redis
    await this.redisService.setSession(
      `refresh_token:${user.id}:${jti}`,
      { refreshToken, userId: user.id, jti },
      7 * 24 * 60 * 60, // 7 days in seconds
    );

    // Update user's last login
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isActive: user.status === 'active',
      },
      accessToken,
      refreshToken,
    };
  }

  async logout(userId: string, jti: string): Promise<void> {
    try {
      // Remove refresh token from Redis
      await this.redisService.deleteKey(`refresh_token:${userId}:${jti}`);

      // Add token to blacklist
      await this.redisService.setSession(
        `blacklist_token:${jti}`,
        { userId, jti, blacklistedAt: new Date() },
        24 * 60 * 60, // 24 hours
      );
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as JwtPayload;

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Invalid token type');
      }

      // Check if refresh token exists in Redis
      const storedToken = await this.redisService.getSession(
        `refresh_token:${payload.sub}:${payload.jti}`,
      );

      if (!storedToken || (storedToken as any).refreshToken !== refreshToken) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Get user from database
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        throw new UnauthorizedException('User not found or inactive');
      }

      // Generate new tokens
      const newJti = this.generateTokenId();

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        jti: newJti,
        type: 'access',
      };

      const newRefreshPayload: JwtPayload = {
        ...newPayload,
        type: 'refresh',
      };

      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      const newRefreshToken = this.jwtService.sign(newRefreshPayload, {
        expiresIn: '7d',
      });

      // Remove old refresh token and store new one
      await this.redisService.deleteKey(
        `refresh_token:${payload.sub}:${payload.jti}`,
      );

      await this.redisService.setSession(
        `refresh_token:${user.id}:${newJti}`,
        { refreshToken: newRefreshToken, userId: user.id, jti: newJti },
        7 * 24 * 60 * 60, // 7 days
      );

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateToken(payload: JwtPayload): Promise<User | null> {
    try {
      // Check if token is blacklisted (skip if Redis is unavailable)
      try {
        const blacklisted = await this.redisService.getSession(
          `blacklist_token:${payload.jti}`,
        );

        if (blacklisted) {
          throw new UnauthorizedException('Token is blacklisted');
        }
      } catch (redisError) {
        // If Redis is not available, skip blacklist check and continue
        console.warn('Redis blacklist check failed, continuing with token validation:', redisError.message);
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user || user.status !== 'active') {
        return null;
      }

      return user;
    } catch (error) {
      console.error('Error validating token:', error);
      return null;
    }
  }

  private generateTokenId(): string {
    return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
  }

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  async comparePasswords(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  async registerUser(data: {
    email: string;
    password: string;
    fullName: string;
    role: string;
    phone?: string;
    department?: string;
    employeeId?: string;
  }) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        fullName: data.fullName,
        role: data.role as any,
        phone: data.phone,
        department: data.department,
        employeeId: data.employeeId,
        status: 'active', // User is active immediately
      },
    });

    // Get role from database to assign permissions
    const roleRecord = await this.prisma.role.findFirst({
      where: {
        name: data.role.charAt(0).toUpperCase() + data.role.slice(1), // Capitalize first letter (admin -> Admin)
      },
    });

    // Assign role to user automatically
    if (roleRecord) {
      await this.prisma.userRole_New.create({
        data: {
          userId: user.id,
          roleId: roleRecord.id,
        },
      });
    }

    // Log the user creation
    await this.auditService.logAuthSuccess(
      user.email,
      'system',
      `User registered with role: ${data.role}`,
    );

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      status: user.status,
    };
  }
}