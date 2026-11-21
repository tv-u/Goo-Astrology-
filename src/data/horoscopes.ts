import { ZODIAC_SIGNS } from '../engine/constants';

export interface HoroscopeEntry {
  signIndex: number;
  signName: string;
  hindiName: string;
  publishedDate: string;
  daily: string;
  tomorrow: string;
  weekly: string;
  monthly: string;
  yearly: string;
  love: string;
  career: string;
  business: string;
  finance: string;
  health: string;
  education: string;
  luckyNumber: number;
  luckyColour: string;
  luckyTime: string;
}

const FOCUS_THEMES = [
  { love: 'Honest dialogue strengthens warmth; express appreciation clearly.', career: 'Direct initiative brings visibility on stalled tasks.', business: 'Review vendor agreements before expanding inventory.', finance: 'Reserve 15% of inflows before discretionary spending.', health: 'Prioritize hydration and morning mobility.', education: 'Short timed study blocks sharpen retention.' },
  { love: 'Shared quiet meals restore emotional ease.', career: 'Steady execution outperforms hasty changes today.', business: 'Long-term client retention pays dividends.', finance: 'Audit recurring subscriptions and fixed assets.', health: 'Guard throat and neck against cold drafts.', education: 'Practice structured revision notes.' },
  { love: 'Curiosity sparks lively conversation with your partner.', career: 'Writing, presentations, and networking shine.', business: 'Test fresh messaging on a small audience first.', finance: 'Keep liquid cash separated from short-term trades.', health: 'Take brief screen breaks to rest eyes and wrists.', education: 'Excellent window for languages and analytical drills.' },
  { love: 'Emotional sensitivity deepens trust when boundaries are gentle.', career: 'Supportive team stewardship earns quiet respect.', business: 'Home-based or hospitality ventures gain traction.', finance: 'Family budgeting conversations yield practical clarity.', health: 'Favor warm, freshly cooked meals.', education: 'Study in a calm, distraction-free corner.' },
  { love: 'Warm generosity revitalizes romance.', career: 'Take ownership of creative direction with humility.', business: 'Brand clarity differentiates you from noisy competitors.', finance: 'Avoid impulse luxury purchases; invest in durable quality.', health: 'Back posture and sunlight exposure boost vitality.', education: 'Teach a concept aloud to master it.' },
  { love: 'Thoughtful small gestures speak louder than grand promises.', career: 'Detail-oriented audits prevent costly rework.', business: 'Streamline operations and standardize checklists.', finance: 'Tax planning and ledger reconciliation are favored.', health: 'Light fiber-rich meals support digestion.', education: 'Solve past mock papers for speed and accuracy.' },
  { love: 'Seek balanced compromise where both voices feel heard.', career: 'Collaborative partnerships open new doors.', business: 'Joint ventures flourish when expectations are documented.', finance: 'Equitable profit-sharing builds lasting trust.', health: 'Evening walks restore mental equilibrium.', education: 'Group discussions refine critical arguments.' },
  { love: 'Depth and loyalty anchor meaningful conversations.', career: 'Deep research uncovers insights others missed.', business: 'Protect intellectual property and confidential roadmaps.', finance: 'Focus on debt reduction and emergency reserves.', health: 'Breathwork calms nervous intensity.', education: 'Dive deep into one core subject rather than skimming.' },
  { love: 'Shared learning or travel plans refresh bond energy.', career: 'Mentorship and big-picture strategy are highlighted.', business: 'Explore cross-regional outreach carefully.', finance: 'Long-horizon investments suit your temperament.', health: 'Outdoor brisk walking strengthens stamina.', education: 'Philosophy, law, and higher studies progress smoothly.' },
  { love: 'Reliable follow-through builds enduring security.', career: 'Structured planning earns executive confidence.', business: 'Deliver on existing milestones before pitching new tiers.', finance: 'Disciplined compounding beats speculative chasing.', health: 'Joint stretches and consistent sleep timing help.', education: 'Maintain a daily study log to track steady mastery.' },
  { love: 'Intellectual rapport and friendship nourish intimacy.', career: 'Systems automation and community projects flourish.', business: 'Modernize workflows while keeping customer care human.', finance: 'Diversify thoughtfully; verify claims independently.', health: 'Unplug 45 minutes before sleep for deeper rest.', education: 'STEM, data, and collaborative projects shine.' },
  { love: 'Compassionate listening dissolves old misunderstandings.', career: 'Creative synthesis and advisory work bring fulfillment.', business: 'Align purpose with sustainable margins.', finance: 'Double-check invoices and avoid vague verbal pledges.', health: 'Restorative sleep and foot care restore energy.', education: 'Creative arts, music, and reflective writing flow well.' },
];

export function getInterpretedHoroscopes(dateStr?: string): HoroscopeEntry[] {
  const today = dateStr || new Date().toISOString().slice(0, 10);
  const daySeed = Number(today.replace(/-/g, '')) % 12;

  return ZODIAC_SIGNS.map((sign, idx) => {
    const theme = FOCUS_THEMES[(idx + daySeed) % 12];
    const hour = 9 + ((idx + daySeed) % 8);
    return {
      signIndex: idx,
      signName: sign.name,
      hindiName: sign.hindiName,
      publishedDate: today,
      daily: `Traditional ${sign.sanskritName} (${sign.element}) interpretive outlook: lean into ${sign.rulerName}'s constructive qualities—clarity, patience, and deliberate pacing.`,
      tomorrow: `Tomorrow favors measured follow-through on commitments begun earlier this week under ${sign.rulerName}'s steady influence.`,
      weekly: `This week highlights balancing personal initiative with grounded routines across work, family, and financial stewardship.`,
      monthly: `Across this month, ${sign.sanskritName} themes emphasize consolidating core skills and tending to long-term relationships.`,
      yearly: `Annual interpretive cycle for ${sign.name}: focus on durable foundations, ethical choices, and gradual expansion rather than shortcuts.`,
      love: theme.love,
      career: theme.career,
      business: theme.business,
      finance: theme.finance,
      health: theme.health,
      education: theme.education,
      luckyNumber: sign.luckyNumber[(daySeed + idx) % sign.luckyNumber.length],
      luckyColour: sign.luckyColors[(daySeed + idx) % sign.luckyColors.length],
      luckyTime: `${String(hour).padStart(2, '0')}:15 – ${String(hour + 1).padStart(2, '0')}:30`,
    };
  });
}
