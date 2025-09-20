// ZegoCloud configuration
export const ZEGOCLOUD_CONFIG = {
  appID: 1151489427, // Replace with your actual ZegoCloud App ID from https://console.zegocloud.com
  serverSecret: "1702b72de29362f8122e9049b754e727", // Replace with your actual server secret from ZegoCloud console
  roomID: "global_chat_room",
}

// Generate a random user ID
export const generateUserID = (): string => {
  return Math.random().toString(36).substring(2, 15)
}
