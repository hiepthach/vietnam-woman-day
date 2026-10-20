export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  wrongMessage: string;
}

export interface LoveCoupon {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PhotoItem {
  id: string;
  url: string;
  caption: string;
  date?: string;
}

export interface GiftLetter {
  title: string;
  paragraphs: string[];
  closing: string;
}

export interface AppConfig {
  recipientName: string;
  senderName: string;
  greetingTitle: string;
  greetingSubtitle: string;
  quizQuestions: QuizQuestion[];
  catchFlowersTarget: number;
  giftLetter: GiftLetter;
  coupons: LoveCoupon[];
  photos: PhotoItem[];
  bgmUrl: string;
}

export interface ConfigContextType {
  config: AppConfig;
  updateConfig: (newConfig: Partial<AppConfig>) => void;
  resetConfig: () => void;
  exportConfig: () => string;
  importConfig: (jsonString: string) => boolean;
}
