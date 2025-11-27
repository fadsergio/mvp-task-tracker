import { Injectable } from '@nestjs/common';
import { BillingProvider, Customer, Subscription, WebhookEvent } from './billing.interface';

@Injectable()
export class YooKassaAdapter implements BillingProvider {
    async createCustomer(email: string, name: string): Promise<Customer> {
        console.log(`[YooKassa Mock] Creating customer: ${email}`);
        return {
            id: `yk_${Date.now()}`,
            email,
            name,
        };
    }

    async createSubscription(customerId: string, planId: string): Promise<Subscription> {
        console.log(`[YooKassa Mock] Creating subscription for customer: ${customerId}, plan: ${planId}`);
        return {
            id: `sub_${Date.now()}`,
            customerId,
            planId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        console.log(`[YooKassa Mock] Cancelling subscription: ${subscriptionId}`);
    }

    async handleWebhook(payload: any): Promise<WebhookEvent> {
        console.log(`[YooKassa Mock] Handling webhook:`, payload);
        return {
            type: payload.event || 'payment.succeeded',
            data: payload,
        };
    }
}
