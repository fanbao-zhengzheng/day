import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { formatDuration, cn } from '../utils';
import { Check, Pause, Play } from './Icons';
import dayjs from 'dayjs';

interface FocusStageProps {
  activeTask?: Task;
  onComplete: (task: Task) => void;
  onPause: (task: Task) => void;
}

export const FocusStage: React.FC<FocusStageProps> = ({ activeTask, onComplete, onPause }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeTask && activeTask.start_time) {
      // Update immediately
      const updateTimer = () => {
        const start = dayjs(activeTask.start_time);
        const now = dayjs();
        const diff = now.diff(start, 'second');
        setElapsed(activeTask.duration_seconds + diff);
      };
      
      updateTimer();
      interval = setInterval(updateTimer, 1000);
    } else {
        setElapsed(0);
    }
    return () => clearInterval(interval);
  }, [activeTask]);

  return (
    <div className="relative z-20 w-full mb-6 perspective-1000">
      <motion.div
        layout
        className={cn(
          "relative w-full overflow-hidden rounded-[2rem] border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] shadow-xl",
          activeTask 
            ? "bg-white/80 backdrop-blur-2xl border-indigo-200/50 min-h-[220px]" 
            : "bg-white/40 backdrop-blur-md border-white/50 h-24 flex items-center justify-center border-dashed"
        )}
      >
        <AnimatePresence mode="wait">
          {activeTask ? (
            <motion.div
              layoutId={`task-${activeTask.id}`} // The Magic Link
              className="w-full h-full p-6 flex flex-col md:flex-row items-center justify-between gap-8"
            >
              {/* Left: Timer */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }} 
                animate={{ opacity: 1, x: 0 }}
                className="flex flex-col items-center md:items-start min-w-[180px]"
              >
                <div className="relative">
                  <span className="font-mono text-6xl md:text-7xl font-bold text-slate-800 tracking-tighter tabular-nums drop-shadow-sm">
                    {formatDuration(elapsed)}
                  </span>
                  <div className="absolute -top-3 -right-6 animate-pulse">
                     <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" />
                  </div>
                </div>
                <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-[0.2em] mt-2">
                  Focusing Time
                </span>
              </motion.div>

              {/* Center: Info */}
              <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left max-w-2xl">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-3">
                  <span className="px-2 py-0.5 bg-indigo-600 text-white rounded-md text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30">
                    Now Doing
                  </span>
                  {activeTask.tags?.split(',').map((t, i) => (
                    <span key={i} className="px-2 py-0.5 bg-white text-indigo-600 rounded-md text-[10px] font-bold border border-indigo-100">
                      #{t.trim()}
                    </span>
                  ))}
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-800 leading-tight mb-2">
                  {activeTask.title}
                </h2>
                {activeTask.description && (
                  <p className="text-slate-500 italic text-sm line-clamp-2">
                    "{activeTask.description}"
                  </p>
                )}
              </div>

              {/* Right: Actions */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-3"
              >
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onPause(activeTask)}
                  className="p-4 rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-lg hover:shadow-xl hover:bg-slate-50 transition-all"
                >
                  <Pause size={24} fill="currentColor" className="opacity-80" />
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onComplete(activeTask)}
                  className="px-8 py-4 rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/30 font-bold flex items-center gap-2 hover:bg-slate-800 transition-all"
                >
                  <Check size={20} strokeWidth={3} />
                  <span>Complete</span>
                </motion.button>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-3 text-slate-400"
            >
              <div className="p-2 bg-indigo-50 rounded-full animate-bounce">
                <Play size={20} className="text-indigo-400 fill-indigo-400" />
              </div>
              <span className="font-medium text-sm tracking-wide">Select a task from the matrix to start focusing</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};