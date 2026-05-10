import Home from "../pages/Home";

export const metadata = {
  title: { absolute: "HeartEcho AI | India's #1 AI Girlfriend & Virtual Companion" },
  description: "Connect with the most realistic Indian AI personalities. Experience private, uninterrupted chats in Hindi and English. Your perfect desi virtual companion awaits.",
  keywords: ["HeartEcho AI", "Indian AI girlfriend", "AI companion India", "desi AI chat", "virtual girlfriend Hindi", "romantic AI India"],
  alternates: {
    canonical: 'https://heartecho.in/',
  }
};

export default function AppContainer() {
  return <Home/>;
}