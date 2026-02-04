export interface Question {
  id: number;
  text: string;
  leftOption: { text: string; scores: Record<string, number> };
  rightOption: { text: string; scores: Record<string, number> };
}

export const questions: Question[] = [
  {
    id: 0,
    text: "Do you prefer well-planned evenings over spontaneous adventures?",
    leftOption: {
      text: "No",
      scores: { spontaneous: 1, adventure: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { planning: 1, stability: 1 }
    }
  },
  {
    id: 1,
    text: "Do you take time to process your feelings before discussing them?",
    leftOption: {
      text: "No",
      scores: { direct: 1, emotional: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { thoughtful: 1, calm: 1 }
    }
  },
  {
    id: 2,
    text: "Do you prefer keeping the peace over confronting issues head-on?",
    leftOption: {
      text: "No",
      scores: { confrontation: 1, honesty: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { harmony: 1, flexibility: 1 }
    }
  },
  {
    id: 3,
    text: "Do you express love through everyday small acts rather than grand gestures?",
    leftOption: {
      text: "No",
      scores: { dramatic: 1, expressive: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { consistent: 1, practical: 1 }
    }
  },
  {
    id: 4,
    text: "Do you prefer building step by step over dreaming big together?",
    leftOption: {
      text: "No",
      scores: { visionary: 1, ambitious: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { realistic: 1, grounded: 1 }
    }
  },
  {
    id: 5,
    text: "Do you find more comfort in familiar routines than in new experiences?",
    leftOption: {
      text: "No",
      scores: { novelty: 1, excitement: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { tradition: 1, security: 1 }
    }
  },
  {
    id: 6,
    text: "Do you prefer deep conversations over physical affection?",
    leftOption: {
      text: "No",
      scores: { affectionate: 1, sensual: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { intellectual: 1, vulnerable: 1 }
    }
  },
  {
    id: 7,
    text: "Do you enjoy quiet nights in more than going out with friends?",
    leftOption: {
      text: "No",
      scores: { social: 1, extroverted: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { intimate: 1, introverted: 1 }
    }
  },
  {
    id: 8,
    text: "Do you prefer showing love through actions rather than words?",
    leftOption: {
      text: "No",
      scores: { verbal: 1, expressive: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { actions: 1, practical: 1 }
    }
  },
  {
    id: 9,
    text: "Do you prefer steady, comfortable love over passionate intensity?",
    leftOption: {
      text: "No",
      scores: { intense: 1, dramatic: 1 }
    },
    rightOption: {
      text: "Yes",
      scores: { stable: 1, secure: 1 }
    }
  }
];
