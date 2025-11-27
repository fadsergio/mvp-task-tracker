import { Injectable } from '@nestjs/common';
import { BillingProvider, Customer, Subscription, WebhookEvent } from './billing.interface';

@Injectable()
export class CloudPaymentsAdapter implements BillingProvider {
    async createCustomer(email: string, name: string): Promise<Customer> {
        console.log(`[CloudPayments Mock] Creating customer: ${email}`);
        return {
            id: `cp_${Date.now()}`,
            email,
            name,
        };
    }

    async createSubscription(customerId: string, planId: string): Promise<Subscription> {
        console.log(`[CloudPayments Mock] Creating subscription for customer: ${customerId}, plan: ${planId}`);
        return {
            id: `sub_${Date.now()}`,
            customerId,
            planId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        console.log(`[CloudPayments Mock] Cancelling subscription: ${subscriptionId}`);
    }

    async handleWebhook(payload: any): Promise<WebhookEvent> {
        console.log(`[CloudPayments Mock] Handling webhook:`, payload);
        return {
            type: payload.type || 'payment.succeeded',
            data: payload,
        };
    }
}
