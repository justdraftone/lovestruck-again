import { PersonaName } from './personas';

export interface PersonaVisuals {
  gradient: string;
  pairingGradient: string; // Gradient used for the "pairs well with" pill
  image: string;
  pairsWellWith: PersonaName;
  nameColor?: string;
}

// Visual mappings for each persona
export const personaVisuals: Record<PersonaName, PersonaVisuals> = {
  "The Food-Obsessed Romantic": {
    gradient: 'linear-gradient(180deg, #f54100 0%, #f1b58a 50%, #f8afdc 100%)',
    pairingGradient: 'linear-gradient(90deg, #f54100 0%, #f8afdc 100%)',
    image: '/assets/results/heart-pizza.svg',
    pairsWellWith: "The Gesture Collector"
  },
  "The Chronic Analyzer": {
    gradient: 'linear-gradient(180deg, #5676e4 0%, #a697e8 50%, #fcb9ec 100%)',
    pairingGradient: 'linear-gradient(90deg, #5676e4 0%, #fcb9ec 100%)',
    image: '/assets/results/heart-magnifyingglass.svg',
    pairsWellWith: "The Vibe Checker"
  },
  "The Delulu Dreamer": {
    gradient: 'linear-gradient(180deg, #d99efb 0%, #ea80ef 50%, #fd5fe3 100%)',
    pairingGradient: 'linear-gradient(90deg, #d99efb 0%, #fd5fe3 100%)',
    image: '/assets/results/heart-dreamyheart.svg',
    pairsWellWith: "The Unhinged Romantic"
  },
  "The Serial Ghoster": {
    gradient: 'linear-gradient(180deg, #610f40 0%, #a45574 50%, #efa4af 100%)',
    pairingGradient: 'linear-gradient(90deg, #610f40 0%, #efa4af 100%)',
    image: '/assets/results/heart-ghost.svg',
    pairsWellWith: "The Vibe Checker"
  },
  "The Vibe Checker": {
    gradient: 'linear-gradient(180deg, #3c3489 0%, #6b64ac 50%, #f6d08f 100%)',
    pairingGradient: 'linear-gradient(90deg, #3c3489 0%, #f6d08f 100%)',
    image: '/assets/results/heart-dice.webp',
    pairsWellWith: "The Serial Ghoster"
  },
  "The Trauma Magnet": {
    gradient: 'linear-gradient(180deg, #f4b679 0%, #f68a64 50%, #f85f4f 100%)',
    pairingGradient: 'linear-gradient(90deg, #f4b679 0%, #f85f4f 100%)',
    image: '/assets/results/heart-patch.svg',
    pairsWellWith: "The Love Denier"
  },
  "The Gesture Collector": {
    gradient: 'linear-gradient(180deg, #fbf9e2 0%, #f68a64 50%, #fcb8b5 100%)',
    pairingGradient: 'linear-gradient(90deg, #fbf9e2 0%, #fcb8b5 100%)',
    image: '/assets/results/heart-flower.svg',
    pairsWellWith: "The Food-Obsessed Romantic",
    nameColor: "#EB5254"
  },
  "The Unhinged Romantic": {
    gradient: 'linear-gradient(180deg, #551530 0%, #8b2831 50%, #cb3f33 100%)',
    pairingGradient: 'linear-gradient(90deg, #551530 0%, #cb3f33 100%)',
    image: '/assets/results/heart-fire.svg',
    pairsWellWith: "The Trauma Magnet"
  },
  "The Romance Buzzkill": {
    gradient: 'linear-gradient(180deg, #f8afdc 0%, #f0c0d4 50%, #ff38b3 100%)',
    pairingGradient: 'linear-gradient(90deg, #f8afdc 0%, #ff38b3 100%)',
    image: '/assets/results/heart-calculator.svg',
    pairsWellWith: "The Delulu Dreamer",
    nameColor: "#E13E3C"
  },
  "The Love Denier": {
    gradient: 'linear-gradient(180deg, #ff6c1f 0%, #ff4a3d 50%, #ff1967 100%)',
    pairingGradient: 'linear-gradient(90deg, #ff6c1f 0%, #ff1967 100%)',
    image: '/assets/results/heart-mask.svg',
    pairsWellWith: "The Gesture Collector"
  }
};
