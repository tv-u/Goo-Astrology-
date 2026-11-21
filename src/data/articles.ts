export interface ArticleRecord {
  slug: string;
  title: string;
  hindiTitle: string;
  category: string;
  author: string;
  publishedAt: string;
  readTime: string;
  excerpt: string;
  body: string[];
}

export const INITIAL_ARTICLES: ArticleRecord[] = [
  {
    slug: 'understanding-lahiri-ayanamsha-sidereal-kundli',
    title: 'Understanding Lahiri Chitrapaksha Ayanamsha in Sidereal Kundli',
    hindiTitle: 'वैदिक कुंडली में लाहिड़ी चित्रापक्ष अयनांश का महत्व',
    category: 'Kundli Guides',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-18',
    readTime: '5 min read',
    excerpt: 'Why Indian Vedic astrology anchors the zodiac to the fixed star Spica (Chitra) and how axial precession separates Nirayana from Sayana.',
    body: [
      'Earth’s rotational axis wobbles slowly over a ~25,772-year cycle known as axial precession. Because of this shift, the Vernal Equinox drifts backward against the fixed stars by roughly 50.29 arcseconds each year.',
      'Western Tropical astrology (Sayana) anchors 0° Aries to the Vernal Equinox, whereas Indian Vedic astrology (Nirayana) anchors the zodiac to fixed constellations, placing Chitra Nakshatra (the bright star Spica) at exactly 180°00′00″.',
      'The angular difference between these two coordinate frames is called Ayanamsha. In 1955, the Calendar Reform Committee chaired by Prof. Meghnad Saha recommended the Chitrapaksha (Lahiri) standard for official Indian ephemerides, which sits near 24°14′ in late 2026.',
      'Every Janam Kundli generated on GOO ASTROLOGY uses NASA/JPL VSOP87 & ELP2000-82B positions adjusted by the Lahiri Chitrapaksha precession value—with options to switch to B.V. Raman, KP, or Tropical systems.'
    ],
  },
  {
    slug: 'ashtakoot-gun-milan-beyond-the-36-score',
    title: 'Ashtakoot Gun Milan: Reading Nadi, Bhakoot & Manglik Cancellation',
    hindiTitle: 'अष्टकूट गुण मिलान: नाड़ी, भकूट और मांगलिक परिहार के नियम',
    category: 'Marriage Astrology',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-15',
    readTime: '6 min read',
    excerpt: 'Why a raw 36-point score never tells the whole story without checking Navamsa (D9), Nadi cancellations, and Mars exemptions.',
    body: [
      'Ashtakoot matching evaluates eight dimensions between the bride’s and groom’s Moon Nakshatras: Varna (1), Vashya (2), Tara (3), Yoni (4), Graha Maitri (5), Gana (6), Bhakoot (7), and Nadi (8).',
      'Nadi alone carries 8 out of 36 points, and Bhakoot carries 7. Together they represent nearly half of the score, which is why classical treatises list explicit cancellation rules (Parihara).',
      'For instance, same Nadi is traditionally mitigated when both partners share the same Moon Rashi in different Nakshatras, or the same Nakshatra in different Padas. Similarly, Mars in Aries, Scorpio, or Capricorn—or aspected by Jupiter—often cancels Kuja Dosha.',
      'Always evaluate both D1 Lagna and D9 Navamsa alongside Ashtakoot points rather than relying on a single threshold.'
    ],
  },
  {
    slug: 'how-panchang-rahu-kaal-and-choghadiya-work',
    title: 'How Daily Panchang, Rahu Kaal & Choghadiya Are Calculated From Sunrise',
    hindiTitle: 'दैनिक पंचांग, राहुकाल और चौघड़िया की सूर्योदय आधारित गणना',
    category: 'Panchang Articles',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-12',
    readTime: '4 min read',
    excerpt: 'Why auspicious Muhurat windows shift every day and every city based on exact local sunrise and sunset times.',
    body: [
      'Panchang literally means five limbs: Tithi (lunar day), Vara (weekday), Nakshatra (lunar mansion), Yoga (luni-solar sum), and Karana (half-tithi).',
      'Unlike fixed clock schedules, Vedic daytime muhurats divide the exact span from local Sunrise to local Sunset into 8 equal parts for Rahu Kaal, Yamaganda, Gulika Kaal, and Day Choghadiya.',
      'Because Delhi, Mumbai, Kolkata, and Chennai experience sunrise at different local solar times, a reliable Panchang calculator must compute astronomical rise/set for your exact latitude and longitude.'
    ],
  },
  {
    slug: 'vimshottari-dasha-mahadasha-antardasha-guide',
    title: 'Vimshottari Dasha Explained: Navigating Mahadasha and Antardasha',
    hindiTitle: 'विंशोत्तरी महादशा और अंतर्दशा को समझने की सरल विधि',
    category: 'Kundli Guides',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-10',
    readTime: '5 min read',
    excerpt: 'How the Moon’s exact Nakshatra degree at birth sets your 120-year planetary timeline in motion.',
    body: [
      'Vimshottari Dasha is a 120-year planetary timing system seeded by the Moon’s exact sidereal longitude at the moment of birth.',
      'Each of the 27 Nakshatras spans 13°20′. The remaining fraction of the Moon’s birth Nakshatra determines the balance of your very first Mahadasha, followed by the fixed order: Ketu (7), Venus (20), Sun (6), Moon (10), Mars (7), Rahu (18), Jupiter (16), Saturn (19), and Mercury (17).',
      'Within each Mahadasha, nine Antardashas unfold proportionally, giving nuanced timing for career transitions, study, and personal growth.'
    ],
  },
  {
    slug: 'vastu-shastra-eight-directions-home-harmony',
    title: 'Vastu Shastra Principles: Balancing the Eight Directions & Five Elements',
    hindiTitle: 'वास्तु शास्त्र के मूल सिद्धांत: अष्ट दिशाएं और पंचतत्व संतुलन',
    category: 'Vastu Guides',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-08',
    readTime: '5 min read',
    excerpt: 'Practical directional alignment for daylight, airflow, kitchens, and quiet study spaces without superstition.',
    body: [
      'Traditional Vastu Shastra pairs solar trajectory and prevailing winds with the five Mahabhutas—Earth, Water, Fire, Air, and Space.',
      'In the Indian subcontinent, morning sunlight enters from the East and North-East (Ishanya), making those zones ideal for meditation, study, and main entrances, while the South-East (Agneya) corresponds to kitchen fire and afternoon warmth.',
      'Modern Vastu works best when applied practically: maximizing natural cross-ventilation, clutter-free circulation around the central Brahmasthan, and restful placement of bedrooms.'
    ],
  },
  {
    slug: 'major-arcana-vs-minor-arcana-tarot-basics',
    title: 'Tarot Foundations: Major Arcana Archetypes vs. Minor Arcana Elements',
    hindiTitle: 'टैरो कार्ड परिचय: मेजर आर्काना और माइनर आर्काना के चार तत्व',
    category: 'Tarot Learning',
    author: 'Editorial Research Desk',
    publishedAt: '2026-11-04',
    readTime: '4 min read',
    excerpt: 'How the 78-card deck mirrors life’s major turning points alongside everyday choices in Fire, Water, Air, and Earth.',
    body: [
      'A classic 78-card Tarot deck is divided into 22 Major Arcana cards—from The Fool (0) to The World (21)—representing overarching life themes and inner growth.',
      'The remaining 56 Minor Arcana cards are organized into four elemental suits: Wands (Fire/action), Cups (Water/emotion), Swords (Air/mind), and Pentacles (Earth/material craft).',
      'Used thoughtfully, Tarot serves as a structured mirror for self-reflection rather than fatalistic prediction.'
    ],
  },
];
