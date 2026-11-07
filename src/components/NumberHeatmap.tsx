/**
 * 基于最新100期数据的六合彩号码（1-49）出现频率热力图组件
 * 频率越高颜色越红，直观识别高频号码
 */
import React, { useState, useMemo } from 'react';
import { Sparkles, SlidersHorizontal, ArrowUpDown, Info, TrendingUp, Award, BarChart3 } from 'lucide-react';
import { DrawRecord } from '../types/markSix';
import { getBallColor, getElement, getZodiac } from '../utils/markSixUtils';
import { MarkSixBall } from './MarkSixBall';

interface NumberHeatmapProps {
  records: DrawRecord[];
  onSelectBall?: (num: number) => void;
}

export const NumberHeatmap: React.FC<NumberHeatmapProps> = ({ records, onSelectBall }) => {
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(true);
  const [sortMode, setSortMode] = useState<'grid' | 'frequency'>('grid'); // 'grid' (1-49顺序) or 'frequency' (热度降序)
  const [filterRegion, setFilterRegion] = useState<'all' | 'hot' | 'big' | 'small'>('all');
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);

  // Take the most recent 100 records
  const sampleRecords = useMemo(() => {
    return records.slice(0, 100);
  }, [records]);

  // Calculate frequency for each ball (1 - 49)
  const heatmapData = useMemo(() => {
    const totalPeriods = sampleRecords.length || 1;
    const statsMap: Record<
      number,
      {
        num: number;
        regCount: number;
        specialCount: number;
        totalCount: number;
        frequencyPct: number;
        color: string;
        zodiac: string;
        element: string;
        lastSeenPeriod: string | null;
        missCount: number;
      }
    > = {};

    for (let i = 1; i <= 49; i++) {
      statsMap[i] = {
        num: i,
        regCount: 0,
        specialCount: 0,
        totalCount: 0,
        frequencyPct: 0,
        color: getBallColor(i),
        zodiac: getZodiac(i),
        element: getElement(i),
        lastSeenPeriod: null,
        missCount: -1,
      };
    }

    sampleRecords.forEach((rec, idx) => {
      rec.numbers.forEach((num) => {
        if (statsMap[num]) {
          statsMap[num].regCount++;
          if (statsMap[num].missCount === -1) {
            statsMap[num].missCount = idx;
            statsMap[num].lastSeenPeriod = rec.period;
          }
        }
      });

      if (statsMap[rec.specialNumber]) {
        statsMap[rec.specialNumber].specialCount++;
        if (statsMap[rec.specialNumber].missCount === -1) {
          statsMap[rec.specialNumber].missCount = idx;
          statsMap[rec.specialNumber].lastSeenPeriod = rec.period;
        }
      }
    });

    const list = Object.values(statsMap).map((item) => {
      const activeCount = includeSpecial
        ? item.regCount + item.specialCount
        : item.regCount;
      const frequencyPct = Math.round((activeCount / totalPeriods) * 100);
      return {
        ...item,
        totalCount: activeCount,
        frequencyPct,
        missCount: item.missCount === -1 ? totalPeriods : item.missCount,
      };
    });

    // Determine min and max counts for color scaling
    const counts = list.map((item) => item.totalCount);
    const minCount = Math.min(...counts);
    const maxCount = Math.max(...counts);

    return {
      list,
      minCount,
      maxCount,
      totalPeriods,
    };
  }, [sampleRecords, includeSpecial]);

  // Color generator based on frequency ratio (0 to 1)
  // Strictly Blue, Navy, Gold, and Clean Light Gray palette - NO RED
  const getHeatmapColor = (count: number) => {
    const { minCount, maxCount } = heatmapData;
    const range = maxCount - minCount || 1;
    const ratio = Math.max(0, Math.min(1, (count - minCount) / range));

    if (ratio >= 0.85) {
      return {
        bg: 'bg-[#101D3A]',
        text: 'text-[#D6B875]',
        border: 'border-[#D6B875]',
        badgeBg: 'bg-[#D6B875] text-[#101D3A] font-bold',
        glow: 'shadow-md ring-1 ring-[#D6B875]/70',
        tier: '极热',
      };
    }
    if (ratio >= 0.65) {
      return {
        bg: 'bg-[#172B50]',
        text: 'text-white',
        border: 'border-[#176FC1]',
        badgeBg: 'bg-[#176FC1] text-white font-semibold',
        glow: 'shadow-xs',
        tier: '高频',
      };
    }
    if (ratio >= 0.45) {
      return {
        bg: 'bg-[#176FC1]',
        text: 'text-white',
        border: 'border-[#155ea5]',
        badgeBg: 'bg-black/25 text-white font-semibold',
        glow: '',
        tier: '中高',
      };
    }
    if (ratio >= 0.28) {
      return {
        bg: 'bg-[#4D8FD6]',
        text: 'text-white',
        border: 'border-[#387EC6]',
        badgeBg: 'bg-black/20 text-white font-medium',
        glow: '',
        tier: '中频',
      };
    }
    if (ratio >= 0.14) {
      return {
        bg: 'bg-[#E9EEF5]',
        text: 'text-[#1E2B40]',
        border: 'border-[#D0DBEA]',
        badgeBg: 'bg-white text-[#52627A]',
        glow: '',
        tier: '中低',
      };
    }
    return {
      bg: 'bg-[#F4F6FA]',
      text: 'text-[#52627A]',
      border: 'border-[#E5E9F0]',
      badgeBg: 'bg-[#E5E9F0] text-[#52627A]',
      glow: '',
      tier: '冷门',
    };
  };

  // Filtered and Sorted list for display
  const displayList = useMemo(() => {
    let result = [...heatmapData.list];

    // Filter by region or hot
    if (filterRegion === 'hot') {
      const threshold = heatmapData.minCount + (heatmapData.maxCount - heatmapData.minCount) * 0.65;
      result = result.filter((i) => i.totalCount >= threshold);
    } else if (filterRegion === 'big') {
      result = result.filter((i) => i.num >= 25);
    } else if (filterRegion === 'small') {
      result = result.filter((i) => i.num <= 24);
    }

    // Sort mode
    if (sortMode === 'frequency') {
      result.sort((a, b) => b.totalCount - a.totalCount || a.num - b.num);
    } else {
      result.sort((a, b) => a.num - b.num);
    }

    return result;
  }, [heatmapData, filterRegion, sortMode]);

  // Top 3 hottest and coldest numbers for summary ribbon
  const summary = useMemo(() => {
    const sorted = [...heatmapData.list].sort((a, b) => b.totalCount - a.totalCount);
    const top3 = sorted.slice(0, 3);
    const bottom3 = [...sorted].reverse().slice(0, 3);
    const avgCount = (
      heatmapData.list.reduce((acc, c) => acc + c.totalCount, 0) / 49
    ).toFixed(1);

    return { top3, bottom3, avgCount };
  }, [heatmapData]);

  // Active inspected item (default to selectedNumber or top hot number)
  const activeItem = useMemo(() => {
    if (selectedNumber !== null) {
      return heatmapData.list.find((i) => i.num === selectedNumber) || null;
    }
    return summary.top3[0] || null;
  }, [selectedNumber, heatmapData, summary]);

  const handleBallClick = (num: number) => {
    setSelectedNumber(num === selectedNumber ? null : num);
    if (onSelectBall) {
      onSelectBall(num);
    }
  };

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm space-y-4">
      {/* 1. Header with Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E9F0] gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#E9EEF5] border border-[#176FC1]/30 flex items-center justify-center text-[#176FC1] shadow-xs">
            <BarChart3 className="w-4 h-4 text-[#176FC1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#25334A]">
                最新 100 期出球频率热力图
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E9EEF5] border border-[#176FC1]/30 text-[#176FC1] font-mono font-bold">
                1~49 全号
              </span>
            </div>
            <div className="text-[11px] text-[#52627A] flex items-center gap-2 mt-0.5">
              <span>颜色越深蓝/深海蓝，表示该号码在近 100 期开出频率越高</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
          {/* Include Special Ball Toggle */}
          <button
            type="button"
            onClick={() => setIncludeSpecial(!includeSpecial)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 ${
              includeSpecial
                ? 'bg-[#176FC1] text-white border-[#176FC1]'
                : 'bg-[#E9EEF5] text-[#52627A] border-[#E5E9F0] hover:text-[#25334A]'
            }`}
            title="是否计入特别号码"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{includeSpecial ? '含特别号码' : '仅正码'}</span>
          </button>

          {/* Sort Switcher (1-49 Grid vs 热度排序) */}
          <div className="flex items-center p-0.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] text-[11px]">
            <button
              type="button"
              onClick={() => setSortMode('grid')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                sortMode === 'grid'
                  ? 'bg-white text-[#25334A] shadow-xs'
                  : 'text-[#52627A] hover:text-[#25334A]'
              }`}
            >
              顺序矩阵
            </button>
            <button
              type="button"
              onClick={() => setSortMode('frequency')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                sortMode === 'frequency'
                  ? 'bg-white text-[#25334A] shadow-xs'
                  : 'text-[#52627A] hover:text-[#25334A]'
              }`}
            >
              <ArrowUpDown className="w-3 h-3" />
              <span>热度降序</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Hot & Cold Insights Ribbon */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        {/* Top 3 Hot */}
        <div className="p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#D6B875] font-bold mb-1">
              <Award className="w-3.5 h-3.5 text-[#D6B875]" />
              <span className="text-[#101D3A]">近100期最热 TOP 3</span>
            </div>
            <div className="flex items-center gap-2">
              {summary.top3.map((item, idx) => (
                <div
                  key={item.num}
                  onClick={() => handleBallClick(item.num)}
                  className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  <MarkSixBall number={item.num} size="xs" showMeta={false} />
                  <span className="font-mono text-xs font-bold text-[#101D3A]">
                    {item.totalCount}次
                  </span>
                  {idx < 2 && <span className="text-[#52627A]">·</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom 3 Cold */}
        <div className="p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#176FC1] font-bold mb-1">
              <Info className="w-3.5 h-3.5" />
              <span>近100期最冷 TOP 3</span>
            </div>
            <div className="flex items-center gap-2">
              {summary.bottom3.map((item, idx) => (
                <div
                  key={item.num}
                  onClick={() => handleBallClick(item.num)}
                  className="flex items-center gap-1 cursor-pointer hover:scale-105 transition-transform"
                >
                  <MarkSixBall number={item.num} size="xs" showMeta={false} />
                  <span className="font-mono text-xs text-[#52627A]">
                    {item.totalCount}次
                  </span>
                  {idx < 2 && <span className="text-[#52627A]">·</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Average Benchmark */}
        <div className="p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] flex items-center justify-between">
          <div>
            <span className="text-[11px] text-[#52627A] block">号码平均出现基准</span>
            <div className="flex items-baseline gap-1.5 mt-0.5">
              <span className="text-lg font-black font-mono text-[#101D3A]">
                {summary.avgCount}
              </span>
              <span className="text-[11px] text-[#52627A]">次 / 100期</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-[#52627A] block">最高频次</span>
            <span className="font-mono font-bold text-[#176FC1]">
              {heatmapData.maxCount} 次
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tags & Color Scale Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: '全部 49 球' },
            { id: 'hot', label: '高频热号' },
            { id: 'big', label: '大号区 (25-49)' },
            { id: 'small', label: '小号区 (01-24)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterRegion(tab.id as any)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                filterRegion === tab.id
                  ? 'bg-[#176FC1] text-white shadow-xs'
                  : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A] border border-[#E5E9F0]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Heatmap Spectrum Gradient Legend */}
        <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
          <span className="text-[10px] text-[#52627A]">低频 ({heatmapData.minCount}次)</span>
          <div className="w-28 sm:w-36 h-3 rounded-full bg-gradient-to-r from-[#F4F6FA] via-[#E9EEF5] via-[#4D8FD6] via-[#176FC1] to-[#101D3A] border border-[#E5E9F0]" />
          <span className="text-[10px] text-[#101D3A] font-bold">
            高频 ({heatmapData.maxCount}次)
          </span>
        </div>
      </div>

      {/* 4. Heatmap Cell Matrix (Responsive 7x7 Grid for 1-49) */}
      <div className="bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] p-3 sm:p-4">
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {displayList.map((item) => {
            const style = getHeatmapColor(item.totalCount);
            const isSelected = selectedNumber === item.num;

            return (
              <div
                key={item.num}
                onClick={() => handleBallClick(item.num)}
                className={`relative aspect-square rounded-xl border p-1 sm:p-1.5 flex flex-col items-center justify-between transition-all duration-200 cursor-pointer select-none group ${
                  style.bg
                } ${style.border} ${style.glow} ${
                  isSelected ? 'scale-105 ring-2 ring-[#176FC1] z-10 shadow-md' : 'hover:scale-105 hover:z-10'
                }`}
                title={`号码 ${item.num < 10 ? '0' + item.num : item.num}：近100期共出现 ${item.totalCount} 次 (${item.frequencyPct}%)`}
              >
                {/* Zodiac tag */}
                <div className="w-full flex items-center justify-end">
                  <span className={`text-[8px] font-mono leading-none ${style.text === 'text-white' || style.text === 'text-[#D6B875]' ? 'opacity-80' : 'text-[#52627A]'}`}>
                    {item.zodiac}
                  </span>
                </div>

                {/* Main Ball Number */}
                <span
                  className={`text-base sm:text-xl font-black font-mono leading-none tracking-tight ${style.text}`}
                >
                  {item.num < 10 ? `0${item.num}` : item.num}
                </span>

                {/* Appearance Count Pill */}
                <span
                  className={`text-[9px] sm:text-[10px] font-mono font-bold px-1 rounded leading-tight ${style.badgeBg}`}
                >
                  {item.totalCount}次
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. Interactive Ball Detail Card (Expanded on click or default top hot) */}
      {activeItem && (
        <div className="p-3.5 bg-white border border-[#E5E9F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs animate-fadeIn">
          <div className="flex items-center gap-3">
            <MarkSixBall number={activeItem.num} size="md" showMeta={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-black text-[#25334A]">
                  号码 {activeItem.num < 10 ? `0${activeItem.num}` : activeItem.num}
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    getHeatmapColor(activeItem.totalCount).bg
                  } text-white`}
                >
                  {getHeatmapColor(activeItem.totalCount).tier}
                </span>
                <span className="text-[#52627A] text-[11px]">
                  {activeItem.zodiac} · {activeItem.element}
                </span>
              </div>
              <div className="text-[11px] text-[#52627A] mt-0.5 flex items-center gap-2">
                <span>
                  正码：<strong className="text-[#25334A]">{activeItem.regCount}</strong> 次
                </span>
                <span>·</span>
                <span>
                  特码：<strong className="text-[#D6B875]">{activeItem.specialCount}</strong> 次
                </span>
                <span>·</span>
                <span>
                  出球率：<strong className="text-[#176FC1]">{activeItem.frequencyPct}%</strong>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-4 text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-[#E5E9F0]">
            <div>
              <span className="text-[10px] text-[#52627A] block">当前遗漏</span>
              <span className="font-mono font-bold text-[#25334A]">
                {activeItem.missCount === 0
                  ? '上期已开'
                  : `漏 ${activeItem.missCount} 期`}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#52627A] block">最近开出期数</span>
              <span className="font-mono font-bold text-[#D6B875]">
                {activeItem.lastSeenPeriod ? `第 ${activeItem.lastSeenPeriod} 期` : '近100期未开'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
