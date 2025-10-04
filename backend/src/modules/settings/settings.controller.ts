import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
  Param,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { SettingsService } from './settings.service';
import {
  UpdateSettingsDto,
  UpdateProfileSettingsDto,
  UpdateHospitalSettingsDto,
  UpdateAppearanceSettingsDto,
  UpdateNotificationSettingsDto,
  SettingCategory,
} from './dto/update-settings.dto';

@Controller('settings')
@UseGuards(JwtAuthGuard)
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  async getAllSettings(@Request() req) {
    try {
      const settings = await this.settingsService.getUserSettings(req.user.userId);
      return {
        success: true,
        data: settings,
        message: 'Settings retrieved successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get(':category')
  async getSettingsByCategory(@Request() req, @Param('category') category: SettingCategory) {
    try {
      const settings = await this.settingsService.getSettingsByCategory(
        req.user.userId,
        category,
      );
      return {
        success: true,
        data: settings,
        message: `${category} settings retrieved successfully`,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to retrieve settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put()
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    try {
      const settings = await this.settingsService.updateSettings(req.user.userId, dto);
      return {
        success: true,
        data: settings,
        message: 'Settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('profile')
  async updateProfile(@Request() req, @Body() dto: UpdateProfileSettingsDto) {
    try {
      const settings = await this.settingsService.updateProfileSettings(req.user.userId, dto);
      return {
        success: true,
        data: settings,
        message: 'Profile settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update profile settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('hospital')
  async updateHospital(@Request() req, @Body() dto: UpdateHospitalSettingsDto) {
    try {
      const settings = await this.settingsService.updateSettings(req.user.userId, {
        category: SettingCategory.HOSPITAL,
        settings: dto,
      });
      return {
        success: true,
        data: settings,
        message: 'Hospital settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update hospital settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('appearance')
  async updateAppearance(@Request() req, @Body() dto: UpdateAppearanceSettingsDto) {
    try {
      const settings = await this.settingsService.updateSettings(req.user.userId, {
        category: SettingCategory.APPEARANCE,
        settings: dto,
      });
      return {
        success: true,
        data: settings,
        message: 'Appearance settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update appearance settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('notifications')
  async updateNotifications(@Request() req, @Body() dto: UpdateNotificationSettingsDto) {
    try {
      const settings = await this.settingsService.updateSettings(req.user.userId, {
        category: SettingCategory.NOTIFICATION,
        settings: dto,
      });
      return {
        success: true,
        data: settings,
        message: 'Notification settings updated successfully',
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update notification settings',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('password')
  async changePassword(
    @Request() req,
    @Body() body: { currentPassword: string; newPassword: string },
  ) {
    try {
      const result = await this.settingsService.changePassword(
        req.user.userId,
        body.currentPassword,
        body.newPassword,
      );
      return {
        success: true,
        message: result.message,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to change password',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
