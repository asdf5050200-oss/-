/**
 * 05 我的 Account - Ultra Clean Cinema Edition
 */
import React, { useState } from 'react';
import { Star, Bell, Sliders, Server, ChevronRight, Trash2 } from 'lucide-react';
import { MarkSixBall } from '../MarkSixBall';
import { VoiceBroadcaster } from '../../utils/markSixUtils';

interface AccountPageProps {
  onOpenApiSettings: () => void;
  onOpenKeypadWithNumbers: (numbers: number[]) => void;
  voiceActive: boolean;
  onToggleVoice: () => void;
}

export const AccountPage: React.FC<AccountPageProps> = ({
  onOpenApiSettings,
  onOpenKeypadWithNumbers,
}) => {
  const [favoriteSets, setFavoriteSets] = useState<number[][]>([
    [7, 12, 18, 24, 33, 45],
    [3, 14, 21, 28, 36, 49],
  ]);

  const [notifyDraw, setNotifyDraw] = useState(true);
  const [notifyBlocked, setNotifyBlocked] = useState(true);
  const [defaultQuality, setDefaultQuality] = useState<'1080P' | '720P' | '480P'>('1080P');
  const [voiceLang, setVoiceLang] = useState<'zh-HK' | 'zh-CN'>(VoiceBroadcaster.lang);
  const [voiceRate, setVoiceRate] = useState<number>(VoiceBroadcaster.rate);

  const handleRateChange = (r: number) => {
    setVoiceRate(r);
    VoiceBroadcaster.rate = r;
  };

  const handleLangChange = (l: 'zh-HK' | 'zh-CN') => {
    setVoiceLang(l);
    VoiceBroadcaster.lang = l;
  };

  const handleRemoveFavorite = (idx: number) => {
    setFavoriteSets(prev => prev.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-3.5">
      {/* 1. 收藏心水号码 */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#D6B875] fill-current" />
            <span className="text-xs font-bold text-[#25334A]">我的心水号码</span>
          </div>
          <span className="text-[11px] text-[#8994A6]">{favoriteSets.length} 组</span>
        </div>

        <div className="space-y-2.5 pt-3">
          {favoriteSets.map((set, idx) => (
            <div
              key={idx}
              className="p-3 bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {set.map((n) => (
                  <MarkSixBall key={n} number={n} size="xs" />
                ))}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => onOpenKeypadWithNumbers(set)}
                  className="px-2.5 py-1 rounded-lg bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  对奖
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveFavorite(idx)}
                  className="p-1 text-[#52627A] hover:text-[#176FC1] transition-colors cursor-pointer"
                  title="删除"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. 提醒通知 */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E9F0]">
          <Bell className="w-4 h-4 text-[#176FC1]" />
          <span className="text-xs font-bold text-[#25334A]">通知提醒</span>
        </div>

        <div className="space-y-3 pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#25334A] font-medium">开奖前提醒 (21:15)</span>
            <button
              type="button"
              onClick={() => setNotifyDraw(!notifyDraw)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${notifyDraw ? 'bg-[#176FC1]' : 'bg-[#E9EEF5] border border-[#E5E9F0]'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifyDraw ? 'right-1' : 'left-1'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#25334A] font-medium">挡牌限额预警通知</span>
            <button
              type="button"
              onClick={() => setNotifyBlocked(!notifyBlocked)}
              className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${notifyBlocked ? 'bg-[#176FC1]' : 'bg-[#E9EEF5] border border-[#E5E9F0]'}`}
            >
              <span className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.5 transition-transform ${notifyBlocked ? 'right-1' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. 播放与真人语音 */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-[#E5E9F0]">
          <Sliders className="w-4 h-4 text-[#176FC1]" />
          <span className="text-xs font-bold text-[#25334A]">播放与语音</span>
        </div>

        <div className="space-y-3 pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[#25334A] font-medium">画质偏好</span>
            <div className="flex items-center gap-1">
              {(['1080P', '720P', '480P'] as const).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setDefaultQuality(q)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors cursor-pointer ${
                    defaultQuality === q ? 'bg-[#176FC1] text-white shadow-xs' : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A]'
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[#25334A] font-medium">报码语言</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => handleLangChange('zh-HK')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  voiceLang === 'zh-HK' ? 'bg-[#176FC1] text-white shadow-xs' : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A]'
                }`}
              >
                粤语
              </button>
              <button
                type="button"
                onClick={() => handleLangChange('zh-CN')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  voiceLang === 'zh-CN' ? 'bg-[#176FC1] text-white shadow-xs' : 'bg-[#E9EEF5] text-[#52627A] hover:text-[#25334A]'
                }`}
              >
                国语
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[#25334A] font-medium">报码语速</span>
              <span className="font-mono text-[#176FC1] font-bold">{voiceRate.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.7}
              max={1.3}
              step={0.05}
              value={voiceRate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-[#176FC1]"
            />
          </div>
        </div>
      </div>

      {/* 4. API 接入设置入口 */}
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
        <div
          onClick={onOpenApiSettings}
          className="flex items-center justify-between cursor-pointer group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4F6FA] border border-[#E5E9F0] flex items-center justify-center text-[#176FC1]">
              <Server className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#25334A] group-hover:text-[#176FC1] transition-colors block">
                后端 API 接口配置
              </span>
              <span className="text-[11px] text-[#8994A6]">自定义数据源与鉴权密钥</span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-[#8994A6] group-hover:text-[#25334A] transition-colors" />
        </div>
      </div>
    </div>
  );
};
