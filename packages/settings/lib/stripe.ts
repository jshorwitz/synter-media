import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

// Client-side Stripe (for frontend components)
export const getStripePublishableKey = () => {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Helper functions
export const formatStripeError = (error: Stripe.StripeError): string => {
  switch (error.code) {
    case 'card_declined':
      return 'Your card was declined. Please try a different payment method.';
    case 'expired_card':
      return 'Your card has expired. Please use a different card.';
    case 'insufficient_funds':
      return 'Insufficient funds on your card. Please use a different payment method.';
    case 'incorrect_cvc':
      return 'Your card\'s security code is incorrect. Please try again.';
    case 'processing_error':
      return 'An error occurred while processing your card. Please try again.';
    default:
      return error.message || 'An unknown payment error occurred.';
  }
};

// Create a payment intent for credit purchases
export const createPaymentIntent = async (
  amount: number, // in cents
  currency: string = 'usd',
  customerId?: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
    metadata: {
      type: 'credit_purchase',
    },
  });
};

// Create or retrieve a Stripe customer
export const createOrRetrieveCustomer = async (
  email: string,
  userId: string
): Promise<Stripe.Customer> => {
  // First try to find existing customer
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  });

  if (customers.data.length > 0) {
    return customers.data[0];
  }

  // Create new customer
  return await stripe.customers.create({
    email,
    metadata: {
      userId,
    },
  });
};

// Attach payment method to customer
export const attachPaymentMethodToCustomer = async (
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> => {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
};

// Set default payment method for customer
export const setDefaultPaymentMethod = async (
  customerId: string,
  paymentMethodId: string
): Promise<Stripe.Customer> => {
  return await stripe.customers.update(customerId, {
    invoice_settings: {
      default_payment_method: paymentMethodId,
    },
  });
};

// Create a setup intent for saving payment methods
export const createSetupIntent = async (
  customerId: string
): Promise<Stripe.SetupIntent> => {
  return await stripe.setupIntents.create({
    customer: customerId,
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

// Process a payment with saved payment method
export const processPaymentWithSavedMethod = async (
  amount: number, // in cents
  paymentMethodId: string,
  customerId: string,
  currency: string = 'usd'
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.create({
    amount,
    currency,
    customer: customerId,
    payment_method: paymentMethodId,
    confirm: true,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
    metadata: {
      type: 'credit_purchase',
    },
  });
};

// Create invoice for manual billing
export const createStripeInvoice = async (
  customerId: string,
  items: Array<{
    description: string;
    quantity: number;
    unitAmount: number; // in cents
  }>
): Promise<Stripe.Invoice> => {
  // First, create invoice items
  for (const item of items) {
    await stripe.invoiceItems.create({
      customer: customerId,
      description: item.description,
      quantity: item.quantity,
      unit_amount: item.unitAmount,
    });
  }

  // Create and finalize the invoice
  const invoice = await stripe.invoices.create({
    customer: customerId,
    auto_advance: true, // Automatically finalize the invoice
  });

  return await stripe.invoices.finalizeInvoice(invoice.id);
};
