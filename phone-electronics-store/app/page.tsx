import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import ProductCard from "@/components/product-card"
import ChatbotButton from "@/components/chatbot-button"
import { getFeaturedProducts, getCategories } from "@/lib/db"

// Make the page dynamic to ensure fresh data on each request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  // Fetch featured products from the database
  const featuredProducts = await getFeaturedProducts(4);

  // Fetch categories from the database
  const categoriesData = await getCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="container mx-auto px-4 py-32 h-full flex flex-col justify-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Premium Tech <span className="text-burgundy-500">Experience</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Discover the latest in smartphone technology with our curated collection of premium devices and accessories.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="bg-burgundy-600 hover:bg-burgundy-700">
              <Link href="/products">
                Shop Now
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <Link href="/categories">
                Explore Collections
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute bottom-0 right-0 w-full md:w-1/2 h-full hidden md:block">
          <div className="relative h-full">
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-900/90 z-10"></div>
            <img
              src="/placeholder.svg?height=600&width=800"
              alt="Premium smartphone"
              className="object-cover h-full w-full"
            />
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
          <Link href="/products" className="text-burgundy-600 hover:text-burgundy-700 flex items-center">
            View All <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id.toString()}
                name={product.name}
                price={parseFloat(product.price)}
                image={product.image_url || "/placeholder.svg?height=300&width=300"}
                category={product.category_name || "Uncategorized"}
                rating={4.5} // Default rating since we don't have this in the database yet
                slug={product.slug}
                isNew={product.is_new}
                discount={product.discount_percentage ? parseFloat(product.discount_percentage) : undefined}
              />
            ))
          ) : (
            // Fallback if no featured products are available
            <>
              <ProductCard
                id="1"
                name="Quantum Pro X"
                price={1299.99}
                image="/placeholder.svg?height=300&width=300"
                category="Smartphones"
                rating={4.8}
              />
              <ProductCard
                id="2"
                name="Elite Wireless Earbuds"
                price={249.99}
                image="/placeholder.svg?height=300&width=300"
                category="Audio"
                rating={4.7}
              />
              <ProductCard
                id="3"
                name="PowerMax Charging Dock"
                price={89.99}
                image="/placeholder.svg?height=300&width=300"
                category="Accessories"
                rating={4.5}
              />
              <ProductCard
                id="4"
                name="Titanium Phone Case"
                price={59.99}
                image="/placeholder.svg?height=300&width=300"
                category="Cases"
                rating={4.6}
              />
            </>
          )}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {categoriesData.length > 0 ? (
              categoriesData.slice(0, 4).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group relative h-64 rounded-lg overflow-hidden bg-white shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                  <img
                    src={category.image_url || "/placeholder.svg?height=400&width=300"}
                    alt={category.name}
                    className="object-cover h-full w-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-gray-200 mb-3">{category.product_count || 0} products</p>
                    <span className="text-burgundy-400 flex items-center text-sm font-medium">
                      Browse Category <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))
            ) : (
              // Fallback if no categories are available
              categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="group relative h-64 rounded-lg overflow-hidden bg-white shadow-md transition-transform hover:scale-[1.02]"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent z-10"></div>
                  <img
                    src={category.image || "/placeholder.svg"}
                    alt={category.name}
                    className="object-cover h-full w-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
                    <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                    <p className="text-gray-200 mb-3">{category.count} products</p>
                    <span className="text-burgundy-400 flex items-center text-sm font-medium">
                      Browse Category <ChevronRight className="ml-1 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-gray-800 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Stay Updated</h2>
            <p className="text-gray-300 mb-8">
              Subscribe to our newsletter for exclusive deals, new arrivals, and tech insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Your email address"
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
              />
              <Button className="bg-burgundy-600 hover:bg-burgundy-700 whitespace-nowrap">Subscribe</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Chatbot Button */}
      <ChatbotButton />
    </div>
  )
}

const categories = [
  {
    id: "smartphones",
    name: "Smartphones",
    count: 24,
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "audio",
    name: "Audio",
    count: 18,
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "accessories",
    name: "Accessories",
    count: 36,
    image: "/placeholder.svg?height=400&width=300",
  },
  {
    id: "wearables",
    name: "Wearables",
    count: 12,
    image: "/placeholder.svg?height=400&width=300",
  },
]
