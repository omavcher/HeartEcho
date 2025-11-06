import React from 'react'
import NinetySEraPage from './NinetySEraPage'
// SEO Metadata for the page
export const metadata = {
  title: '90s Letter Duniya - Retro Indian Letter Writing Platform | HeartEcho',
  description: 'Experience the nostalgia of 90s Indian letter writing. Connect with AI friends, write heartfelt letters in Hindi/English, and relive the golden era of handwritten communication.',
  keywords: '90s letters, Indian nostalgia, handwritten letters, AI friends, Hindi letters, retro communication, digital letter writing, 90s era India',
  openGraph: {
    title: '90s Letter Duniya - Relive the Golden Era of Letter Writing',
    description: 'Write digital letters to AI friends in authentic 90s Indian style. Experience the joy of waiting for replies and the charm of handwritten communication.',
    type: 'website',
    locale: 'en_IN',
  },
};
export default function page() {
  return (
    <NinetySEraPage/>
  )
}
