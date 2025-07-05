# Manual Testing Instructions

This document provides instructions for manually testing the fixes we've made to the cart page, privacy page, and landing page.

## Prerequisites

1. Make sure the development server is running: `npm run dev -- -p 3004`
2. Open your browser to `http://localhost:3004`

## Cart Page Testing

1. **Basic Layout Testing**
   - Navigate to the cart page by clicking on the cart icon in the header
   - Verify that the cart page has a proper layout with items on the left and summary on the right
   - Verify that the cart items are displayed in a table with columns for Product, Price, Quantity, Total, and Actions
   - Verify that the cart summary shows the subtotal, shipping, and total

2. **Quantity Control Testing**
   - Add a product to the cart if the cart is empty
   - Click the + button to increase the quantity
   - Verify that the quantity increases and the total price updates accordingly
   - Click the - button to decrease the quantity
   - Verify that the quantity decreases and the total price updates accordingly
   - Verify that the - button is disabled when the quantity is 1

3. **Remove Item Testing**
   - Add a product to the cart if the cart is empty
   - Click the Remove button
   - Verify that the item is removed from the cart
   - Verify that the cart shows the empty cart message when all items are removed

4. **Checkout Testing**
   - Add a product to the cart if the cart is empty
   - Click the Proceed to Checkout button
   - Verify that you are redirected to the checkout page

5. **CSS Styling Testing**
   - Verify that the cart container has the correct CSS class: `cart_container`
   - Verify that the cart items container has the correct CSS class: `cart_items`
   - Verify that the cart summary has the correct CSS class: `cart_summary`
   - Verify that the quantity control has the correct CSS class: `quantity_control`
   - Verify that all elements are styled correctly according to the design

## Privacy Page Testing

1. **Header and Footer Testing**
   - Navigate to the privacy page by clicking on the Privacy Policy link in the footer
   - Verify that the page has a header with navigation links
   - Verify that the page has a footer with links and copyright information

2. **Content Testing**
   - Verify that the privacy policy content is displayed correctly
   - Verify that all sections are present: Information We Collect, How We Use Your Information, etc.
   - Verify that the contact information is displayed correctly

3. **Layout Testing**
   - Verify that the page has a proper layout with the content in the center
   - Verify that the content is readable and properly formatted

## Landing Page Testing

1. **Featured Products Testing**
   - Navigate to the landing page
   - Verify that the featured products section is displayed
   - Verify that each product shows only one price value (not two)
   - Verify that the price shown is the higher value (e.g., $82.34)

2. **Navigation Testing**
   - Verify that clicking on a product card navigates to the product detail page
   - Verify that clicking on the View All Products link navigates to the products page

3. **Layout Testing**
   - Verify that the landing page has a proper layout with sections for hero, featured categories, featured products, etc.
   - Verify that all elements are styled correctly according to the design

## CSS Integration Testing

1. **CSS Files Testing**
   - Open the browser developer tools
   - Go to the Network tab
   - Reload the page
   - Verify that the following CSS files are loaded:
     - `/css/global.css`
     - `/css/components.css`
     - `/css/home.css`
     - `/css/animations.css`

2. **CSS Styling Testing**
   - Verify that the global styles are applied correctly (fonts, colors, etc.)
   - Verify that the component styles are applied correctly (header, footer, product cards, etc.)
   - Verify that the home page styles are applied correctly (hero section, featured products, etc.)
   - Verify that the animations are working correctly (hover effects, transitions, etc.)

## Cross-Browser Testing

1. **Desktop Browsers**
   - Test the fixes in Chrome, Firefox, Safari, and Edge
   - Verify that the layout and functionality are consistent across all browsers

2. **Mobile Browsers**
   - Test the fixes in Chrome and Safari on mobile devices
   - Verify that the layout is responsive and adapts to different screen sizes
   - Verify that the functionality works correctly on touch devices

## Regression Testing

1. **Other Pages Testing**
   - Navigate to other pages of the website (products, about, contact, etc.)
   - Verify that the fixes haven't broken any other pages
   - Verify that the header and footer are consistent across all pages

2. **Functionality Testing**
   - Test other functionality of the website (search, filtering, sorting, etc.)
   - Verify that the fixes haven't broken any other functionality

## Performance Testing

1. **Page Load Testing**
   - Measure the page load time before and after the fixes
   - Verify that the fixes haven't negatively impacted the performance

2. **Network Requests Testing**
   - Open the browser developer tools
   - Go to the Network tab
   - Reload the page
   - Verify that there are no unnecessary network requests
   - Verify that the CSS files are loaded efficiently
