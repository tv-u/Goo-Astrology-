export interface TarotCard {
  id: number;
  name: string;
  hindiName: string;
  arcana: 'Major' | 'Minor';
  suit?: 'Wands' | 'Cups' | 'Swords' | 'Pentacles';
  number: number;
  element: 'Fire' | 'Water' | 'Air' | 'Earth' | 'Spirit';
  astrology: string;
  yesNo: 'Yes' | 'No' | 'Maybe';
  uprightKeywords: string[];
  reversedKeywords: string[];
  uprightMeaning: string;
  reversedMeaning: string;
  loveMeaning: string;
  careerMeaning: string;
  financeMeaning: string;
}

const MAJOR_ARCANA: Omit<TarotCard, 'arcana'>[] = [
  { id: 0, name: 'The Fool', hindiName: 'मूर्ख (नई शुरुआत)', number: 0, element: 'Air', astrology: 'Uranus', yesNo: 'Yes', uprightKeywords: ['Beginnings', 'Innocence', 'Leap of faith'], reversedKeywords: ['Recklessness', 'Hesitation', 'Folly'], uprightMeaning: 'Fresh journey, open curiosity, and unburdened trust in the path ahead.', reversedMeaning: 'Pause to assess blind spots before taking an impulsive leap.', loveMeaning: 'Playful new chapter or spontaneous connection.', careerMeaning: 'Uncharted venture, startup energy, or bold pivot.', financeMeaning: 'Start cautiously; avoid speculative risks without research.' },
  { id: 1, name: 'The Magician', hindiName: 'जादूगर', number: 1, element: 'Air', astrology: 'Mercury', yesNo: 'Yes', uprightKeywords: ['Skill', 'Willpower', 'Manifestation'], reversedKeywords: ['Manipulation', 'Untapped talent', 'Illusion'], uprightMeaning: 'All four elements are at your command; translate intention into disciplined action.', reversedMeaning: 'Scattered focus or mixed motives block tangible progress.', loveMeaning: 'Strong magnetic attraction and clear communication.', careerMeaning: 'High competence; pitch ideas and lead with clarity.', financeMeaning: 'Skillful negotiation and resource creation.' },
  { id: 2, name: 'The High Priestess', hindiName: 'महापुजारिन', number: 2, element: 'Water', astrology: 'Moon', yesNo: 'Maybe', uprightKeywords: ['Intuition', 'Mystery', 'Inner knowing'], reversedKeywords: ['Secrets', 'Ignored intuition', 'Surface noise'], uprightMeaning: 'Trust quiet discernment; answers emerge through stillness rather than force.', reversedMeaning: 'Overlooking subtle signals or withholding essential truth.', loveMeaning: 'Deep unspoken bond; allow emotional depth to unfold naturally.', careerMeaning: 'Research quietly before revealing strategy.', financeMeaning: 'Hold cash and read the fine print carefully.' },
  { id: 3, name: 'The Empress', hindiName: 'महारानी', number: 3, element: 'Earth', astrology: 'Venus', yesNo: 'Yes', uprightKeywords: ['Abundance', 'Creativity', 'Nurturing'], reversedKeywords: ['Creative block', 'Overprotection', 'Depletion'], uprightMeaning: 'Fertile growth, artistic beauty, and material comfort flourish steadily.', reversedMeaning: 'Reclaim personal rest before tending to everyone else.', loveMeaning: 'Warmth, sensuality, and flourishing domestic harmony.', careerMeaning: 'Creative ventures, design, and steady expansion thrive.', financeMeaning: 'Nurturing steady wealth and fruitful investments.' },
  { id: 4, name: 'The Emperor', hindiName: 'सम्राट', number: 4, element: 'Fire', astrology: 'Aries', yesNo: 'Yes', uprightKeywords: ['Authority', 'Structure', 'Protection'], reversedKeywords: ['Rigidity', 'Control issues', 'Inflexibility'], uprightMeaning: 'Establish clear boundaries, systems, and long-term governance.', reversedMeaning: 'Excessive control creates friction; lead with measured fairness.', loveMeaning: 'Commitment, loyalty, and protective stability.', careerMeaning: 'Executive leadership, promotion, and firm governance.', financeMeaning: 'Disciplined budgeting and structured asset building.' },
  { id: 5, name: 'The Hierophant', hindiName: 'धर्मगुरु', number: 5, element: 'Earth', astrology: 'Taurus', yesNo: 'Yes', uprightKeywords: ['Tradition', 'Mentorship', 'Ethics'], reversedKeywords: ['Dogma', 'Unconventional path', 'Rebellion'], uprightMeaning: 'Wisdom from lineage, structured study, and ethical counsel guides you.', reversedMeaning: 'Question outdated rules and forge an authentic personal code.', loveMeaning: 'Shared values, formal commitment, or traditional union.', careerMeaning: 'Education, advisory roles, and institutional trust.', financeMeaning: 'Conservative, proven financial instruments favored.' },
  { id: 6, name: 'The Lovers', hindiName: 'प्रेमी युगल', number: 6, element: 'Air', astrology: 'Gemini', yesNo: 'Yes', uprightKeywords: ['Union', 'Alignment', 'Choice'], reversedKeywords: ['Disharmony', 'Indecision', 'Misalignment'], uprightMeaning: 'Heartfelt partnership and values-aligned decision making.', reversedMeaning: 'Resolve internal conflict before committing externally.', loveMeaning: 'Mutual devotion, harmony, and meaningful choice.', careerMeaning: 'Strong business partnership or passion-aligned work.', financeMeaning: 'Joint financial decisions require shared transparency.' },
  { id: 7, name: 'The Chariot', hindiName: 'रथ', number: 7, element: 'Water', astrology: 'Cancer', yesNo: 'Yes', uprightKeywords: ['Victory', 'Momentum', 'Discipline'], reversedKeywords: ['Drift', 'Scattered reins', 'Forcefulness'], uprightMeaning: 'Harness opposing forces with focus to achieve decisive forward movement.', reversedMeaning: 'Regain steering clarity before accelerating.', loveMeaning: 'Overcoming distance or obstacles through shared resolve.', careerMeaning: 'Rapid milestone attainment and competitive win.', financeMeaning: 'Focused debt payoff or decisive wealth target.' },
  { id: 8, name: 'Strength', hindiName: 'शक्ति', number: 8, element: 'Fire', astrology: 'Leo', yesNo: 'Yes', uprightKeywords: ['Courage', 'Compassion', 'Inner poise'], reversedKeywords: ['Self-doubt', 'Impatience', 'Fatigue'], uprightMeaning: 'Quiet patience and gentle resilience tame turbulent situations.', reversedMeaning: 'Restore confidence and avoid harsh self-judgment.', loveMeaning: 'Patient empathy deepens emotional trust.', careerMeaning: 'Steadfast composure under pressure earns respect.', financeMeaning: 'Steady discipline triumphs over impulsive spending.' },
  { id: 9, name: 'The Hermit', hindiName: 'तपस्वी', number: 9, element: 'Earth', astrology: 'Virgo', yesNo: 'Maybe', uprightKeywords: ['Solitude', 'Wisdom', 'Introspection'], reversedKeywords: ['Isolation', 'Withdrawal', 'Ignoring counsel'], uprightMeaning: 'Step back from noise to seek clarity through quiet contemplation.', reversedMeaning: 'Avoid turning healthy reflection into prolonged isolation.', loveMeaning: 'Personal clarity precedes deeper intimacy.', careerMeaning: 'Deep solo research, writing, or mastery.', financeMeaning: 'Quiet audit and prudent conservation.' },
  { id: 10, name: 'Wheel of Fortune', hindiName: 'भाग्य चक्र', number: 10, element: 'Fire', astrology: 'Jupiter', yesNo: 'Yes', uprightKeywords: ['Cycles', 'Turning point', 'Destiny'], reversedKeywords: ['Resistance', 'Temporary delay', 'Unforeseen shift'], uprightMeaning: 'A karmic turning point opens timely opportunity.', reversedMeaning: 'Adapt gracefully to shifting external cycles.', loveMeaning: 'Fateful encounter or refreshing seasonal shift.', careerMeaning: 'Timely break or cyclic industry upswing.', financeMeaning: 'Variable returns; stay nimble and diversified.' },
  { id: 11, name: 'Justice', hindiName: 'न्याय', number: 11, element: 'Air', astrology: 'Libra', yesNo: 'Yes', uprightKeywords: ['Fairness', 'Truth', 'Balance'], reversedKeywords: ['Bias', 'Unaccountability', 'Imbalance'], uprightMeaning: 'Objective truth, legal clarity, and balanced cause-and-effect prevail.', reversedMeaning: 'Examine blind spots and restore equitable terms.', loveMeaning: 'Honest reciprocity and balanced partnership.', careerMeaning: 'Fair contracts, legal clarity, and merit recognition.', financeMeaning: 'Balanced ledgers, tax order, and fair settlements.' },
  { id: 12, name: 'The Hanged Man', hindiName: 'स्थिर दृष्टि', number: 12, element: 'Water', astrology: 'Neptune', yesNo: 'Maybe', uprightKeywords: ['Perspective', 'Pause', 'Surrender'], reversedKeywords: ['Stagnation', 'Martyrdom', 'Resistance'], uprightMeaning: 'A deliberate pause reveals an unexpected vantage point.', reversedMeaning: 'Stop postponing an obvious transition.', loveMeaning: 'Look at the bond through your partner’s eyes.', careerMeaning: 'Strategic pause before relaunch.', financeMeaning: 'Wait for clearer market signals before committing.' },
  { id: 13, name: 'Death', hindiName: 'रूपांतरण', number: 13, element: 'Water', astrology: 'Scorpio', yesNo: 'No', uprightKeywords: ['Transformation', 'Closure', 'Renewal'], reversedKeywords: ['Clinging', 'Delayed transition', 'Fear of change'], uprightMeaning: 'Natural closure of an old chapter clears soil for authentic renewal.', reversedMeaning: 'Holding onto outgrown structures prolongs transition.', loveMeaning: 'Deep transformation or release of old patterns.', careerMeaning: 'Career pivot, restructuring, or role completion.', financeMeaning: 'Cut losing commitments and reset budget.' },
  { id: 14, name: 'Temperance', hindiName: 'संयम', number: 14, element: 'Fire', astrology: 'Sagittarius', yesNo: 'Yes', uprightKeywords: ['Moderation', 'Alchemy', 'Healing'], reversedKeywords: ['Excess', 'Impatience', 'Friction'], uprightMeaning: 'Patient synthesis blends contrasting elements into serene equilibrium.', reversedMeaning: 'Rebalance extremes in schedule or temperament.', loveMeaning: 'Calm healing, compromise, and steady affection.', careerMeaning: 'Cross-functional harmony and sustainable pacing.', financeMeaning: 'Balanced portfolio and measured cash flow.' },
  { id: 15, name: 'The Devil', hindiName: 'मोह-बंधन', number: 15, element: 'Earth', astrology: 'Capricorn', yesNo: 'No', uprightKeywords: ['Attachment', 'Shadow', 'Ambition'], reversedKeywords: ['Liberation', 'Breaking chains', 'Clarity'], uprightMeaning: 'Examine where over-attachment or fear limits your freedom.', reversedMeaning: 'Reclaiming agency and stepping free from unhealthy habits.', loveMeaning: 'Intense attraction; ensure healthy boundaries.', careerMeaning: 'High drive, yet guard against burnout or golden handcuffs.', financeMeaning: 'Beware high-interest debt or impulsive indulgence.' },
  { id: 16, name: 'The Tower', hindiName: 'आकस्मिक परिवर्तन', number: 16, element: 'Fire', astrology: 'Mars', yesNo: 'No', uprightKeywords: ['Revelation', 'Upheaval', 'Awakening'], reversedKeywords: ['Averted shock', 'Internal shakeup', 'Delaying truth'], uprightMeaning: 'Sudden clarity dismantles fragile illusions so truth can stand.', reversedMeaning: 'Voluntary restructuring softens inevitable change.', loveMeaning: 'Breakthrough honesty clears unspoken tension.', careerMeaning: 'Sudden organizational shift opening honest ground.', financeMeaning: 'Maintain emergency reserves for unexpected costs.' },
  { id: 17, name: 'The Star', hindiName: 'नक्षत्र (आशा)', number: 17, element: 'Air', astrology: 'Aquarius', yesNo: 'Yes', uprightKeywords: ['Hope', 'Renewal', 'Inspiration'], reversedKeywords: ['Discouragement', 'Disconnection', 'Fatigue'], uprightMeaning: 'Serene clarity, healing grace, and renewed faith illuminate the horizon.', reversedMeaning: 'Reconnect with simple daily sources of hope.', loveMeaning: 'Authentic, healing connection and shared ideals.', careerMeaning: 'Inspired vision and public goodwill.', financeMeaning: 'Steady recovery and patient long-term optimism.' },
  { id: 18, name: 'The Moon', hindiName: 'चंद्रमा', number: 18, element: 'Water', astrology: 'Pisces', yesNo: 'Maybe', uprightKeywords: ['Subconscious', 'Dreams', 'Ambiguity'], reversedKeywords: ['Clarity emerging', 'Truth revealed', 'Subsided fear'], uprightMeaning: 'Navigate fog with patience; not every shadow is what it seems.', reversedMeaning: 'Hidden facts surface, dispelling unnecessary anxiety.', loveMeaning: 'Verify assumptions with gentle direct conversation.', careerMeaning: 'Clarify ambiguous expectations in writing.', financeMeaning: 'Double-check agreements for hidden clauses.' },
  { id: 19, name: 'The Sun', hindiName: 'सूर्य', number: 19, element: 'Fire', astrology: 'Sun', yesNo: 'Yes', uprightKeywords: ['Vitality', 'Joy', 'Clarity'], reversedKeywords: ['Temporary cloud', 'Ego warmth', 'Delayed shine'], uprightMeaning: 'Radiant success, clear truth, and warm vitality bless your efforts.', reversedMeaning: 'Success arrives, though modesty keeps warmth intact.', loveMeaning: 'Joyful openness, celebration, and mutual pride.', careerMeaning: 'Public recognition, clarity, and confident achievement.', financeMeaning: 'Prosperity, clear growth, and generous stability.' },
  { id: 20, name: 'Judgement', hindiName: 'आत्म-जागरण', number: 20, element: 'Fire', astrology: 'Pluto', yesNo: 'Yes', uprightKeywords: ['Awakening', 'Calling', 'Absolution'], reversedKeywords: ['Self-criticism', 'Doubt', 'Missed call'], uprightMeaning: 'Answer a higher calling with forgiveness for past chapters.', reversedMeaning: 'Release harsh self-judgement to move forward.', loveMeaning: 'Renewed understanding and meaningful reconciliation.', careerMeaning: 'Vocation alignment or decisive evaluation.', financeMeaning: 'Clean slate and wise long-term reckoning.' },
  { id: 21, name: 'The World', hindiName: 'विश्व (पूर्णता)', number: 21, element: 'Earth', astrology: 'Saturn', yesNo: 'Yes', uprightKeywords: ['Completion', 'Mastery', 'Integration'], reversedKeywords: ['Unfinished loop', 'Near completion', 'Delay'], uprightMeaning: 'A major cycle reaches harmonious fulfillment and global readiness.', reversedMeaning: 'Tie up remaining details to complete the milestone.', loveMeaning: 'Deep fulfillment, travel, or milestone union.', careerMeaning: 'Successful project launch or international scope.', financeMeaning: 'Milestone achieved; consolidate and celebrate.' },
];

