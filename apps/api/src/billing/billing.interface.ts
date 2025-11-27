export interface Customer {
    id: string;
    email: string;
    name: string;
}

export interface Subscription {
    id: string;
    customerId: string;
    planId: string;
    status: 'active' | 'cancelled' | 'past_due';
    currentPeriodEnd: Date;
}

export interface WebhookEvent {
    type: string;
    data: any;
}

export interface BillingProvider {
    createCustomer(email: string, name: string): Promise<Customer>;
    createSubscription(customerId: string, planId: string): Promise<Subscription>;
    cancelSubscription(subscriptionId: string): Promise<void>;
    handleWebhook(payload: any): Promise<WebhookEvent>;
}

export class MockBillingProvider implements BillingProvider {
    async createCustomer(email: string, name: string): Promise<Customer> {
        console.log(`[MockBilling] Creating customer: ${email}`);
        return {
            id: 'cus_mock_123',
            email,
            name,
        };
    }

    async createSubscription(customerId: string, planId: string): Promise<Subscription> {
        console.log(`[MockBilling] Creating subscription for ${customerId} on plan ${planId}`);
        return {
            id: 'sub_mock_456',
            customerId,
            planId,
            status: 'active',
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
    }

    async cancelSubscription(subscriptionId: string): Promise<void> {
        console.log(`[MockBilling] Cancelling subscription ${subscriptionId}`);
    }

    async handleWebhook(payload: any): Promise<WebhookEvent> {
        console.log(`[MockBilling] Handling webhook:`, payload);
        return {
            type: payload.type || 'unknown',
            data: payload,
        };
    }
}

