import LiveStoryListingPage from "../../pages/LiveStoryListingPage";

export const metadata = {
  title: "Live Interactive Indian Stories",
  description: "Experience dynamic, live interactive stories with Indian characters. Influence the narrative, chat live, and build your own story.",
  keywords: ["live interactive stories", "Indian AI roleplay", "live chat stories", "interactive fiction India", "HeartEcho live stories"],
  alternates: {
    canonical: 'https://heartecho.in/live-a-story',
  }
};

export default function Page() {
  return <LiveStoryListingPage />;
}
