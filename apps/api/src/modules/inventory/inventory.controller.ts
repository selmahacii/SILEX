import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload } from '@silex/shared';
import { ReceiveGoodsDto, IssueMaterialToProjectDto } from '@silex/contracts';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
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

  @Post('receive-goods')
  async receiveGoods(
    @Body() body: ReceiveGoodsDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.receiveGoods(body, user);
  }

  @Post('issue-to-project')
  async issueMaterialToProject(
    @Body() body: IssueMaterialToProjectDto,
    @CurrentUser() user: UserSessionPayload,
  ) {
    return this.inventoryService.issueMaterialToProject(body, user);
  }
}
