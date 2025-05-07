"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, ShoppingCart, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  id: string
  name: string
  price: number
  image: string
  category: string
  rating: number
  discount?: number
  isNew?: boolean
  slug?: string
}

export default function ProductCard({
  id,
  name,
  price,
  image,
  category,
  rating,
  discount,
  isNew = false,
  slug,
}: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false)

  const formattedPrice = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price)

  const discountedPrice = discount
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(price * (1 - discount / 100))
    : null

  return (
    <div className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-200">
      <div className="relative">
        {/* Product image */}
        <Link href={`/products/${slug || id}`} className="block relative aspect-square overflow-hidden">
          <img
            src={image || "/placeholder.svg"}
            alt={name}
            className="object-cover w-full h-full transition-transform group-hover:scale-105"
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          {isNew && <Badge className="bg-blue-600 hover:bg-blue-700">New</Badge>}
          {discount && <Badge className="bg-burgundy-600 hover:bg-burgundy-700">{discount}% Off</Badge>}
        </div>

        {/* Wishlist button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full h-8 w-8"
          onClick={() => setIsWishlisted(!isWishlisted)}
        >
          <Heart className={cn("h-5 w-5", isWishlisted ? "fill-burgundy-600 text-burgundy-600" : "text-gray-500")} />
          <span className="sr-only">Add to wishlist</span>
        </Button>
      </div>

      {/* Product info */}
      <div className="p-4">
        <div className="mb-1">
          <span className="text-sm text-gray-500">{category}</span>
        </div>
        <Link href={`/products/${slug || id}`} className="block">
          <h3 className="font-medium text-gray-900 mb-1 hover:text-burgundy-600 transition-colors">{name}</h3>
        </Link>
        <div className="flex items-center mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={cn("h-4 w-4", i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
              />
            ))}
          </div>
          <span className="text-sm text-gray-500 ml-1">{rating}</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            {discount ? (
              <div className="flex items-center gap-2">
                <span className="font-semibold text-burgundy-600">{discountedPrice}</span>
                <span className="text-sm text-gray-500 line-through">{formattedPrice}</span>
              </div>
            ) : (
              <span className="font-semibold">{formattedPrice}</span>
            )}
          </div>
          <Button size="sm" className="bg-burgundy-600 hover:bg-burgundy-700">
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
