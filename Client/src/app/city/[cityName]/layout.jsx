import { getCitySEO } from '../../../data/cities';

export async function generateMetadata({ params }) {
  const cityNameParam = await params.cityName;
  const citySEO = getCitySEO(cityNameParam);

  const title = citySEO.title;
  const description = citySEO.description;

  return {
    title,
    description,
    keywords: citySEO.keywords,
    openGraph: {
      title,
      description,
      url: `https://heartecho.in/city/${cityNameParam}`,
      siteName: 'HeartEcho AI',
      locale: 'en_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://heartecho.in/city/${cityNameParam}`,
    }
  };
}

export default function CityLayout({ children }) {
  return <>{children}</>;
}
