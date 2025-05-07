import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-white mb-4">
              Tech<span className="text-burgundy-400">Elite</span>
            </h3>
            <p className="mb-4">Premium electronics and accessories for the modern gentleman.</p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Youtube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="hover:text-burgundy-400 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => (
                <li key={category.href}>
                  <Link href={category.href} className="hover:text-burgundy-400 transition-colors">
                    {category.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 text-burgundy-400 flex-shrink-0 mt-0.5" />
                <span>123 Tech Boulevard, Silicon Valley, CA 94043</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-burgundy-400 flex-shrink-0" />
                <span>(800) 123-4567</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-burgundy-400 flex-shrink-0" />
                <span>support@techelite.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} TechElite. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy-policy" className="text-sm hover:text-burgundy-400">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sm hover:text-burgundy-400">
              Terms of Service
            </Link>
            <Link href="/shipping-policy" className="text-sm hover:text-burgundy-400">
              Shipping Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Blog", href: "/blog" },
  { label: "FAQs", href: "/faqs" },
]

const categories = [
  { label: "Smartphones", href: "/categories/smartphones" },
  { label: "Audio", href: "/categories/audio" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Wearables", href: "/categories/wearables" },
  { label: "Deals", href: "/deals" },
]
