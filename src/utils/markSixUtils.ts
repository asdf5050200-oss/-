/**
 * Hong Kong Mark Six (六合彩) Core Rules, Utilities & Audio Synthesis
 */
import { BallColor, BallInfo, DrawRecord, WinningCheckResult } from '../types/markSix';

// Official HKJC Ball Color definitions (1-49)
export const RED_BALLS = [1, 2, 7, 8, 12, 13, 18, 19, 23, 24, 29, 30, 34, 35, 40, 45, 46];
export const BLUE_BALLS = [3, 4, 9, 10, 14, 15, 20, 25, 26, 31, 36, 37, 41, 42, 47, 48];
export const GREEN_BALLS = [5, 6, 11, 16, 17, 21, 22, 27, 28, 32, 33, 38, 39, 43, 44, 49];

export function getBallColor(num: number): BallColor {
  if (RED_BALLS.includes(num)) return 'red';
  if (BLUE_BALLS.includes(num)) return 'blue';
  return 'green';
}

// 2026 Lunar Zodiac Mapping (Year of Horse: 01=馬, 02=蛇, 03=龍, 04=兔, 05=虎, 06=牛, 07=鼠, 08=豬, 09=狗, 10=雞, 11=猴, 12=羊...)
const ZODIAC_CYCLE = ['馬', '蛇', '龍', '兔', '虎', '牛', '鼠', '豬', '狗', '雞', '猴', '羊'];

export function getZodiac(num: number): string {
  const index = (num - 1) % 12;
  return ZODIAC_CYCLE[index];
}

// Five Elements (金、木、水、火、土)
export function getElement(num: number): string {
  const elements = ['金', '木', '水', '火', '土'];
  // Traditional five elements assignment cycle
  return elements[(num + 2) % 5];
}

export function getBallInfo(num: number): BallInfo {
  return {
    number: num,
    numberStr: num < 10 ? `0${num}` : `${num}`,
    color: getBallColor(num),
    zodiac: getZodiac(num),
    element: getElement(num),
  };
}

export function formatNumberStr(num: number): string {
  return num < 10 ? `0${num}` : `${num}`;
}

/**
 * Calculates gap/omission (相隔開出期數) for all 49 numbers based on records
 */
export function calculateNumberGaps(records: DrawRecord[]): Record<number, number> {
  const gaps: Record<number, number> = {};
  for (let i = 1; i <= 49; i++) {
    gaps[i] = -1; // -1 means never appeared
  }

  for (let ball = 1; ball <= 49; ball++) {
    let gap = 0;
    let found = false;
    for (let r = 0; r < records.length; r++) {
      const rec = records[r];
      const allNumbers = [...rec.numbers, rec.specialNumber];
      if (allNumbers.includes(ball)) {
        gaps[ball] = gap;
        found = true;
        break;
      }
      gap++;
    }
    if (!found) {
      gaps[ball] = records.length;
    }
  }

  return gaps;
}

/**
 * Combination calculation nCr
 */
export function nCr(n: number, r: number): number {
  if (r < 0 || r > n) return 0;
  if (r === 0 || r === n) return 1;
  let c = 1;
  for (let i = 1; i <= r; i++) {
    c = (c * (n - (r - i))) / i;
  }
  return Math.round(c);
}

/**
 * Multiple bets (複式投注) count
 * Choosing k numbers for standard 6-number draw
 */
export function calculateMultipleBets(totalSelected: number): number {
  if (totalSelected < 6) return 0;
  return nCr(totalSelected, 6);
}

/**
 * Banker-Leg (膽拖) bet count
 * bankers: number of banker balls (1 to 5)
 * legs: number of non-banker balls
 */
export function calculateBankerLegBets(bankersCount: number, legsCount: number): number {
  if (bankersCount < 1 || bankersCount > 5) return 0;
  const neededFromLegs = 6 - bankersCount;
  if (legsCount < neededFromLegs) return 0;
  return nCr(legsCount, neededFromLegs);
}

/**
 * Check a single ticket of 6 numbers against a draw result
 */
