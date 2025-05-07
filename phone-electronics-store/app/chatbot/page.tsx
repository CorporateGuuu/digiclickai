"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import Link from "next/link"

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Hello! I'm your TechElite assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const handleSendMessage = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Simulate bot response
    setTimeout(() => {
      const botResponses = [
        "I'd be happy to help you find the perfect smartphone for your needs. Could you tell me what features are most important to you?",
        "Our latest models come with advanced camera systems and all-day battery life. Would you like me to recommend some options?",
        "We have several accessories that would complement your device perfectly. Would you like to see our most popular cases and chargers?",
        "The Quantum Pro X is currently our flagship model, featuring a 6.7-inch OLED display and a 108MP camera system.",
        "Is there anything specific about our products you'd like to know more about?",
      ]

      const botMessage: Message = {
        id: Date.now().toString(),
        role: "system",
        content: botResponses[Math.floor(Math.random() * botResponses.length)],
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-4 px-4">
        <div className="container mx-auto flex items-center">
          <Link href="/" className="flex items-center text-gray-700 hover:text-burgundy-600">
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span>Back to Store</span>
          </Link>
          <div className="mx-auto flex items-center">
            <Avatar className="h-8 w-8 mr-2 bg-burgundy-100">
              <div className="text-burgundy-700 font-semibold">TE</div>
            </Avatar>
            <div>
              <h1 className="font-medium">TechElite Assistant</h1>
              <p className="text-xs text-gray-500">Online</p>
            </div>
          </div>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col max-w-4xl">
        <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col">
          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                  {message.role === "system" && (
                    <Avatar className="h-8 w-8 mr-2 mt-1 bg-burgundy-100 flex-shrink-0">
                      <Bot className="h-4 w-4 text-burgundy-700" />
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg p-3",
                      message.role === "user" ? "bg-burgundy-600 text-white" : "bg-gray-100 text-gray-800",
                    )}
                  >
                    <p>{message.content}</p>
                    <p className={cn("text-xs mt-1", message.role === "user" ? "text-burgundy-100" : "text-gray-500")}>
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {message.role === "user" && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 bg-gray-200 flex-shrink-0">
                      <User className="h-4 w-4 text-gray-700" />
                    </Avatar>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSendMessage()
              }}
              className="flex items-center gap-2"
            >
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
              />
              <Button type="submit" className="bg-burgundy-600 hover:bg-burgundy-700" disabled={!input.trim()}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </form>
          </div>
        </div>

        {/* Suggested Questions */}
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Suggested Questions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {suggestedQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                className="justify-start h-auto py-3 text-left"
                onClick={() => {
                  setInput(question)
                }}
              >
                {question}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Message {
  id: string
  role: "user" | "system"
  content: string
  timestamp: Date
}

const suggestedQuestions = [
  "What's the difference between Quantum Pro X and Quantum Pro S?",
  "Do you offer international shipping?",
  "What are your warranty terms?",
  "Can I trade in my old phone?",
  "Tell me about your latest audio products",
  "What accessories do you recommend for the Quantum Pro X?",
]
