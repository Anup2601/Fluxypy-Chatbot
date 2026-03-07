import {
  Controller, Post, Get,
  Body, UseGuards, HttpCode,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { Public } from './decorators/public.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(200)
  verifyOtp(@Body() body: { email: string; otp: string }) {
    return this.authService.verifyOtp(body);
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(200)
  resendOtp(@Body() body: { email: string }) {
    return this.authService.resendOtp(body);
  }

  @Public()
  @Post('login')
  @HttpCode(200)
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refresh(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  logout() {
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}