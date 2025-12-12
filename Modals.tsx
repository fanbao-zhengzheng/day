import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QUADRANTS, Task, QuadrantConfig } from '../types';
import { cn, formatHours, formatDuration } from '../utils';
import { X, ChevronLeft, ChevronRight } from './Icons';
import dayjs from 'dayjs';

const Backdrop: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md", className)}
        onClick={onClick}
    >
        {children}
    </motion.div>
);

const ModalContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
        className={cn("bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl w-full relative z-10 overflow-hidden border border-white/50", className)}
    >
        {children}
    </motion.div>
);

// --- Add Task Modal ---
export const AddTaskModal: React.FC<{
    isOpen: boolean;
    initialQuadrant: number;
    onClose: () => void;
    onAdd: (task: Partial<Task>) => void;
}> = ({ isOpen, initialQuadrant, onClose, onAdd }) => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [tags, setTags] = useState("");
    const [quadrant, setQuadrant] = useState(initialQuadrant);

    const handleSubmit = () => {
        if (!title.trim()) return;
        onAdd({ title, description: desc, tags, quadrant });
        setTitle(""); setDesc(""); setTags("");
        onClose();
    };

    if (!isOpen) return null;

    const activeQ = QUADRANTS.find(q => q.id === quadrant) || QUADRANTS[0];

    return (
        <AnimatePresence>
            <Backdrop onClick={onClose}>
                <ModalContent className="max-w-lg">
                    <div className={cn("h-2 w-full", activeQ.color)} />
                    <div className="p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6">
                            New Mission for <span className={activeQ.textColor}>{activeQ.name}</span>
                        </h3>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Title</label>
                                <input 
                                    autoFocus
                                    value={title} onChange={e => setTitle(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-lg font-medium focus:ring-2 focus:ring-slate-800 outline-none transition-all placeholder-slate-300"
                                    placeholder="What needs to be done?"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tags</label>
                                    <input 
                                        value={tags} onChange={e => setTags(e.target.value)}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-slate-800 outline-none"
                                        placeholder="Work, Urgent..."
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Change Quadrant</label>
                                    <div className="flex gap-1 mt-1">
                                        {QUADRANTS.map(q => (
                                            <button 
                                                key={q.id}
                                                onClick={() => setQuadrant(q.id)}
                                                className={cn(
                                                    "h-8 flex-1 rounded-lg border transition-all text-xs font-bold",
                                                    quadrant === q.id ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"
                                                )}
                                            >
                                                Q{q.id}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Notes</label>
                                <textarea 
                                    value={desc} onChange={e => setDesc(e.target.value)}
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-800 outline-none resize-none"
                                    placeholder="Details..."
                                />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={onClose} className="px-5 py-2.5 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-bold transition-colors">
                                Cancel
                            </button>
                            <button onClick={handleSubmit} className="px-8 py-2.5 bg-slate-800 text-white rounded-xl hover:bg-slate-700 shadow-lg shadow-slate-300 text-sm font-bold transition-all transform active:scale-95">
                                Create Task
                            </button>
                        </div>
                    </div>
                </ModalContent>
            </Backdrop>
        </AnimatePresence>
    );
};

// --- Calendar Modal ---
export const CalendarModal: React.FC<{
    isOpen: boolean;
    tasks: Task[];
    onClose: () => void;
}> = ({ isOpen, tasks, onClose }) => {
    const [currentDate, setCurrentDate] = useState(dayjs());
    const [selectedDate, setSelectedDate] = useState(dayjs());

    if (!isOpen) return null;

    const startOfMonth = currentDate.startOf('month');
    const startOfGrid = startOfMonth.startOf('week');
    const days = Array.from({ length: 42 }, (_, i) => {
        const d = startOfGrid.add(i, 'day');
        return {
            date: d,
            isCurrentMonth: d.month() === currentDate.month(),
            isToday: d.isSame(dayjs(), 'day'),
            isSelected: d.isSame(selectedDate, 'day'),
            hasTask: tasks.some(t => t.status === 'done' && dayjs(t.completed_at).isSame(d, 'day'))
        };
    });

    const selectedTasks = tasks.filter(t => t.status === 'done' && dayjs(t.completed_at).isSame(selectedDate, 'day'));

    return (
        <AnimatePresence>
            <Backdrop onClick={onClose}>
                <ModalContent className="max-w-lg h-[80vh] flex flex-col">
                    <div className="p-5 border-b border-slate-100 bg-slate-50/80 backdrop-blur flex justify-between items-center sticky top-0 z-20">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">History</h2>
                            <p className="text-xs text-slate-500 font-medium">Your timeline of achievements</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                                <button onClick={() => setCurrentDate(d => d.subtract(1, 'month'))} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><ChevronLeft size={16}/></button>
                                <span className="text-sm font-bold text-slate-700 min-w-[6rem] text-center select-none">{currentDate.format('MMM YYYY')}</span>
                                <button onClick={() => setCurrentDate(d => d.add(1, 'month'))} className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><ChevronRight size={16}/></button>
                            </div>
                            <button onClick={onClose} className="p-2 text-slate-400 hover:bg-slate-200 rounded-full"><X size={20}/></button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="p-6 bg-white">
                            <div className="grid grid-cols-7 gap-2 mb-2 text-center">
                                {['S','M','T','W','T','F','S'].map(d => <div key={d} className="text-xs font-bold text-slate-300">{d}</div>)}
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {days.map((day, i) => (
                                    <button
                                        key={i}
                                        onClick={() => setSelectedDate(day.date)}
                                        className={cn(
                                            "aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-medium transition-all relative",
                                            !day.isCurrentMonth && "text-slate-300",
                                            day.isSelected ? "bg-slate-800 text-white shadow-lg" : "hover:bg-slate-50 text-slate-600",
                                            day.isToday && !day.isSelected && "border-2 border-indigo-500 text-indigo-600 font-bold"
                                        )}
                                    >
                                        {day.date.date()}
                                        {day.hasTask && (
                                            <div className={cn("w-1 h-1 rounded-full mt-1", day.isSelected ? "bg-emerald-400" : "bg-emerald-500")} />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-slate-50 border-t border-slate-100 p-6 min-h-[300px]">
                            <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
                                {selectedDate.format('MMMM D')} Record
                            </h3>
                            <div className="space-y-3">
                                {selectedTasks.length > 0 ? selectedTasks.map(task => (
                                    <div key={task.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="text-sm font-medium text-slate-700 line-through decoration-slate-300">{task.title}</div>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-bold font-mono">
                                                    {formatDuration(task.duration_seconds)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-10 text-slate-400 text-sm italic">No activity recorded for this day.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModalContent>
            </Backdrop>
        </AnimatePresence>
    );
};

// --- Stats Modal ---
export const StatsModal: React.FC<{ isOpen: boolean; onClose: () => void; todayStats: any; weekStats: any }> = ({ 
    isOpen, onClose, todayStats, weekStats 
}) => {
    if(!isOpen) return null;
    return (
        <AnimatePresence>
            <Backdrop onClick={onClose}>
                <ModalContent className="max-w-2xl">
                    <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-slate-800">Performance</h2>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20}/></button>
                    </div>
                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="rounded-3xl p-6 text-white shadow-xl shadow-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-600 relative overflow-hidden">
                            <h3 className="text-indigo-100 font-bold uppercase tracking-wider text-xs mb-4">Today's Focus</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-mono font-bold">{formatHours(todayStats.duration)}</span>
                                <span className="text-sm font-medium opacity-80">Hours</span>
                            </div>
                            <div className="mt-2 text-indigo-200 text-xs">{todayStats.count} tasks completed</div>
                        </div>
                        <div className="rounded-3xl p-6 text-slate-800 shadow-xl shadow-sky-100 bg-gradient-to-br from-emerald-300 to-sky-300 relative overflow-hidden">
                            <h3 className="text-slate-700 font-bold uppercase tracking-wider text-xs mb-4">This Week</h3>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-mono font-bold text-slate-900">{formatHours(weekStats.duration)}</span>
                                <span className="text-sm font-medium text-slate-700">Hours</span>
                            </div>
                            <div className="mt-2 text-slate-600 text-xs">{weekStats.count} tasks completed</div>
                        </div>
                    </div>
                </ModalContent>
            </Backdrop>
        </AnimatePresence>
    );
};

// --- Zen Clock Modal ---
export const ZenClockModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [time, setTime] = useState(dayjs());

    useEffect(() => {
        if (!isOpen) return;
        const timer = setInterval(() => setTime(dayjs()), 1000);
        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden"
            >
                {/* Aurora Background */}
                <motion.div 
                    animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1/2 -left-1/2 w-[200vw] h-[200vw] bg-gradient-to-br from-indigo-900 via-purple-900 to-black opacity-60 rounded-full blur-[120px] mix-blend-screen pointer-events-none"
                />
                <motion.div 
                    animate={{ x: [-50, 50, -50], y: [-20, 20, -20] }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-900/40 rounded-full blur-[150px] mix-blend-screen pointer-events-none"
                />

                <div className="relative z-10 flex flex-col items-center">
                    {/* Glass Clock Panel */}
                    <div className="relative bg-white/5 backdrop-blur-3xl rounded-[3rem] p-12 md:p-20 shadow-2xl border border-white/10 flex flex-col items-center justify-center min-w-[300px] md:min-w-[600px]">
                        
                        {/* Time */}
                        <div className="flex items-baseline gap-2 md:gap-4 font-bold text-white leading-none tracking-tighter drop-shadow-lg">
                            <span className="text-[6rem] md:text-[14rem] font-mono variant-numeric-tabular">
                                {time.format('HH')}
                            </span>
                            <motion.span 
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="text-[6rem] md:text-[14rem] relative -top-4 md:-top-8 text-indigo-400"
                            >
                                :
                            </motion.span>
                            <span className="text-[6rem] md:text-[14rem] font-mono variant-numeric-tabular">
                                {time.format('mm')}
                            </span>
                        </div>

                        {/* Date & Seconds */}
                        <div className="flex items-center gap-6 mt-4 md:mt-0">
                            <div className="bg-white/10 backdrop-blur-md px-6 py-2 rounded-full border border-white/10 text-indigo-200 uppercase tracking-[0.2em] text-sm md:text-xl font-bold shadow-lg">
                                {time.format('dddd, MMM DD')}
                            </div>
                            <div className="bg-indigo-500 text-white px-4 py-2 rounded-full font-mono text-xl md:text-2xl font-bold shadow-lg shadow-indigo-500/30 min-w-[3.5rem] text-center">
                                {time.format('ss')}
                            </div>
                        </div>
                    </div>
                </div>

                <motion.button
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onClose}
                    className="absolute bottom-12 p-4 rounded-full bg-white/10 border border-white/20 text-white/70 hover:bg-white/20 hover:text-white backdrop-blur-md transition-all shadow-lg"
                >
                    <X size={24} />
                </motion.button>
            </motion.div>
        </AnimatePresence>
    );
};