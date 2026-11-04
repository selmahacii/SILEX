import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserSessionPayload } from '@silex/shared';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async listUsers() {
    return this.usersService.listUsers();
  }

  @Post('reset-demo')
  async resetDemoData(@CurrentUser() user: UserSessionPayload) {
    return this.usersService.resetDemoData(user);
  }
}
