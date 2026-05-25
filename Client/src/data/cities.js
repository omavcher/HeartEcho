// Client/src/data/cities.js

export const formatCityName = (cityName) => {
  if (!cityName) return '';
  return cityName.trim().replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export const citiesList = [
  // Tier 1
  { name: 'Mumbai', key: 'mumbai', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Delhi', key: 'delhi', state: 'Delhi', lang: 'Hindi' },
  { name: 'Bangalore', key: 'bangalore', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Hyderabad', key: 'hyderabad', state: 'Telangana', lang: 'Telugu' },
  { name: 'Ahmedabad', key: 'ahmedabad', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Chennai', key: 'chennai', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Kolkata', key: 'kolkata', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Pune', key: 'pune', state: 'Maharashtra', lang: 'Marathi' },

  // Tier 2 & Tier 3
  { name: 'Jaipur', key: 'jaipur', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Lucknow', key: 'lucknow', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Kanpur', key: 'kanpur', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Nagpur', key: 'nagpur', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Indore', key: 'indore', state: 'Madhya Pradesh', lang: 'Hindi' },
  { name: 'Thane', key: 'thane', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Bhopal', key: 'bhopal', state: 'Madhya Pradesh', lang: 'Hindi' },
  { name: 'Visakhapatnam', key: 'visakhapatnam', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Pimpri-Chinchwad', key: 'pimpri-chinchwad', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Patna', key: 'patna', state: 'Bihar', lang: 'Hindi' },
  { name: 'Vadodara', key: 'vadodara', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Ghaziabad', key: 'ghaziabad', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Ludhiana', key: 'ludhiana', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Coimbatore', key: 'coimbatore', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Agra', key: 'agra', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Madurai', key: 'madurai', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Nashik', key: 'nashik', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Faridabad', key: 'faridabad', state: 'Haryana', lang: 'Hindi' },
  { name: 'Meerut', key: 'meerut', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Rajkot', key: 'rajkot', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Kalyan-Dombivli', key: 'kalyan-dombivli', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Vasai-Virar', key: 'vasai-virar', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Varanasi', key: 'varanasi', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Srinagar', key: 'srinagar', state: 'Jammu and Kashmir', lang: 'Hindi' },
  { name: 'Aurangabad', key: 'aurangabad', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Dhanbad', key: 'dhanbad', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Amritsar', key: 'amritsar', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Navi Mumbai', key: 'navi-mumbai', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Allahabad', key: 'allahabad', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Ranchi', key: 'ranchi', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Howrah', key: 'howrah', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Jabalpur', key: 'jabalpur', state: 'Madhya Pradesh', lang: 'Hindi' },
  { name: 'Gwalior', key: 'gwalior', state: 'Madhya Pradesh', lang: 'Hindi' },
  { name: 'Vijayawada', key: 'vijayawada', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Jodhpur', key: 'jodhpur', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Raipur', key: 'raipur', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Kota', key: 'kota', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Guwahati', key: 'guwahati', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Chandigarh', key: 'chandigarh', state: 'Chandigarh', lang: 'Punjabi / Hindi' },
  { name: 'Solapur', key: 'solapur', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Hubli-Dharwad', key: 'hubli-dharwad', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Bareilly', key: 'bareilly', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Moradabad', key: 'moradabad', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Mysore', key: 'mysore', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Gurgaon', key: 'gurgaon', state: 'Haryana', lang: 'Hindi' },
  { name: 'Aligarh', key: 'aligarh', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Jalandhar', key: 'jalandhar', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Tiruchirappalli', key: 'tiruchirappalli', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Bhubaneswar', key: 'bhubaneswar', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Salem', key: 'salem', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Mira-Bhayandar', key: 'mira-bhayandar', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Warangal', key: 'warangal', state: 'Telangana', lang: 'Telugu' },
  { name: 'Jalgaon', key: 'jalgaon', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Guntur', key: 'guntur', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Bhilai', key: 'bhilai', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Amravati', key: 'amravati', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Noida', key: 'noida', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Jamshedpur', key: 'jamshedpur', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Bikaner', key: 'bikaner', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Kochi', key: 'kochi', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Cuttack', key: 'cuttack', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Firozabad', key: 'firozabad', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Bhavnagar', key: 'bhavnagar', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Dehradun', key: 'dehradun', state: 'Uttarakhand', lang: 'Hindi' },
  { name: 'Durgapur', key: 'durgapur', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Asansol', key: 'asansol', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Rourkela', key: 'rourkela', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Nanded', key: 'nanded', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Kolhapur', key: 'kolhapur', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Ajmer', key: 'ajmer', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Akola', key: 'akola', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Gulbarga', key: 'gulbarga', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Jamnagar', key: 'jamnagar', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Ujjain', key: 'ujjain', state: 'Madhya Pradesh', lang: 'Hindi' },
  { name: 'Loni', key: 'loni', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Jhansi', key: 'jhansi', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Nellore', key: 'nellore', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Jammu', key: 'jammu', state: 'Jammu and Kashmir', lang: 'Hindi' },
  { name: 'Belgaum', key: 'belgaum', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Mangalore', key: 'mangalore', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Tirunelveli', key: 'tirunelveli', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Malappuram', key: 'malappuram', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Gaya', key: 'gaya', state: 'Bihar', lang: 'Hindi' },
  { name: 'Udaipur', key: 'udaipur', state: 'Rajasthan', lang: 'Hindi' },
  { name: 'Siliguri', key: 'siliguri', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Gorakhpur', key: 'gorakhpur', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Muzaffarpur', key: 'muzaffarpur', state: 'Bihar', lang: 'Hindi' },
  { name: 'Shimla', key: 'shimla', state: 'Himachal Pradesh', lang: 'Hindi' },
  { name: 'Haridwar', key: 'haridwar', state: 'Uttarakhand', lang: 'Hindi' },
  { name: 'Rishikesh', key: 'rishikesh', state: 'Uttarakhand', lang: 'Hindi' },
  { name: 'Mathura', key: 'mathura', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Vrindavan', key: 'vrindavan', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Ayodhya', key: 'ayodhya', state: 'Uttar Pradesh', lang: 'Hindi' },
  { name: 'Rohtak', key: 'rohtak', state: 'Haryana', lang: 'Hindi' },
  { name: 'Karnal', key: 'karnal', state: 'Haryana', lang: 'Hindi' },
  { name: 'Panipat', key: 'panipat', state: 'Haryana', lang: 'Hindi' },
  { name: 'Hisar', key: 'hisar', state: 'Haryana', lang: 'Hindi' },
  { name: 'Bathinda', key: 'bathinda', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Patiala', key: 'patiala', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Hoshiarpur', key: 'hoshiarpur', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Pathankot', key: 'pathankot', state: 'Punjab', lang: 'Punjabi' },
  { name: 'Gandhinagar', key: 'gandhinagar', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Anand', key: 'anand', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Navsari', key: 'navsari', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Vapi', key: 'vapi', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Valsad', key: 'valsad', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Bharuch', key: 'bharuch', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Junagadh', key: 'junagadh', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Bhuj', key: 'bhuj', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Porbandar', key: 'porbandar', state: 'Gujarat', lang: 'Gujarati' },
  { name: 'Shirdi', key: 'shirdi', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Latur', key: 'latur', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Satara', key: 'satara', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Sangli', key: 'sangli', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Ratnagiri', key: 'ratnagiri', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Dhule', key: 'dhule', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Chandrapur', key: 'chandrapur', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Yavatmal', key: 'yavatmal', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Ahmednagar', key: 'ahmednagar', state: 'Maharashtra', lang: 'Marathi' },
  { name: 'Tirupati', key: 'tirupati', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Kadapa', key: 'kadapa', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Kurnool', key: 'kurnool', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Anantapur', key: 'anantapur', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Rajahmundry', key: 'rajahmundry', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Kakinada', key: 'kakinada', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Ongole', key: 'ongole', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Eluru', key: 'eluru', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Vizianagaram', key: 'vizianagaram', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Srikakulam', key: 'srikakulam', state: 'Andhra Pradesh', lang: 'Telugu' },
  { name: 'Nizamabad', key: 'nizamabad', state: 'Telangana', lang: 'Telugu' },
  { name: 'Karimnagar', key: 'karimnagar', state: 'Telangana', lang: 'Telugu' },
  { name: 'Khammam', key: 'khammam', state: 'Telangana', lang: 'Telugu' },
  { name: 'Ramagundam', key: 'ramagundam', state: 'Telangana', lang: 'Telugu' },
  { name: 'Davanagere', key: 'davanagere', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Bellary', key: 'bellary', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Tumkur', key: 'tumkur', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Shimoga', key: 'shimoga', state: 'Karnataka', lang: 'Kannada' },
  { name: 'Kozhikode', key: 'kozhikode', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Thrissur', key: 'thrissur', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Kollam', key: 'kollam', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Alappuzha', key: 'alappuzha', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Palakkad', key: 'palakkad', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Kannur', key: 'kannur', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Kottayam', key: 'kottayam', state: 'Kerala', lang: 'Malayalam' },
  { name: 'Tiruppur', key: 'tiruppur', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Erode', key: 'erode', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Vellore', key: 'vellore', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Thoothukudi', key: 'thoothukudi', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Dindigul', key: 'dindigul', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Thanjavur', key: 'thanjavur', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Ranipet', key: 'ranipet', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Sivakasi', key: 'sivakasi', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Karur', key: 'karur', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Ooty', key: 'ooty', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Rameswaram', key: 'rameswaram', state: 'Tamil Nadu', lang: 'Tamil' },
  { name: 'Durg', key: 'durg', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Bilaspur', key: 'bilaspur', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Korba', key: 'korba', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Rajnandgaon', key: 'rajnandgaon', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Jagdalpur', key: 'jagdalpur', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Ambikapur', key: 'ambikapur', state: 'Chhattisgarh', lang: 'Hindi' },
  { name: 'Bokaro Steel City', key: 'bokaro-steel-city', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Hazaribagh', key: 'hazaribagh', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Deoghar', key: 'deoghar', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Giridih', key: 'giridih', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Phusro', key: 'phusro', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Ramgarh', key: 'ramgarh', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Daltonganj', key: 'daltonganj', state: 'Jharkhand', lang: 'Hindi' },
  { name: 'Sambalpur', key: 'sambalpur', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Berhampur', key: 'berhampur', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Balasore', key: 'balasore', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Bhadrak', key: 'bhadrak', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Baripada', key: 'baripada', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Puri', key: 'puri', state: 'Odisha', lang: 'Hindi / English' },
  { name: 'Bardhaman', key: 'bardhaman', state: 'West Bengal', lang: 'Bengali' },
  { name: 'English Bazar', key: 'english-bazar', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Baharampur', key: 'baharampur', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Habra', key: 'habra', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Jalpaiguri', key: 'jalpaiguri', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Darjeeling', key: 'darjeeling', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Haldia', key: 'haldia', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Midnapore', key: 'midnapore', state: 'West Bengal', lang: 'Bengali' },
  { name: 'Tezpur', key: 'tezpur', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Jorhat', key: 'jorhat', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Dibrugarh', key: 'dibrugarh', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Silchar', key: 'silchar', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Nagaon', key: 'nagaon', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Tinsukia', key: 'tinsukia', state: 'Assam', lang: 'Hindi / English' },
  { name: 'Shillong', key: 'shillong', state: 'Meghalaya', lang: 'Hindi / English' },
  { name: 'Imphal', key: 'imphal', state: 'Manipur', lang: 'Hindi / English' },
  { name: 'Aizawl', key: 'aizawl', state: 'Mizoram', lang: 'Hindi / English' },
  { name: 'Agartala', key: 'agartala', state: 'Tripura', lang: 'Hindi / English' },
  { name: 'Kohima', key: 'kohima', state: 'Nagaland', lang: 'Hindi / English' },
  { name: 'Gangtok', key: 'gangtok', state: 'Sikkim', lang: 'Hindi / English' },
  { name: 'Itanagar', key: 'itanagar', state: 'Arunachal Pradesh', lang: 'Hindi / English' },
  { name: 'Port Blair', key: 'port-blair', state: 'Andaman and Nicobar Islands', lang: 'Hindi / English' },
  { name: 'Silvassa', key: 'silvassa', state: 'Dadra and Nagar Haveli', lang: 'Hindi / English' },
  { name: 'Daman', key: 'daman', state: 'Daman and Diu', lang: 'Hindi / English' }
];

export const getCityDetails = (key) => {
  if (!key) return null;
  const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '-');
  return citiesList.find(c => c.key === cleanKey || c.name.toLowerCase() === key.trim().toLowerCase()) || null;
};

export const getAllCities = () => {
  return citiesList;
};

export const getCitySEO = (key) => {
  const city = getCityDetails(key);
  const formattedName = city ? city.name : formatCityName(key);
  const stateName = city ? city.state : '';
  const lang = city ? city.lang : 'Hindi';

  let title = '';
  let description = '';

  if (lang === 'Marathi') {
    title = `Marathi AI Girlfriend ${formattedName} | Free Desi Sex Chat`;
    description = `Get your private Marathi AI girlfriend in ${formattedName} (${stateName}) for free. Enjoy intimate desi sex chat, Hinglish roleplay, and adult virtual companion conversations.`;
  } else if (lang === 'Tamil') {
    title = `Tamil AI Girlfriend ${formattedName} | Free Desi Adult Chat`;
    description = `Chat with a Tamil AI girlfriend in ${formattedName} (${stateName}). Private and free adult companion chat, Hinglish roleplay, and local character interactions.`;
  } else if (lang === 'Telugu') {
    title = `Telugu AI Girlfriend ${formattedName} | Free Desi Sex Chat`;
    description = `Enjoy Telugu AI girlfriend chat in ${formattedName} (${stateName}). Experience private roleplay, free desi sex chat, and emotional companion bonding.`;
  } else if (lang === 'Bengali') {
    title = `Bengali AI Girlfriend ${formattedName} | Free Desi Roleplay`;
    description = `Looking for a Bengali AI girlfriend in ${formattedName} (${stateName})? Try HeartEcho for free adult roleplay, Bengali chat, and secure virtual sex chat.`;
  } else if (lang === 'Kannada') {
    title = `Kannada AI Girlfriend ${formattedName} | Desi Chat AI`;
    description = `Meet your Kannada AI girlfriend in ${formattedName} (${stateName}) for free. Private adult conversation, local dating roleplay, and virtual companionship.`;
  } else if (lang === 'Malayalam') {
    title = `Malayalam AI Girlfriend ${formattedName} | Free Adult Chat`;
    description = `Get a Malayalam AI girlfriend in ${formattedName} (${stateName}). Private desi roleplay, free sex chat AI, and virtual relationship support.`;
  } else if (lang === 'Gujarati') {
    title = `Gujarati AI Girlfriend ${formattedName} | Desi Sex Chat`;
    description = `Start Gujarati/Hindi AI girlfriend chat in ${formattedName} (${stateName}). Free virtual dating, adult roleplay, and private sex chat.`;
  } else if (lang === 'Punjabi') {
    title = `Punjabi AI Girlfriend ${formattedName} | Free Desi Sex Chat`;
    description = `Try Punjabi kudi AI girlfriend in ${formattedName} (${stateName}). Free Hindi and Punjabi adult roleplay, virtual relationship, and private chats.`;
  } else {
    // Default Hindi / general regional
    title = `Free AI Sex Chat ${formattedName} | Hindi AI Girlfriend App`;
    description = `Looking for a desi AI girlfriend in ${formattedName}${stateName ? ` (${stateName})` : ''}? Try HeartEcho for free Hindi sex chat, Hinglish roleplay, and private adult AI companion chat.`;
  }

  const keywords = [
    `AI girlfriend ${formattedName}`,
    `virtual girlfriend ${formattedName}`,
    `desi AI chat ${formattedName}`,
    `Hindi chat AI ${formattedName}`,
    `free ai sex chat ${formattedName}`,
    `intimate companion ${formattedName}`,
    `adult roleplay ${formattedName}`,
    `AI girlfriend India`
  ];
  
  if (lang !== 'Hindi' && lang !== 'Hindi / English') {
    keywords.push(`${lang.toLowerCase()} AI girlfriend ${formattedName}`);
    keywords.push(`${lang.toLowerCase()} sex chat ${formattedName}`);
  }
  if (stateName) {
    keywords.push(`AI girlfriend in ${stateName}`);
    keywords.push(`sex chat ${formattedName} ${stateName}`);
  }

  return { title, description, keywords, lang, formattedName, stateName };
};
