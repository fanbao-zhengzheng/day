export interface Task {
  id: number;
  title: string;
  description?: string;
  tags?: string;
  quadrant: number;
  status: 'todo' | 'in_basket' | 'done';
  created_at: string;
  start_time?: string | null;
  completed_at?: string | null;
  duration_seconds: number;
}

export interface QuadrantConfig {
  id: number;
  name: string;
  icon: string;
  color: string;
  textColor: string;
  bgGradient: string;
  borderColor: string;
}

export const QUADRANTS: QuadrantConfig[] = [
  { 
    id: 1, 
    name: "Urgent & Important", 
    icon: "🔥", 
    color: "bg-rose-500", 
    textColor: "text-rose-600",
    bgGradient: "from-rose-50/80 to-rose-100/50",
    borderColor: "border-rose-200"
  },
  { 
    id: 2, 
    name: "Important, Not Urgent", 
    icon: "🚀", 
    color: "bg-sky-500", 
    textColor: "text-sky-600",
    bgGradient: "from-sky-50/80 to-sky-100/50",
    borderColor: "border-sky-200"
  },
  { 
    id: 3, 
    name: "Urgent, Not Important", 
    icon: "⚡", 
    color: "bg-amber-500", 
    textColor: "text-amber-600",
    bgGradient: "from-amber-50/80 to-amber-100/50",
    borderColor: "border-amber-200"
  },
  { 
    id: 4, 
    name: "Neither", 
    icon: "☕", 
    color: "bg-slate-500", 
    textColor: "text-slate-600",
    bgGradient: "from-slate-50/80 to-slate-100/50",
    borderColor: "border-slate-200"
  },
];
