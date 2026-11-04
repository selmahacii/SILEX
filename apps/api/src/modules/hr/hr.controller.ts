import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { HrService } from './hr.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('hr')
@UseGuards(JwtAuthGuard)
export class HrController {
  constructor(private hrService: HrService) {}

  @Get('employees')
  async getEmployees() {
    return this.hrService.getEmployees();
  }

  @Get('certifications')
  async getCertifications() {
    return this.hrService.getCertifications();
  }

  @Get('attendances')
  async getAttendances(@Query('projectId') projectId?: string) {
    return this.hrService.getAttendances(projectId);
  }
}
