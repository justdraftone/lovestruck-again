import { questions } from '../data/questions';
import { results, Result } from '../data/results';

export interface CompatibilityReport {
  overallPercentage: number;
  compatibilityLevel: string;
  description: string;
  chemistryPercentage: number;
  chemistryDescription: string;
  romancePercentage: number;
  romanceDescription: string;
}

export function calculateResult(answers: Record<number, 'left' | 'right'>): Result {
  const scores: Record<string, number> = {};

  // Sum scores from all answers
  Object.entries(answers).forEach(([qId, choice]) => {
    const question = questions.find(q => q.id === Number(qId));
    if (!question) return;

    const option = choice === 'left' ? question.leftOption : question.rightOption;
    Object.entries(option.scores).forEach(([dimension, value]) => {
      scores[dimension] = (scores[dimension] || 0) + value;
    });
  });

  // Find best-matching result
  // Calculate match score for each result type
  const resultScores = results.map(result => {
    let matchScore = 0;
    Object.entries(result.minScores).forEach(([dimension, minRequired]) => {
      const userScore = scores[dimension] || 0;
      if (userScore >= minRequired) {
        matchScore += userScore;
      }
    });
    return { result, matchScore };
  });

  // Sort by match score and return the best match
  resultScores.sort((a, b) => b.matchScore - a.matchScore);

  // Return the best match, or a random result if no matches
  return resultScores[0].matchScore > 0
    ? resultScores[0].result
    : results[Math.floor(Math.random() * results.length)];
}

export function calculateCompatibility(
  answers1: Record<number, 'left' | 'right'>,
  answers2: Record<number, 'left' | 'right'>,
  name1: string,
  name2: string
): CompatibilityReport {
  // Calculate how many answers match (same choice on same question)
  let matchingAnswers = 0;
  let totalQuestions = 0;

  // Chemistry: based on communication style alignment (matching on communication-related questions)
  let chemistryMatches = 0;
  let chemistryTotal = 0;

  // Romance: based on romance/adventure preferences alignment
  let romanceMatches = 0;
  let romanceTotal = 0;

  Object.keys(answers1).forEach(qIdStr => {
    const qId = Number(qIdStr);
    if (answers2[qId]) {
      totalQuestions++;
      const question = questions.find(q => q.id === qId);

      if (answers1[qId] === answers2[qId]) {
        matchingAnswers++;
      }

      // Categorize questions for chemistry/romance (based on question content)
      if (question) {
        const qText = question.text.toLowerCase();
        // Chemistry questions: communication, listening, dialogue
        if (qText.includes('communication') || qText.includes('talk') || qText.includes('listen') || qText.includes('share')) {
          chemistryTotal++;
          if (answers1[qId] === answers2[qId]) {
            chemistryMatches++;
          }
        }
        // Romance questions: love, adventure, romantic, date
        if (qText.includes('love') || qText.includes('romantic') || qText.includes('date') || qText.includes('adventure')) {
          romanceTotal++;
          if (answers1[qId] === answers2[qId]) {
            romanceMatches++;
          }
        }
      }
    }
  });

  // Calculate percentages with some randomness for variety (base 65-95%)
  const baseCompatibility = totalQuestions > 0
    ? Math.round((matchingAnswers / totalQuestions) * 100)
    : 75;

  // Add some variance to make it more interesting (70-95% range)
  const overallPercentage = Math.min(98, Math.max(65, baseCompatibility + Math.floor(Math.random() * 20)));

  // Chemistry calculation (base 70-95%)
  const baseChemistry = chemistryTotal > 0
    ? Math.round((chemistryMatches / chemistryTotal) * 100)
    : 80;
  const chemistryPercentage = Math.min(99, Math.max(70, baseChemistry + Math.floor(Math.random() * 15)));

  // Romance calculation (base 70-95%)
  const baseRomance = romanceTotal > 0
    ? Math.round((romanceMatches / romanceTotal) * 100)
    : 80;
  const romancePercentage = Math.min(99, Math.max(70, baseRomance + Math.floor(Math.random() * 15)));

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

  // Generate description
  const descriptions = [
    `${name1} and ${name2} have incredible chemistry! Your communication styles complement each other beautifully, and you share similar values when it comes to adventure and quality time.`,
    `${name1} and ${name2} are a wonderful match! You both bring unique strengths to the relationship, and your differences create a beautiful balance.`,
    `${name1} and ${name2} share a deep connection! Your romantic preferences align perfectly, creating the foundation for lasting love.`,
  ];
  const description = descriptions[Math.floor(Math.random() * descriptions.length)];

  // Chemistry descriptions
  const chemistryDescriptions = [
    'You both value open dialogue and active listening',
    'Your communication styles mesh seamlessly',
    'You understand each other\'s emotional needs',
  ];
  const chemistryDescription = chemistryDescriptions[Math.floor(Math.random() * chemistryDescriptions.length)];

  // Romance descriptions
  const romanceDescriptions = [
    'Your love languages align beautifully',
    'You share similar romantic ideals',
    'Your approach to love complements perfectly',
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
