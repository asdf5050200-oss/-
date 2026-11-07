/**
 * Blocked Bets Notice Modal (挡牌单与即时限额通知)
 * Premium Dark Cinema Edition
 */
import React, { useState } from 'react';
import { X, Flame, BellRing, Clock, AlertTriangle } from 'lucide-react';
import { BlockedAnnouncement } from '../types/markSix';
import { MarkSixBall } from './MarkSixBall';

interface BlockedNoticesModalProps {
  isOpen: boolean;
  onClose: () => void;
  notices: BlockedAnnouncement[];
  onSelectNumberForKeypad?: (num: number) => void;
}

export const BlockedNoticesModal: React.FC<BlockedNoticesModalProps> = ({
  isOpen,
  onClose,
  notices,
  onSelectNumberForKeypad,
}) => {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [simAlert, setSimAlert] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentNotice = notices[0];

  const handleSimulatePush = () => {
    setSimAlert('【挡牌即时快讯】第 26/035 期：特别号码 [07] 注码已达风控限额，即时停止受注！');
    setTimeout(() => {
      setSimAlert(null);
    }, 4500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white border border-[#E5E9F0] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-[#101D3A] border-b border-[#172B50] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#D6B875]" />
            <span className="text-sm font-bold text-white">最新挡牌单与受限通知</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#AAB5C8] hover:text-white bg-[#172B50] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Push Notification Switcher Banner */}
        <div className="px-5 py-3 bg-[#F4F6FA] border-b border-[#E5E9F0] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <BellRing className={`w-4 h-4 ${pushEnabled ? 'text-[#168B65] animate-bounce' : 'text-[#52627A]'}`} />
            <span className="text-[#25334A] font-medium">当有新挡牌单发布，即时推送至手机</span>
          </div>
          <button
            type="button"
            onClick={() => setPushEnabled(!pushEnabled)}
            className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer ${
              pushEnabled ? 'bg-[#168B65] text-white shadow-xs' : 'bg-[#E9EEF5] text-[#52627A] border border-[#E5E9F0]'
            }`}
          >
            {pushEnabled ? '已开启通知' : '已关闭'}
          </button>
        </div>

        {/* Simulated Push Toast preview */}
        {simAlert && (
          <div className="m-4 p-3 bg-[#E9EEF5] border border-[#176FC1]/40 text-[#101D3A] rounded-2xl shadow-sm flex items-center gap-2 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#176FC1]" />
            <div className="leading-tight font-medium">{simAlert}</div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {currentNotice ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#25334A] font-mono">
                  {currentNotice.period}
                </span>
                <span className="text-[11px] text-[#52627A] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  发布时间：{currentNotice.releaseTime}
                </span>
              </div>

              <div className="p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] text-xs text-[#52627A] leading-relaxed mb-4">
                {currentNotice.announcementText}
              </div>

              {/* Blocked Number Rows */}
              <div className="space-y-2.5">
                <div className="text-xs font-bold text-[#25334A]">目前受限与封牌号码明细：</div>
                {currentNotice.items.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white rounded-2xl border border-[#E5E9F0] flex items-center justify-between hover:border-[#176FC1]/40 transition-colors shadow-xs"
                  >
                    <div className="flex items-center gap-3">
                      <MarkSixBall
                        number={item.number}
                        size="sm"
                        isSpecial={item.type === '特別號碼'}
                        onClick={() => onSelectNumberForKeypad && onSelectNumberForKeypad(item.number)}
                      />
                      <div>
                        <div className="text-xs font-bold text-[#25334A] flex items-center gap-2">
                          <span>{item.type}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                              item.status === '已封牌'
                                ? 'bg-[#101D3A] text-[#D6B875] border border-[#101D3A]'
                                : 'bg-[#E9EEF5] text-[#52627A] border border-[#E5E9F0]'
                            }`}
                          >
                            {item.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#52627A] mt-0.5">
                          {item.reason}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] font-mono text-[#25334A] font-bold block">{item.limitAmount}</span>
                      <span className="text-[10px] text-[#52627A]">{item.updatedAt} 更新</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-[#8994A6]">
              暂无最新挡牌发布，所有号码正常受注中。
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#F4F6FA] border-t border-[#E5E9F0] flex items-center justify-between">
          <button
            type="button"
            onClick={handleSimulatePush}
            className="text-xs font-semibold text-[#176FC1] hover:text-[#125899] cursor-pointer"
          >
            模拟下发即时通告 🔔
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  );
};