const SUITS: { suit: 'Wands' | 'Cups' | 'Swords' | 'Pentacles'; element: 'Fire' | 'Water' | 'Air' | 'Earth'; theme: string; astro: string }[] = [
  { suit: 'Wands', element: 'Fire', theme: 'Initiative, inspiration & creative drive', astro: 'Fire Signs' },
  { suit: 'Cups', element: 'Water', theme: 'Emotion, relationships & intuition', astro: 'Water Signs' },
  { suit: 'Swords', element: 'Air', theme: 'Intellect, truth, decisions & clarity', astro: 'Air Signs' },
  { suit: 'Pentacles', element: 'Earth', theme: 'Material craft, health & prosperity', astro: 'Earth Signs' },
];

const RANKS: { num: number; label: string; yesNo: 'Yes' | 'No' | 'Maybe'; kw: string; rev: string }[] = [
  { num: 1, label: 'Ace', yesNo: 'Yes', kw: 'Pure potential, seed, breakthrough', rev: 'Delayed spark, ungrounded start' },
  { num: 2, label: 'Two', yesNo: 'Maybe', kw: 'Balance, partnership, deliberation', rev: 'Indecision, imbalance' },
  { num: 3, label: 'Three', yesNo: 'Yes', kw: 'Expansion, collaboration, early fruit', rev: 'Friction in teamwork' },
  { num: 4, label: 'Four', yesNo: 'Yes', kw: 'Stability, structure, consolidation', rev: 'Restlessness, stagnation' },
  { num: 5, label: 'Five', yesNo: 'No', kw: 'Challenge, friction, growth test', rev: 'Resolution after conflict' },
  { num: 6, label: 'Six', yesNo: 'Yes', kw: 'Harmony, reciprocity, steady progress', rev: 'Imbalanced exchange' },
  { num: 7, label: 'Seven', yesNo: 'Maybe', kw: 'Assessment, perseverance, inner test', rev: 'Overwhelm, second-guessing' },
  { num: 8, label: 'Eight', yesNo: 'Yes', kw: 'Mastery, movement, focused craft', rev: 'Burnout, rushing' },
  { num: 9, label: 'Nine', yesNo: 'Yes', kw: 'Fulfillment, resilience, near completion', rev: 'Guardedness, fatigue' },
  { num: 10, label: 'Ten', yesNo: 'Maybe', kw: 'Culmination, responsibility, legacy', rev: 'Releasing excess burden' },
  { num: 11, label: 'Page', yesNo: 'Yes', kw: 'Curiosity, fresh message, student mindset', rev: 'Scattered attention' },
  { num: 12, label: 'Knight', yesNo: 'Yes', kw: 'Action, pursuit, dedicated momentum', rev: 'Haste or stalled action' },
  { num: 13, label: 'Queen', yesNo: 'Yes', kw: 'Nurturing mastery, quiet authority', rev: 'Over-sensitivity, boundary check' },
  { num: 14, label: 'King', yesNo: 'Yes', kw: 'Mature leadership, executive command', rev: 'Stubborn control' },
];

