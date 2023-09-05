import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { Partner } from '@prisma/client';

@Controller('partners')
export class PartnerService {
  constructor(private prismaService: PrismaService) {}

  @Get()
  async getAllPartners(): Promise<Partner[]> {
    return this.prismaService.partner.findMany();
  }

  @Get(':id')
  async getPartner(@Param('id') id: string): Promise<Partner | null> {
    return this.prismaService.partner.findUnique({
      where: { id },
    });
  }

  @Post()
  async createPartner(@Body() partnerData: Partner): Promise<Partner> {
    return this.prismaService.partner.create({
      data: partnerData,
    });
  }

  @Put(':id')
  async updatePartner(
    @Param('id') id: string,
    @Body() partnerData: Partner,
  ): Promise<Partner | null> {
    return this.prismaService.partner.update({
      where: { id },
      data: partnerData,
    });
  }

  @Delete(':id')
  async deletePartner(@Param('id') id: string): Promise<Partner | null> {
    return this.prismaService.partner.delete({
      where: { id },
    });
  }
}
