import React, { ReactNode } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpandableCardProps {
  id: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  header: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ExpandableCard: React.FC<ExpandableCardProps> = ({
  id,
  isExpanded,
  onToggle,
  header,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200 ${isExpanded ? 'ring-2 ring-indigo-500/20' : 'hover:border-slate-300'} ${className}`}>
      {/* Header Area (Always visible) */}
      <div 
        className="p-4 md:p-5 flex items-center justify-between cursor-pointer select-none"
        onClick={() => onToggle(id)}
      >
        <div className="flex-1 min-w-0 pr-4">
          {header}
        </div>
        <div className="flex-shrink-0 text-slate-400">
          <motion.div
            initial={false}
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} />
          </motion.div>
        </div>
      </div>

      {/* Expanded Content Area */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="p-4 md:p-5 pt-0 border-t border-slate-100 bg-slate-50/50">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
