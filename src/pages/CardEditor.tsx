import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ResultCard from '../components/ResultCard';
import CompatibilityCard from '../components/CompatibilityCard';
import { personaVisuals } from '../data/results';
import { PersonaName } from '../data/personas';

type CardType = 'single' | 'couples';
type Viewport = 'mobile' | 'desktop';

// Helper function to convert hex color to rgba
function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

interface PersonaSettings {
  // Desktop settings
  headerSize?: number;
  headerMarginTop?: number;
  headerMarginBottom?: number;
  imageSize?: number;
  imageMarginTop?: number;
  bodyFontSize?: number;
  bodyMarginTop?: number;
  bodyMarginBottom?: number;
  strokeWidth?: number;
  cloudBottom?: number;
  cloudLeft?: number;
  cloudWidth?: number;
  logoBottom?: number;
  logoLeft?: number;
  logoMaxWidth?: number;
  logoOpacity?: number;
  cardPaddingTop?: number;
  cardPaddingBottom?: number;
  cardPaddingSide?: number;
  cardMinHeight?: number;
  glowBlur1?: number;
  glowBlur2?: number;
  glowOpacity1?: number;
  glowOpacity2?: number;
  glowColor1?: string;
  glowColor2?: string;
  // Mobile settings
  headerSizeMobile?: number;
  headerMarginTopMobile?: number;
  headerMarginBottomMobile?: number;
  imageSizeMobile?: number;
  imageMarginTopMobile?: number;
  bodyFontSizeMobile?: number;
  bodyMarginTopMobile?: number;
  bodyMarginBottomMobile?: number;
  strokeWidthMobile?: number;
  cloudBottomMobile?: number;
  cloudLeftMobile?: number;
  cloudWidthMobile?: number;
  logoBottomMobile?: number;
  logoLeftMobile?: number;
  logoMaxWidthMobile?: number;
  logoOpacityMobile?: number;
  cardPaddingTopMobile?: number;
  cardPaddingBottomMobile?: number;
  cardPaddingSideMobile?: number;
  cardMinHeightMobile?: number;
  glowBlur1Mobile?: number;
  glowBlur2Mobile?: number;
  glowOpacity1Mobile?: number;
  glowOpacity2Mobile?: number;
  glowColor1Mobile?: string;
  glowColor2Mobile?: string;
  // Gradient (shared across viewports)
  gradientStart?: string;
  gradientMiddle?: string;
  gradientEnd?: string;
}

const PERSONA_NAMES: PersonaName[] = [
  "The Food-Obsessed Romantic",
  "The Chronic Analyzer",
  "The Delulu Dreamer",
  "The Serial Ghoster",
  "The Vibe Checker",
  "The Trauma Magnet",
  "The Gesture Collector",
  "The Unhinged Romantic",
  "The Romance Buzzkill",
  "The Love Denier"
];

