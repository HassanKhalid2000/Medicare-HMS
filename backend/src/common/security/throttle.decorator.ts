import { SetMetadata } from '@nestjs/common';
import { ThrottlerOptions } from '@nestjs/throttler';

export const THROTTLE_KEY = 'throttle';

export interface CustomThrottlerOptions {
  name?: string;
  ttl?: number;
  limit?: number;
}

export const Throttle = (options: CustomThrottlerOptions) =>
  SetMetadata(THROTTLE_KEY, options);

export const AuthThrottle = () =>
  Throttle({
    name: 'auth',
    ttl: 15 * 60 * 1000, // 15 minutes
    limit: 10, // 10 attempts per 15 minutes
  });

export const StrictThrottle = () =>
  Throttle({
    name: 'strict',
    ttl: 60 * 1000, // 1 minute
    limit: 20, // 20 requests per minute
  });

export const PublicThrottle = () =>
  Throttle({
    name: 'default',
    ttl: 60 * 1000, // 1 minute
    limit: 200, // 200 requests per minute for public endpoints
  });