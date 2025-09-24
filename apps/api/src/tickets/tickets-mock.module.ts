import { Module } from '@nestjs/common';
import { TicketsMockController } from './tickets-mock.controller';
import { TicketsMockService } from './tickets-mock.service';
import { MockDataService } from '../shared/mock-data.service';

@Module({
  controllers: [TicketsMockController],
  providers: [TicketsMockService, MockDataService],
  exports: [TicketsMockService],
})
export class TicketsMockModule {}