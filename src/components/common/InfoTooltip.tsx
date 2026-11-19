import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface InfoTooltipProps {
  content: string;
  ariaLabel?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ content, ariaLabel = 'More information' }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1.5 align-middle">
      <button
        type="button"
        className="text-slate-400 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-full"
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="tooltip"
          className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2.5 bg-slate-900 text-white text-xs leading-relaxed rounded-lg shadow-lg pointer-events-none"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
};
