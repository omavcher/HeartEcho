export const metadata = {
  title: { absolute: "Influencer Referral Program — Earn Money | HeartEcho" },
  description: "Join our affiliate program for content creators. Earn ₹20 for every user signup and 15% commission on subscriptions. No follower requirements. Secure dashboard access.",
  keywords: [
    "referral program", "influencer marketing", "affiliate program", "earn money online", 
    "content creator", "social media earnings", "commission based income", "referral code", 
    "influencer partnership"
  ],
  alternates: {
    canonical: 'https://heartecho.in/referral',
  },
  openGraph: {
    title: "Influencer Referral Program — Earn Money | HeartEcho",
    description: "Join our creator affiliate program and earn ₹20 per signup + 15% commission on subscriptions. Perfect for influencers and content creators.",
    type: 'website',
    url: 'https://heartecho.in/referral',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Influencer Referral Program - Earn Money Online",
    description: "Join our affiliate program and earn commissions for referrals. Perfect for social media influencers and content creators.",
  }
};

export default function ReferralLayout({ children }) {
  return <>{children}</>;
}
