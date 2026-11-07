/**
 * Historical Query & Trend Statistical Charts (歷史開獎查詢與走勢圖分析)
 * 
 * Requirement:
 * 前端到时候我接入api 并加上历史开奖查询与统计走势图功能
 * 
 * Features:
 * 1. 1-49 號碼分佈走勢圖 (Corridor Matrix)
 * 2. 冷熱號碼統計榜 (Hot & Cold Rankings)
 * 3. 波色紅藍綠出號分佈 (Color Wave Breakdown)
 * 4. 十二生肖特碼分佈 (Zodiac Distribution)
 * 5. 和值與大小單雙走勢 (Sum & Odd/Even Analytics)
 * 6. 專項號碼歷史查詢器 (Number Deep Search)
 */
import React, { useState, useMemo } from 'react';
import { TrendingUp, Flame, Snowflake, PieChart, BarChart3, Search, Calendar, Award } from 'lucide-react';
import { DrawRecord } from '../types/markSix';
import { getBallColor, getElement, getZodiac } from '../utils/markSixUtils';
import { MarkSixBall } from './MarkSixBall';

interface TrendChartsProps {
  records: DrawRecord[];
}

export const TrendCharts: React.FC<TrendChartsProps> = ({ records }) => {
  const [activeChartTab, setActiveChartTab] = useState<'matrix' | 'hotcold' | 'colorZodiac' | 'sumTrend' | 'query'>('matrix');
  const [queryBall, setQueryBall] = useState<number>(7);
  const [matrixPeriodsCount, setMatrixPeriodsCount] = useState<number>(15);

  // Compute frequencies for all 49 numbers across the loaded records
  const statistics = useMemo(() => {
    const freqs: Record<number, { count: number; specialCount: number; color: string; zodiac: string }> = {};
    const colorCounts = { red: 0, blue: 0, green: 0 };
    const zodiacCounts: Record<string, number> = {};

    for (let i = 1; i <= 49; i++) {
      freqs[i] = {
        count: 0,
        specialCount: 0,
        color: getBallColor(i),
        zodiac: getZodiac(i),
      };
    }

    records.forEach((r) => {
      r.numbers.forEach((n) => {
        if (freqs[n]) freqs[n].count++;
        const c = getBallColor(n);
        colorCounts[c]++;
        const z = getZodiac(n);
        zodiacCounts[z] = (zodiacCounts[z] || 0) + 1;
      });

      if (freqs[r.specialNumber]) {
        freqs[r.specialNumber].specialCount++;
        const c = getBallColor(r.specialNumber);
        colorCounts[c]++;
        const z = getZodiac(r.specialNumber);
        zodiacCounts[z] = (zodiacCounts[z] || 0) + 1;
      }
    });

    // Sort hot and cold
    const sortedByFreq = Object.entries(freqs)
      .map(([num, data]) => ({ num: parseInt(num, 10), ...data }))
      .sort((a, b) => (b.count + b.specialCount) - (a.count + a.specialCount));

    const hot10 = sortedByFreq.slice(0, 10);
    const cold10 = [...sortedByFreq].reverse().slice(0, 10);

    return { freqs, colorCounts, zodiacCounts, hot10, cold10 };
  }, [records]);

  // Deep query results for queryBall
  const queryHistory = useMemo(() => {
    return records.filter(r => r.numbers.includes(queryBall) || r.specialNumber === queryBall);
  }, [records, queryBall]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span className="text-base font-bold text-white tracking-tight">歷史走勢圖與統計分析</span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            基於近 100 期開獎大數據，提供號碼矩陣走勢、冷熱排行、波色生肖分佈與和值圖表。
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-3">
        {[
          { id: 'matrix', label: '1-49 號碼分佈矩陣', icon: BarChart3 },
          { id: 'hotcold', label: '冷熱號碼排行', icon: Flame },
          { id: 'colorZodiac', label: '波色與生肖走勢', icon: PieChart },
          { id: 'sumTrend', label: '和值與大小單雙', icon: TrendingUp },
          { id: 'query', label: '號碼歷史深度查詢', icon: Search },
        ].map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveChartTab(t.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
                activeChartTab === t.id
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: Number Distribution Matrix */}
      {activeChartTab === 'matrix' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>橫坐標：1 至 49 號碼 | 縱坐標：近期攪珠期數</span>
            <div className="flex items-center gap-1">
              <span>檢視最近：</span>
              <button
                type="button"
                onClick={() => setMatrixPeriodsCount(15)}
                className={`px-2 py-0.5 rounded text-[11px] ${matrixPeriodsCount === 15 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800'}`}
              >
                15期
              </button>
              <button
                type="button"
                onClick={() => setMatrixPeriodsCount(30)}
                className={`px-2 py-0.5 rounded text-[11px] ${matrixPeriodsCount === 30 ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800'}`}
              >
                30期
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <div className="min-w-[920px] p-2">
              {/* Header numbers 1-49 */}
              <div className="flex items-center border-b border-slate-800 pb-1 text-[10px] font-mono font-bold text-slate-400">
                <div className="w-16 shrink-0 text-center text-slate-500">期數</div>
                <div className="grid grid-cols-49 flex-1 gap-0.5 text-center">
                  {Array.from({ length: 49 }, (_, idx) => (
                    <span key={idx} className="w-4 text-center">
                      {idx + 1}
                    </span>
                  ))}
                </div>
              </div>

              {/* Matrix Rows */}
              <div className="divide-y divide-slate-900">
                {records.slice(0, matrixPeriodsCount).map((rec) => (
                  <div key={rec.period} className="flex items-center py-1 hover:bg-slate-900/40">
                    <div className="w-16 shrink-0 text-[10px] font-mono text-amber-400/90 font-semibold text-center">
                      {rec.period}
                    </div>
                    <div className="grid grid-cols-49 flex-1 gap-0.5">
                      {Array.from({ length: 49 }, (_, idx) => {
                        const num = idx + 1;
                        const isReg = rec.numbers.includes(num);
                        const isSpecial = rec.specialNumber === num;
                        const color = getBallColor(num);

                        if (isSpecial) {
                          return (
                            <div key={idx} className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[9px] font-extrabold flex items-center justify-center shadow-sm">
                              {num}
                            </div>
                          );
                        }

                        if (isReg) {
                          return (
                            <div key={idx} className="w-4 h-4 rounded-full bg-[#176FC1] text-white text-[9px] font-bold flex items-center justify-center shadow-sm">
                              {num}
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="w-4 h-4 rounded-full bg-slate-900/40 flex items-center justify-center text-[9px] text-slate-700">
                            ·
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#176FC1]" /> 正碼 (科技藍)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#D6B875]" /> 特別號碼 (香檳金)</span>
          </div>
        </div>
      )}

      {/* TAB 2: Hot & Cold Numbers */}
      {activeChartTab === 'hotcold' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top 10 Hot Numbers */}
          <div className="p-4 bg-slate-950 rounded-xl border border-[#176FC1]/30 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[#D6B875]" />
              <span className="text-xs font-bold text-[#D6B875]">熱門號碼 TOP 10 (近100期開出最頻密)</span>
            </div>
            <div className="space-y-2">
              {statistics.hot10.map((item, idx) => {
                const total = item.count + item.specialCount;
                const percent = Math.round((total / records.length) * 100);
                return (
                  <div key={item.num} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-slate-500 font-mono text-[10px]">{idx + 1}.</span>
                      <MarkSixBall number={item.num} size="xs" />
                      <span className="text-slate-300 font-medium">生肖{item.zodiac}</span>
                    </div>
                    <div className="flex items-center gap-2 w-36">
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-[#D6B875] to-[#176FC1] h-full rounded-full" style={{ width: `${Math.min(100, percent * 3.5)}%` }} />
                      </div>
                      <span className="font-mono text-amber-400 font-bold text-[11px] w-12 text-right">
                        {total}次 ({percent}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 10 Cold Numbers */}
          <div className="p-4 bg-slate-950 rounded-xl border border-sky-950/60 shadow-lg">
            <div className="flex items-center gap-2 mb-3">
              <Snowflake className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold text-sky-300">冷門號碼 TOP 10 (近100期出號最少)</span>
            </div>
            <div className="space-y-2">
              {statistics.cold10.map((item, idx) => {
                const total = item.count + item.specialCount;
                const percent = Math.round((total / records.length) * 100);
                return (
                  <div key={item.num} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-slate-500 font-mono text-[10px]">{idx + 1}.</span>
                      <MarkSixBall number={item.num} size="xs" />
                      <span className="text-slate-300 font-medium">生肖{item.zodiac}</span>
                    </div>
                    <div className="flex items-center gap-2 w-36">
                      <div className="flex-1 bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div className="bg-sky-500/60 h-full rounded-full" style={{ width: `${Math.max(10, percent * 3.5)}%` }} />
                      </div>
                      <span className="font-mono text-sky-300 font-bold text-[11px] w-12 text-right">
                        {total}次 ({percent}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Color Wave & Zodiac Distribution */}
      {activeChartTab === 'colorZodiac' && (
        <div className="space-y-4">
          {/* Color Wave Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-3">波色比例出號分佈 (紅、藍、綠)</span>
            {(() => {
              const total = statistics.colorCounts.red + statistics.colorCounts.blue + statistics.colorCounts.green || 1;
              const redPct = Math.round((statistics.colorCounts.red / total) * 100);
              const bluePct = Math.round((statistics.colorCounts.blue / total) * 100);
              const greenPct = 100 - redPct - bluePct;
              return (
                <div>
                  <div className="h-5 rounded-lg flex overflow-hidden shadow-inner">
                    <div style={{ width: `${redPct}%` }} className="bg-[#172B50] flex items-center justify-center text-[10px] text-white font-bold">
                      海藍 {redPct}%
                    </div>
                    <div style={{ width: `${bluePct}%` }} className="bg-[#176FC1] flex items-center justify-center text-[10px] text-white font-bold">
                      科技藍 {bluePct}%
                    </div>
                    <div style={{ width: `${greenPct}%` }} className="bg-[#168B65] flex items-center justify-center text-[10px] text-white font-bold">
                      翠綠 {greenPct}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="p-2 bg-[#172B50]/40 rounded-lg border border-[#172B50]">
                      <span className="text-[#C8D3E6] font-bold block">海藍波 (17顆)</span>
                      <span className="font-mono text-white text-sm font-bold">{statistics.colorCounts.red} 次</span>
                    </div>
                    <div className="p-2 bg-[#176FC1]/20 rounded-lg border border-[#176FC1]/40">
                      <span className="text-[#84BCF0] font-bold block">科技藍 (16顆)</span>
                      <span className="font-mono text-white text-sm font-bold">{statistics.colorCounts.blue} 次</span>
                    </div>
                    <div className="p-2 bg-emerald-950/40 rounded-lg border border-emerald-900/40">
                      <span className="text-emerald-400 font-bold block">翠綠波 (16顆)</span>
                      <span className="font-mono text-white text-sm font-bold">{statistics.colorCounts.green} 次</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Zodiac Breakdown */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-3">十二生肖出球次數排行</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {['馬', '蛇', '龍', '兔', '虎', '牛', '鼠', '豬', '狗', '雞', '猴', '羊'].map((z) => {
                const cnt = statistics.zodiacCounts[z] || 0;
                return (
                  <div key={z} className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-center">
                    <span className="text-amber-400 font-bold text-sm block">生肖 {z}</span>
                    <span className="text-[11px] font-mono text-slate-300 mt-0.5 block">{cnt} 次攪出</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Sum & Odd/Even Trend */}
      {activeChartTab === 'sumTrend' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-300">近期開獎總和值走勢 (和值基準線 150)</span>
              <span className="text-slate-500 font-mono">近 20 期</span>
            </div>

            {/* Visual Bar Chart of Sum values */}
            <div className="h-44 flex items-end gap-1.5 pt-4 border-b border-slate-800">
              {records.slice(0, 20).reverse().map((r) => {
                const sum = r.numbers.reduce((a, b) => a + b, 0);
                const heightPct = Math.min(100, Math.max(15, (sum / 230) * 100));
                const isOver150 = sum >= 150;

                return (
                  <div key={r.period} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {sum}
                    </span>
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        isOver150 ? 'bg-amber-500 hover:bg-amber-400' : 'bg-sky-500 hover:bg-sky-400'
                      }`}
                    />
                    <span className="text-[8px] font-mono text-slate-500 mt-1 truncate">
                      {r.period.split('/')[1]}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded" /> 大和值 (≥150)</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-sky-500 rounded" /> 小和值 (&lt;150)</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: Deep Query Tool for Specific Number */}
      {activeChartTab === 'query' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-xs font-bold text-slate-300 block mb-2">
              請點選要查詢的號碼 (1-49):
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {Array.from({ length: 49 }, (_, idx) => {
                const n = idx + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQueryBall(n)}
                    className={`shrink-0 w-8 h-8 rounded-full font-mono text-xs font-bold transition-all ${
                      queryBall === n
                        ? 'bg-amber-500 text-slate-950 scale-110 shadow-lg ring-2 ring-white'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {n < 10 ? `0${n}` : n}
                  </button>
                );
              })}
            </div>

            {/* Query Summary Card */}
            <div className="mt-4 p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <MarkSixBall number={queryBall} size="lg" showMeta={true} />
                <div>
                  <div className="text-sm font-bold text-white">
                    號碼 {queryBall < 10 ? `0${queryBall}` : queryBall} 號歷史透視
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    波色：{getBallColor(queryBall) === 'red' ? '紅波' : getBallColor(queryBall) === 'blue' ? '藍波' : '綠波'} · 生肖：{getZodiac(queryBall)} · 五行：{getElement(queryBall)}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block">近100期開出次數</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  {queryHistory.length} 次
                </span>
              </div>
            </div>

            {/* List of Periods where this ball was drawn */}
            <div className="mt-4">
              <span className="text-xs font-bold text-slate-400 block mb-2">歷史命中該號碼的期數明細：</span>
              <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1 text-xs">
                {queryHistory.map((rec) => {
                  const isSpecial = rec.specialNumber === queryBall;
                  return (
                    <div
                      key={rec.period}
                      className="p-2.5 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-400">第 {rec.period} 期</span>
                        <span className="text-slate-400 text-[11px]">{rec.drawDate}</span>
                        {isSpecial ? (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500 text-slate-950 font-bold">
                            特別號碼
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                            正碼
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {rec.numbers.map(n => n < 10 ? `0${n}` : n).join(', ')} + [{rec.specialNumber}]
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
