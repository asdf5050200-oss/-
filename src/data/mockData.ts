/**
 * Hong Kong Mark Six (六合彩) High-Fidelity Dataset
 * 100 Recent Historical Records, Full Year Calendar, Blocked Bet Notices, Forum Posts
 */
import { BlockedAnnouncement, CalendarDrawEvent, DrawRecord, ForumPost } from '../types/markSix';

// Deterministic realistic draw generation for 100 historical periods
function generateHistoricalRecords(): DrawRecord[] {
  const records: DrawRecord[] = [];
  const baseDate = new Date(2026, 2, 24); // 2026-03-24

  // Sample seed drawn sequences that mimic authentic HKJC distributions
  const seedDraws = [
    { period: '26/034', date: '2026-03-24', order: [12, 28, 3, 45, 19, 34], special: 7, turnover: 48920150, p1Count: 1, p1Amount: 18250000 },
    { period: '26/033', date: '2026-03-22', order: [8, 14, 23, 31, 39, 42], special: 16, turnover: 39540000, p1Count: 0, p1Amount: 0 },
    { period: '26/032', date: '2026-03-19', order: [5, 11, 20, 27, 36, 48], special: 2, turnover: 41200000, p1Count: 2, p1Amount: 8000000 },
    { period: '26/031', date: '2026-03-17', order: [1, 18, 24, 30, 33, 44], special: 9, turnover: 36700000, p1Count: 1, p1Amount: 12500000 },
    { period: '26/030', date: '2026-03-15', order: [4, 15, 22, 29, 37, 49], special: 13, turnover: 55400000, p1Count: 0, p1Amount: 0, snowball: '春季金多寶' },
    { period: '26/029', date: '2026-03-12', order: [6, 17, 25, 32, 41, 46], special: 38, turnover: 38100000, p1Count: 1, p1Amount: 9340000 },
    { period: '26/028', date: '2026-03-10', order: [2, 10, 21, 26, 35, 43], special: 24, turnover: 37200000, p1Count: 0, p1Amount: 0 },
    { period: '26/027', date: '2026-03-08', order: [7, 13, 19, 28, 40, 47], special: 5, turnover: 42100000, p1Count: 1, p1Amount: 14000000 },
    { period: '26/026', date: '2026-03-05', order: [9, 16, 23, 34, 39, 45], special: 31, turnover: 39800000, p1Count: 2, p1Amount: 8000000 },
    { period: '26/025', date: '2026-03-03', order: [3, 12, 18, 27, 36, 42], special: 14, turnover: 35600000, p1Count: 0, p1Amount: 0 },
  ];

  // Populate first seeds
  seedDraws.forEach((sd, idx) => {
    const sorted = [...sd.order].sort((a, b) => a - b);
    const d = new Date(sd.date);
    const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    records.push({
      period: sd.period,
      drawDate: sd.date,
      dayOfWeek: dayNames[d.getDay()],
      numbers: sorted,
      drawnOrder: sd.order,
      specialNumber: sd.special,
      turnover: sd.turnover,
      snowballName: sd.snowball,
      isSnowball: !!sd.snowball,
      prizes: {
        first: { category: '頭獎', count: sd.p1Count, amountPerUnit: sd.p1Amount },
        second: { category: '二獎', count: sd.p1Count === 0 ? 3 : 1.5, amountPerUnit: 1450000 },
        third: { category: '三獎', count: 85, amountPerUnit: 86400 },
        fourth: { category: '四獎', count: 210, amountPerUnit: 9600 },
        fifth: { category: '五獎', count: 4200, amountPerUnit: 640 },
        sixth: { category: '六獎', count: 6800, amountPerUnit: 320 },
        seventh: { category: '七獎', count: 124000, amountPerUnit: 40 },
      },
      nextDrawDate: '2026-03-26',
      nextJackpotEstimate: sd.p1Count === 0 ? 28000000 : 8000000,
    });
  });

  // Synthesize up to 100 historical periods backwards
  let currentNum = 24;
  let year = 2026;
  let currentDate = new Date(baseDate);
  currentDate.setDate(currentDate.getDate() - 25);

  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];

  // Seeded pseudo-random generator for consistent 100 records
  let seed = 123456789;
  function rnd() {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  }

  while (records.length < 100) {
    if (currentNum <= 0) {
      year -= 1;
      currentNum = 142; // previous year periods
    }
    const periodStr = `${year.toString().slice(2)}/${currentNum < 10 ? `00${currentNum}` : currentNum < 100 ? `0${currentNum}` : currentNum}`;
    
    // Jump 2 or 3 days back (Tue, Thu, Sun schedule)
    currentDate.setDate(currentDate.getDate() - (currentDate.getDay() === 2 ? 2 : currentDate.getDay() === 4 ? 2 : 3));
    const dateStr = currentDate.toISOString().split('T')[0];

    // Pick 7 distinct numbers from 1 to 49
    const pool = Array.from({ length: 49 }, (_, i) => i + 1);
    const drawn: number[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(rnd() * pool.length);
      drawn.push(pool.splice(idx, 1)[0]);
    }

    const regDrawn = drawn.slice(0, 6);
    const special = drawn[6];
    const sorted = [...regDrawn].sort((a, b) => a - b);
    const p1Count = rnd() > 0.65 ? (rnd() > 0.85 ? 2 : 1) : 0;
    const p1Amount = p1Count > 0 ? Math.floor(8000000 + rnd() * 25000000) : 0;

    records.push({
      period: periodStr,
      drawDate: dateStr,
      dayOfWeek: dayNames[currentDate.getDay()],
      numbers: sorted,
      drawnOrder: regDrawn,
      specialNumber: special,
      turnover: Math.floor(35000000 + rnd() * 30000000),
      isSnowball: currentNum % 15 === 0,
      snowballName: currentNum % 15 === 0 ? '節日金多寶' : undefined,
      prizes: {
        first: { category: '頭獎', count: p1Count, amountPerUnit: p1Amount },
        second: { category: '二獎', count: Math.floor(1 + rnd() * 4), amountPerUnit: Math.floor(1000000 + rnd() * 800000) },
        third: { category: '三獎', count: Math.floor(50 + rnd() * 60), amountPerUnit: 86400 },
        fourth: { category: '四獎', count: Math.floor(180 + rnd() * 100), amountPerUnit: 9600 },
        fifth: { category: '五獎', count: Math.floor(3500 + rnd() * 1500), amountPerUnit: 640 },
        sixth: { category: '六獎', count: Math.floor(5500 + rnd() * 2000), amountPerUnit: 320 },
        seventh: { category: '七獎', count: Math.floor(90000 + rnd() * 40000), amountPerUnit: 40 },
      },
      nextDrawDate: '',
      nextJackpotEstimate: p1Count === 0 ? 22000000 : 8000000,
    });

    currentNum--;
  }

  return records;
}

