/**
 * Draw Result Statement & Print Sheet (官方开奖单与打印下载)
 * Premium Dark Cinema Edition
 */
import React, { useState } from 'react';
import { Printer, Download, Copy, Check, FileText, X } from 'lucide-react';
import { DrawRecord } from '../types/markSix';
import { MarkSixBall } from './MarkSixBall';

interface DrawPrintSheetProps {
  record: DrawRecord;
  recordsList: DrawRecord[];
  onSelectPeriod: (period: string) => void;
  isModal?: boolean;
  onClose?: () => void;
}

export const DrawPrintSheet: React.FC<DrawPrintSheetProps> = ({
  record,
  recordsList,
  onSelectPeriod,
  isModal = false,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const sum = record.numbers.reduce((acc, curr) => acc + curr, 0);
  const oddCount = record.numbers.filter(n => n % 2 !== 0).length;
  const evenCount = record.numbers.length - oddCount;
  const bigCount = record.numbers.filter(n => n >= 25).length;
  const smallCount = record.numbers.length - bigCount;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyText = () => {
    const text = `
【香港六合彩 第 ${record.period} 期 开奖单】
搅珠日期：${record.drawDate} (${record.dayOfWeek})
总投注额：HK$ ${record.turnover.toLocaleString()}

搅出号码(落球顺序)：${record.drawnOrder.map(n => n < 10 ? `0${n}` : n).join(', ')}
特别号码：${record.specialNumber < 10 ? `0${record.specialNumber}` : record.specialNumber}

搅出号码(排序)：${record.numbers.map(n => n < 10 ? `0${n}` : n).join(', ')} + 特码[${record.specialNumber}]
总和：${sum} | 单双比：${oddCount}单:${evenCount}双 | 大小比：${bigCount}大:${smallCount}小

派彩情况：
- 头奖：${record.prizes.first.count} 注中，每注派 HK$ ${record.prizes.first.amountPerUnit.toLocaleString()}
- 二奖：${record.prizes.second.count} 注中，每注派 HK$ ${record.prizes.second.amountPerUnit.toLocaleString()}
- 三奖：${record.prizes.third.count} 注中，每注派 HK$ ${record.prizes.third.amountPerUnit.toLocaleString()}

下期估计多宝：HK$ ${record.nextJackpotEstimate.toLocaleString()}
祝六合常中！
    `.trim();

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = `香港六合彩 第 ${record.period} 期 开奖公报\n日期: ${record.drawDate}\n号码: ${record.numbers.join(', ')} 特: ${record.specialNumber}\n落球顺序: ${record.drawnOrder.join(', ')}\n`;
    const element = document.createElement('a');
    const file = new Blob([text], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `MarkSix_Draw_${record.period.replace('/', '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const content = (
    <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm">
      {/* Top Controls (Hidden during print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#E5E9F0] mb-4">
        <div className="flex items-center justify-between w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#176FC1]" />
            <span className="text-sm font-bold text-[#25334A]">官方开奖单据</span>
          </div>
          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-1 rounded-full text-[#8994A6] hover:text-[#25334A] bg-[#E9EEF5] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period selector */}
          <select
            value={record.period}
            onChange={(e) => onSelectPeriod(e.target.value)}
            className="bg-[#F4F6FA] border border-[#E5E9F0] text-[#25334A] text-xs rounded-xl px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            {recordsList.slice(0, 30).map((r) => (
              <option key={r.period} value={r.period}>
                第 {r.period} 期 ({r.drawDate})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleCopyText}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#dfe5ee] text-[#52627A] hover:text-[#25334A] text-xs font-semibold border border-[#E5E9F0] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#168B65]" /> : <Copy className="w-3.5 h-3.5 text-[#8994A6]" />}
            <span>{copied ? '已复制' : '复制单据'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E9EEF5] hover:bg-[#dfe5ee] text-[#52627A] hover:text-[#25334A] text-xs font-semibold border border-[#E5E9F0] transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#8994A6]" />
            <span>下载文本</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-[#176FC1] hover:bg-[#125899] text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>打印开奖单</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="hidden sm:flex p-1.5 rounded-xl text-[#8994A6] hover:text-[#25334A] bg-[#E9EEF5] border border-[#E5E9F0] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Card */}
      <div className="print-page bg-[#F4F6FA] p-5 rounded-2xl border border-[#E5E9F0] text-[#25334A] shadow-xs">
        {/* Statement Header */}
        <div className="text-center pb-4 border-b border-[#E5E9F0]">
          <div className="text-[10px] tracking-[0.2em] text-[#8994A6] uppercase font-mono">
            THE HONG KONG JOCKEY CLUB LOTTERY
          </div>
          <div className="text-lg font-extrabold text-[#25334A] tracking-tight mt-1 font-mono">
            香港六合彩 搅珠开奖结果公报
          </div>
          <div className="flex items-center justify-center gap-3 text-xs text-[#8994A6] mt-1 font-mono">
            <span>期数：第 {record.period} 期</span>
            <span>·</span>
            <span>搅珠日期：${record.drawDate} ({record.dayOfWeek})</span>
          </div>
        </div>

        {/* Drawn Numbers Section */}
        <div className="my-5">
          <div className="text-xs font-semibold text-[#8994A6] mb-2">
            搅出号码 (落球先后次序):
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 py-1">
            {record.drawnOrder.map((num, i) => (
              <div key={i} className="flex flex-col items-center">
                <MarkSixBall number={num} size="md" showMeta={true} />
                <span className="text-[9px] text-[#8994A6] font-mono mt-0.5">#{i + 1}</span>
              </div>
            ))}
            <div className="mx-2 text-[#8994A6] font-bold text-lg">+</div>
            <div className="flex flex-col items-center">
              <MarkSixBall number={record.specialNumber} size="md" isSpecial={true} showMeta={true} />
              <span className="text-[9px] text-[#D6B875] font-mono font-bold mt-0.5">特码</span>
            </div>
          </div>
        </div>

        {/* Sorted Display & Numerical Analysis */}
        <div className="p-3 bg-white rounded-2xl border border-[#E5E9F0] grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4 shadow-xs">
          <div>
            <span className="text-[#8994A6] block text-[11px]">总投注额 Turnover</span>
            <span className="font-mono font-bold text-[#25334A]">
              HK$ {record.turnover.toLocaleString()}
            </span>
          </div>
          <div>
            <span className="text-[#8994A6] block text-[11px]">正码总和 (Sum)</span>
            <span className="font-mono font-bold text-[#25334A]">{sum}</span>
          </div>
          <div>
            <span className="text-[#8994A6] block text-[11px]">单双比 (Odd:Even)</span>
            <span className="font-mono font-bold text-[#25334A]">{oddCount} 单 : {evenCount} 双</span>
          </div>
          <div>
            <span className="text-[#8994A6] block text-[11px]">大小比 (Big:Small)</span>
            <span className="font-mono font-bold text-[#25334A]">{bigCount} 大 : {smallCount} 小</span>
          </div>
        </div>

        {/* Prize Payout Table */}
        <div className="rounded-2xl border border-[#E5E9F0] overflow-hidden text-xs bg-white">
          <table className="w-full text-left">
            <thead className="bg-[#E9EEF5] text-[#52627A] font-semibold border-b border-[#E5E9F0]">
              <tr>
                <th className="py-2.5 px-3">奖项 Tier</th>
                <th className="py-2.5 px-3">中奖注数</th>
                <th className="py-2.5 px-3 text-right">每注派彩金额 (HK$)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E9F0] font-mono text-[#25334A]">
              <tr>
                <td className="py-2.5 px-3 font-bold text-[#25334A]">头奖 (1st)</td>
                <td className="py-2.5 px-3">{record.prizes.first.count} 注</td>
                <td className="py-2.5 px-3 text-right font-bold text-[#D6B875]">
                  {record.prizes.first.count === 0 ? '无人中' : `$ ${record.prizes.first.amountPerUnit.toLocaleString()}`}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-semibold text-[#25334A]">二奖 (2nd)</td>
                <td className="py-2.5 px-3">{record.prizes.second.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">
                  $ {record.prizes.second.amountPerUnit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#8994A6]">三奖 (3rd)</td>
                <td className="py-2.5 px-3">{record.prizes.third.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">
                  $ {record.prizes.third.amountPerUnit.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#8994A6]">四奖 (4th)</td>
                <td className="py-2.5 px-3">{record.prizes.fourth.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">$ 9,600</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#8994A6]">五奖 (5th)</td>
                <td className="py-2.5 px-3">{record.prizes.fifth.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">$ 640</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#8994A6]">六奖 (6th)</td>
                <td className="py-2.5 px-3">{record.prizes.sixth.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">$ 320</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 text-[#8994A6]">七奖 (7th)</td>
                <td className="py-2.5 px-3">{record.prizes.seventh.count} 注</td>
                <td className="py-2.5 px-3 text-right text-[#8994A6]">$ 40</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Statement Footer */}
        <div className="mt-4 pt-3 border-t border-[#E5E9F0] flex items-center justify-between text-[11px] text-[#8994A6]">
          <span>下期搅珠预估多宝累积：HK$ {record.nextJackpotEstimate.toLocaleString()}</span>
          <span className="font-mono">HK MARK SIX · LIVE</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101D3A]/60 backdrop-blur-sm animate-fadeIn">
        <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

