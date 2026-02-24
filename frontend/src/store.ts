import { create } from "zustand";

interface Phase {
    name: string;
    order: number;
    duration_weeks: number;
    description: string;
    tasks: Task[];
}

interface Task {
    title: string;
    description: string;
    duration_days: number;
    dependencies: string[];
    resources: string[];
    is_critical_path: boolean;
}

interface Plan {
    project_name: string;
    project_type: string;
    summary: string;
    estimated_duration_months: number;
    phases: Phase[];
    milestones: any[];
    resource_summary: any;
}

interface CostBreakdown {
    total_estimated_cost: number;
    range_low: number;
    range_high: number;
    currency: string;
    breakdown: {
        materials: { total: number; items: any[] };
        labor: { total: number; items: any[] };
        equipment: { total: number; items: any[] };
        permits: { total: number; items: any[] };
        overhead: { total: number; percentage: number };
    };
    cost_per_sqft: number;
    contingency_percentage: number;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: string;
    type: ToastType;
    message: string;
    title?: string;
}

interface AppState {
    // Loading states
    isGenerating: boolean;
    setIsGenerating: (v: boolean) => void;
    isEstimating: boolean;
    setIsEstimating: (v: boolean) => void;

    // Active view
    activeView: 'generator' | 'costs' | 'scheduler' | 'replanner' | 'sitemap';
    setActiveView: (view: AppState['activeView']) => void;

    // Site Map
    siteLocation: { lat: number; lng: number } | null;
    setSiteLocation: (loc: { lat: number; lng: number } | null) => void;
    siteAddress: string;
    setSiteAddress: (addr: string) => void;

    // Chat
    chatOpen: boolean;
    setChatOpen: (open: boolean) => void;
    chatHistory: ChatMessage[];
    addChatMessage: (msg: ChatMessage) => void;

    // Plan & Costs
    plan: Plan | null;
    setPlan: (plan: Plan) => void;
    costs: CostBreakdown | null;
    setCosts: (costs: CostBreakdown) => void;

    // Toasts
    toasts: Toast[];
    addToast: (toast: Omit<Toast, 'id'>) => void;
    removeToast: (id: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
    isGenerating: false,
    setIsGenerating: (v) => set({ isGenerating: v }),
    isEstimating: false,
    setIsEstimating: (v) => set({ isEstimating: v }),
    activeView: 'generator',
    setActiveView: (view) => set({ activeView: view }),
    chatOpen: false,
    setChatOpen: (open) => set({ chatOpen: open }),
    plan: null,
    setPlan: (plan) => set({ plan }),
    costs: null,
    setCosts: (costs) => set({ costs }),
    siteLocation: null,
    setSiteLocation: (loc) => set({ siteLocation: loc }),
    siteAddress: '',
    setSiteAddress: (addr) => set({ siteAddress: addr }),
    chatHistory: [
        {
            role: 'assistant',
            content: "Hello! I'm BuildWise AI. I can help you plan, estimate, and schedule your construction project. What are we building today?",
        }
    ],
    addChatMessage: (msg) => set((state) => ({ chatHistory: [...state.chatHistory, msg] })),
    toasts: [],
    addToast: (toast) => {
        const id = Math.random().toString(36).substring(2, 9);
        set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }));
        setTimeout(() => {
            set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
        }, 5000); // Auto remove after 5s
    },
    removeToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
