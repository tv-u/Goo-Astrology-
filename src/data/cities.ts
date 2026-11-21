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
}

export const CITIES_DATASET: CityRecord[] = [
  { id: 'new-delhi', city: 'New Delhi', district: 'New Delhi', state: 'Delhi', country: 'India', latitude: 28.6139, longitude: 77.2090, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'mumbai', city: 'Mumbai', district: 'Mumbai City', state: 'Maharashtra', country: 'India', latitude: 19.0760, longitude: 72.8777, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'bengaluru', city: 'Bengaluru', district: 'Bengaluru Urban', state: 'Karnataka', country: 'India', latitude: 12.9716, longitude: 77.5946, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'chennai', city: 'Chennai', district: 'Chennai', state: 'Tamil Nadu', country: 'India', latitude: 13.0827, longitude: 80.2707, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'kolkata', city: 'Kolkata', district: 'Kolkata', state: 'West Bengal', country: 'India', latitude: 22.5726, longitude: 88.3639, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'hyderabad', city: 'Hyderabad', district: 'Hyderabad', state: 'Telangana', country: 'India', latitude: 17.3850, longitude: 78.4867, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'pune', city: 'Pune', district: 'Pune', state: 'Maharashtra', country: 'India', latitude: 18.5204, longitude: 73.8567, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'ahmedabad', city: 'Ahmedabad', district: 'Ahmedabad', state: 'Gujarat', country: 'India', latitude: 23.0225, longitude: 72.5714, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'jaipur', city: 'Jaipur', district: 'Jaipur', state: 'Rajasthan', country: 'India', latitude: 26.9124, longitude: 75.7873, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'lucknow', city: 'Lucknow', district: 'Lucknow', state: 'Uttar Pradesh', country: 'India', latitude: 26.8467, longitude: 80.9462, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'varanasi', city: 'Varanasi', district: 'Varanasi', state: 'Uttar Pradesh', country: 'India', latitude: 25.3176, longitude: 82.9739, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'ujjain', city: 'Ujjain', district: 'Ujjain', state: 'Madhya Pradesh', country: 'India', latitude: 23.1765, longitude: 75.7885, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'bhopal', city: 'Bhopal', district: 'Bhopal', state: 'Madhya Pradesh', country: 'India', latitude: 23.2599, longitude: 77.4126, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'indore', city: 'Indore', district: 'Indore', state: 'Madhya Pradesh', country: 'India', latitude: 22.7196, longitude: 75.8577, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'patna', city: 'Patna', district: 'Patna', state: 'Bihar', country: 'India', latitude: 25.5941, longitude: 85.1376, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'chandigarh', city: 'Chandigarh', district: 'Chandigarh', state: 'Chandigarh', country: 'India', latitude: 30.7333, longitude: 76.7794, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'amritsar', city: 'Amritsar', district: 'Amritsar', state: 'Punjab', country: 'India', latitude: 31.6340, longitude: 74.8723, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'ludhiana', city: 'Ludhiana', district: 'Ludhiana', state: 'Punjab', country: 'India', latitude: 30.9010, longitude: 75.8573, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'haridwar', city: 'Haridwar', district: 'Haridwar', state: 'Uttarakhand', country: 'India', latitude: 29.9457, longitude: 78.1642, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'dehradun', city: 'Dehradun', district: 'Dehradun', state: 'Uttarakhand', country: 'India', latitude: 30.3165, longitude: 78.0322, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'shimla', city: 'Shimla', district: 'Shimla', state: 'Himachal Pradesh', country: 'India', latitude: 31.1048, longitude: 77.1734, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'jammu', city: 'Jammu', district: 'Jammu', state: 'Jammu & Kashmir', country: 'India', latitude: 32.7266, longitude: 74.8570, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'srinagar', city: 'Srinagar', district: 'Srinagar', state: 'Jammu & Kashmir', country: 'India', latitude: 34.0837, longitude: 74.7973, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'surat', city: 'Surat', district: 'Surat', state: 'Gujarat', country: 'India', latitude: 21.1702, longitude: 72.8311, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'vadodara', city: 'Vadodara', district: 'Vadodara', state: 'Gujarat', country: 'India', latitude: 22.3072, longitude: 73.1812, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'rajkot', city: 'Rajkot', district: 'Rajkot', state: 'Gujarat', country: 'India', latitude: 22.3039, longitude: 70.8022, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'nagpur', city: 'Nagpur', district: 'Nagpur', state: 'Maharashtra', country: 'India', latitude: 21.1458, longitude: 79.0882, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'nashik', city: 'Nashik', district: 'Nashik', state: 'Maharashtra', country: 'India', latitude: 19.9975, longitude: 73.7898, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'kanpur', city: 'Kanpur', district: 'Kanpur Nagar', state: 'Uttar Pradesh', country: 'India', latitude: 26.4499, longitude: 80.3319, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'prayagraj', city: 'Prayagraj', district: 'Prayagraj', state: 'Uttar Pradesh', country: 'India', latitude: 25.4358, longitude: 81.8463, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'agra', city: 'Agra', district: 'Agra', state: 'Uttar Pradesh', country: 'India', latitude: 27.1767, longitude: 78.0081, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'mathura', city: 'Mathura', district: 'Mathura', state: 'Uttar Pradesh', country: 'India', latitude: 27.4924, longitude: 77.6737, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'ayodhya', city: 'Ayodhya', district: 'Ayodhya', state: 'Uttar Pradesh', country: 'India', latitude: 26.7922, longitude: 82.1998, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'gorakhpur', city: 'Gorakhpur', district: 'Gorakhpur', state: 'Uttar Pradesh', country: 'India', latitude: 26.7606, longitude: 83.3732, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'noida', city: 'Noida', district: 'Gautam Buddha Nagar', state: 'Uttar Pradesh', country: 'India', latitude: 28.5355, longitude: 77.3910, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'gurugram', city: 'Gurugram', district: 'Gurugram', state: 'Haryana', country: 'India', latitude: 28.4595, longitude: 77.0266, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'jodhpur', city: 'Jodhpur', district: 'Jodhpur', state: 'Rajasthan', country: 'India', latitude: 26.2389, longitude: 73.0243, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'udaipur', city: 'Udaipur', district: 'Udaipur', state: 'Rajasthan', country: 'India', latitude: 24.5854, longitude: 73.7125, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'kota', city: 'Kota', district: 'Kota', state: 'Rajasthan', country: 'India', latitude: 25.2138, longitude: 75.8648, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'bhubaneswar', city: 'Bhubaneswar', district: 'Khordha', state: 'Odisha', country: 'India', latitude: 20.2961, longitude: 85.8245, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'puri', city: 'Puri', district: 'Puri', state: 'Odisha', country: 'India', latitude: 19.8135, longitude: 85.8312, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'ranchi', city: 'Ranchi', district: 'Ranchi', state: 'Jharkhand', country: 'India', latitude: 23.3441, longitude: 85.3096, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'raipur', city: 'Raipur', district: 'Raipur', state: 'Chhattisgarh', country: 'India', latitude: 21.2514, longitude: 81.6296, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'guwahati', city: 'Guwahati', district: 'Kamrup Metropolitan', state: 'Assam', country: 'India', latitude: 26.1445, longitude: 91.7362, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'kochi', city: 'Kochi', district: 'Ernakulam', state: 'Kerala', country: 'India', latitude: 9.9312, longitude: 76.2673, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'thiruvananthapuram', city: 'Thiruvananthapuram', district: 'Thiruvananthapuram', state: 'Kerala', country: 'India', latitude: 8.5241, longitude: 76.9366, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'madurai', city: 'Madurai', district: 'Madurai', state: 'Tamil Nadu', country: 'India', latitude: 9.9252, longitude: 78.1198, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'coimbatore', city: 'Coimbatore', district: 'Coimbatore', state: 'Tamil Nadu', country: 'India', latitude: 11.0168, longitude: 76.9558, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'mysuru', city: 'Mysuru', district: 'Mysuru', state: 'Karnataka', country: 'India', latitude: 12.2958, longitude: 76.6394, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'visakhapatnam', city: 'Visakhapatnam', district: 'Visakhapatnam', state: 'Andhra Pradesh', country: 'India', latitude: 17.6868, longitude: 83.2185, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'tirupati', city: 'Tirupati', district: 'Tirupati', state: 'Andhra Pradesh', country: 'India', latitude: 13.6288, longitude: 79.4192, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'goa', city: 'Panaji', district: 'North Goa', state: 'Goa', country: 'India', latitude: 15.4909, longitude: 73.8278, timezoneName: 'Asia/Kolkata', timezoneOffsetMinutes: 330 },
  { id: 'kathmandu', city: 'Kathmandu', district: 'Kathmandu', state: 'Bagmati', country: 'Nepal', latitude: 27.7172, longitude: 85.3240, timezoneName: 'Asia/Kathmandu', timezoneOffsetMinutes: 345 },
  { id: 'london', city: 'London', district: 'Greater London', state: 'England', country: 'United Kingdom', latitude: 51.5072, longitude: -0.1276, timezoneName: 'Europe/London', timezoneOffsetMinutes: 0 },
  { id: 'new-york', city: 'New York', district: 'Manhattan', state: 'New York', country: 'United States', latitude: 40.7128, longitude: -74.0060, timezoneName: 'America/New_York', timezoneOffsetMinutes: -300 },
  { id: 'san-francisco', city: 'San Francisco', district: 'San Francisco', state: 'California', country: 'United States', latitude: 37.7749, longitude: -122.4194, timezoneName: 'America/Los_Angeles', timezoneOffsetMinutes: -480 },
  { id: 'toronto', city: 'Toronto', district: 'Toronto', state: 'Ontario', country: 'Canada', latitude: 43.6532, longitude: -79.3832, timezoneName: 'America/Toronto', timezoneOffsetMinutes: -300 },
  { id: 'dubai', city: 'Dubai', district: 'Dubai', state: 'Dubai', country: 'UAE', latitude: 25.2048, longitude: 55.2708, timezoneName: 'Asia/Dubai', timezoneOffsetMinutes: 240 },
  { id: 'singapore', city: 'Singapore', district: 'Central', state: 'Singapore', country: 'Singapore', latitude: 1.3521, longitude: 103.8198, timezoneName: 'Asia/Singapore', timezoneOffsetMinutes: 480 },
  { id: 'sydney', city: 'Sydney', district: 'Sydney', state: 'NSW', country: 'Australia', latitude: -33.8688, longitude: 151.2093, timezoneName: 'Australia/Sydney', timezoneOffsetMinutes: 600 },
];

export function searchCities(query: string): CityRecord[] {
  const q = query.trim().toLowerCase();
  if (!q) return CITIES_DATASET.slice(0, 12);
  return CITIES_DATASET.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q)
  ).slice(0, 15);
}