export const MOCK_DRAW_RECORDS: DrawRecord[] = generateHistoricalRecords();

// Full 1-Year Draw Schedule Calendar with Snowball Highlights
export const MOCK_YEARLY_CALENDAR: CalendarDrawEvent[] = [
  { id: 'c1', date: '2026-03-26', period: '26/035', dayOfWeek: '星期四', isSnowball: false, estimatedJackpot: 'HK$ 28,000,000', status: 'upcoming' },
  { id: 'c2', date: '2026-03-29', period: '26/036', dayOfWeek: '星期日', isSnowball: false, estimatedJackpot: 'HK$ 8,000,000', status: 'upcoming' },
  { id: 'c3', date: '2026-03-31', period: '26/037', dayOfWeek: '星期二', isSnowball: false, estimatedJackpot: 'HK$ 8,000,000', status: 'upcoming' },
  { id: 'c4', date: '2026-04-04', period: '26/038', dayOfWeek: '星期六', isSnowball: true, snowballTitle: '復活節金多寶', estimatedJackpot: 'HK$ 80,000,000', status: 'upcoming' },
  { id: 'c5', date: '2026-04-07', period: '26/039', dayOfWeek: '星期二', isSnowball: false, estimatedJackpot: 'HK$ 8,000,000', status: 'upcoming' },
  { id: 'c6', date: '2026-04-09', period: '26/040', dayOfWeek: '星期四', isSnowball: false, estimatedJackpot: 'HK$ 8,000,000', status: 'upcoming' },
  { id: 'c7', date: '2026-04-12', period: '26/041', dayOfWeek: '星期日', isSnowball: false, estimatedJackpot: 'HK$ 8,000,000', status: 'upcoming' },
  { id: 'c8', date: '2026-05-01', period: '26/050', dayOfWeek: '星期五', isSnowball: true, snowballTitle: '勞動節特別攪珠', estimatedJackpot: 'HK$ 50,000,000', status: 'upcoming' },
  { id: 'c9', date: '2026-06-18', period: '26/070', dayOfWeek: '星期四', isSnowball: true, snowballTitle: '端午金多寶', estimatedJackpot: 'HK$ 68,000,000', status: 'upcoming' },
  { id: 'c10', date: '2026-07-28', period: '26/088', dayOfWeek: '星期二', isSnowball: true, snowballTitle: '暑期金多寶', estimatedJackpot: 'HK$ 88,000,000', status: 'upcoming' },
  { id: 'c11', date: '2026-09-24', period: '26/112', dayOfWeek: '星期四', isSnowball: true, snowballTitle: '中秋金多寶', estimatedJackpot: 'HK$ 100,000,000', status: 'upcoming' },
  { id: 'c12', date: '2026-10-29', period: '26/128', dayOfWeek: '星期四', isSnowball: true, snowballTitle: '萬聖節金多寶', estimatedJackpot: 'HK$ 80,000,000', status: 'upcoming' },
  { id: 'c13', date: '2026-12-22', period: '26/150', dayOfWeek: '星期二', isSnowball: true, snowballTitle: '聖誕金多寶', estimatedJackpot: 'HK$ 90,000,000', status: 'upcoming' },
  { id: 'c14', date: '2027-01-02', period: '27/001', dayOfWeek: '星期六', isSnowball: true, snowballTitle: '新年金多寶', estimatedJackpot: 'HK$ 100,000,000', status: 'upcoming' },
  { id: 'c15', date: '2027-02-13', period: '27/018', dayOfWeek: '星期六', isSnowball: true, snowballTitle: '新春金多寶', estimatedJackpot: 'HK$ 118,000,000', status: 'upcoming' },
];