export default function CardEditor() {
  const navigate = useNavigate();
  const [cardType, setCardType] = useState<CardType>('single');
  const [viewport, setViewport] = useState<Viewport>('desktop');
  const [previewMode, setPreviewMode] = useState(false); // Toggle between edit and preview all
  const [currentPersonaIndex, setCurrentPersonaIndex] = useState(7); // Start with Unhinged Romantic
  const [personaOverrides, setPersonaOverrides] = useState<Record<PersonaName, PersonaSettings>>({
    "The Food-Obsessed Romantic": {
      headerSize: 2.8, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 310, imageMarginTop: -25,
      bodyFontSize: 0.9, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 240, logoBottom: 22, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.4, headerMarginTopMobile: 0, headerMarginBottomMobile: 6,
      imageSizeMobile: 280, imageMarginTopMobile: -10, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -25, cloudLeftMobile: 0, cloudWidthMobile: 290,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#f54100", gradientMiddle: "#f1b58a", gradientEnd: "#f8afdc"
    },
    "The Trauma Magnet": {
      headerSize: 3.2, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 250, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#98d8aa", glowColor2: "#00b894",
      headerSizeMobile: 2.5, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 340, imageMarginTopMobile: -60, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#98d8aa", glowColor2Mobile: "#00b894",
      gradientStart: "#f4b679", gradientMiddle: "#f68a64", gradientEnd: "#f85f4f"
    },
    "The Gesture Collector": {
      headerSize: 3.1, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 250, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.5, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 340, imageMarginTopMobile: -60, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#fbf9e2", gradientMiddle: "#f68a64", gradientEnd: "#fcb8b5"
    },
    "The Unhinged Romantic": {
      headerSize: 2.9, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 10, glowBlur2: 110,
      glowOpacity1: 0.55, glowOpacity2: 0.95, glowColor1: "#cb3f33", glowColor2: "#8b2631",
      headerSizeMobile: 2.5, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 340, imageMarginTopMobile: -60, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 20,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.9, glowColor1Mobile: "#cb3f33", glowColor2Mobile: "#8b2631",
      gradientStart: "#551530", gradientMiddle: "#8b2831", gradientEnd: "#cb3f33"
    },
    "The Love Denier": {
      headerSize: 4, headerMarginTop: 2, headerMarginBottom: 2, imageSize: 350, imageMarginTop: -40,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ff7675", glowColor2: "#e84393",
      headerSizeMobile: 3.1, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 340, imageMarginTopMobile: -60, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ff7675", glowColor2Mobile: "#e84393",
      gradientStart: "#ff6c1f", gradientMiddle: "#ff4a3d", gradientEnd: "#ff1967"
    },
    "The Vibe Checker": {
      headerSize: 3.8, headerMarginTop: -10, headerMarginBottom: 16, imageSize: 340, imageMarginTop: -20,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 52, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 380, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 3, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 330, imageMarginTopMobile: -40, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#3c3489", gradientMiddle: "#6b64ac", gradientEnd: "#f6d08f"
    },
    "The Serial Ghoster": {
      headerSize: 3.5, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 340, imageMarginTop: -20,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.8, headerMarginTopMobile: 0, headerMarginBottomMobile: 39,
      imageSizeMobile: 310, imageMarginTopMobile: -45, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 290,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#610f40", gradientMiddle: "#a45574", gradientEnd: "#efa4af"
    },
    "The Delulu Dreamer": {
      headerSize: 3.2, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 350, imageMarginTop: -55,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -55, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.7, headerMarginTopMobile: 0, headerMarginBottomMobile: 6,
      imageSizeMobile: 310, imageMarginTopMobile: -45, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 290,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#d99efb", gradientMiddle: "#ea80ef", gradientEnd: "#fd5fe3"
    },
    "The Chronic Analyzer": {
      headerSize: 3.1, headerMarginTop: 0, headerMarginBottom: 16, imageSize: 310, imageMarginTop: -25,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 36, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 260, logoBottom: 40, logoLeft: -7,
      logoMaxWidth: 100, logoOpacity: 0.4, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 80,
      glowOpacity1: 0.4, glowOpacity2: 0.3, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.7, headerMarginTopMobile: 0, headerMarginBottomMobile: 6,
      imageSizeMobile: 280, imageMarginTopMobile: -10, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -25, cloudLeftMobile: 0, cloudWidthMobile: 290,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#5676e4", gradientMiddle: "#a697e8", gradientEnd: "#fcb9ec"
    },
    "The Romance Buzzkill": {
      headerSize: 3, headerMarginTop: 2, headerMarginBottom: 16, imageSize: 370, imageMarginTop: -25,
      bodyFontSize: 0.95, bodyMarginTop: -45, bodyMarginBottom: 48, strokeWidth: 8,
      cloudBottom: -50, cloudLeft: 5, cloudWidth: 250, logoBottom: 24, logoLeft: -7,
      logoMaxWidth: 105, logoOpacity: 0.45, cardPaddingTop: 60, cardPaddingBottom: 40,
      cardPaddingSide: 64, cardMinHeight: 560, glowBlur1: 40, glowBlur2: 35,
      glowOpacity1: 0.1, glowOpacity2: 0, glowColor1: "#ffffff", glowColor2: "#ffffff",
      headerSizeMobile: 2.5, headerMarginTopMobile: 9, headerMarginBottomMobile: 39,
      imageSizeMobile: 340, imageMarginTopMobile: -60, bodyFontSizeMobile: 0.9,
      bodyMarginTopMobile: -45, bodyMarginBottomMobile: 36, strokeWidthMobile: 8,
      cloudBottomMobile: -35, cloudLeftMobile: 0, cloudWidthMobile: 300,
      logoBottomMobile: 26, logoLeftMobile: 1, logoMaxWidthMobile: 100, logoOpacityMobile: 0.4,
      cardPaddingTopMobile: 50, cardPaddingBottomMobile: 45, cardPaddingSideMobile: 35,
      cardMinHeightMobile: 560, glowBlur1Mobile: 40, glowBlur2Mobile: 80,
      glowOpacity1Mobile: 0.4, glowOpacity2Mobile: 0.3, glowColor1Mobile: "#ffffff", glowColor2Mobile: "#ffffff",
      gradientStart: "#f8afdc", gradientMiddle: "#f0c0d4", gradientEnd: "#ff38b3"
    }
  } as any);

  // Desktop card controls
  const [headerSize, setHeaderSize] = useState(3.5);
  const [headerMarginTop, setHeaderMarginTop] = useState(2);
  const [headerMarginBottom, setHeaderMarginBottom] = useState(16);
  const [imageSize, setImageSize] = useState(340);
  const [imageMarginTop, setImageMarginTop] = useState(-20);
  const [bodyFontSize, setBodyFontSize] = useState(0.95);
  const [bodyMarginTop, setBodyMarginTop] = useState(-45);
  const [bodyMarginBottom, setBodyMarginBottom] = useState(36);
  const [strokeWidth, setStrokeWidth] = useState(8);
  const [cloudBottom, setCloudBottom] = useState(-55);
  const [cloudLeft, setCloudLeft] = useState(5);
  const [cloudWidth, setCloudWidth] = useState(260);
  const [logoBottom, setLogoBottom] = useState(24);
  const [logoLeft, setLogoLeft] = useState(-7);
  const [logoMaxWidth, setLogoMaxWidth] = useState(105);
  const [logoOpacity, setLogoOpacity] = useState(0.45);
  const [cardPaddingTop, setCardPaddingTop] = useState(60);
  const [cardPaddingBottom, setCardPaddingBottom] = useState(40);
  const [cardPaddingSide, setCardPaddingSide] = useState(64);
  const [cardMinHeight, setCardMinHeight] = useState(560);

  // Mobile card controls
  const [headerSizeMobile, setHeaderSizeMobile] = useState(2.8);
  const [headerMarginTopMobile, setHeaderMarginTopMobile] = useState(0);
  const [headerMarginBottomMobile, setHeaderMarginBottomMobile] = useState(39);
  const [imageSizeMobile, setImageSizeMobile] = useState(310);
  const [imageMarginTopMobile, setImageMarginTopMobile] = useState(-45);
  const [bodyFontSizeMobile, setBodyFontSizeMobile] = useState(0.9);
  const [bodyMarginTopMobile, setBodyMarginTopMobile] = useState(-45);
  const [bodyMarginBottomMobile, setBodyMarginBottomMobile] = useState(36);
  const [strokeWidthMobile, setStrokeWidthMobile] = useState(8);
  const [cloudBottomMobile, setCloudBottomMobile] = useState(-35);
  const [cloudLeftMobile, setCloudLeftMobile] = useState(0);
  const [cloudWidthMobile, setCloudWidthMobile] = useState(290);
  const [logoBottomMobile, setLogoBottomMobile] = useState(26);
  const [logoLeftMobile, setLogoLeftMobile] = useState(1);
  const [logoMaxWidthMobile, setLogoMaxWidthMobile] = useState(100);
  const [logoOpacityMobile, setLogoOpacityMobile] = useState(0.4);
  const [cardPaddingTopMobile, setCardPaddingTopMobile] = useState(50);
  const [cardPaddingBottomMobile, setCardPaddingBottomMobile] = useState(45);
  const [cardPaddingSideMobile, setCardPaddingSideMobile] = useState(35);
  const [cardMinHeightMobile, setCardMinHeightMobile] = useState(560);

  // Gradient (shared across viewports)
  const [gradientStart, setGradientStart] = useState('#610f40');
  const [gradientMiddle, setGradientMiddle] = useState('#a45574');
  const [gradientEnd, setGradientEnd] = useState('#efa4af');

  // Image glow controls - Desktop
  const [glowBlur1, setGlowBlur1] = useState(40);
  const [glowBlur2, setGlowBlur2] = useState(35);
  const [glowOpacity1, setGlowOpacity1] = useState(0.1);
  const [glowOpacity2, setGlowOpacity2] = useState(0);
  const [glowColor1, setGlowColor1] = useState('#ffffff');
  const [glowColor2, setGlowColor2] = useState('#ffffff');

  // Image glow controls - Mobile
  const [glowBlur1Mobile, setGlowBlur1Mobile] = useState(40);
  const [glowBlur2Mobile, setGlowBlur2Mobile] = useState(80);
  const [glowOpacity1Mobile, setGlowOpacity1Mobile] = useState(0.4);
  const [glowOpacity2Mobile, setGlowOpacity2Mobile] = useState(0.3);
  const [glowColor1Mobile, setGlowColor1Mobile] = useState('#ffffff');
  const [glowColor2Mobile, setGlowColor2Mobile] = useState('#ffffff');

  // Couples card controls - Desktop
  const [couplesHeaderSize, setCouplesHeaderSize] = useState(5);
  const [couplesImageSize, setCouplesImageSize] = useState(150);
  const [couplesBodyFontSize, setCouplesBodyFontSize] = useState(1.2);
  const [couplesBodyMarginTop, setCouplesBodyMarginTop] = useState(25);
  const [couplesBodyMarginBottom, setCouplesBodyMarginBottom] = useState(0);
  const [couplesCloudBottom, setCouplesCloudBottom] = useState(-100);
  const [couplesCloudLeft, setCouplesCloudLeft] = useState(-10);
  const [couplesCloudWidth, setCouplesCloudWidth] = useState(300);

  // Couples card controls - Mobile
  const [couplesHeaderSizeMobile, setCouplesHeaderSizeMobile] = useState(4);
  const [couplesImageSizeMobile, setCouplesImageSizeMobile] = useState(150);
  const [couplesBodyFontSizeMobile, setCouplesBodyFontSizeMobile] = useState(1.1);
  const [couplesBodyMarginTopMobile, setCouplesBodyMarginTopMobile] = useState(25);
  const [couplesBodyMarginBottomMobile, setCouplesBodyMarginBottomMobile] = useState(0);
  const [couplesCloudBottomMobile, setCouplesCloudBottomMobile] = useState(-70);
  const [couplesCloudLeftMobile, setCouplesCloudLeftMobile] = useState(-10);
  const [couplesCloudWidthMobile, setCouplesCloudWidthMobile] = useState(300);

  // Grain controls
  const [grainOpacity, setGrainOpacity] = useState(0.4);
  const [grainBlendMode, setGrainBlendMode] = useState('overlay');
  const [couplesGrainOpacity, setCouplesGrainOpacity] = useState(0.4);
  const [couplesGrainBlendMode, setCouplesGrainBlendMode] = useState('overlay');

  const currentPersonaName = PERSONA_NAMES[currentPersonaIndex];
  const currentOverrides = personaOverrides[currentPersonaName] || {};

  // Get effective value (persona override or global default)
  const getEffectiveValue = (key: keyof PersonaSettings, defaultValue: number) => {
    return currentOverrides[key] ?? defaultValue;
  };

  // Lock all current settings for this persona
  const lockAllSettings = () => {
    setPersonaOverrides(prev => ({
      ...prev,
      [currentPersonaName]: {
        // Desktop settings
        headerSize,
        headerMarginTop,
        headerMarginBottom,
        imageSize,
        imageMarginTop,
        bodyFontSize,
        bodyMarginTop,
        bodyMarginBottom,
        strokeWidth,
        cloudBottom,
        cloudLeft,
        cloudWidth,
        logoBottom,
        logoLeft,
        logoMaxWidth,
        logoOpacity,
        cardPaddingTop,
        cardPaddingBottom,
        cardPaddingSide,
        cardMinHeight,
        glowBlur1,
        glowBlur2,
        glowOpacity1,
        glowOpacity2,
        glowColor1,
        glowColor2,
        // Mobile settings
        headerSizeMobile,
        headerMarginTopMobile,
        headerMarginBottomMobile,
        imageSizeMobile,
        imageMarginTopMobile,
        bodyFontSizeMobile,
        bodyMarginTopMobile,
        bodyMarginBottomMobile,
        strokeWidthMobile,
        cloudBottomMobile,
        cloudLeftMobile,
        cloudWidthMobile,
        logoBottomMobile,
        logoLeftMobile,
        logoMaxWidthMobile,
        logoOpacityMobile,
        cardPaddingTopMobile,
        cardPaddingBottomMobile,
        cardPaddingSideMobile,
        cardMinHeightMobile,
        glowBlur1Mobile,
        glowBlur2Mobile,
        glowOpacity1Mobile,
        glowOpacity2Mobile,
        glowColor1Mobile,
        glowColor2Mobile,
        // Gradient (shared)
        gradientStart,
        gradientMiddle,
        gradientEnd,
      }
    }));
  };

  // Unlock all settings for this persona (use global defaults)
  const unlockAllSettings = () => {
    setPersonaOverrides(prev => {
      const newOverrides = { ...prev };
      delete newOverrides[currentPersonaName];
      return newOverrides;
    });
  };

  // Check if this persona has locked settings
  const hasLockedSettings = () => {
    return personaOverrides[currentPersonaName] !== undefined &&
           Object.keys(personaOverrides[currentPersonaName] || {}).length > 0;
  };

  // Navigate personas
  const nextPersona = () => {
    setCurrentPersonaIndex((prev) => (prev + 1) % PERSONA_NAMES.length);
  };

  const prevPersona = () => {
    setCurrentPersonaIndex((prev) => (prev - 1 + PERSONA_NAMES.length) % PERSONA_NAMES.length);
  };

  // Sample data - use current persona
  const sampleResult = {
    name: currentPersonaName,
    description: "You don't do anything halfway, especially love. If you're in, you're IN. Your emotional range is either absolute euphoria or full existential crisis. There is no in-between. You need a partner who can handle the intensity or will simply perish trying. Chill? Never heard of her.",
    scores: {} as any
  };

  // Load persona-specific values when persona changes
  // Cascade: if locked, use locked values. If unlocked, inherit from previous persona
  useEffect(() => {
    const currentOverrides = personaOverrides[currentPersonaName];

    // If this persona is locked, load its settings
    if (currentOverrides && Object.keys(currentOverrides).length > 0) {
      if (currentOverrides.headerSize !== undefined) setHeaderSize(currentOverrides.headerSize);
      if (currentOverrides.headerMarginTop !== undefined) setHeaderMarginTop(currentOverrides.headerMarginTop);
      if (currentOverrides.headerMarginBottom !== undefined) setHeaderMarginBottom(currentOverrides.headerMarginBottom);
      if (currentOverrides.imageSize !== undefined) setImageSize(currentOverrides.imageSize);
      if (currentOverrides.imageMarginTop !== undefined) setImageMarginTop(currentOverrides.imageMarginTop);
      if (currentOverrides.bodyFontSize !== undefined) setBodyFontSize(currentOverrides.bodyFontSize);
      if (currentOverrides.bodyMarginTop !== undefined) setBodyMarginTop(currentOverrides.bodyMarginTop);
      if (currentOverrides.bodyMarginBottom !== undefined) setBodyMarginBottom(currentOverrides.bodyMarginBottom);
      if (currentOverrides.strokeWidth !== undefined) setStrokeWidth(currentOverrides.strokeWidth);
      if (currentOverrides.cloudBottom !== undefined) setCloudBottom(currentOverrides.cloudBottom);
      if (currentOverrides.cloudLeft !== undefined) setCloudLeft(currentOverrides.cloudLeft);
      if (currentOverrides.cloudWidth !== undefined) setCloudWidth(currentOverrides.cloudWidth);
      if (currentOverrides.cloudBottomMobile !== undefined) setCloudBottomMobile(currentOverrides.cloudBottomMobile);
      if (currentOverrides.cloudLeftMobile !== undefined) setCloudLeftMobile(currentOverrides.cloudLeftMobile);
      if (currentOverrides.cloudWidthMobile !== undefined) setCloudWidthMobile(currentOverrides.cloudWidthMobile);
      if (currentOverrides.logoBottom !== undefined) setLogoBottom(currentOverrides.logoBottom);
      if (currentOverrides.logoLeft !== undefined) setLogoLeft(currentOverrides.logoLeft);
      if (currentOverrides.logoBottomMobile !== undefined) setLogoBottomMobile(currentOverrides.logoBottomMobile);
      if (currentOverrides.logoLeftMobile !== undefined) setLogoLeftMobile(currentOverrides.logoLeftMobile);
      if (currentOverrides.logoMaxWidth !== undefined) setLogoMaxWidth(currentOverrides.logoMaxWidth);
      if (currentOverrides.logoOpacity !== undefined) setLogoOpacity(currentOverrides.logoOpacity);
      if (currentOverrides.cardPaddingTop !== undefined) setCardPaddingTop(currentOverrides.cardPaddingTop);
      if (currentOverrides.cardPaddingBottom !== undefined) setCardPaddingBottom(currentOverrides.cardPaddingBottom);
      if (currentOverrides.cardPaddingSide !== undefined) setCardPaddingSide(currentOverrides.cardPaddingSide);
      if (currentOverrides.cardMinHeight !== undefined) setCardMinHeight(currentOverrides.cardMinHeight);
      if (currentOverrides.gradientStart !== undefined) setGradientStart(currentOverrides.gradientStart);
      if (currentOverrides.gradientMiddle !== undefined) setGradientMiddle(currentOverrides.gradientMiddle);
      if (currentOverrides.gradientEnd !== undefined) setGradientEnd(currentOverrides.gradientEnd);
      if (currentOverrides.glowBlur1 !== undefined) setGlowBlur1(currentOverrides.glowBlur1);
      if (currentOverrides.glowBlur2 !== undefined) setGlowBlur2(currentOverrides.glowBlur2);
      if (currentOverrides.glowOpacity1 !== undefined) setGlowOpacity1(currentOverrides.glowOpacity1);
      if (currentOverrides.glowOpacity2 !== undefined) setGlowOpacity2(currentOverrides.glowOpacity2);
      if (currentOverrides.glowColor1 !== undefined) setGlowColor1(currentOverrides.glowColor1);
      if (currentOverrides.glowColor2 !== undefined) setGlowColor2(currentOverrides.glowColor2);
      // Mobile settings
      if (currentOverrides.headerSizeMobile !== undefined) setHeaderSizeMobile(currentOverrides.headerSizeMobile);
      if (currentOverrides.headerMarginTopMobile !== undefined) setHeaderMarginTopMobile(currentOverrides.headerMarginTopMobile);
      if (currentOverrides.headerMarginBottomMobile !== undefined) setHeaderMarginBottomMobile(currentOverrides.headerMarginBottomMobile);
      if (currentOverrides.imageSizeMobile !== undefined) setImageSizeMobile(currentOverrides.imageSizeMobile);
      if (currentOverrides.imageMarginTopMobile !== undefined) setImageMarginTopMobile(currentOverrides.imageMarginTopMobile);
      if (currentOverrides.bodyFontSizeMobile !== undefined) setBodyFontSizeMobile(currentOverrides.bodyFontSizeMobile);
      if (currentOverrides.bodyMarginTopMobile !== undefined) setBodyMarginTopMobile(currentOverrides.bodyMarginTopMobile);
      if (currentOverrides.bodyMarginBottomMobile !== undefined) setBodyMarginBottomMobile(currentOverrides.bodyMarginBottomMobile);
      if (currentOverrides.strokeWidthMobile !== undefined) setStrokeWidthMobile(currentOverrides.strokeWidthMobile);
      if (currentOverrides.logoMaxWidthMobile !== undefined) setLogoMaxWidthMobile(currentOverrides.logoMaxWidthMobile);
      if (currentOverrides.logoOpacityMobile !== undefined) setLogoOpacityMobile(currentOverrides.logoOpacityMobile);
      if (currentOverrides.cardPaddingTopMobile !== undefined) setCardPaddingTopMobile(currentOverrides.cardPaddingTopMobile);
      if (currentOverrides.cardPaddingBottomMobile !== undefined) setCardPaddingBottomMobile(currentOverrides.cardPaddingBottomMobile);
      if (currentOverrides.cardPaddingSideMobile !== undefined) setCardPaddingSideMobile(currentOverrides.cardPaddingSideMobile);
      if (currentOverrides.cardMinHeightMobile !== undefined) setCardMinHeightMobile(currentOverrides.cardMinHeightMobile);
      if (currentOverrides.glowBlur1Mobile !== undefined) setGlowBlur1Mobile(currentOverrides.glowBlur1Mobile);
      if (currentOverrides.glowBlur2Mobile !== undefined) setGlowBlur2Mobile(currentOverrides.glowBlur2Mobile);
      if (currentOverrides.glowOpacity1Mobile !== undefined) setGlowOpacity1Mobile(currentOverrides.glowOpacity1Mobile);
      if (currentOverrides.glowOpacity2Mobile !== undefined) setGlowOpacity2Mobile(currentOverrides.glowOpacity2Mobile);
      if (currentOverrides.glowColor1Mobile !== undefined) setGlowColor1Mobile(currentOverrides.glowColor1Mobile);
      if (currentOverrides.glowColor2Mobile !== undefined) setGlowColor2Mobile(currentOverrides.glowColor2Mobile);
    }
    // If unlocked, current settings stay (inherited from previous persona)
    // No need to change anything - settings cascade naturally!
  }, [currentPersonaIndex, personaOverrides]);

  const sampleCompatibility = {
    overallPercentage: 87,
    romancePercentage: 92,
    compatibilityLevel: "Soul Mates" as const,
    description: "You two are made for each other. Your connection is off the charts.",
  };

  const exportSettings = () => {
    const settings = {
      globalDefaults: {
        single: {
          headerSize,
          headerMarginTop,
          headerMarginBottom,
          imageSize,
          imageMarginTop,
          bodyFontSize,
          bodyMarginTop,
          bodyMarginBottom,
          strokeWidth,
          cloudBottom,
          cloudLeft,
          cloudWidth,
          cloudBottomMobile,
          cloudLeftMobile,
          cloudWidthMobile,
          logoBottom,
          logoLeft,
          logoBottomMobile,
          logoLeftMobile,
          logoMaxWidth,
          logoOpacity,
          cardPaddingTop,
          cardPaddingBottom,
          cardPaddingSide,
          cardMinHeight,
          gradientStart,
          gradientMiddle,
          gradientEnd,
          glowBlur1,
          glowBlur2,
          glowOpacity1,
          glowOpacity2,
          glowColor1,
          glowColor2,
          // Mobile settings
          headerSizeMobile,
          headerMarginTopMobile,
          headerMarginBottomMobile,
          imageSizeMobile,
          imageMarginTopMobile,
          bodyFontSizeMobile,
          bodyMarginTopMobile,
          bodyMarginBottomMobile,
          strokeWidthMobile,
          logoMaxWidthMobile,
          logoOpacityMobile,
          cardPaddingTopMobile,
          cardPaddingBottomMobile,
          cardPaddingSideMobile,
          cardMinHeightMobile,
          glowBlur1Mobile,
          glowBlur2Mobile,
          glowOpacity1Mobile,
          glowOpacity2Mobile,
          glowColor1Mobile,
          glowColor2Mobile,
        },
        couples: {
          headerSize: couplesHeaderSize,
          imageSize: couplesImageSize,
          bodyFontSize: couplesBodyFontSize,
          bodyMarginTop: couplesBodyMarginTop,
          bodyMarginBottom: couplesBodyMarginBottom,
          cloudBottom: couplesCloudBottom,
          cloudLeft: couplesCloudLeft,
          cloudWidth: couplesCloudWidth,
          headerSizeMobile: couplesHeaderSizeMobile,
          imageSizeMobile: couplesImageSizeMobile,
          bodyFontSizeMobile: couplesBodyFontSizeMobile,
          bodyMarginTopMobile: couplesBodyMarginTopMobile,
          bodyMarginBottomMobile: couplesBodyMarginBottomMobile,
          cloudBottomMobile: couplesCloudBottomMobile,
          cloudLeftMobile: couplesCloudLeftMobile,
          cloudWidthMobile: couplesCloudWidthMobile,
        }
      },
      personaOverrides: personaOverrides
    };

    console.log('Card Settings:', settings);
    navigator.clipboard.writeText(JSON.stringify(settings, null, 2));
    alert('Settings copied to clipboard! Includes global defaults and persona-specific overrides.');
  };

  return (
    <div className="card-editor">
      <header className="card-editor__header">
        <button onClick={() => navigate('/')} className="btn btn--secondary">
          ← Back
        </button>
        <h1 className="card-editor__title">Card Design Editor</h1>
        <button onClick={exportSettings} className="btn btn--primary">
          Export Settings
        </button>
      </header>

      <div className="card-editor__controls-bar">
        <div className="card-editor__toggle-group">
          <label>Card Type:</label>
          <button
            className={`btn ${cardType === 'single' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setCardType('single')}
          >
            Single
          </button>
          <button
            className={`btn ${cardType === 'couples' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setCardType('couples')}
          >
            Couples
          </button>
        </div>

        {cardType === 'single' && (
          <div className="card-editor__persona-nav">
            <button className="btn btn--secondary" onClick={prevPersona}>←</button>
            <span className="card-editor__persona-name">
              {currentPersonaName} ({currentPersonaIndex + 1}/{PERSONA_NAMES.length})
            </span>
            <button className="btn btn--secondary" onClick={nextPersona}>→</button>
            <button
              className={`btn ${hasLockedSettings() ? 'btn--warning' : 'btn--primary'}`}
              onClick={hasLockedSettings() ? unlockAllSettings : lockAllSettings}
              title={hasLockedSettings() ? 'Unlock and use global defaults' : 'Lock all settings for this persona'}
            >
              {hasLockedSettings() ? '🔒 Locked' : '🔓 Lock All'}
            </button>
          </div>
        )}

        <div className="card-editor__toggle-group">
          <label>Viewport:</label>
          <button
            className={`btn ${viewport === 'mobile' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setViewport('mobile')}
          >
            📱 Mobile
          </button>
          <button
            className={`btn ${viewport === 'desktop' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setViewport('desktop')}
          >
            🖥️ Desktop
          </button>
        </div>

        <div className="card-editor__toggle-group">
          <label>Mode:</label>
          <button
            className={`btn ${!previewMode ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setPreviewMode(false)}
          >
            ✏️ Edit
          </button>
          <button
            className={`btn ${previewMode ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setPreviewMode(true)}
          >
            👁️ Preview All
          </button>
        </div>
      </div>

      {previewMode ? (
        // Preview All Mode - Grid of all personas
        <div className="card-editor__preview-grid">
          {PERSONA_NAMES.map((personaName) => {
            const overrides = personaOverrides[personaName] || {};
            const effectiveGradient = `linear-gradient(180deg, ${overrides.gradientStart || gradientStart} 0%, ${overrides.gradientMiddle || gradientMiddle} 50%, ${overrides.gradientEnd || gradientEnd} 100%)`;

            return (
              <div
                key={personaName}
                className="share-modal__card-wrapper"
                style={{
                  ['--header-size' as any]: `${viewport === 'mobile' ? (overrides.headerSizeMobile || headerSizeMobile) : (overrides.headerSize || headerSize)}rem`,
                  ['--header-margin-top' as any]: `${viewport === 'mobile' ? (overrides.headerMarginTopMobile || headerMarginTopMobile) : (overrides.headerMarginTop || headerMarginTop)}px`,
                  ['--header-margin-bottom' as any]: `${viewport === 'mobile' ? (overrides.headerMarginBottomMobile || headerMarginBottomMobile) : (overrides.headerMarginBottom || headerMarginBottom)}px`,
                  ['--image-size' as any]: `${viewport === 'mobile' ? (overrides.imageSizeMobile || imageSizeMobile) : (overrides.imageSize || imageSize)}px`,
                  ['--image-margin-top' as any]: `${viewport === 'mobile' ? (overrides.imageMarginTopMobile || imageMarginTopMobile) : (overrides.imageMarginTop || imageMarginTop)}px`,
                  ['--body-font-size' as any]: `${viewport === 'mobile' ? (overrides.bodyFontSizeMobile || bodyFontSizeMobile) : (overrides.bodyFontSize || bodyFontSize)}rem`,
                  ['--body-margin-top' as any]: `${viewport === 'mobile' ? (overrides.bodyMarginTopMobile || bodyMarginTopMobile) : (overrides.bodyMarginTop || bodyMarginTop)}px`,
                  ['--body-margin-bottom' as any]: `${viewport === 'mobile' ? (overrides.bodyMarginBottomMobile || bodyMarginBottomMobile) : (overrides.bodyMarginBottom || bodyMarginBottom)}px`,
                  ['--stroke-width' as any]: `${viewport === 'mobile' ? (overrides.strokeWidthMobile || strokeWidthMobile) : (overrides.strokeWidth || strokeWidth)}px`,
                  ['--cloud-bottom' as any]: `${viewport === 'mobile' ? (overrides.cloudBottomMobile || cloudBottomMobile) : (overrides.cloudBottom || cloudBottom)}%`,
                  ['--cloud-left' as any]: `${viewport === 'mobile' ? (overrides.cloudLeftMobile || cloudLeftMobile) : (overrides.cloudLeft || cloudLeft)}%`,
                  ['--cloud-width' as any]: `${viewport === 'mobile' ? (overrides.cloudWidthMobile || cloudWidthMobile) : (overrides.cloudWidth || cloudWidth)}%`,
                  ['--logo-bottom' as any]: `${viewport === 'mobile' ? (overrides.logoBottomMobile || logoBottomMobile) : (overrides.logoBottom || logoBottom)}px`,
                  ['--logo-left' as any]: `${viewport === 'mobile' ? (overrides.logoLeftMobile || logoLeftMobile) : (overrides.logoLeft || logoLeft)}%`,
                  ['--logo-max-width' as any]: `${viewport === 'mobile' ? (overrides.logoMaxWidthMobile || logoMaxWidthMobile) : (overrides.logoMaxWidth || logoMaxWidth)}px`,
                  ['--logo-opacity' as any]: viewport === 'mobile' ? (overrides.logoOpacityMobile || logoOpacityMobile) : (overrides.logoOpacity || logoOpacity),
                  ['--card-padding-top' as any]: `${viewport === 'mobile' ? (overrides.cardPaddingTopMobile || cardPaddingTopMobile) : (overrides.cardPaddingTop || cardPaddingTop)}px`,
                  ['--card-padding-bottom' as any]: `${viewport === 'mobile' ? (overrides.cardPaddingBottomMobile || cardPaddingBottomMobile) : (overrides.cardPaddingBottom || cardPaddingBottom)}px`,
                  ['--card-padding-side' as any]: `${viewport === 'mobile' ? (overrides.cardPaddingSideMobile || cardPaddingSideMobile) : (overrides.cardPaddingSide || cardPaddingSide)}px`,
                  ['--card-min-height' as any]: `${viewport === 'mobile' ? (overrides.cardMinHeightMobile || cardMinHeightMobile) : (overrides.cardMinHeight || cardMinHeight)}px`,
                  ['--glow-blur-1' as any]: `${viewport === 'mobile' ? (overrides.glowBlur1Mobile || glowBlur1Mobile) : (overrides.glowBlur1 || glowBlur1)}px`,
                  ['--glow-blur-2' as any]: `${viewport === 'mobile' ? (overrides.glowBlur2Mobile || glowBlur2Mobile) : (overrides.glowBlur2 || glowBlur2)}px`,
                  ['--glow-color-1' as any]: viewport === 'mobile' ? hexToRgba(overrides.glowColor1Mobile || glowColor1Mobile, overrides.glowOpacity1Mobile || glowOpacity1Mobile) : hexToRgba(overrides.glowColor1 || glowColor1, overrides.glowOpacity1 || glowOpacity1),
                  ['--glow-color-2' as any]: viewport === 'mobile' ? hexToRgba(overrides.glowColor2Mobile || glowColor2Mobile, overrides.glowOpacity2Mobile || glowOpacity2Mobile) : hexToRgba(overrides.glowColor2 || glowColor2, overrides.glowOpacity2 || glowOpacity2),
                  ['--card-gradient' as any]: effectiveGradient,
                }}
              >
                <ResultCard
                  result={{ name: personaName, description: "Preview mode", scores: {} as any }}
                  variant="large"
                  showShareable
                  hidePairings
                />
                <div className="share-modal__logo">
                  <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // Edit Mode - Original interface
        <div className="card-editor__content">
        {/* Controls Panel */}
        <aside className="card-editor__sidebar">
          <h2>Design Controls</h2>

          {cardType === 'single' ? (
            <div className="card-editor__controls">
              <div className="control-group">
                <h3>Header (Persona Name)</h3>
                <label>
                  Font Size ({viewport}): {viewport === 'mobile' ? headerSizeMobile : headerSize}rem
                  <input
                    type="range"
                    min="1.5"
                    max="4"
                    step="0.1"
                    value={viewport === 'mobile' ? headerSizeMobile : headerSize}
                    onChange={(e) => viewport === 'mobile' ? setHeaderSizeMobile(parseFloat(e.target.value)) : setHeaderSize(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Margin Top ({viewport}): {viewport === 'mobile' ? headerMarginTopMobile : headerMarginTop}px
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="1"
                    value={viewport === 'mobile' ? headerMarginTopMobile : headerMarginTop}
                    onChange={(e) => viewport === 'mobile' ? setHeaderMarginTopMobile(parseInt(e.target.value)) : setHeaderMarginTop(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Margin Bottom ({viewport}): {viewport === 'mobile' ? headerMarginBottomMobile : headerMarginBottom}px
                  <input
                    type="range"
                    min="0"
                    max="50"
                    step="1"
                    value={viewport === 'mobile' ? headerMarginBottomMobile : headerMarginBottom}
                    onChange={(e) => viewport === 'mobile' ? setHeaderMarginBottomMobile(parseInt(e.target.value)) : setHeaderMarginBottom(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Image</h3>
                <label>
                  Size ({viewport}): {viewport === 'mobile' ? imageSizeMobile : imageSize}px
                  <input
                    type="range"
                    min="150"
                    max="400"
                    step="10"
                    value={viewport === 'mobile' ? imageSizeMobile : imageSize}
                    onChange={(e) => viewport === 'mobile' ? setImageSizeMobile(parseInt(e.target.value)) : setImageSize(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Margin Top ({viewport}): {viewport === 'mobile' ? imageMarginTopMobile : imageMarginTop}px
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    step="5"
                    value={viewport === 'mobile' ? imageMarginTopMobile : imageMarginTop}
                    onChange={(e) => viewport === 'mobile' ? setImageMarginTopMobile(parseInt(e.target.value)) : setImageMarginTop(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Image Glow Effect</h3>
                <label>
                  Inner Glow Color ({viewport}): {viewport === 'mobile' ? glowColor1Mobile : glowColor1}
                  <input
                    type="color"
                    value={viewport === 'mobile' ? glowColor1Mobile : glowColor1}
                    onChange={(e) => viewport === 'mobile' ? setGlowColor1Mobile(e.target.value) : setGlowColor1(e.target.value)}
                  />
                </label>
                <label>
                  Inner Glow Blur ({viewport}): {viewport === 'mobile' ? glowBlur1Mobile : glowBlur1}px
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={viewport === 'mobile' ? glowBlur1Mobile : glowBlur1}
                    onChange={(e) => viewport === 'mobile' ? setGlowBlur1Mobile(parseInt(e.target.value)) : setGlowBlur1(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Inner Glow Opacity ({viewport}): {viewport === 'mobile' ? glowOpacity1Mobile : glowOpacity1}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={viewport === 'mobile' ? glowOpacity1Mobile : glowOpacity1}
                    onChange={(e) => viewport === 'mobile' ? setGlowOpacity1Mobile(parseFloat(e.target.value)) : setGlowOpacity1(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Outer Glow Color ({viewport}): {viewport === 'mobile' ? glowColor2Mobile : glowColor2}
                  <input
                    type="color"
                    value={viewport === 'mobile' ? glowColor2Mobile : glowColor2}
                    onChange={(e) => viewport === 'mobile' ? setGlowColor2Mobile(e.target.value) : setGlowColor2(e.target.value)}
                  />
                </label>
                <label>
                  Outer Glow Blur ({viewport}): {viewport === 'mobile' ? glowBlur2Mobile : glowBlur2}px
                  <input
                    type="range"
                    min="0"
                    max="150"
                    step="5"
                    value={viewport === 'mobile' ? glowBlur2Mobile : glowBlur2}
                    onChange={(e) => viewport === 'mobile' ? setGlowBlur2Mobile(parseInt(e.target.value)) : setGlowBlur2(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Outer Glow Opacity ({viewport}): {viewport === 'mobile' ? glowOpacity2Mobile : glowOpacity2}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={viewport === 'mobile' ? glowOpacity2Mobile : glowOpacity2}
                    onChange={(e) => viewport === 'mobile' ? setGlowOpacity2Mobile(parseFloat(e.target.value)) : setGlowOpacity2(parseFloat(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Body Copy</h3>
                <label>
                  Font Size ({viewport}): {viewport === 'mobile' ? bodyFontSizeMobile : bodyFontSize}rem
                  <input
                    type="range"
                    min="0.6"
                    max="1.2"
                    step="0.05"
                    value={viewport === 'mobile' ? bodyFontSizeMobile : bodyFontSize}
                    onChange={(e) => viewport === 'mobile' ? setBodyFontSizeMobile(parseFloat(e.target.value)) : setBodyFontSize(parseFloat(e.target.value))}
                  />
                </label>
                <label>
                  Margin Top ({viewport}): {viewport === 'mobile' ? bodyMarginTopMobile : bodyMarginTop}px
                  <input
                    type="range"
                    min="-100"
                    max="50"
                    step="5"
                    value={viewport === 'mobile' ? bodyMarginTopMobile : bodyMarginTop}
                    onChange={(e) => viewport === 'mobile' ? setBodyMarginTopMobile(parseInt(e.target.value)) : setBodyMarginTop(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Margin Bottom ({viewport}): {viewport === 'mobile' ? bodyMarginBottomMobile : bodyMarginBottom}px
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="4"
                    value={viewport === 'mobile' ? bodyMarginBottomMobile : bodyMarginBottom}
                    onChange={(e) => viewport === 'mobile' ? setBodyMarginBottomMobile(parseInt(e.target.value)) : setBodyMarginBottom(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Card Structure</h3>
                <label>
                  Min Height ({viewport}): {viewport === 'mobile' ? cardMinHeightMobile : cardMinHeight}px
                  <input
                    type="range"
                    min="400"
                    max="800"
                    step="20"
                    value={viewport === 'mobile' ? cardMinHeightMobile : cardMinHeight}
                    onChange={(e) => viewport === 'mobile' ? setCardMinHeightMobile(parseInt(e.target.value)) : setCardMinHeight(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Padding Top ({viewport}): {viewport === 'mobile' ? cardPaddingTopMobile : cardPaddingTop}px
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={viewport === 'mobile' ? cardPaddingTopMobile : cardPaddingTop}
                    onChange={(e) => viewport === 'mobile' ? setCardPaddingTopMobile(parseInt(e.target.value)) : setCardPaddingTop(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Padding Bottom ({viewport}): {viewport === 'mobile' ? cardPaddingBottomMobile : cardPaddingBottom}px
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={viewport === 'mobile' ? cardPaddingBottomMobile : cardPaddingBottom}
                    onChange={(e) => viewport === 'mobile' ? setCardPaddingBottomMobile(parseInt(e.target.value)) : setCardPaddingBottom(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Padding Side ({viewport}): {viewport === 'mobile' ? cardPaddingSideMobile : cardPaddingSide}px
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={viewport === 'mobile' ? cardPaddingSideMobile : cardPaddingSide}
                    onChange={(e) => viewport === 'mobile' ? setCardPaddingSideMobile(parseInt(e.target.value)) : setCardPaddingSide(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Stroke Width ({viewport}): {viewport === 'mobile' ? strokeWidthMobile : strokeWidth}px
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="1"
                    value={viewport === 'mobile' ? strokeWidthMobile : strokeWidth}
                    onChange={(e) => viewport === 'mobile' ? setStrokeWidthMobile(parseInt(e.target.value)) : setStrokeWidth(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Cloud Decoration</h3>
                <label>
                  Bottom ({viewport}): {viewport === 'mobile' ? cloudBottomMobile : cloudBottom}%
                  <input
                    type="range"
                    min="-100"
                    max="0"
                    step="5"
                    value={viewport === 'mobile' ? cloudBottomMobile : cloudBottom}
                    onChange={(e) => viewport === 'mobile' ? setCloudBottomMobile(parseInt(e.target.value)) : setCloudBottom(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Left ({viewport}): {viewport === 'mobile' ? cloudLeftMobile : cloudLeft}%
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    step="5"
                    value={viewport === 'mobile' ? cloudLeftMobile : cloudLeft}
                    onChange={(e) => viewport === 'mobile' ? setCloudLeftMobile(parseInt(e.target.value)) : setCloudLeft(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Width ({viewport}): {viewport === 'mobile' ? cloudWidthMobile : cloudWidth}%
                  <input
                    type="range"
                    min="100"
                    max="400"
                    step="10"
                    value={viewport === 'mobile' ? cloudWidthMobile : cloudWidth}
                    onChange={(e) => viewport === 'mobile' ? setCloudWidthMobile(parseInt(e.target.value)) : setCloudWidth(parseInt(e.target.value))}
                  />
                </label>
              </div>

              <div className="control-group">
                <h3>Gradient Background</h3>
                <label>
                  Start Color: {gradientStart}
                  <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} />
                </label>
                <label>
                  Middle Color: {gradientMiddle}
                  <input type="color" value={gradientMiddle} onChange={(e) => setGradientMiddle(e.target.value)} />
                </label>
                <label>
                  End Color: {gradientEnd}
                  <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} />
                </label>
              </div>

              <div className="control-group">
                <h3>Grain</h3>
                <label>
                  Opacity: {grainOpacity}
                  <input type="range" min="0" max="1" step="0.01" value={grainOpacity} onChange={(e) => setGrainOpacity(parseFloat(e.target.value))} />
                </label>
                <label>
                  Blend Mode:
                  <select value={grainBlendMode} onChange={(e) => setGrainBlendMode(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="color-dodge">Color Dodge</option>
                    <option value="color-burn">Color Burn</option>
                    <option value="luminosity">Luminosity</option>
                  </select>
                </label>
              </div>

              <div className="control-group">
                <h3>Logo</h3>
                <label>
                  Bottom Position ({viewport}): {viewport === 'mobile' ? logoBottomMobile : logoBottom}px
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="2"
                    value={viewport === 'mobile' ? logoBottomMobile : logoBottom}
                    onChange={(e) => viewport === 'mobile' ? setLogoBottomMobile(parseInt(e.target.value)) : setLogoBottom(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Left Position ({viewport}): {viewport === 'mobile' ? logoLeftMobile : logoLeft}% {(viewport === 'mobile' ? logoLeftMobile : logoLeft) === 50 ? '(Centered)' : (viewport === 'mobile' ? logoLeftMobile : logoLeft) < 50 ? '(Left)' : '(Right)'}
                  <input
                    type="range"
                    min="-50"
                    max="150"
                    step="1"
                    value={viewport === 'mobile' ? logoLeftMobile : logoLeft}
                    onChange={(e) => viewport === 'mobile' ? setLogoLeftMobile(parseInt(e.target.value)) : setLogoLeft(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Max Width ({viewport}): {viewport === 'mobile' ? logoMaxWidthMobile : logoMaxWidth}px
                  <input
                    type="range"
                    min="60"
                    max="200"
                    step="5"
                    value={viewport === 'mobile' ? logoMaxWidthMobile : logoMaxWidth}
                    onChange={(e) => viewport === 'mobile' ? setLogoMaxWidthMobile(parseInt(e.target.value)) : setLogoMaxWidth(parseInt(e.target.value))}
                  />
                </label>
                <label>
                  Opacity ({viewport}): {viewport === 'mobile' ? logoOpacityMobile : logoOpacity}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={viewport === 'mobile' ? logoOpacityMobile : logoOpacity}
                    onChange={(e) => viewport === 'mobile' ? setLogoOpacityMobile(parseFloat(e.target.value)) : setLogoOpacity(parseFloat(e.target.value))}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="card-editor__controls">
              <div className="control-group">
                <h3>Couples Card Header</h3>
                <label>
                  Font Size ({viewport}): {viewport === 'mobile' ? couplesHeaderSizeMobile : couplesHeaderSize}rem
                  <input type="range" min="1.5" max="5" step="0.1" value={viewport === 'mobile' ? couplesHeaderSizeMobile : couplesHeaderSize} onChange={(e) => viewport === 'mobile' ? setCouplesHeaderSizeMobile(parseFloat(e.target.value)) : setCouplesHeaderSize(parseFloat(e.target.value))} />
                </label>
              </div>

              <div className="control-group">
                <h3>Couples Card Image</h3>
                <label>
                  Size ({viewport}): {viewport === 'mobile' ? couplesImageSizeMobile : couplesImageSize}px
                  <input type="range" min="100" max="400" step="10" value={viewport === 'mobile' ? couplesImageSizeMobile : couplesImageSize} onChange={(e) => viewport === 'mobile' ? setCouplesImageSizeMobile(parseInt(e.target.value)) : setCouplesImageSize(parseInt(e.target.value))} />
                </label>
              </div>

              <div className="control-group">
                <h3>Couples Card Body</h3>
                <label>
                  Font Size ({viewport}): {viewport === 'mobile' ? couplesBodyFontSizeMobile : couplesBodyFontSize}rem
                  <input type="range" min="0.6" max="1.5" step="0.05" value={viewport === 'mobile' ? couplesBodyFontSizeMobile : couplesBodyFontSize} onChange={(e) => viewport === 'mobile' ? setCouplesBodyFontSizeMobile(parseFloat(e.target.value)) : setCouplesBodyFontSize(parseFloat(e.target.value))} />
                </label>
                <label>
                  Margin Top ({viewport}): {viewport === 'mobile' ? couplesBodyMarginTopMobile : couplesBodyMarginTop}px
                  <input type="range" min="-100" max="50" step="5" value={viewport === 'mobile' ? couplesBodyMarginTopMobile : couplesBodyMarginTop} onChange={(e) => viewport === 'mobile' ? setCouplesBodyMarginTopMobile(parseInt(e.target.value)) : setCouplesBodyMarginTop(parseInt(e.target.value))} />
                </label>
                <label>
                  Margin Bottom ({viewport}): {viewport === 'mobile' ? couplesBodyMarginBottomMobile : couplesBodyMarginBottom}px
                  <input type="range" min="0" max="100" step="4" value={viewport === 'mobile' ? couplesBodyMarginBottomMobile : couplesBodyMarginBottom} onChange={(e) => viewport === 'mobile' ? setCouplesBodyMarginBottomMobile(parseInt(e.target.value)) : setCouplesBodyMarginBottom(parseInt(e.target.value))} />
                </label>
              </div>

              <div className="control-group">
                <h3>Couples Card Clouds</h3>
                <label>
                  Bottom ({viewport}): {viewport === 'mobile' ? couplesCloudBottomMobile : couplesCloudBottom}%
                  <input type="range" min="-150" max="0" step="5" value={viewport === 'mobile' ? couplesCloudBottomMobile : couplesCloudBottom} onChange={(e) => viewport === 'mobile' ? setCouplesCloudBottomMobile(parseInt(e.target.value)) : setCouplesCloudBottom(parseInt(e.target.value))} />
                </label>
                <label>
                  Left ({viewport}): {viewport === 'mobile' ? couplesCloudLeftMobile : couplesCloudLeft}%
                  <input type="range" min="-50" max="50" step="5" value={viewport === 'mobile' ? couplesCloudLeftMobile : couplesCloudLeft} onChange={(e) => viewport === 'mobile' ? setCouplesCloudLeftMobile(parseInt(e.target.value)) : setCouplesCloudLeft(parseInt(e.target.value))} />
                </label>
                <label>
                  Width ({viewport}): {viewport === 'mobile' ? couplesCloudWidthMobile : couplesCloudWidth}%
                  <input type="range" min="100" max="500" step="10" value={viewport === 'mobile' ? couplesCloudWidthMobile : couplesCloudWidth} onChange={(e) => viewport === 'mobile' ? setCouplesCloudWidthMobile(parseInt(e.target.value)) : setCouplesCloudWidth(parseInt(e.target.value))} />
                </label>
              </div>

              <div className="control-group">
                <h3>Grain</h3>
                <label>
                  Opacity: {couplesGrainOpacity}
                  <input type="range" min="0" max="1" step="0.01" value={couplesGrainOpacity} onChange={(e) => setCouplesGrainOpacity(parseFloat(e.target.value))} />
                </label>
                <label>
                  Blend Mode:
                  <select value={couplesGrainBlendMode} onChange={(e) => setCouplesGrainBlendMode(e.target.value)}>
                    <option value="normal">Normal</option>
                    <option value="multiply">Multiply</option>
                    <option value="screen">Screen</option>
                    <option value="overlay">Overlay</option>
                    <option value="soft-light">Soft Light</option>
                    <option value="hard-light">Hard Light</option>
                    <option value="color-dodge">Color Dodge</option>
                    <option value="color-burn">Color Burn</option>
                    <option value="luminosity">Luminosity</option>
                  </select>
                </label>
              </div>
            </div>
          )}
        </aside>

        {/* Preview Panel */}
        <main className={`card-editor__preview card-editor__preview--${viewport}`}>
          <div className="card-editor__preview-label">
            Preview ({viewport === 'mobile' ? '375px' : '1200px'} width)
          </div>

          <div className="card-editor__preview-container">
            {cardType === 'single' ? (
              <div
                className="share-modal__card-wrapper"
                style={{
                  ['--header-size' as any]: `${viewport === 'mobile' ? headerSizeMobile : headerSize}rem`,
                  ['--header-margin-top' as any]: `${viewport === 'mobile' ? headerMarginTopMobile : headerMarginTop}px`,
                  ['--header-margin-bottom' as any]: `${viewport === 'mobile' ? headerMarginBottomMobile : headerMarginBottom}px`,
                  ['--image-size' as any]: `${viewport === 'mobile' ? imageSizeMobile : imageSize}px`,
                  ['--image-margin-top' as any]: `${viewport === 'mobile' ? imageMarginTopMobile : imageMarginTop}px`,
                  ['--body-font-size' as any]: `${viewport === 'mobile' ? bodyFontSizeMobile : bodyFontSize}rem`,
                  ['--body-margin-top' as any]: `${viewport === 'mobile' ? bodyMarginTopMobile : bodyMarginTop}px`,
                  ['--body-margin-bottom' as any]: `${viewport === 'mobile' ? bodyMarginBottomMobile : bodyMarginBottom}px`,
                  ['--stroke-width' as any]: `${viewport === 'mobile' ? strokeWidthMobile : strokeWidth}px`,
                  ['--cloud-bottom' as any]: `${viewport === 'mobile' ? cloudBottomMobile : cloudBottom}%`,
                  ['--cloud-left' as any]: `${viewport === 'mobile' ? cloudLeftMobile : cloudLeft}%`,
                  ['--cloud-width' as any]: `${viewport === 'mobile' ? cloudWidthMobile : cloudWidth}%`,
                  ['--logo-bottom' as any]: `${viewport === 'mobile' ? logoBottomMobile : logoBottom}px`,
                  ['--logo-left' as any]: `${viewport === 'mobile' ? logoLeftMobile : logoLeft}%`,
                  ['--logo-max-width' as any]: `${viewport === 'mobile' ? logoMaxWidthMobile : logoMaxWidth}px`,
                  ['--logo-opacity' as any]: viewport === 'mobile' ? logoOpacityMobile : logoOpacity,
                  ['--card-padding-top' as any]: `${viewport === 'mobile' ? cardPaddingTopMobile : cardPaddingTop}px`,
                  ['--card-padding-bottom' as any]: `${viewport === 'mobile' ? cardPaddingBottomMobile : cardPaddingBottom}px`,
                  ['--card-padding-side' as any]: `${viewport === 'mobile' ? cardPaddingSideMobile : cardPaddingSide}px`,
                  ['--card-min-height' as any]: `${viewport === 'mobile' ? cardMinHeightMobile : cardMinHeight}px`,
                  ['--glow-blur-1' as any]: `${viewport === 'mobile' ? glowBlur1Mobile : glowBlur1}px`,
                  ['--glow-blur-2' as any]: `${viewport === 'mobile' ? glowBlur2Mobile : glowBlur2}px`,
                  ['--glow-color-1' as any]: viewport === 'mobile' ? hexToRgba(glowColor1Mobile, glowOpacity1Mobile) : hexToRgba(glowColor1, glowOpacity1),
                  ['--glow-color-2' as any]: viewport === 'mobile' ? hexToRgba(glowColor2Mobile, glowOpacity2Mobile) : hexToRgba(glowColor2, glowOpacity2),
                  ['--card-gradient' as any]: `linear-gradient(180deg, ${gradientStart} 0%, ${gradientMiddle} 50%, ${gradientEnd} 100%)`,
                  ['--grain-opacity' as any]: grainOpacity,
                  ['--grain-blend-mode' as any]: grainBlendMode,
                }}
              >
                <ResultCard result={sampleResult} variant="large" showShareable hidePairings />
                <div className="share-modal__logo">
                  <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                </div>
              </div>
            ) : (
              <div
                className="share-modal__card-wrapper"
                style={{
                  ['--header-size' as any]: `${viewport === 'mobile' ? couplesHeaderSizeMobile : couplesHeaderSize}rem`,
                  ['--image-size' as any]: `${viewport === 'mobile' ? couplesImageSizeMobile : couplesImageSize}px`,
                  ['--body-font-size' as any]: `${viewport === 'mobile' ? couplesBodyFontSizeMobile : couplesBodyFontSize}rem`,
                  ['--body-margin-top' as any]: `${viewport === 'mobile' ? couplesBodyMarginTopMobile : couplesBodyMarginTop}px`,
                  ['--body-margin-bottom' as any]: `${viewport === 'mobile' ? couplesBodyMarginBottomMobile : couplesBodyMarginBottom}px`,
                  ['--cloud-bottom' as any]: `${viewport === 'mobile' ? couplesCloudBottomMobile : couplesCloudBottom}%`,
                  ['--cloud-left' as any]: `${viewport === 'mobile' ? couplesCloudLeftMobile : couplesCloudLeft}%`,
                  ['--cloud-width' as any]: `${viewport === 'mobile' ? couplesCloudWidthMobile : couplesCloudWidth}%`,
                  ['--grain-opacity' as any]: couplesGrainOpacity,
                  ['--grain-blend-mode' as any]: couplesGrainBlendMode,
                }}
              >
                <CompatibilityCard
                  compatibility={sampleCompatibility}
                  partner1Name="Alex"
                  partner2Name="Sam"
                  shareable
                />
                <div className="share-modal__logo">
                  <img src="/assets/collab-logo.webp" alt="Draft One x Love or Lies" />
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      )}
    </div>
  );
}
