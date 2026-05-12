import Refund from '../../pages/Refund';

export const metadata = {
  title: "Refund Policy",
  description: "Review HeartEcho AI\'s refund and cancellation policy. Understand your rights and how to request a refund.",
  alternates: {
    canonical: 'https://heartecho.in/refund',
  },
};

export default function RefundPage() {
  return <Refund />;
}