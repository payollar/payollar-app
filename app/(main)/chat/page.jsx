"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Send, Loader2 } from "lucide-react"
import Link from "next/link"

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    const input = e.target.message.value.trim()
    if (!input) return

    sendMessage({ text: input })
    e.target.message.value = ""
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              {/* <Sparkles className="h-6 w-6 text-primary" /> */}
              <span className="text-lg font-bold">Payollar AI</span>
            </Link>
            <Link href="/products">
              <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Card */}
        {messages.length === 0 && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                <Sparkles className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="space-y-3">
                <h1 className="text-2xl font-bold">Chat with AI Marketing Expert</h1>
                <p className="text-muted-foreground leading-relaxed">
                  Get expert advice on content creation, digital marketing strategies, advertising campaigns, media
                  planning, and more. I'm here to help you maximize your marketing ROI across all channels.
                </p>
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => sendMessage({ text: "What's the best media mix for a product launch in Ghana?" })}
                    className="text-left p-3 rounded-lg bg-background hover:bg-muted transition-colors text-sm"
                  >
                    <div className="font-medium">Media Mix Strategy</div>
                    <div className="text-muted-foreground text-xs">Best channels for product launch</div>
                  </button>
                  <button
                    onClick={() => sendMessage({ text: "How do I create engaging content for social media?" })}
                    className="text-left p-3 rounded-lg bg-background hover:bg-muted transition-colors text-sm"
                  >
                    <div className="font-medium">Content Creation</div>
                    <div className="text-muted-foreground text-xs">Social media engagement tips</div>
                  </button>
                  <button
                    onClick={() => sendMessage({ text: "What's the ROI difference between TV and digital ads?" })}
                    className="text-left p-3 rounded-lg bg-background hover:bg-muted transition-colors text-sm"
                  >
                    <div className="font-medium">ROI Analysis</div>
                    <div className="text-muted-foreground text-xs">Compare advertising channels</div>
                  </button>
                  <button
                    onClick={() => sendMessage({ text: "How should I budget my advertising spend?" })}
                    className="text-left p-3 rounded-lg bg-background hover:bg-muted transition-colors text-sm"
                  >
                    <div className="font-medium">Budget Planning</div>
                    <div className="text-muted-foreground text-xs">Optimize ad spend allocation</div>
                  </button>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Chat Messages */}
        <div className="space-y-6 mb-32">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                    : "bg-muted rounded-2xl rounded-tl-sm"
                } px-4 py-3`}
              >
                {message.role === "assistant" && (
                  <div className="flex items-center space-x-2 mb-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-xs font-medium text-muted-foreground">AI Marketing Expert</span>
                  </div>
                )}
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return (
                        <div key={index} className="whitespace-pre-wrap leading-relaxed">
                          {part.text}
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            </div>
          ))}

          {status === "in_progress" && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Form */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <form onSubmit={handleSubmit} className="flex items-end space-x-2">
              <div className="flex-1">
                <Input
                  name="message"
                  placeholder="Ask about marketing strategies, content creation, advertising..."
                  disabled={status === "in_progress"}
                  className="min-h-[48px] resize-none"
                  autoComplete="off"
                />
              </div>
              <Button type="submit" size="icon" disabled={status === "in_progress"} className="h-12 w-12 flex-shrink-0">
                {status === "in_progress" ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center mt-2">
              AI can make mistakes. Verify important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
