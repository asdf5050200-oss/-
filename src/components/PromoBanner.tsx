/**
 * Promotional & App Companion Banner
 * 
 * Requirements:
 * 1. 大家同時也可以下載我們另外開發的APP 天天開彩 體驗
 * 2. 極速通知攪珠結果, 攪珠時打開APP, 通知提示更快更穩定!
 */
import React, { useState } from 'react';
import { Smartphone, Zap, Sparkles, Download, Check, X, Bell } from 'lucide-react';

export const PromoBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  const [downloadModal, setDownloadModal] = useState(false);

  if (dismissed) return null;

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101D3A] via-[#172B50] to-[#101D3A] border border-[#D6B875]/30 p-3 sm:p-4 shadow-xl">
        {/* Ambient background glow */}
        <div className="absolute -right-8 -top-8 w-28 h-28 bg-[#176FC1]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D6B875] to-[#176FC1] flex items-center justify-center text-white shrink-0 shadow-md">
              <Zap className="w-5 h-5 fill-current" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#D6B875]">極速通知攪珠結果</span>
                <span className="text-[10px] bg-[#176FC1] text-white font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                  推薦體驗
                </span>
              </div>
              <p className="text-xs text-[#C8D3E6] font-medium mt-0.5 leading-snug">
                攪珠時打開APP，通知提示更快更穩定！同時可體驗全新姊妹應用
                <span className="text-[#D6B875] font-bold ml-1">「天天開彩」</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setDownloadModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#176FC1] hover:bg-[#155ea5] text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>下載 天天開彩 APP</span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 text-[#C8D3E6]/60 hover:text-white rounded-lg transition-colors cursor-pointer"
              title="關閉提示"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Download Companion App Modal */}
      {downloadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#101D3A] border border-[#172B50] rounded-3xl p-6 w-full max-w-sm text-center shadow-2xl relative">
            <button
              type="button"
              onClick={() => setDownloadModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-[#C8D3E6] hover:text-white bg-[#172B50] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D6B875] to-[#176FC1] flex items-center justify-center text-white mx-auto shadow-xl mb-3">
              <Smartphone className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-bold text-white">天天開彩 APP</h3>
            <p className="text-xs text-[#C8D3E6] mt-1 mb-4">
              多彩種同步直播 · 極速落球推送 · 獨家百期走勢
            </p>

            <div className="p-4 bg-[#172B50] rounded-2xl border border-[#172B50] mb-4 inline-block">
              {/* QR Code Graphic Placeholder */}
              <div className="w-32 h-32 bg-white p-2 rounded-xl flex flex-col items-center justify-center text-slate-950 font-mono text-[9px]">
                <div className="grid grid-cols-6 gap-1 w-full h-full p-1 bg-slate-100 rounded">
                  {Array.from({ length: 36 }).map((_, i) => (
                    <div
                      key={i}
                      className={`${(i * 7) % 3 === 0 ? 'bg-[#101D3A]' : 'bg-transparent'} rounded-[1px]`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] text-[#C8D3E6] block mt-2">掃描二維碼立即安裝</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  alert('正在引導至 iOS / Android 應用程式商店下載...');
                  setDownloadModal(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#176FC1] hover:bg-[#155ea5] text-white font-bold text-xs shadow-lg transition-transform active:scale-95 cursor-pointer"
              >
                直接於手機上下載安裝 (iOS / Android)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
