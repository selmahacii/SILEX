import { Controller, Get, Post, Patch, Param, Body, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { SystemRole, UserSessionPayload } from '@silex/shared';
import { CreateUserDto } from '@silex/contracts';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @Roles(SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL, SystemRole.RESPONSABLE_RH)
  async listUsers(
    @CurrentUser() user: UserSessionPayload,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page, 10) || 1) : 1;
    const limitNum = limit ? Math.min(100, Math.max(1, parseInt(limit, 10) || 50)) : 50;
    return this.usersService.listUsers(user, pageNum, limitNum);
  }

  @Post()
  @Roles(SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL)
  async createUser(
    @CurrentUser() user: UserSessionPayload,
    @Body() body: CreateUserDto,
  ) {
    return this.usersService.createUser(body, user);
  }

  @Patch(':id')
  @Roles(SystemRole.ADMINISTRATEUR, SystemRole.DIRECTEUR_GENERAL)
  async updateUser(
    @Param('id') id: string,
    @CurrentUser() user: UserSessionPayload,
    @Body() body: any,
  ) {
    return this.usersService.updateUser(id, body, user);
  }

  @Post('reset-demo')
  @Roles(SystemRole.ADMINISTRATEUR)
  async resetDemoData(@CurrentUser() user: UserSessionPayload) {
    return this.usersService.resetDemoData(user);
  }
}
