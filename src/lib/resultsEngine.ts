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

export function calculateResult(answers: Record<number, 'left' | 'right'>): PersonaResult {
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

  return {
    name: topPersona,
    emoji: personas[topPersona].emoji,
    description: personas[topPersona].description,
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

function categorizeQuestion(questionText: string): 'chemistry' | 'romance' | 'both' {
  const lowerText = questionText.toLowerCase();
  const hasChemistry = CHEMISTRY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasRomance = ROMANCE_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasChemistry && hasRomance) return 'both';
  if (hasChemistry) return 'chemistry';
  if (hasRomance) return 'romance';
  return 'both'; // Default to counting for both if unclear
}

export function calculateCompatibility(
  answers1: Record<number, 'left' | 'right'>,
  answers2: Record<number, 'left' | 'right'>,
  name1: string,
  name2: string,
  questions?: Array<{ id: number; text: string }>
): CompatibilityReport {
  // Calculate overall compatibility (matching answers = compatible)
  let matchingAnswers = 0;
  let totalQuestions = 0;

  // Track chemistry and romance specific matches
  let chemistryMatches = 0;
  let chemistryTotal = 0;
  let romanceMatches = 0;
  let romanceTotal = 0;

  Object.keys(answers1).forEach(qIdStr => {
    const qId = Number(qIdStr);
    if (answers2[qId] !== undefined) {
      totalQuestions++;
      const matched = answers1[qId] === answers2[qId];

      if (matched) {
        matchingAnswers++;
      }

      // Categorize question if we have the questions array
      if (questions) {
        const question = questions.find(q => q.id === qId);
        if (question) {
          const category = categorizeQuestion(question.text);

          if (category === 'chemistry' || category === 'both') {
            chemistryTotal++;
            if (matched) chemistryMatches++;
          }

          if (category === 'romance' || category === 'both') {
            romanceTotal++;
            if (matched) romanceMatches++;
          }
        }
      }
    }
  });

  // Calculate base compatibility (65-98% range)
  const baseCompatibility = totalQuestions > 0
    ? Math.round((matchingAnswers / totalQuestions) * 100)
    : 75;

  const overallPercentage = Math.min(98, Math.max(65, baseCompatibility));

  // Calculate chemistry percentage (if we have chemistry questions, use them; otherwise derive from overall)
  let chemistryPercentage: number;
  if (chemistryTotal > 0) {
    const baseChemistry = Math.round((chemistryMatches / chemistryTotal) * 100);
    chemistryPercentage = Math.min(99, Math.max(70, baseChemistry));
  } else {
    // Fallback to overall with slight variance
    chemistryPercentage = Math.min(99, Math.max(70, overallPercentage + Math.floor(Math.random() * 10) - 5));
  }

  // Calculate romance percentage (if we have romance questions, use them; otherwise derive from overall)
  let romancePercentage: number;
  if (romanceTotal > 0) {
    const baseRomance = Math.round((romanceMatches / romanceTotal) * 100);
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
    `${name1} and ${name2} have incredible chemistry! You're aligned on the things that matter most, from how you communicate to what you value in a relationship.`,
    `${name1} and ${name2} are a wonderful match! You both love and hate the same things, which creates a beautiful foundation for understanding.`,
    `${name1} and ${name2} share a deep connection! Your dealbreakers and green flags align perfectly, making this relationship feel natural and effortless.`,
  ] : overallPercentage >= 70 ? [
    `${name1} and ${name2} have solid compatibility! You agree on most of the important things, with just enough difference to keep things interesting.`,
    `${name1} and ${name2} are well-matched! Your shared values and boundaries create a strong foundation for growth together.`,
  ] : [
    `${name1} and ${name2} have an interesting dynamic! While you have some differences, understanding each other's boundaries could make this work.`,
    `${name1} and ${name2} bring different perspectives! Your varied approaches to relationships could complement each other with open communication.`,
  ];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  // Chemistry descriptions based on score
  const chemistryDescriptions = chemistryPercentage >= 85 ? [
    'You both value open dialogue and active listening',
    'Your communication styles mesh seamlessly',
    'You handle conflict and connection the same way',
  ] : [
    'You have different communication styles that could complement each other',
    'Understanding each other\'s needs will strengthen your bond',
  ];
  const chemistryDescription = chemistryDescriptions[Math.floor(Math.random() * chemistryDescriptions.length)];

  // Romance descriptions based on score
  const romanceDescriptions = romancePercentage >= 85 ? [
    'Your love languages align beautifully',
    'You share similar romantic ideals and expectations',
    'Your approach to affection and romance matches perfectly',
  ] : [
    'You express love differently, creating opportunities to learn from each other',
    'Your varied romantic styles could bring exciting balance',
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
