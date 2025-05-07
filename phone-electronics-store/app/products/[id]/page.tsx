"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Star, Minus, Plus, Heart, Share2, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import ProductCard from "@/components/product-card"

export default function ProductPage({ params }: { params: { id: string } }) {
  const [quantity, setQuantity] = useState(1)
  const [selectedColor, setSelectedColor] = useState("Midnight Black")
  const [selectedStorage, setSelectedStorage] = useState("128GB")
  const [isWishlisted, setIsWishlisted] = useState(false)

  // This would normally come from a database or API
  const product = {
    id: params.id,
    name: "Quantum Pro X",
    price: 1299.99,
    rating: 4.8,
    reviewCount: 127,
    description:
      "Experience the future of mobile technology with the Quantum Pro X. Featuring a stunning 6.7-inch OLED display, revolutionary camera system, and all-day battery life, this flagship device redefines what's possible in a smartphone.",
    features: [
      "6.7-inch Super Retina XDR OLED display",
      "Triple camera system (48MP main, 12MP ultra-wide, 12MP telephoto)",
      "A16 Bionic chip with 6-core CPU and 5-core GPU",
      "Face ID for secure authentication",
      "Up to 29 hours of video playback",
      "Ceramic Shield front, textured matte glass back and stainless steel design",
      "Water resistant to a depth of 6 meters for up to 30 minutes",
      "5G capable for ultra-fast downloads and high-quality streaming",
    ],
    colors: [
      { name: "Midnight Black", hex: "#1E1E1E" },
      { name: "Silver Frost", hex: "#E0E0E0" },
      { name: "Deep Ocean Blue", hex: "#104E8B" },
      { name: "Burgundy", hex: "#800020" },
    ],
    storage: ["128GB", "256GB", "512GB", "1TB"],
    images: [
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
      "/placeholder.svg?height=600&width=600",
    ],
    specs: {
      display: "6.7-inch Super Retina XDR OLED, 2796 x 1290 pixels at 460 ppi",
      processor:
        "A16 Bionic chip, 6-core CPU with 2 performance and 4 efficiency cores, 5-core GPU, 16-core Neural Engine",
      camera: "48MP main (ƒ/1.78 aperture), 12MP ultra wide (ƒ/2.2 aperture), 12MP telephoto (ƒ/2.8 aperture)",
      frontCamera: "12MP (ƒ/1.9 aperture)",
      battery: "Up to 29 hours video playback, Fast charging (up to 50% charge in 30 minutes)",
      connectivity: "5G (sub‑6 GHz and mmWave), Gigabit LTE, Wi‑Fi 6E, Bluetooth 5.3",
      security: "Face ID",
      os: "iOS 16",
      dimensions: "160.7 x 77.6 x 7.85 mm",
      weight: "221 grams",
    },
  }

  const relatedProducts = [
    {
      id: "2",
      name: "Elite Wireless Earbuds",
      price: 249.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Audio",
      rating: 4.7,
    },
    {
      id: "3",
      name: "PowerMax Charging Dock",
      price: 89.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Accessories",
      rating: 4.5,
    },
    {
      id: "4",
      name: "Titanium Phone Case",
      price: 59.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Cases",
      rating: 4.6,
    },
  ]

  const incrementQuantity = () => setQuantity((prev) => prev + 1)
  const decrementQuantity = () => setQuantity((prev) => Math.max(1, prev - 1))

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-burgundy-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <Link href="/categories/smartphones" className="text-gray-500 hover:text-burgundy-600">
            Smartphones
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
            {/* Product Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200">
                <img
                  src={product.images[0] || "/placeholder.svg"}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <div
                    key={index}
                    className={cn(
                      "aspect-square rounded-md overflow-hidden border cursor-pointer",
                      index === 0 ? "border-burgundy-600" : "border-gray-200 hover:border-burgundy-400",
                    )}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} view ${index + 1}`}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-5 w-5",
                          i < Math.floor(product.rating) ? "text-yellow-400 fill-yellow-400" : "text-gray-300",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-2">
                    {product.rating} ({product.reviewCount} reviews)
                  </span>
                </div>
                <p className="text-gray-600 mb-6">{product.description}</p>
                <div className="text-3xl font-bold text-gray-900 mb-6">${product.price.toFixed(2)}</div>
              </div>

              {/* Color Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Color</h3>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      className={cn(
                        "group flex flex-col items-center",
                        selectedColor === color.name ? "ring-2 ring-burgundy-600" : "",
                      )}
                    >
                      <div
                        className="h-8 w-8 rounded-full border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <span className="mt-1 text-xs">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Storage Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Storage</h3>
                <div className="flex flex-wrap gap-3">
                  {product.storage.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedStorage(size)}
                      className={cn(
                        "px-4 py-2 border rounded-md text-sm",
                        selectedStorage === size
                          ? "border-burgundy-600 bg-burgundy-50 text-burgundy-700"
                          : "border-gray-300 hover:border-burgundy-400",
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Quantity</h3>
                <div className="flex items-center">
                  <Button variant="outline" size="icon" onClick={decrementQuantity} disabled={quantity <= 1}>
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center">{quantity}</span>
                  <Button variant="outline" size="icon" onClick={incrementQuantity}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" className="flex-1 bg-burgundy-600 hover:bg-burgundy-700">
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Add to Cart
                </Button>
                <Button variant="outline" size="lg" className="flex-1" onClick={() => setIsWishlisted(!isWishlisted)}>
                  <Heart className={cn("mr-2 h-5 w-5", isWishlisted ? "fill-burgundy-600 text-burgundy-600" : "")} />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </Button>
                <Button variant="outline" size="icon">
                  <Share2 className="h-5 w-5" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>

              {/* Shipping Info */}
              <div className="border-t border-gray-200 pt-6 space-y-4">
                <div className="flex items-start">
                  <Truck className="h-5 w-5 text-burgundy-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Free Shipping</h4>
                    <p className="text-sm text-gray-500">Free standard shipping on orders over $1000</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-burgundy-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">2-Year Warranty</h4>
                    <p className="text-sm text-gray-500">Full coverage for manufacturing defects</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <RotateCcw className="h-5 w-5 text-burgundy-600 mr-3 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">30-Day Returns</h4>
                    <p className="text-sm text-gray-500">Easy returns if you change your mind</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Product Details Tabs */}
          <Tabs defaultValue="features" className="p-6 border-t border-gray-200">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto">
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>
            <TabsContent value="features" className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Key Features</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <div className="h-5 w-5 rounded-full bg-burgundy-100 text-burgundy-600 flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-xs font-bold">{index + 1}</span>
                    </div>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="specifications" className="pt-6">
              <h3 className="text-lg font-semibold mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Display</h4>
                    <p>{product.specs.display}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Processor</h4>
                    <p>{product.specs.processor}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Camera</h4>
                    <p>{product.specs.camera}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Front Camera</h4>
                    <p>{product.specs.frontCamera}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Battery</h4>
                    <p>{product.specs.battery}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Connectivity</h4>
                    <p>{product.specs.connectivity}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Dimensions</h4>
                    <p>{product.specs.dimensions}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500">Weight</h4>
                    <p>{product.specs.weight}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold">Customer Reviews</h3>
                <Button>Write a Review</Button>
              </div>
              <div className="space-y-6">
                {/* This would normally be populated from a database */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-4 w-4", i < 5 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">Exceptional Quality</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    This phone exceeds all my expectations. The camera quality is outstanding, and the battery life is
                    impressive. I've been using it for a month now, and I'm still discovering new features.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Michael T.</span>
                    <span className="mx-2">•</span>
                    <span>Verified Purchase</span>
                    <span className="mx-2">•</span>
                    <span>2 weeks ago</span>
                  </div>
                </div>
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn("h-4 w-4", i < 4 ? "text-yellow-400 fill-yellow-400" : "text-gray-300")}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium">Great device, minor issues</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    The phone is fantastic overall. The display is crisp, and performance is smooth. My only complaint
                    is that it gets a bit warm during extended gaming sessions. Otherwise, it's perfect.
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <span className="font-medium">Sarah L.</span>
                    <span className="mx-2">•</span>
                    <span>Verified Purchase</span>
                    <span className="mx-2">•</span>
                    <span>1 month ago</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Load More Reviews
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">You May Also Like</h2>
            <Link href="/products" className="text-burgundy-600 hover:text-burgundy-700 flex items-center">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                category={product.category}
                rating={product.rating}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
