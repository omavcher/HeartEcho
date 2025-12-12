// Client/src/app/hot-stories/[slug]/metadata.js
import api from '../../../config/api';

export async function generateMetadata({ params }) {
  const slug = params.slug;

  try {
    const res = await fetch(`${api.Url}/story/getbyid/${slug}`, {
      next: { revalidate: 300 }
    });

    if (!res.ok) return { title: 'Story Not Found' };

    const json = await res.json();
    if (!json.success || !json.data) return { title: 'Story Loading...' };

    const s = json.data;

    return {
      title: `${s.title} - ${s.characterName} ki Hot ${s.category} Sex Story in Hindi & English`,
      description: s.excerpt || `${s.characterName}, ${s.characterAge} saal ki sexy ${s.category} from ${s.city}. Puri garam kahani padho aur character se chat karo.`,
      keywords: [
        `${s.category} sex story`,
        `hindi sex kahani`,
        `${s.characterName} ki chudai`,
        `desi ${s.category.toLowerCase()} kahani`,
        `indian erotic stories`,
        `${s.city} bhabhi story`,
        'adult hindi stories',
        ...s.tags
      ].join(', '),
      alternates: {
        canonical: `https://heartecho.in/hot-stories/${slug}`,
      },
      openGraph: {
        title: `${s.title} - ${s.characterName} ki Sex Story`,
        description: s.excerpt || "Full hot story + live chat with character",
        url: `https://heartecho.in/hot-stories/${slug}`,
        images: [
          { url: s.characterAvatar, width: 400, height: 711 },
          { url: s.backgroundImage, width: 1200, height: 675 }
        ],
        type: 'article',
        locale: 'hi_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title: s.title,
        description: s.excerpt || "Click to read full erotic story",
        images: [s.characterAvatar],
      },
      robots: 'index, follow',
    };
  } catch {
    return {
      title: 'Hot Desi Story - Hindi Sex Kahani',
      description: 'Latest Indian erotic stories in Hindi and English',
    };
  }
}