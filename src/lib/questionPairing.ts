import { Question } from '../data/questions';

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

const RED_FLAG_KEYWORDS = [
  'jealous', 'check your phone', 'control', 'track', 'location', 'password',
  'go through', 'secretly', 'lie', 'cheat', 'flirt with', 'ghost', 'ignore',
  'yell', 'explosive', 'silent treatment', 'manipulate', 'guilt trip'
];

const GREEN_FLAG_KEYWORDS = [
  'support', 'encourage', 'respect', 'boundaries', 'communicate', 'listen',
  'apologize', 'compromise', 'quality time', 'celebrate', 'trust',
  'honest', 'vulnerable', 'grow together', 'independent'
];

type QuestionPolarity = 'red-flag' | 'green-flag' | 'neutral';
type QuestionCategory = 'chemistry' | 'romance' | 'both';

function categorizeQuestion(questionText: string): QuestionCategory {
  const lowerText = questionText.toLowerCase();
  const hasChemistry = CHEMISTRY_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasRomance = ROMANCE_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasChemistry && hasRomance) return 'both';
  if (hasChemistry) return 'chemistry';
  if (hasRomance) return 'romance';
  return 'both';
}

function getQuestionPolarity(questionText: string): QuestionPolarity {
  const lowerText = questionText.toLowerCase();
  const hasRedFlag = RED_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));
  const hasGreenFlag = GREEN_FLAG_KEYWORDS.some(keyword => lowerText.includes(keyword));

  if (hasRedFlag) return 'red-flag';
  if (hasGreenFlag) return 'green-flag';
  return 'neutral';
}

function getQuestionType(question: Question): string {
  const polarity = getQuestionPolarity(question.text);
  const category = categorizeQuestion(question.text);
  return `${polarity}-${category}`;
}

export interface QuestionPair {
  partner1Question: Question;
  partner2Question: Question;
  type: string;
}

/**
 * Selects pairs of questions where each pair has the same type (polarity + category)
 * but different question IDs, allowing partners to answer different questions
 * that assess the same compatibility dimension.
 */
export function selectQuestionPairs(
  questions: Question[],
  pairCount: number
): { pairs: QuestionPair[]; questionPairing: Record<number, number> } {
  // Group questions by type
  const questionsByType: Record<string, Question[]> = {};

  questions.forEach(q => {
    const type = getQuestionType(q);
    if (!questionsByType[type]) {
      questionsByType[type] = [];
    }
    questionsByType[type].push(q);
  });

  // Filter out types with less than 2 questions (can't make pairs)
  const validTypes = Object.keys(questionsByType).filter(
    type => questionsByType[type].length >= 2
  );

  if (validTypes.length === 0) {
    throw new Error('Not enough questions to create pairs');
  }

  const pairs: QuestionPair[] = [];
  const usedQuestionIds = new Set<number>();
  const questionPairing: Record<number, number> = {};

  // Try to create the requested number of pairs
  let attempts = 0;
  const maxAttempts = pairCount * 10;

  while (pairs.length < pairCount && attempts < maxAttempts) {
    attempts++;

    // Randomly select a type
    const randomType = validTypes[Math.floor(Math.random() * validTypes.length)];
    const availableQuestions = questionsByType[randomType].filter(
      q => !usedQuestionIds.has(q.id)
    );

    // Need at least 2 unused questions of this type to make a pair
    if (availableQuestions.length >= 2) {
      // Randomly select 2 questions from this type
      const shuffled = [...availableQuestions].sort(() => Math.random() - 0.5);
      const q1 = shuffled[0];
      const q2 = shuffled[1];

      pairs.push({
        partner1Question: q1,
        partner2Question: q2,
        type: randomType
      });

      usedQuestionIds.add(q1.id);
      usedQuestionIds.add(q2.id);

      // Map the pairing both ways for easy lookup
      questionPairing[q1.id] = q2.id;
      questionPairing[q2.id] = q1.id;
    }
  }

  // If we couldn't create enough pairs, just fill with whatever we can
  if (pairs.length < pairCount) {
    console.warn(`Could only create ${pairs.length} question pairs out of ${pairCount} requested`);
  }

  return { pairs, questionPairing };
}
