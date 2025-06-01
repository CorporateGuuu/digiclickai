/**
 * Pricing Plans API Endpoint
 * Provides pricing plan data for the Pricing page
 */

// Sample pricing data - in production, this would come from a database or Stripe
const pricingPlans = [
  {
    id: 1,
    title: "Starter AI",
    price: "$999",
    monthlyPrice: "$999",
    yearlyPrice: "$9,990",
    originalYearlyPrice: "$11,988",
    description: "Perfect for small businesses looking to integrate AI into their digital presence.",
    features: [
      "AI-Powered Website Design",
      "Basic Automation Setup",
      "5 AI Models Integration",
      "Email Support",
      "1 Month Free Updates",
      "Basic Analytics Dashboard",
      "Mobile Responsive Design",
      "SEO Optimization",
      "SSL Certificate",
      "Basic Chatbot Integration"
    ],
    popular: false,
    buttonText: "Get Started",
    color: "#00d4ff",
    stripePriceId: "price_starter_monthly",
    stripeYearlyPriceId: "price_starter_yearly",
    category: "basic",
    maxProjects: 3,
    maxUsers: 5,
    support: "Email",
    setupTime: "1-2 weeks"
  },
  {
    id: 2,
    title: "Pro AI",
    price: "$1,999",
    monthlyPrice: "$1,999",
    yearlyPrice: "$19,990",
    originalYearlyPrice: "$23,988",
    description: "Ideal for growing companies ready to scale with advanced AI automation.",
    features: [
      "Everything in Starter AI",
      "Advanced Automation Workflows",
      "15 AI Models Integration",
      "Priority Support",
      "3 Months Free Updates",
      "Advanced Analytics & Insights",
      "Custom AI Chatbot",
      "API Integration",
      "Performance Monitoring",
      "A/B Testing Tools",
      "Multi-language Support",
      "Custom Integrations"
    ],
    popular: true,
    buttonText: "Most Popular",
    color: "#7b2cbf",
    stripePriceId: "price_pro_monthly",
    stripeYearlyPriceId: "price_pro_yearly",
    category: "professional",
    maxProjects: 10,
    maxUsers: 25,
    support: "Priority",
    setupTime: "2-3 weeks"
  },
  {
    id: 3,
    title: "Enterprise AI",
    price: "Contact Us",
    monthlyPrice: "Contact Us",
    yearlyPrice: "Contact Us",
    description: "Custom solutions for large enterprises with complex AI requirements.",
    features: [
      "Everything in Pro AI",
      "Unlimited AI Models",
      "Custom AI Development",
      "Dedicated Account Manager",
      "24/7 Premium Support",
      "Unlimited Updates",
      "White-label Solutions",
      "Advanced Security Features",
      "Custom Integrations",
      "Training & Consultation",
      "SLA Guarantee",
      "Multi-tenant Architecture",
      "On-premise Deployment",
      "Custom Compliance"
    ],
    popular: false,
    buttonText: "Contact Sales",
    color: "#ff6b6b",
    stripePriceId: null,
    stripeYearlyPriceId: null,
    category: "enterprise",
    maxProjects: "Unlimited",
    maxUsers: "Unlimited",
    support: "Dedicated",
    setupTime: "4-6 weeks"
  }
];

// Add-on services
const addOnServices = [
  {
    id: "addon_1",
    name: "Additional AI Model",
    description: "Add extra AI models to your plan",
    monthlyPrice: 99,
    yearlyPrice: 990,
    stripePriceId: "price_addon_ai_model"
  },
  {
    id: "addon_2",
    name: "Premium Support",
    description: "Upgrade to 24/7 premium support",
    monthlyPrice: 199,
    yearlyPrice: 1990,
    stripePriceId: "price_addon_premium_support"
  },
  {
    id: "addon_3",
    name: "Custom Integration",
    description: "One-time custom integration setup",
    oneTimePrice: 2999,
    stripePriceId: "price_addon_custom_integration"
  }
];

