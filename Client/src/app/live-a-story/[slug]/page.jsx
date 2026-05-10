import LiveStoryPage from "../../../pages/LiveStoryPage";
import api from "../../../config/api";

export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    
    // Attempt to get the story info
    const res = await fetch(`${api.Url}/live-story/stories`, { next: { revalidate: 300 } });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.stories) {
        const story = data.stories.find(s => s.slug === slug);
        if (story) {
          return {
            title: `${story.title} - Live Interactive Story | HeartEcho AI`,
            description: `Experience ${story.title}, a live interactive story in the ${story.category} category. Chat live and influence the outcome.`,
            keywords: [`${story.title}`, `${story.category} interactive story`, "live chat story", "Indian AI roleplay"],
            openGraph: {
              title: `${story.title} - Live Interactive Story`,
              description: `Experience ${story.title}, a live interactive story. Chat live and influence the outcome.`,
              url: `https://heartecho.in/live-a-story/${slug}`,
              images: [{ url: story.poster || '/api/placeholder/1200/630' }]
            },
            alternates: {
              canonical: `https://heartecho.in/live-a-story/${slug}`,
            }
          };
        }
      }
    }
  } catch (error) {
    console.error("Error generating metadata for live story:", error);
  }
  
  return {
    title: "Live Interactive Story | HeartEcho AI",
    description: "Experience dynamic, live interactive stories with Indian characters.",
  };
}

export default function Page() {
  return <LiveStoryPage />;
}
