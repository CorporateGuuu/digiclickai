"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Trash2, ShoppingCart, CreditCard, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: "1",
      name: "Quantum Pro X",
      price: 1299.99,
      image: "/placeholder.svg?height=100&width=100",
      color: "Midnight Black",
      storage: "128GB",
      quantity: 1,
    },
    {
      id: "2",
      name: "Elite Wireless Earbuds",
      price: 249.99,
      image: "/placeholder.svg?height=100&width=100",
      color: "White",
      quantity: 2,
    },
    {
      id: "3",
      name: "PowerMax Charging Dock",
      price: 89.99,
      image: "/placeholder.svg?height=100&width=100",
      color: "Black",
      quantity: 1,
    },
  ])

  const [promoCode, setPromoCode] = useState("")
  const [promoApplied, setPromoApplied] = useState(false)

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return
    setCartItems(cartItems.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item)))
  }

  const removeItem = (id: string) => {
    setCartItems(cartItems.filter((item) => item.id !== id))
  }

  const applyPromoCode = () => {
    if (promoCode.toLowerCase() === "welcome20") {
      setPromoApplied(true)
    }
  }

  const subtotal = cartItems.reduce((total, item) => total + item.price * item.quantity, 0)

  const discount = promoApplied ? subtotal * 0.2 : 0
  const shipping = subtotal > 100 ? 0 : 9.99
  const total = subtotal - discount + shipping

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-burgundy-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">Shopping Cart</span>
        </nav>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Cart</h1>

        {cartItems.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="flex justify-center mb-4">
              <ShoppingCart className="h-16 w-16 text-gray-300" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">Looks like you haven't added any products to your cart yet.</p>
            <Button asChild className="bg-burgundy-600 hover:bg-burgundy-700">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Cart Items ({cartItems.length})</h2>
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex flex-col sm:flex-row gap-4">
                        <div className="w-24 h-24 rounded-md border border-gray-200 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row sm:justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{item.name}</h3>
                              <p className="text-sm text-gray-500">
                                {item.color}
                                {item.storage && ` / ${item.storage}`}
                              </p>
                            </div>
                            <div className="text-right mt-2 sm:mt-0">
                              <p className="font-medium">${item.price.toFixed(2)}</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="px-3 py-1 border-r"
                              >
                                -
                              </button>
                              <span className="px-4 py-1">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 border-l"
                              >
                                +
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-gray-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-lg shadow-sm overflow-hidden sticky top-20">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {promoApplied && (
                      <div className="flex justify-between text-green-600">
                        <span>Discount (20%)</span>
                        <span>-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">{shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total</span>
                      <span className="font-bold text-lg">${total.toFixed(2)}</span>
                    </div>

                    {/* Promo Code */}
                    <div className="pt-4">
                      <p className="text-sm font-medium mb-2">Promo Code</p>
                      <div className="flex gap-2">
                        <Input
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="flex-1"
                          disabled={promoApplied}
                        />
                        <Button
                          onClick={applyPromoCode}
                          disabled={!promoCode || promoApplied}
                          variant={promoApplied ? "outline" : "default"}
                          className={cn(
                            promoApplied ? "text-green-600 border-green-600" : "bg-burgundy-600 hover:bg-burgundy-700",
                          )}
                        >
                          {promoApplied ? "Applied" : "Apply"}
                        </Button>
                      </div>
                      {promoApplied && (
                        <p className="text-xs text-green-600 mt-1">Promo code WELCOME20 applied successfully!</p>
                      )}
                    </div>

                    <Button className="w-full bg-burgundy-600 hover:bg-burgundy-700 mt-6">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Proceed to Checkout
                    </Button>

                    <div className="text-center">
                      <Link
                        href="/products"
                        className="text-sm text-burgundy-600 hover:text-burgundy-700 inline-flex items-center"
                      >
                        Continue Shopping
                        <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

interface CartItem {
  id: string
  name: string
  price: number
  image: string
  color: string
  storage?: string
  quantity: number
}
