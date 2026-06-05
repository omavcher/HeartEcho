import { getCitySEO } from '../../../data/cities';

export async function generateMetadata({ params }) {
  const { cityName } = await params;
  const citySEO = getCitySEO(cityName);

  const title = citySEO.title;
  const description = citySEO.description;
  const fullTitle = `${title} | HeartEcho`;

  return {
    title,
    description,
    keywords: citySEO.keywords,
    openGraph: {
      title: fullTitle,
      description,
      url: `https://heartecho.in/city/${cityName}`,
      siteName: 'HeartEcho AI',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
    },
    alternates: {
      canonical: `https://heartecho.in/city/${cityName}`,
    }
  };
}

export default function CityLayout({ children }) {
  return <>{children}</>;
}
