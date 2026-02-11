import { PersonaName } from './personas';

interface CardVars {
  '--header-size': string;
  '--header-margin-top': string;
  '--header-margin-bottom': string;
  '--image-size': string;
  '--image-margin-top': string;
  '--body-font-size': string;
  '--body-margin-top': string;
  '--body-margin-bottom': string;
  '--stroke-width': string;
  '--cloud-bottom': string;
  '--cloud-left': string;
  '--cloud-width': string;
  '--logo-bottom': string;
  '--logo-left': string;
  '--logo-max-width': string;
  '--logo-opacity': string;
  '--card-padding-top': string;
  '--card-padding-bottom': string;
  '--card-padding-side': string;
  '--card-min-height': string;
  '--glow-blur-1': string;
  '--glow-blur-2': string;
  '--glow-color-1': string;
  '--glow-color-2': string;
  '--grain-opacity': string;
  '--grain-blend-mode': string;
}

type PersonaCardSettings = {
  desktop: CardVars;
  mobile: CardVars;
};

function rgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function vars(d: {
  headerSize: number; headerMarginTop: number; headerMarginBottom: number;
  imageSize: number; imageMarginTop: number; bodyFontSize: number;
  bodyMarginTop: number; bodyMarginBottom: number; strokeWidth: number;
  cloudBottom: number; cloudLeft: number; cloudWidth: number;
  logoBottom: number; logoLeft: number; logoMaxWidth: number; logoOpacity: number;
  cardPaddingTop: number; cardPaddingBottom: number; cardPaddingSide: number;
  cardMinHeight: number; glowBlur1: number; glowBlur2: number;
  glowOpacity1: number; glowOpacity2: number; glowColor1: string; glowColor2: string;
}): CardVars {
  return {
    '--header-size': `${d.headerSize}rem`,
    '--header-margin-top': `${d.headerMarginTop}px`,
    '--header-margin-bottom': `${d.headerMarginBottom}px`,
    '--image-size': `${d.imageSize}px`,
    '--image-margin-top': `${d.imageMarginTop}px`,
    '--body-font-size': `${d.bodyFontSize}rem`,
    '--body-margin-top': `${d.bodyMarginTop}px`,
    '--body-margin-bottom': `${d.bodyMarginBottom}px`,
    '--stroke-width': `${d.strokeWidth}px`,
    '--cloud-bottom': `${d.cloudBottom}%`,
    '--cloud-left': `${d.cloudLeft}%`,
    '--cloud-width': `${d.cloudWidth}%`,
    '--logo-bottom': `${d.logoBottom}px`,
    '--logo-left': `${d.logoLeft}%`,
    '--logo-max-width': `${d.logoMaxWidth}px`,
    '--logo-opacity': `${d.logoOpacity}`,
    '--card-padding-top': `${d.cardPaddingTop}px`,
    '--card-padding-bottom': `${d.cardPaddingBottom}px`,
    '--card-padding-side': `${d.cardPaddingSide}px`,
    '--card-min-height': `${d.cardMinHeight}px`,
    '--glow-blur-1': `${d.glowBlur1}px`,
    '--glow-blur-2': `${d.glowBlur2}px`,
    '--glow-color-1': rgba(d.glowColor1, d.glowOpacity1),
    '--glow-color-2': rgba(d.glowColor2, d.glowOpacity2),
    '--grain-opacity': '0.4',
    '--grain-blend-mode': 'overlay',
  };
}

