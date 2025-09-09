"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, LogOut, Users, Menu, X } from "lucide-react"
import { zegoService, type ZegoUser, type ZegoBroadcastMessage } from "@/lib/zegocloud-service"

interface Message {
  id: string
  username: string
  content: string
  timestamp: Date
  isCurrentUser: boolean
}

interface ChatPageProps {
  username: string
  onLogout: () => void
}

export default function ChatPage({ username, onLogout }: ChatPageProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<ZegoUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const initializeChat = async () => {
      try {
        // Set up event listeners
        zegoService.onMessageReceived = (message: ZegoBroadcastMessage) => {
          const newMsg: Message = {
            id: message.messageID.toString(),
            username: message.fromUser.userName,
            content: message.message,
            timestamp: new Date(message.sendTime),
            isCurrentUser: message.fromUser.userName === username,
          }
          setMessages((prev) => [...prev, newMsg])
        }

        zegoService.onUserListUpdated = (users: ZegoUser[]) => {
          setOnlineUsers(users)
        }

        zegoService.onConnectionError = (error: string) => {
          setConnectionError(error)
          setIsConnected(false)
        }

        // Join the chat room
        const success = await zegoService.joinRoom(username)
        if (success) {
          setIsConnected(true)
          setConnectionError(null)

          // Add welcome message
          const welcomeMessage: Message = {
            id: "welcome-" + Date.now(),
            username: "System",
            content: `Welcome to the chat, ${username}!`,
            timestamp: new Date(),
            isCurrentUser: false,
          }
          setMessages([welcomeMessage])

          // Simulate some demo functionality
          setTimeout(() => {
            zegoService.simulateIncomingMessage("Demo User", "Hello everyone! 👋")
          }, 2000)
        }
      } catch (error) {
        console.error("Failed to initialize chat:", error)
        setConnectionError("Failed to connect to chat service")
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      zegoService.destroy()
    }
  }, [username])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim() && isConnected) {
      try {
        const success = await zegoService.sendMessage(newMessage.trim())
        if (success) {
          // Add message to local state (in real implementation, this would come through onMessageReceived)
          const message: Message = {
            id: Date.now().toString(),
            username,
            content: newMessage.trim(),
            timestamp: new Date(),
            isCurrentUser: true,
          }
          setMessages((prev) => [...prev, message])
          setNewMessage("")
        }
      } catch (error) {
        console.error("Failed to send message:", error)
        setConnectionError("Failed to send message")
      }
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(e)
    }
  }

  const handleLogout = async () => {
    try {
      await zegoService.destroy()
      onLogout()
    } catch (error) {
      console.error("Error during logout:", error)
      onLogout() // Still logout even if there's an error
    }
  }

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen)
  }

  return (
    <div className="h-screen flex bg-slate-900 relative">
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <div
        className={`
        w-64 bg-slate-800 border-r border-slate-700 flex flex-col
        md:relative md:translate-x-0 md:z-auto
        ${isMobileSidebarOpen ? "fixed inset-y-0 left-0 z-50 translate-x-0" : "fixed inset-y-0 left-0 z-50 -translate-x-full"}
        transition-transform duration-300 ease-in-out
        md:block
      `}
      >
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Online Users</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileSidebarOpen(false)}
                className="text-slate-400 hover:text-white hover:bg-slate-700 md:hidden"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`}></div>
            <span className="text-xs text-slate-400">{isConnected ? "Connected" : "Disconnected"}</span>
          </div>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-2">
            {onlineUsers.map((user) => (
              <div key={user.userID} className="flex items-center space-x-2 p-2 rounded-lg bg-slate-700">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-white truncate">{user.userName}</span>
                {user.userName === username && <span className="text-xs text-slate-400 flex-shrink-0">(You)</span>}
              </div>
            ))}
            {onlineUsers.length === 0 && (
              <div className="text-xs text-slate-400 text-center py-4">Loading users...</div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <div className="p-4 bg-slate-800 border-b border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSidebar}
                className="text-slate-400 hover:text-white hover:bg-slate-700 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-white">Global Chat Room</h1>
                <p className="text-sm text-slate-400">Welcome, {username}!</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:hidden">
              <Users className="h-4 w-4 text-slate-400" />
              <span className="text-sm text-slate-400">{onlineUsers.length}</span>
            </div>
          </div>
          {connectionError && <p className="text-sm text-red-400 mt-2">⚠️ {connectionError}</p>}
        </div>

        <ScrollArea className="flex-1 p-2 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-8">
                <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className={`flex ${message.isCurrentUser ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`
                      max-w-[85%] sm:max-w-xs lg:max-w-md px-3 py-2 sm:px-4 sm:py-2 rounded-lg
                      ${
                        message.isCurrentUser
                          ? "bg-blue-600 text-white"
                          : message.username === "System"
                            ? "bg-green-600 text-white"
                            : "bg-slate-700 text-white"
                      }
                    `}
                  >
                    {!message.isCurrentUser && (
                      <p className="text-xs text-slate-300 mb-1 truncate">{message.username}</p>
                    )}
                    <p className="text-sm break-words">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <div className="p-3 sm:p-4 bg-slate-800 border-t border-slate-700">
          <form onSubmit={handleSendMessage} className="flex space-x-2">
            <Input
              type="text"
              placeholder={isConnected ? "Type your message..." : "Connecting..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 text-sm sm:text-base"
              disabled={!isConnected}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 flex-shrink-0"
              disabled={!newMessage.trim() || !isConnected}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
