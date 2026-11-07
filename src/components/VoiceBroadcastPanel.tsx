/**
 * Voice Broadcast & Accessibility Audio Panel (真人語音報碼與無障礙播報)
 * 
 * Requirement 9:
 * 真人語音發聲，為低視能人士提供無障礙使用報碼
 */
import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic, Play, RefreshCw, Eye, Sparkles } from 'lucide-react';
import { VoiceBroadcaster } from '../utils/markSixUtils';
import { DrawRecord } from '../types/markSix';

interface VoiceBroadcastPanelProps {
  latestDraw: DrawRecord;
}

export const VoiceBroadcastPanel: React.FC<VoiceBroadcastPanelProps> = ({ latestDraw }) => {
  const [isMuted, setIsMuted] = useState<boolean>(VoiceBroadcaster.isMuted);
  const [lang, setLang] = useState<'zh-HK' | 'zh-CN'>(VoiceBroadcaster.lang);
  const [rate, setRate] = useState<number>(VoiceBroadcaster.rate);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  useEffect(() => {
    VoiceBroadcaster.isMuted = isMuted;
    VoiceBroadcaster.lang = lang;
    VoiceBroadcaster.rate = rate;
  }, [isMuted, lang, rate]);

  const handleTestVoice = async () => {
    setIsSpeaking(true);
    const sampleText = lang === 'zh-HK'
      ? '六合彩真人語音發聲已就緒。為低視能人士提供清晰即時無障礙報碼。'
      : '六合彩真人语音发声已就绪。为视障朋友提供清晰即时无障碍报号。';
    await VoiceBroadcaster.speak(sampleText);
    setIsSpeaking(false);
  };

  const handleReadFullDraw = async () => {
    setIsSpeaking(true);
    await VoiceBroadcaster.announceFullDraw(latestDraw);
    setIsSpeaking(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Mic className="w-5 h-5 text-amber-400" />
          <span className="text-base font-bold text-white">真人語音發聲報碼 (無障礙輔助)</span>
        </div>

        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-800/40 text-[11px] text-emerald-400 font-semibold">
          <Eye className="w-3.5 h-3.5" />
          <span>低視能友善</span>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
        專為視力障礙及長者設計。開獎落球時即時以真人語音朗讀號碼、波色及生肖，讓您閉上眼睛也能身歷現場。
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Language Selection */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 block mb-2">播報語言選擇：</span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setLang('zh-HK')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                lang === 'zh-HK'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              粵語 / 廣東話 (香港原聲)
            </button>
            <button
              type="button"
              onClick={() => setLang('zh-CN')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-colors ${
                lang === 'zh-CN'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
              }`}
            >
              普通話 / 國語
            </button>
          </div>
        </div>

        {/* Speed Adjustment */}
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-slate-400">朗讀語速調節：</span>
            <span className="text-xs font-mono font-bold text-amber-400">{rate.toFixed(2)}x</span>
          </div>
          <input
            type="range"
            min={0.7}
            max={1.3}
            step={0.05}
            value={rate}
            onChange={(e) => setRate(parseFloat(e.target.value))}
            className="w-full accent-amber-500 mt-2"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1">
            <span>慢速 (0.7x)</span>
            <span>標準 (1.0x)</span>
            <span>快語速 (1.3x)</span>
          </div>
        </div>
      </div>

      {/* Voice Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleTestVoice}
          disabled={isSpeaking}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Play className="w-3.5 h-3.5 text-amber-400 fill-current" />
          <span>試聽發聲效果</span>
        </button>

        <button
          type="button"
          onClick={handleReadFullDraw}
          disabled={isSpeaking}
          className="flex items-center gap-2 px-4 py-2 bg-[#176FC1] hover:bg-[#155ea5] text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-900/30 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          <Volume2 className="w-4 h-4" />
          <span>全篇語音播報第 {latestDraw.period} 期結果</span>
        </button>

        <button
          type="button"
          onClick={() => setIsMuted(!isMuted)}
          className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
            isMuted
              ? 'bg-[#101D3A] border-[#172B50] text-[#D6B875]'
              : 'bg-slate-950 border-slate-800 text-slate-300'
          }`}
        >
          {isMuted ? '目前已靜音 🔇' : '語音狀態：開啟中 🔊'}
        </button>
      </div>
    </div>
  );
};
