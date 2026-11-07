import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import { ReceiveGoodsDto, IssueMaterialToProjectDto } from '@silex/contracts';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(private inventoryService: InventoryService) {}

  @Get('items')
  async getItems(@Query('categoryId') categoryId?: string) {
    return this.inventoryService.getItems(categoryId);
  }

  @Get('warehouses')
  async getWarehouses() {
    return this.inventoryService.getWarehouses();
  }

  @Get('movements')
  async getStockMovements(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.inventoryService.getStockMovements({ warehouseId, itemId, projectId });
  }

  @Get('stock-movements')
  async getStockMovementsAlias(
    @Query('warehouseId') warehouseId?: string,
    @Query('itemId') itemId?: string,
    @Query('projectId') projectId?: string,
  ) {
    return this.inventoryService.getStockMovements({ warehouseId, itemId, projectId });
  }

  @Post('receive-goods')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async receiveGoods(
    @Body() body: ReceiveGoodsDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.receiveGoods(body, user);
  }

  @Post('issue-to-project')
  @Roles(
    SystemRole.RESPONSABLE_MAGASIN,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
    SystemRole.RESPONSABLE_PROJET,
  )
  async issueMaterialToProject(
    @Body() body: IssueMaterialToProjectDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.issueMaterialToProject(body, user);
  }

  @Post('items')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async createItem(
    @Body() body: {
      code?: string;
      name: string;
      description: string;
      categoryId?: string;
      unit: string;
      minStockLevel?: number;
      currentStock?: number;
      unitCost?: number;
    },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.createItem(body, user);
  }

  @Patch('items/:id')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async updateItem(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.updateItem(id, body, user);
  }

  @Post('warehouses')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async createWarehouse(
    @Body() body: {
      code?: string;
      name: string;
      location: string;
      managerName: string;
    },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.createWarehouse(body, user);
  }

  @Patch('warehouses/:id')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async updateWarehouse(
    @Param('id') id: string,
    @Body() body: any,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.updateWarehouse(id, body, user);
  }

  @Post('adjust-stock')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async adjustStock(
    @Body() body: {
      warehouseId: string;
      itemId: string;
      newQuantity: number;
      reason: string;
      notes?: string;
    },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.adjustStock(body, user);
  }

  @Post('transfers')
  @Roles(SystemRole.RESPONSABLE_MAGASIN, SystemRole.DIRECTEUR_GENERAL, SystemRole.ADMINISTRATEUR)
  async transferBetweenWarehouses(
    @Body() body: {
      sourceWarehouseId: string;
      destinationWarehouseId: string;
      itemId: string;
      quantity: number;
      driverName?: string;
      vehicleMatricule?: string;
      notes?: string;
    },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.transferBetweenWarehouses(body, user);
  }

  @Post('returns')
  @Roles(
    SystemRole.RESPONSABLE_MAGASIN,
    SystemRole.DIRECTEUR_GENERAL,
    SystemRole.ADMINISTRATEUR,
    SystemRole.RESPONSABLE_PROJET,
  )
  async returnMaterialFromProject(
    @Body() body: {
      projectId: string;
      warehouseId: string;
      itemId: string;
      quantity: number;
      reason?: string;
      notes?: string;
    },
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.returnMaterialFromProject(body, user);
  }
}
