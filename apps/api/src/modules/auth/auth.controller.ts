import { Controller, Post, Body, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto, DemoSwitchUserRequestDto } from '@silex/contracts';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginRequestDto) {
    return this.authService.login(body.email, body.password);
  }

  @Post('demo-switch')
  async switchDemoRole(@Body() body: DemoSwitchUserRequestDto) {
    return this.authService.switchDemoRole(body.role);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser('userId') userId: string) {
    return this.authService.getMe(userId);
  }
}
