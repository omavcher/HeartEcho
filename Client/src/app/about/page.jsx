import About from '../../pages/About'

export const metadata = {
  title: "About Us",
  description: "Learn about HeartEcho AI, India's premier platform for private, interactive AI companions. Our mission is to provide secure, culturally resonant virtual companionship.",
  keywords: ["About HeartEcho AI", "Indian AI companions", "virtual girlfriend company", "desi AI team", "HeartEcho mission"],
  alternates: {
    canonical: 'https://heartecho.in/about',
  }
};

export default function page() {
  return <About/>
}
