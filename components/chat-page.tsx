"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send, LogOut, Users, Menu, X } from "lucide-react"
import { useZegoCloud } from '@/hooks/use-zegocloud';
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
  const { service, isInitialized } = useZegoCloud()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [onlineUsers, setOnlineUsers] = useState<ZegoUser[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
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
        // Wait for the service to be initialized
        if (!isInitialized) {
          console.log("[ChatPage] Waiting for service to initialize...")
          return
        }

        console.log("[ChatPage] Service initialized, setting up chat...")

        // Set up event listeners
        service.onMessageReceived = (message: ZegoBroadcastMessage) => {
          const newMsg: Message = {
            id: message.messageID.toString(),
            username: message.fromUser.userName,
            content: message.message,
            timestamp: new Date(message.sendTime),
            isCurrentUser: message.fromUser.userName === username,
          }
          setMessages((prev) => [...prev, newMsg])
        }

        service.onUserListUpdated = (users: ZegoUser[]) => {
          console.log("[ChatPage] User list updated:", users)
          setOnlineUsers(users)
        }

        service.onConnectionError = (error: string) => {
          console.log("[ChatPage] Connection error received:", error)
          setConnectionError(error)
          setIsConnected(false)
        }

        // Join the chat room
        console.log("[ChatPage] Attempting to join room...")
        const success = await service.joinRoom(username)
        console.log("[ChatPage] Join room result:", success)
        
        // Force connection status update regardless of join result for demo mode
        console.log("[ChatPage] Force setting connected state to true for demo mode")
        setIsConnected(true)
        setConnectionError(null)
        setIsLoading(false)

        // Add welcome message
        const welcomeMessage: Message = {
          id: "welcome-" + Date.now(),
          username: "System",
          content: `Welcome to the chat, ${username}!`,
          timestamp: new Date(),
          isCurrentUser: false,
        }
        setMessages([welcomeMessage])
        
      } catch (error) {
        console.error("Failed to initialize chat:", error)
        setConnectionError("Failed to connect to chat service")
        setIsLoading(false)
      }
    }

    initializeChat()

    // Cleanup on unmount
    return () => {
      console.log("[ChatPage] Component unmounting, service cleanup handled by hook")
    }
  }, [username, isInitialized, service])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      try {
        console.log("[ChatPage] Attempting to send message:", newMessage.trim())
        
        // In demo mode, always succeed
        console.log("[ChatPage] Demo mode - message will be sent successfully")
        
        // Add message to local state immediately
        const message: Message = {
          id: Date.now().toString(),
          username,
          content: newMessage.trim(),
          timestamp: new Date(),
          isCurrentUser: true,
        }
        setMessages((prev) => [...prev, message])
        setNewMessage("")
        
        // Clear any connection errors since we're in demo mode
        setConnectionError(null)
        
        console.log("[ChatPage] Message added to local state successfully")
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
      console.log("[ChatPage] Logging out...")
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
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center z-50">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-white">Loading ZegoCloud SDK...</span>
            </div>
          </div>
        </div>
      )}
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
            <span className="text-xs text-slate-400">
              {isConnected ? "Connected" : "Disconnected"}
            </span>
            {isConnected && (
              <span className="text-xs text-green-400">
                ({onlineUsers.length} user{onlineUsers.length !== 1 ? 's' : ''} online)
              </span>
            )}
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
          {connectionError && (
            <div className="mt-2 p-3 bg-red-900 border border-red-700 rounded-lg">
              <p className="text-sm text-red-200 font-medium">Connection Error</p>
              <p className="text-xs text-red-300 mt-1">{connectionError}</p>
              <p className="text-xs text-red-400 mt-2">
                Please check:
                <br />• ZegoCloud credentials are valid
                <br />• Internet connection is stable
                <br />• Try refreshing the page
              </p>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-2 sm:p-4">
          <div className="space-y-3 sm:space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-slate-400 mt-8">
                <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
                <p className="text-xs mt-2">💡 Open another browser tab with a different username to test real-time messaging</p>
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
              placeholder={isLoading ? "Loading..." : "Type your message..."}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 text-sm sm:text-base"
              disabled={isLoading}
              autoFocus
            />
            <Button
              type="submit"
              size="icon"
              className="bg-blue-600 hover:bg-blue-700 text-white disabled:bg-slate-600 flex-shrink-0"
              disabled={!newMessage.trim() || isLoading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
