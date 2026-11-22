export interface CityRecord {
  id: string;
  city: string;
  district: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  timezoneName: string;
  timezoneOffsetMinutes: number;
  aliases?: string[];
  region?: 'North' | 'South' | 'East' | 'West' | 'Central' | 'Northeast' | 'Island' | 'International';
  isCapital?: boolean;
}

export const CITIES_DATASET: CityRecord[] = [
  // === INDIA: NATIONAL CAPITAL & ALL 28 STATES + 8 UNION TERRITORIES (Verified Coordinates, IST +05:30) ===
  // Delhi (NCT)
  { id: 'new-delhi', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Delhi', 'Dilli', 'Indraprastha'], region: 'North', isCapital: true },

  // Andhra Pradesh
  { id: 'amaravati', city: 'Amaravati', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', latitude: 16.5730, longitude: 80.3575, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South', isCapital: true },
  { id: 'visakhapatnam', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Vizag', 'Waltair'], region: 'South' },
  { id: 'vijayawada', city: 'Vijayawada', district: 'NTR', state: 'Andhra Pradesh', country: 'India', latitude: 16.5062, longitude: 80.6480, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Bezwada'], region: 'South' },
  { id: 'tirupati', city: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },
  { id: 'guntur', city: 'Guntur', district: 'Guntur', state: 'Andhra Pradesh', country: 'India', latitude: 16.3067, longitude: 80.4365, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },

  // Arunachal Pradesh
  { id: 'itanagar', city: 'Itanagar', district: 'Papum Pare', state: 'Arunachal Pradesh', country: 'India', latitude: 27.0844, longitude: 93.6053, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },
  { id: 'tawang', city: 'Tawang', district: 'Tawang', state: 'Arunachal Pradesh', country: 'India', latitude: 27.5861, longitude: 91.8594, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast' },

  // Assam
  { id: 'dispur', city: 'Dispur', district: 'Kamrup Metropolitan', state: 'Assam', country: 'India', latitude: 26.1433, longitude: 91.7898, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },
  { id: 'guwahati', city: 'Guwahati', district: 'Kamrup Metropolitan', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Gauhati', 'Pragjyotishpura'], region: 'Northeast' },
  { id: 'dibrugarh', city: 'Dibrugarh', district: 'Dibrugarh', state: 'Assam', country: 'India', latitude: 27.4728, longitude: 94.9120, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast' },
  { id: 'silchar', city: 'Silchar', district: 'Cachar', state: 'Assam', country: 'India', latitude: 24.8333, longitude: 92.7789, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast' },

  // Bihar
  { id: 'patna', city: 'Patna', district: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Pataliputra'], region: 'East', isCapital: true },
  { id: 'gaya', city: 'Gaya', district: 'Gaya', state: 'Bihar', country: 'India', latitude: 24.7914, longitude: 85.0002, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Bodh Gaya'], region: 'East' },
  { id: 'muzaffarpur', city: 'Muzaffarpur', district: 'Muzaffarpur', state: 'Bihar', country: 'India', latitude: 26.1197, longitude: 85.3910, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'darbhanga', city: 'Darbhanga', district: 'Darbhanga', state: 'Bihar', country: 'India', latitude: 26.1542, longitude: 85.8918, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Mithila'], region: 'East' },
  { id: 'bhagalpur', city: 'Bhagalpur', district: 'Bhagalpur', state: 'Bihar', country: 'India', latitude: 25.2425, longitude: 86.9842, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'aurangabad-br', city: 'Aurangabad (Bihar)', district: 'Aurangabad', state: 'Bihar', country: 'India', latitude: 24.7520, longitude: 84.3742, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Aurangabad'], region: 'East' },

  // Chhattisgarh
  { id: 'raipur', city: 'Raipur', district: 'Raipur', state: 'Chhattisgarh', country: 'India', latitude: 21.2514, longitude: 81.6296, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central', isCapital: true },
  { id: 'bilaspur', city: 'Bilaspur', district: 'Bilaspur', state: 'Chhattisgarh', country: 'India', latitude: 22.0797, longitude: 82.1409, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central' },
  { id: 'bhilai', city: 'Bhilai', district: 'Durg', state: 'Chhattisgarh', country: 'India', latitude: 21.1938, longitude: 81.3509, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central' },

  // Goa
  { id: 'panaji', city: 'Panaji', district: 'North Goa', state: 'Goa', country: 'India', latitude: 15.4909, longitude: 73.8278, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Panjim', 'Goa'], region: 'West', isCapital: true },
  { id: 'margao', city: 'Margao', district: 'South Goa', state: 'Goa', country: 'India', latitude: 15.2832, longitude: 73.9862, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Madgaon'], region: 'West' },

  // Gujarat
  { id: 'gandhinagar', city: 'Gandhinagar', district: 'Gandhinagar', state: 'Gujarat', country: 'India', latitude: 23.2156, longitude: 72.6369, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West', isCapital: true },
  { id: 'ahmedabad', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Amdavad', 'Karnavati'], region: 'West' },
  { id: 'surat', city: 'Surat', district: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West' },
  { id: 'vadodara', city: 'Vadodara', district: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Baroda'], region: 'West' },
  { id: 'rajkot', city: 'Rajkot', district: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West' },
  { id: 'dwarka', city: 'Dwarka', district: 'Devbhoomi Dwarka', state: 'Gujarat', country: 'India', latitude: 22.2442, longitude: 68.9685, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Dvaraka'], region: 'West' },
  { id: 'bhavnagar', city: 'Bhavnagar', district: 'Bhavnagar', state: 'Gujarat', country: 'India', latitude: 21.7645, longitude: 72.1519, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West' },

  // Haryana
  { id: 'gurugram', city: 'Gurugram', district: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4595, longitude: 77.0266, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Gurgaon'], region: 'North' },
  { id: 'faridabad', city: 'Faridabad', district: 'Faridabad', state: 'Haryana', country: 'India', latitude: 28.4089, longitude: 77.3178, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'kurukshetra', city: 'Kurukshetra', district: 'Kurukshetra', state: 'Haryana', country: 'India', latitude: 29.9695, longitude: 76.8783, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'rohtak', city: 'Rohtak', district: 'Rohtak', state: 'Haryana', country: 'India', latitude: 28.8955, longitude: 76.6066, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'hisar', city: 'Hisar', district: 'Hisar', state: 'Haryana', country: 'India', latitude: 29.1492, longitude: 75.7217, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },

  // Himachal Pradesh
  { id: 'shimla', city: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Simla'], region: 'North', isCapital: true },
  { id: 'dharamshala', city: 'Dharamshala', district: 'Kangra', state: 'Himachal Pradesh', country: 'India', latitude: 32.2190, longitude: 76.3234, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'hamirpur-hp', city: 'Hamirpur (HP)', district: 'Hamirpur', state: 'Himachal Pradesh', country: 'India', latitude: 31.6862, longitude: 76.5213, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Hamirpur'], region: 'North' },

  // Jharkhand
  { id: 'ranchi', city: 'Ranchi', district: 'Ranchi', state: 'Jharkhand', country: 'India', latitude: 23.3441, longitude: 85.3096, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East', isCapital: true },
  { id: 'jamshedpur', city: 'Jamshedpur', district: 'East Singhbhum', state: 'Jharkhand', country: 'India', latitude: 22.8046, longitude: 86.2029, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Tatanagar'], region: 'East' },
  { id: 'dhanbad', city: 'Dhanbad', district: 'Dhanbad', state: 'Jharkhand', country: 'India', latitude: 23.7957, longitude: 86.4304, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'deoghar', city: 'Deoghar', district: 'Deoghar', state: 'Jharkhand', country: 'India', latitude: 24.4829, longitude: 86.6990, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Baidyanath Dham'], region: 'East' },

  // Karnataka
  { id: 'bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Bangalore'], region: 'South', isCapital: true },
  { id: 'mysuru', city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Mysore'], region: 'South' },
  { id: 'mangaluru', city: 'Mangaluru', district: 'Dakshina Kannada', state: 'Karnataka', country: 'India', latitude: 12.9141, longitude: 74.8560, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Mangalore'], region: 'South' },
  { id: 'hubballi', city: 'Hubballi', district: 'Dharwad', state: 'Karnataka', country: 'India', latitude: 15.3647, longitude: 75.1240, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Hubli'], region: 'South' },
  { id: 'belagavi', city: 'Belagavi', district: 'Belagavi', state: 'Karnataka', country: 'India', latitude: 15.8497, longitude: 74.4977, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Belgaum'], region: 'South' },
  { id: 'udupi', city: 'Udupi', district: 'Udupi', state: 'Karnataka', country: 'India', latitude: 13.3409, longitude: 74.7421, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },

  // Kerala
  { id: 'thiruvananthapuram', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Trivandrum'], region: 'South', isCapital: true },
  { id: 'kochi', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Cochin', 'Ernakulam'], region: 'South' },
  { id: 'kozhikode', city: 'Kozhikode', district: 'Kozhikode', state: 'Kerala', country: 'India', latitude: 11.2588, longitude: 75.7804, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Calicut'], region: 'South' },
  { id: 'thrissur', city: 'Thrissur', district: 'Thrissur', state: 'Kerala', country: 'India', latitude: 10.5276, longitude: 76.2144, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Trichur'], region: 'South' },

  // Madhya Pradesh
  { id: 'bhopal', city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central', isCapital: true },
  { id: 'ujjain', city: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Avantika', 'Ujjayini'], region: 'Central' },
  { id: 'indore', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central' },
  { id: 'gwalior', city: 'Gwalior', district: 'Gwalior', state: 'Madhya Pradesh', country: 'India', latitude: 26.2183, longitude: 78.1828, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central' },
  { id: 'jabalpur', city: 'Jabalpur', district: 'Jabalpur', state: 'Madhya Pradesh', country: 'India', latitude: 23.1815, longitude: 79.9864, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Central' },

  // Maharashtra
  { id: 'mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Bombay'], region: 'West', isCapital: true },
  { id: 'pune', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Poona'], region: 'West' },
  { id: 'nagpur', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West' },
  { id: 'nashik', city: 'Nashik', district: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Nasik'], region: 'West' },
  { id: 'chhatrapati-sambhajinagar', city: 'Chhatrapati Sambhajinagar', district: 'Chhatrapati Sambhajinagar', state: 'Maharashtra', country: 'India', latitude: 19.8762, longitude: 75.3433, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Aurangabad'], region: 'West' },
  { id: 'kolhapur', city: 'Kolhapur', district: 'Kolhapur', state: 'Maharashtra', country: 'India', latitude: 16.7050, longitude: 74.2433, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'West' },

  // Manipur
  { id: 'imphal', city: 'Imphal', district: 'Imphal West', state: 'Manipur', country: 'India', latitude: 24.8170, longitude: 93.9368, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },

  // Meghalaya
  { id: 'shillong', city: 'Shillong', district: 'East Khasi Hills', state: 'Meghalaya', country: 'India', latitude: 25.5788, longitude: 91.8933, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },

  // Mizoram
  { id: 'aizawl', city: 'Aizawl', district: 'Aizawl', state: 'Mizoram', country: 'India', latitude: 23.7271, longitude: 92.7176, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },

  // Nagaland
  { id: 'kohima', city: 'Kohima', district: 'Kohima', state: 'Nagaland', country: 'India', latitude: 25.6751, longitude: 94.1086, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },
  { id: 'dimapur', city: 'Dimapur', district: 'Dimapur', state: 'Nagaland', country: 'India', latitude: 25.9091, longitude: 93.7266, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast' },

  // Odisha
  { id: 'bhubaneswar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Orissa'], region: 'East', isCapital: true },
  { id: 'puri', city: 'Puri', district: 'Puri', state: 'Odisha', country: 'India', latitude: 19.8135, longitude: 85.8312, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Jagannath Puri'], region: 'East' },
  { id: 'cuttack', city: 'Cuttack', district: 'Cuttack', state: 'Odisha', country: 'India', latitude: 20.4625, longitude: 85.8830, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'rourkela', city: 'Rourkela', district: 'Sundargarh', state: 'Odisha', country: 'India', latitude: 22.2604, longitude: 84.8536, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },

  // Punjab
  { id: 'chandigarh', city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', country: 'India', latitude: 30.7333, longitude: 76.7794, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North', isCapital: true },
  { id: 'amritsar', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'ludhiana', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', country: 'India', latitude: 30.9010, longitude: 75.8573, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'jalandhar', city: 'Jalandhar', district: 'Jalandhar', state: 'Punjab', country: 'India', latitude: 31.3260, longitude: 75.5762, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Jullundur'], region: 'North' },
  { id: 'patiala', city: 'Patiala', district: 'Patiala', state: 'Punjab', country: 'India', latitude: 30.3398, longitude: 76.3869, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },

  // Rajasthan
  { id: 'jaipur', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Pink City'], region: 'North', isCapital: true },
  { id: 'jodhpur', city: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'udaipur', city: 'Udaipur', district: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'kota', city: 'Kota', district: 'Kota', state: 'Rajasthan', country: 'India', latitude: 25.2138, longitude: 75.8648, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'ajmer', city: 'Ajmer', district: 'Ajmer', state: 'Rajasthan', country: 'India', latitude: 26.4499, longitude: 74.6399, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Pushkar'], region: 'North' },
  { id: 'bikaner', city: 'Bikaner', district: 'Bikaner', state: 'Rajasthan', country: 'India', latitude: 28.0229, longitude: 73.3119, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },

  // Sikkim
  { id: 'gangtok', city: 'Gangtok', district: 'Gangtok', state: 'Sikkim', country: 'India', latitude: 27.3314, longitude: 88.6138, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },

  // Tamil Nadu
  { id: 'chennai', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Madras'], region: 'South', isCapital: true },
  { id: 'madurai', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },
  { id: 'coimbatore', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Kovai'], region: 'South' },
  { id: 'tiruchirappalli', city: 'Tiruchirappalli', district: 'Tiruchirappalli', state: 'Tamil Nadu', country: 'India', latitude: 10.7905, longitude: 78.7047, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Trichy', 'Trichinopoly'], region: 'South' },
  { id: 'kanchipuram', city: 'Kanchipuram', district: 'Kanchipuram', state: 'Tamil Nadu', country: 'India', latitude: 12.8342, longitude: 79.7036, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Kanchi'], region: 'South' },
  { id: 'rameswaram', city: 'Rameswaram', district: 'Ramanathapuram', state: 'Tamil Nadu', country: 'India', latitude: 9.2876, longitude: 79.3129, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },

  // Telangana
  { id: 'hyderabad', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South', isCapital: true },
  { id: 'warangal', city: 'Warangal', district: 'Warangal', state: 'Telangana', country: 'India', latitude: 17.9689, longitude: 79.5941, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },
  { id: 'nizamabad', city: 'Nizamabad', district: 'Nizamabad', state: 'Telangana', country: 'India', latitude: 18.6725, longitude: 78.0941, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'South' },

  // Tripura
  { id: 'agartala', city: 'Agartala', district: 'West Tripura', state: 'Tripura', country: 'India', latitude: 23.8315, longitude: 91.2868, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Northeast', isCapital: true },

  // Uttar Pradesh
  { id: 'lucknow', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North', isCapital: true },
  { id: 'varanasi', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Kashi', 'Banaras', 'Benares'], region: 'North' },
  { id: 'kanpur', city: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Cawnpore'], region: 'North' },
  { id: 'prayagraj', city: 'Prayagraj', district: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', latitude: 25.4358, longitude: 81.8463, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Allahabad', 'Prayag'], region: 'North' },
  { id: 'agra', city: 'Agra', district: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'mathura', city: 'Mathura', district: 'Mathura', state: 'Uttar Pradesh', country: 'India', latitude: 27.4924, longitude: 77.6737, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Vrindavan'], region: 'North' },
  { id: 'ayodhya', city: 'Ayodhya', district: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Faizabad', 'Saket'], region: 'North' },
  { id: 'gorakhpur', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.7606, longitude: 83.3732, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'noida', city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'meerut', city: 'Meerut', district: 'Meerut', state: 'Uttar Pradesh', country: 'India', latitude: 28.9845, longitude: 77.7064, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'hamirpur-up', city: 'Hamirpur (UP)', district: 'Hamirpur', state: 'Uttar Pradesh', country: 'India', latitude: 25.9565, longitude: 80.1497, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Hamirpur'], region: 'North' },

  // Uttarakhand
  { id: 'dehradun', city: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.3165, longitude: 78.0322, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North', isCapital: true },
  { id: 'haridwar', city: 'Haridwar', district: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Hardwar'], region: 'North' },
  { id: 'rishikesh', city: 'Rishikesh', district: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.0869, longitude: 78.2676, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },
  { id: 'nainital', city: 'Nainital', district: 'Nainital', state: 'Uttarakhand', country: 'India', latitude: 29.3919, longitude: 79.4542, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North' },

  // West Bengal
  { id: 'kolkata', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Calcutta'], region: 'East', isCapital: true },
  { id: 'siliguri', city: 'Siliguri', district: 'Darjeeling', state: 'West Bengal', country: 'India', latitude: 26.7271, longitude: 88.3953, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'durgapur', city: 'Durgapur', district: 'Paschim Bardhaman', state: 'West Bengal', country: 'India', latitude: 23.5204, longitude: 87.3119, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },
  { id: 'howrah', city: 'Howrah', district: 'Howrah', state: 'West Bengal', country: 'India', latitude: 22.5958, longitude: 88.2636, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'East' },

  // === REMAINING UNION TERRITORIES OF INDIA ===
  { id: 'port-blair', city: 'Sri Vijaya Puram (Port Blair)', district: 'South Andaman', state: 'Andaman & Nicobar Islands', country: 'India', latitude: 11.6234, longitude: 92.7265, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Port Blair', 'Andaman'], region: 'Island', isCapital: true },
  { id: 'daman', city: 'Daman', district: 'Daman', state: 'Dadra & Nagar Haveli and Daman & Diu', country: 'India', latitude: 20.3974, longitude: 72.8328, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Silvassa', 'Diu'], region: 'West', isCapital: true },
  { id: 'jammu', city: 'Jammu', district: 'Jammu', state: 'Jammu & Kashmir', country: 'India', latitude: 32.7266, longitude: 74.8570, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North', isCapital: true },
  { id: 'srinagar', city: 'Srinagar', district: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'North', isCapital: true },
  { id: 'leh', city: 'Leh', district: 'Leh', state: 'Ladakh', country: 'India', latitude: 34.1526, longitude: 77.5771, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Kargil'], region: 'North', isCapital: true },
  { id: 'kavaratti', city: 'Kavaratti', district: 'Lakshadweep', state: 'Lakshadweep', country: 'India', latitude: 10.5593, longitude: 72.6358, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, region: 'Island', isCapital: true },
  { id: 'puducherry', city: 'Puducherry', district: 'Puducherry', state: 'Puducherry', country: 'India', latitude: 11.9416, longitude: 79.8083, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330, aliases: ['Pondicherry', 'Pondy'], region: 'South', isCapital: true },

  // === GLOBAL / DIASPORA REFERENCE HUBS ===
  { id: 'kathmandu', city: 'Kathmandu', district: 'Kathmandu', state: 'Bagmati', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timezoneName: 'Asia/Kathmandu', timezoneOffsetMinutes: 345, region: 'International' },
  { id: 'london', city: 'London', district: 'Greater London', state: 'England', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276, timezoneName: 'Europe/London', timezoneOffsetMinutes: 0, region: 'International' },
  { id: 'new-york', city: 'New York', district: 'Manhattan', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezoneName: 'America/New_York', timezoneOffsetMinutes: -300, region: 'International' },
  { id: 'san-francisco', city: 'San Francisco', district: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezoneName: 'America/Los_Angeles', timezoneOffsetMinutes: -480, region: 'International' },
  { id: 'toronto', city: 'Toronto', district: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezoneName: 'America/Toronto', timezoneOffsetMinutes: -300, region: 'International' },
  { id: 'dubai', city: 'Dubai', district: 'Dubai', state: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezoneName: 'Asia/Dubai', timezoneOffsetMinutes: 240, region: 'International' },
  { id: 'singapore', city: 'Singapore', district: 'Central', state: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezoneName: 'Asia/Singapore', timezoneOffsetMinutes: 480, region: 'International' },
  { id: 'sydney', city: 'Sydney', district: 'Sydney', state: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezoneName: 'Australia/Sydney', timezoneOffsetMinutes: 600, region: 'International' },
];

export function searchCities(query: string): CityRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES_DATASET.slice(0, 15);
  return CITIES_DATASET.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)))
  ).slice(0, 20);
}

export interface IndianCityEntry extends CityRecord {
  name: string;
}

export const INDIAN_CITIES: IndianCityEntry[] = CITIES_DATASET.map((c) => ({
  ...c,
  name: c.city,
}));
