import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getEmployees() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        certifications: true,
      },
      orderBy: { registrationNumber: 'asc' },
    });
  }

  async getCertifications() {
    return this.prisma.employeeCertification.findMany({
      include: {
        employee: {
          select: { id: true, registrationNumber: true, firstName: true, lastName: true, title: true },
        },
      },
      orderBy: { expiryDate: 'asc' },
    });
  }

  async getAttendances(projectId?: string) {
    const where = projectId ? { projectId } : {};
    return this.prisma.attendance.findMany({
      where,
      include: {
        employee: true,
        project: { select: { id: true, code: true, name: true } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });
  }
}
