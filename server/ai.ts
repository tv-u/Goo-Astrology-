import { GoogleGenAI } from '@google/genai';
import { ZODIAC_SIGNS } from '../src/engine/constants';
import { type KundliResult } from '../src/engine/ephemeris';
import { analyzeDoshasAndYogas } from '../src/engine/doshaYoga';
import { SUPPORTED_LANGUAGES, type IndianLanguageCode } from '../src/data/locales';

export interface AiChatInput {
  question: string;
  language: IndianLanguageCode;
  kundliContext?: KundliResult | null;
  history?: { role: 'user' | 'assistant'; text: string }[];
}

export interface AiChatResult {
  reply: string;
  engine: 'gemini-4-hydrogen' | 'local-vedic-kb';
  disclaimer: string;
}

function buildDeterministicVedicReply(input: AiChatInput): string {
  const q = input.question.toLowerCase();
  const isDevanagari = input.language === 'hi' || input.language === 'sa' || input.language === 'mr';
  const k = input.kundliContext;
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === input.language);

  if (k) {
    const moon = k.planets.find((p) => p.id === 'Moon');
    const sun = k.planets.find((p) => p.id === 'Sun');
    const saturn = k.planets.find((p) => p.id === 'Saturn');
    const analysis = analyzeDoshasAndYogas(k);
    const activeDoshas = analysis.doshas.filter((d) => d.present).map((d) => d.name);
    const activeYogas = analysis.yogas.filter((y) => y.present).map((y) => y.name);

    if (q.includes('dasha') || q.includes('दशा') || q.includes('period') || q.includes('time')) {
      const m = k.currentMahadasha;
      const a = k.currentAntardasha;
      const p = k.currentPratyantardasha;
      if (isDevanagari) {
        return `आपकी जन्म कुंडली (${k.input.name}) के अनुसार वर्तमान में ${m?.lord || '—'} महादशा (${m?.startDate} से ${m?.endDate}) और ${a?.lord || '—'} अंतर्दशा (${a?.startDate} से ${a?.endDate}) चल रही है। प्रत्यंतर दशा ${p?.lord || '—'} की है। विंशोत्तरी दशा आपके जन्म चंद्र नक्षत्र (${moon?.nakshatraName}) के आधार पर तय होती है।`;
      }
      return `Based on ${k.input.name}'s calculated birth chart (${moon?.nakshatraName} Pada ${moon?.pada}), your active Vimshottari period is ${m?.lord} Mahadasha (${m?.startDate} to ${m?.endDate}), ${a?.lord} Antardasha (${a?.startDate} to ${a?.endDate}), and ${p?.lord} Pratyantardasha (${p?.startDate} to ${p?.endDate}). Focus on the houses ruled and occupied by ${m?.lord} and ${a?.lord} in your D1 Lagna chart.`;
    }

    if (q.includes('dosha') || q.includes('manglik') || q.includes('kaal') || q.includes('दोष') || q.includes('मांगलिक')) {
      if (isDevanagari) {
        return activeDoshas.length > 0
          ? `आपकी कुंडली की शास्त्रीय जांच में सक्रिय संकेत: ${activeDoshas.join(', ')}। अन्य दोष या तो अनुपस्थित हैं या परिहार (cancellation) नियमों से संतुलित हैं।`
          : `आपकी कुंडली में कोई प्रमुख सक्रिय दोष (जैसे सक्रिय मांगलिक या काल सर्प दोष) नहीं पाया गया है।`;
      }
      return activeDoshas.length > 0
        ? `Checked classical Dosha rules & exceptions on ${k.input.name}'s chart: ${activeDoshas.join(', ')} triggered active criteria. Full rule details and cancellation checks are shown in the Dosha module.`
        : `No uncancelled major Doshas (Manglik, Kaal Sarp, Grahan, or Kemadruma) are active in ${k.input.name}'s calculated chart after checking classical exceptions.`;
    }

    if (q.includes('yoga') || q.includes('career') || q.includes('job') || q.includes('योग') || q.includes('करियर')) {
      const d10 = k.divisionalCharts.find((c) => c.code === 'D10');
      const d10Asc = d10 ? ZODIAC_SIGNS[d10.ascendantSignIndex].name : '—';
      return isDevanagari
        ? `लग्न ${k.ascendant.signName}, चंद्र राशि ${moon?.signName}, और दशमांश (D10) लग्न ${d10Asc} है। प्रमुख सक्रिय योग: ${activeYogas.length ? activeYogas.join(', ') : 'संतुलित ग्रह स्थिति'}।`
        : `Your Lagna is ${k.ascendant.signName} (${k.ascendant.dms}), Moon Rashi is ${moon?.signName} (${moon?.nakshatraName}), and Dashamsha (D10) Ascendant is ${d10Asc}. Active classical Yogas detected: ${activeYogas.length ? activeYogas.join(', ') : 'Balanced planetary placements without extreme Raja-yoga clustering'}.`;
    }

    if (q.includes('planet') || q.includes('lagna') || q.includes('rashi') || q.includes('ग्रह') || q.includes('राशि')) {
      return isDevanagari
        ? `${k.input.name} की कुंडली (लाहिड़ी अयनांश ${k.ayanamshaDms}): लग्न ${k.ascendant.signName}, सूर्य ${sun?.signName} (भाव ${sun?.house}), चंद्र ${moon?.signName} (${moon?.nakshatraName} चरण ${moon?.pada}), और शनि ${saturn?.signName} (भाव ${saturn?.house}) में स्थित हैं।`
        : `Chart summary for ${k.input.name} (Lahiri Ayanamsha ${k.ayanamshaDms}): Lagna is ${k.ascendant.signName} (${k.ascendant.dms}), Sun is in ${sun?.signName} (H${sun?.house}), Moon is in ${moon?.signName} (${moon?.nakshatraName} Pada ${moon?.pada}), and Saturn sits in ${saturn?.signName} (H${saturn?.house}, ${saturn?.dignity}).`;
    }
  }

  // General Vedic knowledge responses without chart context
  if (q.includes('manglik') || q.includes('मांगलिक')) {
    return isDevanagari
      ? 'मांगलिक (कुज) दोष तब बनता है जब मंगल लग्न या चंद्रमा से 1, 2, 4, 7, 8 या 12वें भाव में हो। किंतु स्वराशि (मेष/वृश्चिक), उच्च (मकर), या गुरु की दृष्टि होने पर इसका परिहार (cancellation) हो जाता है।'
      : 'Manglik (Kuja) Dosha occurs when Mars occupies houses 1, 2, 4, 7, 8, or 12 from Lagna or Moon. Classical texts waive or reduce it when Mars is in Aries, Scorpio, or Capricorn, or aspected/conjoined by Jupiter.';
  }

  if (q.includes('panchang') || q.includes('rahu kaal') || q.includes('पंचांग') || q.includes('राहु')) {
    return isDevanagari
      ? 'दैनिक पंचांग में 5 अंग होते हैं: तिथि, वार, नक्षत्र, योग और करण। राहुकाल स्थानीय सूर्योदय और सूर्यास्त के बीच के समय को 8 बराबर भागों में बांटकर निकाला जाता है।'
      : 'Panchang comprises five limbs: Tithi, Vara, Nakshatra, Yoga, and Karana. Rahu Kaal is computed by dividing your exact local Sunrise-to-Sunset daylight span into 8 equal segments.';
  }

  if (q.includes('nakshatra') || q.includes('नक्षत्र')) {
    return isDevanagari
      ? `वैदिक ज्योतिष में 27 नक्षत्र होते हैं, प्रत्येक 13°20' का होता है और 4 चरणों (3°20' प्रति चरण) में बंटा होता है। जन्म चंद्र नक्षत्र से विंशोत्तरी दशा और अष्टकूट मिलान की गणना होती है।`
      : `Vedic astrology divides the 360° sidereal zodiac into 27 Nakshatras of 13°20' each (4 Padas of 3°20'). The Moon's Nakshatra at birth seeds your 120-year Vimshottari Dasha and 36-point Ashtakoot compatibility.`;
  }

  if (q.includes('tarot') || q.includes('टैरो')) {
    return isDevanagari
      ? 'टैरो के 78 कार्डों में 22 मेजर आर्काना (जीवन के बड़े मोड़) और 56 माइनर आर्काना (दैनिक कर्म, भावना, विचार और भौतिक स्थिति) होते हैं। आप हमारे टैरो सेक्शन में 1, 3 या 5 कार्ड रीडिंग निकाल सकते हैं।'
      : 'A standard 78-card Tarot deck pairs 22 Major Arcana archetypes with 56 Minor Arcana cards across Fire (Wands), Water (Cups), Air (Swords), and Earth (Pentacles). Use our Tarot Reading module to draw live spreads.';
  }

  return isDevanagari
    ? `मैं GOO AI ज्योतिषी (Local Vedic Knowledge Engine) हूँ। आप ऊपर दिए गए जन्म विवरण फॉर्म से अपनी कुंडली जोड़ सकते हैं, और फिर दशा, लग्न, मांगलिक दोष, पंचांग, नक्षत्र, टैरो या अंकशास्त्र से जुड़े प्रश्न पूछ सकते हैं।`
    : k
    ? `[${langMeta?.nativeName || 'English'}] I am running on the built-in Vedic Knowledge Engine grounded in ${k.input.name}'s computed chart (${k.ascendant.signName} Lagna, ${k.planets.find((p) => p.id === 'Moon')?.signName} Moon, ${k.currentMahadasha?.lord} Mahadasha). Ask specifically about your Dasha periods, Yogas, Doshas, career D10, or marriage D9.`
    : `[${langMeta?.nativeName || 'English'}] I am running on the deterministic Vedic Knowledge Engine (no external AI key required). Load or generate a Kundli first for personalized chart answers, or ask about Lahiri Ayanamsha, Vimshottari Dasha, Ashtakoot matching, Panchang, or Numerology.`;
}

