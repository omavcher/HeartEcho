import Contact from '../../pages/Contact'

export const metadata = {
  title: "Contact",
  description: "Get in touch with the HeartEcho AI team. We\'re here to help with any questions about your AI companion experience.",
  alternates: {
    canonical: 'https://heartecho.in/contact',
  },
};

export default function page() {
  return <Contact/>
}
