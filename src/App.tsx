/**
 * HK MARK SIX LIVE - PREMIUM DRAWING EXPERIENCE
 * 
 * Design Architecture:
 * - 85% Obsidian Black (#08090C), Charcoal (#111318), Graphite (#191C23)
 * - 10% Cinema Red (#E63943), Bright Red (#FF5058)
 * - 4% Cold White (#F5F6F8), Silver Gray (#9298A3)
 * - 1% Champagne Gold (#D5A43B - dedicated to Special Numbers & critical highlights)
 * 
 * 5 Core Tabs:
 * 01 首页 Home
 * 02 直播 Live
 * 03 记录 Results
 * 04 统计 Statistics
 * 05 我的 Account
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BottomNav, MainTabType } from './components/BottomNav';
import { HomePage } from './components/pages/HomePage';
import { LivePage } from './components/pages/LivePage';
import { ResultsPage } from './components/pages/ResultsPage';
import { StatsPage } from './components/pages/StatsPage';
import { AccountPage } from './components/pages/AccountPage';
import { KeypadChecker } from './components/KeypadChecker';
import { CalendarTable } from './components/CalendarTable';
import { DrawPrintSheet } from './components/DrawPrintSheet';
import { BlockedNoticesModal } from './components/BlockedNoticesModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { MarkSixApiService } from './services/markSixApi';
import { BlockedAnnouncement, CalendarDrawEvent, DrawRecord } from './types/markSix';
import { MOCK_BLOCKED_NOTICES, MOCK_DRAW_RECORDS, MOCK_YEARLY_CALENDAR } from './data/mockData';
import { VoiceBroadcaster } from './utils/markSixUtils';
import { Smartphone, Monitor, X } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<MainTabType>('home');
  
  // Data state
  const [records, setRecords] = useState<DrawRecord[]>(MOCK_DRAW_RECORDS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarDrawEvent[]>(MOCK_YEARLY_CALENDAR);
  const [blockedNotices, setBlockedNotices] = useState<BlockedAnnouncement[]>(MOCK_BLOCKED_NOTICES);

  // Modals & Drawers state
  const [showBlockedModal, setShowBlockedModal] = useState<boolean>(false);
  const [showApiModal, setShowApiModal] = useState<boolean>(false);
  const [showCalendarModal, setShowCalendarModal] = useState<boolean>(false);
  const [showKeypadModal, setShowKeypadModal] = useState<boolean>(false);
  const [printSlipPeriod, setPrintSlipPeriod] = useState<string | null>(null);

  // Keypad prefilled picks
  const [keypadPrefill, setKeypadPrefill] = useState<number[]>([]);

  // Voice state
  const [voiceActive, setVoiceActive] = useState<boolean>(true);

  // Desktop viewport frame toggle: Mobile (390px) vs Wide Cinema
  const [desktopViewMode, setDesktopViewMode] = useState<'mobile' | 'wide'>('mobile');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const hist = await MarkSixApiService.getHistoricalDraws(100);
      if (hist && hist.length > 0) setRecords(hist);
      const notices = await MarkSixApiService.getBlockedNotices();
      setBlockedNotices(notices);
      const cal = await MarkSixApiService.getYearlyCalendar();
      setCalendarEvents(cal);
    } catch (e) {
      console.warn('Initial data load completed with default store', e);
    }
  };

  const handleToggleVoice = () => {
    const next = !voiceActive;
    setVoiceActive(next);
    VoiceBroadcaster.isMuted = !next;
  };

  const handleCheckWinningFromLive = (numbers: number[]) => {
    setKeypadPrefill(numbers.slice(0, 6));
    setShowKeypadModal(true);
  };

  const handleOpenKeypadWithNumbers = (numbers: number[]) => {
    setKeypadPrefill(numbers);
    setShowKeypadModal(true);
  };

  const latestDraw = records[0] || MOCK_DRAW_RECORDS[0];
  const printRecord = records.find(r => r.period === printSlipPeriod) || latestDraw;

  return (
    <div className="min-h-screen bg-[#F4F6FA] text-[#25334A] flex flex-col items-center">
      {/* Desktop Mode Switcher */}
      <div className="hidden lg:flex w-full bg-[#101D3A] border-b border-[#172B50] py-2 px-6 justify-between items-center text-xs text-[#C8D3E6]">
        <span className="font-extrabold tracking-wider text-white font-mono flex items-center gap-2">
          <span>MARK SIX LIVE</span>
          <span className="text-[10px] text-[#D6B875] font-sans px-1.5 py-0.5 rounded bg-[#172B50] font-semibold">
            高级体育版
          </span>
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setDesktopViewMode('mobile')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              desktopViewMode === 'mobile'
                ? 'bg-[#176FC1] text-white font-bold shadow-sm'
                : 'bg-[#172B50] text-[#C8D3E6] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>手机端</span>
          </button>
          <button
            type="button"
            onClick={() => setDesktopViewMode('wide')}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-colors cursor-pointer ${
              desktopViewMode === 'wide'
                ? 'bg-[#176FC1] text-white font-bold shadow-sm'
                : 'bg-[#172B50] text-[#C8D3E6] hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>宽屏模式</span>
          </button>
        </div>
      </div>

      {/* Main Container: Mobile Frame or Full Width */}
      <div className={`w-full ${desktopViewMode === 'mobile' ? 'max-w-md min-h-screen border-x border-[#E5E9F0] shadow-xl bg-[#F4F6FA] relative' : 'max-w-5xl px-4 py-4'} flex flex-col flex-1`}>
        {/* Sticky Header */}
        <Header
          onOpenBlocked={() => setShowBlockedModal(true)}
          onOpenAccount={() => setActiveTab('account')}
          voiceActive={voiceActive}
          onToggleVoice={handleToggleVoice}
          hasUnreadBlocked={blockedNotices.length > 0}
        />

        {/* Scrollable Content Container with Bottom Nav clearance */}
        <main className="flex-1 p-3.5 sm:p-4 space-y-4 pb-24">
          {/* 01 首页 Home */}
          {activeTab === 'home' && (
            <HomePage
              latestRecord={latestDraw}
              onNavigateTab={(tab) => setActiveTab(tab)}
              onOpenCalendar={() => setShowCalendarModal(true)}
              onOpenKeypad={() => setShowKeypadModal(true)}
              onOpenBlocked={() => setShowBlockedModal(true)}
              onOpenPrintSheet={(period) => setPrintSlipPeriod(period)}
            />
          )}

          {/* 02 直播 Live */}
          {activeTab === 'live' && (
            <LivePage
              latestRecord={latestDraw}
              historicalRecords={records}
              onCheckWinning={handleCheckWinningFromLive}
              voiceActive={voiceActive}
              onToggleVoice={handleToggleVoice}
              onOpenApiSettings={() => setShowApiModal(true)}
              onOpenPrintSheet={(period) => setPrintSlipPeriod(period)}
            />
          )}

          {/* 03 记录 Results */}
          {activeTab === 'results' && (
            <ResultsPage
              records={records}
              onOpenPrintSheet={(period) => setPrintSlipPeriod(period)}
            />
          )}

          {/* 04 统计 Statistics */}
          {activeTab === 'stats' && (
            <StatsPage records={records} />
          )}

          {/* 05 我的 Account */}
          {activeTab === 'account' && (
            <AccountPage
              onOpenApiSettings={() => setShowApiModal(true)}
              onOpenKeypadWithNumbers={handleOpenKeypadWithNumbers}
              voiceActive={voiceActive}
              onToggleVoice={handleToggleVoice}
            />
          )}
        </main>

        {/* 5-Tab Fixed Bottom Navigation */}
        <BottomNav
          activeTab={activeTab}
          onChangeTab={(t) => setActiveTab(t)}
          isDrawingLive={true}
        />
      </div>

      {/* Keypad Checker Modal */}
      {showKeypadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto relative">
            <button
              type="button"
              onClick={() => setShowKeypadModal(false)}
              className="absolute top-4 right-4 z-10 p-1.5 rounded-full text-[#8994A6] hover:text-[#25334A] bg-[#E9EEF5] border border-[#E5E9F0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <KeypadChecker
              records={records}
              initialPicks={keypadPrefill}
            />
          </div>
        </div>
      )}

      {/* Blocked Notices Modal */}
      <BlockedNoticesModal
        isOpen={showBlockedModal}
        onClose={() => setShowBlockedModal(false)}
        notices={blockedNotices}
        onSelectNumberForKeypad={(num) => {
          setKeypadPrefill([num]);
          setShowBlockedModal(false);
          setShowKeypadModal(true);
        }}
      />

      {/* Calendar Table Modal */}
      {showCalendarModal && (
        <CalendarTable
          events={calendarEvents}
          isModal={true}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {/* Official Draw Print Sheet Modal */}
      {printSlipPeriod && (
        <DrawPrintSheet
          record={printRecord}
          recordsList={records}
          onSelectPeriod={(p) => setPrintSlipPeriod(p)}
          isModal={true}
          onClose={() => setPrintSlipPeriod(null)}
        />
      )}

      {/* API Settings Modal */}
      <ApiSettingsModal
        isOpen={showApiModal}
        onClose={() => setShowApiModal(false)}
        onConfigSaved={loadData}
      />
    </div>
  );
}
