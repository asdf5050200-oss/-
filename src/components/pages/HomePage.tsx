/**
 * 01 首页 Home - Ultra Clean Cinema Edition
 */
import React, { useState } from 'react';
import { Play, ArrowRight, Calendar, Calculator, Flame, FileText, History, BarChart3 } from 'lucide-react';
import { DrawRecord } from '../../types/markSix';
import { MarkSixBall } from '../MarkSixBall';
import { MainTabType } from '../BottomNav';
import { DrawCountdown } from '../DrawCountdown';

interface HomePageProps {
  latestRecord: DrawRecord;
  onNavigateTab: (tab: MainTabType) => void;
  onOpenCalendar: () => void;
  onOpenKeypad: () => void;
  onOpenBlocked: () => void;
  onOpenPrintSheet: (period: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  latestRecord,
  onNavigateTab,
  onOpenCalendar,
  onOpenKeypad,
  onOpenBlocked,
  onOpenPrintSheet,
}) => {
  const [sortOrder, setSortOrder] = useState<'drawnOrder' | 'sorted'>('sorted');

  const displayBalls = sortOrder === 'drawnOrder' ? latestRecord.drawnOrder : latestRecord.numbers;

  return (
    <div className="space-y-3.5">
      {/* 1. Dynamic Real-time Draw Countdown with 15-Minute Pre-Live Push Notification */}
      <DrawCountdown
        latestRecord={latestRecord}
        onNavigateToLive={() => onNavigateTab('live')}
      />

      {/* 2. Cinema Live Stream Window */}
      <div 
        onClick={() => onNavigateTab('live')}
        className="bg-white border border-[#E5E9F0] rounded-3xl overflow-hidden shadow-sm relative group cursor-pointer"
      >
        <div className="p-3 bg-[#101D3A] flex items-center justify-between relative z-10 text-white">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-[#D6B875] border border-[#D6B875]/40 tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6B875] animate-ping" />
            LIVE 现场
          </span>

          <span className="text-[11px] font-mono text-[#AAB5C8] bg-[#172B50] px-2 py-0.5 rounded-md border border-[#172B50]">
            TVB 无线新闻 · 1080P
          </span>
        </div>

        {/* Video Canvas Stage */}
        <div className="relative aspect-video w-full bg-[#101D3A] flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(23,111,193,0.18)_0%,_transparent_70%)]" />

          {/* Drum Silhouette */}
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full border border-[#172B50] bg-[#172B50]/60 backdrop-blur-md flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-xl">
            <div className="absolute inset-0 rounded-full border-t border-[#D6B875]/40 animate-spin" style={{ animationDuration: '6s' }} />
            <div className="w-12 h-12 rounded-full bg-[#176FC1] text-white flex items-center justify-center shadow-lg pl-0.5">
              <Play className="w-5 h-5 fill-current" />
            </div>
          </div>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10 text-xs">
            <span className="text-xs font-bold text-white tracking-wide font-mono">
              第 26/035 期 现场演播室
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#D6B875] font-semibold">
              <span>观看现场</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 3. Latest Verified Draw Result */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#25334A]">第 {latestRecord.period} 期 开奖结果</span>
            <span className="text-[11px] text-[#52627A]">{latestRecord.drawDate}</span>
          </div>

          {/* Order Toggle */}
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

        {/* Balls Row */}
        <div className="py-4 flex items-center justify-between sm:justify-center sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            {displayBalls.map((num) => (
              <MarkSixBall
                key={num}
                number={num}
                size="md"
                showMeta={false}
              />
            ))}
          </div>

          <span className="text-[#52627A] font-bold text-sm px-1">+</span>

          {/* Special Ball */}
          <MarkSixBall
            number={latestRecord.specialNumber}
            size="md"
            isSpecial={true}
            showMeta={false}
          />
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#E5E9F0] flex items-center justify-between text-xs text-[#52627A]">
          <span>
            投注总额 <span className="font-mono text-[#25334A] font-bold">HK$ {latestRecord.turnover.toLocaleString()}</span>
          </span>
          <button
            type="button"
            onClick={() => onOpenPrintSheet(latestRecord.period)}
            className="text-xs font-semibold text-[#176FC1] hover:text-[#155ea5] flex items-center gap-1 cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>官方开奖单</span>
          </button>
        </div>
      </div>

      {/* 4. Quick Portal Grid */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={() => onNavigateTab('results')}
          className="bg-white hover:bg-[#F4F6FA] border border-[#E5E9F0] p-3 rounded-2xl flex items-center justify-between group transition-colors cursor-pointer text-left shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-[#8994A6] group-hover:text-[#176FC1]" />
            <span className="text-xs font-bold text-[#25334A]">历史开奖</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8994A6] group-hover:text-[#176FC1]" />
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('stats')}
          className="bg-white hover:bg-[#F4F6FA] border border-[#E5E9F0] p-3 rounded-2xl flex items-center justify-between group transition-colors cursor-pointer text-left shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <BarChart3 className="w-4 h-4 text-[#8994A6] group-hover:text-[#176FC1]" />
            <span className="text-xs font-bold text-[#25334A]">走势统计</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8994A6] group-hover:text-[#176FC1]" />
        </button>

        <button
          type="button"
          onClick={onOpenCalendar}
          className="bg-white hover:bg-[#F4F6FA] border border-[#E5E9F0] p-3 rounded-2xl flex items-center justify-between group transition-colors cursor-pointer text-left shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-[#8994A6] group-hover:text-[#176FC1]" />
            <span className="text-xs font-bold text-[#25334A]">开奖日历</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8994A6] group-hover:text-[#176FC1]" />
        </button>

        <button
          type="button"
          onClick={onOpenKeypad}
          className="bg-white hover:bg-[#F4F6FA] border border-[#E5E9F0] p-3 rounded-2xl flex items-center justify-between group transition-colors cursor-pointer text-left shadow-sm"
        >
          <div className="flex items-center gap-2.5">
            <Calculator className="w-4 h-4 text-[#8994A6] group-hover:text-[#176FC1]" />
            <span className="text-xs font-bold text-[#25334A]">选号核对</span>
          </div>
          <ArrowRight className="w-3.5 h-3.5 text-[#8994A6] group-hover:text-[#176FC1]" />
        </button>
      </div>

      {/* 5. Minimal Blocked Alert Bar */}
      <button
        type="button"
        onClick={onOpenBlocked}
        className="w-full bg-white hover:bg-[#F4F6FA] border border-[#E5E9F0] p-3 rounded-2xl flex items-center justify-between text-xs transition-colors cursor-pointer shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-[#D6B875]" />
          <span className="font-semibold text-[#25334A]">挡牌预警</span>
          <span className="text-[#52627A]">· 特码 07 已封牌</span>
        </div>
        <span className="text-[11px] font-semibold text-[#176FC1]">
          查看 →
        </span>
      </button>
    </div>
  );
};
