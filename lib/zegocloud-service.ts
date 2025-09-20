// ZegoCloud service for real-time messaging
import { ZEGOCLOUD_CONFIG, generateUserID } from "./zegocloud-config"

// Define types for ZegoCloud SDK
interface ZegoUser {
  userID: string
  userName: string
}

interface ZegoBroadcastMessage {
  message: string
  messageID: number
  sendTime: number
  fromUser: ZegoUser
}

declare global {
  interface Window {
    ZegoExpressEngine: any
    ZEGO: any
    zegoSDK: any
  }
}

class ZegoCloudService {
  private engine: any = null
  private currentUserID = ""
  private isInitialized = false
  private currentRoomID = ""

  // Callbacks
  public onMessageReceived: ((message: ZegoBroadcastMessage) => void) | null = null
  public onUserListUpdated: ((users: ZegoUser[]) => void) | null = null
  public onConnectionError: ((error: string) => void) | null = null

  async initialize(): Promise<boolean> {
    try {
      console.log("[ZegoCloud] Starting initialization...")
      
      // For now, let's simulate a working connection to test the UI
      // This will help us verify the app works before dealing with SDK issues
      console.log("[ZegoCloud] Using simulation mode for testing...")
      
      // Simulate successful initialization
      this.isInitialized = true
      
      // Simulate some delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      console.log("[ZegoCloud] Simulation mode initialized successfully, isInitialized:", this.isInitialized)
      return true
    } catch (error) {
      console.error("[ZegoCloud] Failed to initialize:", error)
      this.onConnectionError?.(`Failed to initialize ZegoCloud SDK: ${error}`)
      return false
    }
  }

  private handleUserUpdate(roomID: string, updateType: number, userList: any[]) {
    if (roomID !== this.currentRoomID) return

    const users: ZegoUser[] = userList.map(user => ({
      userID: user.userID,
      userName: user.userName
    }))

    this.onUserListUpdated?.(users)
  }

  private handleIncomingMessage(roomID: string, chatData: any) {
    if (roomID !== this.currentRoomID) return

    const message: ZegoBroadcastMessage = {
      message: chatData.message,
      messageID: chatData.messageID,
      sendTime: chatData.timestamp,
      fromUser: {
        userID: chatData.fromUser.userID,
        userName: chatData.fromUser.userName
      }
    }

    this.onMessageReceived?.(message)
  }

  async joinRoom(username: string): Promise<boolean> {
    try {
      console.log("[ZegoCloud] joinRoom called with username:", username)
      console.log("[ZegoCloud] isInitialized before check:", this.isInitialized)
      
      if (!this.isInitialized) {
        console.log("[ZegoCloud] Not initialized, calling initialize...")
        const success = await this.initialize()
        console.log("[ZegoCloud] Initialize result:", success)
        if (!success) return false
      }

      this.currentUserID = generateUserID()
      this.currentRoomID = ZEGOCLOUD_CONFIG.roomID

      console.log(`[ZegoCloud] Joining room ${this.currentRoomID} as ${username} (simulation mode)`)
      
      // Simulate successful room join immediately
      console.log("[ZegoCloud] Updating user list immediately...")
      this.onUserListUpdated?.([
        { userID: this.currentUserID, userName: username }
      ])
      
      // Simulate a demo user joining after 2 seconds
      setTimeout(() => {
        console.log("[ZegoCloud] Adding demo user...")
        this.onUserListUpdated?.([
          { userID: this.currentUserID, userName: username },
          { userID: generateUserID(), userName: "Demo User" }
        ])
        
        // Send a demo message after 3 seconds
        setTimeout(() => {
          console.log("[ZegoCloud] Sending demo message...")
          this.simulateIncomingMessage("Demo User", "Hello! This is a demo message to test the chat functionality. 👋")
        }, 1000)
      }, 2000)

      console.log("[ZegoCloud] joinRoom returning true")
      return true
    } catch (error) {
      console.error("[ZegoCloud] Failed to join room:", error)
      this.onConnectionError?.(`Failed to join chat room: ${error}`)
      return false
    }
  }

  async sendMessage(message: string): Promise<boolean> {
    try {
      console.log("[ZegoCloud] sendMessage called with:", message)
      console.log("[ZegoCloud] isInitialized:", this.isInitialized)
      
      if (!this.isInitialized) {
        console.log("[ZegoCloud] SDK not initialized for sending message")
        throw new Error("SDK not initialized")
      }

      console.log(`[ZegoCloud] Sending message: ${message} (simulation mode)`)

      // Simulate message sending - in simulation mode, messages are sent successfully
      console.log("[ZegoCloud] Message sent successfully in simulation mode")
      return true
    } catch (error) {
      console.error("[ZegoCloud] Failed to send message:", error)
      this.onConnectionError?.(`Failed to send message: ${error}`)
      return false
    }
  }

  async leaveRoom(): Promise<void> {
    try {
      if (this.isInitialized && this.currentRoomID) {
        console.log("[ZegoCloud] Leaving room... (simulation mode)")
        this.currentRoomID = ""
      }
    } catch (error) {
      console.error("[ZegoCloud] Error leaving room:", error)
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.leaveRoom()
      this.isInitialized = false
      console.log("[ZegoCloud] Service destroyed (simulation mode)")
    } catch (error) {
      console.error("[ZegoCloud] Error destroying service:", error)
    }
  }

  // Simulate receiving messages (for demo purposes when SDK is not available)
  simulateIncomingMessage(username: string, message: string): void {
    if (this.onMessageReceived) {
      const simulatedMessage: ZegoBroadcastMessage = {
        message,
        messageID: Date.now(),
        sendTime: Date.now(),
        fromUser: {
          userID: generateUserID(),
          userName: username,
        },
      }
      this.onMessageReceived(simulatedMessage)
    }
  }

  // Simulate user joining/leaving (for demo purposes when SDK is not available)
  simulateUserUpdate(users: ZegoUser[]): void {
    this.onUserListUpdated?.(users)
  }
}

export const zegoService = new ZegoCloudService()
export type { ZegoUser, ZegoBroadcastMessage }