// Blocked bets / 擋牌通知與擋牌單
export const MOCK_BLOCKED_NOTICES: BlockedAnnouncement[] = [
  {
    id: 'block-26-035',
    period: '第 26/035 期',
    title: '【緊急通知】最新擋牌單及熱門受限號碼發佈',
    releaseTime: '2026-03-24 18:30',
    isUrgent: true,
    announcementText: '因應市場大量湧入單一號碼及版路熱門牌支，下列號碼已達風控限額，部分投注站或受限受注，敬請留意及提早安排。',
    items: [
      { id: 'b1', number: 7, type: '特別號碼', limitAmount: '500,000 額滿', reason: '版路連開熱門，大額下注飽和', status: '已封牌', updatedAt: '18:15' },
      { id: 'b2', number: 18, type: '正碼', limitAmount: '剩餘 15% 額度', reason: '波色紅波連線焦點', status: '額滿預警', updatedAt: '18:22' },
      { id: 'b3', number: 24, type: '特別號碼', limitAmount: '剩餘 20% 額度', reason: '生肖馬年本命特碼投注倍增', status: '額滿預警', updatedAt: '18:28' },
      { id: 'b4', number: 49, type: '全彩', limitAmount: '正常', reason: '尾數9防守號碼', status: '正常受注', updatedAt: '18:00' },
      { id: 'b5', number: 12, type: '二字特', limitAmount: '已達單注上限', reason: '前兩期落球大熱重現', status: '已封牌', updatedAt: '17:50' },
    ],
  },
  {
    id: 'block-26-034',
    period: '第 26/034 期',
    title: '上期擋牌清單歷史存檔 (已結算)',
    releaseTime: '2026-03-22 17:00',
    isUrgent: false,
    announcementText: '第 26/034 期攪珠受限號碼歷史留底核查。',
    items: [
      { id: 'b11', number: 3, type: '正碼', limitAmount: '額滿', reason: '藍波前鋒熱度過高', status: '已封牌', updatedAt: '17:00' },
      { id: 'b12', number: 28, type: '特別號碼', limitAmount: '額滿', reason: '綠波雙數主力注碼', status: '已封牌', updatedAt: '17:30' },
    ],
  },
];

