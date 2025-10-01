import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        skipIf: () => false,
        throttlers: [
          {
            name: 'default',
            ttl: 60 * 1000, // 1 minute
            limit: 10000, // Increased to 10000 for development
          },
          {
            name: 'auth',
            ttl: 15 * 60 * 1000, // 15 minutes
            limit: 500, // Increased for development
          },
          {
            name: 'strict',
            ttl: 60 * 1000, // 1 minute
            limit: 2000, // Increased for development
          },
        ],
      }),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
  exports: [ThrottlerModule],
})
export class SecurityModule {}