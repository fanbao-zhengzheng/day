import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task } from '../types';
import { formatHours, cn, formatDuration } from '../utils';
import dayjs from 'dayjs';
import { Activity, Calendar, BarChart2, Clock, Check } from './Icons';

// --- Header ---
export const Header: React.FC<{ 
    onOpenStats: () => void; 
    onOpenCalendar: () => void; 
    onOpenClock: () => void;
    loading: boolean;
}> = ({ onOpenStats, onOpenCalendar, onOpenClock, loading }) => {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        const timer = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="px-6 py-4 flex justify-between items-center bg-white/40 backdrop-blur-xl border-b border-white/50 shrink-0 z-30 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xl shadow-xl shadow-slate-900/20">
                    F
                </div>
                <div className="flex flex-col">
                    <h1 className="font-bold text-slate-800 text-lg leading-none tracking-tight drop-shadow-sm">FlowMatrix</h1>
                    <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Pro Command Center</span>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end mr-2 border-r border-slate-500/20 pr-6">
                    <span className="font-mono text-xl font-bold text-slate-800 leading-none tracking-tight">
                        {time.format('HH:mm')}
                    </span>
                    <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wide">
                        {time.format('ddd, MMM D')}
                    </span>
                </div>

                <div className="flex items-center bg-white/60 p-1 rounded-xl border border-white/60 shadow-md backdrop-blur-md">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenStats}
                        className="p-2.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                        title="Insights"
                    >
                        <BarChart2 size={18} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenCalendar}
                        className="p-2.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                        title="History"
                    >
                        <Calendar size={18} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.9)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={onOpenClock}
                        className="p-2.5 rounded-lg text-slate-600 hover:text-indigo-600 transition-colors"
                        title="Zen Clock"
                    >
                        <Clock size={18} />
                    </motion.button>
                </div>
                
                <div className={cn(
                    "w-3 h-3 rounded-full border-2 border-white shadow-md transition-colors duration-500",
                    loading ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                )} />
            </div>
        </header>
    );
};

// --- Sidebar Widgets ---

export const EnergyRing: React.FC<{ progress: number; duration: number }> = ({ progress, duration }) => {
    const radius = 52;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (progress / 100) * circumference;

    return (
        <div className="glass-panel bg-white/60 backdrop-blur-xl border-white/60 shadow-xl rounded-3xl p-6 flex flex-col items-center relative overflow-hidden group shrink-0">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 opacity-80" />
            <div className="w-full flex justify-between items-center mb-4 z-10">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Daily Energy</span>
                <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md shadow-sm">
                    {formatHours(duration)}h
                </span>
            </div>

            <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 144 144">
                    <circle
                        cx="72" cy="72" r={radius}
                        stroke="currentColor" strokeWidth="10" fill="transparent"
                        className="text-white/50"
                    />
                    <motion.circle
                        cx="72" cy="72" r={radius}
                        stroke="currentColor" strokeWidth="10" fill="transparent"
                        strokeLinecap="round"
                        className="text-indigo-500 drop-shadow-md"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-bold text-slate-800 leading-none drop-shadow-sm"
                    >
                        {Math.round(progress)}%
                    </motion.span>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-1">
                        of 8h Goal
                    </span>
                </div>
            </div>
        </div>
    );
};

export const MemoPad: React.FC = () => {
    const [memo, setMemo] = useState(localStorage.getItem('flowMatrix_memo') || "");
    
    useEffect(() => {
        localStorage.setItem('flowMatrix_memo', memo);
    }, [memo]);

    return (
        <div className="glass-panel bg-white/60 backdrop-blur-xl border-white/60 shadow-xl rounded-3xl p-5 flex flex-col min-h-[200px] transition-all hover:shadow-2xl hover:bg-white/70 group shrink-0">
            <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-amber-100 rounded-lg text-amber-600 shadow-sm border border-amber-200">
                    <Activity size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Spark Notes</span>
            </div>
            <div className="flex-1 relative">
                <textarea
                    value={memo}
                    onChange={(e) => setMemo(e.target.value)}
                    placeholder="Capture your thoughts..."
                    className="w-full h-full bg-white/50 border border-white/70 rounded-xl p-4 text-sm text-slate-800 placeholder-slate-400 outline-none resize-none focus:bg-white/90 focus:border-amber-300 focus:ring-2 focus:ring-amber-100 transition-all custom-scrollbar shadow-inner"
                />
            </div>
        </div>
    );
};

export const RecentWins: React.FC<{ tasks: Task[] }> = ({ tasks }) => {
    return (
        <div className="glass-panel bg-white/60 backdrop-blur-xl border-white/60 shadow-xl rounded-3xl p-5 flex-1 flex flex-col min-h-[160px]">
            <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-emerald-100 rounded-lg text-emerald-600 shadow-sm border border-emerald-200">
                    <Check size={14} />
                </div>
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Recent Wins</span>
            </div>
            
            <div className="flex-1 space-y-2 overflow-y-auto custom-scrollbar pr-1 -mr-2">
                <AnimatePresence>
                    {tasks.length > 0 ? tasks.map(task => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center justify-between text-xs bg-white/70 hover:bg-white/90 transition-colors p-3 rounded-xl border border-white/60 shadow-sm"
                        >
                            <span className="truncate flex-1 pr-2 text-slate-500 line-through decoration-slate-300">
                                {task.title}
                            </span>
                            <span className="font-mono font-bold text-emerald-600 bg-emerald-50/50 border border-emerald-100 px-1.5 py-0.5 rounded shadow-sm">
                                {formatDuration(task.duration_seconds)}
                            </span>
                        </motion.div>
                    )) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2 opacity-60">
                            <Clock size={24} strokeWidth={1.5} />
                            <span className="text-[10px] uppercase font-bold tracking-wide">No recent completions</span>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};