export const personaCardSettings: Record<PersonaName, PersonaCardSettings> = {
  "The Food-Obsessed Romantic": {
    desktop: vars({
      headerSize: 2.8, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 310, imageMarginTop: -25,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 240, logoBottom: 22, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.4, headerMarginTop: 0, headerMarginBottom: 6, imageSize: 280, imageMarginTop: -10,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -25, cloudLeft: 0, cloudWidth: 290, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Trauma Magnet": {
    desktop: vars({
      headerSize: 3.2, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 250, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#98d8aa", glowColor2: "#00b894",
    }),
    mobile: vars({
      headerSize: 2.5, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 340, imageMarginTop: -60,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#98d8aa", glowColor2: "#00b894",
    }),
  },
  "The Gesture Collector": {
    desktop: vars({
      headerSize: 3.1, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 250, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.5, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 340, imageMarginTop: -60,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Unhinged Romantic": {
    desktop: vars({
      headerSize: 2.9, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 10, glowBlur2: 110,
      glowOpacity1: 0.55, glowOpacity2: 0.95, glowColor1: "#cb3f33", glowColor2: "#8b2631",
    }),
    mobile: vars({
      headerSize: 2.5, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 340, imageMarginTop: -60,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 20,
      glowOpacity1: 0.4, glowOpacity2: 0.9, glowColor1: "#cb3f33", glowColor2: "#8b2631",
    }),
  },
  "The Love Denier": {
    desktop: vars({
      headerSize: 4, headerMarginTop: 2, headerMarginBottom: 2, imageSize: 350, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ff7675", glowColor2: "#e84393",
    }),
    mobile: vars({
      headerSize: 3.1, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 340, imageMarginTop: -60,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ff7675", glowColor2: "#e84393",
    }),
  },
  "The Vibe Checker": {
    desktop: vars({
      headerSize: 3.8, headerMarginTop: -10, headerMarginBottom: 16, imageSize: 340, imageMarginTop: -20,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 52, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 380, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 3, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 330, imageMarginTop: -40,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Serial Ghoster": {
    desktop: vars({
      headerSize: 3.5, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 340, imageMarginTop: -20,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.8, headerMarginTop: 0, headerMarginBottom: 39, imageSize: 310, imageMarginTop: -45,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 290, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Delulu Dreamer": {
    desktop: vars({
      headerSize: 3.2, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 350, imageMarginTop: -55,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.7, headerMarginTop: 0, headerMarginBottom: 6, imageSize: 310, imageMarginTop: -45,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 290, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Chronic Analyzer": {
    desktop: vars({
      headerSize: 3.1, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 310, imageMarginTop: -25,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.7, headerMarginTop: 0, headerMarginBottom: 6, imageSize: 280, imageMarginTop: -10,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -25, cloudLeft: 0, cloudWidth: 290, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
  "The Romance Buzzkill": {
    desktop: vars({
      headerSize: 3, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -25,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
    mobile: vars({
      headerSize: 2.5, headerMarginTop: 9, headerMarginBottom: 39, imageSize: 340, imageMarginTop: -60,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -35, cloudLeft: 0, cloudWidth: 300, logoBottom: 26, logoLeft: 1,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 50, cardPaddingBottom: 45,
      cardPaddingSide: 35, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
    }),
  },
};

export const couplesCardVars = {
  desktop: {
    '--header-size': '5rem',
    '--body-font-size': '1.2rem',
    '--body-margin-top': '25px',
    '--body-margin-bottom': '0px',
    '--cloud-bottom': '-100%',
    '--cloud-left': '-10%',
    '--cloud-width': '300%',
    '--grain-opacity': '0.4',
    '--grain-blend-mode': 'overlay',
  } as Record<string, string>,
  mobile: {
    '--header-size': '4rem',
    '--body-font-size': '1.1rem',
    '--body-margin-top': '25px',
    '--body-margin-bottom': '0px',
    '--cloud-bottom': '-70%',
    '--cloud-left': '-10%',
    '--cloud-width': '300%',
    '--grain-opacity': '0.4',
    '--grain-blend-mode': 'overlay',
  } as Record<string, string>,
};

export function getPersonaCardVars(name: PersonaName, isMobile: boolean): Record<string, string> {
  const settings = personaCardSettings[name];
  if (!settings) return {};
  return (isMobile ? settings.mobile : settings.desktop) as unknown as Record<string, string>;
}
