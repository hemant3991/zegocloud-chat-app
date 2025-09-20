"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface LoginPageProps {
  onLogin: (username: string) => void
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (username.trim()) {
      onLogin(username.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900">
      <Card className="w-full max-w-sm sm:max-w-md bg-slate-800 border-slate-700">
        <CardHeader className="text-center pb-4 sm:pb-6">
          <CardTitle className="text-xl sm:text-2xl font-bold text-white">Join the Conversation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 px-4 sm:px-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500 text-sm sm:text-base h-10 sm:h-11"
              autoFocus
              maxLength={20}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-10 sm:h-11 text-sm sm:text-base"
              disabled={!username.trim()}
            >
              Join Chat
            </Button>
          </form>
          <div className="text-xs text-slate-400 text-center mt-4 space-y-2">
            <p>Enter a username to start chatting with others in real-time</p>
            <div className="bg-slate-700 p-3 rounded-lg text-left">
              <p className="font-semibold text-slate-300 mb-1">Demo Mode Active:</p>
              <p className="text-xs">• The app is running in simulation mode for testing</p>
              <p className="text-xs">• You'll see a demo user and message after joining</p>
              <p className="text-xs">• Your messages will be sent successfully</p>
              <p className="text-xs">• This demonstrates the UI functionality</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
