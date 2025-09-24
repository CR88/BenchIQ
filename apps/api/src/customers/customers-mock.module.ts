import { Module } from '@nestjs/common';
import { CustomersMockController } from './customers-mock.controller';
import { CustomersMockService } from './customers-mock.service';
import { MockDataService } from '../shared/mock-data.service';

@Module({
  controllers: [CustomersMockController],
  providers: [CustomersMockService, MockDataService],
  exports: [CustomersMockService],
})
export class CustomersMockModule {}