import { Module } from '@nestjs/common';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuditModule } from './modules/audit/audit.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ProcurementModule } from './modules/procurement/procurement.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { FinanceModule } from './modules/finance/finance.module';
import { HrModule } from './modules/hr/hr.module';
import { FleetModule } from './modules/fleet/fleet.module';
import { QualityModule } from './modules/quality/quality.module';
import { WorkflowsModule } from './modules/workflows/workflows.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    ProcurementModule,
    InventoryModule,
    FinanceModule,
    HrModule,
    FleetModule,
    QualityModule,
    WorkflowsModule,
  ],
})
export class AppModule {}