const MINOR_ARCANA: TarotCard[] = SUITS.flatMap((s, sIdx) =>
  RANKS.map((r, rIdx) => {
    const id = 22 + sIdx * 14 + rIdx;
    const name = `${r.label} of ${s.suit}`;
    const isSwordsChallenge = s.suit === 'Swords' && [3, 5, 7, 8, 9, 10].includes(r.num);
    return {
      id,
      name,
      hindiName: `${r.label} (${s.suit})`,
      arcana: 'Minor',
      suit: s.suit,
      number: r.num,
      element: s.element,
      astrology: s.astro,
      yesNo: isSwordsChallenge ? 'No' : r.yesNo,
      uprightKeywords: r.kw.split(', '),
      reversedKeywords: r.rev.split(', '),
      uprightMeaning: `${name} channels ${s.theme.toLowerCase()} through ${r.kw.toLowerCase()}.`,
      reversedMeaning: `Reversed ${name} highlights ${r.rev.toLowerCase()} within ${s.suit.toLowerCase()} matters.`,
      loveMeaning: `In relationships, ${name} emphasizes ${s.suit === 'Cups' ? 'emotional honesty' : s.suit === 'Wands' ? 'shared passion' : s.suit === 'Swords' ? 'clear dialogue' : 'reliable devotion'}.`,
      careerMeaning: `At work, ${name} points toward ${r.kw.toLowerCase()} in ${s.element.toLowerCase()} expression.`,
      financeMeaning: `Financially, ${name} advises ${s.suit === 'Pentacles' ? 'steady stewardship' : 'measured planning'} around ${r.kw.toLowerCase()}.`,
    };
  })
);

