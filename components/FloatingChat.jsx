"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Minimize2, Loader2, MessageCircle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";

export function FloatingChat() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Hide chat on auth pages and the chat page itself
  const isAuthPage = pathname?.startsWith("/sign-in") || 
                     pathname?.startsWith("/sign-up") || 
                     pathname?.startsWith("/media-agency/sign") ||
                     pathname === "/chat";

  // On rate card page, align chat to the left to avoid overlapping with cart on the right
  const isRateCardPage = pathname?.includes("/rate-cards/");
  
  if (isAuthPage) {
    return null;
  }

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, isMinimized]);

  // Show error toast if there's an error
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred. Please try again.");
    }
  }, [error]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const input = e.target.message.value.trim();
    if (!input) return;

    sendMessage({ text: input });
    e.target.message.value = "";
    inputRef.current?.focus();
  };

  const quickQuestions = [
    "How do I book media services?",
    "What's the best media mix for my campaign?",
    "How do I find and hire creators?",
    "What types of creators are available?",
    "How do I create a rate card?",
    "How do creators get paid?",
    "What payment methods do you accept?",
    "How do I apply to become a creator?",
  ];

  if (!isOpen) {
    return (
      <div className={`fixed bottom-6 z-[60] ${isRateCardPage ? "left-6" : "right-6"}`} data-floating-chat>
        <Button
          onClick={() => {
            setIsOpen(true);
            setIsMinimized(false);
          }}
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:scale-110 transition-transform bg-primary hover:bg-primary/90"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Open chat</span>
        </Button>
      </div>
    );
  }

  return (
    <div className={`fixed bottom-4 sm:bottom-6 z-[60] w-[calc(100vw-2rem)] sm:w-[380px] md:w-[420px] max-w-[420px] ${isRateCardPage ? "left-4 sm:left-6" : "right-4 sm:right-6"}`} data-floating-chat>
      <Card className="shadow-2xl border-2 flex flex-col h-[500px] sm:h-[600px] max-h-[85vh] bg-background">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-primary/10 to-primary/5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary-foreground" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Payollar AI</h3>
              <p className="text-xs text-muted-foreground">
                {status === "in_progress" ? "Typing..." : "Online"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsMinimized(!isMinimized);
              }}
            >
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => {
                setIsOpen(false);
                setIsMinimized(false);
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.length === 0 && (
                <div className="space-y-3">
                  <div className="text-center py-4">
                    <Sparkles className="h-8 w-8 mx-auto mb-2 text-primary opacity-50" />
                    <p className="text-sm text-muted-foreground">
                      Hi! I'm here to help with your questions about media services, campaigns, and more.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">Quick questions:</p>
                    {quickQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => sendMessage({ text: question })}
                        className="w-full text-left p-2 text-xs rounded-md bg-muted hover:bg-muted/80 transition-colors border border-border"
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((message) => {
                const messageText = message.parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("");

                return (
                  <div
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                          : "bg-muted rounded-2xl rounded-tl-sm"
                      } px-3 py-2`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">AI</span>
                        </div>
                      )}
                      <div className="text-sm leading-relaxed">
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            components={{
                              p: ({ children }) => <p className="mb-1.5 last:mb-0 text-sm">{children}</p>,
                              ul: ({ children }) => (
                                <ul className="list-disc list-inside mb-1.5 space-y-0.5 text-sm">{children}</ul>
                              ),
                              ol: ({ children }) => (
                                <ol className="list-decimal list-inside mb-1.5 space-y-0.5 text-sm">{children}</ol>
                              ),
                              li: ({ children }) => <li className="ml-1">{children}</li>,
                              code: ({ children }) => (
                                <code className="bg-background/50 px-1 py-0.5 rounded text-xs font-mono">
                                  {children}
                                </code>
                              ),
                              strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                            }}
                          >
                            {messageText}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{messageText}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {status === "in_progress" && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="h-3 w-3 animate-spin text-primary" />
                      <span className="text-xs text-muted-foreground">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t p-3 bg-background">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <Input
                  ref={inputRef}
                  name="message"
                  placeholder="Ask a question..."
                  disabled={status === "in_progress"}
                  className="text-sm min-h-[40px]"
                  autoComplete="off"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={status === "in_progress"}
                  className="h-10 w-10 flex-shrink-0"
                >
                  {status === "in_progress" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
              <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                AI can make mistakes. Verify important information.
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
