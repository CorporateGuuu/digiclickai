"use client"

import { useState } from "react"
import { MessageSquare, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "system",
      content: "Hello! I'm your TechElite assistant. How can I help you today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")

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

  return (
    <>
      {/* Chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full h-14 w-14 bg-burgundy-600 hover:bg-burgundy-700 shadow-lg"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Open chat</span>
      </Button>

      {/* Chat window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] bg-white rounded-lg shadow-xl flex flex-col z-50 border border-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Avatar className="h-8 w-8 mr-2 bg-burgundy-100">
                <div className="text-burgundy-700 font-semibold">TE</div>
              </Avatar>
              <div>
                <h3 className="font-medium">TechElite Assistant</h3>
                <p className="text-xs text-gray-500">Online</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
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
              <Button
                type="submit"
                size="icon"
                className="bg-burgundy-600 hover:bg-burgundy-700"
                disabled={!input.trim()}
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

interface Message {
  id: string
  role: "user" | "system"
  content: string
  timestamp: Date
}
