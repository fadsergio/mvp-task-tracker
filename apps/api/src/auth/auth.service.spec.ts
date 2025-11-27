import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let usersService: UsersService;
    let jwtService: JwtService;

    const mockUsersService = {
        findOne: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        findById: jest.fn(),
    };

    const mockJwtService = {
        signAsync: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UsersService,
                    useValue: mockUsersService,
                },
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        usersService = module.get<UsersService>(UsersService);
        jwtService = module.get<JwtService>(JwtService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateUser', () => {
        it('should return user data if validation is successful', async () => {
            const user = {
                email: 'test@example.com',
                password: 'hashedPassword',
                id: '1',
                name: 'Test User',
            };
            mockUsersService.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toEqual({ email: 'test@example.com', id: '1', name: 'Test User' });
        });

        it('should return null if validation fails', async () => {
            mockUsersService.findOne.mockResolvedValue(null);
            const result = await service.validateUser('test@example.com', 'password');
            expect(result).toBeNull();
        });
    });

    describe('login', () => {
        it('should return tokens', async () => {
            const user = { id: '1', email: 'test@example.com', tenantId: 'tenant1' };
            mockJwtService.signAsync.mockResolvedValue('token');
            mockUsersService.update.mockResolvedValue(user);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');

            const result = await service.login(user);
            expect(result).toEqual({
                access_token: 'token',
                refresh_token: 'token',
            });
            expect(usersService.update).toHaveBeenCalled();
        });
    });

    describe('register', () => {
        it('should create user and return tokens', async () => {
            const userDto = { email: 'new@example.com', password: 'password' };
            const createdUser = { id: '2', ...userDto, tenantId: 'tenant1' };

            mockUsersService.create.mockResolvedValue(createdUser);
            mockJwtService.signAsync.mockResolvedValue('token');
            mockUsersService.update.mockResolvedValue(createdUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue('hashedToken');

            const result = await service.register(userDto);
            expect(result).toEqual({
                access_token: 'token',
                refresh_token: 'token',
            });
            expect(usersService.create).toHaveBeenCalledWith(userDto);
        });
    });
});
