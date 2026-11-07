/**
 * Yearly Draw Calendar Component (全年开奖日历)
 * Premium Dark Cinema Edition
 */
import React, { useState } from 'react';
import { Calendar as CalendarIcon, Sparkles, Bell, Check, X } from 'lucide-react';
import { CalendarDrawEvent } from '../types/markSix';

interface CalendarTableProps {
  events: CalendarDrawEvent[];
  isModal?: boolean;
  onClose?: () => void;
}

export const CalendarTable: React.FC<CalendarTableProps> = ({
  events,
  isModal = false,
  onClose,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [bookedId, setBookedId] = useState<string | null>(null);

  const months = [
    { label: '全部', value: 'all' },
    { label: '3月', value: '2026-03' },
    { label: '4月', value: '2026-04' },
    { label: '5月', value: '2026-05' },
    { label: '6月', value: '2026-06' },
    { label: '7月', value: '2026-07' },
    { label: '8月', value: '2026-08' },
    { label: '9月', value: '2026-09' },
    { label: '10月', value: '2026-10' },
    { label: '11月', value: '2026-11' },
    { label: '12月', value: '2026-12' },
  ];

  const filteredEvents = selectedMonth === 'all'
    ? events
    : events.filter(e => e.date.startsWith(selectedMonth));

  const handleReminder = (evt: CalendarDrawEvent) => {
    setBookedId(evt.id);
    setTimeout(() => setBookedId(null), 2500);
  };

  const content = (
    <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0] mb-3">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-[#176FC1]" />
          <span className="text-sm font-bold text-[#25334A]">2026/2027 全年开奖日历 (金多宝)</span>
        </div>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8994A6] hover:text-[#25334A] bg-[#E9EEF5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Month horizontal scroller */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3">
        {months.map(m => (
          <button
            key={m.value}
            type="button"
            onClick={() => setSelectedMonth(m.value)}
            className={`px-3 py-1 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors cursor-pointer ${
              selectedMonth === m.value
                ? 'bg-[#176FC1] text-white font-bold shadow-xs'
                : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A] border border-[#E5E9F0]'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Calendar List Rows */}
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {filteredEvents.map(evt => (
          <div
            key={evt.id}
            className={`p-3 rounded-2xl border flex items-center justify-between transition-colors shadow-xs ${
              evt.isSnowball
                ? 'bg-white border-[#D6B875]'
                : 'bg-[#F4F6FA] border-[#E5E9F0] hover:border-[#176FC1]/40'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 text-center bg-white p-1.5 rounded-xl border border-[#E5E9F0] shrink-0 font-mono">
                <span className="text-[10px] text-[#52627A] block">{evt.date.split('-')[1]}月</span>
                <span className="text-sm font-bold text-[#25334A] block">{evt.date.split('-')[2]}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#25334A]">
                    第 {evt.period} 期 ({evt.dayOfWeek})
                  </span>
                  {evt.isSnowball && (
                    <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#101D3A] text-[#D6B875] border border-[#D6B875]/40">
                      <Sparkles className="w-3 h-3 text-[#D6B875]" />
                      {evt.snowballTitle}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#52627A] mt-0.5">
                  头奖基金估算：<span className="font-mono text-[#8C5E14] font-bold">{evt.estimatedJackpot}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleReminder(evt)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#52627A] bg-[#E9EEF5] hover:bg-[#dfe5ee] border border-[#E5E9F0] transition-colors cursor-pointer"
            >
              {bookedId === evt.id ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#168B65]" />
                  <span className="text-[#168B65] font-bold">已预约</span>
                </>
              ) : (
                <>
                  <Bell className="w-3.5 h-3.5 text-[#52627A]" />
                  <span>提醒</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-lg">
          {content}
        </div>
      </div>
    );
  }

  return content;
};
