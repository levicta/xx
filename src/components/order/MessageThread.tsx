"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useSession } from "next-auth/react"

interface Message {
  id: string
  senderId: string
  content: string
  createdAt: string
}

interface MessageThreadProps {
  orderId: string
  isLocked: boolean
}

export function MessageThread({ orderId, isLocked }: MessageThreadProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error)
    }
  }, [orderId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 10000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending || isLocked) return

    setSending(true)
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMessage }),
      })
      if (res.ok) {
        const msg = await res.json()
        setMessages((prev) => [...prev, msg])
        setNewMessage("")
      }
    } catch (error) {
      console.error("Failed to send message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="bg-card border border-border/50 rounded-[16px]">
      <div className="p-4 border-b border-border/50">
        <h3 className="font-semibold text-foreground">Messages</h3>
      </div>

      <div
        ref={scrollRef}
        className="h-64 overflow-y-auto p-4 space-y-3"
      >
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground text-sm">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-[16px] px-4 py-2 ${
                  msg.senderId === session?.user?.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-accent text-foreground"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className={`text-xs mt-1 ${
                  msg.senderId === session?.user?.id ? "text-primary-foreground/60" : "text-muted-foreground"
                }`}>
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 border-t border-border/50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={isLocked ? "Messaging disabled" : "Type a message..."}
            disabled={isLocked}
            className="flex-1 bg-card border border-border/50 rounded-[--radius-sm] px-4 py-2 text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={isLocked || !newMessage.trim() || sending}
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-[--radius-sm] hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {sending ? "..." : "Send"}
          </button>
        </div>
      </form>
    </div>
  )
}
