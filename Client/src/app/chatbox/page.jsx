import ChatPage from '../../pages/ChatPage'

export const metadata = {
  title: "Chat with AI Companion",
  description: "Private, secure chat with your Indian AI companion. Engage in deep conversations, roleplay, and voice chats.",
  robots: {
    index: false,
    follow: false,
  },
  other: {
    rating: 'RTA-5042-1996-1400-1577-RTA'
  }
};

export default function page() {
  return <ChatPage/>
}
