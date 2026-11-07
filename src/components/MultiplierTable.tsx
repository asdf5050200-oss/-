/**
 * Multiplier & Bet Combinations Table (倍數表與膽拖計算器)
 * 
 * Requirement 6:
 * 倍數表，查詢倍數變得非常方便
 */
import React, { useState } from 'react';
import { Calculator, TableProperties, HelpCircle, ArrowRight, Check } from 'lucide-react';
import { MULTIPLE_BET_TIERS } from '../data/mockData';
import { calculateBankerLegBets, calculateMultipleBets } from '../utils/markSixUtils';

export const MultiplierTable: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'multiple' | 'banker' | 'prizes'>('multiple');

  // Interactive Banker-Leg Calculator state
  const [bankerCount, setBankerCount] = useState<number>(2);
  const [legCount, setLegCount] = useState<number>(6);
  const [unitCost, setUnitCost] = useState<number>(10); // $10 or $5

  const bankerBets = calculateBankerLegBets(bankerCount, legCount);
  const totalCost = bankerBets * unitCost;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl">
      {/* Tab Switcher */}
      <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-4">
        <button
          type="button"
          onClick={() => setActiveTab('multiple')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'multiple'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          複式注數速查表
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('banker')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'banker'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          膽拖計算器
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('prizes')}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'prizes'
              ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          各獎金分配倍數
        </button>
      </div>

      {activeTab === 'multiple' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-300">複式投注 (選擇 7 至 16 個號碼):</span>
            <span className="text-[11px] text-slate-500">標準每注 HK$ 10 / 部分注項 HK$ 5</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">選取號碼</th>
                  <th className="py-2.5 px-3 font-semibold">總注數</th>
                  <th className="py-2.5 px-3 font-semibold">HK$ 10 金額</th>
                  <th className="py-2.5 px-3 font-semibold">HK$ 5 半注金額</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {MULTIPLE_BET_TIERS.map((tier) => (
                  <tr key={tier.balls} className="hover:bg-slate-800/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-amber-400">{tier.balls} 個字</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{tier.bets.toLocaleString()} 注</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">HK$ {tier.costFull.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-sky-400">HK$ {tier.costHalf.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'banker' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800">
            膽拖投注是指選取 1 至 5 個號碼作為「膽碼」（每注必包含），再選取若干個「拖碼」。此舉能大幅節省複式注數成本！
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Banker count selector */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <label className="text-xs font-semibold text-slate-400 block mb-1">
                膽碼數量 (1 至 5 膽):
              </label>
              <div className="flex items-center gap-1.5 mt-2">
                {[1, 2, 3, 4, 5].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBankerCount(b)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors ${
                      bankerCount === b
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {b} 膽
                  </button>
                ))}
              </div>
            </div>

            {/* Leg count selector */}
            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-400 block">
                  拖碼數量 (需至少 {6 - bankerCount} 個):
                </label>
                <span className="text-xs font-mono font-bold text-amber-400">{legCount} 拖</span>
              </div>
              <input
                type="range"
                min={6 - bankerCount}
                max={20}
                value={legCount}
                onChange={(e) => setLegCount(Number(e.target.value))}
                className="w-full accent-amber-500 mt-2"
              />
            </div>
          </div>

          {/* Unit Bet Choice */}
          <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-400">每注投注金額選擇：</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setUnitCost(10)}
                className={`px-3 py-1 rounded-lg font-mono font-bold ${unitCost === 10 ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                HK$ 10 (正注)
              </button>
              <button
                type="button"
                onClick={() => setUnitCost(5)}
                className={`px-3 py-1 rounded-lg font-mono font-bold ${unitCost === 5 ? 'bg-sky-600 text-white' : 'bg-slate-900 text-slate-400'}`}
              >
                HK$ 5 (半注)
              </button>
            </div>
          </div>

          {/* Calculation Result Summary */}
          <div className="p-4 bg-gradient-to-r from-amber-950/60 to-slate-950 rounded-xl border border-amber-500/40 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block">
                {bankerCount} 膽 {legCount} 拖
              </span>
              <span className="text-lg font-bold font-mono text-white">
                共 {bankerBets.toLocaleString()} 注
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-400 block">總投注金額</span>
              <span className="text-xl font-bold font-mono text-emerald-400">
                HK$ {totalCost.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'prizes' && (
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 leading-relaxed">
            香港六合彩各獎項派彩規則與固定獎金：
          </div>

          <div className="space-y-2">
            {[
              { tier: '頭獎 (1st Prize)', cond: '選中全部 6 個攪出正碼', payout: '按獎金基金分配 (最低不少於 HK$ 8,000,000)' },
              { tier: '二獎 (2nd Prize)', cond: '選中 5 個攪出正碼 + 特別號碼', payout: '按獎金基金分配' },
              { tier: '三獎 (3rd Prize)', cond: '選中 5 個攪出正碼', payout: '按獎金基金分配' },
              { tier: '四獎 (4th Prize)', cond: '選中 4 個攪出正碼 + 特別號碼', payout: '固定獎金 HK$ 9,600' },
              { tier: '五獎 (5th Prize)', cond: '選中 4 個攪出正碼', payout: '固定獎金 HK$ 640' },
              { tier: '六獎 (6th Prize)', cond: '選中 3 個攪出正碼 + 特別號碼', payout: '固定獎金 HK$ 320' },
              { tier: '七獎 (7th Prize)', cond: '選中 3 個攪出正碼', payout: '固定獎金 HK$ 40' },
            ].map((p, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-400">{p.tier}</div>
                  <div className="text-slate-400 text-[11px] mt-0.5">{p.cond}</div>
                </div>
                <div className="text-right font-mono text-slate-200 font-semibold">
                  {p.payout}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
