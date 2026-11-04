import { Controller, Get, UseGuards } from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('quality')
@UseGuards(JwtAuthGuard)
export class QualityController {
  constructor(private qualityService: QualityService) {}

  @Get('documents')
  async getDocuments() {
    return this.qualityService.getDocuments();
  }

  @Get('non-conformities')
  async getNonConformities() {
    return this.qualityService.getNonConformities();
  }
}
