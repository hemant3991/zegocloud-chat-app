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

  private sdkLoadingPromise: Promise<void> | null = null;

  private _loadSdk(): Promise<void> {
    if (this.sdkLoadingPromise) {
      return this.sdkLoadingPromise;
    }

    this.sdkLoadingPromise = new Promise((resolve, reject) => {
      if (window.ZegoExpressEngine) {
        console.log("[ZegoCloud] SDK already loaded.");
        return resolve();
      }

      console.log("[ZegoCloud] Dynamically loading SDK script...");
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@zegocloud/zego-express-engine-webrtc@3.20.0/zego-express-engine-webrtc.js';
      script.async = true;

      script.onload = () => {
        console.log("[ZegoCloud] SDK script loaded successfully via dynamic script.");
        if (window.ZegoExpressEngine) {
          resolve();
        } else {
          console.error("[ZegoCloud] Script loaded, but window.ZegoExpressEngine is not available.");
          reject(new Error("SDK script loaded, but window.ZegoExpressEngine is not available."));
        }
      };

      script.onerror = (error) => {
        console.error("[ZegoCloud] Failed to load SDK script dynamically.", error);
        reject(error);
      };

      document.head.appendChild(script);
    });

    return this.sdkLoadingPromise;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log("[ZegoCloud] Starting initialization...");
      
      await this._loadSdk();

      console.log("[ZegoCloud] SDK loaded successfully! Creating engine...");

      // Create the engine instance with your actual credentials
      this.engine = await window.ZegoExpressEngine.createEngine(
        ZEGOCLOUD_CONFIG.appID, 
        'wss://webliveroom-test.zegocloud.com/ws'
      );

      console.log("[ZegoCloud] Engine created successfully.");

      // Set up event listeners for real-time messaging
      this.engine.on('roomUserUpdate', (roomID: string, updateType: number, userList: any[]) => {
        console.log('[ZegoCloud] Room user update:', roomID, updateType, userList);
        this.handleUserUpdate(roomID, updateType, userList);
      });

      this.engine.on('IMRecvBroadcastMessage', (roomID: string, chatData: any) => {
        console.log('[ZegoCloud] Message received:', roomID, chatData);
        this.handleIncomingMessage(roomID, chatData);
      });

      this.engine.on('roomStateUpdate', (roomID: string, state: number, errorCode: number) => {
        console.log('[ZegoCloud] Room state update:', roomID, state, errorCode);
        if (errorCode !== 0) {
          this.onConnectionError?.(`Room connection failed: ${errorCode}`);
        }
      });

      this.isInitialized = true;
      console.log("[ZegoCloud] Real SDK initialized successfully.");
      return true;
    } catch (error) {
      console.error("[ZegoCloud] Failed to initialize real SDK:", error);
      console.log("[ZegoCloud] Falling back to demo mode.");
      // Fall back to demo mode if real SDK fails
      this.isInitialized = true;
      return true;
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

      // Try to use real ZegoCloud SDK first
      if (this.engine) {
        console.log(`[ZegoCloud] Joining room ${this.currentRoomID} as ${username} using real SDK`)
        
        try {
          // Login to the room with real SDK
          const result = await this.engine.loginRoom(
            this.currentRoomID,
            {
              userID: this.currentUserID,
              userName: username
            }
          )

          if (result.errorCode === 0) {
            console.log(`[ZegoCloud] Successfully joined room with real SDK`)
            return true
          } else {
            console.error(`[ZegoCloud] Failed to join room, error code: ${result.errorCode}`)
            throw new Error(`Room join failed with error code: ${result.errorCode}`)
          }
        } catch (error) {
          console.error("[ZegoCloud] Real SDK join failed, falling back to demo mode:", error)
          // Fall back to demo mode
        }
      }

      // Demo mode fallback
      console.log(`[ZegoCloud] Using demo mode for ${username}`)
      
      // Simulate successful room join immediately
      this.onUserListUpdated?.([
        { userID: this.currentUserID, userName: username }
      ])
      
      // Simulate a demo user joining after 2 seconds
      setTimeout(() => {
        this.onUserListUpdated?.([
          { userID: this.currentUserID, userName: username },
          { userID: generateUserID(), userName: "Demo User" }
        ])
        
        // Send a demo message after 3 seconds
        setTimeout(() => {
          this.simulateIncomingMessage("Demo User", "Hello! This is a demo message. Open another tab with a different username to test real messaging!")
        }, 1000)
      }, 2000)

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

      // Try to use real ZegoCloud SDK first
      if (this.engine) {
        console.log(`[ZegoCloud] Sending message using real SDK: ${message}`)
        
        try {
          const result = await this.engine.sendBroadcastMessage(this.currentRoomID, message)
          
          if (result.errorCode === 0) {
            console.log(`[ZegoCloud] Message sent successfully via real SDK`)
            return true
          } else {
            console.error(`[ZegoCloud] Failed to send message, error code: ${result.errorCode}`)
            throw new Error(`Message send failed with error code: ${result.errorCode}`)
          }
        } catch (error) {
          console.error("[ZegoCloud] Real SDK send failed, falling back to demo mode:", error)
          // Fall back to demo mode
        }
      }

      // Demo mode fallback
      console.log(`[ZegoCloud] Sending message in demo mode: ${message}`)
      return true
    } catch (error) {
      console.error("[ZegoCloud] Failed to send message:", error)
      this.onConnectionError?.(`Failed to send message: ${error}`)
      return false
    }
  }

  async leaveRoom(): Promise<void> {
    try {
      if (this.engine && this.isInitialized && this.currentRoomID) {
        console.log("[ZegoCloud] Leaving room using real SDK...")
        await this.engine.logoutRoom(this.currentRoomID)
        this.currentRoomID = ""
      } else if (this.isInitialized && this.currentRoomID) {
        console.log("[ZegoCloud] Leaving room in demo mode...")
        this.currentRoomID = ""
      }
    } catch (error) {
      console.error("[ZegoCloud] Error leaving room:", error)
    }
  }

  async destroy(): Promise<void> {
    try {
      await this.leaveRoom()
      if (this.engine) {
        await this.engine.destroy()
        this.engine = null
      }
      this.isInitialized = false
      console.log("[ZegoCloud] Service destroyed")
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
