import { CITIES_DATASET, type CityRecord } from './cities';

export interface IndiaStateUtRecord {
  code: string;
  name: string;
  type: 'State' | 'Union Territory';
  capital: string;
  panchangTradition: 'Purnimanta (Lunar)' | 'Amanta (Lunar)' | 'Solar (Sankranti)';
  primaryLanguages: string[];
  latitude: number;
  longitude: number;
}

export const INDIA_STATES_AND_UTS: IndiaStateUtRecord[] = [
  // 28 States
  { code: 'AP', name: 'Andhra Pradesh', type: 'State', capital: 'Amaravati', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['te', 'en'], latitude: 16.5730, longitude: 80.3575 },
  { code: 'AR', name: 'Arunachal Pradesh', type: 'State', capital: 'Itanagar', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en', 'hi'], latitude: 27.0844, longitude: 93.6053 },
  { code: 'AS', name: 'Assam', type: 'State', capital: 'Dispur', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['bn', 'en', 'hi'], latitude: 26.1433, longitude: 91.7898 },
  { code: 'BR', name: 'Bihar', type: 'State', capital: 'Patna', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'sa'], latitude: 25.5941, longitude: 85.1376 },
  { code: 'CG', name: 'Chhattisgarh', type: 'State', capital: 'Raipur', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi'], latitude: 21.2514, longitude: 81.6296 },
  { code: 'GA', name: 'Goa', type: 'State', capital: 'Panaji', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['mr', 'en'], latitude: 15.4909, longitude: 73.8278 },
  { code: 'GJ', name: 'Gujarat', type: 'State', capital: 'Gandhinagar', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['gu', 'hi'], latitude: 23.2156, longitude: 72.6369 },
  { code: 'HR', name: 'Haryana', type: 'State', capital: 'Chandigarh', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'pa'], latitude: 29.0588, longitude: 76.0856 },
  { code: 'HP', name: 'Himachal Pradesh', type: 'State', capital: 'Shimla', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'pa'], latitude: 31.1048, longitude: 77.1734 },
  { code: 'JH', name: 'Jharkhand', type: 'State', capital: 'Ranchi', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'bn'], latitude: 23.3441, longitude: 85.3096 },
  { code: 'KA', name: 'Karnataka', type: 'State', capital: 'Bengaluru', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['kn', 'en'], latitude: 12.9716, longitude: 77.5946 },
  { code: 'KL', name: 'Kerala', type: 'State', capital: 'Thiruvananthapuram', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['ml', 'en'], latitude: 8.5241, longitude: 76.9366 },
  { code: 'MP', name: 'Madhya Pradesh', type: 'State', capital: 'Bhopal', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'sa'], latitude: 23.2599, longitude: 77.4126 },
  { code: 'MH', name: 'Maharashtra', type: 'State', capital: 'Mumbai', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['mr', 'hi'], latitude: 19.0760, longitude: 72.8777 },
  { code: 'MN', name: 'Manipur', type: 'State', capital: 'Imphal', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en', 'bn'], latitude: 24.8170, longitude: 93.9368 },
  { code: 'ML', name: 'Meghalaya', type: 'State', capital: 'Shillong', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en'], latitude: 25.5788, longitude: 91.8933 },
  { code: 'MZ', name: 'Mizoram', type: 'State', capital: 'Aizawl', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en'], latitude: 23.7271, longitude: 92.7176 },
  { code: 'NL', name: 'Nagaland', type: 'State', capital: 'Kohima', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en'], latitude: 25.6751, longitude: 94.1086 },
  { code: 'OD', name: 'Odisha', type: 'State', capital: 'Bhubaneswar', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['or', 'sa'], latitude: 20.2961, longitude: 85.8245 },
  { code: 'PB', name: 'Punjab', type: 'State', capital: 'Chandigarh', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['pa', 'hi'], latitude: 31.1471, longitude: 75.3412 },
  { code: 'RJ', name: 'Rajasthan', type: 'State', capital: 'Jaipur', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi'], latitude: 26.9124, longitude: 75.7873 },
  { code: 'SK', name: 'Sikkim', type: 'State', capital: 'Gangtok', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['en', 'hi'], latitude: 27.3314, longitude: 88.6138 },
  { code: 'TN', name: 'Tamil Nadu', type: 'State', capital: 'Chennai', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['ta', 'en'], latitude: 13.0827, longitude: 80.2707 },
  { code: 'TS', name: 'Telangana', type: 'State', capital: 'Hyderabad', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['te', 'hi'], latitude: 17.3850, longitude: 78.4867 },
  { code: 'TR', name: 'Tripura', type: 'State', capital: 'Agartala', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['bn', 'en'], latitude: 23.8315, longitude: 91.2868 },
  { code: 'UP', name: 'Uttar Pradesh', type: 'State', capital: 'Lucknow', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'sa'], latitude: 26.8467, longitude: 80.9462 },
  { code: 'UK', name: 'Uttarakhand', type: 'State', capital: 'Dehradun', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'sa'], latitude: 30.3165, longitude: 78.0322 },
  { code: 'WB', name: 'West Bengal', type: 'State', capital: 'Kolkata', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['bn', 'en'], latitude: 22.5726, longitude: 88.3639 },

  // 8 Union Territories
  { code: 'AN', name: 'Andaman & Nicobar Islands', type: 'Union Territory', capital: 'Sri Vijaya Puram (Port Blair)', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'bn', 'ta', 'en'], latitude: 11.6234, longitude: 92.7265 },
  { code: 'CH', name: 'Chandigarh', type: 'Union Territory', capital: 'Chandigarh', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['pa', 'hi', 'en'], latitude: 30.7333, longitude: 76.7794 },
  { code: 'DN', name: 'Dadra & Nagar Haveli and Daman & Diu', type: 'Union Territory', capital: 'Daman', panchangTradition: 'Amanta (Lunar)', primaryLanguages: ['gu', 'hi', 'mr'], latitude: 20.3974, longitude: 72.8328 },
  { code: 'DL', name: 'Delhi', type: 'Union Territory', capital: 'New Delhi', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'pa', 'en'], latitude: 28.6139, longitude: 77.2090 },
  { code: 'JK', name: 'Jammu & Kashmir', type: 'Union Territory', capital: 'Srinagar / Jammu', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'en'], latitude: 34.0837, longitude: 74.7973 },
  { code: 'LA', name: 'Ladakh', type: 'Union Territory', capital: 'Leh', panchangTradition: 'Purnimanta (Lunar)', primaryLanguages: ['hi', 'en'], latitude: 34.1526, longitude: 77.5771 },
  { code: 'LD', name: 'Lakshadweep', type: 'Union Territory', capital: 'Kavaratti', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['ml', 'en'], latitude: 10.5593, longitude: 72.6358 },
  { code: 'PY', name: 'Puducherry', type: 'Union Territory', capital: 'Puducherry', panchangTradition: 'Solar (Sankranti)', primaryLanguages: ['ta', 'te', 'ml', 'en'], latitude: 11.9416, longitude: 79.8083 },
];

