export interface Result {
  id: string;
  name: string;
  image: string;
  description: string;
  minScores: Record<string, number>;
}

export const results: Result[] = [
  {
    id: 'fire',
    name: 'The Passionate Flame',
    image: '/assets/results/heart-fire.svg',
    description: 'You bring intensity and excitement to relationships. Your love burns bright with spontaneous adventures and grand romantic gestures. You believe in living life to the fullest and keeping the spark alive.',
    minScores: { spontaneous: 2, adventure: 2, intense: 1 }
  },
  {
    id: 'calculator',
    name: 'The Logical Lover',
    image: '/assets/results/heart-calculator.svg',
    description: 'You approach love with thoughtful consideration and practical wisdom. You build relationships through steady commitment, careful planning, and reliable support. Your love is grounded and intentional.',
    minScores: { planning: 2, realistic: 2, practical: 2 }
  },
  {
    id: 'dice',
    name: 'The Lucky Romantic',
    image: '/assets/results/heart-dice.svg',
    description: 'You embrace the unpredictability of love and see every moment as a chance for something magical. You\'re open to adventure, willing to take risks, and believe that fortune favors the bold in love.',
    minScores: { novelty: 2, excitement: 2, spontaneous: 1 }
  },
  {
    id: 'dreamy',
    name: 'The Dreamy Idealist',
    image: '/assets/results/heart-dreamyheart.svg',
    description: 'You believe in soulmates and fairy tales. Your love is filled with dreams, poetry, and endless possibility. You see the magic in every connection and approach relationships with hope and wonder.',
    minScores: { visionary: 2, ambitious: 1, expressive: 2 }
  },
  {
    id: 'flower',
    name: 'The Blooming Connection',
    image: '/assets/results/heart-flower.svg',
    description: 'You nurture love like a garden - patient, steady, and committed to growing together over time. You value consistency, tradition, and the beauty of a relationship that deepens with each season.',
    minScores: { consistent: 2, grounded: 2, tradition: 1 }
  },
  {
    id: 'ghost',
    name: 'The Mysterious Soul',
    image: '/assets/results/heart-ghost.svg',
    description: 'You reveal yourself slowly, creating intimacy through meaningful silence and emotional depth. You value privacy, introspection, and connections that honor the complexity of the human heart.',
    minScores: { introverted: 2, vulnerable: 2, thoughtful: 1 }
  },
  {
    id: 'magnifying',
    name: 'The Curious Explorer',
    image: '/assets/results/heart-magnifyingglass.svg',
    description: 'You seek to truly understand your partner on every level. Love is an endless journey of discovery and learning. You ask questions, explore feelings, and dive deep into the mysteries of connection.',
    minScores: { intellectual: 2, thoughtful: 2, curious: 1 }
  },
  {
    id: 'mask',
    name: 'The Playful Heart',
    image: '/assets/results/heart-mask.svg',
    description: 'You keep love playful, joyful, and full of laughter. Social connections, fun surprises, and lighthearted moments define your relationships. You believe love should feel like an adventure with your best friend.',
    minScores: { social: 2, extroverted: 1, excitement: 1 }
  },
  {
    id: 'patch',
    name: 'The Healing Presence',
    image: '/assets/results/heart-patch.svg',
    description: 'You bring comfort and healing to your partner. Your love is a safe harbor in any storm. You offer stability, support, and gentle care that helps others feel truly seen and secure.',
    minScores: { calm: 2, stability: 2, harmony: 2 }
  },
  {
    id: 'pizza',
    name: 'The Shared Feast',
    image: '/assets/results/heart-pizza.svg',
    description: 'You celebrate love through shared rituals and cozy moments. Comfort food, movie nights, and familiar joys bring you together. Your relationship thrives on simple pleasures and warm togetherness.',
    minScores: { tradition: 2, security: 2, intimate: 2 }
  }
];