export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case 'GET':
        return handleGetPricing(req, res);
      default:
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({
          success: false,
          error: 'Method not allowed',
          message: `Method ${req.method} not allowed`
        });
    }
  } catch (error) {
    console.error('Pricing API Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred'
    });
  }
}

/**
 * Handle GET request for pricing plans
 */
function handleGetPricing(req, res) {
  const { 
    category,
    includeAddons = false,
    currency = 'USD'
  } = req.query;

  try {
    let filteredPlans = [...pricingPlans];

    // Filter by category if specified
    if (category) {
      filteredPlans = filteredPlans.filter(plan => 
        plan.category === category.toLowerCase()
      );
    }

    // Calculate savings for yearly plans
    const plansWithSavings = filteredPlans.map(plan => {
      if (plan.monthlyPrice !== 'Contact Us' && plan.yearlyPrice !== 'Contact Us') {
        const monthlyAmount = parseInt(plan.monthlyPrice.replace(/[^0-9]/g, ''));
        const yearlyAmount = parseInt(plan.yearlyPrice.replace(/[^0-9]/g, ''));
        const originalYearlyAmount = monthlyAmount * 12;
        const savings = originalYearlyAmount - yearlyAmount;
        const savingsPercentage = Math.round((savings / originalYearlyAmount) * 100);

        return {
          ...plan,
          savings: {
            amount: savings,
            percentage: savingsPercentage,
            originalYearlyPrice: `$${originalYearlyAmount.toLocaleString()}`
          }
        };
      }
      return plan;
    });

    // Response data
    const responseData = {
      items: plansWithSavings,
      currency,
      lastUpdated: new Date().toISOString()
    };

    // Include add-ons if requested
    if (includeAddons === 'true') {
      responseData.addOns = addOnServices;
    }

    return res.status(200).json({
      success: true,
      data: responseData,
      message: `Retrieved ${plansWithSavings.length} pricing plans`
    });

  } catch (error) {
    console.error('Error fetching pricing plans:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch pricing plans',
      message: error.message
    });
  }
}

/**
 * Get pricing plan by ID
 */
export function getPricingPlanById(id) {
  return pricingPlans.find(plan => plan.id === parseInt(id));
}

/**
 * Get pricing plans by category
 */
export function getPricingPlansByCategory(category) {
  return pricingPlans.filter(plan => 
    plan.category.toLowerCase() === category.toLowerCase()
  );
}

/**
 * Calculate pricing with discounts
 */
export function calculatePricing(planId, billingCycle = 'monthly', discountCode = null) {
  const plan = getPricingPlanById(planId);
  if (!plan) return null;

  let price = billingCycle === 'yearly' ? plan.yearlyPrice : plan.monthlyPrice;
  let discount = 0;

  // Apply discount codes
  if (discountCode) {
    const discounts = {
      'WELCOME10': 0.1,
      'SAVE20': 0.2,
      'ENTERPRISE50': 0.5
    };
    
    if (discounts[discountCode.toUpperCase()]) {
      discount = discounts[discountCode.toUpperCase()];
    }
  }

  const numericPrice = parseInt(price.replace(/[^0-9]/g, ''));
  const discountAmount = numericPrice * discount;
  const finalPrice = numericPrice - discountAmount;

  return {
    originalPrice: numericPrice,
    discountAmount,
    finalPrice,
    discountPercentage: discount * 100,
    currency: 'USD',
    billingCycle
  };
}

/**
 * Get comparison data for plans
 */
export function getPlanComparison() {
  const features = [
    'AI-Powered Website Design',
    'Automation Setup',
    'AI Models Integration',
    'Support Level',
    'Free Updates',
    'Analytics Dashboard',
    'Custom Chatbot',
    'API Integration',
    'Performance Monitoring',
    'A/B Testing',
    'Custom Development',
    'Dedicated Manager',
    'SLA Guarantee'
  ];

  return {
    features,
    plans: pricingPlans.map(plan => ({
      id: plan.id,
      title: plan.title,
      price: plan.price,
      features: plan.features
    }))
  };
}
