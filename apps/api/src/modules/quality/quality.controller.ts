import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { QualityService } from './quality.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DocumentCategory, NonConformitySeverity, NonConformityStatus } from '@prisma/client';

@Controller('quality')
@UseGuards(JwtAuthGuard)
export class QualityController {
  constructor(private qualityService: QualityService) {}

  @Get('documents')
  async getDocuments() {
    return this.qualityService.getDocuments();
  }

  @Post('documents')
  async createDocument(
    @Body() body: {
      docNumber: string;
      title: string;
      category: DocumentCategory;
      projectId?: string;
      version?: string;
      author: string;
      expiryDate?: Date;
      status?: string;
    },
  ) {
    return this.qualityService.createDocument(body);
  }

  @Patch('documents/:id')
  async updateDocument(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.qualityService.updateDocument(id, body);
  }

  @Get('non-conformities')
  async getNonConformities() {
    return this.qualityService.getNonConformities();
  }

  @Post('non-conformities')
  async createNonConformity(
    @Body() body: {
      ncNumber: string;
      title: string;
      description: string;
      severity: NonConformitySeverity;
      projectId?: string;
      detectedBy: string;
      rootCause?: string;
    },
  ) {
    return this.qualityService.createNonConformity(body);
  }

  @Patch('non-conformities/:id')
  async updateNonConformity(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.qualityService.updateNonConformity(id, body);
  }

  @Patch('non-conformities/:id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.qualityService.updateNonConformityStatus(id, body);
  }

  @Post('non-conformities/:id/actions')
  async addCorrectiveAction(
    @Param('id') id: string,
    @Body() body: {
      description: string;
      responsible: string;
      dueDate: Date;
    },
  ) {
    return this.qualityService.addCorrectiveAction(id, body);
  }
}
