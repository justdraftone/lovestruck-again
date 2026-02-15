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
  const chemistryCount = CHEMISTRY_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;
  const romanceCount = ROMANCE_KEYWORDS.filter(keyword => lowerText.includes(keyword)).length;

  // Be more exclusive - prioritize the dominant category
  if (chemistryCount > romanceCount && chemistryCount > 0) return 'chemistry';
  if (romanceCount > chemistryCount && romanceCount > 0) return 'romance';
  if (chemistryCount > 0 && romanceCount > 0) return 'both';

  // If unclear, default to chemistry (communication/compatibility)
  return 'chemistry';
}

function getQuestionPolarity(questionText: string): QuestionPolarity {
  const lowerText = questionText.toLowerCase();
  const hasRedFlag = RED_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasGreenFlag = GREEN_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasRedFlag) return 'red-flag';
  if (hasGreenFlag) return 'green-flag';
  return 'neutral';
}

export function calculateCompatibility(
  answers1: Record<number, 'left' | 'right'>,
  answers2: Record<number, 'left' | 'right'>,
  name1: string,
  name2: string,
  questions?: Array<{ id: number; text: string }>,
  questionPairing?: Record<number, number>
): CompatibilityReport {
  // New scoring approach: Base score + bonus for agreement
  const BASE_SCORE = 75;
  const MAX_ADDITIONAL = 24; // Can add up to 24% to reach 99%

  let bonusPoints = 0;
  let maxBonusPoints = 0;

  // Track chemistry and romance specific scores
  let chemistryBonus = 0;
  let chemistryMaxBonus = 0;
  let romanceBonus = 0;
  let romanceMaxBonus = 0;

  // Debug logging
  const partner1Questions = Object.keys(answers1).map(Number);
  const partner2Questions = Object.keys(answers2).map(Number);
  const usingPairing = questionPairing && Object.keys(questionPairing).length > 0;

  console.log('🔍 Compatibility Calculation Debug:');
  console.log('Partner 1 answered questions:', partner1Questions);
  console.log('Partner 2 answered questions:', partner2Questions);
  console.log('Using question pairing:', usingPairing);

  if (usingPairing) {
    console.log('Question pairing map (first 5):', Object.entries(questionPairing!).slice(0, 10));
    // Show what will actually be compared
    const comparisons = partner1Questions.map(qId => ({
      partner1Q: qId,
      partner2Q: questionPairing![qId],
      willCompare: !!questionPairing![qId] && answers2[questionPairing![qId]] !== undefined
    })).filter(c => c.willCompare);
    console.log(`✅ Will compare ${comparisons.length} question pairs`);
    console.log('Sample comparisons:', comparisons.slice(0, 3));
  }

  Object.keys(answers1).forEach(qIdStr => {
    const qId = Number(qIdStr);

    // Determine which partner 2 question to compare with
    let partner2QuestionId = qId;
    if (usingPairing && questionPairing![qId]) {
      partner2QuestionId = questionPairing![qId];
    }

    console.log(`Checking Q${qId}: partner1=${answers1[qId]}, partner2=${answers2[partner2QuestionId]}`);

    if (answers2[partner2QuestionId] !== undefined) {
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

      const answer1 = answers1[qId];
      const answer2 = answers2[partner2QuestionId];
      const bothYes = answer1 === 'right' && answer2 === 'right';
      const bothNo = answer1 === 'left' && answer2 === 'left';

      // Calculate bonus points based on agreement type
      let questionBonus = 0;
      const questionMaxBonus = 1.0; // Each question can contribute max 1.0 bonus points

      if (polarity === 'red-flag') {
        // Red flag: Both saying "no" is perfect
        if (bothNo) questionBonus = 1.0; // Perfect agreement
        else if (bothYes) questionBonus = 0.1; // Both accepting red flags
        else questionBonus = 0.2; // Disagreement
      } else if (polarity === 'green-flag') {
        // Green flag: Both saying "yes" is perfect
        if (bothYes) questionBonus = 1.0; // Perfect agreement
        else if (bothNo) questionBonus = 0.2; // Both rejecting healthy behavior
        else questionBonus = 0.3; // Disagreement
      } else {
        // Neutral: Any agreement is good
        if (bothYes || bothNo) questionBonus = 0.8; // Agreement
        else questionBonus = 0.2; // Different preferences
      }

      bonusPoints += questionBonus;
      maxBonusPoints += questionMaxBonus;

      console.log(`  → Bonus: ${questionBonus.toFixed(2)}/${questionMaxBonus.toFixed(2)} (${polarity}, ${category})`);

      // Track by category
      if (category === 'chemistry' || category === 'both') {
        chemistryBonus += questionBonus;
        chemistryMaxBonus += questionMaxBonus;
      }

      if (category === 'romance' || category === 'both') {
        romanceBonus += questionBonus;
        romanceMaxBonus += questionMaxBonus;
      }
    } else {
      console.log(`  → SKIPPED (no partner2 answer for Q${partner2QuestionId})`);
    }
  });

  // Scale bonus points to fit within MAX_ADDITIONAL (0-25%)
  const scaledAdditional = maxBonusPoints > 0
    ? (bonusPoints / maxBonusPoints) * MAX_ADDITIONAL
    : 0;

  const overallPercentage = Math.round(BASE_SCORE + scaledAdditional);

  console.log('📊 Score calculation:', {
    bonusPoints,
    maxBonusPoints,
    scaledAdditional,
    overallPercentage,
  });

  // Calculate chemistry percentage using same base + bonus approach
  // Chemistry has slightly higher base (70%) and can reach 99%
  const CHEMISTRY_BASE = 70;
  const CHEMISTRY_MAX_ADDITIONAL = 29;

  let chemistryPercentage: number;
  if (chemistryMaxBonus > 0) {
    const chemistryScaled = (chemistryBonus / chemistryMaxBonus) * CHEMISTRY_MAX_ADDITIONAL;
    chemistryPercentage = Math.round(CHEMISTRY_BASE + chemistryScaled);
  } else {
    chemistryPercentage = overallPercentage;
  }

  // Calculate romance percentage using same base + bonus approach
  // Romance has slightly lower base (68%) for more variation
  const ROMANCE_BASE = 68;
  const ROMANCE_MAX_ADDITIONAL = 31;

  let romancePercentage: number;
  if (romanceMaxBonus > 0) {
    const romanceScaled = (romanceBonus / romanceMaxBonus) * ROMANCE_MAX_ADDITIONAL;
    romancePercentage = Math.round(ROMANCE_BASE + romanceScaled);
  } else {
    romancePercentage = overallPercentage;
  }

  // Determine compatibility level (adjusted for 75-99% range)
  let compatibilityLevel: string;
  if (overallPercentage >= 93) {
    compatibilityLevel = 'Soulmates';
  } else if (overallPercentage >= 87) {
    compatibilityLevel = 'Highly Compatible';
  } else if (overallPercentage >= 81) {
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

  // Extra safety: ensure all percentages are in valid range
  // Overall: 75-99% (base + bonus system)
  // Chemistry: 70-99% (slightly higher base)
  // Romance: 68-99% (slightly lower base for more variation)
  const safeOverall = Math.min(99, Math.max(75, overallPercentage));
  const safeChemistry = Math.min(99, Math.max(70, chemistryPercentage));
  const safeRomance = Math.min(99, Math.max(68, romancePercentage));

  console.log('✅ Final compatibility percentages:', {
    overall: safeOverall,
    chemistry: safeChemistry,
    romance: safeRomance
  });

  return {
    overallPercentage: safeOverall,
    compatibilityLevel,
    description,
    chemistryPercentage: safeChemistry,
    chemistryDescription,
    romancePercentage: safeRomance,
    romanceDescription,
  };
}
