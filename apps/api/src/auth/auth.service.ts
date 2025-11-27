import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, hashedRefreshToken, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const tokens = await this.getTokens(user.id, user.email, user.tenantId);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async register(user: any) {
        const newUser = await this.usersService.create(user);
        const tokens = await this.getTokens(newUser.id, newUser.email, newUser.tenantId);
        await this.updateRefreshToken(newUser.id, tokens.refresh_token);
        return tokens;
    }

    async logout(userId: string) {
        return this.usersService.update(userId, { hashedRefreshToken: null });
    }

    async refreshTokens(userId: string, refreshToken: string) {
        const user = await this.usersService.findById(userId);
        if (!user || !user.hashedRefreshToken) throw new Error('Access Denied');

        const refreshTokenMatches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
        if (!refreshTokenMatches) throw new Error('Access Denied');

        const tokens = await this.getTokens(user.id, user.email, user.tenantId);
        await this.updateRefreshToken(user.id, tokens.refresh_token);
        return tokens;
    }

    async updateRefreshToken(userId: string, refreshToken: string) {
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.usersService.update(userId, { hashedRefreshToken });
    }

    async getTokens(userId: string, email: string, tenantId: string) {
        const [at, rt] = await Promise.all([
            this.jwtService.signAsync(
                { sub: userId, email, tenantId },
                { secret: process.env.JWT_SECRET, expiresIn: '15m' },
            ),
            this.jwtService.signAsync(
                { sub: userId, email, tenantId },
                { secret: process.env.JWT_REFRESH_SECRET, expiresIn: '7d' },
            ),
        ]);

        return {
            access_token: at,
            refresh_token: rt,
        };
    }
}
