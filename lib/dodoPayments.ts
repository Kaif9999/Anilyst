class DodoPayments {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DODO_PAYMENTS_API_KEY!;
    this.baseUrl = process.env.NODE_ENV === 'production' 
      ? 'https://live.dodopayments.com'
      : 'https://test.dodopayments.com';
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Dodo Payments API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Verify subscription status
  async verifySubscription(subscriptionId: string) {
    return this.request(`/api/v1/subscriptions/${subscriptionId}`);
  }

  // Cancel subscription
  async cancelSubscription(subscriptionId: string) {
    return this.request(`/api/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
    });
  }

  // Create payment link
  async createPaymentLink(data: {
    productId: string;
    customerEmail?: string;
    billingCycle?: 'monthly' | 'yearly';
    redirectUrl: string;
  }) {
    return this.request('/api/v1/payment-links', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const dodoPayments = new DodoPayments(); 