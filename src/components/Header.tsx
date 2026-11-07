/**
 * Top Navigation Header - Ultra Clean Cinema Edition
 */
import React from 'react';
import { Volume2, VolumeX, Flame, User } from 'lucide-react';

interface HeaderProps {
  onOpenBlocked: () => void;
  onOpenAccount: () => void;
  voiceActive: boolean;
  onToggleVoice: () => void;
  hasUnreadBlocked?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenBlocked,
  onOpenAccount,
  voiceActive,
  onToggleVoice,
  hasUnreadBlocked = true,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#101D3A] shadow-md border-b border-[#172B50] px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Clean Wordmark */}
        <div className="flex items-center gap-2.5">
          <span className="text-base font-black tracking-wider text-white font-mono">
            MARK SIX
          </span>
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black bg-[#172B50] text-[#D6B875] border border-[#D6B875]/40 tracking-wider leading-none shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D6B875] animate-pulse" />
            LIVE
          </span>
        </div>

        {/* Right Icon Actions */}
        <div className="flex items-center gap-2">
          {/* Blocked Notices */}
          <button
            type="button"
            onClick={onOpenBlocked}
            className="relative p-2 rounded-xl text-[#C8D3E6] hover:text-[#D6B875] bg-[#172B50] hover:bg-[#1f3765] border border-[#172B50] hover:border-[#D6B875]/30 transition-colors cursor-pointer"
            aria-label="挡牌通知"
          >
            <Flame className="w-4 h-4 text-[#D6B875]" />
            {hasUnreadBlocked && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#D6B875]" />
            )}
          </button>

          {/* Voice Switcher */}
          <button
            type="button"
            onClick={onToggleVoice}
            className={`p-2 rounded-xl border transition-colors cursor-pointer ${
              voiceActive
                ? 'bg-[#172B50] border-[#D6B875]/60 text-[#D6B875] shadow-sm'
                : 'bg-[#172B50] border-[#172B50] text-[#C8D3E6] hover:text-white'
            }`}
            aria-label={voiceActive ? '静音' : '语音播报'}
          >
            {voiceActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Account */}
          <button
            type="button"
            onClick={onOpenAccount}
            className="p-2 rounded-xl bg-[#172B50] hover:bg-[#1f3765] border border-[#172B50] text-[#C8D3E6] hover:text-[#D6B875] transition-colors cursor-pointer"
            aria-label="我的账户"
          >
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
