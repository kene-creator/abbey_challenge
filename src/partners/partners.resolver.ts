import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PartnerService } from './partners.service';
import { Partner } from '@prisma/client';

@Controller('partners')
export class PartnerResolver {
  constructor(private partnerService: PartnerService) {}

  @Get()
  async getAllPartners(): Promise<Partner[]> {
    return this.partnerService.getAllPartners();
  }

  @Get(':id')
  async getPartner(@Param('id') id: string): Promise<Partner | null> {
    return this.partnerService.getPartner(id);
  }

  @Post()
  async createPartner(@Body() partnerData: Partner): Promise<Partner> {
    return this.partnerService.createPartner(partnerData);
  }

  @Put(':id')
  async updatePartner(
    @Param('id') id: string,
    @Body() partnerData: Partner,
  ): Promise<Partner | null> {
    return this.partnerService.updatePartner(id, partnerData);
  }

  @Delete(':id')
  async deletePartner(@Param('id') id: string): Promise<Partner | null> {
    return this.partnerService.deletePartner(id);
  }
}
