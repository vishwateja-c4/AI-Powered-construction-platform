import React from "react";
import { CheckCircle2, Clock, AlertTriangle, ChevronDown, ChevronRight, Users, Wrench } from "lucide-react";
import { useAppStore } from "../store";

export default function PlanDisplay() {
    const { plan } = useAppStore();
    const [expandedPhases, setExpandedPhases] = React.useState<Set<number>>(new Set([0]));

    if (!plan) return null;

    const togglePhase = (index: number) => {
        setExpandedPhases((prev) => {
            const next = new Set(prev);
            if (next.has(index)) next.delete(index);
            else next.add(index);
            return next;
        });
    };

    const totalTasks = plan.phases.reduce((sum, p) => sum + p.tasks.length, 0);

    return (
        <div className="max-w-5xl mx-auto mt-10">
            {/* Plan Header */}
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-6 mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">{plan.project_name}</h2>
                <p className="text-gray-300 mb-4">{plan.summary}</p>
                <div className="flex flex-wrap gap-4 text-sm">
                    <span className="bg-white/10 rounded-full px-3 py-1">
                        📋 {plan.phases.length} Phases
                    </span>
                    <span className="bg-white/10 rounded-full px-3 py-1">
                        ✅ {totalTasks} Tasks
                    </span>
                    <span className="bg-white/10 rounded-full px-3 py-1">
                        ⏱ {plan.estimated_duration_months} Months
                    </span>
                    <span className="bg-white/10 rounded-full px-3 py-1 capitalize">
                        🏗 {plan.project_type}
                    </span>
                </div>
            </div>

            {/* Phases */}
            <div className="space-y-4">
                {plan.phases.map((phase, i) => {
                    const isExpanded = expandedPhases.has(i);
                    const criticalCount = phase.tasks.filter((t) => t.is_critical_path).length;

                    return (
                        <div
                            key={i}
                            className="rounded-xl border border-white/10 bg-white/5 overflow-hidden"
                        >
                            {/* Phase Header */}
                            <button
                                onClick={() => togglePhase(i)}
                                className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors text-left"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">
                                        {phase.order}
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">{phase.name}</h3>
                                        <p className="text-sm text-gray-400">
                                            {phase.duration_weeks} weeks · {phase.tasks.length} tasks
                                            {criticalCount > 0 && (
                                                <span className="text-yellow-400 ml-2">
                                                    · {criticalCount} critical
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-5 h-5 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-5 h-5 text-gray-400" />
                                )}
                            </button>

                            {/* Phase Tasks */}
                            {isExpanded && (
                                <div className="border-t border-white/10 divide-y divide-white/5">
                                    <div className="px-5 py-3 text-sm text-gray-400">
                                        {phase.description}
                                    </div>
                                    {phase.tasks.map((task, j) => (
                                        <div key={j} className="px-5 py-4 flex items-start gap-4">
                                            <div className="mt-1">
                                                {task.is_critical_path ? (
                                                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                                                ) : (
                                                    <Clock className="w-4 h-4 text-gray-500" />
                                                )}
                                            </div>
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-medium">{task.title}</span>
                                                    {task.is_critical_path && (
                                                        <span className="text-[10px] bg-yellow-400/20 text-yellow-400 px-1.5 py-0.5 rounded uppercase font-bold">
                                                            Critical
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">
                                                    {task.description}
                                                </p>
                                                <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                                                    <span>⏱ {task.duration_days}d</span>
                                                    {task.dependencies.length > 0 && (
                                                        <span>🔗 {task.dependencies.join(", ")}</span>
                                                    )}
                                                    {task.resources.length > 0 && (
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-3 h-3" />
                                                            {task.resources.join(", ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Milestones */}
            {plan.milestones && plan.milestones.length > 0 && (
                <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-primary" /> Milestones
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {plan.milestones.map((m: any, i: number) => (
                            <div
                                key={i}
                                className="flex items-start gap-3 bg-white/5 rounded-lg p-3"
                            >
                                <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                                <div>
                                    <span className="font-medium text-sm">{m.name}</span>
                                    <p className="text-xs text-gray-400">{m.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Resource Summary */}
            {plan.resource_summary && (
                <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-primary" /> Resource Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                            <h4 className="font-medium text-gray-300 mb-2">Labor</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {plan.resource_summary.labor.map((l: string, i: number) => (
                                    <span key={i} className="bg-blue-500/10 text-blue-300 rounded-full px-2 py-0.5 text-xs">{l}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-300 mb-2">Equipment</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {plan.resource_summary.equipment.map((e: string, i: number) => (
                                    <span key={i} className="bg-orange-500/10 text-orange-300 rounded-full px-2 py-0.5 text-xs">{e}</span>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-300 mb-2">Key Materials</h4>
                            <div className="flex flex-wrap gap-1.5">
                                {plan.resource_summary.key_materials.map((m: string, i: number) => (
                                    <span key={i} className="bg-green-500/10 text-green-300 rounded-full px-2 py-0.5 text-xs">{m}</span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
