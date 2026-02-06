import { PersonaName } from './personas';

export interface PersonaVisuals {
  gradient: string;
  image: string;
  pairsWellWith: PersonaName;
}

// Visual mappings for each persona
export const personaVisuals: Record<PersonaName, PersonaVisuals> = {
  "The Food-Obsessed Romantic": {
    gradient: 'linear-gradient(135deg, #FFA07A 0%, #FF6347 40%, #CD5C5C 100%)',
    image: '/assets/results/heart-pizza.svg',
    pairsWellWith: "The Gesture Collector"
  },
  "The Chronic Analyzer": {
    gradient: 'linear-gradient(135deg, #74B9FF 0%, #0984E3 50%, #2C3E50 100%)',
    image: '/assets/results/heart-magnifyingglass.svg',
    pairsWellWith: "The Vibe Checker"
  },
  "The Delulu Dreamer": {
    gradient: 'linear-gradient(135deg, #DDA0DD 0%, #DA70D6 40%, #9B59B6 100%)',
    image: '/assets/results/heart-dreamyheart.svg',
    pairsWellWith: "The Unhinged Romantic"
  },
  "The Serial Ghoster": {
    gradient: 'linear-gradient(135deg, #A29BFE 0%, #6C5CE7 50%, #2D3436 100%)',
    image: '/assets/results/heart-ghost.svg',
    pairsWellWith: "The Vibe Checker"
  },
  "The Vibe Checker": {
    gradient: 'linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 30%, #F39C12 100%)',
    image: '/assets/results/heart-dice.png',
    pairsWellWith: "The Serial Ghoster"
  },
  "The Trauma Magnet": {
    gradient: 'linear-gradient(135deg, #98D8AA 0%, #55EFC4 40%, #00B894 100%)',
    image: '/assets/results/heart-flower.svg',
    pairsWellWith: "The Love Denier"
  },
  "The Gesture Collector": {
    gradient: 'linear-gradient(135deg, #81ECEC 0%, #00CEC9 50%, #00838F 100%)',
    image: '/assets/results/heart-calculator.svg',
    pairsWellWith: "The Food-Obsessed Romantic"
  },
  "The Unhinged Romantic": {
    gradient: 'linear-gradient(135deg, #FF6B6B 0%, #FF4757 30%, #C0392B 100%)',
    image: '/assets/results/heart-fire.svg',
    pairsWellWith: "The Trauma Magnet"
  },
  "The Romance Buzzkill": {
    gradient: 'linear-gradient(135deg, #FFECD2 0%, #FCB69F 50%, #E17055 100%)',
    image: '/assets/results/heart-patch.svg',
    pairsWellWith: "The Delulu Dreamer"
  },
  "The Love Denier": {
    gradient: 'linear-gradient(135deg, #FFB8B8 0%, #FF7675 40%, #E84393 100%)',
    image: '/assets/results/heart-mask.svg',
    pairsWellWith: "The Gesture Collector"
  }
};