// Multiplier table data (7 to 16 balls for multiple bets)
export const MULTIPLE_BET_TIERS = [
  { balls: 7, bets: 7, costFull: 70, costHalf: 35 },
  { balls: 8, bets: 28, costFull: 280, costHalf: 140 },
  { balls: 9, bets: 84, costFull: 840, costHalf: 420 },
  { balls: 10, bets: 210, costFull: 2100, costHalf: 1050 },
  { balls: 11, bets: 462, costFull: 4620, costHalf: 2310 },
  { balls: 12, bets: 924, costFull: 9240, costHalf: 4620 },
  { balls: 13, bets: 1716, costFull: 17160, costHalf: 8580 },
  { balls: 14, bets: 3003, costFull: 30030, costHalf: 15015 },
  { balls: 15, bets: 5005, costFull: 50050, costHalf: 25025 },
  { balls: 16, bets: 8008, costFull: 80080, costHalf: 40040 },
];

// Technical discussions & pattern sharing (版路與牌支)
export const MOCK_FORUM_POSTS: ForumPost[] = [
  {
    id: 'post-1',
    author: '九龍精準老伯',
    authorBadge: '5星鑽石版主',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=kln_master',
    title: '【金牌版路】第26/035期 雙龍吐珠 拖尾數4、8必出牌支！',
    content: '觀察過去十期開獎走勢，紅波大號相隔三期必有落球！本期特碼鎖定紅波 18、24，正碼配合尾數 04、14、28 走勢穩健。歡迎各位六合常友一同交流，祝今期齊齊中頭獎！',
    patternType: '尾數拖牌',
    recommendedPicks: [4, 14, 18, 24, 28, 35],
    specialPicks: [18, 24],
    likes: 142,
    commentsCount: 38,
    createdAt: '10分鐘前',
    comments: [
      { id: 'c1', author: '油麻地波友', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=yau_ma_tei', text: '師兄好準！上期跟你拖尾數中了五獎，今期繼續跟足！', time: '8分鐘前' },
      { id: 'c2', author: '天天贏錢', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=winner88', text: '請問18號今天擋牌單有提示額滿預警，會不會影響開出？', time: '5分鐘前' },
    ],
  },
  {
    id: 'post-2',
    author: '生肖密碼研判所',
    authorBadge: '特碼分析師',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=zodiac_code',
    title: '【生肖相生】馬年春季火生土局，特別號碼精選兩支！',
    content: '今年歲次丙午，火運旺盛。近期馬、蛇生肖落球頻率顯著抬頭，特別號碼看好 01 (馬) 與 07 (鼠) 衝煞出奇特碼。大家可以用小鍵盤核對相隔遺漏期數，07已漏了8期，隨時大爆發！',
    patternType: '特碼分析',
    recommendedPicks: [1, 7, 13, 25, 37, 49],
    specialPicks: [1, 7],
    likes: 98,
    commentsCount: 19,
    createdAt: '35分鐘前',
    comments: [
      { id: 'c3', author: '葵涌阿明', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ming_kc', text: '07號很熱，我已經在小鍵盤加入核對了！', time: '20分鐘前' },
    ],
  },
  {
    id: 'post-3',
    author: '波色五行大師',
    authorBadge: '版路先鋒',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=five_elements',
    title: '【波色走勢】綠波強勢回歸，推薦 05、11、27 鐵膽連線',
    content: '連開3期紅波偏多後，綠波機率按均值回歸必然反彈。今期推介綠波三膽：05、11、27，配合藍波 09、15 互補，防冷碼 43。',
    patternType: '波色五行',
    recommendedPicks: [5, 9, 11, 15, 27, 43],
    specialPicks: [11],
    likes: 76,
    commentsCount: 14,
    createdAt: '2小時前',
    comments: [],
  },
];
