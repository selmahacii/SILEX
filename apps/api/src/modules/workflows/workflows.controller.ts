import { Controller, Get, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('workflows')
@UseGuards(JwtAuthGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get('inbox')
  async getInbox() {
    return this.workflowsService.getPendingValidations();
  }
}
