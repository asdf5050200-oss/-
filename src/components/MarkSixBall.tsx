/**
 * Premium Dark Cinema Mark Six Ball Component
 * Designed with 3D specular highlight, depth shading, and dedicated Champagne Gold for Special Number
 */
import React from 'react';
import { getBallColor, getElement, getZodiac } from '../utils/markSixUtils';

interface MarkSixBallProps {
  number: number;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isSpecial?: boolean;
  showMeta?: boolean;
  animate?: boolean;
  className?: string;
  onClick?: () => void;
  selected?: boolean;
}

export const MarkSixBall: React.FC<MarkSixBallProps> = ({
  number,
  size = 'md',
  isSpecial = false,
  showMeta = false,
  animate = false,
  className = '',
  onClick,
  selected = false,
}) => {
  const color = getBallColor(number);
  const zodiac = getZodiac(number);
  const element = getElement(number);
  const numStr = number < 10 ? `0${number}` : `${number}`;

  // Unified High-End Sports Platform Palette:
  // All regular balls (正码 1-6) share one single uniform sports color: Tech Blue (#176FC1)
  // Only the last ball (特别号码 isSpecial) has the distinct highlight color: Champagne Gold (#D6B875)
  const colorStyles = isSpecial
    ? 'from-[#F5E8C7] via-[#D6B875] to-[#9E803A] text-[#101D3A] font-black border-[#F9E2A8]/80 shadow-[0_4px_14px_rgba(214,184,117,0.4)]'
    : 'from-[#3B8BE0] via-[#176FC1] to-[#0E4F90] text-white font-bold border-[#84BCF0]/40 shadow-[0_3px_10px_rgba(23,111,193,0.25)]';

  const sizeStyles = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-14 h-14 sm:w-16 sm:h-16 text-lg sm:text-xl',
  };

  return (
    <div className={`inline-flex flex-col items-center select-none ${className}`}>
      <button
        type="button"
        onClick={onClick}
        disabled={!onClick}
        aria-label={`${isSpecial ? '特别号码' : '正码'} ${number}号`}
        className={`
          relative flex items-center justify-center font-bold font-mono tracking-tight rounded-full
          bg-gradient-to-b ${colorStyles}
          transition-all duration-200
          border border-t-white/40 border-b-black/40
          ${sizeStyles[size]}
          ${isSpecial ? 'ring-2 ring-[#D6B875] ring-offset-2 ring-offset-white' : ''}
          ${selected ? 'ring-2 ring-[#176FC1] scale-110 shadow-lg' : ''}
          ${animate ? 'animate-bounce' : ''}
          ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
        `}
      >
        {/* Optical Curvature Specular Highlight */}
        <span 
          className="absolute inset-0 rounded-full bg-gradient-to-b from-white/35 via-transparent to-transparent pointer-events-none"
          aria-hidden="true"
        />
        
        {/* Soft Inner Shadow */}
        <span 
          className="absolute inset-[1px] rounded-full border border-black/15 pointer-events-none"
          aria-hidden="true"
        />

        {/* Tabular Ball Number */}
        <span className="relative z-10 drop-shadow-sm font-extrabold">{numStr}</span>
      </button>

      {/* Optional Metadata */}
      {showMeta && (
        <span className={`text-[10px] mt-1 font-medium tracking-tight ${isSpecial ? 'text-[#D6B875] font-bold' : 'text-[#8994A6]'}`}>
          {isSpecial ? '特·' : ''}{zodiac}·{element}
        </span>
      )}
    </div>
  );
};
