import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { ContextService } from '../providers/context.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        ContextService.run(() => {
            const user = req.user as any;
            const tenantIdFromHeader = req.headers['x-tenant-id'];
            let tenantId: string | undefined;

            if (user && user.tenantId) {
                tenantId = user.tenantId;
            } else if (tenantIdFromHeader) {
                tenantId = tenantIdFromHeader as string;
            }

            if (tenantId) {
                ContextService.set('tenantId', tenantId);
                (req as any)['tenantId'] = tenantId; // Keep for backward compatibility if needed
            }

            // Note: We don't throw here because some endpoints might be public or tenant-agnostic (like login)
            // Guards will handle strict validation where needed.

            next();
        });
    }
}
