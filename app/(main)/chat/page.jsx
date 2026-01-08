"use client"

import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles, Send, Loader2, Copy, Check } from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import ReactMarkdown from "react-markdown"

export default function ChatPage() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  })
  const [copiedId, setCopiedId] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input when component mounts
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred. Please try again.")
    }
  }, [error])

  const handleSubmit = (e) => {
    e.preventDefault()
    const input = e.target.message.value.trim()
    if (!input) return

    sendMessage({ text: input })
    e.target.message.value = ""
    inputRef.current?.focus()
  }

  const copyToClipboard = async (text, messageId) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(messageId)
      toast.success("Copied to clipboard!")
      setTimeout(() => setCopiedId(null), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  const suggestedQuestions = [
    {
      title: "Media Mix Strategy",
      question: "What's the best media mix for a product launch in Ghana?",
      description: "Best channels for product launch",
    },
    {
      title: "Content Creation",
      question: "How do I create engaging content for social media?",
      description: "Social media engagement tips",
    },
    {
      title: "ROI Analysis",
      question: "What's the ROI difference between TV and digital ads?",
      description: "Compare advertising channels",
    },
    {
      title: "Budget Planning",
      question: "How should I budget my advertising spend?",
      description: "Optimize ad spend allocation",
    },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Payollar AI</span>
            </Link>
            <Link href="/products">
              <Button variant="outline">Browse Services</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Card */}
          {messages.length === 0 && (
            <Card className="p-8 mb-8 bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-primary-foreground" />
                </div>
                <div className="space-y-3 flex-1">
                  <div>
                    <h1 className="text-2xl font-bold">Chat with AI Marketing Expert</h1>
                    <p className="text-muted-foreground leading-relaxed mt-2">
                      Get expert advice on content creation, digital marketing strategies, advertising campaigns, media
                      planning, and more. I'm here to help you maximize your marketing ROI across all channels.
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 pt-2">
                    {suggestedQuestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage({ text: suggestion.question })}
                        className="text-left p-3 rounded-lg bg-background hover:bg-muted transition-colors text-sm border border-border"
                      >
                        <div className="font-medium">{suggestion.title}</div>
                        <div className="text-muted-foreground text-xs mt-1">{suggestion.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Chat Messages */}
          <div className="space-y-6 mb-32">
            {messages.map((message) => {
              const messageText = message.parts
                .filter((part) => part.type === "text")
                .map((part) => part.text)
                .join("")

              return (
                <div
                  key={message.id}
                  className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                        : "bg-muted rounded-2xl rounded-tl-sm"
                    } px-4 py-3 relative group`}
                  >
                    {message.role === "assistant" && (
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">AI Marketing Expert</span>
                        </div>
                        <button
                          onClick={() => copyToClipboard(messageText, message.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted-foreground/20 rounded"
                          title="Copy message"
                        >
                          {copiedId === message.id ? (
                            <Check className="h-3 w-3 text-primary" />
                          ) : (
                            <Copy className="h-3 w-3 text-muted-foreground" />
                          )}
                        </button>
                      </div>
                    )}
                    <div className="prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground">
                      {message.role === "assistant" ? (
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1">{children}</ol>,
                            li: ({ children }) => <li className="ml-2">{children}</li>,
                            code: ({ children }) => (
                              <code className="bg-background/50 px-1.5 py-0.5 rounded text-sm font-mono">
                                {children}
                              </code>
                            ),
                            pre: ({ children }) => (
                              <pre className="bg-background/50 p-3 rounded-lg overflow-x-auto mb-2">
                                {children}
                              </pre>
                            ),
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          }}
                        >
                          {messageText}
                        </ReactMarkdown>
                      ) : (
                        <div className="whitespace-pre-wrap leading-relaxed">{messageText}</div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}

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
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky bottom-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSubmit} className="flex items-end space-x-2">
            <div className="flex-1">
              <Input
                ref={inputRef}
                name="message"
                placeholder="Ask about marketing strategies, content creation, advertising..."
                disabled={status === "in_progress"}
                className="min-h-[48px] resize-none"
                autoComplete="off"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit(e)
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={status === "in_progress"}
              className="h-12 w-12 flex-shrink-0"
            >
              {status === "in_progress" ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </form>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by Groq • AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
