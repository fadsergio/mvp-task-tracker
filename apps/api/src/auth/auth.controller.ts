import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() body: any) {
        return this.authService.login(body);
    }

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('refresh')
    async refresh(@Body() body: { userId: string; refreshToken: string }) {
        return this.authService.refreshTokens(body.userId, body.refreshToken);
    }

    @Post('logout')
    async logout(@Body() body: { userId: string }) {
        return this.authService.logout(body.userId);
    }
}
