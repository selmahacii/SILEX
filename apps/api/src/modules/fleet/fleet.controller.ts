import { Controller, Get, Post, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AssetStatus, AssetType, MaintenanceStatus, MaintenanceType } from '@prisma/client';

@Controller('fleet')
@UseGuards(JwtAuthGuard)
export class FleetController {
  constructor(private fleetService: FleetService) {}

  @Get('assets')
  async getAssets() {
    return this.fleetService.getAssets();
  }

  @Get('assets/:id')
  async getAssetById(@Param('id') id: string) {
    return this.fleetService.getAssetById(id);
  }

  @Post('assets')
  async createAsset(
    @Body() body: {
      assetTag: string;
      name: string;
      assetType: AssetType;
      brand: string;
      model: string;
      serialNumber: string;
      status?: AssetStatus;
      currentProjectId?: string;
      acquisitionDate?: Date;
    },
  ) {
    return this.fleetService.createAsset(body);
  }

  @Patch('assets/:id/status')
  async updateAssetStatus(
    @Param('id') id: string,
    @Body('status') status: AssetStatus,
  ) {
    return this.fleetService.updateAssetStatus(id, status);
  }

  @Patch('assets/:id')
  async updateAsset(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.fleetService.updateAsset(id, body);
  }

  @Get('maintenance-orders')
  async getMaintenanceOrders() {
    return this.fleetService.getMaintenanceOrders();
  }

  @Post('maintenance-orders')
  async createMaintenanceOrder(
    @Body() body: {
      orderNumber?: string;
      assetId: string;
      type: MaintenanceType;
      priority?: string;
      description: string;
      scheduledDate: Date;
      cost?: number;
      technician?: string;
      immediateImmobilization?: boolean;
    },
  ) {
    return this.fleetService.createMaintenanceOrder(body);
  }

  @Patch('maintenance-orders/:id/status')
  async updateMaintenanceOrderStatus(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.fleetService.updateMaintenanceOrderStatus(id, body);
  }

  @Patch('maintenance-orders/:id')
  async updateMaintenanceOrder(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.fleetService.updateMaintenanceOrder(id, body);
  }
}
