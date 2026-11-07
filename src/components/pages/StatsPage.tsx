/**
 * 04 数据统计 Statistics - Ultra Clean Cinema Edition
 */
import React, { useState, useMemo } from 'react';
import { Flame, Snowflake, TrendingUp, PieChart, BarChart3, Search, Award } from 'lucide-react';
import { DrawRecord } from '../../types/markSix';
import { getBallColor, getElement, getZodiac } from '../../utils/markSixUtils';
import { MarkSixBall } from '../MarkSixBall';
import { NumberHeatmap } from '../NumberHeatmap';

interface StatsPageProps {
  records: DrawRecord[];
}

export const StatsPage: React.FC<StatsPageProps> = ({ records }) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'hotcold' | 'matrix' | 'colorZodiac' | 'sumTrend' | 'query'>('heatmap');
  const [queryBall, setQueryBall] = useState<number>(7);
  const [matrixCount, setMatrixCount] = useState<number>(15);

  const stats = useMemo(() => {
    const freqs: Record<number, { count: number; specialCount: number; color: string; zodiac: string; lastSeen: number }> = {};
    const colorCounts = { red: 0, blue: 0, green: 0 };
    const zodiacCounts: Record<string, number> = {};

    for (let i = 1; i <= 49; i++) {
      freqs[i] = {
        count: 0,
        specialCount: 0,
        color: getBallColor(i),
        zodiac: getZodiac(i),
        lastSeen: -1,
      };
    }

    records.forEach((r, rIdx) => {
      r.numbers.forEach((n) => {
        if (freqs[n]) {
          freqs[n].count++;
          if (freqs[n].lastSeen === -1) freqs[n].lastSeen = rIdx;
        }
        const c = getBallColor(n);
        colorCounts[c]++;
        const z = getZodiac(n);
        zodiacCounts[z] = (zodiacCounts[z] || 0) + 1;
      });

      if (freqs[r.specialNumber]) {
        freqs[r.specialNumber].specialCount++;
        if (freqs[r.specialNumber].lastSeen === -1) freqs[r.specialNumber].lastSeen = rIdx;
        const c = getBallColor(r.specialNumber);
        colorCounts[c]++;
        const z = getZodiac(r.specialNumber);
        zodiacCounts[z] = (zodiacCounts[z] || 0) + 1;
      }
    });

    const sorted = Object.entries(freqs)
      .map(([num, data]) => ({ num: parseInt(num, 10), ...data }))
      .sort((a, b) => (b.count + b.specialCount) - (a.count + a.specialCount));

    return {
      freqs,
      colorCounts,
      zodiacCounts,
      hot10: sorted.slice(0, 10),
      cold10: [...sorted].reverse().slice(0, 10),
    };
  }, [records]);

  const queryHistory = useMemo(() => {
    return records.filter(r => r.numbers.includes(queryBall) || r.specialNumber === queryBall);
  }, [records, queryBall]);

  return (
    <div className="space-y-3.5">
      {/* Top Tabs */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-3 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'heatmap', label: '100期热力图', icon: Flame },
            { id: 'hotcold', label: '冷热榜', icon: Award },
            { id: 'matrix', label: '走势矩阵', icon: BarChart3 },
            { id: 'colorZodiac', label: '波色生肖', icon: PieChart },
            { id: 'sumTrend', label: '和值趋势', icon: TrendingUp },
            { id: 'query', label: '查号', icon: Search },
          ].map((t) => {
            const Icon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#176FC1] text-white font-bold shadow-xs'
                    : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A] border border-[#E5E9F0]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 0: 100期频率热力图 */}
      {activeTab === 'heatmap' && (
        <NumberHeatmap
          records={records}
          onSelectBall={(num) => {
            setQueryBall(num);
          }}
        />
      )}

      {/* Tab 1: 冷热榜 */}
      {activeTab === 'hotcold' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Top 10 Hot */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-[#D6B875]" />
              <span className="text-xs font-bold text-[#25334A]">
                最热号码 (TOP 10)
              </span>
            </div>
            <div className="space-y-2">
              {stats.hot10.map((item, idx) => {
                const total = item.count + item.specialCount;
                const pct = Math.round((total / records.length) * 100);
                return (
                  <div key={item.num} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-[#52627A] font-mono text-[10px]">{idx + 1}.</span>
                      <MarkSixBall number={item.num} size="xs" />
                      <span className="text-[#52627A] text-[11px]">{item.zodiac}</span>
                    </div>
                    <div className="flex items-center gap-2 w-32 sm:w-40">
                      <div className="flex-1 bg-[#F4F6FA] border border-[#E5E9F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#176FC1] h-full rounded-full"
                          style={{ width: `${Math.min(100, pct * 3.5)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#25334A] font-bold text-[11px] w-14 text-right">
                        {total}次 ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 10 Cold */}
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Snowflake className="w-4 h-4 text-[#176FC1]" />
              <span className="text-xs font-bold text-[#25334A]">
                冷门号码 (TOP 10)
              </span>
            </div>
            <div className="space-y-2">
              {stats.cold10.map((item, idx) => {
                const total = item.count + item.specialCount;
                const pct = Math.round((total / records.length) * 100);
                return (
                  <div key={item.num} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-4 text-[#52627A] font-mono text-[10px]">{idx + 1}.</span>
                      <MarkSixBall number={item.num} size="xs" />
                      <span className="text-[#52627A] text-[11px]">漏 {item.lastSeen >= 0 ? item.lastSeen : 100} 期</span>
                    </div>
                    <div className="flex items-center gap-2 w-32 sm:w-40">
                      <div className="flex-1 bg-[#F4F6FA] border border-[#E5E9F0] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#172B50] h-full rounded-full"
                          style={{ width: `${Math.max(8, pct * 3.5)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[#52627A] font-bold text-[11px] w-14 text-right">
                        {total}次 ({pct}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick link banner to full Heatmap */}
          <div className="md:col-span-2">
            <button
              type="button"
              onClick={() => setActiveTab('heatmap')}
              className="w-full p-3.5 rounded-2xl bg-white border border-[#E5E9F0] hover:border-[#176FC1] shadow-xs transition-all flex items-center justify-between text-xs cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#176FC1]" />
                <span className="font-bold text-[#25334A]">
                  查看最新 100 期出球频率热力图（1-49 号码深浅蓝阶全景）
                </span>
              </div>
              <span className="text-[#176FC1] font-bold group-hover:translate-x-1 transition-transform">
                进入热力图 →
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: 走势矩阵 */}
      {activeTab === 'matrix' && (
        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between text-xs text-[#8994A6]">
            <span>1 至 49 号码分布走廊</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setMatrixCount(15)}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${matrixCount === 15 ? 'bg-[#176FC1] text-white font-bold' : 'bg-[#E9EEF5] text-[#52627A]'}`}
              >
                15期
              </button>
              <button
                type="button"
                onClick={() => setMatrixCount(30)}
                className={`px-2 py-0.5 rounded text-[11px] cursor-pointer ${matrixCount === 30 ? 'bg-[#176FC1] text-white font-bold' : 'bg-[#E9EEF5] text-[#52627A]'}`}
              >
                30期
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-[#E5E9F0] bg-[#F4F6FA] p-2">
            <div className="min-w-[900px]">
              <div className="flex items-center border-b border-[#E5E9F0] pb-1.5 text-[10px] font-mono font-bold text-[#8994A6]">
                <div className="w-16 shrink-0 text-center">期数</div>
                <div className="grid grid-cols-49 flex-1 gap-0.5 text-center">
                  {Array.from({ length: 49 }, (_, idx) => (
                    <span key={idx} className="w-4 text-center">
                      {idx + 1}
                    </span>
                  ))}
                </div>
              </div>

              <div className="divide-y divide-[#E5E9F0]">
                {records.slice(0, matrixCount).map((rec) => (
                  <div key={rec.period} className="flex items-center py-1 hover:bg-white transition-colors">
                    <div className="w-16 shrink-0 text-[10px] font-mono text-[#25334A] font-semibold text-center">
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
                            <div key={idx} className="w-4 h-4 rounded-full bg-[#D6B875] text-[#101D3A] text-[9px] font-black flex items-center justify-center shadow-xs">
                              {num}
                            </div>
                          );
                        }

                        if (isReg) {
                          return (
                            <div key={idx} className="w-4 h-4 rounded-full bg-[#176FC1] text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                              {num}
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="w-4 h-4 rounded-full bg-transparent flex items-center justify-center text-[9px] text-[#AAB5C8]">
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
        </div>
      )}

      {/* Tab 3: 波色生肖 */}
      {activeTab === 'colorZodiac' && (
        <div className="space-y-3">
          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
            <span className="text-xs font-bold text-[#25334A] block mb-3">波色出球比例</span>
            {(() => {
              const total = stats.colorCounts.red + stats.colorCounts.blue + stats.colorCounts.green || 1;
              const redPct = Math.round((stats.colorCounts.red / total) * 100);
              const bluePct = Math.round((stats.colorCounts.blue / total) * 100);
              const greenPct = 100 - redPct - bluePct;
              return (
                <div>
                  <div className="h-5 rounded-xl flex overflow-hidden border border-[#E5E9F0]">
                    <div style={{ width: `${redPct}%` }} className="bg-[#172B50] flex items-center justify-center text-[10px] text-white font-bold">
                      海蓝波 {redPct}%
                    </div>
                    <div style={{ width: `${bluePct}%` }} className="bg-[#176FC1] flex items-center justify-center text-[10px] text-white font-bold">
                      科技蓝 {bluePct}%
                    </div>
                    <div style={{ width: `${greenPct}%` }} className="bg-[#168B65] flex items-center justify-center text-[10px] text-white font-bold">
                      翠绿波 {greenPct}%
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mt-3 text-center text-xs">
                    <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#172B50] font-bold block">海蓝波</span>
                      <span className="font-mono text-[#25334A] font-bold">{stats.colorCounts.red} 次</span>
                    </div>
                    <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#176FC1] font-bold block">科技蓝</span>
                      <span className="font-mono text-[#25334A] font-bold">{stats.colorCounts.blue} 次</span>
                    </div>
                    <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#168B65] font-bold block">翠绿波</span>
                      <span className="font-mono text-[#25334A] font-bold">{stats.colorCounts.green} 次</span>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
            <span className="text-xs font-bold text-[#25334A] block mb-3">十二生肖频次</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-xs">
              {['马', '蛇', '龙', '兔', '虎', '牛', '鼠', '猪', '狗', '鸡', '猴', '羊'].map((z) => (
                <div key={z} className="p-2 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] text-center">
                  <span className="text-[#25334A] font-bold block">{z}</span>
                  <span className="text-[11px] font-mono text-[#52627A] mt-0.5 block">{stats.zodiacCounts[z] || 0} 次</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: 和值走势 */}
      {activeTab === 'sumTrend' && (
        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[#25334A]">近 20 期和值走势</span>
            <span className="text-[#52627A] font-mono">基准 150</span>
          </div>

          <div className="h-40 flex items-end gap-1.5 pt-4 border-b border-[#E5E9F0]">
            {records.slice(0, 20).reverse().map((r) => {
              const sum = r.numbers.reduce((a, b) => a + b, 0);
              const heightPct = Math.min(100, Math.max(15, (sum / 230) * 100));
              const isOver150 = sum >= 150;

              return (
                <div key={r.period} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <span className="text-[9px] font-mono text-[#52627A] opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                    {sum}
                  </span>
                  <div
                    style={{ height: `${heightPct}%` }}
                    className={`w-full rounded-t transition-all ${
                      isOver150 ? 'bg-[#101D3A] hover:bg-[#172B50]' : 'bg-[#176FC1] hover:bg-[#155ea5]'
                    }`}
                  />
                  <span className="text-[8px] font-mono text-[#52627A] mt-1 truncate">
                    {r.period.split('/')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 5: 查号 */}
      {activeTab === 'query' && (
        <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm space-y-4">
          <div>
            <span className="text-xs font-bold text-[#25334A] block mb-2">
              点击号码查询:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {Array.from({ length: 49 }, (_, idx) => {
                const n = idx + 1;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQueryBall(n)}
                    className={`shrink-0 w-8 h-8 rounded-full font-mono text-xs font-bold transition-all cursor-pointer ${
                      queryBall === n
                        ? 'bg-[#176FC1] text-white scale-110 shadow-sm ring-2 ring-[#176FC1]/30'
                        : 'bg-[#E9EEF5] text-[#52627A] hover:bg-[#dfe5ee] hover:text-[#25334A]'
                    }`}
                  >
                    {n < 10 ? `0${n}` : n}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#F4F6FA] border border-[#E5E9F0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MarkSixBall number={queryBall} size="lg" showMeta={false} />
              <div>
                <div className="text-sm font-bold text-[#25334A]">
                  号码 {queryBall < 10 ? `0${queryBall}` : queryBall}
                </div>
                <div className="text-xs text-[#8994A6] mt-0.5">
                  生肖：{getZodiac(queryBall)} · 五行：{getElement(queryBall)}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#8994A6] block">近100期出现</span>
              <span className="text-lg font-bold font-mono text-[#25334A]">
                {queryHistory.length} 次
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
