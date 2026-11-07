/**
 * 近10期开奖号码 大号（25-49）与小号（1-24）出现比例折线图
 */
import React, { useState, useMemo } from 'react';
import { TrendingUp, Info, Eye, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { DrawRecord } from '../types/markSix';
import { MarkSixBall } from './MarkSixBall';

interface BigSmallRatioChartProps {
  records: DrawRecord[];
}

export const BigSmallRatioChart: React.FC<BigSmallRatioChartProps> = ({ records }) => {
  const [includeSpecial, setIncludeSpecial] = useState<boolean>(false);
  const [displayMetric, setDisplayMetric] = useState<'ratio' | 'count'>('ratio'); // 比例 % or 个数
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // Take the most recent 10 records and order them chronologically (oldest -> newest, left -> right)
  const chartData = useMemo(() => {
    const recent10 = records.slice(0, 10).reverse();

    return recent10.map((record) => {
      const numbers = includeSpecial
        ? [...record.numbers, record.specialNumber]
        : record.numbers;

      const total = numbers.length;
      const bigNumbers = numbers.filter((n) => n >= 25 && n <= 49);
      const smallNumbers = numbers.filter((n) => n >= 1 && n <= 24);

      const bigCount = bigNumbers.length;
      const smallCount = smallNumbers.length;

      const bigRatio = Math.round((bigCount / total) * 100);
      const smallRatio = 100 - bigRatio;

      return {
        period: record.period,
        drawDate: record.drawDate,
        total,
        bigCount,
        smallCount,
        bigRatio,
        smallRatio,
        bigNumbers,
        smallNumbers,
        specialNumber: record.specialNumber,
      };
    });
  }, [records, includeSpecial]);

  // Aggregate statistics for the 10 periods
  const aggregates = useMemo(() => {
    if (chartData.length === 0) return { avgBigRatio: 50, avgSmallRatio: 50, totalBig: 0, totalSmall: 0 };

    const totalBig = chartData.reduce((acc, cur) => acc + cur.bigCount, 0);
    const totalSmall = chartData.reduce((acc, cur) => acc + cur.smallCount, 0);
    const totalBalls = totalBig + totalSmall || 1;

    const avgBigRatio = Math.round((totalBig / totalBalls) * 100);
    const avgSmallRatio = 100 - avgBigRatio;

    // Latest trend note
    const latest = chartData[chartData.length - 1];
    let trendNote = '大小均衡';
    if (avgBigRatio >= 58) trendNote = '大号持续偏热';
    else if (avgBigRatio <= 42) trendNote = '小号表现强势';

    return {
      avgBigRatio,
      avgSmallRatio,
      totalBig,
      totalSmall,
      trendNote,
      latestRatio: latest ? `${latest.bigCount}大 : ${latest.smallCount}小 (${latest.bigRatio}%)` : '--',
    };
  }, [chartData]);

  // SVG Chart Dimensions
  const svgWidth = 620;
  const svgHeight = 220;
  const padding = { top: 30, right: 35, bottom: 42, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Max value: 100 if ratio, or 6 (or 7) if count
  const maxVal = displayMetric === 'ratio' ? 100 : (includeSpecial ? 7 : 6);

  // Compute coordinate points
  const points = useMemo(() => {
    if (chartData.length === 0) return { big: [], small: [] };

    const stepX = chartData.length > 1 ? graphWidth / (chartData.length - 1) : graphWidth / 2;

    const bigPoints = chartData.map((d, i) => {
      const val = displayMetric === 'ratio' ? d.bigRatio : d.bigCount;
      const x = padding.left + i * stepX;
      const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
      return { x, y, val, data: d, index: i };
    });

    const smallPoints = chartData.map((d, i) => {
      const val = displayMetric === 'ratio' ? d.smallRatio : d.smallCount;
      const x = padding.left + i * stepX;
      const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
      return { x, y, val, data: d, index: i };
    });

    return { big: bigPoints, small: smallPoints };
  }, [chartData, displayMetric, maxVal, graphWidth, graphHeight, padding.left, padding.top]);

  // Helper to construct smooth SVG path
  const createSmoothPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    return pts.reduce((acc, pt, i, arr) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[i - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const bigPath = createSmoothPath(points.big);
  const smallPath = createSmoothPath(points.small);

  // Closed area path for gradient
  const createAreaPath = (pts: { x: number; y: number }[]) => {
    if (pts.length === 0) return '';
    const linePath = createSmoothPath(pts);
    const bottomY = padding.top + graphHeight;
    const firstX = pts[0].x;
    const lastX = pts[pts.length - 1].x;
    return `${linePath} L ${lastX} ${bottomY} L ${firstX} ${bottomY} Z`;
  };

  const bigAreaPath = createAreaPath(points.big);
  const smallAreaPath = createAreaPath(points.small);

  // Active hover detail (or fallback to latest period)
  const activeDetail = hoveredIndex !== null
    ? chartData[hoveredIndex]
    : chartData[chartData.length - 1];

  return (
    <div className="bg-white border border-[#E5E9F0] rounded-3xl p-4 shadow-sm transition-all">
      {/* Header with Title and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#E5E9F0] gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#E9EEF5] flex items-center justify-center text-[#176FC1]">
            <TrendingUp className="w-4 h-4 text-[#176FC1]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#25334A]">
                近10期大小号比例走势折线图
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#E9EEF5] text-[#52627A] font-mono font-bold">
                10期走势
              </span>
            </div>
            <div className="text-[11px] text-[#8994A6] flex items-center gap-2 mt-0.5">
              <span>大号：25 ~ 49</span>
              <span>·</span>
              <span>小号：01 ~ 24</span>
              <span>·</span>
              <span className="text-[#176FC1] font-semibold">{aggregates.trendNote}</span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-center">
          {/* Include Special Ball Toggle */}
          <button
            type="button"
            onClick={() => setIncludeSpecial(!includeSpecial)}
            className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1 ${
              includeSpecial
                ? 'bg-[#D6B875]/20 text-[#25334A] border-[#D6B875]/40 font-bold'
                : 'bg-[#E9EEF5] text-[#52627A] border-[#E5E9F0] hover:text-[#25334A]'
            }`}
            title="是否将特别号码计入大小号统计"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{includeSpecial ? '含特码(7球)' : '仅正码(6球)'}</span>
          </button>

          {/* Metric Toggle (% vs 个数) */}
          <div className="flex items-center p-0.5 bg-[#E9EEF5] rounded-lg text-[11px]">
            <button
              type="button"
              onClick={() => setDisplayMetric('ratio')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                displayMetric === 'ratio' ? 'bg-[#176FC1] text-white shadow-sm' : 'text-[#52627A]'
              }`}
            >
              百分比(%)
            </button>
            <button
              type="button"
              onClick={() => setDisplayMetric('count')}
              className={`px-2 py-0.5 rounded font-semibold transition-colors cursor-pointer ${
                displayMetric === 'count' ? 'bg-[#176FC1] text-white shadow-sm' : 'text-[#52627A]'
              }`}
            >
              出球数
            </button>
          </div>

          {/* Minimize / Expand Toggle */}
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 rounded-lg text-[#8994A6] hover:text-[#25334A] hover:bg-[#E9EEF5] transition-colors cursor-pointer"
            title={isCollapsed ? '展开图表' : '收起图表'}
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Metric Summary Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-3 border-b border-[#E5E9F0] text-xs">
            <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52627A] block">10期大号均占比</span>
                <span className="text-base font-black font-mono text-[#176FC1]">
                  {aggregates.avgBigRatio}%
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#52627A]">
                共 {aggregates.totalBig} 球
              </span>
            </div>

            <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52627A] block">10期小号均占比</span>
                <span className="text-base font-black font-mono text-[#172B50]">
                  {aggregates.avgSmallRatio}%
                </span>
              </div>
              <span className="text-[11px] font-mono text-[#52627A]">
                共 {aggregates.totalSmall} 球
              </span>
            </div>

            <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52627A] block">最新期大小形态</span>
                <span className="text-sm font-bold font-mono text-[#25334A]">
                  {aggregates.latestRatio}
                </span>
              </div>
              <CheckCircle2 className="w-3.5 h-3.5 text-[#168B65]" />
            </div>

            <div className="p-2.5 bg-[#F4F6FA] rounded-xl border border-[#E5E9F0] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#52627A] block">走势偏向指示</span>
                <span className="text-sm font-bold text-[#D6B875]">
                  {aggregates.trendNote}
                </span>
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-[#D6B875]" />
            </div>
          </div>

          {/* Chart Legend & Instruction */}
          <div className="flex items-center justify-between pt-2 pb-1 text-xs text-[#52627A]">
            <div className="flex items-center gap-4">
              {/* Big Number Legend */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#176FC1] border border-white/40 inline-block" />
                <span className="font-semibold text-[#25334A]">大号 (25-49)</span>
              </div>

              {/* Small Number Legend */}
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#172B50] border border-white/40 inline-block" />
                <span className="font-semibold text-[#25334A]">小号 (01-24)</span>
              </div>
            </div>

            <span className="text-[11px] text-[#52627A] hidden sm:inline flex items-center gap-1">
              <Info className="w-3 h-3 text-[#176FC1]" />
              <span>悬停或点击节点查看各期详细开出球</span>
            </span>
          </div>

          {/* SVG Line Chart Area */}
          <div className="relative w-full overflow-x-auto bg-[#F4F6FA] rounded-2xl border border-[#E5E9F0] p-2 mt-1">
            <div className="min-w-[560px]">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto select-none overflow-visible"
              >
                <defs>
                  {/* Big Number Gradient */}
                  <linearGradient id="bigAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#176FC1" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#176FC1" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Small Number Gradient */}
                  <linearGradient id="smallAreaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#172B50" stopOpacity="0.20" />
                    <stop offset="100%" stopColor="#172B50" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Soft Drop Shadow for Line Curves */}
                  <filter id="glowBig" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#176FC1" floodOpacity="0.35" />
                  </filter>
                  <filter id="glowSmall" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#172B50" floodOpacity="0.35" />
                  </filter>
                </defs>

                {/* Horizontal Grid Lines */}
                {(displayMetric === 'ratio'
                  ? [0, 25, 50, 75, 100]
                  : (includeSpecial ? [0, 2, 4, 7] : [0, 2, 4, 6])
                ).map((val) => {
                  const y = padding.top + graphHeight - (val / maxVal) * graphHeight;
                  const isMedian = displayMetric === 'ratio' ? val === 50 : val === 3;

                  return (
                    <g key={val}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={svgWidth - padding.right}
                        y2={y}
                        stroke={isMedian ? '#D6B875' : '#E5E9F0'}
                        strokeWidth={isMedian ? 1.2 : 0.8}
                        strokeDasharray={isMedian ? '3 3' : '2 2'}
                        strokeOpacity={isMedian ? 0.9 : 0.8}
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        fontSize="9"
                        fill={isMedian ? '#D6B875' : '#8994A6'}
                        fontFamily="monospace"
                        fontWeight={isMedian ? 'bold' : 'normal'}
                      >
                        {val}{displayMetric === 'ratio' ? '%' : ''}
                      </text>
                    </g>
                  );
                })}

                {/* Vertical Guides & Period Labels */}
                {chartData.map((d, i) => {
                  const stepX = chartData.length > 1 ? graphWidth / (chartData.length - 1) : graphWidth / 2;
                  const x = padding.left + i * stepX;
                  const isHovered = hoveredIndex === i;

                  return (
                    <g key={d.period}>
                      {/* Vertical line indicator */}
                      <line
                        x1={x}
                        y1={padding.top}
                        x2={x}
                        y2={padding.top + graphHeight}
                        stroke={isHovered ? '#176FC1' : '#E5E9F0'}
                        strokeWidth={isHovered ? 1.5 : 1}
                        strokeDasharray={isHovered ? 'none' : '2 2'}
                        strokeOpacity={isHovered ? 0.9 : 0.6}
                      />

                      {/* X-axis Label (Period short e.g. 034) */}
                      <text
                        x={x}
                        y={padding.top + graphHeight + 16}
                        textAnchor="middle"
                        fontSize="10"
                        fill={isHovered ? '#176FC1' : '#8994A6'}
                        fontFamily="monospace"
                        fontWeight={isHovered ? 'bold' : 'normal'}
                      >
                        {d.period.includes('/') ? d.period.split('/')[1] : d.period}期
                      </text>
                    </g>
                  );
                })}

                {/* Shaded Areas Under Curves */}
                <path d={bigAreaPath} fill="url(#bigAreaGradient)" />
                <path d={smallAreaPath} fill="url(#smallAreaGradient)" />

                {/* Big Number Line Curve */}
                <path
                  d={bigPath}
                  fill="none"
                  stroke="#176FC1"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glowBig)"
                />

                {/* Small Number Line Curve */}
                <path
                  d={smallPath}
                  fill="none"
                  stroke="#172B50"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  filter="url(#glowSmall)"
                />

                {/* Big Number Data Nodes */}
                {points.big.map((pt) => {
                  const isHovered = hoveredIndex === pt.index;
                  return (
                    <g
                      key={`big-${pt.index}`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onClick={() => setHoveredIndex(pt.index)}
                    >
                      {/* Outer pulse when active */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="8"
                          fill="#176FC1"
                          fillOpacity="0.25"
                        />
                      )}

                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 4}
                        fill="#176FC1"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Value label above node */}
                      <text
                        x={pt.x}
                        y={pt.y - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#176FC1"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pt.val}{displayMetric === 'ratio' ? '%' : ''}
                      </text>
                    </g>
                  );
                })}

                {/* Small Number Data Nodes */}
                {points.small.map((pt) => {
                  const isHovered = hoveredIndex === pt.index;
                  return (
                    <g
                      key={`small-${pt.index}`}
                      className="cursor-pointer group"
                      onMouseEnter={() => setHoveredIndex(pt.index)}
                      onClick={() => setHoveredIndex(pt.index)}
                    >
                      {/* Outer pulse when active */}
                      {isHovered && (
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r="8"
                          fill="#172B50"
                          fillOpacity="0.25"
                        />
                      )}

                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? 5.5 : 4}
                        fill="#172B50"
                        stroke="#FFFFFF"
                        strokeWidth="2"
                        className="transition-all"
                      />

                      {/* Value label below node */}
                      <text
                        x={pt.x}
                        y={pt.y + 16}
                        textAnchor="middle"
                        fontSize="9"
                        fill="#172B50"
                        fontFamily="monospace"
                        fontWeight="bold"
                      >
                        {pt.val}{displayMetric === 'ratio' ? '%' : ''}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Interactive Inspection Detail Card for Active Period */}
          {activeDetail && (
            <div className="mt-3 p-3 bg-[#F4F6FA] border border-[#E5E9F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#25334A] bg-white px-2 py-0.5 rounded border border-[#E5E9F0]">
                  第 {activeDetail.period} 期
                </span>
                <span className="text-[#52627A]">{activeDetail.drawDate}</span>
                <span className="text-[#D6B875] font-mono font-semibold">
                  大:小 = {activeDetail.bigCount}:{activeDetail.smallCount}
                </span>
              </div>

              {/* Number Ball Distribution */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Big numbers */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#176FC1] font-bold">
                    大号({activeDetail.bigCount}):
                  </span>
                  {activeDetail.bigNumbers.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {activeDetail.bigNumbers.map((num) => (
                        <MarkSixBall key={num} number={num} size="xs" showMeta={false} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#52627A]">无</span>
                  )}
                </div>

                <span className="text-[#E5E9F0]">|</span>

                {/* Small numbers */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-[#172B50] font-bold">
                    小号({activeDetail.smallCount}):
                  </span>
                  {activeDetail.smallNumbers.length > 0 ? (
                    <div className="flex items-center gap-1">
                      {activeDetail.smallNumbers.map((num) => (
                        <MarkSixBall key={num} number={num} size="xs" showMeta={false} />
                      ))}
                    </div>
                  ) : (
                    <span className="text-[10px] text-[#52627A]">无</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
