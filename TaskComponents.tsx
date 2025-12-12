import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Task, QUADRANTS } from '../types';
import { formatDuration, cn } from '../utils';
import { Trash2, Clock, Plus } from './Icons';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onDelete, isCompact }) => {
  const qConfig = QUADRANTS.find(q => q.id === task.quadrant) || QUADRANTS[0];

  return (
    <motion.div
      layout // Critical: smooths out sibling reordering when a task is moved
      layoutId={`task-${task.id}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "group relative bg-white/80 backdrop-blur-md rounded-xl p-3 shadow-md border border-white/60 cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:border-indigo-300 hover:bg-white/95",
        isCompact ? "py-2" : ""
      )}
    >
      {/* Visual Indicator Bar */}
      <div className={cn("absolute left-0 top-0 bottom-0 w-1", qConfig.color)} />

      <div className="flex justify-between items-start pl-2">
        <div className="flex-1 min-w-0">
          {/* Tags */}
          {task.tags && (
            <div className="flex flex-wrap gap-1 mb-1">
              {task.tags.split(',').map((tag, i) => (
                <span key={i} className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 border border-slate-200/50 shadow-sm">
                  {tag.trim()}
                </span>
              ))}
            </div>
          )}
          
          <h4 className={cn("font-medium text-slate-800 leading-snug truncate drop-shadow-sm", isCompact ? "text-xs" : "text-sm")}>
            {task.title}
          </h4>
          
          {!isCompact && (
            <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 border-t border-slate-200/50 pt-2">
              {task.duration_seconds > 0 && (
                <span className="flex items-center gap-1 font-mono text-indigo-600 font-bold bg-indigo-50 px-1.5 rounded border border-indigo-100">
                   <Clock size={10} />
                   {formatDuration(task.duration_seconds)}
                </span>
              )}
              {task.description && (
                <span className="truncate max-w-[100px] italic opacity-70">
                  {task.description}
                </span>
              )}
            </div>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: "#fee2e2" }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(e);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg text-slate-400 hover:text-red-500"
        >
          <Trash2 size={14} />
        </motion.button>
      </div>
    </motion.div>
  );
};

interface QuadrantProps {
  quadrantId: number;
  tasks: Task[];
  onAddTask: (qId: number) => void;
  onTaskClick: (task: Task) => void;
  onTaskDelete: (id: number) => void;
}

export const Quadrant: React.FC<QuadrantProps> = ({ 
  quadrantId, tasks, onAddTask, onTaskClick, onTaskDelete 
}) => {
  const config = QUADRANTS.find(q => q.id === quadrantId)!;

  return (
    <div className={cn(
      "flex flex-col h-full rounded-3xl border shadow-xl backdrop-blur-xl overflow-hidden transition-all hover:shadow-2xl duration-500 ring-1 ring-white/50",
      "bg-white/60", // Increased opacity for better contrast
      config.bgGradient,
      config.borderColor
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white/60 border-b border-white/40 backdrop-blur-md z-10 sticky top-0 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl filter drop-shadow-sm">{config.icon}</span>
          <span className={cn("text-xs font-bold uppercase tracking-wider shadow-sm", config.textColor)}>
            {config.name}
          </span>
          <span className="bg-white/70 px-1.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600 shadow-inner">
            {tasks.length}
          </span>
        </div>
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onAddTask(quadrantId)}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-white/80 text-slate-500 hover:text-indigo-600 shadow-sm border border-white/60"
        >
          <Plus size={16} />
        </motion.button>
      </div>

      {/* List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2 custom-scrollbar">
        <AnimatePresence mode="popLayout" initial={false}>
          {tasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onClick={() => onTaskClick(task)}
              onDelete={() => onTaskDelete(task.id)}
            />
          ))}
        </AnimatePresence>
        
        {tasks.length === 0 && (
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 0.5 }}
                className="h-full flex flex-col items-center justify-center text-slate-500 italic text-xs min-h-[100px]"
            >
                No tasks
            </motion.div>
        )}
      </div>
    </div>
  );
};