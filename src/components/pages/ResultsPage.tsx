/**
 * 03 开奖记录 Results - Ultra Clean Cinema Edition
 */
import React, { useState } from 'react';
import { Search, Filter, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { DrawRecord } from '../../types/markSix';
import { MarkSixBall } from '../MarkSixBall';
import { BigSmallRatioChart } from '../BigSmallRatioChart';

interface ResultsPageProps {
  records: DrawRecord[];
  onOpenPrintSheet: (period: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  records,
  onOpenPrintSheet,
}) => {
  const [sortOrder, setSortOrder] = useState<'drawnOrder' | 'sorted'>('drawnOrder');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBall, setFilterBall] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const filteredRecords = records.filter((r) => {
    if (searchQuery && !r.period.includes(searchQuery) && !r.drawDate.includes(searchQuery)) {
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
    <div className="space-y-3.5">
      {/* Top Header & Search */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#25334A]">开奖记录</span>
            <span className="text-xs font-mono text-[#52627A] bg-[#E9EEF5] px-2 py-0.5 rounded border border-[#E5E9F0] font-semibold">
              {records.length} 期
            </span>
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center p-0.5 bg-[#E9EEF5] rounded-xl">
            <button
              type="button"
              onClick={() => setSortOrder('sorted')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                sortOrder === 'sorted' ? 'bg-[#176FC1] text-white shadow-sm' : 'text-[#52627A]'
              }`}
            >
              排序
            </button>
            <button
              type="button"
              onClick={() => setSortOrder('drawnOrder')}
              className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-colors cursor-pointer ${
                sortOrder === 'drawnOrder' ? 'bg-[#176FC1] text-white shadow-sm' : 'text-[#52627A]'
              }`}
            >
              落球次序
            </button>
          </div>
        </div>

        {/* Filter Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#52627A]" />
            <input
              type="text"
              placeholder="搜索期数或日期..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#F4F6FA] border border-[#E5E9F0] rounded-xl pl-8 pr-3 py-2 text-[#25334A] placeholder-[#52627A] focus:outline-none focus:border-[#176FC1]"
            />
          </div>

          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#52627A]" />
            <input
              type="number"
              min={1}
              max={49}
              placeholder="筛选特定号码 (1-49)..."
              value={filterBall}
              onChange={(e) => setFilterBall(e.target.value)}
              className="w-full bg-[#F4F6FA] border border-[#E5E9F0] rounded-xl pl-8 pr-3 py-2 text-[#25334A] placeholder-[#52627A] focus:outline-none focus:border-[#176FC1]"
            />
          </div>
        </div>
      </div>

      {/* Big/Small Ratio Line Chart for Last 10 Draws */}
      <BigSmallRatioChart records={records} />

      {/* History Rows List */}
      <div className="space-y-2">
        {filteredRecords.map((item) => {
          const isExpanded = expandedPeriod === item.period;
          const displayBalls = sortOrder === 'drawnOrder' ? item.drawnOrder : item.numbers;
          const sum = item.numbers.reduce((a, b) => a + b, 0);
          const oddCount = item.numbers.filter(n => n % 2 !== 0).length;

          return (
            <div
              key={item.period}
              className="bg-white rounded-2xl border border-[#E5E9F0] hover:border-[#176FC1]/50 shadow-sm transition-all overflow-hidden"
            >
              <div
                onClick={() => toggleExpand(item.period)}
                className="p-3 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 select-none"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#25334A] text-xs sm:text-sm">
                    第 {item.period} 期
                  </span>
                  <span className="text-[11px] text-[#52627A]">
                    {item.drawDate}
                  </span>
                  {item.isSnowball && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#101D3A] text-[#D6B875] border border-[#D6B875]/40">
                      金多宝
                    </span>
                  )}
                </div>

                {/* 7 Balls */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {displayBalls.map((b, idx) => (
                    <MarkSixBall
                      key={idx}
                      number={b}
                      size="sm"
                      selected={filterBall !== '' && parseInt(filterBall, 10) === b}
                    />
                  ))}

                  <span className="text-[#52627A] font-bold px-0.5 text-xs">+</span>

                  <MarkSixBall
                    number={item.specialNumber}
                    size="sm"
                    isSpecial={true}
                    selected={filterBall !== '' && parseInt(filterBall, 10) === item.specialNumber}
                  />

                  <div className="ml-1 text-[#52627A]">
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>
              </div>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-3.5 pb-3.5 pt-2 border-t border-[#E5E9F0] bg-[#F4F6FA] text-xs space-y-2.5 animate-fadeIn">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                    <div className="p-2 bg-white rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#52627A] block">和值</span>
                      <span className="font-mono font-bold text-[#25334A]">{sum}</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#52627A] block">单双</span>
                      <span className="font-mono font-bold text-[#25334A]">{oddCount}单 : {6 - oddCount}双</span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#52627A] block">头奖注数</span>
                      <span className="font-mono font-bold text-[#25334A]">
                        {item.prizes.first.count === 0 ? '无人中' : `${item.prizes.first.count} 注`}
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#E5E9F0]">
                      <span className="text-[#52627A] block">单注奖金</span>
                      <span className="font-mono font-bold text-[#8C5E14]">
                        {item.prizes.first.count === 0 ? '---' : `$${item.prizes.first.amountPerUnit.toLocaleString()}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-[#52627A]">
                      投注额 HK$ {item.turnover.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => onOpenPrintSheet(item.period)}
                      className="text-xs font-semibold text-[#176FC1] hover:text-[#155ea5] flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>开奖单据 →</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
