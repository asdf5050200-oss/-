/**
 * Fixed Bottom Navigation Bar (5-Tab Cinema Navigation)
 * 首页 · 直播 · 记录 · 统计 · 我的
 */
import React from 'react';
import { Home, Tv, History, BarChart3, User } from 'lucide-react';

export type MainTabType = 'home' | 'live' | 'results' | 'stats' | 'account';

interface BottomNavProps {
  activeTab: MainTabType;
  onChangeTab: (tab: MainTabType) => void;
  isDrawingLive?: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  isDrawingLive = false,
}) => {
  const tabs = [
    { id: 'home' as MainTabType, label: '首页', icon: Home },
    { id: 'live' as MainTabType, label: '直播', icon: Tv, isLiveBadge: true },
    { id: 'results' as MainTabType, label: '记录', icon: History },
    { id: 'stats' as MainTabType, label: '统计', icon: BarChart3 },
    { id: 'account' as MainTabType, label: '我的', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#101D3A] border-t border-[#172B50] pb-safe shadow-2xl">
      <div className="max-w-md mx-auto grid grid-cols-5 items-center h-16 px-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;

          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onChangeTab(t.id)}
              className="flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] relative select-none transition-colors group cursor-pointer"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 group-active:scale-95 ${
                    isActive
                      ? 'text-[#D6B875] scale-105'
                      : 'text-[#C8D3E6] group-hover:text-white'
                  }`}
                />
                {t.isLiveBadge && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D6B875] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D6B875]" />
                  </span>
                )}
              </div>
              
              <span
                className={`text-[10px] font-medium tracking-tight mt-1 transition-colors ${
                  isActive
                    ? 'text-[#D6B875] font-bold'
                    : 'text-[#C8D3E6] group-hover:text-white'
                }`}
              >
                {t.label}
              </span>

              {/* Active Champagne Gold Bottom Indicator */}
              {isActive && (
                <span className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[#D6B875] shadow-[0_0_6px_rgba(214,184,117,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
