import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
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

  @Post('employees')
  async createEmployee(
    @Body() body: {
      registrationNumber: string;
      firstName: string;
      lastName: string;
      title: string;
      departmentId?: string;
      email: string;
      phone: string;
      contractType?: string;
      hireDate?: Date;
    },
  ) {
    return this.hrService.createEmployee(body);
  }

  @Patch('employees/:id')
  async updateEmployee(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.hrService.updateEmployee(id, body);
  }

  @Get('certifications')
  async getCertifications() {
    return this.hrService.getCertifications();
  }

  @Post('certifications')
  async createCertification(
    @Body() body: {
      employeeId: string;
      certName: string;
      issuingBody: string;
      issueDate: Date;
      expiryDate: Date;
      status?: string;
    },
  ) {
    return this.hrService.createCertification(body);
  }

  @Patch('certifications/:id/renew')
  async renewCertification(
    @Param('id') id: string,
    @Body() body: {
      extensionMonths?: number;
      notes?: string;
    },
  ) {
    return this.hrService.renewCertification(id, body);
  }

  @Post('employees/:id/medical')
  async updateEmployeeMedical(
    @Param('id') id: string,
    @Body() body: {
      medicalDate: Date | string;
      doctorName?: string;
      aptitudes?: string;
    },
  ) {
    return this.hrService.updateEmployeeMedical(id, body);
  }

  @Get('attendances')
  async getAttendances(@Query('projectId') projectId?: string) {
    return this.hrService.getAttendances(projectId);
  }

  @Post('attendances')
  async createAttendance(
    @Body() body: {
      employeeId: string;
      projectId?: string;
      date: Date | string;
      regularHours?: number;
      hoursWorked?: number;
      overtimeHours?: number;
      isAbsent?: boolean;
      absenceReason?: string;
    },
  ) {
    return this.hrService.createAttendance(body);
  }
}
