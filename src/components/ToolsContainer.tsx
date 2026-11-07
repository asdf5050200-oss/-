/**
 * Tools & Utility Container Component
 * Hosts:
 * 1. 官方開獎單 (DrawPrintSheet)
 * 2. 全年日期表 (CalendarTable)
 * 3. 倍數與注數計算器 (MultiplierTable)
 * 4. 版路討論交流 (CommunityForum)
 * 5. 真人語音報碼 (VoiceBroadcastPanel)
 */
import React, { useState } from 'react';
import { FileText, Calendar, Calculator, MessageSquare, Mic } from 'lucide-react';
import { CalendarDrawEvent, DrawRecord, ForumPost } from '../types/markSix';
import { DrawPrintSheet } from './DrawPrintSheet';
import { CalendarTable } from './CalendarTable';
import { MultiplierTable } from './MultiplierTable';
import { CommunityForum } from './CommunityForum';
import { VoiceBroadcastPanel } from './VoiceBroadcastPanel';

export type ToolSubTab = 'slip' | 'calendar' | 'multiplier' | 'forum' | 'voice';

interface ToolsContainerProps {
  records: DrawRecord[];
  calendarEvents: CalendarDrawEvent[];
  forumPosts: ForumPost[];
  selectedPeriod: string;
  onSelectPeriod: (period: string) => void;
  onImportToKeypad: (numbers: number[]) => void;
  initialSubTab?: ToolSubTab;
}

export const ToolsContainer: React.FC<ToolsContainerProps> = ({
  records,
  calendarEvents,
  forumPosts,
  selectedPeriod,
  onSelectPeriod,
  onImportToKeypad,
  initialSubTab = 'slip',
}) => {
  const [subTab, setSubTab] = useState<ToolSubTab>(initialSubTab);

  const activeRecord = records.find(r => r.period === selectedPeriod) || records[0];

  const subTabs = [
    { id: 'slip' as ToolSubTab, label: '開獎單列印', icon: FileText },
    { id: 'calendar' as ToolSubTab, label: '全年日期表', icon: Calendar },
    { id: 'multiplier' as ToolSubTab, label: '倍數與膽拖', icon: Calculator },
    { id: 'forum' as ToolSubTab, label: '版路討論區', icon: MessageSquare },
    { id: 'voice' as ToolSubTab, label: '真人語音', icon: Mic },
  ];

  return (
    <div className="space-y-4">
      {/* Sub Tabs Scroller */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl overflow-x-auto shadow-md">
        {subTabs.map((t) => {
          const Icon = t.icon;
          const isActive = subTab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setSubTab(t.id)}
              className={`flex-1 min-w-[96px] py-2 px-2.5 flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Active Sub Component */}
      <div>
        {subTab === 'slip' && (
          <DrawPrintSheet
            record={activeRecord}
            recordsList={records}
            onSelectPeriod={onSelectPeriod}
          />
        )}

        {subTab === 'calendar' && (
          <CalendarTable events={calendarEvents} />
        )}

        {subTab === 'multiplier' && (
          <MultiplierTable />
        )}

        {subTab === 'forum' && (
          <CommunityForum
            initialPosts={forumPosts}
            onImportToKeypad={onImportToKeypad}
          />
        )}

        {subTab === 'voice' && (
          <VoiceBroadcastPanel latestDraw={records[0]} />
        )}
      </div>
    </div>
  );
};
