import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  async getAssets() {
    return this.prisma.asset.findMany({
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
        maintenanceOrders: {
          orderBy: { scheduledDate: 'desc' },
          take: 5,
        },
      },
      orderBy: { assetTag: 'asc' },
    });
  }

  async getMaintenanceOrders() {
    return this.prisma.maintenanceOrder.findMany({
      include: {
        asset: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }
}
