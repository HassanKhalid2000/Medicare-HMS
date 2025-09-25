import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../config/prisma.service';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  success: boolean;
  errorMessage?: string;
}

export enum AuditAction {
  // Authentication actions
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGOUT = 'LOGOUT',
  PASSWORD_CHANGE = 'PASSWORD_CHANGE',
  PASSWORD_RESET = 'PASSWORD_RESET',

  // User management
  USER_CREATE = 'USER_CREATE',
  USER_UPDATE = 'USER_UPDATE',
  USER_DELETE = 'USER_DELETE',
  USER_ACTIVATE = 'USER_ACTIVATE',
  USER_DEACTIVATE = 'USER_DEACTIVATE',

  // Patient management
  PATIENT_CREATE = 'PATIENT_CREATE',
  PATIENT_UPDATE = 'PATIENT_UPDATE',
  PATIENT_VIEW = 'PATIENT_VIEW',
  PATIENT_DELETE = 'PATIENT_DELETE',

  // Medical records
  MEDICAL_RECORD_CREATE = 'MEDICAL_RECORD_CREATE',
  MEDICAL_RECORD_UPDATE = 'MEDICAL_RECORD_UPDATE',
  MEDICAL_RECORD_VIEW = 'MEDICAL_RECORD_VIEW',
  MEDICAL_RECORD_DELETE = 'MEDICAL_RECORD_DELETE',

  // Appointments
  APPOINTMENT_CREATE = 'APPOINTMENT_CREATE',
  APPOINTMENT_UPDATE = 'APPOINTMENT_UPDATE',
  APPOINTMENT_CANCEL = 'APPOINTMENT_CANCEL',
  APPOINTMENT_VIEW = 'APPOINTMENT_VIEW',

  // Security events
  UNAUTHORIZED_ACCESS = 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SUSPICIOUS_ACTIVITY = 'SUSPICIOUS_ACTIVITY',

  // System events
  SYSTEM_BACKUP = 'SYSTEM_BACKUP',
  DATA_EXPORT = 'DATA_EXPORT',
  DATA_IMPORT = 'DATA_IMPORT',
  CONFIGURATION_CHANGE = 'CONFIGURATION_CHANGE',
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private prisma: PrismaService) {}

  async log(entry: Partial<AuditLogEntry> & { action: string; resource: string }): Promise<void> {
    try {
      const auditEntry: AuditLogEntry = {
        timestamp: new Date(),
        success: true,
        ...entry,
      };

      // Log to database (you'll need to create an audit_logs table)
      await this.createAuditLog(auditEntry);

      // Also log to application logs for immediate visibility
      this.logToConsole(auditEntry);
    } catch (error) {
      this.logger.error('Failed to create audit log entry', error);
      // Still log to console even if database fails
      this.logToConsole(entry as AuditLogEntry);
    }
  }

  private async createAuditLog(entry: AuditLogEntry): Promise<void> {
    // For now, we'll use a simple approach since we don't have an audit_logs table yet
    // In a real implementation, you would create a dedicated audit_logs table
    this.logger.log({
      message: 'Audit Log Entry',
      ...entry,
    });
  }

  private logToConsole(entry: AuditLogEntry): void {
    const logLevel = entry.success ? 'log' : 'warn';
    const logMessage = `[AUDIT] ${entry.action} on ${entry.resource}`;

    this.logger[logLevel](logMessage, {
      userId: entry.userId,
      resourceId: entry.resourceId,
      ipAddress: entry.ipAddress,
      success: entry.success,
      errorMessage: entry.errorMessage,
      details: entry.details,
      timestamp: entry.timestamp,
    });
  }

  // Helper methods for common audit scenarios
  async logAuthSuccess(userId: string, ipAddress: string, userAgent?: string): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.LOGIN_SUCCESS,
      resource: 'auth',
      ipAddress,
      userAgent,
      success: true,
    });
  }

  async logAuthFailure(email: string, ipAddress: string, reason: string, userAgent?: string): Promise<void> {
    await this.log({
      action: AuditAction.LOGIN_FAILED,
      resource: 'auth',
      ipAddress,
      userAgent,
      success: false,
      errorMessage: reason,
      details: { email },
    });
  }

  async logUnauthorizedAccess(
    userId: string | undefined,
    resource: string,
    ipAddress: string,
    userAgent?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.UNAUTHORIZED_ACCESS,
      resource,
      ipAddress,
      userAgent,
      success: false,
      errorMessage: 'Unauthorized access attempt',
    });
  }

  async logPermissionDenied(
    userId: string,
    resource: string,
    action: string,
    ipAddress: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: AuditAction.PERMISSION_DENIED,
      resource,
      ipAddress,
      success: false,
      errorMessage: `Permission denied for action: ${action}`,
    });
  }

  async logDataAccess(
    userId: string,
    resource: string,
    resourceId: string,
    action: string,
    ipAddress: string,
  ): Promise<void> {
    await this.log({
      userId,
      action,
      resource,
      resourceId,
      ipAddress,
      success: true,
    });
  }

  async logSecurityEvent(
    event: AuditAction,
    details: Record<string, any>,
    ipAddress: string,
    userId?: string,
  ): Promise<void> {
    await this.log({
      userId,
      action: event,
      resource: 'security',
      ipAddress,
      success: false,
      details,
    });
  }
}