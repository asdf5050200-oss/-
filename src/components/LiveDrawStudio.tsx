/**
 * Live Draw Studio (即時攪珠現場與串流直播)
 * Features:
 * 1. Real-time ball drop animation with sound chimes and instant notifications
 * 2. Television broadcast simulation & custom stream URL support
 * 3. Live voice broadcast (Cantonese / Mandarin)
 * 4. Dropped tray: 6 regular balls + 1 special ball
 */
import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Tv, Radio, Sparkles, BellRing, CheckCircle2, Maximize2, ShieldCheck, Flame, RefreshCw } from 'lucide-react';
import { MarkSixBall } from './MarkSixBall';
import { soundEngine, VoiceBroadcaster, getBallColor, getZodiac } from '../utils/markSixUtils';
import { DrawRecord } from '../types/markSix';
import Hls from 'hls.js';

interface LiveDrawStudioProps {
  latestRecord: DrawRecord;
  onCheckWinning: (numbers: number[]) => void;
  onOpenBlockedNotices: () => void;
}

export const LiveDrawStudio: React.FC<LiveDrawStudioProps> = ({
  latestRecord,
  onCheckWinning,
  onOpenBlockedNotices,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0); // 0 to 7 (6 regular + 1 special)
  const [drawnBalls, setDrawnBalls] = useState<number[]>([]);
  const [specialBall, setSpecialBall] = useState<number | null>(null);
  const [streamMode, setStreamMode] = useState<'machine' | 'video'>('machine');
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState<'zh-HK' | 'zh-CN'>('zh-HK');
  const [latestToast, setLatestToast] = useState<{ text: string; ball: number; isSpecial: boolean } | null>(null);
  const [drawSpeed, setDrawSpeed] = useState<'normal' | 'fast'>('normal');
  const [isVideoMuted, setIsVideoMuted] = useState(true);
  const [isVideoLoading, setIsVideoLoading] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  // Pre-selected target balls for this live session (seeded from upcoming period)
  const targetOrder = useRef<number[]>([18, 24, 7, 33, 42, 11]);
  const targetSpecial = useRef<number>(9);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle live TVB stream playback in studio
  useEffect(() => {
    if (streamMode !== 'video') {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    setIsVideoLoading(true);
    const streamUrl = '/api/stream/tvb.m3u8';

    if (Hls.isSupported()) {
      if (hlsRef.current) hlsRef.current.destroy();
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        liveSyncDurationCount: 3,
        manifestLoadingTimeOut: 10000,
      });
      hlsRef.current = hls;
      hls.loadSource(streamUrl);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsVideoLoading(false);
        video.play().catch(() => {
          video.muted = true;
          setIsVideoMuted(true);
          video.play().catch(() => {});
        });
      });

      hls.on(Hls.Events.ERROR, () => {
        setIsVideoLoading(false);
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      video.play().catch(() => {
        video.muted = true;
        setIsVideoMuted(true);
      });
      setIsVideoLoading(false);
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [streamMode]);

  // Sync voice broadcaster state
  useEffect(() => {
    VoiceBroadcaster.isMuted = !voiceEnabled;
    VoiceBroadcaster.lang = voiceLang;
  }, [voiceEnabled, voiceLang]);

  // Handle step progression
  useEffect(() => {
    if (!isPlaying) return;

    const intervalTime = drawSpeed === 'normal' ? 3800 : 2000;

    timerRef.current = setTimeout(() => {
      if (currentStep < 6) {
        const nextBall = targetOrder.current[currentStep];
        const nextStep = currentStep + 1;
        
        soundEngine.playBallDrop(false);
        setDrawnBalls(prev => [...prev, nextBall]);
        setCurrentStep(nextStep);

        const toastMsg = `第 ${nextStep} 個攪出號碼：${nextBall < 10 ? '0' : ''}${nextBall} (${getBallColor(nextBall) === 'red' ? '紅波' : getBallColor(nextBall) === 'blue' ? '藍波' : '綠波'}) 生肖${getZodiac(nextBall)}`;
        setLatestToast({ text: toastMsg, ball: nextBall, isSpecial: false });

        if (voiceEnabled) {
          VoiceBroadcaster.announceBall(nextBall, nextStep, false);
        }
      } else if (currentStep === 6) {
        // Special ball
        const sBall = targetSpecial.current;
        soundEngine.playBallDrop(true);
        setSpecialBall(sBall);
        setCurrentStep(7);
        setIsPlaying(false);

        const toastMsg = `特別號碼攪出：${sBall < 10 ? '0' : ''}${sBall} (${getBallColor(sBall) === 'red' ? '紅波' : getBallColor(sBall) === 'blue' ? '藍波' : '綠波'}) 生肖${getZodiac(sBall)}`;
        setLatestToast({ text: toastMsg, ball: sBall, isSpecial: true });

        if (voiceEnabled) {
          VoiceBroadcaster.announceBall(sBall, 7, true);
        }
      }
    }, intervalTime);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentStep, drawSpeed, voiceEnabled]);

  const handleStartDraw = () => {
    if (currentStep >= 7) {
      handleReset();
    }
    // Randomize balls for this simulated live run
    const pool = Array.from({ length: 49 }, (_, i) => i + 1);
    const chosen: number[] = [];
    for (let i = 0; i < 7; i++) {
      const idx = Math.floor(Math.random() * pool.length);
      chosen.push(pool.splice(idx, 1)[0]);
    }
    targetOrder.current = chosen.slice(0, 6);
    targetSpecial.current = chosen[6];

    setIsPlaying(true);
    soundEngine.playDrumRoll();
    if (voiceEnabled) {
      VoiceBroadcaster.speak(voiceLang === 'zh-HK' ? '香港六合彩，即時現場攪珠現在開始。' : '香港六合彩，即时现场开奖现在开始。');
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    setCurrentStep(0);
    setDrawnBalls([]);
    setSpecialBall(null);
    setLatestToast(null);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      {/* Top TV Studio Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-slate-950 via-slate-900 to-[#101D3A] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold bg-[#176FC1] text-white tracking-wider animate-pulse">
            <Radio className="w-3 h-3" />
            LIVE 直播
          </span>
          <span className="text-xs font-semibold text-slate-200">
            第 26/035 期 即時攪珠現場
          </span>
        </div>

        {/* Studio Controls */}
        <div className="flex items-center gap-1.5">
          {/* Stream Switcher */}
          <button
            type="button"
            onClick={() => setStreamMode(streamMode === 'machine' ? 'video' : 'machine')}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded transition-colors"
            title="切換直播模式"
          >
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <span>{streamMode === 'machine' ? '電視台源' : '3D球箱'}</span>
          </button>

          {/* Voice Switcher */}
          <button
            type="button"
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            className={`p-1.5 rounded transition-colors ${voiceEnabled ? 'text-emerald-400 bg-emerald-950/60' : 'text-slate-400 bg-slate-800'}`}
            title={voiceEnabled ? '語音播報開啟' : '靜音中'}
          >
            {voiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Main Video Screen / Machine Viewport */}
      <div className="relative aspect-video w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden border-b border-slate-800">
        {streamMode === 'machine' ? (
          /* Animated 3D Tumbling Drum Simulation */
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
            {/* Ambient TV Studio Lighting */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Lottery Tumbling Drum Acrylic Sphere */}
            <div className="relative w-44 h-44 sm:w-56 sm:h-56 rounded-full border-4 border-amber-500/30 bg-slate-900/60 backdrop-blur-sm shadow-[0_0_50px_rgba(245,158,11,0.15)] flex items-center justify-center overflow-hidden">
              {/* Spinning Reflection Highlight */}
              <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-transparent ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />

              {/* Extraction Chute Center Ring */}
              <div className="w-16 h-16 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center bg-black/40">
                {isPlaying ? (
                  <span className="text-[10px] font-bold text-amber-400 animate-pulse tracking-tight">攪珠中...</span>
                ) : currentStep === 7 ? (
                  <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                ) : (
                  <Sparkles className="w-6 h-6 text-slate-500" />
                )}
              </div>

              {/* Tumbling Balls swirling in background */}
              {Array.from({ length: 16 }).map((_, idx) => {
                const colors = ['bg-[#176FC1]', 'bg-[#172B50]', 'bg-[#4D8FD6]'];
                const ballColor = colors[idx % 3];
                const animStyle = isPlaying
                  ? {
                      animation: `spin ${(idx % 3) + 2}s linear infinite, bounce ${(idx % 2) + 1.2}s ease-in-out infinite alternate`,
                    }
                  : {};

                return (
                  <div
                    key={idx}
                    className={`absolute w-4 h-4 rounded-full ${ballColor} opacity-75 shadow-sm`}
                    style={{
                      top: `${20 + (idx * 17) % 65}%`,
                      left: `${20 + (idx * 23) % 65}%`,
                      ...animStyle,
                    }}
                  />
                );
              })}
            </div>

            {/* Broadcast Overlay Badges */}
            <div className="absolute top-3 left-3 flex items-center gap-2 text-[10px] text-slate-400 font-mono bg-black/60 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6B875]" />
              <span>監察員現場公證</span>
              <span>·</span>
              <span>49球封存完整</span>
            </div>

            <div className="absolute top-3 right-3 flex items-center gap-1.5 text-[10px] text-slate-300 bg-black/60 px-2 py-1 rounded backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>電視訊號同頻中</span>
            </div>

            {/* Real-time Toast Pop-up Notification (Requirement 1: 實時接收每個落球通知) */}
            {latestToast && (
              <div className="absolute bottom-3 left-3 right-3 sm:left-auto sm:right-3 sm:max-w-xs p-2.5 bg-[#101D3A]/95 border border-[#D6B875]/50 rounded-xl shadow-2xl backdrop-blur-md flex items-center gap-3 animate-slide-up">
                <BellRing className="w-5 h-5 text-[#D6B875] shrink-0 animate-bounce" />
                <div className="text-xs">
                  <div className="font-bold text-[#D6B875]">落球快訊通知</div>
                  <div className="text-slate-200 text-[11px] leading-tight mt-0.5">{latestToast.text}</div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Real TV Broadcast Video Player Feed */
          <div className="relative w-full h-full bg-slate-950 flex items-center justify-center overflow-hidden">
            <video
              ref={videoRef}
              className="w-full h-full object-contain bg-black"
              playsInline
              autoPlay
              muted={isVideoMuted}
              controls
            />

            {/* Loading Indicator */}
            {isVideoLoading && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                <div className="w-10 h-10 rounded-full border-2 border-[#176FC1]/20 border-t-[#176FC1] animate-spin mb-2" />
                <span className="text-xs text-slate-300 font-medium">连接 TVB 现场直播流...</span>
              </div>
            )}

            {/* Live Badge */}
            <div className="absolute top-3 left-3 z-20 flex items-center gap-2 bg-black/70 px-2.5 py-1 rounded-md backdrop-blur-sm border border-white/10 text-[10px]">
              <span className="w-2 h-2 rounded-full bg-[#176FC1] animate-ping" />
              <span className="font-bold text-white tracking-wide">TVB 无线新闻台</span>
              <span className="text-emerald-400 font-mono">0.15s 同步</span>
            </div>

            {/* Unmute Button */}
            {isVideoMuted && !isVideoLoading && (
              <button
                type="button"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.muted = !videoRef.current.muted;
                    setIsVideoMuted(videoRef.current.muted);
                  }
                }}
                className="absolute bottom-3 left-3 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#176FC1] hover:bg-[#155ea5] text-white text-xs font-bold shadow-lg transition-all animate-pulse cursor-pointer"
              >
                <VolumeX className="w-3.5 h-3.5" />
                <span>开启电视声音</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Dropped Ball Chute Tray (落球出球盤) */}
      <div className="p-4 bg-slate-950/90 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">
              攪出號碼 (落球先後):
            </span>
            <span className="text-[11px] text-slate-500">
              {drawnBalls.length}/6 正碼 + {specialBall ? '1' : '0'}/1 特碼
            </span>
          </div>

          {/* Quick Voice Language Switcher */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <button
              type="button"
              onClick={() => setVoiceLang('zh-HK')}
              className={`px-1.5 py-0.5 rounded transition-colors ${voiceLang === 'zh-HK' ? 'text-amber-300 font-bold bg-amber-950/50' : 'hover:text-slate-200'}`}
            >
              粵語
            </button>
            <span>/</span>
            <button
              type="button"
              onClick={() => setVoiceLang('zh-CN')}
              className={`px-1.5 py-0.5 rounded transition-colors ${voiceLang === 'zh-CN' ? 'text-amber-300 font-bold bg-amber-950/50' : 'hover:text-slate-200'}`}
            >
              國語
            </button>
          </div>
        </div>

        {/* Balls Display Tray */}
        <div className="flex items-center justify-between sm:justify-start sm:gap-3 py-2 px-2 bg-slate-900/90 rounded-xl border border-slate-800 min-h-[64px]">
          {/* 6 Regular Ball Slots */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {[0, 1, 2, 3, 4, 5].map((slotIdx) => {
              const ballNum = drawnBalls[slotIdx];
              return (
                <div key={slotIdx} className="flex flex-col items-center">
                  {ballNum ? (
                    <MarkSixBall number={ballNum} size="md" showMeta={true} animate={slotIdx === drawnBalls.length - 1} />
                  ) : (
                    <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-800 bg-slate-950/50 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                      {slotIdx + 1}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Plus sign separator */}
          <span className="text-slate-600 font-bold text-base px-1">+</span>

          {/* Special Number Slot */}
          <div className="flex flex-col items-center">
            {specialBall ? (
              <MarkSixBall number={specialBall} size="md" isSpecial={true} showMeta={true} animate={true} />
            ) : (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-amber-500/40 bg-amber-950/20 flex items-center justify-center text-[10px] text-amber-500/60 font-mono font-bold">
                特
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action Controls & Fast Buttons */}
      <div className="p-3 bg-slate-900 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {!isPlaying ? (
            <button
              type="button"
              onClick={handleStartDraw}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#155ea5] text-white font-semibold text-xs shadow-lg shadow-blue-900/30 active:scale-95 transition-all cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{currentStep === 7 ? '重新攪珠 (Re-live)' : currentStep > 0 ? '繼續落球' : '一鍵收看攪珠 (Live)'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsPlaying(false)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-xs active:scale-95 transition-all"
            >
              <span>暫停攪珠</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            title="清空盤面"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Draw Speed */}
          <button
            type="button"
            onClick={() => setDrawSpeed(drawSpeed === 'normal' ? 'fast' : 'normal')}
            className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium bg-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            {drawSpeed === 'normal' ? '標準速度' : '極速落球 ⚡'}
          </button>
        </div>

        {/* Check Winning Action Trigger */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenBlockedNotices}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-amber-300 bg-amber-950/60 border border-amber-500/30 hover:bg-amber-900/60 transition-colors"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>擋牌名單</span>
          </button>

          {drawnBalls.length > 0 && (
            <button
              type="button"
              onClick={() => onCheckWinning([...drawnBalls, ...(specialBall ? [specialBall] : [])])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-900/20 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>自動核對</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
