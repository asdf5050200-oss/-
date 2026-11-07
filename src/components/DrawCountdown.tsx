import React, { useState, useEffect } from 'react';
import { Clock, Bell, BellRing, BellOff, Sparkles, Radio, ArrowRight, ShieldCheck } from 'lucide-react';
import { DrawRecord } from '../types/markSix';

interface DrawCountdownProps {
  latestRecord: DrawRecord;
  onNavigateToLive: () => void;
}

interface TimeRemaining {
  totalSeconds: number;
  days: number;
  hours: number;
  mins: number;
  secs: number;
  formattedTarget: string;
  nextPeriod: string;
}

const NOTIFICATION_STORAGE_KEY = 'marksix_live_push_notification_enabled';

export const DrawCountdown: React.FC<DrawCountdownProps> = ({
  latestRecord,
  onNavigateToLive,
}) => {
  // Push notification toggle state
  const [notificationEnabled, setNotificationEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(NOTIFICATION_STORAGE_KEY) === 'true';
    }
    return false;
  });

  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Demo toggle: allows testing the 15-minute countdown and notification switch anytime
  const [forceWithin15Mins, setForceWithin15Mins] = useState<boolean>(false);

  // Calculate the next real-world Mark Six draw time (Every Tuesday, Thursday, Sunday at 21:30 HKT)
  const calculateNextDraw = (): { targetDate: Date; nextPeriod: string } => {
    const now = new Date();
    // Approximate next period from latest record
    const parts = (latestRecord.period || '26/034').split('/');
    const nextNum = parts.length === 2 ? parseInt(parts[1], 10) + 1 : 35;
    const nextPeriod = `26/${nextNum < 10 ? '0' : ''}${nextNum}`;

    // Target days: Tuesday (2), Thursday (4), Sunday (0)
    const drawDays = [2, 4, 0];

    // Check candidate days from today forward
    for (let dayOffset = 0; dayOffset <= 7; dayOffset++) {
      const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset, 21, 30, 0);
      const dayOfWeek = candidate.getDay();

      if (drawDays.includes(dayOfWeek)) {
        if (candidate.getTime() > now.getTime()) {
          return { targetDate: candidate, nextPeriod };
        }
      }
    }

    // Fallback: 2 days from now at 21:30
    const fallback = new Date(now.getTime() + 2 * 24 * 3600 * 1000);
    fallback.setHours(21, 30, 0, 0);
    return { targetDate: fallback, nextPeriod };
  };

  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() => {
    return {
      totalSeconds: 3600,
      days: 0,
      hours: 1,
      mins: 0,
      secs: 0,
      formattedTarget: '3月26日 (周四) 21:30',
      nextPeriod: '26/035',
    };
  });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const { targetDate, nextPeriod } = calculateNextDraw();

      // Format target display string
      const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
      const month = targetDate.getMonth() + 1;
      const date = targetDate.getDate();
      const dayStr = dayNames[targetDate.getDay()];
      const formattedTarget = `${month}月${date}日 (${dayStr}) 21:30`;

      let diffMs = targetDate.getTime() - now.getTime();
      let totalSeconds = Math.max(0, Math.floor(diffMs / 1000));

      // If user toggles the demo mode, simulate being in the 12-minute pre-live window
      if (forceWithin15Mins) {
        totalSeconds = 12 * 60 + 45; // 12 mins 45 secs
      }

      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const mins = Math.floor((totalSeconds % 3600) / 60);
      const secs = totalSeconds % 60;

      setTimeRemaining({
        totalSeconds,
        days,
        hours,
        mins,
        secs,
        formattedTarget,
        nextPeriod,
      });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [forceWithin15Mins, latestRecord]);

  // Check if within 15 minutes before the draw (<= 900 seconds)
  const isWithin15Minutes = timeRemaining.totalSeconds <= 15 * 60;

  // Handle push notification toggle
  const handleToggleNotification = async () => {
    const nextState = !notificationEnabled;
    setNotificationEnabled(nextState);
    if (typeof window !== 'undefined') {
      localStorage.setItem(NOTIFICATION_STORAGE_KEY, nextState ? 'true' : 'false');
    }

    if (nextState) {
      // Request system Notification permission if available
      if (typeof window !== 'undefined' && 'Notification' in window) {
        if (Notification.permission === 'default') {
          try {
            await Notification.requestPermission();
          } catch {
            // ignore
          }
        }
      }
      setNotificationToast('已成功开启开奖推送提醒！开奖前15分钟及开彩时将准时提醒。');
    } else {
      setNotificationToast('已关闭开奖推送提醒。');
    }

    setTimeout(() => {
      setNotificationToast(null);
    }, 4500);
  };

  return (
    <div className="space-y-3">
      {/* Main Countdown Card */}
      <div
        className={`bg-[#FFFFFF] rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-sm ${
          isWithin15Minutes
            ? 'border-[#176FC1] ring-1 ring-[#176FC1]/40 shadow-blue-50'
            : 'border-[#E5E9F0]'
        }`}
      >
        {/* Subtle ambient light gradient when in urgent 15-min state */}
        {isWithin15Minutes && (
          <div className="absolute top-0 right-0 w-64 h-24 bg-gradient-to-bl from-[#E9EEF5] via-transparent to-transparent pointer-events-none" />
        )}

        {/* Card Header */}
        <div className="px-4 py-3 border-b border-[#E5E9F0] flex items-center justify-between text-xs bg-[#FFFFFF]">
          <div className="flex items-center gap-2">
            <span
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider ${
                isWithin15Minutes
                  ? 'bg-[#176FC1] text-white animate-pulse'
                  : 'bg-[#101D3A] text-[#D6B875]'
              }`}
            >
              <Clock className="w-3 h-3 text-current" />
              <span>{isWithin15Minutes ? '开奖在即' : '开奖倒计时'}</span>
            </span>

            <span className="text-[#25334A] font-bold">
              {timeRemaining.formattedTarget}
            </span>
            <span className="text-[#52627A] font-mono">
              第 {timeRemaining.nextPeriod} 期
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Demo 15-min trigger preview button */}
            <button
              type="button"
              onClick={() => setForceWithin15Mins(!forceWithin15Mins)}
              className="text-[10px] text-[#52627A] hover:text-[#176FC1] transition-colors cursor-pointer"
              title="模拟测试15分钟状态与通知开关"
            >
              {forceWithin15Mins ? '恢复实际倒计时' : '测试15分状态'}
            </button>
            <span className="text-[11px] text-[#D6B875] font-mono font-bold hidden sm:inline">
              官方同步中
            </span>
          </div>
        </div>

        {/* Center Countdown Display & Jackpot */}
        <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
          {/* Estimated Jackpot */}
          <div>
            <div className="flex items-center gap-1 text-[11px] text-[#52627A] uppercase tracking-wider mb-0.5">
              <Sparkles className="w-3 h-3 text-[#D6B875]" />
              <span>预计头奖基金 (估值)</span>
            </div>
            <div className="text-xl sm:text-2xl font-black font-mono text-[#25334A]">
              HK$ <span className="text-[#D6B875]">28,000,000</span>
              <span className="text-xs font-normal text-[#52627A] ml-1.5 font-sans">
                多宝累积
              </span>
            </div>
          </div>

          {/* Real-time Digital Countdown Flip Boxes */}
          <div className="flex items-center gap-1.5 font-mono text-center">
            {/* Days */}
            <div className="bg-[#F4F6FA] border border-[#E5E9F0] px-2.5 py-1.5 rounded-xl min-w-[36px]">
              <span className="text-base sm:text-lg font-black text-[#25334A] block leading-none">
                {timeRemaining.days < 10 ? `0${timeRemaining.days}` : timeRemaining.days}
              </span>
              <span className="text-[9px] text-[#52627A] font-sans font-medium">天</span>
            </div>
            <span className="text-[#52627A] font-bold text-sm">:</span>

            {/* Hours */}
            <div className="bg-[#F4F6FA] border border-[#E5E9F0] px-2.5 py-1.5 rounded-xl min-w-[36px]">
              <span className="text-base sm:text-lg font-black text-[#25334A] block leading-none">
                {timeRemaining.hours < 10 ? `0${timeRemaining.hours}` : timeRemaining.hours}
              </span>
              <span className="text-[9px] text-[#52627A] font-sans font-medium">时</span>
            </div>
            <span className="text-[#52627A] font-bold text-sm">:</span>

            {/* Minutes */}
            <div className="bg-[#F4F6FA] border border-[#E5E9F0] px-2.5 py-1.5 rounded-xl min-w-[36px]">
              <span className="text-base sm:text-lg font-black text-[#25334A] block leading-none">
                {timeRemaining.mins < 10 ? `0${timeRemaining.mins}` : timeRemaining.mins}
              </span>
              <span className="text-[9px] text-[#52627A] font-sans font-medium">分</span>
            </div>
            <span className="text-[#52627A] font-bold text-sm">:</span>

            {/* Seconds (Pulsing Tech Blue) */}
            <div className="bg-[#E9EEF5] border border-[#176FC1]/40 px-2.5 py-1.5 rounded-xl min-w-[36px]">
              <span className="text-base sm:text-lg font-black text-[#176FC1] block leading-none animate-pulse">
                {timeRemaining.secs < 10 ? `0${timeRemaining.secs}` : timeRemaining.secs}
              </span>
              <span className="text-[9px] text-[#176FC1] font-sans font-medium">秒</span>
            </div>
          </div>
        </div>

        {/* 15-MINUTE PRE-LIVE ALERT & PUSH NOTIFICATION SWITCH */}
        {isWithin15Minutes && (
          <div className="px-4 py-3 bg-[#E9EEF5] border-t border-[#176FC1]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fadeIn">
            {/* Alert Message */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#176FC1]/10 border border-[#176FC1]/30 flex items-center justify-center text-[#176FC1] shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#25334A]">
                    直播即将开始（进入15分钟倒计时）
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#176FC1] animate-ping" />
                </div>
                <div className="text-[11px] text-[#52627A] mt-0.5">
                  现场搅珠信号就绪，开奖前将准时为您推送提醒
                </div>
              </div>
            </div>

            {/* Push Notification Toggle Switch */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E5E9F0]">
              <button
                type="button"
                onClick={handleToggleNotification}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  notificationEnabled
                    ? 'bg-[#E8F5EF] text-[#168B65] border border-[#168B65]/40 shadow-sm'
                    : 'bg-white hover:bg-[#F4F6FA] text-[#25334A] border border-[#E5E9F0]'
                }`}
              >
                {notificationEnabled ? (
                  <>
                    <BellRing className="w-3.5 h-3.5 animate-bounce text-[#168B65]" />
                    <span>推送提醒已开启</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5 text-[#176FC1]" />
                    <span>开启开奖推送通知</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onNavigateToLive}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#155ea5] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                <span>直达直播</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Regular State Push Notification Button (When > 15 mins) */}
        {!isWithin15Minutes && (
          <div className="px-4 py-2.5 bg-[#F4F6FA] border-t border-[#E5E9F0] flex items-center justify-between text-xs text-[#8994A6]">
            <div className="flex items-center gap-1.5 text-[11px]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#168B65]" />
              <span className="text-[#52627A]">现场公证监督 · 49球封存完整</span>
            </div>

            <button
              type="button"
              onClick={handleToggleNotification}
              className="flex items-center gap-1.5 text-xs text-[#25334A] hover:text-[#176FC1] transition-colors cursor-pointer font-medium"
            >
              {notificationEnabled ? (
                <>
                  <BellRing className="w-3.5 h-3.5 text-[#168B65]" />
                  <span className="text-[#168B65]">开奖提醒：已开启</span>
                </>
              ) : (
                <>
                  <BellOff className="w-3.5 h-3.5 text-[#8994A6]" />
                  <span>开奖前15分钟提醒：点击开启</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Floating Feedback Toast */}
      {notificationToast && (
        <div className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-sm z-50 p-3 bg-[#101D3A] border border-[#D6B875]/60 rounded-xl shadow-2xl text-xs text-white flex items-center gap-2.5 animate-slide-up">
          <BellRing className="w-4 h-4 text-[#D6B875] shrink-0 animate-bounce" />
          <span className="font-medium leading-tight">{notificationToast}</span>
        </div>
      )}
    </div>
  );
};
