import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Initialize Stripe on the client side
let stripePromise;
export const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');
  }
  return stripePromise;
};

// Initialize Stripe on the server side with error handling
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16', // Use the latest API version
    });
  } else {
    // Create a mock Stripe instance for development
    console.warn('STRIPE_SECRET_KEY not found. Using mock Stripe instance.');
    stripe = {
      checkout: {
        sessions: {
          create: async () => ({
            id: 'mock_session_id',
            url: '/checkout/mock-session',
          }),
        },
      },
      webhooks: {
        constructEvent: () => ({ type: 'mock.event' }),
      },
    };
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error);
  // Provide a mock implementation
  stripe = {
    checkout: {
      sessions: {
        create: async () => ({
          id: 'mock_session_id',
          url: '/checkout/mock-session',
        }),
      },
    },
    webhooks: {
      constructEvent: () => ({ type: 'mock.event' }),
    },
  };
}

export default stripe;
