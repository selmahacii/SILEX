import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class HrService {
  constructor(private prisma: PrismaService) {}

  async getEmployees() {
    return this.prisma.employee.findMany({
      include: {
        department: true,
        certifications: true,
        attendances: {
          include: {
            project: { select: { id: true, code: true, name: true } },
          },
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
      orderBy: { registrationNumber: 'asc' },
    });
  }

  async createEmployee(data: {
    registrationNumber: string;
    firstName: string;
    lastName: string;
    title: string;
    departmentId?: string;
    email: string;
    phone: string;
    contractType?: string;
    hireDate?: Date;
  }) {
    let departmentId = data.departmentId;
    if (!departmentId) {
      const defaultDept = await this.prisma.department.findFirst();
      departmentId = defaultDept ? defaultDept.id : undefined;
    }

    if (!departmentId) {
      throw new NotFoundException('Département introuvable');
    }

    // Sécurisation de l'unicité du matricule et email
    let reg = data.registrationNumber;
    const existingReg = await this.prisma.employee.findUnique({ where: { registrationNumber: reg } });
    if (existingReg) {
      reg = `${reg}-${Math.floor(100 + Math.random() * 900)}`;
    }

    let email = data.email?.toLowerCase().trim() || `${data.firstName.toLowerCase()}.${data.lastName.toLowerCase()}@silex.dz`;
    const existingEmail = await this.prisma.employee.findUnique({ where: { email } });
    if (existingEmail) {
      const parts = email.split('@');
      email = `${parts[0]}.${Math.floor(100 + Math.random() * 900)}@${parts[1] || 'silex.dz'}`;
    }

    return this.prisma.employee.create({
      data: {
        registrationNumber: reg,
        firstName: data.firstName,
        lastName: data.lastName,
        title: data.title,
        departmentId,
        email,
        phone: data.phone,
        contractType: data.contractType || 'CDI',
        hireDate: data.hireDate ? new Date(data.hireDate) : new Date(),
        status: 'ACTIF',
      },
      include: {
        department: true,
        certifications: true,
      },
    });
  }

  async updateEmployee(id: string, data: any) {
    const emp = await this.prisma.employee.findUnique({ where: { id } });
    if (!emp) throw new NotFoundException('Collaborateur introuvable');

    return this.prisma.employee.update({
      where: { id },
      data: {
        firstName: data.firstName ?? emp.firstName,
        lastName: data.lastName ?? emp.lastName,
        title: data.title ?? emp.title,
        phone: data.phone ?? emp.phone,
        status: data.status ?? emp.status,
        contractType: data.contractType ?? emp.contractType,
      },
      include: {
        department: true,
        certifications: true,
      },
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

  async createCertification(data: {
    employeeId: string;
    certName: string;
    issuingBody?: string;
    issueDate?: Date | string;
    expiryDate?: Date | string;
    status?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Collaborateur introuvable');

    const issueDateRaw = data.issueDate || (data as any).issuedDate;
    const issueDate = issueDateRaw ? new Date(issueDateRaw) : new Date();
    const expiryDateRaw = data.expiryDate;
    const expiryDate = expiryDateRaw ? new Date(expiryDateRaw) : new Date(Date.now() + 365 * 86400000);

    return this.prisma.employeeCertification.create({
      data: {
        employeeId: data.employeeId,
        certName: data.certName,
        issuingBody: data.issuingBody || 'Organisme de Contrôle Agréé',
        issueDate,
        expiryDate,
        status: data.status || 'VALIDE',
      },
      include: {
        employee: true,
      },
    });
  }

  async renewCertification(certId: string, data: {
    extensionMonths?: number;
    notes?: string;
  }) {
    const cert = await this.prisma.employeeCertification.findUnique({ where: { id: certId } });
    if (!cert) throw new NotFoundException('Certification introuvable');

    const months = data.extensionMonths || 6;
    const currentExpiry = cert.expiryDate ? new Date(cert.expiryDate) : new Date();
    const newExpiry = new Date(currentExpiry.getTime() + months * 30 * 86400000);

    return this.prisma.employeeCertification.update({
      where: { id: certId },
      data: {
        expiryDate: newExpiry,
        status: 'VALIDE',
        certName: data.notes ? `${cert.certName} [Reconduit ASME: ${data.notes}]` : cert.certName,
      },
      include: { employee: true },
    });
  }

  async updateEmployeeMedical(employeeId: string, data: {
    medicalDate?: Date | string;
    checkupDate?: Date | string;
    doctorName?: string;
    aptitudes?: string;
    status?: string;
    restrictions?: string[] | string;
    notes?: string;
  }) {
    const emp = await this.prisma.employee.findUnique({ where: { id: employeeId } });
    if (!emp) throw new NotFoundException('Collaborateur introuvable');

    const rawDate = data.medicalDate || data.checkupDate;
    const issueDate = rawDate && !isNaN(new Date(rawDate).getTime()) ? new Date(rawDate) : new Date();
    const expiryDate = new Date(issueDate.getTime() + 365 * 86400000); // Validité 1 an

    const restrictionStr = Array.isArray(data.restrictions)
      ? data.restrictions.join(', ')
      : (data.restrictions || data.aptitudes || 'Apte sans restriction');

    const randSuffix = Math.floor(100 + Math.random() * 900);
    return this.prisma.employeeCertification.create({
      data: {
        employeeId,
        certName: `Aptitude Médicale Chantier [MED-DZ-${randSuffix}] (${data.status || 'APTE'} - ${restrictionStr})`,
        issuingBody: `${data.doctorName || 'Médecin du Travail Agréé'} (Loi 88-07)`,
        issueDate,
        expiryDate,
        status: 'VALIDE',
      },
      include: { employee: true },
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
      take: 100,
    });
  }

  async createAttendance(data: {
    employeeId: string;
    projectId?: string;
    date: Date | string;
    regularHours?: number;
    hoursWorked?: number;
    overtimeHours?: number;
    isAbsent?: boolean;
    absenceReason?: string;
  }) {
    const employee = await this.prisma.employee.findUnique({ where: { id: data.employeeId } });
    if (!employee) throw new NotFoundException('Collaborateur introuvable');

    const regularHours =
      data.regularHours !== undefined
        ? data.regularHours
        : (data.hoursWorked !== undefined ? data.hoursWorked : 8);

    let validProjectId: string | null = null;
    if (data.projectId) {
      const proj = await this.prisma.project.findUnique({ where: { id: data.projectId } });
      if (proj) {
        validProjectId = proj.id;
      }
    }

    return this.prisma.attendance.create({
      data: {
        employeeId: data.employeeId,
        projectId: validProjectId,
        date: new Date(data.date),
        regularHours,
        overtimeHours: data.overtimeHours !== undefined ? data.overtimeHours : 0,
        isAbsent: data.isAbsent || false,
        absenceReason: data.absenceReason || null,
      },
      include: {
        employee: true,
        project: { select: { id: true, code: true, name: true } },
      },
    });
  }
}