export function evaluateTicketAgainstDraw(
  ticketNumbers: number[],
  draw: DrawRecord,
  ticketIndex: number = 0
): WinningCheckResult {
  const matchedRegular = ticketNumbers.filter(num => draw.numbers.includes(num));
  const matchedSpecial = ticketNumbers.includes(draw.specialNumber);
  const regCount = matchedRegular.length;

  let prizeName = '未中獎';
  let prizeTier = 0;
  let rewardAmount = 0;

  if (regCount === 6) {
    prizeName = '頭獎 (1st Prize)';
    prizeTier = 1;
    rewardAmount = draw.prizes.first.amountPerUnit || 8000000;
  } else if (regCount === 5 && matchedSpecial) {
    prizeName = '二獎 (2nd Prize)';
    prizeTier = 2;
    rewardAmount = draw.prizes.second.amountPerUnit || 1500000;
  } else if (regCount === 5) {
    prizeName = '三獎 (3rd Prize)';
    prizeTier = 3;
    rewardAmount = draw.prizes.third.amountPerUnit || 85000;
  } else if (regCount === 4 && matchedSpecial) {
    prizeName = '四獎 (4th Prize)';
    prizeTier = 4;
    rewardAmount = 9600;
  } else if (regCount === 4) {
    prizeName = '五獎 (5th Prize)';
    prizeTier = 5;
    rewardAmount = 640;
  } else if (regCount === 3 && matchedSpecial) {
    prizeName = '六獎 (6th Prize)';
    prizeTier = 6;
    rewardAmount = 320;
  } else if (regCount === 3) {
    prizeName = '七獎 (7th Prize)';
    prizeTier = 7;
    rewardAmount = 40;
  }

  return {
    ticketIndex,
    ticketNumbers,
    matchedNumbers: matchedRegular,
    matchedSpecial,
    prizeName,
    prizeTier,
    rewardAmount,
  };
}

/**
 * Web Audio API synthesizer for realistic ball drop sounds
 */
class SoundEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Realistic metallic chime when a ball drops into the chute
  playBallDrop(isSpecial: boolean = false) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = isSpecial ? 'triangle' : 'sine';
      // Pitch: Higher and celebratory for special number
      const baseFreq = isSpecial ? 880 : 587.33; // A5 vs D5
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq, now + 0.3);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + (isSpecial ? 0.7 : 0.45));

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + (isSpecial ? 0.75 : 0.5));
    } catch {
      // Audio autoplay policy fallback
    }
  }

  playDrumRoll() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.linearRampToValueAtTime(260, now + 0.3);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio fallback
    }
  }
}

export const soundEngine = new SoundEngine();

/**
 * Web Speech API Voice Synthesizer
 * Broadcasts Mark Six draw numbers in Cantonese (zh-HK) or Mandarin (zh-CN)
 * Designed for accessibility & low-vision assistance
 */
export class VoiceBroadcaster {
  private static synth: SpeechSynthesis | null = typeof window !== 'undefined' ? window.speechSynthesis : null;
  public static isMuted: boolean = false;
  public static lang: 'zh-HK' | 'zh-CN' = 'zh-HK';
  public static rate: number = 0.95; // Clear natural broadcast speed

  static speak(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || !this.synth) {
        resolve();
        return;
      }

      this.synth.cancel(); // Stop prior speech

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.lang;
      utterance.rate = this.rate;
      utterance.pitch = 1.05;

      // Try to find native Cantonese voice if available
      const voices = this.synth.getVoices();
      const matchVoice = voices.find(v => 
        this.lang === 'zh-HK' 
          ? (v.lang.includes('HK') || v.lang.includes('yue') || v.name.includes('Hong Kong') || v.name.includes('Cantonese'))
          : (v.lang.includes('CN') || v.lang.includes('zh') || v.name.includes('Mandarin'))
      );

      if (matchVoice) {
        utterance.voice = matchVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();

      this.synth.speak(utterance);
    });
  }

  static announceBall(ballNum: number, orderIndex: number, isSpecial: boolean = false) {
    const info = getBallInfo(ballNum);
    const colorName = info.color === 'red' ? '紅波' : info.color === 'blue' ? '藍波' : '綠波';
    const numFormatted = ballNum.toString();

    let text = '';
    if (isSpecial) {
      if (this.lang === 'zh-HK') {
        text = `特別號碼，${colorName}，${numFormatted}號，生肖${info.zodiac}`;
      } else {
        text = `特别号码，${colorName}，${numFormatted}号，生肖${info.zodiac}`;
      }
    } else {
      if (this.lang === 'zh-HK') {
        text = `第${orderIndex}個攪出號碼，${colorName}，${numFormatted}號，生肖${info.zodiac}`;
      } else {
        text = `第${orderIndex}个摇出号码，${colorName}，${numFormatted}号，生肖${info.zodiac}`;
      }
    }

    this.speak(text);
  }

  static announceFullDraw(draw: DrawRecord) {
    const periodText = `第${draw.period}期開獎結果。`;
    const regBallsText = draw.drawnOrder.map((num, i) => {
      const color = getBallColor(num) === 'red' ? '紅波' : getBallColor(num) === 'blue' ? '藍波' : '綠波';
      return `第${i + 1}個號碼，${color} ${num}號。`;
    }).join(' ');

    const specialColor = getBallColor(draw.specialNumber) === 'red' ? '紅波' : getBallColor(draw.specialNumber) === 'blue' ? '藍波' : '綠波';
    const specialText = `特別號碼，${specialColor} ${draw.specialNumber}號。祝大家六合常中！`;

    this.speak(`${periodText} ${regBallsText} ${specialText}`);
  }
}
