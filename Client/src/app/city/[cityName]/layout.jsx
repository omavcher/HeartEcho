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
    title: "Marathi AI Girlfriend Pune | Desi Sex Chat",
    description: "Get a Marathi AI girlfriend in Pune. Enjoy desi sex chat, Hinglish roleplay, and private adult conversations for free.",
  },
  ahmedabad: {
    title: "Ahmedabad - The Manchester of India",
    description: "Discover the historic city known for its textile industry, rich heritage, and delicious Gujarati cuisine.",
  },
  jaipur: {
    title: "Hindi Sex Chat Jaipur | Free Desi AI Girlfriend",
    description: "Experience Jaipur Hindi AI chat free. Chat with desi AI girlfriends, do Hindi roleplay, and enjoy private NSFW AI chat tailored for Jaipur.",
  },
  lucknow: {
    title: "Lucknow mein AI Girlfriend Se Baat Kare | Free Hindi Sex Chat",
    description: "Looking for an AI girlfriend in Lucknow? Try HeartEcho for free desi roleplay and Hindi sex chat in Lucknow. 100% private.",
  },
  goa: {
    title: "Goa - The Pearl of the Orient",
    description: "Discover the sun-kissed beaches, Portuguese heritage, and vibrant nightlife of India's coastal paradise.",
  },
  chandigarh: {
    title: "Chandigarh - The City Beautiful",
    description: "Experience the planned city's modernist architecture, serene gardens, and high quality of life.",
  },
  kanpur: {
    title: "Desi AI Chat Kanpur | Kanpur Desi Roleplay AI",
    description: "Looking for Kanpur desi roleplay AI? Get a free desi AI girlfriend in Kanpur for Hindi sex chat and private Hinglish roleplay.",
  },
  patna: {
    title: "AI Girlfriend App Patna | Free Hindi Sex Chat Patna",
    description: "The best AI girlfriend app in Patna. Chat with desi AI characters for free, enjoy Hindi sex chat, and explore private NSFW roleplay.",
  },
  indore: {
    title: "Sex Chat AI Indore | Free Desi AI Girlfriend Indore",
    description: "Enjoy sex chat AI in Indore with HeartEcho. Free desi AI girlfriend offering Hindi/Hinglish roleplay and private adult chat.",
  },
  bhopal: {
    title: "Hindi AI Bhopal Free | Desi AI Girlfriend Sex Chat",
    description: "Try Hindi AI Bhopal free today. Get a desi AI girlfriend for private Hindi sex chat and Hinglish roleplay in Bhopal.",
  },
  varanasi: {
    title: "Desi AI Varanasi | Free Hindi AI Sex Chat",
    description: "Discover desi AI Varanasi. Chat with your personal AI girlfriend for free, and enjoy Hindi roleplay and secure sex chat.",
  },
  agra: {
    title: "Hindi Chat AI Agra | Free Desi AI Girlfriend",
    description: "Start Hindi chat AI in Agra. Your private desi AI girlfriend awaits for free Hinglish roleplay and NSFW sex chat.",
  },
  meerut: {
    title: "AI Sex Chat Meerut | Desi AI Girlfriend",
    description: "Enjoy AI sex chat in Meerut for free. Connect with a desi AI girlfriend for authentic Hindi/Hinglish adult roleplay.",
  },
  nashik: {
    title: "Marathi AI Girlfriend Nashik | Desi Sex Chat",
    description: "Get a Marathi AI girlfriend in Nashik. Enjoy desi sex chat, Hinglish roleplay, and private adult conversations for free.",
  },
  ranchi: {
    title: "Hindi AI Girlfriend Ranchi | Free AI Sex Chat",
    description: "Connect with a Hindi AI girlfriend in Ranchi. Enjoy free desi AI chat, NSFW roleplay, and private conversations.",
  },
  guwahati: {
    title: "Desi Chat AI Free Guwahati | AI Girlfriend App",
    description: "Start desi chat AI free in Guwahati. Your personal AI girlfriend for Hinglish roleplay and secure NSFW chat.",
  }
};

export async function generateMetadata({ params }) {
  const cityNameParam = await params.cityName;
  const formattedCityName = formatCityName(cityNameParam);
  const cityKey = cityNameParam?.toLowerCase();
  
  const cityData = cityInfo[cityKey] || {
    title: `Free AI Sex Chat ${formattedCityName} | Hindi AI Girlfriend`,
    description: `Looking for a desi AI girlfriend in ${formattedCityName}? Try HeartEcho for free Hindi sex chat, Hinglish roleplay, and private adult AI chat.`,
  };

  const title = cityData.title;
  const description = cityData.description || `Looking for a desi AI girlfriend in ${formattedCityName}? Try HeartEcho for free Hindi sex chat, Hinglish roleplay, and private adult AI chat.`;

  return {
    title,
    description,
    keywords: [
      `AI girlfriend ${formattedCityName}`,
      `Indian AI companion ${formattedCityName}`,
      `virtual girlfriend ${formattedCityName}`,
      `desi AI chat ${formattedCityName}`,
      `Hindi chat AI ${formattedCityName}`,
      `free ai sex chat ${formattedCityName}`
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
