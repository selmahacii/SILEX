import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload } from '@silex/shared';

@Controller('projects')
@UseGuards(JwtAuthGuard)
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

  @Post(':id/service-orders')
  async createServiceOrder(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createServiceOrder(id, body, user);
  }

  @Post(':id/work-situations')
  async createWorkSituation(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.projectsService.createWorkSituation(id, body, user);
  }
}
