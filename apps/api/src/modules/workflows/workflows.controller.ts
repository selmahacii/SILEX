import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { WorkflowsService } from './workflows.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload, SystemRole } from '@silex/shared';

@Controller('workflows')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkflowsController {
  constructor(private workflowsService: WorkflowsService) {}

  @Get('inbox')
  async getInbox() {
    return this.workflowsService.getPendingValidations();
  }

  @Post(':id/approve')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async approveItem(
    @Param('id') id: string,
    @Body('type') type: 'PURCHASE_REQUEST' | 'WORK_SITUATION',
    @Body('notes') notes: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.workflowsService.approveItem(id, type, notes, user);
  }

  @Post(':id/reject')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async rejectItem(
    @Param('id') id: string,
    @Body('type') type: 'PURCHASE_REQUEST' | 'WORK_SITUATION',
    @Body('reason') reason: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.workflowsService.rejectItem(id, type, reason, user);
  }

  @Post(':id/request-revision')
  @Roles(SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async requestRevision(
    @Param('id') id: string,
    @Body('type') type: 'PURCHASE_REQUEST' | 'WORK_SITUATION',
    @Body('instructions') instructions: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.workflowsService.requestRevision(id, type, instructions, user);
  }
}
