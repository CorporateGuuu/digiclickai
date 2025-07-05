/**
 * Chatbot Test Cases
 * 
 * This file contains test cases for the chatbot to ensure it provides accurate information.
 * Each test case includes a user query and the expected response.
 */

const testCases = [
  {
    category: 'Company Information',
    tests: [
      {
        query: "What are your business hours?",
        expectedResponse: "Our customer service team is available Monday-Friday from 9 AM to 10 PM EST. Our physical location in Vienna, VA is open Monday-Friday from 10 AM to 7 PM EST."
      },
      {
        query: "Where are you located?",
        expectedResponse: "Our address is Vienna, VA 22182. Our customer service team can be reached at +1 (240) 351-0511 or by email at support@mdtstech.store."
      },
      {
        query: "What is your phone number?",
        expectedResponse: "+1 (240) 351-0511"
      },
      {
        query: "What is your email address?",
        expectedResponse: "support@mdtstech.store"
      }
    ]
  },
  {
    category: 'Shipping Information',
    tests: [
      {
        query: "Do you offer free shipping?",
        expectedResponse: "Yes, we offer free shipping on orders over $1000."
      },
      {
        query: "How long does shipping take?",
        expectedResponse: "Standard Shipping takes 3-5 business days. Express Shipping takes 1-2 business days."
      },
      {
        query: "Do you ship internationally?",
        expectedResponse: "Yes, we ship to most countries worldwide. International shipping typically takes 7-14 business days."
      }
    ]
  },
  {
    category: 'Product Information',
    tests: [
      {
        query: "Do you sell iPhone parts?",
        expectedResponse: "Yes, we sell a wide range of iPhone parts including screens, batteries, cameras, and other components for all iPhone models."
      },
      {
        query: "Do you have Samsung parts?",
        expectedResponse: "Yes, we carry Samsung parts including screens, batteries, and other components for Galaxy S and Note series phones."
      },
      {
        query: "Do you sell repair tools?",
        expectedResponse: "Yes, we offer professional repair tools including precision screwdriver sets, pry tools, heat guns, and complete repair kits."
      }
    ]
  },
  {
    category: 'Return Policy',
    tests: [
      {
        query: "What is your return policy?",
        expectedResponse: "Our return policy allows returns within 30 days of delivery for most items. Items must be in original condition with all packaging and accessories."
      },
      {
        query: "How do I return an item?",
        expectedResponse: "To initiate a return, please sign in to your account at mdtstech.store/account/orders and select the order you wish to return. Then click the 'Return Items' button and follow the instructions."
      }
    ]
  },
  {
    category: 'LCD Buyback Program',
    tests: [
      {
        query: "Tell me about your LCD buyback program",
        expectedResponse: "Our LCD Buyback Program allows you to sell your old LCD screens to us for cash. We accept screens from iPhones, Samsung phones, iPads, and other devices in various conditions. Visit mdtstech.store/lcd-buyback for more information."
      },
      {
        query: "How much do you pay for LCD screens?",
        expectedResponse: "The value of LCD screens depends on the device model, condition, and current market demand. We offer competitive prices in the industry. You can get an instant quote by filling out the form at mdtstech.store/lcd-buyback."
      }
    ]
  },
  {
    category: 'Apple Parts Program',
    tests: [
      {
        query: "What is the Apple Parts Program?",
        expectedResponse: "Our Genuine Apple Parts Program (GAPP) provides access to authentic Apple parts for repairs. These parts are sourced directly from Apple and come with full warranty support. Visit mdtstech.store/gapp for more information."
      }
    ]
  },
  {
    category: 'Payment Methods',
    tests: [
      {
        query: "What payment methods do you accept?",
        expectedResponse: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), PayPal, Apple Pay, and Google Pay. For business orders, we also accept purchase orders and bank transfers."
      },
      {
        query: "Do you accept cryptocurrency?",
        expectedResponse: "Yes, we accept Bitcoin and several other cryptocurrencies as payment methods."
      }
    ]
  }
];

/**
 * Run tests against the chatbot service
 * @param {Function} processMessage - The chatbot's message processing function
 * @returns {Object} - Test results
 */
export async function runChatbotTests(processMessage) {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  for (const category of testCases) {
    for (const test of category.tests) {
      results.total++;
      
      try {
        const response = await processMessage(test.query, 'test-conversation-id', 'test-user-id');
        
        // Check if response contains the expected text (partial match)
        const passed = response.toLowerCase().includes(test.expectedResponse.toLowerCase());
        
        if (passed) {
          results.passed++;
        } else {
          results.failed++;
        }
        
        results.details.push({
          category: category.category,
          query: test.query,
          expectedResponse: test.expectedResponse,
          actualResponse: response,
          passed
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          category: category.category,
          query: test.query,
          expectedResponse: test.expectedResponse,
          error: error.message,
          passed: false
        });
      }
    }
  }
  
  return results;
}

export default testCases;
