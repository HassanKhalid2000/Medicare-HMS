import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';
import { UpdateSettingsDto, SettingCategory } from './dto/update-settings.dto';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getUserSettings(userId: string) {
    const settings = await this.prisma.setting.findMany({
      where: {
        OR: [
          { type: 'USER', userId },
          { type: 'SYSTEM', isPublic: true },
          { type: 'HOSPITAL', isPublic: true },
        ],
      },
    });

    // Organize settings by category
    const organized = settings.reduce((acc, setting) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {};
      }
      acc[setting.category][setting.key] = setting.value;
      return acc;
    }, {} as Record<string, Record<string, any>>);

    return organized;
  }

  async getSettingsByCategory(userId: string, category: SettingCategory) {
    const settings = await this.prisma.setting.findMany({
      where: {
        category,
        OR: [
          { type: 'USER', userId },
          { type: 'SYSTEM', isPublic: true },
          { type: 'HOSPITAL', isPublic: true },
        ],
      },
    });

    const organized = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, any>);

    return organized;
  }

  async updateSettings(userId: string, dto: UpdateSettingsDto) {
    const { category, settings } = dto;

    // Determine setting type based on category
    const type = category === 'hospital' ? 'HOSPITAL' : 'USER';
    const isPublic = category === 'hospital';

    // Update or create each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      // For hospital settings, find existing or create new
      if (type === 'HOSPITAL') {
        const existing = await this.prisma.setting.findFirst({
          where: {
            type: 'HOSPITAL',
            category,
            key,
            userId: null,
          },
        });

        if (existing) {
          return this.prisma.setting.update({
            where: { id: existing.id },
            data: {
              value,
              updatedAt: new Date(),
            },
          });
        } else {
          return this.prisma.setting.create({
            data: {
              type: 'HOSPITAL',
              category,
              key,
              value,
              userId: null,
              isPublic,
            },
          });
        }
      } else {
        // For user settings, use upsert
        return this.prisma.setting.upsert({
          where: {
            type_category_key_userId: {
              type,
              category,
              key,
              userId,
            },
          },
          update: {
            value,
            updatedAt: new Date(),
          },
          create: {
            type,
            category,
            key,
            value,
            userId,
            isPublic,
          },
        });
      }
    });

    await Promise.all(updates);

    return this.getSettingsByCategory(userId, category);
  }

  async updateProfileSettings(userId: string, updates: Record<string, any>) {
    // Also update user table for profile info
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        fullName: updates.fullName,
        phone: updates.phone,
      },
    });

    return this.updateSettings(userId, {
      category: SettingCategory.PROFILE,
      settings: updates,
    });
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Here you would verify current password and hash new password
    // This is a placeholder - implement proper password validation
    const bcrypt = require('bcrypt');

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: 'Password updated successfully' };
  }
}
