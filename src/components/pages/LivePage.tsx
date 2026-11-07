import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Maximize2,
  CheckCircle2,
  Sparkles,
  Tv,
  Settings2,
  ExternalLink,
  AlertTriangle,
  X,
  Volume2,
  VolumeX,
  RefreshCw,
  Layers,
  Calendar,
  Clock,
  Film,
  Award,
  Check,
  Printer,
  ChevronRight,
  Radio,
} from 'lucide-react';
import { DrawRecord, StreamSource } from '../../types/markSix';
import { MarkSixBall } from '../MarkSixBall';
import { soundEngine, VoiceBroadcaster, getBallColor, getZodiac } from '../../utils/markSixUtils';
import { MarkSixApiService } from '../../services/markSixApi';
import { MOCK_DRAW_RECORDS } from '../../data/mockData';
import Hls from 'hls.js';

interface LivePageProps {
  latestRecord: DrawRecord;
  historicalRecords?: DrawRecord[];
  onCheckWinning: (numbers: number[]) => void;
  voiceActive: boolean;
  onToggleVoice: () => void;
  onOpenApiSettings?: () => void;
  onOpenPrintSheet?: (period: string) => void;
}

export const LivePage: React.FC<LivePageProps> = ({
  latestRecord,
  historicalRecords,
  onCheckWinning,
  voiceActive,
  onOpenApiSettings,
  onOpenPrintSheet,
}) => {
  const allRecords = historicalRecords && historicalRecords.length > 0 ? historicalRecords : MOCK_DRAW_RECORDS;
  const recentHistoricalDraws = allRecords.slice(0, 10);

  // Replay video selection state (if user selects a previous draw session)
  const [selectedReplayPeriod, setSelectedReplayPeriod] = useState<string | null>(null);
  const [replayStep, setReplayStep] = useState<number>(7); // 0 to 7
  const [isReplaying, setIsReplaying] = useState<boolean>(false);
  const replayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Live video stream state (TVB News live broadcast)
  const config = MarkSixApiService.getConfig();
  const [streamSources, setStreamSources] = useState<StreamSource[]>(config.streamSources || []);
  const [activeStreamId, setActiveStreamId] = useState<string>(config.activeStreamId || 'tvb_local_proxy');
  const [streamUrl, setStreamUrl] = useState<string>(config.streamUrl || '/api/stream/tvb.m3u8');
  const [streamType, setStreamType] = useState<string>(config.streamType || 'm3u8');
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState<boolean>(false);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [streamKey, setStreamKey] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Video filter category for historical archives
  const [filterType, setFilterType] = useState<'all' | 'snowball' | 'jackpot'>('all');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const failoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);

  const activeReplayDraw = selectedReplayPeriod
    ? allRecords.find((r) => r.period === selectedReplayPeriod) || null
    : null;

  // Sync state with latest config
  useEffect(() => {
    const fresh = MarkSixApiService.getConfig();
    if (fresh.streamSources) setStreamSources(fresh.streamSources);
    if (fresh.streamUrl && fresh.streamUrl !== streamUrl) {
      setStreamUrl(fresh.streamUrl);
      setStreamType(fresh.streamType || 'm3u8');
      if (fresh.activeStreamId) setActiveStreamId(fresh.activeStreamId);
    }
  }, []);

  // Auto-dismiss fallback notice after 6 seconds
  useEffect(() => {
    if (fallbackNotice) {
      const t = setTimeout(() => setFallbackNotice(null), 6000);
      return () => clearTimeout(t);
    }
  }, [fallbackNotice]);

  const handleReloadStream = () => {
    setVideoError(null);
    setIsLoadingVideo(true);
    setStreamKey((k) => k + 1);
  };

  const handleToggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const handleTogglePip = async () => {
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      } else if (videoRef.current && document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
      }
    } catch (err) {
      console.warn('PiP not available:', err);
    }
  };

  // Initialize HLS for TVB live broadcast
  useEffect(() => {
    // If user is currently playing a historical replay session, pause HLS
    if (selectedReplayPeriod || !streamUrl) {
      setIsLoadingVideo(false);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const isHls = streamType === 'm3u8' || streamUrl.includes('.m3u8') || streamType === 'auto';
    const isIframe = streamType === 'iframe' || streamUrl.includes('iframe') || streamUrl.includes('embed');
    const video = videoRef.current;

    setVideoError(null);

    if (isIframe) {
      setIsLoadingVideo(false);
      return;
    }

    if (!video) return;

    setIsLoadingVideo(true);

    const fallbackToBackup = (reason: string) => {
      const fallbackSource =
        streamSources.find((s) => s.id !== activeStreamId && s.enabled) ||
        streamSources.find((s) => s.id === 'tvb_local_proxy') ||
        streamSources.find((s) => s.id === 'tvb_h5_direct');

      if (fallbackSource && streamUrl !== fallbackSource.url) {
        setIsLoadingVideo(false);
        setFallbackNotice(`原信号不可达（${reason}），已自动切换至【${fallbackSource.name}】`);
        setActiveStreamId(fallbackSource.id);
        setStreamUrl(fallbackSource.url);
        setStreamType(fallbackSource.type);
        setStreamKey((k) => k + 1);
        MarkSixApiService.saveConfig({
          activeStreamId: fallbackSource.id,
          streamUrl: fallbackSource.url,
          streamType: fallbackSource.type,
        });
      } else {
        setVideoError('当前直播信号连接异常，请点击“刷新”或切换备用直播源');
        setIsLoadingVideo(false);
      }
    };

    if (failoverTimeoutRef.current) clearTimeout(failoverTimeoutRef.current);
    failoverTimeoutRef.current = setTimeout(() => {
      if (video.paused && video.readyState < 2) {
        fallbackToBackup('连接响应超时');
      }
    }, 12000);

    const handlePlaying = () => {
      setIsLoadingVideo(false);
      setVideoError(null);
      if (failoverTimeoutRef.current) clearTimeout(failoverTimeoutRef.current);
      if (video) setIsMuted(video.muted);
    };

    const handleWaiting = () => {
      setIsLoadingVideo(true);
    };

    const handleVideoError = () => {
      fallbackToBackup('信号解码异常');
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('canplay', handlePlaying);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('error', handleVideoError);

    if (isHls) {
      if (Hls.isSupported()) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          liveSyncDurationCount: 3,
          maxBufferLength: 30,
          maxMaxBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
          levelLoadingMaxRetry: 3,
        });
        hlsRef.current = hls;
        hls.loadSource(streamUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            video.muted = true;
            setIsMuted(true);
            video.play().catch(() => {});
          });
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('HLS Network error, attempting recovery...', data);
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('HLS Media error, attempting recovery...', data);
                hls.recoverMediaError();
                break;
              default:
                console.error('Fatal unrecoverable HLS error:', data);
                fallbackToBackup('HLS 信号异常');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => {});
        });
      }
    } else {
      video.src = streamUrl;
      video.play().catch(() => {
        video.muted = true;
        setIsMuted(true);
        video.play().catch(() => {});
      });
    }

    return () => {
      if (failoverTimeoutRef.current) clearTimeout(failoverTimeoutRef.current);
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('canplay', handlePlaying);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('error', handleVideoError);
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [selectedReplayPeriod, streamUrl, streamType, streamKey]);

  // Handle previous draw playback trigger
  const handleSelectDrawVideo = (draw: DrawRecord) => {
    setSelectedReplayPeriod(draw.period);
    setReplayStep(7); // show all extracted balls or start step
    setIsReplaying(true);
    soundEngine.playDrumRoll();
    if (voiceActive) {
      VoiceBroadcaster.speak(`正在播放第 ${draw.period} 期香港六合彩現場開獎實況錄像`);
    }
    // Scroll player into view
    playerContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleReturnToLive = () => {
    setSelectedReplayPeriod(null);
    setIsReplaying(false);
    if (replayTimerRef.current) clearTimeout(replayTimerRef.current);
    soundEngine.playBallDrop(false);
  };

  // Replay ball stepping simulation for replay
  const handleStartReplayStepByStep = () => {
    if (!activeReplayDraw) return;
    setReplayStep(0);
    setIsReplaying(true);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      setReplayStep(step);
      if (step <= 6) {
        const b = activeReplayDraw.drawnOrder[step - 1];
        soundEngine.playBallDrop(false);
        if (voiceActive) VoiceBroadcaster.announceBall(b, step, false);
      } else if (step === 7) {
        soundEngine.playBallDrop(true);
        if (voiceActive) VoiceBroadcaster.announceBall(activeReplayDraw.specialNumber, 7, true);
        clearInterval(interval);
      }
    }, 2200);
  };

  const filteredDraws = recentHistoricalDraws.filter((d) => {
    if (filterType === 'snowball') return d.isSnowball;
    if (filterType === 'jackpot') return d.prizes.first.count > 0;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* 1. TOP SECTION: TVB NEWS LIVE BROADCAST OR SELECTED DRAW REPLAY */}
      <div
        ref={playerContainerRef}
        className={`bg-[#101D3A] border border-[#172B50] rounded-3xl overflow-hidden shadow-xl relative ${
          isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : ''
        }`}
      >
        {/* Replay Notice Switch Banner (When watching previous draw video) */}
        {activeReplayDraw && (
          <div className="px-4 py-2.5 bg-[#172B50] border-b border-[#25334A] flex items-center justify-between z-30">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black bg-[#D6B875] text-[#101D3A] tracking-wider">
                <Film className="w-3 h-3" />
                錄像回放
              </span>
              <span className="font-bold text-white">
                正在回放：第 {activeReplayDraw.period} 期 現場攪珠錄像
              </span>
              <span className="text-[11px] text-[#AAB5C8] hidden sm:inline">
                ({activeReplayDraw.drawDate} {activeReplayDraw.dayOfWeek})
              </span>
            </div>

            <button
              type="button"
              onClick={handleReturnToLive}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>切回 TVB 新聞現場</span>
            </button>
          </div>
        )}

        {/* Viewport Stage: Live TVB Video OR Previous Draw Replay Screen */}
        <div className="relative aspect-video w-full bg-[#101D3A] flex flex-col items-center justify-center overflow-hidden">
          {activeReplayDraw ? (
            /* PREVIOUS DRAW VIDEO REPLAY SCREEN */
            <div className="relative w-full h-full bg-[#101D3A] flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden">
              {/* Studio Backdrop Ambient */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#172B50_0%,_#101D3A_85%)]" />

              {/* Top Watermark */}
              <div className="w-full flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-[#101D3A]/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-[#172B50] text-xs">
                  <span className="w-2 h-2 rounded-full bg-[#D6B875] animate-pulse" />
                  <span className="font-black text-white tracking-wide">TVB NEWS · 官方開彩實況存檔</span>
                </div>
                <span className="text-[11px] font-mono text-[#168B65] bg-[#E8F5EF] border border-[#168B65]/30 px-2 py-0.5 rounded-lg font-bold">
                  現場公證高清
                </span>
              </div>

              {/* Center TV Stage Display of Extracted Balls */}
              <div className="z-10 flex flex-col items-center text-center my-auto">
                <div className="text-xs text-[#AAB5C8] font-medium mb-1">
                  第 {activeReplayDraw.period} 期 現場攪珠結果公佈
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-white mb-4">
                  {activeReplayDraw.drawDate} {activeReplayDraw.dayOfWeek}
                  {activeReplayDraw.snowballName && (
                    <span className="ml-2 text-[#D6B875] font-bold">· {activeReplayDraw.snowballName}</span>
                  )}
                </h3>

                {/* 6 Regular Balls + 1 Special Ball Tray */}
                <div className="flex items-center gap-1.5 sm:gap-3 p-3 bg-[#172B50]/80 rounded-2xl border border-[#25334A] backdrop-blur-md shadow-xl">
                  {activeReplayDraw.drawnOrder.slice(0, replayStep).map((num, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <MarkSixBall number={num} size="md" showMeta={true} animate={idx === replayStep - 1} />
                      <span className="text-[9px] text-[#AAB5C8] font-mono mt-1">正{idx + 1}</span>
                    </div>
                  ))}

                  {replayStep >= 7 && (
                    <>
                      <span className="text-[#AAB5C8] font-bold px-1">+</span>
                      <div className="flex flex-col items-center">
                        <MarkSixBall number={activeReplayDraw.specialNumber} size="md" isSpecial={true} showMeta={true} animate={true} />
                        <span className="text-[9px] text-[#D6B875] font-mono mt-1 font-bold">特別號</span>
                      </div>
                    </>
                  )}
                </div>

                {/* Prize Payout Highlight */}
                <div className="mt-4 flex items-center gap-2 text-xs text-white bg-[#172B50] px-3.5 py-1.5 rounded-xl border border-[#25334A]">
                  <Award className="w-3.5 h-3.5 text-[#D6B875]" />
                  <span>
                    頭獎：{activeReplayDraw.prizes.first.count > 0 ? `${activeReplayDraw.prizes.first.count} 注中` : '無人中 (累積至下期)'}
                  </span>
                  {activeReplayDraw.prizes.first.amountPerUnit > 0 && (
                    <span className="text-[#D6B875] font-bold font-mono">
                      每注 ${activeReplayDraw.prizes.first.amountPerUnit.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Bottom Replay Action Bar */}
              <div className="w-full flex items-center justify-between z-10 pt-2 border-t border-[#172B50]">
                <button
                  type="button"
                  onClick={handleStartReplayStepByStep}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#172B50] hover:bg-[#25334A] text-white text-xs font-bold border border-[#25334A] transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#D6B875]" />
                  <span>重新演示開彩</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onCheckWinning(activeReplayDraw.numbers)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#168B65] hover:bg-[#127052] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>核對我的號碼</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleReturnToLive}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <span>返回直播</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* TVB LIVE VIDEO PLAYER (NO 3D, PURE REAL VIDEO STREAM) */
            <>
              {/* Television Corner Bug / Watermark */}
              <div className="absolute top-3 left-3.5 z-20 flex items-center gap-2 bg-[#101D3A]/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-[#172B50] pointer-events-none select-none">
                <span className="w-2 h-2 rounded-full bg-[#168B65] animate-pulse" />
                <span className="text-[11px] font-black tracking-wider text-white">TVB 無綫新聞</span>
                <span className="text-[9px] font-mono text-[#168B65] bg-[#E8F5EF] px-1 py-0.2 rounded border border-[#168B65]/30 font-bold">
                  LIVE
                </span>
              </div>

              {/* Fallback Failover Notification Banner */}
              {fallbackNotice && (
                <div className="absolute top-2 left-2 right-2 bg-[#101D3A]/95 border border-[#176FC1]/60 rounded-xl px-3 py-2 flex items-center justify-between text-xs z-30 shadow-xl animate-slide-up">
                  <div className="flex items-center gap-2 text-white">
                    <AlertTriangle className="w-4 h-4 text-[#D6B875] shrink-0" />
                    <span className="text-[11px] font-medium leading-tight">{fallbackNotice}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFallbackNotice(null)}
                    className="text-[#AAB5C8] hover:text-white p-1 cursor-pointer shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Video Loading Indicator */}
              {isLoadingVideo && !videoError && (
                <div className="absolute inset-0 bg-[#101D3A]/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 z-20 pointer-events-none">
                  <div className="relative mb-3 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full border-2 border-[#176FC1]/20 border-t-[#176FC1] animate-spin" />
                    <Tv className="w-5 h-5 text-[#176FC1] absolute" />
                  </div>
                  <span className="text-xs font-bold text-white tracking-wide mb-1">
                    正在連接 TVB 現場直播信號...
                  </span>
                  <span className="text-[10px] text-[#AAB5C8] font-mono">
                    超清專線極速加載中
                  </span>
                </div>
              )}

              {/* Floating Unmute Button */}
              {isMuted && !isLoadingVideo && !videoError && streamType !== 'iframe' && (
                <button
                  type="button"
                  onClick={handleToggleSound}
                  className="absolute bottom-4 left-4 z-30 flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold shadow-xl backdrop-blur-md transition-all active:scale-95 cursor-pointer animate-pulse"
                  title="點擊開啟電視原聲"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>點擊開啟聲音</span>
                </button>
              )}

              {/* Real Video Element */}
              {streamUrl ? (
                streamType === 'iframe' || streamUrl.includes('iframe') || streamUrl.includes('embed') ? (
                  <div className="relative w-full h-full flex flex-col">
                    <iframe
                      src={streamUrl}
                      title="Live Stream"
                      className="w-full h-full border-0 flex-1"
                      onLoad={() => setIsLoadingVideo(false)}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                    {streamUrl.includes('tvb.com') && (
                      <div className="absolute inset-0 bg-[#101D3A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-5 text-center z-10">
                        <div className="w-12 h-12 rounded-2xl bg-[#172B50] border border-[#25334A] flex items-center justify-center mb-3">
                          <Tv className="w-6 h-6 text-[#176FC1]" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">TVB 無綫新聞官方直播網</h4>
                        <p className="text-xs text-[#AAB5C8] max-w-sm mb-4 leading-relaxed">
                          TVB 官方新聞網站設置了跨域安全策略。您可以在獨立新窗口中完整收看，或直接切換至內嵌播放的「超清專線」。
                        </p>
                        <div className="flex items-center gap-2.5">
                          <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold transition-all shadow-md"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>原站全屏打開播放</span>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative w-full h-full flex items-center justify-center bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-full object-contain"
                      playsInline
                      autoPlay
                      muted={isMuted}
                      controls
                    />
                    {videoError && (
                      <div className="absolute inset-0 bg-[#101D3A]/90 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                        <AlertTriangle className="w-5 h-5 text-[#D6B875] mb-1.5" />
                        <p className="text-xs text-[#D6B875] mb-1 font-bold">{videoError}</p>
                        <p className="text-[10px] text-[#C8D3E6] mb-3">當前流信號暫時不可達，請點擊重試</p>
                        <button
                          type="button"
                          onClick={handleReloadStream}
                          className="px-4 py-2 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          重新連接信號
                        </button>
                      </div>
                    )}
                  </div>
                )
              ) : null}
            </>
          )}
        </div>

        {/* Professional Television Player Bottom Control Bar */}
        <div className="px-4 py-2.5 bg-[#101D3A] border-t border-[#172B50] flex flex-wrap items-center justify-between gap-3 text-white">
          {/* Left: TV Channel Info & Live Pulse */}
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-[#172B50] text-[#D6B875] border border-[#D6B875]/40 tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D6B875] animate-pulse" />
              LIVE
            </span>
            <span className="text-xs font-bold text-white tracking-tight">
              {activeReplayDraw ? `第 ${activeReplayDraw.period} 期 開獎錄像` : 'TVB 無綫新聞台'}
            </span>
            <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono text-[#AAB5C8] bg-[#172B50] border border-[#172B50]">
              1080P 超清
            </span>
          </div>

          {/* Center: Program Broadcast Notice */}
          <div className="text-xs text-[#AAB5C8] hidden md:flex items-center gap-1.5 font-medium">
            <Radio className="w-3.5 h-3.5 text-[#D6B875]" />
            <span>香港六合彩 · 逢星期二/四/日 21:30 現場攪珠直播</span>
          </div>

          {/* Right: Essential TV Player Actions */}
          <div className="flex items-center gap-1.5">
            {/* Sound Toggle */}
            {!activeReplayDraw && streamType !== 'iframe' && (
              <button
                type="button"
                onClick={handleToggleSound}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  !isMuted
                    ? 'bg-[#172B50] border-[#D6B875]/60 text-[#D6B875]'
                    : 'bg-[#172B50] border-[#172B50] text-[#AAB5C8] hover:text-white'
                }`}
                title={isMuted ? '開啟聲音' : '靜音'}
              >
                {!isMuted ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}

            {/* Refresh Stream */}
            {!activeReplayDraw && (
              <button
                type="button"
                onClick={handleReloadStream}
                className="p-1.5 rounded-xl bg-[#172B50] text-[#AAB5C8] hover:text-[#D6B875] border border-[#172B50] transition-colors cursor-pointer"
                title="重新連接信號"
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingVideo ? 'animate-spin text-[#D6B875]' : ''}`} />
              </button>
            )}

            {/* Picture in Picture */}
            {!activeReplayDraw && streamType !== 'iframe' && (
              <button
                type="button"
                onClick={handleTogglePip}
                className="p-1.5 rounded-xl bg-[#172B50] text-[#AAB5C8] hover:text-white border border-[#172B50] transition-colors cursor-pointer hidden sm:block"
                title="畫中畫"
              >
                <Layers className="w-4 h-4" />
              </button>
            )}

            {/* Settings */}
            {onOpenApiSettings && (
              <button
                type="button"
                onClick={onOpenApiSettings}
                className="p-1.5 rounded-xl bg-[#172B50] text-[#AAB5C8] hover:text-[#D6B875] border border-[#172B50] transition-colors cursor-pointer"
                title="設置與直播源"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            )}

            {/* Fullscreen */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-[#172B50] text-[#AAB5C8] hover:text-white border border-[#172B50] transition-colors cursor-pointer"
              title="全屏"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. MIDDLE STATUS BANNER */}
      <div className="bg-white border border-[#E5E9F0] rounded-2xl p-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E9EEF5] flex items-center justify-center text-[#176FC1]">
            <Clock className="w-5 h-5 text-[#176FC1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#25334A]">下期開獎預告</span>
              <span className="text-[11px] font-mono text-[#D6B875] font-bold">第 26/035 期</span>
            </div>
            <div className="text-[11px] text-[#8994A6] mt-0.5">
              3月26日 (星期四) 21:30 · 估計頭獎基金 <span className="text-[#D6B875] font-bold font-mono">$8,000,000</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#168B65] bg-[#E8F5EF] px-3 py-1.5 rounded-xl border border-[#168B65]/20 font-medium">
          <span className="w-2 h-2 rounded-full bg-[#168B65] animate-pulse" />
          <span>現場監察公證同頻</span>
        </div>
      </div>

      {/* 3. BOTTOM SECTION: 往期开奖一起前几期的视频 (PREVIOUS DRAW VIDEO ARCHIVES) */}
      <div className="space-y-3 pt-1">
        {/* Section Header with Category Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
          <div>
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-[#176FC1]" />
              <h2 className="text-sm font-bold text-[#25334A]">往期現場攪珠開獎視頻</h2>
              <span className="text-[11px] font-mono text-[#8994A6]">({filteredDraws.length} 期存檔)</span>
            </div>
            <p className="text-[11px] text-[#8994A6] mt-0.5">
              點擊任一期數卡片，即可在上方屏幕觀看對應期數的開獎現場實況
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-[#E9EEF5] p-0.5 rounded-xl shrink-0 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'all'
                  ? 'bg-[#176FC1] text-white shadow-sm'
                  : 'text-[#52627A] hover:text-[#25334A]'
              }`}
            >
              全部期數
            </button>
            <button
              type="button"
              onClick={() => setFilterType('snowball')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'snowball'
                  ? 'bg-[#176FC1] text-white shadow-sm'
                  : 'text-[#52627A] hover:text-[#25334A]'
              }`}
            >
              金多寶特輯
            </button>
            <button
              type="button"
              onClick={() => setFilterType('jackpot')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                filterType === 'jackpot'
                  ? 'bg-[#176FC1] text-white shadow-sm'
                  : 'text-[#52627A] hover:text-[#25334A]'
              }`}
            >
              頭獎中出期
            </button>
          </div>
        </div>

        {/* Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDraws.map((draw) => {
            const isCurrentPlaying = selectedReplayPeriod === draw.period;
            return (
              <div
                key={draw.period}
                className={`bg-white border rounded-2xl overflow-hidden transition-all flex flex-col justify-between shadow-sm ${
                  isCurrentPlaying
                    ? 'border-[#176FC1] shadow-md ring-1 ring-[#176FC1]'
                    : 'border-[#E5E9F0] hover:border-[#176FC1]/50'
                }`}
              >
                {/* 16:9 Video Thumbnail Frame */}
                <div
                  onClick={() => handleSelectDrawVideo(draw)}
                  className="relative aspect-video w-full bg-[#101D3A] overflow-hidden group cursor-pointer"
                >
                  {/* Studio Backdrop Texture */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#172B50_0%,_#101D3A_90%)]" />

                  {/* Watermark Bug */}
                  <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1.5 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white border border-white/10">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#D6B875]" />
                    <span>TVB 攪珠錄像</span>
                  </div>

                  {/* Duration Badge */}
                  <div className="absolute top-2.5 right-2.5 z-20 bg-black/70 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-400 font-bold border border-white/10">
                    05:18
                  </div>

                  {/* Central Preview Balls Cluster */}
                  <div className="absolute inset-0 flex items-center justify-center gap-1.5 z-10 px-4">
                    {draw.numbers.slice(0, 4).map((n) => (
                      <div key={n} className="opacity-95 scale-90 sm:scale-100">
                        <MarkSixBall number={n} size="sm" showMeta={false} />
                      </div>
                    ))}
                    <span className="text-white font-bold opacity-60">...</span>
                    <div className="opacity-95 scale-90 sm:scale-100">
                      <MarkSixBall number={draw.specialNumber} size="sm" isSpecial={true} showMeta={false} />
                    </div>
                  </div>

                  {/* Play Overlay Button */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-black/30 group-hover:bg-black/10 transition-all">
                    <div className="w-12 h-12 rounded-full bg-[#176FC1] group-hover:bg-[#155ea5] group-hover:scale-110 flex items-center justify-center text-white shadow-xl transition-all">
                      <Play className="w-5 h-5 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Bottom Video Meta Bar */}
                  <div className="absolute bottom-2 left-3 right-3 flex items-center justify-between text-xs text-white z-20">
                    <span className="font-extrabold tracking-wide drop-shadow">
                      第 {draw.period} 期 現場開彩全過程
                    </span>
                    <span className="text-[11px] text-slate-200 font-mono drop-shadow">
                      {draw.drawDate}
                    </span>
                  </div>
                </div>

                {/* Card Content Details */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between bg-white">
                  <div>
                    {/* Period Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-[#25334A]">
                          第 {draw.period} 期
                        </span>
                        <span className="text-[11px] text-[#8994A6]">
                          {draw.drawDate} ({draw.dayOfWeek})
                        </span>
                        {draw.snowballName && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#D6B875]/20 text-[#25334A] border border-[#D6B875]/40">
                            {draw.snowballName}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] font-mono text-[#8994A6]">
                        投注額 ${(draw.turnover / 10000).toFixed(0)}萬
                      </span>
                    </div>

                    {/* Extracted Balls Display */}
                    <div className="flex items-center justify-between py-2 px-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0]">
                      <div className="flex items-center gap-1 sm:gap-1.5">
                        {draw.numbers.map((b) => (
                          <MarkSixBall key={b} number={b} size="sm" showMeta={true} />
                        ))}
                      </div>

                      <span className="text-[#8994A6] font-bold px-0.5">+</span>

                      <div>
                        <MarkSixBall number={draw.specialNumber} size="sm" isSpecial={true} showMeta={true} />
                      </div>
                    </div>

                    {/* Ball Drop Sequence */}
                    <div className="mt-2 text-[10px] text-[#8994A6] font-mono flex items-center gap-1">
                      <span className="text-[#25334A] font-bold">落球順序:</span>
                      <span>{draw.drawnOrder.map((n) => (n < 10 ? `0${n}` : n)).join(' → ')}</span>
                      <span className="text-[#D6B875] font-bold ml-1">+ 特{draw.specialNumber < 10 ? `0${draw.specialNumber}` : draw.specialNumber}</span>
                    </div>

                    {/* Head Prize Info */}
                    <div className="mt-2 text-[11px] text-[#25334A] flex items-center justify-between bg-[#E9EEF5]/70 px-2.5 py-1 rounded-lg">
                      <span className="text-[#52627A]">頭獎派彩:</span>
                      <span className="font-mono font-bold text-[#176FC1]">
                        {draw.prizes.first.count > 0
                          ? `${draw.prizes.first.count} 注中 (每注 $${draw.prizes.first.amountPerUnit.toLocaleString()})`
                          : '無人中 (累積至下期)'}
                      </span>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#E5E9F0]">
                    <button
                      type="button"
                      onClick={() => handleSelectDrawVideo(draw)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isCurrentPlaying
                          ? 'bg-[#176FC1] text-white shadow-sm'
                          : 'bg-[#176FC1] hover:bg-[#155ea5] text-white'
                      }`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span>{isCurrentPlaying ? '正於上方播放' : '播放此期錄像'}</span>
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onCheckWinning(draw.numbers)}
                        className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#E5E9F0] text-[#52627A] text-xs font-semibold transition-colors cursor-pointer"
                        title="核對號碼"
                      >
                        <Check className="w-3 h-3 text-[#176FC1]" />
                        <span>核獎</span>
                      </button>

                      {onOpenPrintSheet && (
                        <button
                          type="button"
                          onClick={() => onOpenPrintSheet(draw.period)}
                          className="p-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#E5E9F0] text-[#52627A] transition-colors cursor-pointer"
                          title="打印開彩單"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
