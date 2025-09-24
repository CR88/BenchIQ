import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthMockService } from './auth-mock.service';
import { AuthMockController } from './auth-mock.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { MockDataService } from '../shared/mock-data.service';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [AuthMockService, JwtStrategy, MockDataService],
  controllers: [AuthMockController],
  exports: [AuthMockService],
})
export class AuthMockModule {}