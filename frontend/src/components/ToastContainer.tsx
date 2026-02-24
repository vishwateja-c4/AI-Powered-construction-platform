import React from 'react';
import { useAppStore } from '../store';
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export default function ToastContainer() {
    const { toasts, removeToast } = useAppStore();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
            {toasts.map((toast) => {
                const Icon =
                    toast.type === 'success' ? CheckCircle :
                        toast.type === 'error' ? AlertCircle :
                            toast.type === 'warning' ? AlertTriangle : Info;

                const colors =
                    toast.type === 'success' ? 'bg-green-500/10 border-green-500/50 text-green-400' :
                        toast.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-400' :
                            toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400' :
                                'bg-blue-500/10 border-blue-500/50 text-blue-400';

                return (
                    <div
                        key={toast.id}
                        className={`min-w-[300px] pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-md flex items-start gap-3 transform transition-all animate-in slide-in-from-bottom-5 fade-in ${colors}`}
                    >
                        <Icon className="w-5 h-5 mt-0.5 shrink-0" />
                        <div className="flex-grow">
                            {toast.title && <h4 className="font-semibold text-sm mb-0.5 text-white">{toast.title}</h4>}
                            <p className="text-sm opacity-90">{toast.message}</p>
                        </div>
                        <button
                            onClick={() => removeToast(toast.id)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
