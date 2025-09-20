# ZegoCloud Chat Application

A modern, real-time chat application built with Next.js and ZegoCloud SDK for instant messaging.

![Chat App Demo](https://img.shields.io/badge/Demo-Live-brightgreen) ![Next.js](https://img.shields.io/badge/Next.js-14-black) ![TypeScript](https://img.shields.io/badge/TypeScript-95.4%25-blue) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## 🌟 Features

- **Real-time messaging** with instant delivery
- **User presence indicators** showing online/offline status
- **Responsive design** that works on desktop and mobile
- **Modern UI** with dark theme and smooth animations
- **Demo mode** for testing without SDK setup
- **Connection status monitoring** with error handling
- **Message timestamps** and user identification
- **Clean and intuitive interface**

## 🚀 Live Demo

Visit the live application: **[zegocloud-chat-app.vercel.app](https://zegocloud-chat-app.vercel.app)**

## 📸 Screenshots

### Login Page
Clean and modern login interface with demo mode instructions.

### Chat Interface
- Real-time messaging with user presence
- Connection status indicators
- Responsive sidebar with online users
- Message history with timestamps

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Real-time**: ZegoCloud SDK (with demo mode fallback)
- **Deployment**: Vercel
- **Icons**: Lucide React

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js 18+ 
- npm or pnpm

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/hemant3991/zegocloud-chat-app.git
   cd zegocloud-chat-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration

### Demo Mode (Default)
The app runs in demo mode by default, which simulates real-time messaging without requiring ZegoCloud credentials.

### Production Setup
To use with real ZegoCloud SDK:

1. **Get ZegoCloud credentials**
   - Visit [ZegoCloud Console](https://console.zegocloud.com)
   - Create a project and get your App ID and Server Secret

2. **Update configuration**
   ```typescript
   // lib/zegocloud-config.ts
   export const ZEGOCLOUD_CONFIG = {
     appID: YOUR_APP_ID, // Replace with your actual App ID
     serverSecret: "YOUR_SERVER_SECRET", // Replace with your Server Secret
     roomID: "global_chat_room",
   }
   ```

3. **Enable real SDK**
   - Update `lib/zegocloud-service.ts` to use actual ZegoCloud SDK calls
   - Add ZegoCloud SDK script to `app/layout.tsx`

## 📁 Project Structure

```
zegocloud-chat-app/
├── app/                    # Next.js app router
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── chat-page.tsx      # Main chat interface
│   ├── login-page.tsx     # Login form
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── zegocloud-config.ts    # ZegoCloud configuration
│   ├── zegocloud-service.ts   # Chat service logic
│   └── utils.ts              # Helper functions
├── public/               # Static assets
└── styles/              # Additional styles
```

## 🎯 Usage

### Demo Mode
1. Enter any username on the login page
2. Join the chat room
3. See demo user and messages
4. Send messages that appear instantly
5. Test all UI functionality

### Multi-User Testing
1. Open multiple browser tabs
2. Use different usernames in each tab
3. Send messages between tabs
4. See real-time updates across all sessions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Key Components

- **ChatPage**: Main chat interface with messaging and user list
- **LoginPage**: User authentication and demo mode info
- **ZegoCloudService**: Handles real-time messaging logic
- **UI Components**: Reusable components from Radix UI

## 🚀 Deployment

The app is automatically deployed to Vercel on every push to the main branch.

### Manual Deployment

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy to your preferred platform**
   - Vercel (recommended)
   - Netlify
   - AWS Amplify
   - Any Node.js hosting service

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [ZegoCloud](https://www.zegocloud.com/) for the real-time messaging SDK
- [Next.js](https://nextjs.org/) for the React framework
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible components
- [Lucide](https://lucide.dev/) for beautiful icons

## 📞 Support

If you have any questions or need help:
- Open an issue on GitHub
- Check the [ZegoCloud Documentation](https://docs.zegocloud.com/)
- Review the demo mode for testing

---

**Built with ❤️ using Next.js and ZegoCloud**