export interface LocationResolutionResult {
  query: string;
  matches: CityRecord[];
  ambiguous: boolean;
  resolvedByAlias: boolean;
  notes: string;
}

export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function findNearestVerifiedCity(latitude: number, longitude: number): {
  city: CityRecord;
  distanceKm: number;
  withinIndiaBoundingBox: boolean;
} {
  let best = CITIES_DATASET[0];
  let bestDist = Infinity;
  for (const c of CITIES_DATASET) {
    const d = haversineDistanceKm(latitude, longitude, c.latitude, c.longitude);
    if (d < bestDist) {
      bestDist = d;
      best = c;
    }
  }
  const withinIndiaBoundingBox = latitude >= 6.4 && latitude <= 37.2 && longitude >= 68.0 && longitude <= 97.5;
  return {
    city: best,
    distanceKm: Number(bestDist.toFixed(2)),
    withinIndiaBoundingBox,
  };
}

export function resolveIndiaLocation(rawQuery: string): LocationResolutionResult {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return {
      query: rawQuery,
      matches: CITIES_DATASET.slice(0, 10),
      ambiguous: false,
      resolvedByAlias: false,
      notes: 'Showing default major Indian observatory hubs.',
    };
  }

  // Exact city or alias matches first
  const exactMatches = CITIES_DATASET.filter(
    (c) =>
      c.city.toLowerCase() === q ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase() === q))
  );

  if (exactMatches.length > 0) {
    const resolvedByAlias = exactMatches.some((c) => c.city.toLowerCase() !== q);
    const ambiguous = exactMatches.length > 1;
    return {
      query: rawQuery,
      matches: exactMatches,
      ambiguous,
      resolvedByAlias,
      notes: ambiguous
        ? `Multiple Indian cities share the name "${rawQuery}" (${exactMatches.map((m) => m.state).join(' vs ')}). Please pick exact state/district.`
        : resolvedByAlias
        ? `Resolved historical/alternate spelling "${rawQuery}" -> ${exactMatches[0].city}, ${exactMatches[0].state}.`
        : `Exact match: ${exactMatches[0].city}, ${exactMatches[0].state}.`,
    };
  }

  // Partial matches across city, alias, district, state
  const partialMatches = CITIES_DATASET.filter(
    (c) =>
      c.city.toLowerCase().includes(q) ||
      c.state.toLowerCase().includes(q) ||
      c.district.toLowerCase().includes(q) ||
      (c.aliases && c.aliases.some((a) => a.toLowerCase().includes(q)))
  ).slice(0, 20);

  return {
    query: rawQuery,
    matches: partialMatches,
    ambiguous: partialMatches.length > 1,
    resolvedByAlias: partialMatches.some((c) => c.aliases?.some((a) => a.toLowerCase().includes(q))),
    notes:
      partialMatches.length === 0
        ? 'No city found in offline gazetteer. Enter custom latitude/longitude coordinates manually.'
        : `Found ${partialMatches.length} matching place(s).`,
  };
}

export function getIndiaLocationCoverageSummary() {
  const indianEntries = CITIES_DATASET.filter((c) => c.country === 'India');
  const statesCovered = new Set(indianEntries.map((c) => c.state));
  const statesList = INDIA_STATES_AND_UTS.filter((s) => s.type === 'State');
  const utsList = INDIA_STATES_AND_UTS.filter((s) => s.type === 'Union Territory');
  return {
    totalStates: statesList.length,
    totalUnionTerritories: utsList.length,
    totalIndiaRegionsCovered: statesCovered.size,
    verifiedCitiesCount: indianEntries.length,
    internationalHubsCount: CITIES_DATASET.length - indianEntries.length,
    aliasesSupportedCount: indianEntries.reduce((acc, c) => acc + (c.aliases?.length || 0), 0),
    ruralCensusDatasetStatus: 'BLOCKED (Full 640,000+ Census of India villages require external shapefile/API not bundled offline)',
  };
}
