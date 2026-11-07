/**
 * API & Live Stream Integration Modal (直播源与开奖采集配置)
 * Premium Dark Cinema Edition
 */
import React, { useState } from 'react';
import { X, Key, CheckCircle2, AlertTriangle, RefreshCw, Globe, Tv, Copy, Check, Plus, Trash2, Activity, Power, Wifi, WifiOff } from 'lucide-react';
import { MarkSixApiService, DEFAULT_STREAM_SOURCES } from '../services/markSixApi';
import { ApiConfiguration, StreamSource } from '../types/markSix';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfigSaved: () => void;
  initialTab?: 'stream' | 'api' | 'scraper';
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  onConfigSaved,
  initialTab = 'stream',
}) => {
  const currentConfig = MarkSixApiService.getConfig();
  const [activeTab, setActiveTab] = useState<'stream' | 'api' | 'scraper'>(initialTab);

  // Form states
  const [endpointUrl, setEndpointUrl] = useState(currentConfig.endpointUrl);
  const [apiKey, setApiKey] = useState(currentConfig.apiKey);
  const [dataSourceMode, setDataSourceMode] = useState<ApiConfiguration['dataSourceMode']>(currentConfig.dataSourceMode);

  // Multi-source stream state
  const [streamSources, setStreamSources] = useState<StreamSource[]>(
    currentConfig.streamSources && currentConfig.streamSources.length > 0
      ? currentConfig.streamSources
      : DEFAULT_STREAM_SOURCES
  );
  const [activeStreamId, setActiveStreamId] = useState<string>(
    currentConfig.activeStreamId || 'tvb_hls_a'
  );

  // Add source form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState<'m3u8' | 'iframe' | 'mp4'>('m3u8');
  const [newSourceUrl, setNewSourceUrl] = useState('');

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs: number } | null>(null);
  const [batchChecking, setBatchChecking] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleTestApi = async () => {
    if (!endpointUrl) {
      alert('请先输入 API 端点 URL');
      return;
    }
    setTesting(true);
    setTestResult(null);
    const result = await MarkSixApiService.testConnection(endpointUrl, apiKey);
    setTestResult(result);
    setTesting(false);
  };

  const handleCheckSingleStream = async (id: string) => {
    const target = streamSources.find((s) => s.id === id);
    if (!target) return;

    setStreamSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'checking' } : s))
    );

    const result = await MarkSixApiService.checkStreamHealth(target.url, target.type);

    setStreamSources((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: result.status,
              latencyMs: result.latencyMs,
              lastChecked: new Date().toLocaleTimeString(),
            }
          : s
      )
    );
  };

  const handleCheckAllStreams = async () => {
    setBatchChecking(true);
    for (const source of streamSources) {
      if (!source.enabled) continue;
      await handleCheckSingleStream(source.id);
    }
    setBatchChecking(false);
  };

  const handleToggleStreamEnable = (id: string) => {
    setStreamSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const handleSelectActiveStream = (id: string) => {
    setActiveStreamId(id);
  };

  const handleAddCustomSource = () => {
    if (!newSourceName.trim() || !newSourceUrl.trim()) {
      alert('请完整填写视频源名称与流地址 URL');
      return;
    }
    const newSource: StreamSource = {
      id: `custom_${Date.now()}`,
      name: newSourceName.trim(),
      type: newSourceType,
      url: newSourceUrl.trim(),
      enabled: true,
      status: 'unknown',
      isPreset: false,
    };
    setStreamSources((prev) => [...prev, newSource]);
    setActiveStreamId(newSource.id);
    setNewSourceName('');
    setNewSourceUrl('');
    setShowAddForm(false);
  };

  const handleDeleteSource = (id: string) => {
    setStreamSources((prev) => prev.filter((s) => s.id !== id));
    if (activeStreamId === id) {
      const remaining = streamSources.filter((s) => s.id !== id);
      if (remaining.length > 0) setActiveStreamId(remaining[0].id);
    }
  };

  const handleSave = () => {
    const active = streamSources.find((s) => s.id === activeStreamId) || streamSources[0];
    MarkSixApiService.saveConfig({
      endpointUrl: endpointUrl.trim(),
      apiKey: apiKey.trim(),
      streamUrl: active ? active.url : '',
      streamType: active ? active.type : 'm3u8',
      streamSources,
      activeStreamId,
      dataSourceMode,
    });
    onConfigSaved();
    onClose();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Ready-to-run Node.js Scraper Template
  const nodeCrawlerCode = `// markSixCrawler.js (Node.js 极速开奖采集服务)
import express from 'express';
import axios from 'axios';
import * as cheerio from 'cheerio';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// 采集目标：香港赛马会官方或第三方开奖接口
const HKJC_API = 'https://bet.hkjc.com/marksix/api/live_draw';

app.get('/latest', async (req, res) => {
  try {
    // 方案 1: 从官方接口采集
    // const { data } = await axios.get(HKJC_API);
    
    // 方案 2: 标准标准化输出
    res.json({
      code: 200,
      data: {
        period: "26/035",
        drawDate: new Date().toISOString().split('T')[0],
        dayOfWeek: "星期四",
        numbers: [3, 12, 18, 24, 36, 45],
        drawnOrder: [18, 24, 3, 45, 12, 36],
        specialNumber: 8,
        turnover: 48920000,
        nextJackpotEstimate: 28000000
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log('Mark Six 采集服务运行在端口 3001'));`;

  // Python Scraper Template
  const pythonCrawlerCode = `# scraper.py (Python BeautifulSoup / Requests 采集脚本)
import requests
from bs4 import BeautifulSoup
import json
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route('/latest')
def get_latest_draw():
    # 模拟抓取最新一期开奖结果
    payload = {
        "period": "26/035",
        "drawDate": "2026-03-26",
        "numbers": [5, 14, 21, 28, 33, 47],
        "drawnOrder": [14, 28, 5, 47, 21, 33],
        "specialNumber": 7,
        "turnover": 45000000,
        "nextJackpotEstimate": 32000000
    }
    return jsonify({"code": 200, "data": payload})

if __name__ == '__main__':
    app.run(port=3001)`;

  // TVB Live Stream Node.js Proxy Template
  const tvbProxyCode = `// tvbStreamProxy.js (TVB 直播流转发与跨域解除代理)
import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());

// 代理 TVB 官方 m3u8 播放清单并添加合法 Referer 绕过防盗链
app.get('/tvb-live.m3u8', async (req, res) => {
  try {
    const targetUrl = req.query.url || 'https://inews-live.tvb.com/news/live/index.m3u8';
    const response = await axios.get(targetUrl, {
      headers: {
        'Referer': 'https://news.tvb.com/',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)'
      },
      responseType: 'text'
    });
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(response.data);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(3002, () => console.log('TVB 代理已就绪: http://localhost:3002/tvb-live.m3u8'));`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white border border-[#E5E9F0] rounded-3xl p-5 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E9F0]">
          <div className="flex items-center gap-2">
            <Tv className="w-5 h-5 text-[#176FC1]" />
            <span className="text-sm font-bold text-[#25334A]">接入直播源与数据采集</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-[#8994A6] hover:text-[#25334A] bg-[#E9EEF5] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 pt-3 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('stream')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'stream'
                ? 'bg-[#176FC1] text-white shadow-xs'
                : 'bg-[#E9EEF5] text-[#52627A] border border-[#E5E9F0]'
            }`}
          >
            1. 直播源接入 (Video)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'bg-[#176FC1] text-white shadow-xs'
                : 'bg-[#E9EEF5] text-[#52627A] border border-[#E5E9F0]'
            }`}
          >
            2. 数据接口接入 (API)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('scraper')}
            className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              activeTab === 'scraper'
                ? 'bg-[#176FC1] text-white shadow-xs'
                : 'bg-[#E9EEF5] text-[#52627A] border border-[#E5E9F0]'
            }`}
          >
            3. 采集脚本代码
          </button>
        </div>

        {/* TAB 1: 直播源多源管理系统 */}
        {activeTab === 'stream' && (
          <div className="space-y-3.5 text-xs">
            <div className="flex items-center justify-between pb-1">
              <div>
                <span className="text-[#25334A] font-bold">可配置视频源列表</span>
                <span className="text-[11px] text-[#8994A6] ml-1.5 font-mono">({streamSources.length})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-[11px] font-bold cursor-pointer transition-colors shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加源</span>
                </button>
              </div>
            </div>

            {/* Inline Add Source Form */}
            {showAddForm && (
              <div className="p-3.5 bg-[#F4F6FA] rounded-2xl border border-[#176FC1]/40 space-y-2.5 animate-fadeIn">
                <span className="text-[#25334A] font-bold block">添加自定义视频源</span>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-[#8994A6] block mb-1">源名称：</label>
                    <input
                      type="text"
                      placeholder="例如: TVB 备用推流"
                      value={newSourceName}
                      onChange={(e) => setNewSourceName(e.target.value)}
                      className="w-full bg-white border border-[#E5E9F0] rounded-xl px-2.5 py-1.5 text-[#25334A] text-xs focus:outline-none focus:border-[#176FC1]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-[#8994A6] block mb-1">类型：</label>
                    <select
                      value={newSourceType}
                      onChange={(e) => setNewSourceType(e.target.value as any)}
                      className="w-full bg-white border border-[#E5E9F0] rounded-xl px-2.5 py-1.5 text-[#25334A] text-xs focus:outline-none focus:border-[#176FC1] cursor-pointer"
                    >
                      <option value="m3u8">HLS (.m3u8 直链)</option>
                      <option value="iframe">iframe 网页嵌入</option>
                      <option value="mp4">MP4 录像视频</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-[#8994A6] block mb-1">流媒体地址 (URL)：</label>
                  <input
                    type="url"
                    placeholder="https://...m3u8 或 https://..."
                    value={newSourceUrl}
                    onChange={(e) => setNewSourceUrl(e.target.value)}
                    className="w-full bg-white border border-[#E5E9F0] rounded-xl px-2.5 py-1.5 text-[#25334A] text-xs font-mono focus:outline-none focus:border-[#176FC1]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-3 py-1 rounded-xl text-[#8994A6] hover:text-[#25334A] text-xs"
                  >
                    取消
                  </button>
                  <button
                    type="button"
                    onClick={handleAddCustomSource}
                    className="px-3.5 py-1 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white font-bold text-xs"
                  >
                    确认添加
                  </button>
                </div>
              </div>
            )}

            {/* Sources List */}
            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-0.5">
              {streamSources.map((source) => {
                const isActive = activeStreamId === source.id;
                return (
                  <div
                    key={source.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-white border-[#176FC1] shadow-xs'
                        : 'bg-[#F4F6FA] border-[#E5E9F0] hover:border-[#176FC1]/40'
                    } ${!source.enabled ? 'opacity-50' : ''}`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <button
                          type="button"
                          onClick={() => handleSelectActiveStream(source.id)}
                          className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 cursor-pointer ${
                            isActive
                              ? 'border-[#176FC1] bg-[#176FC1]'
                              : 'border-[#E5E9F0] bg-white'
                          }`}
                          title="设为默认播放源"
                        >
                          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </button>

                        <span className="font-bold text-[#25334A] truncate">{source.name}</span>

                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase shrink-0 ${
                            source.type === 'm3u8'
                              ? 'bg-[#E8F5EF] text-[#168B65] border border-[#168B65]/30'
                              : source.type === 'iframe'
                              ? 'bg-[#E9EEF5] text-[#176FC1] border border-[#176FC1]/30'
                              : 'bg-[#F4F6FA] text-[#D6B875] border border-[#D6B875]/40'
                          }`}
                        >
                          {source.type}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStreamEnable(source.id)}
                          className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                            source.enabled
                              ? 'text-[#168B65] border-[#168B65]/30 bg-[#E8F5EF]'
                              : 'text-[#8994A6] border-[#E5E9F0] bg-white'
                          }`}
                          title={source.enabled ? '点击停用' : '点击启用'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        {!source.isPreset && (
                          <button
                            type="button"
                            onClick={() => handleDeleteSource(source.id)}
                            className="p-1 rounded-lg text-[#52627A] hover:text-[#176FC1] border border-[#E5E9F0] bg-white transition-colors cursor-pointer"
                            title="删除自定义源"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* URL String */}
                    <div className="font-mono text-[10px] text-[#52627A] truncate px-1 select-all mb-2">
                      {source.url}
                    </div>

                    {/* Footer Row: Status & Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-[#E5E9F0] text-[11px]">
                      <div className="flex items-center gap-1.5">
                        {source.status === 'online' ? (
                          <span className="flex items-center gap-1 text-[#168B65] font-medium">
                            <Wifi className="w-3.5 h-3.5" />
                            <span>在线 ({source.latencyMs}ms)</span>
                          </span>
                        ) : source.status === 'offline' ? (
                          <span className="flex items-center gap-1 text-[#52627A] font-medium">
                            <WifiOff className="w-3.5 h-3.5" />
                            <span>离线/跨域受限</span>
                          </span>
                        ) : source.status === 'checking' ? (
                          <span className="flex items-center gap-1 text-[#52627A]">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#176FC1]" />
                            <span>连接中...</span>
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[#52627A]">
                            <Activity className="w-3.5 h-3.5" />
                            <span>就绪</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleCheckSingleStream(source.id)}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white hover:bg-[#E9EEF5] text-[#25334A] text-[10px] border border-[#E5E9F0] cursor-pointer"
                        >
                          <Activity className="w-3 h-3 text-[#176FC1]" />
                          <span>状态诊断</span>
                        </button>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-lg bg-[#E9EEF5] text-[#176FC1] text-[10px] font-bold border border-[#176FC1]/30">
                            正在播放
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: 数据接口接入 */}
        {activeTab === 'api' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="text-[#25334A] font-semibold block mb-1.5">开奖数据源：</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDataSourceMode('builtin')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                    dataSourceMode === 'builtin'
                      ? 'bg-[#176FC1] text-white shadow-xs'
                      : 'bg-[#F4F6FA] text-[#52627A] border border-[#E5E9F0]'
                  }`}
                >
                  内置官方验证数据
                </button>
                <button
                  type="button"
                  onClick={() => setDataSourceMode('custom_api')}
                  className={`py-2 px-3 rounded-xl font-bold transition-all cursor-pointer ${
                    dataSourceMode === 'custom_api'
                      ? 'bg-[#176FC1] text-white shadow-xs'
                      : 'bg-[#F4F6FA] text-[#52627A] border border-[#E5E9F0]'
                  }`}
                >
                  自定义开奖 API
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#25334A] font-semibold block mb-1">
                后端 API Base URL:
              </label>
              <div className="relative">
                <Globe className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#52627A]" />
                <input
                  type="url"
                  placeholder="https://api.your-domain.com/v1/marksix"
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full bg-[#F4F6FA] border border-[#E5E9F0] rounded-xl pl-8 pr-3 py-2 text-[#25334A] font-mono placeholder-[#8994A6] focus:outline-none focus:border-[#176FC1]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#25334A] font-semibold block mb-1">
                Bearer Token / 鉴权密钥 (可选):
              </label>
              <div className="relative">
                <Key className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#52627A]" />
                <input
                  type="password"
                  placeholder="Bearer token..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-[#F4F6FA] border border-[#E5E9F0] rounded-xl pl-8 pr-3 py-2 text-[#25334A] font-mono placeholder-[#8994A6] focus:outline-none focus:border-[#176FC1]"
                />
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                disabled={testing || !endpointUrl}
                onClick={handleTestApi}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#dfe5ee] text-[#52627A] font-semibold text-xs border border-[#E5E9F0] transition-colors disabled:opacity-40 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#176FC1] ${testing ? 'animate-spin' : ''}`} />
                <span>{testing ? '验证连接中...' : '验证接口连通性'}</span>
              </button>

              {testResult && (
                <div className={`mt-2 p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                  testResult.success
                    ? 'bg-[#E8F5EF] border-[#168B65]/40 text-[#168B65]'
                    : 'bg-[#E9EEF5] border border-[#172B50]/30 text-[#172B50]'
                }`}>
                  {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0 text-[#168B65]" /> : <AlertTriangle className="w-4 h-4 shrink-0 text-[#172B50]" />}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: 采集脚本代码模板 */}
        {activeTab === 'scraper' && (
          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#25334A] font-bold">Node.js Express 采集端模版:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(nodeCrawlerCode, 'node')}
                  className="flex items-center gap-1 text-[#176FC1] hover:text-[#125899] cursor-pointer"
                >
                  {copiedCode === 'node' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'node' ? '已复制' : '复制代码'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-[#D6B875] bg-[#101D3A] p-3 rounded-2xl overflow-x-auto border border-[#172B50] max-h-40">
                {nodeCrawlerCode}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#25334A] font-bold">Python BeautifulSoup 采集模版:</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(pythonCrawlerCode, 'py')}
                  className="flex items-center gap-1 text-[#176FC1] hover:text-[#125899] cursor-pointer"
                >
                  {copiedCode === 'py' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'py' ? '已复制' : '复制代码'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-[#D6B875] bg-[#101D3A] p-3 rounded-2xl overflow-x-auto border border-[#172B50] max-h-36">
                {pythonCrawlerCode}
              </pre>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[#25334A] font-bold">TVB 直播流转发与 CORS 代理 (Node.js):</span>
                <button
                  type="button"
                  onClick={() => copyToClipboard(tvbProxyCode, 'tvb')}
                  className="flex items-center gap-1 text-[#176FC1] hover:text-[#125899] cursor-pointer"
                >
                  {copiedCode === 'tvb' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode === 'tvb' ? '已复制' : '复制代码'}</span>
                </button>
              </div>
              <pre className="text-[10px] font-mono text-[#D6B875] bg-[#101D3A] p-3 rounded-2xl overflow-x-auto border border-[#172B50] max-h-36">
                {tvbProxyCode}
              </pre>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-5 pt-3 border-t border-[#E5E9F0] flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-[#8994A6] hover:text-[#25334A] text-xs font-semibold cursor-pointer"
          >
            取消
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            保存并生效
          </button>
        </div>
      </div>
    </div>
  );
};
