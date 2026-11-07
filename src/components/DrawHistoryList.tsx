/**
 * 100 Historical Draw Records List (最新100期開獎記錄)
 * 
 * Requirement 10:
 * 最新100期開獎記錄，支持落球先後和由小到大排序
 */
import React, { useState } from 'react';
import { ArrowUpDown, Search, Filter, Sparkles, ChevronDown, ChevronUp, Trophy } from 'lucide-react';
import { DrawRecord } from '../types/markSix';
import { MarkSixBall } from './MarkSixBall';

interface DrawHistoryListProps {
  records: DrawRecord[];
  onSelectPeriodForSlip: (period: string) => void;
}

export const DrawHistoryList: React.FC<DrawHistoryListProps> = ({
  records,
  onSelectPeriodForSlip,
}) => {
  const [sortMode, setSortMode] = useState<'drawnOrder' | 'sorted'>('drawnOrder');
  const [searchPeriod, setSearchPeriod] = useState<string>('');
  const [filterBall, setFilterBall] = useState<string>('');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  // Filter records
  const filteredRecords = records.filter((r) => {
    if (searchPeriod && !r.period.includes(searchPeriod) && !r.drawDate.includes(searchPeriod)) {
      return false;
    }
    if (filterBall) {
      const bNum = parseInt(filterBall, 10);
      if (!isNaN(bNum)) {
        if (!r.numbers.includes(bNum) && r.specialNumber !== bNum) {
          return false;
        }
      }
    }
    return true;
  });

  const toggleExpand = (period: string) => {
    setExpandedPeriod(expandedPeriod === period ? null : period);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-white tracking-tight">最新 100 期開獎記錄</span>
            <span className="text-xs font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
              共 {records.length} 期存檔
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            提供真實開出波色與生肖，隨意切換「落球先後 (攪出順序)」與「由小至大 (數值排序)」。
          </p>
        </div>

        {/* Sort Switcher (Requirement 10) */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => setSortMode('drawnOrder')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              sortMode === 'drawnOrder'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            落球先後 (真實攪出)
          </button>
          <button
            type="button"
            onClick={() => setSortMode('sorted')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              sortMode === 'sorted'
                ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            由小到大 (排序)
          </button>
        </div>
      </div>

      {/* Search and Number Filter Strip */}
      <div className="my-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="搜尋期數 (例：26/034) 或開獎日期..."
            value={searchPeriod}
            onChange={(e) => setSearchPeriod(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        <div className="relative">
          <Filter className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="number"
            min={1}
            max={49}
            placeholder="篩選特定中獎號碼 (1-49)..."
            value={filterBall}
            onChange={(e) => setFilterBall(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* History Rows List */}
      <div className="space-y-2.5 max-h-[700px] overflow-y-auto pr-1">
        {filteredRecords.length === 0 ? (
          <div className="text-center py-10 text-xs text-slate-500">
            沒有找到符合篩選條件的開獎記錄
          </div>
        ) : (
          filteredRecords.map((item) => {
            const isExpanded = expandedPeriod === item.period;
            const displayBalls = sortMode === 'drawnOrder' ? item.drawnOrder : item.numbers;

            const sum = item.numbers.reduce((a, b) => a + b, 0);
            const oddCount = item.numbers.filter(n => n % 2 !== 0).length;

            return (
              <div
                key={item.period}
                className="bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
              >
                {/* Row Header */}
                <div
                  onClick={() => toggleExpand(item.period)}
                  className="p-3 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-xs sm:text-sm">
                      第 {item.period} 期
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {item.drawDate} ({item.dayOfWeek})
                    </span>
                    {item.isSnowball && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#101D3A] text-[#D6B875] border border-[#D6B875]/40">
                        {item.snowballName || '金多寶'}
                      </span>
                    )}
                  </div>

                  {/* Balls Strip */}
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                    {displayBalls.map((b, idx) => (
                      <MarkSixBall
                        key={idx}
                        number={b}
                        size="sm"
                        showMeta={false}
                        selected={filterBall !== '' && parseInt(filterBall, 10) === b}
                      />
                    ))}

                    <span className="text-slate-600 font-bold px-0.5 text-xs">+</span>

                    <MarkSixBall
                      number={item.specialNumber}
                      size="sm"
                      isSpecial={true}
                      showMeta={false}
                      selected={filterBall !== '' && parseInt(filterBall, 10) === item.specialNumber}
                    />

                    <div className="ml-1 text-slate-500">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-900 bg-slate-900/50 text-xs space-y-3 animate-fadeIn">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">攪出正碼總和 (Sum)</span>
                        <span className="font-mono font-bold text-amber-400">{sum}</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">單雙比例 (Odd:Even)</span>
                        <span className="font-mono font-bold text-slate-200">{oddCount}單 : {6 - oddCount}雙</span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">頭獎注數</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {item.prizes.first.count === 0 ? '無人中 (累積多寶)' : `${item.prizes.first.count} 注中`}
                        </span>
                      </div>
                      <div className="p-2 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="text-slate-500 block">頭獎每注派彩</span>
                        <span className="font-mono font-bold text-emerald-400">
                          {item.prizes.first.count === 0 ? '---' : `HK$ ${item.prizes.first.amountPerUnit.toLocaleString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        總投注額：HK$ {item.turnover.toLocaleString()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPeriodForSlip(item.period);
                        }}
                        className="text-xs text-amber-400 hover:text-amber-300 underline font-medium"
                      >
                        查看該期官方開獎單與列印 →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
