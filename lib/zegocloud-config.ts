// ZegoCloud configuration
export const ZEGOCLOUD_CONFIG = {
  appID: 1234567890, // Replace with your actual ZegoCloud App ID
  serverSecret: "your_server_secret_here", // Replace with your actual server secret
  roomID: "global_chat_room",
}

// Generate a random user ID
export const generateUserID = (): string => {
  return Math.random().toString(36).substring(2, 15)
}
