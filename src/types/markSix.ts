/**
 * Hong Kong Mark Six (六合彩) Types & Interfaces
 */

export type BallColor = 'red' | 'blue' | 'green';

export interface BallInfo {
  number: number;
  numberStr: string; // "01", "02", etc.
  color: BallColor;
  zodiac: string;
  element: string; // 金木水火土
}

export interface DrawPrizeTier {
  category: string;
  count: number;
  amountPerUnit: number;
}

export interface DrawRecord {
  period: string; // e.g., "26/032"
  drawDate: string; // e.g., "2026-03-24"
  dayOfWeek: string; // e.g., "星期二"
  // 6 regular numbers sorted
  numbers: number[];
  // 6 regular numbers in order of ball drop
  drawnOrder: number[];
  // 1 special number
  specialNumber: number;
  turnover: number; // 投注額
  snowballName?: string; // 金多寶名稱
  isSnowball?: boolean;
  prizes: {
    first: DrawPrizeTier;
    second: DrawPrizeTier;
    third: DrawPrizeTier;
    fourth: DrawPrizeTier;
    fifth: DrawPrizeTier;
    sixth: DrawPrizeTier;
    seventh: DrawPrizeTier;
  };
  nextDrawDate: string;
  nextJackpotEstimate: number; // 下期估計多寶
}

export interface BlockedBetItem {
  id: string;
  number: number;
  type: '特別號碼' | '正碼' | '二字特' | '全彩';
  limitAmount: string;
  reason: string;
  status: '已封牌' | '額滿預警' | '正常受注';
  updatedAt: string;
}

export interface BlockedAnnouncement {
  id: string;
  period: string;
  title: string;
  releaseTime: string;
  items: BlockedBetItem[];
  announcementText: string;
  isUrgent: boolean;
}

export interface CalendarDrawEvent {
  id: string;
  date: string;
  period: string;
  dayOfWeek: string;
  isSnowball: boolean;
  snowballTitle?: string;
  estimatedJackpot: string;
  status: 'upcoming' | 'drawing' | 'completed';
}

export interface ForumPost {
  id: string;
  author: string;
  authorBadge?: string;
  avatar: string;
  title: string;
  content: string;
  patternType: '特碼分析' | '波色五行' | '尾數拖牌' | '九宮連號' | '綜合心水';
  recommendedPicks: number[];
  specialPicks?: number[];
  likes: number;
  commentsCount: number;
  comments: {
    id: string;
    author: string;
    avatar: string;
    text: string;
    time: string;
  }[];
  createdAt: string;
}

export interface WinningCheckResult {
  ticketIndex: number;
  ticketNumbers: number[];
  matchedNumbers: number[];
  matchedSpecial: boolean;
  prizeName: string;
  prizeTier: number; // 1 to 7, or 0 for none
  rewardAmount: number;
}

export interface StreamSource {
  id: string;
  name: string;
  url: string;
  type: 'm3u8' | 'iframe' | 'mp4';
  enabled: boolean;
  status?: 'unknown' | 'online' | 'offline' | 'checking';
  latencyMs?: number;
  lastChecked?: string;
  isPreset?: boolean;
}

export interface ApiConfiguration {
  endpointUrl: string;
  apiKey: string;
  streamUrl: string; // Live video stream (.m3u8, .mp4, or embed URL)
  streamType: 'auto' | 'm3u8' | 'mp4' | 'iframe';
  streamSources?: StreamSource[]; // List of all configured streams
  activeStreamId?: string; // Currently active stream id
  enableLivePolling: boolean;
  pollingIntervalSeconds: number;
  dataSourceMode: 'builtin' | 'custom_api';
  lastSyncTime?: string;
}

