import { questionScoring } from '../data/questions';
import { personas, PersonaName } from '../data/personas';

export interface PersonaResult {
  name: PersonaName;
  emoji: string;
  description: string;
  score: number;
}

export interface CompatibilityReport {
  overallPercentage: number;
  compatibilityLevel: string;
  description: string;
  chemistryPercentage: number;
  chemistryDescription: string;
  romancePercentage: number;
  romanceDescription: string;
}

export function calculateResult(answers: Record<number, 'left' | 'right'>, questionSet?: 'nigeria' | 'global'): PersonaResult {
  const scores: Partial<Record<PersonaName, number>> = {};

  // Only count right swipes (like original lovestruck)
  Object.entries(answers).forEach(([qId, choice]) => {
    if (choice === 'right') {
      const questionId = Number(qId);
      const scoring = questionScoring[questionId];

      if (scoring) {
        Object.entries(scoring).forEach(([persona, points]) => {
          const personaName = persona as PersonaName;
          scores[personaName] = (scores[personaName] || 0) + points;
        });
      }
    }
  });

  // Find the persona with the highest score
  let topPersona: PersonaName = 'The Vibe Checker'; // default
  let maxScore = 0;

  Object.entries(scores).forEach(([persona, score]) => {
    if (score > maxScore) {
      maxScore = score;
      topPersona = persona as PersonaName;
    }
  });

  const persona = personas[topPersona];
  const description = questionSet === 'nigeria'
    ? (persona.nigeriaDescription || persona.description)
    : persona.description;

  return {
    name: topPersona,
    emoji: persona.emoji,
    description,
    score: maxScore,
  };
}

// Keywords to categorize questions
const CHEMISTRY_KEYWORDS = [
  'communication', 'talk', 'text', 'call', 'respond', 'message', 'reply', 'listen',
  'argue', 'fight', 'conflict', 'apologize', 'sorry', 'mad', 'angry', 'upset',
  'friends', 'family', 'social', 'hang out', 'time together', 'space', 'alone time',
  'honest', 'lie', 'secret', 'trust', 'jealous', 'check', 'phone', 'password'
];

const ROMANCE_KEYWORDS = [
  'love', 'romantic', 'date', 'kiss', 'affection', 'cuddle', 'hold hands',
  'gift', 'surprise', 'gesture', 'flowers', 'valentine', 'anniversary',
  'compliment', 'praise', 'sweet', 'cute', 'pet name', 'babe', 'baby',
  'wedding', 'marry', 'future', 'together', 'soulmate', 'heart'
];

// Red flag keywords - questions where "yes" indicates concerning behavior
const RED_FLAG_KEYWORDS = [
  'jealous', 'check your phone', 'control', 'track', 'location', 'password',
  'go through', 'secretly', 'lie', 'cheat', 'flirt with', 'ghost', 'ignore',
  'yell', 'explosive', 'silent treatment', 'manipulate', 'guilt trip'
];

// Green flag keywords - questions where "yes" indicates healthy behavior
const GREEN_FLAG_KEYWORDS = [
  'support', 'encourage', 'respect', 'boundaries', 'communicate', 'listen',
  'apologize', 'compromise', 'quality time', 'celebrate', 'trust',
  'honest', 'vulnerable', 'grow together', 'independent'
];

type QuestionPolarity = 'red-flag' | 'green-flag' | 'neutral';

function categorizeQuestion(questionText: string): 'chemistry' | 'romance' | 'both' {
  const lowerText = questionText.toLowerCase();
  const hasChemistry = CHEMISTRY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasRomance = ROMANCE_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasChemistry && hasRomance) return 'both';
  if (hasChemistry) return 'chemistry';
  if (hasRomance) return 'romance';
  return 'both'; // Default to counting for both if unclear
}

function getQuestionPolarity(questionText: string): QuestionPolarity {
  const lowerText = questionText.toLowerCase();
  const hasRedFlag = RED_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasGreenFlag = GREEN_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasRedFlag) return 'red-flag';
  if (hasGreenFlag) return 'green-flag';
  return 'neutral';
}

function calculateQuestionScore(
  answer1: 'left' | 'right',
  answer2: 'left' | 'right',
  polarity: QuestionPolarity
): number {
  const bothYes = answer1 === 'right' && answer2 === 'right';
  const bothNo = answer1 === 'left' && answer2 === 'left';

  if (polarity === 'red-flag') {
    // Red flag questions: Both saying "no" is great, both "yes" is bad
    if (bothNo) return 1.5; // Extra points for both rejecting red flags
    if (bothYes) return 0.3; // Low score for both accepting red flags
    return 0; // Mismatch on red flags is a big issue
  } else if (polarity === 'green-flag') {
    // Green flag questions: Both saying "yes" is great, both "no" is concerning
    if (bothYes) return 1.5; // Extra points for both embracing green flags
    if (bothNo) return 0.5; // Lower score for both rejecting healthy behaviors
    return 0.7; // Mismatch is okay, one person can lead by example
  } else {
    // Neutral questions: Just matching preferences
    if (bothYes || bothNo) return 1.0; // Standard match
    return 0.5; // Slight credit for different preferences (can complement)
  }
}

