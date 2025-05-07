import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Layout from '../components/Layout/Layout';
import { loadStripe } from '@stripe/stripe-js';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_your_key');

// Subscription plans
const plans = [
  {
    id: 'price_basic',
    name: 'Basic',
    description: 'Perfect for small repair shops',
    price: 29.99,
    interval: 'month',
    features: [
      'Access to all basic parts',
      'Standard shipping',
      'Email support',
      '10% discount on tools'
    ]
  },
  {
    id: 'price_pro',
    name: 'Professional',
    description: 'Ideal for growing businesses',
    price: 79.99,
    interval: 'month',
    features: [
      'Access to all parts including premium',
      'Priority shipping',
      'Phone and email support',
      '15% discount on tools',
      'Early access to new products'
    ],
    popular: true
  },
  {
    id: 'price_enterprise',
    name: 'Enterprise',
    description: 'For large repair operations',
    price: 199.99,
    interval: 'month',
    features: [
      'Access to all parts including premium and exclusive',
      'Free expedited shipping',
      'Dedicated account manager',
      '25% discount on tools',
      'Early access to new products',
      'Custom bulk pricing',
      'API access'
    ]
  }
];

function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);
  const [billingInterval, setBillingInterval] = useState('month');
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [manageBillingLoading, setManageBillingLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/subscription');
    }
  }, [status, router]);

  // Fetch subscription data
  useEffect(() => {
    async function fetchSubscription() {
      if (!session?.user?.id) return;

      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('*, prices(*, products(*))')
          .eq('user_id', session.user.id)
          .in('status', ['trialing', 'active'])
          .single();
        
        if (error && error.code !== 'PGRST116') throw error;
        
        setSubscription(data);
      } catch (error) {
        console.error('Error fetching subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    if (session?.user?.id) {
      fetchSubscription();
    } else {
      setLoading(false);
    }
  }, [session]);

  const handleCheckout = async (priceId) => {
    setCheckoutLoading(priceId);
    
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: priceId,
          quantity: 1,
          metadata: {
            userId: session.user.id
          }
        }),
      });
      
      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      const { error } = await stripe.redirectToCheckout({ sessionId });
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleManageBilling = async () => {
    setManageBillingLoading(true);
    
    try {
      const response = await fetch('/api/create-portal-link', {
        method: 'POST',
      });
      
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error creating portal link:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setManageBillingLoading(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <Layout title="Subscription Plans | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
            <p className="ml-4">Loading subscription information...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <Layout title="Subscription Plans | MDTS">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <p>Please sign in to view subscription plans.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Subscription Plans | MDTS">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4">MDTS Subscription Plans</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the perfect plan for your repair business. Unlock premium parts, priority shipping, and exclusive discounts.
          </p>
          
          <div className="flex justify-center mt-8 mb-12">
            <div className="bg-gray-100 p-1 rounded-full">
              <button
                onClick={() => setBillingInterval('month')}
                className={`px-6 py-2 rounded-full ${
                  billingInterval === 'month'
                    ? 'bg-white shadow-md'
                    : 'text-gray-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingInterval('year')}
                className={`px-6 py-2 rounded-full ${
                  billingInterval === 'year'
                    ? 'bg-white shadow-md'
                    : 'text-gray-700'
                }`}
              >
                Yearly <span className="text-green-500 font-semibold">-20%</span>
              </button>
            </div>
          </div>
        </div>
        
        {subscription ? (
          <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your Current Subscription</h2>
              <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                {subscription.status === 'trialing' ? 'Trial' : 'Active'}
              </span>
            </div>
            
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">
                {subscription.prices?.products?.name || 'Subscription Plan'}
              </h3>
              <p className="text-gray-600">
                {subscription.prices?.products?.description || 'Your active subscription plan'}
              </p>
            </div>
            
            <div className="flex justify-between items-center mb-6">
              <div>
                <p className="text-gray-600">
                  <span className="font-semibold">Billing Period:</span>{' '}
                  {subscription.prices?.interval_count === 1 ? 'Monthly' : 'Yearly'}
                </p>
                <p className="text-gray-600">
                  <span className="font-semibold">Next billing date:</span>{' '}
                  {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  ${(subscription.prices?.unit_amount / 100).toFixed(2)}
                  <span className="text-sm text-gray-600 font-normal">
                    /{subscription.prices?.interval}
                  </span>
                </p>
              </div>
            </div>
            
            <button
              onClick={handleManageBilling}
              disabled={manageBillingLoading}
              className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              {manageBillingLoading ? 'Loading...' : 'Manage Billing'}
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden ${
                  plan.popular ? 'ring-2 ring-blue-500 transform scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="bg-blue-500 text-white text-center py-2 font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
                  <p className="text-gray-600 mb-4">{plan.description}</p>
                  
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ${billingInterval === 'month' ? plan.price : (plan.price * 0.8 * 12).toFixed(2)}
                    </span>
                    <span className="text-gray-600">
                      /{billingInterval === 'month' ? 'month' : 'year'}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => handleCheckout(
                      billingInterval === 'month' ? plan.id : `${plan.id}_yearly`
                    )}
                    disabled={checkoutLoading === plan.id}
                    className={`w-full py-3 rounded-lg mb-6 ${
                      plan.popular
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  >
                    {checkoutLoading === plan.id ? 'Loading...' : 'Subscribe'}
                  </button>
                  
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <svg
                          className="h-5 w-5 text-green-500 mr-2 mt-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                          ></path>
                        </svg>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <div className="max-w-3xl mx-auto mt-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What's included in each plan?</h3>
              <p className="text-gray-600">
                Each plan offers different levels of access to our parts catalog, shipping benefits, and support options. The higher-tier plans include additional perks like discounts on tools, early access to new products, and dedicated support.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will take effect at the start of your next billing cycle.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes, all plans come with a 14-day free trial. You can cancel anytime during the trial period and won't be charged.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">How do I cancel my subscription?</h3>
              <p className="text-gray-600">
                You can cancel your subscription at any time through the "Manage Billing" option. Your subscription will remain active until the end of your current billing period.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default SubscriptionPage;
