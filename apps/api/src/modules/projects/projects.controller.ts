import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ProjectAccessGuard } from '../../common/guards/project-access.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload } from '@silex/shared';

@Controller('projects')
@UseGuards(JwtAuthGuard, ProjectAccessGuard)
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  async findAll(
    @CurrentUser() user: UserSessionPayload,
    @Query('status') status?: any,
    @Query('sector') sector?: any,
  ) {
    return this.projectsService.findAll(user, { status, sector });
  }

  @Post()
  async createProject(
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createProject(body, user);
  }

  @Get('kpis')
  async getKPIs() {
    return this.projectsService.getExecutiveKPIs();
  }

  @Get(':code')
  async findByCode(
    @Param('code') code: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.findByCode(code, user);
  }

  @Patch(':id')
  async updateProject(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateProject(id, body, user);
  }

  @Patch(':id/progress')
  async updateProgress(
    @Param('id') id: string,
    @Body() body: { physicalProgress?: number; financialProgress?: number },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateProgress(id, body, user);
  }

  @Post(':id/milestones')
  async createMilestone(
    @Param('id') id: string,
    @Body() body: { title: string; description?: string; targetDate: string | Date },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createMilestone(id, body, user);
  }

  @Patch(':id/milestones/:milestoneId')
  async updateMilestone(
    @Param('id') projectId: string,
    @Param('milestoneId') milestoneId: string,
    @Body() body: { status?: string; completedDate?: string | Date; title?: string; description?: string; targetDate?: string | Date },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateMilestone(projectId, milestoneId, body, user);
  }

  @Post(':id/service-orders')
  async createServiceOrder(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createServiceOrder(id, body, user);
  }

  @Patch(':id/service-orders/:orderId')
  async updateServiceOrder(
    @Param('id') id: string,
    @Param('orderId') orderId: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateServiceOrder(id, orderId, body, user);
  }

  @Post(':id/work-situations')
  async createWorkSituation(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createWorkSituation(id, body, user);
  }

  @Patch(':id/work-situations/:situationId')
  async updateWorkSituation(
    @Param('id') id: string,
    @Param('situationId') situationId: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateWorkSituation(id, situationId, body, user);
  }

  @Patch(':id/contract')
  async updateContract(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.updateContract(id, body, user);
  }

  @Post(':id/members')
  async addMember(
    @Param('id') id: string,
    @Body('userId') userId: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.addProjectMember(id, userId, user);
  }

  @Delete(':id/members/:userId')
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.removeProjectMember(id, userId, user);
  }

  @Post(':id/costs')
  async addCostEntry(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.addCostEntry(id, body, user);
  }
}