export function calculateCompatibility(
  answers1: Record<number, 'left' | 'right'>,
  answers2: Record<number, 'left' | 'right'>,
  name1: string,
  name2: string,
  questions?: Array<{ id: number; text: string }>
): CompatibilityReport {
  // Calculate weighted compatibility scores
  let totalScore = 0;
  let maxPossibleScore = 0;

  // Track chemistry and romance specific scores
  let chemistryScore = 0;
  let chemistryMaxScore = 0;
  let romanceScore = 0;
  let romanceMaxScore = 0;

  Object.keys(answers1).forEach(qIdStr => {
    const qId = Number(qIdStr);
    if (answers2[qId] !== undefined) {
      let polarity: QuestionPolarity = 'neutral';
      let category: 'chemistry' | 'romance' | 'both' = 'both';

      // Get question metadata if available
      if (questions) {
        const question = questions.find(q => q.id === qId);
        if (question) {
          polarity = getQuestionPolarity(question.text);
          category = categorizeQuestion(question.text);
        }
      }

      // Calculate weighted score for this question
      const questionScore = calculateQuestionScore(answers1[qId], answers2[qId], polarity);
      const questionMaxScore = polarity === 'red-flag' || polarity === 'green-flag' ? 1.5 : 1.0;

      totalScore += questionScore;
      maxPossibleScore += questionMaxScore;

      // Track by category
      if (category === 'chemistry' || category === 'both') {
        chemistryScore += questionScore;
        chemistryMaxScore += questionMaxScore;
      }

      if (category === 'romance' || category === 'both') {
        romanceScore += questionScore;
        romanceMaxScore += questionMaxScore;
      }
    }
  });

  // Calculate base compatibility (65-98% range with better scaling)
  const baseCompatibility = maxPossibleScore > 0
    ? Math.round((totalScore / maxPossibleScore) * 100)
    : 75;

  const overallPercentage = Math.min(98, Math.max(65, baseCompatibility));

  // Calculate chemistry percentage using weighted scores
  let chemistryPercentage: number;
  if (chemistryMaxScore > 0) {
    const baseChemistry = Math.round((chemistryScore / chemistryMaxScore) * 100);
    chemistryPercentage = Math.min(99, Math.max(70, baseChemistry));
  } else {
    // Fallback to overall with slight variance
    chemistryPercentage = Math.min(99, Math.max(70, overallPercentage + Math.floor(Math.random() * 10) - 5));
  }

  // Calculate romance percentage using weighted scores
  let romancePercentage: number;
  if (romanceMaxScore > 0) {
    const baseRomance = Math.round((romanceScore / romanceMaxScore) * 100);
    romancePercentage = Math.min(99, Math.max(70, baseRomance));
  } else {
    // Fallback to overall with slight variance
    romancePercentage = Math.min(99, Math.max(70, overallPercentage + Math.floor(Math.random() * 10) - 5));
  }

  // Determine compatibility level
  let compatibilityLevel: string;
  if (overallPercentage >= 90) {
    compatibilityLevel = 'Soulmates';
  } else if (overallPercentage >= 80) {
    compatibilityLevel = 'Highly Compatible';
  } else if (overallPercentage >= 70) {
    compatibilityLevel = 'Great Match';
  } else {
    compatibilityLevel = 'Compatible';
  }

  // Generate dynamic description based on actual compatibility
  const descriptions = overallPercentage >= 85 ? [
    `${name1} and ${name2} are on the same wavelength! Your green flags match, your red flags align, and you both know what makes a relationship work.`,
    `${name1} and ${name2} have that "just get each other" energy. You agree on the dealbreakers and share the same relationship standards.`,
    `${name1} and ${name2} are a power couple in the making! You've both figured out what healthy love looks like, and you want the same things.`,
  ] : overallPercentage >= 70 ? [
    `${name1} and ${name2} are well-matched! You're aligned on what matters most, with just enough spice to keep things interesting.`,
    `${name1} and ${name2} have strong compatibility. You share core values and know where your boundaries are. Solid foundation for something real.`,
  ] : [
    `${name1} and ${name2} have some differences to navigate. Communication will be key, but different doesn't mean incompatible.`,
    `${name1} and ${name2} approach love differently. If you're both willing to meet in the middle, there's potential here.`,
  ];

  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  // Chemistry descriptions based on score
  const chemistryDescriptions = chemistryPercentage >= 85 ? [
    'You both speak the same love language when it comes to communication',
    'Arguments? You handle them the same way. Connection? Same page.',
    'You\'re giving "finish each other\'s sentences" energy',
  ] : [
    'Different communication styles, but that could actually work in your favor',
    'You\'ll need to learn each other\'s language, but the foundation is there',
  ];
  const chemistryDescription = chemistryDescriptions[Math.floor(Math.random() * chemistryDescriptions.length)];

  // Romance descriptions based on score
  const romanceDescriptions = romancePercentage >= 85 ? [
    'Your love languages are basically the same person',
    'What you need to feel loved? They get it. Main character energy.',
    'You want the same things: same effort, same energy, same vibe',
  ] : [
    'You show love differently, but that just means more ways to feel it',
    'Different romantic styles could mean balance if you both stay curious',
  ];
  const romanceDescription = romanceDescriptions[Math.floor(Math.random() * romanceDescriptions.length)];

  return {
    overallPercentage,
    compatibilityLevel,
    description,
    chemistryPercentage,
    chemistryDescription,
    romancePercentage,
    romanceDescription,
  };
}
