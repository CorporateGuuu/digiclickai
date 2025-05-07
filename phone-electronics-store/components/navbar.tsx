"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, ShoppingCart, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[350px]">
              <nav className="flex flex-col gap-4 mt-8">
                {navItems.map((item) => (
                  <SheetClose asChild key={item.href}>
                    <Link href={item.href} className="text-lg font-medium px-2 py-2 rounded-md hover:bg-gray-100">
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href="/" className="text-2xl font-bold text-gray-900">
            Tech<span className="text-burgundy-600">Elite</span>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="text-gray-700 hover:text-burgundy-600 font-medium">
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {isSearchOpen ? (
              <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
                  <div className="flex items-center gap-2 mb-4">
                    <Input type="search" placeholder="Search for products..." className="flex-1" autoFocus />
                    <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(false)}>
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <h3 className="text-sm font-medium text-gray-500 col-span-2">Popular Searches</h3>
                    {["Smartphones", "Wireless Earbuds", "Phone Cases", "Chargers"].map((term) => (
                      <Button
                        key={term}
                        variant="outline"
                        className="justify-start"
                        onClick={() => setIsSearchOpen(false)}
                      >
                        {term}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)}>
                <Search className="h-5 w-5" />
                <span className="sr-only">Search</span>
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/orders">Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/wishlist">Wishlist</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/login">Sign In</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge className="absolute -top-2 -right-2 bg-burgundy-600 hover:bg-burgundy-700">3</Badge>
                <span className="sr-only">Cart</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

const navItems = [
  { label: "Home", href: "/" },
  { label: "Smartphones", href: "/categories/smartphones" },
  { label: "Audio", href: "/categories/audio" },
  { label: "Accessories", href: "/categories/accessories" },
  { label: "Deals", href: "/deals" },
]
