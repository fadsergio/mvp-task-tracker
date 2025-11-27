import { Test, TestingModule } from '@nestjs/testing';
import { ReportsService } from './reports.service';
import { PRISMA_SERVICE } from '../prisma/prisma.module';

describe('ReportsService', () => {
    let service: ReportsService;

    const mockPrismaService = {
        timeEntry: {
            findMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ReportsService,
                {
                    provide: PRISMA_SERVICE,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ReportsService>(ReportsService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTimeReport', () => {
        const mockTimeEntries = [
            {
                id: '1',
                durationHours: 2,
                user: { name: 'User 1' },
                task: { client: { name: 'Client A' } },
            },
            {
                id: '2',
                durationHours: 3,
                user: { name: 'User 1' },
                task: { client: { name: 'Client B' } },
            },
        ];

        it('should return raw entries if no grouping is specified', async () => {
            mockPrismaService.timeEntry.findMany.mockResolvedValue(mockTimeEntries);
            const result = await service.generateTimeReport({});
            expect(result).toEqual(mockTimeEntries);
        });

        it('should group by client', async () => {
            mockPrismaService.timeEntry.findMany.mockResolvedValue(mockTimeEntries);
            const result = await service.generateTimeReport({ groupBy: 'client' });
            expect(result).toHaveLength(2);
            expect(result[0].client).toBeDefined();
            expect(result[0].totalHours).toBeDefined();
        });

        it('should group by user', async () => {
            mockPrismaService.timeEntry.findMany.mockResolvedValue(mockTimeEntries);
            const result = await service.generateTimeReport({ groupBy: 'user' });
            expect(result).toHaveLength(1);
            expect(result[0].user).toBe('User 1');
            expect(result[0].totalHours).toBe(5);
        });
    });

    describe('convertToCSV', () => {
        it('should convert data to CSV string', () => {
            const data = [
                { name: 'Test', value: 123 },
                { name: 'Test 2', value: 456 },
            ];
            const csv = service.convertToCSV(data);
            expect(csv).toContain('name,value');
            expect(csv).toContain('Test,123');
            expect(csv).toContain('Test 2,456');
        });

        it('should return "No data" for empty array', () => {
            expect(service.convertToCSV([])).toBe('No data');
        });
    });
});
