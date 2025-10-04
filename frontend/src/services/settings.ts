import { api } from './api';

export interface ProfileSettings {
  fullName: string;
  email: string;
  phone: string;
  role: string;
  bio?: string;
}

export interface HospitalSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  registrationNumber: string;
}

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'ar' | 'es' | 'fr';
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
}

export interface NotificationSettings {
  emailNotifications: boolean;
  smsNotifications: boolean;
  appointmentReminders: boolean;
  billingAlerts: boolean;
  systemUpdates: boolean;
}

export interface AllSettings {
  profile?: ProfileSettings;
  hospital?: HospitalSettings;
  appearance?: AppearanceSettings;
  notification?: NotificationSettings;
}

export const settingsService = {
  async getAllSettings(): Promise<{ success: boolean; data: AllSettings; message: string }> {
    return api.get('/settings');
  },

  async getSettingsByCategory(category: string): Promise<{ success: boolean; data: any; message: string }> {
    return api.get(`/settings/${category}`);
  },

  async updateProfileSettings(data: Partial<ProfileSettings>): Promise<{ success: boolean; data: any; message: string }> {
    return api.put('/settings/profile', data);
  },

  async updateHospitalSettings(data: Partial<HospitalSettings>): Promise<{ success: boolean; data: any; message: string }> {
    return api.put('/settings/hospital', data);
  },

  async updateAppearanceSettings(data: Partial<AppearanceSettings>): Promise<{ success: boolean; data: any; message: string }> {
    return api.put('/settings/appearance', data);
  },

  async updateNotificationSettings(data: Partial<NotificationSettings>): Promise<{ success: boolean; data: any; message: string }> {
    return api.put('/settings/notifications', data);
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    return api.post('/settings/password', { currentPassword, newPassword });
  },
};