export const TAROT_DECK: TarotCard[] = [
  ...MAJOR_ARCANA.map((c) => ({ ...c, arcana: 'Major' as const })),
  ...MINOR_ARCANA,
];

export interface DrawnTarotCard {
  card: TarotCard;
  isReversed: boolean;
  positionLabel: string;
}

export function drawTarotSpread(
  spreadType: 'one' | 'three' | 'five' | 'love' | 'career' | 'finance' | 'daily' | 'yesno',
  allowReversed = true
): DrawnTarotCard[] {
  const labelsBySpread: Record<typeof spreadType, string[]> = {
    one: ['Core Insight'],
    daily: ['Energy of the Day'],
    yesno: ['Direct Answer'],
    three: ['Past Foundation', 'Present Focus', 'Emerging Path'],
    love: ['Your Heart', 'Partner / Dynamic', 'Relationship Outlook'],
    career: ['Current Role', 'Hidden Opportunity', 'Next Career Step'],
    finance: ['Cash Flow & Habits', 'Challenge / Block', 'Material Outlook'],
    five: ['Present Situation', 'Core Influence', 'Obstacle', 'Guidance', 'Likely Outcome'],
  };
  const labels = labelsBySpread[spreadType];
  const pool = [...TAROT_DECK];
  // Fisher-Yates shuffle using crypto if available
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return labels.map((label, idx) => ({
    card: pool[idx],
    isReversed: allowReversed ? Math.random() < 0.28 : false,
    positionLabel: label,
  }));
}
