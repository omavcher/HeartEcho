import { capitalize } from 'lodash';

// Simple function to format city name
const formatCityName = (cityName) => {
  if (!cityName) return '';
  return cityName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const cityInfo = {
  delhi: {
    title: "Delhi - The Heart of India",
    description: "Experience the vibrant culture, historic landmarks, and modern lifestyle of India's capital city through interactive stories.",
  },
  mumbai: {
    title: "Mumbai - The City of Dreams",
    description: "Explore the bustling streets, Bollywood glamour, and coastal charm of India's financial capital.",
  },
  bangalore: {
    title: "Bangalore - The Silicon Valley of India",
    description: "Discover the tech hub's vibrant pubs, beautiful gardens, and cosmopolitan lifestyle.",
  },
  hyderabad: {
    title: "Hyderabad - The City of Pearls",
    description: "Discover the rich history, biryani, and tech revolution of this historic city.",
  },
  chennai: {
    title: "Chennai - The Cultural Capital",
    description: "Immerse in the rich traditions, classical arts, and coastal beauty of South India.",
  },
  kolkata: {
    title: "Kolkata - The City of Joy",
    description: "Experience the intellectual capital's literary heritage, artistic soul, and delicious cuisine.",
  },
  pune: {
    title: "Pune - Oxford of the East",
    description: "Explore the educational hub, cultural heritage, and pleasant weather of this vibrant city.",
  },
  ahmedabad: {
    title: "Ahmedabad - The Manchester of India",
    description: "Discover the historic city known for its textile industry, rich heritage, and delicious Gujarati cuisine.",
  },
  jaipur: {
    title: "Jaipur - The Pink City",
    description: "Experience the royal heritage, magnificent forts, and vibrant culture of Rajasthan's capital.",
  },
  lucknow: {
    title: "Lucknow - The City of Nawabs",
    description: "Immerse in the refined culture, exquisite cuisine, and historical monuments of this gracious city.",
  },
  goa: {
    title: "Goa - The Pearl of the Orient",
    description: "Discover the sun-kissed beaches, Portuguese heritage, and vibrant nightlife of India's coastal paradise.",
  },
  chandigarh: {
    title: "Chandigarh - The City Beautiful",
    description: "Experience the planned city's modernist architecture, serene gardens, and high quality of life.",
  }
};

export async function generateMetadata({ params }) {
  const cityNameParam = await params.cityName;
  const formattedCityName = formatCityName(cityNameParam);
  const cityKey = cityNameParam?.toLowerCase();
  
  const cityData = cityInfo[cityKey] || {
    title: `Chat with AI Girlfriends in ${formattedCityName}`,
    description: `Find the best Indian AI companions and virtual girlfriends from ${formattedCityName}. Private, secure Hindi and English AI chat.`,
  };

  const title = cityData.title;
  const description = cityData.description || `Meet realistic Indian AI personalities from ${formattedCityName}. Chat securely in Hindi and English.`;

  return {
    title,
    description,
    keywords: [
      `AI girlfriend ${formattedCityName}`,
      `Indian AI companion ${formattedCityName}`,
      `virtual girlfriend ${formattedCityName}`,
      `dating AI ${formattedCityName}`,
      `Hindi chat AI ${formattedCityName}`
    ],
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