export async function runAiAstrologer(input: AiChatInput): Promise<AiChatResult> {
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === input.language);
  const disclaimer =
    input.language === 'hi' || input.language === 'sa' || input.language === 'mr'
      ? 'अस्वीकरण: वैदिक ज्योतिष पारंपरिक व्याख्या और खगोलीय गणना पर आधारित है; चिकित्सा, कानूनी या वित्तीय निर्णयों के लिए विशेषज्ञ सलाह लें।'
      : 'Disclaimer: Astrological insights combine astronomical calculations with traditional Vedic interpretation and do not replace medical, legal, or financial advice.';

  const apiKey = process.env.GEMINI_API_KEY;
  const hasRealKey = Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'MY_GEMINI_API_KEY');

  if (!hasRealKey) {
    return {
      reply: buildDeterministicVedicReply(input),
      engine: 'local-vedic-kb',
      disclaimer,
    };
  }

  try {
    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const chartSummary = input.kundliContext
      ? JSON.stringify({
          subject: input.kundliContext.input.name,
          ayanamsha: input.kundliContext.assumptions.ayanamshaSetting,
          ascendant: {
            sign: input.kundliContext.ascendant.signName,
            dms: input.kundliContext.ascendant.dms,
            nakshatra: input.kundliContext.ascendant.nakshatraName,
          },
          planets: input.kundliContext.planets.map((p) => ({
            id: p.id,
            sign: p.signName,
            dms: p.dms,
            house: p.house,
            nakshatra: `${p.nakshatraName} P${p.pada}`,
            dignity: p.dignity,
            retro: p.isRetrograde,
            combust: p.isCombust,
          })),
          currentDasha: {
            maha: input.kundliContext.currentMahadasha?.lord,
            antar: input.kundliContext.currentAntardasha?.lord,
            pratyantar: input.kundliContext.currentPratyantardasha?.lord,
          },
        })
      : 'No birth chart attached yet.';

    const systemInstruction =
      `You are GOO AI ASTROLOGER for GOO ASTROLOGY UNLIMITED FREE. ` +
      `Respond in ${langMeta ? `${langMeta.name} (${langMeta.nativeName}, ${langMeta.script} script)` : 'clear English'} with accurate Sanskrit Vedic terminology. ` +
      `Only cite planetary placements present in the verified chart JSON below; NEVER invent planetary longitudes or pretend unprovided chart data exists. ` +
      `Keep responses structured, practical, balanced, and non-fatalistic (around 120-220 words). ` +
      `Verified User Chart Context: ${chartSummary}`;

    const historyText = (input.history || [])
      .slice(-6)
      .map((m) => `${m.role === 'user' ? 'User' : 'Astrologer'}: ${m.text}`)
      .join('\n');

    const prompt = historyText
      ? `${historyText}\nUser: ${input.question}`
      : input.question;

    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: prompt,
      config: {
        systemInstruction,
      },
    });

    const text = response.text?.trim();
    if (text) {
      return {
        reply: text,
        engine: 'gemini-4-hydrogen',
        disclaimer,
      };
    }
  } catch (err) {
    console.warn('Gemini API fallback to local Vedic KB:', err instanceof Error ? err.message : err);
  }

  return {
    reply: buildDeterministicVedicReply(input),
    engine: 'local-vedic-kb',
    disclaimer,
  };
}
