import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AssetStatus, AssetType, MaintenanceStatus, MaintenanceType } from '@prisma/client';

@Injectable()
export class FleetService {
  constructor(private prisma: PrismaService) {}

  async getAssets() {
    return this.prisma.asset.findMany({
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
        maintenanceOrders: {
          orderBy: { scheduledDate: 'desc' },
        },
      },
      orderBy: { assetTag: 'asc' },
    });
  }

  async getAssetById(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
        maintenanceOrders: {
          orderBy: { scheduledDate: 'desc' },
        },
      },
    });
    if (!asset) throw new NotFoundException('Équipement introuvable');
    return asset;
  }

  async createAsset(data: {
    assetTag?: string;
    name: string;
    assetType: AssetType | string;
    brand: string;
    model: string;
    serialNumber: string;
    status?: AssetStatus | string;
    currentProjectId?: string;
    acquisitionDate?: Date;
  }) {
    const count = await this.prisma.asset.count();
    const assetTag = data.assetTag || `EQ-2026-${String(count + 1).padStart(3, '0')}`;

    let assetType = data.assetType as AssetType;
    if (!Object.values(AssetType).includes(assetType)) {
      const typeStr = String(data.assetType).toUpperCase();
      if (typeStr.includes('SOUD')) assetType = AssetType.POSTE_SOUDURE;
      else if (typeStr.includes('GEN') || typeStr.includes('ELEC')) assetType = AssetType.GROUPE_ELECTROGENE;
      else if (typeStr.includes('LEV') || typeStr.includes('HEAVY') || typeStr.includes('GRUE')) assetType = AssetType.ENGIN_LEVAGE;
      else if (typeStr.includes('VEH')) assetType = AssetType.VEHICULE;
      else if (typeStr.includes('HVAC') || typeStr.includes('FROID')) assetType = AssetType.EQUIPEMENT_HVAC;
      else assetType = AssetType.MACHINE_OUTIL;
    }

    let status = data.status as AssetStatus;
    if (!status || !Object.values(AssetStatus).includes(status)) {
      status = AssetStatus.OPERATIONAL;
    }

    return this.prisma.asset.create({
      data: {
        assetTag,
        name: data.name,
        assetType,
        brand: data.brand,
        model: data.model,
        serialNumber: data.serialNumber,
        status,
        currentProjectId: data.currentProjectId || null,
        acquisitionDate: data.acquisitionDate ? new Date(data.acquisitionDate) : new Date(),
      },
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateAssetStatus(id: string, status: AssetStatus | string) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Équipement introuvable');

    let validStatus = status as AssetStatus;
    if (!Object.values(AssetStatus).includes(validStatus)) {
      const statusStr = String(status).toUpperCase();
      if (statusStr.includes('MAINT') || statusStr.includes('REV')) {
        validStatus = AssetStatus.MAINTENANCE;
      } else if (statusStr.includes('OUT') || statusStr.includes('PANNE')) {
        validStatus = AssetStatus.OUT_OF_SERVICE;
      } else {
        validStatus = AssetStatus.OPERATIONAL;
      }
    }

    return this.prisma.asset.update({
      where: { id },
      data: { status: validStatus },
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
      },
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

  async createMaintenanceOrder(data: {
    orderNumber?: string;
    assetId: string;
    type: MaintenanceType;
    priority?: string;
    description: string;
    scheduledDate: Date;
    cost?: number;
    technician?: string;
    immediateImmobilization?: boolean;
  }) {
    const asset = await this.prisma.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) throw new NotFoundException('Équipement introuvable');

    const count = await this.prisma.maintenanceOrder.count();
    const orderNumber = data.orderNumber || `OT-2026-${String(count + 1).padStart(3, '0')}`;

    let maintenanceType: MaintenanceType = MaintenanceType.PREVENTIVE;
    const typeStr = String(data.type).toUpperCase();
    if (typeStr.includes('CORRECT') || typeStr.includes('CURAT') || typeStr.includes('PANNE')) {
      maintenanceType = MaintenanceType.CORRECTIVE;
    } else {
      maintenanceType = MaintenanceType.PREVENTIVE;
    }

    const isUrgent =
      data.immediateImmobilization ||
      data.priority === 'CRITICAL' ||
      data.priority === 'URGENT' ||
      data.priority?.includes('CRITIQUE');

    return this.prisma.$transaction(async tx => {
      const order = await tx.maintenanceOrder.create({
        data: {
          orderNumber,
          assetId: data.assetId,
          type: maintenanceType,
          priority: data.priority || 'NORMAL',
          description: data.description,
          scheduledDate: new Date(data.scheduledDate),
          cost: data.cost || 0,
          technician: data.technician || null,
          status: isUrgent ? MaintenanceStatus.IN_PROGRESS : MaintenanceStatus.SCHEDULED,
        },
        include: {
          asset: true,
        },
      });

      if (isUrgent) {
        await tx.asset.update({
          where: { id: data.assetId },
          data: { status: AssetStatus.MAINTENANCE },
        });
      }

      return order;
    });
  }

  async updateMaintenanceOrderStatus(
    id: string,
    data: MaintenanceStatus | { status: MaintenanceStatus | string; interventionReport?: string; cost?: number },
  ) {
    const order = await this.prisma.maintenanceOrder.findUnique({ where: { id }, include: { asset: true } });
    if (!order) throw new NotFoundException('Ordre de maintenance introuvable');

    const statusInput = typeof data === 'string' ? data : data.status;
    let validStatus = statusInput as MaintenanceStatus;
    const s = String(statusInput).toUpperCase();
    if (s.includes('COMPLET') || s.includes('TERM') || s.includes('CLOT')) {
      validStatus = MaintenanceStatus.COMPLETED;
    } else if (s.includes('PROG') || s.includes('COURS') || s.includes('DEMARR')) {
      validStatus = MaintenanceStatus.IN_PROGRESS;
    } else if (s.includes('CANCEL') || s.includes('ANNUL')) {
      validStatus = MaintenanceStatus.CANCELLED;
    } else {
      validStatus = MaintenanceStatus.SCHEDULED;
    }

    let updatedDesc = order.description;
    let actualCost = order.cost;
    if (typeof data === 'object') {
      if (data.interventionReport) {
        updatedDesc = `${order.description} | Rapport d'intervention (${new Date().toLocaleDateString('fr-DZ')}): ${data.interventionReport}`;
      }
      if (data.cost !== undefined) {
        actualCost = new (require('@prisma/client').Prisma.Decimal)(data.cost);
      }
    }

    return this.prisma.$transaction(async tx => {
      const updated = await tx.maintenanceOrder.update({
        where: { id },
        data: {
          status: validStatus,
          completedDate: validStatus === MaintenanceStatus.COMPLETED ? new Date() : undefined,
          description: updatedDesc,
          cost: actualCost,
        },
        include: {
          asset: true,
        },
      });

      if (order.assetId) {
        if (validStatus === MaintenanceStatus.COMPLETED) {
          await tx.asset.update({
            where: { id: order.assetId },
            data: { status: AssetStatus.OPERATIONAL },
          });
        } else if (validStatus === MaintenanceStatus.IN_PROGRESS) {
          await tx.asset.update({
            where: { id: order.assetId },
            data: { status: AssetStatus.MAINTENANCE },
          });
        }
      }

      return updated;
    });
  }

  async updateAsset(id: string, data: any) {
    const asset = await this.prisma.asset.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Équipement introuvable');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.model !== undefined) updateData.model = data.model;
    if (data.serialNumber !== undefined) updateData.serialNumber = data.serialNumber;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.assetType !== undefined) updateData.assetType = data.assetType;
    if (data.currentProjectId !== undefined) updateData.currentProjectId = data.currentProjectId;

    return this.prisma.asset.update({
      where: { id },
      data: updateData,
      include: {
        currentProject: { select: { id: true, code: true, name: true } },
      },
    });
  }

  async updateMaintenanceOrder(id: string, data: any) {
    const order = await this.prisma.maintenanceOrder.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Ordre de travail introuvable');

    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.technician !== undefined) updateData.technician = data.technician;
    if (data.cost !== undefined) updateData.cost = new (require('@prisma/client').Prisma.Decimal)(data.cost);
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.type !== undefined) updateData.type = data.type;
    if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
    if (data.status !== undefined) updateData.status = data.status;

    return this.prisma.maintenanceOrder.update({
      where: { id },
      data: updateData,
      include: {
        asset: true,
      },
    });
  }
}
