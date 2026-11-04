import { Controller, Get, UseGuards } from '@nestjs/common';
import { FleetService } from './fleet.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('fleet')
@UseGuards(JwtAuthGuard)
export class FleetController {
  constructor(private fleetService: FleetService) {}

  @Get('assets')
  async getAssets() {
    return this.fleetService.getAssets();
  }

  @Get('maintenance-orders')
  async getMaintenanceOrders() {
    return this.fleetService.getMaintenanceOrders();
  }
}
