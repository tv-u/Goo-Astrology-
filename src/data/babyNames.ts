export interface BabyNameRecord {
  id: string;
  name: string;
  hindi: string;
  gender: 'Boy' | 'Girl' | 'Unisex';
  meaning: string;
  pronunciation: string;
  origin: 'Sanskrit' | 'Hindi' | 'Vedic';
  rashi: string;
  nakshatra: string;
  startingLetter: string;
  numerologyNumber: number;
}

export const BABY_NAMES_DATASET: BabyNameRecord[] = [
  { id: '1', name: 'Aarav', hindi: 'आरव', gender: 'Boy', meaning: 'Peaceful, wisdom, melodic sound', pronunciation: 'AA-ruv', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'A', numerologyNumber: 7 },
  { id: '2', name: 'Aanya', hindi: 'आन्या', gender: 'Girl', meaning: 'Graceful, inexhaustible, limitless', pronunciation: 'AAN-yaa', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'A', numerologyNumber: 3 },
  { id: '3', name: 'Advait', hindi: 'अद्वैत', gender: 'Boy', meaning: 'Unique, non-dual unity', pronunciation: 'ud-VAIT', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'A', numerologyNumber: 9 },
  { id: '4', name: 'Ananya', hindi: 'अनन्या', gender: 'Girl', meaning: 'Incomparable, matchless', pronunciation: 'uh-NUN-yaa', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'A', numerologyNumber: 9 },
  { id: '5', name: 'Chetan', hindi: 'चेतन', gender: 'Boy', meaning: 'Consciousness, spirited life', pronunciation: 'CHAY-tun', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Ashwini', startingLetter: 'C', numerologyNumber: 1 },
  { id: '6', name: 'Chhaya', hindi: 'छाया', gender: 'Girl', meaning: 'Shadow, protective radiance', pronunciation: 'CHHAA-yaa', origin: 'Sanskrit', rashi: 'Gemini', nakshatra: 'Ardra', startingLetter: 'C', numerologyNumber: 8 },
  { id: '7', name: 'Lavanya', hindi: 'लावण्या', gender: 'Girl', meaning: 'Grace, refined beauty', pronunciation: 'laa-VUN-yaa', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Ashwini', startingLetter: 'L', numerologyNumber: 6 },
  { id: '8', name: 'Lakshya', hindi: 'लक्ष्य', gender: 'Unisex', meaning: 'Focused aim, noble destination', pronunciation: 'LUK-shya', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Bharani', startingLetter: 'L', numerologyNumber: 9 },
  { id: '9', name: 'Ojas', hindi: 'ओजस्', gender: 'Boy', meaning: 'Vitality, luminous energy', pronunciation: 'OH-jus', origin: 'Sanskrit', rashi: 'Taurus', nakshatra: 'Rohini', startingLetter: 'O', numerologyNumber: 5 },
  { id: '10', name: 'Vihaan', hindi: 'विहान', gender: 'Boy', meaning: 'Dawn, first light of morning', pronunciation: 'vi-HAAN', origin: 'Sanskrit', rashi: 'Taurus', nakshatra: 'Rohini', startingLetter: 'V', numerologyNumber: 4 },
  { id: '11', name: 'Vaishnavi', hindi: 'वैष्णवी', gender: 'Girl', meaning: 'Devotee of Vishnu, radiant strength', pronunciation: 'vaish-NUH-vee', origin: 'Sanskrit', rashi: 'Taurus', nakshatra: 'Rohini', startingLetter: 'V', numerologyNumber: 8 },
  { id: '12', name: 'Vedant', hindi: 'वेदांत', gender: 'Boy', meaning: 'Summit of Vedic knowledge', pronunciation: 'vay-DAANT', origin: 'Vedic', rashi: 'Taurus', nakshatra: 'Mrigashira', startingLetter: 'V', numerologyNumber: 6 },
  { id: '13', name: 'Kavya', hindi: 'काव्या', gender: 'Girl', meaning: 'Poetry in motion, lyrical grace', pronunciation: 'KAAV-yaa', origin: 'Sanskrit', rashi: 'Gemini', nakshatra: 'Mrigashira', startingLetter: 'K', numerologyNumber: 8 },
  { id: '14', name: 'Kian', hindi: 'कियान', gender: 'Boy', meaning: 'Grace of the divine, ancient king', pronunciation: 'kee-AAN', origin: 'Hindi', rashi: 'Gemini', nakshatra: 'Mrigashira', startingLetter: 'K', numerologyNumber: 7 },
  { id: '15', name: 'Harshita', hindi: 'हर्षिता', gender: 'Girl', meaning: 'Full of joy, cheerful', pronunciation: 'hur-SHI-taa', origin: 'Sanskrit', rashi: 'Cancer', nakshatra: 'Punarvasu', startingLetter: 'H', numerologyNumber: 4 },
  { id: '16', name: 'Hriday', hindi: 'हृदय', gender: 'Boy', meaning: 'Heart, compassionate core', pronunciation: 'hri-DAY', origin: 'Sanskrit', rashi: 'Cancer', nakshatra: 'Pushya', startingLetter: 'H', numerologyNumber: 2 },
  { id: '17', name: 'Devansh', hindi: 'देवांश', gender: 'Boy', meaning: 'Part of the divine', pronunciation: 'day-VAANSH', origin: 'Sanskrit', rashi: 'Cancer', nakshatra: 'Ashlesha', startingLetter: 'D', numerologyNumber: 6 },
  { id: '18', name: 'Diya', hindi: 'दीया', gender: 'Girl', meaning: 'Sacred earthen lamp, inner light', pronunciation: 'DEE-yaa', origin: 'Hindi', rashi: 'Cancer', nakshatra: 'Ashlesha', startingLetter: 'D', numerologyNumber: 5 },
  { id: '19', name: 'Manan', hindi: 'मनन', gender: 'Boy', meaning: 'Deep reflection, meditation', pronunciation: 'MUH-nun', origin: 'Sanskrit', rashi: 'Leo', nakshatra: 'Magha', startingLetter: 'M', numerologyNumber: 1 },
  { id: '20', name: 'Meera', hindi: 'मीरा', gender: 'Girl', meaning: 'Devoted, serene ocean', pronunciation: 'MEE-raa', origin: 'Hindi', rashi: 'Leo', nakshatra: 'Magha', startingLetter: 'M', numerologyNumber: 3 },
  { id: '21', name: 'Tanvi', hindi: 'तन्वी', gender: 'Girl', meaning: 'Slender, delicate grace', pronunciation: 'TUN-vee', origin: 'Sanskrit', rashi: 'Leo', nakshatra: 'Purva Phalguni', startingLetter: 'T', numerologyNumber: 9 },
  { id: '22', name: 'Tejas', hindi: 'तेजस्', gender: 'Boy', meaning: 'Luster, solar brilliance', pronunciation: 'TAY-jus', origin: 'Sanskrit', rashi: 'Virgo', nakshatra: 'Uttara Phalguni', startingLetter: 'T', numerologyNumber: 2 },
  { id: '23', name: 'Pranav', hindi: 'प्रणव', gender: 'Boy', meaning: 'Sacred syllable Om', pronunciation: 'PRUH-nuv', origin: 'Vedic', rashi: 'Virgo', nakshatra: 'Uttara Phalguni', startingLetter: 'P', numerologyNumber: 7 },
  { id: '24', name: 'Pari', hindi: 'परी', gender: 'Girl', meaning: 'Fairy-like grace, celestial', pronunciation: 'PUH-ree', origin: 'Hindi', rashi: 'Virgo', nakshatra: 'Hasta', startingLetter: 'P', numerologyNumber: 1 },
  { id: '25', name: 'Shaan', hindi: 'शान', gender: 'Boy', meaning: 'Dignity, pride, peaceful', pronunciation: 'SHAAN', origin: 'Hindi', rashi: 'Virgo', nakshatra: 'Hasta', startingLetter: 'S', numerologyNumber: 3 },
  { id: '26', name: 'Nandini', hindi: 'नंदिनी', gender: 'Girl', meaning: 'Bringer of joy, sacred river', pronunciation: 'NUN-di-nee', origin: 'Sanskrit', rashi: 'Scorpio', nakshatra: 'Anuradha', startingLetter: 'N', numerologyNumber: 7 },
  { id: '27', name: 'Raghav', hindi: 'राघव', gender: 'Boy', meaning: 'Descendant of Raghu, noble', pronunciation: 'RAA-ghuv', origin: 'Sanskrit', rashi: 'Libra', nakshatra: 'Chitra', startingLetter: 'R', numerologyNumber: 8 },
  { id: '28', name: 'Riya', hindi: 'रिया', gender: 'Girl', meaning: 'Melodic singer, graceful', pronunciation: 'REE-yaa', origin: 'Sanskrit', rashi: 'Libra', nakshatra: 'Chitra', startingLetter: 'R', numerologyNumber: 1 },
  { id: '29', name: 'Rohan', hindi: 'रोहन', gender: 'Boy', meaning: 'Ascending, healing sandalwood', pronunciation: 'ROH-hun', origin: 'Sanskrit', rashi: 'Libra', nakshatra: 'Swati', startingLetter: 'R', numerologyNumber: 9 },
  { id: '30', name: 'Tara', hindi: 'तारा', gender: 'Girl', meaning: 'Shining star, guiding light', pronunciation: 'TAA-raa', origin: 'Sanskrit', rashi: 'Libra', nakshatra: 'Swati', startingLetter: 'T', numerologyNumber: 7 },
  { id: '31', name: 'Yash', hindi: 'यश', gender: 'Boy', meaning: 'Fame, honor, accomplishment', pronunciation: 'YUSH', origin: 'Sanskrit', rashi: 'Scorpio', nakshatra: 'Jyeshtha', startingLetter: 'Y', numerologyNumber: 4 },
  { id: '32', name: 'Yuvika', hindi: 'युविका', gender: 'Girl', meaning: 'Young maiden, vibrant spirit', pronunciation: 'yoo-VI-kaa', origin: 'Sanskrit', rashi: 'Scorpio', nakshatra: 'Jyeshtha', startingLetter: 'Y', numerologyNumber: 5 },
  { id: '33', name: 'Bhavya', hindi: 'भव्या', gender: 'Unisex', meaning: 'Grand, auspicious splendor', pronunciation: 'BHUV-yaa', origin: 'Sanskrit', rashi: 'Sagittarius', nakshatra: 'Mula', startingLetter: 'B', numerologyNumber: 3 },
  { id: '34', name: 'Dhruv', hindi: 'ध्रुव', gender: 'Boy', meaning: 'Pole Star, steadfast truth', pronunciation: 'DHROOV', origin: 'Vedic', rashi: 'Sagittarius', nakshatra: 'Purva Ashadha', startingLetter: 'D', numerologyNumber: 4 },
  { id: '35', name: 'Jhanvi', hindi: 'जान्हवी', gender: 'Girl', meaning: 'River Ganga, pure flow', pronunciation: 'JHAAN-vee', origin: 'Sanskrit', rashi: 'Capricorn', nakshatra: 'Uttara Ashadha', startingLetter: 'J', numerologyNumber: 8 },
  { id: '36', name: 'Jayant', hindi: 'जयंत', gender: 'Boy', meaning: 'Victorious, rising star', pronunciation: 'juh-YUNT', origin: 'Sanskrit', rashi: 'Capricorn', nakshatra: 'Uttara Ashadha', startingLetter: 'J', numerologyNumber: 1 },
  { id: '37', name: 'Gaurav', hindi: 'गौरव', gender: 'Boy', meaning: 'Honor, dignified respect', pronunciation: 'GAU-ruv', origin: 'Sanskrit', rashi: 'Capricorn', nakshatra: 'Dhanishta', startingLetter: 'G', numerologyNumber: 2 },
  { id: '38', name: 'Gauri', hindi: 'गौरी', gender: 'Girl', meaning: 'Golden radiance, Goddess Parvati', pronunciation: 'GAU-ree', origin: 'Sanskrit', rashi: 'Aquarius', nakshatra: 'Shatabhisha', startingLetter: 'G', numerologyNumber: 6 },
  { id: '39', name: 'Siddharth', hindi: 'सिद्धार्थ', gender: 'Boy', meaning: 'One who has attained purpose', pronunciation: 'sid-DHAARTH', origin: 'Sanskrit', rashi: 'Aquarius', nakshatra: 'Shatabhisha', startingLetter: 'S', numerologyNumber: 5 },
  { id: '40', name: 'Saanvi', hindi: 'सान्वी', gender: 'Girl', meaning: 'Goddess Lakshmi, serene grace', pronunciation: 'SAAN-vee', origin: 'Sanskrit', rashi: 'Aquarius', nakshatra: 'Purva Bhadrapada', startingLetter: 'S', numerologyNumber: 7 },
  { id: '41', name: 'Niharika', hindi: 'निहारिका', gender: 'Girl', meaning: 'Nebula, morning dew drops', pronunciation: 'ni-HAA-ri-kaa', origin: 'Sanskrit', rashi: 'Pisces', nakshatra: 'Uttara Bhadrapada', startingLetter: 'N', numerologyNumber: 9 },
  { id: '42', name: 'Chaitanya', hindi: 'चैतन्य', gender: 'Unisex', meaning: 'Awakened consciousness, life force', pronunciation: 'chai-TUN-yaa', origin: 'Vedic', rashi: 'Pisces', nakshatra: 'Revati', startingLetter: 'C', numerologyNumber: 8 },
  { id: '43', name: 'Ishan', hindi: 'ईशान', gender: 'Boy', meaning: 'North-East auspicious direction, Lord Shiva', pronunciation: 'EE-shaan', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'I', numerologyNumber: 1 },
  { id: '44', name: 'Ira', hindi: 'इरा', gender: 'Girl', meaning: 'Earth, Saraswati, watchful wisdom', pronunciation: 'EE-raa', origin: 'Vedic', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'I', numerologyNumber: 7 },
  { id: '45', name: 'Arjun', hindi: 'अर्जुन', gender: 'Boy', meaning: 'Bright, silver-pure, focused archer', pronunciation: 'UR-joon', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'A', numerologyNumber: 3 },
  { id: '46', name: 'Ishita', hindi: 'इशिता', gender: 'Girl', meaning: 'Mastery, desired grace', pronunciation: 'i-SHI-taa', origin: 'Sanskrit', rashi: 'Aries', nakshatra: 'Krittika', startingLetter: 'I', numerologyNumber: 6 },
  { id: '47', name: 'Kabir', hindi: 'कबीर', gender: 'Boy', meaning: 'Great sage, boundless heart', pronunciation: 'kuh-BEER', origin: 'Hindi', rashi: 'Gemini', nakshatra: 'Mrigashira', startingLetter: 'K', numerologyNumber: 7 },
  { id: '48', name: 'Mira', hindi: 'मीरा', gender: 'Girl', meaning: 'Prosperous, ocean of devotion', pronunciation: 'MEE-raa', origin: 'Sanskrit', rashi: 'Leo', nakshatra: 'Magha', startingLetter: 'M', numerologyNumber: 3 },
];
