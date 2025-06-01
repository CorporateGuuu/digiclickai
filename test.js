//Run these commands to set up a React app:

npx create-react-app mdts-tech
cd mdts-tech
npm install tailwindcss axios
npx tailwindcss init

//Configure tailwind.config.js:
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};

//Add to src/index.css:

@tailwind base;
@tailwind components;
@tailwind utilities;

//2. Main App (src/App.js)
//Replace src/App.js with this:

import React, { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./components/ProductCard";
import Cart from "./components/Cart";

function App() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    // Fetch products from backend
    axios
      .get("http://localhost:5000/api/products")
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">MDTS Tech</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <ProductCard key={product._id} product={product} addToCart={addToCart} />
        ))}
      </div>
      <Cart cart={cart} />
    </div>
  );
}

export default App;


//3. Product Card Component (src/components/ProductCard.js)
//Create this file:

import React from "react";

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="border p-4 rounded shadow hover:shadow-lg">
      <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2" />
      <h3 className="text-lg font-bold">{product.name}</h3>
      <p className="text-gray-600">${product.price}</p>
      <button
        onClick={() => addToCart(product)}
        className="bg-blue-500 text-white px-4 py-2 mt-2 rounded hover:bg-blue-600"
      >
        Add to Cart
      </button>
    </div>
  );
};

export default ProductCard;

//4. Cart Component (src/components/Cart.js)
//Create this file:

import React from "react";

const Cart = ({ cart }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="mt-8 p-4 border rounded">
      <h2 className="text-2xl font-bold">Cart</h2>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
unofficial poll: should i add a cart abandonment popup to my store? - www.reddit.com/r/ecommerce/comments/18e6ji8/unofficial_poll_should_i_add_a_cart_abandonment/
Should I add a cart abandonment popup to my store? : r/ecommerce - www.reddit.com
Content: I run a small ecommerce store and recently learned about cart abandonment popups - those messages that appear when someone’s about to leave the site with items still in their cart. I’ve read they can boost conversions by reminding people what they’re leaving behind, but I’m worried they might annoy customers or feel too pushy. My store’s pretty niche (handmade goods), and I don’t have a huge budget for fancy tools, but I could set up something basic with a free plugin. For those who’ve tried it—did it help recover sales, or did it backfire? Any thoughts or experiences welcome! ... I’d be annoyed if I got a pop up every time I tried to leave a site. I often put stuff in my cart to see the total with shipping or to save it for later while I think about it. A pop up would just make me leave faster. ... I’ve used them on my store and they work well—recovered about 10-15% of abandoned carts. You just have to make it non-intrusive. I set mine to trigger only after 10 seconds of inactivity and offer a small discount (like free shipping). No complaints so far, and it’s been worth it for the extra sales. ... I think it depends on your audience. For handmade goods, your customers might appreciate a gentle nudge if it’s done tastefully—like “Don’t miss out on your unique find!” with a picture of the item. But if it’s too aggressive or pops up instantly, it could turn people off.

Unofficial poll: Should I add a cart abandonment popup to my store? Yes, if it’s subtle and offers value (discount, free shipping, etc.) 11 votes · No, it’s too annoying and might drive customers away 8 votes · Depends—test it and see what your data says 5 votes ... I tested it on my Shopify store. Used a simple exit-intent popup with a 5% off code. Conversion rate went up by about 7%, but I also got a couple emails from customers saying it was “intrusive.” I toned it down (delayed it longer) and the complaints stopped. Test it for a month and track your numbers—data doesn’t lie.

---
        <ul>
          {cart.map((item, index) => (
            <li key={index} className="flex justify-between py-2">
              <span>{item.name}</span>
              <span>${item.price}</span>
            </li>
          ))}
        </ul>
        <p className="font-bold mt-4">Total: ${total.toFixed(2)}</p>
        <button className="bg-green-500 text-white px-4 py-2 mt-4 rounded hover:bg-green-600">
          Checkout
        </button>
      </div>
    );
  };
  
  export default Cart;
  
  //</div>

  //Run the app with npm start to see it at http://localhost:3000.

  