"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronRight, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import ProductCard from "@/components/product-card"

export default function CategoryPage({ params }: { params: { category: string } }) {
  const [priceRange, setPriceRange] = useState([0, 2000])
  const [sortBy, setSortBy] = useState("featured")
  const [filtersVisible, setFiltersVisible] = useState(false)

  // This would normally come from a database or API
  const categoryName = getCategoryName(params.category)
  const products = getProductsByCategory(params.category)
  const brands = ["Apple", "Samsung", "Google", "OnePlus", "Xiaomi"]
  const colors = ["Black", "White", "Blue", "Silver", "Red"]
  const features = ["5G", "Wireless Charging", "Face ID", "Water Resistant", "Dual SIM"]

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm mb-6">
          <Link href="/" className="text-gray-500 hover:text-burgundy-600">
            Home
          </Link>
          <ChevronRight className="h-4 w-4 mx-2 text-gray-400" />
          <span className="text-gray-900 font-medium">{categoryName}</span>
        </nav>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>

          <div className="flex items-center gap-4 w-full md:w-auto">
            {/* Mobile Filter Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[350px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                <div className="py-4">
                  <MobileFilters
                    brands={brands}
                    colors={colors}
                    features={features}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                  />
                </div>
              </SheetContent>
            </Sheet>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="rating">Top Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Desktop Filters */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <h2 className="font-semibold text-lg mb-4">Filters</h2>
              <DesktopFilters
                brands={brands}
                colors={colors}
                features={features}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
              />
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  image={product.image}
                  category={product.category}
                  rating={product.rating}
                  discount={product.discount}
                  isNew={product.isNew}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="icon" disabled>
                  <ChevronRight className="h-4 w-4 rotate-180" />
                </Button>
                <Button variant="outline" size="sm" className="bg-burgundy-50 text-burgundy-600 border-burgundy-200">
                  1
                </Button>
                <Button variant="outline" size="sm">
                  2
                </Button>
                <Button variant="outline" size="sm">
                  3
                </Button>
                <span className="px-2">...</span>
                <Button variant="outline" size="sm">
                  8
                </Button>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DesktopFilters({
  brands,
  colors,
  features,
  priceRange,
  setPriceRange,
}: {
  brands: string[]
  colors: string[]
  features: string[]
  priceRange: number[]
  setPriceRange: (value: number[]) => void
}) {
  return (
    <div className="space-y-6">
      {/* Price Range */}
      <div>
        <h3 className="font-medium mb-3">Price Range</h3>
        <Slider defaultValue={priceRange} max={2000} step={50} onValueChange={setPriceRange} className="mb-6" />
        <div className="flex items-center justify-between">
          <span className="text-sm">${priceRange[0]}</span>
          <span className="text-sm">${priceRange[1]}</span>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h3 className="font-medium mb-3">Brands</h3>
        <div className="space-y-2">
          {brands.map((brand) => (
            <div key={brand} className="flex items-center">
              <Checkbox id={`brand-${brand}`} />
              <label
                htmlFor={`brand-${brand}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {brand}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div>
        <h3 className="font-medium mb-3">Colors</h3>
        <div className="space-y-2">
          {colors.map((color) => (
            <div key={color} className="flex items-center">
              <Checkbox id={`color-${color}`} />
              <label
                htmlFor={`color-${color}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {color}
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div>
        <h3 className="font-medium mb-3">Features</h3>
        <div className="space-y-2">
          {features.map((feature) => (
            <div key={feature} className="flex items-center">
              <Checkbox id={`feature-${feature}`} />
              <label
                htmlFor={`feature-${feature}`}
                className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {feature}
              </label>
            </div>
          ))}
        </div>
      </div>

      <Button className="w-full bg-burgundy-600 hover:bg-burgundy-700">Apply Filters</Button>
    </div>
  )
}

function MobileFilters({
  brands,
  colors,
  features,
  priceRange,
  setPriceRange,
}: {
  brands: string[]
  colors: string[]
  features: string[]
  priceRange: number[]
  setPriceRange: (value: number[]) => void
}) {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="price">
        <AccordionTrigger>Price Range</AccordionTrigger>
        <AccordionContent>
          <Slider defaultValue={priceRange} max={2000} step={50} onValueChange={setPriceRange} className="mb-6" />
          <div className="flex items-center justify-between">
            <span className="text-sm">${priceRange[0]}</span>
            <span className="text-sm">${priceRange[1]}</span>
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="brands">
        <AccordionTrigger>Brands</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {brands.map((brand) => (
              <div key={brand} className="flex items-center">
                <Checkbox id={`mobile-brand-${brand}`} />
                <label
                  htmlFor={`mobile-brand-${brand}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {brand}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="colors">
        <AccordionTrigger>Colors</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {colors.map((color) => (
              <div key={color} className="flex items-center">
                <Checkbox id={`mobile-color-${color}`} />
                <label
                  htmlFor={`mobile-color-${color}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {color}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="features">
        <AccordionTrigger>Features</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature} className="flex items-center">
                <Checkbox id={`mobile-feature-${feature}`} />
                <label
                  htmlFor={`mobile-feature-${feature}`}
                  className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {feature}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>

      <div className="pt-6">
        <Button className="w-full bg-burgundy-600 hover:bg-burgundy-700">Apply Filters</Button>
      </div>
    </Accordion>
  )
}

// Helper functions to simulate data fetching
function getCategoryName(slug: string): string {
  const categories: Record<string, string> = {
    smartphones: "Smartphones",
    audio: "Audio Devices",
    accessories: "Accessories",
    wearables: "Wearables",
  }

  return categories[slug] || "Products"
}

function getProductsByCategory(category: string) {
  // This would normally come from a database or API
  const products = [
    {
      id: "1",
      name: "Quantum Pro X",
      price: 1299.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.8,
      isNew: true,
    },
    {
      id: "2",
      name: "Quantum Pro S",
      price: 999.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.7,
    },
    {
      id: "3",
      name: "Quantum Lite",
      price: 699.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.5,
      discount: 10,
    },
    {
      id: "4",
      name: "Elite Pro Smartphone",
      price: 1199.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.6,
    },
    {
      id: "5",
      name: "Elite Standard",
      price: 899.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.4,
      discount: 15,
    },
    {
      id: "6",
      name: "Nexus Ultra",
      price: 1099.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.7,
      isNew: true,
    },
    {
      id: "7",
      name: "Nexus Plus",
      price: 849.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.3,
    },
    {
      id: "8",
      name: "Titan Max",
      price: 1399.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.9,
      isNew: true,
    },
    {
      id: "9",
      name: "Titan Standard",
      price: 1099.99,
      image: "/placeholder.svg?height=300&width=300",
      category: "Smartphones",
      rating: 4.6,
      discount: 5,
    },
  ]

  // Filter by category if needed
  return products
}
