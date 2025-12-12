import React, { useState, useEffect, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import { LayoutGroup, motion } from 'framer-motion';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';

import { Task, QUADRANTS } from './types';
import { Header, EnergyRing, MemoPad, RecentWins } from './components/DashboardComponents';
import { FocusStage } from './components/FocusStage';
import { Quadrant } from './components/TaskComponents';
import { AddTaskModal, CalendarModal, StatsModal, ZenClockModal } from './components/Modals';

// --- CONFIG ---
dayjs.extend(isBetween);
// NOTE: Ideally these should be in env vars, but using provided keys for functionality
const SUPABASE_URL = "https://xmbdhsiopgklunsplimh.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_Z0q1-9gRfvRsl_U5W9oPmQ_aWePMBiF";

const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [addModalQuadrant, setAddModalQuadrant] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showClock, setShowClock] = useState(false);

  // --- DATA FETCHING ---
  const fetchTasks = async () => {
    setLoading(true);
    const { data } = await client
      .from("tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setTasks(data as Task[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // --- DERIVED STATE ---
  const activeTask = useMemo(() => tasks.find(t => t.status === 'in_basket'), [tasks]);
  
  const completedTasks = useMemo(() => tasks.filter(t => t.status === 'done'), [tasks]);
  
  const todayStats = useMemo(() => {
    const today = completedTasks.filter(t => dayjs(t.completed_at).isSame(dayjs(), 'day'));
    const duration = today.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
    return { count: today.length, duration };
  }, [completedTasks]);

  const weekStats = useMemo(() => {
    const startOfWeek = dayjs().startOf('week');
    const week = completedTasks.filter(t => dayjs(t.completed_at).isAfter(startOfWeek));
    const duration = week.reduce((acc, t) => acc + (t.duration_seconds || 0), 0);
    return { count: week.length, duration };
  }, [completedTasks]);

  const todayProgress = Math.min((todayStats.duration / 28800) * 100, 100);

  const recentWins = useMemo(() => {
    return [...completedTasks]
      .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
      .slice(0, 5);
  }, [completedTasks]);

  // --- ACTIONS ---
  const handleAddTask = async (partialTask: Partial<Task>) => {
    const temp: Task = {
      ...partialTask,
      id: Date.now(), // Optimistic ID
      created_at: new Date().toISOString(),
      status: 'todo',
      duration_seconds: 0
    } as Task;

    setTasks(prev => [temp, ...prev]);
    
    const { data } = await client.from("tasks").insert([{
        title: temp.title,
        description: temp.description,
        tags: temp.tags,
        quadrant: temp.quadrant,
        status: 'todo',
        duration_seconds: 0
    }]).select();

    if (data) {
        setTasks(prev => prev.map(t => t.id === temp.id ? (data[0] as Task) : t));
    }
  };

  const moveToFocus = async (task: Task) => {
    if (activeTask) {
        alert("Please complete or pause your current focus task first!");
        return;
    }
    
    // Optimistic Update
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'in_basket', start_time: new Date().toISOString() } : t));

    await client.from("tasks").update({
        status: "in_basket",
        start_time: new Date().toISOString()
    }).eq("id", task.id);
  };

  const pauseTask = async (task: Task) => {
    if (!task.start_time) return;
    const sessionSeconds = dayjs().diff(dayjs(task.start_time), "second");
    const newTotal = (task.duration_seconds || 0) + sessionSeconds;

    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'todo', duration_seconds: newTotal, start_time: null } : t));

    await client.from("tasks").update({
        status: "todo",
        duration_seconds: newTotal,
        start_time: null
    }).eq("id", task.id);
  };

  const completeTask = async (task: Task) => {
    const sessionSeconds = task.start_time ? dayjs().diff(dayjs(task.start_time), "second") : 0;
    const newTotal = (task.duration_seconds || 0) + sessionSeconds;

    setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: 'done', 
        duration_seconds: newTotal, 
        completed_at: new Date().toISOString(),
        start_time: null 
    } : t));

    await client.from("tasks").update({
        status: "done",
        duration_seconds: newTotal,
        completed_at: new Date().toISOString(),
        start_time: null
    }).eq("id", task.id);
  };

  const deleteTask = async (id: number) => {
    if(!confirm("Are you sure?")) return;
    setTasks(prev => prev.filter(t => t.id !== id));
    await client.from("tasks").delete().eq("id", id);
  };

  // --- RENDER ---
  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-br from-[#c4b5fd] via-[#bfdbfe] to-[#c4b5fd] relative overflow-hidden">
        {/* Abstract Background Orbs - Darker for better contrast with glass cards */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] opacity-40" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-pink-300 rounded-full mix-blend-multiply filter blur-[96px] opacity-40" />

        {/* Glass Overlay Background */}
        <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] z-0 pointer-events-none" />
        
        {/* Main Content Container */}
        <div className="relative z-10 h-full flex flex-col max-w-[1800px] mx-auto w-full shadow-2xl shadow-indigo-900/5 bg-white/5 border-x border-white/30">
            
            <Header 
                onOpenStats={() => setShowStats(true)} 
                onOpenCalendar={() => setShowCalendar(true)}
                onOpenClock={() => setShowClock(true)}
                loading={loading}
            />

            <main className="flex-1 flex flex-col p-4 sm:p-6 gap-6 overflow-hidden">
                <LayoutGroup>
                    {/* TOP: Focus Stage */}
                    <FocusStage 
                        activeTask={activeTask}
                        onComplete={completeTask}
                        onPause={pauseTask}
                    />

                    {/* BOTTOM: Split View */}
                    {/* KEY CHANGE: Added motion.div and layout here to fix the stutter */}
                    <motion.div 
                        layout
                        transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                        className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0"
                    >
                        
                        {/* LEFT: Matrix Grid */}
                        <section className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto pb-4 custom-scrollbar pr-2">
                            {QUADRANTS.map(q => (
                                <Quadrant 
                                    key={q.id}
                                    quadrantId={q.id}
                                    tasks={tasks.filter(t => t.quadrant === q.id && t.status === 'todo')}
                                    onAddTask={(id) => { setAddModalQuadrant(id); setShowAddModal(true); }}
                                    onTaskClick={moveToFocus}
                                    onTaskDelete={deleteTask}
                                />
                            ))}
                        </section>

                        {/* RIGHT: Sidebar - Added h-full to align bottom */}
                        <aside className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto custom-scrollbar pb-4 shrink-0 pr-1 h-full">
                            <EnergyRing progress={todayProgress} duration={todayStats.duration} />
                            <MemoPad />
                            <RecentWins tasks={recentWins} />
                        </aside>
                    </motion.div>
                </LayoutGroup>
            </main>
        </div>

        {/* MODALS */}
        <AddTaskModal 
            isOpen={showAddModal} 
            initialQuadrant={addModalQuadrant}
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddTask}
        />
        <CalendarModal 
            isOpen={showCalendar} 
            tasks={tasks}
            onClose={() => setShowCalendar(false)}
        />
        <StatsModal 
            isOpen={showStats} 
            todayStats={todayStats} 
            weekStats={weekStats}
            onClose={() => setShowStats(false)}
        />
        <ZenClockModal 
            isOpen={showClock}
            onClose={() => setShowClock(false)}
        />
    </div>
  );
}