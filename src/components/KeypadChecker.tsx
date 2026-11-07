/**
 * Number Matrix Keypad with Omission/Gap Statistics & Automated Prize Checker
 * Premium Dark Cinema Edition
 */
import React, { useState, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Trash2, CheckCircle2, Trophy, Dice5, History, AlertCircle } from 'lucide-react';
import { DrawRecord, WinningCheckResult } from '../types/markSix';
import { calculateNumberGaps, evaluateTicketAgainstDraw, getBallColor } from '../utils/markSixUtils';
import { MarkSixBall } from './MarkSixBall';

interface KeypadCheckerProps {
  records: DrawRecord[];
  initialPicks?: number[];
  onPicksChange?: (picks: number[]) => void;
}

export const KeypadChecker: React.FC<KeypadCheckerProps> = ({
  records,
  initialPicks = [],
  onPicksChange,
}) => {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>(initialPicks);
  const [selectedTargetPeriod, setSelectedTargetPeriod] = useState<string>(records[0]?.period || '');
  const [checkResults, setCheckResults] = useState<WinningCheckResult | null>(null);

  const gaps = useMemo(() => calculateNumberGaps(records), [records]);

  const targetDraw = useMemo(() => {
    return records.find(r => r.period === selectedTargetPeriod) || records[0];
  }, [records, selectedTargetPeriod]);

  const toggleNumber = (num: number) => {
    setCheckResults(null);
    let next: number[];
    if (selectedNumbers.includes(num)) {
      next = selectedNumbers.filter(n => n !== num);
    } else {
      if (selectedNumbers.length >= 16) {
        alert('复式小键盘最多可选 16 个号码');
        return;
      }
      next = [...selectedNumbers, num].sort((a, b) => a - b);
    }
    setSelectedNumbers(next);
    if (onPicksChange) onPicksChange(next);
  };

  const handleQuickPick = () => {
    setCheckResults(null);
    const pool = Array.from({ length: 49 }, (_, i) => i + 1);
    const picked: number[] = [];
    for (let i = 0; i < 6; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      picked.push(pool.splice(idx, 1)[0]);
    }
    picked.sort((a, b) => a - b);
    setSelectedNumbers(picked);
    if (onPicksChange) onPicksChange(picked);
  };

  const handleClear = () => {
    setSelectedNumbers([]);
    setCheckResults(null);
    if (onPicksChange) onPicksChange([]);
  };

  const handleVerify = () => {
    if (selectedNumbers.length < 6) {
      alert('请至少在小键盘选满 6 个号码再进行核对！');
      return;
    }
    if (!targetDraw) return;

    const res = evaluateTicketAgainstDraw(selectedNumbers.slice(0, 6), targetDraw);
    setCheckResults(res);

    if (res.prizeTier > 0) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#176FC1', '#D6B875', '#168B65', '#101D3A'],
        });
      } catch {
        // Fallback
      }
    }
  };

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 pb-3 border-b border-[#E5E9F0]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#25334A]">选号核对</span>
          <span className="text-xs font-mono font-bold text-[#176FC1] bg-[#E9EEF5] px-2 py-0.5 rounded border border-[#E5E9F0]">
            {selectedNumbers.length} 字
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleQuickPick}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#dfe5ee] text-[#52627A] hover:text-[#25334A] text-xs font-semibold border border-[#E5E9F0] transition-colors cursor-pointer"
          >
            <Dice5 className="w-3.5 h-3.5 text-[#176FC1]" />
            <span>机选</span>
          </button>
          <button
            type="button"
            onClick={handleClear}
            disabled={selectedNumbers.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#dfe5ee] text-[#52627A] hover:text-[#176FC1] text-xs font-semibold border border-[#E5E9F0] disabled:opacity-40 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>清空</span>
          </button>
        </div>
      </div>

      {/* Selected Numbers Tray */}
      <div className="my-3 p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] flex items-center justify-between min-h-[58px] overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          {selectedNumbers.length === 0 ? (
            <span className="text-xs text-[#52627A] pl-1">
              请于下方点选号码 (支持单式 6 字或复式 7-16 字)
            </span>
          ) : (
            selectedNumbers.map((num) => (
              <MarkSixBall
                key={num}
                number={num}
                size="sm"
                onClick={() => toggleNumber(num)}
              />
            ))
          )}
        </div>

        {selectedNumbers.length >= 6 && (
          <button
            type="button"
            onClick={handleVerify}
            className="shrink-0 ml-3 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>即刻核奖</span>
          </button>
        )}
      </div>

      {/* 1-49 Matrix Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2 my-4">
        {Array.from({ length: 49 }, (_, idx) => {
          const num = idx + 1;
          const color = getBallColor(num);
          const gap = gaps[num] !== undefined ? gaps[num] : -1;
          const isSelected = selectedNumbers.includes(num);
          const isHot = gap <= 1;

          return (
            <button
              key={num}
              type="button"
              onClick={() => toggleNumber(num)}
              className={`
                relative flex flex-col items-center justify-center p-1 sm:p-1.5 rounded-2xl border transition-all duration-150 min-h-[46px] sm:min-h-[52px] cursor-pointer
                ${isSelected
                  ? 'bg-[#176FC1] text-white font-black border-[#176FC1] shadow-xs scale-95'
                  : 'bg-[#F4F6FA] hover:bg-white text-[#25334A] border-[#E5E9F0]'}
              `}
            >
              <span className="font-mono text-xs sm:text-sm font-bold">
                {num < 10 ? `0${num}` : num}
              </span>

              <span
                className={`text-[9px] font-mono leading-none mt-0.5 ${
                  isSelected
                    ? 'text-white/80'
                    : isHot
                    ? 'text-[#176FC1] font-bold'
                    : 'text-[#52627A]'
                }`}
              >
                漏{gap}
              </span>
            </button>
          );
        })}
      </div>

      {/* Target Period Selector */}
      <div className="flex items-center justify-between text-xs bg-[#F4F6FA] p-3 rounded-2xl border border-[#E5E9F0]">
        <div className="flex items-center gap-1.5 text-[#52627A]">
          <History className="w-3.5 h-3.5 text-[#176FC1]" />
          <span>对照核奖期数：</span>
        </div>
        <select
          value={selectedTargetPeriod}
          onChange={(e) => {
            setSelectedTargetPeriod(e.target.value);
            setCheckResults(null);
          }}
          className="bg-white border border-[#E5E9F0] text-[#25334A] text-xs rounded-xl px-2.5 py-1 focus:outline-none cursor-pointer"
        >
          {records.slice(0, 20).map((r) => (
            <option key={r.period} value={r.period}>
              第 {r.period} 期 ({r.drawDate})
            </option>
          ))}
        </select>
      </div>

      {/* Winning Result Card */}
      {checkResults && (
        <div className={`mt-4 p-4 rounded-2xl border transition-all animate-fadeIn ${
          checkResults.prizeTier > 0
            ? 'bg-[#F4F6FA] border-[#D6B875] shadow-xs'
            : 'bg-[#F4F6FA] border-[#E5E9F0]'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              {checkResults.prizeTier > 0 ? (
                <Trophy className="w-6 h-6 text-[#8C5E14] animate-bounce" />
              ) : (
                <AlertCircle className="w-5 h-5 text-[#52627A]" />
              )}
              <div>
                <div className={`text-base font-bold ${checkResults.prizeTier > 0 ? 'text-[#8C5E14]' : 'text-[#25334A]'}`}>
                  {checkResults.prizeName}
                </div>
                <div className="text-xs text-[#52627A] mt-0.5">
                  对照第 {targetDraw.period} 期结果 ({targetDraw.drawDate})
                </div>
              </div>
            </div>

            {checkResults.prizeTier > 0 && (
              <div className="text-right">
                <span className="text-[10px] text-[#52627A] block">估算返奖金</span>
                <span className="text-base font-bold font-mono text-[#25334A]">
                  HK$ {checkResults.rewardAmount.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-[#E5E9F0] text-xs flex flex-wrap items-center gap-2">
            <span className="text-[#52627A]">命中正码 ({checkResults.matchedNumbers.length}/6):</span>
            {checkResults.matchedNumbers.length > 0 ? (
              checkResults.matchedNumbers.map((m) => (
                <MarkSixBall key={m} number={m} size="xs" />
              ))
            ) : (
              <span className="text-[#52627A]">无吻合正码</span>
            )}

            <span className="text-[#52627A] ml-2">命中特码:</span>
            {checkResults.matchedSpecial ? (
              <MarkSixBall number={targetDraw.specialNumber} size="xs" isSpecial={true} />
            ) : (
              <span className="text-[#52627A]">未中特码</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
