"use client"

import { useState } from "react"
import LoginPage from "@/components/login-page"
import ChatPage from "@/components/chat-page"

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState("")

  const handleLogin = (name: string) => {
    setUsername(name)
    setIsLoggedIn(true)
  }

  const handleLogout = () => {
    setIsLoggedIn(false)
    setUsername("")
  }

  return (
    <div className="min-h-screen bg-slate-900">
      {!isLoggedIn ? <LoginPage onLogin={handleLogin} /> : <ChatPage username={username} onLogout={handleLogout} />}
    </div>
  )
}
