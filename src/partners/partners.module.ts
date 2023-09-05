import { Module } from '@nestjs/common';
import { PartnerService } from './partners.service';
import { PartnerResolver } from './partners.resolver';

@Module({
  providers: [PartnerService, PartnerResolver],
  exports: [PartnerService],
})
export class PartnersModule {}
